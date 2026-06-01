import { Medicine } from '../models/medicineModel.js';
import { AuditLog } from '../models/auditLogModel.js';
import { InventoryHistory } from '../models/inventoryHistoryModel.js';
import { ForecastParameters } from '../models/forecastModel.js';
import { PurchaseOrder, Supplier } from '../models/supplierModels.js';
import { computeForecast } from '../ml/demandForecast.js';
// Hardcoded params (ForecastParameters schema deleted to remove singleton pattern)
const DEFAULT_PARAMS = {
    forecastHorizon: 4,
    leadTimeDays: 7,
    safetyStockPercent: 20,
    seasonalMultipliers: { jan: 1.0, feb: 1.0, mar: 1.1, apr: 1.2, may: 1.2, jun: 1.1, jul: 1.3, aug: 1.3, sep: 1.2, oct: 1.4, nov: 1.4, dec: 1.2 }
};

export const runForecast = async (req, res) => {
    try {
        const medicines = await Medicine.find();

        let dbParams = await ForecastParameters.findOne().lean();
        if (!dbParams) {
            dbParams = await ForecastParameters.create(DEFAULT_PARAMS);
            dbParams = dbParams.toObject();
        }

        // Delete existing AI_Drafts so we don't pile them up
        await PurchaseOrder.deleteMany({ order_status: 'AI_Draft' });

        const drafts = [];
        for (const med of medicines) {
            const forecast = await computeForecast(med, dbParams);

            if (forecast.optimalReorderQty > 0 || forecast.priority === 'critical') {
                // Determine supplier
                let supplier = await Supplier.findOne({ medicine_categories: med.category, is_active: true });
                if (!supplier) supplier = await Supplier.findOne(); // fallback

                if (!supplier) continue;

                drafts.push({
                    order_number: `PO-AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    medicine_id: med._id,
                    medicine_name: med.name,
                    supplier_id: supplier._id,
                    requested_quantity: forecast.optimalReorderQty,
                    unit_price: med.purchasePrice,
                    total_amount: forecast.optimalReorderQty * med.purchasePrice,
                    expected_delivery_date: new Date(Date.now() + dbParams.leadTimeDays * 24 * 60 * 60 * 1000),
                    order_status: 'AI_Draft',
                    created_by: req.user.id,
                    ai_forecast_reference: {
                        demand_predicted: forecast.predictedDemand,
                        forecast_date: new Date(),
                        priority: forecast.priority
                    }
                });
            }
        }

        const created = await PurchaseOrder.insertMany(drafts);

        await AuditLog.create({
            userId: req.user.id,
            username: req.user.username,
            action: 'FORECAST_RUN',
            module: 'Inventory',
            details: { count: created.length },
            ipAddress: req.ip,
            endpoint: '/api/forecast/run'
        });

        res.status(200).json({ success: true, message: `${created.length} AI Draft POs generated`, count: created.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error running forecast', error: error.message });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        // AI Recommendations are just AI_Draft purchase orders now natively
        const recommendations = await PurchaseOrder.find({ order_status: 'AI_Draft' })
            .populate('supplier_id').populate('medicine_id');

        // Mold into Recommendation UI component array shape natively:
        const mapped = recommendations.map(r => ({
            _id: r._id,
            medicineId: r.medicine_id,
            medicineName: r.medicine_name,
            category: r.medicine_id?.category || 'Unknown',
            currentStock: r.medicine_id?.quantity || 0,
            predictedDemand: r.ai_forecast_reference?.demand_predicted || 0,
            optimalReorderQty: r.requested_quantity,
            restockingDate: r.expected_delivery_date,
            priority: r.ai_forecast_reference?.priority || 'medium',
            status: 'pending'
        }));

        res.status(200).json({ success: true, count: mapped.length, recommendations: mapped });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching', error: error.message });
    }
};

export const createRecommendation = async (req, res) => {
    // Deprecated explicitly natively
    res.status(201).json({ success: true, recommendation: {} });
};

export const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedQty, priority } = req.body;

        const draft = await PurchaseOrder.findById(id);
        if (!draft) return res.status(404).json({ success: false, message: 'Not found' });

        if (status === 'approved') {
            draft.order_status = 'Pending'; // Promote!
            draft.requested_quantity = approvedQty || draft.requested_quantity;
            draft.approved_by = req.user.id;
        } else if (status === 'rejected') {
            draft.order_status = 'Cancelled';
        }

        await draft.save();

        res.status(200).json({ success: true, message: 'Recommendation updated via Draft', recommendation: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating', error: error.message });
    }
};

export const deleteRecommendation = async (req, res) => {
    try {
        await PurchaseOrder.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting' });
    }
};

// Return DB config, fallback to default if missing
export const getDemandParameters = async (req, res) => {
    try {
        let params = await ForecastParameters.findOne().lean();
        if (!params) {
            params = await ForecastParameters.create(DEFAULT_PARAMS);
            params = params.toObject();
        }
        res.status(200).json({ success: true, parameters: params });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching', error: error.message });
    }
};

export const saveDemandParameters = async (req, res) => {
    try {
        const updates = req.body;
        const params = await ForecastParameters.findOneAndUpdate(
            {},
            updates,
            { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
        );
        res.status(200).json({ success: true, parameters: params });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving', error: error.message });
    }
};

export const getTrendData = async (req, res) => {
    try {
        const now = new Date();
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        const actuals = await InventoryHistory.aggregate([
            { $match: { action: 'sale', createdAt: { $gte: fourteenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, actual: { $sum: { $abs: '$quantityChanged' } } } }
        ]);

        const predictions = await PurchaseOrder.aggregate([
            { $match: { 'ai_forecast_reference.forecast_date': { $gte: fourteenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$ai_forecast_reference.forecast_date' } }, predicted: { $sum: '$ai_forecast_reference.demand_predicted' } } }
        ]);

        const trend = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now); d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const act = actuals.find(a => a._id === key);
            const pre = predictions.find(p => p._id === key);

            trend.push({ date: key, actual: act ? act.actual : 0, predicted: pre ? Math.round(pre.predicted / 7) : 0 });
        }

        res.status(200).json({ success: true, trend });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error trending', error: error.message });
    }
};

export const triggerRetraining = async (req, res) => {
    return runForecast(req, res);
};

import { Medicine, ForecastParameters, ForecastRecommendation, AuditLog, InventoryHistory } from '../models/index.js';
import { computeForecast } from '../ml/demandForecast.js';
import log from '../utils/logger.js';

/**
 * Run forecast for all medicines
 */
export const runForecast = async (req, res) => {
    try {
        const params = await ForecastParameters.findOne().sort({ createdAt: -1 });
        if (!params) {
            return res.status(400).json({ success: false, message: 'Forecast parameters not set' });
        }

        // 2. Get all medicines
        const medicines = await Medicine.find().populate('category');

        // 3. Clear existing pending recommendations for a fresh run
        await ForecastRecommendation.deleteMany({ status: 'pending' });

        // 4. Run forecast for each medicine
        const recommendations = [];
        for (const med of medicines) {
            const forecast = await computeForecast(med, params);

            // Only create recommendation if reorder qty > 0 OR it's a critical medicine
            if (forecast.optimalReorderQty > 0 || forecast.priority === 'critical') {
                recommendations.push(forecast);
            }
        }

        // 5. Bulk insert recommendations
        const created = await ForecastRecommendation.insertMany(recommendations);

        // 6. Log audit entry
        await AuditLog.create({
            userId: req.user.id,
            username: req.user.username,
            action: 'FORECAST_RUN',
            module: 'Inventory',
            details: { count: created.length },
            ipAddress: req.ip,
            endpoint: '/api/forecast/run'
        });

        log('INFO', 'AI Forecast run complete', { count: created.length });

        res.status(200).json({
            success: true,
            message: `${created.length} recommendations generated`,
            count: created.length
        });
    } catch (error) {
        log('ERROR', 'Run forecast error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error running forecast',
            error: error.message
        });
    }
};

/**
 * Get all recommendations with filtering
 */
export const getRecommendations = async (req, res) => {
    try {
        const { search, priority, status, category } = req.query;
        const filter = {};

        if (search) {
            filter.medicineName = { $regex: search, $options: 'i' };
        }
        if (priority) filter.priority = priority;
        if (status) filter.status = status;
        if (category) filter.category = category;

        const recommendations = await ForecastRecommendation.find(filter)
            .sort({ priority: 1, restockingDate: 1 });

        res.status(200).json({
            success: true,
            count: recommendations.length,
            recommendations
        });
    } catch (error) {
        log('ERROR', 'Get recommendations error', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error fetching recommendations',
            error: error.message
        });
    }
};

/**
 * Create a manual recommendation
 */
export const createRecommendation = async (req, res) => {
    try {
        const { medicineId, medicineName, optimalReorderQty, priority, restockingDate } = req.body;

        const recommendation = await ForecastRecommendation.create({
            medicineId,
            medicineName,
            optimalReorderQty,
            priority: priority || 'medium',
            restockingDate: restockingDate || new Date(),
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            recommendation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating manual recommendation',
            error: error.message
        });
    }
};

/**
 * Update recommendation (Approve/Adjust)
 */
export const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedQty, priority } = req.body;

        const recommendation = await ForecastRecommendation.findById(id);
        if (!recommendation) {
            return res.status(404).json({ success: false, message: 'Recommendation not found' });
        }

        if (status === 'approved') {
            recommendation.status = 'approved';
            recommendation.approvedQty = approvedQty || recommendation.optimalReorderQty;
            recommendation.approvedBy = req.user.id;

            // Log to audit
            await AuditLog.create({
                userId: req.user.id,
                username: req.user.username,
                action: 'REORDER_APPROVED',
                module: 'Inventory',
                details: { medicine: recommendation.medicineName, qty: recommendation.approvedQty },
            });
        } else if (status === 'rejected') {
            recommendation.status = 'rejected';
        }

        if (priority) recommendation.priority = priority;
        if (approvedQty !== undefined) {
            recommendation.approvedQty = approvedQty;
            recommendation.status = 'adjusted';
        }

        await recommendation.save();

        res.status(200).json({
            success: true,
            message: 'Recommendation updated',
            recommendation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating recommendation',
            error: error.message
        });
    }
};

/**
 * Delete recommendation
 */
export const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        await ForecastRecommendation.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Recommendation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting recommendation' });
    }
};

/**
 * Get demand parameters
 */
export const getDemandParameters = async (req, res) => {
    try {
        console.log('Fetching parameters...');
        let params = await ForecastParameters.findOne().sort({ createdAt: -1 });
        console.log('Params found:', params ? 'yes' : 'no');
        if (!params) {
            console.log('Creating default params...');
            params = await ForecastParameters.create({});
        }
        res.status(200).json({ success: true, parameters: params });
    } catch (error) {
        console.error('Error fetching parameters:', error);
        res.status(500).json({ success: false, message: 'Error fetching parameters' });
    }
};

/**
 * Save demand parameters
 */
export const saveDemandParameters = async (req, res) => {
    try {
        const updates = req.body;
        updates.updatedBy = req.user.id;

        let params = await ForecastParameters.findOne().sort({ createdAt: -1 });
        if (params) {
            params = await ForecastParameters.findByIdAndUpdate(params._id, updates, { new: true });
        } else {
            params = await ForecastParameters.create(updates);
        }

        res.status(200).json({ success: true, parameters: params });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving parameters' });
    }
};

/**
 * Get trend data for Predicted vs Actual Graph
 */
export const getTrendData = async (req, res) => {
    try {
        // This is used by the Dashboard & ForecastReview chart
        // We'll return the last 14 days of predicted (from recommendations) vs actual (from history)
        const now = new Date();
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        const actuals = await InventoryHistory.aggregate([
            { $match: { action: 'sale', createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    actual: { $sum: { $abs: '$quantityChanged' } }
                }
            }
        ]);

        const predictions = await ForecastRecommendation.aggregate([
            { $match: { createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    predicted: { $sum: '$predictedDemand' }
                }
            }
        ]);

        const trend = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const act = actuals.find(a => a._id === key);
            const pre = predictions.find(p => p._id === key);

            trend.push({
                date: key,
                actual: act ? act.actual : 0,
                predicted: pre ? Math.round(pre.predicted / 7) : 0 // Divide by 7 as our forecastHorizon is weekly
            });
        }

        res.status(200).json({ success: true, trend });
    } catch (error) {
        log('ERROR', 'Error fetching trend data', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: 'Error fetching trend data' });
    }
};

/**
 * Trigger retraining (Continuous Learning)
 */
export const triggerRetraining = async (req, res) => {
    // Logic-wise it's the same as runForecast but typically called automatically
    return runForecast(req, res);
};

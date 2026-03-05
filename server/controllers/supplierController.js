import { Supplier, PurchaseOrder, ReorderSuggestion } from '../models/supplierModels.js';
import { Medicine, Category } from '../models/index.js';
import log from '../utils/logger.js';

// ============ SUPPLIER MANAGEMENT ============

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_info, medicine_categories, notes } = req.body;

    if (!supplier_name || !contact_info?.phone || !contact_info?.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier name, phone, and email',
      });
    }

    const existingSupplier = await Supplier.findOne({ supplier_name });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this name already exists',
      });
    }

    let mappedCategories = [];
    if (medicine_categories && Array.isArray(medicine_categories)) {
      const categoryDocs = await Category.find({ name: { $in: medicine_categories } });
      mappedCategories = categoryDocs.map(c => c._id);
    }

    const supplier = await Supplier.create({
      supplier_name,
      contact_info,
      medicine_categories: mappedCategories,
      notes,
    });

    log('INFO', 'Supplier created', { supplierId: supplier._id, name: supplier_name, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Supplier registered successfully',
      supplier,
    });
  } catch (error) {
    log('ERROR', 'Create supplier error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message,
    });
  }
};

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.medicine_categories = categoryDoc._id;
      } else {
        return res.status(200).json({ success: true, count: 0, suppliers: [] });
      }
    }

    if (search) {
      query.supplier_name = { $regex: search, $options: 'i' };
    }

    const suppliers = await Supplier.find(query)
      .populate('medicine_categories', 'name')
      .sort({ delivery_performance_score: -1 })
      .lean();

    const formattedSuppliers = suppliers.map(s => ({
      ...s,
      medicine_categories: s.medicine_categories?.map(c => c.name || 'Unknown') || []
    }));

    res.status(200).json({
      success: true,
      count: formattedSuppliers.length,
      suppliers: formattedSuppliers,
    });
  } catch (error) {
    log('ERROR', 'Get suppliers error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.medicine_categories && Array.isArray(updateData.medicine_categories)) {
      const categoryDocs = await Category.find({ name: { $in: updateData.medicine_categories } });
      updateData.medicine_categories = categoryDocs.map(c => c._id);
    }

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    await supplier.populate('medicine_categories', 'name');
    const returnedSupplier = supplier.toObject();
    returnedSupplier.medicine_categories = returnedSupplier.medicine_categories?.map(c => c.name || 'Unknown') || [];

    log('INFO', 'Supplier updated', { supplierId: id, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier: returnedSupplier,
    });
  } catch (error) {
    log('ERROR', 'Update supplier error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message,
    });
  }
};

// ============ REORDER SUGGESTIONS ============

// Generate reorder suggestions based on AI demand forecast
export const generateReorderSuggestions = async (req, res) => {
  try {
    // Get all medicines with low stock
    const medicines = await Medicine.find({});
    const suggestions = [];

    for (const medicine of medicines) {
      // Check if stock is below reorder level
      if (medicine.quantity <= medicine.reorderLevel) {
        // Simulate AI demand forecast (in production, this would come from Module 3)
        const aiDemandForecast = Math.ceil(medicine.reorderLevel * 1.5);
        const suggestedQuantity = aiDemandForecast - medicine.quantity;

        // Find suitable suppliers for this medicine category
        const suppliers = await Supplier.find({
          medicine_categories: medicine.category,
          is_active: true,
        })
          .sort({ delivery_performance_score: -1 })
          .limit(3);

        const suggestedSuppliers = suppliers.map((supplier) => ({
          supplier_id: supplier._id,
          supplier_name: supplier.supplier_name,
          delivery_score: supplier.delivery_performance_score,
          estimated_price: medicine.purchasePrice,
        }));

        // Determine priority based on stock level
        let priority = 'Low';
        if (medicine.quantity === 0) priority = 'Critical';
        else if (medicine.quantity < medicine.reorderLevel * 0.5) priority = 'High';
        else if (medicine.quantity < medicine.reorderLevel) priority = 'Medium';

        // Create reorder suggestion
        const suggestion = await ReorderSuggestion.create({
          medicine_id: medicine._id,
          medicine_name: medicine.name,
          current_stock: medicine.quantity,
          reorder_level: medicine.reorderLevel,
          suggested_quantity: suggestedQuantity,
          ai_demand_forecast: aiDemandForecast,
          suggested_suppliers: suggestedSuppliers,
          priority,
        });

        suggestions.push(suggestion);
      }
    }

    log('INFO', 'Reorder suggestions generated', { count: suggestions.length, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Reorder suggestions generated successfully',
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    log('ERROR', 'Generate reorder suggestions error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error generating reorder suggestions',
      error: error.message,
    });
  }
};

// Get all reorder suggestions
export const getReorderSuggestions = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const suggestions = await ReorderSuggestion.find(query)
      .populate('medicine_id', 'name category')
      .populate('suggested_suppliers.supplier_id', 'supplier_name contact_info')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    log('ERROR', 'Get reorder suggestions error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching reorder suggestions',
      error: error.message,
    });
  }
};

// ============ PURCHASE ORDER MANAGEMENT ============

// Create purchase order from approved suggestion
export const createPurchaseOrder = async (req, res) => {
  try {
    const { suggestion_id, supplier_id, expected_delivery_date, notes } = req.body;

    if (!suggestion_id || !supplier_id || !expected_delivery_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide suggestion_id, supplier_id, and expected_delivery_date',
      });
    }

    const suggestion = await ReorderSuggestion.findById(suggestion_id).populate('medicine_id');
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Reorder suggestion not found',
      });
    }

    const supplier = await Supplier.findById(supplier_id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Generate order number
    const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const totalAmount = suggestion.suggested_quantity * suggestion.medicine_id.purchasePrice;

    const purchaseOrder = await PurchaseOrder.create({
      order_number: orderNumber,
      medicine_id: suggestion.medicine_id._id,
      medicine_name: suggestion.medicine_name,
      supplier_id: supplier._id,
      requested_quantity: suggestion.suggested_quantity,
      unit_price: suggestion.medicine_id.purchasePrice,
      total_amount: totalAmount,
      expected_delivery_date,
      created_by: req.user.id,
      notes,
      ai_forecast_reference: {
        demand_predicted: suggestion.ai_demand_forecast,
        forecast_date: suggestion.createdAt,
      },
    });

    // Update suggestion status
    suggestion.status = 'Ordered';
    suggestion.reviewed_by = req.user.id;
    suggestion.reviewed_at = new Date();
    await suggestion.save();

    // Update supplier stats
    supplier.total_orders += 1;
    await supplier.save();

    // Simulate sending order to supplier (automation)
    await simulateVendorCommunication(supplier, purchaseOrder);

    log('INFO', 'Purchase order created', {
      orderId: purchaseOrder._id,
      orderNumber,
      supplierId: supplier._id,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created and sent to supplier',
      purchaseOrder,
    });
  } catch (error) {
    log('ERROR', 'Create purchase order error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message,
    });
  }
};

// Get all purchase orders
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, supplier_id } = req.query;
    let query = {};

    if (status) query.order_status = status;
    if (supplier_id) query.supplier_id = supplier_id;

    const orders = await PurchaseOrder.find(query)
      .populate('medicine_id', 'name category')
      .populate('supplier_id', 'supplier_name contact_info')
      .populate('created_by', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    log('ERROR', 'Get purchase orders error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message,
    });
  }
};

// Update purchase order status (mark as received)
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, received_quantity, actual_delivery_date } = req.body;

    const order = await PurchaseOrder.findById(id).populate('supplier_id medicine_id');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    order.order_status = order_status;
    if (order_status === 'Received') {
      order.received_quantity = received_quantity || order.requested_quantity;
      order.actual_delivery_date = actual_delivery_date || new Date();

      // Update medicine stock
      const medicine = await Medicine.findById(order.medicine_id._id);
      if (medicine) {
        medicine.quantity += order.received_quantity;
        await medicine.save();
      }

      // Update supplier delivery performance
      const supplier = order.supplier_id;
      supplier.successful_deliveries += 1;

      // Calculate delivery performance score (0-10)
      const onTimeDelivery = new Date(order.actual_delivery_date) <= new Date(order.expected_delivery_date);
      const performanceBoost = onTimeDelivery ? 0.5 : -0.5;
      supplier.delivery_performance_score = Math.max(
        0,
        Math.min(10, supplier.delivery_performance_score + performanceBoost)
      );

      await supplier.save();
    }

    await order.save();

    log('INFO', 'Purchase order updated', {
      orderId: id,
      status: order_status,
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      order,
    });
  } catch (error) {
    log('ERROR', 'Update purchase order error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message,
    });
  }
};

// Simulate vendor communication (automation)
const simulateVendorCommunication = async (supplier, order) => {
  try {
    const message = `
      New Purchase Order: ${order.order_number}
      Medicine: ${order.medicine_name}
      Quantity: ${order.requested_quantity}
      Expected Delivery: ${order.expected_delivery_date}
      Total Amount: ₹${order.total_amount}
    `;

    log('INFO', 'Vendor communication sent (simulated)', {
      supplierId: supplier._id,
      supplierEmail: supplier.contact_info.email,
      orderNumber: order.order_number,
      message,
    });

    // In production, integrate with email/SMS service
    console.log(`
      ╔════════════════════════════════════════╗
      ║   VENDOR COMMUNICATION (AUTOMATED)     ║
      ╠════════════════════════════════════════╣
      ║ To: ${supplier.supplier_name.padEnd(30)}║
      ║ Email: ${supplier.contact_info.email.padEnd(27)}║
      ║ Phone: ${supplier.contact_info.phone.padEnd(27)}║
      ╠════════════════════════════════════════╣
      ${message.split('\n').map(line => `║ ${line.trim().padEnd(39)}║`).join('\n')}
      ╚════════════════════════════════════════╝
    `);

    return { success: true };
  } catch (error) {
    log('ERROR', 'Vendor communication error', { error: error.message });
    return { success: false, error: error.message };
  }
};

// Order Controller

import { Order, Customer, Medicine, Prescription } from '../models/index.js';
import { sendEmailNotification, sendWhatsAppNotification } from '../utils/notifications.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, orderType, deliveryAddress, items, prescriptionId, paymentMethod } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Check stock availability
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine ${item.medicineName} not found` });
      }
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` 
        });
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      item.total = item.price * item.quantity;
      subtotal += item.total;
    }

    const tax = subtotal * 0.12; // 12% GST
    const deliveryCharge = orderType === 'delivery' ? 50 : 0; // ₹50 delivery charge
    const grandTotal = subtotal + tax + deliveryCharge;

    // Create order
    const order = new Order({
      orderNumber,
      customerId,
      customerName,
      customerPhone,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      items,
      prescriptionId,
      subtotal,
      tax,
      deliveryCharge,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'placed',
    });

    await order.save();

    // Link prescription to order if exists
    if (prescriptionId) {
      await Prescription.findByIdAndUpdate(prescriptionId, {
        orderId: order._id,
        status: 'fulfilled',
      });
    }

    // Send confirmation notifications
    const customer = await Customer.findById(customerId);
    if (customer && customer.email) {
      await sendEmailNotification(
        customer.email,
        'Order Placed Successfully',
        `Your order ${orderNumber} has been placed successfully. Total: ₹${grandTotal.toFixed(2)}`
      );
    }

    if (customer && customer.phone) {
      await sendWhatsAppNotification(
        customer.phone,
        `Your order ${orderNumber} has been placed successfully. We'll notify you once it's ready for ${orderType}.`
      );
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;
    const filter = {};
    
    if (status) filter.orderStatus = status;
    if (orderType) filter.orderType = orderType;

    const orders = await Order.find(filter)
      .populate('customerId', 'name phone email')
      .populate('staffId', 'username')
      .sort({ placedAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get customer orders
export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({ customerId })
      .populate('staffId', 'username')
      .sort({ placedAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Failed to fetch customer orders', error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customerId', 'name phone email address')
      .populate('staffId', 'username')
      .populate('prescriptionId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const staffId = req.user.id;

    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id).populate('customerId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    order.staffId = staffId;

    // Update timestamps
    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'ready') order.readyAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    // Reduce stock when order is confirmed
    if (status === 'confirmed') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicineId, {
          $inc: { quantity: -item.quantity },
        });
      }
    }

    await order.save();

    // Notify customer
    const customer = order.customerId;
    if (customer && customer.phone) {
      let message = '';
      if (status === 'confirmed') message = `Your order ${order.orderNumber} has been confirmed!`;
      if (status === 'ready') message = `Your order ${order.orderNumber} is ready for ${order.orderType}!`;
      if (status === 'dispatched') message = `Your order ${order.orderNumber} has been dispatched!`;
      if (status === 'delivered') message = `Your order ${order.orderNumber} has been delivered. Thank you!`;
      if (status === 'cancelled') message = `Your order ${order.orderNumber} has been cancelled.`;

      if (message) {
        await sendWhatsAppNotification(customer.phone, message);
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const placed = await Order.countDocuments({ orderStatus: 'placed' });
    const confirmed = await Order.countDocuments({ orderStatus: 'confirmed' });
    const preparing = await Order.countDocuments({ orderStatus: 'preparing' });
    const ready = await Order.countDocuments({ orderStatus: 'ready' });
    const dispatched = await Order.countDocuments({ orderStatus: 'dispatched' });
    const delivered = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelled = await Order.countDocuments({ orderStatus: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.json({
      placed,
      confirmed,
      preparing,
      ready,
      dispatched,
      delivered,
      cancelled,
      total: placed + confirmed + preparing + ready + dispatched + delivered + cancelled,
      revenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Failed to fetch order stats', error: error.message });
  }
};

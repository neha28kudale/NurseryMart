const express = require('express');
const { authenticateToken, authorizeBuyer } = require('../middleware/auth');
const Order = require('../models/Order');
const orderEvents = require('../utils/orderEvents');

const router = express.Router();

// Create a mock payment intent (for online/card)
router.post('/create-intent', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    const { orderId, method = 'card' } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    if (!['online', 'card'].includes(method)) return res.status(400).json({ success: false, message: 'Invalid method' });

    // Mock client secret
    const clientSecret = `mock_secret_${order._id.toString()}`;
    res.json({ success: true, data: { clientSecret, amount: order.totalAmount, currency: 'INR' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create payment intent' });
  }
});

// Confirm mock payment
router.post('/confirm', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    const { orderId, clientSecret } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    if (!clientSecret || !clientSecret.startsWith('mock_secret_')) return res.status(400).json({ success: false, message: 'Invalid client secret' });

    order.paymentStatus = 'completed';
    if (order.status === 'pending') order.status = 'confirmed';
    await order.save();

    orderEvents.emit('order:update', { id: order._id.toString(), status: order.status, paymentStatus: order.paymentStatus });

    res.json({ success: true, message: 'Payment confirmed', data: { orderId: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
});

module.exports = router;



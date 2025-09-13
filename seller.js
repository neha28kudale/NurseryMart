const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// Get seller statistics
router.get('/statistics', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get total sales
        const orders = await Order.find({
            'items.seller': req.user._id,
            status: 'delivered'
        });

        const totalSales = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => {
                return itemSum + (item.seller.toString() === req.user._id.toString() ? item.price * item.quantity : 0);
            }, 0);
        }, 0);

        // Get total number of orders
        const totalOrders = await Order.countDocuments({
            'items.seller': req.user._id
        });

        // Get total number of products
        const totalProducts = await Product.countDocuments({ seller: req.user._id });

        // Calculate average rating
        const ratings = await Order.aggregate([
            {
                $match: {
                    'items.seller': req.user._id,
                    'items.rating': { $exists: true }
                }
            },
            {
                $unwind: '$items'
            },
            {
                $match: {
                    'items.seller': req.user._id,
                    'items.rating': { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$items.rating' }
                }
            }
        ]);

        const rating = ratings.length > 0 ? ratings[0].averageRating : 0;

        res.json({
            totalSales,
            totalOrders,
            totalProducts,
            rating
        });
    } catch (error) {
        console.error('Error getting seller statistics:', error);
        res.status(500).json({ message: 'Error getting seller statistics' });
    }
});

// Get recent orders
router.get('/orders/recent', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await Order.find({
            'items.seller': req.user._id
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('buyer', 'name email')
        .populate('items.product', 'name price');

        res.json(orders);
    } catch (error) {
        console.error('Error getting recent orders:', error);
        res.status(500).json({ message: 'Error getting recent orders' });
    }
});

// Get seller's products
router.get('/products', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const products = await Product.find({ seller: req.user._id });
        res.json(products);
    } catch (error) {
        console.error('Error getting seller products:', error);
        res.status(500).json({ message: 'Error getting seller products' });
    }
});

// Update order status (delegates to single order status for simplicity)
router.put('/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the seller owns any items in this order
        const hasSellerItems = order.items.some(item => 
            item.seller.toString() === req.user._id.toString()
        );

        if (!hasSellerItems) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        await order.updateStatus(status);
        const populated = await Order.findById(order._id)
          .populate('buyer', 'name email')
          .populate('items.product', 'name price')
          .populate('items.seller', 'name');
        res.json(populated);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Notifications endpoints are intentionally omitted in this version

module.exports = router;

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { 
  authenticateToken, 
  authorizeBuyer, 
  authorizeSeller, 
  authorizeAdmin 
} = require('../middleware/auth');
const orderEvents = require('../utils/orderEvents');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private (Buyer only)
router.post('/', [
  authenticateToken,
  authorizeBuyer,
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['cod', 'online', 'card'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.seller');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items
    const validationResults = [];
    let isValid = true;

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product || !product.isActive) {
        validationResults.push({
          productId: item.product?._id || 'Unknown',
          valid: false,
          message: 'Product is no longer available'
        });
        isValid = false;
        continue;
      }

      if (product.stock < item.quantity) {
        validationResults.push({
          productId: product._id,
          valid: false,
          message: `Only ${product.stock} items available in stock`
        });
        isValid = false;
      } else {
        validationResults.push({
          productId: product._id,
          valid: true,
          message: 'Product is available'
        });
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Some items in cart are not available',
        data: { validationResults }
      });
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
      seller: item.seller._id
    }));

    // Calculate total amount
    const totalAmount = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = new Order({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await cart.clearCart();

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'name');

    // Notify all unique sellers involved in the order
    try {
      const uniqueSellerIds = [...new Set(order.items.map(i => i.seller.toString()))];
      const notifications = uniqueSellerIds.map(sellerId => Message.create({
        sender: req.user._id,
        receiver: sellerId,
        text: `New order ${order.orderNumber} placed containing your product(s).`
      }));
      await Promise.all(notifications);
    } catch (e) {
      console.warn('Failed to send seller notifications:', e?.message || e);
    }

    // Emit order created event
    orderEvents.emit('order:update', { id: populatedOrder._id.toString(), status: populatedOrder.status });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// @route   GET /api/orders/:id/stream
// @desc    Server-Sent Events stream for realtime order status
// @access  Private (Owner/Seller/Admin)
router.get('/:id/stream', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('_id buyer items.seller status');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isSeller && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders?.();

    const send = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial state
    send({ id: order._id.toString(), status: order.status });

    const handler = (evt) => {
      if (evt.id === order._id.toString()) send(evt);
    };
    orderEvents.on('order:update', handler);

    req.on('close', () => {
      orderEvents.off('order:update', handler);
      res.end();
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to open stream' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders (buyer) or seller's orders (seller)
// @access  Private
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'buyer') {
      filter.buyer = req.user._id;
    } else if (req.user.role === 'seller') {
      filter['items.seller'] = req.user._id;
    }
    // Admin can see all orders

    if (status) {
      filter.status = status;
    }

    // Execute query
    const orders = await Order.find(filter)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          hasNextPage: skip + orders.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Owner/Seller/Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    const isOwner = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Seller/Admin only)
// @access  Private (Seller/Admin only)
router.put('/:id/status', [
  authenticateToken,
  authorizeSeller,
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is seller of any item in the order or admin
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update orders for your products.'
      });
    }

    // Update order status
    await order.updateStatus(status);

    // Populate order details
    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'name');

    // Emit status update
    orderEvents.emit('order:update', { id: updatedOrder._id.toString(), status: updatedOrder.status });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics summary
// @access  Private (Seller/Admin only)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'seller') {
      filter['items.seller'] = req.user._id;
    }
    // Admin can see all orders

    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const summary = {
      total: 0,
      totalAmount: 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary.totalAmount += stat.totalAmount;
      summary.byStatus[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
    });

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order (Buyer only, if status is pending)
// @access  Private (Buyer only)
router.post('/:id/cancel', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Emit cancelled status
    orderEvents.emit('order:update', { id: order._id.toString(), status: order.status });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;

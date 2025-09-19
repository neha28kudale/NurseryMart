const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, authorizeBuyer } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private (Buyer only)
router.get('/', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images category stock isActive',
        match: { isActive: true }
      })
      .populate('items.seller', 'name');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Filter out inactive products and update cart
    const activeItems = cart.items.filter(item => item.product);
    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private (Buyer only)
router.post('/add', [
  authenticateToken,
  authorizeBuyer,
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
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

    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price, product.seller);

    // Populate cart items
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images category stock'
      })
      .populate('items.seller', 'name');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart: populatedCart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private (Buyer only)
router.put('/update', [
  authenticateToken,
  authorizeBuyer,
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be non-negative')
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

    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check stock availability if quantity > 0
    if (quantity > 0 && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity);

    // Populate cart items
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images category stock'
      })
      .populate('items.seller', 'name');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Cart update error:', error);
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private (Buyer only)
router.delete('/remove/:productId', [
  authenticateToken,
  authorizeBuyer
], async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(req.params.productId);

    // Populate cart items
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images category stock'
      })
      .populate('items.seller', 'name');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private (Buyer only)
router.delete('/clear', [
  authenticateToken,
  authorizeBuyer
], async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private (Buyer only)
router.get('/count', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.totalItems : 0;

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count'
    });
  }
});

// @route   POST /api/cart/validate
// @desc    Validate cart items (check stock, availability)
// @access  Private (Buyer only)
router.post('/validate', authenticateToken, authorizeBuyer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

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

    res.json({
      success: true,
      data: {
        isValid,
        validationResults,
        cart
      }
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart'
    });
  }
});

module.exports = router;

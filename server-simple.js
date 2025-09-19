const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'John Buyer',
    email: 'buyer@test.com',
    role: 'buyer',
    password: 'password123'
  },
  {
    id: '2',
    name: 'Jane Seller',
    email: 'seller@test.com',
    role: 'seller',
    password: 'password123'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    password: 'password123'
  }
];

const mockProducts = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    description: 'Beautiful tropical plant with split leaves',
    price: 299,
    category: 'indoor',
    images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
    seller: '2',
    stock: 10
  },
  {
    id: '2',
    name: 'Snake Plant',
    description: 'Low maintenance indoor plant',
    price: 199,
    category: 'indoor',
    images: ['https://images.unsplash.com/photo-1593482892296-4a0b0b5b0b5b?w=400&h=300&fit=crop'],
    seller: '2',
    stock: 15
  },
  {
    id: '3',
    name: 'Rose Bush',
    description: 'Beautiful flowering outdoor plant',
    price: 399,
    category: 'outdoor',
    images: ['https://images.unsplash.com/photo-1593482892296-4a0b0b5b0b5b?w=400&h=300&fit=crop'],
    seller: '2',
    stock: 8
  }
];

let mockCart = {};
let mockOrders = [];
let mockMessages = [];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'buyer' } = req.body;
  
  if (mockUsers.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  const newUser = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    role,
    password
  };
  
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: 'mock-token-' + newUser.id
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: 'mock-token-' + user.id
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const userId = token?.replace('mock-token-', '');
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  res.json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  });
});

// Products routes
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: mockProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Cart routes
app.get('/api/cart', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const userId = token?.replace('mock-token-', '');
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const cartItems = mockCart[userId] || [];
  res.json({
    success: true,
    data: cartItems
  });
});

app.post('/api/cart/add', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const userId = token?.replace('mock-token-', '');
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const { productId, quantity = 1 } = req.body;
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!mockCart[userId]) {
    mockCart[userId] = [];
  }

  const existingItem = mockCart[userId].find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    mockCart[userId].push({
      productId,
      quantity,
      product: product
    });
  }

  res.json({
    success: true,
    message: 'Added to cart'
  });
});

// Orders routes
app.post('/api/orders', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const userId = token?.replace('mock-token-', '');
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
  
  const newOrder = {
    id: (mockOrders.length + 1).toString(),
    buyer: userId,
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockOrders.push(newOrder);
  
  // Clear cart
  mockCart[userId] = [];
  
  res.json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
});

app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const userId = token?.replace('mock-token-', '');
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const userOrders = mockOrders.filter(order => order.buyer === userId);
  res.json({
    success: true,
    data: userOrders
  });
});

// Plant Care AI routes
app.post('/api/plant-care/analyze', (req, res) => {
  res.json({
    success: true,
    data: {
      careTips: `
🌱 **Plant Care Analysis**

Based on your plant photo, here are some care recommendations:

**Watering:**
- Check soil moisture by inserting your finger 1-2 inches deep
- Water when the top inch of soil feels dry
- Water thoroughly until it drains from the bottom

**Light:**
- Most houseplants prefer bright, indirect light
- Avoid direct sunlight which can burn leaves
- Rotate plants weekly for even growth

**General Care:**
- Use well-draining potting mix
- Fertilize monthly during growing season
- Clean leaves regularly to remove dust
- Watch for pests and diseases

**Common Issues:**
- Yellow leaves often indicate overwatering
- Brown tips suggest low humidity or over-fertilizing
- Drooping leaves may mean underwatering

Remember: Every plant is unique! Adjust care based on your specific environment.
      `,
      plantName: 'Your Plant',
      analyzedAt: new Date().toISOString(),
      imageProcessed: true
    }
  });
});

app.get('/api/plant-care/tips', (req, res) => {
  const { category } = req.query;
  
  const tips = {
    indoor: {
      title: "Indoor Plant Care Tips",
      tips: [
        "Water when soil feels dry 1-2 inches deep",
        "Provide bright, indirect light",
        "Maintain humidity with pebble trays",
        "Rotate plants weekly for even growth",
        "Clean leaves regularly to remove dust"
      ]
    },
    outdoor: {
      title: "Outdoor Plant Care Tips",
      tips: [
        "Water deeply but less frequently",
        "Mulch around plants to retain moisture",
        "Provide adequate spacing for air circulation",
        "Check for pests and diseases regularly",
        "Protect from extreme weather conditions"
      ]
    }
  };

  res.json({
    success: true,
    data: tips[category] || tips.indoor
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NurseryMart API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NurseryMart Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Plant Care AI: http://localhost:${PORT}/api/plant-care/tips`);
  console.log(`\n💡 Test accounts:`);
  console.log(`   Buyer: buyer@test.com / password123`);
  console.log(`   Seller: seller@test.com / password123`);
  console.log(`   Admin: admin@test.com / password123`);
});

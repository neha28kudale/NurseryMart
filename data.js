// Data management for NurseryMart App
const NM = {
    // Local Storage Keys
    LS_KEYS: {
        user: 'nurserymart_user',
        cart: 'nurserymart_cart',
        favorites: 'nurserymart_favorites',
        orders: 'nurserymart_orders',
        messages: 'nurserymart_messages',
        products: 'nurserymart_products'
    },

    // Mock data for development
    mockData: {
        users: [
            {
                id: 'user1',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'buyer',
                phone: '+91 98765 43210',
                address: '123 Garden Street, Green City'
            },
            {
                id: 'user2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                role: 'seller',
                phone: '+91 98765 43211',
                address: '456 Plant Avenue, Green City',
                nurseryName: 'Green Thumb Nursery'
            },
            {
                id: 'admin1',
                name: 'Admin User',
                email: 'admin@nurserymart.com',
                password: 'admin123',
                role: 'admin',
                phone: '+91 98765 43212',
                address: '789 Admin Road, Green City'
            }
        ],
        products: [
            {
                id: 'prod1',
                name: 'Snake Plant',
                description: 'Perfect low-maintenance indoor plant that purifies air and adds beauty to any space.',
                price: 500,
                category: 'Indoor',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 25,
                rating: 4.5,
                reviews: 12,
                careLevel: 'Easy',
                waterNeeds: 'Low',
                lightNeeds: 'Low to Medium',
                height: '30-60 cm',
                potSize: '6 inch'
            },
            {
                id: 'prod2',
                name: 'Money Plant',
                description: 'Bring prosperity to your home with this beautiful climbing plant.',
                price: 250,
                category: 'Indoor',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 40,
                rating: 4.3,
                reviews: 8,
                careLevel: 'Easy',
                waterNeeds: 'Medium',
                lightNeeds: 'Medium',
                height: '20-40 cm',
                potSize: '4 inch'
            },
            {
                id: 'prod3',
                name: 'Areca Palm',
                description: 'Elegant tropical beauty perfect for living rooms and offices.',
                price: 800,
                category: 'Indoor',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 15,
                rating: 4.7,
                reviews: 20,
                careLevel: 'Medium',
                waterNeeds: 'High',
                lightNeeds: 'Bright Indirect',
                height: '60-120 cm',
                potSize: '8 inch'
            },
            {
                id: 'prod4',
                name: 'Peace Lily',
                description: 'Beautiful flowering plant that helps purify indoor air.',
                price: 600,
                category: 'Flowering',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 20,
                rating: 4.6,
                reviews: 15,
                careLevel: 'Easy',
                waterNeeds: 'High',
                lightNeeds: 'Low to Medium',
                height: '40-80 cm',
                potSize: '6 inch'
            },
            {
                id: 'prod5',
                name: 'Aloe Vera',
                description: 'Medicinal succulent plant with healing properties.',
                price: 300,
                category: 'Succulent',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 35,
                rating: 4.4,
                reviews: 18,
                careLevel: 'Easy',
                waterNeeds: 'Low',
                lightNeeds: 'Bright',
                height: '20-40 cm',
                potSize: '4 inch'
            },
            {
                id: 'prod6',
                name: 'Monstera Deliciosa',
                description: 'Stunning tropical plant with distinctive split leaves.',
                price: 1200,
                category: 'Indoor',
                sellerId: 'user2',
                images: ['https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=300&fit=crop'],
                stock: 10,
                rating: 4.8,
                reviews: 25,
                careLevel: 'Medium',
                waterNeeds: 'Medium',
                lightNeeds: 'Bright Indirect',
                height: '80-150 cm',
                potSize: '10 inch'
            }
        ],
        orders: [
            {
                id: 'order1',
                userId: 'user1',
                items: [
                    { id: 'prod1', name: 'Snake Plant', qty: 1, price: 500 }
                ],
                amount: 500,
                status: 'pending',
                orderDate: '2024-01-15',
                tracking: {
                    eta: '2024-01-20',
                    status: 'Order Placed'
                }
            },
            {
                id: 'order2',
                userId: 'user1',
                items: [
                    { id: 'prod2', name: 'Money Plant', qty: 2, price: 250 }
                ],
                amount: 500,
                status: 'delivered',
                orderDate: '2024-01-10',
                tracking: {
                    eta: '2024-01-15',
                    status: 'Delivered'
                }
            }
        ],
        messages: [
            {
                id: 'msg1',
                senderId: 'user1',
                receiverId: 'user2',
                text: 'Hi, I have a question about the Snake Plant.',
                timestamp: '2024-01-15T10:00:00Z'
            },
            {
                id: 'msg2',
                senderId: 'user2',
                receiverId: 'user1',
                text: 'Hello! Sure, what would you like to know?',
                timestamp: '2024-01-15T10:05:00Z'
            }
        ]
    },

    // Initialize data
    init() {
        this.loadData();
        this.setupDefaultData();
    },

    // Load data from localStorage
    loadData() {
        this.users = JSON.parse(localStorage.getItem(this.LS_KEYS.user)) || this.mockData.users;
        this.products = JSON.parse(localStorage.getItem(this.LS_KEYS.products)) || this.mockData.products;
        this.orders = JSON.parse(localStorage.getItem(this.LS_KEYS.orders)) || this.mockData.orders;
        this.messages = JSON.parse(localStorage.getItem(this.LS_KEYS.messages)) || this.mockData.messages;
    },

    // Setup default data if none exists
    setupDefaultData() {
        if (!localStorage.getItem(this.LS_KEYS.user)) {
            localStorage.setItem(this.LS_KEYS.user, JSON.stringify(this.mockData.users));
        }
        if (!localStorage.getItem(this.LS_KEYS.products)) {
            localStorage.setItem(this.LS_KEYS.products, JSON.stringify(this.mockData.products));
        }
        if (!localStorage.getItem(this.LS_KEYS.orders)) {
            localStorage.setItem(this.LS_KEYS.orders, JSON.stringify(this.mockData.orders));
        }
        if (!localStorage.getItem(this.LS_KEYS.messages)) {
            localStorage.setItem(this.LS_KEYS.messages, JSON.stringify(this.mockData.messages));
        }
    },

    // User management
    getCurrentUser() {
        const userData = localStorage.getItem(this.LS_KEYS.user);
        if (!userData) return null;
        
        const users = JSON.parse(userData);
        const currentUserEmail = localStorage.getItem('currentUser');
        return users.find(user => user.email === currentUserEmail) || null;
    },

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem(this.LS_KEYS.user));
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', user.email);
            return user;
        }
        return null;
    },

    logoutUser() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem(this.LS_KEYS.cart);
    },

    registerUser(userData) {
        const users = JSON.parse(localStorage.getItem(this.LS_KEYS.user)) || [];
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        const newUser = {
            id: 'user' + (users.length + 1),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(this.LS_KEYS.user, JSON.stringify(users));
        
        // Auto-login after registration
        localStorage.setItem('currentUser', newUser.email);
        
        return { success: true, user: newUser };
    },

    // Product management
    getAllProducts() {
        return this.products;
    },

    getProduct(id) {
        return this.products.find(p => p.id === id);
    },

    searchProducts(query, category = '') {
        let filtered = this.products;
        
        if (query) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        return filtered;
    },

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    },

    getProductsBySeller(sellerId) {
        return this.products.filter(p => p.sellerId === sellerId);
    },

    addProduct(productData) {
        const newProduct = {
            id: 'prod' + (this.products.length + 1),
            ...productData,
            createdAt: new Date().toISOString()
        };
        this.products.push(newProduct);
        localStorage.setItem(this.LS_KEYS.products, JSON.stringify(this.products));
        return newProduct;
    },

    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            localStorage.setItem(this.LS_KEYS.products, JSON.stringify(this.products));
            return this.products[index];
        }
        return null;
    },

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        localStorage.setItem(this.LS_KEYS.products, JSON.stringify(this.products));
    },

    // Cart management
    getCart() {
        return JSON.parse(localStorage.getItem(this.LS_KEYS.cart)) || [];
    },

    addToCart(productId, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const product = this.getProduct(productId);
            if (product) {
                cart.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    description: product.description,
                    category: product.category,
                    quantity
                });
            }
        }
        
        localStorage.setItem(this.LS_KEYS.cart, JSON.stringify(cart));
        return cart;
    },

    updateCartItem(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                localStorage.setItem(this.LS_KEYS.cart, JSON.stringify(cart));
            }
        }
        
        return cart;
    },

    removeFromCart(productId) {
        const cart = this.getCart();
        const filteredCart = cart.filter(item => item.productId !== productId);
        localStorage.setItem(this.LS_KEYS.cart, JSON.stringify(filteredCart));
        return filteredCart;
    },

    clearCart() {
        localStorage.removeItem(this.LS_KEYS.cart);
        return [];
    },

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Order management
    createOrder(userId, items, totalAmount) {
        const newOrder = {
            id: 'order' + (this.orders.length + 1),
            userId,
            items,
            amount: totalAmount,
            status: 'pending',
            orderDate: new Date().toISOString(),
            tracking: {
                eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
                status: 'Order Placed'
            }
        };
        
        this.orders.push(newOrder);
        localStorage.setItem(this.LS_KEYS.orders, JSON.stringify(this.orders));
        
        // Clear cart after order
        this.clearCart();
        
        return newOrder;
    },

    getOrdersByUser(userId) {
        return this.orders.filter(order => order.userId === userId);
    },

    getAllOrders() {
        return this.orders;
    },

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.tracking.status = this.getStatusText(status);
            localStorage.setItem(this.LS_KEYS.orders, JSON.stringify(this.orders));
            return order;
        }
        return null;
    },

    getStatusText(status) {
        const statusMap = {
            'pending': 'Order Placed',
            'confirmed': 'Order Confirmed',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    },

    // Favorites management
    getFavorites() {
        return JSON.parse(localStorage.getItem(this.LS_KEYS.favorites)) || [];
    },

    addToFavorites(productId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(productId)) {
            favorites.push(productId);
            localStorage.setItem(this.LS_KEYS.favorites, JSON.stringify(favorites));
        }
        return favorites;
    },

    removeFromFavorites(productId) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(id => id !== productId);
        localStorage.setItem(this.LS_KEYS.favorites, JSON.stringify(filtered));
        return filtered;
    },

    isFavorite(productId) {
        const favorites = this.getFavorites();
        return favorites.includes(productId);
    },

    // Messaging
    getMessages() {
        return this.messages;
    },

    getConversations(userId) {
        const conversations = new Map();
        
        this.messages.forEach(msg => {
            if (msg.senderId === userId || msg.receiverId === userId) {
                const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
                if (!conversations.has(otherUserId)) {
                    conversations.set(otherUserId, []);
                }
                conversations.get(otherUserId).push(msg);
            }
        });
        
        return Array.from(conversations.entries()).map(([otherUserId, messages]) => ({
            userId: otherUserId,
            lastMessage: messages[messages.length - 1],
            unreadCount: messages.filter(m => m.receiverId === userId && !m.read).length
        }));
    },

    sendMessage(senderId, receiverId, text) {
        const newMessage = {
            id: 'msg' + (this.messages.length + 1),
            senderId,
            receiverId,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.messages.push(newMessage);
        localStorage.setItem(this.LS_KEYS.messages, JSON.stringify(this.messages));
        return newMessage;
    },

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Categories
    getCategories() {
        return ['Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Herbs', 'Climber'];
    },

    // Statistics
    getStats() {
        const totalProducts = this.products.length;
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.amount, 0);
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        
        return {
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingOrders
        };
    }
};

// Initialize when script loads
NM.init();

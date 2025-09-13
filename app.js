// Navigation state management
const updateNavigation = () => {
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');
    const sellerLinks = document.querySelectorAll('.seller-link');
    const buyerLinks = document.querySelectorAll('.buyer-link');
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = !!user;
    
    authLinks.forEach(link => {
        link.style.display = isAuthenticated ? 'none' : 'block';
    });
    
    userLinks.forEach(link => {
        link.style.display = isAuthenticated ? 'block' : 'none';
    });

    if (isAuthenticated) {
        sellerLinks.forEach(link => {
            link.style.display = user.role === 'seller' ? 'block' : 'none';
        });
        
        buyerLinks.forEach(link => {
            link.style.display = user.role === 'buyer' ? 'block' : 'none';
        });

        if (user.role === 'seller') {
            window.location.href = window.location.pathname === '/index.html' ? 
                'seller-dashboard.html' : window.location.pathname;
        }
    } else {
        sellerLinks.forEach(link => link.style.display = 'none');
        buyerLinks.forEach(link => link.style.display = 'none');
    }

    if (isAuthenticated) {
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = user.name;
        }
    }
};

// API calls
const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include'
        });
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.json();
    }
};

// Cart management
const cart = {
    items: JSON.parse(localStorage.getItem('cart') || '[]'),

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartCount();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartCount();
        }
    },

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    },

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
};

// Authentication
const auth = {
    async login(email, password, remember = false) {
        try {
            const data = await api.post('/auth/login', { email, password, remember });
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                updateNavigation();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    async logout() {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('user');
            updateNavigation();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    async register(userData) {
        try {
            const data = await api.post('/auth/register', userData);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                updateNavigation();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    cart.updateCartCount();
});

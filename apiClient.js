const API = (() => {
    const inferBase = () => {
        try {
            if (typeof window !== 'undefined' && window.API_BASE_URL) return window.API_BASE_URL.replace(/\/$/, '') + '/api';
            const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
            if (origin && origin.startsWith('http')) return origin.replace(/\/$/, '') + '/api';
            return 'http://localhost:5000/api';
        } catch { return 'http://localhost:5000/api'; }
    };
    const baseURL = inferBase();
    const headers = { 'Content-Type': 'application/json' };

    async function request(path, options = {}) {
        const res = await fetch(baseURL + path, {
            credentials: 'include',
            headers: { ...headers, ...(options.headers || {}) },
            ...options,
        });
        let body = null;
        try { body = await res.json(); } catch {}
        if (!res.ok) {
            const message = body?.message || body?.error || `Request failed (${res.status})`;
            throw new Error(message);
        }
        return body;
    }

    return {
        // Auth
        login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
        register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
        logout: () => request('/auth/logout', { method: 'POST' }),
        profile: () => request('/auth/profile'),

        // Products
        listProducts: (query = '') => request(`/products${query}`),
        getProduct: (id) => request(`/products/${id}`),
        createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
        updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
        deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

        // Cart
        getCart: () => request('/cart'),
        addToCart: (productId, quantity) => request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
        updateCart: (productId, quantity) => request('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
        removeFromCart: (productId) => request(`/cart/remove/${productId}`, { method: 'DELETE' }),
        clearCart: () => request('/cart/clear', { method: 'DELETE' }),

        // Orders
        createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
        listOrders: () => request('/orders'),
        orderDetail: (id) => request(`/orders/${id}`),
        updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),

        // Messages
        conversations: () => request('/messages/conversations'),
        messagesWith: (otherUserId) => request(`/messages/${otherUserId}`),
        sendMessage: (receiverId, text) => request('/messages', { method: 'POST', body: JSON.stringify({ receiverId, text }) }),
        markRead: (otherUserId) => request(`/messages/${otherUserId}/read`, { method: 'POST' }),

        // Admin
        users: () => request('/users'),
    };
})();



// Header component for NurseryMart App
const Header = {
    // Initialize header
    init() {
        this.render();
        this.bindEvents();
        this.updateUserInfo();
    },

    // Render header HTML
    render() {
        const header = document.querySelector('.header');
        if (!header) return;

        header.innerHTML = `
            <div class="header-content">
                <a href="index.html" class="logo">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <span class="text-2xl font-bold text-primary">NurseryMart</span>
                    </div>
                </a>

                <nav class="nav">
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="categories.html" class="nav-link">Categories</a>
                    <a href="search.html" class="nav-link">Search</a>
                    <a href="plant-care.html" class="nav-link">🌱 AI Care</a>
                    
                    <div class="flex items-center space-x-4">
                        <a href="cart.html" class="nav-link relative">
                            Cart
                            <span id="cartCount" class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                        </a>
                        
                        <div id="userSection" class="hidden">
                            <div class="relative">
                                <button id="userMenuBtn" class="nav-link flex items-center space-x-2">
                                    <span id="userName">User</span>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                
                                <div id="userMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden">
                                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                                    <a href="orders.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</a>
                                    <a href="messages.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages</a>
                                    <div id="sellerLinks" class="hidden">
                                        <a href="seller-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Seller Dashboard</a>
                                        <a href="add-product.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Product</a>
                                    </div>
                                    <div id="adminLinks" class="hidden">
                                        <a href="admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>
                                    </div>
                                    <hr class="my-1">
                                    <button id="logoutBtn" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="authSection">
                            <a href="login.html" class="nav-link">Login</a>
                            <a href="register.html" class="nav-link btn">Register</a>
                        </div>
                    </div>
                </nav>

                <button id="mobileMenuBtn" class="md:hidden text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <div id="mobileMenu" class="md:hidden hidden pb-4 px-4">
                <div class="flex flex-col space-y-4">
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="categories.html" class="nav-link">Categories</a>
                    <a href="search.html" class="nav-link">Search</a>
                    <a href="plant-care.html" class="nav-link">🌱 AI Care</a>
                    <a href="cart.html" class="nav-link">Cart</a>
                    <div id="mobileUserSection" class="hidden">
                        <a href="profile.html" class="nav-link">Profile</a>
                        <a href="orders.html" class="nav-link">My Orders</a>
                        <a href="messages.html" class="nav-link">Messages</a>
                        <div id="mobileSellerLinks" class="hidden">
                            <a href="seller-dashboard.html" class="nav-link">Seller Dashboard</a>
                            <a href="add-product.html" class="nav-link">Add Product</a>
                        </div>
                        <div id="mobileAdminLinks" class="hidden">
                            <a href="admin-dashboard.html" class="nav-link">Admin Dashboard</a>
                        </div>
                        <button id="mobileLogoutBtn" class="nav-link text-red-600">Logout</button>
                    </div>
                    <div id="mobileAuthSection">
                        <a href="login.html" class="nav-link">Login</a>
                        <a href="register.html" class="nav-link btn">Register</a>
                    </div>
                </div>
            </div>
        `;
    },

    // Bind event listeners
    bindEvents() {
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (userMenuBtn && userMenu) {
            userMenuBtn.addEventListener('click', () => {
                userMenu.classList.toggle('hidden');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                    userMenu.classList.add('hidden');
                }
            });
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.logout());
        }

        // Update cart count
        this.updateCartCount();
    },

    // Update user information display
    updateUserInfo() {
        const currentUser = NM.getCurrentUser();
        const userSection = document.getElementById('userSection');
        const authSection = document.getElementById('authSection');
        const mobileUserSection = document.getElementById('mobileUserSection');
        const mobileAuthSection = document.getElementById('mobileAuthSection');
        const userName = document.getElementById('userName');
        const sellerLinks = document.getElementById('sellerLinks');
        const adminLinks = document.getElementById('adminLinks');
        const mobileSellerLinks = document.getElementById('mobileSellerLinks');
        const mobileAdminLinks = document.getElementById('mobileAdminLinks');

        if (currentUser) {
            // Show user section
            if (userSection) userSection.classList.remove('hidden');
            if (authSection) authSection.classList.add('hidden');
            if (mobileUserSection) mobileUserSection.classList.remove('hidden');
            if (mobileAuthSection) mobileAuthSection.classList.add('hidden');

            // Update user name
            if (userName) userName.textContent = currentUser.name;

            // Show role-specific links
            if (currentUser.role === 'seller') {
                if (sellerLinks) sellerLinks.classList.remove('hidden');
                if (mobileSellerLinks) mobileSellerLinks.classList.remove('hidden');
            } else {
                if (sellerLinks) sellerLinks.classList.add('hidden');
                if (mobileSellerLinks) mobileSellerLinks.classList.add('hidden');
            }

            if (currentUser.role === 'admin') {
                if (adminLinks) adminLinks.classList.remove('hidden');
                if (mobileAdminLinks) mobileAdminLinks.classList.remove('hidden');
            } else {
                if (adminLinks) adminLinks.classList.add('hidden');
                if (mobileAdminLinks) mobileAdminLinks.classList.add('hidden');
            }
        } else {
            // Show auth section
            if (userSection) userSection.classList.add('hidden');
            if (authSection) authSection.classList.remove('hidden');
            if (mobileUserSection) mobileUserSection.classList.add('hidden');
            if (mobileAuthSection) mobileAuthSection.classList.remove('hidden');
        }
    },

    // Update cart count
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const cart = NM.getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    },

    // Logout functionality
    logout() {
        NM.logoutUser();
        this.updateUserInfo();
        this.updateCartCount();
        
        // Redirect to home page
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    },

    // Set active navigation link
    setActiveLink(pageName) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').includes(pageName)) {
                link.classList.add('active');
            }
        });
    }
};

// Auto-initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Header.init();
});

// Export for use in other files
window.Header = Header;

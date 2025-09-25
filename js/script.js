// Core functionality for the salon app
class UnlockStyleApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCartBadge();
        this.applySavedTheme();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation active states
        this.setupNavigation();
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = 'fas fa-sun';
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    loadCartBadge() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cart.length;
            badge.style.display = cart.length > 0 ? 'flex' : 'none';
        }
    }

    addToCart(serviceName, price) {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        cart.push({
            id: Date.now(),
            name: serviceName,
            price: price,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('salonCart', JSON.stringify(cart));
        this.loadCartBadge();
        this.showToast(`✅ ${serviceName} added to cart`);
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UnlockStyleApp();
});

// Global functions
function openBookingModal() {
    // Will be implemented in modal component
    window.app.showToast('📅 Booking modal will open here');
}

function addToCart(serviceName, price) {
    window.app.addToCart(serviceName, price);
}


// Existing code ke end mein yeh add karo
class UnlockStyleApp {
    // ... existing code ...

    updateAllCartBadges() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badges = document.querySelectorAll('.nav-badge, #cartBadge, #headerCartBadge');
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = cart.length > 0 ? 'flex' : 'none';
            }
        });
    }

    // ... existing code ...
}

// Global function for adding to cart
function addToCart(serviceName, price) {
    if (window.servicesPage) {
        window.servicesPage.addToCartDirect(serviceName, price);
    } else {
        // Fallback for pages without servicesPage
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        cart.push({
            id: Date.now(),
            name: serviceName,
            price: price,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('salonCart', JSON.stringify(cart));
        window.app.updateAllCartBadges();
        window.app.showToast(`✅ ${serviceName} added to cart`);
    }
}



// Cart     ........................

// Existing code ke end mein yeh add karo
class UnlockStyleApp {
    // ... existing code ...

    updateAllCartBadges() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badges = document.querySelectorAll('.nav-badge, #cartBadge, #headerCartBadge');
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = cart.length > 0 ? 'flex' : 'none';
            }
        });
    }

    // ... existing code ...
}

// Global function for navigation
function navigateTo(page) {
    window.location.href = page;
}





// Existing code ke end mein yeh add karo
class UnlockStyleApp {
    // ... existing code ...

    updateAllCartBadges() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badges = document.querySelectorAll('.nav-badge, #cartBadge, #headerCartBadge');
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = cart.length > 0 ? 'flex' : 'none';
            }
        });
    }

    // ... existing code ...
}



//.................................




// Existing code ke end mein yeh add karo
class UnlockStyleApp {
    // ... existing code ...

    updateAllCartBadges() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badges = document.querySelectorAll('.nav-badge, #cartBadge, #headerCartBadge');
        badges.forEach(badge => {
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = cart.length > 0 ? 'flex' : 'none';
            }
        });
    }

    // ... existing code ...
}

// Global utility functions
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}
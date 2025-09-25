// Services data
const SERVICES_DATA = [
    {
        id: 1,
        name: "Classic Haircut",
        price: 199,
        duration: "30 min",
        category: "hair",
        icon: "fas fa-cut",
        description: "Professional haircut with modern styling and finishing",
        features: ["Modern styling", "Hair wash", "Professional finish", "Style consultation"]
    },
    {
        id: 2,
        name: "Premium Haircut",
        price: 299,
        duration: "45 min",
        category: "hair",
        icon: "fas fa-crown",
        description: "Premium haircut with extra care and styling",
        features: ["Premium products", "Scalp massage", "Style consultation", "Hair care tips"]
    },
    {
        id: 3,
        name: "Beard Trim",
        price: 149,
        duration: "20 min",
        category: "beard",
        icon: "fas fa-user",
        description: "Precision beard shaping and trimming",
        features: ["Precision trim", "Shape design", "Hot towel", "Beard oil"]
    },
    {
        id: 4,
        name: "Royal Beard Styling",
        price: 249,
        duration: "30 min",
        category: "beard",
        icon: "fas fa-gem",
        description: "Luxurious beard styling with premium products",
        features: ["Design consultation", "Premium products", "Hot towel", "Beard massage"]
    },
    {
        id: 5,
        name: "Straight Razor Shave",
        price: 299,
        duration: "25 min",
        category: "beard",
        icon: "fas fa-cut",
        description: "Traditional straight razor shave with hot towel",
        features: ["Hot towel", "Straight razor", "After shave", "Skin care"]
    },
    {
        id: 6,
        name: "Men's Facial",
        price: 599,
        duration: "45 min",
        category: "spa",
        icon: "fas fa-spa",
        description: "Deep cleansing facial for men's skin",
        features: ["Deep cleansing", "Exfoliation", "Moisturizing", "Relaxation"]
    },
    {
        id: 7,
        name: "Head Massage",
        price: 349,
        duration: "30 min",
        category: "spa",
        icon: "fas fa-hand-holding-heart",
        description: "Relaxing head and shoulder massage",
        features: ["Stress relief", "Improved circulation", "Relaxation", "Aromatherapy"]
    },
    {
        id: 8,
        name: "Hair Coloring",
        price: 799,
        duration: "60 min",
        category: "hair",
        icon: "fas fa-palette",
        description: "Professional hair coloring services",
        features: ["Color consultation", "Premium color", "Damage protection", "Style finish"]
    }
];

class ServicesPage {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.renderServices();
        this.setupFilter();
        this.setupAddToCart();
    }

    renderServices() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        const filteredServices = this.currentFilter === 'all' 
            ? SERVICES_DATA 
            : SERVICES_DATA.filter(service => service.category === this.currentFilter);

        grid.innerHTML = filteredServices.map(service => `
            <div class="service-card-enhanced" data-category="${service.category}">
                <div class="service-header">
                    <i class="${service.icon}"></i>
                    <span class="service-duration">${service.duration}</span>
                </div>
                <div class="service-body">
                    <div class="service-title">
                        <span>${service.name}</span>
                        <span class="service-price">₹${service.price}</span>
                    </div>
                    <p class="service-description">${service.description}</p>
                    <ul class="service-features">
                        ${service.features.map(feature => `
                            <li><i class="fas fa-check"></i>${feature}</li>
                        `).join('')}
                    </ul>
                    <div class="service-actions">
                        <button class="btn-quick-add" onclick="servicesPage.addToCart(${service.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-details" onclick="servicesPage.showServiceDetails(${service.id})">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderServices();
            });
        });
    }

    setupAddToCart() {
        // Event delegation for add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-quick-add')) {
                const serviceCard = e.target.closest('.service-card-enhanced');
                const serviceName = serviceCard.querySelector('.service-title span').textContent;
                const servicePrice = serviceCard.querySelector('.service-price').textContent.replace('₹', '');
                this.addToCartDirect(serviceName, parseInt(servicePrice));
            }
        });
    }

    addToCart(serviceId) {
        const service = SERVICES_DATA.find(s => s.id === serviceId);
        if (service) {
            this.addToCartDirect(service.name, service.price);
        }
    }

    addToCartDirect(serviceName, price) {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        cart.push({
            id: Date.now(),
            name: serviceName,
            price: price,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('salonCart', JSON.stringify(cart));
        this.updateCartBadges();
        this.showToast(`✅ ${serviceName} added to cart`);
        
        // Add animation effect
        this.animateAddToCart();
    }

    animateAddToCart() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.style.transform = 'translateX(-50%) scale(1.1)';
            setTimeout(() => {
                toast.style.transform = 'translateX(-50%) scale(1)';
            }, 300);
        }
    }

    updateCartBadges() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badges = document.querySelectorAll('.nav-badge, #headerCartBadge');
        badges.forEach(badge => {
            badge.textContent = cart.length;
            badge.style.display = cart.length > 0 ? 'flex' : 'none';
        });
    }

    showServiceDetails(serviceId) {
        const service = SERVICES_DATA.find(s => s.id === serviceId);
        if (service) {
            this.showToast(`ℹ️ ${service.name} - ${service.description}`);
        }
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

// Initialize services page
document.addEventListener('DOMContentLoaded', () => {
    window.servicesPage = new ServicesPage();
    window.servicesPage.updateCartBadges();
});
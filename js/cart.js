class CartPage {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.setMinDate();
    }

    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        this.renderCart();
        this.updateCartSummary();
        this.toggleSections();
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.innerHTML = '';
            return;
        }

        emptyCart.style.display = 'none';
        
        cartItems.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item-card" id="cartItem-${index}">
                <div class="item-icon">
                    <i class="fas fa-cut"></i>
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₹${item.price}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-remove" onclick="cartPage.removeItem(${index})" 
                            title="Remove service">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateHeaderCart();
    }

    removeItem(index) {
        const item = this.cart[index];
        const cartItem = document.getElementById(`cartItem-${index}`);
        
        if (cartItem) {
            cartItem.classList.add('removing');
            
            setTimeout(() => {
                this.cart.splice(index, 1);
                localStorage.setItem('salonCart', JSON.stringify(this.cart));
                this.renderCart();
                this.updateCartSummary();
                this.showToast(`❌ ${item.name} removed from cart`);
            }, 300);
        }
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + parseInt(item.price), 0);
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        document.getElementById('subtotalAmount').textContent = `₹${subtotal}`;
        document.getElementById('taxAmount').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('bookingTotal').textContent = `₹${total.toFixed(2)}`;
    }

    updateHeaderCart() {
        document.getElementById('headerCartCount').textContent = 
            `${this.cart.length} ${this.cart.length === 1 ? 'item' : 'items'}`;
        
        // Update all cart badges in the app
        if (window.app) {
            window.app.updateAllCartBadges();
        }
    }

    toggleSections() {
        const cartSummary = document.getElementById('cartSummary');
        const bookingSection = document.getElementById('bookingSection');
        
        if (this.cart.length > 0) {
            cartSummary.style.display = 'block';
            bookingSection.style.display = 'block';
        } else {
            cartSummary.style.display = 'none';
            bookingSection.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Clear cart button
        document.getElementById('clearCartBtn').addEventListener('click', () => {
            if (this.cart.length === 0) return;
            
            if (confirm('Are you sure you want to clear your cart?')) {
                this.cart = [];
                localStorage.setItem('salonCart', JSON.stringify(this.cart));
                this.renderCart();
                this.updateCartSummary();
                this.showToast('🗑️ Cart cleared successfully');
            }
        });

        // Booking form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking();
        });

        // Real-time form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const phoneInput = document.getElementById('customerPhone');
        const dateInput = document.getElementById('bookingDate');
        
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });

        dateInput.addEventListener('change', (e) => {
            this.validateDate(e.target);
        });
    }

    validateDate(dateInput) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.showToast('⚠️ Please select a future date');
            dateInput.value = '';
        }
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').setAttribute('min', today);
    }

    handleBooking() {
        if (this.cart.length === 0) {
            this.showToast('⚠️ Please add services to your cart first');
            return;
        }

        const formData = {
            name: document.getElementById('customerName').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            instructions: document.getElementById('specialInstructions').value.trim(),
            services: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + parseInt(item.price), 0) * 1.18
        };

        // Basic validation
        if (!this.validateForm(formData)) {
            return;
        }

        // Save booking
        this.saveBooking(formData);
    }

    validateForm(formData) {
        if (!formData.name) {
            this.showToast('⚠️ Please enter your name');
            return false;
        }

        if (!formData.phone || formData.phone.length !== 10) {
            this.showToast('⚠️ Please enter a valid 10-digit phone number');
            return false;
        }

        if (!formData.date || !formData.time) {
            this.showToast('⚠️ Please select date and time');
            return false;
        }

        return true;
    }

    saveBooking(bookingData) {
        const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
        const newBooking = {
            id: 'BK' + Date.now(),
            ...bookingData,
            status: 'confirmed',
            bookingDate: new Date().toISOString(),
            timestamp: Date.now()
        };

        bookings.push(newBooking);
        localStorage.setItem('salonBookings', JSON.stringify(bookings));

        // Clear cart after successful booking
        this.cart = [];
        localStorage.setItem('salonCart', JSON.stringify(this.cart));

        // Show success modal
        this.showSuccessModal(newBooking);
    }

    showSuccessModal(booking) {
        const modal = document.getElementById('successModal');
        const details = document.getElementById('bookingDetails');
        
        details.innerHTML = `
            <h4>Booking Details</h4>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Total:</strong> ₹${booking.total.toFixed(2)}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
        `;

        modal.classList.add('active');
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
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

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    window.cartPage = new CartPage();
});
class BookingsPage {
    constructor() {
        this.bookings = [];
        this.currentFilter = 'all';
        this.cancelBookingId = null;
        this.init();
    }

    init() {
        this.loadBookings();
        this.setupEventListeners();
        this.setupModalListeners();
    }

    loadBookings() {
        this.bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
        this.renderBookings();
        this.updateStats();
        this.updateCartBadge();
    }

    renderBookings() {
        const container = document.getElementById('bookingsContainer');
        const emptyState = document.getElementById('emptyBookings');
        
        const filteredBookings = this.getFilteredBookings();

        if (filteredBookings.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        emptyState.style.display = 'none';
        
        container.innerHTML = filteredBookings.map(booking => this.createBookingCard(booking)).join('');
    }

    getFilteredBookings() {
        const now = new Date();
        
        switch (this.currentFilter) {
            case 'upcoming':
                return this.bookings.filter(booking => 
                    booking.status === 'confirmed' && 
                    new Date(booking.date + 'T' + booking.time) > now
                );
            case 'completed':
                return this.bookings.filter(booking => 
                    booking.status === 'completed' ||
                    (booking.status === 'confirmed' && new Date(booking.date + 'T' + booking.time) < now)
                );
            case 'cancelled':
                return this.bookings.filter(booking => booking.status === 'cancelled');
            default:
                return this.bookings;
        }
    }

    createBookingCard(booking) {
        const bookingDate = new Date(booking.date + 'T' + booking.time);
        const now = new Date();
        const isUpcoming = booking.status === 'confirmed' && bookingDate > now;
        const isPast = booking.status === 'confirmed' && bookingDate < now;
        const status = isPast ? 'completed' : booking.status;
        
        const statusConfig = {
            'confirmed': { class: 'upcoming', label: 'Upcoming', icon: 'clock' },
            'upcoming': { class: 'upcoming', label: 'Upcoming', icon: 'clock' },
            'completed': { class: 'completed', label: 'Completed', icon: 'check' },
            'cancelled': { class: 'cancelled', label: 'Cancelled', icon: 'times' }
        };

        const config = statusConfig[status] || statusConfig.confirmed;

        return `
            <div class="booking-card ${config.class}" data-booking-id="${booking.id}">
                <div class="booking-header">
                    <div>
                        <div class="booking-id">Booking #${booking.id}</div>
                        <div class="booking-title">${booking.name}</div>
                    </div>
                    <span class="booking-status status-${config.class}">
                        <i class="fas fa-${config.icon}"></i> ${config.label}
                    </span>
                </div>

                <div class="booking-details">
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="detail-content">
                            <h4>Date</h4>
                            <p>${this.formatDate(booking.date)}</p>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="detail-content">
                            <h4>Time</h4>
                            <p>${this.formatTime(booking.time)}</p>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-indian-rupee-sign"></i>
                        </div>
                        <div class="detail-content">
                            <h4>Amount</h4>
                            <p>₹${parseFloat(booking.total || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div class="booking-services">
                    <div class="services-title">Services Booked</div>
                    <div class="service-list">
                        ${booking.services ? booking.services.slice(0, 3).map(service => `
                            <span class="service-tag">${service.name}</span>
                        `).join('') : '<span class="service-tag">No services</span>'}
                        ${booking.services && booking.services.length > 3 ? 
                            `<span class="service-tag">+${booking.services.length - 3} more</span>` : ''}
                    </div>
                </div>

                <div class="booking-actions">
                    <button class="btn-action btn-view" onclick="bookingsPage.viewBooking('${booking.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    
                    ${isUpcoming ? `
                        <button class="btn-action btn-cancel" onclick="bookingsPage.openCancelModal('${booking.id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                    
                    ${status === 'completed' || status === 'cancelled' ? `
                        <button class="btn-action btn-rebook" onclick="bookingsPage.rebook('${booking.id}')">
                            <i class="fas fa-redo"></i> Rebook
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }

    formatTime(timeString) {
        return new Date('2000-01-01T' + timeString).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    updateStats() {
        const upcoming = this.bookings.filter(booking => 
            booking.status === 'confirmed' && 
            new Date(booking.date + 'T' + booking.time) > new Date()
        ).length;
        
        const completed = this.bookings.filter(booking => 
            booking.status === 'completed' ||
            (booking.status === 'confirmed' && new Date(booking.date + 'T' + booking.time) < new Date())
        ).length;

        document.getElementById('upcomingCount').textContent = upcoming;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('totalCount').textContent = this.bookings.length;
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.renderBookings();
            });
        });

        // Refresh button
        document.getElementById('refreshBookings').addEventListener('click', () => {
            this.refreshBookings();
        });
    }

    setupModalListeners() {
        // Close modals when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Cancel confirmation
        document.getElementById('confirmCancelBtn').addEventListener('click', () => {
            this.confirmCancel();
        });
    }

    refreshBookings() {
        const refreshBtn = document.getElementById('refreshBookings');
        refreshBtn.classList.add('loading');
        
        setTimeout(() => {
            this.loadBookings();
            refreshBtn.classList.remove('loading');
            this.showToast('✅ Bookings refreshed');
        }, 1000);
    }

    viewBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const modal = document.getElementById('bookingDetailsModal');
        const content = document.getElementById('bookingDetailContent');
        
        content.innerHTML = this.createBookingDetailView(booking);
        modal.classList.add('active');
    }

    createBookingDetailView(booking) {
        const bookingDate = new Date(booking.date + 'T' + booking.time);
        const isUpcoming = booking.status === 'confirmed' && bookingDate > new Date();
        
        return `
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Booking Information</h4>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">Booking ID</span>
                        <span class="detail-value">${booking.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="booking-status status-${booking.status}">
                                ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Booking Date</span>
                        <span class="detail-value">${this.formatDate(booking.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Booking Time</span>
                        <span class="detail-value">${this.formatTime(booking.time)}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-user"></i> Customer Details</h4>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">${booking.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${booking.phone}</span>
                    </div>
                    ${booking.email ? `
                    <div class="detail-row">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${booking.email}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-cut"></i> Services</h4>
                ${booking.services ? booking.services.map(service => `
                    <div class="service-detail-item">
                        <span class="service-name">${service.name}</span>
                        <span class="service-price">₹${service.price}</span>
                    </div>
                `).join('') : '<p>No services information available</p>'}
                
                <div class="detail-row" style="margin-top: 15px; border-top: 2px solid var(--phonepepurple-light);">
                    <span class="detail-label" style="font-weight: 700;">Total Amount</span>
                    <span class="detail-value" style="font-size: 1.2rem; color: var(--phonepepurple-primary);">
                        ₹${parseFloat(booking.total || 0).toFixed(2)}
                    </span>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-credit-card"></i> Payment Information</h4>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">${booking.payment === 'upi' ? 'UPI Payment' : 'Pay at Salon'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Status</span>
                        <span class="detail-value">
                            <span style="color: ${booking.payment === 'cash' ? '#ffa726' : '#4caf50'}">
                                ${booking.payment === 'cash' ? 'Pending' : 'Paid'}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            ${booking.instructions ? `
            <div class="detail-section">
                <h4><i class="fas fa-sticky-note"></i> Special Instructions</h4>
                <p style="background: var(--phonepepurple-light); padding: 15px; border-radius: var(--radius-small);">
                    ${booking.instructions}
                </p>
            </div>
            ` : ''}

            ${isUpcoming ? `
            <div class="booking-actions" style="margin-top: 25px;">
                <button class="btn-action btn-cancel" onclick="bookingsPage.openCancelModal('${booking.id}')" style="flex: 1;">
                    <i class="fas fa-times"></i> Cancel Booking
                </button>
            </div>
            ` : ''}
        `;
    }

    openCancelModal(bookingId) {
        this.cancelBookingId = bookingId;
        document.getElementById('cancelModal').classList.add('active');
    }

    closeCancelModal() {
        this.cancelBookingId = null;
        document.getElementById('cancelModal').classList.remove('active');
    }

    confirmCancel() {
        if (!this.cancelBookingId) return;

        const bookingIndex = this.bookings.findIndex(b => b.id === this.cancelBookingId);
        if (bookingIndex === -1) return;

        this.bookings[bookingIndex].status = 'cancelled';
        this.bookings[bookingIndex].cancelledAt = new Date().toISOString();
        
        localStorage.setItem('salonBookings', JSON.stringify(this.bookings));
        
        this.closeCancelModal();
        this.loadBookings();
        this.showToast('✅ Booking cancelled successfully');
    }

    rebook(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking || !booking.services) return;

        // Add services to cart
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        booking.services.forEach(service => {
            cart.push({
                id: Date.now() + Math.random(),
                name: service.name,
                price: service.price,
                timestamp: new Date().toISOString()
            });
        });

        localStorage.setItem('salonCart', JSON.stringify(cart));
        this.updateCartBadge();
        
        // Redirect to cart
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1000);
        
        this.showToast('✅ Services added to cart for rebooking');
    }

    closeModal() {
        document.getElementById('bookingDetailsModal').classList.remove('active');
    }

    updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('salonCart')) || [];
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cart.length;
            badge.style.display = cart.length > 0 ? 'flex' : 'none';
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

// Initialize bookings page
document.addEventListener('DOMContentLoaded', () => {
    window.bookingsPage = new BookingsPage();
});
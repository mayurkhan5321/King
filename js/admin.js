class AdminApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.customers = JSON.parse(localStorage.getItem('salonCustomers')) || [];
        this.staff = JSON.parse(localStorage.getItem('salonStaff')) || this.getDefaultStaff();
        this.notifications = JSON.parse(localStorage.getItem('salonNotifications')) || [];
        this.currentPageIndex = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    getDefaultStaff() {
        return [
            { id: 1, name: "Raj Sharma", role: "Senior Stylist", phone: "9876543210", email: "raj@unlockstyle.com", specialty: "Hair Coloring", bookings: 45, rating: 4.8, status: "active" },
            { id: 2, name: "Amit Patel", role: "Barber", phone: "9876543211", email: "amit@unlockstyle.com", specialty: "Beard Styling", bookings: 38, rating: 4.7, status: "active" },
            { id: 3, name: "Suresh Kumar", role: "Stylist", phone: "9876543212", email: "suresh@unlockstyle.com", specialty: "Haircuts", bookings: 32, rating: 4.6, status: "active" }
        ];
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupCharts();
        this.initializeServiceWorker();
    }

    // Existing methods remain the same until we add new functionality...

    // ANALYTICS METHODS
    loadAnalyticsData() {
        const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
        const services = JSON.parse(localStorage.getItem('salonServices')) || [];
        
        // Update stats with count-up animation
        this.animateValue('totalServices', 0, services.length, 1000);
        this.animateValue('totalCustomers', 0, this.customers.length, 1000);
        this.animateValue('totalStaff', 0, this.staff.length, 1000);
        this.animateValue('totalBookings', 0, bookings.length, 1000);
        
        const upcoming = bookings.filter(b => 
            new Date(b.date) >= new Date() && b.status === 'confirmed'
        ).length;
        this.animateValue('upcomingAppointments', 0, upcoming, 1000);
        
        const revenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total) || 0), 0);
        document.getElementById('estimatedRevenue').textContent = `₹${revenue.toLocaleString()}`;
    }

    animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    setupAnalyticsCharts() {
        const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
        const services = JSON.parse(localStorage.getItem('salonServices')) || [];
        
        // Services Popularity Chart
        const servicesCtx = document.getElementById('servicesChart').getContext('2d');
        new Chart(servicesCtx, {
            type: 'pie',
            data: {
                labels: services.map(s => s.name),
                datasets: [{
                    data: services.map(s => Math.floor(Math.random() * 50) + 10), // Mock data
                    backgroundColor: ['#6c1dc9', '#8d2de2', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Bookings Trend Chart
        const bookingsCtx = document.getElementById('bookingsChart').getContext('2d');
        new Chart(bookingsCtx, {
            type: 'line',
            data: {
                labels: this.getLast30Days(),
                datasets: [{
                    label: 'Daily Bookings',
                    data: this.generateBookingData(),
                    borderColor: '#6c1dc9',
                    backgroundColor: 'rgba(108, 29, 201, 0.1)',
                    tension: 0.4
                }]
            }
        });

        // Staff Workload Chart
        const staffCtx = document.getElementById('staffWorkloadChart').getContext('2d');
        new Chart(staffCtx, {
            type: 'bar',
            data: {
                labels: this.staff.map(s => s.name),
                datasets: [{
                    label: 'Assigned Bookings',
                    data: this.staff.map(s => s.bookings),
                    backgroundColor: '#6c1dc9'
                }]
            }
        });
    }

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        }
        return days;
    }

    generateBookingData() {
        return Array.from({length: 30}, () => Math.floor(Math.random() * 10) + 1);
    }

    // CUSTOMER MANAGEMENT METHODS
    loadCustomers() {
        this.customers = JSON.parse(localStorage.getItem('salonCustomers')) || this.generateCustomerData();
        this.renderCustomersTable();
    }

    generateCustomerData() {
        const names = ['Aarav Sharma', 'Vikram Singh', 'Rahul Mehta', 'Priya Patel', 'Anjali Kumar', 'Sandeep Joshi'];
        return names.map((name, index) => ({
            id: index + 1,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
            phone: `98765${10000 + index}`,
            bookings: Math.floor(Math.random() * 10) + 1,
            lastVisit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            status: 'active'
        }));
    }

    renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        const startIndex = (this.currentPageIndex - 1) * this.itemsPerPage;
        const paginatedCustomers = this.customers.slice(startIndex, startIndex + this.itemsPerPage);

        tbody.innerHTML = paginatedCustomers.map(customer => `
            <tr onclick="adminApp.showCustomerDetails(${customer.id})">
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.bookings}</td>
                <td>${customer.lastVisit}</td>
                <td><span class="status-badge ${customer.status}">${customer.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="event.stopPropagation(); adminApp.editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); adminApp.deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    showCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        document.getElementById('modalCustomerName').textContent = customer.name;
        document.getElementById('modalCustomerEmail').textContent = customer.email;
        document.getElementById('modalCustomerPhone').textContent = customer.phone;
        document.getElementById('modalCustomerBookings').textContent = customer.bookings;
        document.getElementById('modalCustomerSince').textContent = customer.lastVisit;

        // Load booking history
        const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
        const customerBookings = bookings.filter(b => b.phone === customer.phone);
        
        document.getElementById('bookingHistoryList').innerHTML = customerBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-service">${booking.service}</div>
                <div class="booking-date">${booking.date} at ${booking.time}</div>
                <div class="booking-status ${booking.status}">${booking.status}</div>
            </div>
        `).join('') || '<p>No booking history found.</p>';

        this.openModal('customerModal');
    }

    searchCustomers() {
        const query = document.getElementById('customerSearch').value.toLowerCase();
        const filtered = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.phone.includes(query)
        );
        this.renderFilteredCustomers(filtered);
    }

    filterCustomers() {
        const statusFilter = document.getElementById('statusFilter').value;
        const bookingFilter = document.getElementById('bookingFilter').value;
        
        let filtered = this.customers;
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }
        
        if (bookingFilter === 'regular') {
            filtered = filtered.filter(c => c.bookings >= 3);
        } else if (bookingFilter === 'new') {
            filtered = filtered.filter(c => c.bookings === 1);
        }
        
        this.renderFilteredCustomers(filtered);
    }

    renderFilteredCustomers(filteredCustomers) {
        const tbody = document.getElementById('customersTableBody');
        tbody.innerHTML = filteredCustomers.map(customer => `
            <tr onclick="adminApp.showCustomerDetails(${customer.id})">
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.bookings}</td>
                <td>${customer.lastVisit}</td>
                <td><span class="status-badge ${customer.status}">${customer.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="event.stopPropagation(); adminApp.editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); adminApp.deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    exportCustomerData() {
        const csv = this.convertToCSV(this.customers);
        this.downloadCSV(csv, 'customers.csv');
        this.showToast('Customer data exported successfully', 'success');
    }

    // STAFF MANAGEMENT METHODS
    loadStaff() {
        this.staff = JSON.parse(localStorage.getItem('salonStaff')) || this.getDefaultStaff();
        this.renderStaffTable();
        this.updateStaffStats();
    }

    renderStaffTable() {
        const tbody = document.getElementById('staffTableBody');
        tbody.innerHTML = this.staff.map(staff => `
            <tr>
                <td>${staff.name}</td>
                <td><span class="role-badge ${staff.role}">${staff.role}</span></td>
                <td>${staff.phone}</td>
                <td>${staff.email}</td>
                <td>${staff.bookings}</td>
                <td>
                    <span class="rating">
                        ${staff.rating} <i class="fas fa-star"></i>
                    </span>
                </td>
                <td><span class="status-badge ${staff.status}">${staff.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="adminApp.editStaff(${staff.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="adminApp.deleteStaff(${staff.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openStaffModal(staffId = null) {
        const modal = document.getElementById('staffModal');
        const form = document.getElementById('staffForm');
        
        if (staffId) {
            const staff = this.staff.find(s => s.id === staffId);
            document.getElementById('staffModalTitle').textContent = 'Edit Staff Member';
            document.getElementById('staffId').value = staff.id;
            document.getElementById('staffName').value = staff.name;
            document.getElementById('staffRole').value = staff.role;
            document.getElementById('staffPhone').value = staff.phone;
            document.getElementById('staffEmail').value = staff.email;
            document.getElementById('staffSpecialty').value = staff.specialty || '';
        } else {
            form.reset();
            document.getElementById('staffModalTitle').textContent = 'Add Staff Member';
        }
        
        this.openModal('staffModal');
    }

    saveStaff(event) {
        event.preventDefault();
        
        const staffData = {
            id: document.getElementById('staffId').value || Date.now(),
            name: document.getElementById('staffName').value,
            role: document.getElementById('staffRole').value,
            phone: document.getElementById('staffPhone').value,
            email: document.getElementById('staffEmail').value,
            specialty: document.getElementById('staffSpecialty').value,
            bookings: 0,
            rating: 4.5,
            status: 'active'
        };

        const existingIndex = this.staff.findIndex(s => s.id == staffData.id);
        if (existingIndex >= 0) {
            this.staff[existingIndex] = { ...this.staff[existingIndex], ...staffData };
        } else {
            this.staff.push(staffData);
        }

        localStorage.setItem('salonStaff', JSON.stringify(this.staff));
        this.renderStaffTable();
        this.closeModal('staffModal');
        this.showToast('Staff member saved successfully', 'success');
    }

    exportStaffData() {
        const csv = this.convertToCSV(this.staff);
        this.downloadCSV(csv, 'staff.csv');
        this.showToast('Staff data exported successfully', 'success');
    }

    // NOTIFICATION METHODS
    sendNotification(event) {
        if (event) event.preventDefault();
        
        const notification = {
            id: Date.now(),
            title: document.getElementById('notificationTitle').value,
            message: document.getElementById('notificationMessage').value,
            type: document.getElementById('notificationType').value,
            audience: document.getElementById('notificationAudience').value,
            timestamp: new Date().toISOString(),
            sent: false
        };

        this.notifications.unshift(notification);
        localStorage.setItem('salonNotifications', JSON.stringify(this.notifications));

        // Send push notification
        this.sendPushNotification(notification);
        
        this.showToast('Notification sent successfully', 'success');
        document.getElementById('notificationForm').reset();
    }

    async sendPushNotification(notification) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            
            await registration.showNotification(notification.title, {
                body: notification.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: notification.type,
                data: { url: window.location.origin },
                actions: [
                    { action: 'view', title: 'View Details' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            });

            notification.sent = true;
            localStorage.setItem('salonNotifications', JSON.stringify(this.notifications));
        }
    }

    loadNotificationHistory() {
        const historyContainer = document.getElementById('notificationHistory');
        historyContainer.innerHTML = this.notifications.map(notif => `
            <div class="history-item">
                <div class="history-type ${notif.type}">${notif.type}</div>
                <div class="history-content">
                    <div class="history-title">${notif.title}</div>
                    <div class="history-message">${notif.message}</div>
                    <div class="history-meta">
                        <span>${new Date(notif.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>${notif.audience}</span>
                        <span>•</span>
                        <span class="status ${notif.sent ? 'sent' : 'failed'}">
                            ${notif.sent ? 'Sent' : 'Failed'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    previewNotification() {
        document.getElementById('previewTitle').textContent = 
            document.getElementById('notificationTitle').value || 'Notification Title';
        document.getElementById('previewMessage').textContent = 
            document.getElementById('notificationMessage').value || 'Notification message content will appear here.';
        document.getElementById('previewType').textContent = 
            document.getElementById('notificationType').value;
        
        this.openModal('previewModal');
    }

    // UTILITY METHODS
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
        ].join('\n');
        return csv;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    updatePagination() {
        document.getElementById('currentPage').textContent = this.currentPageIndex;
        document.getElementById('totalPages').textContent = 
            Math.ceil(this.customers.length / this.itemsPerPage);
    }

    nextPage() {
        const totalPages = Math.ceil(this.customers.length / this.itemsPerPage);
        if (this.currentPageIndex < totalPages) {
            this.currentPageIndex++;
            this.renderCustomersTable();
        }
    }

    prevPage() {
        if (this.currentPageIndex > 1) {
            this.currentPageIndex--;
            this.renderCustomersTable();
        }
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
    }

    // ... (rest of existing methods remain the same)
}

// Initialize admin app
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#themeToggleBtn i');
        if (icon) icon.className = 'fas fa-sun';
    }
});

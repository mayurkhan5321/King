// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupPasswordStrength();
    }

    checkAuthentication() {
        // Check if user is logged in
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            
            // Redirect from auth pages if already logged in
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('signup.html')) {
                window.location.href = 'profile.html';
            }
        } else {
            // Redirect to login if trying to access protected pages
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });

            // Real-time validation
            this.setupRealTimeValidation();
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    setupRealTimeValidation() {
        const passwordInput = document.getElementById('signupPassword');
        const confirmInput = document.getElementById('confirmPassword');
        const phoneInput = document.getElementById('signupPhone');

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
                this.validatePasswordMatch();
            });
        }

        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                this.validatePhoneNumber(e.target.value);
            });
        }
    }

    setupPasswordStrength() {
        // Already handled in real-time validation
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'Weak';
        let className = 'weak';

        // Check password length
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // Check for character variety
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // Determine strength level
        if (strength >= 5) {
            text = 'Strong';
            className = 'strong';
        } else if (strength >= 3) {
            text = 'Medium';
            className = 'medium';
        }

        strengthBar.className = `strength-fill ${className}`;
        strengthText.textContent = text;
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword')?.value;
        const confirm = document.getElementById('confirmPassword')?.value;
        const errorElement = document.getElementById('confirmError');

        if (!errorElement) return;

        if (confirm && password !== confirm) {
            this.showError('confirmError', 'Passwords do not match');
        } else {
            this.hideError('confirmError');
        }
    }

    validatePhoneNumber(phone) {
        const errorElement = document.getElementById('phoneError');
        
        if (!errorElement) return;

        if (phone && phone.length !== 10) {
            this.showError('phoneError', 'Phone number must be 10 digits');
        } else {
            this.hideError('phoneError');
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showError('emailError', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            this.showError('passwordError', 'Please enter your password');
            return;
        }

        // Show loading state
        this.setButtonLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.currentUser = user;
                
                // Store session
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', email);
                }

                this.showToast('✅ Login successful!', 'success');
                
                // Redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);

            } else {
                this.showError('passwordError', 'Invalid email or password');
                this.showToast('❌ Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            this.showToast('❌ An error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(false);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = document.getElementById('signupPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validate all fields
        if (!this.validateSignupForm(name, email, phone, password, agreeTerms)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const success = this.registerUser(name, email, phone, password);
            
            if (success) {
                this.showToast('🎉 Account created successfully!', 'success');
                
                // Redirect to login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showError('signupEmailError', 'Email already exists');
                this.showToast('❌ This email is already registered.', 'error');
            }
        } catch (error) {
            this.showToast('❌ An error occurred. Please try again.', 'error');
        } finally {
            this.setButtonLoading(false);
        }
    }

    validateSignupForm(name, email, phone, password, agreeTerms) {
        let isValid = true;

        // Reset errors
        this.hideAllErrors();

        // Name validation
        if (!name || name.length < 2) {
            this.showError('nameError', 'Please enter your full name');
            isValid = false;
        }

        // Email validation
        if (!this.validateEmail(email)) {
            this.showError('signupEmailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation
        if (!phone || phone.length !== 10) {
            this.showError('phoneError', 'Phone number must be 10 digits');
            isValid = false;
        }

        // Password validation
        if (!password || password.length < 8) {
            this.showError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Terms agreement
        if (!agreeTerms) {
            this.showToast('⚠️ Please agree to the terms and conditions', 'warning');
            isValid = false;
        }

        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('salonUsers')) || [];
        return users.find(user => user.email === email && user.password === this.hashPassword(password));
    }

    registerUser(name, email, phone, password) {
        const users = JSON.parse(localStorage.getItem('salonUsers')) || [];
        
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            return false;
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            phone: phone,
            password: this.hashPassword(password),
            joinedDate: new Date().toISOString(),
            loyaltyPoints: 0,
            bookings: []
        };

        users.push(newUser);
        localStorage.setItem('salonUsers', JSON.stringify(users));
        return true;
    }

    hashPassword(password) {
        // Simple hash for demo (in production, use proper hashing)
        return btoa(password);
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setButtonLoading(loading) {
        const buttons = document.querySelectorAll('.auth-btn');
        buttons.forEach(btn => {
            if (loading) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                btn.disabled = false;
                // Reset button text based on context
                if (btn.closest('#loginForm')) {
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In to Your Account';
                } else if (btn.closest('#signupForm')) {
                    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create My Account';
                }
            }
        });
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('show');
        }
    }

    hideAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = input.parentNode.querySelector('.password-toggle i');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            toggle.className = 'fas fa-eye';
        }
    }

    showForgotPassword() {
        document.getElementById('forgotModal').classList.add('active');
    }

    closeForgotPassword() {
        document.getElementById('forgotModal').classList.remove('active');
    }

    handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        
        if (!this.validateEmail(email)) {
            this.showToast('⚠️ Please enter a valid email address', 'warning');
            return;
        }

        this.showToast('📧 Reset link sent to your email', 'success');
        this.closeForgotPassword();
        
        // Reset form
        document.getElementById('forgotForm').reset();
    }

    socialLogin(provider) {
        this.showToast(`🔐 ${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('currentUser');
            this.currentUser = null;
            this.showToast('👋 Logged out successfully', 'info');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Profile Management
class ProfileManager {
    constructor() {
        this.auth = window.auth;
        this.init();
    }

    init() {
        if (window.location.pathname.includes('profile.html')) {
            this.loadProfileData();
            this.setupEventListeners();
        }
    }

    loadProfileData() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        // Update welcome message
        document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name}! 👋`;
        document.getElementById('memberSince').textContent = new Date(user.joinedDate).getFullYear();

        // Update profile info
        document.getElementById('displayName').textContent = user.name;
        document.getElementById('displayEmail').textContent = user.email;
        document.getElementById('displayPhone').textContent = user.phone;

        // Update form fields
        document.getElementById('editName').value = user.name;
        document.getElementById('editPhone').value = user.phone;

        // Load bookings data
        this.loadBookingsSummary(user);
        this.updateLoyaltyProgress(user);
    }

    loadBookingsSummary(user) {
        const bookings = user.bookings || [];
        const upcoming = bookings.filter(b => b.status === 'confirmed').length;
        const completed = bookings.filter(b => b.status === 'completed').length;

        document.getElementById('upcomingBookings').textContent = upcoming;
        document.getElementById('completedBookings').textContent = completed;
        document.getElementById('totalBookings').textContent = bookings.length;

        // Load recent bookings
        this.loadRecentBookings(bookings);
    }

    loadRecentBookings(bookings) {
        const container = document.getElementById('recentBookings');
        const recentBookings = bookings.slice(-3).reverse();

        if (recentBookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No bookings yet</p>
                    <a href="services.html" class="btn-primary">Book Your First Appointment</a>
                </div>
            `;
            return;
        }

        container.innerHTML = recentBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${booking.services?.map(s => s.name).join(', ') || 'Salon Services'}</h4>
                    <p>${new Date(booking.date).toLocaleDateString()} • ${booking.time}</p>
                </div>
                <span class="booking-status status-${booking.status}">
                    ${booking.status}
                </span>
            </div>
        `).join('');
    }

    updateLoyaltyProgress(user) {
        const completedBookings = user.bookings?.filter(b => b.status === 'completed').length || 0;
        const progress = (completedBookings / 5) * 100;
        
        document.getElementById('loyaltyCount').textContent = `${completedBookings}/5 visits`;
        document.getElementById('loyaltyProgress').style.width = `${Math.min(progress, 100)}%`;
    }

    setupEventListeners() {
        const editForm = document.getElementById('profileEdit');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
    }

    toggleEditMode() {
        const view = document.getElementById('profileView');
        const edit = document.getElementById('profileEdit');
        
        view.style.display = 'none';
        edit.style.display = 'block';
    }

    cancelEdit()
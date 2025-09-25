class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartBadge();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Contact form submission
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm();
        });

        // Phone number formatting
        const phoneInput = document.getElementById('contactPhone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    setupFormValidation() {
        const form = document.getElementById('contactForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        
        switch(field.id) {
            case 'contactName':
                if (!value) {
                    this.showFieldError(field, 'Name is required');
                    return false;
                }
                if (value.length < 2) {
                    this.showFieldError(field, 'Name must be at least 2 characters');
                    return false;
                }
                break;
                
            case 'contactPhone':
                if (!value) {
                    this.showFieldError(field, 'Phone number is required');
                    return false;
                }
                if (value.length !== 10) {
                    this.showFieldError(field, 'Phone number must be 10 digits');
                    return false;
                }
                break;
                
            case 'contactSubject':
                if (!value) {
                    this.showFieldError(field, 'Please select a subject');
                    return false;
                }
                break;
                
            case 'contactMessage':
                if (!value) {
                    this.showFieldError(field, 'Message is required');
                    return false;
                }
                if (value.length < 10) {
                    this.showFieldError(field, 'Message must be at least 10 characters');
                    return false;
                }
                break;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#f44336';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#f44336';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    handleContactForm() {
        const formData = {
            name: document.getElementById('contactName').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            subject: document.getElementById('contactSubject').value,
            message: document.getElementById('contactMessage').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Validate all fields
        let isValid = true;
        const fields = ['contactName', 'contactPhone', 'contactSubject', 'contactMessage'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('⚠️ Please fix the errors in the form');
            return;
        }

        // Save contact message to localStorage
        this.saveContactMessage(formData);
    }

    saveContactMessage(messageData) {
        const contacts = JSON.parse(localStorage.getItem('salonContacts')) || [];
        const newContact = {
            id: 'CT' + Date.now(),
            ...messageData,
            status: 'new',
            read: false
        };

        contacts.push(newContact);
        localStorage.setItem('salonContacts', JSON.stringify(contacts));

        // Show success message
        this.showSuccessMessage();
        
        // Reset form
        document.getElementById('contactForm').reset();
    }

    showSuccessMessage() {
        this.showToast('✅ Message sent successfully! We\'ll get back to you soon.');
        
        // Add celebration effect
        this.celebrate();
    }

    celebrate() {
        const btn = document.querySelector('.btn-submit');
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #66bb6a, #4caf50)';
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            btn.style.background = '';
        }, 2000);
    }

    // Location and Map Functions
    openDirections() {
        const address = "Shop No. 5, Paradise Heights, Andheri West, Mumbai, Maharashtra - 400058";
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
    }

    openGoogleMaps() {
        const address = "Shop No. 5, Paradise Heights, Andheri West, Mumbai, Maharashtra - 400058";
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
    }

    getDirections() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const address = "Shop No. 5, Paradise Heights, Andheri West, Mumbai, Maharashtra - 400058";
                const mapsUrl = `https://www.google.com/maps/dir/${lat},${lng}/${encodeURIComponent(address)}`;
                window.open(mapsUrl, '_blank');
            }, () => {
                this.openDirections(); // Fallback
            });
        } else {
            this.openDirections(); // Fallback
        }
    }

    shareLocation() {
        const shareData = {
            title: 'Unlock Style Men\'s Salon',
            text: 'Visit Unlock Style Men\'s Salon for premium grooming services',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => this.showToast('✅ Location shared successfully'))
                .catch(() => this.showToast('❌ Sharing cancelled'));
        } else {
            this.copyText(window.location.href);
            this.showToast('📋 Link copied to clipboard');
        }
    }

    copyText(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('✅ Copied to clipboard'))
            .catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('✅ Copied to clipboard');
            });
    }

    // FAQ Functions
    toggleFAQ(element) {
        const faqItem = element.parentNode;
        const answer = faqItem.querySelector('.faq-answer');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.querySelector('.faq-question').classList.remove('active');
                item.querySelector('.faq-answer').classList.remove('active');
            }
        });

        // Toggle current FAQ
        element.classList.toggle('active');
        answer.classList.toggle('active');
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

// Initialize contact page
document.addEventListener('DOMContentLoaded', () => {
    window.contactPage = new ContactPage();
});
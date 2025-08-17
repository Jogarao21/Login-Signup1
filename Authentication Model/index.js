        // Network Background Animation
        class NetworkBackground {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.particles = [];
                this.mouse = { x: 0, y: 0 };
                
                this.resize();
                this.init();
                this.animate();
                
                window.addEventListener('resize', () => this.resize());
                canvas.addEventListener('mousemove', (e) => {
                    const rect = canvas.getBoundingClientRect();
                    this.mouse.x = e.clientX - rect.left;
                    this.mouse.y = e.clientY - rect.top;
                });
            }
            
            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.init();
            }
            
            init() {
                this.particles = [];
                const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 12000);
                
                for (let i = 0; i < particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        radius: Math.random() * 1.5 + 0.5,
                        opacity: Math.random() * 0.5 + 0.3
                    });
                }
            }
            
            animate() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Update particles
                this.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = this.canvas.width;
                    if (particle.x > this.canvas.width) particle.x = 0;
                    if (particle.y < 0) particle.y = this.canvas.height;
                    if (particle.y > this.canvas.height) particle.y = 0;
                });
                
                // Draw connections
                this.drawConnections();
                
                // Draw particles
                this.drawParticles();
                
                requestAnimationFrame(() => this.animate());
            }
            
            drawParticles() {
                this.particles.forEach(particle => {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                    this.ctx.fill();
                    
                    // Add subtle glow
                    this.ctx.shadowColor = 'rgba(100, 181, 246, 0.5)';
                    this.ctx.shadowBlur = 4;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                });
            }
            
            drawConnections() {
                const maxDistance = 100;
                
                this.particles.forEach((particle, i) => {
                    this.particles.slice(i + 1).forEach(otherParticle => {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < maxDistance) {
                            const opacity = (1 - distance / maxDistance) * 0.2;
                            this.ctx.beginPath();
                            this.ctx.moveTo(particle.x, particle.y);
                            this.ctx.lineTo(otherParticle.x, otherParticle.y);
                            this.ctx.strokeStyle = `rgba(100, 181, 246, ${opacity})`;
                            this.ctx.lineWidth = 0.5;
                            this.ctx.stroke();
                        }
                    });
                });
            }
        }

        // Auth System
        class AuthSystem {
            constructor() {
                this.currentModal = 'login';
                this.isAnimating = false;
                
                this.initElements();
                this.initEventListeners();
                this.initNetwork();
            }
            
            initElements() {
                this.modalOverlay = document.getElementById('modalOverlay');
                this.loginModal = document.getElementById('loginModal');
                this.signupModal = document.getElementById('signupModal');
                
                this.openLoginBtn = document.getElementById('openLogin');
                this.openSignupBtn = document.getElementById('openSignup');
                
                this.loginForm = document.getElementById('loginForm');
                this.signupForm = document.getElementById('signupForm');
            }
            
            initEventListeners() {
                // Open modal buttons
                this.openLoginBtn?.addEventListener('click', () => this.openModal('login'));
                this.openSignupBtn?.addEventListener('click', () => this.openModal('signup'));
                
                // Close buttons - using event delegation
                document.addEventListener('click', (e) => {
                    if (e.target.hasAttribute('data-close') || e.target.closest('[data-close]')) {
                        this.closeModal();
                    }
                    
                    if (e.target.hasAttribute('data-switch') || e.target.closest('[data-switch]')) {
                        e.preventDefault();
                        const switchTo = e.target.getAttribute('data-switch') || e.target.closest('[data-switch]').getAttribute('data-switch');
                        this.switchModal(switchTo);
                    }
                });
                
                // Close on overlay click
                this.modalOverlay?.addEventListener('click', (e) => {
                    if (e.target === this.modalOverlay) {
                        this.closeModal();
                    }
                });
                
                // Form submissions
                this.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
                this.signupForm?.addEventListener('submit', (e) => this.handleSignup(e));
                
                // Input animations
                document.querySelectorAll('input').forEach(input => {
                    input.addEventListener('focus', (e) => this.handleInputFocus(e.target));
                    input.addEventListener('blur', (e) => this.handleInputBlur(e.target));
                    input.addEventListener('input', (e) => this.handleInputChange(e.target));
                });
                
                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.modalOverlay?.classList.contains('active')) {
                        this.closeModal();
                    }
                });
            }
            
            initNetwork() {
                const canvas = document.getElementById('networkCanvas');
                if (canvas) {
                    this.network = new NetworkBackground(canvas);
                }
            }
            
            openModal(type) {
                if (!this.modalOverlay || !this.loginModal || !this.signupModal) return;
                
                this.currentModal = type;
                this.modalOverlay.classList.add('active');
                
                // Hide both modals first
                this.loginModal.classList.remove('active');
                this.signupModal.classList.remove('active');
                
                // Show the requested modal
                setTimeout(() => {
                    if (type === 'login') {
                        this.loginModal.classList.add('active');
                    } else {
                        this.signupModal.classList.add('active');
                    }
                    
                    // Focus first input
                    setTimeout(() => {
                        const activeModal = type === 'login' ? this.loginModal : this.signupModal;
                        const firstInput = activeModal.querySelector('input');
                        if (firstInput) firstInput.focus();
                    }, 400);
                }, 50);
            }
            
            closeModal() {
                if (!this.modalOverlay) return;
                
                this.modalOverlay.classList.remove('active');
                
                setTimeout(() => {
                    this.loginModal?.classList.remove('active');
                    this.signupModal?.classList.remove('active');
                    
                    // Reset forms
                    this.loginForm?.reset();
                    this.signupForm?.reset();
                    
                    // Remove any error states
                    this.clearAllErrors();
                }, 300);
            }
            
            switchModal(type) {
                if (this.isAnimating || this.currentModal === type || !this.loginModal || !this.signupModal) return;
                
                this.isAnimating = true;
                this.currentModal = type;
                
                if (type === 'login') {
                    this.signupModal.classList.add('slide-right');
                    this.signupModal.classList.remove('active');
                    
                    setTimeout(() => {
                        this.loginModal.classList.add('active');
                        this.loginModal.classList.remove('slide-left');
                        this.isAnimating = false;
                        
                        // Focus first input
                        const firstInput = this.loginModal.querySelector('input');
                        if (firstInput) firstInput.focus();
                    }, 200);
                    
                    setTimeout(() => {
                        this.signupModal.classList.remove('slide-right');
                    }, 400);
                    
                } else {
                    this.loginModal.classList.add('slide-left');
                    this.loginModal.classList.remove('active');
                    
                    setTimeout(() => {
                        this.signupModal.classList.add('active');
                        this.signupModal.classList.remove('slide-right');
                        this.isAnimating = false;
                        
                        // Focus first input
                        const firstInput = this.signupModal.querySelector('input');
                        if (firstInput) firstInput.focus();
                    }, 200);
                    
                    setTimeout(() => {
                        this.loginModal.classList.remove('slide-left');
                    }, 400);
                }
            }
            
            handleLogin(e) {
                e.preventDefault();
                if (!e.target) return;
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                const submitBtn = e.target.querySelector('.submit-btn');
                
                console.log('Login attempt:', data);
                
                if (!this.validateLoginForm(e.target)) {
                    this.showMessage('Please fill in all fields correctly', 'error');
                    return;
                }
                
                this.showLoading(submitBtn);
                
                // Simulate API call
                setTimeout(() => {
                    this.hideLoading(submitBtn);
                    this.showMessage('Login successful! Welcome back!', 'success');
                    console.log('Login successful for:', data.email);
                    
                    setTimeout(() => {
                        this.closeModal();
                    }, 1500);
                }, 2000);
            }
            
            handleSignup(e) {
                e.preventDefault();
                if (!e.target) return;
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                const submitBtn = e.target.querySelector('.submit-btn');
                
                console.log('Signup attempt:', data);
                
                if (!this.validateSignupForm(e.target)) {
                    this.showMessage('Please fill in all fields correctly', 'error');
                    return;
                }
                
                // Check password match
                if (data.password !== data.confirmPassword) {
                    this.showMessage('Passwords do not match', 'error');
                    const confirmInput = e.target.querySelector('input[name="confirmPassword"]');
                    this.highlightError(confirmInput);
                    return;
                }
                
                this.showLoading(submitBtn);
                
                // Simulate API call
                setTimeout(() => {
                    this.hideLoading(submitBtn);
                    this.showMessage('Account created successfully!', 'success');
                    console.log('Signup successful for:', data.email);
                    
                    setTimeout(() => {
                        this.switchModal('login');
                    }, 1500);
                }, 2000);
            }
            
            validateLoginForm(form) {
                if (!form) return false;
                
                const email = form.querySelector('input[name="email"]');
                const password = form.querySelector('input[name="password"]');
                
                let isValid = true;
                
                // Validate email
                if (!email || !email.value.trim()) {
                    this.highlightError(email);
                    isValid = false;
                } else if (!this.isValidEmail(email.value)) {
                    this.highlightError(email);
                    isValid = false;
                } else {
                    this.removeError(email);
                }
                
                // Validate password
                if (!password || !password.value.trim()) {
                    this.highlightError(password);
                    isValid = false;
                } else {
                    this.removeError(password);
                }
                
                return isValid;
            }
            
            validateSignupForm(form) {
                if (!form) return false;
                
                const fullname = form.querySelector('input[name="fullname"]');
                const email = form.querySelector('input[name="email"]');
                const password = form.querySelector('input[name="password"]');
                const confirmPassword = form.querySelector('input[name="confirmPassword"]');
                const terms = form.querySelector('input[name="terms"]');
                
                let isValid = true;
                
                // Validate fullname
                if (!fullname || !fullname.value.trim()) {
                    this.highlightError(fullname);
                    isValid = false;
                } else {
                    this.removeError(fullname);
                }
                
                // Validate email
                if (!email || !email.value.trim()) {
                    this.highlightError(email);
                    isValid = false;
                } else if (!this.isValidEmail(email.value)) {
                    this.highlightError(email);
                    isValid = false;
                } else {
                    this.removeError(email);
                }
                
                // Validate password
                if (!password || !password.value.trim()) {
                    this.highlightError(password);
                    isValid = false;
                } else if (password.value.length < 6) {
                    this.highlightError(password);
                    this.showMessage('Password must be at least 6 characters', 'error');
                    isValid = false;
                } else {
                    this.removeError(password);
                }
                
                // Validate confirm password
                if (!confirmPassword || !confirmPassword.value.trim()) {
                    this.highlightError(confirmPassword);
                    isValid = false;
                } else {
                    this.removeError(confirmPassword);
                }
                
                // Validate terms
                if (!terms || !terms.checked) {
                    this.showMessage('Please accept the Terms & Conditions', 'error');
                    isValid = false;
                }
                
                return isValid;
            }
            
            isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
            
            highlightError(input) {
                if (!input) return;
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.add('error');
                    wrapper.classList.remove('success');
                    
                    setTimeout(() => {
                        wrapper.classList.remove('error');
                    }, 3000);
                }
            }
            
            removeError(input) {
                if (!input) return;
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('error');
                    wrapper.classList.add('success');
                    
                    setTimeout(() => {
                        wrapper.classList.remove('success');
                    }, 1000);
                }
            }
            
            clearAllErrors() {
                document.querySelectorAll('.input-wrapper').forEach(wrapper => {
                    wrapper.classList.remove('error', 'success');
                });
            }
            
            handleInputFocus(input) {
                if (!input) return;
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.style.transform = 'scale(1.02)';
                }
            }
            
            handleInputBlur(input) {
                if (!input) return;
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.style.transform = 'scale(1)';
                }
            }
            
            handleInputChange(input) {
                if (!input) return;
                // Clear error state when user starts typing
                const wrapper = input.closest('.input-wrapper');
                if (wrapper && wrapper.classList.contains('error')) {
                    wrapper.classList.remove('error');
                }
            }
            
            showLoading(btn) {
                if (!btn) return;
                btn.classList.add('loading');
                btn.disabled = true;
            }
            
            hideLoading(btn) {
                if (!btn) return;
                btn.classList.remove('loading');
                btn.disabled = false;
            }
            
            showMessage(text, type) {
                // Remove existing messages
                document.querySelectorAll('.message').forEach(msg => msg.remove());
                
                const message = document.createElement('div');
                message.className = `message ${type}`;
                message.innerHTML = `
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span>${text}</span>
                    <button class="close-msg">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                document.body.appendChild(message);
                
                // Show message
                setTimeout(() => message.classList.add('show'), 100);
                
                // Auto hide
                setTimeout(() => this.hideMessage(message), 4000);
                
                // Close button
                const closeBtn = message.querySelector('.close-msg');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.hideMessage(message);
                    });
                }
            }
            
            hideMessage(message) {
                if (message && message.classList && message.parentElement) {
                    message.classList.remove('show');
                    setTimeout(() => {
                        if (message.parentElement) {
                            message.remove();
                        }
                    }, 400);
                }
            }
        }

        // Particle effect function
        function createParticleEffect(element) {
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                const randomX = (Math.random() - 0.5) * 100;
                const randomY = (Math.random() - 0.5) * 100;
                
                particle.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    --random-x: ${randomX}px;
                    --random-y: ${randomY}px;
                    animation: particleBurst 0.8s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentElement) {
                        particle.remove();
                    }
                }, 800);
            }
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize auth system
            const authSystem = new AuthSystem();
            
            // Add click effects to buttons
            document.addEventListener('click', (e) => {
                if (e.target && (e.target.matches('.submit-btn, .open-btn') || e.target.closest('.submit-btn, .open-btn'))) {
                    const target = e.target.matches('.submit-btn, .open-btn') ? e.target : e.target.closest('.submit-btn, .open-btn');
                    createParticleEffect(target);
                }
            });
            
            // Add some debugging
            console.log('Authentication modal initialized successfully');
        });
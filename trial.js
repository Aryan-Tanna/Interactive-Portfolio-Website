  // BubbleMenu JavaScript Implementation
        class BubbleMenu {
            constructor() {
                this.isMenuOpen = false;
                this.showOverlay = false;
                this.animationEase = 'back.out(1.5)';
                this.animationDuration = 0.5;
                this.staggerDelay = 0.12;
                
                // Get DOM elements
                this.menuBtn = document.querySelector('.menu-btn');
                this.overlay = document.querySelector('.bubble-menu-items');
                this.bubbles = Array.from(document.querySelectorAll('.pill-link'));
                this.labels = Array.from(document.querySelectorAll('.pill-label'));
                this.init();
            }

            init() {
                // Bind event listeners
                this.menuBtn.addEventListener('click', () => this.handleToggle());
                window.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isMenuOpen) this.handleToggle();
                });
                window.addEventListener('resize', () => this.handleResize());

                this.overlay.querySelectorAll('a[href^="#"]').forEach((link) => {
                    link.addEventListener('click', (e) => {
                        const targetId = link.getAttribute('href');
                        if (targetId && targetId.length > 1) {
                            const el = document.querySelector(targetId);
                            if (el) {
                                e.preventDefault();
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                        this.handleToggle();
                    });
                });
                // Set initial state
                gsap.set(this.overlay, { display: 'none' });
            }

            handleToggle() {
                const nextState = !this.isMenuOpen;
                if (nextState) {
                    this.showOverlay = true;
                }
                this.isMenuOpen = nextState;
                // Toggle body class to trigger background blur styles while menu is open
                document.body.classList.toggle('menu-open', this.isMenuOpen);
                
                // Update button state
                this.menuBtn.classList.toggle('open', this.isMenuOpen);
                this.menuBtn.setAttribute('aria-pressed', this.isMenuOpen.toString());
                this.overlay.setAttribute('aria-hidden', (!this.isMenuOpen).toString());
                
                this.animateMenu();
            }

            animateMenu() {
                if (!this.overlay || !this.bubbles.length) return;

                if (this.isMenuOpen) {
                    gsap.set(this.overlay, { display: 'flex' });
                    gsap.killTweensOf([...this.bubbles, ...this.labels]);
                    gsap.set(this.bubbles, { scale: 0, transformOrigin: '50% 50%' });
                    gsap.set(this.labels, { y: 24, autoAlpha: 0 });

                    this.bubbles.forEach((bubble, i) => {
                        const delay = i * this.staggerDelay + gsap.utils.random(-0.05, 0.05);
                        const tl = gsap.timeline({ delay });

                        tl.to(bubble, {
                            scale: 1,
                            duration: this.animationDuration,
                            ease: this.animationEase
                        });

                        if (this.labels[i]) {
                            tl.to(
                                this.labels[i],
                                {
                                    y: 0,
                                    autoAlpha: 1,
                                    duration: this.animationDuration,
                                    ease: 'power3.out'
                                },
                                `-=${this.animationDuration * 0.9}`
                            );
                        }
                    });
                } else if (this.showOverlay) {
                    gsap.killTweensOf([...this.bubbles, ...this.labels]);
                    gsap.to(this.labels, {
                        y: 24,
                        autoAlpha: 0,
                        duration: 0.2,
                        ease: 'power3.in'
                    });
                    gsap.to(this.bubbles, {
                        scale: 0,
                        duration: 0.2,
                        ease: 'power3.in',
                        onComplete: () => {
                            gsap.set(this.overlay, { display: 'none' });
                            this.showOverlay = false;
                        }
                    });
                }
            }

            handleResize() {
                if (this.isMenuOpen) {
                    const isDesktop = window.innerWidth >= 900;

                    this.bubbles.forEach((bubble, i) => {
                        const rotationStyle = bubble.style.getPropertyValue('--item-rot');
                        const rotation = isDesktop ? rotationStyle : '0deg';
                        gsap.set(bubble, { 
                            rotation: isDesktop ? parseFloat(rotationStyle) : 0 
                        });
                    });
                }
            }
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new BubbleMenu();
        });

        // Add smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                if (target === '#') return;
                
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
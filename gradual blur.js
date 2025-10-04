 document.addEventListener('DOMContentLoaded', () => {

        const DEFAULT_CONFIG = {
            position: 'bottom', strength: 5, height: '6rem', divCount: 35,
            exponential: true, zIndex: 1000, animated: false, duration: '0.8s',
            easing: 'ease-in-out', opacity: 1, curve: 'linear', responsive: false,
            target: 'parent', className: '', style: {}
        };

        const PRESETS = {
            'page-footer': { 
                position: 'bottom', 
                height: '8rem', // Increased height
                target: 'page', 
                strength: 3, 
                animated: 'scroll',
                divCount: 15, // Increased divCount for a smoother gradient
                curve: 'ease-in'
            }
        };

        // Re-named class back to GradualBlur
        class GradualBlur {
            constructor(containerSelector, userConfig = {}) {
                this.containerEl = document.querySelector(containerSelector);
                if (!this.containerEl) {
                    console.error(`GradualBlur: Container "${containerSelector}" not found.`);
                    return;
                }

                this.isVisible = false;
                this.config = this.mergeConfigs(DEFAULT_CONFIG, PRESETS[userConfig.preset] || {}, userConfig);
                
                this.init();
            }

            mergeConfigs(...configs) {
                return configs.reduce((acc, c) => ({ ...acc, ...c }), {});
            }

            debounce(fn, wait) {
                let t;
                return (...a) => {
                    clearTimeout(t);
                    t = setTimeout(() => fn.apply(this, a), wait);
                };
            }
            
            init() {
                this.blurWrapper = document.createElement('div');
                this.blurInner = document.createElement('div');
                this.blurWrapper.className = `gradual-blur ${this.config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${this.config.className}`;
                this.blurInner.className = 'gradual-blur-inner';
                this.blurWrapper.appendChild(this.blurInner);
                this.containerEl.appendChild(this.blurWrapper);

                this.update();

                if (this.config.responsive) {
                    window.addEventListener('resize', this.debounce(this.update, 100));
                }

                if (this.config.animated === 'scroll') {
                    const observer = new IntersectionObserver(([entry]) => {
                        this.isVisible = entry.isIntersecting;
                        this.applyContainerStyles();
                    }, { threshold: 0.1 });
                    observer.observe(this.blurWrapper);
                } else {
                    this.isVisible = true;
                    this.applyContainerStyles();
                }
            }

            update() {
                this.applyContainerStyles();
                this.generateBlurDivs();
            }

            getResponsiveValue(key) {
                const w = window.innerWidth;
                const config = this.config;
                let value = config[key];
                if (w <= 480 && config[`mobile${key[0].toUpperCase() + key.slice(1)}`])
                    value = config[`mobile${key[0].toUpperCase() + key.slice(1)}`];
                else if (w <= 768 && config[`tablet${key[0].toUpperCase() + key.slice(1)}`])
                    value = config[`tablet${key[0].toUpperCase() + key.slice(1)}`];
                return value;
            }

            // RESTORED: This function now creates the gradual blur effect with multiple divs
            generateBlurDivs() {
                this.blurInner.innerHTML = ''; // Clear existing content
                const { divCount, strength, curve, exponential, position, opacity } = this.config;
                const CURVE_FUNCTIONS = {
                    linear: p => p, bezier: p => p * p * (3 - 2 * p),
                    'ease-in': p => p * p, 'ease-out': p => 1 - Math.pow(1 - p, 2)
                };
                const increment = 100 / divCount;
                const curveFunc = CURVE_FUNCTIONS[curve] || CURVE_FUNCTIONS.linear;
                const direction = ({top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right'})[position] || 'to bottom';

                for (let i = 1; i <= divCount; i++) {
                    let progress = curveFunc(i / divCount);
                    let blurValue = exponential ? Math.pow(2, progress * 4) * 0.0625 * strength : 0.0625 * (progress * divCount + 1) * strength;
                    
                    const p1 = (increment * i - increment).toFixed(1);
                    const p2 = (increment * i).toFixed(1);
                    
                    let gradient = `transparent ${p1}%, black ${p2}%, black 100%`;

                    const div = document.createElement('div');
                    div.style.cssText = `
                        position: absolute; inset: 0;
                        mask-image: linear-gradient(${direction}, ${gradient});
                        -webkit-mask-image: linear-gradient(${direction}, ${gradient});
                        backdrop-filter: blur(${blurValue.toFixed(2)}rem);
                        -webkit-backdrop-filter: blur(${blurValue.toFixed(2)}rem);
                        opacity: ${opacity};
                    `;
                    this.blurInner.appendChild(div);
                }
            }

            applyContainerStyles() {
                const { position, target, zIndex, style, animated, duration, easing } = this.config;
                const isVertical = ['top', 'bottom'].includes(position);
                const height = this.config.responsive ? this.getResponsiveValue('height') : this.config.height;
                
                Object.assign(this.blurWrapper.style, {
                    position: target === 'page' ? 'fixed' : 'absolute',
                    opacity: this.isVisible ? 1 : 0,
                    transition: animated ? `opacity ${duration} ${easing}` : 'none',
                    zIndex: target === 'page' ? zIndex + 100 : zIndex,
                    ...style,
                    ...(isVertical ? {
                        height: height,
                        width: '100%',
                        left: '0',
                        right: '0',
                        [position]: '0'
                    } : {
                        width: height,
                        height: '100%',
                        top: '0',
                        bottom: '0',
                        [position]: '0'
                    })
                });
            }
        }
        
        // --- INITIALIZE THE BLUR EFFECTS ---
        // Removed the header blur
        new GradualBlur('#blur-footer-container', { preset: 'page-footer' });
    });
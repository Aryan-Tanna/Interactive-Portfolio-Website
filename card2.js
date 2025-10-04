 window.addEventListener('load', () => {
        gsap.registerPlugin(ScrollTrigger);
        
        // --- 1. "FOCUS & REVEAL" SCROLL ANIMATION ---
        (() => {
            const textContent = document.querySelector('.about-text-content');
            const cardContainer = document.querySelector('.card');
            
            gsap.set(textContent, { xPercent: -100, opacity: 0 });
            gsap.set(cardContainer, { scale: 1.5, xPercent: -25, yPercent: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top top',
                    // MODIFIED: Animation now completes over a scroll distance
                    // equal to the viewport height, leaving time for the
                    // final state to be visible while scrolling continues.
                    end: '+=100%',
                    scrub: 1,
                    pin: true,
                }
            });

            tl.to(cardContainer, { scale: 1, xPercent: 0, yPercent: 0, ease: 'power2.inOut' }, 0);
            tl.to(textContent, { xPercent: 0, opacity: 1, ease: 'power2.inOut' }, 0);
        })();

        // --- 2. TILTED CARD SCRIPT ---
        (() => {
            const config = {
                imageSrc: './assets/yuuji.png',
                altText: 'A person coding on a laptop',
                captionText: 'LinkdIn',
                containerHeight: '500px',
                containerWidth: '400px',
                imageHeight: '400px',
                imageWidth: '400px',
                scaleOnHover: 1.2,
                rotateAmplitude: 10,
            };

            const card = document.getElementById('tilted');
            if (!card) return;

            const inner = card.querySelector('.tilted-inner');
            const img = card.querySelector('.tilted-img');
            const caption = card.querySelector('.tilted-caption');

            card.style.height = config.containerHeight;
            card.style.width = config.containerWidth;
            inner.style.height = config.imageHeight;
            inner.style.width = config.imageWidth;
            img.style.height = config.imageHeight;
            img.style.width = config.imageWidth;
            img.src = config.imageSrc;
            img.alt = config.altText;
            caption.textContent = config.captionText;
            
            const rotX = gsap.quickTo(inner, "rotationX", { duration: 0.8, ease: "power3.out" });
            const rotY = gsap.quickTo(inner, "rotationY", { duration: 0.8, ease: "power3.out" });
            
            const capX = gsap.quickTo(caption, "x", { duration: 0.6, ease: "power3.out" });
            const capY = gsap.quickTo(caption, "y", { duration: 0.6, ease: "power3.out" });

            let lastY = 0;
            let lastVelocity = 0;
            const capRot = gsap.quickTo(caption, "rotation", { duration: 0.5, ease: "power2.out"});

            function handleMouseMove(e) {
                const rect = card.getBoundingClientRect();
                const offsetX = e.clientX - rect.left - rect.width / 2;
                const offsetY = e.clientY - rect.top - rect.height / 2;
                const rotationX = (offsetY / (rect.height / 2)) * -config.rotateAmplitude;
                const rotationY = (offsetX / (rect.width / 2)) * config.rotateAmplitude;
                rotX(rotationX);
                rotY(rotationY);
                capX(e.clientX - rect.left + 15);
                capY(e.clientY - rect.top + 15);
                const velocityY = offsetY - lastY;
                const smoothedVelocity = (velocityY * 0.4) + (lastVelocity * 0.6);
                capRot(-smoothedVelocity * 0.8);
                lastY = offsetY;
                lastVelocity = smoothedVelocity;
            }

            function handleMouseEnter() {
                gsap.to(inner, { scale: config.scaleOnHover, duration: 0.6, ease: "power3.out" });
                gsap.to(caption, { opacity: 1, duration: 0.5, ease: "power2.out" });
            }

            function handleMouseLeave() {
                rotX(0);
                rotY(0);
                gsap.to(inner, { scale: 1, duration: 0.8, ease: "power3.out" });
                gsap.to(caption, { opacity: 0, duration: 0.5, ease: "power2.out" });
            }

            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
        })();
    });
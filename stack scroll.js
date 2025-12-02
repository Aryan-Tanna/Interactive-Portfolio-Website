 document.addEventListener('DOMContentLoaded', () => {

        const config = {
            itemDistance: 15,
            itemScale: 0.03, // less overlap
            itemStackDistance: 35, // a bit more spacing
            // Start near bottom of the screen so cards emerge from bottom
            stackPosition: '85%',
            // Begin scale earlier so stacking is progressive from bottom
            scaleEndPosition: '70%',
            baseScale: 1,
        };

        const scroller = document.getElementById('scroll-stack');
        if (!scroller) return;

        const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
        const endElement = scroller.querySelector('.scroll-stack-end');
        const sectionEl = scroller.closest('section');
        const headingEl = sectionEl ? sectionEl.querySelector('h1') : null;
        
        const lastTransforms = new Map();
        let isActive = false; // only animate when section is fullscreen

        const calculateProgress = (scrollTop, start, end) => {
            if (scrollTop < start) return 0; if (scrollTop > end) return 1;
            return (scrollTop - start) / (end - start);
        };
        const parsePercentage = (value, containerHeight) => {
            if (typeof value === 'string' && value.includes('%')) {
                return (parseFloat(value) / 100) * containerHeight;
            }
            return parseFloat(value);
        };
        const updateCardTransforms = (scrollTop) => {
            const containerHeight = scroller.clientHeight;
            const stackPositionPx = parsePercentage(config.stackPosition, containerHeight);
            const scaleEndPositionPx = parsePercentage(config.scaleEndPosition, containerHeight);
            const endElementTop = endElement.offsetTop;
            const headingBottomAbs = headingEl ? (headingEl.getBoundingClientRect().bottom + window.scrollY) : 0;

            cards.forEach((card, i) => {
                const cardTop = card.offsetTop;
                const stackOffset = config.itemStackDistance * i;
                
                const triggerStart = cardTop - stackPositionPx - stackOffset;
                const triggerEnd = cardTop - scaleEndPositionPx;
                const pinStart = cardTop - stackPositionPx - stackOffset;
                
                let pinDuration = (endElementTop - card.offsetHeight) - pinStart;
                if (pinDuration < 0) pinDuration = 0; // ensure positive duration for last card
                const pinEnd = pinStart + pinDuration;

                const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
                
                // MODIFIED: Inverted scaling logic for front-to-back stacking
                const targetScale = config.baseScale - ((cards.length - 1 - i) * config.itemScale);
                const scale = 1 - scaleProgress * (1 - targetScale);
                
                let translateY = 0;
                const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

                if (isPinned) {
                    translateY = scrollTop - cardTop + stackPositionPx + stackOffset;
                } else if (scrollTop > pinEnd) {
                    translateY = pinEnd - cardTop + stackPositionPx + stackOffset;
                }

                // Prevent the FIRST card from moving above the Projects H1 (use absolute positions)
                if (i === 0) {
                    const cardAbsTop = card.getBoundingClientRect().top + window.scrollY;
                    const minTranslate = (headingBottomAbs - cardAbsTop) + 8; // 8px padding
                    translateY = Math.max(translateY, minTranslate);
                }

                const newTransform = { translateY, scale, rotation: 0, blur: 0 };
                
                const last = lastTransforms.get(i) || {};
                const hasChanged = Object.keys(newTransform).some(key => Math.abs((last[key] || 0) - newTransform[key]) > 0.001);

                if (hasChanged) {
                    card.style.transform = `translateY(${newTransform.translateY}px) scale(${newTransform.scale})`;
                    lastTransforms.set(i, newTransform);
                }
            });
        };

        // --- SETUP ---
        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                card.style.marginBottom = `${config.itemDistance}px`;
            }
            card.style.willChange = 'transform';
            card.style.transformOrigin = 'top center';
            // Higher z-index for earlier cards so incoming cards overlay as you scroll down
            card.style.zIndex = (cards.length - i).toString();
        });

        const lenis = new Lenis({
            wrapper: scroller,
            content: scroller.querySelector('.scroll-stack-inner'),
            lerp: 0.07,
            duration: 1.2,
            smoothWheel: true,
        });

        let currentScroll = 0;
        let maxScroll = 0;
        lenis.on('scroll', (e) => {
            currentScroll = e.scroll;
            maxScroll = e.limit || maxScroll;
            if (isActive) updateCardTransforms(e.scroll);
        });

        // Determine if the Projects section is fully fullscreen (with tolerance)
        const isSectionFullscreen = () => {
            const target = sectionEl || scroller;
            const r = target.getBoundingClientRect();
            const vh = window.innerHeight;
            const tol = 100; // px tolerance (more forgiving for headings/padding)
            return r.top <= tol && r.bottom >= vh - tol;
        };

        // Enable/disable animation & Lenis based on fullscreen state
        const syncActivation = () => {
            const shouldBeActive = isSectionFullscreen();
            if (shouldBeActive && !isActive) {
                isActive = true;
                updateCardTransforms(currentScroll);
            } else if (!shouldBeActive && isActive) {
                isActive = false;
                // Clear transforms so cards lay out normally when not active
                cards.forEach((c) => { c.style.transform = ''; });
            }
        };
        window.addEventListener('scroll', syncActivation, { passive: true });
        window.addEventListener('resize', syncActivation, { passive: true });

        // Allow scroll chaining to the page when wrapper hits bounds
        const wheelHandler = (evt) => {
            const dy = evt.deltaY;
            const atTop = currentScroll <= 24; // a bit more forgiving
            const atBottom = currentScroll >= maxScroll - 1; // tolerance
            if (isActive && ((atTop && dy < 0) || (atBottom && dy > 0))) {
                // Pass wheel to window so previous/next section appears
                evt.preventDefault();
                window.scrollBy({ top: dy, left: 0, behavior: 'smooth' });
            }
        };
        scroller.addEventListener('wheel', wheelHandler, { passive: false });

        // Basic touch chaining for mobile
        let touchStartY = 0;
        scroller.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
        scroller.addEventListener('touchmove', (e) => {
            const dy = touchStartY - e.touches[0].clientY; // swipe up => positive
            const atTop = currentScroll <= 0;
            const atBottom = currentScroll >= maxScroll - 1;
            if (isActive && ((atTop && dy < 0) || (atBottom && dy > 0))) {
                e.preventDefault();
                window.scrollBy({ top: dy, left: 0, behavior: 'smooth' });
            }
        }, { passive: false });
        function raf(time) {
            // Always run Lenis so inner content can scroll, even when inactive
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        // Initial activation check
        syncActivation();
        if (isActive) {
            updateCardTransforms(scroller.scrollTop);
        } else {
            cards.forEach((c) => { c.style.transform = ''; });
        }
    });
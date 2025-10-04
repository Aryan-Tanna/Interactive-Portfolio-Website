 document.addEventListener('DOMContentLoaded', () => {

        const config = {
            itemDistance: 15,
            itemScale: 0.04,
            itemStackDistance: 25,
            stackPosition: '20%',
            scaleEndPosition: '15%',
            baseScale: 1,
        };

        const scroller = document.getElementById('scroll-stack');
        if (!scroller) return;

        const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
        const endElement = scroller.querySelector('.scroll-stack-end');
        
        const lastTransforms = new Map();

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

            cards.forEach((card, i) => {
                const cardTop = card.offsetTop;
                const stackOffset = config.itemStackDistance * i;
                
                const triggerStart = cardTop - stackPositionPx - stackOffset;
                const triggerEnd = cardTop - scaleEndPositionPx;
                const pinStart = cardTop - stackPositionPx - stackOffset;
                
                const pinDuration = (endElementTop - card.offsetHeight) - pinStart;
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
            // MODIFIED: Inverted z-index so the FIRST card is at the back
            card.style.zIndex = i + 1;
        });

        const lenis = new Lenis({
            wrapper: scroller,
            content: scroller.querySelector('.scroll-stack-inner'),
            lerp: 0.07,
            duration: 1.2,
            smoothWheel: true,
        });

        lenis.on('scroll', (e) => {
            updateCardTransforms(e.scroll);
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        updateCardTransforms(scroller.scrollTop);
    });
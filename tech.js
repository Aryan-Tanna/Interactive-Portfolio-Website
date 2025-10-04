document.addEventListener('DOMContentLoaded', () => {
        gsap.registerPlugin(ScrollTrigger);
        
        // --- 1. PULSATING LIGHT RAYS EFFECT ---
       
        // --- 2. TECH STACK SCRIPT ---
        (() => {
            // Track mouse position for hover/parallax effects
            const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });

            const techData = [
                { category: 'Languages', skills: [
                    { name: 'HTML', icon: '🌐' }, { name: 'CSS', icon: '🎨' }, { name: 'JavaScript', icon: 'JS' },
                    { name: 'Node.js', icon: '🟢' }, { name: 'Express.js', icon: '🚀' },, { name: 'C', icon: 'C' }, { name: 'C++', icon: 'C++' },
                    { name: 'Java', icon: '☕' }, { name: 'Python', icon: '🐍' }
                ]},
                { category: 'Tools/Frameworks', skills: [
                    { name: 'Bootstrap', icon: '🅱️' }, { name: 'TailwindCSS', icon: '💨' }, { name: 'FlexBox', icon: '◫' },
                    { name: 'Grid', icon: '▦' }, { name: 'EJS', icon: '📄' }, { name: 'Jquery', icon: '💲' }
                ]},
                { category: 'Other Skills', skills: [{ name: 'Davinci', icon: '🎬' }, { name: 'MS Office', icon: '💼' }, { name: 'Photoshop', icon: 'PS' }] },
                { category: 'Libraries', skills: [
                    { name: 'Numpy', icon: '🔢' }, { name: 'Matplotlib', icon: '📊' }, { name: 'Pandas', icon: '🐼' }, { name: 'Geopandas', icon: '🌍' }
                ]}
            ];
            
            const table = document.getElementById('tech-table');
            if (!table) return;

            techData.forEach(group => {
                const row = document.createElement('div'); row.className = 'tech-row';
                const categoryTitle = document.createElement('div'); categoryTitle.className = 'category-title'; categoryTitle.textContent = group.category;
                const skillsContainer = document.createElement('div'); skillsContainer.className = 'skills-container';
                group.skills.forEach(skill => {
                    const skillItem = document.createElement('div'); skillItem.className = 'skill-item';
                    skillItem.innerHTML = `
                        <span class="text-default"><span>${skill.icon}</span> ${skill.name}</span>
                        <span class="text-hover"><span>${skill.icon}</span> ${skill.name}</span>
                    `;
                    skillsContainer.appendChild(skillItem);
                });
                row.append(categoryTitle, skillsContainer);
                table.appendChild(row);
            });
            
            document.querySelectorAll('.category-title').forEach(title => {
                const chars = title.textContent.split('').map(c => `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
                title.innerHTML = chars;
                gsap.from(title.querySelectorAll('.char'), {
                    opacity: 0, y: '100%', duration: 0.6, ease: 'power2.out', stagger: 0.05,
                    scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
                });
            });

            const skillItems = document.querySelectorAll('.skill-item');
       
            // Create a proxy object and a quickTo function for each skill item's reveal radius
            const skillItemsData = Array.from(skillItems).map(item => {
                const textHover = item.querySelector('.text-hover');
                const proxy = { radius: 0 };
                return {
                    item,
                    textHover,
                    proxy,
                    radiusQuickTo: gsap.quickTo(proxy, "radius", { duration: 0.4, ease: "power2.out" }),
                    rect: item.getBoundingClientRect() // Cache the position
                };
            });
            // Recalculate positions on resize
            window.addEventListener('resize', () => {
                skillItemsData.forEach(data => data.rect = data.item.getBoundingClientRect());
            });

            // The main animation loop, managed by GSAP for performance
            gsap.ticker.add(() => {
                // Parallax calculation
                const x = (mouse.x / window.innerWidth - 0.5) * 40;
                const y = (mouse.y / window.innerHeight - 0.5) * 40;
             
                // Proximity reveal calculation for each skill item
                skillItemsData.forEach(data => {
                    const { item, textHover, proxy, radiusQuickTo, rect } = data;
                    
                    const x = mouse.x - rect.left;
                    const y = mouse.y - rect.top;
                    
                    item.style.setProperty('--glow-x', `${x}px`);
                    item.style.setProperty('--glow-y', `${y}px`);

                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const distance = Math.hypot(mouse.x - centerX, mouse.y - centerY);

                    const proximityRadius = 1300;
                    const maxRevealSize = 70;
                    const targetRadius = Math.max(0, maxRevealSize * (1 - distance / proximityRadius));
                    
                    radiusQuickTo(targetRadius);
                    
                    if (textHover) {
                        textHover.style.clipPath = `circle(${proxy.radius}px at ${x}px ${y}px)`;
                    }
                });
            });

        })();
    });
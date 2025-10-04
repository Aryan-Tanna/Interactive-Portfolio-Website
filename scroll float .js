document.addEventListener('DOMContentLoaded', () => {
      // --- SCROLL FLOAT SCRIPT ---
      const heading = document.getElementById('scroll-float-heading');
      const textSpan = heading.querySelector('.scroll-float-text');
      if (!heading || !textSpan) return;

      gsap.registerPlugin(ScrollTrigger);
      
      // 1. Split the text into character spans
      const text = textSpan.textContent;
      textSpan.innerHTML = '';
      text.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.innerHTML = char === ' ' ? '&nbsp;' : char;
        textSpan.appendChild(charSpan);
      });

      const charElements = textSpan.querySelectorAll('.char');

      // 2. Set up the GSAP animation
      gsap.fromTo(
        charElements,
        { // from state
          opacity: 0,
          // MODIFIED: Use a function to give each character a random start position and rotation
          yPercent: () => 100 + Math.random() * 50,
          rotationZ: () => Math.random() * 90 - 45,
          transformOrigin: '50% 50%',
        },
        { // to state
          duration: 0.3,
          ease: 'power3.out',
          opacity: 1,
          yPercent: 0,
          rotationZ: 0, // Ensure rotation animates back to 0
          stagger: 0.04,
          scrollTrigger: {
            trigger: heading,
            start: 'top bottom-=200px',
            end: 'bottom top+=150px',
            scrub: true 
          }
        }
      );
    });
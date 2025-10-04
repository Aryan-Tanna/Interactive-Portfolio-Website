window.addEventListener('load', () => {
      // --- CONFIGURATION ---
      const config = {
        imageSrc: './assets/github.jpg',
        altText: 'A person coding on a laptop',
        captionText: 'Github',
        containerHeight: '500px',
        containerWidth: '500px',
        imageHeight: '450px',
        imageWidth: '450px',
        scaleOnHover: 1.2,
        rotateAmplitude: 10,
      };

      // --- ELEMENT SELECTION ---
      const card = document.getElementById('tilted-card');
      if (!card) return;

      const inner = card.querySelector('.tilted-card-inner');
      const img = card.querySelector('.tilted-card-img');
      const caption = card.querySelector('.tilted-card-caption');

      // --- APPLY CONFIGURATION ---
      card.style.height = config.containerHeight;
      card.style.width = config.containerWidth;
      inner.style.height = config.imageHeight;
      inner.style.width = config.imageWidth;
      img.src = config.imageSrc;
      img.alt = config.altText;
      caption.textContent = config.captionText;
      
      // --- ANIMATION LOGIC WITH GSAP (SMOOTHER SETTINGS) ---
      const rotX = gsap.quickTo(inner, "rotationX", { duration: 0.8, ease: "power3.out" });
      const rotY = gsap.quickTo(inner, "rotationY", { duration: 0.8, ease: "power3.out" });
      
      const capX = gsap.quickTo(caption, "x", { duration: 0.6, ease: "power3.out" });
      const capY = gsap.quickTo(caption, "y", { duration: 0.6, ease: "power3.out" });

      let lastY = 0;
      let lastVelocity = 0;
      const capRot = gsap.quickTo(caption, "rotation", { duration: 0.5, ease: "power2.out"});

      // --- EVENT HANDLERS ---
      function handleMouseMove(e) {
        const rect = card.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -config.rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * config.rotateAmplitude;
        
        rotX(rotationX);
        rotY(rotationY);
        
        capX(e.clientX - rect.left + 15); // Add small offset
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
        // FIXED: Use the quickTo functions to reset the rotation, preventing conflicts.
        rotX(0);
        rotY(0);
        // Animate scale and opacity separately
        gsap.to(inner, { scale: 1, duration: 0.8, ease: "power3.out" });
        gsap.to(caption, { opacity: 0, duration: 0.5, ease: "power2.out" });
      }

      // Attach event listeners to the card
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
    });
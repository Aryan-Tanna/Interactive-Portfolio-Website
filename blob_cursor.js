document.addEventListener('DOMContentLoaded', () => {
        // --- CONFIGURATION ---
        const config = {
          blobType: 'circle',
          fillColor: 'rgba(189, 244, 137, 0.96) ',
          trailCount: 3,
          sizes: [40, 60, 60],
          innerSizes: [20, 35, 45],
          innerColor: '#3f73237b(0, 0, 1, 0.8)',
          opacities: [0.6, 0.6, 0.6],
          shadowColor: 'rgba(0,0,0,0.75)',
          shadowBlur: 5,
          shadowOffsetX: 10,
          shadowOffsetY: 10,
          filterId: 'blob-filter',
          filterStdDeviation: 30,
          filterColorMatrixValues: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
          useFilter: true,
          fastDuration: 0.1,
          slowDuration: 0.5,
          fastEase: 'power3.out',
          slowEase: 'power1.out',
        };

        // --- SETUP ---
        const container = document.getElementById('blob-container');
        if (!container) return;

        // Create SVG filter if enabled
        if (config.useFilter) {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.style.position = 'absolute';
          svg.style.width = '0';
          svg.style.height = '0';

          const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.id = config.filterId;

          const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          feGaussianBlur.setAttribute('in', 'SourceGraphic');
          feGaussianBlur.setAttribute('result', 'blur');
          feGaussianBlur.setAttribute('stdDeviation', config.filterStdDeviation);

          const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
          feColorMatrix.setAttribute('in', 'blur');
          feColorMatrix.setAttribute('values', config.filterColorMatrixValues);

          filter.appendChild(feGaussianBlur);
          filter.appendChild(feColorMatrix);
          svg.appendChild(filter);
          container.appendChild(svg);
        }

        // Create main div that holds blobs
        const blobMain = document.createElement('div');
        blobMain.className = 'blob-main';
        if (config.useFilter) {
          blobMain.style.filter = `url(#${config.filterId})`;
        }
        container.appendChild(blobMain);

        // Create blobs and store references
        const blobs = [];
        for (let i = 0; i < config.trailCount; i++) {
          const blob = document.createElement('div');
          blob.className = 'blob';

          const innerDot = document.createElement('div');
          innerDot.className = 'inner-dot';

          // Style the blob
          blob.style.width = `${config.sizes[i]}px`;
          blob.style.height = `${config.sizes[i]}px`;
          blob.style.borderRadius = config.blobType === 'circle' ? '50%' : '0%';
          blob.style.backgroundColor = config.fillColor;
          blob.style.opacity = config.opacities[i];
          blob.style.boxShadow = `${config.shadowOffsetX}px ${config.shadowOffsetY}px ${config.shadowBlur}px 0 ${config.shadowColor}`;

          // Style the inner dot
          innerDot.style.width = `${config.innerSizes[i]}px`;
          innerDot.style.height = `${config.innerSizes[i]}px`;
          innerDot.style.top = `${(config.sizes[i] - config.innerSizes[i]) / 2}px`;
          innerDot.style.left = `${(config.sizes[i] - config.innerSizes[i]) / 2}px`;
          innerDot.style.backgroundColor = config.innerColor;
          innerDot.style.borderRadius = config.blobType === 'circle' ? '50%' : '0%';

          blob.appendChild(innerDot);
          blobMain.appendChild(blob);
          blobs.push(blob);
        }

        // --- ANIMATION LOGIC ---
        const handleMove = (e) => {
          // Use ternary operator for touch events for better compatibility
          const x = e.touches ? e.touches[0].clientX : e.clientX;
          const y = e.touches ? e.touches[0].clientY : e.clientY;

          blobs.forEach((blob, i) => {
            const isLead = i === 0;
            gsap.to(blob, {
              x: x,
              y: y,
              duration: isLead ? config.fastDuration : config.slowDuration,
              ease: isLead ? config.fastEase : config.slowEase,
            });
          });
        };

        // Attach event listeners
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
      });
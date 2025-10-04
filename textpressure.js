document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURATION ---
  // Change these values to customize the effect
  const config = {
    text: 'Ahoy!!',
    fontFamily: 'Compressa VF',
    fontUrl: 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
    textColor: '#c8fcb5ff',
    strokeColor: '#000000ff',
    minFontSize: 21,

    // Animation Toggles
    width: true,
    weight: true,
    italic: true,
    alpha: false,

    // Layout Toggles
    flex: true,
    stroke: true,
    scale: true,
  };

  // --- SETUP ---
  const container = document.getElementById('app-container');
  if (!container) return;

  // Dynamically inject the @font-face rule
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @font-face {
      font-family: '${config.fontFamily}';
      src: url('${config.fontUrl}');
      font-style: normal;
    }
  `;
  document.head.appendChild(styleSheet);

  // Create the title element
  const title = document.createElement('h1');
  title.className = 'text-pressure-title';
  container.appendChild(title);

  // Set initial colors via CSS variables
  title.style.setProperty('--text-color', config.textColor);
  title.style.setProperty('--stroke-color', config.strokeColor);
  title.style.fontFamily = config.fontFamily;

  // Add layout classes
  if (config.flex) title.classList.add('flex');
  if (config.stroke) title.classList.add('stroke');

  // Create spans for each character
  const chars = config.text.split('');
  const spans = [];
  chars.forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.setAttribute('data-char', char); // For the stroke effect's ::after pseudo-element
    title.appendChild(span);
    spans.push(span);
  });

  // --- STATE & HELPERS ---
  const mouse = { x: 0, y: 0 };
  const cursor = { x: 0, y: 0 };
  let fontSize = config.minFontSize;
  let scaleY = 1;

  // Calculate distance between two points
  const dist = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // --- CORE LOGIC ---

  // Function to resize the text to fit the container
  const setSize = () => {
    const { width: containerW, height: containerH } = container.getBoundingClientRect();
    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, config.minFontSize);

    fontSize = newFontSize;
    scaleY = 1;

    title.style.fontSize = `${fontSize}px`;
    title.style.transform = `scale(1, ${scaleY})`;
    title.style.lineHeight = 1;

    requestAnimationFrame(() => {
      const textRect = title.getBoundingClientRect();
      if (config.scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        scaleY = yRatio;
        title.style.transform = `scale(1, ${scaleY})`;
        title.style.lineHeight = yRatio; // Adjust line-height to prevent layout shifts with scaling
      }
    });
  };

  // --- ANIMATION LOOP ---
  const animate = () => {
    // Smoothly interpolate mouse position for an easing effect
    mouse.x += (cursor.x - mouse.x) / 15;
    mouse.y += (cursor.y - mouse.y) / 15;

    const titleRect = title.getBoundingClientRect();
    const maxDist = titleRect.width / 2;

    spans.forEach(span => {
      const rect = span.getBoundingClientRect();
      const charCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const d = dist(mouse, charCenter);

      // Maps distance to a font variation value
      const getAttr = (distance, minVal, maxVal) => {
        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
      };

      // Calculate font variation values based on distance
      const wdth = config.width ? Math.floor(getAttr(d, 5, 200)) : 100;
      const wght = config.weight ? Math.floor(getAttr(d, 700, 1000)) : 400;
      const italVal = config.italic ? getAttr(d, 0, 1).toFixed(2) : 0;
      const alphaVal = config.alpha ? getAttr(d, 0, 1).toFixed(2) : 1;

      // Apply the styles to the span
      span.style.opacity = alphaVal;
      span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
    });

    requestAnimationFrame(animate);
  };

  // --- EVENT LISTENERS ---
  const handleMouseMove = e => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  };

  const handleTouchMove = e => {
    const t = e.touches[0];
    cursor.x = t.clientX;
    cursor.y = t.clientY;
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('resize', setSize);

  // --- INITIALIZATION ---
  const init = () => {
    // Center the initial "mouse" position within the text container
    const { left, top, width, height } = container.getBoundingClientRect();
    mouse.x = left + width / 2;
    mouse.y = top + height / 2;
    cursor.x = mouse.x;
    cursor.y = mouse.y;

    setSize(); // Set initial size
    animate(); // Start the animation loop
  };

  init();
});
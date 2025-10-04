const OGL_NS = window.ogl || window.OGL;
if (!OGL_NS) {
  console.error('OGL library not found. Ensure the OGL script tag loads before background.js');
  // Exit early to avoid spamming errors
  throw new Error('OGL library not found');
}
const { Renderer, Program, Triangle, Mesh } = OGL_NS;

  const DEFAULT_COLOR = '#ffffffa8';
  const config = {
    raysOrigin: 'top-center',          // or 'center' if you want center burst
    raysColor: DEFAULT_COLOR,
    raysSpeed: 1,
    lightSpread: 1,
    rayLength: 4,
    pulsating: false,
    fadeDistance: 2.0,
    saturation: 1.0,
    followMouse: true,
    mouseInfluence: 0.1,
    noiseAmount: 0.0,
    distortion: 0.0
  };

  const container = document.getElementById('light-rays-container');
  if (!container) throw new Error('Container not found');

  const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [1,1,1];
  };

  const getAnchorAndDir = (origin, w, h) => {
    const outside = 0.2;
    switch (origin) {
      case 'top-left': return { anchor: [0, -outside*h], dir: [0, 1] };
      case 'top-right': return { anchor: [w, -outside*h], dir: [0, 1] };
      case 'left': return { anchor: [-outside*w, 0.5*h], dir: [1, 0] };
      case 'right': return { anchor: [(1+outside)*w, 0.5*h], dir: [-1, 0] };
      case 'bottom-left': return { anchor: [0, (1+outside)*h], dir: [0, -1] };
      case 'bottom-center': return { anchor: [0.5*w, (1+outside)*h], dir: [0, -1] };
      case 'bottom-right': return { anchor: [w, (1+outside)*h], dir: [0, -1] };
      default: return { anchor: [0.5*w, -outside*h], dir: [0, 1] }; // 'top-center'
    }
  };

  const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
  const gl = renderer.gl;
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  while (container.firstChild) container.removeChild(container.firstChild);
  container.appendChild(gl.canvas);

  const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const frag = `precision highp float;
uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;
varying vec2 vUv;
float noise(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sc = coord - raySource;
  vec2 dn = normalize(sc);
  float ca = dot(dn, rayRefDirection);
  float da = ca + distortion * sin(iTime * 2.0 + length(sc) * 0.01) * 0.2;
  float sf = pow(max(da, 0.0), 1.0 / max(lightSpread, 0.001));
  float d = length(sc);
  float md = iResolution.x * rayLength;
  float lf = clamp((md - d) / md, 0.0, 1.0);
  float ff = clamp((iResolution.x * fadeDistance - d) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float p = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
  float bs = clamp(
    (0.45 + 0.15 * sin(da * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-da * seedB + iTime * speed)), 0.0, 1.0);
  return bs * lf * ff * sf * p;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }
  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  fragColor = rays1 * 0.5 + rays2 * 0.4;
  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }
  float b = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + b * 0.8;
  fragColor.y *= 0.3 + b * 0.6;
  fragColor.z *= 0.5 + b * 0.5;
  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }
  fragColor.rgb *= raysColor;
}
void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: [1, 1] },
    rayPos: { value: [0, 0] },
    rayDir: { value: [0, 1] },
    raysColor: { value: hexToRgb(config.raysColor) },
    raysSpeed: { value: config.raysSpeed },
    lightSpread: { value: config.lightSpread },
    rayLength: { value: config.rayLength },
    pulsating: { value: config.pulsating ? 1.0 : 0.0 },
    fadeDistance: { value: config.fadeDistance },
    saturation: { value: config.saturation },
    mousePos: { value: [0.5, 0.5] },
    mouseInfluence: { value: config.mouseInfluence },
    noiseAmount: { value: config.noiseAmount },
    distortion: { value: config.distortion }
  };

  const geometry = new Triangle(gl);
  const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
  const mesh = new Mesh(gl, { geometry, program });

  const mouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };

  const updatePlacement = () => {
    renderer.dpr = Math.min(window.devicePixelRatio, 2);
    const { clientWidth: wCSS, clientHeight: hCSS } = container;
    renderer.setSize(wCSS, hCSS);
    const dpr = renderer.dpr;
    const w = wCSS * dpr;
    const h = hCSS * dpr;
    uniforms.iResolution.value = [w, h];
    const { anchor, dir } = getAnchorAndDir(config.raysOrigin, w, h);
    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = dir;
  };

  const handleMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = (e.clientY - rect.top) / rect.height;
  };

  const loop = (t) => {
    uniforms.iTime.value = t * 0.001;
    if (config.followMouse && config.mouseInfluence > 0.0) {
      const smoothing = 0.92;
      smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
      smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);
      uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
    }
    renderer.render({ scene: mesh });
    requestAnimationFrame(loop);
  };

  window.addEventListener('resize', updatePlacement);
  if (config.followMouse) window.addEventListener('mousemove', handleMouseMove);
  updatePlacement();
  requestAnimationFrame(loop);
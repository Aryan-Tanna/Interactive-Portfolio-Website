console.log('[metaballs] script tag loaded');
window.addEventListener('error', (e) => {
    console.error('[metaballs] window error:', e.message, e.filename, e.lineno, e.colno);
});
document.addEventListener('DOMContentLoaded', () => {
        console.log('[metaballs] DOMContentLoaded');
        
        // --- CONFIGURATION ---
        const config = {
            color: '#a3d376ff ',
            cursorBallColor: '#a3d376ff ',
            speed: 0.3,
            enableMouseInteraction: true,
            hoverSmoothness: 0.1,
            animationSize:32,
            ballCount: 15,
            clumpFactor: 1,
            cursorBallSize: 1.5,
            enableTransparency: true,
        };
        // --- Helpers ---
        function parseHexColor(hex) {
            const c = hex.replace('#', '');
            const r = parseInt(c.substring(0, 2), 16) / 255;
            const g = parseInt(c.substring(2, 4), 16) / 255;
            const b = parseInt(c.substring(4, 6), 16) / 255;
            return [r, g, b];
        }
        function fract(x) { return x - Math.floor(x); }
        function hash31(p) {
            let r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
            const r_yzx = [r[1], r[2], r[0]];
            const d = r[0] * (r_yzx[0] + 33.33) + r[1] * (r_yzx[1] + 33.33) + r[2] * (r_yzx[2] + 33.33);
            for (let i = 0; i < 3; i++) r[i] = fract(r[i] + d);
            return r;
        }
        function hash33(v) {
            let p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
            const p_yxz = [p[1], p[0], p[2]];
            const d = p[0] * (p_yxz[0] + 33.33) + p[1] * (p_yxz[1] + 33.33) + p[2] * (p_yxz[2] + 33.33);
            for (let i = 0; i < 3; i++) p[i] = fract(p[i] + d);
            const p_xxy = [p[0], p[0], p[1]];
            const p_yxx = [p[1], p[0], p[0]];
            const p_zyx = [p[2], p[1], p[0]];
            const r = [];
            for (let i = 0; i < 3; i++) r[i] = fract((p_xxy[i] + p_yxx[i]) * p_zyx[i]);
            return r;
        }
        
        const container = document.getElementById('metaballs-container');
        if (!container) {
            console.warn('[metaballs] container #metaballs-container not found');
        }
        if (!container) {
            // No container found; nothing to render into.
            return;
        }
        const OGL_NS = window.ogl || window.OGL;
        if (!OGL_NS) {
            container.innerHTML = '<p style="color:red; text-align:center;">Error: OGL library not found. Ensure the OGL script is loaded before metaball.js.</p>';
            return;
        }

        const { Renderer, Program, Mesh, Triangle, Vec3 } = OGL_NS;
        // Force WebGL2 context for GLSL 300 es shaders
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
        if (!gl2) {
            container.innerHTML = '<p style="color:red; text-align:center;">Error: WebGL2 not supported by this browser/device.</p>';
            return;
        }
        console.log('[metaballs] OGL found, WebGL2 context created');
        const renderer = new Renderer({ context: gl2, dpr: 1, alpha: true, premultipliedAlpha: false });
        const gl = renderer.gl;
        // Transparent background so site content stays visible
        gl.clearColor(0, 0, 0, config.enableTransparency ? 0 : 1);
        container.appendChild(gl.canvas);
        gl.canvas.style.display = 'block';
        gl.canvas.style.position = 'absolute';
        gl.canvas.style.top = '0';
        gl.canvas.style.left = '0';
        gl.canvas.style.pointerEvents = 'none';

        const geometry = new Triangle(gl);
        const [r1, g1, b1] = parseHexColor(config.color);
        const [r2, g2, b2] = parseHexColor(config.cursorBallColor);
        const metaBallsUniform = Array.from({ length: 50 }, () => new Vec3(0, 0, 0));

        const debugSolid = false; // rendering verified, use metaball shader
        const vertexSrc = `#version 300 es\nprecision highp float; in vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;
        const metaballFrag = `#version 300 es\nprecision highp float; uniform vec3 iResolution; uniform float iTime; uniform vec3 iMouse; uniform vec3 iColor; uniform vec3 iCursorColor; uniform float iAnimationSize; uniform int iBallCount; uniform float iCursorBallSize; uniform vec3 iMetaBalls[50]; uniform float iClumpFactor; uniform bool enableTransparency; out vec4 outColor; const float PI = 3.14159265359;
                float getMetaBallValue(vec2 c, float r, vec2 p) { vec2 d = p - c; float dist2 = dot(d, d); return (r * r) / dist2; }
                void main() { vec2 fc = gl_FragCoord.xy; float scale = iAnimationSize / iResolution.y; vec2 coord = (fc - iResolution.xy * 0.5) * scale; vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale; float m1 = 0.0; for (int i = 0; i < 50; i++) { if (i >= iBallCount) break; m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord); } float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord); float total = m1 + m2; float f = smoothstep(-1.0, 1.0, (total - 0.9) / min(1.0, fwidth(total))); vec3 cFinal = vec3(0.0); if (total > 0.0) { float alpha1 = m1 / total; float alpha2 = m2 / total; cFinal = iColor * alpha1 + iCursorColor * alpha2; } outColor = vec4(cFinal * f, enableTransparency ? f : 1.0); }`;
        const debugFrag = `#version 300 es\nprecision highp float; out vec4 outColor; void main(){ outColor = vec4(1.0, 0.0, 0.6, 1.0); }`;

        const program = new Program(gl, {
            vertex: vertexSrc,
            fragment: debugSolid ? debugFrag : metaballFrag,
            uniforms: {
                iTime: { value: 0 }, iResolution: { value: new Vec3() }, iMouse: { value: new Vec3() },
                iColor: { value: new Vec3(r1, g1, b1) }, iCursorColor: { value: new Vec3(r2, g2, b2) },
                iAnimationSize: { value: config.animationSize }, iBallCount: { value: config.ballCount },
                iCursorBallSize: { value: config.cursorBallSize }, iMetaBalls: { value: metaBallsUniform },
                iClumpFactor: { value: config.clumpFactor }, enableTransparency: { value: config.enableTransparency }
            }
        });
        const mesh = new Mesh(gl, { geometry, program });

        const ballParams = [];
        const effectiveBallCount = Math.min(config.ballCount, 50);
        for (let i = 0; i < effectiveBallCount; i++) {
            const idx = i + 1; const h1 = hash31(idx); const st = h1[0] * 6.28;
            const dtFactor = 0.314 + h1[1] * 0.942; const baseScale = 5.0 + h1[1] * 5.0;
            const h2 = hash33(h1); const toggle = Math.floor(h2[0] * 2.0); const radiusVal = 0.5 + h2[2] * 1.5;
            ballParams.push({ st, dtFactor, baseScale, toggle, radius: radiusVal });
        }

        const mouseBallPos = { x: 0, y: 0 };
        let pointerInside = false; let pointerX = 0; let pointerY = 0;

        function resize() {
            const width = container.clientWidth; const height = container.clientHeight;
            renderer.setSize(width, height);
            gl.canvas.style.width = width + 'px'; gl.canvas.style.height = height + 'px';
            program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
            console.log('[metaballs] resize -> container', width, height, 'canvas', gl.canvas.width, gl.canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();
        
        // Re-enable mouse influence using window mousemove (no custom cursor overlay)
        window.addEventListener('mousemove', e => {
            if (!config.enableMouseInteraction) return;
            const rect = container.getBoundingClientRect();
            const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            pointerInside = inside;
            const clampedX = Math.min(Math.max(e.clientX, rect.left), rect.right);
            const clampedY = Math.min(Math.max(e.clientY, rect.top), rect.bottom);
            pointerX = (clampedX - rect.left) / rect.width * gl.canvas.width;
            pointerY = (1 - (clampedY - rect.top) / rect.height) * gl.canvas.height;
        });

        let firstFrameLogged = false;
        requestAnimationFrame(update);
        function update(t) {
            requestAnimationFrame(update);
            program.uniforms.iTime.value = t * 0.001;
            if (!firstFrameLogged) {
                console.log('[metaballs] first frame t=', t);
                firstFrameLogged = true;
            }
            
            for (let i = 0; i < effectiveBallCount; i++) {
                const p = ballParams[i];
                const dt = t * 0.001 * config.speed * p.dtFactor;
                const th = p.st + dt;
                const x = Math.cos(th); const y = Math.sin(th + dt * p.toggle);
                metaBallsUniform[i].set(x * p.baseScale * config.clumpFactor, y * p.baseScale * config.clumpFactor, p.radius);
            }

            let targetX, targetY;
            if (pointerInside) { targetX = pointerX; targetY = pointerY; }
            else {
                const cx = gl.canvas.width * 0.5; const cy = gl.canvas.height * 0.5;
                const rx = gl.canvas.width * 0.15; const ry = gl.canvas.height * 0.15;
                targetX = cx + Math.cos(t * 0.001 * config.speed) * rx;
                targetY = cy + Math.sin(t * 0.001 * config.speed) * ry;
            }
            mouseBallPos.x += (targetX - mouseBallPos.x) * config.hoverSmoothness;
            mouseBallPos.y += (targetY - mouseBallPos.y) * config.hoverSmoothness;
            program.uniforms.iMouse.value.set(mouseBallPos.x, mouseBallPos.y, 0);

            renderer.render({ scene: mesh });
        }
    });
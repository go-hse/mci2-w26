// main_webgpu.mjs — WebGPU: ein rotierendes Dreieck mit eigenem Shader
const canvas = document.getElementById('game');
const info = document.getElementById('info');

// 1. Unterstützung prüfen: navigator.gpu → Adapter → Device
if (!navigator.gpu) {
    info.textContent = 'WebGPU wird von diesem Browser nicht unterstützt.';
    throw new Error('Kein navigator.gpu');
}
const adapter = await navigator.gpu.requestAdapter();   // Top-Level-await im Modul
if (!adapter) {
    info.textContent = 'Kein passender Grafikadapter gefunden.';
    throw new Error('Kein GPU-Adapter');
}
const device = await adapter.requestDevice();

// 2. Canvas mit dem Device verbinden
const ctx = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
ctx.configure({ device, format, alphaMode: 'opaque' });

// 3. Shader in WGSL: Vertex-Shader positioniert, Fragment-Shader färbt
const shader = device.createShaderModule({
    code: /* wgsl */ `
        struct Uniforms { winkel: f32, seitenverhaeltnis: f32 };
        @group(0) @binding(0) var<uniform> u: Uniforms;

        struct VSOut {
            @builtin(position) pos: vec4f,
            @location(0) farbe: vec3f,
        };

        @vertex fn vs(@builtin(vertex_index) i: u32) -> VSOut {
            var p = array<vec2f, 3>(vec2f(0.0, 0.6), vec2f(-0.52, -0.3), vec2f(0.52, -0.3));
            var f = array<vec3f, 3>(vec3f(0.0, 0.67, 0.86), vec3f(0.10, 0.19, 0.35), vec3f(0.71, 0.09, 0.24));
            let c = cos(u.winkel);
            let s = sin(u.winkel);
            let q = vec2f(c * p[i].x - s * p[i].y, s * p[i].x + c * p[i].y);
            var o: VSOut;
            o.pos = vec4f(q.x / u.seitenverhaeltnis, q.y, 0.0, 1.0);
            o.farbe = f[i];
            return o;
        }

        @fragment fn fs(@location(0) farbe: vec3f) -> @location(0) vec4f {
            return vec4f(farbe, 1.0);
        }
    `,
});

// 4. Pipeline: welche Shader, welches Ausgabeformat, welche Primitive
const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: shader, entryPoint: 'vs' },
    fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
});

// 5. Uniform-Puffer für Winkel und Seitenverhältnis
const uniforms = new Float32Array(4);                    // 16 Byte (Ausrichtung)
const uniformBuffer = device.createBuffer({
    size: uniforms.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
});

// 6. Render-Schleife: Befehle aufzeichnen und an die GPU schicken
function frame(now) {
    uniforms[0] = now / 1000;                            // Winkel in rad
    uniforms[1] = canvas.width / canvas.height;
    device.queue.writeBuffer(uniformBuffer, 0, uniforms);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: ctx.getCurrentTexture().createView(),
            clearValue: { r: 0.94, g: 0.94, b: 0.94, a: 1 },  // entspricht clearRect
            loadOp: 'clear',
            storeOp: 'store',
        }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);                                        // 3 Ecken = 1 Dreieck
    pass.end();
    device.queue.submit([encoder.finish()]);

    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
info.textContent = `WebGPU aktiv, Canvas-Format: ${format}`;

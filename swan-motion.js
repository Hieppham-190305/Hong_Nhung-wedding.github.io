'use strict';
/* Articulated illustration: a continuous mesh bends the neck and wings without
   cutting the painting into rigid parts. Existing CSS is the no-WebGL fallback. */
function initializeSwanScene(scene) {
  if (!scene || scene.dataset.rendererStarted) return;
  scene.dataset.rendererStarted = 'true';
  const isOpeningScene = Boolean(scene.closest('.wedding-prologue, .welcome-envelope'));
  const blockedByEnvelope = () => !isOpeningScene && document.body.classList.contains('welcome-open');
  const canvas = document.createElement('canvas');
  canvas.className = 'swan-film'; canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) { console.warn('Swan animation: WebGL unavailable'); return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, last = 0, elapsed = 0, alive = true, ready = false;
  let visible = true, width = 1, height = 1;
  const programs = [], shaders = [], buffers = [], textures = [];
  let resizeObserver, visibilityObserver, preferenceObserver;

  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function cleanUp() {
    alive = false; stop();
    resizeObserver?.disconnect(); visibilityObserver?.disconnect(); preferenceObserver?.disconnect();
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync);
    scene.classList.remove('mesh-ready'); canvas.remove();
    if (!gl.isContextLost()) {
      programs.forEach(p => gl.deleteProgram(p)); shaders.forEach(s => gl.deleteShader(s));
      buffers.forEach(b => gl.deleteBuffer(b)); textures.forEach(t => gl.deleteTexture(t));
    }
  }
  scene.addEventListener('swan-scene-destroy', cleanUp, { once: true });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); cleanUp(); });
  function program(vertexSource, fragmentSource) {
    function compile(type, source) {
      const shader = gl.createShader(type); shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Animation shader unavailable');
      return shader;
    }
    const p = gl.createProgram(); programs.push(p);
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vertexSource)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragmentSource)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'Animation program unavailable');
    return p;
  }
  function uniform(p, name) { return gl.getUniformLocation(p, name); }
  function buffer(values) { const b = gl.createBuffer(); buffers.push(b); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW); return b; }
  function attribute(p, b) { gl.bindBuffer(gl.ARRAY_BUFFER, b); const a = gl.getAttribLocation(p, 'a_point'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0); }
  function texture(image) {
    const t = gl.createTexture(); textures.push(t); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return t;
  }
  function image(url) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; }); }

  try {
    const lake = program(`
      attribute vec2 a_point; varying vec2 v_uv;
      void main(){ v_uv=a_point; gl_Position=vec4(a_point.x*2.0-1.0,1.0-a_point.y*2.0,0.0,1.0); }
    `, `
      precision mediump float; uniform sampler2D u_image; uniform float u_aspect; uniform float u_time; varying vec2 v_uv;
      void main(){
        vec2 uv=v_uv; float ratio=u_aspect/(2.0/3.0);
        if(ratio>1.0) uv.y=(uv.y-.5)/ratio+.5; else uv.x=(uv.x-.5)*ratio+.5;
        float water=smoothstep(.30,.43,uv.y)*(1.0-smoothstep(.88,.98,uv.y));
        uv.x+=water*(sin(uv.y*115.0+u_time*.72)*.0017+sin(uv.y*64.0-u_time*.5)*.0011);
        uv.y+=water*sin(uv.x*22.0+u_time*.55)*.0009;
        vec3 color=texture2D(u_image,uv).rgb;
        float gray=dot(color,vec3(.299,.587,.114)); color=mix(vec3(gray),color,.8);
        gl_FragColor=vec4(color,1.0);
      }
    `);
    const bird = program(`
      precision highp float; attribute vec2 a_point;
      uniform vec2 u_size; uniform vec4 u_rect; uniform float u_time; uniform float u_side; uniform mediump float u_reflection;
      varying vec2 v_uv; varying float v_depth;
      void main(){
        vec2 q=a_point; if(u_side>.5) q.x=1.0-q.x;
        float phase=mod(u_time,20.0)/20.0*6.2831853;
        float near=pow(.5-.5*cos(phase),1.1);
        float neck=smoothstep(.53,.72,q.x)*(1.0-smoothstep(.64,.80,q.y));
        float angle=(.008+near*.078+sin(u_time*.7+u_side*.55)*.012)*neck;
        vec2 base=vec2(.77,.73); vec2 d=q-base;
        q=base+mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*d;
        float wing=(1.0-smoothstep(.47,.70,q.x))*smoothstep(.18,.38,q.y)*(1.0-smoothstep(.72,.84,q.y));
        float breath=.5-.5*cos(u_time*.85+u_side*1.2);
        q.y-=wing*(.008+.027*breath); q.x-=wing*.012*breath;
        float head=smoothstep(.70,.88,q.x)*(1.0-smoothstep(.37,.52,q.y));
        q.y+=head*.008*sin(u_time*.65+u_side*.8);
        if(u_side>.5) q.x=1.0-q.x;
        float rock=sin(u_time*.8+u_side*2.0)*.006;
        vec2 b=q-vec2(.5,.81); q=vec2(.5,.81)+mat2(cos(rock),sin(rock),-sin(rock),cos(rock))*b;
        float direction=u_side<.5?1.0:-1.0;
        float approach=(-.025+.045*near)*u_size.x*direction;
        float bob=sin(u_time*1.12+u_side*2.2)*1.35;
        vec2 position=u_rect.xy+q*u_rect.zw+vec2(approach,bob);
        float waterline=u_rect.y+u_rect.w*.81+bob;
        v_depth=0.0;
        if(u_reflection>.5){
          position.y=waterline+(waterline-position.y)*.43+2.0;
          v_depth=(position.y-waterline)/u_rect.w;
          position.x+=sin(position.y*.14+u_time*1.1)*1.3;
        }
        v_uv=vec2((a_point.x+u_side)*.5,a_point.y);
        gl_Position=vec4(position.x/u_size.x*2.0-1.0,1.0-position.y/u_size.y*2.0,0.0,1.0);
      }
    `, `
      precision mediump float; uniform sampler2D u_image; uniform mediump float u_reflection; varying vec2 v_uv; varying float v_depth;
      void main(){
        vec4 color=texture2D(u_image,v_uv);
        if(u_reflection>.5){ if(v_depth<0.0) discard; color.a*=.19*max(0.0,1.0-v_depth*5.0); }
        if(color.a<.004) discard;
        gl_FragColor=color;
      }
    `);
    const quad = buffer([0,0,1,0,0,1,0,1,1,0,1,1]);
    const points = [];
    const columns = 32, rows = 40;
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const l=x/columns,r=(x+1)/columns,t=y/rows,b=(y+1)/rows;
      points.push(l,t,r,t,l,b,l,b,r,t,r,b);
    }
    const mesh = buffer(points);
    const lakeU = Object.fromEntries(['u_image','u_aspect','u_time'].map(k => [k, uniform(lake,k)]));
    const birdU = Object.fromEntries(['u_image','u_size','u_rect','u_time','u_side','u_reflection'].map(k => [k, uniform(bird,k)]));
    let lakeTexture, birdTexture;

    function resize() {
      const bounds=scene.getBoundingClientRect(); width=Math.max(1,bounds.width); height=Math.max(1,bounds.height);
      const ratio=Math.min(devicePixelRatio||1,1.7,1080/Math.max(width,height));
      canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
      gl.viewport(0,0,canvas.width,canvas.height);
      if(ready) render(elapsed);
    }
    function render(time) {
      if (!ready || !alive) return;
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND); gl.useProgram(lake); attribute(lake,quad); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,lakeTexture);
      gl.uniform1i(lakeU.u_image,0); gl.uniform1f(lakeU.u_aspect,width/height); gl.uniform1f(lakeU.u_time,time); gl.drawArrays(gl.TRIANGLES,0,6);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(bird); attribute(bird,mesh); gl.bindTexture(gl.TEXTURE_2D,birdTexture);
      gl.uniform1i(birdU.u_image,0); gl.uniform2f(birdU.u_size,width,height); gl.uniform1f(birdU.u_time,time);
      const w=Math.min(width*.47,height*.48),h=w*4/3,top=height*.82-h;
      for (const reflected of [1,0]) for (const side of [0,1]) {
        gl.uniform1f(birdU.u_side,side); gl.uniform1f(birdU.u_reflection,reflected);
        gl.uniform4f(birdU.u_rect,side ? width*.515 : width*.485-w,top,w,h);
        gl.drawArrays(gl.TRIANGLES,0,points.length/2);
      }
    }
    function tick(now) {
      frame=0;
      if(!alive || !ready || document.hidden || !visible || reduced.matches || document.body.classList.contains('motion-paused') || blockedByEnvelope()) return;
      if(!last) last=now;
      const delta=now-last;
      if(delta>=1000/30) { elapsed+=Math.min(delta,100)/1000; last=now; render(elapsed); }
      frame=requestAnimationFrame(tick);
    }
    function start() { if(!frame && alive && ready) frame=requestAnimationFrame(tick); }
    // Assigned before asynchronous image loading or observers can call it.
    sync = function () {
      if(!ready || !alive) return;
      stop();
      if(reduced.matches || document.body.classList.contains('motion-paused')) render(8);
      else if(!document.hidden && visible && !blockedByEnvelope()) { render(elapsed); start(); }
    };
    Promise.all([image(scene.querySelector('.swan-lake').src), image(scene.querySelector('.swan-sprite img').src)]).then(([background,sprites]) => {
      if(!alive) return;
      try {
        lakeTexture=texture(background); birdTexture=texture(sprites);
        scene.append(canvas); ready=true; resize(); scene.classList.add('mesh-ready');
        resizeObserver=new ResizeObserver(resize); resizeObserver.observe(scene);
        visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}); visibilityObserver.observe(scene);
        preferenceObserver=new MutationObserver(sync); preferenceObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
        reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync); sync();
      } catch (error) { console.warn('Swan animation fallback:', error.message); cleanUp(); }
    }).catch(cleanUp);
  } catch (error) { console.warn('Swan animation fallback:', error.message); cleanUp(); }
  // Hoisted for cleanup; replaced with the initialized renderer's lifecycle.
  function sync() {}
}
document.querySelectorAll('.swan-scene').forEach(initializeSwanScene);
document.addEventListener('wedding-scene-mounted', event => initializeSwanScene(event.target));

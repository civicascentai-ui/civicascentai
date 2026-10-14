/* CivicAscent AI: isolated Three.js Safari atmosphere experiment.
   Load only with ?codi3d=1. No site navigation, source art, or payment behavior changes.
   Three.js MIT: https://github.com/mrdoob/three.js/blob/master/LICENSE */
(async function () {
  const stage = document.querySelector(".world");
  if (!stage) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) {
    stage.dataset.codi3d = reduce ? "reduced-motion" : "save-data";
    return;
  }

  const surface = document.createElement("canvas");
  surface.className = "codi3d-atmosphere";
  surface.setAttribute("aria-hidden", "true");
  surface.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:.6";
  stage.appendChild(surface);

  let renderer, geometry, material, raf = 0, destroyed = false;
  let pause = document.hidden;
  const fallback = (reason) => {
    if (raf) cancelAnimationFrame(raf);
    if (renderer) renderer.dispose();
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    surface.remove();
    stage.dataset.codi3d = reason;
  };

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js");
    if (!surface.isConnected || destroyed) return;
    renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 70);
    camera.position.z = 18;
    const count = Math.min(95, (navigator.hardwareConcurrency || 4) <= 2 ? 45 : 95);
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 29;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 17;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(coords, 3));
    material = new THREE.PointsMaterial({ color: 0xffd393, size: 0.10, transparent: true, opacity: 0.68, depthWrite: false, sizeAttenuation: true });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const resize = () => {
      if (destroyed) return;
      const width = stage.clientWidth || window.innerWidth;
      const height = stage.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const visibility = () => {
      pause = document.hidden;
      if (!pause && !raf) raf = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", visibility);

    let last = 0;
    function animate(now) {
      raf = 0;
      if (destroyed || pause || !surface.isConnected) return;
      if (now - last >= 33) { // cap animations at approximately 30 fps
        last = now;
        particles.rotation.y = Math.sin(now * 0.00008) * 0.08;
        particles.position.y = Math.sin(now * 0.00012) * 0.20;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(animate);
    }
    const motionChange = (e) => {
      if (e.matches) {
        destroyed = true;
        fallback("reduced-motion");
      }
    };
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", motionChange, { once: true });
    stage.dataset.codi3d = "running";
    if (!pause) raf = requestAnimationFrame(animate);
  } catch (err) {
    console.warn("3D experiment unavailable; preserving original Safari art.", err);
    fallback("fallback");
  }
})();
(function(){
  const canvas = document.getElementById("webglFx");
  if (!canvas || !window.THREE) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 800px), (pointer: coarse)").matches;
  let renderer, scene, camera, world, particles, core, halo;
  const rings = [];
  const rails = [];
  const nodes = [];
  let running = false;
  let raf = 0;

  function seeded(n){
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function makeRing(radius, segments){
    const pts = [];
    for(let i=0;i<segments;i++){
      const a = i / segments * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a)*radius, Math.sin(a)*radius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  function init(){
    try{
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !mobile,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.55));
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x07111f, mobile ? 0.021 : 0.016);

      camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 360);
      camera.position.set(0, 0, 8);

      world = new THREE.Group();
      scene.add(world);

      const gold = 0xe0b65a;
      const blue = 0x53749b;
      const white = 0xf4f6f8;

      for(let i=0;i<48;i++){
        const geom = makeRing(3.2 + Math.sin(i*.63)*.34, mobile ? 64 : 96);
        const mat = new THREE.LineBasicMaterial({
          color: i%6===0 ? gold : blue,
          transparent: true,
          opacity: i%6===0 ? .19 : .065,
          depthWrite: false
        });
        const ring = new THREE.LineLoop(geom, mat);
        ring.position.z = -i*3.25;
        ring.scale.set(1.56 + Math.sin(i*.22)*.08, .90 + Math.cos(i*.27)*.05, 1);
        ring.rotation.z = i*.03;
        world.add(ring);
        rings.push(ring);
      }

      const railMat = new THREE.LineBasicMaterial({
        color: blue,
        transparent: true,
        opacity: .055,
        depthWrite: false
      });

      for(let i=0;i<(mobile?14:24);i++){
        const verts=[];
        const side=i%2===0?-1:1;
        const baseX=side*(4.4+seeded(i+10)*3.8);
        const baseY=(seeded(i+30)-.5)*6.6;
        for(let s=0;s<22;s++){
          const z=7-s*7.2;
          const x=baseX+Math.sin(s*.72+i)*.52;
          const y=baseY+Math.cos(s*.55+i)*.34;
          verts.push(x,y,z);
          if(s<21) verts.push(x,y,z-4.6);
        }
        const g=new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
        const line=new THREE.LineSegments(g,railMat.clone());
        world.add(line);
        rails.push(line);
      }

      const nodeGeom=new THREE.SphereGeometry(.035,6,6);
      for(let i=0;i<(mobile?45:90);i++){
        const mat=new THREE.MeshBasicMaterial({
          color:white,transparent:true,
          opacity:.12+seeded(i+90)*.42
        });
        const node=new THREE.Mesh(nodeGeom,mat);
        const a=seeded(i+100)*Math.PI*2;
        const r=4.0+seeded(i+200)*7.8;
        node.position.set(
          Math.cos(a)*r,
          Math.sin(a)*r*.72,
          7-seeded(i+300)*165
        );
        world.add(node);
        nodes.push(node);
      }

      const count=mobile?650:1500;
      const pos=new Float32Array(count*3);
      for(let i=0;i<count;i++){
        pos[i*3]=(seeded(i+400)-.5)*30;
        pos[i*3+1]=(seeded(i+700)-.5)*18;
        pos[i*3+2]=10-seeded(i+1000)*175;
      }
      const pg=new THREE.BufferGeometry();
      pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
      const pm=new THREE.PointsMaterial({
        color:white,
        size:mobile?.032:.043,
        transparent:true,
        opacity:.48,
        depthWrite:false,
        sizeAttenuation:true
      });
      particles=new THREE.Points(pg,pm);
      world.add(particles);

      core=new THREE.Mesh(
        new THREE.SphereGeometry(1.05,24,14),
        new THREE.MeshBasicMaterial({color:gold,transparent:true,opacity:.055,depthWrite:false})
      );
      core.position.set(0,0,-145);
      core.scale.set(1.7,1.05,.75);
      world.add(core);

      halo=new THREE.Mesh(
        new THREE.RingGeometry(1.55,1.62,72),
        new THREE.MeshBasicMaterial({color:gold,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide})
      );
      halo.position.set(0,0,-143);
      world.add(halo);

      running=true;
      resize();
      animate(0);
    }catch(err){
      console.warn("CivicAscent WebGL layer unavailable:",err);
      canvas.style.display="none";
    }
  }

  function scrollProgress(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    return Math.max(0,Math.min(1,scrollY/max));
  }

  function render(t){
    if(!running) return;
    const p=scrollProgress();
    const travel=p*150;

    camera.position.z=8-travel;
    camera.position.x=Math.sin(p*Math.PI*5.0)*.48 + Math.sin(t*.00018)*.06;
    camera.position.y=Math.cos(p*Math.PI*3.8)*.26 + Math.cos(t*.00016)*.05;
    camera.lookAt(
      Math.sin(p*Math.PI*2.1)*.42,
      Math.cos(p*Math.PI*1.8)*.16,
      camera.position.z-19
    );

    world.rotation.z=Math.sin(t*.00007)*.012+p*.035;

    for(let i=0;i<rings.length;i++){
      const ring=rings[i];
      ring.rotation.z=i*.03 + t*.000018*(i%2?1:-1);
      ring.material.opacity=(i%6===0?.18:.06)*(.9+.1*Math.sin(t*.0008+i));
    }

    if(particles){
      particles.rotation.z=t*.000008;
      particles.position.z=Math.sin(t*.00011)*.12;
    }
    for(let i=0;i<nodes.length;i++){
      const s=.8+.35*(.5+.5*Math.sin(t*.001+i));
      nodes[i].scale.setScalar(s);
    }

    if(core){
      core.material.opacity=.045+.025*(.5+.5*Math.sin(t*.0007));
      halo.material.opacity=.15+.05*(.5+.5*Math.sin(t*.0009));
    }

    renderer.render(scene,camera);
  }

  function animate(t){
    render(t);
    raf=requestAnimationFrame(animate);
  }

  function resize(){
    if(!running) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.15:1.55));
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }

  addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden && raf){
      cancelAnimationFrame(raf);raf=0;
    }else if(!document.hidden && running && !raf){
      raf=requestAnimationFrame(animate);
    }
  });

  if(reduced){
    canvas.style.display="none";
    return;
  }
  init();
})();
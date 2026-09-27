(function(){
  const doc = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chapters = [...document.querySelectorAll(".chapter")];
  const railLinks = [...document.querySelectorAll(".chapter-rail a")];
  const progress = document.getElementById("progress");
  const chapterName = document.getElementById("chapterName");
  const langToggle = document.getElementById("langToggle");
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  const canvas = document.getElementById("fx");
  const goalButtons = [...document.querySelectorAll("[data-goal]")];
  const goalOutput = document.getElementById("goalOutput");

  let globalProgress = 0;
  let activeIndex = 0;
  let lenis = null;
  let animationFrame = 0;
  let renderer = null;
  let scene = null;
  let camera = null;
  let world = null;
  let rings = [];
  let particles = null;
  let nodes = [];
  let webglReady = false;
  let lastTime = 0;

  const goalCopy = {
    everyday:{
      en:"Plan, compare options, organize information, draft messages and turn a confusing task into clear steps.",
      es:"Planifica, compara opciones, organiza información, redacta mensajes y convierte una tarea confusa en pasos claros."
    },
    work:{
      en:"Draft clearer communication, summarize material, prepare meetings, organize projects and create repeatable workflows.",
      es:"Redacta comunicaciones más claras, resume material, prepara reuniones, organiza proyectos y crea flujos repetibles."
    },
    learning:{
      en:"Ask for explanations at your level, generate practice questions, compare ideas and get feedback as you learn.",
      es:"Pide explicaciones a tu nivel, genera preguntas de práctica, compara ideas y recibe retroalimentación mientras aprendes."
    },
    business:{
      en:"Research a market, shape an offer, prepare customer communication, organize operations and test ideas before investing heavily.",
      es:"Investiga un mercado, define una oferta, prepara comunicación con clientes, organiza operaciones y prueba ideas antes de invertir mucho."
    }
  };

  function currentLang(){ return body.classList.contains("es") ? "es" : "en"; }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function smoothstep(a,b,x){
    const t = clamp((x-a)/(b-a),0,1);
    return t*t*(3-2*t);
  }

  function updateGoal(){
    if(!goalOutput) return;
    const active = goalButtons.find(b => b.getAttribute("aria-pressed")==="true");
    const key = active ? active.dataset.goal : "everyday";
    goalOutput.textContent = goalCopy[key][currentLang()];
  }

  goalButtons.forEach(btn=>{
    btn.addEventListener("click",()=>{
      goalButtons.forEach(b=>b.setAttribute("aria-pressed","false"));
      btn.setAttribute("aria-pressed","true");
      updateGoal();
    });
  });

  function chapterLabel(chapter){
    const en = chapter.dataset.labelEn || "";
    const es = chapter.dataset.labelEs || en;
    return currentLang()==="es" ? es : en;
  }

  function updateHUD(index){
    activeIndex = Math.max(0,Math.min(chapters.length-1,index));
    const chapter = chapters[activeIndex];
    if(chapterName){
      chapterName.textContent = String(activeIndex).padStart(2,"0")+" · "+chapterLabel(chapter);
    }
    railLinks.forEach((a,i)=>a.classList.toggle("active",i===activeIndex));
  }

  function setLanguage(isEs){
    const y = scrollY;
    body.classList.toggle("es",isEs);
    doc.lang = isEs ? "es" : "en";
    langToggle.textContent = isEs ? "EN" : "ES";
    langToggle.setAttribute("aria-pressed",String(isEs));
    try{ localStorage.setItem("civicascent-lang",isEs ? "es":"en"); }catch(e){}
    updateGoal();
    updateHUD(activeIndex);
    requestAnimationFrame(()=>scrollTo(0,y));
  }

  let saved = null;
  try{ saved = localStorage.getItem("civicascent-lang"); }catch(e){}
  setLanguage(saved==="es");
  langToggle.addEventListener("click",()=>setLanguage(!body.classList.contains("es")));

  function closeMenu(){
    menu.classList.remove("open");
    body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden","true");
    menuToggle.setAttribute("aria-expanded","false");
  }

  menuToggle.addEventListener("click",()=>{
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open",open);
    body.classList.toggle("menu-open",open);
    menu.setAttribute("aria-hidden",String(!open));
    menuToggle.setAttribute("aria-expanded",String(open));
  });

  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
  addEventListener("keydown",e=>{ if(e.key==="Escape") closeMenu(); });

  function updateScenes(){
    const max = Math.max(1,doc.scrollHeight-innerHeight);
    globalProgress = clamp(scrollY/max,0,1);
    progress.style.width = (globalProgress*100).toFixed(3)+"%";

    const viewportMid = scrollY + innerHeight*.5;
    let bestIndex = 0;
    let bestDistance = Infinity;

    chapters.forEach((chapter,index)=>{
      const start = chapter.offsetTop;
      const length = chapter.offsetHeight-innerHeight;
      const local = length>0 ? clamp((scrollY-start)/length,0,1) : 0;
      const center = start + chapter.offsetHeight*.5;
      const distance = Math.abs(viewportMid-center);
      if(distance<bestDistance){ bestDistance=distance; bestIndex=index; }

      if(reduced){
        chapter.style.setProperty("--scene-opacity","1");
        chapter.style.setProperty("--scene-blur","0px");
        chapter.style.setProperty("--scene-y","0px");
        chapter.style.setProperty("--scene-scale","1");
        return;
      }

      const fadeIn = smoothstep(.015,.19,local);
      const fadeOut = 1-smoothstep(.71,.955,local);
      const opacity = clamp(fadeIn*fadeOut,0,1);
      const y = (1-fadeIn)*46-(1-fadeOut)*44;
      const scale = .95 + opacity*.05;
      const blur = (1-opacity)*12;

      chapter.style.setProperty("--scene-opacity",opacity.toFixed(3));
      chapter.style.setProperty("--scene-blur",blur.toFixed(2)+"px");
      chapter.style.setProperty("--scene-y",y.toFixed(2)+"px");
      chapter.style.setProperty("--scene-scale",scale.toFixed(4));

      const title = chapter.querySelector(".title,.hero-title:not(.ghost)");
      if(title){
        const titleScale = .98 + local*.08;
        const titleY = (local-.5)*-34;
        title.style.transform = "translate3d(0,"+titleY.toFixed(1)+"px,0) scale("+titleScale.toFixed(4)+")";
      }

      const bodyNode = chapter.querySelector(".scene-body");
      if(bodyNode){
        bodyNode.style.transform = "translate3d(0,"+((.5-local)*34).toFixed(1)+"px,0)";
      }
    });

    if(bestIndex!==activeIndex) updateHUD(bestIndex);
  }

  function seeded(n){
    const x = Math.sin(n*12.9898+78.233)*43758.5453;
    return x-Math.floor(x);
  }

  function makeCircleGeometry(radius, segments){
    const points = [];
    for(let i=0;i<segments;i++){
      const a=(i/segments)*Math.PI*2;
      points.push(new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }

  function initWebGL(){
    if(!window.THREE || reduced) return false;

    try{
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: innerWidth>700,
        alpha:false,
        powerPreference:"high-performance"
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
      renderer.setSize(innerWidth,innerHeight,false);
      renderer.setClearColor(0x050507,1);
      if("outputColorSpace" in renderer && THREE.SRGBColorSpace){
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050507);
      scene.fog = new THREE.FogExp2(0x050507,0.018);

      camera = new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,320);
      camera.position.set(0,0,9);

      world = new THREE.Group();
      scene.add(world);

      const gold = new THREE.Color(0xd6a84b);
      const cool = new THREE.Color(0x768399);
      const pale = new THREE.Color(0xe8e8e5);

      // Long architectural tunnel built from real 3D rings.
      for(let i=0;i<42;i++){
        const radius = 3.5 + Math.sin(i*.72)*.38 + (i%5)*.04;
        const geom = makeCircleGeometry(radius,96);
        const material = new THREE.LineBasicMaterial({
          color:i%5===0 ? gold : cool,
          transparent:true,
          opacity:i%5===0 ? .22 : .085,
          depthWrite:false
        });
        const ring = new THREE.LineLoop(geom,material);
        ring.position.z = -i*3.6;
        ring.scale.x = 1.52 + Math.sin(i*.31)*.08;
        ring.scale.y = .93 + Math.cos(i*.27)*.05;
        ring.rotation.z = i*.035;
        ring.rotation.x = Math.sin(i*.41)*.025;
        world.add(ring);
        rings.push(ring);
      }

      // Repeating circuit-like rails along the tunnel walls.
      const railsMaterial = new THREE.LineBasicMaterial({
        color:0x707f98,
        transparent:true,
        opacity:.075,
        depthWrite:false
      });
      for(let rail=0;rail<26;rail++){
        const side = rail%2===0 ? -1 : 1;
        const y = (seeded(rail+10)-.5)*6.0;
        const x = side*(4.7+seeded(rail+20)*3.8);
        const verts = [];
        for(let s=0;s<18;s++){
          const z = 5-s*8.5-seeded(rail*31+s)*1.1;
          const stepX = x + Math.sin(s*.8+rail)*.55;
          const stepY = y + Math.cos(s*.55+rail)*.32;
          verts.push(stepX,stepY,z);
          if(s<17){
            verts.push(stepX,stepY,z-5.2);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
        const line = new THREE.LineSegments(g,railsMaterial.clone());
        world.add(line);
      }

      // Sparse 3D network nodes.
      const nodeGeometry = new THREE.SphereGeometry(.035,8,8);
      const nodeMaterial = new THREE.MeshBasicMaterial({color:pale,transparent:true,opacity:.5});
      for(let i=0;i<90;i++){
        const node = new THREE.Mesh(nodeGeometry,nodeMaterial.clone());
        const angle=seeded(i+100)*Math.PI*2;
        const radius=4.2+seeded(i+200)*7;
        node.position.set(
          Math.cos(angle)*radius,
          Math.sin(angle)*radius*.72,
          4-seeded(i+300)*155
        );
        node.material.opacity=.12+seeded(i+400)*.45;
        world.add(node);
        nodes.push(node);
      }

      // Star/particle volume.
      const particleCount = innerWidth<700 ? 650 : 1450;
      const positions = new Float32Array(particleCount*3);
      for(let i=0;i<particleCount;i++){
        positions[i*3]=(seeded(i+501)-.5)*28;
        positions[i*3+1]=(seeded(i+701)-.5)*18;
        positions[i*3+2]=10-seeded(i+901)*175;
      }
      const pGeom = new THREE.BufferGeometry();
      pGeom.setAttribute("position",new THREE.BufferAttribute(positions,3));
      const pMat = new THREE.PointsMaterial({
        color:0xe9e9e5,
        size:innerWidth<700?.035:.045,
        transparent:true,
        opacity:.48,
        depthWrite:false,
        sizeAttenuation:true
      });
      particles = new THREE.Points(pGeom,pMat);
      world.add(particles);

      // Soft singularity core far ahead in the journey.
      const coreGeom = new THREE.SphereGeometry(1.0,32,16);
      const coreMat = new THREE.MeshBasicMaterial({
        color:gold,
        transparent:true,
        opacity:.055,
        depthWrite:false
      });
      const core = new THREE.Mesh(coreGeom,coreMat);
      core.position.set(0,0,-138);
      core.scale.set(1.5,1.0,.7);
      world.add(core);

      const haloGeom = new THREE.RingGeometry(1.5,1.56,96);
      const haloMat = new THREE.MeshBasicMaterial({
        color:gold,
        side:THREE.DoubleSide,
        transparent:true,
        opacity:.22,
        depthWrite:false
      });
      const halo = new THREE.Mesh(haloGeom,haloMat);
      halo.position.set(0,0,-136.5);
      world.add(halo);

      webglReady=true;
      return true;
    }catch(err){
      console.warn("WebGL initialization failed; content remains available.",err);
      canvas.style.display="none";
      webglReady=false;
      return false;
    }
  }

  function resizeWebGL(){
    if(!webglReady) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }

  function renderWebGL(time){
    if(!webglReady) return;

    const p = globalProgress;
    const travel = p*143;
    camera.position.z = 9-travel;

    // Slow camera drift creates parallax without disorienting the user.
    camera.position.x = Math.sin(p*Math.PI*5.2)*.48 + Math.sin(time*.00019)*.08;
    camera.position.y = Math.cos(p*Math.PI*3.7)*.26 + Math.cos(time*.00017)*.05;
    camera.rotation.z = Math.sin(p*Math.PI*4)*.008;
    camera.rotation.y = Math.sin(p*Math.PI*3)*.012;

    const focusZ = camera.position.z-18;
    camera.lookAt(
      Math.sin(p*Math.PI*2.2)*.45,
      Math.cos(p*Math.PI*1.9)*.18,
      focusZ
    );

    world.rotation.z = Math.sin(time*.00008)*.012 + p*.04;

    rings.forEach((ring,i)=>{
      ring.rotation.z = i*.035 + time*.000018*(i%2===0?1:-1);
      ring.material.opacity = (i%5===0?.20:.07) * (.88+.12*Math.sin(time*.0009+i));
    });

    if(particles){
      particles.rotation.z = time*.00001;
      particles.position.z = Math.sin(time*.00012)*.15;
    }

    nodes.forEach((node,i)=>{
      node.scale.setScalar(.8+.45*(.5+.5*Math.sin(time*.001+i)));
    });

    renderer.render(scene,camera);
  }

  function frame(time){
    lastTime=time;
    updateScenes();
    renderWebGL(time);
    animationFrame=requestAnimationFrame(frame);
  }

  if(!reduced && window.Lenis){
    lenis=new Lenis({
      duration:1.18,
      smoothWheel:true,
      wheelMultiplier:.88,
      touchMultiplier:1.02
    });
    function lenisRaf(time){
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);

    railLinks.forEach((a,i)=>{
      a.addEventListener("click",e=>{
        e.preventDefault();
        lenis.scrollTo(chapters[i],{offset:0,duration:1.25});
      });
    });
  }

  initWebGL();
  updateScenes();
  renderWebGL(0);

  addEventListener("resize",resizeWebGL,{passive:true});
  addEventListener("scroll",()=>{
    if(reduced) updateScenes();
  },{passive:true});

  document.addEventListener("visibilitychange",()=>{
    if(reduced) return;
    if(document.hidden && animationFrame){
      cancelAnimationFrame(animationFrame);
      animationFrame=0;
    }else if(!document.hidden && !animationFrame){
      animationFrame=requestAnimationFrame(frame);
    }
  });

  if(!reduced){
    animationFrame=requestAnimationFrame(frame);
  }

  const year=document.getElementById("year");
  if(year) year.textContent=new Date().getFullYear();
})();
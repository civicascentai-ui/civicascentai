(()=>{
  const canvas=document.getElementById('cosmos');
  let ctx=null;
  try{ctx=canvas&&canvas.getContext('2d',{alpha:false,desynchronized:true})}catch(e){}
  if(!ctx){
    document.body.classList.add('ready');
    const lang=document.getElementById('lang');
    const replay=document.getElementById('replay');
    function setFallbackLang(es){
      document.body.classList.toggle('es',es);
      document.documentElement.lang=es?'es':'en';
      lang.textContent=es?'EN':'ES';
      lang.setAttribute('aria-pressed',String(es));
      lang.setAttribute('aria-label',es?'Cambiar idioma a inglés':'Switch language to Spanish');
      replay.setAttribute('aria-label',es?'Repetir animación de introducción':'Replay introduction animation');
      document.getElementById('home-brand').setAttribute('aria-label',es?'Inicio de CivicAscent AI':'CivicAscent AI home');
      try{localStorage.setItem('civicascent-lang',es?'es':'en')}catch(e){}
    }
    let saved='';try{saved=localStorage.getItem('civicascent-lang')||''}catch(e){}
    setFallbackLang(saved==='es');
    replay.disabled=true;
    const unavailable=()=>document.body.classList.contains('es')?'Animación no disponible':'Animation unavailable';
    function updateReplay(){replay.setAttribute('aria-label',unavailable());replay.title=unavailable()}
    updateReplay();
    lang.addEventListener('click',()=>{setFallbackLang(!document.body.classList.contains('es'));updateReplay()});
    return;
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cue=document.getElementById('cue');
  const core=document.getElementById('core');
  const flash=document.getElementById('flash');
  const replay=document.getElementById('replay');
  const lang=document.getElementById('lang');
  const timeline=[...document.querySelectorAll('.timeline i')];

  let W=0,H=0,DPR=1,raf=0,start=0,last=0,stars=[],dust=[],pointerX=0,pointerY=0,phase=-1,ready=false;

  const words=['IMAGINE','CREATE','EXPLAIN','TRANSLATE','PLAN','BUILD'];
  const wordsEs=['IMAGINA','CREA','EXPLICA','TRADUCE','PLANIFICA','CONSTRUYE'];

  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function smooth(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}
  function hash(n){return (Math.sin(n*127.1)*43758.5453123)%1}

  function resize(){
    W=innerWidth;H=innerHeight;
    const maxPixels=innerWidth>=5000?34000000:innerWidth>=2500?18000000:9000000;
    DPR=Math.max(1,Math.min(devicePixelRatio||1,2.5,Math.sqrt(maxPixels/(W*H))));
    canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    seed();
  }

  function seed(){
    const base=Math.floor((W*H)/620);
    const count=clamp(base,900,2800);
    stars=Array.from({length:count},(_,i)=>({
      x:(Math.random()-.5)*2.25,
      y:(Math.random()-.5)*2.25,
      z:Math.random()*.985+.015,
      pz:1,
      s:.35+Math.random()*1.7,
      tint:Math.random()
    }));
    dust=Array.from({length:520},(_,i)=>({
      a:Math.random()*Math.PI*2,
      r:Math.pow(Math.random(),.62),
      z:Math.random(),
      s:.4+Math.random()*1.8,
      c:Math.random()
    }));
  }

  function background(t,intensity){
    ctx.globalCompositeOperation='source-over';
    const g=ctx.createRadialGradient(W*.55,H*.47,0,W*.55,H*.47,Math.max(W,H)*.78);
    g.addColorStop(0,'#071a38');g.addColorStop(.35,'#041126');g.addColorStop(1,'#01040a');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    const driftX=Math.sin(t*.00012)*W*.08,driftY=Math.cos(t*.0001)*H*.05;
    const neb=ctx.createRadialGradient(W*.72+driftX,H*.30+driftY,0,W*.72+driftX,H*.30+driftY,Math.max(W,H)*.48);
    neb.addColorStop(0,'rgba(48,113,255,'+(0.16+intensity*.08)+')');
    neb.addColorStop(.27,'rgba(90,42,176,.10)');
    neb.addColorStop(.62,'rgba(9,73,133,.05)');
    neb.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=neb;ctx.fillRect(0,0,W,H);

    const warm=ctx.createRadialGradient(W*.29-driftX*.3,H*.68-driftY*.4,0,W*.29-driftX*.3,H*.68-driftY*.4,Math.max(W,H)*.32);
    warm.addColorStop(0,'rgba(255,161,77,'+(0.035+intensity*.035)+')');
    warm.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=warm;ctx.fillRect(0,0,W,H);
  }

  function drawDust(t,intensity,cx,cy){
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<dust.length;i++){
      const p=dust[i];
      const a=p.a+t*.000035*(p.c>.5?1:-1);
      const rr=p.r*Math.min(W,H)*(.56+p.z*.30);
      const flatten=.38+.24*p.z;
      const x=cx+Math.cos(a)*rr;
      const y=cy+Math.sin(a)*rr*flatten;
      if(x<0||x>W||y<0||y>H)continue;
      const alpha=(.10+.24*(1-p.r))*(.5+intensity*.55);
      ctx.fillStyle=p.c>.65?'rgba(108,202,255,'+alpha+')':p.c>.32?'rgba(180,126,255,'+(alpha*.72)+')':'rgba(255,214,144,'+(alpha*.52)+')';
      const s=p.s*(.65+intensity*.25);
      ctx.fillRect(x,y,s,s);
    }
  }

  function drawStars(dt,speed,stretch,cx,cy,intensity){
    const m=Math.min(W,H)*.90;
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<stars.length;i++){
      const p=stars[i];
      p.pz=p.z;
      p.z-=speed*dt;
      if(p.z<.012){
        p.x=(Math.random()-.5)*2.25;p.y=(Math.random()-.5)*2.25;p.z=1;p.pz=1;
      }
      const inv=1/p.z, pinv=1/p.pz;
      const x=cx+p.x*inv*m*.52, y=cy+p.y*inv*m*.52;
      const px=cx+p.x*pinv*m*.52, py=cy+p.y*pinv*m*.52;
      if(x<-80||x>W+80||y<-80||y>H+80)continue;
      const depth=1-p.z;
      const alpha=clamp(.18+depth*.82,0,1);
      const dx=(x-px)*(1+stretch*3.8),dy=(y-py)*(1+stretch*3.8);
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x+dx,y+dy);
      const a=alpha*(.78+intensity*.22);
      ctx.strokeStyle=p.tint>.82?'rgba(115,205,255,'+a+')':p.tint<.12?'rgba(255,211,149,'+(a*.9)+')':'rgba(226,240,255,'+a+')';
      ctx.lineWidth=p.s*(.65+depth*1.2+stretch*.9);
      ctx.stroke();
      if(depth>.86){
        ctx.fillStyle='rgba(255,255,255,'+(alpha*.82)+')';
        ctx.fillRect(x-1,y-1,2.1,2.1);
      }
    }
    ctx.globalCompositeOperation='source-over';
  }

  function setCue(index){
    if(index===phase)return;
    phase=index;
    timeline.forEach((el,i)=>el.classList.toggle('on',i<=Math.min(index,4)));
    if(index>=0&&index<words.length){
      cue.textContent=document.body.classList.contains('es')?wordsEs[index]:words[index];
      cue.classList.remove('show');void cue.offsetWidth;cue.classList.add('show');
    }
  }

  function frame(now){
    raf=0;
    if(!last)last=now;
    const dt=Math.min(.035,(now-last)/1000);last=now;
    const sec=(now-start)/1000;
    const accel=smooth(.7,4.4,sec);
    const peak=smooth(3.8,5.15,sec);
    const settle=1-smooth(5.15,6.55,sec);
    let speed=.045+accel*.22+peak*.58;
    if(sec>5.15)speed=.032+settle*.52;
    if(sec>6.8)speed=.018;
    const stretch=clamp(accel*.6+peak*1.05,0,1.25);
    const intensity=clamp(.55+accel*.45,0,1);
    const cx=W*.5+Math.sin(now*.00018)*W*.018+pointerX*W*.02;
    const cy=H*.48+Math.cos(now*.00014)*H*.014+pointerY*H*.018;

    background(now,intensity);
    drawDust(now,intensity,cx,cy);
    drawStars(dt,speed,stretch,cx,cy,intensity);

    const idx=sec<1.15?-1:sec<1.9?0:sec<2.65?1:sec<3.4?2:sec<4.15?3:sec<4.9?4:sec<5.55?5:-1;
    setCue(idx);

    if(sec>5.0&&!flash.classList.contains('fire'))flash.classList.add('fire');
    if(sec>5.28&&!core.classList.contains('show'))core.classList.add('show');
    if(sec>6.72&&!ready){
      ready=true;document.body.classList.add('ready');
      timeline.forEach(el=>el.classList.add('on'));
    }
    raf=requestAnimationFrame(frame);
  }

  function run(){
    cancelAnimationFrame(raf);raf=0;
    if(document.hidden){finish();return;}
    document.body.classList.remove('ready');core.classList.remove('show');flash.classList.remove('fire');
    cue.classList.remove('show');timeline.forEach(el=>el.classList.remove('on'));
    ready=false;phase=-1;last=0;seed();start=performance.now();
    raf=requestAnimationFrame(frame);
  }

  function finish(){
    cancelAnimationFrame(raf);raf=0;
    ready=true;
    document.body.classList.add('ready');core.classList.remove('show');timeline.forEach(el=>el.classList.add('on'));
    background(0,0);
  }

  function setLang(es){
    document.body.classList.toggle('es',es);document.documentElement.lang=es?'es':'en';
    lang.textContent=es?'EN':'ES';lang.setAttribute('aria-pressed',String(es));
    lang.setAttribute('aria-label',es?'Cambiar idioma a inglés':'Switch language to Spanish');
    replay.setAttribute('aria-label',es?'Repetir animación de introducción':'Replay introduction animation');
    document.getElementById('home-brand').setAttribute('aria-label',es?'Inicio de CivicAscent AI':'CivicAscent AI home');
    try{localStorage.setItem('civicascent-lang',es?'es':'en')}catch(e){}
  }
  let saved='';try{saved=localStorage.getItem('civicascent-lang')||''}catch(e){}
  setLang(saved==='es');
  lang.addEventListener('click',()=>setLang(!document.body.classList.contains('es')));
  replay.addEventListener('click',()=>{if(reduced)finish();else run()});
  addEventListener('pointermove',e=>{pointerX=(e.clientX/W-.5);pointerY=(e.clientY/H-.5)},{passive:true});
  addEventListener('resize',()=>{resize();if(reduced)background(0,0)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(reduced)return;if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf){last=0;start=performance.now()-(ready?7000:Math.min(performance.now()-start,6720));raf=requestAnimationFrame(frame)}});

  resize();
  if(reduced)finish();else run();
})();
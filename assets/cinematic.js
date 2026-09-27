(function(){
  const doc=document.documentElement;
  const body=document.body;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile=matchMedia("(max-width: 800px), (pointer: coarse)").matches;
  const chapters=[...document.querySelectorAll(".chapter")];
  const railLinks=[...document.querySelectorAll(".chapter-rail a")];
  const progress=document.getElementById("progress");
  const chapterName=document.getElementById("chapterName");
  const langToggle=document.getElementById("langToggle");
  const menuToggle=document.getElementById("menuToggle");
  const menu=document.getElementById("menu");
  const canvas=document.getElementById("fx");
  const goalButtons=[...document.querySelectorAll("[data-goal]")];
  const goalOutput=document.getElementById("goalOutput");

  let activeIndex=0;
  let scrollProgress=0;
  let raf=0;
  let lastStarFrame=0;
  let ctx=null;
  let stars=[];
  let cw=0,ch=0,dpr=1;
  const STAR_COUNT=mobile?250:620;
  const STAR_FPS=mobile?40:60;
  const launchStarted=performance.now();

  const goalCopy={
    everyday:{en:"Plan, compare options, organize information, draft messages and turn a confusing task into clear steps.",es:"Planifica, compara opciones, organiza información, redacta mensajes y convierte una tarea confusa en pasos claros."},
    work:{en:"Draft clearer communication, summarize material, prepare meetings, organize projects and create repeatable workflows.",es:"Redacta comunicaciones más claras, resume material, prepara reuniones, organiza proyectos y crea flujos repetibles."},
    learning:{en:"Ask for explanations at your level, generate practice questions, compare ideas and get feedback as you learn.",es:"Pide explicaciones a tu nivel, genera preguntas de práctica, compara ideas y recibe retroalimentación mientras aprendes."},
    business:{en:"Research a market, shape an offer, prepare customer communication, organize operations and test ideas before investing heavily.",es:"Investiga un mercado, define una oferta, prepara comunicación con clientes, organiza operaciones y prueba ideas antes de invertir mucho."}
  };

  function currentLang(){return body.classList.contains("es")?"es":"en"}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function smoothstep(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}

  function updateGoal(){
    if(!goalOutput)return;
    const active=goalButtons.find(b=>b.getAttribute("aria-pressed")==="true");
    goalOutput.textContent=goalCopy[(active&&active.dataset.goal)||"everyday"][currentLang()];
  }
  goalButtons.forEach(btn=>btn.addEventListener("click",()=>{
    goalButtons.forEach(b=>b.setAttribute("aria-pressed","false"));
    btn.setAttribute("aria-pressed","true");
    updateGoal();
  }));

  function chapterLabel(chapter){
    const en=chapter.dataset.labelEn||"";
    return currentLang()==="es"?(chapter.dataset.labelEs||en):en;
  }
  function updateHUD(index){
    activeIndex=Math.max(0,Math.min(chapters.length-1,index));
    const chapter=chapters[activeIndex];
    if(chapterName)chapterName.textContent=String(activeIndex).padStart(2,"0")+" · "+chapterLabel(chapter);
    railLinks.forEach((a,i)=>a.classList.toggle("active",i===activeIndex));
  }
  function setLanguage(isEs){
    const y=scrollY;
    body.classList.toggle("es",isEs);
    doc.lang=isEs?"es":"en";
    if(langToggle){
      langToggle.textContent=isEs?"EN":"ES";
      langToggle.setAttribute("aria-pressed",String(isEs));
    }
    try{localStorage.setItem("civicascent-lang",isEs?"es":"en")}catch(e){}
    updateGoal();
    updateHUD(activeIndex);
    requestAnimationFrame(()=>scrollTo(0,y));
  }
  let saved=null;
  try{saved=localStorage.getItem("civicascent-lang")}catch(e){}
  setLanguage(saved==="es");
  if(langToggle)langToggle.addEventListener("click",()=>setLanguage(!body.classList.contains("es")));

  function closeMenu(){
    if(!menu||!menuToggle)return;
    menu.classList.remove("open");
    body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden","true");
    menuToggle.setAttribute("aria-expanded","false");
  }
  if(menuToggle&&menu){
    menuToggle.addEventListener("click",()=>{
      const open=!menu.classList.contains("open");
      menu.classList.toggle("open",open);
      body.classList.toggle("menu-open",open);
      menu.setAttribute("aria-hidden",String(!open));
      menuToggle.setAttribute("aria-expanded",String(open));
    });
    menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
    addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
  }

  function updateScenes(){
    const max=Math.max(1,doc.scrollHeight-innerHeight);
    scrollProgress=clamp(scrollY/max,0,1);
    if(progress)progress.style.width=(scrollProgress*100).toFixed(2)+"%";
    const mid=scrollY+innerHeight*.48;
    let best=0,dist=Infinity;

    chapters.forEach((chapter,index)=>{
      const center=chapter.offsetTop+chapter.offsetHeight*.5;
      const d=Math.abs(mid-center);
      if(d<dist){dist=d;best=index}
      if(mobile||reduced){
        chapter.style.setProperty("--scene-opacity","1");
        chapter.style.setProperty("--scene-blur","0px");
        chapter.style.setProperty("--scene-y","0px");
        chapter.style.setProperty("--scene-scale","1");
        return;
      }
      const length=Math.max(1,chapter.offsetHeight-innerHeight);
      const local=clamp((scrollY-chapter.offsetTop)/length,0,1);
      const fi=smoothstep(.01,.17,local);
      const fo=1-smoothstep(.76,.97,local);
      const opacity=clamp(fi*fo,0,1);
      chapter.style.setProperty("--scene-opacity",opacity.toFixed(3));
      chapter.style.setProperty("--scene-blur",((1-opacity)*7).toFixed(2)+"px");
      chapter.style.setProperty("--scene-y",(((1-fi)*26)-((1-fo)*24)).toFixed(1)+"px");
      chapter.style.setProperty("--scene-scale",(.975+opacity*.025).toFixed(4));
    });
    if(best!==activeIndex)updateHUD(best);
  }

  function resetStar(s,far){
    const spread=mobile?1.18:1.42;
    s.x=(Math.random()-.5)*cw*spread;
    s.y=(Math.random()-.5)*ch*spread;
    s.z=far?(Math.random()*cw*1.2+cw*.2):cw*1.15;
    s.pz=s.z+30;

    const layerRoll=Math.random();
    s.layer=layerRoll<.56?0:(layerRoll<.87?1:2); // far / mid / near
    const colorRoll=Math.random();
    s.kind=colorRoll<.14?2:(colorRoll<.46?1:0); // gold / blue / white

    const layerSize=s.layer===0?.7:(s.layer===1?1.15:1.75);
    const layerAlpha=s.layer===0?.64:(s.layer===1?.82:1);
    s.alpha=(.26+Math.random()*.7)*layerAlpha;
    s.size=(.5+Math.random()*1.55)*layerSize;
    s.twinkle=Math.random()*Math.PI*2;
  }

  function setupStars(){
    if(!canvas)return;
    ctx=canvas.getContext("2d",{alpha:false});
    dpr=Math.min(window.devicePixelRatio||1,mobile?1.35:1.7);
    cw=Math.max(1,innerWidth);
    ch=Math.max(1,innerHeight);
    canvas.width=Math.round(cw*dpr);
    canvas.height=Math.round(ch*dpr);
    canvas.style.width=cw+"px";
    canvas.style.height=ch+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars=Array.from({length:STAR_COUNT},()=>{const s={};resetStar(s,true);return s});
    drawStars(0,true);
  }

  function drawStars(time,staticOnly){
    if(!ctx)return;
    const cx=cw*(mobile?.56:.59);
    const cy=ch*(mobile?.53:.52);

    // Hyperspace ramp: begin cinematic, then build into a stronger forward rush.
    const elapsed=Math.max(0,time-launchStarted);
    const launch=smoothstep(450,3200,elapsed);
    const heroPresence=clamp(1-scrollProgress*4.6,0,1);
    const intensity=.82 + launch*1.55*heroPresence + heroPresence*.34;

    const baseSpeed=mobile?5.8:8.4;
    const speed=staticOnly?0:baseSpeed*intensity;

    ctx.fillStyle="#07111f";
    ctx.fillRect(0,0,cw,ch);

    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(cw,ch)*.68);
    glow.addColorStop(0,"rgba(245,194,83,.15)");
    glow.addColorStop(.12,"rgba(36,117,210,.10)");
    glow.addColorStop(.46,"rgba(9,30,55,.10)");
    glow.addColorStop(1,"rgba(7,17,31,0)");
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,cw,ch);

    for(const s of stars){
      const depthBefore=clamp(1-s.z/(cw*1.4),0,1);
      const layerSpeed=s.layer===0?.72:(s.layer===1?1.08:1.58);
      const approachBoost=.72+depthBefore*2.35;
      const step=staticOnly?0:speed*layerSpeed*approachBoost;

      s.pz=s.z;
      if(!staticOnly)s.z-=step;
      if(s.z<2){
        resetStar(s,false);
        s.z=cw*1.15;
        s.pz=s.z+step*5;
      }

      const depth=clamp(1-s.z/(cw*1.4),0,1);
      const trailBoost=1.4 + intensity*1.9 + depth*5.6 + s.layer*.8;
      const tailZ=s.z + Math.max(1,step)*trailBoost;

      const sx=cx+(s.x/s.z)*cw;
      const sy=cy+(s.y/s.z)*cw;
      const px=cx+(s.x/tailZ)*cw;
      const py=cy+(s.y/tailZ)*cw;
      if(sx<-110||sx>cw+110||sy<-110||sy>ch+110){
        resetStar(s,false);
        continue;
      }

      const twinkle=.88+.12*Math.sin(time*.003+s.twinkle);
      const alpha=clamp(s.alpha*(.3+depth*1.02)*twinkle,0,1);
      let color;
      if(s.kind===2)color="rgba(248,198,88,"+alpha.toFixed(3)+")";
      else if(s.kind===1)color="rgba(76,165,255,"+alpha.toFixed(3)+")";
      else color="rgba(238,246,255,"+alpha.toFixed(3)+")";

      ctx.strokeStyle=color;
      ctx.lineCap="round";
      ctx.lineWidth=Math.max(.42,s.size*(.38+depth*1.75)*(1+intensity*.08));
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.lineTo(sx,sy);
      ctx.stroke();

      // Closest stars flare as they rush by, creating a true hyperspace pass.
      if(depth>.62 || s.layer===2){
        const flareSize=Math.min(4.4,s.size*(.62+depth*1.65));
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.arc(sx,sy,flareSize,0,Math.PI*2);
        ctx.fill();
      }
    }

    if(!staticOnly){
      const flareRadius=Math.min(cw,ch)*(.10+intensity*.025);
      const flare=ctx.createRadialGradient(cx,cy,0,cx,cy,flareRadius);
      flare.addColorStop(0,"rgba(255,229,164,"+clamp(.22+intensity*.11,.22,.58).toFixed(3)+")");
      flare.addColorStop(.22,"rgba(240,196,95,"+clamp(.10+intensity*.045,.10,.24).toFixed(3)+")");
      flare.addColorStop(.48,"rgba(63,151,255,"+clamp(.07+intensity*.035,.07,.18).toFixed(3)+")");
      flare.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=flare;
      ctx.fillRect(0,0,cw,ch);
    }
  }

  function frame(time){
    updateScenes();
    if(reduced){
      if(!lastStarFrame)drawStars(time,true);
      lastStarFrame=time;
      return;
    }
    const minDelta=1000/STAR_FPS;
    if(time-lastStarFrame>=minDelta){
      drawStars(time,false);
      lastStarFrame=time;
    }
    raf=requestAnimationFrame(frame);
  }

  railLinks.forEach((a,i)=>a.addEventListener("click",e=>{
    e.preventDefault();
    chapters[i].scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
  }));

  setupStars();
  updateScenes();
  if(!reduced)raf=requestAnimationFrame(frame);
  else drawStars(0,true);

  addEventListener("resize",()=>{
    setupStars();
    updateScenes();
  },{passive:true});
  addEventListener("scroll",()=>{
    if(reduced)updateScenes();
  },{passive:true});

  document.addEventListener("visibilitychange",()=>{
    if(reduced)return;
    if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}
    else if(!document.hidden&&!raf){lastStarFrame=0;raf=requestAnimationFrame(frame)}
  });

  const year=document.getElementById("year");
  if(year)year.textContent=new Date().getFullYear();
})();
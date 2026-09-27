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
  const ctx = canvas.getContext("2d",{alpha:false});
  const goalButtons = [...document.querySelectorAll("[data-goal]")];
  const goalOutput = document.getElementById("goalOutput");

  let W = innerWidth, H = innerHeight, dpr = 1;
  let globalProgress = 0;
  let raf = 0;
  let lenis = null;
  let lastTime = 0;
  let activeIndex = 0;

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

  function chapterLabel(chapter){
    const label = chapter.dataset.labelEn || "";
    const labelEs = chapter.dataset.labelEs || label;
    return currentLang()==="es" ? labelEs : label;
  }

  function updateHUD(index){
    activeIndex = Math.max(0,Math.min(chapters.length-1,index));
    const chapter = chapters[activeIndex];
    if(chapterName) chapterName.textContent =
      String(activeIndex).padStart(2,"0")+" · "+chapterLabel(chapter);
    railLinks.forEach((a,i)=>a.classList.toggle("active",i===activeIndex));
  }

  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function smoothstep(a,b,x){
    const t = clamp((x-a)/(b-a),0,1);
    return t*t*(3-2*t);
  }

  function updateScenes(){
    const max = Math.max(1,doc.scrollHeight-innerHeight);
    globalProgress = clamp(scrollY/max,0,1);
    progress.style.width = (globalProgress*100).toFixed(3)+"%";

    const viewportMid = scrollY + innerHeight*.5;
    let bestIndex = 0;
    let bestDistance = Infinity;

    chapters.forEach((chapter,index)=>{
      const start = chapter.offsetTop;
      const length = chapter.offsetHeight - innerHeight;
      const local = length > 0 ? clamp((scrollY-start)/length,0,1) : 0;
      const center = start + chapter.offsetHeight*.5;
      const distance = Math.abs(viewportMid-center);
      if(distance < bestDistance){ bestDistance=distance; bestIndex=index; }

      if(reduced){
        chapter.style.setProperty("--scene-opacity","1");
        chapter.style.setProperty("--scene-blur","0px");
        chapter.style.setProperty("--scene-y","0px");
        chapter.style.setProperty("--scene-scale","1");
        return;
      }

      const fadeIn = smoothstep(0.02,.2,local);
      const fadeOut = 1-smoothstep(.72,.96,local);
      const opacity = clamp(fadeIn*fadeOut,0,1);
      const y = (1-fadeIn)*38 - (1-fadeOut)*34;
      const scale = .965 + opacity*.035;
      const blur = (1-opacity)*10;

      chapter.style.setProperty("--scene-opacity",opacity.toFixed(3));
      chapter.style.setProperty("--scene-y",y.toFixed(2)+"px");
      chapter.style.setProperty("--scene-scale",scale.toFixed(4));
      chapter.style.setProperty("--scene-blur",blur.toFixed(2)+"px");

      const title = chapter.querySelector(".title,.hero-title:not(.ghost)");
      if(title){
        const t = clamp(local,0,1);
        const titleScale = 1 + (t-.5)*.055;
        const titleY = (t-.5)*-22;
        title.style.transform = "translate3d(0,"+titleY.toFixed(1)+"px,0) scale("+titleScale.toFixed(4)+")";
      }
      const bodyNode = chapter.querySelector(".scene-body");
      if(bodyNode){
        bodyNode.style.transform = "translate3d(0,"+((.5-local)*24).toFixed(1)+"px,0)";
      }
    });

    if(bestIndex!==activeIndex) updateHUD(bestIndex);
  }

  function resize(){
    W = innerWidth; H = innerHeight;
    dpr = Math.min(devicePixelRatio||1,1.5);
    canvas.width = Math.round(W*dpr);
    canvas.height = Math.round(H*dpr);
    canvas.style.width=W+"px";canvas.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function rand(n){
    const x = Math.sin(n*12.9898+78.233)*43758.5453;
    return x-Math.floor(x);
  }

  function drawBackground(time){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle="#050507";
    ctx.fillRect(0,0,W,H);

    const mobile=W<760;
    const cx = mobile ? W*.54 : W*.73;
    const cy = H*.49;
    const drift = reduced ? 0 : Math.sin(time*.00012)*9;
    const phase = globalProgress*Math.PI*5.5 + (reduced ? 0 : time*.00006);

    // soft singularity halo
    const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.48);
    halo.addColorStop(0,"rgba(214,168,75,.12)");
    halo.addColorStop(.08,"rgba(214,168,75,.035)");
    halo.addColorStop(.34,"rgba(45,53,70,.028)");
    halo.addColorStop(1,"rgba(5,5,7,0)");
    ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);

    // radiating circuit rays
    ctx.lineWidth=.7;
    for(let i=0;i<44;i++){
      const angle=(i/44)*Math.PI*2 + phase*.07;
      const inner=26 + (i%6)*8;
      const outer=Math.max(W,H)*(.38 + (i%7)*.055);
      const bend=(rand(i+3)-.5)*.28;
      const a2=angle+bend;
      const x1=cx+Math.cos(angle)*inner;
      const y1=cy+Math.sin(angle)*inner;
      const mx=cx+Math.cos(a2)*outer*.48;
      const my=cy+Math.sin(a2)*outer*.48;
      const x2=cx+Math.cos(a2)*outer;
      const y2=cy+Math.sin(a2)*outer;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(mx,my);
      if(i%3===0){
        ctx.lineTo(mx + (i%2?22:-22), my);
      }
      ctx.lineTo(x2,y2);
      ctx.strokeStyle="rgba(105,126,162,"+(0.025+(i%5)*.008)+")";
      ctx.stroke();
    }

    // concentric field rings
    for(let r=0;r<10;r++){
      const rr=(70+r*Math.min(W,H)*.055)*(1+Math.sin(phase+r)*.007);
      ctx.beginPath();
      ctx.ellipse(cx+drift*.2,cy,rr,rr*.74,phase*.018,0,Math.PI*2);
      ctx.strokeStyle="rgba(214,168,75,"+(r===0?.12:.026)+")";
      ctx.lineWidth=r===0?1:.6;
      ctx.stroke();
    }

    // network nodes and links
    const count=mobile?24:42;
    const nodes=[];
    for(let i=0;i<count;i++){
      const a=rand(i*4+1)*Math.PI*2 + phase*.012;
      const radius=Math.pow(rand(i*4+2),.72)*Math.max(W,H)*.46;
      const x=cx+Math.cos(a)*radius + Math.sin(phase+i)*3;
      const y=cy+Math.sin(a)*radius*.72 + Math.cos(phase*.8+i)*3;
      nodes.push({x,y});
      const alpha=.08+rand(i*4+3)*.18;
      ctx.beginPath();ctx.arc(x,y,rand(i*4+4)*1.3+.4,0,Math.PI*2);
      ctx.fillStyle="rgba(235,239,248,"+alpha+")";ctx.fill();
    }
    ctx.lineWidth=.55;
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y;
        const d=Math.hypot(dx,dy);
        if(d<105){
          ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle="rgba(112,130,170,"+((1-d/105)*.07)+")";ctx.stroke();
        }
      }
    }

    // tiny star field
    for(let p=0;p<(mobile?50:95);p++){
      const x=rand(p+200)*W;
      const baseY=rand(p+400)*H;
      const y=(baseY + globalProgress*H*(.18+(p%5)*.03))%H;
      const pulse=reduced?1:(.45+.55*Math.sin(time*.0012+p));
      ctx.fillStyle="rgba(255,255,255,"+(.03+rand(p+600)*.09*pulse)+")";
      ctx.fillRect(x,y,1,1);
    }
  }

  function frame(time){
    lastTime=time;
    updateScenes();
    drawBackground(time);
    raf=requestAnimationFrame(frame);
  }

  if(!reduced && window.Lenis){
    lenis = new Lenis({
      duration:1.1,
      smoothWheel:true,
      wheelMultiplier:.92,
      touchMultiplier:1.0
    });
    function lenisRaf(time){
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);
    railLinks.forEach((a,i)=>{
      a.addEventListener("click",e=>{
        e.preventDefault();
        lenis.scrollTo(chapters[i],{offset:0,duration:1.15});
      });
    });
  }

  addEventListener("resize",resize,{passive:true});
  addEventListener("scroll",()=>{ if(reduced){ updateScenes();drawBackground(lastTime); } },{passive:true});
  document.addEventListener("visibilitychange",()=>{
    if(reduced) return;
    if(document.hidden && raf){cancelAnimationFrame(raf);raf=0;}
    else if(!document.hidden && !raf){raf=requestAnimationFrame(frame);}
  });

  resize();
  updateScenes();
  drawBackground(0);
  if(!reduced) raf=requestAnimationFrame(frame);

  const year=document.getElementById("year");
  if(year) year.textContent=new Date().getFullYear();
})();
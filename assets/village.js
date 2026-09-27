(function(){
  const body=document.body;
  const langBtn=document.getElementById("lang");
  const menuBtn=document.getElementById("menuBtn");
  const menu=document.getElementById("menu");
  const sheet=document.getElementById("sheet");
  const close=document.getElementById("sheetClose");
  const title=document.getElementById("sheetTitle");
  const text=document.getElementById("sheetText");
  const kicker=document.getElementById("sheetKicker");
  const link=document.getElementById("sheetLink");
  const mark=document.getElementById("sheetMark");
  const buttons=[...document.querySelectorAll(".hotspot")];
  const snow=document.getElementById("snow");

  const data={
    learn:{mark:"▰",en:{k:"LEARN AI SKILLS",t:"Build practical AI confidence",d:"Start with beginner-friendly lessons, real tasks, prompting, verification, privacy and useful workflows.",c:"Explore Level 1",u:"course.html"},es:{k:"APRENDER IA",t:"Desarrolla confianza práctica en IA",d:"Empieza con lecciones claras, tareas reales, prompts, verificación, privacidad y flujos útiles.",c:"Explorar Nivel 1",u:"curso-es.html"}},
    workforce:{mark:"▦",en:{k:"WORKFORCE DEVELOPMENT",t:"Build capability for teams",d:"Explore practical AI training for employers, agencies, nonprofits and workforce programs.",c:"View organizational training",u:"capabilities.html"},es:{k:"DESARROLLO LABORAL",t:"Desarrolla capacidad para equipos",d:"Explora capacitación práctica de IA para empleadores, agencias, organizaciones y programas laborales.",c:"Ver capacitación",u:"capabilities.html"}},
    community:{mark:"●●",en:{k:"COMMUNITY LEARNING",t:"Learn together",d:"Find beginner-friendly programs for adults, families, community organizations and lifelong learners.",c:"Explore programs",u:"programs.html"},es:{k:"APRENDIZAJE COMUNITARIO",t:"Aprendan juntos",d:"Encuentra programas accesibles para adultos, familias, organizaciones comunitarias y aprendizaje continuo.",c:"Explorar programas",u:"programs.html"}},
    support:{mark:"•••",en:{k:"GUIDED SUPPORT",t:"Get help choosing a path",d:"Use CivicAscent support to identify the right next step and turn a broad goal into an actionable learning path.",c:"Request support",u:"consultation.html"},es:{k:"APOYO GUIADO",t:"Obtén ayuda para elegir una ruta",d:"Usa el apoyo de CivicAscent para convertir una meta amplia en un siguiente paso claro.",c:"Solicitar apoyo",u:"consultation.html"}},
    planner:{mark:"◇",en:{k:"GUIDED PLANNER",t:"Plan Your Next Step",d:"Get a structured plan for education, workforce, business or community goals.",c:"Open Guided Planner",u:"mentor.html"},es:{k:"PLANIFICADOR GUIADO",t:"Planifica tu próximo paso",d:"Obtén un plan estructurado para metas educativas, laborales, empresariales o comunitarias.",c:"Abrir Planificador",u:"mentor.html"}},
    family:{mark:"●●",en:{k:"FAMILY LEARNING",t:"Build confidence together",d:"Explore approachable AI learning that supports multiple generations and different levels of digital confidence.",c:"Explore programs",u:"programs.html"},es:{k:"APRENDIZAJE FAMILIAR",t:"Desarrollen confianza juntos",d:"Explora aprendizaje accesible de IA para varias generaciones y distintos niveles de confianza digital.",c:"Explorar programas",u:"programs.html"}},
    consultation:{mark:"◌",en:{k:"CONSULTATION",t:"Talk through your goal",d:"Plan a workshop, workforce program, community session or customized training engagement.",c:"Request a consultation",u:"consultation.html"},es:{k:"CONSULTA",t:"Conversemos sobre tu meta",d:"Planifica un taller, programa laboral, sesión comunitaria o capacitación personalizada.",c:"Solicitar consulta",u:"consultation.html"}}
  };

  function isEs(){return body.classList.contains("es")}
  function applyLang(){
    document.documentElement.lang=isEs()?"es":"en";
    document.querySelectorAll("[data-en]").forEach(el=>el.textContent=isEs()?el.dataset.es:el.dataset.en);
    langBtn.textContent=isEs()?"EN":"ES";
    langBtn.setAttribute("aria-pressed",String(isEs()));
    const active=document.querySelector(".hotspot.active");
    if(active)show(active.dataset.key,false);
  }
  langBtn.addEventListener("click",()=>{body.classList.toggle("es");applyLang()});

  menuBtn.addEventListener("click",()=>{
    const open=!menu.classList.contains("open");
    menu.classList.toggle("open",open);menu.setAttribute("aria-hidden",String(!open));menuBtn.setAttribute("aria-expanded",String(open));
  });
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));

  function show(key,open=true){
    const item=data[key]; if(!item)return;
    const l=isEs()?item.es:item.en;
    buttons.forEach(b=>b.classList.toggle("active",b.dataset.key===key));
    kicker.textContent=l.k; title.textContent=l.t; text.textContent=l.d; link.textContent=l.c+" →"; link.href=l.u; mark.textContent=item.mark;
    if(open)sheet.classList.add("open");
  }
  buttons.forEach(b=>b.addEventListener("click",()=>show(b.dataset.key,true)));
  close.addEventListener("click",()=>sheet.classList.remove("open"));

  const count=matchMedia("(max-width:700px)").matches?22:44;
  for(let i=0;i<count;i++){
    const f=document.createElement("span"); f.className="flake";
    const size=(Math.random()*3.6+1.2); f.style.width=size+"px"; f.style.height=size+"px";
    f.style.left=(Math.random()*100)+"%"; f.style.opacity=(Math.random()*.55+.2);
    f.style.setProperty("--drift",(Math.random()*90-45)+"px");
    f.style.animationDuration=(Math.random()*7+7)+"s"; f.style.animationDelay=(-Math.random()*12)+"s";
    snow.appendChild(f);
  }

  if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
    addEventListener("pointermove",e=>{
      if(innerWidth<800)return;
      const x=(e.clientX/innerWidth-.5)*10, y=(e.clientY/innerHeight-.5)*8;
      document.querySelector(".scene-bg").style.transform="scale(1.045) translate("+(-x*.14)+"px,"+(-y*.14)+"px)";
    },{passive:true});
  }
  show("planner",false);
  applyLang();
})();
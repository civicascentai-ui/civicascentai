(function(){
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;
  var doc = document.documentElement;
  var progress = document.getElementById("progress");
  var topbar = document.getElementById("topbar");
  var langToggle = document.getElementById("langToggle");
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".chapter-rail a"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var revealNodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var goalButtons = Array.prototype.slice.call(document.querySelectorAll("[data-goal]"));
  var goalOutput = document.getElementById("goalOutput");
  var canvas = document.getElementById("ambientCanvas");
  var ctx = canvas.getContext("2d", {alpha:true});
  var scrollRatio = 0;
  var frame = 0;

  var goalCopy = {
    everyday:{
      en:"Plan a week, compare options, organize information, draft a message or turn a confusing task into clear steps.",
      es:"Planifica una semana, compara opciones, organiza información, redacta un mensaje o convierte una tarea confusa en pasos claros."
    },
    work:{
      en:"Draft clearer communication, summarize material, prepare meetings, organize projects and create repeatable workflows.",
      es:"Redacta comunicaciones más claras, resume material, prepara reuniones, organiza proyectos y crea flujos repetibles."
    },
    learning:{
      en:"Ask for explanations at your level, generate practice questions, compare ideas and get feedback while you learn.",
      es:"Pide explicaciones a tu nivel, genera preguntas de práctica, compara ideas y recibe retroalimentación mientras aprendes."
    },
    business:{
      en:"Research a market, shape an offer, prepare customer communication, organize operations and test ideas before investing heavily.",
      es:"Investiga un mercado, define una oferta, prepara comunicación con clientes, organiza operaciones y prueba ideas antes de invertir mucho."
    }
  };

  function currentLang(){ return body.classList.contains("es") ? "es" : "en"; }

  function updateGoal(){
    var active = goalButtons.find(function(btn){ return btn.getAttribute("aria-pressed") === "true"; });
    var key = active ? active.getAttribute("data-goal") : "everyday";
    goalOutput.textContent = goalCopy[key][currentLang()];
  }

  goalButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
      goalButtons.forEach(function(other){ other.setAttribute("aria-pressed","false"); });
      btn.setAttribute("aria-pressed","true");
      updateGoal();
    });
  });

  function setLanguage(isEs){
    var y = window.scrollY;
    body.classList.toggle("es", isEs);
    doc.lang = isEs ? "es" : "en";
    langToggle.textContent = isEs ? "EN" : "ES";
    langToggle.setAttribute("aria-pressed", String(isEs));
    langToggle.setAttribute("aria-label", isEs ? "Switch to English" : "Cambiar a español");
    try{ localStorage.setItem("civicascent-lang", isEs ? "es" : "en"); }catch(e){}
    updateGoal();
    requestAnimationFrame(function(){ window.scrollTo(0,y); });
  }

  var savedLang = null;
  try{ savedLang = localStorage.getItem("civicascent-lang"); }catch(e){}
  if(savedLang === "es"){ setLanguage(true); } else { updateGoal(); }

  langToggle.addEventListener("click", function(){ setLanguage(!body.classList.contains("es")); });

  function closeMenu(){
    body.classList.remove("menu-open");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden","true");
    menuToggle.setAttribute("aria-expanded","false");
  }
  menuToggle.addEventListener("click", function(){
    var open = !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileMenu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeMenu(); });

  function updateScroll(){
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    scrollRatio = Math.min(1, Math.max(0, window.scrollY / max));
    progress.style.width = (scrollRatio * 100).toFixed(2) + "%";
    topbar.classList.toggle("scrolled", window.scrollY > 32);
    if(reduced) drawTunnel(0);
  }
  window.addEventListener("scroll", updateScroll, {passive:true});

  var sectionObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      railLinks.forEach(function(a){
        a.classList.toggle("active", a.getAttribute("data-section") === entry.target.id);
      });
    });
  }, {threshold:.52});
  sections.forEach(function(section){ sectionObserver.observe(section); });

  if(reduced){
    revealNodes.forEach(function(node){ node.classList.add("visible"); });
  }else{
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.16});
    revealNodes.forEach(function(node){ revealObserver.observe(node); });
  }

  function resizeCanvas(){
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawTunnel(0);
  }

  function roundedRectPath(x,y,w,h,r){
    var rr = Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }

  function drawTunnel(t){
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0,0,w,h);
    var mobile = w < 760;
    var cx = mobile ? w*.56 : w*.73;
    var cy = h*.50;
    var pulse = reduced ? 0 : Math.sin(t*.00028)*.012;
    var travel = (scrollRatio*5.5 + (reduced ? 0 : t*.000025)) % 1;

    for(var i=0;i<18;i++){
      var z = ((i/18 + travel) % 1);
      var eased = Math.pow(z,1.72);
      var rw = (mobile ? w*.18 : w*.12) + eased*(mobile ? w*1.15 : w*.88);
      var rh = h*.10 + eased*h*.78;
      var alpha = .045 + eased*.16;
      var offset = Math.sin((i*1.73)+(scrollRatio*8))*w*.006;
      ctx.strokeStyle = "rgba(214,168,75," + Math.min(.24,alpha) + ")";
      ctx.lineWidth = 1 + eased*.8;
      roundedRectPath(cx-rw/2+offset,cy-rh/2,rw,rh,Math.min(44,14+eased*36));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx,cy,Math.max(34,w*.035)*(1+pulse),0,Math.PI*2);
    ctx.fillStyle = "rgba(214,168,75,.055)";
    ctx.fill();

    var particles = mobile ? 18 : 32;
    for(var p=0;p<particles;p++){
      var seed = p*97.17;
      var px = (Math.sin(seed)*.5+.5)*w;
      var py = ((Math.cos(seed*.71)*.5+.5)*h + (scrollRatio*h*.9)) % h;
      var pa = .025 + ((p%7)/7)*.055;
      ctx.fillStyle = "rgba(242,241,236,"+pa+")";
      ctx.fillRect(px,py,1,1);
    }
  }

  function animate(t){
    drawTunnel(t);
    frame = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvas, {passive:true});
  document.addEventListener("visibilitychange", function(){
    if(reduced) return;
    if(document.hidden && frame){ cancelAnimationFrame(frame); frame = 0; }
    else if(!document.hidden && !frame){ frame = requestAnimationFrame(animate); }
  });

  resizeCanvas();
  updateScroll();
  if(!reduced){ frame = requestAnimationFrame(animate); }

  var year = document.getElementById("year");
  if(year) year.textContent = new Date().getFullYear();
})();
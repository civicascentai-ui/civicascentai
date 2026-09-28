const canvas=document.getElementById("cosmos"),ctx=canvas.getContext("2d");
let w,h,dpr,stars=[];
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:Math.min(260,Math.floor(w*h/5000))},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*1+.2,s:Math.random()*1.8+.3}));}
function draw(){ctx.clearRect(0,0,w,h);for(const s of stars){s.y+=.16+s.z*.45;if(s.y>h)s.y=0;ctx.globalAlpha=.25+s.z*.55;ctx.fillStyle=s.z>.7?"#8fefff":"#ffffff";ctx.beginPath();ctx.arc(s.x,s.y,s.s*s.z,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;requestAnimationFrame(draw)}resize();draw();addEventListener("resize",resize);

const eye=document.getElementById("eye"),exp=document.getElementById("experience"),hint=document.getElementById("hint");
eye.addEventListener("click",()=>{hint.textContent="Entering the experience…";eye.animate([{transform:"translateY(-50%) scale(1)"},{transform:"translateY(-50%) scale(1.08)"},{transform:"translateY(-50%) scale(4)",opacity:0}],{duration:950,easing:"cubic-bezier(.2,.8,.2,1)"});setTimeout(()=>exp.scrollIntoView({behavior:"smooth"}),420);});

const stages=[...document.querySelectorAll(".stage")],dots=[...document.querySelectorAll(".progress i")],tap=document.getElementById("worldTap");let current=0;
tap.addEventListener("click",()=>{current=(current+1)%stages.length;stages.forEach((s,i)=>s.classList.toggle("active",i===current));dots.forEach((d,i)=>d.classList.toggle("active",i===current));if(current===stages.length-1)setTimeout(()=>document.getElementById("portalScene").scrollIntoView({behavior:"smooth"}),700);});

document.getElementById("portal").addEventListener("click",e=>{const p=e.currentTarget;p.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(7)",opacity:0}],{duration:950,easing:"cubic-bezier(.2,.8,.2,1)"});document.body.animate([{filter:"brightness(1)"},{filter:"brightness(1.8)"},{filter:"brightness(.2)"}],{duration:900});setTimeout(()=>location.href="living-ai-lab.html",760);});

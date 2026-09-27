const path=document.getElementById("lightPath");
const windowEl=document.getElementById("livingWindow");
const guide=document.getElementById("guideText");
const scene2=document.getElementById("scene2");
const demos=[...document.querySelectorAll(".demo")];
const explain=document.getElementById("demoExplain");
const sceneTap=document.getElementById("sceneTap");
const portal=document.getElementById("portal");
let current=0;
const copy=[
 "AI listens, responds, and reshapes information around the visitor. Tap the scene itself to move to the next capability.",
 "Creative AI can turn a rough thought into something visible and useful. The transformation is the explanation.",
 "Planning AI can connect a question to a route forward. The next step becomes visible before the visitor reads about it."
];
function openDemo(){
 guide.textContent="Entering the living window…";
 document.querySelector(".lodge").animate([{transform:"skewY(-2deg) scale(1)"},{transform:"skewY(-2deg) scale(1.07)"},{transform:"skewY(-2deg) scale(1)"}],{duration:800,easing:"ease"});
 setTimeout(()=>scene2.scrollIntoView({behavior:"smooth"}),220);
}
path.addEventListener("click",openDemo);
windowEl.addEventListener("click",openDemo);
windowEl.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDemo();}});
sceneTap.addEventListener("click",()=>{
 current=(current+1)%demos.length;
 demos.forEach((d,i)=>d.classList.toggle("active",i===current));
 explain.textContent=copy[current];
});
portal.addEventListener("click",()=>{
 portal.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(8)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
 document.body.animate([{filter:"brightness(1)"},{filter:"brightness(1.7)"},{filter:"brightness(.2)"}],{duration:850});
 setTimeout(()=>location.href="living-ai-lab.html",700);
});
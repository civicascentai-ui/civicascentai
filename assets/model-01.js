const content={
 learning:{kicker:"AI for learning",title:"Ask it. Hear it. Practice it.",body:"AI can explain a difficult idea in simpler words, answer follow-up questions, translate the explanation, and help you practice at your own pace.",href:"course.html"},
 create:{kicker:"AI for creating",title:"Start with an idea. Leave with something real.",body:"A rough thought can become an image, a plan, a script, a presentation, or a first draft. The experience should show the transformation instead of only describing it.",href:"living-ai-lab.html"},
 opportunity:{kicker:"AI for opportunity",title:"Turn a skill into a next step.",body:"AI can help organize an idea, research options, prepare a plan, and make the next action obvious—without requiring the visitor to already understand AI.",href:"programs.html"}
};
const panel=document.getElementById("experience-panel");
const kicker=document.getElementById("panel-kicker");
const title=document.getElementById("panel-title");
const body=document.getElementById("panel-body");
const link=document.getElementById("panel-link");
document.querySelectorAll(".hotspot").forEach(btn=>{
 btn.addEventListener("click",()=>{
   document.querySelectorAll(".hotspot").forEach(b=>b.setAttribute("aria-expanded","false"));
   btn.setAttribute("aria-expanded","true");
   const c=content[btn.dataset.target];
   kicker.textContent=c.kicker; title.textContent=c.title; body.textContent=c.body; link.href=c.href;
   panel.scrollIntoView({behavior:"smooth",block:"start"});
 });
});
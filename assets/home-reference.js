/* CivicAscent approved homepage reading controls: in-memory only.
   No localStorage, cookies, networking, analytics or student data collection. */
(() => {
  "use strict";
  const get = name => document.getElementById(name);
  const sizes=[90,100,112.5,125,137.5,150];
  let index=1;
  let dark=false;
  let scenery=false;
  const status=get("settings-status");
  const smaller=get("text-minus"),larger=get("text-plus");
  const theme=get("theme-toggle"),scene=get("scenery-toggle");
  const read=get("read-aloud"),stop=get("stop-reading");
  const update=(message)=>{
    document.documentElement.style.setProperty("--font-scale",sizes[index]+"%");
    document.body.dataset.theme=dark?"dark":"light";
    document.body.classList.toggle("show-scene",scenery);
    smaller.disabled=index===0;larger.disabled=index===sizes.length-1;
    theme.setAttribute("aria-pressed",String(dark));
    theme.textContent=dark?"Light background":"Dark background";
    scene.setAttribute("aria-pressed",String(scenery));
    scene.textContent=scenery?"Hide Safari picture":"Show Safari picture";
    if(message)status.textContent=message;
  };
  smaller.addEventListener("click",()=>{index=Math.max(0,index-1);update("Text size "+sizes[index]+"%.");});
  larger.addEventListener("click",()=>{index=Math.min(sizes.length-1,index+1);update("Text size "+sizes[index]+"%.");});
  theme.addEventListener("click",()=>{dark=!dark;update(dark?"Dark, high-contrast appearance selected.":"Light, high-contrast appearance selected.");});
  scene.addEventListener("click",()=>{scenery=!scenery;update(scenery?"Optional Safari picture on.":"Optional Safari picture off.");});
  update();

  const available=typeof window.SpeechSynthesisUtterance!=="undefined"&&
     "speechSynthesis" in window&&typeof window.speechSynthesis.speak==="function";
  if(!available){
    read.disabled=true;
    read.title="Read aloud is not supported here. Try your device's screen reader.";
    return;
  }
  let active=false;
  let utterance=null;
  function finish(){
    active=false;
    read.disabled=false;
    stop.disabled=true;
  }
  read.addEventListener("click",()=>{
    if(active)return;
    const title=get("welcome").textContent.trim();
    const introduction=document.querySelector(".lead").textContent.trim();
    const note=document.querySelector(".note").textContent.trim();
    utterance=new SpeechSynthesisUtterance([title,introduction,note].join(" "));
    utterance.lang="en-US";
    utterance.rate=.85;
    utterance.onstart=()=>{active=true;read.disabled=true;stop.disabled=false;status.textContent="Reading introduction aloud. Use Stop reading to finish.";};
    utterance.onend=()=>{finish();status.textContent="Reading finished.";};
    utterance.onerror=()=>{finish();status.textContent="Read aloud unavailable here. The text remains visible.";};
    try{window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);}
    catch{finish();status.textContent="Read aloud unavailable in this browser.";}
  });
  stop.addEventListener("click",()=>{
    try{window.speechSynthesis.cancel();}catch{}
    finish();status.textContent="Reading stopped.";
  });
  window.addEventListener("pagehide",()=>{
    if(active){try{window.speechSynthesis.cancel();}catch{}}
    finish();
  });
})();

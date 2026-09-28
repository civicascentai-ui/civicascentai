(()=>{
const home=document.body.classList.contains('station-home');
const doorway=document.body.classList.contains('station-doorway');
const note=document.getElementById('motionNote');
if(home&&note){
 const labels=['Train arriving','Doors open soon','Next train departing'];
 let i=0;
 setInterval(()=>{i=(i+1)%labels.length;note.textContent=labels[i]},5200);
}
if(doorway){
 const params=new URLSearchParams(location.search);
 const world=params.get('world')||'learn';
 const data={
  learn:{
   eyebrow:'STOP 01 · LEARNING STATION',
   title:'Learn with AI.',
   lead:'Ask a question in everyday language and see the answer become easier to understand.',
   action:'You ask. AI explains. You can ask again until it makes sense.',
   station:'LEARNING STATION'
  },
  create:{
   eyebrow:'STOP 02 · CREATION STATION',
   title:'Create with AI.',
   lead:'Start with an idea and turn it into something visible, useful, or ready to improve.',
   action:'Describe what you want. AI helps you shape it. You stay in control.',
   station:'CREATION STATION'
  },
  opportunity:{
   eyebrow:'STOP 03 · OPPORTUNITY STATION',
   title:'Build Opportunity.',
   lead:'Take a goal and turn it into a short list of practical next steps.',
   action:'Tell AI where you want to go. It helps organize a path you can review.',
   station:'OPPORTUNITY STATION'
  }
 };
 const d=data[world]||data.learn;
 document.getElementById('stopEyebrow').textContent=d.eyebrow;
 document.getElementById('stopTitle').textContent=d.title;
 document.getElementById('stopLead').textContent=d.lead;
 document.getElementById('stopActionText').textContent=d.action;
 document.getElementById('stationName').textContent=d.station;
}
})();
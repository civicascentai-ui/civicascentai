(function(){
  const body=document.body;
  const langBtn=document.getElementById('langToggle');
  const playBtn=document.getElementById('playGuide');
  const stopBtn=document.getElementById('stopGuide');
  const scene=body.dataset.scene||'';
  const params=new URLSearchParams(location.search);
  if(params.get('lang')==='es') body.classList.add('es');

  function isEs(){return body.classList.contains('es')}
  function bestVoice(lang){
    const voices=speechSynthesis.getVoices();
    const want=lang==='es'?'es':'en';
    const candidates=voices.filter(v=>v.lang && v.lang.toLowerCase().startsWith(want));
    const preferred=['Google','Microsoft','Samantha','Daniel','Serena','Monica','Jorge','Paulina'];
    candidates.sort((a,b)=>{
      const ai=preferred.findIndex(n=>a.name.includes(n));
      const bi=preferred.findIndex(n=>b.name.includes(n));
      return (ai<0?99:ai)-(bi<0?99:bi);
    });
    return candidates[0]||voices[0]||null;
  }
  function copy(){
    return {
      images:{
        en:{title:'Create Images',text:'Describe an idea in ordinary language. AI can turn that description into visual concepts you can refine step by step.'},
        es:{title:'Crear imágenes',text:'Describe una idea con lenguaje cotidiano. La IA puede convertir esa descripción en conceptos visuales que puedes mejorar paso a paso.'}
      },
      voice:{
        en:{title:'Use Your Voice',text:'Speak naturally instead of typing. Voice AI can listen, respond, and help people work through a task one step at a time.'},
        es:{title:'Usa tu voz',text:'Habla de forma natural en vez de escribir. La IA por voz puede escuchar, responder y ayudarte paso a paso.'}
      },
      translate:{
        en:{title:'Translate Language',text:'AI can help translate and simplify language. Important meaning should still be reviewed when accuracy matters.'},
        es:{title:'Traducir idiomas',text:'La IA puede ayudar a traducir y simplificar el lenguaje. El significado importante debe revisarse cuando la precisión importa.'}
      },
      plan:{
        en:{title:'Plan and Automate',text:'AI can organize a goal into steps, reminders, drafts, and repeatable workflows while people keep control of the decisions.'},
        es:{title:'Planificar y automatizar',text:'La IA puede organizar una meta en pasos, recordatorios, borradores y flujos repetibles mientras las personas mantienen el control.'}
      }
    }[scene]||{en:{title:'AI Experience',text:'Explore a practical AI capability.'},es:{title:'Experiencia de IA',text:'Explora una capacidad práctica de la IA.'}};
  }
  function applyLang(){
    document.documentElement.lang=isEs()?'es':'en';
    document.querySelectorAll('[data-en]').forEach(el=>el.textContent=isEs()?el.dataset.es:el.dataset.en);
    if(langBtn){langBtn.textContent=isEs()?'EN':'ES';langBtn.setAttribute('aria-pressed',String(isEs()));}
    const c=copy()[isEs()?'es':'en'];
    const gt=document.getElementById('guideTitle'), gc=document.getElementById('guideCopy');
    if(gt)gt.textContent=c.title;if(gc)gc.textContent=c.text;
  }
  function speak(){
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const c=copy()[isEs()?'es':'en'];
    const u=new SpeechSynthesisUtterance(c.title+'. '+c.text);
    u.lang=isEs()?'es-US':'en-US';u.rate=.82;u.pitch=.78;u.volume=1;
    const v=bestVoice(isEs()?'es':'en'); if(v)u.voice=v;
    speechSynthesis.speak(u);
  }
  if(langBtn)langBtn.addEventListener('click',()=>{body.classList.toggle('es');applyLang();speak()});
  if(playBtn)playBtn.addEventListener('click',speak);
  if(stopBtn)stopBtn.addEventListener('click',()=>{
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  });
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged=()=>{};
    setTimeout(()=>{if(params.get('speak')==='1')speak()},650);
  }
  applyLang();

  const prompt=document.getElementById('promptText');
  if(prompt && scene==='images'){
    const lines={
      en:['A welcoming AI learning center at sunrise','Show a family learning AI together','Create a clean poster for a community workshop'],
      es:['Un centro de aprendizaje de IA al amanecer','Muestra una familia aprendiendo IA','Crea un cartel limpio para un taller comunitario']
    };
    let idx=0,pos=0,erasing=false;
    function type(){
      const arr=lines[isEs()?'es':'en'];const target=arr[idx%arr.length];
      if(!erasing){pos++;if(pos>=target.length){erasing=true;setTimeout(type,1300);return}}
      else{pos--;if(pos<=0){erasing=false;idx++;}}
      prompt.textContent=target.slice(0,pos);setTimeout(type,erasing?28:58);
    }
    type();
  }
})();

const canvas=document.getElementById('world'),ctx=canvas.getContext('2d',{alpha:false});
let W=0,H=0,D=1,t=0,scrollP=0,targetScroll=0,mx=0,my=0,stars=[],mist=[];
const isDoorway=document.body.classList.contains('doorway-world');
const world=new URLSearchParams(location.search).get('world')||'learn';
const themes={
 learn:{cyan:'#54e9ff',accent:'#ffb45c',eyebrow:'AI FOR LEARNING',title:'Learn with|AI beside you.',lead:'Ask naturally. Watch the world reorganize the answer around you.'},
 create:{cyan:'#75ffd2',accent:'#ff9a46',eyebrow:'AI FOR CREATING',title:'Imagine it.|Watch it form.',lead:'Ideas begin as light, then become something you can see, shape, and use.'},
 opportunity:{cyan:'#88b8ff',accent:'#ffd16a',eyebrow:'AI FOR OPPORTUNITY',title:'See the path|before the paperwork.',lead:'Questions become routes. Possibilities become visible next steps.'}
};
const theme=themes[world]||themes.learn;
document.documentElement.style.setProperty('--cyan',theme.cyan);document.documentElement.style.setProperty('--orange',theme.accent);

if(isDoorway){
 document.getElementById('worldEyebrow').textContent=theme.eyebrow;
 const p=theme.title.split('|');document.getElementById('worldTitle').innerHTML=p[0]+'<br><span>'+p[1]+'</span>';
 document.getElementById('worldLead').textContent=theme.lead;
}

function resize(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*D;canvas.height=H*D;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(D,0,0,D,0,0);
 stars=Array.from({length:Math.min(260,Math.floor(W*H/4200))},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()*.8,r:.3+Math.random()*1.6}));
 mist=Array.from({length:18},()=>({x:Math.random()*W,y:H*(.45+Math.random()*.5),w:120+Math.random()*300,s:.08+Math.random()*.2,a:.015+Math.random()*.04}));
}
function lerp(a,b,n){return a+(b-a)*n}
function mountain(base,amp,phase,col,par){ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+30;x+=30){const y=base-Math.sin((x+phase+scrollP*par*900)/180)*amp-Math.sin((x+phase)/67)*amp*.28;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
function draw(){
 t+=.008;scrollP=lerp(scrollP,targetScroll,.055);
 const px=mx*18,py=my*10;
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02050a');g.addColorStop(.45,'#06131e');g.addColorStop(1,'#02060a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(W*(.62+mx*.03),H*(.38+my*.02),0,W*.62,H*.38,W*.45);glow.addColorStop(0,isDoorway?theme.cyan+'32':'#43e4ff28');glow.addColorStop(.5,'rgba(24,76,96,.08)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 for(const s of stars){s.y+=.05+s.z*.08;if(s.y>H*.65)s.y=0;ctx.globalAlpha=.18+s.z*.5;ctx.fillStyle=s.z>.68?theme.cyan:'#fff';ctx.beginPath();ctx.arc(s.x+px*s.z,s.y+py*s.z,s.r*s.z,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 mountain(H*.69,74,t*120,'#0a1720',.12);mountain(H*.76,92,t*80,'#08121a',.24);mountain(H*.84,66,t*45,'#050c12',.42);
 const ground=ctx.createLinearGradient(0,H*.72,0,H);ground.addColorStop(0,'rgba(4,18,24,.1)');ground.addColorStop(1,'#010305');ctx.fillStyle=ground;ctx.fillRect(0,H*.7,W,H*.3);
 for(const m of mist){m.x+=m.s;if(m.x>W+m.w)m.x=-m.w;ctx.globalAlpha=m.a;ctx.fillStyle=theme.cyan;ctx.beginPath();ctx.ellipse(m.x+px*.12,m.y+Math.sin(t*3+m.x)*8,m.w,28,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 for(let i=0;i<8;i++){const x=(i/7)*W+Math.sin(t*2+i)*15-scrollP*120*(i%2?1:-1);const y=H*.78+Math.sin(i*1.8)*18;ctx.strokeStyle='rgba(86,185,205,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W*.5,H*.68);ctx.lineTo(x,y);ctx.stroke()}
 requestAnimationFrame(draw);
}
addEventListener('resize',resize);addEventListener('pointermove',e=>{mx=(e.clientX/W-.5);my=(e.clientY/H-.5)});
addEventListener('scroll',()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);targetScroll=scrollY/max});
resize();draw();

if(!isDoorway){
 const doors=[...document.querySelectorAll('.door')],whisper=document.getElementById('whisper');
 function positionDoors(){
  const p=scrollP;
  const specs=[
   {start:.08,end:.42,x:.28,y:.56,el:doors[0]},
   {start:.33,end:.70,x:.52,y:.48,el:doors[1]},
   {start:.62,end:.97,x:.74,y:.55,el:doors[2]}
  ];
  specs.forEach((s,i)=>{const mid=(s.start+s.end)/2,span=(s.end-s.start)/2,d=Math.abs(p-mid)/span,vis=Math.max(0,1-d),scale=.45+vis*.72;
   s.el.style.left=(s.x*100+Math.sin(t*1.7+i)*1.5)+'vw';s.el.style.top=(s.y*100+Math.cos(t*1.2+i)*1.2)+'vh';s.el.style.opacity=String(Math.min(1,vis*1.5));s.el.style.transform='translate(-50%,-50%) scale('+scale+')';s.el.style.pointerEvents=vis>.38?'auto':'none';
  });
  whisper.style.opacity=p>.02?'1':'0';requestAnimationFrame(positionDoors);
 }positionDoors();
}else{
 const obj=document.getElementById('worldObject'),hint=document.getElementById('doorwayHint'),fx=document.getElementById('transformation');
 obj.addEventListener('click',()=>{hint.textContent=world==='learn'?'The answer is becoming visible…':world==='create'?'The idea is taking shape…':'A path is forming…';fx.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'},{opacity:.18,transform:'scale(1.3)'}],{duration:1800,fill:'forwards',easing:'ease-out'});obj.animate([{transform:'translateY(-50%) scale(1)'},{transform:'translateY(-50%) scale(1.15)'},{transform:'translateY(-50%) scale(.96)'}],{duration:1600,easing:'cubic-bezier(.2,.8,.2,1)'});});
}

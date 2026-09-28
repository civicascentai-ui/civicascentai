(()=>{
const canvas=document.getElementById('livingWorld');
if(!canvas||!window.THREE)return;
const isDoorway=document.body.classList.contains('doorway');
const params=new URLSearchParams(location.search);
const world=params.get('world')||'learn';
const THEMES={
 learn:{color:0x49e6ff,accent:0xffa14c,eyebrow:'AI FOR LEARNING',title:'Learn with AI.',lead:'Ask naturally. Watch the answer become visible.'},
 create:{color:0x7cffd2,accent:0xff9a47,eyebrow:'AI FOR CREATING',title:'Create with AI.',lead:'Ideas become images, plans, and experiences.'},
 opportunity:{color:0x8fa7ff,accent:0xffd46a,eyebrow:'AI FOR OPPORTUNITY',title:'Build opportunity.',lead:'Turn a goal into visible next steps.'}
};
const theme=THEMES[world]||THEMES.learn;

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<800?1.35:1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x020409);
scene.fog=new THREE.FogExp2(0x020409,.031);

const camera=new THREE.PerspectiveCamera(56,innerWidth/innerHeight,.1,600);
camera.position.set(0,1.9,14);

scene.add(new THREE.AmbientLight(0x78a9c7,.38));
const key=new THREE.PointLight(isDoorway?theme.color:0x49e6ff,38,46,2);key.position.set(0,4,5);scene.add(key);
const warm=new THREE.PointLight(isDoorway?theme.accent:0xff8c43,18,32,2);warm.position.set(-7,1,-20);scene.add(warm);

const tunnel=new THREE.Group();scene.add(tunnel);
for(let i=0;i<42;i++){
 const z=-i*6.6;
 const ring=new THREE.Mesh(
   new THREE.TorusGeometry(7.2,.055,8,64),
   new THREE.MeshBasicMaterial({color:i%5===0?0x1fd2f5:0x0a4457,transparent:true,opacity:i%5===0?.46:.15})
 );
 ring.rotation.x=Math.PI/2;ring.position.set(0,2.5,z);tunnel.add(ring);
 if(i%3===0){
   const rib=new THREE.Mesh(new THREE.BoxGeometry(13.8,.04,.05),new THREE.MeshBasicMaterial({color:0x1a6d80,transparent:true,opacity:.22}));
   rib.position.set(0,7.1,z);tunnel.add(rib);
 }
}

const railMat=new THREE.MeshStandardMaterial({color:0x7bd8e7,emissive:0x0d4150,emissiveIntensity:1.6,metalness:.85,roughness:.18});
for(const x of[-2.35,2.35]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.11,.07,270),railMat);rail.position.set(x,-1,-112);scene.add(rail)}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,280),new THREE.MeshStandardMaterial({color:0x02070b,metalness:.15,roughness:.82}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.05,-112);scene.add(floor);

const starGeo=new THREE.BufferGeometry(),count=1100,pos=new Float32Array(count*3);
for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*18;pos[i*3+1]=(Math.random()-.35)*14;pos[i*3+2]=-Math.random()*260+15}
starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9af0ff,size:.032,transparent:true,opacity:.68,depthWrite:false}));scene.add(stars);

const stations=[];
function station(z,color,name,x){
 const g=new THREE.Group();
 const outer=new THREE.Mesh(new THREE.TorusGeometry(3.9,.16,16,96),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));
 outer.rotation.x=Math.PI/2;g.add(outer);
 const inner=new THREE.Mesh(new THREE.TorusGeometry(2.9,.05,10,72),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.38}));
 inner.rotation.x=Math.PI/2;g.add(inner);
 const core=new THREE.Mesh(new THREE.SphereGeometry(.3,24,24),new THREE.MeshBasicMaterial({color:0xffffff}));core.position.z=.42;g.add(core);
 const glow=new THREE.PointLight(color,30,26,2);glow.position.z=.5;g.add(glow);
 g.position.set(x,2.2,z);g.userData={name,color};scene.add(g);stations.push(g);
}
station(-42,0x49e6ff,'learn',-1.2);station(-92,0x7cffd2,'create',1.2);station(-144,0x8fa7ff,'opportunity',-.8);

const mover=new THREE.Mesh(new THREE.SphereGeometry(.22,24,24),new THREE.MeshBasicMaterial({color:0xffffff}));
const moverGlow=new THREE.PointLight(0x49e6ff,24,18,2);mover.add(moverGlow);scene.add(mover);

let progress=0,target=0;
const intro=document.getElementById('introCopy'),arrive=document.getElementById('arrivalCopy'),title=document.getElementById('arrivalTitle'),lead=document.getElementById('arrivalLead'),eyebrow=document.getElementById('arrivalEyebrow'),hint=document.getElementById('transitHint'),meter=document.getElementById('journeyMeter');
function smooth(a,b,n){return a+(b-a)*n}
function setText(p){
 if(isDoorway)return;
 const stops=[
  {a:.13,b:.31,t:THEMES.learn},
  {a:.39,b:.58,t:THEMES.create},
  {a:.66,b:.86,t:THEMES.opportunity}
 ];
 let shown=null,vis=0;
 for(const s of stops){const c=(s.a+s.b)/2,h=(s.b-s.a)/2,d=Math.abs(p-c)/h,v=Math.max(0,1-d);if(v>vis){vis=v;shown=s}}
 intro.style.opacity=String(Math.max(0,1-p*8));
 if(shown&&vis>.06){
   eyebrow.textContent=shown.t.eyebrow;title.textContent=shown.t.title;lead.textContent=shown.t.lead;
   arrive.style.opacity=String(Math.min(1,vis*1.7));
   arrive.style.transform='translateY('+(18*(1-vis))+'px)';
   arrive.style.filter='blur('+(7*(1-vis))+'px)';
 }else arrive.style.opacity='0';
 if(p<.06)hint.textContent='MOVE FORWARD';
 else if(p<.32)hint.textContent='FOLLOW THE LIGHT';
 else if(p<.61)hint.textContent='THE WORLD IS MOVING';
 else if(p<.9)hint.textContent='ONE MORE DESTINATION';
 else hint.textContent='CHOOSE A GLOWING GATE';
 meter.style.width=(p*100)+'%';
}
function onScroll(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);target=Math.min(1,Math.max(0,scrollY/max))}
addEventListener('scroll',onScroll,{passive:true});

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
addEventListener('click',e=>{
 if(isDoorway)return;
 pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(pointer,camera);
 const hit=ray.intersectObjects(stations,true)[0];if(!hit)return;
 let p=hit.object;while(p.parent&&!stations.includes(p))p=p.parent;
 if(stations.includes(p))location.href='model-06-doorway.html?world='+p.userData.name;
});

if(isDoorway){
 document.getElementById('doorEyebrow').textContent=theme.eyebrow;
 document.getElementById('doorTitle').textContent=theme.title;
 document.getElementById('doorLead').textContent=theme.lead;
 const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(2.5,.18,180,24,2,3),new THREE.MeshPhysicalMaterial({color:theme.color,emissive:theme.color,emissiveIntensity:2.2,metalness:.3,roughness:.12,transparent:true,opacity:.9}));
 knot.position.set(3.2,1.1,-4.6);scene.add(knot);
 camera.position.set(0,1.7,9);
 document.getElementById('worldTouch')?.addEventListener('click',()=>{
   hint.textContent='THE WORLD RESPONDS';
   gsap.to(knot.rotation,{x:knot.rotation.x+Math.PI*2,y:knot.rotation.y+Math.PI*2,duration:2,ease:'power2.inOut'});
   gsap.to(knot.scale,{x:1.45,y:1.45,z:1.45,duration:1.1,yoyo:true,repeat:1,ease:'power2.inOut'});
   gsap.to(camera.position,{z:4.7,x:1.2,duration:1.7,ease:'power2.inOut'});
 });
}

let clock=new THREE.Clock(),idle=0;
function animate(){
 const dt=Math.min(.05,clock.getDelta());idle+=dt;
 progress=smooth(progress,target,.055);
 if(!isDoorway){
   const auto=Math.sin(idle*.22)*.8;
   const z=14-progress*170+auto;
   camera.position.z=z;
   camera.position.x=Math.sin(idle*.33)*.22+Math.sin(progress*Math.PI*4)*.46;
   camera.position.y=1.9+Math.sin(idle*.42)*.08+Math.sin(progress*Math.PI*6)*.15;
   camera.rotation.z=Math.sin(idle*.25)*.006;
   key.position.z=z-3;key.position.x=Math.sin(idle*.7)*3.2;
   warm.position.z=z-18;
   mover.position.set(Math.sin(idle*.7)*2.2,.25+Math.sin(idle*1.1)*.25,z-8);
   setText(progress);
 }else{
   camera.position.y+=Math.sin(idle*.8)*.00055;
 }
 stars.rotation.z+=dt*.012;
 stations.forEach((s,i)=>{s.rotation.z+=dt*(i%2?.14:-.12);const pulse=1+Math.sin(idle*2+i)*.12;s.children[2].scale.setScalar(pulse)});
 renderer.render(scene,camera);requestAnimationFrame(animate);
}
function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<800?1.35:1.7));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);onScroll();animate();
})();
(()=>{
const canvas=document.getElementById('world');
if(!canvas||!window.THREE)return;
const doorway=document.body.classList.contains('doorway');
const qs=new URLSearchParams(location.search);
const world=qs.get('world')||'learn';
const colors={learn:0x42e6ff,create:0x78ffd0,opportunity:0x88aaff};
const accent=colors[world]||0x42e6ff;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x020409);
scene.fog=new THREE.FogExp2(0x020409,0.036);

const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,500);
camera.position.set(0,1.8,14);

const ambient=new THREE.AmbientLight(0x7bb6d9,.42);scene.add(ambient);
const key=new THREE.PointLight(accent,42,42,2);key.position.set(0,4,4);scene.add(key);
const warm=new THREE.PointLight(0xff8b3d,20,30,2);warm.position.set(-7,1,-18);scene.add(warm);

const tunnel=new THREE.Group();scene.add(tunnel);
const matDark=new THREE.MeshStandardMaterial({color:0x061018,metalness:.45,roughness:.48});
const matRail=new THREE.MeshStandardMaterial({color:0x7ac7d8,emissive:0x0b4050,emissiveIntensity:1.5,metalness:.82,roughness:.22});
for(let i=0;i<34;i++){
  const z=-i*7;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(7.2,.075,10,64),new THREE.MeshBasicMaterial({color:i%4===0?0x1aaed0:0x0b3543,transparent:true,opacity:i%4===0?.42:.18}));
  ring.rotation.x=Math.PI/2; ring.position.set(0,2.4,z); tunnel.add(ring);
  if(i%2===0){const beam=new THREE.Mesh(new THREE.BoxGeometry(14,.05,.08),new THREE.MeshBasicMaterial({color:0x13586b,transparent:true,opacity:.24}));beam.position.set(0,7,z);tunnel.add(beam)}
}
for(const x of[-2.2,2.2]){
 const rail=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,220),matRail);rail.position.set(x,-1,-92);scene.add(rail)
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,230,1,1),new THREE.MeshStandardMaterial({color:0x02070b,metalness:.15,roughness:.8}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.05,-92);scene.add(floor);

const particlesGeo=new THREE.BufferGeometry();const count=950;const pos=new Float32Array(count*3);
for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*18;pos[i*3+1]=(Math.random()-.35)*14;pos[i*3+2]=-Math.random()*220+12}
particlesGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
const particles=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0x8cecff,size:.035,transparent:true,opacity:.65,depthWrite:false}));scene.add(particles);

const stations=[];
function makeStation(z,color,label){
 const g=new THREE.Group();
 const halo=new THREE.Mesh(new THREE.TorusGeometry(3.6,.22,20,96),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));
 halo.rotation.x=Math.PI/2;g.add(halo);
 const inner=new THREE.Mesh(new THREE.CircleGeometry(2.75,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.11,side:THREE.DoubleSide}));
 inner.rotation.y=Math.PI;g.add(inner);
 const core=new THREE.Mesh(new THREE.SphereGeometry(.34,32,32),new THREE.MeshBasicMaterial({color:0xffffff}));
 core.position.z=.4;g.add(core);
 const light=new THREE.PointLight(color,28,24,2);light.position.set(0,0,1);g.add(light);
 g.position.set(0,2.15,z);g.userData={label,color};scene.add(g);stations.push(g);
}
makeStation(-38,0x42e6ff,'learn');makeStation(-83,0x7dffd4,'create');makeStation(-132,0x8aa0ff,'opportunity');

const transit=new THREE.Group();scene.add(transit);
for(let i=0;i<10;i++){
 const seg=new THREE.Mesh(new THREE.BoxGeometry(.025,.025,6),new THREE.MeshBasicMaterial({color:i%2?0x42e6ff:0xff9b47,transparent:true,opacity:.45}));
 seg.position.set(Math.sin(i*.8)*2.2,.25,-i*11-8);seg.rotation.z=Math.sin(i)*.18;transit.add(seg);
}

let progress=0,target=0,lastY=scrollY;
const overlays=[...document.querySelectorAll('.overlay')];
const instruction=document.getElementById('worldInstruction');
const progressBar=document.getElementById('progressBar');

function setOverlay(){
 if(doorway)return;
 const windows=[{a:0,b:.14,el:overlays[0]},{a:.18,b:.34,el:overlays[1]},{a:.43,b:.59,el:overlays[2]},{a:.69,b:.86,el:overlays[3]}];
 windows.forEach(w=>{
   const c=(w.a+w.b)/2,half=(w.b-w.a)/2,d=Math.abs(progress-c)/half,vis=Math.max(0,1-d);
   w.el.style.opacity=Math.min(1,vis*1.65);
   w.el.style.transform='translateY('+(22*(1-vis))+'px)';
   w.el.style.filter='blur('+(7*(1-vis))+'px)';
 });
 if(progress<.05)instruction.textContent='SCROLL TO DEPART';
 else if(progress<.18)instruction.textContent='APPROACHING: LEARN';
 else if(progress<.41)instruction.textContent='MOVE THROUGH THE LIGHT';
 else if(progress<.67)instruction.textContent='APPROACHING: CREATE';
 else if(progress<.89)instruction.textContent='APPROACHING: OPPORTUNITY';
 else instruction.textContent='CHOOSE A GLOWING STATION';
 if(progressBar)progressBar.style.width=(progress*100)+'%';
}
function onScroll(){
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 target=Math.min(1,Math.max(0,scrollY/max));lastY=scrollY;
}
addEventListener('scroll',onScroll,{passive:true});

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function pick(e){
 if(doorway)return;
 pointer.x=(e.clientX/innerWidth)*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(stations,true);
 if(hits.length){
   let p=hits[0].object;while(p&&p.parent&&!stations.includes(p))p=p.parent;
   if(p&&p.userData.label)location.href='model-05-doorway-preview.html?world='+p.userData.label;
 }
}
addEventListener('click',pick);

if(doorway){
 const labels={
  learn:['AI FOR LEARNING','Learn with','AI beside you.','Ask naturally. Watch the answer organize itself around you.'],
  create:['AI FOR CREATING','Imagine it.','Watch it form.','Ideas become something you can see, shape, and use.'],
  opportunity:['AI FOR OPPORTUNITY','See the path','before the paperwork.','Turn a goal into visible next steps.']
 };
 const d=labels[world]||labels.learn;
 document.getElementById('doorEyebrow').textContent=d[0];
 document.getElementById('doorTitle').innerHTML=d[1]+'<br><span>'+d[2]+'</span>';
 document.getElementById('doorLead').textContent=d[3];
 scene.fog.color.setHex(0x020409);
 key.color.setHex(accent);
 camera.position.set(0,1.6,9);
 const portal=new THREE.Mesh(new THREE.TorusKnotGeometry(2.7,.18,180,28,2,3),new THREE.MeshPhysicalMaterial({color:accent,emissive:accent,emissiveIntensity:2.3,metalness:.25,roughness:.12,transparent:true,opacity:.88}));
 portal.position.set(3.3,1.1,-4);scene.add(portal);
 const trigger=document.getElementById('ambientTrigger');
 trigger?.addEventListener('click',()=>{
   gsap.to(portal.rotation,{x:portal.rotation.x+Math.PI*2,y:portal.rotation.y+Math.PI*2,duration:2,ease:'power2.inOut'});
   gsap.to(portal.scale,{x:1.45,y:1.45,z:1.45,duration:1.2,yoyo:true,repeat:1,ease:'power2.inOut'});
   gsap.to(camera.position,{z:4.6,x:1.4,duration:1.6,ease:'power2.inOut'});
   document.getElementById('worldInstruction').textContent='THE WORLD IS RESPONDING';
 });
}

let clock=new THREE.Clock();
function animate(){
 const dt=Math.min(clock.getDelta(),.05);
 progress+= (target-progress)*.055;
 if(!doorway){
   const z=14-progress*158;
   camera.position.z=z;
   camera.position.x=Math.sin(progress*Math.PI*4)*.55;
   camera.position.y=1.8+Math.sin(progress*Math.PI*6)*.18;
   camera.rotation.z=Math.sin(progress*Math.PI*4)*.012;
   key.position.z=z-3; key.position.x=Math.sin(progress*12)*3.5;
   warm.position.z=z-18;
   setOverlay();
 } else {
   camera.position.y += (Math.sin(performance.now()*.00035)*.0009);
 }
 particles.rotation.z+=dt*.018;
 transit.rotation.z=Math.sin(performance.now()*.0004)*.02;
 stations.forEach((s,i)=>{s.rotation.z+=dt*(i%2?.18:-.14);s.children[2].scale.setScalar(1+Math.sin(performance.now()*.002+i)*.22)});
 renderer.render(scene,camera);requestAnimationFrame(animate);
}
function resize(){
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.35:1.75));
 renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()
}
addEventListener('resize',resize);
onScroll();animate();
})();
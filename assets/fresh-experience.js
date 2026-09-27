
const scenes=[...document.querySelectorAll('.scene')];
const dots=[...document.querySelectorAll('.rail span')];
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const i=scenes.indexOf(e.target);
      dots.forEach((d,n)=>d.classList.toggle('active',n===i));
      e.target.animate([{opacity:.72,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  })
},{threshold:.45});
scenes.forEach(s=>io.observe(s));
document.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{
  const target=document.querySelector(a.dataset.scroll); if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}
}));

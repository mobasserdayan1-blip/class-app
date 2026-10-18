/* منوی جمع‌شونده — در انتهای صفحه و هم‌زمان با بارگذاری HTML اجرا می‌شود */
(function(){
 const nav=document.getElementById('nav'),mb=document.getElementById('mb');if(!nav)return;
 const wide=()=>window.matchMedia('(min-width:900px)').matches;
 const RX=/^((?:\p{Extended_Pictographic}\uFE0F?(?:\u200d\p{Extended_Pictographic}\uFE0F?)*|[\u2600-\u27BF]\uFE0F?))(\s*)([\s\S]*)$/u;
 let busy=false;
 function wrap(){
  if(busy)return;busy=true;
  try{nav.querySelectorAll('button,summary').forEach(b=>{
   if(b.querySelector(':scope>.ni'))return;
   const txt=b.textContent;if(!txt.trim())return;
   const m=RX.exec(txt.trim());
   const ic=m?m[1]:'•',rest=m?m[3]:txt.trim();
   b.title=rest;
   b.textContent='';
   const i=document.createElement('span');i.className='ni';i.textContent=ic;
   const n=document.createElement('span');n.className='nt';n.textContent=(m?m[2]:'')+rest;
   b.appendChild(i);b.appendChild(n);
  })}catch(e){console.warn('nav wrap',e)}
  busy=false;
 }
 let pin=false,lastPT='mouse',tmr=null;
 const open=()=>{clearTimeout(tmr);nav.classList.add('nx')};
 const close=()=>{clearTimeout(tmr);nav.classList.remove('nx');pin=false};
 document.addEventListener('pointerdown',e=>{lastPT=e.pointerType||'mouse'},true);
 nav.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&wide())open()});
 nav.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pin)tmr=setTimeout(()=>{if(!pin)nav.classList.remove('nx')},140)});
 nav.addEventListener('focusin',()=>{if(wide()&&lastPT==='mouse')open()});
 nav.addEventListener('click',e=>{
  if(!wide())return;
  if(lastPT!=='mouse'&&!nav.classList.contains('nx')){e.stopPropagation();e.preventDefault();open();pin=true;return}
  if(e.target.closest('button[data-p]')&&lastPT!=='mouse')close();
 },true);
 if(mb)mb.addEventListener('click',e=>{if(!wide())return;e.stopPropagation();if(nav.classList.contains('nx')&&pin)close();else{pin=true;open()}},true);
 document.addEventListener('click',e=>{if(!wide())return;if(nav.classList.contains('nx')&&!nav.contains(e.target)&&!(mb&&mb.contains(e.target)))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 window.addEventListener('resize',()=>{if(!wide())close()});
 new MutationObserver(()=>wrap()).observe(nav,{childList:true,subtree:true,characterData:true});
 wrap();
})();

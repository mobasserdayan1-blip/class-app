/* دکمه‌ی «حضور و غیاب سریع» در هدر — همیشه در دسترس، با نقطه‌ی وضعیت امروز
   نارنجی = هنوز ثبت نشده · سبز = ثبت شده · خاکستری = امروز تعطیل است */
(function(){try{
const $=id=>document.getElementById(id);
const hd=document.querySelector('header');if(!hd||$('qab'))return;
const st=document.createElement('style');
st.textContent='#qab{position:relative}#qab::after{content:"";position:absolute;top:4px;left:4px;width:9px;height:9px;border-radius:50%;background:#ffb020;border:2px solid #fff}#qab[data-s="ok"]::after{background:#2eaf6b}#qab[data-s="off"]::after{background:#9aa0a6}#qab[data-s="none"]::after{display:none}@media(max-width:480px){header{gap:5px;padding-left:8px;padding-right:8px;flex-wrap:nowrap}header .menu-btn{padding:6px 9px;font-size:18px}header #ptl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}header #clsSel{flex:0 1 auto;min-width:0;max-width:30%;padding-left:4px;padding-right:4px}header .menu-btn{flex:0 0 auto}}';
document.head.appendChild(st);
const b=document.createElement('button');b.className='menu-btn';b.id='qab';b.type='button';b.textContent='📋';
b.setAttribute('aria-label','حضور و غیاب سریع');
const anchor=$('hb')||$('cb');hd.insertBefore(b,anchor);
const iso=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)};
const isMgr=()=>{try{return !!(window.isSchoolManager&&window.isSchoolManager())}catch(e){return false}};
function refresh(){try{
 if(typeof S==='undefined'||!S){return}
 b.style.display='';
 const T=iso(),w=new Date(T+'T12:00:00Z').getUTCDay();
 const off=w===4||w===5||!!(S.closed&&S.closed[T]);
 const stu=S.students||[];
 let s,tip;
 if(!stu.length){s='none';tip='حضور و غیاب'}
 else if(off){s='off';tip='امروز تعطیل است'}
 else{const A=(S.att&&S.att[T])||{},n=stu.filter(x=>A[x.id]).length;
  if(n){s='ok';tip='حضور و غیاب امروز ثبت شده'}else{s='';tip='حضور و غیاب امروز هنوز ثبت نشده'}}
 b.dataset.s=s;b.title=tip;b.setAttribute('aria-label','حضور و غیاب سریع — '+tip)
}catch(e){}}
b.onclick=()=>{try{if(typeof show==='function')show('att');window.scrollTo({top:0,behavior:'smooth'})}catch(e){}};
const o=window.show;
if(typeof o==='function')window.show=function(id){const r=o.apply(this,arguments);setTimeout(refresh,60);return r};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
setInterval(refresh,20000);
setTimeout(refresh,300);
}catch(e){console.error('quick-attendance',e)}})();

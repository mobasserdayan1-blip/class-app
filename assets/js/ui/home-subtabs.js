/* زیرتب‌های صفحه‌ی اصلی */
(function(){try{
const nav=document.getElementById('nav'),$=id=>document.getElementById(id);
const H=[['home','🏠 داشبورد',['home']],['stu','🎓 دانش‌آموزان',['sl','sf','edit','pmt','pmg']],['day','📋 کلاس و فعالیت',['att','act','mot','teams','draw']],['les','📚 درس و آزمون',['crs','wsc','exp','skl','mk','prof']],['rep','📈 گزارش‌ها',['arep','rep','mr','wk','wr','pm','mgr']],['sch','🏫 مدرسه و مدیریت',['dm','cls','tf','bz']],['set','⚙️ پروفایل و تنظیمات',['tme','tsa','tex','hsv','set','bk']]].map(([k,t,ids])=>({k,t,ids:ids.filter(i=>$(i))}));
const known=new Set(H.flatMap(h=>h.ids));[...document.querySelectorAll('section[id]')].forEach(s=>{if(!known.has(s.id)&&s.id!=='sc'&&s.id!=='mot2'){H[H.length-1].ids.push(s.id);known.add(s.id)}});
const MGI=['prof','mgr','bk','tme'],isTc=()=>{try{return !!(window.isTeacherRole&&window.isTeacherRole())}catch(e){return false}},isMg=()=>{try{return !!(window.isSchoolManager&&window.isSchoolManager())}catch(e){return false}};
const gid=h=>{if(!isMg())return h.ids.filter(i=>!(i==='bk'&&isTc()));if(h.k==='sch')return['dm','cls','tf','prof','mgr','bz','bk'].filter(i=>$(i));return h.ids.filter(i=>MGI.indexOf(i)<0)};
const title=i=>{const p=(typeof pages!=='undefined'?pages:[]).find(x=>x[0]===i);return p?p[1]:i},last={};
nav.innerHTML='';H.filter(h=>h.ids.length).forEach(h=>{const b=document.createElement('button');b.textContent=h.t;b.dataset.p=h.k;b.onclick=()=>{const g=gid(h);show(g.includes(last[h.k])?last[h.k]:g[0])};nav.appendChild(b)});
function deco(id){const h=H.find(x=>gid(x).includes(id));nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',!!h&&b.dataset.p===h.k));const old=$('subTabs');if(old)old.remove();if(!h)return;last[h.k]=id;const gs=gid(h);if(gs.length<2)return;
 const bar=document.createElement('div');bar.id='subTabs';bar.innerHTML=gs.map(i=>`<button data-t="${i}" class="${i===id?'on':''}">${title(i)}</button>`).join('');bar.onclick=e=>{const b=e.target.closest('[data-t]');if(b)show(b.dataset.t)};$(id).before(bar)}
const o=window.show;window.show=function(id){if(id==='sc')id='mot';const r=o.call(this,id);try{deco(id);if(id==='home')homeKpi()}catch(e){}return r};
function homeKpi(){const hm=$('home');if(!hm||!window.S||!S.students)return;let b=$('hk');if(!b){b=document.createElement('div');b.id='hk';const h2=hm.querySelector('h2');h2?h2.after(b):hm.prepend(b)}
 const n=S.students.length,fx=x=>typeof fa==='function'?fa(x):x,T=iso(tdy()),A=S.att&&S.att[T]||{},pres=S.students.filter(s=>A[s.id]==='p'||A[s.id]==='l').length,has=S.students.some(s=>A[s.id]);
 let sum=0,c=0;const per=S.students.map(s=>{let a=0,k=0;(S.exams||[]).forEach(e=>{const v=nrm(e,s.id);if(v!=null&&!isNaN(v)){a+=v;k++;sum+=v;c++}});return k?a/k:null});
 let hd=0,ht=0;(S.hwl||[]).forEach(h=>Object.values(h.st||{}).forEach(v=>{ht++;if(v==='d')hd++;else if(v==='p')hd+=.5}));
 const low=per.filter(v=>v!=null&&v<2).length,k=(i,t,v,cl)=>`<div class="hk-k" style="--c:${cl}"><i>${i}</i><b>${v}</b><span>${t}</span></div>`;
 b.innerHTML=k('👥','دانش‌آموزان کلاس',fx(n),'#7e57c2')+k('✅','حضور امروز',has?fx(Math.round(pres/n*100))+'٪':'ثبت نشده','#1a8f55')+k('📘','میانگین آزمون‌ها (از ۴)',c?fx((sum/c).toFixed(1)):'—','#2b8bd6')+k('📝','تکالیف انجام‌شده',ht?fx(Math.round(hd/ht*100))+'٪':'—','#f0a030')+k('💡','نیازمند توجه',fx(low),'#d9534f')}
const _R=window.render;if(typeof _R==='function'){window.render=function(){const r=_R.apply(this,arguments);try{if($('home')&&$('home').classList.contains('on'))homeKpi()}catch(e){}return r}}
window.__deco=deco;const cur=document.querySelector('section.on');deco(cur?cur.id:'home');homeKpi();
}catch(e){console.error('menu',e)}})();

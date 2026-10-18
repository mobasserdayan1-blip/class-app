/* جستجوی سراسری */
(function(){try{
const $=id=>document.getElementById(id),E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const KS='cl_gs_scope',MAX=30;

const sp=$('spro');
if(sp){
 const sidOf=()=>{const n=sp.querySelector('input[data-nm]');return n?+n.dataset.sid:0};
 const mEl=t=>{let m=t.parentNode.querySelector('.scm');if(!m){m=document.createElement('small');m.className='scm';m.style.cssText='display:block;font-size:12px;min-height:16px;margin-top:2px';t.parentNode.appendChild(m)}return m};
 sp.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.f!=='sc')return;e.stopPropagation();
  const id=sidOf(),I=S.info[id]=S.info[id]||{},c=window.scNorm(t.value);if(c!==t.value)t.value=c;const m=mEl(t);
  if(c===''){m.style.color='#8a7aa6';m.textContent='با خالی ماندن، کد جدید خودکار ساخته می‌شود';t.style.borderColor='';return}
  const r=window.scCheck(c,I);
  if(r.ok){if(I.sc!==r.code){I.sc=r.code;save()}m.textContent='';t.style.borderColor=''}
  else{m.style.color='#d12f35';m.textContent='⚠️ '+r.msg+' (تا اصلاح نشود ذخیره نمی‌شود)';t.style.borderColor='#d12f35'}},true);
 sp.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.f!=='sc')return;
  const id=sidOf(),I=S.info[id]=S.info[id]||{},c=window.scNorm(t.value),m=mEl(t);
  if(c===''){delete I.sc;window.ensureCodes();t.value=I.sc||'';m.style.color='#1a8f55';m.textContent='✅ کد جدید خودکار ساخته شد';t.style.borderColor='';save();return}
  const r=window.scCheck(c,I);
  if(!r.ok){t.value=I.sc||'';m.style.color='#d12f35';m.textContent='⚠️ '+r.msg+' — کد قبلی حفظ شد';t.style.borderColor=''}
  else{m.style.color='#1a8f55';m.textContent='✅ ذخیره شد'}},true);
}
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='e_sc')return;
 const c=window.scNorm(t.value);if(c!==t.value)t.value=c;const m=$('e_scm');if(!m)return;
 if(c===''){m.style.color='#8a7aa6';m.textContent='با خالی ماندن، کد جدید خودکار ساخته می‌شود';return}
 const ov=t.closest('.act-sh'),sb=ov&&ov.querySelector('[data-sl="s"]'),id=sb?+sb.dataset.i:0,r=window.scCheck(c,S.info[id]||{});
 m.style.color=r.ok?'#1a8f55':'#d12f35';m.textContent=r.ok?'✓ کد معتبر است؛ با «ذخیره» ثبت می‌شود':'⚠️ '+r.msg});

const nz=v=>String(v==null?'':v).replace(/[\u06F0-\u06F9]/g,d=>String.fromCharCode(d.charCodeAt(0)-0x06F0+48)).replace(/[\u0660-\u0669]/g,d=>String.fromCharCode(d.charCodeAt(0)-0x0660+48)).replace(/\u064A/g,'\u06CC').replace(/\u0643/g,'\u06A9').replace(/[\u200C\u200D\u200E\u200F\u064B-\u0652\u0640]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const realCls=()=>(S.classes||[]).filter(c=>!c.demo&&window.clsOK(c.id));
const multi=()=>realCls().length>1&&Object.keys(S.stash||{}).length>0;
const getRole=()=>{try{if(window.isTeacherRole&&window.isTeacherRole())return'teacher';return localStorage.getItem(KS)==='school'?'manager':'teacher'}catch(e){return'teacher'}};
const getScope=()=>getRole()==='manager'&&multi()?'school':'class';
const setScope=v=>{try{localStorage.setItem(KS,v)}catch(e){}};
const lab=c=>c?(window.clsLab?window.clsLab(c):((c.grade||'')+' '+(c.sec||'')).trim()):'';
function pool(scope){try{window.ensureCodes&&window.ensureCodes()}catch(e){}
 const out=[];
 const add=(T,c,cur)=>(T.students||[]).forEach(x=>out.push({s:x,I:(T.info||{})[x.id]||{},cid:c?c.id:S.cur,L:lab(c),cur}));
 const cs=(S.classes||[]).filter(c=>window.clsOK(c.id));
 add(S,cs.find(c=>c.id===S.cur),true);
 if(scope==='school')realCls().forEach(c=>{if(c.id===S.cur)return;const T=(S.stash||{})[c.id];if(T)add(T,c,false)});
 return out}
function search(q,scope){const Q=nz(q);if(!Q)return[];const toks=Q.split(' ').filter(Boolean),qd=Q.replace(/\s/g,''),isNum=/^\d+$/.test(qd),res=[];
 pool(scope).forEach(o=>{const nm=nz(o.s.name),code=String(o.I.sc||''),fn=nz(o.I.fn||''),nc=nz(o.I.nc||'');let r=99;
  if(isNum){if(code===qd)r=0;else if(code.startsWith(qd))r=1;else if(nc&&(nc===qd||(qd.length>=4&&nc.startsWith(qd))))r=2;else if(qd.length>=3&&code.includes(qd))r=3}
  else if(toks.every(t=>nm.includes(t)))r=nm.startsWith(Q)?4:(nm.split(' ').some(w=>w.startsWith(toks[0]))?5:6);
  else if(toks.every(t=>(nm+' '+fn).includes(t)))r=7;
  if(r<99)res.push(Object.assign({r,nm},o))});
 res.sort((a,b)=>a.r-b.r||a.nm.localeCompare(b.nm,'fa'));return res}

const st=document.createElement('style');
st.textContent='#gsbar{position:sticky;z-index:6;background:var(--bg2);padding:6px 10px 7px;border-bottom:1px solid var(--line)}#gsbar .gsw{position:relative;max-width:640px;margin:0 auto}#gsbar #gs_q{width:100%;margin:0;box-sizing:border-box;font-size:15px;padding:10px 14px 10px 40px;border-radius:14px}#gsbar #gs_x{position:absolute;left:5px;top:5px;width:30px;height:30px;padding:0;margin:0;display:none;border-radius:10px}#gsbar.has #gs_x{display:block}#gs{position:absolute;right:0;left:0;top:100%;margin-top:6px;display:none;background:var(--card);color:var(--tx);border-radius:16px;padding:10px;box-shadow:0 12px 40px rgba(0,0,0,.3);border:1px solid var(--line)}#gs.open{display:block}#gs .gsc{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 6px}#gs .gsc button{flex:1 1 140px;padding:8px 10px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--tx);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}#gs .gsc button.on{background:var(--p);border-color:var(--p);color:#fff}#gs .gsr{max-height:56vh;overflow:auto}#gs .gsi{display:flex;gap:10px;align-items:center;width:100%;text-align:right;padding:8px;margin:0;border:0;border-bottom:1px solid var(--line);border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer}#gs .gsi.on,#gs .gsi:hover{background:var(--bg2)}#gs .gsn{flex:1;min-width:0}#gs .gsn b{display:block;font-size:15px}#gs .gsn small{display:block;color:var(--mut);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#gs .gcd{background:var(--bg2);border-radius:8px;padding:2px 10px;font-weight:800;font-size:14px;letter-spacing:1px}#gs .gjm{font-size:11px;color:var(--p);font-weight:700;white-space:nowrap}#gs .gsm{color:var(--mut);font-size:13px;text-align:center;margin:8px 4px}.locked #gsbar{display:none!important}@media(min-width:900px){nav{top:var(--navtop,calc(60px + env(safe-area-inset-top,0px)))!important}}@media print{#gsbar{display:none!important}}';
document.head.appendChild(st);

const bar=document.createElement('div');bar.id='gsbar';
bar.innerHTML='<div class="gsw"><input id="gs_q" type="text" enterkeyhint="search" autocomplete="off" placeholder="🔍 جستجوی دانش‌آموز: نام یا کد ۵ رقمی…" aria-label="جستجوی دانش‌آموز (نام یا کد ۵ رقمی)"><button class="sm" id="gs_x" aria-label="پاک کردن">✕</button><div id="gs"><div class="gsc" id="gs_c"></div><div class="gsr" id="gs_r"></div></div></div>';
const hd=document.querySelector('header');
if(hd)hd.insertAdjacentElement('afterend',bar);else document.body.insertBefore(bar,document.body.firstChild);
const box=$('gs'),qi=$('gs_q');
const fit=()=>{try{bar.style.top=(hd?hd.offsetHeight+(parseFloat(getComputedStyle(hd).top)||0):0)+'px';document.documentElement.style.setProperty('--navtop',(parseFloat(bar.style.top)+bar.offsetHeight)+'px')}catch(e){}};
fit();addEventListener('resize',fit);setTimeout(fit,500);addEventListener('load',fit);try{document.fonts&&document.fonts.ready.then(fit)}catch(e){}

let R=[],act=0;
function chips(){const c=$('gs_c');if(!multi()){c.innerHTML='';return}const sc=getScope(),cur=(S.classes||[]).find(x=>x.id===S.cur);
 c.innerHTML='<button data-sc="class" class="'+(sc==='class'?'on':'')+'">👩‍🏫 معلم: کلاس من'+(cur?' ('+E(lab(cur))+')':'')+'</button>'+((window.isTeacherRole&&window.isTeacherRole())?'':'<button data-sc="school" class="'+(sc==='school'?'on':'')+'">👔 مدیر: کل مدرسه</button>')}
function draw(){chips();const q=qi.value,sc=getScope(),r=$('gs_r');
 if(!nz(q)){const n=pool(sc).length;R=[];r.innerHTML='<p class="gsm">نام (یا بخشی از آن) یا کد ۵ رقمی دانش‌آموز را بنویسید.<br>جستجو در '+(sc==='school'?'همه‌ی کلاس‌های مدرسه':'کلاس فعلی')+' · '+fa(n)+' دانش‌آموز</p>';return}
 const all=search(q,sc);R=all.slice(0,MAX);if(act>=R.length)act=0;
 if(!R.length){r.innerHTML='<p class="gsm">دانش‌آموزی پیدا نشد.'+(multi()&&sc==='class'?'<br>برای جستجو در همه‌ی کلاس‌ها «مدیر: کل مدرسه» را بزنید.':'')+'</p>';return}
 r.innerHTML='<p class="gsm" style="margin:2px 4px 6px;text-align:right">'+fa(all.length)+' نتیجه'+(all.length>MAX?' (فقط '+fa(MAX)+' مورد اول؛ عبارت را دقیق‌تر کنید)':'')+'</p>'+R.map((o,i)=>{const fn=String(o.I.fn||'').trim();
  return '<button class="gsi'+(i===act?' on':'')+'" data-i="'+i+'">'+(window.stAv?window.stAv(o.s,40):'')+'<span class="gsn"><b>'+E(o.s.name)+'</b><small>'+E(o.L)+(fn?(o.L?' · ':'')+'پدر: '+E(fn):'')+'</small></span><span class="gcd">'+(o.I.sc?fa(o.I.sc):'—')+'</span>'+(o.cur?'':'<span class="gjm">↪ کلاس دیگر</span>')+'</button>'}).join('')}
function openBox(f){if(document.documentElement.classList.contains('locked'))return;box.classList.add('open');draw();if(f!==false){qi.focus();qi.select()}}
function closeBox(){box.classList.remove('open')}
function go(o){closeBox();qi.value='';bar.classList.remove('has');qi.blur();
 if(o.cur){try{window.show&&window.show('sf')}catch(e){}setTimeout(()=>window.openProf&&window.openProf(o.s.id),30);return}
 try{sessionStorage.setItem('gs_open',String(o.s.id))}catch(e){}
 window.__goto='sf';if(window.switchCls)window.switchCls(o.cid)}
qi.addEventListener('focus',()=>openBox(false));
qi.addEventListener('input',()=>{act=0;bar.classList.toggle('has',!!qi.value);openBox(false)});
qi.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!R.length)return;e.preventDefault();act=(act+(e.key==='ArrowDown'?1:-1)+R.length)%R.length;draw();const el=box.querySelector('.gsi.on');if(el&&el.scrollIntoView)el.scrollIntoView({block:'nearest'})}else if(e.key==='Enter'&&R[act]){e.preventDefault();go(R[act])}else if(e.key==='Escape'){closeBox();qi.blur()}});
$('gs_x').addEventListener('click',()=>{qi.value='';bar.classList.remove('has');act=0;draw();qi.focus()});
box.addEventListener('click',e=>{const t=e.target,c=t.closest('[data-sc]');if(c){setScope(c.dataset.sc);act=0;draw();qi.focus();return}const i=t.closest('.gsi');if(i&&R[+i.dataset.i])go(R[+i.dataset.i])});
document.addEventListener('click',e=>{if(!bar.contains(e.target))closeBox()});
document.addEventListener('keydown',e=>{const t=e.target,typing=t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);
 if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();openBox();return}
 if(e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();openBox()}});
window.gsOpen=openBox;

try{const gid=sessionStorage.getItem('gs_open');if(gid){sessionStorage.removeItem('gs_open');setTimeout(()=>{window.openProf&&window.openProf(+gid)},700)}}catch(e){}
}catch(e){console.warn('gsearch',e)}})();

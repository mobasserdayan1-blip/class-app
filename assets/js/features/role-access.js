/* نقش‌ها و سطح دسترسی */
(function(){try{
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const mgrInfo=()=>{try{return JSON.parse(localStorage.getItem('schMgr')||'null')}catch(e){return null}};
const isT=()=>{try{const r=window.__schRole&&window.__schRole();
  if(r==='manager')return false;           /* مدیرِ تأییدشده از سرور */
  if(r==='teacher')return true;            /* معلم یا عضو غیرفعال */
  if(r==='pending')return !mgrInfo();      /* تا معلوم نشدن نقش، قفل (مگر مدیرِ شناخته‌شده) */
  const a=JSON.parse(localStorage.getItem('schAcc')||'null');return !!a&&a.role==='teacher'}catch(e){return false}};
const isM=()=>!isT()&&!!mgrInfo();
window.isTeacherRole=isT;window.isManagerRole=()=>!isT();window.isSchoolManager=isM;
const cur=()=>{const s=document.querySelector('main section.on');return s?s.id:''};
const BLOCK=['cls','dm','tf','bz'],GUARD=BLOCK.concat(['sch']);
const st=document.createElement('style');
st.textContent='.ra-hide{display:none!important}body.role-teacher #cls,body.role-teacher #dm,body.role-teacher #tf,body.role-teacher #bz,body.role-teacher #sch{display:none!important}'
 +'body.role-manager{--p:#2a4d9b;--p2:#4a7ae0;--line:#d8e3fa}body.role-manager .thero{background:linear-gradient(120deg,#1e3a8a,#3b6fd8);box-shadow:0 8px 24px #1e3a8a44}';
document.head.appendChild(st);

window.__raToast=function(t){let d=$('ra_toast');
 if(!d){d=document.createElement('div');d.id='ra_toast';d.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100000;background:#222;color:#fff;border-radius:14px;padding:12px 14px;font:700 13px Vazirmatn,Tahoma,sans-serif;text-align:right;line-height:1.8;display:none;box-shadow:0 8px 24px #0005';document.body.appendChild(d)}
 d.textContent=t;d.style.display='block';clearTimeout(d._t);d._t=setTimeout(()=>{d.style.display='none'},5000)};

const TT={prof:'✍️ امضا و کتاب‌های من',mgr:'🧾 گزارش‌های کلاس من'};
const TM={dm:'🏛️ پیشخوان مدیریت',home:'🏠 داشبورد کلاس'};
const ALL=Object.assign({},TT,TM),H2=['prof','mgr','dm'],orig={},origH={};
const tmap=()=>isT()?TT:isM()?TM:{};
function titles(){
 const m=tmap();
 if(typeof pages!=='undefined')Object.keys(ALL).forEach(k=>{const p=pages.find(x=>x[0]===k);if(!p)return;if(!(k in orig))orig[k]=p[1];p[1]=m[k]||orig[k]});
 H2.forEach(k=>{const s=$(k),h=s&&s.querySelector('h2');if(!h)return;if(!(k in origH))origH[k]=h.textContent;h.textContent=m[k]||origH[k]});
 try{const p=typeof pages!=='undefined'&&pages.find(x=>x[0]===cur());if(p&&$('ptl'))$('ptl').textContent=p[1]}catch(e){}
}
const SS=()=>typeof S!=='undefined'?S:null;
const mgrName=()=>{const i=mgrInfo()||{},s=SS();return String(i.name||(s&&s.prof&&s.prof.principal)||'').trim()};

function applyUI(){
 const t=isT(),m=isM();
 document.body.classList.toggle('role-teacher',t);
 document.body.classList.toggle('role-manager',m);
 titles();
 const nav=$('nav');
 if(nav){
  ['sch'].concat(BLOCK).forEach(k=>{const b=nav.querySelector('[data-p="'+k+'"]');if(b)b.classList.toggle('ra-hide',t)});
  {const meb=nav.querySelector('[data-p="me"]');if(meb)meb.classList.toggle('ra-hide',m)}
  const sch=nav.querySelector('[data-p="sch"]'),hm=nav.querySelector('[data-p="home"]'),se=nav.querySelector('[data-p="set"]');
  if(sch){if(!sch.dataset.o)sch.dataset.o=sch.textContent;{const nx=m?'🏛️ پیشخوان مدیریت':sch.dataset.o;if(sch.textContent!==nx)sch.textContent=nx}
   if(m&&nav.firstElementChild!==sch)nav.insertBefore(sch,nav.firstElementChild);
   else if(!m&&se&&nav.firstElementChild===sch)nav.insertBefore(sch,se)}
  if(hm){if(!hm.dataset.o)hm.dataset.o=hm.textContent;{const nx=m?'🏠 داشبورد کلاس':hm.dataset.o;if(hm.textContent!==nx)hm.textContent=nx}}
 }
 document.querySelectorAll('#subTabs [data-t]').forEach(b=>{const k=b.dataset.t,mp=tmap();
  if(BLOCK.indexOf(k)>=0)b.classList.toggle('ra-hide',t);
  if(mp[k])b.textContent=mp[k];else if(orig[k]&&ALL[k])b.textContent=orig[k]});
 const sel=$('clsSel');
 if(sel){
  const o=[...sel.options].find(x=>x.value==='__m'),od=[...sel.options].find(x=>x.value==='__dm');
  if(t&&o)o.remove();
  else if(!t&&!o&&sel.options.length&&typeof window.renderCls==='function'){try{window.renderCls()}catch(e){}}
  if(!m&&od)od.remove();
  if(m&&!od&&sel.options.length){const x=document.createElement('option');x.value='__dm';x.textContent='🏛️ پیشخوان مدیریت';sel.insertBefore(x,sel.firstChild)}
  try{syncSel()}catch(e){}
 }
 const ps=$('p_school'),card=ps&&ps.closest('.card');
 if(card){
  [...card.children].forEach(c=>{
   if(c.id==='ra_gr')return;
   const keep=c.id==='p_teacher'||(c.tagName==='LABEL'&&c.nextElementSibling&&c.nextElementSibling.id==='p_teacher');
   c.classList.toggle('ra-hide',t&&!keep)});
  let g=$('ra_gr');
  if(t){
   if(!g){g=document.createElement('p');g.id='ra_gr';g.className='sub';g.style.cssText='text-align:right;margin:0 0 8px';card.prepend(g)}
   const P=(SS()&&SS().prof)||{};
   g.textContent='پایه‌ی این کلاس: '+(P.grade||'—')+(P.sec?' · شعبه '+P.sec:'')+' — نام مدرسه، پایه، شعبه، نام مدیر و لوگو را فقط مدیر تنظیم می‌کند.';
   g.classList.remove('ra-hide')}
  else if(g)g.classList.add('ra-hide')}
 const sg=$('sg_box');
 if(sg)[...sg.children].forEach(r=>{if(r.querySelector('[data-sgf="sigP"]'))r.classList.toggle('ra-hide',t)});
 const sc=$('sgCard');
 if(sc){const sp=$('sg_p'),blk=sp&&sp.closest('div[style*="margin-top:12px"]');if(blk)blk.classList.toggle('ra-hide',t);
  const h=sc.querySelector('b');if(h){if(!h.dataset.o)h.dataset.o=h.textContent;h.textContent=t?'✍️ امضای من':h.dataset.o}}
 const dc=$('dcCard');if(dc)dc.classList.toggle('ra-hide',t);
 const hd=c=>{const h=c.querySelector(':scope>b'),x=h?h.textContent.trim():'';return x.indexOf('♻️')===0||x.indexOf('🗑️')===0||x.indexOf('🧹')===0||x.indexOf('نیمسال تحصیلی')>=0||x.indexOf('گزارش تعطیلات')>=0||x.indexOf('➕ افزودن کلاس')>=0||x.indexOf('🔒 قفل و ورود')>=0||x.indexOf('🔐 حساب و ورود')>=0||x.indexOf('📊 فضای ذخیره')>=0};
 document.querySelectorAll('#bkb .card,#setBody .card,#rsCard,#hlCard').forEach(c=>c.classList.toggle('ra-hide',t&&(c.id==='rsCard'||c.id==='hlCard'||hd(c))));
}
const MGR_ONLY='#cl_a,[data-cd],#bk_reset,#dc_x,#bk_f,#rsCard button,#rsCard input,#hlCard button,#hlCard input,[data-st="sem"],[data-st="semr"],[data-st="chg"],[data-st="on"],[data-st="off"],[data-st="now"],#st_lk,#sx_up,#sx_ld,[data-hl]';
['click','change'].forEach(ev=>document.addEventListener(ev,e=>{
 if(!isT()||!e.target||!e.target.closest)return;
 if(e.target.closest(MGR_ONLY)){e.stopImmediatePropagation();e.preventDefault();window.__raToast&&window.__raToast('این بخش فقط برای مدیر مدرسه است.')}
},true));

function patchHero(){
 if(!isM())return;
 const b=document.querySelector('#home .thero>div>b');if(!b)return;
 const n=mgrName(),want='سلام'+(n?'، '+n:'')+' 👋';
 if(b.textContent!==want)b.textContent=want;
 const sp=b.nextElementSibling,P=(SS()&&SS().prof)||{};
 if(sp&&P.teacher&&sp.textContent.indexOf('معلم کلاس')<0)sp.textContent+=' · معلم کلاس: '+P.teacher;
}

function mgrDm(){
 if(!isM())return;const b=$('dmb');if(!b)return;
 let wd='';try{wd=new Date().toLocaleDateString('fa-IR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}catch(e){}
 const i=mgrInfo()||{},n=mgrName();
 const _h=b.querySelector('.thero'),_html=
  '<div class="card"><b>🏫 ورود به کلاس‌ها</b>'
  +'<p class="sub" style="text-align:right;margin:6px 0">هر کلاس را از فهرست بالای صفحه یا دکمه‌ی «باز کردن» جدول پایین باز کنید؛ مدیر به همه‌ی بخش‌های هر کلاس دسترسی کامل دارد.</p>'
  +'<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="sm" data-ra-go="home">🏠 داشبورد کلاس فعلی</button><button class="sm" data-sc="down">⬇️ دریافت تغییرات معلم‌ها</button><button class="sm" data-sc="up">⬆️ ارسال کلاس‌ها به مدرسه</button></div></div>';
 if(_h)_h.insertAdjacentHTML('afterend',_html);else b.insertAdjacentHTML('afterbegin',_html);
}
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('[data-ra-go]');if(g)show(g.dataset.raGo)});
if(typeof window.renderDm==='function'){const rd=window.renderDm;window.renderDm=function(){if(isT()){const b=$('dmb');if(b)b.innerHTML='';return}const r=rd.apply(this,arguments);try{mgrDm()}catch(e){console.warn('ra-dm',e)}return r}}

if(typeof window.switchCls==='function'){const sw=window.switchCls;window.switchCls=function(){if(!window.__goto&&cur()==='dm')window.__goto='home';return sw.apply(this,arguments)}}

{const sel=$('clsSel');if(sel){const oc=sel.onchange;sel.onchange=function(e){const v=e.target.value;
 if(v==='__dm'){show('dm');return}
 if(isM()&&v!=='__m'&&String(v)===String(S.cur)){window.__goto=null;show('home');return}
 return oc&&oc.call(this,e)}}}
function syncSel(){const sel=$('clsSel');if(!sel||!isM())return;
 const v=cur()==='dm'?'__dm':String(SS()?SS().cur:'');
 if([...sel.options].some(o=>o.value===v)&&sel.value!==v)sel.value=v}

const o=window.show;
window.show=function(id){if(isT()&&GUARD.indexOf(id)>=0)id='home';const r=o.call(this,id);try{applyUI();patchHero()}catch(e){}return r};
const watch=(id,opt)=>{const n=$(id);if(n)new MutationObserver(()=>{try{applyUI()}catch(e){}}).observe(n,opt||{childList:true})};
['setBody','sg_box','clsSel','prof','bkb'].forEach(k=>watch(k));
{const h=$('home');if(h)new MutationObserver(()=>{try{patchHero()}catch(e){}}).observe(h,{childList:true,subtree:true})}

function land(){
 if(!isM())return;
 try{if(sessionStorage.getItem('ra_landed'))return;sessionStorage.setItem('ra_landed','1')}catch(e){}
 if(cur()==='home')show('dm');
}

let lt=isT(),lm=isM();
setInterval(()=>{const t=isT(),m=isM();if(t===lt&&m===lm)return;lt=t;lm=m;try{applyUI();patchHero()}catch(e){}try{window.__deco&&window.__deco(cur())}catch(e){}
 if(t&&GUARD.indexOf(cur())>=0)show('home');
 if(m)land()},800);
applyUI();patchHero();
if(isT()&&GUARD.indexOf(cur())>=0)show('home');
land();
}catch(e){console.error('role-access',e)}})();

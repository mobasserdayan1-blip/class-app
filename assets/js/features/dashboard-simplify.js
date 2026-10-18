/* [DASH-1] ساده‌سازی منو و داشبورد معلم/مدیر — فقط ظاهر و ترتیب؛ ذخیره‌سازی، Firebase و ورود دست‌نخورده‌اند */
(function(){try{
const $=id=>document.getElementById(id);
const FA=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const F1=v=>FA((+v).toFixed(1).replace('.','٫'));
const esc=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const today=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12))};
const ISO=d=>d.toISOString().slice(0,10);
const SS=()=>typeof S!=='undefined'?S:null;
const isT=()=>{try{return !!(window.isTeacherRole&&window.isTeacherRole())}catch(e){return false}};
const offDay=()=>{const s=SS(),w=today().getUTCDay();return w===4||w===5||!!(s&&s.closed&&s.closed[ISO(today())])};

/* ---------- استایل ---------- */
const st=document.createElement('style');
st.textContent=`
.qa{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0}
@media(min-width:700px){.qa{grid-template-columns:repeat(5,1fr)}}
.qa button{font-family:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;min-height:104px;padding:14px 8px;border:2px solid var(--line);border-radius:20px;background:var(--card);color:var(--tx);cursor:pointer;box-shadow:0 4px 14px #7e57c21f;transition:transform .15s,box-shadow .2s,border-color .15s}
.qa button:hover{transform:translateY(-2px);border-color:var(--p);box-shadow:0 8px 20px #7e57c233}
.qa button:active{transform:scale(.97)}
.qa .qi{font-size:30px;line-height:1}.qa b{font-size:15px}
.qa small{font-size:11.5px;color:var(--mut);line-height:1.6}
.qa button.main{grid-column:1/-1;min-height:92px;background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;border-color:transparent}
.qa button.main small{color:#fff;opacity:.95}
@media(min-width:700px){.qa button.main{grid-column:auto}}
#home:not(.dmore) #tdash2 .tk>div:nth-child(4),#home:not(.dmore) #tdash2 .tk>div:nth-child(6),#home:not(.dmore) #tdash2 .tk>div:nth-child(9){display:none}
#home:not(.dmore) #tdash2>.tw:nth-child(n+5){display:none}
#home:not(.tdon) #dmoreBtn{display:none}
#dmoreBtn{display:block;width:100%;margin:0 0 14px;padding:12px;font-family:inherit;font-weight:700;font-size:14px;border-radius:16px;border:2px dashed var(--line);background:var(--bg2);color:var(--p);cursor:pointer}
#homeMore{background:var(--card);border-radius:20px;padding:6px 12px;margin-top:12px;box-shadow:0 4px 16px #7e57c21f}
#homeMore>summary,.dmdet>summary{cursor:pointer;font-weight:800;padding:10px 4px;list-style:none}
#homeMore>summary::-webkit-details-marker,.dmdet>summary::-webkit-details-marker{display:none}
#dmb .tdg .tk.dm4{grid-template-columns:repeat(2,1fr)}
@media(min-width:900px){#dmb .tdg .tk.dm4{grid-template-columns:repeat(4,1fr)}}
.dmq{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}
.dmq button{font-family:inherit;font-weight:700;font-size:13.5px;border:0;border-radius:14px;padding:12px;background:var(--bg2);color:var(--p);cursor:pointer;text-align:center}
.dmdet{background:var(--card);border-radius:20px;padding:6px 12px;box-shadow:0 4px 16px #7e57c21f}
.dmdet .tdg{margin-top:10px}
.dmal{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:14px}
.dmal:last-child{border:0}.dmal span{flex:1;min-width:0}
.dmal button{font-family:inherit;font-weight:700;font-size:12.5px;border:0;border-radius:10px;padding:7px 12px;background:var(--bg2);color:var(--p);cursor:pointer}
`;
document.head.appendChild(st);

/* ---------- داشبورد معلم: ۵ کار روزانه ---------- */
function attInfo(){const s=SS();if(!s||!s.students||!s.students.length)return 'ابتدا دانش‌آموزان را اضافه کنید';
 if(offDay())return 'امروز تعطیل است';
 const A=(s.att&&s.att[ISO(today())])||{},n=s.students.filter(x=>A[x.id]).length;
 if(!n)return '⏳ هنوز ثبت نشده';
 return '✅ ثبت شد · '+FA(s.students.filter(x=>A[x.id]==='a').length)+' غایب'}
function hwInfo(){const s=SS();if(!s)return '';const T=ISO(today()),n=(s.hwl||[]).filter(h=>h.date===T).length;return n?FA(n)+' تکلیف برای امروز':'برای امروز تکلیفی ثبت نشده'}
const TL=[['att','📋','حضور و غیاب امروز',attInfo,'main'],['hw','📚','بررسی تکلیف',hwInfo,''],['crs','✍️','ثبت نمره و آزمون',()=>'درس‌ها و ارزیابی‌ها',''],['act','🌟','ثبت فعالیت کلاسی',()=>'تشویق و مشارکت',''],['wsc','🗓️','برنامه امروز و آزمون‌ها',()=>'برنامه هفتگی و امتحانات','']];
function qa(){const h=$('home');if(!h)return;let b=$('qa');
 if(!b){b=document.createElement('div');b.id='qa';b.className='qa';const sub=$('hsub');(sub||h.firstElementChild||h).after(b)}
 b.innerHTML=TL.map(t=>`<button type="button" data-q="${t[0]}" class="${t[4]}"><span class="qi">${t[1]}</span><b>${t[2]}</b><small>${esc(t[3]())}</small></button>`).join('')}
document.addEventListener('click',e=>{const q=e.target.closest&&e.target.closest('#qa [data-q]');if(!q)return;const k=q.dataset.q;
 if(k==='hw'){show('att');setTimeout(()=>{const x=$('hwc');if(x&&x.scrollIntoView)x.scrollIntoView({behavior:'smooth',block:'start'})},150);return}
 show(k)});
function foldHome(){const h=$('home');if(!h||$('homeMore'))return;
 const h2=[...h.children].find(x=>x.tagName==='H2'&&x.textContent.indexOf('رده')>=0);if(!h2)return;
 const rk=h2.nextElementSibling,ad=rk&&rk.nextElementSibling;
 const d=document.createElement('details');d.id='homeMore';
 d.innerHTML='<summary>🏆 رده‌بندی دانش‌آموزان و ➕ افزودن دانش‌آموز</summary>';
 h2.before(d);d.appendChild(h2);if(rk)d.appendChild(rk);if(ad&&ad.querySelector('#add'))d.appendChild(ad)}
function moreBtn(){const box=$('tdash2'),h=$('home');if(!box||!h||$('dmoreBtn'))return;
 const b=document.createElement('button');b.id='dmoreBtn';b.type='button';b.textContent='📊 نمودارها و جزئیات بیشتر ▾';
 box.after(b);b.onclick=()=>{const on=h.classList.toggle('dmore');b.textContent=on?'🔼 جمع کردن جزئیات':'📊 نمودارها و جزئیات بیشتر ▾'}}
function homeInit(){try{qa();foldHome();moreBtn()}catch(e){console.warn('dash-home',e)}}

/* ---------- داشبورد مدیر: شاخص‌ها ← هشدارها ← جدول مقایسه ← میانبرها ---------- */
function tidyDm(){
 const box=$('dmb'),s=SS();if(!box||!s)return;
 const g=box.querySelector(':scope>.tdg');if(!g||g.dataset.tidy)return;
 const kids=[...g.children],hd=x=>{const h=x.querySelector&&x.querySelector(':scope>h3');return h?h.textContent:''};
 const pick=em=>kids.find(x=>x.classList.contains('tw')&&hd(x).indexOf(em)>=0);
 const hero=kids.find(x=>x.classList.contains('thero')),links=kids.find(x=>x.classList.contains('card')&&x.querySelector('[data-ra-go]'));
 const need=pick('🚦'),all=pick('🏫'),tch=pick('🧑'),warn=pick('⚠');
 if(!all)return;
 g.dataset.tidy='1';
 const charts=['⚖','🍩','📅','📝','🌟'].map(pick).filter(Boolean);
 const T=ISO(today()),off=offDay();
 const C=(s.classes||[]).filter(c=>!c.demo&&(!window.clsOK||window.clsOK(c.id)));
 let N=0,A=0,AN=0,pres=0,tot=0,chk=0,done=0;const noRec=[];
 C.forEach(c=>{const x=window.clsStats?window.clsStats(c):null;
  if(x){N+=x.n||0;if(x.avg!=null){A+=x.avg*x.n;AN+=x.n}}
  const d=c.id===s.cur?s:(s.stash&&s.stash[c.id]);if(!d)return;
  const ids=d.students||[];if(!ids.length)return;chk++;
  const a=(d.att&&d.att[T])||{};
  if(ids.some(q=>a[q.id])){done++;ids.forEach(q=>{if(a[q.id]){tot++;if(a[q.id]!=='a')pres++}})}else noRec.push(c)});
 const needOk=!!(need&&need.querySelector('table')),needN=needOk?Math.max(0,need.querySelectorAll('tr').length-1):0;
 const alN=(off?0:noRec.length)+needN;
 const kp=(i,v,n,sub,col,attr)=>`<div style="--c:${col};cursor:pointer" ${attr}><i>${i}</i><b>${v}</b><span>${n}</span><em>${sub}</em></div>`;
 const k=document.createElement('div');k.className='tk dm4';
 k.innerHTML=kp('👥',FA(N),'دانش‌آموز',FA(C.length)+' کلاس','#3b6fd8','data-m="stu"')
  +kp('✅',off?'—':(tot?FA(Math.round(pres/tot*100))+'٪':'—'),'حضور امروز',off?'امروز تعطیل است':(chk?FA(done)+' از '+FA(chk)+' کلاس ثبت کرده‌اند':'داده‌ای نیست'),'#2eaf6b','data-m="att"')
  +kp('📊',AN?F1(A/AN):'—','میانگین مدرسه (از ۴)','همه‌ی کلاس‌ها','#9b6fd0','data-m="avg"')
  +kp('🚨',FA(alN),'هشدار',alN?'نیازمند بررسی':'موردی نیست',alN?'#e5484d':'#2eaf6b','data-al="1"');
 const lab=c=>{try{return window.clsLab?window.clsLab(c):'کلاس'}catch(e){return 'کلاس'}};
 const rows=off?'':noRec.map(c=>{const m=(window.clsMeta&&window.clsMeta(c))||{};
  return `<div class="dmal"><span>📋 <b>${esc(lab(c))}</b>${m.t?` <small style="color:var(--mut)">· ${esc(m.t)}</small>`:''} — امروز حضور و غیاب ثبت نشده</span><button type="button" data-nr="${c.id}">باز کردن</button></div>`}).join('');
 const al=document.createElement('div');al.className='tw';al.id='dmAlerts';
 al.innerHTML=`<h3>🚨 هشدارهای امروز<small>${alN?FA(alN)+' مورد':''}</small></h3>${rows||(needOk?'':'<p class="tem">امروز هشداری وجود ندارد 🌟</p>')}${needOk&&!rows?'<p class="tem" style="padding:0 0 4px">کلاسی بدون حضور و غیاب نیست؛ کلاس‌های نیازمند توجه در جدول زیر است.</p>':''}`;
 const q=document.createElement('div');q.className='tw';
 q.innerHTML='<h3>⚡ میانبرها</h3><div class="dmq"><button type="button" data-dg="mr">🗓️ گزارش ماهانه‌ی درس</button><button type="button" id="dm_r">🧾 گزارش‌های مدیر (PDF و اکسل)</button><button type="button" data-dg="cls">🏫 مدرسه، کلاس‌ها و معلم‌ها</button><button type="button" data-dg="tf">🧑‍🏫 پرونده‌ی معلم‌ها</button><button type="button" data-dg="bz">📦 خروجی گروهی گزارش‌ها</button></div>';
 const grid=q.querySelector('.dmq');
 if(links)[...links.querySelectorAll('button')].forEach(b=>grid.appendChild(b));
 const det=document.createElement('details');det.className='dmdet';det.open=!!window.__dmOpen;
 det.innerHTML='<summary>📊 نمودارها و جزئیات بیشتر</summary>';
 const inner=document.createElement('div');inner.className='tdg';
 charts.concat(warn?[warn]:[]).forEach(x=>inner.appendChild(x));det.appendChild(inner);
 det.addEventListener('toggle',()=>{window.__dmOpen=det.open});
 const order=[hero,k,al,needOk?need:null,all,tch,q,det].filter(Boolean);
 while(g.firstChild)g.removeChild(g.firstChild);
 order.forEach(x=>g.appendChild(x))}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
 const b=t.closest('#dmb [data-nr]');
 if(b){const id=+b.dataset.nr,s=SS();if(s&&id===s.cur){show('att')}else if(window.switchCls){window.__goto='att';window.switchCls(id)}return}
 const d=t.closest('#dmb [data-dg]');if(d){const id=d.dataset.dg;if($(id))show(id);return}
 const a=t.closest('#dmb [data-al]');if(a){const x=$('dmAlerts');if(x&&x.scrollIntoView)x.scrollIntoView({behavior:'smooth',block:'start'})}});
if(typeof window.renderDm==='function'){const rd=window.renderDm;window.renderDm=function(){const r=rd.apply(this,arguments);try{tidyDm()}catch(e){console.warn('dash-dm',e)}return r}}

/* ---------- معلم هرگز صفحه‌ی پشتیبان را نمی‌بیند ---------- */
const o=window.show;
window.show=function(id){if(isT()&&id==='bk')id='set';const r=o.call(this,id);try{if(id==='home')homeInit()}catch(e){}return r};
{const h=$('home');if(h)new MutationObserver(()=>{try{foldHome();moreBtn()}catch(e){}}).observe(h,{childList:true})}
homeInit();
setInterval(()=>{try{const h=$('home');if(h&&h.classList.contains('on')&&!document.hidden)qa()}catch(e){}},30000);
try{const c=document.querySelector('main section.on');if(c&&c.id==='dm'&&typeof window.renderDm==='function')window.renderDm()}catch(e){}
}catch(e){console.error('dash-v1',e)}})();

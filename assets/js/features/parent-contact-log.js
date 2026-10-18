/* دفتر تماس با ولی — ثبت تماس‌ها، جلسه‌ها و پیام‌های هر دانش‌آموز با تاریخ و یادداشت
   داده‌ها در S.info[شناسه‌ی دانش‌آموز].pcl ذخیره می‌شود؛ پس همراه پشتیبان، ذخیره‌ی ابری و انتقال دانش‌آموز می‌ماند */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const TY=[['call','📞','تماس تلفنی'],['meet','🤝','جلسه‌ی حضوری'],['msg','💬','پیام'],['note','📝','یادداشت']];
const tyOf=k=>TY.find(t=>t[0]===k)||TY[3];
const DAYS=[[0,'امروز'],[1,'دیروز'],[2,'۲ روز پیش'],[3,'۳ روز پیش'],[7,'هفته‌ی پیش']];
const fn2=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const isoOff=k=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()-k,12)).toISOString().slice(0,10)};
const jd=iso=>{try{const p=jp(new Date(iso+'T12:00:00Z'));return fn2(p.y+'/'+String(p.m).padStart(2,'0')+'/'+String(p.d).padStart(2,'0'))}catch(e){return iso}};
const list=id=>{const I=(S.info||{})[id];return(I&&Array.isArray(I.pcl))?I.pcl:[]};
const stu=id=>(S.students||[]).find(s=>s.id===id);

const st=document.createElement('style');
st.textContent=`
.pcl-ov{position:fixed;inset:0;z-index:9000;background:#0008;display:none;align-items:flex-end;justify-content:center;padding:0}
.pcl-ov.on{display:flex}
.pcl-bx{background:var(--card);color:var(--tx);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px;box-shadow:0 -8px 30px #0004}
@media(min-width:640px){.pcl-ov{align-items:center}.pcl-bx{border-radius:22px}}
.pcl-h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.pcl-h b{font-size:16px;color:var(--p)}
.pcl-x{border:0;background:var(--bg2);color:var(--tx);border-radius:10px;padding:6px 11px;font:700 14px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pcl-f{display:grid;gap:8px;margin:10px 0 14px;padding:12px;border-radius:16px;background:var(--bg2)}
.pcl-r{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pcl-f select,.pcl-f textarea{width:100%;margin:0;border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:10px;font:inherit}
.pcl-f textarea{min-height:76px;resize:vertical}
.pcl-go{border:0;border-radius:14px;padding:12px;font:800 15px Vazirmatn,Tahoma,sans-serif;color:#fff;background:linear-gradient(90deg,var(--p),var(--p2));cursor:pointer}
.pcl-tel{display:inline-block;text-decoration:none;border-radius:12px;padding:8px 12px;font:700 13px Vazirmatn,Tahoma,sans-serif;background:var(--bg2);color:var(--p);margin-bottom:6px}
.pcl-e{position:relative;padding:10px 12px;margin-bottom:8px;border-radius:14px;border:1.5px solid var(--line);background:var(--card)}
.pcl-e .pt{display:flex;align-items:center;gap:8px;font-weight:800;font-size:13.5px}
.pcl-e small{color:var(--mut);font-weight:600}
.pcl-e p{margin:6px 0 0;font-size:14px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
.pcl-e .del{position:absolute;left:8px;top:8px;border:0;background:none;cursor:pointer;font-size:15px;opacity:.7}
.pcl-em{text-align:center;color:var(--mut);padding:14px 0;font-size:14px}
`;
document.head.appendChild(st);

const ov=document.createElement('div');ov.className='pcl-ov';ov.id='pclOv';
ov.innerHTML='<div class="pcl-bx" role="dialog" aria-modal="true"></div>';
document.body.appendChild(ov);
let cur=0;

function draw(){
 const s=stu(cur),bx=ov.firstElementChild;if(!s){ov.classList.remove('on');return}
 const I=(S.info||{})[cur]||{},L=list(cur).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.id-a.id);
 const tel=I.fp?`<a class="pcl-tel" href="tel:${E(I.fp)}">📞 تماس با ولی (${E(I.fp)})</a>`:'<div class="sub" style="text-align:right;margin:0 0 6px">شماره‌ی ولی در «مشخصات، والدین و عکس» ثبت نشده است.</div>';
 bx.innerHTML=`<div class="pcl-h"><b>📞 دفتر تماس با ولی — ${E(s.name)}</b><button class="pcl-x" data-pc="x" aria-label="بستن">✕</button></div>${tel}
 <div class="pcl-f"><div class="pcl-r"><select id="pclT" aria-label="نوع ارتباط">${TY.map(t=>`<option value="${t[0]}">${t[1]} ${t[2]}</option>`).join('')}</select>
 <select id="pclD" aria-label="تاریخ">${DAYS.map(d=>`<option value="${d[0]}">${d[1]}</option>`).join('')}</select></div>
 <textarea id="pclN" placeholder="موضوع و نتیجه‌ی گفت‌وگو… (مثلاً: درباره‌ی تکالیف نیمه‌تمام صحبت شد و ولی قول پیگیری داد)"></textarea>
 <button class="pcl-go" data-pc="add">➕ ثبت در دفتر</button></div>
 ${L.length?L.map(x=>{const t=tyOf(x.t);return `<div class="pcl-e"><div class="pt"><span>${t[1]} ${t[2]}</span><small>${jd(x.date)}</small></div>${x.n?`<p>${E(x.n)}</p>`:''}<button class="del" data-pc-del="${x.id}" aria-label="حذف">🗑</button></div>`}).join(''):'<div class="pcl-em">هنوز ارتباطی ثبت نشده است.</div>'}`
}
function open(id){cur=id;draw();ov.classList.add('on')}
function close(){ov.classList.remove('on');try{if(window.renderSF&&$('sf')&&$('sf').classList.contains('on'))window.renderSF()}catch(e){}}

ov.addEventListener('click',e=>{const t=e.target;
 if(t===ov){close();return}
 const a=t.closest&&t.closest('[data-pc]');
 if(a){const k=a.dataset.pc;if(k==='x'){close();return}
  if(k==='add'){const n=($('pclN').value||'').trim(),ty=$('pclT').value,off=+$('pclD').value||0;
   if(!n&&ty==='note'){$('pclN').focus();return}
   S.info=S.info||{};const I=S.info[cur]=S.info[cur]||{};I.pcl=Array.isArray(I.pcl)?I.pcl:[];
   I.pcl.push({id:Date.now(),t:ty,date:isoOff(off),n});save();draw()}
  return}
 const d=t.closest&&t.closest('[data-pc-del]');
 if(d){if(!confirm('این مورد از دفتر تماس حذف شود؟'))return;const id=+d.dataset.pcDel,I=(S.info||{})[cur];
  if(I&&Array.isArray(I.pcl)){I.pcl=I.pcl.filter(x=>x.id!==id);save();draw()}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))close()});

/* دکمه در پرونده‌ی دانش‌آموز */
function addBtn(){const g=document.querySelector('#sfb .sfg');if(!g||g.querySelector('[data-pcl]')||!window.__sfid)return;
 const n=list(window.__sfid).length,b=document.createElement('button');b.type='button';b.dataset.pcl='1';
 b.textContent='📞 دفتر تماس با ولی'+(n?' ('+fn2(n)+')':'');g.appendChild(b)}
const R=window.renderSF;
if(typeof R==='function')window.renderSF=function(){const r=R.apply(this,arguments);try{addBtn()}catch(e){}return r};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#sfb [data-pcl]');if(b&&window.__sfid)open(window.__sfid)});
window.openParentLog=open;
}catch(e){console.error('parent-contact-log',e)}})();

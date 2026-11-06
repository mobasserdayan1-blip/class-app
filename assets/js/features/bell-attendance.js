/* حضور و غیاب زنگ‌به‌زنگ (cl-v163)
   ─ ماژول مستقل؛ داده در S.bat[تاریخ][شناسه‌ی دانش‌آموز][زنگ] = 'a' | 'o' | 'r'  (حاضر ذخیره نمی‌شود؛ پیش‌فرض است)
   ─ وضعیت‌ها: p حاضر · a غایب · o خروج با اجازه‌ی مدرسه · r بازگشت به مدرسه
   ─ وضعیت «کل روز» (S.att) دست‌نخورده می‌ماند و همه‌ی گزارش‌های قبلی مثل قبل کار می‌کنند.
   ─ خروج یا غیبت یک زنگ هیچ فعالیت/آزمون قبلی را حذف نمی‌کند. فعالیت یا آزمونِ همان زنگ برای دانش‌آموزِ خارج،
     «انجام‌نشده به علت خروج» است؛ نه صفر و نه نمره/ارزشیابی منفی. آزمونِ ناتمام در صفحه‌ی «آزمون جبرانی» منتظر می‌ماند.
   ─ برای حذف کامل این قابلیت: فایل و تگ script آن را بردارید؛ بقیه‌ی برنامه بدون آن هم کار می‌کند. */
(function(){try{
if(window.BellAtt)return;
const $=id=>document.getElementById(id);
const FA=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ST={p:{t:'ح',n:'حاضر',c:'#1a8f55',bg:'#e3f4ea'},a:{t:'غ',n:'غایب',c:'#c0262c',bg:'#fde7e8'},o:{t:'خ',n:'خروج با اجازه',c:'#b45309',bg:'#ffe9d6'},r:{t:'ب',n:'بازگشت به مدرسه',c:'#0f766e',bg:'#d9f3ef'}};
const kit=()=>window.djKit||null;
const dayAbs=(k,sid)=>(((S.att||{})[k]||{})[sid])==='a';
/* وضعیت مؤثر یک دانش‌آموز در یک زنگ */
function get(k,b,sid){
 if(dayAbs(k,sid))return'a';
 const x=S.bat&&S.bat[k]&&S.bat[k][sid];
 return(x&&x[String(b)])||'p'}
const isOut=(k,b,sid)=>{const v=get(k,b,sid);return v==='a'||v==='o'};
function bellsOf(k){try{return kit()?kit().bellsOf(k):[]}catch(e){return[]}}
/* ثبت وضعیت؛ toEnd = اعمال تا پایان روز (زنگ‌های بعدی) */
function set(k,sid,b,status,toEnd){
 const L=bellsOf(k).map(x=>x.b),i=L.indexOf(String(b));if(i<0)return false;
 S.bat=S.bat||{};const d=S.bat[k]=S.bat[k]||{},r=d[sid]=d[sid]||{};
 const put=(bb,v)=>{if(v==null||v==='p')delete r[bb];else r[bb]=v};
 put(L[i],status);
 if(toEnd){for(let j=i+1;j<L.length;j++){
   const cur=r[L[j]];
   if(status==='o'||status==='a')put(L[j],status);
   else if(status==='r'||status==='p'){if(cur==='o'||cur==='a')put(L[j],null)}}}
 if(!Object.keys(r).length)delete d[sid];if(!Object.keys(d).length)delete S.bat[k];
 save();return true}
/* آیا دانش‌آموز هنگام آزمون خارج از مدرسه بوده؟ (غیبتِ کل روز اینجا حساب نمی‌شود؛ مسیر قدیمی خودش را دارد) */
function outAtExam(e,sid){try{
 if(!e||!e.date||dayAbs(e.date,sid))return false;
 const k=kit();if(!k)return false;const b=k.examBell(e);if(b==null)return false;
 return isOut(e.date,b,sid)}catch(x){return false}}
window.exOutAt=outAtExam;

/* ───── رابط کاربری ───── */
let curK=null;
function today(){try{return kit().todayK()}catch(e){const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)}}
function close(){const o=$('batOv');if(o)o.remove();const c=$('batPick');if(c)c.remove();document.removeEventListener('keydown',onKey,true)}
function onKey(e){if(e.key==='Escape'){e.stopPropagation();const c=$('batPick');if(c)c.remove();else closeAndRefresh()}}
function closeAndRefresh(){const k=curK;close();try{const m=$('djMx');if(m&&m.offsetParent&&window.djApi&&k)window.djApi.open(k,null)}catch(e){}}
function summaryOf(k,sid){let o=0;bellsOf(k).forEach(x=>{if(isOut(k,x.b,sid))o++});return o}
function render(){
 const k=curK,K=kit();if(!K)return;
 let ov=$('batOv');
 if(!ov){ov=document.createElement('div');ov.id='batOv';ov.setAttribute('dir','rtl');
  ov.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:2147481000;display:grid;place-items:center;padding:12px;font-family:Vazirmatn,Tahoma,sans-serif';
  ov.addEventListener('click',onClick);document.body.appendChild(ov);document.addEventListener('keydown',onKey,true)}
 const B=bellsOf(k),stu=K.students(),off=K.isOff(k);
 let h=`<div role="dialog" aria-modal="true" style="background:var(--card,#fff);color:var(--tx,#1e293b);border-radius:16px;max-width:980px;width:100%;max-height:94vh;overflow:auto;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.35)">
 <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:16px">🔔 حضور و غیاب زنگ‌به‌زنگ</b><button type="button" data-bt="close" style="border:0;background:#eef2f7;border-radius:10px;padding:8px 14px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">✕ بستن</button></div>
 <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin:10px 0;flex-wrap:wrap">
  <button type="button" data-bt="day:1" style="${bs()}">روز بعد ▶</button><b style="min-width:170px;text-align:center">${esc(K.dlab(k))}</b><button type="button" data-bt="day:-1" style="${bs()}">◀ روز قبل</button>
  ${k!==today()?`<button type="button" data-bt="today" style="${bs('#1d4ed8','#fff')}">امروز</button>`:''}</div>
 <div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:8px">روی خانه‌ی هر دانش‌آموز در هر زنگ بزنید تا وضعیت آن زنگ را تعیین کنید. حاضر پیش‌فرض است. «خروج» هیچ فعالیت یا آزمونِ قبلی را حذف نمی‌کند؛ فعالیت/آزمونِ زنگ خروج برای او «انجام‌نشده به علت خروج» می‌شود، نه صفر و نه منفی. وضعیت کل روز در «حضور و غیاب» دست‌نخورده می‌ماند.</div>`;
 if(off)h+=`<div style="background:#fff4d6;color:#92400e;border-radius:10px;padding:8px 12px;margin-bottom:8px;font-size:13px">این روز تعطیل است.</div>`;
 if(!B.length){h+=`<div style="padding:18px;text-align:center;color:#64748b">برای این روز زنگی تعریف نشده است. ابتدا «برنامه‌ی هفتگی» را تنظیم کنید یا در دفتر روزانه یک زنگ ثبت کنید.</div>`}
 else{
  h+=`<div style="overflow:auto;border:1px solid #e2e8f0;border-radius:12px"><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="position:sticky;right:0;background:#f1f5f9;padding:8px;text-align:right;min-width:130px">نام دانش‌آموز</th>${B.map(x=>`<th style="background:#f1f5f9;padding:6px 4px;min-width:64px;font-size:11.5px;line-height:1.5">${esc(x.short)}</th>`).join('')}<th style="background:#f1f5f9;padding:6px;font-size:11.5px">زنگ‌های خارج</th></tr></thead><tbody>`;
  h+=stu.map(s=>{const da=dayAbs(k,s.id);
   const tds=B.map(x=>{if(da)return`<td style="padding:3px;text-align:center;background:#f8fafc;color:#94a3b8;font-size:11px" title="غایب در کل روز (از صفحه‌ی حضور و غیاب)">غ</td>`;
    const v=get(k,x.b,s.id),m=ST[v];
    return`<td style="padding:3px;text-align:center"><button type="button" data-bt="cell:${esc(x.b)}:${s.id}" title="${m.n}" style="width:100%;min-height:36px;border:1px solid ${v==='p'?'#e2e8f0':m.c};border-radius:8px;background:${v==='p'?'#fff':m.bg};color:${m.c};font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">${m.t}</button></td>`}).join('');
   const n=da?'':summaryOf(k,s.id);
   return`<tr><td style="position:sticky;right:0;background:var(--card,#fff);padding:6px 8px;font-weight:700;border-top:1px solid #f1f5f9">${esc(s.name)}${da?' <small style="color:#c0262c">(غایب کل روز)</small>':''}</td>${tds}<td style="text-align:center;border-top:1px solid #f1f5f9;font-weight:800;color:${n?'#b45309':'#94a3b8'}">${n?FA(n):'—'}</td></tr>`}).join('');
  h+=`</tbody></table></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12px">${['p','a','o','r'].map(q=>`<span style="padding:3px 9px;border-radius:8px;background:${ST[q].bg};color:${ST[q].c};font-weight:800">${ST[q].t} = ${ST[q].n}</span>`).join('')}</div>`}
 /* زنگ آزمون‌های این روز */
 const exs=(Array.isArray(S.exams)?S.exams:[]).filter(e=>e&&e.date===k);
 if(exs.length&&B.length){
  h+=`<div style="margin-top:14px;border-top:1px solid #e2e8f0;padding-top:10px"><b style="font-size:14px">📝 زنگ آزمون‌های این روز</b><div style="font-size:12px;color:#64748b;margin:4px 0 8px">برای اینکه «خروج هنگام آزمون» درست تشخیص داده شود، زنگ آزمون را مشخص کنید. اگر خالی بماند، زنگِ همان درس در برنامه‌ی هفتگی (در صورت وجود) حساب می‌شود.</div>`;
  h+=exs.map(e=>{const cur=e.bell!=null&&e.bell!==''?String(e.bell):'',auto=K.examBell(Object.assign({},e,{bell:''}));
   const cn=((S.courses||[]).find(c=>c.id===e.course)||{}).name||'';
   return`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:5px 0"><span style="font-weight:700;min-width:170px">${esc(cn)} — ${esc(e.title||e.type||'آزمون')}</span><select data-bt-ex="${e.id}" style="padding:7px;border:1px solid #cbd5e1;border-radius:9px;font:700 13px Vazirmatn,Tahoma,sans-serif"><option value=""${cur===''?' selected':''}>خودکار${auto!=null?' ('+esc((B.find(x=>x.b===auto)||{}).short||'')+')':' (نامشخص)'}</option>${B.map(x=>`<option value="${esc(x.b)}"${cur===x.b?' selected':''}>${esc(x.short)}</option>`).join('')}</select></div>`}).join('')+`</div>`}
 h+=`</div>`;
 ov.innerHTML=h;
 const sel=ov.querySelectorAll('[data-bt-ex]');sel.forEach(s=>s.addEventListener('change',()=>{const e=(S.exams||[]).find(x=>String(x.id)===s.dataset.btEx);if(!e)return;if(s.value==='')delete e.bell;else e.bell=s.value;save();render()}))}
function bs(bg,fg){return`border:0;border-radius:10px;padding:8px 14px;background:${bg||'#eef2f7'};color:${fg||'#1e293b'};font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer`}
function pick(b,sid){
 const k=curK,K=kit(),s=K.students().find(q=>String(q.id)===String(sid)),bl=bellsOf(k).find(x=>x.b===String(b));if(!s||!bl)return;
 const cur=get(k,b,sid);const old=$('batPick');if(old)old.remove();
 const o=document.createElement('div');o.id='batPick';o.setAttribute('dir','rtl');
 o.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147482000;display:grid;place-items:center;padding:14px;font-family:Vazirmatn,Tahoma,sans-serif';
 o.innerHTML=`<div role="dialog" aria-modal="true" style="background:var(--card,#fff);color:var(--tx,#1e293b);border-radius:16px;max-width:400px;width:100%;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.35)">
  <b style="font-size:15px">${esc(s.name)}</b><div style="font-size:12px;color:#64748b;margin:2px 0 10px">${esc(bl.short)} · ${esc(K.dlab(k))}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${['p','a','o','r'].map(q=>`<button type="button" data-bp="${q}" style="min-height:44px;border-radius:11px;border:2px solid ${cur===q?ST[q].c:'transparent'};background:${ST[q].bg};color:${ST[q].c};font:800 13.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer">${ST[q].t} ${ST[q].n}</button>`).join('')}</div>
  <label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px;cursor:pointer"><input type="checkbox" id="batEnd" checked style="width:18px;height:18px"> اعمال برای زنگ‌های بعدیِ همین روز هم</label>
  <div style="font-size:11.5px;color:#64748b;margin-top:6px;line-height:1.8">«بازگشت» و «حاضر» فقط زنگ‌های بعدیِ خارج‌شده را به حاضر برمی‌گرداند. فعالیت‌ها و آزمون‌های قبلی هرگز پاک نمی‌شوند.</div>
  <button type="button" data-bp="x" style="margin-top:10px;width:100%;border:0;background:#eef2f7;border-radius:10px;padding:10px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">بستن</button></div>`;
 o.addEventListener('click',e=>{if(e.target===o){o.remove();return}const t=e.target.closest('[data-bp]');if(!t)return;const v=t.dataset.bp;if(v==='x'){o.remove();return}
  set(k,sid,b,v,!!(o.querySelector('#batEnd')||{}).checked);o.remove();render()});
 document.body.appendChild(o)}
function onClick(e){
 if(e.target===$('batOv')){closeAndRefresh();return}
 const t=e.target.closest('[data-bt]');if(!t)return;const a=t.dataset.bt.split(':');
 if(a[0]==='close')closeAndRefresh();
 else if(a[0]==='day'){curK=kit().addD(curK,+a[1]);render()}
 else if(a[0]==='today'){curK=today();render()}
 else if(a[0]==='cell')pick(a[1],a[2])}
function open(k){if(!kit()){alert('ابتدا صفحه‌ی دفتر روزانه را یک بار باز کنید');return}curK=k||today();render()}

window.BellAtt={get,isOut,set,outAtExam,open,bellsOf,STATUS:ST};

/* دکمه‌ی 🔔 کنار «حضور و غیاب سریع» در هدر */
try{const hd=document.querySelector('header');
 if(hd&&!$('bab')){const b=document.createElement('button');b.className='menu-btn';b.id='bab';b.type='button';b.textContent='🔔';b.setAttribute('aria-label','حضور و غیاب زنگ‌به‌زنگ');b.title='حضور و غیاب زنگ‌به‌زنگ';
  const anchor=$('qab')||$('hb')||$('cb');hd.insertBefore(b,anchor);b.addEventListener('click',()=>open())}}catch(e){}
}catch(err){console.error('bell-attendance',err)}})();

/* حضور و غیاب زنگ‌به‌زنگ (cl-v163)
   ─ ماژول مستقل؛ داده در S.bat[تاریخ][شناسه‌ی دانش‌آموز][زنگ] = 'a' | 'o' | 'r'  (حاضر ذخیره نمی‌شود؛ پیش‌فرض است) و S.batLog[تاریخ] = سابقه‌ی زمان‌دار تغییرها
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
function set(k,sid,b,status,toEnd,noLog){
 const L=bellsOf(k).map(x=>x.b),i=L.indexOf(String(b));if(i<0)return false;
 S.bat=S.bat||{};const d=S.bat[k]=S.bat[k]||{},r=d[sid]=d[sid]||{};
 const put=(bb,v)=>{if(v==null||v==='p')delete r[bb];else r[bb]=v};
 put(L[i],status);
 if(toEnd){for(let j=i+1;j<L.length;j++){
   const cur=r[L[j]];
   if(status==='o'||status==='a')put(L[j],status);
   else if(status==='r'||status==='p'){if(cur==='o'||cur==='a')put(L[j],null)}}}
 if(!Object.keys(r).length)delete d[sid];if(!Object.keys(d).length)delete S.bat[k];
 if(!noLog){/* سابقه‌ی زمان‌دار همان روز در دفتر: چه کسی، کدام وضعیت، از کدام زنگ، چه ساعتی */
  S.batLog=S.batLog||{};const lg=S.batLog[k]=S.batLog[k]||[],n=new Date();
  lg.push({t:('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2),sid:sid,b:String(b),s:status,e:toEnd?1:0});
  if(lg.length>300)lg.splice(0,lg.length-300)}
 save();return true}
/* آیا دانش‌آموز هنگام آزمون خارج از مدرسه بوده؟ (غیبتِ کل روز اینجا حساب نمی‌شود؛ مسیر قدیمی خودش را دارد) */
function outAtExam(e,sid){try{
 if(!e||!e.date||dayAbs(e.date,sid))return false;
 const k=kit();if(!k)return false;const b=k.examBell(e);if(b==null)return false;
 return isOut(e.date,b,sid)}catch(x){return false}}
window.exOutAt=outAtExam;

/* ───── رابط کاربری: یک کارت داخل صفحه‌ی «دفتر روزانه‌ی معلم» (نه صفحه‌ی جدا) ─────
   تاریخ همان تاریخِ دفتر است و با «📅 تقویم شمسی» دفتر عوض می‌شود. */
function summaryOf(k,sid){let o=0;bellsOf(k).forEach(x=>{if(isOut(k,x.b,sid))o++});return o}
function bs(bg,fg){return`border:0;border-radius:10px;padding:7px 13px;background:${bg||'#eef2f7'};color:${fg||'#1e293b'};font:800 12.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer`}
function cardHtml(k){try{
 const K=kit();if(!K)return'';
 const B=bellsOf(k),stu=K.students();
 const bad=B.length?stu.filter(s=>!dayAbs(k,s.id)&&summaryOf(k,s.id)>0).length:0;
 const open=K.acc?K.acc('bat',false):false;
 let h=`<details class="card dj-acc dj-bat" id="djBat" data-acc="bat"${open?' open':''} style="border:1.5px solid #fcd9b6"><summary><span>🔔 حضور و غیاب زنگ‌به‌زنگ</span><em${bad?' class="warn"':''}>${B.length?(bad?FA(bad)+' نفر بیرون رفته':'همه سرکلاس'):'بدون زنگ'}</em></summary><div class="dj-acc-b">`;
 h+=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin:0 0 8px">${esc(K.dlab(k))} — اگر دانش‌آموزی با دلیل موجه در طول روز بیرون رفت، روی خانه‌ی او در همان زنگ بزنید (حضور اولِ روز دست‌نخورده می‌ماند). «خروج» هیچ فعالیت یا آزمونِ قبلی را حذف نمی‌کند؛ فعالیت/آزمونِ زنگ خروج برای او «انجام‌نشده به علت خروج» می‌شود، نه صفر و نه منفی. تاریخ را با «📅 تقویم شمسی» بالای صفحه عوض کنید.</div>`;
 if(!B.length)return h+`<div style="padding:12px;text-align:center;color:#64748b;background:#f8fafc;border-radius:10px">برای این روز هنوز زنگی ثبت نشده است. با «➕ ثبت فعالیت آموزشی جدید» (یا برنامه‌ی هفتگی) زنگ‌های روز ساخته می‌شود و اینجا می‌آید.</div></div></details>`;
 h+=`<div style="overflow:auto;border:1px solid #e2e8f0;border-radius:12px"><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="position:sticky;right:0;background:#f1f5f9;padding:8px;text-align:right;min-width:104px">دانش‌آموز</th>${B.map(x=>`<th style="background:#f1f5f9;padding:6px 4px;min-width:56px;font-size:11.5px;line-height:1.5">${esc(x.short)}</th>`).join('')}<th style="background:#f1f5f9;padding:6px;font-size:11.5px">بیرون</th></tr></thead><tbody>`;
 h+=stu.map(s=>{const da=dayAbs(k,s.id);
  const tds=B.map(x=>{if(da)return`<td style="padding:3px;text-align:center;background:#f8fafc;color:#94a3b8;font-size:11px" title="غایب در کل روز (از صفحه‌ی حضور و غیاب)">غ</td>`;
   const v=get(k,x.b,s.id),m=ST[v];
   return`<td style="padding:3px;text-align:center"><button type="button" data-bt="cell:${esc(x.b)}:${s.id}:${esc(k)}" title="${m.n}" style="width:100%;min-height:34px;border:1px solid ${v==='p'?'#e2e8f0':m.c};border-radius:8px;background:${v==='p'?'#fff':m.bg};color:${m.c};font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">${m.t}</button></td>`}).join('');
  const n=da?0:summaryOf(k,s.id);
  return`<tr><td style="position:sticky;right:0;background:var(--card,#fff);padding:5px 8px;font-weight:700;border-top:1px solid #f1f5f9">${esc(s.name)}${da?' <small style="color:#c0262c">(غایب کل روز)</small>':''}</td>${tds}<td style="text-align:center;border-top:1px solid #f1f5f9;font-weight:800;color:${n?'#b45309':'#94a3b8'}">${n?FA(n):'—'}</td></tr>`}).join('');
 h+=`</tbody></table></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12px">${['p','a','o','r'].map(q=>`<span style="padding:3px 9px;border-radius:8px;background:${ST[q].bg};color:${ST[q].c};font-weight:800">${ST[q].t} = ${ST[q].n}</span>`).join('')}</div>`;
 const lg=(S.batLog&&S.batLog[k])||[];
 if(lg.length){const nm=id=>((stu.find(q=>String(q.id)===String(id)))||{}).name||'؟';
  h+=`<div style="margin-top:10px;border-top:1px dashed #e2e8f0;padding-top:8px"><b style="font-size:13px">🕒 سابقه‌ی حضور و غیاب زنگ‌ها در این روز</b><div style="margin-top:4px;font-size:12.5px;line-height:2">${lg.map(r=>{const bl=B.find(x=>x.b===r.b);return`<div><span style="color:#64748b;font-variant-numeric:tabular-nums">${FA(r.t)}</span> · <b>${esc(nm(r.sid))}</b> · <span style="color:${(ST[r.s]||ST.p).c};font-weight:800">${(ST[r.s]||ST.p).n}</span> · از ${esc(bl?bl.short:'زنگ')}${r.e?' تا پایان روز':''}</div>`}).join('')}</div></div>`}
 const exs=(Array.isArray(S.exams)?S.exams:[]).filter(e=>e&&e.date===k);
 if(exs.length){
  h+=`<div style="margin-top:10px;border-top:1px dashed #e2e8f0;padding-top:8px"><b style="font-size:13px">📝 زنگ آزمون‌های این روز</b><div style="font-size:12px;color:#64748b;margin:3px 0 6px">برای تشخیص درستِ «خروج هنگام آزمون»، زنگ آزمون را مشخص کنید؛ اگر خودکار بماند، زنگِ همان درس در دفتر/برنامه حساب می‌شود.</div>`;
  h+=exs.map(e=>{const cur=e.bell!=null&&e.bell!==''?String(e.bell):'',auto=K.examBell(Object.assign({},e,{bell:''}));
   const cn=((S.courses||[]).find(c=>c.id===e.course)||{}).name||'';
   return`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0"><span style="font-weight:700;min-width:160px">${esc(cn)} — ${esc(e.title||e.type||'آزمون')}</span><select data-bt-ex="${e.id}" style="padding:6px;border:1px solid #cbd5e1;border-radius:9px;font:700 12.5px Vazirmatn,Tahoma,sans-serif"><option value=""${cur===''?' selected':''}>خودکار${auto!=null?' ('+esc((B.find(x=>x.b===auto)||{}).short||'')+')':' (نامشخص)'}</option>${B.map(x=>`<option value="${esc(x.b)}"${cur===x.b?' selected':''}>${esc(x.short)}</option>`).join('')}</select></div>`}).join('')+`</div>`}
 return h+'</div></details>'}catch(e){console.error('bell-attendance card',e);return''}}
function refresh(){try{kit().refresh()}catch(e){}}
function closePick(){const c=$('batPick');if(c)c.remove();document.removeEventListener('keydown',onKey,true)}
function onKey(e){if(e.key==='Escape'){e.stopPropagation();closePick()}}
function pick(b,sid,k){
 const K=kit(),s=K.students().find(q=>String(q.id)===String(sid)),bl=bellsOf(k).find(x=>x.b===String(b));if(!s||!bl)return;
 const cur=get(k,b,sid);closePick();
 const o=document.createElement('div');o.id='batPick';o.setAttribute('dir','rtl');
 o.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147482000;display:grid;place-items:center;padding:14px;font-family:Vazirmatn,Tahoma,sans-serif';
 o.innerHTML=`<div role="dialog" aria-modal="true" style="background:var(--card,#fff);color:var(--tx,#1e293b);border-radius:16px;max-width:400px;width:100%;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.35)">
  <b style="font-size:15px">${esc(s.name)}</b><div style="font-size:12px;color:#64748b;margin:2px 0 10px">${esc(bl.short)} · ${esc(K.dlab(k))}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${['p','a','o','r'].map(q=>`<button type="button" data-bp="${q}" style="min-height:44px;border-radius:11px;border:2px solid ${cur===q?ST[q].c:'transparent'};background:${ST[q].bg};color:${ST[q].c};font:800 13.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer">${ST[q].t} ${ST[q].n}</button>`).join('')}</div>
  <label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px;cursor:pointer"><input type="checkbox" id="batEnd" checked style="width:18px;height:18px"> اعمال برای زنگ‌های بعدیِ همین روز هم</label>
  <div style="font-size:11.5px;color:#64748b;margin-top:6px;line-height:1.8">«بازگشت» و «حاضر» فقط زنگ‌های بعدیِ خارج‌شده را به حاضر برمی‌گرداند. فعالیت‌ها و آزمون‌های قبلی هرگز پاک نمی‌شوند.</div>
  <button type="button" data-bp="x" style="margin-top:10px;width:100%;border:0;background:#eef2f7;border-radius:10px;padding:10px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">بستن</button></div>`;
 o.addEventListener('click',e=>{if(e.target===o){closePick();return}const t=e.target.closest('[data-bp]');if(!t)return;const v=t.dataset.bp;if(v==='x'){closePick();return}
  const toEnd=!!(o.querySelector('#batEnd')||{}).checked;closePick();
  if(v!==cur||toEnd)set(k,sid,b,v,toEnd);refresh()});
 document.body.appendChild(o);document.addEventListener('keydown',onKey,true)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#djBat [data-bt]');if(!t)return;const a=t.dataset.bt.split(':');
 if(a[0]==='cell')pick(a[1],a[2],a[3])});
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('#djBat [data-bt-ex]');if(!s)return;
 const x=(S.exams||[]).find(q=>String(q.id)===s.dataset.btEx);if(!x)return;if(s.value==='')delete x.bell;else x.bell=s.value;save();refresh()});

window.BellAtt={get,isOut,set,outAtExam,cardHtml,bellsOf,STATUS:ST};
}catch(err){console.error('bell-attendance',err)}})();

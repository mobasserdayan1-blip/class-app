/* پیگیری و مقایسه‌ی پیشرفت هر درس/زیرمجموعه (cl-v168)
   ─ یک کارت داخل «دفتر روزانه‌ی معلم» (بسته به‌صورت پیش‌فرض). فقط می‌خواند؛ هیچ داده‌ای نمی‌نویسد یا تغییر نمی‌دهد.
   ─ منبع: ارزشیابی‌های ۴سطحی و مثبت/منفی (S.dj.m). فعالیت‌های «انجام شد/نشد» و آزمون‌ها در میانگین نمی‌آیند.
   ─ درس = نام زنگ ویژه‌ی برنامه‌ی هفتگی (املا، انشا/نگارش) یا نام درس. می‌شود روی یک فعالیت مشخص هم محدود کرد.
   ─ بازه: این ماه (هفته‌به‌هفته) · ۲ ماه · ۳ ماه · کل سال تحصیلی (ماه‌به‌ماه). تاریخِ مبنا = تاریخِ دفتر.
   ─ پیشرفت = مقایسه‌ی میانگین اولین و آخرین بازه‌ی دارای ثبت هر دانش‌آموز (آستانه‌ی تغییر: نیم سطح).
   ─ برای حذف: فایل و تگ آن را بردارید؛ بقیه‌ی برنامه بدون آن کار می‌کند. */
(function(){try{
if(window.SubjTrack)return;
const $=id=>document.getElementById(id);
const kit=()=>window.djKit||null;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LAB={4:'خ خ',3:'خ',2:'ق ق',1:'ن ت'},LNM={4:'خیلی خوب',3:'خوب',2:'قابل قبول',1:'نیاز به تلاش بیشتر'};
const COL={4:'#1a8f55',3:'#3f8f2a',2:'#b26a00',1:'#c0262c'},BG={4:'#e3f4ea',3:'#eaf5df',2:'#fff1d6',1:'#fde7e8'};
const PER=[['m1','این ماه (هفته‌به‌هفته)'],['m2','۲ ماه اخیر'],['m3','۳ ماه اخیر'],['y','کل سال تحصیلی']];
const ui={sub:'',act:'',per:'m2'};
const lvl=v=>Math.max(1,Math.min(4,Math.round(v)));
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;

/* بازه‌ی تاریخی و بازه‌بندی (bucket) */
function range(K,k){const T=K.tk,p=T.jparts(k);if(!p)return null;
 const acad=m=>m>=7||m<=3;
 if(ui.per==='y'||ui.per==='m2'||ui.per==='m3'){
  let y=p.y,m=p.m;const ms=[];
  const n=ui.per==='m2'?2:ui.per==='m3'?3:99;
  const ay=p.m>=7?p.y:p.y-1;
  while(ms.length<n){ if(acad(m))ms.push({y,m}); 
   if(ui.per==='y'&&y===ay&&m===7)break;
   m--;if(m<1){m=12;y--} if(y<ay-1)break}
  ms.reverse();if(!ms.length)return null;
  return{from:T.jiso(ms[0].y,ms[0].m,1),to:k,mode:'month',months:ms}}
 const f=T.jiso(p.y,p.m,1);return{from:f,to:k,mode:'week'}}
function bucketOf(K,r,k){const T=K.tk;
 if(r.mode==='month'){const p=T.jparts(k);return p.y*100+p.m}
 return T.addD(k,-T.dow(k))}
function bucketList(K,r,evs){const T=K.tk;
 if(r.mode==='month')return r.months.map(x=>({id:x.y*100+x.m,label:T.JMN[x.m-1]}));
 const set=[...new Set(evs.map(e=>bucketOf(K,r,e.k)))].sort();
 return set.map((id,i)=>({id,label:'هفته '+(['اول','دوم','سوم','چهارم','پنجم','ششم'][i]||T.fa(i+1))}))}

/* ساخت داده‌ی جدول: به ازای هر دانش‌آموز، میانگین هر بازه */
function compute(K,k){
 const all=K.tk.events('0000-00-00','9999-99-99');
 const subs=[...new Set(all.filter(e=>e.k<=k).map(e=>e.sub))];
 if(!subs.length)return{subs,empty:true};
 if(!ui.sub||subs.indexOf(ui.sub)<0)ui.sub=subs.indexOf('املا')>=0?'املا':subs[0];
 const acts=[...new Set(all.filter(e=>e.sub===ui.sub).map(e=>e.act))];
 if(ui.act&&acts.indexOf(ui.act)<0)ui.act='';
 const r=range(K,k);if(!r)return{subs,acts,empty:true};
 const evs=K.tk.events(r.from,r.to).filter(e=>e.sub===ui.sub&&(!ui.act||e.act===ui.act));
 const bl=bucketList(K,r,evs);
 const stu=K.students(),rows=stu.map(s=>{
  const per={};bl.forEach(b=>per[b.id]=[]);
  evs.forEach(e=>{const v=e.mk[s.id];if(v==null||v<1||v>4)return;const b=bucketOf(K,r,e.k);if(per[b])per[b].push(v)});
  const av=bl.map(b=>avg(per[b.id])),cn=bl.map(b=>per[b.id].length);
  const have=av.map((v,i)=>v==null?-1:i).filter(i=>i>=0);
  let tr='na',d=0;
  if(have.length>=2){d=av[have[have.length-1]]-av[have[0]];tr=d>=0.5?'up':d<=-0.5?'down':'same'}
  return{s,av,cn,tr,d,tot:cn.reduce((a,b)=>a+b,0)}});
 const cls=bl.map((b,i)=>{const a=[];rows.forEach(x=>{if(x.av[i]!=null)a.push(x.av[i])});return avg(a)});
 const nev=bl.map(b=>new Set(evs.filter(e=>bucketOf(K,r,e.k)===b.id).map(e=>e.k+'|'+e.b)).size);
 return{subs,acts,bl,rows,cls,nev,r,nEv:evs.length}}

function cell(v,c){if(v==null)return'<td style="padding:4px;text-align:center;color:#cbd5e1">—</td>';
 const q=lvl(v);return`<td style="padding:3px;text-align:center" title="میانگین ${LNM[q]} — ${c} ثبت"><span style="display:block;border-radius:8px;padding:5px 2px;background:${BG[q]};color:${COL[q]};font-weight:800;font-size:12.5px">${LAB[q]}</span></td>`}
const TR={up:['▲ پیشرفت','#1a8f55','#e3f4ea'],same:['▬ ثابت','#475569','#eef2f7'],down:['▼ نیاز به توجه','#c0262c','#fde7e8'],na:['داده‌ی کافی نیست','#94a3b8','#f8fafc']};

function chart(K,D){const pts=D.cls.map((v,i)=>({v,i})).filter(x=>x.v!=null);if(pts.length<2)return'';
 const W=520,H=150,pl=34,pr=12,pt=14,pb=26,n=D.bl.length,x=i=>pl+(n<2?0:(W-pl-pr)*i/(n-1)),y=v=>pt+(H-pt-pb)*(4-v)/3;
 let g='';[1,2,3,4].forEach(q=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(q)}" y2="${y(q)}" stroke="#e2e8f0"/><text x="${pl-6}" y="${y(q)+4}" font-size="10" text-anchor="end" fill="#64748b">${LAB[q]}</text>`});
 const path=pts.map((p,j)=>(j?'L':'M')+x(p.i).toFixed(1)+' '+y(p.v).toFixed(1)).join(' ');
 const dots=pts.map(p=>`<circle cx="${x(p.i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4" fill="${COL[lvl(p.v)]}"/>`).join('');
 const lb=D.bl.map((b,i)=>`<text x="${x(i).toFixed(1)}" y="${H-8}" font-size="10" text-anchor="middle" fill="#475569">${esc(b.label)}</text>`).join('');
 return`<div style="margin:10px 0 4px"><b style="font-size:13px">📈 میانگین کلاس در هر بازه</b><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:560px;display:block;margin-top:4px" role="img" aria-label="نمودار میانگین کلاس">${g}<path d="${path}" fill="none" stroke="#2563eb" stroke-width="2.2"/>${dots}${lb}</svg></div>`}

function cardHtml(k){try{
 const K=kit();if(!K||!K.tk)return'';
 const D=compute(K,k),T=K.tk;
 const open=K.acc?K.acc('trk',false):false;
 const badge=D.empty?'هنوز ثبتی نیست':esc(ui.sub);
 let h=`<details class="card dj-acc" id="djTrk" data-acc="trk"${open?' open':''} style="border:1.5px solid #bfdbfe"><summary><span>📈 پیگیری و مقایسه‌ی پیشرفت هر درس</span><em>${badge}</em></summary><div class="dj-acc-b">`;
 if(D.empty)return h+'<div style="padding:12px;text-align:center;color:#64748b;background:#f8fafc;border-radius:10px">هنوز ارزشیابی ۴سطحی یا مثبت/منفی ثبت نشده است. با ثبت فعالیت‌ها، اینجا هر درس (مثل املا) ماه‌به‌ماه مقایسه می‌شود.</div></div></details>';
 const sel=(id,opts,cur,all)=>`<select data-tk="${id}" style="padding:7px;border:1px solid #cbd5e1;border-radius:9px;font:700 12.5px Vazirmatn,Tahoma,sans-serif;min-width:140px;max-width:100%">${all?`<option value=""${cur===''?' selected':''}>${all}</option>`:''}${opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return`<option value="${esc(v)}"${String(cur)===String(v)?' selected':''}>${esc(l)}</option>`}).join('')}</select>`;
 h+=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:8px">درس و بازه را انتخاب کنید تا عملکرد هر دانش‌آموز در همان درس (مثلاً همه‌ی املاهای یک ماه یا کل سال) کنار هم دیده شود. تاریخ مبنا: ${esc(K.dlab(k))}. فقط ارزشیابی‌های ۴سطحی و مثبت/منفی حساب می‌شوند.</div>`;
 h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${sel('sub',D.subs,ui.sub)}${sel('act',D.acts,ui.act,'همه‌ی فعالیت‌های این درس')}${sel('per',PER,ui.per)}</div>`;
 if(!D.rows||!D.nEv)return h+'<div style="padding:12px;text-align:center;color:#64748b;background:#f8fafc;border-radius:10px">در این بازه برای «'+esc(ui.sub)+'» ثبتی نیست. بازه‌ی بزرگ‌تری انتخاب کنید.</div></div></details>';
 const cnt={up:0,same:0,down:0,na:0};D.rows.forEach(x=>cnt[x.tr]++);
 h+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;font-size:12px">${['up','same','down','na'].map(q=>`<span style="padding:3px 9px;border-radius:8px;background:${TR[q][2]};color:${TR[q][1]};font-weight:800">${TR[q][0]}: ${T.fa(cnt[q])}</span>`).join('')}<span style="padding:3px 9px;border-radius:8px;background:#eef2f7;color:#475569;font-weight:700">${T.fa(D.nEv)} فعالیت ثبت‌شده</span></div>`;
 h+=`<div style="overflow:auto;border:1px solid #e2e8f0;border-radius:12px"><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr><th style="position:sticky;right:0;background:#f1f5f9;padding:8px;text-align:right;min-width:104px">دانش‌آموز</th>${D.bl.map(b=>`<th style="background:#f1f5f9;padding:6px 4px;min-width:58px;font-size:11.5px">${esc(b.label)}</th>`).join('')}<th style="background:#f1f5f9;padding:6px;font-size:11.5px;min-width:96px">روند</th></tr></thead><tbody>`;
 h+=D.rows.map(x=>{const t=TR[x.tr];
  return`<tr><td style="position:sticky;right:0;background:var(--card,#fff);padding:5px 8px;font-weight:700;border-top:1px solid #f1f5f9">${esc(x.s.name)}</td>${x.av.map((v,i)=>cell(v,T.fa(x.cn[i]))).join('')}<td style="text-align:center;border-top:1px solid #f1f5f9"><span style="display:inline-block;padding:3px 8px;border-radius:8px;background:${t[2]};color:${t[1]};font-weight:800;font-size:11.5px">${t[0]}</span></td></tr>`}).join('');
 h+=`<tr style="background:#f8fafc"><td style="position:sticky;right:0;background:#f8fafc;padding:6px 8px;font-weight:800;border-top:2px solid #e2e8f0">میانگین کلاس</td>${D.cls.map((v,i)=>cell(v,T.fa(D.nev[i])+' فعالیت')).join('')}<td style="border-top:2px solid #e2e8f0"></td></tr>`;
 h+=`</tbody></table></div>${chart(K,D)}<div style="font-size:11.5px;color:#64748b;line-height:1.9;margin-top:6px">«روند» = مقایسه‌ی اولین و آخرین بازه‌ای که برای آن دانش‌آموز ثبت دارد؛ تغییر کمتر از نیم سطح «ثابت» حساب می‌شود. خانه‌ی خالی (—) یعنی در آن بازه ثبتی نبوده (مثلاً غایب). با نگه‌داشتن اشاره‌گر روی هر خانه تعداد ثبت‌ها دیده می‌شود.</div></div></details>`;
 return h}catch(e){console.error('subject-tracking',e);return''}}
function refresh(){try{kit().refresh()}catch(e){}}
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('#djTrk [data-tk]');if(!s)return;
 const f=s.dataset.tk;ui[f]=s.value;if(f==='sub')ui.act='';
 refresh()});
window.SubjTrack={cardHtml,ui};
}catch(err){console.error('subject-tracking',err)}})();

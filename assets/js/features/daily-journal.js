/* 📓 دفتر روزانه معلم — ثبت سریع عملکرد دانش‌آموزان بر اساس زنگ‌های برنامه‌ی هفتگی
   - داده‌ها: S.dj  (tpl: فعالیت‌های هر درس | ses: «روز|زنگ» | m: نمره‌ها | n: یادداشت‌ها)
   - برنامه‌ی هفتگی (S.wsc)، حضور و غیاب (S.att) و درس‌ها (S.courses) فقط خوانده می‌شوند.
   - تکلیف‌های «انجام شد/نشد» به S.hwl هم می‌روند (شناسه‌ی dj:...) تا گزارش تکالیف همان را ببیند.
   - برای حذف کامل ویژگی: این فایل را از assets/js/boot/modules.js و sw.js بردارید (داده‌ها در S.dj می‌مانند و آسیبی نمی‌زنند). */
(function(){try{
if(window.__djLoaded)return;window.__djLoaded=1;
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ORD=['اول','دوم','سوم','چهارم','پنجم','ششم','هفتم','هشتم','نهم','دهم'];
const todayK=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)};
const addD=(k,n)=>{const d=new Date(k+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dow=k=>(new Date(k+'T12:00:00Z').getUTCDay()+1)%7;
const fmtP=(k,o)=>{try{const m={};new Intl.DateTimeFormat('fa-IR-u-ca-persian',Object.assign({timeZone:'UTC'},o)).formatToParts(new Date(k+'T12:00:00Z')).forEach(p=>{m[p.type]=p.value});return[m.weekday,m.day,m.month,m.year].filter(Boolean).join(' ')}catch(e){return k}};
const WDN=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const JMN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
/* تبدیل ISO ↔ شمسی: اول JDate (اعتبارسنج)، در نبود آن توابع قدیمی برنامه */
function jparts(k){try{if(window.JDate)return JDate.toJ(k)}catch(e){}const p=jp(new Date(k+'T12:00:00Z'));return{y:p.y,m:p.m,d:p.d}}
function jiso(y,m,d){try{if(window.JDate)return JDate.toIso(y,m,d)}catch(e){}try{const g=fromJ(y,m,d),p=jp(g);return(p.y===y&&p.m===m&&p.d===d)?g.toISOString().slice(0,10):null}catch(e){return null}}
function jlen(y,m){try{if(window.JDate)return JDate.monthLen(y,m)}catch(e){}return m<=6?31:m<=11?30:(jiso(y,12,30)?30:29)}
const dlab=k=>{try{const p=jparts(k);if(p&&p.y&&JMN[p.m-1])return WDN[dow(k)]+' '+fa(p.d)+' '+JMN[p.m-1]+' '+fa(p.y)}catch(e){}return fmtP(k,{weekday:'long',day:'numeric',month:'long',year:'numeric'})};
const nowM=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const tmin=s=>{const a=String(s||'0:0').split(':').map(Number);return(a[0]||0)*60+(a[1]||0)};
/* تعطیل هفتگی فقط طبق «روزهای کاری مدرسه» (S.wk)؛ تنظیم‌نشده = هیچ روزی تعطیل فرض نمی‌شود */
const wkApi=()=>window.schoolDays||null;
const wkOff=k=>{try{const w=wkApi();return !!w&&w.isSchoolDay(k)===false}catch(e){return false}};
const wkSet=()=>{try{const w=wkApi();return !!w&&w.configured()}catch(e){return false}};
const isOff=k=>{if(wkOff(k))return true;if(S.closed&&S.closed[k])return true;try{if(typeof window.dayType==='function'&&window.dayType(k).kind!=='work')return true}catch(e){}return false};
const D=()=>{S.dj=S.dj||{};const o=S.dj;o.tpl=o.tpl||{};o.ses=o.ses||{};o.m=o.m||{};o.n=o.n||{};return o};
const courses=()=>S.courses||[];
const courseBy=id=>courses().find(c=>c.id===id);
const cname=id=>{const c=courseBy(id);return c?c.name:'—'};
const sts=()=>S.students||[];
const absent=(k,sid)=>((S.att||{})[k]||{})[sid]==='a';
const late=(k,sid)=>((S.att||{})[k]||{})[sid]==='l';

/* سطح‌های ارزشیابی توصیفی */
const LV=[{v:4,s:'خیلی خوب',t:'خیلی خوب',c:'#1a8f55'},{v:3,s:'خوب',t:'خوب',c:'#3f8f2a'},{v:2,s:'قابل قبول',t:'قابل قبول',c:'#b26a00'},{v:1,s:'نیاز به تلاش بیشتر',t:'نیاز به تلاش بیشتر',c:'#c0262c'}];
/* فعالیت‌های پیش‌فرض هر درس (قابل ویرایش و جایگزینی توسط معلم)؛ نوع: g = چهار سطحی ، d = انجام شد/نشد ، سومین مقدار = تکلیف */
const DEF=[
['قرآن',[['روان‌خوانی قرآن','g'],['روخوانی آیات','g'],['صحیح‌خوانی و رعایت قواعد','g'],['حفظ سوره یا آیات','g'],['مشارکت در فعالیت قرآنی','g']]],
['ریاضی',[['حل تمرین کتاب','d',1],['حل مسئله','g'],['فعالیت روی تخته','g'],['انجام تمرین در دفتر','d',1],['درک مفاهیم','g'],['مشارکت در فعالیت گروهی','g']]],
['فارسی',[['روخوانی فارسی','g'],['روان‌خوانی','g'],['املا','g'],['جمله‌سازی','g'],['درک مطلب','g'],['نگارش','g'],['حفظ شعر','g']]],
['علوم',[['فعالیت عملی','g'],['آزمایش','g'],['پاسخ به پرسش‌ها','g'],['مشارکت در بحث','g'],['انجام فعالیت کتاب','d'],['درک مفاهیم درس','g']]],
['اجتماع',[['پرسش شفاهی','g'],['پاسخ به سؤالات کتاب','g'],['فعالیت گروهی','g'],['خلاصه‌نویسی','g'],['ارزشیابی از محتوای درس','g']]],
['هدیه',[['مشارکت در گفت‌وگو','g'],['حفظ آیه یا ذکر','g'],['انجام فعالیت کتاب','d'],['رعایت آداب','g']]],
['هنر',[['فعالیت عملی هنری','g'],['خلاقیت','g'],['تحویل کار','d']]],
['تربیت',[['مشارکت در فعالیت ورزشی','g'],['انجام حرکات','g'],['رعایت نظم و قوانین','g']]]];
const GEN=[['مشارکت در کلاس','g'],['پاسخ به پرسش','g'],['انجام فعالیت','d']];
function defOf(cid){const n=cname(cid);const f=DEF.find(x=>n.includes(x[0]));return(f?f[1]:GEN).map((r,i)=>({id:'i'+i,n:r[0],t:r[1],hw:r[2]?1:0}))}
const tplOf=cid=>{const t=D().tpl[cid];return Array.isArray(t)?t:defOf(cid)};
function ownTpl(cid){const d=D();if(!Array.isArray(d.tpl[cid]))d.tpl[cid]=defOf(cid);return d.tpl[cid]}

/* برنامه‌ی هفتگی: زنگ‌های درسیِ یک تاریخ (فقط خواندن) */
function bells(k){const w=S.wsc;if(!w||typeof w!=='object'||!w.cell||isOff(k))return[];const di=dow(k);if(di>4)return[];
 const n=Math.max(1,Math.min(10,w.n||(w.per||[]).length||4)),out=[];
 for(let i=0;i<n;i++){const v=w.cell[di+'_'+i];if(v==null||v==='')continue;
  const cids=[];(Array.isArray(v)?v:[v]).map(x=>x&&typeof x==='object'?x:{c:x}).forEach(x=>{
   if(x.c!=null){if(courseBy(x.c))cids.push(x.c)}
   else if(x.k!=null){const kd=(w.kinds||[]).find(q=>q.id===x.k);if(kd&&kd.cn){const c=courses().find(q=>q.name===kd.cn);if(c)cids.push(c.id)}}});
  if(cids.length)out.push({i:String(i),s:(w.per&&w.per[i]&&w.per[i].s)||'',cids:[...new Set(cids)]})}
 return out}
const sesKey=(k,b)=>k+'|'+b;
const getSes=(k,b)=>D().ses[sesKey(k,b)]||null;
function ensureSes(k,b){const d=D(),key=sesKey(k,b);if(!d.ses[key]){const bl=bells(k).find(x=>x.i===String(b));d.ses[key]={c:bl?bl.cids[0]:(courses()[0]||{}).id,tp:'',nt:''}}return d.ses[key]}
function dayBells(k){const L=bells(k).map(x=>({b:x.i,s:x.s,cids:x.cids,man:false}));const d=D();
 Object.keys(d.ses).forEach(key=>{if(key.indexOf(k+'|')!==0)return;const b=key.slice(k.length+1);if(!L.some(x=>x.b===b)){const s=d.ses[key];L.push({b,s:'',cids:[s.c],man:true})}});
 return L.sort((a,b)=>(a.man-b.man)||(+String(a.b).replace(/\D/g,'')||0)-(+String(b.b).replace(/\D/g,'')||0))}
const bellName=(k,x)=>{const s=getSes(k,x.b);const c=s?[s.c]:x.cids;const nm=c.map(cname).join(' + ');return(x.man?(String(x.b).charAt(0)==='m'?'زنگ دستی':'زنگ '+(ORD[+x.b]||'')):'زنگ '+ORD[+x.b])+' · '+nm}
/* فعالیت‌هایی که در این زنگ سابقه دارند اما بعداً از فهرست پیشنهادی حذف شده‌اند همچنان با نام و نوعِ ثبت‌شده (Snapshot) نمایش داده می‌شوند */
function itemsOf(s){if(!s)return[];const t=tplOf(s.c),ids=new Set(t.map(x=>x.id));const old=Object.keys(s.it||{}).filter(id=>!ids.has(id)&&s.it[id]).map(id=>({id,n:s.it[id].n,t:s.it[id].t==='d'?'d':'g',hw:s.it[id].hw?1:0,old:1}));return t.concat(old)}
const cnt=(k,b,id)=>Object.keys(D().m[k+'|'+b+'|'+id]||{}).filter(sid=>!absent(k,+sid)).length;
const presN=k=>sts().filter(s=>!absent(k,s.id)).length;
function stat(k,b){const s=getSes(k,b);if(s&&s.st==='skip')return'skip';const ids=Object.keys((s&&s.it)||{});if(!ids.length)return'none';const p=presN(k);return ids.every(id=>cnt(k,b,id)>=p)?'full':'part'}
const SI={full:'✅',part:'🟡',none:'⚪',skip:'➖'};

/* ثبت نمره‌ها */
function syncHw(k,b,id,s){const it=(s.it||{})[id];if(!it||!it.hw)return;S.hwl=S.hwl||[];const hid='dj:'+k+'|'+b+'|'+id,key=hid.slice(3),m=D().m[key]||{},st={};
 Object.keys(m).forEach(sid=>{st[sid]=m[sid]===1?'d':'n'});
 const i=S.hwl.findIndex(h=>h.id===hid);
 if(!Object.keys(st).length){if(i>=0)S.hwl.splice(i,1);return}
 if(i<0)S.hwl.push({id:hid,date:k,course:s.c,title:it.n,st,dj:1});else{S.hwl[i].st=st;S.hwl[i].title=it.n;S.hwl[i].course=s.c}}
/* ثبت در روز تعطیل (رسمی/اختصاصی/هفتگی/بسته) فقط با تأیید کاربر؛ تأیید برای همان روز تا خروج از صفحه یادآوری می‌شود. روزی که سابقه‌ی ثبت دارد دوباره نمی‌پرسد. */
const offOk=new Set();
function offGuard(k){if(!isOff(k)||offOk.has(k)||recDaysHas(k))return true;const hi=hinfo(k),t=(hi&&hi.label)||'تعطیل';if(!confirm('این روز تعطیل است ('+t+'). مطمئنید که می‌خواهید برای آن فعالیت ثبت کنید؟')){return false}offOk.add(k);return true}
function recDaysHas(k){const d=D();return Object.keys(d.m).some(x=>x.indexOf(k+'|')===0)}
function setMarks(k,b,id,sids,val,toggle){
 if(k>todayK()){flash('برای تاریخ آینده نمی‌شود ثبت کرد');return false}
 if(!offGuard(k))return false;
 const s=ensureSes(k,b),it=itemsOf(s).find(x=>x.id===id);if(!it)return false;
 s.it=s.it||{};if(!s.it[id])s.it[id]={n:it.n,t:it.t,hw:it.hw?1:0};
 const d=D(),key=k+'|'+b+'|'+id,m=d.m[key]=d.m[key]||{};
 sids.forEach(sid=>{if(toggle&&m[sid]===val)delete m[sid];else m[sid]=val});
 if(!Object.keys(m).length)delete d.m[key];
 if(s.st==='skip')delete s.st;
 syncHw(k,b,id,s);save();return true}

let st={k:todayK(),b:null,item:null,sel:false,pick:new Set(),note:null,tpl:false,keep:false,cal:null,reportPeriod:'week'};
const dshort=k=>{try{const p=jparts(k);if(p&&JMN[p.m-1])return WDN[dow(k)]+' '+fa(p.d)+' '+JMN[p.m-1]}catch(e){}return fmtP(k,{weekday:'short',day:'numeric',month:'long'})};
function viewSes(k,b){const s=getSes(k,b);if(s)return s;const bl=bells(k).find(x=>x.i===String(b));return bl?{c:bl.cids[0],tp:'',nt:''}:null}
function flash(msg){let t=$('djFl');if(t)t.remove();t=document.createElement('div');t.id='djFl';t.className='dj-fl';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{if(t.parentNode)t.remove()},2300)}

/* انتخاب زنگ پیش‌فرض */
function pickDefault(){const k=st.k,L=dayBells(k);if(!L.length){st.b=null;return}
 if(L.some(x=>x.b===st.b))return;
 let b=null;if(k===todayK()&&window.wscApi&&wscApi.now){try{const n=wscApi.now();if(n&&L.some(x=>x.b===String(n.i)))b=String(n.i)}catch(e){}}
 if(b==null){const f=L.find(x=>stat(k,x.b)!=='full'&&stat(k,x.b)!=='skip');b=(f||L[0]).b}
 st.b=b;st.item=null;st.note=null;st.pick=new Set()}

/* زنگ‌های ثبت‌نشده / ناقص در ۷ روز اخیر */
function pending(days){const out=[],t=todayK(),n=nowM();
 for(let i=0;i<(days||7);i++){const k=addD(t,-i);if(isOff(k))continue;
  bells(k).forEach(x=>{if(k===t&&x.s&&tmin(x.s)>n)return;const q=stat(k,x.i);if(q==='none'||q==='part')out.push({k,b:x.i,q,cids:x.cids})})}
 return out}

const CSS=`#dj .dj-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#dj .dj-day{font-weight:800;text-align:center;flex:1;min-width:150px}
#dj .dj-bl,#dj .dj-it{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
#dj .dj-ch{padding:9px 12px;border-radius:14px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--tx,#222);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;min-height:40px}
#dj .dj-ch.on{background:var(--p,#5b3fd6);color:#fff;border-color:var(--p,#5b3fd6)}
#dj .dj-ch small{opacity:.8;font-weight:600}
#dj .dj-row{display:flex;align-items:center;gap:8px;padding:7px 4px;border-bottom:1px solid var(--line,#eee);flex-wrap:wrap}
#dj .dj-row.ab{opacity:.45}
#dj .dj-row.stripe{background:#f1f3f6;border-radius:9px}
#dj .dj-row:not(.ab):hover{background:#e8edf4}
#dj .dj-nm{flex:1;min-width:110px;font-weight:700;font-size:14px}
#dj .dj-nm small{color:#888;font-weight:600;margin-right:4px}
#dj .dj-bt{display:flex;gap:4px}
#dj .dj-b{min-width:0;min-height:40px;padding:6px 9px;white-space:normal;line-height:1.45;border-radius:11px;border:1.5px solid var(--line,#ddd);background:var(--card,#fff);color:var(--tx,#222);font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#dj .dj-b[disabled]{cursor:default}
#dj .dj-b.on{color:#fff;border-color:transparent}
#dj .dj-nt{width:100%;display:flex;gap:6px}
#dj .dj-nt input,#dj input.dj-in,#dj select.dj-in,#dj textarea.dj-in{flex:1;padding:9px 10px;border-radius:10px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--tx,#222);font:600 13px Vazirmatn,Tahoma,sans-serif;box-sizing:border-box}
#dj .dj-sm{padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--tx,#222);font:700 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#dj .dj-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:#faf7ff;border-radius:12px;padding:8px;margin:8px 0}
#dj .dj-pg{height:8px;border-radius:6px;background:#e9e5f5;overflow:hidden;margin:6px 0}#dj .dj-pg i{display:block;height:100%;background:linear-gradient(90deg,#4a7ae0,#1a8f55)}
#dj .dj-warn{background:#fff4d6;color:#8a5a00;border-radius:12px;padding:9px 12px;margin:8px 0;font-size:13px}
#dj .dj-ted{border:1px dashed var(--line,#ccc);border-radius:12px;padding:8px;margin:8px 0}
#dj .dj-ted .r{display:flex;gap:6px;align-items:center;margin:5px 0;flex-wrap:wrap}
.dj-day{border:0;background:transparent;color:var(--p);font:800 15px Vazirmatn,Tahoma,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:4px;padding:6px}
.dj-cal{position:fixed;inset:0;z-index:10000;background:#16132988;display:grid;place-items:center;padding:16px}
.dj-calbox{width:min(360px,100%);background:var(--card);color:var(--tx);border-radius:20px;padding:14px;box-shadow:0 18px 60px #0004}
.dj-calhead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.dj-calhead button,.dj-calgrid button{border:0;border-radius:10px;padding:9px;background:var(--bg2);color:var(--tx);font:700 14px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.dj-calgrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;text-align:center}
.dj-calgrid span{font-size:12px;color:var(--mut);padding:5px}
.dj-calgrid span.wk{color:#c0262c}
.dj-calgrid i{min-height:36px}
.dj-calgrid button.on{background:var(--p);color:#fff}
.dj-calgrid button.td{box-shadow:inset 0 0 0 2px var(--p)}
.dj-calgrid button.wk{color:#c0262c}.dj-calgrid button.ho{color:#c0262c;background:#c0262c1f}
.dj-calgrid button.fu{opacity:.55}
.dj-calgrid button.of{color:#a8101a;font-weight:900;background:#c0262c3a;box-shadow:inset 0 -3px 0 #c0262c}
.dj-calgrid button.of::before{content:'★';position:absolute;top:1px;right:3px;font-size:9px;line-height:1;color:#c0262c}
.dj-calgrid button.cu{background:#d986001f;color:#8a5a00}
.dj-calgrid button.cu.em{box-shadow:inset 0 0 0 2px #c0262c;color:#a8101a}
#dj .dj-cu{background:#d986001f;color:#6b4300;border-radius:12px;padding:9px 12px;margin:8px 0;font-size:13px;border:1px solid #d9860066}
.dj-calgrid button.on.of,.dj-calgrid button.on.cu{color:#fff}
.dj-calgrid button.on.of::before{color:#fff}
.dj-hol{margin-top:10px;padding-top:8px;border-top:1px solid var(--line,#eee);font-size:12px;line-height:1.9;max-height:120px;overflow:auto;text-align:right}
.dj-hol b{color:#a8101a}.dj-hol .cov{color:#8a5a00}
#dj .dj-ho{background:#c0262c1a;color:#8a1219;border-radius:12px;padding:9px 12px;margin:8px 0;font-size:13px;border:1px solid #c0262c55}
.dj-calgrid button.on.wk,.dj-calgrid button.on.ho{color:#fff}
.dj-calgrid button{position:relative}
.dj-calgrid button.hd::after{content:'';position:absolute;bottom:4px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#1a8f55}
.dj-calgrid button.on.hd::after{background:#fff}
.dj-calsel{display:flex;gap:6px;flex:1;justify-content:center}
.dj-calsel select{border:0;border-radius:10px;padding:8px 6px;background:var(--bg2);color:var(--tx);font:800 14px Vazirmatn,Tahoma,sans-serif;max-width:46%}
.dj-calft{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px}
.dj-calft button{border:0;border-radius:10px;padding:9px 14px;background:var(--bg2);color:var(--tx);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.dj-calft button.p{background:var(--p);color:#fff}
.dj-calft small{font-size:11px;color:var(--mut)}
.dj-fl{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#222c;color:#fff;padding:10px 16px;border-radius:12px;z-index:99999;font:700 13px Vazirmatn,Tahoma,sans-serif}
#djHome .dj-hb{padding:8px 12px;border-radius:12px;border:0;background:var(--p,#5b3fd6);color:#fff;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;margin:3px}`;
const cs=document.createElement('style');cs.textContent=CSS;document.head.appendChild(cs);

/* ساخت صفحه و منو */
const sec=document.createElement('section');sec.id='dj';
const refSec=$('act')||$('wsc')||document.querySelector('main section:last-of-type');
if(refSec&&refSec.parentNode)refSec.parentNode.insertBefore(sec,refSec.nextSibling);else{(document.querySelector('main')||document.body).appendChild(sec)}
try{if(!pages.some(p=>p[0]==='dj')){const i=pages.findIndex(p=>p[0]==='wsc');pages.splice(i<0?pages.length:i+1,0,['dj','📓 دفتر روزانه معلم']);
 const b=document.createElement('button');b.textContent='📓 دفتر روزانه معلم';b.dataset.p='dj';b.onclick=()=>show('dj');
 const ref=nav.querySelector('[data-p="wsc"]')||nav.querySelector('[data-p="att"]');ref?ref.after(b):nav.appendChild(b)}}catch(e){console.warn('dj nav',e)}


/* تقویم شمسیِ انتخاب روز دفتر — هر روزِ گذشته/آینده قابل انتخاب است؛ خروجی همیشه ISO میلادی (مثل قبل) */
function recDays(){const o=new Set(),d=D();Object.keys(d.m||{}).forEach(x=>o.add(x.split('|')[0]));Object.keys(d.ses||{}).forEach(x=>o.add(x.split('|')[0]));return o}
function hinfo(k){try{if(typeof window.holidayInfo==='function')return window.holidayInfo(k)}catch(e){}return null}
function dayKind(k){/* فقط برای نمایش در تقویم — of: تعطیل رسمی کشور؛ cu: افزوده‌ی دستی/تعطیلی مدرسه؛ wk: تعطیل هفتگی */
 try{const h=hinfo(k);if(h){if(h.kind==='weekend')return{c:'wk',t:h.label||''};
  if(h.official)return{c:'ho of',t:h.label||'تعطیل رسمی',off:1};
  if(h.kind!=='work')return{c:'ho cu'+(h.emergency?' em':''),t:(h.label||'')+(h.emergency?' (اضطراری)':'')+(h.reason?' — علت: '+h.reason:''),off:2}}}catch(e){}
 if(wkOff(k))return{c:'wk',t:WDN[dow(k)]};
 if(S.closed&&S.closed[k])return{c:'ho cu',t:'تعطیلی مدرسه',off:2};
 return null}
/* مناسبت‌های رسمی/دستی یک ماه شمسی برای زیر تقویم */
function monthHol(y,m){const out=[],n=jlen(y,m);for(let d=1;d<=n;d++){const k=jiso(y,m,d);if(!k)continue;const h=hinfo(k);if(h&&h.kind!=='work'&&h.kind!=='weekend'&&h.label)out.push({d,k,t:h.label+(h.emergency?' 🚨 اضطراری':'')+(h.reason?' — علت: '+h.reason:''),o:h.official})}return out}
function calHtml(){
 if(!st.cal)return'';
 const {y,m}=st.cal,t=todayK(),tp=jparts(t),first=jiso(y,m,1);
 if(!first){st.cal=null;return''}
 const days=jlen(y,m),off=dow(first),rec=recDays();
 const y0=Math.min(tp.y-12,y),y1=Math.max(tp.y+1,y);
 let ys='';for(let i=y1;i>=y0;i--)ys+=`<option value="${i}"${i===y?' selected':''}>${fa(i)}</option>`;
 const ms=JMN.map((n,i)=>`<option value="${i+1}"${i+1===m?' selected':''}>${n}</option>`).join('');
 let h=`<div class="dj-cal" data-dj="calbg" role="dialog" aria-modal="true" aria-label="انتخاب تاریخ"><div class="dj-calbox"><div class="dj-calhead"><button type="button" data-dj="calprev" aria-label="ماه قبل">›</button><div class="dj-calsel"><select data-calm aria-label="ماه">${ms}</select><select data-caly aria-label="سال">${ys}</select></div><button type="button" data-dj="calnext" aria-label="ماه بعد">‹</button></div><div class="dj-calgrid">${WDN.map((x,i)=>`<span${wkSet()&&(wkApi().days()||[]).indexOf(i)<0?' class="wk"':''}>${x.slice(0,1)}</span>`).join('')}`;
 h+='<i></i>'.repeat(off);
 for(let d=1;d<=days;d++){const k=jiso(y,m,d);if(!k){h+='<i></i>';continue}
  const dk=dayKind(k),c=[k===st.k?'on':'',k===t?'td':'',dk?dk.c:'',k>t?'fu':'',rec.has(k)?'hd':''].filter(Boolean).join(' ');
  h+=`<button type="button" class="${c}" data-dj="calday:${k}" title="${esc(WDN[dow(k)]+(dk&&dk.t?(dk.off===1?' — تعطیل رسمی: ':' — ')+dk.t:'')+(rec.has(k)?' — دارای ثبت':''))}">${fa(d)}</button>`}
 {const mh=monthHol(y,m),hi=hinfo(first);h+=`</div><div class="dj-hol">${mh.length?mh.map(x=>`<div>${x.o?'<b>★</b>':'▪'} ${fa(x.d)} ${JMN[m-1]} — ${esc(x.t)}</div>`).join(''):'<div>مناسبت یا تعطیلی ثبت‌شده‌ای در این ماه نیست.</div>'}${hi&&hi.lunarUnknown?`<div class="cov">⚠️ مناسبت‌های قمری سال ${fa(y)} هنوز در برنامه ثبت نشده (نامعلوم، نه «تعطیل نیست»)؛ فقط تعطیلات ثابت شمسی دیده می‌شوند.</div>`:''}</div>`}
 return h+`<div class="dj-calft"><button type="button" class="p" data-dj="caltoday">امروز</button><small>● ثبت‌شده · ★ تعطیل رسمی · قرمز: تعطیل هفتگی · نارنجی: تعطیلی اختصاصی (قاب قرمز = اضطراری)${wkSet()?'':' · <button type="button" class="dj-sm" data-dj="setwk">تنظیم روزهای کاری</button>'}</small><button type="button" data-dj="calclose">بستن</button></div></div></div>`;
}

/* رندر */
function render(){const s=$('dj');if(!s)return;
 const k=st.k,t=todayK();pickDefault();
 const L=dayBells(k),ses=st.b!=null?viewSes(k,st.b):null,pend=pending(7);
 let h=`<h2>📓 دفتر روزانه معلم</h2><p class="sub">ثبت سریع عملکرد دانش‌آموزان در هر زنگ؛ همه‌ی اطلاعات به پرونده‌ی دانش‌آموز می‌رود.</p><div class="card dj-report-tools"><b>📄 گزارش رسمی عملکرد دانش‌آموزان</b><div class="dj-nt" style="margin-top:8px"><select class="dj-in" data-report-period aria-label="بازه گزارش"><option value="week"${st.reportPeriod==='week'?' selected':''}>گزارش هفتگی</option><option value="month"${st.reportPeriod==='month'?' selected':''}>گزارش ماهانه</option><option value="year"${st.reportPeriod==='year'?' selected':''}>گزارش سالانه</option></select><button type="button" class="dj-sm" data-dj="report">🖨️ تهیه خروجی PDF</button></div><small style="color:var(--mut,#888)">پس از انتخاب بازه، در پنجره چاپ گزینه «ذخیره به‌صورت PDF» را انتخاب کنید.</small></div>`;
 h+=`<div class="card"><div class="dj-hd"><button class="dj-sm" data-dj="nav:-1">‹ روز قبل</button><button type="button" class="dj-day" data-dj="calendar" aria-label="انتخاب تاریخ">${esc(dlab(k))}${k===t?' <small>(امروز)</small>':''}</button><button class="dj-sm" data-dj="nav:1">روز بعد ›</button>${k!==t?`<button class="dj-sm" data-dj="today">امروز</button>`:''}</div>`;
 if(!wkSet()&&dow(k)>4)h+=`<div class="dj-warn">روزهای کاری مدرسه هنوز تنظیم نشده و این روز تعطیل فرض نشده است. اگر مدرسه‌ی شما این روز تعطیل است، <button type="button" class="dj-sm" data-dj="setwk">⚙️ روزهای کاری را تنظیم کنید</button></div>`;
 if(isOff(k)){const hi=hinfo(k),nrec=L.length;if(hi&&hi.official)h+=`<div class="dj-ho" id="djHol">🎉 <b>تعطیل رسمی:</b> ${esc(hi.label)}<br><small>این روز «دفتر ثبت‌نشده» یا ناقص حساب نمی‌شود. ${nrec?`سوابق این روز: <b>${fa(nrec)}</b> زنگ ثبت‌شده در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ اگر کلاسی برگزار شده، با «＋ زنگ دستی» ثبت کنید.'}</small></div>`;else if(hi&&hi.custom)h+=`<div class="dj-cu" id="djCu">🏫 <b>تعطیلی اختصاصی مدرسه${hi.emergency?' (اضطراری 🚨)':''}:</b> ${esc(hi.label)}${hi.reason?`<br><small>علت: ${esc(hi.reason)}</small>`:''}<br><small>${nrec?`سوابق ثبت‌شده‌ی این روز: <b>${fa(nrec)}</b> زنگ در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ ثبت فعالیت در روز تعطیل نیاز به تأیید شما دارد.'}</small></div>`;else h+=`<div class="dj-warn">این روز تعطیل است${hi&&hi.label?' ('+esc(hi.label)+')':''}. ${nrec?`سوابق ثبت‌شده‌ی این روز: ${fa(nrec)} زنگ.`:'اگر زنگی برگزار شده، با «＋ زنگ دستی» ثبت کنید.'}</div>`}
 else if(!L.length)h+=`<div class="dj-warn">برای این روز در برنامه‌ی هفتگی زنگ درسی چیده نشده است. در بخش «برنامه هفتگی» درس‌ها را بچینید یا از «＋ زنگ دستی» استفاده کنید.</div>`;
 h+=`<div class="dj-bl">${L.map(x=>`<button class="dj-ch${x.b===st.b?' on':''}" data-dj="bell:${esc(x.b)}">${SI[stat(k,x.b)]} ${esc(bellName(k,x))}${x.s?` <small>${fa(x.s)}</small>`:''}</button>`).join('')}<button class="dj-ch" data-dj="manual">＋ زنگ دستی</button></div></div>`;
 h+=calHtml();
 if(ses)h+=sessionCard(k,st.b,ses);
 h+=pendCard(pend);
 s.innerHTML=h}

function sessionCard(k,b,s){
 const items=itemsOf(s),pn=presN(k),sk=s.st==='skip';
 let h=`<div class="card"><div class="dj-hd"><b>${esc(cname(s.c))}</b><span style="font-size:12px;color:#888">${fa(pn)} حاضر از ${fa(sts().length)}</span></div>
 <div class="dj-nt" style="margin-top:8px"><select class="dj-in" data-f="course">${courses().map(c=>`<option value="${c.id}"${c.id===s.c?' selected':''}>${esc(c.name)}</option>`).join('')}</select><input class="dj-in" data-f="topic" placeholder="درس و مبحث تدریس‌شده (اختیاری)" value="${esc(s.tp||'')}"></div>
 <div class="dj-nt" style="margin-top:6px"><input class="dj-in" data-f="snote" placeholder="یادداشت کلی این زنگ (اختیاری)" value="${esc(s.nt||'')}"></div>
 <div style="margin-top:8px"><button class="dj-sm" data-dj="skip">${sk?'↩️ برگرداندن به حالت ثبت':'➖ این زنگ ثبت نمی‌شود'}</button></div></div>`;
 if(sk)return h+`<div class="dj-warn">این زنگ «بدون ثبت» علامت خورده و در فهرست ثبت‌نشده‌ها نمی‌آید.</div>`;
 h+=`<div class="card"><b>فعالیت‌های این درس</b><div class="dj-it">${items.map(it=>{const c=cnt(k,b,it.id);return`<button class="dj-ch${it.id===st.item?' on':''}" data-dj="item:${esc(it.id)}">${esc(it.n)}${it.old?' <small>(حذف‌شده از فهرست)</small>':''}${c?` <small>${fa(c)}/${fa(pn)}</small>`:''}</button>`}).join('')}<button class="dj-sm" data-dj="tpl">⚙️ ویرایش فعالیت‌ها</button></div>`;
 if(st.tpl)h+=tplEditor(s.c);
 const it=items.find(x=>x.id===st.item);
 if(!it){h+=`<p class="sub">یک فعالیت را انتخاب کنید تا فهرست دانش‌آموزان نمایش داده شود.</p></div>`;return h}
 h+=studentList(k,b,it,pn)+`</div>`;return h}

function btns(it,cur,sid,dis){
 if(it.t==='d')return[[1,'✓ انجام شد','#1a8f55'],[0,'✗ نشد','#c0262c']].map(x=>`<button class="dj-b${cur===x[0]?' on':''}" ${dis?'disabled':''} style="${cur===x[0]?'background:'+x[2]:''}" data-dj="mk:${sid}:${x[0]}">${x[1]}</button>`).join('');
 return LV.map(l=>`<button class="dj-b${cur===l.v?' on':''}" ${dis?'disabled':''} title="${l.t}" style="${cur===l.v?'background:'+l.c:''}" data-dj="mk:${sid}:${l.v}">${l.s}</button>`).join('')}

function studentList(k,b,it,pn){
 const d=D(),key=k+'|'+b+'|'+it.id,m=d.m[key]||{},done=Object.keys(m).filter(sid=>!absent(k,+sid)).length;
 let h=`<div class="dj-pg"><i style="width:${pn?Math.round(done/pn*100):0}%"></i></div><div style="font-size:12px;color:#888">${fa(done)} از ${fa(pn)} دانش‌آموز حاضر ثبت شد</div>`;
 h+=`<div class="dj-bar"><span style="font-size:12px;font-weight:700">${st.sel?'برای انتخاب‌شده‌ها:':'برای همه‌ی ثبت‌نشده‌ها:'}</span>${it.t==='d'?`<button class="dj-b" data-dj="bulk:1">✓ انجام شد</button><button class="dj-b" data-dj="bulk:0">✗ نشد</button>`:LV.map(l=>`<button class="dj-b" style="color:${l.c}" data-dj="bulk:${l.v}" title="${l.t}">${l.s}</button>`).join('')}
 <button class="dj-sm" data-dj="selmode">${st.sel?'پایان انتخاب':'☑️ انتخاب چند نفر'}</button>${st.sel?`<button class="dj-sm" data-dj="pickall">همه‌ی ثبت‌نشده‌ها</button>`:''}</div>`;
 h+=sts().map((s,index)=>{const ab=absent(k,s.id),v=m[s.id],nk=key+'|'+s.id,nt=d.n[nk],fn=((S.info||{})[s.id]||{}).fn||'';
  return`<div class="dj-row${ab?' ab':''}${index%2===1?' stripe':''}">${st.sel&&!ab?`<input type="checkbox" data-dj="pick:${s.id}"${st.pick.has(s.id)?' checked':''} style="width:20px;height:20px">`:''}
  <div class="dj-nm"${v!=null?` style="color:${it.t==='d'?(v===1?'#1a8f55':'#c0262c'):(LV.find(l=>l.v===v)||{}).c||'inherit'}"`:''}>${esc(s.name)}${fn?`<small>${esc(fn)}</small>`:''}${ab?' <small>غایب</small>':late(k,s.id)?' <small>⏰ تأخیر</small>':''}</div>
  <div class="dj-bt">${btns(it,v,s.id,ab)}</div><button class="dj-sm" data-dj="note:${s.id}" ${ab?'disabled':''}>${nt?'📝•':'📝'}</button>
  ${st.note===s.id?`<div class="dj-nt"><input data-nt="${s.id}" placeholder="یادداشت کوتاه (مثلاً نیاورده)" value="${esc(nt||'')}"></div>`:''}</div>`}).join('');
 return h}

function tplEditor(cid){const t=tplOf(cid);
 return`<div class="dj-ted"><b style="font-size:13px">فعالیت‌های «${esc(cname(cid))}»</b><div style="font-size:11px;color:#888">تغییر نام یا حذف روی ثبت‌های قبلی اثری ندارد.</div>
 ${t.map(x=>`<div class="r"><input class="dj-in" data-tn="${esc(x.id)}" value="${esc(x.n)}"><select class="dj-in" style="max-width:130px" data-tt="${esc(x.id)}"><option value="g"${x.t==='g'?' selected':''}>۴ سطحی</option><option value="d"${x.t==='d'?' selected':''}>انجام شد/نشد</option></select>
  ${x.t==='d'?`<label style="font-size:12px"><input type="checkbox" data-th="${esc(x.id)}"${x.hw?' checked':''}> تکلیف</label>`:''}<button class="dj-sm" data-dj="tpldel:${esc(x.id)}">🗑️</button></div>`).join('')}
 <div class="r"><input class="dj-in" id="djNewN" placeholder="فعالیت جدید…"><select class="dj-in" style="max-width:130px" id="djNewT"><option value="g">۴ سطحی</option><option value="d">انجام شد/نشد</option></select><button class="dj-sm" data-dj="tpladd">＋ افزودن</button></div></div>`}

function pendCard(p){
 if(!p.length)return`<div class="card"><b>✅ زنگ ثبت‌نشده‌ای در ۷ روز اخیر نیست</b></div>`;
 return`<div class="card"><b>⏳ زنگ‌های ثبت‌نشده یا ناقص (۷ روز اخیر): ${fa(p.length)}</b><div class="dj-bl">${p.map(x=>`<button class="dj-ch" data-dj="go:${x.k}:${esc(x.b)}">${SI[x.q]} ${esc(dshort(x.k))} · ${esc(x.cids.map(cname).join('+'))}</button>`).join('')}</div>
 <button class="dj-sm" data-dj="skipall">➖ همه‌ی این‌ها را «بدون ثبت» علامت بزن</button></div>`}

/* گزارش رسمی دفتر روزانه؛ داده‌ها از Snapshot ثبت‌شده خوانده می‌شوند */
function printDailyReport(period){
 const today=todayK(),anchor=st.k||today,jp0=jparts(anchor);let from,to,title;
 if(period==='year'){from=jiso(jp0.y,1,1);to=jiso(jp0.y,12,jlen(jp0.y,12));title='گزارش سالانه'}
 else if(period==='month'){from=jiso(jp0.y,jp0.m,1);to=jiso(jp0.y,jp0.m,jlen(jp0.y,jp0.m));title='گزارش ماهانه'}
 else {const start=addD(anchor,-dow(anchor));from=start;to=addD(start,6);title='گزارش هفتگی'}
 if(!from||!to){flash('تعیین بازه‌ی گزارش ممکن نشد');return}
 const stats=new Map(sts().map(x=>[String(x.id),{student:x,levels:{4:0,3:0,2:0,1:0},done:0,notDone:0,total:0,activities:{}}]));
 const d=D();Object.keys(d.m).sort().forEach(key=>{const p=key.split('|'),date=p[0];if(date<from||date>to)return;const ses=d.ses[date+'|'+p[1]],it=ses&&(ses.it||{})[p[2]],marks=d.m[key];if(!it)return;
  Object.keys(marks||{}).forEach(sid=>{const r=stats.get(String(sid));if(!r)return;const v=marks[sid];r.total++;if(it.t==='d'){if(v===1)r.done++;else r.notDone++}else if(r.levels[v]!=null)r.levels[v]++;const label=(ses.c!=null?cname(ses.c):'')+' — '+it.n;r.activities[label]=(r.activities[label]||0)+1})
 });
 const rows=[...stats.values()].sort((a,b)=>String(a.student.name).localeCompare(String(b.student.name),'fa'));
 const total=rows.reduce((a,r)=>a+r.total,0),levelTotals=[4,3,2,1].map(v=>rows.reduce((a,r)=>a+r.levels[v],0));
 const dateLabel=k=>{try{return dshort(k)}catch(e){return k}};
 const escHtml=esc;
 const win=window.open('','_blank');if(!win){flash('پنجره‌ی گزارش مسدود شد؛ اجازه‌ی بازشدن پنجره را فعال کنید');return}
 const tr=rows.map((r,i)=>`<tr><td>${fa(i+1)}</td><td class="name">${escHtml(r.student.name)}</td><td>${fa(r.levels[4])}</td><td>${fa(r.levels[3])}</td><td>${fa(r.levels[2])}</td><td>${fa(r.levels[1])}</td><td>${fa(r.done)}</td><td>${fa(r.notDone)}</td><td>${fa(r.total)}</td></tr>`).join('');
 const activityRows=Object.entries(rows.reduce((a,r)=>{Object.entries(r.activities).forEach(([k,v])=>a[k]=(a[k]||0)+v);return a},{})).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<tr><td>${escHtml(n)}</td><td>${fa(v)}</td></tr>`).join('');
 win.document.open();win.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${title} دفتر روزانه</title><style>
 @page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;color:#202a36;font-size:11px;line-height:1.9;margin:0}h1{font-size:20px;margin:0 0 4px;color:#17365d}h2{font-size:14px;margin:18px 0 6px;color:#17365d}.head{border-bottom:3px double #486581;padding-bottom:10px;margin-bottom:12px}.meta{display:flex;justify-content:space-between;color:#526477}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:12px 0}.box{border:1px solid #cbd5df;border-radius:6px;padding:7px;text-align:center;background:#f6f8fa}.box b{display:block;font-size:17px;color:#17365d}table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #cbd5df;padding:5px 6px;text-align:center}th{background:#e9eef4;color:#17365d;font-weight:bold}tbody tr:nth-child(even){background:#f5f7f9}td.name{text-align:right;font-weight:bold}.legend{font-size:10px;color:#526477;margin:8px 0}.sign{display:flex;justify-content:space-around;margin-top:34px}.sign span{border-top:1px solid #7b8794;padding:6px 25px 0}.foot{margin-top:15px;border-top:1px solid #ccd4dd;padding-top:6px;color:#687789;font-size:9px}@media print{.noprint{display:none}}
 </style></head><body><header class="head"><h1>گزارش رسمی عملکرد آموزشی و فعالیت‌های کلاسی</h1><div><b>${title}</b> · دفتر روزانه معلم</div><div class="meta"><span>بازه: ${dateLabel(from)} تا ${dateLabel(to)}</span><span>تاریخ تهیه: ${dateLabel(today)}</span></div></header>
 <div class="summary"><div class="box"><b>${fa(rows.length)}</b>تعداد دانش‌آموزان</div><div class="box"><b>${fa(total)}</b>ثبت عملکرد</div><div class="box"><b>${fa(levelTotals[0]+levelTotals[1])}</b>خوب و خیلی خوب</div><div class="box"><b>${fa(levelTotals[3])}</b>نیازمند تلاش بیشتر</div></div>
 <h2>۱. خلاصه عملکرد هر دانش‌آموز</h2><div class="legend">سطوح ارزشیابی توصیفی بر اساس ثبت‌های انجام‌شده در بازه‌ی انتخابی؛ «انجام شد/نشد» جداگانه محاسبه شده است.</div>
 <table><thead><tr><th>ردیف</th><th>نام دانش‌آموز</th><th>خیلی خوب</th><th>خوب</th><th>قابل قبول</th><th>نیاز به تلاش</th><th>انجام شد</th><th>انجام نشد</th><th>مجموع</th></tr></thead><tbody>${tr||'<tr><td colspan="9">در این بازه سابقه‌ای ثبت نشده است.</td></tr>'}</tbody></table>
 <h2>۲. فراوانی فعالیت‌ها و درس‌ها</h2><table><thead><tr><th>درس و فعالیت</th><th>تعداد ثبت</th></tr></thead><tbody>${activityRows||'<tr><td colspan="2">بدون داده</td></tr>'}</tbody></table>
 <div class="sign"><span>نام و امضای آموزگار</span><span>مهر و تأیید مدیریت</span></div><div class="foot">این گزارش به‌صورت خودکار از سوابق ثبت‌شده در دفتر روزانه تهیه شده است. داده‌های ثبت‌نشده در محاسبات لحاظ نشده‌اند.</div><div class="noprint" style="text-align:center;margin:18px"><button onclick="window.print()">چاپ / ذخیره به‌صورت PDF</button></div></body></html>`);
 win.document.close();setTimeout(()=>{try{win.focus();win.print()}catch(e){}},700);
}

/* رویدادها */
function act(a){const [c,x,y]=a.split(':'),k=st.k;
 if(c==='calendar'){const p=jparts(k);st.cal={y:p.y,m:p.m}}
 else if(c==='setwk'){st.cal=null;try{show('set')}catch(e){}return}
 else if(c==='calclose'||c==='calbg')st.cal=null;
 else if(c==='caltoday'){st.k=todayK();st.cal=null;st.b=null;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='calprev'||c==='calnext'){if(st.cal){let m=st.cal.m+(c==='calnext'?1:-1),y=st.cal.y;if(m<1){m=12;y--}if(m>12){m=1;y++}st.cal={y,m}}}
 else if(c==='calday'){st.k=x;st.b=null;st.item=null;st.note=null;st.pick=new Set();st.cal=null}
 else if(c==='nav'){st.cal=null;st.k=addD(k,+x);st.b=null;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='today'){st.k=todayK();st.b=null;st.item=null}
 else if(c==='bell'){st.b=x;st.item=null;st.note=null;st.pick=new Set();st.tpl=false}
 else if(c==='go'){st.k=x;st.b=y;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='item'){st.item=x;st.note=null;st.pick=new Set()}
 else if(c==='manual'){const d=D();let n=1;while(d.ses[sesKey(k,'m'+n)])n++;const b='m'+n;d.ses[sesKey(k,b)]={c:(courses()[0]||{}).id,tp:'',nt:''};save();st.b=b;st.item=null}
 else if(c==='skip'){const s=ensureSes(k,st.b);if(s.st==='skip')delete s.st;else s.st='skip';save()}
 else if(c==='skipall'){pending(7).forEach(p=>{const s=ensureSes(p.k,p.b);s.st='skip'});save()}
 else if(c==='tpl')st.tpl=!st.tpl;
 else if(c==='selmode'){st.sel=!st.sel;st.pick=new Set()}
 else if(c==='pickall'){const it=st.item,m=D().m[k+'|'+st.b+'|'+it]||{};st.pick=new Set(sts().filter(s=>!absent(k,s.id)&&m[s.id]==null).map(s=>s.id))}
 else if(c==='note')st.note=st.note===+x?null:+x;
 else if(c==='mk'){setMarks(k,st.b,st.item,[+x],+y,true)}
 else if(c==='bulk'){const m=D().m[k+'|'+st.b+'|'+st.item]||{};
  const ids=st.sel?[...st.pick]:sts().filter(s=>!absent(k,s.id)&&m[s.id]==null).map(s=>s.id);
  if(!ids.length){flash(st.sel?'ابتدا دانش‌آموزان را انتخاب کنید':'همه‌ی دانش‌آموزان حاضر قبلاً ثبت شده‌اند')}else if(setMarks(k,st.b,st.item,ids,+x,false)){flash(fa(ids.length)+' نفر ثبت شد ✅');st.pick=new Set()}}
 else if(c==='tpladd'){const n=($('djNewN').value||'').trim();if(!n){flash('نام فعالیت را بنویسید');return}const s=ensureSes(k,st.b),t=ownTpl(s.c);t.push({id:'u'+Date.now(),n,t:$('djNewT').value==='d'?'d':'g',hw:0});save()}
 else if(c==='tpldel'){const s=ensureSes(k,st.b),t=ownTpl(s.c),i=t.findIndex(q=>q.id===x);if(i>=0){t.splice(i,1);if(st.item===x)st.item=null;save()}}
 render()}
sec.addEventListener('click',e=>{const t=e.target.closest('[data-dj]');if(!t||t.disabled)return;if(t.dataset.dj==='calbg'&&e.target!==t)return;if(t.type==='checkbox'){const id=+t.dataset.dj.split(':')[1];st.pick.has(id)?st.pick.delete(id):st.pick.add(id);return}
 try{act(t.dataset.dj)}catch(er){console.error('dj',er)}});
sec.addEventListener('change',e=>{const t=e.target,k=st.k;try{
 if(t.hasAttribute('data-report-period')){st.reportPeriod=t.value;return}
 if(t.dataset.calm!==undefined||t.dataset.caly!==undefined){if(st.cal){const m=t.dataset.calm!==undefined?+t.value:st.cal.m,y=t.dataset.caly!==undefined?+t.value:st.cal.y;if(jiso(y,m,1))st.cal={y,m};render()}return}
 if(t.dataset.f){if(!offGuard(k)){render();return}const s=ensureSes(k,st.b);
  if(t.dataset.f==='course'){s.c=+t.value;st.item=null;save();render()}
  else if(t.dataset.f==='topic'){s.tp=t.value.trim();save()}
  else if(t.dataset.f==='snote'){s.nt=t.value.trim();save()}}
 else if(t.dataset.nt){if(!offGuard(k)){render();return}const sid=+t.dataset.nt,d=D(),key=k+'|'+st.b+'|'+st.item+'|'+sid,v=t.value.trim();if(v)d.n[key]=v;else delete d.n[key];save();render()}
 else if(t.dataset.tn||t.dataset.tt||t.dataset.th){const s=ensureSes(k,st.b),tp=ownTpl(s.c),id=t.dataset.tn||t.dataset.tt||t.dataset.th,q=tp.find(z=>z.id===id);if(!q)return;
  if(t.dataset.tn){const v=t.value.trim();if(v)q.n=v}else if(t.dataset.tt){q.t=t.value==='d'?'d':'g';if(q.t!=='d')q.hw=0}else q.hw=t.checked?1:0;save();render()}}catch(er){console.error('dj',er)}});

/* خلاصه‌ی دفتر برای هر دانش‌آموز (برای پرونده‌ی دانش‌آموز و گزارش‌ها) */
function summary(sid,from,to){const d=D(),R={};
 Object.keys(d.m).forEach(key=>{const v=d.m[key][sid];if(v==null)return;const p=key.split('|'),k=p[0];if(from&&k<from)return;if(to&&k>to)return;
  const s=d.ses[k+'|'+p[1]];if(!s||!(s.it||{})[p[2]])return;const it=s.it[p[2]],r=R[s.c]=R[s.c]||{c:s.c,g:{1:0,2:0,3:0,4:0},ok:0,no:0,n:0,last:[]};
  if(it.t==='d'){v===1?r.ok++:r.no++}else if(r.g[v]!=null)r.g[v]++;r.n++;
  const nt=d.n[key+'|'+sid];if(nt)r.last.push({k,a:it.n,t:nt})});
 Object.values(R).forEach(r=>r.last.sort((a,b)=>b.k.localeCompare(a.k)));return Object.values(R)}
window.djApi={summary,pending,open:(k,b)=>{st.keep=true;if(k)st.k=k;st.b=b!=null?String(b):null;st.item=null;st.note=null;st.pick=new Set();show('dj')}};

function sfCard(){const sb=$('sfb');if(!sb||!window.__sfid||$('djSf'))return;const R=summary(window.__sfid);if(!R.length)return;
 const row=r=>`<tr><td style="padding:4px 6px;font-weight:700">${esc(cname(r.c))}</td>${[4,3,2,1].map(v=>`<td style="text-align:center;color:${LV.find(l=>l.v===v).c};font-weight:800">${fa(r.g[v])}</td>`).join('')}<td style="text-align:center">${r.ok||r.no?fa(r.ok)+' / '+fa(r.no):'—'}</td></tr>`;
 const notes=R.flatMap(r=>r.last.map(n=>({...n,c:r.c}))).sort((a,b)=>b.k.localeCompare(a.k)).slice(0,5);
 sb.insertAdjacentHTML('beforeend',`<div class="card" id="djSf" style="grid-column:1/-1"><b>📓 دفتر روزانه (عملکرد در زنگ‌ها)</b>
 <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px"><tr style="color:#888;font-size:12px"><td>درس</td><td style="text-align:center">خیلی خوب</td><td style="text-align:center">خوب</td><td style="text-align:center">قابل قبول</td><td style="text-align:center">نیاز به تلاش بیشتر</td><td style="text-align:center">انجام/نشد</td></tr>${R.map(row).join('')}</table></div>
 ${notes.length?`<div style="margin-top:8px;font-size:12px"><b>یادداشت‌های اخیر:</b>${notes.map(n=>`<div>• ${esc(dshort(n.k))} · ${esc(cname(n.c))} · ${esc(n.a)}: ${esc(n.t)}</div>`).join('')}</div>`:''}</div>`)}
try{const sfb=$('sfb');if(sfb)new MutationObserver(()=>{if(!$('djSf'))setTimeout(()=>{try{sfCard()}catch(e){}},30)}).observe(sfb,{childList:true})}catch(e){}

/* کارت صفحه‌ی اصلی */
function homeCard(){const sm=$('smart');if(!sm)return;const old=$('djHome');if(old)old.remove();
 const p=pending(3),t=todayK();let cur=null;try{const n=window.wscApi&&wscApi.now&&wscApi.now();if(n&&n.i!=null)cur={i:n.i,name:n.name}}catch(e){}
 if(!p.length&&!cur)return;
 sm.insertAdjacentHTML('beforebegin',`<div class="card" id="djHome"><b>📓 دفتر روزانه</b><div style="font-size:13px;margin-top:6px">${cur?`زنگ جاری: <b>${esc(cur.name)}</b> `:''}${p.length?`· ${fa(p.length)} زنگ ثبت‌نشده در ۳ روز اخیر`:'· همه‌چیز ثبت شده'}</div>
 ${cur?`<button class="dj-hb" data-djh="${t}:${cur.i}">ثبت همین زنگ</button>`:''}<button class="dj-hb" data-djh="open">باز کردن دفتر</button></div>`)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-djh]');if(!t)return;const v=t.dataset.djh;if(v==='open'){const f=pending(3)[0];djApi.open(f?f.k:todayK(),f?f.b:null)}else{const a=v.split(':');djApi.open(a[0],a[1])}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&st.cal){st.cal=null;render()}});
const _show=window.show;window.show=function(id){const r=_show.apply(this,arguments);try{if(id==='dj'){if(!st.keep){st.k=todayK();st.b=null;st.item=null;st.note=null;st.pick=new Set();st.tpl=false}st.keep=false;render()}else if(id==='home')homeCard()}catch(e){console.warn('dj',e)}return r};
try{const h=$('home');if(h&&h.classList.contains('on'))homeCard()}catch(e){}
}catch(e){console.error('daily-journal',e)}})();

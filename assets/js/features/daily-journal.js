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
const dstat=k=>{try{return typeof window.dayStatus==='function'?window.dayStatus(k):null}catch(e){return null}};
const isOff=k=>{{const ds=dstat(k);if(ds)return ds.off===true}if(wkOff(k))return true;if(S.closed&&S.closed[k])return true;try{if(typeof window.dayType==='function'&&window.dayType(k).kind!=='work')return true}catch(e){}return false};
const D=()=>{S.dj=S.dj||{};const o=S.dj;o.tpl=o.tpl||{};o.ses=o.ses||{};o.m=o.m||{};o.n=o.n||{};return o};
const courses=()=>S.courses||[];
const SPECIAL_COURSES=[
  {id:'sp_emla',name:'املا'},
  {id:'sp_ensha',name:'انشا و نگارش'}
];
function allCourses(){
  const list=[...courses()];
  SPECIAL_COURSES.forEach(sc=>{
    if(!list.some(c=>String(c.id)===String(sc.id)||c.name===sc.name||(sc.name==='املا'&&c.name.includes('املا'))||(sc.name==='انشا و نگارش'&&(c.name.includes('انشا')||c.name.includes('نگارش'))))){
      list.push(sc);
    }
  });
  return list;
}
const courseBy=id=>courses().find(c=>String(c.id)===String(id))||SPECIAL_COURSES.find(c=>String(c.id)===String(id))||null;
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
['املا',[['املا تقریری','g'],['املا تخته‌ای','g'],['تصحیح همسالان','g'],['املا آموزشی و خلاق','g'],['واژه‌آموزی و املا','g']]],
['انشا',[['بندنویسی موضوعی','g'],['خاطره‌نویسی و توصیف','g'],['نگارش خلاق','g'],['بازنویسی حکایت و ضرب‌المثل','g'],['تصویرخوانی و نگارش','g']]],
['نگارش',[['آموزش مهارت نگارش','g'],['فعالیت کتاب نگارش','d',1],['رعایت علائم نگارشی','g'],['درست‌نویسی و خوش‌نویسی','g']]],
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

let st={k:todayK(),b:null,item:null,sel:false,pick:new Set(),note:null,tpl:false,keep:false,cal:null,reportPeriod:'week',mx:{m:'week',k:null,c:'all'},pendAll:false};
const dshort=k=>{try{const p=jparts(k);if(p&&JMN[p.m-1])return WDN[dow(k)]+' '+fa(p.d)+' '+JMN[p.m-1]}catch(e){}return fmtP(k,{weekday:'short',day:'numeric',month:'long'})};
function viewSes(k,b){const s=getSes(k,b);if(s)return s;const bl=bells(k).find(x=>x.i===String(b));return bl?{c:bl.cids[0],tp:'',nt:''}:null}
function flash(msg){let t=$('djFl');if(t)t.remove();t=document.createElement('div');t.id='djFl';t.className='dj-fl';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{if(t.parentNode)t.remove()},2300)}

/* انتخاب زنگ پیش‌فرض */
function pickDefault(){const k=st.k,L=dayBells(k);if(!L.length){st.b=null;return}
 if(L.some(x=>x.b===st.b))return;
 let b=null;if(k===todayK()&&window.wscApi&&wscApi.now){try{const n=wscApi.now();if(n&&L.some(x=>x.b===String(n.i)))b=String(n.i)}catch(e){}}
 if(b==null){const f=L.find(x=>stat(k,x.b)!=='full'&&stat(k,x.b)!=='skip');b=(f||L[0]).b}
 st.b=b;st.item=null;st.note=null;st.pick=new Set()}

/* ───── تشخیص واقعی وضعیت دفتر روزانه (مستقل از برنامه‌ی هفتگی) ─────
   وضعیت‌های ۵ گانه:
   - 'off': تعطیل (رسمی، اختصاصی، هفتگی؛ هرگز ناقص محسوب نمی‌شود)
   - 'unknown': نامشخص (بدون بررسی قطعی فعال یا تعطیل نمی‌شود)
   - 'none': ثبت‌نشده (روز فعال مدرسه بدون هیچ فعالیت ثبت‌شده در پایگاه داده واقعی)
   - 'part': ناقص (روز دارای فعالیت ولی فاقد شرایط تکمیل یا ارزیابی ناقص)
   - 'full': تکمیل‌شده (روز دارای فعالیت‌های کامل ثبت‌شده)
*/
function dayJournalStatus(k){
  if(isOff(k)) return {status:'off', label:'تعطیل', color:'#a8101a', badge:'🔴 تعطیل', actCount:0, evalCount:0};
  const ds=dstat(k);
  if(ds&&ds.status==='unknown') return {status:'unknown', label:'نامشخص', color:'#8a94a6', badge:'⚪ نامشخص', actCount:0, evalCount:0};

  const d=D();
  const datePrefix=k+'|';
  const mKeys=Object.keys(d.m||{}).filter(x=>x.indexOf(datePrefix)===0);
  const sesKeys=Object.keys(d.ses||{}).filter(x=>x.indexOf(datePrefix)===0);

  // روز فعال بدون هیچ فعالیت در پایگاه داده واقعی: ثبت نشده
  if(!mKeys.length&&!sesKeys.length){
    return {status:'none', label:'ثبت‌نشده', color:'#8a94a6', badge:'⚪ ثبت‌نشده', actCount:0, evalCount:0};
  }

  const pn=presN(k);
  let totalEvaluated=0, fullActs=0;
  mKeys.forEach(key=>{
    const marks=d.m[key]||{};
    const count=Object.keys(marks).filter(sid=>!absent(k,+sid)).length;
    totalEvaluated+=count;
    if(pn>0&&count>=pn) fullActs++;
  });

  // معیار تکمیل: داشتن فعالیت‌های ثبت‌شده با پوشش مناسب دانش‌آموزان
  if(mKeys.length>0&&(fullActs>=1||(pn>0&&totalEvaluated>=pn*0.75))){
    return {status:'full', label:'تکمیل‌شده', color:'#1a8f55', badge:'✅ تکمیل‌شده', actCount:mKeys.length, evalCount:totalEvaluated};
  }
  return {status:'part', label:'ناقص', color:'#d98600', badge:'🟡 ناقص', actCount:mKeys.length, evalCount:totalEvaluated};
}

/* دفترهای روزانه ثبت‌نشده یا ناقص در N روز اخیر (کاملاً مستقل از زنگ‌های برنامه هفتگی) */
function journalPendingDays(days){
  const out=[], t=todayK(), maxD=days||7;
  for(let i=0; i<maxD; i++){
    const k=addD(t, -i);
    const info=dayJournalStatus(k);
    if(info.status==='none'||info.status==='part'){
      out.push({k, q:info.status, info});
    }
  }
  return out;
}

/* برای سازگاری سایر بخش‌ها */
function pending(days){
  return journalPendingDays(days);
}

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
#dj .dj-nm{flex:1;min-width:110px;font-weight:900;font-size:15px;letter-spacing:.1px}
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
.dj-calgrid button.uk{box-shadow:inset 0 0 0 1.5px #8a94a6;border-radius:10px}
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
const PENDCSS=`
#dj .dj-pend{padding:14px}
#dj .dj-pend.ok{background:#1a8f5512;border:1px solid #1a8f5544}
#dj .dj-ph{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
#dj .dj-ph small{color:var(--mut,#888);font-weight:700}
#dj .dj-pc{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px}
#dj .dj-pc span{padding:3px 11px;border-radius:99px;font:800 12px Vazirmatn,Tahoma,sans-serif}
#dj .dj-pc .n{background:#8a94a62a;color:#4a5568}
#dj .dj-pc .p{background:#d986002a;color:#8a5a00}
#dj .dj-pc .t{background:#c0262c1f;color:#a8101a}
#dj .dj-pd{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line,#e6e9f2)}
#dj .dj-pdl{flex:0 0 96px;display:flex;flex-direction:column;gap:1px;font-size:13px;line-height:1.5}
#dj .dj-pdl small{color:var(--p,#5b3fd6);font-weight:800;font-size:11px}
#dj .dj-pbs{display:flex;gap:6px;flex-wrap:wrap;flex:1;min-width:0}
#dj .dj-pb{display:flex;align-items:center;gap:7px;padding:6px 10px;border-radius:12px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:var(--tx,#222);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;min-height:40px;text-align:right}
#dj .dj-pb.part{border-color:#d9860088;background:#d986001a}
#dj .dj-pb .tx{display:flex;flex-direction:column;line-height:1.45}
#dj .dj-pb .tx small{color:var(--mut,#888);font-weight:600;font-size:11px}
#dj .dj-pf{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line,#e6e9f2);padding-top:9px;margin-top:2px}
#dj .dj-pf .lg{font-size:11px;color:var(--mut,#888)}
@media(max-width:520px){#dj .dj-pd{flex-direction:column;gap:5px}#dj .dj-pdl{flex:none;flex-direction:row;gap:8px;align-items:baseline}}
#dj .dj-mxbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:8px 0}
#dj .dj-seg{display:inline-flex;border:1px solid var(--line,#ddd);border-radius:11px;overflow:hidden}
#dj .dj-seg button{border:0;background:var(--card,#fff);color:var(--tx,#222);padding:8px 14px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#dj .dj-seg button.on{background:var(--p,#5b3fd6);color:#fff}
#dj .dj-mxt{flex:1;min-width:150px;text-align:center;font-weight:800;font-size:14px}
#dj .dj-live{display:inline-flex;align-items:center;gap:5px;font:800 11px Vazirmatn,Tahoma,sans-serif;color:#1a8f55;background:#1a8f5518;border-radius:99px;padding:2px 9px;margin-right:6px}
#dj .dj-live::before{content:'';width:7px;height:7px;border-radius:50%;background:#1a8f55}
#dj .dj-mxlg{font-size:11px;color:var(--mut,#777);line-height:2;margin-top:8px}
#dj .dj-mxlg i{font-style:normal;display:inline-block;min-width:24px;text-align:center;border-radius:5px;color:#fff;font-weight:900;padding:0 4px;margin-left:3px}
#dj .dj-mxem{padding:18px;text-align:center;color:var(--mut,#888);font-size:13px}`;
const MXCSS=`
.dj-mx .dj-mxw{overflow:auto;border-radius:14px;border:1px solid var(--line,#dfe3ee)}
.dj-mx table{border-collapse:separate;border-spacing:0;font:700 12px Vazirmatn,Tahoma,sans-serif;width:max-content;min-width:100%;table-layout:auto;color:var(--tx,#222)}
.dj-mx th,.dj-mx td{padding:0;text-align:center;vertical-align:middle;border-bottom:1px solid var(--line,#e6e9f2);border-left:1px solid var(--line,#e6e9f2)}
.dj-mx thead th{background:#2b4a9b;color:#fff;font-weight:800;position:sticky;top:0;z-index:2;text-align:center !important;vertical-align:middle !important}
.dj-mx thead th.d1{background:#3d63bd}
.dj-mx th.nm,.dj-mx td.nm{position:sticky;right:0;z-index:3;text-align:right;padding:7px 16px;min-width:max-content;width:auto;max-width:none;white-space:nowrap !important;overflow:visible !important;text-overflow:clip !important;font-weight:900;font-size:13.5px;background:var(--card,#fff);color:var(--tx,#222);border-left:2px solid #c9d2ea}
.dj-mx thead th.nm{background:#2b4a9b;color:#fff;z-index:5;text-align:center !important;vertical-align:middle !important;padding:8px 16px}
.dj-mx tbody tr:nth-child(even) td.nm{background:var(--bg2,#f4f6fb)}
.dj-mx th.h{width:36px;min-width:36px;vertical-align:middle !important;padding:8px 2px;text-align:center !important}
.dj-mx th.h span{display:inline-flex !important;align-items:center !important;justify-content:center !important;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center !important;white-space:nowrap;max-height:220px;overflow:hidden;margin:0 auto !important;font-size:11px;line-height:1.6}
.dj-mx th.h b{font-weight:900;color:#ffe08a}
.dj-mx th.sm{background:#1d3470;min-width:40px;width:40px;text-align:center !important;vertical-align:middle !important}
.dj-mx th.sm span{display:flex !important;align-items:center !important;justify-content:center !important;text-align:center !important;width:100% !important;margin:0 auto !important}
.dj-mx td.c{width:34px;min-width:34px;height:30px;font-size:11.5px;font-weight:900;color:#fff;text-align:center !important;vertical-align:middle !important}
.dj-mx td.l4{background:#1a8f55}.dj-mx td.l3{background:#55b043}.dj-mx td.l2{background:#e2a300}.dj-mx td.l1{background:#d9363e}
.dj-mx td.ok{background:#1a8f55}.dj-mx td.no{background:#d9363e}
.dj-mx td.ab{background:#fde7e8;color:#c0262c;font-weight:900;text-align:center !important}
.dj-mx td.em{background:transparent}
.dj-mx td.sm{min-width:40px;width:40px;font-size:12px;font-weight:900;background:var(--bg2,#f4f6fb);text-align:center !important;vertical-align:middle !important}
.dj-mx td.sm.z{color:#a7afc0;font-weight:600}
.dj-mx td.sm.s4{color:#1a8f55}.dj-mx td.sm.s3{color:#3f8f2a}.dj-mx td.sm.s2{color:#b26a00}.dj-mx td.sm.s1{color:#c0262c}
.dj-mx tbody tr:hover td.nm{background:#e8edf9}

/* استایل‌های داشبورد تحلیلی و نمودار عملکرد کلاس */
.dj-dash{margin-top:14px;padding:16px;background:var(--card,#fff);border-radius:16px;border:1px solid var(--line,#dfe3ee)}
.dj-dash-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.dj-dash-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
.dj-dash-card{border-radius:12px;padding:12px 14px;border:1px solid var(--line,#e2e8f0);background:var(--bg2,#f8fafc)}
.dj-dash-card.top{border-color:#1a8f5544;background:#1a8f550c}
.dj-dash-card.act{border-color:#5b3fd644;background:#5b3fd60c}
.dj-dash-card.need{border-color:#d9363e44;background:#d9363e0c}
.dj-dash-card b{display:block;font-size:13px;margin-bottom:6px}
.dj-dash-card .st-list{display:flex;flex-direction:column;gap:5px;font-size:12px}
.dj-dash-card .st-item{display:flex;justify-content:space-between;align-items:center}
.dj-dash-card .st-badge{font-weight:800;font-size:11px;padding:2px 7px;border-radius:6px;background:#fff;border:1px solid currentColor}

.dj-dash-chart{margin:14px 0;padding:12px;border-radius:12px;background:var(--bg2,#f8fafc);border:1px solid var(--line,#e2e8f0)}
.dj-chart-title{font-size:13px;font-weight:800;margin-bottom:8px}
.dj-dist-bar{display:flex;height:24px;border-radius:8px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);margin-bottom:8px}
.dj-dist-seg{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:11px;transition:width 0.3s}
.dj-dist-lg{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--tx,#333)}
.dj-dist-lg span{display:inline-flex;align-items:center;gap:4px}
.dj-dist-lg i{width:10px;height:10px;border-radius:3px;display:inline-block}

.dj-dash-rank{overflow-x:auto;margin-top:12px}
.dj-dash-rank table{width:100%;border-collapse:collapse;font-size:12px;text-align:right}
.dj-dash-rank th,.dj-dash-rank td{padding:6px 8px;border-bottom:1px solid var(--line,#eee)}
.dj-dash-rank th{background:var(--bg2,#f1f5f9);font-weight:800;color:var(--tx,#222)}
.dj-prog-wrap{display:flex;align-items:center;gap:8px;min-width:140px}
.dj-prog-bg{flex:1;height:8px;border-radius:4px;background:#e2e8f0;overflow:hidden}
.dj-prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#4a7ae0,#1a8f55)}

/* مودال گزارش رسمی دفتر روزانه */
.dj-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.65);z-index:99999;display:grid;place-items:center;padding:14px}
.dj-modal-box{width:min(540px,100%);background:var(--card,#fff);color:var(--tx,#222);border-radius:18px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-height:90vh;overflow-y:auto}
.dj-modal-hd{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line,#e2e8f0);padding-bottom:10px;margin-bottom:14px}
.dj-modal-hd b{font-size:16px;color:#1e3a8a}
.dj-modal-sec{margin:12px 0}
.dj-modal-sec label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
.dj-modal-opt{display:flex;gap:8px;flex-wrap:wrap}
.dj-modal-opt button{flex:1;min-width:120px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line,#cbd5e1);background:var(--card,#fff);color:var(--tx,#333);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.dj-modal-opt button.on{border-color:#2563eb;background:#2563eb12;color:#1d4ed8}
.dj-modal-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;border-top:1px solid var(--line,#e2e8f0);padding-top:12px}`;
const cs=document.createElement('style');cs.textContent=CSS+PENDCSS+MXCSS;document.head.appendChild(cs);

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
 {const ds=dstat(k);if(ds&&ds.status==='unknown'&&dow(k)>4)return{c:'uk',t:'وضعیت نامشخص (روزهای کاری مدرسه تنظیم نشده)'}}
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
 let h=`<h2>📓 دفتر روزانه معلم</h2><p class="sub">ثبت سریع عملکرد دانش‌آموزان در هر زنگ؛ همه‌ی اطلاعات به پرونده‌ی دانش‌آموز می‌رود.</p><div class="card dj-report-tools"><b>📄 گزارش‌های رسمی و چاپی دفتر روزانه</b><div class="dj-nt" style="margin-top:8px;flex-wrap:wrap"><button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:13px;padding:9px 15px;border-radius:12px;border:0;cursor:pointer;font-weight:800" data-dj="teacherreport">📋 گزارش دفتر روزانه معلم (A4 افقی / عمودی با حضور و غیاب)</button><select class="dj-in" data-report-period aria-label="بازه گزارش"><option value="week"${st.reportPeriod==='week'?' selected':''}>گزارش هفتگی</option><option value="month"${st.reportPeriod==='month'?' selected':''}>گزارش ماهانه</option><option value="year"${st.reportPeriod==='year'?' selected':''}>گزارش سالانه</option></select><button type="button" class="dj-sm" data-dj="report">🖨️ خروجی استاندارد</button></div><small style="color:var(--mut,#888)">گزارش دفتر روزانه معلم شامل عملکرد هر روز در کنار حضور و غیاب دانش‌آموزان در برگه A4 افقی (ماهانه) یا عمودی (هفتگی) آماده چاپ است.</small></div>`;
 h+=`<div class="card"><div class="dj-hd"><button class="dj-sm" data-dj="nav:-1">‹ روز قبل</button><button type="button" class="dj-day" data-dj="calendar" aria-label="انتخاب تاریخ">${esc(dlab(k))}${k===t?' <small>(امروز)</small>':''}</button><button class="dj-sm" data-dj="nav:1">روز بعد ›</button>${k!==t?`<button class="dj-sm" data-dj="today">امروز</button>`:''}</div>`;
 if(!wkSet()&&dow(k)>4)h+=`<div class="dj-warn">روزهای کاری مدرسه هنوز تنظیم نشده و این روز تعطیل فرض نشده است.${(()=>{const q=dstat(k);return q&&q.status==='unknown'?' وضعیت این روز «نامشخص» است (نه فعال، نه تعطیل).':''})()} اگر مدرسه‌ی شما این روز تعطیل است، <button type="button" class="dj-sm" data-dj="setwk">⚙️ روزهای کاری را تنظیم کنید</button></div>`;
 if(isOff(k)){const hi=hinfo(k),nrec=L.length;if(hi&&hi.official)h+=`<div class="dj-ho" id="djHol">🎉 <b>تعطیل رسمی:</b> ${esc(hi.label)}<br><small>این روز «دفتر ثبت‌نشده» یا ناقص حساب نمی‌شود. ${nrec?`سوابق این روز: <b>${fa(nrec)}</b> زنگ ثبت‌شده در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ اگر کلاسی برگزار شده، با «＋ زنگ دستی» ثبت کنید.'}</small></div>`;else if(hi&&hi.custom)h+=`<div class="dj-cu" id="djCu">🏫 <b>تعطیلی اختصاصی مدرسه${hi.emergency?' (اضطراری 🚨)':''}:</b> ${esc(hi.label)}${hi.reason?`<br><small>علت: ${esc(hi.reason)}</small>`:''}<br><small>${nrec?`سوابق ثبت‌شده‌ی این روز: <b>${fa(nrec)}</b> زنگ در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ ثبت فعالیت در روز تعطیل نیاز به تأیید شما دارد.'}</small></div>`;else h+=`<div class="dj-warn">این روز تعطیل است${hi&&hi.label?' ('+esc(hi.label)+')':''}. ${nrec?`سوابق ثبت‌شده‌ی این روز: ${fa(nrec)} زنگ.`:'اگر زنگی برگزار شده، با «＋ زنگ دستی» ثبت کنید.'}</div>`}
 else if(!L.length)h+=`<div class="dj-warn">برای این روز در برنامه‌ی هفتگی زنگ درسی چیده نشده است. در بخش «برنامه هفتگی» درس‌ها را بچینید یا از «＋ زنگ دستی» استفاده کنید.</div>`;
 h+=`<div class="dj-bl">${L.map(x=>`<button class="dj-ch${x.b===st.b?' on':''}" data-dj="bell:${esc(x.b)}">${SI[stat(k,x.b)]} ${esc(bellName(k,x))}${x.s?` <small>${fa(x.s)}</small>`:''}</button>`).join('')}<button class="dj-ch" data-dj="manual">＋ زنگ دستی</button></div></div>`;
 h+=calHtml();
 if(ses)h+=sessionCard(k,st.b,ses);
 h+=pendCard(pend);h+=mxCard();h+=teacherReportModalHtml();
 const w0=s.querySelector('.dj-mxw'),sl=w0?w0.scrollLeft:null;
 s.innerHTML=h;
 if(sl!=null){const w1=s.querySelector('.dj-mxw');if(w1)w1.scrollLeft=sl}}

function sessionCard(k,b,s){
 const items=itemsOf(s),pn=presN(k),sk=s.st==='skip';
 let h=`<div class="card"><div class="dj-hd"><b>${esc(cname(s.c))}</b><span style="font-size:12px;color:#888">${fa(pn)} حاضر از ${fa(sts().length)}</span></div>
 <div class="dj-nt" style="margin-top:8px"><select class="dj-in" data-f="course">${allCourses().map(c=>`<option value="${c.id}"${String(c.id)===String(s.c)?' selected':''}>${esc(c.name)}</option>`).join('')}</select><input class="dj-in" data-f="topic" placeholder="درس و مبحث تدریس‌شده (اختیاری)" value="${esc(s.tp||'')}"></div>
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
 if(!p.length)return`<div class="card dj-pend ok"><b>✅ دفتر روزانه‌ی همه‌ی روزهای فعال در ۷ روز اخیر تکمیل است</b></div>`;
 const none=p.filter(x=>x.q==='none').length,part=p.length-none,t=todayK();
 const shown=st.pendAll?p:p.slice(0,4);
 const rel=k=>k===t?'امروز':k===addD(t,-1)?'دیروز':'';
 let h=`<div class="card dj-pend"><div class="dj-ph"><b>⏳ دفترهای روزانه ثبت‌نشده یا ناقص</b><small>۷ روز اخیر (مستقل از برنامه‌ی هفتگی)</small></div>
 <div class="dj-pc"><span class="n">⚪ ${fa(none)} روز ثبت‌نشده</span><span class="p">🟡 ${fa(part)} روز ناقص</span><span class="t">مجموع ${fa(p.length)} روز نیازمند پیگیری</span></div>`;
 h+=shown.map(x=>{
  const info=x.info||dayJournalStatus(x.k);
  const actText=info.actCount?fa(info.actCount)+' فعالیت ثبت‌شده':'بدون ثبت فعالیت';
  return`<div class="dj-pd"><div class="dj-pdl"><b>${esc(dshort(x.k))}</b>${rel(x.k)?`<small>${rel(x.k)}</small>`:''}</div>
  <div class="dj-pbs" style="align-items:center;justify-content:space-between;width:100%">
    <div style="font-size:13px;display:flex;align-items:center;gap:8px">
      <span style="font-weight:900;font-size:12px;padding:3px 10px;border-radius:8px;background:${info.status==='none'?'#8a94a622':'#d9860022'};color:${info.color}">${info.badge}</span>
      <span style="color:var(--mut,#666);font-size:12px">${actText}</span>
    </div>
    <button type="button" class="dj-pb" style="min-height:36px;padding:6px 14px;background:var(--p,#5b3fd6);color:#fff;border-color:transparent;cursor:pointer" data-dj="goday:${x.k}">باز کردن دفتر این روز ‹</button>
  </div></div>`}).join('');
 if(p.length>4)h+=`<div style="text-align:center;padding:4px 0 8px"><button type="button" class="dj-sm" data-dj="pendall">${st.pendAll?'▲ نمایش کمتر':'▼ نمایش همه‌ی روزها ('+fa(p.length)+' روز)'}</button></div>`;
 return h+`<div class="dj-pf"><span class="lg">⚪ ثبت‌نشده: روز فعالِ بدون فعالیت · 🟡 ناقص: روزِ دارای فعالیتِ ناتمام</span><button type="button" class="dj-sm" data-dj="skipall">➖ علامت‌گذاری به عنوان «بدون نیاز به ثبت»</button></div></div>`}

/* ───── جدول عملکرد هفتگی / ماهانه (پیش‌نمایش زنده، بر پایه‌ی همان داده‌ی دفتر) ───── */
function mxAnchor(){return st.mx.k||st.k||todayK()}
function mxRange(){const a=mxAnchor();
 if(st.mx.m==='month'){const p=jparts(a),from=jiso(p.y,p.m,1),to=jiso(p.y,p.m,jlen(p.y,p.m));return{from,to,title:'ماه '+JMN[p.m-1]+' '+fa(p.y),kind:'ماهانه'}}
 const from=addD(a,-dow(a)),to=addD(from,6);return{from,to,title:dshort(from)+' تا '+dshort(to),kind:'هفتگی'}}
function mxBuild(){const R=mxRange(),d=D(),cf=st.mx.c,cols=[];
 Object.keys(d.m).forEach(key=>{const p=key.split('|'),k=p[0];if(!R.from||k<R.from||k>R.to)return;
  const ses=d.ses[k+'|'+p[1]],it=ses&&(ses.it||{})[p[2]],mk=d.m[key];if(!it||!mk||!Object.keys(mk).length)return;
  if(cf!=='all'&&String(ses.c)!==String(cf))return;
  cols.push({key,k,b:p[1],id:p[2],c:ses.c,t:it.t==='d'?'d':'g',n:it.n,mk})});
 const bo=b=>(String(b).charAt(0)==='m'?100:0)+(+String(b).replace(/\D/g,'')||0);
 cols.sort((a,b)=>a.k<b.k?-1:a.k>b.k?1:(bo(a.b)-bo(b.b))||(a.id<b.id?-1:a.id>b.id?1:0));
 return{R,cols}}
const MXS={4:['خ خ','l4','خیلی خوب'],3:['خ','l3','خوب'],2:['ق ق','l2','قابل قبول'],1:['ن ت','l1','نیاز به تلاش بیشتر']};
function mxTable(B){const cols=B.cols;if(!cols.length)return'';
 const maxLen=sts().reduce((m,s)=>Math.max(m,(s.name||'').trim().length),0);
 const nmW=Math.max(140,Math.ceil(maxLen*10.5)+40);
 let alt=0,prevDate=null;
 const head=cols.map(c=>{
  const isNewDate=(c.k!==prevDate);
  if(isNewDate){alt^=1;prevDate=c.k}
  c.alt=alt;
  const jp=jparts(c.k),dt=fa(jp.d)+' '+JMN[jp.m-1],tx=cname(c.c)+' · '+c.n,tt=dlab(c.k)+' — '+bellLabel(c.k,c.b)+' — '+cname(c.c)+' — '+c.n;
  const titleHtml=isNewDate?`<b>${esc(dt)}</b> | ${esc(tx.length>34?tx.slice(0,33)+'…':tx)}`:`${esc(tx.length>34?tx.slice(0,33)+'…':tx)}`;
  return`<th class="h${alt?' d1':''}${isNewDate?' first-act':''}" title="${esc(tt)}"><span>${titleHtml}</span></th>`}).join('');
 const sumH=[['خ خ','#1a8f55','خیلی خوب'],['خ','#3f8f2a','خوب'],['ق ق','#b26a00','قابل قبول'],['ن ت','#c0262c','نیاز به تلاش'],['انجام','#1a8f55','انجام شد'],['نشد','#c0262c','انجام نشد']].map(x=>`<th class="h sm" title="${x[2]}"><span style="color:#fff">${x[0]}</span></th>`).join('');
 const body=sts().map(s=>{const sum={4:0,3:0,2:0,1:0,ok:0,no:0};
  const tds=cols.map(c=>{const v=c.mk[s.id];
   if(v==null)return absent(c.k,s.id)?`<td class="c ab" title="غایب">غ</td>`:`<td class="c em"></td>`;
   if(c.t==='d'){if(v===1){sum.ok++;return`<td class="c ok" title="انجام شد">✓</td>`}sum.no++;return`<td class="c no" title="انجام نشد">✗</td>`}
   const m=MXS[v];if(!m)return`<td class="c em"></td>`;sum[v]++;return`<td class="c ${m[1]}" title="${m[2]}">${m[0]}</td>`}).join('');
  const sm=[[4,'s4'],[3,'s3'],[2,'s2'],[1,'s1'],['ok','s4'],['no','s1']].map(x=>`<td class="sm ${sum[x[0]]?x[1]:'z'}">${fa(sum[x[0]])}</td>`).join('');
  return`<tr><td class="nm" style="min-width:${nmW}px;width:${nmW}px">${esc(s.name)}</td>${tds}${sm}</tr>`}).join('');
 return`<table><thead><tr><th class="nm" style="min-width:${nmW}px;width:${nmW}px">نام دانش‌آموز</th>${head}${sumH}</tr></thead><tbody>${body}</tbody></table>`}
function bellLabel(k,b){try{const x=dayBells(k).find(q=>q.b===String(b));return x?bellName(k,x):'زنگ '+b}catch(e){return'زنگ '+b}}
function mxLegend(){return`<div class="dj-mxlg"><i style="background:#1a8f55">خ خ</i>خیلی خوب <i style="background:#55b043">خ</i>خوب <i style="background:#e2a300">ق ق</i>قابل قبول <i style="background:#d9363e">ن ت</i>نیاز به تلاش بیشتر <i style="background:#1a8f55">✓</i>انجام شد <i style="background:#d9363e">✗</i>انجام نشد <i style="background:#fde7e8;color:#c0262c">غ</i>غایب · خانه‌ی خالی = ثبت نشده</div>`}

/* ───── داشبورد تحلیلی و نمودار وضعیت دانش‌آموزان در انتهای صفحه ───── */
function classAnalyticsDashboard(B){
 const cols=B.cols||[];
 const students=sts();
 if(!students.length)return'';
 const studentStats=students.map(s=>{
  let l4=0,l3=0,l2=0,l1=0,ok=0,no=0,abs=0,tot=0;
  cols.forEach(c=>{
   const v=c.mk[s.id];
   if(v!=null){
    tot++;
    if(c.t==='d'){if(v===1)ok++;else no++;}
    else{if(v===4)l4++;else if(v===3)l3++;else if(v===2)l2++;else if(v===1)l1++;}
   }else if(absent(c.k,s.id)){abs++;}
  });
  const positive=l4+l3+ok;
  const rate=tot>0?Math.round((positive/tot)*100):0;
  return{student:s,l4,l3,l2,l1,ok,no,abs,tot,rate};
 });
 const classTotals={l4:0,l3:0,l2:0,l1:0,ok:0,no:0,tot:0};
 studentStats.forEach(r=>{
  classTotals.l4+=r.l4;classTotals.l3+=r.l3;classTotals.l2+=r.l2;classTotals.l1+=r.l1;
  classTotals.ok+=r.ok;classTotals.no+=r.no;classTotals.tot+=r.tot;
 });
 const totMarks=classTotals.tot;
 const pL4=totMarks>0?Math.round((classTotals.l4/totMarks)*100):0;
 const pL3=totMarks>0?Math.round((classTotals.l3/totMarks)*100):0;
 const pL2=totMarks>0?Math.round((classTotals.l2/totMarks)*100):0;
 const pL1=totMarks>0?Math.round((classTotals.l1/totMarks)*100):0;

 const topStudents=[...studentStats].filter(r=>r.tot>0).sort((a,b)=>(b.l4-a.l4)||(b.rate-a.rate)).slice(0,3);
 const mostActive=[...studentStats].filter(r=>r.tot>0).sort((a,b)=>b.tot-a.tot).slice(0,3);
 const needSupport=[...studentStats].filter(r=>r.tot>0&&(r.l1>0||r.l2>0||r.rate<60)).sort((a,b)=>(b.l1-a.l1)||(b.l2-a.l2)||(a.rate-b.rate)).slice(0,3);
 const rankingList=[...studentStats].sort((a,b)=>(b.rate-a.rate)||(b.l4-a.l4)||(b.tot-a.tot));
 const medals=['🥇','🥈','🥉'];

 return`<div class="dj-dash">
  <div class="dj-dash-hd">
    <b style="font-size:15px;color:#1e3a8a">📊 داشبورد تحلیلی و وضعیت پویای دانش‌آموزان (${esc(B.R.title)})</b>
    <small style="color:var(--mut,#666)">بر اساس مجموع ${fa(totMarks)} ثبت عملکرد کلاسی در این بازه</small>
  </div>
  <div class="dj-dash-cards">
    <div class="dj-dash-card top">
      <b style="color:#1a8f55">🌟 زرنگ‌ترین دانش‌آموزان (بیشترین خیلی‌خوب)</b>
      <div class="st-list">
        ${topStudents.length?topStudents.map((r,i)=>`<div class="st-item"><span>${medals[i]||'⭐'} <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#1a8f55;border-color:#1a8f55">${fa(r.l4)} خیلی‌خوب (${fa(r.rate)}٪)</span></div>`).join(''):'<div style="color:var(--mut,#888)">هنوز ثبت سطحی انجام نشده است</div>'}
      </div>
    </div>
    <div class="dj-dash-card act">
      <b style="color:#5b3fd6">⚡ فعال‌ترین‌ها (بیشترین مشارکت)</b>
      <div class="st-list">
        ${mostActive.length?mostActive.map((r,i)=>`<div class="st-item"><span>${medals[i]||'🔹'} <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#5b3fd6;border-color:#5b3fd6">${fa(r.tot)} فعالیت ثبت‌شده</span></div>`).join(''):'<div style="color:var(--mut,#888)">هنوز فعالیتی ثبت نشده است</div>'}
      </div>
    </div>
    <div class="dj-dash-card need">
      <b style="color:#d9363e">🎯 نیازمند تلاش و تمرین (پیگیری آموزشی)</b>
      <div class="st-list">
        ${needSupport.length?needSupport.map(r=>`<div class="st-item"><span>⚠️ <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#d9363e;border-color:#d9363e">${fa(r.l1)} نیاز به تلاش · ${fa(r.l2)} قابل قبول</span></div>`).join(''):'<div style="color:#1a8f55;font-weight:700">خوشبختانه موردی برای پیگیری اضطراری نیست 🎉</div>'}
      </div>
    </div>
  </div>
  <div class="dj-dash-chart">
    <div class="dj-chart-title">📈 نمودار مقایسه‌ای توزیع سطوح عملکرد کلاس</div>
    ${totMarks>0?`
      <div class="dj-dist-bar">
        ${pL4>0?`<div class="dj-dist-seg" style="width:${pL4}%;background:#1a8f55" title="خیلی خوب: ${pL4}٪">${pL4>8?fa(pL4)+'٪':''}</div>`:''}
        ${pL3>0?`<div class="dj-dist-seg" style="width:${pL3}%;background:#55b043" title="خوب: ${pL3}٪">${pL3>8?fa(pL3)+'٪':''}</div>`:''}
        ${pL2>0?`<div class="dj-dist-seg" style="width:${pL2}%;background:#e2a300" title="قابل قبول: ${pL2}٪">${pL2>8?fa(pL2)+'٪':''}</div>`:''}
        ${pL1>0?`<div class="dj-dist-seg" style="width:${pL1}%;background:#d9363e" title="نیاز به تلاش: ${pL1}٪">${pL1>8?fa(pL1)+'٪':''}</div>`:''}
      </div>
      <div class="dj-dist-lg">
        <span><i style="background:#1a8f55"></i>خیلی خوب: <b>${fa(classTotals.l4)}</b> مورد (${fa(pL4)}٪)</span>
        <span><i style="background:#55b043"></i>خوب: <b>${fa(classTotals.l3)}</b> مورد (${fa(pL3)}٪)</span>
        <span><i style="background:#e2a300"></i>قابل قبول: <b>${fa(classTotals.l2)}</b> مورد (${fa(pL2)}٪)</span>
        <span><i style="background:#d9363e"></i>نیاز به تلاش: <b>${fa(classTotals.l1)}</b> مورد (${fa(pL1)}٪)</span>
      </div>
    `:`<div style="color:var(--mut,#888);font-size:12px;text-align:center;padding:8px">اطلاعات کافی برای رسم نمودار توزیع در این بازه وجود ندارد.</div>`}
  </div>
  <div class="dj-chart-title" style="margin-top:16px">📋 رتبه‌بندی عملکرد دانش‌آموزان با نوار پیشرفت</div>
  <div class="dj-dash-rank">
    <table>
      <thead>
        <tr>
          <th style="width:40px;text-align:center">رتبه</th>
          <th>نام دانش‌آموز</th>
          <th style="min-width:160px">شاخص بازدهی مطلوب</th>
          <th style="text-align:center">خیلی خوب</th>
          <th style="text-align:center">خوب</th>
          <th style="text-align:center">قابل قبول</th>
          <th style="text-align:center">نیاز به تلاش</th>
          <th style="text-align:center">کل ثبت‌ها</th>
        </tr>
      </thead>
      <tbody>
        ${rankingList.map((r,i)=>`<tr>
          <td style="text-align:center;font-weight:900">${i===0?'🥇':i===1?'🥈':i===2?'🥉':fa(i+1)}</td>
          <td style="font-weight:800">${esc(r.student.name)}</td>
          <td>
            <div class="dj-prog-wrap">
              <div class="dj-prog-bg">
                <div class="dj-prog-fill" style="width:${r.rate}%;background:${r.rate>=80?'#1a8f55':r.rate>=60?'#3f8f2a':r.rate>=40?'#d98600':'#d9363e'}"></div>
              </div>
              <span style="font-size:11px;font-weight:900;min-width:32px">${fa(r.rate)}٪</span>
            </div>
          </td>
          <td style="text-align:center;font-weight:800;color:#1a8f55">${fa(r.l4)}</td>
          <td style="text-align:center;font-weight:800;color:#3f8f2a">${fa(r.l3)}</td>
          <td style="text-align:center;font-weight:800;color:#b26a00">${fa(r.l2)}</td>
          <td style="text-align:center;font-weight:800;color:#c0262c">${fa(r.l1)}</td>
          <td style="text-align:center;font-weight:700">${fa(r.tot)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
 </div>`}

function mxCard(){const B=mxBuild(),tb=mxTable(B),own=st.mx.k!=null;
 const opt=`<option value="all"${st.mx.c==='all'?' selected':''}>همه‌ی درس‌ها</option>`+allCourses().map(c=>`<option value="${c.id}"${String(c.id)===String(st.mx.c)?' selected':''}>${esc(c.name)}</option>`).join('');
 return`<div class="card dj-mx" id="djMx"><div class="dj-ph"><b>📊 جدول عملکرد دانش‌آموزان <span class="dj-live">پیش‌نمایش زنده</span></b><small>${fa(B.cols.length)} ستون ثبت‌شده</small></div>
 <div class="dj-mxbar"><div class="dj-seg"><button type="button" class="${st.mx.m==='week'?'on':''}" data-dj="mxmode:week">هفتگی</button><button type="button" class="${st.mx.m==='month'?'on':''}" data-dj="mxmode:month">ماهانه</button></div>
 <button type="button" class="dj-sm" data-dj="mxprev" aria-label="قبلی">‹ قبلی</button><div class="dj-mxt">${esc(B.R.title)}</div><button type="button" class="dj-sm" data-dj="mxnext" aria-label="بعدی">بعدی ›</button>${own?`<button type="button" class="dj-sm" data-dj="mxnow">↻ هم‌گام با روز دفتر</button>`:''}</div>
 <div class="dj-mxbar"><select class="dj-in" data-mxc aria-label="فیلتر درس" style="max-width:220px">${opt}</select>
 <button type="button" class="dj-sm on" style="background:#1d4ed8;color:#fff;border-color:transparent" data-dj="teacherreport">📋 گزارش دفتر روزانه معلم (A4 چاپی و PDF)</button>
 <button type="button" class="dj-sm" data-dj="mxprint">🖨️ چاپ سریع این جدول</button></div>
 ${tb?`<div class="dj-mxw">${tb}</div>`:`<div class="dj-mxem">در این بازه هنوز عملکردی ثبت نشده است. با ثبت در بالای صفحه، جدول همین‌جا به‌روز می‌شود.</div>`}${mxLegend()}
 ${classAnalyticsDashboard(B)}</div>`}
function mxShift(dir){const a=mxAnchor();
 if(st.mx.m==='month'){const p=jparts(a);let m=p.m+dir,y=p.y;if(m<1){m=12;y--}if(m>12){m=1;y++}st.mx.k=jiso(y,m,1)||a}
 else st.mx.k=addD(a,7*dir)}
function printMatrix(){const B=mxBuild();if(!B.cols.length){flash('در این بازه عملکردی برای چاپ ثبت نشده است');return}
 const win=window.open('','_blank');if(!win){flash('پنجره‌ی گزارش مسدود شد؛ اجازه‌ی بازشدن پنجره را فعال کنید');return}
 const u=f=>{try{return new URL('assets/fonts/'+f,location.href).href}catch(e){return'assets/fonts/'+f}};
 const cn=st.mx.c==='all'?'همه‌ی درس‌ها':cname(st.mx.c);
 win.document.open();win.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>جدول عملکرد ${B.R.kind}</title><style>
 @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Regular.ttf')});font-weight:400}@font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Bold.ttf')});font-weight:700 900}
 @page{size:A4 landscape;margin:8mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;color:#202a36;margin:0;font-size:11px}
 h1{font-size:17px;margin:0 0 3px;color:#17365d}.meta{display:flex;justify-content:space-between;gap:10px;color:#526477;border-bottom:2px solid #486581;padding-bottom:6px;margin-bottom:8px;font-size:11px}
 .dj-mx .dj-mxw{overflow:visible;border:0}.dj-mx table{width:100%;min-width:0}.dj-mx th.nm,.dj-mx td.nm{position:static;min-width:max-content;white-space:nowrap;font-size:11px;padding:4px 10px;text-align:right}.dj-mx thead th{position:static;text-align:center !important;vertical-align:middle !important}.dj-mx thead th.nm{text-align:center !important}.dj-mx td.c{height:22px;font-size:10px}.dj-mx tr{break-inside:avoid}
 .dj-mx i{font-style:normal;display:inline-block;min-width:22px;text-align:center;border-radius:4px;color:#fff;font-weight:900;padding:0 4px;margin-left:3px}.sign{display:flex;justify-content:space-around;margin-top:16px}.sign span{border-top:1px solid #7b8794;padding:5px 30px 0}.noprint{text-align:center;margin:12px}@media print{.noprint{display:none}}
 ${MXCSS}</style></head><body><h1>جدول عملکرد دانش‌آموزان — گزارش ${B.R.kind}</h1><div class="meta"><span>بازه: ${esc(B.R.title)}</span><span>درس: ${esc(cn)}</span><span>تاریخ تهیه: ${esc(dshort(todayK()))}</span></div>
 <div class="dj-mx"><div class="dj-mxw">${mxTable(B)}</div>${mxLegend().replace('class="dj-mxlg"','style="font-size:10px;line-height:2.1;margin-top:6px"')}</div>
 <div class="sign"><span>نام و امضای آموزگار</span><span>مهر و تأیید مدیریت</span></div><div class="noprint"><button onclick="window.print()">چاپ / ذخیره به‌صورت PDF</button></div></body></html>`);
 win.document.close();setTimeout(()=>{try{win.focus();win.print()}catch(e){}},700)}

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

function teacherReportModalHtml(){
 if(!st.repModal)return'';
 const p=st.repModal.period||'month';
 const att=st.repModal.att||'inline';
 const opt=`<option value="all"${st.repModal.course==='all'?' selected':''}>همه‌ی درس‌ها</option>`+allCourses().map(c=>`<option value="${c.id}"${String(c.id)===String(st.repModal.course)?' selected':''}>${esc(c.name)}</option>`).join('');
 return`<div class="dj-modal-overlay" data-dj="closerepmodal"><div class="dj-modal-box" onclick="event.stopPropagation()">
  <div class="dj-modal-hd">
    <b>📋 تنظیمات گزارش جامع دفتر روزانه معلم</b>
    <button type="button" class="dj-sm" data-dj="closerepmodal">✕</button>
  </div>
  <p class="sub" style="margin-top:0">این گزارش جهت ارائه‌ی اداری، پوشه کار دانش‌آموزان و جلسات اولیا با قابلیت چاپ یا ذخیره به‌صورت PDF استاندارد آماده می‌شود.</p>
  
  <div class="dj-modal-sec">
    <label>۱. بازه زمانی و قطع برگه چاپی:</label>
    <div class="dj-modal-opt">
      <button type="button" class="${p==='month'?'on':''}" data-dj="repmodperiod:month">📄 ماهانه (A4 افقی - Landscape)</button>
      <button type="button" class="${p==='week'?'on':''}" data-dj="repmodperiod:week">📑 هفتگی (A4 عمودی - Portrait)</button>
    </div>
  </div>

  <div class="dj-modal-sec">
    <label>۲. نحوه نمایش حضور و غیاب دانش‌آموزان:</label>
    <div class="dj-modal-opt">
      <button type="button" class="${att==='inline'?'on':''}" data-dj="repmodatt:inline">ادغام در جدول (غایب، تأخیر و خلاصه)</button>
      <button type="button" class="${att==='separate'?'on':''}" data-dj="repmodatt:separate">جدول تفکیکی مجزا</button>
      <button type="button" class="${att==='none'?'on':''}" data-dj="repmodatt:none">بدون حضور و غیاب</button>
    </div>
  </div>

  <div class="dj-modal-sec">
    <label>۳. درس انتخابی:</label>
    <select class="dj-in" data-repmodcourse style="width:100%">${opt}</select>
  </div>

  <div class="dj-modal-ft">
    <button type="button" class="dj-sm" data-dj="closerepmodal">انصراف</button>
    <button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:14px;padding:10px 20px;border-radius:12px;border:0;cursor:pointer" data-dj="doreport">🖨️ چاپ و ذخیره PDF</button>
  </div>
 </div></div>`;
}

function printTeacherJournalReport(){
 const cfg=st.repModal||{period:'month',att:'inline',course:'all'};
 const today=todayK(), anchor=st.mx.k||st.k||today, jp0=jparts(anchor);
 let from, to, title, kind;
 if(cfg.period==='month'){
  from=jiso(jp0.y,jp0.m,1);
  to=jiso(jp0.y,jp0.m,jlen(jp0.y,jp0.m));
  title='ماهانه — ماه '+JMN[jp0.m-1]+' '+fa(jp0.y);
  kind='month';
 }else{
  const start=addD(anchor,-dow(anchor));
  from=start;
  to=addD(start,6);
  title='هفتگی — '+dshort(from)+' تا '+dshort(to);
  kind='week';
 }
 if(!from||!to){flash('تعیین بازه گزارش ممکن نشد');return;}

 const d=D(), cf=cfg.course||'all', cols=[];
 Object.keys(d.m).forEach(key=>{
  const p=key.split('|'), k=p[0];
  if(k<from||k>to)return;
  const ses=d.ses[k+'|'+p[1]], it=ses&&(ses.it||{})[p[2]], mk=d.m[key];
  if(!it||!mk||!Object.keys(mk).length)return;
  if(cf!=='all'&&String(ses.c)!==String(cf))return;
  cols.push({key,k,b:p[1],id:p[2],c:ses.c,t:it.t==='d'?'d':'g',n:it.n,mk});
 });
 const bo=b=>(String(b).charAt(0)==='m'?100:0)+(+String(b).replace(/\D/g,'')||0);
 cols.sort((a,b)=>a.k<b.k?-1:a.k>b.k?1:(bo(a.b)-bo(b.b))||(a.id<b.id?-1:a.id>b.id?1:0));

 const students=sts();
 if(!students.length){flash('دانش‌آموزی در کلاس وجود ندارد');return;}

 const win=window.open('','_blank');
 if(!win){flash('پنجره گزارش مسدود شد؛ باز شدن پنجره را تأیید کنید');return;}

 const u=f=>{try{return new URL('assets/fonts/'+f,location.href).href}catch(e){return'assets/fonts/'+f}};
 const schoolName=(S.profile&&S.profile.school)||'دبستان';
 const teacherName=(S.profile&&S.profile.teacher)||'آموزگار کلاس';
 const gradeName=(S.profile&&S.profile.grade)||'';
 const isLandscape=(kind==='month');

 let prevDate=null;
 const colHeaders=cols.map(c=>{
  const isNewDate=(c.k!==prevDate);
  if(isNewDate) prevDate=c.k;
  const jp=jparts(c.k), dt=fa(jp.d)+' '+JMN[jp.m-1];
  const tx=cname(c.c)+' · '+c.n;
  return `<th><div style="writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;margin:0 auto;max-height:160px;font-size:10px;padding:4px 0">${isNewDate?`<b>${esc(dt)}</b> | `:''}${esc(tx)}</div></th>`;
 }).join('');

 const summaryHeaders=`
  <th style="min-width:32px;background:#1a8f55;color:#fff" title="خیلی خوب">خ خ</th>
  <th style="min-width:32px;background:#3f8f2a;color:#fff" title="خوب">خ</th>
  <th style="min-width:32px;background:#b26a00;color:#fff" title="قابل قبول">ق ق</th>
  <th style="min-width:32px;background:#c0262c;color:#fff" title="نیاز به تلاش">ن ت</th>
  ${cfg.att!=='none'?'<th style="min-width:32px;background:#fde7e8;color:#a8101a">غیبت</th>':''}
  <th style="min-width:32px;background:#2563eb;color:#fff">مجموع</th>
 `;

 const rowsHtml=students.map((s,idx)=>{
  let l4=0,l3=0,l2=0,l1=0,ok=0,no=0,abs=0,tot=0;
  const tds=cols.map(c=>{
   const v=c.mk[s.id];
   const isAb=absent(c.k,s.id);
   if(isAb) abs++;
   if(v==null){
    if(cfg.att!=='none'&&isAb) return `<td class="ab" style="background:#fde7e8;color:#c0262c;font-weight:bold">غ</td>`;
    return `<td></td>`;
   }
   tot++;
   if(c.t==='d'){
    if(v===1){ok++;return `<td style="color:#1a8f55;font-weight:bold">✓</td>`;}
    no++;return `<td style="color:#c0262c;font-weight:bold">✗</td>`;
   }
   if(v===4){l4++;return `<td style="background:#1a8f5518;color:#1a8f55;font-weight:900">خ خ</td>`;}
   if(v===3){l3++;return `<td style="background:#55b04318;color:#3f8f2a;font-weight:900">خ</td>`;}
   if(v===2){l2++;return `<td style="background:#e2a30018;color:#b26a00;font-weight:900">ق ق</td>`;}
   if(v===1){l1++;return `<td style="background:#d9363e18;color:#c0262c;font-weight:900">ن ت</td>`;}
   return `<td></td>`;
  }).join('');

  return `<tr>
    <td style="text-align:center">${fa(idx+1)}</td>
    <td style="text-align:right;font-weight:bold;white-space:nowrap;padding:4px 8px">${esc(s.name)}</td>
    ${tds}
    <td style="font-weight:bold;color:#1a8f55">${fa(l4)}</td>
    <td style="font-weight:bold;color:#3f8f2a">${fa(l3)}</td>
    <td style="font-weight:bold;color:#b26a00">${fa(l2)}</td>
    <td style="font-weight:bold;color:#c0262c">${fa(l1)}</td>
    ${cfg.att!=='none'?`<td style="font-weight:bold;color:${abs?'#c0262c':'#888'}">${fa(abs)}</td>`:''}
    <td style="font-weight:bold">${fa(tot)}</td>
  </tr>`;
 }).join('');

 win.document.open();
 win.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
 <title>گزارش دفتر روزانه معلم — ${title}</title>
 <style>
  @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Regular.ttf')});font-weight:400}
  @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Bold.ttf')});font-weight:700 900}
  @page{size:A4 ${isLandscape?'landscape':'portrait'};margin:${isLandscape?'8mm':'10mm'}}
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;color:#1e293b;margin:0;font-size:10.5px;line-height:1.6}
  .rep-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #334155;padding-bottom:6px;margin-bottom:8px}
  .rep-header h1{font-size:15px;margin:0 0 2px;color:#0f172a}
  .rep-meta{font-size:10px;color:#475569;display:flex;gap:14px}
  table{width:100%;border-collapse:collapse;margin-top:6px;font-size:10px}
  th,td{border:1px solid #cbd5e1;padding:4px;text-align:center}
  thead th{background:#f1f5f9;color:#0f172a;font-weight:bold}
  tbody tr:nth-child(even){background:#f8fafc}
  .legend{display:flex;gap:12px;font-size:9.5px;color:#475569;margin-top:8px}
  .legend i{font-style:normal;font-weight:900;padding:1px 5px;border-radius:4px;margin-left:2px}
  .sign{display:flex;justify-content:space-around;margin-top:24px;font-size:11px;font-weight:bold}
  .sign span{border-top:1px solid #64748b;padding:6px 28px 0}
  .noprint{text-align:center;margin:16px}@media print{.noprint{display:none}}
 </style></head><body>
 <div class="rep-header">
  <div>
   <h1>دفتر روزانه معلم — گزارش ارزشیابی توصیفی و فعالیت‌های کلاسی</h1>
   <div class="rep-meta">
     <span>آموزشگاه: <b>${esc(schoolName)}</b></span>
     <span>پایه/کلاس: <b>${esc(gradeName)}</b></span>
     <span>آموزگار: <b>${esc(teacherName)}</b></span>
   </div>
  </div>
  <div style="text-align:left;font-size:10px;color:#475569">
   <div><b>دوره:</b> ${esc(title)}</div>
   <div><b>تاریخ چاپ:</b> ${esc(dshort(today))}</div>
  </div>
 </div>

 <table>
  <thead>
    <tr>
      <th style="width:28px">ردیف</th>
      <th style="min-width:110px">نام و نام خانوادگی دانش‌آموز</th>
      ${colHeaders}
      ${summaryHeaders}
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
 </table>

 <div class="legend">
  <span><i style="background:#1a8f55;color:#fff">خ خ</i> خیلی خوب</span>
  <span><i style="background:#55b043;color:#fff">خ</i> خوب</span>
  <span><i style="background:#e2a300;color:#fff">ق ق</i> قابل قبول</span>
  <span><i style="background:#d9363e;color:#fff">ن ت</i> نیاز به تلاش بیشتر</span>
  <span><i style="background:#1a8f55;color:#fff">✓</i> انجام شد</span>
  <span><i style="background:#d9363e;color:#fff">✗</i> انجام نشد</span>
  ${cfg.att!=='none'?'<span><i style="background:#fde7e8;color:#c0262c">غ</i> غایب</span>':''}
 </div>

 <div class="sign">
  <span>نام و امضای آموزگار: ${esc(teacherName)}</span>
  <span>مهر و امضای مدیریت دبستان</span>
 </div>

 <div class="noprint">
  <button style="padding:8px 18px;font:bold 13px Vazirmatn,Tahoma,sans-serif;background:#2563eb;color:#fff;border:0;border-radius:8px;cursor:pointer" onclick="window.print()">🖨️ چاپ / ذخیره به‌صورت PDF</button>
 </div>
 </body></html>`);
 win.document.close();
 setTimeout(()=>{try{win.focus();win.print();}catch(e){}},700);
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
 else if(c==='goday'){st.k=x;st.b=null;st.item=null;st.note=null;st.pick=new Set();st.cal=null}
 else if(c==='item'){st.item=x;st.note=null;st.pick=new Set()}
 else if(c==='manual'){const d=D();let n=1;while(d.ses[sesKey(k,'m'+n)])n++;const b='m'+n;d.ses[sesKey(k,b)]={c:(courses()[0]||{}).id,tp:'',nt:''};save();st.b=b;st.item=null}
 else if(c==='skip'){const s=ensureSes(k,st.b);if(s.st==='skip')delete s.st;else s.st='skip';save()}
 else if(c==='skipall'){journalPendingDays(7).forEach(p=>{const info=dayJournalStatus(p.k);const bls=dayBells(p.k);bls.forEach(b=>{const s=ensureSes(p.k,b.b);s.st='skip';});});save()}
 else if(c==='mxmode')st.mx.m=x==='month'?'month':'week';
 else if(c==='mxprev'||c==='mxnext')mxShift(c==='mxnext'?1:-1);
 else if(c==='mxnow')st.mx.k=null;
 else if(c==='mxprint'){printMatrix();return}
 else if(c==='teacherreport'){st.repModal={period:'month',att:'inline',course:st.mx.c||'all'};render();return}
 else if(c==='closerepmodal'){st.repModal=null;render();return}
 else if(c==='repmodperiod'){if(st.repModal){st.repModal.period=x;render();return}}
 else if(c==='repmodatt'){if(st.repModal){st.repModal.att=x;render();return}}
 else if(c==='doreport'){printTeacherJournalReport();st.repModal=null;render();return}
 else if(c==='pendall')st.pendAll=!st.pendAll;
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
 if(t.hasAttribute('data-mxc')){st.mx.c=t.value;render();return}
 if(t.hasAttribute('data-repmodcourse')){if(st.repModal){st.repModal.course=t.value;}return}
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
window.djApi={summary,pending,pendingDays:journalPendingDays,dayStatus:dayJournalStatus,open:(k,b)=>{st.keep=true;if(k)st.k=k;st.b=b!=null?String(b):null;st.item=null;st.note=null;st.pick=new Set();show('dj')}};

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
 sm.insertAdjacentHTML('beforebegin',`<div class="card" id="djHome"><b>📓 دفتر روزانه</b><div style="font-size:13px;margin-top:6px">${cur?`زنگ جاری: <b>${esc(cur.name)}</b> `:''}${p.length?`· ${fa(p.length)} دفتر روزانه ثبت‌نشده یا ناقص در ۳ روز اخیر`:'· همه‌چیز ثبت شده'}</div>
 ${cur?`<button class="dj-hb" data-djh="${t}:${cur.i}">ثبت همین زنگ</button>`:''}<button class="dj-hb" data-djh="open">باز کردن دفتر</button></div>`)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-djh]');if(!t)return;const v=t.dataset.djh;if(v==='open'){const f=pending(3)[0];djApi.open(f?f.k:todayK(),f?f.b:null)}else{const a=v.split(':');djApi.open(a[0],a[1])}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&st.cal){st.cal=null;render()}});
const _show=window.show;window.show=function(id){const r=_show.apply(this,arguments);try{if(id==='dj'){if(!st.keep){st.k=todayK();st.b=null;st.item=null;st.note=null;st.pick=new Set();st.tpl=false}st.keep=false;render()}else if(id==='home')homeCard()}catch(e){console.warn('dj',e)}return r};
try{const h=$('home');if(h&&h.classList.contains('on'))homeCard()}catch(e){}
}catch(e){console.error('daily-journal',e)}})();

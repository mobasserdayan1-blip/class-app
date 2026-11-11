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
/* تبدیل ISO ↔ شمسی: اول JDate، با فال‌بک کامل به Intl */
function jparts(k){
  try{if(window.JDate)return window.JDate.toJ(k)}catch(e){}
  try{
    const parts={};
    new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'})
      .formatToParts(new Date(k+'T12:00:00Z'))
      .forEach(p=>{
        if(p.type==='year'||p.type==='relatedYear')parts.y=+p.value;
        else if(p.type==='month')parts.m=+p.value;
        else if(p.type==='day')parts.d=+p.value;
      });
    return parts;
  }catch(e){return {y:1405,m:8,d:13}}
}
function jiso(y,m,d){
  try{if(window.JDate)return window.JDate.toIso(y,m,d)}catch(e){}
  return null;
}
function jlen(y,m){
  try{if(window.JDate)return window.JDate.monthLen(y,m)}catch(e){}
  return m<=6?31:m<=11?30:29;
}
/* سال تحصیلی: مهر تا خرداد */
const isAcademicMonth=m=>m>=7||m<=3;
const dlab=k=>{try{const p=jparts(k);if(p&&p.y&&JMN[p.m-1])return WDN[dow(k)]+' '+fa(p.d)+' '+JMN[p.m-1]+' '+fa(p.y)}catch(e){}return fmtP(k,{weekday:'long',day:'numeric',month:'long',year:'numeric'})};
const nowM=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const tmin=s=>{const a=String(s||'0:0').split(':').map(Number);return(a[0]||0)*60+(a[1]||0)};
/* تعطیل هفتگی فقط طبق «روزهای کاری مدرسه» (S.wk)؛ تنظیم‌نشده = هیچ روزی تعطیل فرض نمی‌شود */
const wkApi=()=>window.schoolDays||null;
const wkOff=k=>{try{const w=wkApi();return !!w&&w.isSchoolDay(k)===false}catch(e){return false}};
const wkSet=()=>{try{const w=wkApi();return !!w&&w.configured()}catch(e){return false}};
const dstat=k=>{try{return typeof window.dayStatus==='function'?window.dayStatus(k):null}catch(e){return null}};
const isOff=k=>{{const ds=dstat(k);if(ds)return ds.off===true}if(wkOff(k))return true;if(S.closed&&S.closed[k])return true;try{if(typeof window.dayType==='function'&&window.dayType(k).kind!=='work')return true}catch(e){}return false};
const D=()=>{S.dj=S.dj||{};const o=S.dj;o.tpl=o.tpl||{};o.ses=o.ses||{};o.m=o.m||{};o.n=o.n||{};o.pm=o.pm||{};if(!o.pm1)pnMigrate(o);return o};
/* cl-v170: برای هر دانش‌آموز در هر فعالیت فقط «یک» مثبت یا «یک» منفی؛ داده‌های قدیمیِ چندتایی به همان یک وضعیت تبدیل می‌شوند (بیشتر بودن مثبت/منفی؛ در تساوی مثبت) */
function pnOne(q){q=q||[0,0];const p=+q[0]||0,n=+q[1]||0;return !p&&!n?[0,0]:(p>=n?[1,0]:[0,1])}
function pnMigrate(o){try{Object.keys(o.pm||{}).forEach(key=>{const pm=o.pm[key];if(!pm)return;o.m[key]=o.m[key]||{};Object.keys(pm).forEach(sid=>{const c=pnOne(pm[sid]);if(!c[0]&&!c[1]){delete pm[sid];return}pm[sid]=c;o.m[key][sid]=c[0]?4:1});if(!Object.keys(pm).length)delete o.pm[key]});o.pm1=1}catch(e){console.warn('pnMigrate',e)}}
const save=()=>{try{if(typeof window.save==='function')window.save();else if(typeof S!=='undefined'&&S)localStorage.setItem('cl1',JSON.stringify(S))}catch(e){console.warn('dj save',e)}};
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
const sts=()=>sortStudentsByFamily(S.students||[]);
function splitLastName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "", last: parts[0] || "" };
  const prefixes = ["سید", "سیده", "میر", "حاج", "حاجی", "شیخ"];
  let startIdx = 0;
  if (prefixes.includes(parts[0]) && parts.length > 2) {
    startIdx = 1;
  }
  const first = parts.slice(0, startIdx + 1).join(" ");
  const last = parts.slice(startIdx + 1).join(" ");
  return { first, last };
}
function sortStudentsByFamily(list) {
  return [...list].sort((a, b) => {
    const na = typeof a === "string" ? a : (a && a.name) || "";
    const nb = typeof b === "string" ? b : (b && b.name) || "";
    const sa = splitLastName(na);
    const sb = splitLastName(nb);
    const cmp = sa.last.localeCompare(sb.last, "fa");
    return cmp !== 0 ? cmp : sa.first.localeCompare(sb.first, "fa");
  });
}

const absent=(k,sid)=>((S.att||{})[k]||{})[sid]==='a';
const late=(k,sid)=>((S.att||{})[k]||{})[sid]==='l';
/* ───── حضور و غیاب زنگ‌به‌زنگ (ماژول bell-attendance.js؛ داده‌ی S.bat) ─────
   وضعیت هر زنگ: p حاضر · a غایب · o خروج با اجازه · r بازگشت. اگر ماژول نباشد همه‌چیز مثل قبل (فقط وضعیت کل روز) است.
   خروج/غیبت یک زنگ هیچ ثبت قبلی را پاک نمی‌کند؛ فقط همان زنگ را «غیرقابل ثبت» می‌کند (نه صفر، نه منفی). */
const bst=(k,b,sid)=>{try{return window.BellAtt?window.BellAtt.get(k,b,sid):(absent(k,sid)?'a':'p')}catch(e){return absent(k,sid)?'a':'p'}};
const absentB=(k,b,sid)=>{if(absent(k,sid))return true;const v=bst(k,b,sid);return v==='a'||v==='o'};
const outB=(k,b,sid)=>{if(absent(k,sid))return false;const v=bst(k,b,sid);return v==='a'||v==='o'};
const presNB=(k,b)=>sts().filter(s=>!absentB(k,b,s.id)).length;

/* سطح‌های ارزشیابی توصیفی */
const LV=[{v:4,s:'خیلی خوب',t:'خیلی خوب',c:'#1a8f55'},{v:3,s:'خوب',t:'خوب',c:'#3f8f2a'},{v:2,s:'قابل قبول',t:'قابل قبول',c:'#b26a00'},{v:1,s:'نیاز به تلاش بیشتر',t:'نیاز به تلاش بیشتر',c:'#c0262c'}];
/* فعالیت‌های پیش‌فرض هر درس (قابل ویرایش و جایگزینی توسط معلم)؛ نوع: g = چهار سطحی ، d = انجام شد/نشد ، سومین مقدار = تکلیف */
const DEF=[
['قرآن',[['روان‌خوانی قرآن','g'],['روخوانی آیات','g'],['صحیح‌خوانی و رعایت قواعد','g'],['حفظ سوره یا آیات','p'],['مشارکت در فعالیت قرآنی','g']]],
['ریاضی',[['حل تمرین کتاب','d',1],['حل مسئله','g'],['فعالیت روی تخته','g'],['انجام تمرین در دفتر','d',1],['درک مفاهیم','g'],['مشارکت در فعالیت گروهی','g']]],
['فارسی',[['روخوانی فارسی','g'],['روان‌خوانی','g'],['املا','g'],['انشا','g'],['جمله‌سازی','g'],['درک مطلب','g'],['نگارش','g'],['حفظ شعر','p']]],
['املا',[['املا تقریری','g'],['املا تخته‌ای','g'],['تصحیح همسالان','g'],['املا آموزشی و خلاق','g'],['واژه‌آموزی و املا','g']]],
['انشا',[['بندنویسی موضوعی','g'],['خاطره‌نویسی و توصیف','g'],['نگارش خلاق','g'],['بازنویسی حکایت و ضرب‌المثل','g'],['تصویرخوانی و نگارش','g']]],
['نگارش',[['آموزش مهارت نگارش','g'],['فعالیت کتاب نگارش','d',1],['رعایت علائم نگارشی','g'],['درست‌نویسی و خوش‌نویسی','g']]],
['علوم',[['فعالیت عملی','g'],['آزمایش','g'],['پاسخ به پرسش‌ها','p'],['مشارکت در بحث','p'],['انجام فعالیت کتاب','d'],['درک مفاهیم درس','g']]],
['اجتماع',[['پرسش شفاهی','p'],['پاسخ به سؤالات کتاب','p'],['فعالیت گروهی','g'],['خلاصه‌نویسی','g'],['ارزشیابی از محتوای درس','g']]],
['هدیه',[['مشارکت در گفت‌وگو','p'],['حفظ آیه یا ذکر','p'],['انجام فعالیت کتاب','d'],['رعایت آداب','g']]],
['هنر',[['فعالیت عملی هنری','g'],['خلاقیت','g'],['تحویل کار','d']]],
['تربیت',[['مشارکت در فعالیت ورزشی','g'],['انجام حرکات','g'],['رعایت نظم و قوانین','g']]]];
const GEN=[['مشارکت در کلاس','g'],['پاسخ به پرسش','g'],['انجام فعالیت','d']];
function defOf(cid){const n=cname(cid);const f=DEF.find(x=>n.includes(x[0]));return(f?f[1]:GEN).map((r,i)=>({id:'i'+i,n:r[0],t:r[1],hw:r[2]?1:0}))}
/* مهاجرت یک‌باره: افزودن «انشا» به قالب‌های ویرایش‌شده‌ی درس فارسی (فقط یک بار؛ اگر معلم بعداً حذفش کرد برنمی‌گردد) */
function migrateEnsha(){try{const d=D();if(d.ensha1)return;Object.keys(d.tpl).forEach(cid=>{const t=d.tpl[cid];if(!Array.isArray(t))return;const n=cname(cid)||'';if(n.includes('فارسی')&&!t.some(x=>String(x.n||'').includes('انشا')))t.push({id:'i_ensha',n:'انشا',t:'g',hw:0})});d.ensha1=1;save()}catch(e){}}
const tplOf=cid=>{const t=D().tpl[cid];return Array.isArray(t)?t:defOf(cid)};
function ownTpl(cid){const d=D();if(!Array.isArray(d.tpl[cid]))d.tpl[cid]=defOf(cid);return d.tpl[cid]}

/* برنامه‌ی هفتگی: زنگ‌های درسیِ یک تاریخ (فقط خواندن) */
/* تاریخچه‌ی برنامه‌ی هفتگی: تا قبل از این نسخه، همه‌ی روزها با «برنامه‌ی فعلی» ساخته می‌شدند؛ یعنی اگر برنامه بعداً عوض می‌شد، زنگ‌های روزهای گذشته هم عوض می‌شد.
   حالا هر بار برنامه تغییر کند، نسخه‌ی قبلی تا «دیروزِ روز تغییر» نگه داشته می‌شود (S.wscHist) و روزهای قدیمی‌تر با همان نسخه ساخته می‌شوند. */
function wscSigOf(w){try{return JSON.stringify({c:w.cell||{},n:w.n||0,k:(w.kinds||[]).map(q=>[q.id,q.cn||''])})}catch(e){return''}}
function wscTrack(){try{const w=S.wsc;if(!w||typeof w!=='object'||!w.cell)return;const sig=wscSigOf(w);if(S.wscSig===sig)return;
 if(S.wscSig&&S.wscSnap){S.wscHist=Array.isArray(S.wscHist)?S.wscHist:[];S.wscHist.push({until:addD(todayK(),-1),w:S.wscSnap,at:todayK()});if(S.wscHist.length>40)S.wscHist.shift()}
 S.wscSnap=JSON.parse(JSON.stringify({cell:w.cell,n:w.n,per:w.per,kinds:w.kinds||[]}));S.wscSig=sig;save()}catch(e){}}
window.djWscTrack=wscTrack;
function wscFor(k){const H=S.wscHist;if(Array.isArray(H)&&H.length){const c=H.filter(x=>x&&x.until&&x.w&&String(k)<=String(x.until)).sort((a,b)=>String(a.until)<String(b.until)?-1:1)[0];if(c)return c.w}return S.wsc}
function bells(k){const w=wscFor(k);if(!w||typeof w!=='object'||!w.cell||isOff(k))return[];const di=dow(k);if(di>4)return[];
 const n=Math.max(1,Math.min(10,w.n||(w.per||[]).length||4)),out=[];
 for(let i=0;i<n;i++){const v=w.cell[di+'_'+i];if(v==null||v==='')continue;
  const cids=[];(Array.isArray(v)?v:[v]).map(x=>x&&typeof x==='object'?x:{c:x}).forEach(x=>{
   if(x.c!=null){if(courseBy(x.c))cids.push(x.c)}
   else if(x.k!=null){const kd=(w.kinds||[]).find(q=>q.id===x.k);if(kd&&kd.cn){const c=courses().find(q=>q.name===kd.cn);if(c)cids.push(c.id)}}});
  if(cids.length)out.push({i:String(i),s:(w.per&&w.per[i]&&w.per[i].s)||'',cids:[...new Set(cids)]})}
 return out}
/* نام مدرسه/آموزگار/پایه از «تنظیمات ← مشخصات» (S.prof) */
function profInfo(){const P=(typeof S!=='undefined'&&S&&(S.prof||S.profile))||{};let sc='';try{sc=P.school?(typeof window.schoolFull==='function'?window.schoolFull(P):P.school):''}catch(e){sc=P.school||''}
 return{school:sc||'دبستان',teacher:String(P.teacher||'').trim(),principal:String(P.principal||'').trim(),sigT:P.sigT||'',sigP:P.sigP||'',grade:String(P.grade||'').trim(),sec:String(P.sec||'').trim()}}
/* بلوک امضا: «آموزگار: نام + امضا» و «مدیریت: نام مدیر + امضا» (نام‌ها و تصویر امضا از تنظیمات خوانده می‌شود) */
const SIGN_CSS='.sign{display:flex;justify-content:space-around;align-items:flex-start;gap:28px;margin-top:22px;font-size:11px;page-break-inside:avoid}.sign .sg-c{flex:1;text-align:center}.sign .sg-l{font-weight:800}.sign .sg-i{height:54px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #64748b;margin:2px 14px 0}.sign .sg-i img{max-height:50px;max-width:160px;object-fit:contain}';
function signHtml(){const PI=profInfo(),col=(l,n,im)=>`<div class="sg-c"><div class="sg-l">${l}: <span>${esc(n||'……………………')}</span></div><div class="sg-i">${im?`<img src="${im}" alt="">`:''}</div></div>`;return col('آموزگار',PI.teacher,PI.sigT)+col('مدیریت',PI.principal,PI.sigP)}
const sesKey=(k,b)=>k+'|'+b;
const getSes=(k,b)=>D().ses[sesKey(k,b)]||null;
function ensureSes(k,b){const d=D(),key=sesKey(k,b);if(!d.ses[key]){const bl=bells(k).find(x=>x.i===String(b));d.ses[key]={c:bl?bl.cids[0]:(courses()[0]||{}).id,tp:'',nt:''}}return d.ses[key]}
function dayBells(k){const L=bells(k).map(x=>({b:x.i,s:x.s,cids:x.cids,man:false}));const d=D();
 Object.keys(d.ses).forEach(key=>{if(key.indexOf(k+'|')!==0)return;const b=key.slice(k.length+1);if(!L.some(x=>x.b===b)){const s=d.ses[key];L.push({b,s:'',cids:[s.c],man:true})}});
 return L.sort((a,b)=>(a.man-b.man)||(+String(a.b).replace(/\D/g,'')||0)-(+String(b.b).replace(/\D/g,'')||0))}
const bellName=(k,x)=>{const s=getSes(k,x.b);const c=s?[s.c]:x.cids;const nm=specialKind(k,x.b)||c.map(cname).join(' + ');return(x.man?(String(x.b).charAt(0)==='m'?'زنگ دستی':'زنگ '+(ORD[+x.b]||'')):'زنگ '+ORD[+x.b])+' · '+nm}
/* فعالیت‌هایی که در این زنگ سابقه دارند اما بعداً از فهرست پیشنهادی حذف شده‌اند همچنان با نام و نوعِ ثبت‌شده (Snapshot) نمایش داده می‌شوند */
function itemsOf(s){if(!s)return[];const t=tplOf(s.c),ids=new Set(t.map(x=>x.id));const old=Object.keys(s.it||{}).filter(id=>!ids.has(id)&&s.it[id]).map(id=>({id,n:s.it[id].n,t:s.it[id].t==='d'?'d':(s.it[id].t==='p'?'p':'g'),hw:s.it[id].hw?1:0,old:1}));const ov=x=>{const r=s.it&&s.it[x.id];return(r&&r.t)?Object.assign({},x,{t:r.t==='d'?'d':(r.t==='p'?'p':'g'),hw:r.t==='p'?0:(r.hw?1:0)}):x};
 return t.map(ov).concat(old)}
const cnt=(k,b,id)=>Object.keys(D().m[k+'|'+b+'|'+id]||{}).filter(sid=>!absentB(k,b,+sid)).length;
const presN=k=>sts().filter(s=>!absent(k,s.id)).length;
function stat(k,b){const s=getSes(k,b);if(s&&s.st==='skip')return'skip';const ids=Object.keys((s&&s.it)||{});if(!ids.length)return'none';const p=presNB(k,b);return ids.every(id=>cnt(k,b,id)>=p)?'full':'part'}
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
 if(it.t==='p')return false;/* فعالیت مثبت/منفی فقط با setPN ثبت می‌شود */
 s.it=s.it||{};if(!s.it[id])s.it[id]={n:it.n,t:it.t,hw:it.hw?1:0};
 const d=D(),key=k+'|'+b+'|'+id,m=d.m[key]=d.m[key]||{};
 sids.forEach(sid=>{if(toggle&&m[sid]===val)delete m[sid];else m[sid]=val});
 if(!Object.keys(m).length)delete d.m[key];
 if(s.st==='skip')delete s.st;
 syncHw(k,b,id,s);save();return true}

/* ───── ارزشیابی «مثبت / منفی» (پاسخ‌دهی دانش‌آموز) ─────
   هر بار پاسخ درست/مشارکت = یک «مثبت»، پاسخ نادرست/نداشتن آمادگی = یک «منفی».
   شمارش‌ها در S.dj.pm['تاریخ|زنگ|فعالیت'][شناسه] = [مثبت، منفی] نگه‌داری می‌شوند و
   سطح معادل (۴ تا ۱) هم در S.dj.m نوشته می‌شود تا جدول عملکرد، پرونده‌ی دانش‌آموز و گزارش‌ها بدون تغییر کار کنند.
   مثبت‌ها و منفی‌ها در «ارزشیابی مستمر» (ACTX.oral در activities.js) هم محاسبه می‌شوند. */
function pLevel(p,n){const t=p+n;if(!t)return null;const r=p/t;return r>=.8?4:r>=.6?3:r>=.4?2:1}
const PN_HINT=/حفظ|شفاهی|گفت‌وگو|گفتگو|بحث|پرسش|پاسخ|مشارکت|مطالعات|ذکر/;
function setPN(k,b,id,sid,dp,dn,reset){
 if(k>todayK()){flash('برای تاریخ آینده نمی‌شود ثبت کرد');return false}
 if(!offGuard(k))return false;
 const s=ensureSes(k,b),it=itemsOf(s).find(x=>x.id===id);if(!it||it.t!=='p')return false;
 s.it=s.it||{};if(!s.it[id])s.it[id]={n:it.n,t:'p',hw:0};
 const d=D(),key=k+'|'+b+'|'+id,pm=d.pm[key]=d.pm[key]||{},m=d.m[key]=d.m[key]||{};
 const cur=pnOne(pm[sid]);let c;
  if(reset||dp<0||dn<0)c=[0,0];
  else if(dp>0)c=cur[0]?[0,0]:[1,0];
  else if(dn>0)c=cur[1]?[0,0]:[0,1];
  else c=cur;
 if(c[0]+c[1]===0){delete pm[sid];delete m[sid]}else{pm[sid]=c;m[sid]=pLevel(c[0],c[1])}
 if(!Object.keys(pm).length)delete d.pm[key];
 if(!Object.keys(m).length)delete d.m[key];
 if(s.st==='skip')delete s.st;
 save();return true}
/* مجموع مثبت/منفی‌های یک دانش‌آموز (برای ارزشیابی مستمر) */
function oralOf(sid){const d=D();let p=0,n=0;Object.keys(d.pm||{}).forEach(key=>{const q=d.pm[key][sid];if(!q)return;const kk=key.split('|'),ss=d.ses[kk[0]+'|'+kk[1]];if(!ss||!(ss.it||{})[kk[2]])return;const o1=pnOne(q);p+=o1[0];n+=o1[1]});return{p,n}}
/* انتقال یک فعالیت (با همه‌ی نمره‌ها، شمارش‌ها، یادداشت‌ها و تکلیف) به زنگ دیگر؛ برای اینکه عوض‌کردن درس یک فعالیت، فعالیت‌های دیگر آن زنگ را تغییر ندهد */
function moveItem(k,b0,b1,id){
 const d=D(),s0=d.ses[sesKey(k,b0)],s1=d.ses[sesKey(k,b1)];if(!s0||!s1||!s0.it||!s0.it[id])return;
 s1.it=s1.it||{};s1.it[id]=s0.it[id];delete s0.it[id];
 const o=k+'|'+b0+'|'+id,nw=k+'|'+b1+'|'+id;
 if(d.m[o]){d.m[nw]=d.m[o];delete d.m[o]}
 if(d.pm[o]){d.pm[nw]=d.pm[o];delete d.pm[o]}
 Object.keys(d.n||{}).forEach(nk=>{if(nk.indexOf(o+'|')===0){d.n[nw+nk.slice(o.length)]=d.n[nk];delete d.n[nk]}});
 S.hwl=S.hwl||[];const hi=S.hwl.findIndex(h=>h.id==='dj:'+o);if(hi>=0){S.hwl[hi].id='dj:'+nw;S.hwl[hi].course=s1.c}}

const ACT_TYPES=[
  'تدریس',
  'پرسش و پاسخ',
  'تمرین',
  'حل مسئله',
  'املا',
  'انشا و نگارش',
  'روخوانی',
  'فعالیت گروهی',
  'فعالیت عملی',
  'ارزشیابی',
  'رفع اشکال',
  'مرور درس',
  'سایر'
];

const COURSE_SUBS={
  'فارسی':['روان‌خوانی','املا','انشا','نگارش','واژه‌آموزی','درک مطلب','دستور زبان','حفظ شعر'],
  'املا':['املا تقریری','املا تخته‌ای','تصحیح همسالان','املا آموزشی و خلاق','واژه‌آموزی و املا'],
  'انشا':['بندنویسی موضوعی','خاطره‌نویسی و توصیف','نگارش خلاق','بازنویسی ضرب‌المثل','تصویرخوانی'],
  'نگارش':['آموزش مهارت نگارش','فعالیت کتاب نگارش','رعایت علائم نگارشی','درست‌نویسی و خوش‌نویسی'],
  'ریاضی':['حل مسئله','هندسه','محاسبات و عددنویسی','کارگاه ریاضی','تمرین در دفتر','درک مفاهیم'],
  'علوم':['فعالیت عملی و آزمایش','مشاهده و کاوشگری','پاسخ به پرسش‌ها','مشارکت در بحث','فعالیت کتاب'],
  'قرآن':['روخوانی و روان‌خوانی','پیام قرآنی','حفظ سوره و آیات','صحیح‌خوانی قواعد','انس با قرآن'],
  'اجتماع':['پرسش شفاهی','فعالیت گروهی','خلاصه‌نویسی','بررسی کتاب'],
  'هدیه':['گفت‌وگو و تفکر','حفظ آیه یا ذکر','رعایت آداب اسلامی','فعالیت کتاب'],
  'هنر':['فعالیت عملی هنری','کاردستی و حجم‌سازی','خلاقیت','خوش‌نویسی و خط'],
  'تربیت':['مهارت‌های حرکتی','ورزش و بازی گروهی','نظم و آمادگی جسمانی']
};
/* نوع فعالیت/ارزشیابی: انواع تدریس + همان انواع ارزشیابی «درس‌ها و آزمون‌ها» (window.EVAL_TYPES) */
function cgOptions(){const ev=Array.isArray(window.EVAL_TYPES)?window.EVAL_TYPES:[];const base=ACT_TYPES.filter(x=>x!=='ارزشیابی');return[...new Set([...base,...ev])]}
function getCourseSubs(cnameStr){
  const found=Object.keys(COURSE_SUBS).find(k=>cnameStr.includes(k));
  return found?COURSE_SUBS[found]:['عمومی','تمرین','ارزشیابی'];
}

let st={k:todayK(),b:null,item:null,sel:false,pick:new Set(),note:null,tpl:false,keep:false,cal:null,reportPeriod:'week',mx:{m:'week',k:null,c:'all'},cp:{m:'month',k:null},pendAll:false,pendRange:7,pendFilter:'all',actModal:null,repModal:null};
const dshort=k=>{try{const p=jparts(k);if(p&&JMN[p.m-1])return WDN[dow(k)]+' '+fa(p.d)+' '+JMN[p.m-1]}catch(e){}return fmtP(k,{weekday:'short',day:'numeric',month:'long'})};
function viewSes(k,b){const s=getSes(k,b);if(s)return s;const bl=bells(k).find(x=>x.i===String(b));return bl?{c:bl.cids[0],tp:'',nt:''}:null}
function flash(msg){let t=$('djFl');if(t)t.remove();t=document.createElement('div');t.id='djFl';t.className='dj-fl';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{if(t.parentNode)t.remove()},2300)}

/* انتخاب زنگ پیش‌فرض */
function pickDefault(){const k=st.k,L=dayBells(k);if(!L.length){st.b=null;return}
 if(L.some(x=>x.b===st.b))return;
 let b=null;if(k===todayK()&&window.wscApi&&wscApi.now){try{const n=wscApi.now();if(n&&L.some(x=>x.b===String(n.i)))b=String(n.i)}catch(e){}}
 if(b==null){const f=L.find(x=>stat(k,x.b)!=='full'&&stat(k,x.b)!=='skip');b=(f||L[0]).b}
 st.b=b;st.item=null;st.note=null;st.pick=new Set()}

/* ───── تشخیص واقعی وضعیت ۸ گانه دفتر روزانه (مستقل از برنامه‌ی هفتگی) ─────
   وضعیت‌ها:
   - 'none': ثبت‌نشده (روز فعال مدرسه بدون هیچ فعالیت ثبت‌شده در پایگاه داده)
   - 'part': ناقص (روز دارای فعالیت ولی فاقد شرایط تکمیل؛ همراه با علت دقیق)
   - 'full': تکمیل‌شده (روز دارای فعالیت‌های با ارزشیابی کامل)
   - 'official_holiday': تعطیل رسمی (تعطیل رسمی کشور)
   - 'weekly_off': تعطیل هفتگی (تعریف‌شده در تنظیمات مدرسه)
   - 'school_holiday': تعطیلی اختصاصی (تعطیلی ثبت‌شده توسط مدرسه)
   - 'emergency_closure': تعطیلی اضطراری (تعطیلی به علت شرایط اضطراری)
   - 'unknown': نامشخص (نبود اطلاعات معتبر روزهای کاری)
*/
function dayJournalStatus(k){
  const ds=dstat(k);
  if(ds){
    if(ds.status==='emergency_closure'){
      return {status:'emergency_closure', label:'تعطیلی اضطراری', color:'#c0262c', badge:'🚨 تعطیلی اضطراری', reason:ds.reason||ds.label||'تعطیلی اضطراری', actCount:0, evalCount:0, off:true};
    }
    if(ds.status==='school_holiday'){
      return {status:'school_holiday', label:'تعطیلی اختصاصی', color:'#d97706', badge:'🏫 تعطیلی اختصاصی', reason:ds.reason||ds.label||'تعطیلی اختصاصی مدرسه', actCount:0, evalCount:0, off:true};
    }
    if(ds.status==='official_holiday'){
      return {status:'official_holiday', label:'تعطیل رسمی', color:'#dc2626', badge:'🔴 تعطیل رسمی', reason:ds.label||'تعطیل رسمی کشور', actCount:0, evalCount:0, off:true};
    }
    if(ds.status==='weekly_off'){
      return {status:'weekly_off', label:'تعطیل هفتگی', color:'#64748b', badge:'🏖️ تعطیل هفتگی', reason:ds.label||'تعطیل هفتگی طبق تنظیمات مدرسه', actCount:0, evalCount:0, off:true};
    }
    if(ds.status==='unknown'){
      return {status:'unknown', label:'نامشخص', color:'#8a94a6', badge:'⚪ وضعیت نامشخص', reason:ds.unknownWhy||'وضعیت روز نامشخص (نیاز به تنظیم روزهای کاری)', actCount:0, evalCount:0, off:null};
    }
  }else if(isOff(k)){
    return {status:'off', label:'تعطیل', color:'#a8101a', badge:'🔴 تعطیل', reason:'روز تعطیل', actCount:0, evalCount:0, off:true};
  }

  // روز کاری فعال
  const d=D();
  const datePrefix=k+'|';
  const mKeys=Object.keys(d.m||{}).filter(x=>x.indexOf(datePrefix)===0);
  const sesKeys=Object.keys(d.ses||{}).filter(x=>x.indexOf(datePrefix)===0);

  const actIds=new Set();
  mKeys.forEach(key=>{
    const p=key.split('|');
    actIds.add(p[1]+'|'+p[2]);
  });
  sesKeys.forEach(sKey=>{
    const s=d.ses[sKey];
    if(s&&s.it){
      Object.keys(s.it).forEach(itId=>{
        actIds.add(sKey.slice(k.length+1)+'|'+itId);
      });
    }
  });

  const actCount=actIds.size;
  if(actCount===0){
    return {status:'none', label:'ثبت‌نشده', color:'#8a94a6', badge:'⚪ ثبت‌نشده', reason:'هنوز هیچ فعالیتی برای این روز ثبت نشده است', actCount:0, evalCount:0, off:false};
  }

  const pn=presN(k);
  let totalEvaluated=0, fullActs=0;
  actIds.forEach(actKey=>{
    const fullKey=k+'|'+actKey;
    const marks=d.m[fullKey]||{};
    const count=Object.keys(marks).filter(sid=>!absent(k,+sid)).length;
    totalEvaluated+=count;
    if(pn>0&&count>=pn) fullActs++;
  });

  if(actCount>0&&(fullActs>=1||(pn>0&&totalEvaluated>=pn*0.75))){
    return {status:'full', label:'تکمیل‌شده', color:'#1a8f55', badge:'✅ تکمیل‌شده', reason:'فعالیت‌های روز به طور کامل ثبت و ارزشیابی شده‌اند', actCount, evalCount:totalEvaluated, off:false};
  }

  const reason=(pn>0&&totalEvaluated<pn)?`ارزشیابی ناتمام (${fa(totalEvaluated)} از ${fa(pn)} دانش‌آموز حاضر ارزیابی شده‌اند)`:'فعالیت‌های ثبت‌شده فاقد ارزشیابی کامل هستند';
  return {status:'part', label:'ناقص', color:'#d98600', badge:'🟡 ناقص', reason, actCount, evalCount:totalEvaluated, off:false};
}

/* دریافت همه فعالیت‌های آموزشی یک روز */
/* ───── آزمون‌ها: «درس‌ها و آزمون‌ها ← ثبت ارزشیابی یا آزمون» (S.exams) خودکار در دفتر همان روز دیده می‌شوند؛ منبع داده یکی است (بدون کپی) ───── */
const examsOn=k=>(Array.isArray(S.exams)?S.exams:[]).filter(e=>e&&e.date===k);
const examName=e=>String(e.type||'آزمون')+(e.title?' — '+e.title:'');
function examLevel(e,sid){try{const v=typeof nrm==='function'?nrm(e,sid):null;if(v==null||isNaN(v))return null;return Math.max(1,Math.min(4,Math.round(v)))}catch(x){return null}}
function examMk(e){const m={};sts().forEach(s0=>{const l=examLevel(e,s0.id);if(l!=null)m[s0.id]=l});return m}
/* ───── آزمون جبرانی در دفتر روزانه ─────
   منبع داده همان S.exams است (e.mk[sid]=تاریخ جبرانی یا 'x' برای معاف، e.mkEval[sid]=سطح ۱..۴). هیچ داده‌ای کپی نمی‌شود.
   ستون آزمون اصلی: فقط نتیجه‌ی کسانی که با کلاس امتحان داده‌اند؛ غایب‌ها همان‌جا غایب می‌مانند (⏳ منتظر جبرانی / ➖ معاف / ↪ جبرانی داده).
   ستون «جبرانی»: در تاریخ واقعی آزمون جبرانی، با برچسب مشخص. هر نتیجه فقط یک‌بار شمرده می‌شود (یا اصلی یا جبرانی). */
const mkDate=(e,sid)=>{const m=e&&e.mk&&e.mk[sid];return(m&&m!=='x')?m:null};
function examMainMk(e){const m=examMk(e);Object.keys(m).forEach(id=>{if(mkDate(e,id))delete m[id]});return m}
function examMkState(e){const pend={},exempt={},moved={},out={};
 if(!e||e.type==='پرسش و پاسخ کلاسی')return{pend,exempt,moved,out};
 sts().forEach(s0=>{const id=s0.id,md=mkDate(e,id);
  if(md){moved[id]=md;return}
  if(e.mk&&e.mk[id]==='x'){exempt[id]=1;return}
  if(((S.att||{})[e.date]||{})[id]==='a'&&!(e.scores&&e.scores[id]!=null)){pend[id]=1;return}
  try{if(window.BellAtt&&!(e.scores&&e.scores[id]!=null)&&window.BellAtt.outAtExam(e,id))out[id]=1}catch(x){}});
 return{pend,exempt,moved,out}}
function examMkGroups(e){const g={};Object.keys((e&&e.mk)||{}).forEach(id=>{const dd=mkDate(e,id);if(!dd)return;if(!sts().some(q=>String(q.id)===String(id)))return;const l=examLevel(e,id);if(l==null)return;(g[dd]=g[dd]||{})[id]=l});return g}
const mkExamsOn=k=>(Array.isArray(S.exams)?S.exams:[]).filter(e=>e&&e.mk&&Object.keys(examMkGroups(e)).indexOf(k)>=0);
function getDayActivities(k){
  const d=D(), out=[];
  const bellsList=dayBells(k);
  bellsList.forEach(b=>{
    const s=getSes(k,b.b);
    if(s&&s.it){
      Object.keys(s.it).forEach(itId=>{
        const it=s.it[itId];
        const fullKey=k+'|'+b.b+'|'+itId;
        const marks=d.m[fullKey]||{};
        const count=Object.keys(marks).filter(sid=>!absentB(k,b.b,+sid)).length;
        out.push({
          b:b.b,
          itId,
          fullKey,
          courseId:s.c,
          courseName:cname(s.c),
          topic:s.tp||'',
          sub:it.sub||(s.tp?s.tp:'عمومی'),
          n:it.n,
          t:it.t,
          cg:it.cg||(it.t==='d'?'تمرین':'ارزشیابی'),
          d:it.d||'',
          hw:it.hw,
          count,
          session:s,
          item:it
        });
      });
    }
  });
  examsOn(k).forEach(e=>{
    const mk=examMk(e);
    const mm=examMainMk(e);
    out.push({exam:true,b:'exam',itId:'x'+e.id,exId:e.id,fullKey:'exam|'+e.id,courseId:e.course,courseName:cname(e.course),topic:'',
      sub:e.title||'—',n:examName(e),t:'x',cg:e.type||'آزمون',d:'',hw:0,count:Object.keys(mm).length,session:null,item:null});
  });
  mkExamsOn(k).forEach(e=>{
    const g=examMkGroups(e)[k]||{};
    out.push({exam:true,mkc:true,b:'examMk',itId:'x'+e.id+'m',exId:e.id,fullKey:'exam|'+e.id+'|mk|'+k,courseId:e.course,courseName:cname(e.course),topic:'',
      sub:e.title||'—',n:'🔁 جبرانی: '+examName(e)+' (آزمون اصلی '+dlab(e.date)+')',t:'x',cg:'جبرانی',d:'',hw:0,count:Object.keys(g).length,session:null,item:null});
  });
  return out;
}

/* دفترهای روزانه ثبت‌نشده یا ناقص در N روز اخیر (مستقل از برنامه‌ی هفتگی با فیلتر) */
function journalPendingDays(days, filter){
  const out=[], t=todayK();
  let maxD=7;
  if(days==='month'){
    const jp=jparts(t);
    maxD=jp.d||30;
  }else if(typeof days==='number'){
    maxD=days;
  }
  const f=filter||st.pendFilter||'all';
  for(let i=0; i<maxD; i++){
    const k=addD(t, -i);
    const info=dayJournalStatus(k);
    let match=false;
    if(f==='all') match=(info.status==='none'||info.status==='part'||info.status==='full');
    else if(f==='none') match=(info.status==='none');
    else if(f==='part') match=(info.status==='part');
    else if(f==='full') match=(info.status==='full');
    else if(f==='holidays') match=(info.off===true);
    if(match){
      out.push({k, status:info.status, q:info.status, info});
    }
  }
  return out;
}

/* برای سازگاری سایر بخش‌ها */
function pending(days){
  return journalPendingDays(days, 'all');
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
.dj-calgrid button.blk,.dj-calgrid button:disabled{cursor:not-allowed;opacity:.5;filter:saturate(.7)}
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
#dj .dj-mxpk{max-height:150px;overflow-y:auto}
#dj .dj-mxmh{font-size:12px;font-weight:900;color:var(--p,#5b3fd6);background:#ede9fe;padding:3px 10px;border-radius:8px}
#dj .dj-mxpk .dj-sm.on{background:var(--p,#5b3fd6);color:#fff;border-color:transparent}
#dj td.dj-atc{cursor:pointer;user-select:none}#dj td.dj-atc:hover{outline:2px solid #6366f1;outline-offset:-2px}
#dj td.dj-ed{cursor:pointer;user-select:none}#dj td.dj-ed:hover,#dj td.dj-ed:focus-visible{outline:2px solid #6366f1;outline-offset:-2px}#dj td.dj-ed.em:hover::after{content:'＋';color:#94a3b8;font-size:13px;font-weight:800}
#dj .dj-fch{display:flex;flex-direction:column;gap:5px;margin:10px 0}
#dj .dj-fr{display:grid;grid-template-columns:minmax(110px,190px) 1fr 44px;align-items:center;gap:8px;padding:3px 6px;border-radius:8px}
#dj .dj-fr.lo{background:#fff1f2;outline:1px solid #fecdd3}#dj .dj-fr.na{opacity:.5}
#dj .dj-fn{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dj .dj-fb{display:flex;height:16px;background:#eef2f7;border-radius:8px;overflow:hidden;direction:ltr}
#dj .dj-fb i,#dj .dj-fleg i{display:block;height:100%}#dj .dj-fb i.j,#dj .dj-fleg i.j{background:#3b82f6}#dj .dj-fb i.c,#dj .dj-fleg i.c{background:#1a8f55}
#dj .dj-fv{font-size:13px;text-align:center;font-variant-numeric:tabular-nums}
#dj .dj-fleg{font-size:12px;color:#475569;display:flex;gap:6px;align-items:center;flex-wrap:wrap}#dj .dj-fleg i{width:12px;height:12px;border-radius:3px;display:inline-block}
#dj .dj-fsug{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:10px 14px;margin-top:6px;font-size:13px;line-height:2}#dj .dj-fsug ul{margin:4px 18px 8px}
#dj .dj-ftop{margin-top:8px;font-size:12px;color:#1a8f55;font-weight:800}
#dj .dj-seg{display:inline-flex;border:1px solid var(--line,#ddd);border-radius:11px;overflow:hidden}
#dj .dj-seg button{border:0;background:var(--card,#fff);color:var(--tx,#222);padding:8px 14px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#dj .dj-seg button.on{background:var(--p,#5b3fd6);color:#fff}
#dj .dj-mxt{flex:1;min-width:150px;text-align:center;font-weight:800;font-size:14px}
#dj .dj-live{display:inline-flex;align-items:center;gap:5px;font:800 11px Vazirmatn,Tahoma,sans-serif;color:#1a8f55;background:#1a8f5518;border-radius:99px;padding:2px 9px;margin-right:6px}
#dj .dj-live::before{content:'';width:7px;height:7px;border-radius:50%;background:#1a8f55}
#dj .dj-mxlg{font-size:11px;color:var(--mut,#777);line-height:2;margin-top:8px}
#dj .dj-mxem{padding:18px;text-align:center;color:var(--mut,#888);font-size:13px}
#dj .dj-profile-header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;background:var(--card,#fff);border-radius:16px;border:1px solid var(--line,#dfe3ee);margin-bottom:12px}
#dj .dj-profile-title{font-size:16px;font-weight:900;color:var(--tx,#1e293b);margin-bottom:4px}
#dj .dj-profile-meta{display:flex;gap:8px;font-size:12px;color:var(--mut,#64748b);flex-wrap:wrap;align-items:center}
#dj .dj-stat-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0}
#dj .dj-stat-c{padding:12px 14px;border-radius:14px;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);display:flex;flex-direction:column;gap:3px;box-shadow:0 1px 3px rgba(0,0,0,0.03)}
#dj .dj-stat-c small{font-size:11.5px;color:var(--mut,#64748b);font-weight:700}
#dj .dj-stat-c b{font-size:17px;font-weight:900;color:var(--tx,#0f172a);font-variant-numeric:tabular-nums}
#dj .dj-stat-c span{font-size:11px;color:var(--mut,#64748b);line-height:1.4}
#dj .dj-acts-card{margin:12px 0;padding:14px;background:var(--card,#fff);border-radius:16px;border:1px solid var(--line,#dfe3ee)}
#dj .dj-acts-tbl-wrap{overflow-x:auto;margin-top:10px;border-radius:12px;border:1px solid var(--line,#e2e8f0)}
#dj .dj-acts-tbl{width:100%;border-collapse:collapse;font-size:12.5px;text-align:right}
#dj .dj-acts-tbl th,#dj .dj-acts-tbl td{padding:8px 10px;border-bottom:1px solid var(--line,#f1f5f9)}
#dj .dj-acts-tbl th{background:var(--bg2,#f8fafc);color:var(--tx,#334155);font-weight:800}
#dj .dj-acts-tbl tr:hover td{background:#f8fafc}
#dj .dj-pend-card{margin:14px 0;padding:16px;background:var(--card,#fff);border-radius:16px;border:1px solid var(--line,#dfe3ee)}
#dj .dj-pend-tbl-wrap{overflow-x:auto;margin-top:10px;border-radius:12px;border:1px solid var(--line,#e2e8f0)}
#dj .dj-pend-tbl{width:100%;border-collapse:collapse;font-size:12px;text-align:right}
#dj .dj-pend-tbl th,#dj .dj-pend-tbl td{padding:8px 10px;border-bottom:1px solid var(--line,#f1f5f9)}
#dj .dj-pend-tbl th{background:var(--bg2,#f8fafc);color:var(--tx,#334155);font-weight:800}
#dj .dj-pend-tbl tr:hover td{background:#f8fafc}`;
const MXCSS=`
.dj-mx .dj-mxw{overflow:auto;border-radius:14px;border:1px solid var(--line,#dfe3ee)}
.dj-mx table{border-collapse:separate;border-spacing:0;font:700 12px Vazirmatn,Tahoma,sans-serif;width:max-content;min-width:100%;table-layout:auto;color:var(--tx,#222)}
.dj-mx th,.dj-mx td{padding:0;text-align:center;vertical-align:middle;border-bottom:1px solid var(--line,#e6e9f2);border-left:1px solid var(--line,#e6e9f2)}
.dj-mx thead th{background:#2b4a9b;color:#fff;font-weight:800;position:sticky;top:0;z-index:2;text-align:center !important;vertical-align:middle !important}
.dj-mx thead th.d1{background:#3d63bd}
.dj-mx th.nm,.dj-mx td.nm{position:sticky;right:0;z-index:3;text-align:right;padding:5px 10px;min-width:var(--nmw,130px);width:var(--nmw,130px);max-width:none;white-space:nowrap !important;overflow:visible !important;text-overflow:clip !important;font-weight:900;font-size:12.5px;background:var(--card,#fff);color:var(--tx,#222);border-left:2px solid #c9d2ea}
.dj-mx thead th.nm{background:#2b4a9b;color:#fff;z-index:5;text-align:center !important;vertical-align:middle !important;padding:6px 10px}
.dj-mx tbody tr:nth-child(even) td.nm{background:var(--bg2,#f4f6fb)}
.dj-mx th.h{width:28px;min-width:28px;vertical-align:middle !important;padding:6px 1px;text-align:center !important}
.dj-mx td.c .c-txt{white-space:nowrap !important;display:inline-block !important}
.dj-mx th.h span{display:inline-flex !important;align-items:center !important;justify-content:center !important;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center !important;white-space:nowrap;max-height:var(--hh,190px);overflow:hidden;margin:0 auto !important;font-size:10.5px;line-height:1.5}
.dj-mx th.h b{font-weight:900;color:#ffe08a}
.dj-mx td.c{width:28px;min-width:28px;height:26px;font-size:10.5px;font-weight:900;color:#fff;text-align:center !important;vertical-align:middle !important}
.dj-mx td.l4{background:#1a8f55}.dj-mx td.l3{background:#55b043}.dj-mx td.l2{background:#e2a300}.dj-mx td.l1{background:#d9363e}
.dj-mx td.ok{background:#1a8f55}.dj-mx td.no{background:#d9363e}
.dj-mx td.ab{background:#fde7e8;color:#c0262c;font-weight:900;text-align:center !important}
.dj-mx td.em{background:transparent}
.dj-mx thead th.at{background:#0f766e}.dj-mx thead th.at.d1{background:#14917f}
.dj-mx td.c.at{font-size:11px;font-weight:900}
.dj-mx td.at.pr{background:#e3f4ea;color:#1a8f55}.dj-mx td.at.lt{background:#fff1cf;color:#b26a00}.dj-mx td.at.ax{background:#ffe9d6;color:#b45309}.dj-mx td.at.ab{background:#fde7e8;color:#c0262c}
.dj-mx td.at{border-left:2px solid #99d5cc}
.dj-mx th.h.pnh{width:40px;min-width:40px}.dj-mx td.c.pnc{width:40px;min-width:40px;font-size:10px;white-space:nowrap}
.dj-pn{border-radius:10px;padding:6px 12px;font-weight:800;border:2px solid transparent;cursor:pointer;background:var(--card,#fff);white-space:nowrap}
.dj-bt .dj-pn.pos,.dj-pn.pos{border-color:#1a8f55 !important;color:#1a8f55 !important}.dj-bt .dj-pn.pos:hover{background:#e3f4ea}
.dj-bt .dj-pn.neg,.dj-pn.neg{border-color:#c0262c !important;color:#c0262c !important}.dj-bt .dj-pn.neg:hover{background:#fde7e8}
.dj-pn b{display:inline-block;min-width:18px;padding:0 5px;margin-right:4px;border-radius:9px;color:#fff !important}.dj-pn.pos b{background:#1a8f55}.dj-pn.neg b{background:#c0262c}
.dj-pnx{border:0;background:#eef1f6;color:#64748b;border-radius:8px;width:24px;height:24px;cursor:pointer;font-size:11px;line-height:1}.dj-pnx:hover{background:#fde7e8;color:#c0262c}
.dj-pn:disabled,.dj-pnx:disabled{opacity:.4;cursor:not-allowed}.dj-pn.pos.on{background:#1a8f55 !important;color:#fff !important}.dj-pn.neg.on{background:#c0262c !important;color:#fff !important}
.dj-mx tbody tr:hover td.nm{background:#e8edf9}
@media(max-width:640px){.dj-mx th.nm,.dj-mx td.nm{white-space:normal !important;min-width:92px;width:92px;max-width:104px;font-size:11px;line-height:1.35;padding:4px 6px}.dj-mx th.h{width:26px;min-width:26px}.dj-mx td.c{width:26px;min-width:26px;height:24px;font-size:10px}}

.dj-act-status-pill{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:900;padding:3px 8px;border-radius:8px;white-space:nowrap;cursor:help}.dj-act-status-pill.done{background:#1a8f5518;color:#1a8f55;border:1px solid #1a8f5533}.dj-act-status-pill.part{background:#d9770618;color:#b45309;border:1px solid #d9770633}
.dj-course-chart{margin:14px 0;padding:12px;border-radius:12px;background:var(--bg2,#f8fafc);border:1px solid var(--line,#e2e8f0)}
.dj-bar-row{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:12px}
.dj-bar-lbl{width:110px;flex:none;text-align:right;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dj-bar-track{flex:1;height:18px;border-radius:6px;background:#e2e8f0;overflow:hidden;display:flex}
.dj-bar-fill{height:100%;display:flex;align-items:center;justify-content:flex-end;padding:0 6px;color:#fff;font-size:10px;font-weight:900}
.dj-bar-val{width:55px;flex:none;text-align:left;font-weight:900;font-size:11px;color:var(--tx,#222)}
.dj-stu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-top:10px}
.dj-stu-card{padding:10px 12px;border-radius:10px;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);display:flex;flex-direction:column;gap:4px;font-size:12px}
.dj-stu-card b{color:#1e3a8a}
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
.dj-modal-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;border-top:1px solid var(--line,#e2e8f0);padding-top:12px}.dj-modal-ft .dj-sm{white-space:nowrap;flex:none}.dj-modal-ft .big{flex:1}`;
const cs=document.createElement('style');cs.textContent=CSS+PENDCSS+MXCSS;document.head.appendChild(cs);

/* داده‌های اولیه نمونه بر اساس کلاس و تصویر کاربر */
function seedInitialData(){
  try{
    const d=D();
    if(Object.keys(d.m||{}).length>0)return;
    if(typeof S==='undefined'||!S)return;
    /* مشخصات مدرسه/آموزگار فقط از «تنظیمات» می‌آید؛ مقدار پیش‌فرض ساختگی نمی‌نویسیم (cl-v154) */
    const REAL_NAMES=[
      'ابوالفضل نورمحمد اوغلی',
      'بردیا پوربابا',
      'امیرعباس امن‌زاده تازه‌قشلاق',
      'امیرعباس عزتی ترکده',
      'محمدطاها زینالی',
      'سیدآرشام فتحی سادات',
      'ابوالفضل سعادتی',
      'امیرعلی محمد سلطانی',
      'دانیال بمپوری سیستانی',
      'علی‌اصغر طالبی',
      'امیرعلی بیاضی طهرانبند',
      'مهدی اکبری'
    ];
    if(!S.students||(S.students.length<=12&&(S.students[0]&&S.students[0].name.startsWith('دانش‌آموز')))){
      S.students=REAL_NAMES.map((name,i)=>({id:i+1,name,score:1000,team:(i%3)+1,att:''}));
    }
    const crsNames=['قرآن','فارسی','ریاضی','علوم','مطالعات اجتماعی','املا','انشا و نگارش','هدیه‌های آسمان'];
    S.courses=S.courses||[];
    crsNames.forEach((cn,idx)=>{if(!S.courses.some(c=>c.name===cn))S.courses.push({id:idx+1,name:cn})});
    const getC=n=>(S.courses.find(c=>c.name.includes(n))||{id:1}).id;
    const cQuran=getC('قرآن'),cFarsi=getC('فارسی'),cSoc=getC('مطالعات'),cMath=getC('ریاضی');

    const SEED_DATA=[
      {k:'2026-09-26',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{1:4,2:3,4:3,10:4,12:3},abs:[3,5]},
      {k:'2026-09-27',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{},abs:[3]},
      {k:'2026-09-28',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{2:3,4:3,5:3,7:3,12:3},abs:[3]},
      {k:'2026-09-28',b:'1',c:cFarsi,it:'i1',n:'روان‌خوانی',marks:{},abs:[3]},
      {k:'2026-09-29',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{5:4,7:4},abs:[3,9]},
      {k:'2026-10-02',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{10:4,12:4},abs:[3,4,8]},
      {k:'2026-10-04',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{1:3,2:3,4:2},abs:[3]},
      {k:'2026-10-04',b:'1',c:cFarsi,it:'i7',n:'حفظ شعر',marks:{1:4,2:4,5:3,6:4,8:4,10:3,12:4},abs:[3,7]},
      {k:'2026-10-06',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{1:4},abs:[3,6,7]},
      {k:'2026-10-11',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{1:4,2:3,4:3,5:3,7:3,8:3,10:3,11:3,12:3},abs:[3]},
      {k:'2026-10-11',b:'1',c:cSoc,it:'i0',n:'پرسش شفاهی',marks:{9:1},abs:[3]},
      {k:'2026-10-12',b:'0',c:cSoc,it:'i0',n:'پرسش شفاهی',marks:{1:4,2:4,6:4,8:4,11:3,12:4},abs:[3]},
      {k:'2026-10-16',b:'0',c:cQuran,it:'i0',n:'روان‌خوانی قرآن',marks:{1:3,5:3,7:3,12:3},abs:[3]}
    ];
    S.att=S.att||{};
    SEED_DATA.forEach(row=>{
      d.ses[row.k+'|'+row.b]={c:row.c,tp:row.n,nt:'',it:{[row.it]:{n:row.n,t:'g',hw:0,sub:row.n,cg:'ارزشیابی'}}};
      d.m[row.k+'|'+row.b+'|'+row.it]={};
      Object.keys(row.marks).forEach(sid=>{if(row.marks[sid]!=null)d.m[row.k+'|'+row.b+'|'+row.it][+sid]=row.marks[sid]});
      S.att[row.k]=S.att[row.k]||{};
      (row.abs||[]).forEach(sid=>{S.att[row.k][sid]='a'});
    });

    const today=todayK();
    d.ses[today+'|0']={c:cFarsi,tp:'املا و روان‌خوانی',nt:'تدریس درس جدید و انجام تمرینات کلاسی',it:{'i_emla':{n:'املا تقریری درس ۴',t:'g',hw:0,sub:'املا',cg:'املا'},'i_ravan':{n:'روان‌خوانی درس',t:'g',hw:0,sub:'روان‌خوانی',cg:'روخوانی'}}};
    d.m[today+'|0|i_emla']={1:4,2:3,4:3,5:4,6:4,7:3,8:4,10:4,11:3,12:4};
    d.m[today+'|0|i_ravan']={1:4,2:4,4:3,5:3,6:4,7:4,8:4,10:4,11:4,12:4};
    d.ses[today+'|1']={c:cMath,tp:'حل مسئله و تمرین',nt:'حل تمرینات ریاضی',it:{'i_tamrin':{n:'حل تمرین صفحه ۲۵',t:'d',hw:1,sub:'حل مسئله',cg:'تمرین'}}};
    d.m[today+'|1|i_tamrin']={1:1,2:1,4:1,5:1,6:1,7:1,8:1,10:1,11:1,12:1};
    S.att[today]={3:'a',9:'l'};
    save();
  }catch(e){console.warn('seed error',e)}
}
seedInitialData();

/* ساخت صفحه و منو */
const sec=$('dj')||document.createElement('section');sec.id='dj';
if(!sec.parentNode){
  const refSec=$('act')||$('wsc')||document.querySelector('main section:last-of-type');
  if(refSec&&refSec.parentNode)refSec.parentNode.insertBefore(sec,refSec.nextSibling);else{(document.querySelector('main')||document.body).appendChild(sec)}
}
try{if(typeof pages!=='undefined'&&!pages.some(p=>p[0]==='dj')){const i=pages.findIndex(p=>p[0]==='wsc');pages.splice(i<0?pages.length:i+1,0,['dj','📓 دفتر روزانه معلم']);}
 if(typeof nav!=='undefined'&&!nav.querySelector('[data-p="dj"]')){
  const b=document.createElement('button');b.textContent='📓 دفتر روزانه معلم';b.dataset.p='dj';b.onclick=()=>show('dj');
  const ref=nav.querySelector('[data-p="wsc"]')||nav.querySelector('[data-p="att"]');ref?ref.after(b):nav.appendChild(b);
 }}catch(e){console.warn('dj nav',e)}


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
/* روز غیرقابل‌انتخاب: تعطیل هفتگی، تعطیل رسمی، تعطیلی اختصاصی/اضطراری مدرسه */
function isOffDay(k){try{const dk=dayKind(k);return !!(dk&&/(^|\s)(wk|ho)(\s|$)/.test(dk.c))}catch(e){return false}}
/* نزدیک‌ترین روز غیرتعطیل از k به سمت dir (۱ یا ۱-)؛ اگر تا ۴۰ روز پیدا نشد null */
function nextOpenDay(k,dir){let x=k;for(let i=0;i<40;i++){x=addD(x,dir);if(!isOffDay(x))return x}return null}
function startDay(){const t=todayK();return isOffDay(t)?(nextOpenDay(t,-1)||t):t}
/* مناسبت‌های رسمی/دستی یک ماه شمسی برای زیر تقویم */
function monthHol(y,m){const out=[],n=jlen(y,m);for(let d=1;d<=n;d++){const k=jiso(y,m,d);if(!k)continue;const h=hinfo(k);if(h&&h.kind!=='work'&&h.kind!=='weekend'&&h.label)out.push({d,k,t:h.label+(h.emergency?' 🚨 اضطراری':'')+(h.reason?' — علت: '+h.reason:''),o:h.official})}return out}
function calHtml(){
 if(!st.cal)return'';
 const {y,m}=st.cal,t=todayK(),tp=jparts(t),first=jiso(y,m,1);
 if(!first){st.cal=null;return''}
 const days=jlen(y,m),off=dow(first),rec=recDays();
 const y0=Math.min(tp.y-12,y),y1=Math.max(tp.y+1,y);
 let ys='';for(let i=y1;i>=y0;i--)ys+=`<option value="${i}"${i===y?' selected':''}>${fa(i)}</option>`;
 const acadMonths = [7, 8, 9, 10, 11, 12, 1, 2, 3];
 const ms = acadMonths.map(i => `<option value="${i}"${i===m?' selected':''}>${JMN[i-1]}</option>`).join('');
 let h=`<div class="dj-cal" data-dj="calbg" role="dialog" aria-modal="true" aria-label="انتخاب تاریخ"><div class="dj-calbox"><div class="dj-calhead"><button type="button" data-dj="calprev" aria-label="ماه قبل">›</button><div class="dj-calsel"><select data-calm aria-label="ماه">${ms}</select><select data-caly aria-label="سال">${ys}</select></div><button type="button" data-dj="calnext" aria-label="ماه بعد">‹</button></div><div class="dj-calgrid">${WDN.map((x,i)=>`<span${wkSet()&&(wkApi().days()||[]).indexOf(i)<0?' class="wk"':''}>${x.slice(0,1)}</span>`).join('')}`;
 h+='<i></i>'.repeat(off);
 for(let d=1;d<=days;d++){const k=jiso(y,m,d);if(!k){h+='<i></i>';continue}
  const dk=dayKind(k),c=[k===st.k?'on':'',k===t?'td':'',dk?dk.c:'',k>t?'fu':'',rec.has(k)?'hd':''].filter(Boolean).join(' ');
  const blk=isOffDay(k);
  h+=`<button type="button" class="${c}${blk?' blk':''}"${blk?' disabled aria-disabled="true"':''} data-dj="calday:${k}" title="${esc(WDN[dow(k)]+(dk&&dk.t?(dk.off===1?' — تعطیل رسمی: ':' — ')+dk.t:'')+(rec.has(k)?' — دارای ثبت':'')+(blk?' — غیرقابل انتخاب (تعطیل)':''))}">${fa(d)}</button>`}
 {const mh=monthHol(y,m),hi=hinfo(first);h+=`</div><div class="dj-hol">${mh.length?mh.map(x=>`<div>${x.o?'<b>★</b>':'▪'} ${fa(x.d)} ${JMN[m-1]} — ${esc(x.t)}</div>`).join(''):'<div>مناسبت یا تعطیلی ثبت‌شده‌ای در این ماه نیست.</div>'}${hi&&hi.lunarUnknown?`<div class="cov">⚠️ مناسبت‌های قمری سال ${fa(y)} هنوز در برنامه ثبت نشده (نامعلوم، نه «تعطیل نیست»)؛ فقط تعطیلات ثابت شمسی دیده می‌شوند.</div>`:''}</div>`}
 return h+`<div class="dj-calft"><button type="button" class="p" data-dj="caltoday">امروز</button><small>● ثبت‌شده · ★ تعطیل رسمی · قرمز: تعطیل هفتگی · نارنجی: تعطیلی اختصاصی (قاب قرمز = اضطراری) · روزهای تعطیل قابل انتخاب نیستند${wkSet()?'':' · <button type="button" class="dj-sm" data-dj="setwk">تنظیم روزهای کاری</button>'}</small><button type="button" data-dj="calclose">بستن</button></div></div></div>`;
}

/* ثبت‌های «فعالیت کلاسی» (S.activities) برای یک روز */
const caDay=k=>(S.activities||[]).filter(x=>x&&x.date===k).sort((a,b)=>(a.ts||a.id||0)-(b.ts||b.id||0));
function caLabel(x){const A=window.ACTX,ac=A&&A.isAcad?A.isAcad(x.kind):false;return ac?(x.type==='positive'?['✅ مسلط','#1a8f55','#e6f6ee']:['🔄 نیاز به تمرین','#b26a00','#fff4dc']):(x.type==='positive'?['🌟 مثبت','#1a8f55','#e6f6ee']:['💪 نیاز به تلاش بیشتر','#b26a00','#fff4dc'])}
function classActsHtml(k){
 const A=caDay(k),X=window.ACTX||{};
 const head=`<div class="dj-ph"><b style="font-size:15px;color:#1e3a8a">🌟 فعالیت‌های کلاسی دانش‌آموزان در این روز</b><button type="button" class="dj-sm" data-dj="gotoact">↗ ثبت در صفحه‌ی فعالیت کلاسی</button></div>`;
 if(!A.length)return `<div class="card dj-ca-card">${head}<div class="dj-mxem" style="padding:14px">برای این روز هنوز فعالیت کلاسی (پاسخ به سؤال، ارائه، مشارکت و…) ثبت نشده است. این ثبت‌ها از صفحه‌ی «فعالیت کلاسی» می‌آیند و اینجا یک‌جا کنار دفتر روزانه دیده می‌شوند.</div></div>`;
 const pos=A.filter(x=>x.type==='positive').length,eff=A.length-pos,stu=new Set(A.map(x=>x.sid)).size;
 const nm=sid=>((sts().find(z=>z.id===sid)||{}).name)||'—';
 const tm=x=>{try{return x.ts?new Date(x.ts).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'}):''}catch(e){return''}};
 const rows=A.map((x,i)=>{const L=caLabel(x),wh=X.where?X.where(x):(x.tl||'');
  return `<tr><td style="text-align:center;font-weight:800">${fa(i+1)}</td><td style="font-weight:800">${esc(nm(x.sid))}</td><td>${esc(wh||'—')}</td><td>${esc(X.kl?X.kl(x):(x.kind||'سایر'))}</td><td style="text-align:center"><span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:900;color:${L[1]};background:${L[2]}">${L[0]}</span></td><td>${esc(x.note||'')}</td><td style="text-align:center;color:var(--mut,#64748b);font-size:11.5px">${esc(tm(x))}</td></tr>`}).join('');
 return `<div class="card dj-ca-card">${head}
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px;font-size:12px;font-weight:800"><span style="background:#eef2ff;color:#3730a3;padding:3px 10px;border-radius:8px">${fa(A.length)} ثبت</span><span style="background:#eef2ff;color:#3730a3;padding:3px 10px;border-radius:8px">${fa(stu)} دانش‌آموز</span><span style="background:#e6f6ee;color:#1a8f55;padding:3px 10px;border-radius:8px">${fa(pos)} مثبت / مسلط</span><span style="background:#fff4dc;color:#b26a00;padding:3px 10px;border-radius:8px">${fa(eff)} نیاز به تمرین / تلاش</span></div>
  <div class="dj-acts-tbl-wrap" style="max-height:340px;overflow:auto"><table class="dj-acts-tbl"><thead><tr><th style="width:36px;text-align:center">ردیف</th><th>دانش‌آموز</th><th>درس / مبحث</th><th>نوع فعالیت</th><th style="text-align:center">نتیجه</th><th>یادداشت</th><th style="text-align:center">ساعت</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}

/* بررسی تکالیف همان روز (S.hwl): هم تکلیف‌های ثبت‌شده در دفتر روزانه و هم بررسی‌های صفحه‌ی «حضور و تکالیف»؛ منبع داده یکی است */
function hwDayHtml(k){
 const L=(S.hwl||[]).filter(h=>h&&h.date===k);
 const head=`<div class="dj-ph"><b style="font-size:15px;color:#1e3a8a">📚 بررسی تکالیف این روز</b><button type="button" class="dj-sm" data-dj="gotohw">↗ ثبت در صفحه‌ی حضور و تکالیف</button></div>`;
 if(!L.length)return `<div class="card dj-ca-card">${head}<div class="dj-mxem" style="padding:14px">برای این روز بررسی تکلیفی ثبت نشده است. تکلیف‌هایی که در فعالیت‌های دفتر روزانه «تکلیف در منزل دارد» می‌خورند و بررسی‌های صفحه‌ی تکالیف اینجا یک‌جا دیده می‌شوند.</div></div>`;
 const rows=L.map((h,i)=>{const v=Object.values(h.st||{}),d=v.filter(x=>x==='d').length,p=v.filter(x=>x==='p').length,n=v.filter(x=>x==='n').length,t=d+p+n,pc=t?Math.round((d+p*.5)/t*100):0,col=pc>=80?'#1a8f55':pc>=50?'#b26a00':'#c0262c';
  return `<tr><td style="text-align:center;font-weight:800">${fa(i+1)}</td><td style="font-weight:800">${esc(cname(h.course))}</td><td>${esc(h.title||'تکلیف')}${h.dj?' <span style="font-size:10px;color:#64748b">(از دفتر)</span>':''}</td><td style="text-align:center;color:#1a8f55;font-weight:800">${fa(d)}</td><td style="text-align:center;color:#b26a00;font-weight:800">${fa(p)}</td><td style="text-align:center;color:#c0262c;font-weight:800">${fa(n)}</td><td style="text-align:center"><span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:900;color:${col};background:${col}1a">${fa(pc)}٪</span></td></tr>`}).join('');
 return `<div class="card dj-ca-card">${head}<div class="dj-acts-tbl-wrap" style="max-height:300px;overflow:auto"><table class="dj-acts-tbl"><thead><tr><th style="width:36px;text-align:center">ردیف</th><th>درس</th><th>تکلیف</th><th style="text-align:center">کامل</th><th style="text-align:center">ناقص</th><th style="text-align:center">انجام‌نشده</th><th style="text-align:center">درصد</th></tr></thead><tbody>${rows}</tbody></table></div></div>`}

/* جدول فعالیت‌های آموزشی روز جاری (بخش چهارم - بند ۳) */
function actsTableHtml(k, todayActs, pn){
  if(!todayActs.length){
    return `<div class="dj-mxem" style="padding:22px;background:#f8fafc;border-radius:14px;border:1px dashed #cbd5e1;margin-top:10px">
      هنوز فعالیتی برای این روز ثبت نشده است. با زدن دکمه‌ی <b>«➕ ثبت فعالیت آموزشی جدید»</b> یا انتخاب از زنگ‌های بالا، اولین فعالیت امروز را ثبت کنید.
    </div>`;
  }
  const rows = todayActs.map((a, i) => {
    const pnb = (a.exam||!a.b) ? pn : presNB(k,a.b);
    const isDone = (a.exam?pn:pnb) > 0 && a.count >= (a.exam?pn:pnb);
    if(a.exam){return `<tr style="background:#fffbeb">
      <td style="text-align:center;font-weight:800">${fa(i+1)}</td>
      <td style="font-weight:900;color:#1e3a8a"><span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#e0e7ff;color:#3730a3">${esc(a.courseName)}</span></td>
      <td style="font-weight:700">${esc(a.sub)}</td>
      <td style="font-weight:800">${esc(a.n)} <span style="font-size:11px;color:#92400e;background:#fef3c7;padding:1px 6px;border-radius:6px">${a.mkc?'🔁 جبرانی':'📝 آزمون'}</span></td>
      <td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#fef3c7;color:#92400e;font-size:11px">${a.mkc?'جبرانی':'آزمون'}</span></td>
      <td style="text-align:center;font-weight:800;font-variant-numeric:tabular-nums">${a.mkc?fa(a.count):fa(a.count)+' / '+fa(pn)}</td>
      <td style="text-align:center"><span class="dj-act-status-pill ${(a.mkc||isDone)?'done':'part'}">${a.mkc?'✅ نتیجه‌ی جبرانی ثبت شد':(isDone?'✅ نمره‌ها ثبت شد':'🟡 نمره‌ها ناقص')}</span></td>
      <td style="text-align:center"><button type="button" class="dj-sm on" style="background:#b45309;color:#fff;border-color:transparent" data-dj="examgo:${esc(a.exId)}" title="${a.mkc?'ثبت و ویرایش در «آزمون جبرانی»':'ورود یا ویرایش نمره‌ها در «درس‌ها و آزمون‌ها»'}">${a.mkc?'🔁 جبرانی':'📝 نمره‌ها'}</button></td>
    </tr>`}
    const isSelected = st.b === a.b && st.item === a.itId;
    return `<tr style="${isSelected?'background:#eff6ff;outline:2px solid #3b82f644;':''}">
      <td style="text-align:center;font-weight:800">${fa(i+1)}</td>
      <td style="font-weight:900;color:#1e3a8a"><span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#e0e7ff;color:#3730a3">${esc(a.courseName)}</span></td>
      <td style="font-weight:700">${esc(a.sub||'—')}</td>
      <td style="font-weight:800">${esc(a.n)}${a.hw?' <span style="font-size:11px;color:#d97706">📝 تکلیف</span>':''}${a.t==='p'?' <span style="font-size:11px;color:#0f766e;background:#ccfbf1;padding:1px 6px;border-radius:6px">＋/−</span>':''}</td>
      <td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:6px;background:#f1f5f9;color:#475569;font-size:11px">${esc(a.cg)}</span></td>
      <td style="text-align:center;font-weight:800;font-variant-numeric:tabular-nums">${fa(a.count)} / ${fa(pnb)}</td>
      <td style="text-align:center">
        <span class="dj-act-status-pill ${isDone?'done':'part'}" title="${isDone ? 'تکمیل: تمام دانش‌آموزان حاضر ارزشیابی شده‌اند' : 'ناقص: هنوز همه دانش‌آموزان حاضر ارزشیابی نشده‌اند (${fa(a.count)} از ${fa(pnb)})'}">
          ${isDone ? '✅ تکمیل' : '🟡 ناقص'}
        </span>
      </td>
      <td style="text-align:center">
        <div style="display:inline-flex;gap:4px">
          <button type="button" class="dj-sm on" style="background:${isSelected?'#1e40af':'#2563eb'};color:#fff;border-color:transparent" data-dj="evalact:${esc(a.b)}:${esc(a.itId)}">👥 ارزشیابی</button>
          <button type="button" class="dj-sm" data-dj="editact:${esc(a.b)}:${esc(a.itId)}" title="ویرایش فعالیت">✏️</button>
          <button type="button" class="dj-sm" style="color:#dc262c" data-dj="delact:${esc(a.b)}:${esc(a.itId)}" title="حذف فعالیت">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  return `<div class="dj-acts-tbl-wrap">
    <table class="dj-acts-tbl">
      <thead>
        <tr>
          <th style="width:36px;text-align:center">ردیف</th>
          <th style="min-width:90px">درس</th>
          <th style="min-width:100px">زیرمجموعه</th>
          <th style="min-width:150px">عنوان فعالیت</th>
          <th style="width:100px;text-align:center">نوع فعالیت</th>
          <th style="width:105px;text-align:center">دانش‌آموزان</th>
          <th style="width:85px;text-align:center">وضعیت</th>
          <th style="min-width:140px;text-align:center">عملیات</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

/* فرم و مودال ثبت و ویرایش فعالیت (بخش پنجم) */
function actModalHtml(){
  if(!st.actModal) return '';
  const m = st.actModal;
  const isEdit = m.mode === 'edit';
  const cList = allCourses();
  const curCourse = cList.find(c => String(c.id) === String(m.c)) || cList[0] || {id: 1, name: 'فارسی'};
  const subs = getCourseSubs(curCourse.name);

  const hwOn=!!m.hw;
  return `<div class="dj-modal-overlay" data-dj="closeactmodal"><div class="dj-modal-box">
    <div class="dj-modal-hd">
      <b>${isEdit ? '✏️ ویرایش فعالیت آموزشی' : '➕ ثبت فعالیت آموزشی جدید'}</b>
      <button type="button" class="dj-sm" data-dj="closeactmodal">✕</button>
    </div>
    <div class="dj-modal-sec">
      <label>درس: <b style="color:#d9534f">*</b></label>
      <select class="dj-in" data-act-field="c" style="width:100%">${cList.map(c => `<option value="${c.id}"${String(c.id)===String(m.c)?' selected':''}>${esc(c.name)}</option>`).join('')}</select>
    </div>
    <div class="dj-modal-sec">
      <label>زیرمجموعه درس (مثلاً املا، حل مسئله):</label>
      <input class="dj-in" data-act-field="sub" list="djSubList" autocomplete="off" placeholder="انتخاب از فهرست یا نوشتن به‌دلخواه…" value="${esc(m.sub||'')}" style="width:100%">
      <datalist id="djSubList">${subs.map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>
    </div>
    <div class="dj-modal-sec">
      <label>نوع فعالیت / ارزشیابی:</label>
      <select class="dj-in" data-act-field="cg" style="width:100%">${(()=>{const cur=m.cg||'تدریس',L=cgOptions();if(!L.includes(cur))L.push(cur);return L.map(x=>`<option value="${esc(x)}"${x===cur?' selected':''}>${esc(x)}</option>`).join('')})()}</select>
      <small style="display:block;margin-top:4px;color:var(--mut,#64748b);font-size:11.5px">همان انواع ارزشیابی صفحه‌ی «درس‌ها و آزمون‌ها» (مثل ارزشیابی آغازین) اینجا هم هست.</small>
    </div>
    <div class="dj-modal-sec">
      <label>روش ارزشیابی:</label>
      <select class="dj-in" data-act-field="t" style="width:100%">
        <option value="g"${m.t!=='d'&&m.t!=='p'?' selected':''}>۴ سطحی توصیفی (خیلی خوب تا نیاز به تلاش بیشتر)</option>
        <option value="d"${m.t==='d'?' selected':''}>انجام شد / نشد</option>
        <option value="p"${m.t==='p'?' selected':''}>مثبت / منفی (پاسخ‌دهی دانش‌آموز: حفظ شعر، پرسش شفاهی، مطالعات، هدیه و…)</option>
      </select>
      <small style="display:block;margin-top:4px;color:var(--mut,#64748b);font-size:11.5px">در حالت «مثبت / منفی» برای هر دانش‌آموز می‌توان چندبار پاسخ مثبت یا منفی ثبت کرد؛ این ثبت‌ها در ارزشیابی مستمر اثر دارند.</small>
    </div>
    <div class="dj-modal-sec">
      <label>توضیحات (اختیاری):</label>
      <textarea class="dj-in" data-act-field="d" rows="2" style="width:100%" placeholder="نکات آموزشی، روش تدریس، صفحه یا درس…">${esc(m.d||'')}</textarea>
    </div>
    <div class="dj-modal-sec" id="djHwWrapAll" style="${m.t==='p'?'display:none':''}">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
        <input type="checkbox" data-act-field="hw"${hwOn?' checked':''} style="width:18px;height:18px">
        <span>تکلیف در منزل دارد</span>
      </label>
      <div style="margin-top:6px;${hwOn?'':'display:none'}" id="djHwTitleWrap">
        <input class="dj-in" data-act-field="hwt" placeholder="شرح تکلیف (اختیاری)…" value="${esc(m.hwt||'')}" style="width:100%">
      </div>
    </div>
    <div class="dj-modal-ft">
      <button type="button" class="dj-sm" data-dj="closeactmodal">انصراف</button>
      <button type="button" class="big on" style="background:#1a8f55;color:#fff;padding:10px 20px;border-radius:12px;border:0;cursor:pointer;font-weight:800" data-dj="saveact">💾 ذخیره فعالیت</button>
    </div>
  </div></div>`;
}

function pendCard(){
  const daysList = journalPendingDays(st.pendRange, st.pendFilter);
  const allDaysForCounts = journalPendingDays(st.pendRange, 'all');
  const noneCount = allDaysForCounts.filter(x => x.status === 'none').length;
  const partCount = allDaysForCounts.filter(x => x.status === 'part').length;
  const fullCount = allDaysForCounts.filter(x => x.status === 'full').length;
  const t = todayK();
  const rel = k => k === t ? ' (امروز)' : k === addD(t, -1) ? ' (دیروز)' : '';

  let rowsHtml = '';
  if(!daysList.length){
    rowsHtml = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#1a8f55;font-weight:bold">
      ${st.pendFilter==='all' ? '🎉 در این بازه، همه دفترهای روزانه فعال تکمیل هستند یا موردی یافت نشد.' : 'موردی با این فیلتر در بازه انتخابی یافت نشد.'}
    </td></tr>`;
  } else {
    rowsHtml = daysList.map((x, idx) => {
      const info = x.info || dayJournalStatus(x.k);
      const jp = jparts(x.k);
      const dtStr = fa(jp.d) + ' ' + JMN[jp.m-1] + ' ' + fa(jp.y);
      const isCur = x.k === st.k;
      return `<tr style="${isCur?'background:#eff6ff;':''}">
        <td style="text-align:center;font-weight:800">${fa(idx+1)}</td>
        <td style="font-weight:800">${esc(dtStr)}<small style="color:#64748b">${rel(x.k)}</small></td>
        <td style="text-align:center">${WDN[dow(x.k)]}</td>
        <td>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-weight:900;font-size:11.5px;color:${info.color};display:inline-block">${info.badge}</span>
            <small style="color:var(--mut,#64748b);font-size:10.5px">${esc(info.reason||'')}</small>
          </div>
        </td>
        <td style="text-align:center;font-weight:800">${info.actCount ? fa(info.actCount) + ' فعالیت' : '—'}</td>
        <td style="text-align:center">
          <button type="button" class="dj-pb" style="min-height:34px;padding:5px 12px;background:${isCur?'#15803d':'#2563eb'};color:#fff;border-color:transparent;cursor:pointer;font-size:12px" data-dj="goday:${x.k}">
            ${isCur ? 'همین روز فعال است ✓' : 'باز کردن دفتر این روز ‹'}
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  return `<div class="card dj-pend-card" id="djPendCard">
    <div class="dj-ph">
      <b style="font-size:15px;color:#1e3a8a">⏳ دفترهای روزانه ثبت‌نشده یا ناقص</b>
      <small>مدیریت وضعیت دفترها کاملاً مستقل از برنامه‌ی هفتگی</small>
    </div>
    <div class="dj-pend-toolbar" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0">
      <div class="dj-seg">
        <button type="button" class="${st.pendRange===7?'on':''}" data-dj="pendrange:7">۷ روز اخیر</button>
        <button type="button" class="${st.pendRange===14?'on':''}" data-dj="pendrange:14">۱۴ روز اخیر</button>
        <button type="button" class="${st.pendRange===30?'on':''}" data-dj="pendrange:30">۳۰ روز اخیر</button>
        <button type="button" class="${st.pendRange==='month'?'on':''}" data-dj="pendrange:month">ماه جاری</button>
      </div>
      <select class="dj-in" data-dj-pendfilter style="max-width:210px" aria-label="فیلتر وضعیت">
        <option value="all"${st.pendFilter==='all'?' selected':''}>همه وضعیت‌ها</option>
        <option value="none"${st.pendFilter==='none'?' selected':''}>⚪ فقط ثبت‌نشده</option>
        <option value="part"${st.pendFilter==='part'?' selected':''}>🟡 فقط ناقص</option>
        <option value="full"${st.pendFilter==='full'?' selected':''}>✅ فقط تکمیل‌شده</option>
        <option value="holidays"${st.pendFilter==='holidays'?' selected':''}>🔴 تعطیلات</option>
      </select>
    </div>
    <div class="dj-pc" style="margin-bottom:10px">
      <span class="n">⚪ ${fa(noneCount)} ثبت‌نشده</span>
      <span class="p">🟡 ${fa(partCount)} ناقص</span>
      <span style="background:#1a8f5518;color:#1a8f55">✅ ${fa(fullCount)} تکمیل‌شده</span>
      <span class="t">مجموع ${fa(allDaysForCounts.length)} روز تحصیلی</span>
    </div>
    <div class="dj-pend-tbl-wrap">
      <table class="dj-pend-tbl">
        <thead>
          <tr>
            <th style="width:36px;text-align:center">ردیف</th>
            <th style="min-width:120px">تاریخ</th>
            <th style="width:85px;text-align:center">روز هفته</th>
            <th style="min-width:180px">وضعیت دفتر</th>
            <th style="width:110px;text-align:center">تعداد فعالیت‌ها</th>
            <th style="width:140px;text-align:center">عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    <div class="dj-pf" style="margin-top:8px">
      <span class="lg">با کلیک روی «باز کردن دفتر این روز»، دفتر روی تاریخ انتخاب‌شده تنظیم می‌شود.</span>
      <button type="button" class="dj-sm" data-dj="skipall">➖ علامت‌گذاری همه به عنوان «بدون نیاز به ثبت»</button>
    </div>
  </div>`;
}

/* پنل ارزشیابی سریع و مدیریت فعالیت‌های زنگ یا رویداد انتخابی */
function btns(it,cur,sid,dis){
  if(it.t==='d')return[[1,'✓ انجام شد','#1a8f55'],[0,'✗ نشد','#c0262c']].map(x=>`<button type="button" class="dj-b${cur===x[0]?' on':''}" ${dis?'disabled':''} style="${cur===x[0]?'background:'+x[2]+';color:#fff':''}" data-dj="mk:${sid}:${x[0]}">${x[1]}</button>`).join('');
  return LV.map(l=>`<button type="button" class="dj-b${cur===l.v?' on':''}" ${dis?'disabled':''} title="${l.t}" style="${cur===l.v?'background:'+l.c+';color:#fff':''}" data-dj="mk:${sid}:${l.v}">${l.s}</button>`).join('');
}

function pnBtns(sid,c,dis){c=pnOne(c);const dd=dis?'disabled':'';
  return `<button type="button" class="dj-b dj-pn neg${c[1]?' on':''}" ${dd} data-dj="pn:${sid}:n" title="پاسخ منفی (دوباره بزنید تا برداشته شود)" aria-pressed="${c[1]?'true':'false'}">− منفی</button><button type="button" class="dj-b dj-pn pos${c[0]?' on':''}" ${dd} data-dj="pn:${sid}:p" title="پاسخ مثبت (دوباره بزنید تا برداشته شود)" aria-pressed="${c[0]?'true':'false'}">＋ مثبت</button>`}
function studentList(k,b,it,pn){
  const d=D(),key=k+'|'+b+'|'+it.id,m=d.m[key]||{},done=Object.keys(m).filter(sid=>!absentB(k,b,+sid)).length;
  const pct=pn?Math.round(done/pn*100):0;
  let h=`<div style="margin-top:14px;background:#f8fafc;padding:12px;border-radius:14px;border:1px solid #e2e8f0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span style="font-size:13.5px;font-weight:800;color:#1e3a8a">🎯 ارزشیابی دانش‌آموزان: «${esc(it.n)}»</span>
      <span style="font-size:12px;font-weight:700;color:var(--mut,#64748b)">${fa(done)} از ${fa(pn)} دانش‌آموز حاضر (${fa(pct)}٪)</span>
    </div>
    <div class="dj-pg" style="height:7px;background:#e2e8f0;border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${pct}%;background:${pct>=100?'#1a8f55':'#3b82f6'};transition:width .3s"></i></div>
  </div>`;

  if(it.t==='p'){
    h+=`<div class="dj-bar" style="display:flex;gap:6px;align-items:center;margin:12px 0;flex-wrap:wrap;background:#f1f5f9;padding:8px 12px;border-radius:12px">
      <span style="font-size:12px;font-weight:800">＋ / − برای هر پاسخ دانش‌آموز:</span>
      <span style="font-size:12px;color:#475569;line-height:1.8">با هر بار زدن «＋ مثبت» (پاسخ درست یا مشارکت خوب) یا «− منفی» (پاسخ نادرست یا نبود آمادگی) یک مورد ثبت می‌شود و می‌توان چندبار زد. با ✕ یک مورد کم می‌شود. این ثبت‌ها در ارزشیابی مستمر اثر دارند.</span>
    </div>`;
  }else{
  h+=`<div class="dj-bar" style="display:flex;gap:6px;align-items:center;margin:12px 0;flex-wrap:wrap;background:#f1f5f9;padding:8px 12px;border-radius:12px">
    <span style="font-size:12px;font-weight:800">${st.sel?'برای انتخاب‌شده‌ها:':'برای همه‌ی ثبت‌نشده‌ها:'}</span>
    ${it.t==='d'?`
      <button type="button" class="dj-b" style="background:#1a8f55;color:#fff;border-radius:8px;padding:5px 12px;font-weight:700" data-dj="bulk:1">✓ انجام شد</button>
      <button type="button" class="dj-b" style="background:#c0262c;color:#fff;border-radius:8px;padding:5px 12px;font-weight:700" data-dj="bulk:0">✗ نشد</button>
    `:LV.map(l=>`<button type="button" class="dj-b" style="background:${l.c};color:#fff;border-radius:8px;padding:5px 12px;font-weight:700" data-dj="bulk:${l.v}" title="${l.t}">${l.s}</button>`).join('')}
    <button type="button" class="dj-sm" data-dj="selmode" style="margin-right:auto">${st.sel?'پایان انتخاب':'☑️ انتخاب چند نفر'}</button>
    ${st.sel?`<button type="button" class="dj-sm" data-dj="pickall">انتخاب همه ثبت‌نشده‌ها</button>`:''}
  </div>`;
  }

  h+=`<div class="dj-stu-list" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:10px;align-items:start">`;
  const ordered=sts().map((s,i)=>({s,i})).sort((x,y)=>(absentB(k,b,x.s.id)-absentB(k,b,y.s.id))||(x.i-y.i)).map(x=>x.s);
  const TINT={4:['#e9f7ef','#d3eedf'],3:['#f0f8e9','#dfefd0'],2:['#fff7e6','#fbe8bd'],1:['#fdeded','#f6d0d2']};
  h+=ordered.map((s,index)=>{
    const ab=absentB(k,b,s.id),ob=outB(k,b,s.id),v=m[s.id],nk=key+'|'+s.id,nt=d.n[nk],fn=((S.info||{})[s.id]||{}).fn||'';
    const tk=ab||v==null?null:(it.t==='d'?(v===1?4:1):v),tn=tk&&TINT[tk];
    return `<div class="dj-row${ab?' ab':''}${index%2===1?' stripe':''}" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;padding:9px 12px;border-radius:10px;background:${tn?tn[0]:(index%2===1?'#f8fafc':'#fff')};border:1px solid ${tn?tn[1]:'#f1f5f9'};transition:background .2s">
      ${st.sel&&!ab?`<input type="checkbox" data-dj="pick:${s.id}"${st.pick.has(s.id)?' checked':''} style="width:18px;height:18px;cursor:pointer">`:''}
      <div class="dj-nm" style="min-width:0;max-width:100%;overflow-wrap:anywhere;width:auto;white-space:nowrap !important;font-weight:800;font-size:13.5px;color:${v!=null?(it.t==='d'?(v===1?'#1a8f55':'#c0262c'):((LV.find(l=>l.v===v)||{}).c||'inherit')):'inherit'}">
        ${esc(s.name)}${(()=>{const r=caDay(k).filter(x=>x.sid===s.id);if(!r.length)return'';const p=r.filter(x=>x.type==='positive').length,e=r.length-p;return ` <span title="ثبت‌های فعالیت کلاسی امروز" style="font-size:10.5px;font-weight:800;color:#3730a3;background:#eef2ff;padding:1px 6px;border-radius:6px">🌟${fa(p)}${e?' · 💪'+fa(e):''}</span>`})()}${fn?` <small style="color:var(--mut,#888);font-weight:400">(${esc(fn)})</small>`:''}
        ${ob?' <span title="در این زنگ خارج از مدرسه بوده؛ ارزشیابی این زنگ برایش «انجام‌نشده به علت خروج» است (نه صفر و نه منفی)" style="font-size:11px;color:#b45309;background:#ffe9d6;padding:1px 6px;border-radius:4px;font-weight:700">🚪 خارج از مدرسه</span>':ab?' <span style="font-size:11px;color:#c0262c;background:#fee2e2;padding:1px 6px;border-radius:4px;font-weight:700">غایب</span>':late(k,s.id)?' <span style="font-size:11px;color:#d97706;background:#fef3c7;padding:1px 6px;border-radius:4px;font-weight:700">⏰ تأخیر</span>':''}
      </div>
      <div class="dj-bt" style="display:flex;gap:4px;margin-right:auto;align-items:center">
        ${it.t==='p'?pnBtns(s.id,(d.pm[key]||{})[s.id],ab):btns(it,v,s.id,ab)}
      </div>
      <button type="button" class="dj-sm" data-dj="fu:${s.id}" ${ab?'disabled':''} title="${fuList().some(q=>q.st==='open'&&String(q.sid)===String(s.id)&&q.k0===k&&q.b===b&&q.it===it.id)?'پیگیری ثبت شده — برای حذف دوباره بزنید':'فردا از او می‌پرسم (آمادگی نداشت)'}" style="${fuList().some(q=>q.st==='open'&&String(q.sid)===String(s.id)&&q.k0===k&&q.b===b&&q.it===it.id)?'background:#fff4d6;border-color:#f6c667':''}">🗓️${fuList().some(q=>q.st==='open'&&String(q.sid)===String(s.id)&&q.k0===k&&q.b===b&&q.it===it.id)?'•':''}</button>
      <button type="button" class="dj-sm" data-dj="note:${s.id}" ${ab?'disabled':''} title="یادداشت">${nt?'📝•':'📝'}</button>
      ${st.note===s.id?`<div class="dj-nt" style="width:100%;margin-top:6px"><input data-nt="${s.id}" placeholder="یادداشت کوتاه برای این دانش‌آموز…" value="${esc(nt||'')}" style="width:100%;padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1"></div>`:''}
    </div>`;
  }).join('');
  h+=`</div>`;
  return h;
}

function tplEditor(cid){
  const t=tplOf(cid);
  return `<div class="dj-ted" style="background:#f8fafc;padding:14px;border-radius:14px;border:1px solid #e2e8f0;margin:10px 0">
    <b style="font-size:13px">قالب فعالیت‌های پیش‌فرض «${esc(cname(cid))}»</b>
    <div style="font-size:11.5px;color:#888;margin-bottom:8px">تغییر نام یا حذف روی فعالیت‌های قبلاً ثبت‌شده اثری ندارد.</div>
    ${t.map(x=>`<div class="r" style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <input class="dj-in" data-tn="${esc(x.id)}" value="${esc(x.n)}" style="flex:1">
      <select class="dj-in" style="max-width:130px" data-tt="${esc(x.id)}"><option value="g"${x.t==='g'?' selected':''}>۴ سطحی</option><option value="d"${x.t==='d'?' selected':''}>انجام شد/نشد</option><option value="p"${x.t==='p'?' selected':''}>مثبت / منفی</option></select>
      ${x.t==='d'?`<label style="font-size:12px;display:flex;align-items:center;gap:3px"><input type="checkbox" data-th="${esc(x.id)}"${x.hw?' checked':''}> تکلیف</label>`:''}
      <button type="button" class="dj-sm" style="color:#dc262c" data-dj="tpldel:${esc(x.id)}">🗑️</button>
    </div>`).join('')}
    <div class="r" style="display:flex;gap:6px;align-items:center;margin-top:8px">
      <input class="dj-in" id="djNewN" placeholder="نام فعالیت جدید…" style="flex:1">
      <select class="dj-in" style="max-width:130px" id="djNewT"><option value="g">۴ سطحی</option><option value="d">انجام شد/نشد</option><option value="p">مثبت / منفی</option></select>
      <button type="button" class="dj-sm on" style="background:#2563eb;color:#fff" data-dj="tpladd">＋ افزودن</button>
    </div>
  </div>`;
}

function sessionCard(k,b,s){
  const items=itemsOf(s),pn=presNB(k,b),sk=s.st==='skip';
  let h=`<div class="card dj-eval-card" id="djEvalCard" style="border:2px solid #3b82f633;background:var(--card,#fff);border-radius:18px;margin-top:14px;box-shadow:0 8px 24px rgba(59,130,246,0.08)">
    <div class="dj-hd" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:12px">
      <div>
        <b style="font-size:16px;color:#1e40af">👥 پنل ارزشیابی سریع دانش‌آموزان: ${esc(cname(s.c))}</b>
        <div style="font-size:12px;color:var(--mut,#64748b);margin-top:2px">تاریخ: <b>${esc(dshort(k))}</b> · ${fa(pn)} دانش‌آموز حاضر از مجموع ${fa(sts().length)}</div>
      </div>
      <div>
        <button type="button" class="dj-sm" style="background:#f1f5f9;color:#475569;border-radius:10px" data-dj="closeeval">✕ بستن پنل ارزشیابی</button>
      </div>
    </div>
    <div class="dj-nt" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <select class="dj-in" data-f="course" style="max-width:200px">${courses().map(c=>`<option value="${c.id}"${c.id===s.c?' selected':''}>${esc(c.name)}</option>`).join('')}</select>
      <input class="dj-in" data-f="topic" placeholder="درس و مبحث تدریس‌شده (اختیاری)" value="${esc(s.tp||'')}" style="flex:1;min-width:180px">
      <input class="dj-in" data-f="snote" placeholder="یادداشت کلی این زنگ (اختیاری)" value="${esc(s.nt||'')}" style="flex:1;min-width:180px">
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
      <button type="button" class="dj-sm" data-dj="skip">${sk?'↩️ برگرداندن به حالت ثبت':'➖ این زنگ ثبت نمی‌شود'}</button>
    </div>
  </div>`;

  if(sk)return h+`<div class="dj-warn">این زنگ «بدون ثبت» علامت خورده و در فهرست ثبت‌نشده‌ها نمی‌آید.</div>`;

  h+=`<div class="card dj-eval-items" style="border:1.5px solid #e2e8f0;border-radius:16px;margin-top:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b style="font-size:14px">فعالیت‌های این درس:</b>
      <button type="button" class="dj-sm" data-dj="tpl">⚙️ قالب فعالیت‌ها</button>
    </div>
    <div class="dj-it" style="display:flex;gap:6px;flex-wrap:wrap">
      ${items.map(it=>{
        const c=cnt(k,b,it.id);
        return `<button type="button" class="dj-ch${it.id===st.item?' on':''}" data-dj="item:${esc(it.id)}">${esc(it.n)}${it.old&&!/^act_/.test(it.id)?' <small>(قدیمی)</small>':''}${c?` <small style="font-weight:800">(${fa(c)}/${fa(pn)})</small>`:''}</button>`;
      }).join('')}
    </div>`;

  if(st.tpl)h+=tplEditor(s.c);

  const it=items.find(x=>x.id===st.item)||items[0];
  if(!st.item&&it)st.item=it.id;

  if(!it){
    h+=`<p class="sub" style="margin-top:10px">یک فعالیت را انتخاب کنید تا فهرست دانش‌آموزان برای ارزشیابی نمایش داده شود.</p></div>`;
    return h;
  }

  h+=studentList(k,b,it,pn)+`</div>`;
  return h;
}

/* رندر اصلی دفتر روزانه */

/* ───── کرکره‌ها (details) و پیگیری «فردا می‌پرسم» و بررسی هماهنگی با برنامه‌ی هفتگی ───── */
(function(){if(document.getElementById('djAccCss'))return;const c=document.createElement('style');c.id='djAccCss';
c.textContent='details.dj-acc{padding:0!important;overflow:hidden}details.dj-acc>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 14px;font-weight:800;font-size:14px;user-select:none;-webkit-tap-highlight-color:transparent}details.dj-acc>summary::-webkit-details-marker{display:none}details.dj-acc>summary::after{content:"▾";margin-inline-start:auto;font-size:14px;color:#64748b;transition:transform .2s}details.dj-acc[open]>summary::after{transform:rotate(180deg)}details.dj-acc>summary em{font-style:normal;font-size:11.5px;font-weight:700;background:#f1f5f9;color:#475569;padding:2px 9px;border-radius:999px}details.dj-acc>summary em.warn{background:#ffe9d6;color:#b45309}details.dj-acc>summary small{font-weight:600;color:#64748b}.dj-acc-b{padding:0 14px 14px}.dj-fu-i{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:8px 0;border-top:1px dashed #e2e8f0}.dj-fu-i .dj-fu-t{flex:1 1 220px;min-width:0;overflow-wrap:anywhere;font-size:13px;line-height:1.8}.dj-fu-i .dj-fu-b{display:flex;gap:5px;flex-wrap:wrap}.dj-fu-i button{font:700 12px Vazirmatn,Tahoma,sans-serif;border:1px solid #e2e8f0;background:#fff;border-radius:9px;padding:6px 10px;cursor:pointer}@media(max-width:560px){.dj-acc-b{padding:0 8px 10px}details.dj-acc>summary{padding:10px 10px;font-size:13.5px}#djBat table{font-size:12px}#djBat th,#djBat td{padding-left:2px!important;padding-right:2px!important}}';
document.head.appendChild(c);
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.matches&&d.matches('details[data-acc]')){st.acc=st.acc||{};st.acc[d.dataset.acc]=d.open}},true)})();
const accOpen=(key,def)=>(st.acc&&st.acc[key]!=null)?st.acc[key]:def;
const accHtml=(key,title,badge,body,def,warn)=>`<details class="card dj-acc" data-acc="${key}"${accOpen(key,def)?' open':''}><summary><span>${title}</span>${badge?`<em${warn?' class="warn"':''}>${badge}</em>`:''}</summary><div class="dj-acc-b">${body}</div></details>`;
const dayDiff=(a,b)=>Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5);

/* پیگیری‌ها: D().fu = [{id,sid,k0,b,it,an,c,st:'open'|'done'|'drop',kd,lv,sn,src,note}] — فقط دانش‌آموزانی که معلم گفته «فردا ازت می‌پرسم» */
const FU_RX=/فردا|پرسیده\s*می[‌ ]?شود|می[‌ ]?پرسم|بعداً\s*(می[‌ ]?)?پرس|دوباره\s*(می[‌ ]?)?پرس/;
const fuList=()=>{const d=D();if(!Array.isArray(d.fu))d.fu=[];return d.fu};
const fuName=sid=>{const q=sts().find(x=>String(x.id)===String(sid));return q?q.name:'؟'};
function fuNew(o){const L=fuList();L.push(Object.assign({id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),st:'open',sn:0},o));save()}
function fuActInfo(k,b,it){try{const s=getSes(k,b);const x=s&&s.it&&s.it[it];return{an:x?x.n:'',c:s?s.c:null}}catch(e){return{an:'',c:null}}}
function fuSuggest(k){/* یادداشت‌های دستیِ معلم که شبیه «فردا می‌پرسم» هستند و هنوز پیگیری نشده‌اند */
 const d=D(),out=[],done=new Set(fuList().map(x=>x.src).filter(Boolean)),ign=d.fuIgn||{};
 Object.keys(d.n||{}).forEach(nk=>{const p=nk.split('|');if(p.length<4)return;const dk=p[0];if(dk>k)return;
  const txt=typeof d.n[nk]==='string'?d.n[nk]:'';if(!txt||!FU_RX.test(txt)||done.has(nk)||ign[nk])return;
  out.push({nk,k0:dk,b:p[1],it:p[2],sid:p[3],txt})});
 out.sort((a,b)=>a.k0<b.k0?1:-1);return out.slice(0,8)}
function fuCard(k){
 const L=fuList(),open=L.filter(x=>x.st==='open'&&x.k0<=k),due=open.filter(x=>x.k0<k),later=open.filter(x=>x.k0>=k),doneToday=L.filter(x=>x.st==='done'&&x.kd===k),sug=fuSuggest(k);
 if(!open.length&&!doneToday.length&&!sug.length)return'';
 const LV4=[['4','خیلی خوب'],['3','خوب'],['2','قابل قبول'],['1','نیاز به تلاش بیشتر']];
 const row=(x,isDue)=>{const dd=dayDiff(x.k0,k),late=isDue&&dd>=2;
  return`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(fuName(x.sid))}</b> · ${esc(x.an||'فعالیت')}${x.c!=null?' <small style="color:#64748b">('+esc(cname(x.c))+')</small>':''}<br><small style="color:${late?'#c0262c':'#64748b'}">${isDue?(late?'⚠️ '+fa(dd)+' روز معوق — ':'موعد پرسش: امروز — '):'برای فردا ثبت شد — '}گفته‌شده در ${esc(dlab(x.k0))}${x.sn?' · '+fa(x.sn)+' بار موکول شده':''}</small></div>
   <div class="dj-fu-b">${isDue?LV4.map(v=>`<button type="button" data-dj="fulv:${x.id}:${v[0]}" title="پرسیده شد؛ نتیجه: ${v[1]}">${v[1]}</button>`).join('')+`<button type="button" data-dj="fudone:${x.id}">✅ پرسیده شد</button><button type="button" data-dj="fusnooze:${x.id}">↪ باز هم فردا</button>`:''}<button type="button" data-dj="fudrop:${x.id}" title="حذف از پیگیری (فراموش شد یا لازم نیست)">✖</button></div></div>`};
 let b='';
 if(due.length)b+=`<div style="font-weight:800;font-size:13px;margin-top:4px">🔔 باید امروز پرسیده شود</div>`+due.map(x=>row(x,true)).join('');
 if(later.length)b+=`<div style="font-weight:800;font-size:13px;margin-top:8px">🗓️ برای فردا ثبت شده</div>`+later.map(x=>row(x,false)).join('');
 if(doneToday.length)b+=`<div style="font-weight:800;font-size:13px;margin-top:8px">✅ امروز پرسیده شد</div>`+doneToday.map(x=>`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(fuName(x.sid))}</b> · ${esc(x.an||'فعالیت')}<br><small style="color:#64748b">گفته‌شده در ${esc(dlab(x.k0))}${x.lv?' · نتیجه: '+esc((LV4.find(v=>v[0]===String(x.lv))||[])[1]||''):''}</small></div><div class="dj-fu-b"><button type="button" data-dj="fureopen:${x.id}" title="برگرداندن به فهرست">↩</button></div></div>`).join('');
 if(sug.length)b+=`<div style="font-weight:800;font-size:13px;margin-top:10px">📝 یادداشت‌هایی که شبیه «فردا می‌پرسم» هستند (هنوز پیگیری نشده)</div><div style="font-size:11.5px;color:#64748b">اگر آن پرسش انجام نشده، «ثبت پیگیری» بزنید تا در فهرست بماند و فراموش نشود.</div>`+sug.map(x=>{const ai=fuActInfo(x.k0,x.b,x.it);return`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(fuName(x.sid))}</b> · ${esc(ai.an||'فعالیت')} · <small>${esc(dlab(x.k0))}</small><br><small style="color:#475569">«${esc(x.txt.length>90?x.txt.slice(0,88)+'…':x.txt)}»</small></div><div class="dj-fu-b"><button type="button" data-dj="fuadopt:${esc(x.nk)}">🗓️ ثبت پیگیری</button><button type="button" data-dj="fuign:${esc(x.nk)}">نادیده</button></div></div>`}).join('');
 const badge=due.length?fa(due.length)+' پرسش معوق/موعد':(later.length?fa(later.length)+' برای فردا':(sug.length?fa(sug.length)+' یادداشت برای بررسی':'امروز انجام شد'));
 return accHtml('fu','🗓️ «فردا می‌پرسم» — پرسش‌های موکول‌شده',badge,b,due.length>0||sug.length>0,due.length>0)}

/* هماهنگی زنگ‌های ثبت‌شده با برنامه‌ی هفتگیِ همان تاریخ
   نکته: «املا» و «انشا» در برنامه‌ی هفتگی یک خانه‌ی جدا هستند ولی درس آن‌ها «فارسی» است؛ پس در مقایسه با فارسی یکی حساب می‌شوند. */
const KIND_ALIAS=[['انشا','فارسی'],['انشا و نگارش','فارسی'],['املا','فارسی'],['ورزش','تربیت بدنی']];
function canonName(cid,k){const n=String(cname(cid)||'').trim(),w=wscFor(k)||{};
 const kinds=(w.kinds||[]).filter(q=>q&&q.cn).map(q=>({name:q.name,cn:q.cn})).concat(KIND_ALIAS.map(a=>({name:a[0],cn:a[1]})));
 const f=kinds.find(q=>String(q.name).trim()===n);return f?f.cn:n}
const sameCourse=(a,b,k)=>a!=null&&b!=null&&canonName(a,k)===canonName(b,k);
function kindNames(k,i){try{const w=wscFor(k),v=w.cell[dow(k)+'_'+i];return(Array.isArray(v)?v:[v]).map(x=>x&&typeof x==='object'?x:{c:x}).filter(x=>x.k!=null).map(x=>{const kd=(w.kinds||[]).find(q=>q.id===x.k);return kd?String(kd.name).trim():''}).filter(Boolean)}catch(e){return[]}}
/* برچسب زنگ ویژه (cl-v167): اگر در برنامه‌ی هفتگی خانه‌ی زنگ «املا» یا «نگارش/انشا» باشد، دقیقاً همان نام نوشته می‌شود
   (نه «فارسی | املا» و نه «فارسی»). بقیه‌ی زیرمجموعه‌ها (حفظ شعر، معنی مخالف کلمات…) همان «فارسی | …» می‌مانند. */
const SPECIAL_LABELS=['املا','انشا','نگارش','انشا و نگارش'];
function specialKind(k,b){try{const bs=String(b),s=getSes(k,bs);
  if(bs.charAt(0)!=='m'){const w=wscFor(k),v=w&&w.cell?w.cell[dow(k)+'_'+bs]:null;
   const arr=(Array.isArray(v)?v:[v]).filter(x=>x!=null&&x!=='').map(x=>x&&typeof x==='object'?x:{c:x});
   if(arr.length&&arr.every(x=>x.k!=null)){
    const kds=arr.map(x=>(w.kinds||[]).find(q=>q.id===x.k)).filter(Boolean);
    const names=kds.map(q=>String(q.name).trim()).filter(n=>SPECIAL_LABELS.indexOf(n)>=0);
    if(names.length&&names.length===kds.length){
     if(!s||kds.some(q=>q.cn&&canonName(s.c,k)===q.cn)||names.indexOf(String(cname(s.c)).trim())>=0)return names.join(' + ')}}}
  const n=s?String(cname(s.c)).trim():'';
  return SPECIAL_LABELS.indexOf(n)>=0?n:''}catch(e){return''}}
const hasItems=s=>!!(s&&s.it&&Object.keys(s.it).length);
const nmB=b=>String(b).charAt(0)==='m'?'زنگ دستی':'زنگ '+(ORD[+b]||b);
/* پیشنهاد هماهنگ‌سازی: هر زنگِ ثبت‌شده به زنگِ هم‌درس در برنامه‌ی همان روز می‌رود؛ چیزی حذف نمی‌شود */
function schedPlan(k){const d=D(),T=bells(k);if(!T.length)return null;
 const R=Object.keys(d.ses||{}).filter(x=>x.indexOf(k+'|')===0).map(x=>({b:x.slice(k.length+1),s:d.ses[x]})).filter(r=>hasItems(r.s));
 const pairs=[];
 R.forEach(r=>T.forEach(t=>{if(!t.cids.some(cid=>sameCourse(r.s.c,cid,k)))return;let sc=1;const kn=kindNames(k,t.i),rn=String(cname(r.s.c)).trim();if(kn.indexOf(rn)>=0)sc+=3;if(r.b===t.i)sc+=2;pairs.push({r,t,sc})}));
 pairs.sort((a,b)=>b.sc-a.sc||((+a.t.i)-(+b.t.i)));
 const uR=new Set(),uT=new Set(),asg=[];
 pairs.forEach(p=>{if(uR.has(p.r.b)||uT.has(p.t.i))return;uR.add(p.r.b);uT.add(p.t.i);asg.push(p)});
 const moves=[];
 asg.forEach(p=>{const cid=p.t.cids.find(c=>sameCourse(p.r.s.c,c,k));const recourse=String(p.r.s.c)!==String(cid)?cid:null;
  if(p.r.b!==p.t.i||recourse!=null)moves.push({from:p.r.b,to:p.t.i,cid:recourse,cn0:cname(p.r.s.c),cn1:recourse!=null?cname(recourse):null,sub:(recourse!=null&&!String(p.r.s.tp||'').trim())?cname(p.r.s.c):null})});
 const stay=R.filter(r=>!uR.has(r.b)),targets=new Set(moves.map(m=>m.to)),reloc=[];
 stay.forEach(r=>{if(T.some(t=>t.i===r.b)&&targets.has(r.b))reloc.push({from:r.b,cn0:cname(r.s.c)})});
 return{moves,stay,reloc,T,R}}
function takeBell(k,b){const d=D(),pf=k+'|'+b+'|',o={ses:d.ses[k+'|'+b],m:{},n:{},pm:{}};
 ['m','n','pm'].forEach(n0=>{const src=d[n0];if(!src)return;Object.keys(src).forEach(key=>{if(key.indexOf(pf)===0){o[n0][key.slice(pf.length)]=src[key];delete src[key]}})});
 delete d.ses[k+'|'+b];return o}
function putBell(k,b,o,cid,sub){const d=D(),pf=k+'|'+b+'|';if(!o.ses)return;if(cid!=null)o.ses.c=cid;if(sub)o.ses.tp=sub;d.ses[k+'|'+b]=o.ses;
 ['m','n','pm'].forEach(n0=>{if(!d[n0])d[n0]={};Object.keys(o[n0]).forEach(x=>{d[n0][pf+x]=o[n0][x]})})}
function applyPlan(k,pl){const d=D(),items=pl.moves.map(m=>({from:m.from,to:m.to,cid:m.cid,sub:m.sub}));
 let n=1;const nextM=()=>{while(d.ses[sesKey(k,'m'+n)]||items.some(x=>x.to==='m'+n))n++;return'm'+n};
 pl.reloc.forEach(r=>items.push({from:r.from,to:nextM(),cid:null,sub:null}));
 try{if(Array.isArray(S.hwl))S.hwl=S.hwl.filter(h=>!(h&&typeof h.id==='string'&&items.some(x=>h.id.indexOf('dj:'+k+'|'+x.from+'|')===0)))}catch(e){}
 try{fuList().forEach(f=>{if(f.k0!==k)return;const it=items.find(q=>q.from===f.b);if(it)f.b=it.to})}catch(e){}
 const bag=items.map(x=>({x,o:takeBell(k,x.from)}));
 bag.forEach(z=>putBell(k,z.x.to,z.o,z.x.cid,z.x.sub));
 try{items.forEach(x=>{const s=d.ses[k+'|'+x.to];Object.keys((s&&s.it)||{}).forEach(id=>syncHw(k,x.to,id,s))})}catch(e){}
 save()}
function schedIssues(k){try{const d=D(),T=bells(k),out=[];if(!T.length||(d.schOk&&d.schOk[k]))return out;
 T.forEach(x=>{const s=d.ses[k+'|'+x.i];if(hasItems(s)&&!x.cids.some(cid=>sameCourse(s.c,cid,k)))out.push({t:'diff',b:x.i,tc:x.cids,sc:s.c})});
 Object.keys(d.ses||{}).forEach(key=>{if(key.indexOf(k+'|')!==0)return;const b=key.slice(k.length+1);if(T.some(x=>x.i===b))return;const s=d.ses[key];if(!hasItems(s))return;
  const match=T.filter(x=>x.cids.some(cid=>sameCourse(s.c,cid,k))),free=match.find(x=>!hasItems(d.ses[k+'|'+x.i]));
  /* اگر جای هم‌درس در برنامه هست ولی پر است، این یک درس اضافه‌ی عادی است و هشدار نمی‌دهد */
  if(free||!match.length)out.push({t:'man',b,sc:s.c,to:free?free.i:null})});
 /* درس ثبت‌شده در زنگ برنامه، ولی با «ثبت زیر درس دیگر» (مثل املا به‌جای فارسی) */
 T.forEach(x=>{const s=d.ses[k+'|'+x.i];if(hasItems(s)&&x.cids.some(cid=>sameCourse(s.c,cid,k))&&!x.cids.some(cid=>String(cid)===String(s.c)))out.push({t:'alias',b:x.i,sc:s.c,tc:x.cids})});
 return out}catch(e){return[]}}
function schedCard(k){const I=schedIssues(k);if(!I.length)return'';
 const pl=schedPlan(k),has=pl&&(pl.moves.length||pl.reloc.length);
 let body=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:6px">درس‌های ثبت‌شده‌ی این روز با برنامه‌ی هفتگیِ همان روز یکی نیست. «املا» و «انشا» در برنامه‌ی هفتگی خانه‌ی جدا هستند ولی زیرمجموعه‌ی درس <b>فارسی</b> حساب می‌شوند. هیچ ارزشیابی‌ای پاک نمی‌شود. (از این نسخه به بعد، تغییر برنامه‌ی هفتگی روزهای گذشته را عوض نمی‌کند.)</div>`;
 body+=I.map(x=>x.t==='diff'?`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(nmB(x.b))}</b>: برنامه «${esc(x.tc.map(cname).join(' + '))}» است ولی «${esc(cname(x.sc))}» ثبت شده.</div></div>`
  :x.t==='alias'?`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(nmB(x.b))}</b>: «${esc(cname(x.sc))}» جدا ثبت شده ولی طبق برنامه زیر درس «${esc(x.tc.map(cname).join(' + '))}» است.</div></div>`
  :`<div class="dj-fu-i"><div class="dj-fu-t"><b>${esc(nmB(x.b))}</b> «${esc(cname(x.sc))}»${x.to!=null?` ثبت شده؛ طبق برنامه جایش ${esc(nmB(x.to))} است.`:' ثبت شده ولی در برنامه‌ی این روز زنگی با این درس نیست.'}</div></div>`).join('');
 if(has){body+=`<div style="margin-top:8px;border:1px dashed #f6c667;background:#fffaf0;border-radius:12px;padding:9px 11px"><b style="font-size:13px">✅ پیشنهاد هماهنگ‌سازی</b><div style="font-size:12.5px;line-height:2;margin-top:3px">`+
   pl.moves.map(m=>`• «${esc(m.cn0)}»: ${esc(nmB(m.from))} ← <b>${esc(nmB(m.to))}</b>${m.cn1?` و ثبت زیر درس «${esc(m.cn1)}»${m.sub?' (موضوع: '+esc(m.sub)+')':''}`:''}`).join('<br>')+
   (pl.reloc.length?'<br>'+pl.reloc.map(r=>`• «${esc(r.cn0)}» (${esc(nmB(r.from))}) چون در برنامه‌ی این روز جایی ندارد به یک «زنگ دستی» می‌رود`).join('<br>'):'')+
   `</div><div class="dj-fu-b" style="margin-top:6px"><button type="button" data-dj="schplan" style="background:#1a8f55;color:#fff;border-color:transparent;font-weight:800">اعمال پیشنهاد</button><button type="button" data-dj="schok" title="این روز طبق برنامه‌ی همان زمان بوده؛ دیگر هشدار نده">همین‌طور که هست بماند</button></div></div>`}
 else body+=`<div class="dj-fu-b" style="margin-top:6px"><button type="button" data-dj="schok" title="دیگر برای این روز هشدار نده">همین‌طور که هست بماند</button></div>`;
 return accHtml('sch','⚠️ ناهماهنگی با برنامه‌ی هفتگی',fa(I.length)+' مورد',body,true,true)}

function render(){const s=$('dj');if(!s)return;wscTrack();
  /* حضور و غیاب زنگ‌به‌زنگ (cl-v167): پیش‌فرض بسته؛ با عوض شدن تاریخ دوباره بسته می‌شود و فقط معلم خودش بازش می‌کند */
  if(st.batK!==st.k){st.batK=st.k;if(st.acc)delete st.acc.bat}
 const k=st.k,t=todayK();pickDefault();
 const L=dayBells(k),ses=st.b!=null?viewSes(k,st.b):null;
 const todayActs=getDayActivities(k);
 const todayCourses=new Set(todayActs.map(a=>a.courseId));
 const todayCoursesCount=todayCourses.size;
 const todayActsCount=todayActs.length;
 const evaluatedStudentIds=new Set();
 todayActs.forEach(a=>{
  const m=a.exam?(a.mkc?(examMkGroups((S.exams||[]).find(e=>e.id===a.exId)||{})[k]||{}):examMainMk((S.exams||[]).find(e=>e.id===a.exId)||{})):(D().m[a.fullKey]||{});
  Object.keys(m).forEach(sid=>{if(m[sid]!=null)evaluatedStudentIds.add(+sid)});
 });
 const todayStudentsEvaluated=evaluatedStudentIds.size;
 const todayStatus=dayJournalStatus(k);
 const caN=caDay(k).length;
 const PI=profInfo(),schoolName=PI.school,teacherName=PI.teacher||'— (در تنظیمات وارد کنید)',gradeName=PI.grade,sectionName=PI.sec;
 const pn=presN(k);

 let h=`<h2>📓 دفتر روزانه معلم</h2><p class="sub">ثبت سریع عملکرد دانش‌آموزان، مدیریت فعالیت‌های آموزشی و رهگیری وضعیت دفترهای کلاسی.</p>`;

 // ۱) سربرگ جامع دفتر روزانه (بخش چهارم - بند ۱)
 h+=`<div class="card dj-profile-header">
  <div class="dj-profile-info">
   <div class="dj-profile-title">🏫 ${esc(schoolName)} · پایه ${esc(gradeName)}${sectionName?' ('+esc(sectionName)+')':''}</div>
   <div class="dj-profile-meta">
     <span>آموزگار: <b>${esc(teacherName)}</b></span>
     <span aria-hidden="true">·</span>
     <span>تاریخ: <b>${esc(dlab(k))}</b>${k===t?' <small style="color:#1d4ed8;font-weight:800">(امروز)</small>':''}</span>
     <span aria-hidden="true">·</span>
     <span>وضعیت روز: <b style="color:${todayStatus.off===false?'#1d4ed8':todayStatus.color}">${todayStatus.off===false?'📘 روز آموزشی':todayStatus.badge}</b></span>
   </div>
  </div>
  <div class="dj-hd" style="margin:0">
   <button type="button" class="dj-sm" data-dj="nav:-1">‹ روز قبل</button>
   <button type="button" class="dj-day" data-dj="calendar" aria-label="انتخاب تاریخ">📅 تقویم شمسی</button>
   <button type="button" class="dj-sm" data-dj="nav:1">روز بعد ›</button>
   ${k!==t?`<button type="button" class="dj-sm on" data-dj="today">امروز</button>`:''}
  </div>
 </div>`;

 // هشدارهای تقویمی در صورت تعطیلی یا نامشخص بودن
 if(!wkSet()&&dow(k)>4)h+=`<div class="dj-warn">روزهای کاری مدرسه هنوز تنظیم نشده و این روز تعطیل فرض نشده است.${(()=>{const q=dstat(k);return q&&q.status==='unknown'?' وضعیت این روز «نامشخص» است (نه فعال، نه تعطیل).':''})()} اگر مدرسه‌ی شما این روز تعطیل است، <button type="button" class="dj-sm" data-dj="setwk">⚙️ روزهای کاری را تنظیم کنید</button></div>`;
 if(isOff(k)){const hi=hinfo(k),nrec=todayActsCount;if(hi&&hi.official)h+=`<div class="dj-ho" id="djHol">🎉 <b>تعطیل رسمی:</b> ${esc(hi.label)}<br><small>این روز «دفتر ثبت‌نشده» یا ناقص حساب نمی‌شود. ${nrec?`سوابق این روز: <b>${fa(nrec)}</b> فعالیت ثبت‌شده در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ اگر کلاسی برگزار شده، با «➕ ثبت فعالیت آموزشی جدید» ثبت کنید.'}</small></div>`;else if(hi&&hi.custom)h+=`<div class="dj-cu" id="djCu">🏫 <b>تعطیلی اختصاصی مدرسه${hi.emergency?' (اضطراری 🚨)':''}:</b> ${esc(hi.label)}${hi.reason?`<br><small>علت: ${esc(hi.reason)}</small>`:''}<br><small>${nrec?`سوابق ثبت‌شده‌ی این روز: <b>${fa(nrec)}</b> فعالیت در زیر است.`:'سابقه‌ای در این روز ثبت نشده؛ ثبت فعالیت در روز تعطیل نیاز به تأیید شما دارد.'}</small></div>`;else h+=`<div class="dj-warn">این روز تعطیل است${hi&&hi.label?' ('+esc(hi.label)+')':''}. ${nrec?`سوابق ثبت‌شده‌ی این روز: ${fa(nrec)} فعالیت.`:'اگر فعالیتی برگزار شده، با «➕ ثبت فعالیت آموزشی جدید» ثبت کنید.'}</div>`}


 /* cl-v169: هشدار «ناهماهنگی با برنامه‌ی هفتگی» به درخواست آموزگار حذف شد؛ درس ثبت‌شده در دفتر لازم نیست با زنگ برنامه‌ی هفتگی یکی باشد. */

 // ۲) کارت‌های آماری ۴گانه پویا (بخش چهارم - بند ۲)
 h+=`<div class="dj-stat-cards">
  <div class="dj-stat-c">
   <small>📚 دروس ثبت‌شده امروز</small>
   <b>${fa(todayCoursesCount)} درس</b>
   <span>${todayCoursesCount?'دارای فعالیت آموزشی':'بدون ثبت درس'}</span>
  </div>
  <div class="dj-stat-c">
   <small>📝 فعالیت‌های آموزشی امروز</small>
   <b>${fa(todayActsCount)} فعالیت</b>
   <span>ثبت‌شده در دفتر${caN?' · '+fa(caN)+' ثبت فعالیت کلاسی':''}</span>
  </div>
  <div class="dj-stat-c">
   <small>👥 دانش‌آموزان دارای ارزشیابی</small>
   <b>${fa(todayStudentsEvaluated)} نفر</b>
   <span>از مجموع ${fa(pn)} حاضرین کلاس</span>
  </div>
 </div>`;

 // ۴) جدول اصلی فعالیت‌های روز جاری (بخش چهارم - بند ۳)
 h+=`<div class="card dj-acts-card">
  <div class="dj-ph">
    <b style="font-size:15px;color:#1e3a8a">📋 فعالیت‌های آموزشی روز جاری (${esc(dshort(k))})</b>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button type="button" class="dj-sm on" style="background:#1a8f55;color:#fff;border-color:transparent;font-weight:800;padding:7px 12px" data-dj="opennewact">➕ ثبت فعالیت آموزشی جدید</button>
      <button type="button" class="dj-sm" data-dj="manual">＋ زنگ درسی</button>
    </div>
  </div>
  ${actsTableHtml(k, todayActs, pn)}
  <div style="display:flex;align-items:center;gap:12px;margin:8px 0;font-size:11.5px;color:var(--mut,#64748b);flex-wrap:wrap">
  <span>راهنمای وضعیت فعالیت:</span>
  <span><b style="color:#1a8f55">✅ تکمیل:</b> همه دانش‌آموزان حاضر کلاس در این فعالیت ارزیابی شده‌اند.</span>
  <span><b style="color:#b45309">🟡 ناقص:</b> بخشی از دانش‌آموزان هنوز ارزیابی نشده‌اند (دکمه ارزشیابی را بزنید).</span>
</div>
 </div>`;


 /* cl-v170: کارت‌های «فعالیت‌های کلاسی دانش‌آموزان در این روز» و «بررسی تکالیف این روز» به درخواست آموزگار از دفتر روزانه برداشته شد. */

 h+=suggCard();
 h+=calHtml();

 // ۵) اگر زنگ/فعالیتی برای ارزشیابی انتخاب شده
 if(ses)h+=sessionCard(k,st.b,ses);

 // بخش «وضعیت دفتر» به درخواست آموزگار حذف شده است.

 h+=fuCard(k);
 h+=(window.BellAtt&&window.BellAtt.cardHtml?window.BellAtt.cardHtml(k):'');
 // ۳) ابزارهای گزارش رسمی
 const repBody=`<div class="dj-nt" style="margin-top:8px;flex-wrap:wrap">
    <button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:13px;padding:9px 15px;border-radius:12px;border:0;cursor:pointer;font-weight:800" data-dj="teacherreport">📋 گزارش دفتر روزانه معلم (A4 افقی / عمودی با حضور و غیاب)</button>
    <select class="dj-in" data-report-period aria-label="بازه گزارش"><option value="week"${st.reportPeriod==='week'?' selected':''}>گزارش هفتگی</option><option value="month"${st.reportPeriod==='month'?' selected':''}>گزارش ماهانه</option><option value="year"${st.reportPeriod==='year'?' selected':''}>گزارش سالانه</option></select>
    <button type="button" class="dj-sm" data-dj="report">🖨️ خروجی استاندارد</button>
  </div>
  <small style="color:var(--mut,#888)">گزارش دفتر روزانه معلم شامل عملکرد هر روز در کنار حضور و غیاب دانش‌آموزان در برگه A4 افقی (ماهانه) یا عمودی (هفتگی) آماده چاپ است.</small>`;
 /* ترتیب نهایی (cl-v170): فعالیت‌های امروز ← پیشنهاد برای معلم ← پنل ارزشیابی ← پیگیری‌ها ← گزارش‌های رسمی ← پیگیری پیشرفت درس ← جدول عملکرد (کرکره) ← توزیع توجه (کرکره) */
 h+=accHtml('rep','📄 گزارش‌های رسمی و چاپی دفتر روزانه','',repBody,false);
 h+=(window.SubjTrack&&window.SubjTrack.cardHtml?window.SubjTrack.cardHtml(k):'');
 h+=mxCard();
 h+=focusCard();


 // ۸) مودال‌ها
 h+=teacherReportModalHtml();
 h+=actModalHtml();

 const w0=s.querySelector('.dj-mxw'),sl=w0?w0.scrollLeft:null;
 s.innerHTML=h;
 if(sl!=null){const w1=s.querySelector('.dj-mxw');if(w1)w1.scrollLeft=sl}
}

/* ───── جدول عملکرد هفتگی / ماهانه (پیش‌نمایش زنده، بر پایه‌ی همان داده‌ی دفتر) ───── */
function mxAnchor(){return st.mx.k||st.k||todayK()}
function mxRange(){const a=mxAnchor();
 if(st.mx.m==='month'){const p=jparts(a),from=jiso(p.y,p.m,1),to=jiso(p.y,p.m,jlen(p.y,p.m));return{from,to,title:'ماه '+JMN[p.m-1]+' '+fa(p.y),kind:'ماهانه'}}
 const from=addD(a,-dow(a)),to=addD(from,6);return{from,to,title:dshort(from)+' تا '+dshort(to),kind:'هفتگی'}}
/* ستون‌های جدول عملکرد: برای هر روز، اول ستون «حضور و غیاب» همان روز و بعد فعالیت‌های همان روز */
const isExcX=(k,sid)=>{try{return typeof window.isExc==='function'&&!!window.isExc(k,sid)}catch(e){return false}};
const pnHtml=q=>{q=pnOne(q);const b='display:inline-block;direction:ltr;unicode-bidi:isolate;font-weight:900;font-size:15px';return q[0]?`<span style="${b}">＋</span>`:(q[1]?`<span style="${b}">−</span>`:'')};
function attCell(k,sid){const v=((S.att||{})[k]||{})[sid];
 if(v==null)return{t:'',c:'em',tt:'حضور و غیاب ثبت نشده'};
 if(v==='a')return isExcX(k,sid)?{t:'غ م',c:'ax',tt:'غایب موجه'}:{t:'غ',c:'ab',tt:'غایب'};
 if(v==='l')return{t:'تأ',c:'lt',tt:'تأخیر'};
 return{t:'ح',c:'pr',tt:'حاضر'}}
/* روز غیرآموزی برای جدول عملکرد: تعطیل رسمی، تعطیلی مدرسه/اضطراری، تعطیل هفتگی طبق «روزهای کاری مدرسه»؛
   اگر روزهای کاری تنظیم نشده باشد، پنجشنبه و جمعه (مثل بخش حضور و غیاب) تعطیل حساب می‌شود. */
function mxOff(k){try{if(isOffDay(k)||isOff(k))return true;if(!wkSet()&&dow(k)>4)return true}catch(e){}return false}
function mxCols(from,to,cf,withAtt){const d=D(),acts=[];
 Object.keys(d.m).forEach(key=>{const p=key.split('|'),k=p[0];if(!from||k<from||k>to||mxOff(k))return;
  const ses=d.ses[k+'|'+p[1]],it=ses&&(ses.it||{})[p[2]],mk=d.m[key];if(!it||!mk||!Object.keys(mk).length)return;
  if(cf!=='all'&&String(ses.c)!==String(cf))return;
  const t=it.t==='d'?'d':(it.t==='p'?'p':'g');
  acts.push({kind:'act',key,k,b:p[1],id:p[2],c:ses.c,t,n:it.n,mk,pm:t==='p'?(d.pm[key]||{}):null})});
 (Array.isArray(S.exams)?S.exams:[]).forEach(e=>{if(!e||!e.date||!from||e.date<from||e.date>to||mxOff(e.date))return;
  if(cf!=='all'&&String(e.course)!==String(cf))return;
  const mk=examMainMk(e),ms=examMkState(e);
  if(!Object.keys(mk).length&&!Object.keys(ms.pend).length&&!Object.keys(ms.exempt).length&&!Object.keys(ms.moved).length&&!Object.keys(ms.out).length)return;
  acts.push({kind:'act',key:'exam|'+e.id,k:e.date,b:'x99',id:'x'+e.id,c:e.course,t:'x',n:'📝 '+examName(e),mk,pm:null,pend:ms.pend,exempt:ms.exempt,moved:ms.moved,out:ms.out})});
 /* ستون‌های «جبرانی»: در تاریخ واقعی آزمون جبرانی (مستقل از تاریخ آزمون اصلی) */
 (Array.isArray(S.exams)?S.exams:[]).forEach(e=>{if(!e||!e.date)return;
  if(cf!=='all'&&String(e.course)!==String(cf))return;
  const g=examMkGroups(e);
  Object.keys(g).forEach(dd=>{if(!from||dd<from||dd>to)return;
   acts.push({kind:'act',key:'exam|'+e.id+'|mk|'+dd,k:dd,b:'x98',id:'x'+e.id,c:e.course,t:'x',mkc:true,mkFrom:e.date,n:'🔁 جبرانی: '+examName(e),mk:g[dd],pm:null})})});
 const bo=b=>(String(b).charAt(0)==='m'?100:0)+(+String(b).replace(/\D/g,'')||0);
 acts.sort((a,b)=>a.k<b.k?-1:a.k>b.k?1:(bo(a.b)-bo(b.b))||(a.id<b.id?-1:a.id>b.id?1:0));
 const days=new Set(acts.map(a=>a.k));
 if(withAtt&&cf==='all')Object.keys(S.att||{}).forEach(k=>{if(from&&k>=from&&k<=to&&!mxOff(k)&&S.att[k]&&Object.keys(S.att[k]).length)days.add(k)});
 const out=[];
 [...days].sort().forEach(k=>{if(withAtt)out.push({kind:'att',k,key:'att|'+k});acts.filter(a=>a.k===k).forEach(a=>out.push(a))});
 return out}
/* هفته‌ها/ماه‌های دارای داده (بدون روزهای تعطیل) برای انتخاب سریع — مثل «هفته‌های ثبت‌شده» در حضور و غیاب */
const WK_ORD=['اول','دوم','سوم','چهارم','پنجم','ششم','هفتم'];
/* مالک هفته (شنبه تا جمعه) = ماهِ اولین روز آموزشیِ آن هفته؛ شماره = ترتیب هفته‌های آموزشی همان ماه */
function mxWeekOwner(w){for(let i=0;i<7;i++){const k=addD(w,i);if(mxOff(k))continue;const p=jparts(k);if(p&&isAcademicMonth(p.m))return{y:p.y,m:p.m,first:k}}return null}
function mxWeekMeta(w){const o=mxWeekOwner(w);if(!o)return null;
 let ws=addD(o.first,-dow(o.first)),n=0,g=0;const first1=jiso(o.y,o.m,1);ws=addD(first1,-dow(first1));
 while(ws<=w&&g++<8){const x=mxWeekOwner(ws);if(x&&x.y===o.y&&x.m===o.m)n++;ws=addD(ws,7)}
 let last=o.first;for(let i=0;i<7;i++){const k=addD(w,i);if(!mxOff(k)&&k>=o.first)last=k}
 return{y:o.y,m:o.m,n:Math.max(1,n),first:o.first,last}}
function mxRegistered(){const d=D(),days=new Set();
 Object.keys(d.m).forEach(key=>{const mk=d.m[key];if(mk&&Object.keys(mk).length)days.add(key.split('|')[0])});
 Object.keys(S.att||{}).forEach(k=>{const a=S.att[k];if(a&&Object.keys(a).length)days.add(k)});
 const weeks={},months={};
 [...days].sort().forEach(k=>{if(mxOff(k))return;const p=jparts(k);if(!p||!isAcademicMonth(p.m))return;
  const w=addD(k,-dow(k));(weeks[w]=weeks[w]||[]).push(k);
  const mk=p.y+'-'+p.m;(months[mk]=months[mk]||{y:p.y,m:p.m,first:k});if(k<months[mk].first)months[mk].first=k});
 const W=Object.keys(weeks).sort().map(w=>{const mt=mxWeekMeta(w);return mt?Object.assign({w,days:weeks[w]},mt):null}).filter(Boolean);
 return{weeks:W,months:Object.values(months).sort((a,b)=>a.y*100+a.m-(b.y*100+b.m))}}
function mxPicker(B){const R=mxRegistered(),a=mxAnchor();
 if(st.mx.m==='month'){const p=jparts(a);
  return `<div class="dj-mxbar dj-mxpk"><b style="width:100%;font-size:13px">📅 ماه‌های ثبت‌شده (${fa(R.months.length)})</b>`+(R.months.map(x=>`<button type="button" class="dj-sm${x.m===p.m&&x.y===p.y?' on':''}" data-dj="mxpick:${x.first}">${JMN[x.m-1]} ${fa(x.y)}</button>`).join('')||'<span class="sub">هنوز ماهی با داده ثبت نشده</span>')+'</div>'}
 const cw=addD(a,-dow(a));let cur='',h='';
 R.weeks.forEach(x=>{const mk=x.y+'-'+x.m;if(mk!==cur){cur=mk;h+=`<span class="dj-mxmh">${JMN[x.m-1]} ${fa(x.y)}</span>`}
  const pa=jparts(x.first),pb=jparts(x.last);
  h+=`<button type="button" class="dj-sm${x.w===cw?' on':''}" data-dj="mxpick:${x.first}" title="${fa(pa.m+'/'+pa.d)} تا ${fa(pb.m+'/'+pb.d)}">هفته ${WK_ORD[x.n-1]||fa(x.n)}</button>`});
 return `<div class="dj-mxbar dj-mxpk"><b style="width:100%;font-size:13px">📅 هفته‌های ثبت‌شده (${fa(R.weeks.length)})</b>${h||'<span class="sub">هنوز هفته‌ای با داده ثبت نشده</span>'}</div>`}
function mxBuild(){const R=mxRange();return{R,cols:mxCols(R.from,R.to,st.mx.c,true)}}
const MXS={4:['خ خ','l4','خیلی خوب'],3:['خ','l3','خوب'],2:['ق ق','l2','قابل قبول'],1:['ن ت','l1','نیاز به تلاش بیشتر']};
/* ───── جدول عملکرد: ساخت جدول (صفحه + چاپ + PDF با یک کد) ───── */
/* تقسیم ستون‌ها به بخش‌های هم‌اندازه (هر بخش = یک صفحه)؛ ستون‌های یک روز تا حد امکان کنار هم می‌مانند */
function mxChunk(cols,per){const nn=Math.max(1,Math.ceil(cols.length/per));per=Math.min(per,Math.ceil(cols.length/nn)+3);const days=[];
 cols.forEach(c=>{const g=days[days.length-1];if(g&&g.k===c.k)g.c.push(c);else days.push({k:c.k,c:[c]})});
 const out=[];let cur=[];
 days.forEach(g=>{const c=g.c;
  if(c.length>per){if(cur.length){out.push(cur);cur=[]}for(let i=0;i<c.length;i+=per)out.push(c.slice(i,i+per));return}
  if(cur.length+c.length>per){out.push(cur);cur=[]}
  cur=cur.concat(c)});
 if(cur.length)out.push(cur);return out}
/* o.cols: زیرمجموعه‌ی ستون‌ها (برای هر صفحه)؛ o.pr: حالت چاپ/PDF (ستون‌های هم‌عرض، بدون اسکرول)؛ o.num: ستون ردیف.
   سرتیترها همیشه وسط‌چین افقی و عمودی‌اند. اگر دانش‌آموز در آن روز غایب بوده، خانه‌های فعالیت همان روز خالی می‌ماند. */
function mxTable(B,o){o=o||{};const cols=o.cols||B.cols;if(!cols.length)return'';
 const pr=!!o.pr,maxLen=sts().reduce((m,s)=>Math.max(m,(s.name||'').trim().length),0);
 const nmW=pr?Math.min(185,Math.max(105,Math.ceil(maxLen*5.3)+20)):Math.max(120,Math.ceil(maxLen*7.2)+22);
 const cap=pr?30:36;let alt=0,prevDate=null,maxH=0;
 const head=cols.map(c=>{
  const isNewDate=(c.k!==prevDate);
  if(isNewDate){alt^=1;prevDate=c.k}
  c.alt=alt;
  const jp=jparts(c.k),dt=WDN[dow(c.k)]+' | '+fa(jp.d)+' '+JMN[jp.m-1];
  if(c.kind==='att'){maxH=Math.max(maxH,(isNewDate?dt.length+3:0)+12);
   return`<th class="h at${alt?' d1':''}${isNewDate?' first-act':''}" title="${esc(dlab(c.k)+' — حضور و غیاب')}"><span>${isNewDate?`<b>${esc(dt)}</b> | `:''}حضور و غیاب</span></th>`}
  const sk=c.t==='x'?'':specialKind(c.k,c.b),tx=sk||(cname(c.c)+' | '+c.n),tt=dlab(c.k)+' — '+(c.t==='x'?(c.mkc?'آزمون جبرانی (آزمون اصلی '+dlab(c.mkFrom)+')':'آزمون'):bellLabel(c.k,c.b))+' — '+cname(c.c)+' — '+c.n;
  const mxT=isNewDate?cap-dt.length:cap,txs=tx.length>mxT?tx.slice(0,Math.max(10,mxT-1))+'…':tx;
  maxH=Math.max(maxH,(isNewDate?dt.length+3:0)+txs.length);
  return`<th class="h${c.t==='p'?' pnh':''}${c.mkc?' mkh':''}${alt?' d1':''}${isNewDate?' first-act':''}" title="${esc(tt)}"><span>${isNewDate?`<b>${esc(dt)}</b> | ${esc(txs)}`:esc(txs)}</span></th>`}).join('');
 const hh=Math.min(pr?200:190,Math.max(64,Math.ceil(maxH*(pr?4.7:6.1))+14));
 const body=sts().map((s,i)=>{
  const tds=cols.map(c=>{
   const EA=(pr||c.kind==='att')?'':` data-dj="mxedit:${encodeURIComponent(c.key)}:${s.id}" role="button" tabindex="0"`,EC=EA?' dj-ed':'';
   if(c.kind==='att'){const a=attCell(c.k,s.id);return pr?`<td class="c at ${a.c}" title="${a.tt}">${a.t}</td>`:`<td class="c at ${a.c} dj-atc" title="${a.tt} — برای تغییر (حاضر ← غایب ← تأخیر ← موجه ← خالی) کلیک کنید" data-dj="attcyc:${c.k}:${s.id}" role="button" tabindex="0">${a.t||'·'}</td>`}
   if(c.mkc){const v0=c.mk[s.id],m0=MXS[v0];if(v0==null||!m0)return`<td class="c em"></td>`;
    const bd='<i style="display:block;font-style:normal;font-size:8px;line-height:1;font-weight:800;margin-top:1px">جبرانی</i>';
    return`<td class="c ${m0[1]}${EC}" title="${m0[2]} — آزمون جبرانی (آزمون اصلی ${esc(dlab(c.mkFrom))})${pr?'':' — برای ویرایش کلیک کنید'}"${EA}><span class="c-txt">${m0[0]}</span>${bd}</td>`}
   if(c.t==='x'&&c.moved&&c.moved[s.id])return`<td class="c em" style="color:#64748b"${pr?'':' title="در زمان آزمون در مدرسه نبود؛ نتیجه در تاریخ آزمون جبرانی ('+esc(dlab(c.moved[s.id]))+') ثبت شده است"'}>↪</td>`;
   if(c.t==='x'&&c.pend&&c.pend[s.id])return`<td class="c em" style="background:#fff4d6;color:#b26a00;font-size:9px;font-weight:800"${pr?'':' title="در روز آزمون غایب بود؛ در انتظار آزمون جبرانی (نمره‌ی صفر یا ارزشیابی منفی محسوب نمی‌شود)"'}>انتظار</td>`;
   if(c.t==='x'&&c.out&&c.out[s.id])return`<td class="c em" style="background:#ffe9d6;color:#b45309;font-size:9px;font-weight:800"${pr?'':' title="در زمان آزمون از مدرسه خارج شده بود؛ آزمون «انجام‌نشده به علت خروج» است (نه صفر و نه ارزشیابی منفی) — در انتظار آزمون جبرانی"'}>خروج</td>`;
   if(c.t==='x'&&c.exempt&&c.exempt[s.id])return`<td class="c em" style="color:#64748b"${pr?'':' title="در روز آزمون غایب بود و از آزمون جبرانی معاف شد"'}>معاف</td>`;
   if(absent(c.k,s.id))return`<td class="c em"${pr?'':' title="در این روز غایب بوده؛ ثبت ارزشیابی ممکن نیست"'}></td>`;
   const v=c.mk[s.id],hint=pr?'':' — برای ویرایش کلیک کنید';
   if(v==null&&c.t!=='x'&&c.b&&outB(c.k,c.b,s.id))return`<td class="c em" style="background:#ffe9d6;color:#b45309;font-size:9px;font-weight:800"${pr?'':' title="در این زنگ خارج از مدرسه بود؛ «انجام‌نشده به علت خروج» (نه صفر و نه منفی)"'}>خروج</td>`;
   if(v==null)return`<td class="c em${EC}"${pr?'':' title="ثبت نشده — برای ثبت کلیک کنید"'}${EA}></td>`;
   if(c.t==='d')return v===1?`<td class="c ok${EC}" title="انجام شد${hint}"${EA}>✓</td>`:`<td class="c no${EC}" title="انجام نشد${hint}"${EA}>✗</td>`;
   if(c.t==='p'){const q=(c.pm||{})[s.id];if(q){const o1=pnOne(q);return`<td class="c pnc l${v}${EC}" title="${o1[0]?'پاسخ مثبت':'پاسخ منفی'}${hint}"${EA}>${pnHtml(q)}</td>`}}
   const m=MXS[v];return m?`<td class="c ${m[1]}${EC}" title="${m[2]}${hint}"${EA}><span class="c-txt">${m[0]}</span></td>`:`<td class="c em${EC}"${EA}></td>`}).join('');
  return`<tr>${o.num?`<td class="rn">${fa(i+1)}</td>`:''}<td class="nm">${esc(s.name)}</td>${tds}</tr>`}).join('');
 const tw=pr?`max-width:${nmW+(o.num?24:0)+cols.length*46}px;`:'';
 return`<table data-noresp="1" class="${pr?'pr':''}" style="${tw}--nmw:${nmW}px;--hh:${hh}px"><thead><tr>${o.num?'<th class="rn">ردیف</th>':''}<th class="nm">نام دانش‌آموز</th>${head}</tr></thead><tbody>${body}</tbody></table>`}
function bellLabel(k,b){try{const x=dayBells(k).find(q=>q.b===String(b));return x?bellName(k,x):'زنگ '+b}catch(e){return'زنگ '+b}}
function mxLegend(){return`<div class="dj-mxlg"><i style="background:#1a8f55">خ خ</i>خیلی خوب <i style="background:#55b043">خ</i>خوب <i style="background:#e2a300">ق ق</i>قابل قبول <i style="background:#d9363e">ن ت</i>نیاز به تلاش بیشتر <i style="background:#1a8f55">✓</i>انجام شد <i style="background:#d9363e">✗</i>انجام نشد <i style="background:#0f766e">+۲ −۱</i>مثبت / منفی <i style="background:#e3f4ea;color:#1a8f55">ح</i>حاضر <i style="background:#fde7e8;color:#c0262c">غ</i>غایب <i style="background:#ffe9d6;color:#b45309">غ م</i>غایب موجه <i style="background:#fff1cf;color:#b26a00">تأ</i>تأخیر · اولین ستون هر روز = حضور و غیاب همان روز (برای تغییر، روی خانه کلیک کنید) · هر خانه‌ی فعالیت/آزمون هم با یک کلیک قابل ویرایش است (سطح، انجام/نشد، مثبت/منفی یا نمره) · ستون 📝 = آزمونِ ثبت‌شده در «درس‌ها و آزمون‌ها» · ستون 🔁 جبرانی = نتیجه‌ی آزمون جبرانی در تاریخ واقعیِ آن (غایبِ روز آزمون در ستون آزمون اصلی «انتظار»، «↪» یا «معاف» می‌ماند و فقط یک‌بار شمرده می‌شود) · خانه‌ی خالی = ثبت نشده</div>`}

/* ───── داشبورد تحلیلی و نمودار وضعیت دانش‌آموزان در انتهای صفحه ───── */
/* سال تحصیلی (اول مهر تا آخر خرداد سال بعد) برای تاریخ k؛ مبنای «کل سال» در تحلیل‌ها */
function schoolYearOf(k){const p=jparts(k||mxAnchor())||{},y=p.m>=7?p.y:p.y-1;return{y,from:jiso(y,7,1)||'1900-01-01',to:jiso(y+1,6,31)||'2999-12-31'}}
/* شمار فعالیت‌های ثبت‌شده‌ی هر دانش‌آموز در هر درس در «کل سال تحصیلی» (مستقل از هفته/ماه انتخاب‌شده)؛ هر ثبت = یک مورد، آزمون‌ها هم شمرده می‌شوند */
function yearCourseStats(){const Y=schoolYearOf(),cols=mxCols(Y.from,Y.to,'all',false),R={};
 cols.forEach(c=>{if(c.kind==='att')return;const cNm=cname(c.c)||'سایر';
  Object.keys(c.mk||{}).forEach(sid=>{if(c.mk[sid]==null||(absent(c.k,+sid)&&!c.mkc))return;const r=R[sid]=R[sid]||{tot:0,by:{}};r.tot++;r.by[cNm]=(r.by[cNm]||0)+1})});
 return{Y,R}}
/* بازه‌ی نمودار حجم فعالیت‌ها (cl-v169): ماه شمسی، نیم‌سال اول (مهر تا دی) یا نیم‌سال دوم (بهمن تا خرداد)؛ نه روزانه و نه هفتگی */
function chartRange(){const cp=st.cp||(st.cp={m:'month',k:null}),a=cp.k||mxAnchor(),p=jparts(a)||{};
 if(cp.m==='h1'||cp.m==='h2'){const Y=schoolYearOf(a).y;
  if(cp.m==='h1')return{m:'h1',from:jiso(Y,7,1)||'1900-01-01',to:jiso(Y,10,jlen(Y,10))||'2999-12-31',title:'نیم‌سال اول '+fa(Y)+'–'+fa(Y+1)+' (مهر تا دی)'};
  return{m:'h2',from:jiso(Y,11,1)||'1900-01-01',to:jiso(Y+1,3,jlen(Y+1,3))||'2999-12-31',title:'نیم‌سال دوم '+fa(Y)+'–'+fa(Y+1)+' (بهمن تا خرداد)'}}
 return{m:'month',from:jiso(p.y,p.m,1)||'1900-01-01',to:jiso(p.y,p.m,jlen(p.y,p.m))||'2999-12-31',title:'ماه '+JMN[p.m-1]+' '+fa(p.y)}}
function chartShift(dir){const cp=st.cp||(st.cp={m:'month',k:null}),a=cp.k||mxAnchor(),p=jparts(a);if(!p)return;
 if(cp.m==='month'){let y=p.y,m=p.m+dir;if(m>12){m=1;y++}else if(m<1){m=12;y--}cp.k=jiso(y,m,1)||cp.k}
 else{const Y=schoolYearOf(a).y+dir;cp.k=jiso(Y,cp.m==='h1'?7:11,1)||cp.k}}
function classAnalyticsDashboard(B){
  const cols = B.cols || [];
  const students = sts();
  if(!students.length) return '';
  const YS = yearCourseStats();

  const studentStats = students.map(s => {
    let l4 = 0, l3 = 0, l2 = 0, l1 = 0, ok = 0, no = 0, abs = 0, tot = 0;
    const courseCounts = {};
    cols.forEach(c => {
      if(c.kind === 'att') return;
      const v = c.mk[s.id];
      if(v != null){
        tot++;
        const cId = String(c.c || 'other');
        const cNm = cname(c.c) || 'سایر';
        courseCounts[cNm] = (courseCounts[cNm] || 0) + 1;
        if(c.t === 'd'){ if(v === 1) ok++; else no++; }
        else { if(v === 4) l4++; else if(v === 3) l3++; else if(v === 2) l2++; else if(v === 1) l1++; }
      } else if(absent(c.k, s.id)){
        abs++;
      }
    });
    const positive = l4 + l3 + ok;
    const rate = tot > 0 ? Math.round((positive / tot) * 100) : 0;
    
    // Top course for this student
    let topCourse = '—', topCount = 0;
    Object.entries(courseCounts).forEach(([cnm, cnt]) => {
      if(cnt > topCount){ topCount = cnt; topCourse = cnm; }
    });

    const yr = YS.R[s.id] || {tot:0,by:{}};
    let yTop = '—', yCount = 0;
    Object.entries(yr.by).forEach(([cnm, cnt]) => { if(cnt > yCount){ yCount = cnt; yTop = cnm; } });
    return { student: s, l4, l3, l2, l1, ok, no, abs, tot, rate, courseCounts, topCourse: yTop, topCount: yCount, yTot: yr.tot };
  });

  const classTotals = { l4: 0, l3: 0, l2: 0, l1: 0, ok: 0, no: 0, tot: 0 };
  /* نمودار حجم فعالیت‌ها: بازه‌ی مستقل از جدول (ماه، نیم‌سال اول یا نیم‌سال دوم) و همه‌ی درس‌ها */
  const CP = chartRange();
  const courseActivityCounts = {};
  mxCols(CP.from, CP.to, 'all', false).forEach(c => {
    if(c.kind === 'att') return;
    const cNm = cname(c.c) || 'سایر';
    const evalCount = Object.keys(c.mk || {}).length;
    courseActivityCounts[cNm] = (courseActivityCounts[cNm] || 0) + evalCount;
  });

  studentStats.forEach(r => {
    classTotals.l4 += r.l4; classTotals.l3 += r.l3; classTotals.l2 += r.l2; classTotals.l1 += r.l1;
    classTotals.ok += r.ok; classTotals.no += r.no; classTotals.tot += r.tot;
  });

  const totMarks = classTotals.tot;
  const pL4 = totMarks > 0 ? Math.round((classTotals.l4 / totMarks) * 100) : 0;
  const pL3 = totMarks > 0 ? Math.round((classTotals.l3 / totMarks) * 100) : 0;
  const pL2 = totMarks > 0 ? Math.round((classTotals.l2 / totMarks) * 100) : 0;
  const pL1 = totMarks > 0 ? Math.round((classTotals.l1 / totMarks) * 100) : 0;

  const topStudents = [...studentStats].filter(r => r.tot > 0).sort((a,b) => (b.l4 - a.l4) || (b.rate - a.rate)).slice(0, 3);
  const mostActive = [...studentStats].filter(r => r.tot > 0).sort((a,b) => b.tot - a.tot).slice(0, 3);
  const needSupport = [...studentStats].filter(r => r.tot > 0 && (r.l1 > 0 || r.l2 > 0 || r.rate < 60)).sort((a,b) => (b.l1 - a.l1) || (b.l2 - a.l2) || (a.rate - b.rate)).slice(0, 3);
  const rankingList = [...studentStats].sort((a,b) => (b.rate - a.rate) || (b.l4 - a.l4) || (b.tot - a.tot));
  const medals = ['🥇', '🥈', '🥉'];

  // Course activity chart data
  const sortedCourses = Object.entries(courseActivityCounts).sort((a,b) => b[1] - a[1]);
  const maxCourseCount = Math.max(1, ...(sortedCourses.map(x => x[1])));

  return `<div class="dj-dash" id="djAnalyticsDash">
  <div class="dj-dash-hd">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <b style="font-size:15px;color:#1e3a8a">📊 داشبورد تحلیلی و وضعیت پویای دانش‌آموزان (${esc(B.R.title)})</b>
      <span class="dj-live" style="background:#2563eb18;color:#2563eb">گزارش ${esc(B.R.kind)}</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <button type="button" class="dj-sm on" style="background:#2563eb;color:#fff;border-color:transparent" data-dj="printdash">📄 دریافت PDF داشبورد تحلیلی</button>
      <small style="color:var(--mut,#666)">بر اساس مجموع ${fa(totMarks)} ثبت عملکرد کلاسی در این بازه</small>
    </div>
  </div>

  <div class="dj-dash-cards">
    <div class="dj-dash-card top">
      <b style="color:#1a8f55">🌟 زرنگ‌ترین دانش‌آموزان (بیشترین خیلی‌خوب)</b>
      <div class="st-list">
        ${topStudents.length ? topStudents.map((r,i) => `<div class="st-item"><span>${medals[i]||'⭐'} <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#1a8f55;border-color:#1a8f55">${fa(r.l4)} خیلی‌خوب (${fa(r.rate)}٪)</span></div>`).join('') : '<div style="color:var(--mut,#888)">هنوز ثبت سطحی انجام نشده است</div>'}
      </div>
    </div>
    <div class="dj-dash-card act">
      <b style="color:#5b3fd6">⚡ فعال‌ترین‌ها (بیشترین مشارکت)</b>
      <div class="st-list">
        ${mostActive.length ? mostActive.map((r,i) => `<div class="st-item"><span>${medals[i]||'🔹'} <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#5b3fd6;border-color:#5b3fd6">${fa(r.tot)} فعالیت ثبت‌شده</span></div>`).join('') : '<div style="color:var(--mut,#888)">هنوز فعالیتی ثبت نشده است</div>'}
      </div>
    </div>
    <div class="dj-dash-card need">
      <b style="color:#d9363e">🎯 نیازمند تلاش و تمرین (پیگیری آموزشی)</b>
      <div class="st-list">
        ${needSupport.length ? needSupport.map(r => `<div class="st-item"><span>⚠️ <b>${esc(r.student.name)}</b></span><span class="st-badge" style="color:#d9363e;border-color:#d9363e">${fa(r.l1)} نیاز به تلاش · ${fa(r.l2)} قابل قبول</span></div>`).join('') : '<div style="color:#1a8f55;font-weight:700">خوشبختانه موردی برای پیگیری اضطراری نیست 🎉</div>'}
      </div>
    </div>
  </div>

  <!-- بخش نمودار میزان فعالیت دروس -->
  <div class="dj-course-chart">
    <div class="dj-chart-title">📊 نمودار مقایسه‌ای حجم فعالیت‌های ثبت‌شده در هر درس</div>
    <div class="dj-cp-btns" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0">
      <button type="button" class="dj-sm ${CP.m==='month'?'on':''}" data-dj="cpmode:month">ماهانه</button>
      <button type="button" class="dj-sm ${CP.m==='h1'?'on':''}" data-dj="cpmode:h1">نیم‌سال اول</button>
      <button type="button" class="dj-sm ${CP.m==='h2'?'on':''}" data-dj="cpmode:h2">نیم‌سال دوم</button>
      <span style="flex:1"></span>
      <button type="button" class="dj-sm" data-dj="cpprev" aria-label="قبلی">‹ قبلی</button>
      <button type="button" class="dj-sm" data-dj="cpnext" aria-label="بعدی">بعدی ›</button>
    </div>
    <p class="sub" style="margin:2px 0 10px;font-size:11.5px">بازه: <b>${esc(CP.title)}</b> — مشخص‌کننده‌ی این‌که کدام درس‌ها بیشترین فعالیت و ارزشیابی کلاسی را در این بازه داشته‌اند:</p>
    ${sortedCourses.length ? sortedCourses.map(([cname, count], idx) => {
      const pct = Math.round((count / maxCourseCount) * 100);
      const colors = ['#2563eb', '#1a8f55', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4b5563'];
      const barColor = colors[idx % colors.length];
      return `<div class="dj-bar-row">
        <span class="dj-bar-lbl" title="${esc(cname)}">${esc(cname)}</span>
        <div class="dj-bar-track">
          <div class="dj-bar-fill" style="width:${pct}%;background:${barColor}">${pct > 15 ? fa(count) : ''}</div>
        </div>
        <span class="dj-bar-val">${fa(count)} ثبت</span>
      </div>`;
    }).join('') : '<div style="color:var(--mut,#888);font-size:12px;text-align:center;padding:8px">هنوز فعالیتی در درس‌ها ثبت نشده است.</div>'}
  </div>

  <!-- بخش تحلیل فعالیت هر دانش‌آموز در دروس -->
  <div class="dj-course-chart">
    <div class="dj-chart-title">🎓 بیشترین فعالیت هر دانش‌آموز در چه درسی بوده است؟</div>
    <p class="sub" style="margin:2px 0 10px;font-size:11.5px">مبنای محاسبه: همه‌ی فعالیت‌ها و ارزشیابی‌های ثبت‌شده از اول مهر ${fa(YS.Y.y)} تا پایان سال تحصیلی — مستقل از هفته یا ماهِ انتخاب‌شده در جدول.</p>
    <div class="dj-stu-grid">
      ${studentStats.map(r => `<div class="dj-stu-card">
        <b>${esc(r.student.name)}</b>
        <div style="color:var(--mut,#64748b)">درس محوری: <span style="color:#1d4ed8;font-weight:800">${esc(r.topCourse)}</span> (${fa(r.topCount)} ثبت)</div>
        <div style="font-size:11px;color:#1a8f55;font-weight:700">کل فعالیت‌های ثبت‌شده در سال تحصیلی: ${fa(r.yTot)} مورد</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="dj-dash-chart">
    <div class="dj-chart-title">📈 نمودار مقایسه‌ای توزیع سطوح عملکرد کلاس</div>
    ${totMarks > 0 ? `
      <div class="dj-dist-bar">
        ${pL4 > 0 ? `<div class="dj-dist-seg" style="width:${pL4}%;background:#1a8f55" title="خیلی خوب: ${pL4}٪">${pL4 > 8 ? fa(pL4) + '٪' : ''}</div>` : ''}
        ${pL3 > 0 ? `<div class="dj-dist-seg" style="width:${pL3}%;background:#55b043" title="خوب: ${pL3}٪">${pL3 > 8 ? fa(pL3) + '٪' : ''}</div>` : ''}
        ${pL2 > 0 ? `<div class="dj-dist-seg" style="width:${pL2}%;background:#e2a300" title="قابل قبول: ${pL2}٪">${pL2 > 8 ? fa(pL2) + '٪' : ''}</div>` : ''}
        ${pL1 > 0 ? `<div class="dj-dist-seg" style="width:${pL1}%;background:#d9363e" title="نیاز به تلاش: ${pL1}٪">${pL1 > 8 ? fa(pL1) + '٪' : ''}</div>` : ''}
      </div>
      <div class="dj-dist-lg">
        <span><i style="background:#1a8f55"></i>خیلی خوب: <b>${fa(classTotals.l4)}</b> مورد (${fa(pL4)}٪)</span>
        <span><i style="background:#55b043"></i>خوب: <b>${fa(classTotals.l3)}</b> مورد (${fa(pL3)}٪)</span>
        <span><i style="background:#e2a300"></i>قابل قبول: <b>${fa(classTotals.l2)}</b> مورد (${fa(pL2)}٪)</span>
        <span><i style="background:#d9363e"></i>نیاز به تلاش: <b>${fa(classTotals.l1)}</b> مورد (${fa(pL1)}٪)</span>
      </div>
    ` : `<div style="color:var(--mut,#888);font-size:12px;text-align:center;padding:8px">اطلاعات کافی برای رسم نمودار توزیع در این بازه وجود ندارد.</div>`}
  </div>

  <div class="dj-chart-title" style="margin-top:16px">📋 رتبه‌بندی عملکرد دانش‌آموزان با نوار پیشرفت</div>
  <div class="dj-dash-rank">
    <table>
      <thead>
        <tr>
          <th style="width:40px;text-align:center">رتبه</th>
          <th style="min-width:120px">نام دانش‌آموز</th>
          <th style="min-width:130px">نوار پیشرفت مطلوب</th>
          <th style="width:65px;text-align:center">درصد</th>
          <th style="width:65px;text-align:center">کل ثبت‌ها</th>
        </tr>
      </thead>
      <tbody>
        ${rankingList.map((r,i) => `<tr>
          <td style="text-align:center;font-weight:900">${i===0?'🥇':i===1?'🥈':i===2?'🥉':fa(i+1)}</td>
          <td style="font-weight:800">${esc(r.student.name)}</td>
          <td>
            <div class="dj-prog-wrap">
              <div class="dj-prog-bg">
                <div class="dj-prog-fill" style="width:${r.rate}%;background:${r.rate>=80?'#1a8f55':r.rate>=60?'#3f8f2a':r.rate>=40?'#d98600':'#d9363e'}"></div>
              </div>
            </div>
          </td>
          <td style="text-align:center;font-weight:900;color:${r.rate>=80?'#1a8f55':r.rate>=60?'#3f8f2a':r.rate>=40?'#b26a00':'#d9363e'}">${fa(r.rate)}٪</td>
          <td style="text-align:center;font-weight:700">${fa(r.tot)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
 </div>`;
}
function mxCard(){
  const B = mxBuild(), tb = mxTable(B), own = st.mx.k != null;
  const opt = `<option value="all"${st.mx.c==='all'?' selected':''}>همه‌ی درس‌ها</option>` + allCourses().map(c=>`<option value="${c.id}"${String(c.id)===String(st.mx.c)?' selected':''}>${esc(c.name)}</option>`).join('');
  const nAct = B.cols.filter(c=>c.kind==='act').length;
  const inner = `<div class="card dj-mx" id="djMx" style="box-shadow:none;border:0;padding:0;margin:0;background:transparent">
    <div class="dj-mxbar">
      <div class="dj-seg">
        <button type="button" class="${st.mx.m==='week'?'on':''}" data-dj="mxmode:week">هفتگی</button>
        <button type="button" class="${st.mx.m==='month'?'on':''}" data-dj="mxmode:month">ماهانه</button>
      </div>
      <button type="button" class="dj-sm" data-dj="mxprev" aria-label="قبلی">‹ قبلی</button>
      <div class="dj-mxt">${esc(B.R.title)}</div>
      <button type="button" class="dj-sm" data-dj="mxnext" aria-label="بعدی">بعدی ›</button>
      ${own ? `<button type="button" class="dj-sm" data-dj="mxnow">↻ هم‌گام با روز دفتر</button>` : ''}
    </div>
    ${mxPicker(B)}
    <div class="dj-mxbar">
      <select class="dj-in" data-mxc aria-label="فیلتر درس" style="max-width:200px">${opt}</select>
      
      <button type="button" class="dj-sm on" style="background:#1d4ed8;color:#fff;border-color:transparent" data-dj="teacherreport">📋 گزارش دفتر روزانه معلم (A4 چند صفحه‌ای)</button>
      <button type="button" class="dj-sm" data-dj="mxprint">🖨️ چاپ مستقیم</button>
      <button type="button" class="dj-sm on" style="background:#059669;color:#fff;border-color:transparent" data-dj="mxpdf">📄 خروجی فایل PDF</button>
    </div>
    ${tb ? `<div class="dj-mxw">${tb}</div>` : `<div class="dj-mxem">در این بازه هنوز عملکردی ثبت نشده است. با ثبت در بالای صفحه، جدول همین‌جا به‌روز می‌شود.</div>`}
    ${mxLegend()}
    ${classAnalyticsDashboard(B)}
  </div>`;
  return accHtml('mx','📊 جدول عملکرد دانش‌آموزان',fa(nAct)+' ستون فعالیت ثبت‌شده',inner,false);
}

/* ───── توزیع توجه معلم: چه دانش‌آموزی بیشتر مورد پرسش/ارزشیابی بوده و چه کسی کمتر دیده شده ───── */
function focusStats(range){
 const d=D(),end=(st.k&&st.k<=todayK())?st.k:todayK(),n=range==='all'?3650:(+range||14),from=addD(end,-(n-1));
 const inR=k=>k>=from&&k<=end&&!mxOff(k);
 const T={};sts().forEach(x=>{T[x.id]={s:x,j:0,c:0,pres:0,last:''}});
 Object.keys(d.m).forEach(key=>{const p=key.split('|'),k=p[0];if(k>end||mxOff(k))return;
  const ses=d.ses[k+'|'+p[1]],it=ses&&(ses.it||{})[p[2]],mk=d.m[key];if(!it||!mk)return;
  Object.keys(mk).forEach(sid=>{const r=T[sid];if(!r||mk[sid]==null)return;
   if(k>r.last)r.last=k;
   if(!inR(k))return;
   if(it.t==='p'){const q=(d.pm[key]||{})[sid];r.j+=1}else r.j+=1})});
 (S.activities||[]).forEach(x=>{const r=x&&T[x.sid];if(!r||!x.date||x.date>end||mxOff(x.date))return;if(x.date>r.last)r.last=x.date;if(inR(x.date))r.c++});
 Object.keys(S.att||{}).forEach(k=>{if(!inR(k))return;const a=S.att[k];if(!a||!Object.keys(a).length)return;
  Object.keys(T).forEach(id=>{if(a[id]!=='a')T[id].pres++})});
 const L=Object.values(T).map(r=>Object.assign(r,{t:r.j+r.c,ago:r.last?Math.round((new Date(end+'T12:00:00Z')-new Date(r.last+'T12:00:00Z'))/864e5):null,rate:r.pres?(r.j+r.c)/r.pres:null}));
 const act=L.filter(r=>r.pres>0||r.t>0);
 const mean=act.length?act.reduce((a,r)=>a+(r.rate!=null?r.rate:r.t),0)/act.length:0;
 const sug=act.filter(r=>r.pres>0&&(r.t===0||(r.rate!=null&&r.rate<mean*.6))).sort((a,b)=>(a.rate||0)-(b.rate||0)||((b.ago==null?9999:b.ago)-(a.ago==null?9999:a.ago))).slice(0,6);
 return{from,end,L:L.sort((a,b)=>b.t-a.t||(a.s.name<b.s.name?-1:1)),mean,sug,max:Math.max(1,...L.map(r=>r.t))}}
function focusCard(){
 const R=st.fc||'14',F=focusStats(R),sug=new Set(F.sug.map(r=>r.s.id));
 const rg=(v,l)=>`<button type="button" class="dj-sm${R===v?' on':''}" data-dj="fcrange:${v}">${l}</button>`;
 if(!F.L.length)return'';
 const total=F.L.reduce((a,r)=>a+r.t,0);
 const rows=F.L.map(r=>{const w1=r.j/F.max*100,w2=r.c/F.max*100,noPres=r.pres===0&&r.t===0;
  return `<div class="dj-fr${sug.has(r.s.id)?' lo':''}${noPres?' na':''}"><span class="dj-fn">${esc(r.s.name)}</span><span class="dj-fb">${w1?`<i class="j" style="width:${w1}%"></i>`:''}${w2?`<i class="c" style="width:${w2}%"></i>`:''}</span><b class="dj-fv">${noPres?'غایب':fa(r.t)}</b></div>`}).join('');
 const top=F.L.filter(r=>r.t>0).slice(0,3);
 const inner=`<div class="dj-fc" id="djFc"><div class="dj-ph"><small>${fa(total)} نوبت ارزشیابی/پرسش · ${esc(dshort(F.from))} تا ${esc(dshort(F.end))}</small></div>
  <div class="dj-mxbar">${rg('7','۷ روز اخیر')}${rg('14','۱۴ روز اخیر')}${rg('30','۳۰ روز اخیر')}${rg('all','کل سال')}</div>
  <div class="dj-fleg"><i class="j"></i>ارزشیابی دفتر روزانه <i class="c"></i>فعالیت کلاسی (پاسخ به سؤال، ارائه و…) · هر ارزشیابی یا پاسخ = یک نوبت؛ روزهای تعطیل حساب نمی‌شوند</div>
  <div class="dj-fch">${rows}</div>
  ${top.length?`<div class="dj-ftop">🌟 فعال‌ترین‌ها: ${top.map(r=>esc(r.s.name)+' ('+fa(r.t)+')').join('، ')}</div>`:''}
 </div>`;
 return accHtml('fc','🎯 توزیع توجه به دانش‌آموزان',fa(total)+' نوبت',inner,false)}
/* «پیشنهاد برای معلم» جدا از کرکره‌ی توزیع توجه و در بالای صفحه، کنار جدول فعالیت‌های امروز (cl-v170) */
function suggCard(){
 const F=focusStats(st.fc||'14');if(!F.L.length)return'';
 const sugH=F.sug.length?F.sug.map(r=>`<li><b>${esc(r.s.name)}</b> — ${r.t?fa(r.t)+' نوبت در '+fa(r.pres)+' روز حضور':'در این بازه هیچ نوبتی ثبت نشده'}${r.ago!=null?` · آخرین نوبت: ${r.ago?fa(r.ago)+' روز پیش':'امروز'}`:' · تاکنون نوبتی نداشته'}</li>`).join(''):'<li style="list-style:none">✅ توزیع نوبت‌ها در این بازه متعادل است؛ دانش‌آموزِ مغفول‌مانده‌ای دیده نمی‌شود.</li>';
 return `<div class="card dj-sugc" id="djSug"><div class="dj-fsug" style="margin:0"><b>💡 پیشنهاد برای معلم: امروز به این دانش‌آموزان فرصت پرسش بدهید</b><ul>${sugH}</ul></div></div>`}
function mxShift(dir){const a=mxAnchor();
  if(st.mx.m==='month'){
    const p=jparts(a);
    let curY=p.y, curM=p.m;
    let nextY=curY, nextM=curM;
    if(dir>0){
      if(curM===12){nextM=1;nextY=curY+1;}
      else if(curM===3){flash('گزارش ماهانه به بازه سال تحصیلی (مهر تا خرداد) محدود است');return;}
      else{nextM=curM+1;}
    }else{
      if(curM===1){nextM=12;nextY=curY-1;}
      else if(curM===7){flash('گزارش ماهانه به بازه سال تحصیلی (مهر تا خرداد) محدود است');return;}
      else{nextM=curM-1;}
    }
    st.mx.k=jiso(nextY,nextM,1)||a;
  } else {
    const nextD=addD(a,7*dir);
    const p=jparts(nextD);
    if(!isAcademicMonth(p.m)){
      flash('گزارش به بازه سال تحصیلی (مهر تا خرداد) محدود است');
      return;
    }
    st.mx.k=nextD;
  }
}

function printDashboardReport(){
  const B = mxBuild();
  const dashEl = document.getElementById('djAnalyticsDash');
  if(!dashEl){ flash('داشبورد تحلیلی در دسترس نیست'); return; }
  const win = window.open('', '_blank');
  if(!win){ flash('پنجره گزارش مسدود شد؛ باز شدن پنجره را تأیید کنید'); return; }
  const u = f => { try { return new URL('assets/fonts/' + f, location.href).href; } catch(e){ return 'assets/fonts/' + f; } };
  const PI = profInfo(), schoolName = PI.school, teacherName = PI.teacher || 'آموزگار', gradeName = PI.grade + (PI.sec ? ' ('+PI.sec+')' : '');
  const clone = dashEl.cloneNode(true);
  const btn = clone.querySelector('button[data-dj="printdash"]');
  if(btn) btn.remove();
  clone.querySelectorAll('.dj-cp-btns').forEach(e => e.remove());

  win.document.open();
  win.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
  <title>داشبورد تحلیلی و وضعیت پویای دانش‌آموزان — ${esc(B.R.title)}</title>
  <style>
    @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Regular.ttf')});font-weight:400}
    @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Bold.ttf')});font-weight:700 900}
    @page{size:A4 portrait;margin:10mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;color:#1e293b;margin:0;font-size:11px;line-height:1.6}
    .rep-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #334155;padding-bottom:6px;margin-bottom:12px}
    .rep-header h1{font-size:16px;margin:0 0 4px;color:#0f172a}
    .rep-meta{font-size:11px;color:#475569;display:flex;gap:14px}
    .dj-dash{border:0 !important;padding:0 !important}
    .dj-dash-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
    .dj-dash-card{border:1px solid #cbd5e1;border-radius:10px;padding:10px;background:#f8fafc}
    .dj-dash-card.top{background:#1a8f550c;border-color:#1a8f5555}
    .dj-dash-card.act{background:#5b3fd60c;border-color:#5b3fd655}
    .dj-dash-card.need{background:#d9363e0c;border-color:#d9363e55}
    .dj-dash-card b{font-size:12px;margin-bottom:6px;display:block}
    .st-list{display:flex;flex-direction:column;gap:4px;font-size:11px}
    .st-item{display:flex;justify-content:space-between;align-items:center}
    .st-badge{font-size:10px;padding:1px 5px;border-radius:4px;border:1px solid currentColor}
    .dj-course-chart{margin:12px 0;padding:10px;border-radius:10px;border:1px solid #cbd5e1;background:#f8fafc}
    .dj-chart-title{font-size:12.5px;font-weight:800;margin-bottom:6px;color:#1e3a8a}
    .dj-bar-row{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:11px}
    .dj-bar-lbl{width:110px;text-align:right;font-weight:800}
    .dj-bar-track{flex:1;height:16px;border-radius:4px;background:#e2e8f0;overflow:hidden;display:flex}
    .dj-bar-fill{height:100%;color:#fff;font-size:9.5px;font-weight:900;display:flex;align-items:center;justify-content:flex-end;padding:0 4px}
    .dj-bar-val{width:60px;text-align:left;font-weight:800;font-size:10px}
    .dj-stu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
    .dj-stu-card{padding:6px 8px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;font-size:11px}
    .dj-dist-bar{display:flex;height:20px;border-radius:6px;overflow:hidden;margin-bottom:6px}
    .dj-dist-seg{display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:900}
    .dj-dist-lg{display:flex;gap:10px;font-size:10.5px;flex-wrap:wrap}
    .dj-dist-lg span{display:inline-flex;align-items:center;gap:4px}
    .dj-dist-lg i{width:10px;height:10px;border-radius:2px;display:inline-block}
    .dj-dash-rank table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}
    .dj-dash-rank th,.dj-dash-rank td{border:1px solid #cbd5e1;padding:4px 6px;text-align:right}
    .dj-dash-rank th{background:#f1f5f9;font-weight:bold}
    .dj-prog-wrap{display:flex;align-items:center;gap:6px}
    .dj-prog-bg{flex:1;height:7px;border-radius:3px;background:#e2e8f0;overflow:hidden}
    .dj-prog-fill{height:100%;border-radius:3px}
    ${SIGN_CSS}
    .noprint{text-align:center;margin:16px}@media print{.noprint{display:none}}
  </style></head><body>
    <div class="rep-header">
      <div>
        <h1>داشبورد تحلیلی و وضعیت پویای دانش‌آموزان</h1>
        <div class="rep-meta">
          <span>آموزشگاه: <b>${esc(schoolName)}</b></span>
          <span>پایه/کلاس: <b>${esc(gradeName)}</b></span>
          <span>آموزگار: <b>${esc(teacherName)}</b></span>
        </div>
      </div>
      <div style="text-align:left;font-size:10px;color:#475569">
        <div><b>دوره:</b> ${esc(B.R.title)} (${esc(B.R.kind)})</div>
        <div><b>تاریخ تهیه:</b> ${esc(dshort(todayK()))}</div>
      </div>
    </div>
    ${clone.innerHTML}
    <div class="sign">${signHtml()}</div>
    <div class="noprint">
      <button style="padding:8px 18px;font:bold 13px Vazirmatn,Tahoma,sans-serif;background:#2563eb;color:#fff;border:0;border-radius:8px;cursor:pointer" onclick="window.print()">🖨️ چاپ مستقیم / ذخیره PDF</button>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(()=>{try{win.focus();win.print();}catch(e){}}, 700);
}

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
 <div class="sign">${signHtml()}</div><div class="foot">این گزارش به‌صورت خودکار از سوابق ثبت‌شده در دفتر روزانه تهیه شده است. داده‌های ثبت‌نشده در محاسبات لحاظ نشده‌اند.</div><div class="noprint" style="text-align:center;margin:18px"><button onclick="window.print()">چاپ / ذخیره به‌صورت PDF</button></div></body></html>`);
 win.document.close();setTimeout(()=>{try{win.focus();win.print()}catch(e){}},700);
}

function teacherReportModalHtml(){
 if(!st.repModal)return'';
 const p=st.repModal.period||'month';
 const att=st.repModal.att||'inline';
 const opt=`<option value="all"${st.repModal.course==='all'?' selected':''}>همه‌ی درس‌ها</option>`+allCourses().map(c=>`<option value="${c.id}"${String(c.id)===String(st.repModal.course)?' selected':''}>${esc(c.name)}</option>`).join('');
 return`<div class="dj-modal-overlay" data-dj="closerepmodal"><div class="dj-modal-box">
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
    <button type="button" class="dj-sm on" style="background:#059669;color:#fff;font-size:13px;padding:9px 15px;border-radius:10px;border:0;cursor:pointer;font-weight:800" data-dj="doreportpdf">📄 دریافت مستقیم فایل PDF</button>
    <button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:13px;padding:9px 16px;border-radius:10px;border:0;cursor:pointer;font-weight:800" data-dj="doreport">🖨️ چاپ مستقیم صفحات</button>
  </div>
 </div></div>`;
}

/* ───── گزارش دفتر روزانه معلم: پیش‌نمایش = چاپ = PDF (هر سه از یک HTML و یک CSS ساخته می‌شوند) ───── */
const MXPR=`
.pg{background:#fff;color:#1e293b;font-family:Vazirmatn,Tahoma,Arial,sans-serif;font-size:11px;direction:rtl}
.pg .rep-header{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:2px solid #334155;padding-bottom:6px;margin-bottom:8px}
.pg .rep-header h1{font-size:14px;margin:0 0 3px;color:#0f172a;font-weight:900}
.pg .rep-meta{font-size:10px;color:#475569;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.pg .page-num{background:#e2e8f0;padding:1px 8px;border-radius:4px;font-weight:800;color:#0f172a}
.pg .rep-side{text-align:left;font-size:10px;color:#475569;line-height:1.8;white-space:nowrap}
.pg .note{font-size:9.5px;color:#526477;margin-top:4px}
${SIGN_CSS.replace(/\.sign/g,'.pg .sign')}
.pg .dj-mxlg{font-size:9.5px;line-height:2.1;margin-top:6px}
.pg .dj-mxlg i{font-style:normal;display:inline-block;min-width:22px;text-align:center;border-radius:4px;color:#fff;font-weight:900;padding:0 4px;margin-left:3px}
.dj-mx table.pr{width:100%;min-width:0;table-layout:fixed;border-collapse:collapse;font-size:9px}
.dj-mx table.pr thead{display:table-header-group}.dj-mx table.pr tr{break-inside:avoid;page-break-inside:avoid}
.dj-mx table.pr th,.dj-mx table.pr td{border:1px solid #cfd6e6}
.dj-mx table.pr thead th{position:static;text-align:center !important;vertical-align:middle !important}
.dj-mx table.pr th.nm,.dj-mx table.pr td.nm{position:static;width:var(--nmw);min-width:0;max-width:none;white-space:normal !important;overflow:visible !important;font-size:9.5px;line-height:1.35;padding:2px 5px;text-align:right}
.dj-mx table.pr thead th.nm{text-align:center !important;font-size:10px}
.dj-mx table.pr th.rn,.dj-mx table.pr td.rn{width:24px;min-width:0;padding:0;font-size:9px;font-weight:700;background:#f1f5f9;color:#475569}
.dj-mx table.pr thead th.rn{background:#2b4a9b;color:#fff;font-size:9px}
.dj-mx table.pr th.h{width:auto;min-width:0;padding:3px 0;height:var(--hh)}
.dj-mx table.pr th.h span{max-height:var(--hh);font-size:8.5px;line-height:1.3}
.dj-mx table.pr td.c{width:auto;min-width:0;height:19px;font-size:9px;padding:0}
.dj-mx table.pr th.h.pnh,.dj-mx table.pr td.c.pnc{width:auto;min-width:0;font-size:8px;letter-spacing:-.2px}
`;
function mxPagesHtml(o){const per=o.land?36:22,chunks=mxChunk(o.cols,per),n=chunks.length;
 return chunks.map((ch,i)=>{const last=i===n-1;
  return`<div class="pg dj-mx"><div class="rep-header"><div><h1>${esc(o.h1)}</h1><div class="rep-meta">${o.metas.map(x=>`<span>${x}</span>`).join('')}<span class="page-num">صفحه ${fa(i+1)} از ${fa(n)}</span></div></div><div class="rep-side">${o.side.map(x=>`<div>${x}</div>`).join('')}</div></div>${mxTable({cols:o.cols},{cols:ch,pr:true,num:true})}${last?mxLegend()+(o.note?`<div class="note">${o.note}</div>`:''):''}<div class="sign">${signHtml()}</div></div>`}).join('')}
function djPrintWin(o){
 const win=window.open('','_blank');if(!win){flash('پنجره‌ی گزارش مسدود شد؛ اجازه‌ی بازشدن پنجره را فعال کنید');return}
 const u=f=>{try{return new URL('assets/fonts/'+f,location.href).href}catch(e){return'assets/fonts/'+f}};
 win.document.open();win.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.title)}</title><style>
 @font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Regular.ttf')});font-weight:400}@font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Bold.ttf')});font-weight:700 900}
 @page{size:A4 ${o.land?'landscape':'portrait'};margin:${o.land?'8mm':'10mm'}}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 html,body{margin:0;background:#fff}body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;color:#1e293b;font-size:11px}
 .noprint{text-align:center;margin:14px}.noprint button{padding:8px 18px;font:bold 13px Vazirmatn,Tahoma,sans-serif;background:#2563eb;color:#fff;border:0;border-radius:8px;cursor:pointer}
 @media screen{body{padding:10px;max-width:${o.land?1123:794}px;margin:0 auto}.pg{margin-bottom:18px;padding-bottom:12px;border-bottom:2px dashed #cbd5e1}}
 @media print{.noprint{display:none}.pg{break-after:page;page-break-after:always}.pg:last-of-type{break-after:auto;page-break-after:auto}}
 ${MXCSS}${MXPR}</style></head><body>${o.body}<div class="noprint"><button onclick="window.print()">🖨️ چاپ / ذخیره به‌صورت PDF</button></div></body></html>`);
 win.document.close();setTimeout(()=>{try{win.focus();win.print()}catch(e){}},700)}
/* تبدیل یک صفحه به تصویر با موتور خود مرورگر (فونت و CSS داخل تصویر)؛ سرتیترهای عمودی فارسی دقیقاً مثل چاپ رسم می‌شوند و آفلاین هم کار می‌کند */
let FONTCSS=null;
async function fontCss(){if(FONTCSS!==null)return FONTCSS;
 const b64=async f=>{const r=await fetch(new URL('assets/fonts/'+f,location.href).href);if(!r.ok)throw new Error('font');const b=new Uint8Array(await r.arrayBuffer());let t='';for(let i=0;i<b.length;i+=0x8000)t+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(t)};
 try{const[x,y]=await Promise.all([b64('Vazirmatn-Regular.ttf'),b64('Vazirmatn-Bold.ttf')]);FONTCSS=`@font-face{font-family:Vazirmatn;src:url(data:font/ttf;base64,${x});font-weight:400}@font-face{font-family:Vazirmatn;src:url(data:font/ttf;base64,${y});font-weight:700 900}`}catch(e){FONTCSS=''}
 return FONTCSS}
async function djRaster(el,sc){sc=sc||2;
 const w=el.offsetWidth,h=el.offsetHeight;if(!w||!h)throw new Error('size');
 const fc=await fontCss();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" style="box-sizing:border-box;background:#fff;color:#1e293b;font:400 11px/normal Vazirmatn,Tahoma,sans-serif;margin:0;padding:0;border:0;width:${w}px"><style><![CDATA[*{box-sizing:border-box}${fc}${MXCSS}${MXPR}]]></style>${new XMLSerializer().serializeToString(el)}</div></foreignObject></svg>`;
 const img=new Image();
 await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('render'));img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
 const cv=document.createElement('canvas');cv.width=w*sc;cv.height=h*sc;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
 cv.toDataURL('image/jpeg',.5);/* اگر بوم آلوده باشد همین‌جا خطا می‌دهد و به روش دوم می‌رویم */
 return cv}
const safeName=t=>String(t).replace(/[\\\/:*?"<>|]/g,'').replace(/\s+/g,'-');
/* PDF: هر صفحه‌ی گزارش (همان HTML چاپ) در یک iframe بدون CSS برنامه ساخته و به تصویر A4 تبدیل می‌شود */
async function mxPdf(o){const land=!!o.land;let fr=null;flash('⏳ در حال ساخت PDF…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF برنامه در دسترس نیست');
  await X.pdfLibs();
  fr=document.createElement('iframe');fr.setAttribute('aria-hidden','true');fr.style.cssText=`position:fixed;left:-99999px;top:0;border:0;width:${land?1123:794}px;height:1400px`;document.body.appendChild(fr);
  const d=fr.contentDocument,u=f=>{try{return new URL('assets/fonts/'+f,location.href).href}catch(e){return'assets/fonts/'+f}};
  d.open();d.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>@font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Regular.ttf')});font-weight:400}@font-face{font-family:Vazirmatn;src:url(${u('Vazirmatn-Bold.ttf')});font-weight:700 900}*{box-sizing:border-box}html,body{margin:0;background:#fff}body{font:400 11px/normal Vazirmatn,Tahoma,sans-serif;color:#1e293b;padding:0 ${land?30:38}px;width:${land?1123:794}px}${MXCSS}${MXPR}</style></head><body></body></html>`);d.close();
  d.body.innerHTML=mxPagesHtml(o);
  try{await d.fonts.ready}catch(e){}
  await new Promise(r=>setTimeout(r,120));
  const cvs=[];for(const el of d.body.querySelectorAll('.pg')){let cv=null;try{cv=await djRaster(el)}catch(e){cv=await X.rast(el)}cvs.push(cv)}
  const J=window.jspdf?window.jspdf.jsPDF:X.MiniPDF,doc=new J({unit:'mm',format:'a4',orientation:land?'landscape':'portrait'});
  const PW=land?297:210,PH=land?210:297,M=8;
  cvs.forEach((cv,i)=>{if(i)doc.addPage();let w=PW-2*M,h=cv.height*w/cv.width;const mh=PH-2*M;if(h>mh){w=w*mh/h;h=mh}doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',(PW-w)/2,M,w,h)});
  const ok=await window.dlFile(o.name+'.pdf',doc.output('arraybuffer'));
  flash(ok?'فایل PDF ساخته شد 📄✅':'⚠️ PDF ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد؛ برنامه را در Chrome باز کنید یا از «چاپ» استفاده کنید')}
 catch(x){console.error(x);flash('❌ ساخت PDF ناموفق بود؛ از «چاپ» و گزینه‌ی ذخیره به‌صورت PDF استفاده کنید')}
 finally{if(fr)fr.remove()}}
/* تنظیمات گزارش: fromPreview=true یعنی دقیقاً همان بازه و درس جدولِ پیش‌نمایش؛ وگرنه تنظیمات پنجره‌ی گزارش */
function teacherReportOpts(fromPreview){
 const PI=profInfo(),schoolName=PI.school,teacherName=PI.teacher||'آموزگار کلاس',gradeName=PI.grade+(PI.sec?' ('+PI.sec+')':''),today=todayK();
 let title,kind,cols,cf,withAtt;
 if(fromPreview){const B=mxBuild();kind=st.mx.m==='month'?'month':'week';title=(kind==='month'?'ماهانه — ':'هفتگی — ')+B.R.title;cols=B.cols;cf=st.mx.c||'all';withAtt=true}
 else{const cfg=st.repModal||{period:'month',att:'inline',course:'all'},anchor=st.mx.k||st.k||today,jp0=jparts(anchor);let from,to;
  kind=cfg.period==='month'?'month':'week';
  if(kind==='month'){from=jiso(jp0.y,jp0.m,1);to=jiso(jp0.y,jp0.m,jlen(jp0.y,jp0.m));title='ماهانه — ماه '+JMN[jp0.m-1]+' '+fa(jp0.y)}
  else{from=addD(anchor,-dow(anchor));to=addD(from,6);title='هفتگی — '+dshort(from)+' تا '+dshort(to)}
  if(!from||!to){flash('تعیین بازه گزارش ممکن نشد');return null}
  cf=cfg.course||'all';withAtt=cfg.att!=='none';cols=mxCols(from,to,cf,withAtt)}
 if(!sts().length){flash('دانش‌آموزی در کلاس وجود ندارد');return null}
 if(!cols.length){flash('در این بازه عملکردی برای گزارش ثبت نشده است');return null}
 return{cols,land:kind==='month',name:safeName('گزارش-دفتر-روزانه-'+title),h1:'دفتر روزانه '+teacherName+' — گزارش حضور و غیاب و فعالیت‌های کلاسی روزانه',
  metas:['آموزشگاه: <b>'+esc(schoolName)+'</b>','پایه/کلاس: <b>'+esc(gradeName)+'</b>','درس: <b>'+esc(cf==='all'?'همه‌ی درس‌ها':cname(cf))+'</b>'],
  side:['<b>دوره:</b> '+esc(title),'<b>تاریخ چاپ:</b> '+esc(dshort(today))],
  note:withAtt?'اولین ستون هر روز، حضور و غیاب همان روز است؛ اگر دانش‌آموز آن روز غایب بوده، خانه‌های فعالیت همان روز خالی می‌ماند.':'',}}
function printTeacherJournalReport(directDownloadPdf,fromPreview){
 const o=teacherReportOpts(!!fromPreview);if(!o)return;
 if(directDownloadPdf)return mxPdf(o);
 djPrintWin({title:o.name,land:o.land,body:mxPagesHtml(o)})}

/* رویدادها */
/* پنجره‌ی تأیید داخل برنامه — confirm() مرورگر در پیش‌نمایش/PWA/iframe ممکن است بی‌صدا مسدود شود و کار (حذف، تغییر روش ارزشیابی) انجام نشود */
/* ───── ویرایش مستقیم یک خانه‌ی «جدول عملکرد» (بدون رفتن به تاریخ ثبت اولیه) ─────
   فعالیت ۴سطحی ← سطح | انجام‌شد/نشد ← دو دکمه | مثبت/منفی ← شمارنده | آزمون ← نمره (در همان S.exams).
   همه‌ی تغییرها از همان توابع ثبت اصلی (setMarks / setPN) می‌گذرند؛ پس پرونده‌ی دانش‌آموز، گزارش‌ها و داشبورد همان لحظه یکی می‌شوند. */
function clrMark(k,b,id,sid){const d=D(),key=k+'|'+b+'|'+id,m=d.m[key];
 if(m){delete m[sid];if(!Object.keys(m).length)delete d.m[key]}
 const pm=d.pm[key];if(pm){delete pm[sid];if(!Object.keys(pm).length)delete d.pm[key]}
 const s=getSes(k,b);if(s)syncHw(k,b,id,s);save()}
const nd=t=>String(t==null?'':t).replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[٫,]/g,'.').trim();
function mxEditOpen(key,sid){
 const find=()=>mxBuild().cols.find(q=>q.kind==='act'&&q.key===key),stu=sts().find(q=>String(q.id)===String(sid));
 if(!find()||!stu){flash('این خانه دیگر در جدول نیست');return}
 try{const old=document.getElementById('djMxEd');if(old)old.remove()}catch(e){}
 const ov=document.createElement('div');ov.id='djMxEd';ov.setAttribute('dir','rtl');
 ov.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:2147482000;display:grid;place-items:center;padding:14px;font-family:Vazirmatn,Tahoma,sans-serif';
 const close=()=>{ov.remove();document.removeEventListener('keydown',onKey,true)};
 const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();close()}};
 document.addEventListener('keydown',onKey,true);
 const btn=(a,label,bg,fg)=>`<button type="button" data-me="${a}" style="padding:10px 14px;border:0;border-radius:11px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;background:${bg||'#eef2f7'};color:${fg||'#1e293b'};min-height:42px">${label}</button>`;
 const draw=()=>{const c=find();if(!c){close();return}
  const sv=c.mk[sid],isEx=c.t==='x',isMk=!!c.mkc,e=isEx?(S.exams||[]).find(x=>String(x.id)===String(c.id).slice(1)):null;
  let body='';
  if(isMk){if(!e){close();return}
   const ev=e.mkEval&&e.mkEval[sid];
   body=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:8px">🔁 آزمون جبرانی — آزمون اصلی در ${esc(dlab(e.date))} بود و نمره‌ی آزمون اصلیِ دیگران تغییر نمی‌کند. سطح جبرانی را انتخاب کنید:</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${LV.map(l=>btn('mkl:'+l.v,l.s,Number(ev)===l.v?l.c:'#eef2f7',Number(ev)===l.v?'#fff':'#1e293b')).join('')}</div>`;
  }else if(isEx){if(!e){close();return}
   const cur=e.scores&&e.scores[sid],mx=e.max||4;
   body=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:8px">نمره‌ی همین آزمون در صفحه‌ی «درس‌ها و آزمون‌ها» هم به‌روز می‌شود. بیشینه‌ی نمره: <b>${fa(mx)}</b></div>`
    +(mx===4?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${LV.map(l=>btn('ex:'+l.v,l.s,cur===l.v?l.c:'#eef2f7',cur===l.v?'#fff':'#1e293b')).join('')}</div>`:'')
    +`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input data-me-in type="text" inputmode="decimal" value="${cur==null?'':esc(fa(cur))}" placeholder="نمره (۰ تا ${esc(fa(mx))})" style="flex:1;min-width:120px;padding:10px;border:1px solid #cbd5e1;border-radius:11px;font:700 14px Vazirmatn,Tahoma,sans-serif">${btn('exsave','ثبت نمره','#1d4ed8','#fff')}</div>`;
  }else if(c.t==='d'){
   body=`<div style="display:flex;gap:6px;flex-wrap:wrap">${btn('mk:1','✓ انجام شد',sv===1?'#1a8f55':'#eef2f7',sv===1?'#fff':'#1e293b')}${btn('mk:0','✗ انجام نشد',sv===0?'#c0262c':'#eef2f7',sv===0?'#fff':'#1e293b')}</div>`;
  }else if(c.t==='p'){
   const q=pnOne((c.pm||{})[sid]);
   body=`<div style="font-size:12.5px;color:#475569;line-height:1.9;margin-bottom:8px">برای هر دانش‌آموز در هر فعالیت فقط یک وضعیت ثبت می‌شود: «مثبت» (پاسخ درست/مشارکت) یا «منفی» (پاسخ نادرست/نبود آمادگی). دوباره زدنِ همان دکمه آن را برمی‌دارد.</div><div style="display:flex;gap:6px;flex-wrap:wrap">${btn('pn:1:0','＋ مثبت',q[0]?'#0f766e':'#eef2f7',q[0]?'#fff':'#0f766e')}${btn('pn:0:1','− منفی',q[1]?'#c0262c':'#eef2f7',q[1]?'#fff':'#c0262c')}${(q[0]||q[1])?btn('pn:-1:-1','پاک‌کردن'):''}</div>`;
  }else{
   body=`<div style="display:flex;gap:6px;flex-wrap:wrap">${LV.map(l=>btn('mk:'+l.v,l.s,sv===l.v?l.c:'#eef2f7',sv===l.v?'#fff':'#1e293b')).join('')}</div>`;
  }
  const hasVal=isMk?true:(isEx?(e.scores&&e.scores[sid]!=null):(sv!=null));
  ov.innerHTML=`<div role="dialog" aria-modal="true" style="background:var(--card,#fff);color:var(--tx,#1e293b);border-radius:16px;max-width:460px;width:100%;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.35)">
   <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:6px"><div><b style="font-size:15px">${esc(stu.name)}</b><div style="font-size:12px;color:#64748b;line-height:1.8">${esc(dlab(c.k))} · ${esc(cname(c.c))} · ${esc(c.n)}</div></div>${btn('x','✕','transparent','#64748b')}</div>
   ${body}
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;border-top:1px solid #e2e8f0;padding-top:10px">${hasVal?btn('clr',isMk?'↩ برگرداندن به «منتظر جبرانی»':'🗑️ پاک‌کردن این ثبت','#fde7e8','#c0262c'):''}${isEx?btn('examgo','↗ رفتن به صفحه‌ی آزمون','#eef2f7'):''}${btn('x','بستن','#eef2f7')}</div></div>`;
  const inp=ov.querySelector('[data-me-in]');if(inp)setTimeout(()=>{try{inp.focus();inp.select()}catch(x){}},30)};
 ov.addEventListener('click',ev=>{if(ev.target===ov){close();return}
  const t=ev.target.closest('[data-me]');if(!t)return;const a=t.dataset.me.split(':'),c=find();if(a[0]==='x'){close();return}if(!c){close();return}
  try{
   if(a[0]==='mk'){if(setMarks(c.k,c.b,c.id,[stu.id],+a[1],false)){render();draw()}}
   else if(a[0]==='pn'){if(setPN(c.k,c.b,c.id,stu.id,+a[1],+a[2],false)){render();draw()}}
   else if(a[0]==='mkl'){const e=(S.exams||[]).find(x=>String(x.id)===String(c.id).slice(1));if(!e)return;e.mkEval=e.mkEval||{};e.mkEval[stu.id]=+a[1];save();render();draw()}
   else if(a[0]==='clr'){if(c.mkc){const e=(S.exams||[]).find(x=>String(x.id)===String(c.id).slice(1));if(e){if(e.mk)delete e.mk[stu.id];if(e.mkEval)delete e.mkEval[stu.id];save()}render();close();return}if(c.t==='x'){const e=(S.exams||[]).find(x=>String(x.id)===String(c.id).slice(1));if(e&&e.scores){delete e.scores[stu.id];save()}}else clrMark(c.k,c.b,c.id,stu.id);render();draw()}
   else if(a[0]==='ex'||a[0]==='exsave'){const e=(S.exams||[]).find(x=>String(x.id)===String(c.id).slice(1));if(!e)return;e.scores=e.scores||{};const mx=e.max||4;
    let v;if(a[0]==='ex')v=+a[1];else{const r=nd((ov.querySelector('[data-me-in]')||{}).value);if(r===''){delete e.scores[stu.id];save();render();draw();return}v=parseFloat(r);if(isNaN(v)||v<0||v>mx){flash('نمره باید بین ۰ و '+fa(mx)+' باشد');return}}
    e.scores[stu.id]=v;save();render();draw()}
   else if(a[0]==='examgo'){close();act('examgo:'+c.id.slice(1))}
  }catch(er){console.error('dj mxedit',er)}});
 ov.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target&&ev.target.hasAttribute&&ev.target.hasAttribute('data-me-in')){ev.preventDefault();const b=ov.querySelector('[data-me="exsave"]');if(b)b.click()}});
 document.body.appendChild(ov);draw()}
function djConfirm(msg,onYes,yesLabel){
 try{const old=document.getElementById('djCfm');if(old)old.remove()}catch(e){}
 const o=document.createElement('div');o.id='djCfm';o.setAttribute('dir','rtl');
 o.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:2147483000;display:grid;place-items:center;padding:14px;font-family:Vazirmatn,Tahoma,sans-serif';
 o.innerHTML='<div role="alertdialog" aria-modal="true" style="background:var(--card,#fff);color:var(--tx,#1e293b);border-radius:16px;max-width:420px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.35)"><div data-m style="font-weight:800;line-height:1.9;font-size:14px;margin-bottom:16px"></div><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" data-n style="padding:9px 16px;border-radius:10px;border:1px solid #cbd5e1;background:transparent;color:inherit;font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer">انصراف</button><button type="button" data-y style="padding:9px 16px;border-radius:10px;border:0;background:#dc262c;color:#fff;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer"></button></div></div>';
 o.querySelector('[data-m]').textContent=msg;o.querySelector('[data-y]').textContent=yesLabel||'بله، ادامه';
 const close=()=>o.remove();
 o.addEventListener('click',e=>{if(e.target===o)close()});
 o.querySelector('[data-n]').onclick=close;
 o.querySelector('[data-y]').onclick=()=>{close();try{onYes()}catch(er){console.error('dj',er)}};
 document.body.appendChild(o);return o}
function act(a){const [c,x,y]=a.split(':'),k=st.k;
 if(c==='calendar'){const p=jparts(k);st.cal={y:p.y,m:p.m}}
 else if(c==='setwk'){st.cal=null;try{show('set')}catch(e){}return}
 else if(c==='calclose'||c==='calbg')st.cal=null;
 else if(c==='caltoday'){st.k=startDay();st.cal=null;st.b=null;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='calprev'||c==='calnext'){if(st.cal){
  const dir = c === 'calnext' ? 1 : -1;
  const curY = st.cal.y, curM = st.cal.m;
  let nextY = curY, nextM = curM;
  if(dir > 0) {
    if(curM === 12) { nextM = 1; nextY = curY + 1; }
    else if(curM === 3) { flash('تقویم به بازه سال تحصیلی (مهر تا خرداد) محدود است'); return; }
    else { nextM = curM + 1; }
  } else {
    if(curM === 1) { nextM = 12; nextY = curY - 1; }
    else if(curM === 7) { flash('تقویم به بازه سال تحصیلی (مهر تا خرداد) محدود است'); return; }
    else { nextM = curM - 1; }
  }
  st.cal = { y: nextY, m: nextM };
}}
 else if(c==='calday'){
  if(isOffDay(x)){flash('این روز تعطیل است و قابل انتخاب نیست');return;}
  const p = jparts(x);
  if(!isAcademicMonth(p.m)){flash('انتخاب روز فقط در بازه سال تحصیلی (مهر تا خرداد) مجاز است');return;}
  st.k=x;st.b=null;st.item=null;st.note=null;st.pick=new Set();st.cal=null;
}
 else if(c==='nav'){st.cal=null;{
  const dir = +x > 0 ? 1 : -1;
  const nx = nextOpenDay(k, dir);
  if(!nx){flash('روز غیرتعطیلی در این جهت پیدا نشد');return;}
  const p = jparts(nx);
  if(!isAcademicMonth(p.m)){
    flash('مشاهده و ثبت برنامه فقط در بازه سال تحصیلی (مهر تا خرداد) مجاز است.');
    return;
  }
  st.k = nx;
}st.b=null;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='today'){st.k=startDay();st.b=null;st.item=null}
 else if(c==='bell'){st.b=x;st.item=null;st.note=null;st.pick=new Set();st.tpl=false}
 else if(c==='go'){st.k=x;st.b=y;st.item=null;st.note=null;st.pick=new Set()}
 else if(c==='goday'){if(isOffDay(x)){flash('این روز تعطیل است و قابل انتخاب نیست');return}st.k=x;st.b=null;st.item=null;st.note=null;st.pick=new Set();st.cal=null}
 else if(c==='gotohw'){show('att');setTimeout(()=>{const x=document.getElementById('hwc');if(x&&x.scrollIntoView)x.scrollIntoView({behavior:'smooth',block:'start'})},150);return}
  else if(c==='opennewact'){const cs=allCourses();st.actModal={mode:'create',c:(cs[0]||{}).id||1,sub:'',cg:'تدریس',t:'g',d:'',hw:false,hwt:''}}
 else if(c==='editact'){const s=getSes(k,x);if(s&&s.it&&s.it[y]){const it=s.it[y];st.actModal={mode:'edit',b:x,id:y,c:s.c,sub:it.sub||'',n:it.n||'',cg:it.cg||'تدریس',t:it.t||'g',d:it.d||'',hw:!!it.hw,hwt:it.hwt||it.n||''}}}
 else if(c==='delact'){djConfirm('آیا از حذف این فعالیت و سوابق ثبت‌شده‌ی آن مطمئن هستید؟',()=>{const s=getSes(k,x);if(s&&s.it)delete s.it[y];delete D().m[k+'|'+x+'|'+y];delete D().pm[k+'|'+x+'|'+y];Object.keys(D().n||{}).forEach(nk=>{if(nk.indexOf(k+'|'+x+'|'+y+'|')===0)delete D().n[nk]});if(st.item===y){st.item=null;st.b=null}if(S.hwl){const hi=S.hwl.findIndex(h=>h.id==='dj:'+k+'|'+x+'|'+y);if(hi>=0)S.hwl.splice(hi,1)}save();flash('فعالیت با موفقیت حذف شد 🗑️');render()},'حذف');return}
 else if(c==='pn'){setPN(k,st.b,st.item,+x,y==='p'?1:0,y==='n'?1:0,false)}
 else if(c==='pnd'){setPN(k,st.b,st.item,+x,y==='p'?-1:0,y==='n'?-1:0,false)}
 else if(c==='pnr'){setPN(k,st.b,st.item,+x,0,0,true)}
 else if(c==='evalact'){st.b=x;st.item=y;flash('فعالیت برای ارزشیابی انتخاب شد؛ فهرست دانش‌آموزان در زیر نمایش داده شد')}
 else if(c==='closeactmodal'){st.actModal=null}
 else if(c==='closeeval'){st.b=null;st.item=null}
 else if(c==='saveact'){
    const F=n=>document.querySelector('[data-act-field="'+n+'"]');
    const cEl=F('c');
    if(cEl){
      const courseId=+cEl.value;
      if(!courseId){flash('لطفاً درس را انتخاب کنید');return}
      const sub=((F('sub')||{}).value||'').trim();
      const tv=((F('t')||{}).value);const t=tv==='d'?'d':(tv==='p'?'p':'g');
      const d=((F('d')||{}).value||'').trim();
      const hw=t!=='p'&&!!(F('hw')||{}).checked;
      const hwt=((F('hwt')||{}).value||'').trim();
      const title=sub||cname(courseId),cgv=((F('cg')||{}).value||'تدریس');
      if(st.actModal.mode==='edit'){
        const b0=st.actModal.b,id=st.actModal.id,s0=ensureSes(k,b0),old=(s0.it||{})[id]||{};
        const oldT=old.t==='d'?'d':(old.t==='p'?'p':'g'),key0=k+'|'+b0+'|'+id;
        if(oldT!==t&&Object.keys(D().m[key0]||{}).length){
          if(!st.actModal.okType){djConfirm('با تغییر روش ارزشیابی، نمره‌های قبلی این فعالیت پاک می‌شود. ادامه می‌دهید؟',()=>{if(st.actModal){st.actModal.okType=true;act('saveact');render()}},'تغییر و پاک‌کردن نمره‌ها');return}
          delete D().m[key0];delete D().pm[key0];}
        let b=b0;
        if(String(s0.c)!==String(courseId)){
          const others=Object.keys(s0.it||{}).filter(x=>x!==id).length;
          if(others>0){/* این زنگ فعالیت‌های دیگری هم دارد: فقط همین فعالیت به یک زنگ مستقل با درس تازه منتقل می‌شود */
            const dd=D();let n=1;while(dd.ses[sesKey(k,'m'+n)])n++;b='m'+n;
            dd.ses[sesKey(k,b)]={c:courseId,tp:sub,nt:''};
            moveItem(k,b0,b,id);
            if(st.b===b0&&st.item===id)st.b=b;
          }else{s0.c=courseId}
        }
        const s=ensureSes(k,b),old2=(s.it||{})[id]||old;
        const auto=!old2.n||old2.n===old2.sub||old2.n===cname(s0.c)||old2.n===cname(s.c);
        s.it=s.it||{};
        s.it[id]=Object.assign(old2,{n:auto?title:old2.n,t,hw:hw?1:0,hwt,d,cg:cgv||old2.cg||'تدریس',sub});
        syncHw(k,b,id,s);
        st.actModal=null;save();flash('تغییرات فعالیت ذخیره شد ✅ (فعالیت‌های دیگر این روز دست‌نخورده ماندند)');
      }else{
        const dd=D();let n=1;while(dd.ses[sesKey(k,'m'+n)])n++;
        const b='m'+n,s=ensureSes(k,b),id='act_'+Date.now();
        s.c=courseId;s.tp=sub;s.it=s.it||{};
        s.it[id]={n:title,t,hw:hw?1:0,hwt,d,cg:cgv,sub};st.b=b;st.item=id;st.actModal=null;save();flash('فعالیت جدید ثبت شد ✅ — حالا دانش‌آموزان را ارزشیابی کنید');
      }
    }
  }
  else if(c==='pendrange'){st.pendRange=(x==='month'?'month':+x)}
 else if(c==='item'){st.item=x;st.note=null;st.pick=new Set()}
 else if(c==='manual'){const d=D();let n=1;while(d.ses[sesKey(k,'m'+n)])n++;const b='m'+n;d.ses[sesKey(k,b)]={c:(courses()[0]||{}).id,tp:'',nt:''};save();st.b=b;st.item=null}
 else if(c==='skip'){const s=ensureSes(k,st.b);if(s.st==='skip')delete s.st;else s.st='skip';save()}
 else if(c==='skipall'){journalPendingDays(7,'all').forEach(p=>{const info=dayJournalStatus(p.k);const bls=dayBells(p.k);bls.forEach(b=>{const s=ensureSes(p.k,b.b);s.st='skip';});});save()}
 else if(c==='mxmode')st.mx.m=x==='month'?'month':'week';
 else if(c==='mxprev'||c==='mxnext')mxShift(c==='mxnext'?1:-1);
 else if(c==='mxnow')st.mx.k=null;
 else if(c==='cpmode'){const cp=st.cp||(st.cp={m:'month',k:null}),a=cp.k||mxAnchor();cp.m=(x==='h1'||x==='h2')?x:'month';cp.k=a}
 else if(c==='cpprev'||c==='cpnext')chartShift(c==='cpnext'?1:-1);
 else if(c==='mxedit'){let key='';try{key=decodeURIComponent(x||'')}catch(e){}mxEditOpen(key,isNaN(+y)?y:+y);return}
 else if(c==='attcyc'){if(!/^\d{4}-\d{2}-\d{2}$/.test(x||'')||mxOff(x))return;if(typeof window.cyc==='function'){window.cyc(isNaN(+y)?y:+y,x);try{save()}catch(e){}}}
 else if(c==='examgo'){try{show('crs');setTimeout(()=>{try{window.openExNow&&window.openExNow(isNaN(+x)?x:+x)}catch(e){}},60)}catch(e){}return}
 else if(c==='fcrange'){st.fc=x||'14'}
 else if(c==='mxpick'){if(/^\d{4}-\d{2}-\d{2}$/.test(x||''))st.mx.k=x}
 else if(c==='mxprint'){printTeacherJournalReport(false,true);return}
 else if(c==='mxpdf'){printTeacherJournalReport(true,true);return}
  else if(c==='printdash'){printDashboardReport(); return}
 else if(c==='teacherreport'){st.repModal={period:'month',att:'inline',course:st.mx.c||'all'};render();return}
 else if(c==='gotoact'){try{show('act')}catch(e){}return}
  else if(c==='closerepmodal'){st.repModal=null;render();return}
 else if(c==='repmodperiod'){if(st.repModal){st.repModal.period=x;render();return}}
 else if(c==='repmodatt'){if(st.repModal){st.repModal.att=x;render();return}}
 else if(c==='doreport'){printTeacherJournalReport(false);st.repModal=null;render();return}
 else if(c==='doreportpdf'){printTeacherJournalReport(true);st.repModal=null;render();return}
 else if(c==='pendall')st.pendAll=!st.pendAll;
 else if(c==='tpl')st.tpl=!st.tpl;
 else if(c==='selmode'){st.sel=!st.sel;st.pick=new Set()}
 else if(c==='pickall'){const it=st.item,m=D().m[k+'|'+st.b+'|'+it]||{};st.pick=new Set(sts().filter(s=>!absentB(k,st.b,s.id)&&m[s.id]==null).map(s=>s.id))}
 else if(c==='note')st.note=st.note===+x?null:+x;
 else if(c==='fu'){const q0=sts().find(q=>String(q.id)===String(x));if(!q0||!st.item)return;const L=fuList(),i=L.findIndex(q=>q.st==='open'&&String(q.sid)===String(q0.id)&&q.k0===k&&q.b===st.b&&q.it===st.item);
  if(i>=0){L.splice(i,1);save()}else{const ai=fuActInfo(k,st.b,st.item);fuNew({sid:q0.id,k0:k,b:st.b,it:st.item,an:ai.an,c:ai.c});flash('✅ ثبت شد: فردا از «'+q0.name+'» پرسیده شود')}}
 else if(c==='fulv'||c==='fudone'){const q=fuList().find(z=>z.id===x);if(q){q.st='done';q.kd=k;if(c==='fulv')q.lv=+y;save()}}
 else if(c==='fusnooze'){const q=fuList().find(z=>z.id===x);if(q){q.k0=k;q.sn=(q.sn||0)+1;save()}}
 else if(c==='fudrop'){const L=fuList(),i=L.findIndex(z=>z.id===x);if(i>=0){L.splice(i,1);save()}}
 else if(c==='fureopen'){const q=fuList().find(z=>z.id===x);if(q){q.st='open';delete q.kd;delete q.lv;save()}}
 else if(c==='fuadopt'){const p=String(x).split('|'),ai=fuActInfo(p[0],p[1],p[2]);if(p.length>=4){fuNew({sid:+p[3]||p[3],k0:p[0],b:p[1],it:p[2],an:ai.an,c:ai.c,src:x});flash('✅ در فهرست پیگیری ثبت شد')}}
 else if(c==='fuign'){const d=D();d.fuIgn=d.fuIgn||{};d.fuIgn[x]=1;save()}
 else if(c==='schplan'){const pl=schedPlan(k);if(pl&&(pl.moves.length||pl.reloc.length)&&confirm('زنگ‌ها طبق پیشنهاد جابه‌جا شوند؟ ارزشیابی‌ها و یادداشت‌ها همراه هر زنگ منتقل می‌شوند و چیزی پاک نمی‌شود.')){applyPlan(k,pl);flash('✅ زنگ‌ها با برنامه‌ی هفتگی هماهنگ شد')}}
 else if(c==='schok'){const d=D();d.schOk=d.schOk||{};d.schOk[k]=1;save()}
 else if(c==='mk'){setMarks(k,st.b,st.item,[+x],+y,true)}
 else if(c==='bulk'){const m=D().m[k+'|'+st.b+'|'+st.item]||{};
  const ids=st.sel?[...st.pick]:sts().filter(s=>!absentB(k,st.b,s.id)&&m[s.id]==null).map(s=>s.id);
  if(!ids.length){flash(st.sel?'ابتدا دانش‌آموزان را انتخاب کنید':'همه‌ی دانش‌آموزان حاضر قبلاً ثبت شده‌اند')}else if(setMarks(k,st.b,st.item,ids,+x,false)){flash(fa(ids.length)+' نفر ثبت شد ✅');st.pick=new Set()}}
 else if(c==='tpladd'){const n=($('djNewN').value||'').trim();if(!n){flash('نام فعالیت را بنویسید');return}const s=ensureSes(k,st.b),t=ownTpl(s.c);t.push({id:'u'+Date.now(),n,t:$('djNewT').value==='d'?'d':($('djNewT').value==='p'?'p':'g'),hw:0});save()}
 else if(c==='tpldel'){const s=ensureSes(k,st.b),t=ownTpl(s.c),i=t.findIndex(q=>q.id===x);if(i>=0){t.splice(i,1);if(st.item===x)st.item=null;save()}}
 render()}
sec.addEventListener('click',e=>{const t=e.target.closest('[data-dj]');if(!t||t.disabled)return;if(t.dataset.dj==='calbg'&&e.target!==t)return;if(t.classList.contains('dj-modal-overlay')&&e.target!==t)return;if(t.type==='checkbox'){const id=+t.dataset.dj.split(':')[1];st.pick.has(id)?st.pick.delete(id):st.pick.add(id);return}
 try{act(t.dataset.dj)}catch(er){console.error('dj',er)}});
sec.addEventListener('change',e=>{const t=e.target,k=st.k;try{
 if(t.hasAttribute('data-mxc')){st.mx.c=t.value;render();return}
 if(t.hasAttribute('data-dj-pendfilter')){st.pendFilter=t.value;render();return}
 if(t.dataset.actField==='c'){const dl=document.getElementById('djSubList');if(dl){const cObj=allCourses().find(q=>String(q.id)===String(t.value));dl.innerHTML=getCourseSubs(cObj?cObj.name:'').map(x=>'<option value="'+esc(x)+'"></option>').join('')}return}
 if(t.dataset.actField==='t'){t.dataset.touched='1';const w=document.getElementById('djHwWrapAll');if(w)w.style.display=t.value==='p'?'none':'block';return}
 if(t.dataset.actField==='sub'){const se=document.querySelector('[data-act-field="t"]');if(se&&!se.dataset.touched&&PN_HINT.test(t.value||'')){se.value='p';const w=document.getElementById('djHwWrapAll');if(w)w.style.display='none'}return}
 if(t.dataset.actField==='hw'){const w=document.getElementById('djHwTitleWrap');if(w)w.style.display=t.checked?'block':'none';return}
 if(t.hasAttribute('data-repmodcourse')){if(st.repModal){st.repModal.course=t.value;}return}
 if(t.hasAttribute('data-report-period')){st.reportPeriod=t.value;return}
 if(t.dataset.calm!==undefined||t.dataset.caly!==undefined){if(st.cal){const m=t.dataset.calm!==undefined?+t.value:st.cal.m,y=t.dataset.caly!==undefined?+t.value:st.cal.y;if(jiso(y,m,1))st.cal={y,m};render()}return}
 if(t.dataset.f){if(!offGuard(k)){render();return}const s=ensureSes(k,st.b);
  if(t.dataset.f==='course'){const nc=+t.value;
    if(nc!==s.c&&s.it&&Object.keys(s.it).length){/* این زنگ قبلاً فعالیتی دارد: درس آن را عوض نمی‌کنیم؛ برای درس جدید یک بخش مستقل می‌سازیم */
     const dd=D();let n=1;while(dd.ses[sesKey(k,'m'+n)])n++;const nb='m'+n;dd.ses[sesKey(k,nb)]={c:nc,tp:'',nt:''};
     st.b=nb;st.item=null;st.note=null;st.pick=new Set();st.tpl=false;save();flash('برای «'+cname(nc)+'» یک بخش جدید ساخته شد؛ فعالیت‌های قبلی دست‌نخورده ماندند ✅')}
    else{s.c=nc;st.item=null;save()}
    render()}
  else if(t.dataset.f==='topic'){s.tp=t.value.trim();save()}
  else if(t.dataset.f==='snote'){s.nt=t.value.trim();save()}}
 else if(t.dataset.nt){if(!offGuard(k)){render();return}const sid=+t.dataset.nt,d=D(),key=k+'|'+st.b+'|'+st.item+'|'+sid,v=t.value.trim();if(v)d.n[key]=v;else delete d.n[key];save();render()}
 else if(t.dataset.tn||t.dataset.tt||t.dataset.th){const s=ensureSes(k,st.b),tp=ownTpl(s.c),id=t.dataset.tn||t.dataset.tt||t.dataset.th,q=tp.find(z=>z.id===id);if(!q)return;
  if(t.dataset.tn){const v=t.value.trim();if(v)q.n=v}else if(t.dataset.tt){q.t=t.value==='d'?'d':(t.value==='p'?'p':'g');if(q.t!=='d')q.hw=0}else q.hw=t.checked?1:0;save();render()}}catch(er){console.error('dj',er)}});

/* خلاصه‌ی دفتر برای هر دانش‌آموز (برای پرونده‌ی دانش‌آموز و گزارش‌ها) */
function summary(sid,from,to){const d=D(),R={};
 Object.keys(d.m).forEach(key=>{const v=d.m[key][sid];if(v==null)return;const p=key.split('|'),k=p[0];if(from&&k<from)return;if(to&&k>to)return;
  const s=d.ses[k+'|'+p[1]];if(!s||!(s.it||{})[p[2]])return;const it=s.it[p[2]],r=R[s.c]=R[s.c]||{c:s.c,g:{1:0,2:0,3:0,4:0},ok:0,no:0,pp:0,pn:0,n:0,last:[]};
  if(it.t==='d'){v===1?r.ok++:r.no++}else if(r.g[v]!=null)r.g[v]++;r.n++;
  if(it.t==='p'){const q=((d.pm||{})[key]||{})[sid];if(q){const o1=pnOne(q);r.pp+=o1[0];r.pn+=o1[1]}}
  const nt=d.n[key+'|'+sid];if(nt)r.last.push({k,a:it.n,t:nt})});
 Object.values(R).forEach(r=>r.last.sort((a,b)=>b.k.localeCompare(a.k)));return Object.values(R)}
/* دروس قابل ارزشیابی در «ثبت ارزشیابی یا آزمون»: همان دروس دفتر روزانه (شامل املا و انشا) */
function examCourses(){return allCourses().map(c=>({id:c.id,name:c.name}))}
/* درس ویژه‌ی دفتر (مثل املا) هنگام ثبت آزمون به درس واقعی برنامه تبدیل می‌شود */
function materialize(v){if(typeof v==='string'&&v.indexOf('sp_')===0){const sc=SPECIAL_COURSES.find(x=>x.id===v);if(!sc)return v;let c=(S.courses||[]).find(x=>x.name===sc.name);if(!c){c={id:Date.now(),name:sc.name,book:''};S.courses.push(c);save()}return c.id}return v}
function subsOf(cid){const n=cname(cid),seen=new Set(),out=[];tplOf(cid).forEach(x=>{if(x&&x.n&&!seen.has(x.n)){seen.add(x.n);out.push(x.n)}});getCourseSubs(n).forEach(x=>{if(!seen.has(x)){seen.add(x);out.push(x)}});return out}
/* سطح‌های ارزشیابی دفتر برای نمره‌ی مستمر درسی: آرایه‌ای از ۱ تا ۴ برای دانش‌آموز sid و درس cid (null = همه‌ی درس‌ها).
   o = {from,to,pred(k)}. فقط فعالیت‌های ۴سطحی و مثبت/منفی شمرده می‌شوند؛ «انجام شد/نشد» (تکلیف) از S.hwl و آزمون‌ها فقط از S.exams می‌آیند
   (در S.dj.m آزمون ذخیره نمی‌شود) ⇒ هیچ داده‌ای دوبار شمرده نمی‌شود. روز غیبت دانش‌آموز حساب نمی‌شود. */
function levels(sid,cid,o){o=o||{};const d=D(),out=[],cn=cid==null?null:cname(cid);
 Object.keys(d.m).forEach(key=>{const v=d.m[key][sid];if(v==null||!(v>=1&&v<=4))return;const p=key.split('|');if(p.length!==3)return;const k=p[0];
  if(o.from&&k<o.from)return;if(o.to&&k>o.to)return;if(o.pred&&!o.pred(k))return;
  const se=d.ses[k+'|'+p[1]],it=se&&(se.it||{})[p[2]];if(!it||it.t==='d')return;
  if(absent(k,sid))return;
  if(cid!=null&&String(se.c)!==String(cid)&&cname(se.c)!==cn)return;
  out.push(v)});
 return out}
/* زنگِ آزمون: اگر معلم صریحاً انتخاب کرده (e.bell)، همان؛ وگرنه اولین زنگی از همان روز که درس آزمون در برنامه‌ی هفتگی/دفتر دارد */
function examBell(e){try{if(!e||!e.date)return null;if(e.bell!=null&&e.bell!=='')return String(e.bell);
 const hit=dayBells(e.date).find(x=>{const q=getSes(e.date,x.b);return q?String(q.c)===String(e.course):(x.cids||[]).map(String).indexOf(String(e.course))>=0});
 return hit?String(hit.b):null}catch(x){return null}}
/* داده‌ی فقط‌خواندنی برای «پیگیری و مقایسه‌ی پیشرفت هر درس» (subject-tracking.js): ارزشیابی‌های ۴سطحی/مثبت‌منفی بین دو تاریخ */
/* «املا» یا «انشا/نگارش» که به‌جای زنگ ویژه، به‌صورت فعالیتِ درس فارسی ثبت شده، در پیگیری هم با همان درس گروه می‌شود */
function specialAct(n){n=String(n||'').trim();for(const l of ['املا','انشا','نگارش']){if(n===l||n.indexOf(l+' ')===0)return l}return''}
function trackEvents(from,to){const d=D(),out=[];
 Object.keys(d.m).forEach(key=>{const p=key.split('|'),k=p[0];if(k<from||k>to||mxOff(k))return;
  const ses=d.ses[k+'|'+p[1]],it=ses&&(ses.it||{})[p[2]],mk=d.m[key];if(!it||!mk||!Object.keys(mk).length)return;
  let mk2=mk;
  if(it.t==='d'){mk2={};Object.keys(mk).forEach(sid=>{if(mk[sid]!=null)mk2[sid]=mk[sid]===1?4:1})}   /* «انجام شد» = خیلی خوب، «نشد» = نیاز به تلاش */
  out.push({k,b:p[1],c:ses.c,t:it.t||'g',sub:specialKind(k,p[1])||specialAct(it.n)||cname(ses.c),act:String(it.n||'').trim()||'فعالیت',mk:mk2})});
 return out}
window.djKit={students:()=>sts(),bellsOf:k=>dayBells(k).map(x=>({b:String(x.b),name:bellName(k,x),short:(String(x.b).charAt(0)==='m'?'زنگ دستی':'زنگ '+(ORD[+x.b]||x.b))+' · '+(specialKind(k,x.b)||((getSes(k,x.b)?[getSes(k,x.b).c]:x.cids)||[]).map(cname).join('+'))})),dlab:k=>dlab(k),addD:(k,n)=>addD(k,n),todayK:()=>todayK(),examBell,isOff:k=>mxOff(k),cur:()=>st.k,refresh:()=>render(),acc:(key,def)=>accOpen(key,def),tk:{events:trackEvents,jparts,jiso,JMN,fa,addD,dow}};
window.djApi={levels,examCourses,materialize,subsOf,evalTypes:cgOptions,oralOf,summary,pending,pendingDays:journalPendingDays,dayStatus:dayJournalStatus,open:(k,b)=>{st.keep=true;if(k)st.k=k;st.b=b!=null?String(b):null;st.item=null;st.note=null;st.pick=new Set();show('dj')}};

function sfCard(){const sb=$('sfb');if(!sb||!window.__sfid||$('djSf'))return;const R=summary(window.__sfid);if(!R.length)return;
 const row=r=>`<tr><td style="padding:4px 6px;font-weight:700">${esc(cname(r.c))}</td>${[4,3,2,1].map(v=>`<td style="text-align:center;color:${LV.find(l=>l.v===v).c};font-weight:800">${fa(r.g[v])}</td>`).join('')}<td style="text-align:center">${r.ok||r.no?fa(r.ok)+' / '+fa(r.no):'—'}${r.pp||r.pn?`<small style="display:block;color:#0f766e">＋${fa(r.pp)} −${fa(r.pn)}</small>`:''}</td></tr>`;
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
window.renderDj=render;
const _show=window.show;window.show=function(id){const r=_show.apply(this,arguments);try{if(id==='dj'){migrateEnsha();if(st.acc)delete st.acc.bat;st.batK=null;if(!st.keep){st.k=startDay();st.b=null;st.item=null;st.note=null;st.pick=new Set();st.tpl=false}st.keep=false;render()}else if(id==='home')homeCard()}catch(e){console.warn('dj',e)}return r};
try{render()}catch(e){console.warn('initial dj render',e)}
try{const h=$('home');if(h&&h.classList.contains('on'))homeCard()}catch(e){}
}catch(e){console.error('daily-journal',e)}})();

/* هسته‌ی منطق ساخت برگه‌ی امتحانی — محلی، بدون وابستگی آنلاین و بدون ساخت سؤال تازه
   فقط از سؤال‌های موجود در بانک (S.qbk) انتخاب می‌کند. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.ExamBuilderCore=factory();
})(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const DIG={'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
 const toNum=v=>{
  if(v==null||v==='')return null;
  const s=String(v).replace(/[۰-۹٠-٩]/g,d=>DIG[d]).trim();
  if(!/^\d+$/.test(s))return null;
  return parseInt(s,10);
 };
 const norm=s=>String(s==null?'':s).normalize('NFKC').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();

 /* سطح دانش‌آموز: همان کلیدهای ذخیره‌شده (e/m/h) با برچسب‌های آموزشی */
 const STUDENT_LEVELS=Object.freeze([
  {k:'e',label:'نیازمند تمرین بیشتر'},
  {k:'m',label:'متوسط'},
  {k:'h',label:'قوی'}
 ]);
 /* ترکیب پیش‌فرض برای ۱۰ سؤال؛ برای تعداد دیگر به نسبت مقیاس می‌شود */
 const DEFAULT_MIX=Object.freeze({
  e:Object.freeze({e:6,m:3,h:1}),
  m:Object.freeze({e:3,m:4,h:3}),
  h:Object.freeze({e:2,m:3,h:5})
 });

 /* مقیاس‌دهی ترکیب به تعداد دلخواه با روش بزرگ‌ترین باقی‌مانده تا مجموع دقیقاً total شود */
 function scaleMix(mix,total){
  total=Math.max(0,Math.floor(total));
  const base=(mix.e||0)+(mix.m||0)+(mix.h||0);
  if(!base||!total)return {e:0,m:0,h:0};
  const keys=['e','m','h'],out={},rem=[];let used=0;
  keys.forEach(k=>{const raw=(mix[k]||0)*total/base;out[k]=Math.floor(raw);used+=out[k];rem.push([k,raw-out[k]])});
  rem.sort((a,b)=>b[1]-a[1]);
  for(let i=0;used<total;i=(i+1)%3){out[rem[i][0]]++;used++}
  return out;
 }

 /* محدوده‌ی امتحان
    scope = {
      gr, bk,                      پایه و کتاب (اختیاری)
      lessonFrom, lessonTo,        بازه‌ی شماره‌ی درس (اختیاری)
      lessons:[...],               انتخاب دستی شماره‌ی درس‌ها (اختیاری؛ اگر پر باشد بازه‌ی درس نادیده گرفته می‌شود)
      pageFrom, pageTo,            بازه‌ی صفحه (اختیاری)
      topic                        مبحث (اختیاری)
    }
    نتیجه‌ی هر سؤال: 'in' | 'out' | 'unknown' (اطلاعات لازم برای فیلتر در بانک نیست)
    هرگز حدس نمی‌زند: سؤال بدون شماره‌ی درس/صفحه وقتی آن فیلتر فعال است «نامشخص» می‌شود. */
 function classify(q,scope){
  scope=scope||{};
  if(scope.gr&&norm(q.gr)!==norm(scope.gr))return 'out';
  if(scope.bk&&norm(q.bk)!==norm(scope.bk))return 'out';
  if(scope.topic&&norm(q.tp)!==norm(scope.topic))return 'out';
  let unknown=false;
  const manual=(scope.lessons||[]).map(toNum).filter(n=>n!=null);
  const lf=toNum(scope.lessonFrom),lt=toNum(scope.lessonTo);
  if(manual.length||lf!=null||lt!=null){
   const ln=toNum(q.ln);
   if(ln==null)unknown=true;
   else if(manual.length){if(!manual.includes(ln))return 'out'}
   else{if(lf!=null&&ln<lf)return 'out';if(lt!=null&&ln>lt)return 'out'}
  }
  const pf=toNum(scope.pageFrom),pt=toNum(scope.pageTo);
  if(pf!=null||pt!=null){
   const a=toNum(q.p1),b=toNum(q.p2);
   if(a==null&&b==null)unknown=true;
   else{
    const lo=a!=null?a:b,hi=b!=null?b:a;
    /* سؤال باید کاملاً داخل بازه باشد؛ اگر فقط بخشی از صفحه‌هایش در بازه است، خارج حساب می‌شود */
    if(pf!=null&&lo<pf)return 'out';
    if(pt!=null&&hi>pt)return 'out';
   }
  }
  return unknown?'unknown':'in';
 }

 function filterScope(bank,scope){
  const inside=[],unknown=[];
  (bank||[]).forEach(q=>{const c=classify(q,scope);if(c==='in')inside.push(q);else if(c==='unknown')unknown.push(q)});
  return {inside,unknown};
 }

 /* Fisher–Yates با تابع تصادفی قابل تزریق (برای تست قطعی) */
 function shuffle(arr,rnd){
  rnd=rnd||Math.random;const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
 }

 /* انتخاب سؤال برای یک دانش‌آموز.
    pool: فقط سؤال‌های داخل محدوده (خروجی filterScope().inside)
    want: {e,m,h}
    اگر یک سطح کم بود، کمبود با سؤال‌های همان محدوده‌ی موجود از سطح‌های دیگر جبران می‌شود
    (به ترتیب نزدیک‌ترین سطح) و در گزارش می‌آید. هیچ‌وقت از بیرون pool چیزی نمی‌آید.
    exclude: مجموعه‌ی شناسه‌هایی که نباید دوباره بیایند (اختیاری) */
 function pick(pool,want,opts){
  opts=opts||{};const rnd=opts.rnd||Math.random,ex=new Set((opts.exclude||[]).map(String));
  const by={e:[],m:[],h:[]};
  shuffle(pool.filter(q=>!ex.has(String(q.id))),rnd).forEach(q=>{if(by[q.lv])by[q.lv].push(q)});
  const total=(want.e||0)+(want.m||0)+(want.h||0);
  const got={e:[],m:[],h:[]},missing={e:0,m:0,h:0};
  ['e','m','h'].forEach(k=>{const n=want[k]||0;got[k]=by[k].splice(0,n);missing[k]=n-got[k].length});
  let short=missing.e+missing.m+missing.h;
  const near={e:['m','h'],m:['e','h'],h:['m','e']};
  const filled={e:0,m:0,h:0};
  ['e','m','h'].forEach(k=>{
   for(const alt of near[k]){
    while(missing[k]>0&&by[alt].length){got[alt].push(by[alt].shift());missing[k]--;filled[alt]++;short--}
   }
  });
  const questions=[].concat(got.e,got.m,got.h);
  return {
   questions,
   wanted:{e:want.e||0,m:want.m||0,h:want.h||0},
   actual:{e:got.e.length,m:got.m.length,h:got.h.length},
   requested:total,
   shortage:Math.max(0,total-questions.length), /* کمبود نهایی که با هیچ سطحی پر نشد */
   changedMix:(got.e.length!==(want.e||0))||(got.m.length!==(want.m||0))||(got.h.length!==(want.h||0))
  };
 }

 /* سطح خودکار از میانگین نمره‌ی آزمون‌های همان درس (مقیاس ۰ تا ۴) */
 function autoLevel(avg){if(avg==null||isNaN(avg))return null;return avg>=3.3?'h':(avg<2.5?'e':'m')}
 /* manual={k,d}: سطحی که معلم بعد از ارزشیابی آغازین ثبت کرده (d=تاریخ ثبت، ISO)
    exams=[{d,v}]: نمره‌های دانش‌آموز در همان درس. حداقل ۲ آزمون بعد از تاریخ ثبت لازم است؛ میانگین ۳ آزمون آخر */
 function resolveLevel(manual,exams){
  const after=(exams||[]).filter(e=>e&&e.v!=null&&(!manual||!manual.d||String(e.d)>String(manual.d))).sort((a,b)=>String(a.d).localeCompare(String(b.d)));
  if(after.length>=2){const last=after.slice(-3),avg=last.reduce((t,e)=>t+e.v,0)/last.length;return {key:autoLevel(avg),src:'auto',n:last.length,avg}}
  if(manual&&manual.k)return {key:manual.k,src:'manual',n:0};
  return {key:'m',src:'none',n:0};
 }

 function mixFor(levelKey,total,custom){
  const m=(custom&&custom[levelKey])||DEFAULT_MIX[levelKey]||DEFAULT_MIX.m;
  return scaleMix(m,total);
 }

 /* ساخت برگه برای چند دانش‌آموز. هر دانش‌آموز بر اساس سطح خودش (یا سطح پیش‌فرض متوسط) */
 function buildForStudents(bank,scope,students,total,opts){
  opts=opts||{};
  const {inside,unknown}=filterScope(bank,scope);
  const sheets=students.map(s=>{
   const lv=(s&&(s.qbkLevel||s.initialLevel))||'';
   const key=lv||'m';
   const want=mixFor(key,total,opts.mix);
   const r=pick(inside,want,{rnd:opts.rnd});
   return {student:s,levelKey:key,levelKnown:!!lv,want,result:r};
  });
  return {sheets,insideCount:inside.length,unknownCount:unknown.length,unknown};
 }

 return Object.freeze({toNum,norm,STUDENT_LEVELS,DEFAULT_MIX,scaleMix,autoLevel,resolveLevel,classify,filterScope,shuffle,pick,mixFor,buildForStudents});
});

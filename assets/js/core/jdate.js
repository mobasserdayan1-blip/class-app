/* هسته‌ی تاریخ شمسی — بدون وابستگی؛ هم در مرورگر (window.JDate) و هم در Node (برای تست).
   قراردادها: تاریخ = رشته‌ی میلادی ISO «YYYY-MM-DD»؛ شیء Date همیشه ساعت ۱۲ UTC.
   تفاوت اصلی با fromJ قدیمی: تاریخ نامعتبر (مثلاً ۳۰ اسفند سال غیرکبیسه) null برمی‌گرداند، نه تاریخ دیگر. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.JDate=factory();
})(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const fmt=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
 const DAY=864e5;
 const addD=(d,n)=>new Date(d.getTime()+n*DAY);
 const iso=d=>d.toISOString().slice(0,10);
 const dt=k=>new Date(k+'T12:00:00Z');
 /* Date → {y,m,d} شمسی */
 function parts(d){const o={};fmt.formatToParts(d).forEach(p=>{if(p.type==='year'||p.type==='relatedYear')o.y=+p.value;else if(p.type==='month')o.m=+p.value;else if(p.type==='day')o.d=+p.value});return o}
 const toJ=k=>parts(dt(k));
 const maxDay=(y,m)=>m<=6?31:m<=11?30:30; /* سقف نظری؛ ۳۰ اسفند با اعتبارسنجی برگشتی بررسی می‌شود */
 /* شمسی → Date (ساعت ۱۲ UTC) یا null اگر نامعتبر */
 function fromJ(y,m,d){
  y=+y;m=+m;d=+d;
  if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d))return null;
  if(y<1200||y>1700||m<1||m>12||d<1||d>maxDay(y,m))return null;
  let g=addD(new Date(Date.UTC(y+621,2,21,12)),(m<=6?(m-1)*31:186+(m-7)*30)+d-1);
  const t=y*400+m*32+d;
  for(let i=0;i<10;i++){const p=parts(g),v=p.y*400+p.m*32+p.d;if(v===t)break;g=addD(g,v>t?-1:1)}
  const p=parts(g);
  return(p.y===y&&p.m===m&&p.d===d)?g:null;
 }
 const toIso=(y,m,d)=>{const g=fromJ(y,m,d);return g?iso(g):null};
 const isValid=(y,m,d)=>fromJ(y,m,d)!==null;
 const isLeap=y=>fromJ(y,12,30)!==null;
 const monthLen=(y,m)=>m<=6?31:m<=11?30:(isLeap(y)?30:29);
 /* روز هفته با شنبه=۰ … جمعه=۶ */
 const weekday=k=>(dt(k).getUTCDay()+1)%7;
 /* پنجشنبه و جمعه پیش‌فرضِ آخر هفته؛ بعداً قابل تنظیم است */
 const WEEKEND_DEFAULT=[5,6];
 const isWeekend=(k,wk)=>(wk||WEEKEND_DEFAULT).indexOf(weekday(k))>=0;
 return Object.freeze({parts,toJ,fromJ,toIso,isValid,isLeap,monthLen,weekday,isWeekend,iso,dt,addD,WEEKEND_DEFAULT});
});

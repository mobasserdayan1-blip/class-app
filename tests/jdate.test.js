const test=require('node:test');
const assert=require('node:assert/strict');
const J=require('../assets/js/core/jdate.js');

test('نوروز سال‌های ۱۴۰۳ تا ۱۴۰۶ روی تاریخ میلادی درست می‌نشیند',()=>{
 assert.equal(J.toIso(1403,1,1),'2024-03-20');
 assert.equal(J.toIso(1404,1,1),'2025-03-21');
 assert.equal(J.toIso(1405,1,1),'2026-03-21');
 assert.equal(J.toIso(1406,1,1),'2027-03-21');
});
test('سال‌های کبیسه‌ی شناخته‌شده',()=>{
 assert.equal(J.isLeap(1399),true);
 assert.equal(J.isLeap(1403),true);
 [1400,1401,1402,1404,1405,1406].forEach(y=>assert.equal(J.isLeap(y),false,String(y)));
 assert.equal(J.monthLen(1403,12),30);
 assert.equal(J.monthLen(1404,12),29);
 assert.equal(J.monthLen(1405,1),31);
 assert.equal(J.monthLen(1405,7),30);
});
test('تاریخ نامعتبر null برمی‌گرداند، نه تاریخ دیگر (عیب fromJ قدیمی)',()=>{
 assert.equal(J.fromJ(1404,12,30),null);   /* قبلاً بی‌صدا ۱۴۰۵/۱/۱ می‌شد */
 assert.equal(J.fromJ(1405,12,30),null);
 assert.equal(J.fromJ(1405,7,31),null);
 assert.equal(J.fromJ(1405,13,1),null);
 assert.equal(J.fromJ(1405,0,10),null);
 assert.equal(J.fromJ(1405,5,0),null);
 assert.equal(J.fromJ('abc',1,1),null);
 assert.equal(J.fromJ(1405.5,1,1),null);
 assert.equal(J.isValid(1403,12,30),true);
});
test('رفت‌وبرگشت همه‌ی روزهای معتبر ۱۳۹۹ تا ۱۴۱۰',()=>{
 let n=0;
 for(let y=1399;y<=1410;y++)for(let m=1;m<=12;m++)for(let d=1;d<=J.monthLen(y,m);d++){
  const k=J.toIso(y,m,d);assert.ok(k,`${y}/${m}/${d}`);
  const p=J.toJ(k);assert.deepEqual([p.y,p.m,p.d],[y,m,d]);n++}
 assert.ok(n>4300);
});
test('روزهای متوالی بدون پرش و بدون تکرار',()=>{
 let prev=null;
 for(let y=1404;y<=1406;y++)for(let m=1;m<=12;m++)for(let d=1;d<=J.monthLen(y,m);d++){
  const g=J.fromJ(y,m,d);if(prev)assert.equal(g-prev,864e5,`${y}/${m}/${d}`);prev=g}
});
test('روز هفته با شنبه=۰ و آخر هفته‌ی پیش‌فرض پنجشنبه/جمعه',()=>{
 assert.equal(J.weekday('2026-11-07'),0);  /* شنبه */
 assert.equal(J.weekday('2026-11-03'),3);  /* سه‌شنبه */
 assert.equal(J.isWeekend('2026-11-05'),true);  /* پنجشنبه */
 assert.equal(J.isWeekend('2026-11-06'),true);  /* جمعه */
 assert.equal(J.isWeekend('2026-11-04'),false); /* چهارشنبه */
 assert.equal(J.isWeekend('2026-11-04',[4]),true); /* آخر هفته‌ی دلخواه */
});
test('امروزِ مرجع: ۳ نوامبر ۲۰۲۶ برابر ۱۴۰۵/۰۸/۱۲ و بازه‌ی سال تحصیلی ۱۴۰۵',()=>{
 const p=J.toJ('2026-11-03');assert.deepEqual([p.y,p.m,p.d],[1405,8,12]);
 assert.equal(J.toIso(1405,7,1),'2026-09-23');
 assert.equal(J.toIso(1406,3,31),'2027-06-21');
});

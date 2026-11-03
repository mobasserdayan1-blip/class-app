const test=require('node:test');
const assert=require('node:assert/strict');
const OH=require('../assets/js/core/official-holidays.js');
const J=require('../assets/js/core/jdate.js');

test('ثابت‌های شمسی برای هر سال از ۱۳۵۸ اعمال می‌شوند',()=>{
 [1400,1404,1405,1406,1410].forEach(y=>{
  assert.deepEqual(OH.titles(y,1,1),['عید نوروز'].concat(OH.YEARS[y]&&OH.YEARS[y]['1/1']?[OH.YEARS[y]['1/1']]:[]));
  assert.ok(OH.titles(y,1,12).length>0);assert.ok(OH.titles(y,1,13).length>0);
  assert.ok(OH.titles(y,3,14)[0].includes('امام خمینی'));assert.ok(OH.titles(y,3,15).length>0);
  assert.ok(OH.titles(y,11,22).length>0);assert.ok(OH.titles(y,12,29).length>0)});
 assert.deepEqual(OH.titles(1357,1,1),[],'قبل از ۱۳۵۸ چیزی حدس زده نمی‌شود');
});
test('روز عادی تعطیل نیست',()=>{
 assert.deepEqual(OH.titles(1405,7,10),[]);assert.deepEqual(OH.titles(1405,8,12),[]);assert.deepEqual(OH.titles(1405,2,15),[]);
});
test('۱۴۰۵: دقیقاً ۲۶ روز مناسبتی و همه تاریخ‌های معتبر',()=>{
 const L=OH.ofYear(1405);assert.equal(L.length,26);
 L.forEach(x=>assert.ok(J.isValid(1405,x.m,x.d),x.m+'/'+x.d));
 assert.equal(OH.coverage(1405),'full');
});
test('۱۴۰۵: روزهای قمری با روز هفته‌ی تقویم رسمی می‌خوانند',()=>{
 const wd=(m,d)=>J.weekday(J.toIso(1405,m,d)); /* شنبه=۰ … جمعه=۶ */
 assert.equal(wd(1,25),3);  /* سه‌شنبه — شهادت امام صادق */
 assert.equal(wd(3,6),4);   /* چهارشنبه — قربان */
 assert.equal(wd(3,14),5);  /* پنجشنبه — غدیر + رحلت امام */
 assert.equal(wd(4,3),4);   /* چهارشنبه — تاسوعا */
 assert.equal(wd(4,4),5);   /* پنجشنبه — عاشورا */
 assert.equal(wd(5,13),3);  /* سه‌شنبه — اربعین */
 assert.equal(wd(5,22),5);  /* پنجشنبه */
 assert.equal(wd(6,8),1);   /* یکشنبه — میلاد پیامبر */
 assert.equal(wd(8,22),6);  /* جمعه */
 assert.equal(wd(10,2),4);  /* چهارشنبه */
 assert.equal(wd(12,19),4); /* چهارشنبه — عید فطر */
 assert.equal(wd(12,29),0); /* شنبه — ملی شدن نفت */
});
test('۸ شهریور ۱۴۰۵ (ولادت پیامبر) ثبت است — در جدول قدیمی نبود',()=>{
 assert.match(OH.titles(1405,6,8).join(),/ولادت پیامبر/);
});
test('دو مناسبت یک روز هر دو در عنوان می‌آید (۱۴ خرداد ۱۴۰۵)',()=>{
 const t=OH.titles(1405,3,14);assert.equal(t.length,2);assert.ok(t.join(' ').includes('غدیر')&&t.join(' ').includes('امام خمینی'));
});
test('سال بدون جدول: قمری‌ها حدس زده نمی‌شوند و پوشش fixed-only است',()=>{
 assert.equal(OH.coverage(1406),'fixed-only');assert.equal(OH.coverage(1407),'fixed-only');assert.equal(OH.coverage(1403),'fixed-only');
 assert.equal(OH.coverage(1300),'none');assert.equal(OH.coverage(1350),'none');
 /* ۱۴۰۶: فقط ثابت‌ها (۱۰ روز) */
 assert.equal(OH.ofYear(1406).length,10);
 [[1,14],[2,27],[3,4],[3,24],[3,25],[8,12],[12,8]].forEach(([m,d])=>assert.deepEqual(OH.titles(1406,m,d),[],m+'/'+d));
});
test('۱۴۰۴: ۱۸ روز قمری + ثابت‌ها؛ تاریخ‌ها معتبر',()=>{
 assert.equal(OH.coverage(1404),'full');
 Object.keys(OH.YEARS[1404]).forEach(k=>{const [m,d]=k.split('/').map(Number);assert.ok(J.isValid(1404,m,d),k)});
 assert.equal(J.weekday(J.toIso(1404,4,14)),0); /* شنبه — تاسوعا */
 assert.equal(J.weekday(J.toIso(1404,12,29)),6);/* جمعه */
});
test('ماه ۱۲ در سال غیرکبیسه ۳۰ ندارد و جدول‌ها چنین کلیدی ندارند',()=>{
 [1404,1405].forEach(y=>Object.keys(OH.YEARS[y]).forEach(k=>{const [m,d]=k.split('/').map(Number);assert.ok(d<=J.monthLen(y,m))}));
});

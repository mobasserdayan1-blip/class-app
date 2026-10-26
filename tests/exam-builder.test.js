const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/js/features/exam-builder-core.js');

let id=1;
const mk=(o)=>Object.assign({id:id++,gr:'چهارم',bk:'علوم',ls:'درس',lv:'m',ty:'es',q:'سؤال '+id,op:[],ok:-1,ans:'',pt:1},o);
const ids=a=>a.map(q=>q.id);

const bank=[
 mk({ln:1,p1:10,p2:12,lv:'e'}),mk({ln:1,p1:13,p2:14,lv:'m'}),
 mk({ln:2,p1:15,p2:18,lv:'e'}),mk({ln:2,p1:19,p2:20,lv:'h'}),
 mk({ln:3,p1:21,p2:25,lv:'m',tp:'گیاهان'}),mk({ln:3,p1:26,p2:28,lv:'h',tp:'گیاهان'}),
 mk({ln:4,p1:30,p2:33,lv:'e'}),
 mk({lv:'e'}),                                /* بدون شماره‌ی درس و صفحه */
 mk({ln:2,p1:15,p2:18,lv:'e',bk:'مطالعات'}), /* کتاب دیگر */
 mk({ln:2,p1:15,p2:18,lv:'e',gr:'پنجم'})      /* پایه‌ی دیگر */
];

test('بازه‌ی درس: فقط درس‌های داخل بازه',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:1,lessonTo:2});
 assert.deepEqual(r.inside.map(q=>q.ln).sort(),[1,1,2,2]);
 assert.ok(r.inside.every(q=>q.bk==='علوم'&&q.gr==='چهارم'));
});
test('بازه‌ی صفحه: فقط سؤال‌های کاملاً داخل بازه',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',pageFrom:10,pageTo:25});
 assert.ok(r.inside.every(q=>q.p1>=10&&q.p2<=25));
 assert.equal(r.inside.length,5);
});
test('ترکیب درس و صفحه: باید هر دو شرط برقرار باشد',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:1,lessonTo:3,pageFrom:13,pageTo:25});
 r.inside.forEach(q=>{assert.ok(q.ln>=1&&q.ln<=3);assert.ok(q.p1>=13&&q.p2<=25)});
 assert.equal(r.inside.length,4);
});
test('ترکیب با مبحث',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:1,lessonTo:3,topic:'گیاهان'});
 assert.equal(r.inside.length,2);
 assert.ok(r.inside.every(q=>q.tp==='گیاهان'));
});
test('انتخاب دستی درس‌ها (۱ و ۳ بدون ۲)',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessons:[1,3]});
 assert.deepEqual(r.inside.map(q=>q.ln).sort(),[1,1,3,3]);
 assert.ok(!r.inside.some(q=>q.ln===2));
});
test('ارقام فارسی در ورودی‌ها پذیرفته می‌شود',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:'۱',lessonTo:'۲'});
 assert.equal(r.inside.length,4);
});
test('سؤال بدون شماره‌ی درس/صفحه حدس زده نمی‌شود و «نامشخص» اعلام می‌شود',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:1,lessonTo:4});
 assert.equal(r.unknown.length,1);
 assert.ok(!r.inside.includes(r.unknown[0]));
 const r2=C.filterScope(bank,{gr:'چهارم',bk:'علوم',pageFrom:10,pageTo:40});
 assert.equal(r2.unknown.length,1);
});
test('بدون فیلتر درس/صفحه، سؤال بدون شماره نامشخص نیست',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم'});
 assert.equal(r.unknown.length,0);
 assert.equal(r.inside.length,8);
});
test('پایه و کتاب دیگر هرگز وارد محدوده نمی‌شوند',()=>{
 const r=C.filterScope(bank,{gr:'چهارم',bk:'علوم',lessonFrom:1,lessonTo:4});
 assert.ok(!r.inside.some(q=>q.bk==='مطالعات'||q.gr==='پنجم'));
});

test('مقیاس ترکیب سطح‌ها همیشه جمع دقیق می‌دهد',()=>{
 for(const lv of ['e','m','h'])for(const n of [1,3,5,7,10,13,20]){
  const m=C.mixFor(lv,n);assert.equal(m.e+m.m+m.h,n,lv+' '+n);
 }
 assert.deepEqual(C.mixFor('e',10),{e:6,m:3,h:1});
 assert.deepEqual(C.mixFor('m',10),{e:3,m:4,h:3});
 assert.deepEqual(C.mixFor('h',10),{e:2,m:3,h:5});
});

function big(){const a=[];for(let i=0;i<30;i++)a.push(mk({ln:1,p1:10,p2:11,lv:['e','m','h'][i%3]}));return a}
test('انتخاب بر اساس سطح دانش‌آموز طبق جدول ۱۰ سؤالی',()=>{
 const pool=big();
 const r=C.pick(pool,C.mixFor('e',10));
 assert.deepEqual(r.actual,{e:6,m:3,h:1});assert.equal(r.shortage,0);assert.equal(r.changedMix,false);
 assert.equal(new Set(ids(r.questions)).size,10);
});
test('کمبود یک سطح: از همان محدوده جبران و گزارش می‌شود، سؤال بیرونی نمی‌آید',()=>{
 const pool=[...Array(2)].map(()=>mk({ln:1,lv:'h'})).concat([...Array(8)].map(()=>mk({ln:1,lv:'e'})));
 const outside=mk({ln:9,lv:'h'});
 const r=C.pick(pool,{e:2,m:3,h:5});
 assert.equal(r.questions.length,10);
 assert.equal(r.changedMix,true);
 assert.ok(!ids(r.questions).includes(outside.id));
 assert.ok(r.questions.every(q=>pool.includes(q)));
});
test('کمبود کل سؤال: تعداد واقعی کمتر و کمبود گزارش می‌شود',()=>{
 const pool=[mk({lv:'e'}),mk({lv:'m'}),mk({lv:'h'})];
 const r=C.pick(pool,{e:6,m:3,h:1});
 assert.equal(r.questions.length,3);assert.equal(r.shortage,7);
});
test('ساخت برای چند دانش‌آموز با سطح‌های مختلف، همه داخل محدوده',()=>{
 const b=big().concat([mk({ln:7,lv:'e'}),mk({ln:7,lv:'h'})]);
 const studs=[{id:1,name:'الف',qbkLevel:'e'},{id:2,name:'ب',qbkLevel:'m'},{id:3,name:'ج',qbkLevel:'h'},{id:4,name:'د'}];
 const out=C.buildForStudents(b,{lessonFrom:1,lessonTo:1},studs,10);
 assert.equal(out.sheets.length,4);
 assert.deepEqual(out.sheets[0].result.actual,{e:6,m:3,h:1});
 assert.deepEqual(out.sheets[2].result.actual,{e:2,m:3,h:5});
 assert.equal(out.sheets[3].levelKnown,false);
 out.sheets.forEach(s=>s.result.questions.forEach(q=>assert.equal(q.ln,1)));
});
test('خروج سؤال از محدوده با دانش‌آموز بدون سطح هم اتفاق نمی‌افتد',()=>{
 const b=[mk({ln:1,lv:'e'}),mk({ln:5,lv:'e'}),mk({ln:5,lv:'m'})];
 const out=C.buildForStudents(b,{lessonFrom:1,lessonTo:1},[{id:1,name:'x'}],10);
 assert.equal(out.sheets[0].result.questions.length,1);
 assert.equal(out.sheets[0].result.shortage,9);
});
test('انتخاب تصادفی با seed ثابت قطعی است',()=>{
 const mkRnd=()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}};
 const pool=big();
 const a=C.pick(pool,C.mixFor('m',10),{rnd:mkRnd()}),b=C.pick(pool,C.mixFor('m',10),{rnd:mkRnd()});
 assert.deepEqual(ids(a.questions),ids(b.questions));
});

/* سطح خودکار به تفکیک درس */
{
 const test=require('node:test'),assert=require('node:assert');
 const C=require('../assets/js/features/exam-builder-core.js');
 test('resolveLevel: فقط ثبت معلم',()=>{assert.deepEqual(C.resolveLevel({k:'e',d:'2026-10-01'},[{d:'2026-10-10',v:4}]).key,'e')});
 test('resolveLevel: بعد از ۲ آزمون جدید خودکار می‌شود',()=>{const r=C.resolveLevel({k:'e',d:'2026-10-01'},[{d:'2026-09-20',v:1},{d:'2026-10-10',v:4},{d:'2026-10-20',v:3.6}]);assert.equal(r.src,'auto');assert.equal(r.key,'h')});
 test('resolveLevel: بدون داده = متوسط',()=>{assert.equal(C.resolveLevel(null,[]).key,'m')});
}

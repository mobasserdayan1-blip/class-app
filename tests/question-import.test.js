const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../assets/js/features/question-import-core.js');
test('parses numbered questions without inventing text',()=>{
 const q=Core.parse('۱- حاصل ۲ + ۲ چند است؟\nپاسخ: ۴\n۲- پایتخت ایران کدام است؟\nپاسخ: تهران');
 assert.equal(q.length,2);
 assert.equal(q[0].q,'حاصل ۲ + ۲ چند است؟');
 assert.equal(q[0].ans,'۴');
 assert.equal(q[1].q,'پایتخت ایران کدام است؟');
});
test('parses options and answer marker from source text',()=>{
 const q=Core.parse('۱- حاصل ۲ + ۲ چیست؟\nالف) ۳\nب) ۴\nج) ۵\nپاسخ: ب');
 assert.equal(q.length,1);
 assert.equal(q[0].op.length,3);
 assert.equal(q[0].ans,'ب');
 assert.equal(q[0].ok,'2');
});
test('falls back to question-mark lines with low confidence',()=>{
 const q=Core.parse('این یک پرسش است؟\nپاسخ: بله\nتوضیح');
 assert.equal(q.length,1);
 assert.equal(q[0].q,'این یک پرسش است؟');
 assert.equal(q[0].ans,'بله توضیح');
 assert.equal(q[0].confidence,'question-mark');
});
test('duplicate key normalizes Arabic/Persian letter variants and whitespace',()=>{
 assert.equal(Core.duplicateKey({gr:'چهارم',bk:'فارسی',ls:'درس ۱',q:'كتاب   خوب'}),
              Core.duplicateKey({gr:'چهارم',bk:'فارسی',ls:'درس ۱',q:'کتاب خوب'}));
});

/* ===== نسخه‌ی ۱۱۴: ورود ساختاریافته از Word ===== */
const fs=require('node:fs'),path=require('node:path');
const fx=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures',n+'.json'),'utf8'));
test('real template: 8 questions, book/lesson from headings, guide after «پایان سؤالات» ignored',()=>{
 const r=Core.parseStructured(fx('question-import-template-science4'));
 assert.equal(r.items.length,8);assert.equal(r.ended,true);
 assert.ok(r.items.every(x=>x.bk==='علوم تجربی'&&x.ls==='درس اول: زنگ علوم'&&x.ans.length>3&&!x.flags.length));
 assert.equal(r.items[0].q,'لباس‌های تیره زودتر خشک می‌شوند یا لباس‌های روشن؟ چرا؟');
});
test('multiple lessons and books, topic heading, tags, multi-line answers',()=>{
 const r=Core.parseStructured([{h:1,t:'مطالعات'},{h:2,t:'درس ۱'},{h:3,t:'مبحث الف'},{h:0,t:'س: اول [سخت] [تشریحی]\nپ: ج۱\nادامه'},
  {h:2,t:'درس ۲'},{h:0,t:'س: دوم\nپ: ج۲'},{h:1,t:'فارسی'},{h:2,t:'درس ۱'},{h:0,t:'س: سوم [متوسط]\nپ: ج۳'}]);
 assert.equal(r.items.length,3);
 assert.deepEqual(r.items.map(x=>[x.bk,x.ls,x.tp]),[['مطالعات','درس ۱','مبحث الف'],['مطالعات','درس ۲',''],['فارسی','درس ۱','']]);
 assert.equal(r.items[0].lv,'h');assert.equal(r.items[0].type,'es');assert.equal(r.items[0].ans,'ج۱ ادامه');assert.equal(r.items[2].lv,'m');
});
test('missing answer is flagged; unknown tag is kept and warned',()=>{
 const r=Core.parseStructured([{h:1,t:'ب'},{h:2,t:'د'},{h:0,t:'س: بدون پاسخ'},{h:0,t:'س: عجیب [نمونه]\nپ: ب'}]);
 assert.ok(r.items[0].flags.includes('noans'));
 assert.equal(r.items[1].q,'عجیب [نمونه]');assert.equal(r.warnings.length,1);
});
test('duplicates inside file and against bank are flagged',()=>{
 const r=Core.parseStructured([{h:1,t:'ب'},{h:2,t:'د'},{h:0,t:'س: يک سؤال\nپ: ا'},{h:0,t:'س: یک سؤال\nپ: ا'},{h:0,t:'س: در بانک\nپ: ا'}]);
 Core.markDuplicates(r.items,[{bk:'ب',ls:'د',q:'در بانک'}]);
 assert.deepEqual(r.items.map(x=>x.flags.includes('dup')),[false,true,true]);
});
test('plain format (question line then answer line) works under headings',()=>{
 const r=Core.parseStructured([{h:1,t:'ب'},{h:2,t:'درس ۱'},{h:0,t:'منظور از مشاهده چیست؟\nاستفاده از حواس.\nچرا آسمان آبی است؟\nپراکندگی نور'}]);
 assert.equal(r.mode,'plain');assert.equal(r.items.length,2);assert.equal(r.items[1].ans,'پراکندگی نور');
});
test('multiple-choice options inside س: block',()=>{
 const r=Core.parseStructured([{h:1,t:'ب'},{h:2,t:'د'},{h:0,t:'س: حاصل ۲+۲؟\nالف) ۳\nب) ۴\nج) ۵\nپ: ب'}]);
 assert.equal(r.items[0].type,'mc');assert.equal(r.items[0].op.length,3);assert.equal(r.items[0].ok,'2');
});

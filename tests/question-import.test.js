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

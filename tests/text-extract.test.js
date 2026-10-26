'use strict';
/* اجرا: node --test tests   (Node 18+؛ برای خواندن PDF از pdf.js همراه پروژه استفاده می‌شود) */
const test=require('node:test');
const assert=require('node:assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const C=require(path.join(ROOT,'assets/js/features/text-extract-core.js'));
const origWarn=console.warn;console.warn=()=>{};            /* هشدار بی‌اهمیت polyfill در Node */
const pdfjs=require(path.join(ROOT,'assets/js/vendor/pdfjs/pdf.min.js'));
console.warn=origWarn;
pdfjs.GlobalWorkerOptions.workerSrc=path.join(ROOT,'assets/js/vendor/pdfjs/pdf.worker.min.js');
const S=n=>new Uint8Array(fs.readFileSync(path.join(ROOT,'samples',n)));
const mimeOf=n=>n.endsWith('.pdf')?'application/pdf':n.endsWith('.txt')?'text/plain':n.endsWith('.png')?'image/png':'';
async function run(name,opts){
 const r=await C.extractRaw(S(name),{name,type:mimeOf(name)},pdfjs,{});
 return Object.assign({meta:r.meta,raw:r.raw},C.build(r.raw,opts||{}));
}
const rejects=(name,code)=>test('رد می‌شود ('+code+'): '+name,async()=>{
 await assert.rejects(()=>run(name),e=>{assert.strictEqual(e.code,code);assert.ok(e.message&&/[؀-ۿ]/.test(e.message),'پیام فارسی');return true});
});

/* ---------- نرمال‌سازی فارسی ---------- */
test('ي ك عربی و ارقام عربی به فارسی',()=>{
 assert.strictEqual(C.normalizeChars('كتاب ايران ٠١٢٣٤٥٦٧٨٩'),'کتاب ایران ۰۱۲۳۴۵۶۷۸۹');
 assert.strictEqual(C.normalizeChars('۱۲ ٣٤ 56',{digits:'latin'}),'12 34 56');
 assert.strictEqual(C.normalizeChars('۱۲ ٣٤ 56',{digits:'keep'}),'۱۲ ۳٤ 56'.replace('۳٤','٣٤'));
});
test('حذف کنترل‌های جهت و کشیده، حفظ نیم‌فاصله',()=>{
 const s=C.normalizeChars('‏سلام‫ دنیا‬ ـــ می‌شود﻿');
 assert.strictEqual(s,'سلام دنیا  می‌شود');
 assert.ok(!/[‎‏‪-‮⁦-⁩ـ﻿]/.test(s));
});
test('شکل‌های نمایشی عربی به حروف عادی',()=>{
 assert.strictEqual(C.normalizeChars('ﺳﻼم').replace(/‌/g,''),'سلام');
 assert.strictEqual(C.normalizeChars('ﻻ'),'لا');
});
test('بازیابی نیم‌فاصله از شکل‌های نمایشی (می‌کند، خانه‌ها)',()=>{
 assert.strictEqual(C.normalizeChars('ﻣیﮐﻨﺪ'.replace('ﮐ','ک')),'می‌کند');
 assert.strictEqual(C.normalizeChars('ﺧﺎﻧﻪﻫﺎ'),'خانه‌ها');
 assert.strictEqual(C.normalizeChars('ﺳﻼم ﺧﺎﻧﻪ'),'سلام خانه');           /* بدون مرز: بدون نیم‌فاصله */
 assert.strictEqual(C.normalizeChars('می‌کند'),'می‌کند');                /* متن عادی دست‌نخورده */
});
test('cleanLine: نیم‌فاصله‌ی کنار فاصله و فاصله‌ی تکراری',()=>{
 assert.strictEqual(C.cleanLine('الف  ‌ و ‌ ب‌‌  '),'الف و ب');
});

/* ---------- پرانتز وارونه ---------- */
test('اصلاح پرانتز آینه‌شده فقط وقتی لازم است',()=>{
 const bad=C.fixMirroredBrackets([[')۲۰۲۵ میلادی(.','۱( یک']]);
 assert.deepStrictEqual(bad.pages[0],['(۲۰۲۵ میلادی).','۱) یک']);
 const ok=C.fixMirroredBrackets([['(۲۰۲۵ میلادی) درست است']]);
 assert.deepStrictEqual(ok.pages[0],['(۲۰۲۵ میلادی) درست است']);
 assert.strictEqual(ok.changed.length,0);
});

/* ---------- ترتیب برعکس ---------- */
test('تشخیص و اصلاح حروف برعکس، بدون خراب‌کردن اعداد و لاتین',()=>{
 const logical='این است که آب را از آن می برای هر کرد و شد است که این از';
 const flipped=Array.from(logical).reverse().join('');
 assert.ok(C.reversedScore(flipped).reversed);
 assert.ok(!C.reversedScore(logical).reversed);
 const out=C.build({kind:'text',text:flipped+'\n'+flipped},{});
 assert.ok(out.reversedFixed);
 assert.ok(out.text.startsWith(logical));
 assert.strictEqual(C.reverseVisualLine('abc 123 '+Array.from('سلام').reverse().join('')),'سلام 123 abc');
 const off=C.build({kind:'text',text:flipped+'\n'+flipped},{fixReversed:'off'});
 assert.ok(!off.reversedFixed);
});

/* ---------- خط‌ها، سرصفحه، یکپارچه‌سازی ---------- */
test('itemsToLines: راست‌به‌چپ، چند خط و فاصله',()=>{
 const it=(s,x,y,w)=>({str:s,transform:[1,0,0,1,x,y],width:w,height:12});
 const lines=C.itemsToLines([it('دنیا',100,700,30),it('سلام',140,700,30),it('خط دوم',100,680,40)]);
 assert.deepStrictEqual(lines,['سلام دنیا','خط دوم']);
 assert.deepStrictEqual(C.itemsToLines([]),[]);
});
test('حذف سرصفحه/پانویس/شماره‌ی صفحه',()=>{
 const words=['آب','خاک','باد','آتش','نور'];
 const pages=words.map((w,i)=>['مدرسه نمونه — فصل '+(i+1),'متن مخصوص '+w,'صفحه '+(i+1)]);
 const out=C.stripHeadersFooters(pages);
 out.forEach((p,i)=>assert.deepStrictEqual(p,['متن مخصوص '+words[i]]));
});
test('reflow: فقط خط‌های شکسته‌ی یک پاراگراف',()=>{
 const long='این یک خط بلند است که در انتهای خط بریده می‌شود و ادامه دارد';
 const r=C.reflow([long,'ادامه‌ی همان جمله است.','','- مورد فهرست','- مورد دوم']);
 assert.strictEqual(r[0],long+' ادامه‌ی همان جمله است.');
 assert.deepStrictEqual(r.slice(1),['','- مورد فهرست','- مورد دوم']);
});
test('chunk: مرز پاراگراف، سقف طول، متن خالی',()=>{
 const t=Array.from({length:40},(_,i)=>'پاراگراف شماره '+i+' با کمی متن.').join('\n\n');
 const ch=C.chunk(t,{maxChars:300});
 assert.ok(ch.length>1);ch.forEach((c,i)=>{assert.ok(c.chars<=300);assert.strictEqual(c.index,i);assert.strictEqual(c.total,ch.length)});
 assert.strictEqual(ch.map(c=>c.text).join('\n\n'),t);
 assert.deepStrictEqual(C.chunk('  '),[]);
 const one=C.chunk('ج'.repeat(1000),{maxChars:300});assert.ok(one.every(c=>c.chars<=300));
});

/* ---------- فایل‌های نمونه: موفق ---------- */
test('PDF فارسی: متن راست‌به‌چپ، نیم‌فاصله، پرانتز، بدون سرصفحه',async()=>{
 const r=await run('persian-lesson.pdf');
 assert.strictEqual(r.meta.kind,'pdf');assert.strictEqual(r.stats.pages,5);assert.strictEqual(r.stats.dominantDir,'rtl');
 for(const w of ['می‌نامیم','چرخه‌ی آب','دانش‌آموزان','قطره‌های','رودخانه‌ها','(۲۰۲۵ میلادی)','۱) یک نمودار','Evaporation'])
  assert.ok(r.text.includes(w),'باید شامل «'+w+'» باشد');
 assert.ok(!/[ﭐ-﷿ﹰ-﻿]/.test(r.text),'بدون شکل نمایشی');
 assert.ok(!r.text.includes('مدرسه‌ی نمونه'),'سرصفحه حذف شود');
 assert.ok(!/^صفحه [۰-۹]/m.test(r.text),'شماره‌ی صفحه حذف شود');
 assert.ok(r.text.includes('درس سوم'));
 const withHead=await run('persian-lesson.pdf',{stripHeaders:false});
 assert.ok(withHead.text.includes('مدرسه‌ی نمونه'));
 const mk=await run('persian-lesson.pdf',{pageMarkers:true});
 assert.ok(mk.text.includes('--- صفحه ۳ ---'.replace('۳','3')));
});
test('PDF فارسی با حروف جدا و PDF انگلیسی',async()=>{
 const v=await run('persian-visual-order.pdf');
 assert.ok(v.text.includes('آب در طبیعت همواره'));assert.ok(v.text.includes('1404'));
 const e=await run('english.pdf');
 assert.strictEqual(e.stats.dominantDir,'ltr');assert.ok(e.text.startsWith('Lesson 1: The Water Cycle'));
});
test('TXT فارسی: نرمال‌سازی کامل',async()=>{
 const r=await run('persian-utf8.txt');
 assert.ok(r.text.includes('ایران کشوری'));assert.ok(r.text.includes('۸۵ میلیون'));assert.ok(r.text.includes('می‌باشد'));
 assert.ok(!/[يكـ٠-٩‏‫‬ \r]/.test(r.text));
 assert.ok(!/ {2,}/.test(r.text));assert.ok(!/\n{3,}/.test(r.text));
 assert.ok(r.text.includes('Note: PDF and TXT'));
});
test('رمزگذاری‌ها: BOM، UTF-16، ویندوز-۱۲۵۶',async()=>{
 assert.strictEqual((await run('persian-bom.txt')).meta.encoding,'utf-8 (BOM)');
 const u16=await run('persian-utf16.txt');assert.strictEqual(u16.meta.encoding,'utf-16le');assert.ok(u16.text.includes('سلام کلاس ششم'));
 const w=await run('persian-cp1256.txt');assert.strictEqual(w.meta.encoding,'windows-1256');
 assert.ok(w.text.includes('رمزگذاری قدیمی ویندوز'));assert.ok(w.text.includes('دانش‌آموزان'));assert.ok(w.warnings.length>=1);
});

/* ---------- فایل‌های نمونه: رد شده ---------- */
rejects('empty.pdf','EMPTY_FILE');
rejects('empty.txt','EMPTY_FILE');
rejects('whitespace-only.txt','NO_USABLE_TEXT');
rejects('corrupt-truncated.pdf','CORRUPT_PDF');
rejects('fake.pdf','CORRUPT_PDF');
rejects('encrypted.pdf','ENCRYPTED_PDF');
rejects('scanned-image-only.pdf','NO_TEXT_LAYER');
rejects('photo.png','IMAGE_NOT_SUPPORTED');
rejects('binary.txt','BINARY_TEXT');
rejects('unsupported.docx','UNSUPPORTED_TYPE');

test('PDF با پسوند txt هم از روی محتوا PDF شناخته می‌شود؛ txt با پسوند pdf خراب است',async()=>{
 assert.strictEqual(C.sniff(S('english.pdf'),'x.txt','text/plain'),'pdf');
 await assert.rejects(()=>C.extractRaw(new TextEncoder().encode('just text'),{name:'x.pdf',type:'application/pdf'},pdfjs),e=>e.code==='CORRUPT_PDF');
});
test('فایل خیلی بزرگ رد می‌شود و کتابخانه‌ی نبودنِ PDF خطای روشن می‌دهد',async()=>{
 await assert.rejects(()=>C.extractRaw(new Uint8Array(C.LIMITS.maxTextBytes+1).fill(65),{name:'a.txt'},null),e=>e.code==='TOO_LARGE');
 await assert.rejects(()=>C.extractRaw(S('english.pdf'),{name:'a.pdf'},null),e=>e.code==='LIB_LOAD');
});
test('متنِ ناخوانا (فونت بدون نگاشت یونیکد) شناسایی می‌شود',()=>{
 assert.throws(()=>C.build({kind:'pdf',pages:[{n:1,lines:['ÇáÓáÇã Úáíßã ÃíåÇ ÇáÅÎæÉ ÇáãÓáãæä æÇáãÓáãÇÊ ÞÏ ÌÆÊßã']}]},{}),e=>e.code==='GARBLED');
 assert.throws(()=>C.build({kind:'pdf',pages:[{n:1,lines:[' abcdefghij ']}]},{}),e=>e.code==='GARBLED');
});

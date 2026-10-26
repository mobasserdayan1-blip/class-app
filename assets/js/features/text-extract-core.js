/* هسته‌ی استخراج و آماده‌سازی متن — منطق خالص (بدون DOM)، قابل اجرا در مرورگر و Node (برای تست).
   - تشخیص نوع فایل از محتوا، رمزگشایی فایل متنی (UTF-8 / UTF-16 / ویندوز-۱۲۵۶)، تشخیص فایل خراب/خالی/باینری
   - تبدیل آیتم‌های pdf.js به خط‌های متن (با ترتیب درست راست‌به‌چپ)
   - نرمال‌سازی فارسی، حذف سرصفحه/پانویس تکراری، یکپارچه‌سازی خط‌های شکسته، تقسیم به بخش‌های مناسب مرحله‌ی بعد
   ⚠️ هیچ داده‌ای به جایی ارسال نمی‌شود؛ OCR (عکس و PDF اسکن‌شده) در این مرحله پیاده‌سازی نشده است. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.TextExtractCore=factory();
})(typeof self!=='undefined'?self:this,function(){
'use strict';

/* ---------- محدودیت‌ها ---------- */
const LIMITS=Object.freeze({
 maxPdfBytes:30*1024*1024,   /* حداکثر حجم PDF */
 maxTextBytes:5*1024*1024,   /* حداکثر حجم فایل متنی */
 maxPages:400,               /* حداکثر صفحه‌ی PDF که پردازش می‌شود */
 maxChars:3000000,           /* سقف طول متن خروجی */
 minLetters:10,              /* کمتر از این تعداد حرف = متن قابل استفاده نیست */
 pdfTimeoutMs:120000
});
const TEXT_EXT=['txt','text','md','markdown','csv','tsv','log','json'];

/* ---------- پیام‌های خطا (فارسی) ---------- */
const MSG={
 EMPTY_FILE:'فایل خالی است (حجم صفر).',
 TOO_LARGE:'حجم فایل بیش از حد مجاز است.',
 UNSUPPORTED_TYPE:'این نوع فایل پشتیبانی نمی‌شود. فقط PDF متنی و فایل‌های متنی (TXT، MD، CSV، TSV، LOG، JSON) قابل استفاده‌اند.',
 IMAGE_NOT_SUPPORTED:'این فایل عکس است. تشخیص متن از عکس (OCR) هنوز پیاده‌سازی نشده است؛ فعلاً فقط PDF متنی و فایل متنی پشتیبانی می‌شود.',
 CORRUPT_PDF:'فایل PDF خراب یا ناقص است و باز نشد. دوباره از منبع اصلی دریافت کنید.',
 ENCRYPTED_PDF:'این PDF رمزدار (قفل‌شده) است. ابتدا قفل آن را بردارید و دوباره امتحان کنید.',
 NO_TEXT_LAYER:'این PDF لایه‌ی متنی ندارد؛ احتمالاً اسکن یا عکس است. OCR هنوز پیاده‌سازی نشده است؛ از یک PDF متنی استفاده کنید.',
 GARBLED:'متن این PDF قابل‌خواندن نیست (کاراکترهای نامعتبر). معمولاً به‌خاطر فونتی است که نگاشت یونیکد ندارد. نسخه‌ی دیگری از فایل را امتحان کنید.',
 BINARY_TEXT:'این فایل متنی نیست (محتوای باینری دارد) یا خراب است.',
 NO_USABLE_TEXT:'متن قابل‌استفاده‌ی کافی در فایل پیدا نشد.',
 LIB_LOAD:'کتابخانه‌ی خواندن PDF بارگذاری نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.',
 TIMEOUT:'پردازش PDF بیش از حد طول کشید و متوقف شد.',
 READ_FAILED:'خواندن فایل ناموفق بود.',
 PDF_FAILED:'خواندن PDF ناموفق بود.'
};
class ExtractError extends Error{
 constructor(code,extra){super(MSG[code]||code);this.name='ExtractError';this.code=code;this.detail=extra||null}
}
const fail=(code,extra)=>{throw new ExtractError(code,extra)};

/* ---------- تشخیص نوع از محتوا ---------- */
const startsWith=(b,arr,off)=>{off=off||0;if(b.length<off+arr.length)return false;for(let i=0;i<arr.length;i++)if(b[off+i]!==arr[i])return false;return true};
const asc=s=>Array.from(s).map(c=>c.charCodeAt(0));
function hasPdfHeader(b){const h=b.subarray(0,1024);for(let i=0;i<=h.length-5;i++)if(startsWith(h,asc('%PDF-'),i))return true;return false}
function extOf(name){const m=/\.([A-Za-z0-9]{1,10})$/.exec(String(name||''));return m?m[1].toLowerCase():''}

/* بازمی‌گرداند: 'pdf' | 'text' | 'image' | 'other' */
function sniff(bytes,name,mime){
 const head=bytes.subarray(0,1024),ext0=extOf(name),mt0=String(mime||'').toLowerCase();
 if(startsWith(head,asc('%PDF-'),0))return 'pdf';
 /* مشخصات PDF اجازه می‌دهد سرایند تا ۱۰۲۴ بایت اول جلوتر بیاید؛ ولی فقط وقتی PDF بودنش را پسوند/نوع تأیید کند */
 if(ext0==='pdf'||mt0==='application/pdf')return 'pdf';
 if(startsWith(bytes,[0x89,0x50,0x4E,0x47])||startsWith(bytes,[0xFF,0xD8,0xFF])||startsWith(bytes,asc('GIF8'))||
    startsWith(bytes,asc('RIFF'))&&startsWith(bytes,asc('WEBP'),8)||startsWith(bytes,asc('BM'))&&extOf(name)==='bmp'||
    startsWith(bytes,[0x49,0x49,0x2A,0x00])||startsWith(bytes,[0x4D,0x4D,0x00,0x2A]))return 'image';
 if(startsWith(bytes,[0x50,0x4B,0x03,0x04])||startsWith(bytes,[0xD0,0xCF,0x11,0xE0])||startsWith(bytes,asc('{\\rtf'))||
    startsWith(bytes,[0x4D,0x5A])||startsWith(bytes,[0x7F,0x45,0x4C,0x46])||startsWith(bytes,[0x1F,0x8B])||startsWith(bytes,asc('Rar!')))return 'other';
 const ext=extOf(name),mt=String(mime||'').toLowerCase();
 if(/^image\//.test(mt)||['png','jpg','jpeg','gif','webp','bmp','tif','tiff','heic'].includes(ext))return 'image';
 if(TEXT_EXT.includes(ext)||/^text\//.test(mt)||mt==='application/json')return 'text';
 return 'other';
}

/* ---------- رمزگشایی فایل متنی ---------- */
function decodeText(bytes){
 const warnings=[];let enc='utf-8',text;
 const dec=(label,fatal)=>new TextDecoder(label,{fatal:!!fatal}).decode(bytes);
 if(startsWith(bytes,[0xEF,0xBB,0xBF])){text=dec('utf-8');enc='utf-8 (BOM)'}
 else if(startsWith(bytes,[0xFF,0xFE])){text=dec('utf-16le');enc='utf-16le'}
 else if(startsWith(bytes,[0xFE,0xFF])){text=dec('utf-16be');enc='utf-16be'}
 else{
  /* UTF-16 بدون BOM: تعداد زیاد صفر در موقعیت‌های زوج یا فرد */
  const n=Math.min(bytes.length,4000);let ze=0,zo=0;
  for(let i=0;i<n;i++)if(bytes[i]===0){if(i%2===0)ze++;else zo++}
  if(n>=4&&(ze+zo)/n>0.3&&(ze===0||zo===0||Math.abs(ze-zo)/(ze+zo)>0.6)){
   const le=zo>=ze;try{text=dec(le?'utf-16le':'utf-16be',true);enc=le?'utf-16le':'utf-16be';warnings.push('رمزگذاری فایل UTF-16 تشخیص داده شد.')}catch(e){}
  }
  if(text===undefined){
   /* باینری؟ — صفر یا کاراکتر کنترلی زیاد */
   let nul=0,ctl=0;const m=Math.min(bytes.length,65536);
   for(let i=0;i<m;i++){const c=bytes[i];if(c===0)nul++;else if(c<32&&c!==9&&c!==10&&c!==13&&c!==12)ctl++}
   if(nul>0&&nul/m>0.001||ctl/m>0.05)fail('BINARY_TEXT');
   try{text=dec('utf-8',true)}
   catch(e){
    /* فایل‌های قدیمی فارسی: ویندوز-۱۲۵۶ */
    try{
     const t=dec('windows-1256');
     const ar=(t.match(/[؀-ۿ]/g)||[]).length,lat=(t.match(/[A-Za-z]/g)||[]).length;
     if(ar>=lat/4&&ar>0){text=t;enc='windows-1256';warnings.push('فایل UTF-8 نبود؛ با رمزگذاری قدیمی «ویندوز-۱۲۵۶» خوانده شد. اگر حروف درست نیستند، فایل را با UTF-8 ذخیره کنید.')}
     else{text=dec('windows-1252');enc='windows-1252';warnings.push('فایل UTF-8 نبود؛ با رمزگذاری «ویندوز-۱۲۵۲» خوانده شد و ممکن است برخی حروف درست نباشند.')}
    }catch(e2){fail('BINARY_TEXT')}
   }
  }
 }
 const bad=(text.match(/�/g)||[]).length;
 if(text.length&&bad/text.length>0.1)fail('GARBLED');
 return {text,encoding:enc,warnings};
}

/* ---------- ابزارهای نویسه ---------- */
const RE_ARABIC=/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const RE_LETTER=/[A-Za-zÀ-ɏ؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const isRtlChar=c=>/[֐-ࣿיִ-﷿ﹰ-﻿]/.test(c);
const count=(s,re)=>{const m=String(s).match(re);return m?m.length:0};

/* بازیابی نیم‌فاصله‌ی ازدست‌رفته در PDF (نیم‌فاصله در PDF معمولاً ذخیره نمی‌شود و «می‌کند» به «میکند» تبدیل می‌شود).
   قاعده‌ی دقیق: حرفِ «دوطرفه‌چسب» که به شکل پایانی/تنها آمده، یعنی به حرف بعدی نچسبیده؛ پس اگر بلافاصله حرف دیگری بیاید، حتماً
   مرز نیم‌فاصله بوده است (می‌‌کند، خانه‌ها، دانش‌آموز). شکل‌های نمایشی عربی فقط در PDFهای دیداری دیده می‌شوند و در متن عادی بی‌اثر است.
   (۱) شکل پایانی/تنها + حرف بعدی  (۲) «ی» ساده بعد از شکل آغازی/میانی + حرف بعدی (فونت‌هایی که «ی» پایانی را ساده می‌نویسند). */
const FI_DUAL='[\uFB56-\uFB57\uFB7A-\uFB7B\uFB8E-\uFB8F\uFB92-\uFB93\uFBFC-\uFBFD\uFE89-\uFE8A\uFE8F-\uFE90\uFE95-\uFE96\uFE99-\uFE9A\uFE9D-\uFE9E\uFEA1-\uFEA2\uFEA5-\uFEA6\uFEB1-\uFEB2\uFEB5-\uFEB6\uFEB9-\uFEBA\uFEBD-\uFEBE\uFEC1-\uFEC2\uFEC5-\uFEC6\uFEC9-\uFECA\uFECD-\uFECE\uFED1-\uFED2\uFED5-\uFED6\uFED9-\uFEDA\uFEDD-\uFEDE\uFEE1-\uFEE2\uFEE5-\uFEE6\uFEE9-\uFEEA\uFEEF-\uFEF2]';
const IM_ANY='[\uFB54-\uFB55\uFB58-\uFB59\uFB5C-\uFB5D\uFB60-\uFB61\uFB64-\uFB65\uFB68-\uFB69\uFB6C-\uFB6D\uFB70-\uFB71\uFB74-\uFB75\uFB78-\uFB79\uFB7C-\uFB7D\uFB80-\uFB81\uFB90-\uFB91\uFB94-\uFB95\uFB98-\uFB99\uFB9C-\uFB9D\uFBA2-\uFBA3\uFBA8-\uFBA9\uFBAC-\uFBAD\uFBD5-\uFBD6\uFBE6-\uFBE9\uFBFE-\uFBFF\uFE8B-\uFE8C\uFE91-\uFE92\uFE97-\uFE98\uFE9B-\uFE9C\uFE9F-\uFEA0\uFEA3-\uFEA4\uFEA7-\uFEA8\uFEB3-\uFEB4\uFEB7-\uFEB8\uFEBB-\uFEBC\uFEBF-\uFEC0\uFEC3-\uFEC4\uFEC7-\uFEC8\uFECB-\uFECC\uFECF-\uFED0\uFED3-\uFED4\uFED7-\uFED8\uFEDB-\uFEDC\uFEDF-\uFEE0\uFEE3-\uFEE4\uFEE7-\uFEE8\uFEEB-\uFEEC\uFEF3-\uFEF4]';
const NEXT_LETTER='(?=[\u0621-\u063F\u0641-\u064A\u066E-\u06D3\u06FA-\u06FF\uFB50-\uFDFF\uFE70-\uFEFC])';
const RE_ZW1=new RegExp('('+FI_DUAL+')'+NEXT_LETTER,'g');
const RE_ZW2=new RegExp('('+IM_ANY+'\u06CC)'+NEXT_LETTER,'g');
/* (\u06F3) \u00AB\u0647\u00BB \u0633\u0627\u062F\u0647 (\u0634\u06A9\u0644 \u062A\u0646\u0647\u0627) \u0628\u0644\u0627\u0641\u0627\u0635\u0644\u0647 \u0642\u0628\u0644 \u0627\u0632 \u0634\u06A9\u0644 \u0622\u063A\u0627\u0632\u06CC \u062D\u0631\u0641 \u0628\u0639\u062F\u06CC \u06CC\u0627 \u00AB\u06CC\u00BB \u0633\u0627\u062F\u0647: \u0642\u0637\u0631\u0647\u200C\u0647\u0627\u060C \u0633\u0627\u062F\u0647\u200C\u06CC */
const INIT_ONLY='[\uFB54\uFB58\uFB5C\uFB60\uFB64\uFB68\uFB6C\uFB70\uFB74\uFB78\uFB7C\uFB80\uFB90\uFB94\uFB98\uFB9C\uFBFE\uFE8B\uFE91\uFE97\uFE9B\uFE9F\uFEA3\uFEA7\uFEB3\uFEB7\uFEBB\uFEBF\uFEC3\uFEC7\uFECB\uFECF\uFED3\uFED7\uFEDB\uFEDF\uFEE3\uFEE7\uFEEB\uFEF3]';
const DUAL_PLAIN='[\u0628\u067E\u062A\u062B\u062C\u0686\u062D\u062E\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063A\u0641\u0642\u06A9\u06AF\u0644\u0645\u0646\u0647\u06CC]';
const RE_ZW3=new RegExp('('+DUAL_PLAIN+')(?='+INIT_ONLY+')|(\u0647)(?=\u06CC)','g');
function restoreZwnj(s){
 if(!/[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s))return s;       /* بدون شکل‌های نمایشی: دست‌نخورده */
 return s.replace(RE_ZW1,'$1\u200C').replace(RE_ZW2,'$1\u200C').replace(RE_ZW3,(m,a,b)=>(a||b)+'\u200C');
}

/* نرمال‌سازی یک رشته (بدون دست‌زدن به خط‌های جدید).
   opts.digits: 'unify' (پیش‌فرض: عربی→فارسی) | 'latin' | 'keep' ؛ opts.stripDiacritics: حذف اعراب */
function normalizeChars(s,opts){
 opts=opts||{};
 s=String(s);
 if(opts.restoreZwnj!==false)s=restoreZwnj(s);
 /* شکل‌های نمایشی عربی (FB50–FDFF, FE70–FEFF) → حروف عادی */
 s=s.replace(/[ﭐ-﷿ﹰ-﻿]/g,ch=>{
  if(ch==='﻿')return '';                    /* BOM / فاصله‌ی صفرعرض */
  return ch.normalize('NFKC')});
 /* ی و ک عربی → فارسی */
 s=s.replace(/[يى]/g,'ی').replace(/ك/g,'ک');
 /* کشیده و (اختیاری) اعراب */
 s=s.replace(/ـ/g,'');
 if(opts.stripDiacritics)s=s.replace(/[ً-ٰٟۖ-ۭ]/g,'');
 /* کنترل‌های جهت و حروف نامرئی (به‌جز نیم‌فاصله U+200C) */
 s=s.replace(/[​‍‎‏‪-‮⁠-⁩؜­﻿᠎]/g,'');
 /* فاصله‌های ویژه → فاصله‌ی معمولی */
 s=s.replace(/[   -   　]/g,' ');
 /* اعداد */
 const mode=opts.digits||'unify';
 if(mode==='unify')s=s.replace(/[٠-٩]/g,d=>String.fromCharCode(d.charCodeAt(0)-0x0660+0x06F0));
 else if(mode==='latin')s=s.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x0660)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x06F0));
 /* کنترل‌های باقی‌مانده (به‌جز TAB و خط جدید) */
 s=s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,'');
 return s;
}

/* پاک‌سازی فاصله‌ها و نیم‌فاصله‌ها در یک خط */
function cleanLine(line){
 line=line.replace(/\u200C{2,}/g,'\u200C');
 line=line.replace(/([ \t])\u200C+/g,'$1').replace(/\u200C+([ \t])/g,'$1');   /* نیم‌فاصله کنار فاصله بی‌معناست */
 line=line.replace(/[ \t]+/g,' ');
 line=line.replace(/^\u200C+|\u200C+$/g,'');
 return line.trim();
}

/* ---------- تبدیل آیتم‌های pdf.js به خط‌ها ---------- */
/* items: [{str, transform:[a,b,c,d,e,f], width, height}] */
function itemsToLines(items){
 const arr=[];
 for(const it of items||[]){
  if(!it||typeof it.str!=='string'||!it.str.length)continue;
  const t=it.transform||[1,0,0,1,0,0];
  const h=Math.abs(it.height)||Math.abs(t[3])||Math.abs(t[0])||10;
  arr.push({s:it.str,x:+t[4]||0,y:+t[5]||0,w:Math.abs(+it.width)||0,h});
 }
 if(!arr.length)return [];
 /* ارتفاع معمول برای تشخیص هم‌خط‌بودن */
 const hs=arr.map(a=>a.h).sort((a,b)=>a-b),med=hs[Math.floor(hs.length/2)]||10;
 arr.sort((a,b)=>b.y-a.y||a.x-b.x);
 const rows=[];
 for(const a of arr){
  const last=rows[rows.length-1];
  if(last&&Math.abs(last.y-a.y)<=Math.max(2,0.5*Math.min(med,last.h,a.h||med))){last.items.push(a);last.h=Math.max(last.h,a.h)}
  else rows.push({y:a.y,h:a.h,items:[a]});
 }
 const out=[];
 for(const row of rows){
  const its=row.items;
  const rtl=count(its.map(i=>i.s).join(''),RE_ARABIC)>=count(its.map(i=>i.s).join(''),/[A-Za-z]/g);
  its.sort((a,b)=>rtl?(b.x-a.x):(a.x-b.x));
  let line='',prev=null;
  for(const it of its){
   if(prev){
    const gap=rtl?(prev.x-(it.x+it.w)):(it.x-(prev.x+prev.w));
    const sp=/\s$/.test(line)||/^\s/.test(it.s);
    if(!sp&&gap>0.18*Math.max(row.h,1))line+=' ';
   }
   line+=it.s;prev=it;
  }
  line=line.replace(/\s+$/,'');
  if(!line.trim())continue;
  out.push({line,y:row.y,h:row.h});
 }
 /* فاصله‌ی عمودی بیشتر از فاصله‌ی معمول خط‌ها = پایان پاراگراف (نسبت به میانه‌ی فاصله‌ی همین صفحه) */
 const gaps=[];for(let i=1;i<out.length;i++)gaps.push(out[i-1].y-out[i].y);
 const sg=gaps.slice().sort((a,b)=>a-b),m=sg.length>=3?sg[Math.floor(sg.length/2)]:0;
 const res=[];
 out.forEach((o,i)=>{
  if(i>0){
   const g=gaps[i-1],hh=Math.max(out[i-1].h,o.h);
   const brk=m>0?(g>1.3*m&&g>1.15*hh):(g>2.2*hh);
   if(brk)res.push('');
  }
  res.push(o.line);
 });
 return res;
}

/* ---------- ترتیب برعکس (PDFهایی که حروف را به‌ترتیب دیداری ذخیره کرده‌اند) ---------- */
const FWD=['است','که','را','از','این','برای','های','شده','می‌شود','باید','یا','هر','بود','کرد','دارد','شود','خود'];
const REV=FWD.map(w=>Array.from(w).reverse().join(''));
function reversedScore(text){
 const toks=String(text).split(/[\s.,،؛:؟!()«»"'\-–—\/\\[\]{}]+/);
 let f=0,r=0;const F=new Set(FWD),R=new Set(REV);
 for(const t of toks){if(F.has(t))f++;else if(R.has(t))r++}
 return {fwd:f,rev:r,reversed:r>=4&&r>f*3};
}
/* معکوس‌کردن یک خط دیداری: ترتیب تکه‌ها برعکس، و حروف فقط داخل تکه‌های راست‌به‌چپ؛ اعداد و لاتین دست‌نخورده */
function reverseVisualLine(line){
 const parts=String(line).split(/([A-Za-z0-9۰-۹٠-٩][A-Za-z0-9۰-۹٠-٩.,:\/%+\-]*)/);
 return parts.reverse().map((p,i)=>/^[A-Za-z0-9۰-۹٠-٩]/.test(p)?p:Array.from(p).reverse().join('')).join('');
}

/* ---------- پرانتز و گیومه‌ی وارونه ----------
   بعضی PDFها نویسه‌ی «آینه‌شده» (مثلاً « ) » به‌جای « ( ») را در متن راست‌به‌چپ ذخیره می‌کنند. با شمردن ترتیب باز/بسته در کل متن
   تشخیص می‌دهیم کدام حالت درست‌تر است و فقط در خط‌های راست‌به‌چپ جابه‌جا می‌کنیم. */
const BR_PAIRS=[['(',')'],['[',']'],['{','}'],['«','»']];
const isRtlLine=l=>count(l,RE_ARABIC)>=count(l,/[A-Za-z]/g)&&count(l,RE_ARABIC)>0;
function bracketViolations(text,o,c){let d=0,v=0;for(const ch of text){if(ch===o)d++;else if(ch===c){if(d>0)d--;else v++}}return v+d}
function fixMirroredBrackets(pages){
 const rtl=[];pages.forEach(p=>p.forEach(l=>{if(isRtlLine(l))rtl.push(l)}));
 const all=rtl.join('\n');let changed=[];
 const map={};
 for(const [o,c] of BR_PAIRS){
  if(all.indexOf(o)<0&&all.indexOf(c)<0)continue;
  const normal=bracketViolations(all,o,c),swapped=bracketViolations(all,c,o);
  if(swapped<normal){map[o]=c;map[c]=o;changed.push(o+c)}
 }
 if(!changed.length)return {pages,changed};
 const sw=l=>l.replace(/[()\[\]{}«»]/g,ch=>map[ch]||ch);
 return {pages:pages.map(p=>p.map(l=>isRtlLine(l)?sw(l):l)),changed};
}

/* ---------- سرصفحه/پانویس تکراری ---------- */
const sigOf=l=>l.replace(/[0-9۰-۹٠-٩]+/g,'#').replace(/\s+/g,' ').trim();
const isPageNum=l=>/^[-–—\s]*[0-9۰-۹٠-٩]{1,4}[-–—\s]*$/.test(l)||/^(صفحه|page)\s*[0-9۰-۹]{1,4}(\s*(از|of|\/)\s*[0-9۰-۹]{1,4})?$/i.test(l.trim());
/* pages: آرایه‌ای از آرایه‌ی خط‌ها. نسخه‌ی جدید را برمی‌گرداند. */
function stripHeadersFooters(pages){
 const total=pages.length;
 const out=pages.map(p=>p.slice());
 /* شماره‌ی صفحه‌ی ساده (فقط وقتی اول/آخر صفحه است) */
 out.forEach(p=>{
  const nz=()=>p.findIndex(l=>l.trim());
  let i=nz();if(i>=0&&isPageNum(p[i].trim()))p.splice(i,1);
  let j=p.length-1;while(j>=0&&!p[j].trim())j--;
  if(j>=0&&isPageNum(p[j].trim()))p.splice(j,1);
 });
 if(total<4)return out;
 const freq=new Map();
 const edge=p=>{const ne=p.map((l,i)=>[l,i]).filter(x=>x[0].trim());return [ne.slice(0,2),ne.slice(-2)].flat()};
 out.forEach(p=>{const seen=new Set();edge(p).forEach(([l])=>{const k=sigOf(l);if(k&&k.length<=120&&!seen.has(k)){seen.add(k);freq.set(k,(freq.get(k)||0)+1)}})});
 const bad=new Set([...freq].filter(([k,n])=>n>=Math.max(3,Math.ceil(total*0.6))).map(x=>x[0]));
 if(!bad.size)return out;
 return out.map(p=>{
  const idx=new Set(edge(p).filter(([l])=>bad.has(sigOf(l))).map(x=>x[1]));
  return p.filter((_,i)=>!idx.has(i));
 });
}

/* ---------- یکپارچه‌سازی خط‌های شکسته‌ی یک پاراگراف ---------- */
const END_RE=/[.!?؟؛:…»)"”]\s*$/;
const BULLET_RE=/^\s*([-•●▪◦*–—]|[0-9۰-۹٠-٩]{1,3}\s*[.)\-–:]|[A-Za-z]\s*[.)]|[؀-ۿ]\s*[)\-–])\s/;
function reflow(lines){
 /* حداکثر طول معمول خط (صدک ۹۰) */
 const lens=lines.filter(l=>l.trim()).map(l=>l.length).sort((a,b)=>a-b);
 if(lens.length<2)return lines.slice();
 const ref=lens[Math.floor(lens.length*0.9)]||lens[lens.length-1];
 const out=[];let cur=null;
 const flush=()=>{if(cur!==null){out.push(cur);cur=null}};
 for(const raw of lines){
  const l=raw.trim();
  if(!l){flush();out.push('');continue}
  if(cur===null){cur=l;continue}
  const prevLong=cur.length>=ref*0.72;
  if(prevLong&&!END_RE.test(cur)&&!BULLET_RE.test(l)){
   /* خط قبلی با خط تیره‌ی پایان‌خط ('-') تمام شده؟ بدون فاصله بچسبان */
   cur=/[؀-ۿ]-$/.test(cur)?cur.slice(0,-1)+l:cur+' '+l;
  }else{flush();cur=l}
 }
 flush();
 return out;
}

/* ---------- ساخت متن نهایی از خروجی خام ---------- */
/* raw: {kind:'pdf', pages:[{n,lines:[]}]} | {kind:'text', text}
   opts: {digits, stripDiacritics, reflow, stripHeaders, pageMarkers, fixReversed:'auto'|'on'|'off'} */
function build(raw,opts){
 opts=Object.assign({digits:'unify',stripDiacritics:false,reflow:true,stripHeaders:true,pageMarkers:false,fixReversed:'auto'},opts||{});
 const warnings=(raw.warnings||[]).slice();
 let pages;
 if(raw.kind==='pdf'){
  pages=raw.pages.map(p=>p.lines.map(l=>normalizeChars(l,opts)));
 }else{
  const t=normalizeChars(String(raw.text||'').replace(/\r\n?/g,'\n'),opts);
  pages=[t.split('\n')];
 }
 /* ترتیب برعکس */
 let reversed=false;
 const sample=pages.map(p=>p.join('\n')).join('\n');
 const rs=reversedScore(sample);
 if(opts.fixReversed==='on'||(opts.fixReversed==='auto'&&rs.reversed)){
  pages=pages.map(p=>p.map(reverseVisualLine));reversed=true;
  warnings.push(opts.fixReversed==='on'?'ترتیب حروف هر خط معکوس شد (به درخواست شما).':'ترتیب حروف در این فایل برعکس بود و به‌طور خودکار اصلاح شد. اگر نتیجه درست نیست، گزینه‌ی «برعکس بودن حروف» را روی «خاموش» بگذارید.');
 }else if(opts.fixReversed==='auto'&&rs.rev>=2&&rs.rev>rs.fwd){
  warnings.push('ممکن است ترتیب حروف برعکس باشد. در صورت دیدن کلمه‌های وارونه، گزینه‌ی «برعکس بودن حروف» را روی «روشن» بگذارید.');
 }
 pages=pages.map(p=>p.map(cleanLine));
 if(raw.kind==='pdf'&&opts.fixBrackets!==false){
  const fb=fixMirroredBrackets(pages);pages=fb.pages;
  if(fb.changed.length)warnings.push('جهت پرانتز و گیومه‌ها در این PDF وارونه ذخیره شده بود و اصلاح شد.');
 }
 if(raw.kind==='pdf'&&opts.stripHeaders)pages=stripHeadersFooters(pages);
 if(raw.kind==='pdf'&&opts.reflow)pages=pages.map(p=>reflow(p));
 /* خطوط خالی پشت‌سرهم → یک خط خالی */
 const tidy=p=>{const o=[];let blank=true;for(const l of p){if(!l.trim()){if(!blank){o.push('');blank=true}}else{o.push(l);blank=false}}while(o.length&&!o[o.length-1])o.pop();return o};
 pages=pages.map(tidy);
 const parts=[];
 pages.forEach((p,i)=>{
  if(!p.length)return;
  const n=(raw.pages&&raw.pages[i]&&raw.pages[i].n)||i+1;
  parts.push((opts.pageMarkers&&raw.kind==='pdf'?'--- صفحه '+n+' ---\n':'')+p.join('\n'));
 });
 let text=parts.join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
 if(text.length>LIMITS.maxChars){text=text.slice(0,LIMITS.maxChars);warnings.push('متن خیلی طولانی بود و در '+LIMITS.maxChars.toLocaleString('en')+' نویسه‌ی اول بریده شد.')}
 const q=quality(text);
 if(q.garbled)fail('GARBLED');
 if(q.letters<LIMITS.minLetters)fail(raw.kind==='pdf'&&q.letters===0?'NO_TEXT_LAYER':'NO_USABLE_TEXT');
 return {text,warnings,stats:stats(text,pages.length,q),reversedFixed:reversed};
}

/* ---------- کیفیت و آمار ---------- */
function quality(text){
 const letters=count(text,RE_LETTER);
 const nonSpace=text.replace(/\s/g,'').length||1;
 const pua=count(text,/[-�\u0080-\u009F]/g);
 const lat1=count(text,/[À-ÿ]/g);           /* À-ÿ : نشانه‌ی فونت بدون نگاشت یونیکد (مثل «ÇáÓáÇã») */
 const garbled=pua/nonSpace>0.15||(letters>20&&lat1/Math.max(letters,1)>0.35&&count(text,RE_ARABIC)===0);
 return {letters,garbled};
}
function stats(text,pageCount,q){
 q=q||quality(text);
 const ar=count(text,RE_ARABIC),lat=count(text,/[A-Za-z]/g);
 const words=text.split(/\s+/).filter(Boolean).length;
 return {
  chars:text.length,words,
  lines:text?text.split('\n').filter(l=>l.trim()).length:0,
  paragraphs:text?text.split(/\n\s*\n/).filter(p=>p.trim()).length:0,
  pages:pageCount,
  rtlRatio:+(ar/Math.max(ar+lat,1)).toFixed(3),
  dominantDir:ar>=lat?'rtl':'ltr'
 };
}

/* ---------- تقسیم به بخش‌های مناسب مرحله‌ی بعد ---------- */
function chunk(text,o){
 o=Object.assign({maxChars:6000},o||{});
 const max=Math.max(200,Math.min(200000,o.maxChars|0||6000));
 text=String(text||'').trim();
 if(!text)return [];
 const out=[];let buf='';
 const push=()=>{const t=buf.trim();if(t)out.push(t);buf=''};
 const add=seg=>{
  if(seg.length>max){
   push();
   /* جمله‌ها، و در نهایت برش سخت */
   const sents=(seg.match(/[^.!?؟؛\n]+[.!?؟؛]*/g)||[seg]).map(x=>x.trim()).filter(Boolean);
   let cur='';
   for(const s of sents){
    if(s.length>max){if(cur){out.push(cur.trim());cur=''}for(let i=0;i<s.length;i+=max)out.push(s.slice(i,i+max));continue}
    if((cur+' '+s).length>max){out.push(cur.trim());cur=s}else cur=cur?cur+' '+s:s;
   }
   if(cur.trim())out.push(cur.trim());
   return;
  }
  if(buf&&(buf.length+2+seg.length)>max)push();
  buf=buf?buf+'\n\n'+seg:seg;
 };
 text.split(/\n\s*\n/).forEach(p=>{if(p.trim())add(p.trim())});
 push();
 return out.map((t,i)=>({index:i,total:out.length,text:t,chars:t.length}));
}

/* ---------- نگاشت خطای pdf.js ---------- */
function mapPdfError(e){
 if(e instanceof ExtractError)return e;
 const n=String(e&&e.name||''),m=String(e&&e.message||'');
 if(n==='PasswordException'||/password/i.test(m))return new ExtractError('ENCRYPTED_PDF');
 if(n==='InvalidPDFException'||n==='MissingPDFException'||n==='FormatError'||/Invalid PDF|XRef|bad XRef|Missing PDF|End of PDF|stream/i.test(m))return new ExtractError('CORRUPT_PDF');
 if(n==='TimeoutError')return new ExtractError('TIMEOUT');
 return new ExtractError('PDF_FAILED',m.slice(0,200));
}

/* ---------- استخراج خام از PDF با pdfjsLib (تزریق‌شده) ---------- */
async function extractPdfRaw(bytes,pdfjsLib,o){
 o=Object.assign({maxPages:LIMITS.maxPages,timeoutMs:LIMITS.pdfTimeoutMs,onProgress:null,isCancelled:null},o||{});
 let task=null,doc=null,timer=null;
 const warnings=[];
 try{
  const guard=new Promise((_,rej)=>{timer=setTimeout(()=>{const e=new Error('timeout');e.name='TimeoutError';rej(e)},o.timeoutMs)});
  /* pdf.js بافر را می‌گیرد؛ نسخه‌ی کپی می‌دهیم تا ورودی خراب نشود */
  task=pdfjsLib.getDocument({data:bytes.slice(0),isEvalSupported:false,enableXfa:false,useSystemFonts:false,verbosity:0});
  doc=await Promise.race([task.promise,guard]);
  const num=doc.numPages|0;
  if(!num)fail('CORRUPT_PDF');
  const limit=Math.min(num,o.maxPages);
  if(num>limit)warnings.push('PDF '+num+' صفحه دارد؛ فقط '+limit+' صفحه‌ی اول پردازش شد.');
  const pages=[],empty=[];
  for(let i=1;i<=limit;i++){
   if(o.isCancelled&&o.isCancelled())fail('READ_FAILED');
   if(o.onProgress)o.onProgress(i,limit);
   let lines=[];
   try{
    const pg=await Promise.race([doc.getPage(i),guard]);
    const tc=await Promise.race([pg.getTextContent({normalizeWhitespace:false,disableCombineTextItems:false}),guard]);
    lines=itemsToLines(tc.items);
    if(pg.cleanup)pg.cleanup();
   }catch(e){
    if(e&&e.name==='TimeoutError')throw e;
    warnings.push('صفحه‌ی '+i+' خوانده نشد (احتمالاً خراب است).');
   }
   if(!lines.some(l=>l.trim()))empty.push(i);
   pages.push({n:i,lines});
  }
  if(empty.length&&empty.length<pages.length){
   const list=empty.length>12?empty.slice(0,12).join('، ')+' و …':empty.join('، ');
   warnings.push('صفحه‌های '+list+' متن نداشتند (احتمالاً عکس یا اسکن‌شده‌اند؛ OCR هنوز پیاده‌سازی نشده است).');
  }
  return {kind:'pdf',pages,numPages:num,warnings};
 }catch(e){throw mapPdfError(e)}
 finally{
  clearTimeout(timer);
  try{if(doc&&doc.destroy)await doc.destroy();else if(task&&task.destroy)await task.destroy()}catch(e){}
 }
}

/* ---------- نقطه‌ی ورود اصلی: بایت‌ها → خروجی خام ---------- */
/* meta: {name,size,type}. بازمی‌گرداند {raw, meta:{kind,encoding,...}} یا ExtractError پرتاب می‌کند */
async function extractRaw(bytes,meta,pdfjsLib,o){
 meta=meta||{};
 if(!bytes||!bytes.length)fail('EMPTY_FILE');
 const kind=sniff(bytes,meta.name,meta.type);
 if(kind==='image')fail('IMAGE_NOT_SUPPORTED');
 if(kind==='other')fail('UNSUPPORTED_TYPE');
 if(kind==='pdf'){
  if(bytes.length>LIMITS.maxPdfBytes)fail('TOO_LARGE',{max:LIMITS.maxPdfBytes});
  if(!hasPdfHeader(bytes))fail('CORRUPT_PDF');          /* پسوند PDF ولی سرایند ندارد */
  if(!pdfjsLib)fail('LIB_LOAD');
  const raw=await extractPdfRaw(bytes,pdfjsLib,o);
  return {raw,meta:{kind:'pdf',pages:raw.numPages}};
 }
 if(bytes.length>LIMITS.maxTextBytes)fail('TOO_LARGE',{max:LIMITS.maxTextBytes});
 const d=decodeText(bytes);
 return {raw:{kind:'text',text:d.text,warnings:d.warnings},meta:{kind:'text',encoding:d.encoding}};
}

return {LIMITS,TEXT_EXT,MSG,ExtractError,sniff,extOf,decodeText,normalizeChars,cleanLine,itemsToLines,reversedScore,reverseVisualLine,
 restoreZwnj,fixMirroredBrackets,stripHeadersFooters,reflow,build,quality,stats,chunk,mapPdfError,extractPdfRaw,extractRaw};
});

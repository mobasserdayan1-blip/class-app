/* استخراج و آماده‌سازی متن از PDF متنی و فایل‌های متنی — لایه‌ی مرورگر (انتخاب فایل، pdf.js، کارت تنظیمات).
   - همه‌چیز روی همین دستگاه انجام می‌شود؛ هیچ متنی به هوش مصنوعی یا جای دیگری ارسال نمی‌شود.
   - OCR (عکس و PDF اسکن‌شده) عمداً پیاده‌سازی نشده است؛ چنین فایل‌هایی با پیام روشن رد می‌شوند.
   - رابط برای مراحل بعد: window.TextExtract.extractFile(file,opts) ، .last() ، .chunk(text,{maxChars}) ، .clear()
   - کتابخانه‌ی pdf.js فقط هنگام انتخاب PDF بارگذاری می‌شود (assets/js/vendor/pdfjs/). */
(function(){try{
const Core=window.TextExtractCore;
if(!Core){console.warn('text-extract: هسته بارگذاری نشده');return}
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fa=n=>Number(n||0).toLocaleString('fa-IR');
const PDFJS_SRC='assets/js/vendor/pdfjs/pdf.min.js',PDFJS_WORKER='assets/js/vendor/pdfjs/pdf.worker.min.js';
const PREVIEW_CHARS=3000;

/* ---------- بارگذاری تنبل pdf.js ---------- */
let libPromise=null;
function loadPdfJs(){
 if(window.pdfjsLib&&window.pdfjsLib.getDocument){setWorker();return Promise.resolve(window.pdfjsLib)}
 if(libPromise)return libPromise;
 libPromise=new Promise((res,rej)=>{
  const s=document.createElement('script');
  s.src=new URL(PDFJS_SRC,document.baseURI).href;
  s.onload=()=>{if(window.pdfjsLib&&window.pdfjsLib.getDocument){setWorker();res(window.pdfjsLib)}else rej(new Core.ExtractError('LIB_LOAD'))};
  s.onerror=()=>rej(new Core.ExtractError('LIB_LOAD'));
  document.head.appendChild(s);
 }).catch(e=>{libPromise=null;throw e});
 return libPromise;
}
function setWorker(){try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=new URL(PDFJS_WORKER,document.baseURI).href}catch(e){}}

/* ---------- وضعیت ---------- */
const DEFAULT_OPTS={digits:'unify',stripDiacritics:false,reflow:true,stripHeaders:true,pageMarkers:false,fixReversed:'auto'};
const state={
 opts:Object.assign({},DEFAULT_OPTS),chunkChars:6000,
 busy:false,progress:'',token:0,
 file:null,        /* {name,size,type} */
 raw:null,rawMeta:null,
 result:null,      /* {ok:true,text,stats,warnings,...} */
 error:null,       /* {code,message} */
 showAll:false
};

function readBytes(file){
 return new Promise((res,rej)=>{
  if(file.arrayBuffer){file.arrayBuffer().then(b=>res(new Uint8Array(b)),rej);return}
  const r=new FileReader();r.onload=()=>res(new Uint8Array(r.result));r.onerror=()=>rej(r.error||new Error('read'));r.readAsArrayBuffer(file);
 });
}
const errInfo=e=>{
 if(e&&e.code&&Core.MSG[e.code])return {code:e.code,message:Core.MSG[e.code]+(e.code==='TOO_LARGE'&&e.detail&&e.detail.max?' (حداکثر '+fa(Math.round(e.detail.max/1048576))+' مگابایت)':'')};
 return {code:'UNKNOWN',message:'خطای غیرمنتظره در پردازش فایل.'};
};

/* ---------- ساخت خروجی نهایی از خام + گزینه‌ها ---------- */
function rebuild(){
 if(!state.raw)return;
 try{
  const b=Core.build(state.raw,state.opts);
  const chunks=Core.chunk(b.text,{maxChars:state.chunkChars});
  state.result={ok:true,text:b.text,stats:b.stats,warnings:b.warnings,reversedFixed:b.reversedFixed,chunks,
   source:{name:state.file.name,size:state.file.size,type:state.file.type,kind:state.rawMeta.kind,encoding:state.rawMeta.encoding||null,pages:state.rawMeta.pages||null},
   options:Object.assign({},state.opts),createdAt:Date.now(),version:1};
  state.error=null;
 }catch(e){state.result=null;state.error=errInfo(e)}
}

/* ---------- API عمومی ---------- */
async function extractFile(file,opts,onProgress,isCancelled){
 if(!file)throw new Core.ExtractError('READ_FAILED');
 const meta={name:file.name||'',size:file.size||0,type:file.type||''};
 if(!meta.size)throw new Core.ExtractError('EMPTY_FILE');
 const limit=Math.max(Core.LIMITS.maxPdfBytes,Core.LIMITS.maxTextBytes);
 if(meta.size>limit*1.0)throw new Core.ExtractError('TOO_LARGE',{max:limit});
 let bytes;try{bytes=await readBytes(file)}catch(e){throw new Core.ExtractError('READ_FAILED')}
 const kind=Core.sniff(bytes,meta.name,meta.type);
 let lib=null;
 if(kind==='pdf'&&bytes.length){lib=await loadPdfJs()}
 const r=await Core.extractRaw(bytes,meta,lib,{onProgress,isCancelled});
 const built=Core.build(r.raw,Object.assign({},DEFAULT_OPTS,opts||{}));
 const o=Object.assign({},DEFAULT_OPTS,opts||{});
 return {ok:true,text:built.text,stats:built.stats,warnings:built.warnings,reversedFixed:built.reversedFixed,
  chunks:Core.chunk(built.text,{maxChars:state.chunkChars}),
  source:{name:meta.name,size:meta.size,type:meta.type,kind:r.meta.kind,encoding:r.meta.encoding||null,pages:r.meta.pages||null},
  options:o,createdAt:Date.now(),version:1,raw:r.raw};
}
window.TextExtract=Object.freeze({
 version:1,
 limits:Core.LIMITS,
 extractFile,
 build:Core.build,
 chunk:Core.chunk,
 last:()=>state.result?JSON.parse(JSON.stringify(state.result)):null,
 clear:()=>{state.raw=null;state.result=null;state.error=null;state.file=null;render()}
});

/* ---------- پردازش فایل انتخاب‌شده توسط کاربر ---------- */
async function handleFile(file){
 if(!file||state.busy)return;
 const my=++state.token;
 state.busy=true;state.progress='در حال خواندن فایل…';state.file={name:file.name||'',size:file.size||0,type:file.type||''};
 state.raw=null;state.result=null;state.error=null;state.showAll=false;render();
 try{
  const r=await extractFile(file,state.opts,(i,n)=>{if(my===state.token){state.progress='در حال خواندن صفحه‌ی '+fa(i)+' از '+fa(n)+'…';updateProgress()}},()=>my!==state.token);
  if(my!==state.token)return;
  state.raw=r.raw;state.rawMeta={kind:r.source.kind,encoding:r.source.encoding,pages:r.source.pages};
  state.result=Object.assign({},r);delete state.result.raw;state.error=null;
 }catch(e){
  if(my!==state.token)return;
  state.result=null;state.raw=null;state.error=errInfo(e);
  if(!(e&&e.code))console.warn('text-extract',e&&e.message);
 }finally{
  if(my===state.token){state.busy=false;state.progress='';render()}
 }
}

/* ---------- رابط کاربری ---------- */
function injectStyle(){
 if($('txStyle'))return;
 const st=document.createElement('style');st.id='txStyle';
 st.textContent=`
#txCard .tx-drop{border:2px dashed var(--line);border-radius:16px;padding:16px 10px;text-align:center;cursor:pointer;color:var(--mut);font-weight:700;font-size:14px;line-height:1.9;display:block}
#txCard .tx-drop:hover,#txCard .tx-drop.on{border-color:var(--p);color:var(--tx)}
#txCard .tx-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
#txCard .tx-chip{background:var(--bg2);border-radius:10px;padding:4px 10px;font-size:13px;font-weight:700}
#txCard .tx-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 12px;margin:10px 0;text-align:right;font-size:13.5px}
#txCard .tx-opts label{display:flex;gap:6px;align-items:center;cursor:pointer}
#txCard .tx-opts input[type=checkbox]{width:auto;margin:0}
#txCard .tx-opts select{width:100%;height:auto;min-height:0;margin:0;border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:10px;padding:5px;font:inherit;font-size:13px}
#txCard .tx-prev{background:var(--bg2);border-radius:14px;padding:12px;max-height:340px;overflow:auto;white-space:pre-wrap;word-break:break-word;unicode-bidi:plaintext;text-align:start;line-height:2;font-size:14px;margin-top:10px;direction:rtl}
#txCard .tx-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#txCard .tx-btns button{border:1px solid var(--line);background:var(--card);color:var(--tx);border-radius:10px;padding:8px 12px;font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#txCard .tx-warn{margin:8px 0 0;padding:0 20px 0 0;text-align:right;line-height:1.9;font-size:13.5px;color:var(--wa)}
#txCard .tx-err{margin-top:10px;font-weight:700;line-height:1.9;color:var(--no);text-align:right}
`;
 document.head.appendChild(st);
}
const sel=(name,val,opts)=>'<select data-txo="'+name+'">'+opts.map(o=>'<option value="'+o[0]+'"'+(String(val)===String(o[0])?' selected':'')+'>'+E(o[1])+'</option>').join('')+'</select>';
const chk=(name,label)=>'<label><input type="checkbox" data-txo="'+name+'"'+(state.opts[name]?' checked':'')+'>'+E(label)+'</label>';

function resultHtml(){
 const o=state.opts;
 if(state.busy)return '<div class="sub" id="txProg" style="text-align:right;margin-top:10px" aria-live="polite">⏳ '+E(state.progress)+'</div>';
 if(state.error){
  return '<div class="tx-err">❌ '+E(state.error.message)+'</div>'+
   (state.file?'<div class="sub" style="text-align:right;margin-top:6px">فایل: <b dir="auto">'+E(state.file.name)+'</b></div>':'');
 }
 const r=state.result;if(!r)return '';
 const s=r.stats,src=r.source;
 let h='<div style="margin-top:10px;font-weight:700;line-height:1.9;text-align:right">✅ متن آماده شد · <span dir="auto">'+E(src.name)+'</span></div>';
 h+='<div class="tx-chips">'+
  '<span class="tx-chip">'+(src.kind==='pdf'?'PDF · '+fa(s.pages)+' صفحه':'فایل متنی'+(src.encoding?' · '+E(src.encoding):''))+'</span>'+
  '<span class="tx-chip">'+fa(s.words)+' کلمه</span><span class="tx-chip">'+fa(s.chars)+' نویسه</span>'+
  '<span class="tx-chip">'+fa(s.paragraphs)+' پاراگراف</span>'+
  '<span class="tx-chip">'+(s.dominantDir==='rtl'?'راست‌به‌چپ (فارسی/عربی)':'چپ‌به‌راست')+'</span>'+
  '<span class="tx-chip">'+fa(r.chunks.length)+' بخش آماده</span></div>';
 if(r.warnings&&r.warnings.length)h+='<ul class="tx-warn">'+r.warnings.map(w=>'<li>'+E(w)+'</li>').join('')+'</ul>';
 /* گزینه‌ها */
 h+='<div class="tx-opts">'+
  (src.kind==='pdf'?chk('reflow','یکپارچه‌سازی خط‌های شکسته')+chk('stripHeaders','حذف سرصفحه/پانویس/شماره‌ی صفحه')+chk('pageMarkers','نشانه‌ی شماره‌ی صفحه'):'')+
  chk('stripDiacritics','حذف اعراب')+
  '<div>اعداد:'+sel('digits',o.digits,[['unify','فارسی‌سازی اعداد عربی'],['latin','همه لاتین'],['keep','بدون تغییر']])+'</div>'+
  '<div>برعکس بودن حروف:'+sel('fixReversed',o.fixReversed,[['auto','خودکار'],['on','روشن'],['off','خاموش']])+'</div>'+
  '<div>اندازه‌ی هر بخش:'+sel('chunk',state.chunkChars,[[3000,'۳٬۰۰۰ نویسه'],[6000,'۶٬۰۰۰ نویسه'],[12000,'۱۲٬۰۰۰ نویسه'],[24000,'۲۴٬۰۰۰ نویسه']])+'</div></div>';
 /* پیش‌نمایش */
 const t=r.text,cut=!state.showAll&&t.length>PREVIEW_CHARS;
 h+='<div class="sub" style="text-align:right;margin:8px 0 0">پیش‌نمایش'+(cut?' (فقط '+fa(PREVIEW_CHARS)+' نویسه‌ی اول)':'')+':</div>';
 h+='<div class="tx-prev" id="txPrev" dir="rtl" tabindex="0">'+E(cut?t.slice(0,PREVIEW_CHARS)+'…':t)+'</div>';
 h+='<div class="tx-btns">'+(t.length>PREVIEW_CHARS?'<button data-txa="more">'+(state.showAll?'نمایش کوتاه':'نمایش کامل')+'</button>':'')+
  '<button data-txa="copy">📋 کپی متن</button><button data-txa="dl">⬇️ دانلود TXT</button><button data-txa="clear">🗑️ پاک‌کردن</button></div>';
 h+='<div class="sub" style="text-align:right;margin-top:10px;font-size:12.5px">🔒 متن فقط روی همین دستگاه پردازش شد و به هیچ سرویسی ارسال نشد. در دسترس مراحل بعد: <code>TextExtract.last()</code></div>';
 return h;
}
function cardHtml(){
 return '<b>📄 استخراج و آماده‌سازی متن</b>'+
  '<p class="sub" style="text-align:right;margin:6px 0 10px">از <b>PDF متنی</b> و فایل‌های <b>TXT / MD / CSV / TSV / LOG / JSON</b> متن را بیرون می‌کشد و برای مراحل بعد (فارسی و راست‌به‌چپ) آماده می‌کند. عکس و PDF اسکن‌شده (OCR) هنوز پشتیبانی نمی‌شود. چیزی ارسال نمی‌شود.</p>'+
  '<label class="tx-drop" id="txDrop" for="txFile">'+(state.busy?'در حال پردازش…':'📂 انتخاب فایل یا رها کردن اینجا<br><span style="font-weight:400;font-size:12.5px">حداکثر '+fa(Math.round(Core.LIMITS.maxPdfBytes/1048576))+' مگابایت برای PDF و '+fa(Math.round(Core.LIMITS.maxTextBytes/1048576))+' مگابایت برای متن</span>')+'</label>'+
  '<input type="file" id="txFile" style="display:none" accept=".pdf,.txt,.text,.md,.markdown,.csv,.tsv,.log,.json,application/pdf,text/*,application/json"'+(state.busy?' disabled':'')+'>'+
  '<div id="txRes" aria-live="polite">'+resultHtml()+'</div>';
}
function render(){
 const c=$('txCard');if(!c)return;
 const keep=c.querySelector('#txPrev');const sc=keep?keep.scrollTop:0;
 c.innerHTML=cardHtml();
 const p=c.querySelector('#txPrev');if(p)p.scrollTop=sc;
}
function updateProgress(){const p=$('txProg');if(p)p.textContent='⏳ '+state.progress}
function card(){
 const b=$('setBody');if(!b)return;
 const old=$('txCard');
 const teacher=typeof window.isTeacherRole==='function'&&window.isTeacherRole();
 if(teacher){if(old)old.remove();return}
 if(old)return;
 injectStyle();
 const c=document.createElement('div');c.className='card';c.id='txCard';
 b.appendChild(c);render();
}

/* ---------- رویدادها ---------- */
document.addEventListener('change',e=>{
 const t=e.target;if(!t||!t.closest||!t.closest('#txCard'))return;
 if(t.id==='txFile'){const f=t.files&&t.files[0];t.value='';handleFile(f);return}
 const k=t.getAttribute&&t.getAttribute('data-txo');if(!k)return;
 if(k==='chunk')state.chunkChars=+t.value||6000;
 else state.opts[k]=t.type==='checkbox'?t.checked:t.value;
 rebuild();render();
});
function copyText(t){
 if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
 return new Promise((res,rej)=>{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();ok?res():rej()}catch(e){rej(e)}});
}
const flash=(btn,msg)=>{if(!btn)return;const o=btn.textContent;btn.textContent=msg;setTimeout(()=>{if(btn.isConnected)btn.textContent=o},1500)};
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('#txCard [data-txa]');if(!b)return;
 const a=b.getAttribute('data-txa'),r=state.result;
 if(a==='clear'){state.token++;state.busy=false;state.raw=null;state.result=null;state.error=null;state.file=null;state.showAll=false;render();return}
 if(!r)return;
 if(a==='more'){state.showAll=!state.showAll;render();return}
 if(a==='copy'){copyText(r.text).then(()=>flash(b,'✅ کپی شد'),()=>flash(b,'کپی ممکن نشد'));return}
 if(a==='dl'){
  const name=(r.source.name||'text').replace(/\.[^.\\/]{1,10}$/,'').replace(/[\\/:*?"<>|]+/g,'_')||'text';
  const url=URL.createObjectURL(new Blob([r.text],{type:'text/plain;charset=utf-8'}));
  const l=document.createElement('a');l.href=url;l.download=name+'.txt';document.body.appendChild(l);l.click();l.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
 }
});
/* کشیدن و رها کردن */
document.addEventListener('dragover',e=>{const d=e.target.closest&&e.target.closest('#txDrop');if(d){e.preventDefault();d.classList.add('on')}});
document.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('#txDrop');if(d)d.classList.remove('on')});
document.addEventListener('drop',e=>{const d=e.target.closest&&e.target.closest('#txDrop');if(!d)return;e.preventDefault();d.classList.remove('on');const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];handleFile(f)});

{const b=$('setBody');if(b){new MutationObserver(card).observe(b,{childList:true});card()}}
}catch(e){console.warn('text-extract',e&&e.message)}})();

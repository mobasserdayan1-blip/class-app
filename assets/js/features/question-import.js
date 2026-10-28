/* ورود محلی سؤال‌ها از PDF، DOCX و فایل متنی + انتخاب متناسب با سطح دانش‌آموز */
(function(){'use strict';
try{
 const Core=window.QuestionImportCore;
 if(!Core||!window.QBK){console.warn('question-import: dependency missing');return}
 const $=id=>document.getElementById(id),E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const fa=n=>Number(n||0).toLocaleString('fa-IR');
 const levels=[['e','آسان'],['m','متوسط'],['h','سخت']];
 let candidates=[],fileName='',busy=false;
 const style=document.createElement('style');style.textContent=`
 #qimp .qi-row{border:1px solid var(--line);border-radius:12px;padding:10px;margin:8px 0;background:var(--card)}
 #qimp .qi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
 #qimp input,#qimp select,#qimp textarea{width:100%;box-sizing:border-box;margin:4px 0 8px}
 #qimp textarea{min-height:60px}
 #qimp input,#qimp select,#qimp textarea{font-family:Vazirmatn,Tahoma,sans-serif;font-size:14px;line-height:2}
 #qimp .qi-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
 #qimp .qi-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
 #qimp .qi-note{font-size:13px;line-height:1.9;color:var(--mut)}
 #qimp .qi-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
 #qimp .qi-toolbar button{flex:1 1 180px}
 #qimp #qiPasteText{min-height:130px;direction:rtl;line-height:1.9}
 #qimp .qi-exam-list{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px}
 #qimp .qi-exam-item{display:flex;gap:8px;align-items:flex-start;padding:7px;border-bottom:1px solid var(--line)}
 #qimp .qi-exam-item:last-child{border-bottom:0}
 #qimp .qe-edit-row{border:1px solid var(--line);border-radius:10px;padding:9px;margin:7px 0;background:var(--card)}
 #qimp .qe-edit-row textarea{min-height:62px}
 #qimp .qe-move{display:flex;gap:5px;flex-wrap:wrap}
 #qimp .qe-move button{padding:4px 9px}
 `;document.head.appendChild(style);
 const section=document.createElement('section');section.id='qimp';
 section.innerHTML=`<h2>📥 ورود سؤال از فایل معلم</h2><div class="card">
 <p class="qi-note">فایل روی همین دستگاه خوانده می‌شود. سؤال تازه ساخته نمی‌شود؛ متن استخراج‌شده فقط برای پیشنهاد اولیه است و پیش از ذخیره می‌توانید آن را اصلاح کنید.</p>
 <p class="qi-note">📘 فایل Word چندکتابی/چنددرسی: از <a href="assets/templates/question-import-template.docx" download>الگوی Word</a> استفاده کن (عنوان ۱ = کتاب، عنوان ۲ = درس، «س:» و «پ:» برای سؤال و پاسخ). برنامه خودش کتاب‌ها و درس‌ها را جدا می‌کند و پیش‌نمایش هر درس را نشان می‌دهد.</p>
 <label>انتخاب فایل PDF، Word (DOCX) یا متن</label><input id="qiFile" type="file" accept=".pdf,.docx,.txt,.md,.csv,.tsv,.log,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
 <details style="margin-top:8px"><summary>یا متن سؤال‌ها را اینجا کپی و پیست کن</summary>
 <p class="qi-note">متن را از Word، PDF یا هر جای دیگر کپی کن و داخل کادر بچسبان. بهتر است هر سؤال با شماره شروع شود؛ مثلاً «۱- حاصل ۲+۲ چیست؟»</p>
 <textarea id="qiPasteText" placeholder="متن سؤال‌ها را اینجا پیست کن…"></textarea>
 <div class="qi-toolbar"><button class="big" id="qiParsePaste" type="button">🔎 تشخیص سؤال‌ها از متن</button><button class="sm" id="qiClearPaste" type="button">پاک‌کردن متن</button></div></details>
 <p id="qiStatus" class="qi-note" aria-live="polite">فایل PDF باید متن قابل انتخاب داشته باشد؛ PDF اسکن‌شده و عکس نیازمند OCR هستند و در این نسخه هنوز پشتیبانی نمی‌شوند.</p>
 <div id="qiMeta" hidden><div class="qi-meta">
 <div><label>کتاب</label><select id="qiBook"></select></div>
 <div><label>درس</label><input id="qiLesson" placeholder="نام درس"></div>
 <div><label>فصل (اختیاری)</label><input id="qiChapter" placeholder="مثلاً فصل دوم"></div><div><label>مبحث</label><input id="qiTopic" placeholder="اختیاری"></div>
 <div><label>سطح همه‌ی سؤال‌ها</label><select id="qiLevel">${levels.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select></div>
 </div><div id="qiCandidates"></div>
 <div class="qi-actions"><button class="big" id="qiImport" type="button">💾 ذخیره‌ی سؤال‌های تأییدشده</button><button class="sm" id="qiCancel" type="button">پاک‌کردن پیش‌نمایش</button></div>
 <p id="qiResult" class="qi-note"></p></div></div>
 <div class="card"><b>📝 ساخت برگه‌ی امتحانی</b><p class="qi-note">ساخت برگه و PDF حالا فقط در «🧪 آزمون‌ساز» است: مدرسه، لوگو، آموزگار، مدیر و پایه خودکار از تنظیمات برنامه می‌آیند و برگه‌ی هر دانش‌آموز بر اساس سطح او در همان درس جدا ساخته می‌شود.</p></div>
 <div class="card" id="qiExamCard" style="display:none"><h3>📝 ساخت برگه‌ی سؤال و خروجی PDF</h3>
 <p class="qi-note">از سؤال‌هایی که قبلاً ذخیره کرده‌ای انتخاب کن، ظاهر برگه را تنظیم کن و روی «آماده‌سازی PDF» بزن. در پنجره‌ی چاپ، مقصد را «Save as PDF / ذخیره به‌صورت PDF» انتخاب کن.</p>
 <div class="qi-meta"><div><label>عنوان برگه</label><input id="qeTitle" value="برگه‌ی سؤال"></div><div><label>نام مدرسه</label><input id="qeSchool" placeholder="مثلاً دبستان ..."></div><div><label>نام آموزگار</label><input id="qeTeacher" placeholder="اختیاری"></div><div><label>پایه</label><select id="qeGrade"><option value="">همه‌ی پایه‌ها</option>${['اول','دوم','سوم','چهارم','پنجم','ششم'].map(x=>`<option>${x}</option>`).join('')}</select></div><div><label>کتاب</label><select id="qeBook"><option value="">همه‌ی کتاب‌ها</option></select></div><div><label>درس</label><select id="qeLesson"><option value="">همه‌ی درس‌ها</option></select></div><div><label>فصل</label><select id="qeChapter"><option value="">همه‌ی فصل‌ها</option></select></div><div><label>مبحث</label><select id="qeTopic"><option value="">همه‌ی مباحث</option></select></div><div><label>تعداد سؤال در برگه</label><input id="qeCount" type="number" min="1" max="100" value="10"></div></div>
 <div class="qi-meta"><div><label>نام دانش‌آموز روی برگه</label><select id="qeNameMode"><option value="line">جای خالی برای نوشتن نام</option><option value="hidden">نمایش نده</option></select></div><div><label>نمایش نمره‌ی هر سؤال</label><select id="qePoints"><option value="yes">بله</option><option value="no">خیر</option></select></div><div><label>دستورالعمل</label><input id="qeInstructions" value="با دقت به سؤال‌ها پاسخ دهید."></div></div>
 <div class="qi-row"><b>🎲 انتخاب تصادفی بر اساس سطح</b><p class="qi-note">ابتدا پایه، کتاب، درس، فصل و مبحث را مشخص کن؛ سپس تعداد هر سطح را وارد کن. فقط از همان دسته‌بندی انتخاب می‌شود.</p><div class="qi-meta"><div><label>آسان</label><input id="qeEasy" type="number" min="0" max="100" value="3"></div><div><label>متوسط</label><input id="qeMedium" type="number" min="0" max="100" value="5"></div><div><label>سخت</label><input id="qeHard" type="number" min="0" max="100" value="2"></div></div><button class="big" id="qeRandom" type="button">🎲 ساخت برگه با سؤال‌های تصادفی</button></div><div class="qi-toolbar"><button class="sm" id="qeSelectVisible" type="button">انتخاب سؤال‌های نمایش‌داده‌شده</button><button class="sm" id="qeClearSelect" type="button">لغو انتخاب‌ها</button><button class="big" id="qeMakePdf" type="button">🖨️ آماده‌سازی PDF</button></div>
 <div id="qeQuestionList" class="qi-exam-list"></div><h4>✏️ برگه‌ی من — ترتیب و متن سؤال‌ها</h4><p class="qi-note">با دکمه‌های بالا/پایین ترتیب را عوض کن. متن هر سؤال را هم می‌توانی فقط برای همین برگه اصلاح کنی؛ بانک اصلی تغییر نمی‌کند.</p><div id="qeSelectedList"></div><p id="qeStatus" class="qi-note" aria-live="polite"></p></div>`;
 const qb=$('qbk');if(qb)qb.after(section);else document.querySelector('main')?.appendChild(section);
 if(typeof pages!=='undefined'&&!pages.some(x=>x[0]==='qimp'))pages.push(['qimp','📥 ورود سؤال از فایل']);
 if(typeof nav!=='undefined'&&!nav.querySelector('[data-p="qimp"]')){const b=document.createElement('button');b.textContent='📥 ورود سؤال از فایل';b.dataset.p='qimp';b.onclick=()=>show('qimp');nav.appendChild(b)}
  /* ---------- خواندن DOCX با حفظ سبک عنوان‌ها (نسخه‌ی ۱۱۴) ---------- */
  async function extract(file){
   const ext=(file.name.split('.').pop()||'').toLowerCase();
   if(ext==='docx'){if(!window.QuestionImportDocx)throw Error('ابزار خواندن Word هنوز بارگذاری نشده است.');const paras=await window.QuestionImportDocx.parse(await file.arrayBuffer());return {paras,text:paras.map(p=>p.t).join('\n')}}
   if(!window.TextExtract)throw Error('ابزار استخراج متن هنوز بارگذاری نشده است.');
   const r=await window.TextExtract.extractFile(file);
   return {text:r.text};
  }
  /* ---------- ورود ساختاریافته: چند کتاب و چند درس در یک فایل (نسخه‌ی ۱۱۴) ---------- */
  let st=null,structured=false;
  const LV={e:'آسان',m:'متوسط',h:'سخت'},TY=[['es','تشریحی'],['sa','کوتاه‌پاسخ'],['mc','چندگزینه‌ای'],['tf','صحیح/غلط'],['fb','جای‌خالی']];
  const courseNames=()=>[...new Set((S.courses||[]).map(c=>c&&c.name).filter(Boolean))];
  const bookOf=b=>{const m=st.bookMap[b.bk];return String(m!==undefined?m:b.bk||'').trim()};
  function showStructuredUi(on){['qiBook','qiLesson','qiTopic'].forEach(id=>{const d=$(id)&&$(id).closest('div');if(d)d.hidden=on})}
  function autoMap(blocks){const names=courseNames(),map={};
   for(const b of blocks){if(b.bk in map)continue;const n=Core.norm(b.bk);
    map[b.bk]=!n?'':(names.find(x=>Core.norm(x)===n)||names.find(x=>n.includes(Core.norm(x))||Core.norm(x).includes(n))||b.bk)}
   return map}
  function refreshFlags(){
   const pr=[];for(const b of st.blocks)for(const it of b.items)pr.push({it,bk:bookOf(b),ls:b.ls,q:it.q,flags:[]});
   Core.markDuplicates(pr,QBK.all());
   for(const p of pr){const it=p.it;it.flags=it.flags.filter(f=>f!=='dup'&&f!=='nobook'&&f!=='nolesson');
    if(p.flags.includes('dup'))it.flags.push('dup');if(!p.bk)it.flags.push('nobook');if(!p.ls)it.flags.push('nolesson')}
  }
  function startStructured(paras){
   const r=Core.parseStructured(paras);
   if(!r.items.length)throw Error('سؤالی تشخیص داده نشد. هر سؤال را با «س:» و پاسخ را با «پ:» شروع کن و کتاب و درس را با عنوان ۱ و عنوان ۲ بنویس.');
   const blocks=[];
   for(const it of r.items){const b=blocks[blocks.length-1];if(b&&b.bk===it.bk&&b.ls===it.ls)b.items.push(it);else blocks.push({bk:it.bk,ls:it.ls,items:[it]})}
   st={items:r.items,blocks,warnings:r.warnings,ended:r.ended,bookMap:autoMap(blocks),open:new Set()};structured=true;candidates=[];
   refreshFlags();st.items.forEach(it=>{it.include=!it.flags.some(f=>f==='dup'||f==='short'||f==='noans'||f==='nobook'||f==='nolesson');it.src=fileName});
   $('qiMeta').hidden=false;showStructuredUi(true);
   $('qiCandidates').innerHTML='<div id="qiTop"></div><div id="qiMaps"></div><div id="qiBlocks"></div>';
   renderStructured();$('qiResult').textContent='';
   $('qiStatus').textContent=`${fa(st.items.length)} سؤال در ${fa(st.blocks.length)} درس پیدا شد.`+(st.items.some(i=>!i.include)?' موردهای تکراری، بدون پاسخ یا ناقص علامت خورده و خودکار انتخاب نشده‌اند.':'');
  }
  const cnt=items=>{const c={dup:0,noans:0,short:0};items.forEach(i=>i.flags.forEach(f=>{if(f in c)c[f]++}));return c};
  const sumText=b=>{const c=cnt(b.items),n=b.items.filter(i=>i.include).length;
   return `${bookOf(b)||'؟'} › ${b.ls||'(بدون درس)'} — ${fa(b.items.length)} سؤال، ${fa(n)} انتخاب`+(c.dup?` · ${fa(c.dup)} تکراری`:'')+(c.noans?` · ${fa(c.noans)} بدون پاسخ`:'')+(c.short?` · ${fa(c.short)} ناقص`:'')};
  function renderTop(){
   const books=new Set(st.blocks.map(b=>bookOf(b))),n=st.items.filter(i=>i.include).length;
   $('qiTop').innerHTML=`<div class="qi-row"><b>خلاصه:</b> ${fa(books.size)} کتاب · ${fa(st.blocks.length)} درس · ${fa(st.items.length)} سؤال؛ ${fa(n)} مورد برای ذخیره انتخاب شده است.${st.ended?' متن بعد از «پایان سؤالات» نادیده گرفته شد.':''}
    ${st.warnings.length?'<br><small class="qi-note">⚠️ '+st.warnings.slice(0,5).map(w=>E(w.msg)).join('<br>')+(st.warnings.length>5?'<br>و '+fa(st.warnings.length-5)+' هشدار دیگر':'')+'</small>':''}
    <div class="qi-toolbar"><button class="sm" type="button" data-gact="clean">فقط سؤال‌های سالم را انتخاب کن</button><button class="sm" type="button" data-gact="all">همه را انتخاب کن</button><button class="sm" type="button" data-gact="none">هیچ‌کدام</button></div></div>`}
  function renderMaps(){
   const names=courseNames(),books=[...new Set(st.blocks.map(b=>b.bk))];
   $('qiMaps').innerHTML=books.map(bk=>{const cur=st.bookMap[bk],opts=names.slice();if(cur&&!opts.includes(cur))opts.unshift(cur);
    return `<div class="qi-row"><label>کتابِ «${E(bk||'بدون نام')}» در فایل ← کتاب در برنامه</label><select data-bookmap="${E(bk)}">${cur?'':'<option value="">انتخاب کتاب</option>'}${opts.map(x=>`<option ${x===cur?'selected':''}>${E(x)}</option>`).join('')}</select>${cur&&!names.includes(cur)?'<small class="qi-note">این کتاب در درس‌های برنامه تعریف نشده؛ با همین نام ذخیره می‌شود.</small>':''}</div>`}).join('')}
  function rowHtml(it,ii){
   const f=it.flags,badge=(f.includes('dup')?' <b style="color:#b45309">⚠️ تکراری</b>':'')+(f.includes('noans')?' <b style="color:#b45309">⚠️ بدون پاسخ</b>':'')+(f.includes('short')?' <b style="color:#b91c1c">⚠️ ناقص</b>':'');
   return `<div class="qe-edit-row" data-ii="${ii}"><label><input type="checkbox" data-f="include" ${it.include?'checked':''} style="width:auto"> ${fa(ii+1)}${badge}</label>
    <textarea data-f="q" aria-label="متن سؤال">${E(it.q)}</textarea><textarea data-f="ans" aria-label="پاسخ" placeholder="پاسخ">${E(it.ans)}</textarea>
    ${it.type==='mc'?`<label>گزینه‌ها (هر خط یک گزینه)</label><textarea data-f="op">${E(it.op.join('\n'))}</textarea><label>شماره‌ی گزینه‌ی درست</label><input data-f="ok" inputmode="numeric" value="${E(it.ok||'')}">`:''}
    <div class="qi-grid"><div><label>سطح</label><select data-f="lv"><option value="">مثل سطح همه‌ی سؤال‌ها</option>${Object.keys(LV).map(k=>`<option value="${k}" ${it.lv===k?'selected':''}>${LV[k]}</option>`).join('')}</select></div>
    <div><label>نوع</label><select data-f="type">${TY.map(x=>`<option value="${x[0]}" ${it.type===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div></div></div>`}
  function bodyHtml(b){return `<div class="qi-toolbar"><button class="sm" type="button" data-bact="all">همه‌ی این درس</button><button class="sm" type="button" data-bact="none">هیچ‌کدام</button><button class="sm" type="button" data-bact="clean">فقط سالم‌ها</button></div><label>نام درس</label><input data-bls value="${E(b.ls)}">`+b.items.map(rowHtml).join('')}
  function renderBlocks(){
   $('qiBlocks').innerHTML=st.blocks.map((b,bi)=>`<details class="qi-row" data-bi="${bi}" ${st.open.has(bi)?'open':''}><summary>${E(sumText(b))}</summary>${st.open.has(bi)?bodyHtml(b):''}</details>`).join('')}
  function renderStructured(){refreshFlags();renderTop();renderMaps();renderBlocks()}
  function refreshSummaries(){refreshFlags();renderTop();document.querySelectorAll('#qiBlocks details').forEach(d=>{d.querySelector('summary').textContent=sumText(st.blocks[+d.dataset.bi])})}
  $('qiCandidates').addEventListener('toggle',e=>{const d=e.target;if(!st||!d.matches||!d.matches('#qiBlocks > details'))return;const bi=+d.dataset.bi;
   if(d.open){if(!st.open.has(bi)||!d.querySelector('[data-bls]')){st.open.add(bi);if(!d.querySelector('[data-bls]'))d.insertAdjacentHTML('beforeend',bodyHtml(st.blocks[bi]))}}else st.open.delete(bi)},true);
  function onStructuredEdit(e){
   if(!st)return;const t=e.target;
   if(t.dataset.bookmap!==undefined){const had=!!st.bookMap[t.dataset.bookmap];st.bookMap[t.dataset.bookmap]=t.value;renderMaps();refreshSummaries();if(!had&&t.value){st.items.forEach(i=>{i.include=!i.flags.length});renderStructured()}return}
   const det=t.closest('[data-bi]');if(!det)return;const b=st.blocks[+det.dataset.bi];
   if(t.dataset.bls!==undefined){b.ls=t.value.trim();if(e.type==='change')refreshSummaries();else det.querySelector('summary').textContent=sumText(b);return}
   const row=t.closest('[data-ii]');if(!row)return;const it=b.items[+row.dataset.ii],k=t.dataset.f;if(!k)return;
   if(k==='include')it.include=t.checked;
   else if(k==='op')it.op=t.value.split('\n').map(x=>x.trim()).filter(Boolean);
   else{it[k]=t.value;if(k==='q'||k==='ans'){it.flags=it.flags.filter(f=>f!=='short'&&f!=='noans');if(it.q.trim().length<3)it.flags.push('short');if(!it.ans.trim()&&it.type!=='mc')it.flags.push('noans')}}
   if(k==='type'){Array.from(det.children).forEach(c=>{if(c.tagName!=='SUMMARY')c.remove()});det.insertAdjacentHTML('beforeend',bodyHtml(b))}
   if(k==='include'||k==='type'||e.type==='change')refreshSummaries();else{det.querySelector('summary').textContent=sumText(b)}
  }
  $('qiCandidates').addEventListener('input',onStructuredEdit);$('qiCandidates').addEventListener('change',onStructuredEdit);
  $('qiCandidates').addEventListener('click',e=>{if(!st)return;const g=e.target.closest('[data-gact]'),a=e.target.closest('[data-bact]');
   const sel=(items,mode)=>items.forEach(i=>{i.include=mode==='all'?true:mode==='none'?false:!i.flags.length});
   if(g){sel(st.items,g.dataset.gact);renderStructured()}
   else if(a){const det=a.closest('[data-bi]'),b=st.blocks[+det.dataset.bi];sel(b.items,a.dataset.bact);refreshSummaries();det.querySelector('[data-bls]').parentNode.querySelectorAll('[data-f="include"]').forEach((c,i)=>{c.checked=b.items[i].include})}});
  function loadSource(r,name){
   const text=r.text!=null?r.text:r.paras.map(p=>p.t).join('\n');
   if(!String(text).trim())throw Error('متن خالی است.');
   fileName=name||'متن کپی‌شده';
   const paras=r.paras||String(text).split(/\n/).map(t=>({h:0,t}));
   if(paras.some(p=>p.h)||/^\s*س\s*[:：]/m.test(text)){startStructured(paras);return}
   structured=false;st=null;showStructuredUi(false);previewText(text,fileName);
  }
  function importStructured(){
   const gr=String((S.prof&&S.prof.grade)||''),ch=$('qiChapter').value.trim(),lv=$('qiLevel').value;
   if(!gr){$('qiResult').textContent='پایه‌ی کلاس در «اطلاعات مدرسه و پایه» ثبت نشده است؛ ابتدا آن را ثبت کن.';return}
   refreshFlags();
   const bank=QBK.all(),now=Date.now(),toAdd=[],dups=[];let bad=0;
   for(const b of st.blocks){const bk=bookOf(b);
    for(const it of b.items){if(!it.include)continue;
     const q=String(it.q||'').trim(),ty=it.type||'es';
     if(!bk||!b.ls||q.length<3){bad++;continue}
     let op=[],ok=-1;
     if(ty==='mc'){op=(it.op||[]).map(x=>String(x).trim()).filter(Boolean);if(op.length===1){bad++;continue}const n=parseInt(String(it.ok||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)),10);if(n>0&&n<=op.length)ok=n-1}
     let ans=String(it.ans||'').trim();
     if(ty==='tf'&&ans){const a=Core.norm(ans);if(['t','صحیح','درست','بله','true'].includes(a))ans='T';else if(['f','غلط','نادرست','خیر','false'].includes(a))ans='F'}
     const rec={v:1,gr,bk,ls:b.ls,ch,tp:it.tp||'',lv:it.lv||lv,ty,q,op,ok,ans:ty==='mc'&&ok>=0?op[ok]:ans,pt:1,src:String(it.src||fileName).trim(),ca:now};
     const key=Core.duplicateKey(rec);
     if(bank.some(x=>Core.duplicateKey(x)===key)||toAdd.some(x=>Core.duplicateKey(x)===key)){dups.push(q);continue}
     toAdd.push(rec);
    }}
   if(bad){$('qiResult').textContent=`${fa(bad)} سؤال انتخاب‌شده کتاب یا درس ندارد، متنش خیلی کوتاه است یا گزینه‌هایش ناقص است. اصلاحشان کن یا تیک ذخیره را بردار؛ چیزی ذخیره نشد.`;return}
   if(!toAdd.length){$('qiResult').textContent=dups.length?'سؤال‌های انتخاب‌شده قبلاً وجود داشتند؛ چیزی ذخیره نشد.':'هیچ سؤالی برای ذخیره انتخاب نشده است.';return}
   const existing=new Set(bank.map(x=>x.id));let id=now;toAdd.forEach(r=>{while(existing.has(id))id++;r.id=id++;existing.add(r.id)});
   S.qbk=(Array.isArray(S.qbk)?S.qbk:[]).concat(toAdd);save();QBK.render();fillExamFilters();renderExamList();
   const lessons=new Set(toAdd.map(r=>r.bk+'|'+r.ls)).size;
   $('qiResult').textContent=`${fa(toAdd.length)} سؤال از ${fa(lessons)} درس ذخیره شد${dups.length?'؛ '+fa(dups.length)+' مورد تکراری نادیده گرفته شد':''}.`;
   st=null;structured=false;showStructuredUi(false);$('qiCandidates').innerHTML='';$('qiFile').value='';$('qiPasteText').value='';$('qiMeta').hidden=true;$('qiStatus').textContent='تمام شد؛ می‌توانی فایل بعدی را انتخاب کنی.';
  }
 function renderCandidates(){
  $('qiCandidates').innerHTML=`<p class="qi-note">سؤال‌ها را بررسی کن؛ پاسخ لازم نیست. اگر متن اشتباه استخراج شده، همان‌جا اصلاحش کن.</p>`+candidates.map((c,i)=>`<div class="qi-row" data-qi="${i}">
   <label><input type="checkbox" data-field="include" ${c.include?'checked':''} style="width:auto"> ذخیره شود</label>
   <div class="qi-note">سؤال ${fa(i+1)}${c.confidence==='low'?' · نیازمند بررسی':''}</div>
   <textarea aria-label="متن سؤال" data-field="q">${E(c.q)}</textarea>
   <details><summary>تنظیمات اختیاری این سؤال</summary>
    <div class="qi-grid"><div><label>نوع سؤال</label><select data-field="type">${[['es','تشریحی'],['sa','کوتاه‌پاسخ'],['mc','چندگزینه‌ای'],['tf','صحیح/غلط'],['fb','جای‌خالی']].map(x=>`<option value="${x[0]}" ${c.type===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div>
    <div><label>سطح</label><select data-field="lv"><option value="">مثل سطح همه‌ی سؤال‌ها</option>${levels.map(x=>`<option value="${x[0]}" ${c.lv===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div></div>
    <label>گزینه‌ها (هر گزینه در یک خط، در صورت وجود)</label><textarea data-field="op">${E(c.op.join('\\n'))}</textarea>
    <label>پاسخ (اختیاری)</label><textarea data-field="ans">${E(c.ans)}</textarea>
    <label>شماره گزینه درست (اختیاری)</label><input data-field="ok" inputmode="numeric" value="${E(c.ok||'')}" placeholder="مثلاً ۲">
   </details>
   </div>`).join('');
 }
 $('qiCandidates').addEventListener('input',e=>{const row=e.target.closest('[data-qi]');if(!row)return;const c=candidates[+row.dataset.qi],k=e.target.dataset.field;if(!k)return;
  if(k==='include')c.include=e.target.checked;else if(k==='op')c.op=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);else c[k]=e.target.value;
 });
 function previewText(text,name){
  if(!String(text||'').trim())throw Error('متن خالی است.');fileName=name||'متن کپی‌شده';
  candidates=Core.parse(text).map(c=>Object.assign(c,{include:true,ans:c.ans||'',op:c.op||[],ok:c.ok||'',src:fileName}));
  if(!candidates.length)throw Error('سؤالی تشخیص داده نشد. بهتر است هر سؤال در خط جدا و با شماره شروع شود.');
  $('qiMeta').hidden=false;$('qiStatus').textContent=`${fa(candidates.length)} سؤال احتمالی پیدا شد. پیش از ذخیره، پیش‌نمایش را بررسی کن؛ پاسخ لازم نیست.`;
  renderCandidates();$('qiResult').textContent='';
 }
 $('qiFile').addEventListener('change',async()=>{const f=$('qiFile').files&&$('qiFile').files[0];if(!f)return;busy=true;$('qiStatus').textContent='در حال خواندن فایل روی همین دستگاه…';$('qiMeta').hidden=true;
  try{if(f.size>30*1024*1024)throw Error('حجم فایل بیش از ۳۰ مگابایت است.');const r=await extract(f);loadSource(r,f.name);$('qiPasteText').value='';$('qiFile').value='';}
  catch(err){$('qiStatus').textContent='خطا: '+(err&&err.message||'خواندن فایل ناموفق بود.');candidates=[];$('qiMeta').hidden=true;$('qiFile').value=''}
  finally{busy=false}
 });
 $('qiParsePaste').addEventListener('click',()=>{try{loadSource({text:$('qiPasteText').value},'متن کپی‌شده');$('qiResult').textContent='';}catch(err){$('qiStatus').textContent=err.message;$('qiMeta').hidden=true}});
 function fillBooks(){const el=$('qiBook'),old=el.value,names=[...new Set((S.courses||[]).map(c=>c&&c.name).filter(Boolean))];
  el.innerHTML=names.length?'<option value="">انتخاب کتاب</option>'+names.map(n=>`<option${n===old?' selected':''}>${E(n)}</option>`).join(''):'<option value="">ابتدا درس‌ها را در برنامه تعریف کن</option>'}
 fillBooks();['mousedown','focus'].forEach(ev=>$('qiBook').addEventListener(ev,fillBooks));
 $('qiClearPaste').addEventListener('click',()=>{$('qiPasteText').value='';$('qiStatus').textContent='متن کپی‌شده پاک شد.'});
 $('qiCancel').onclick=()=>{st=null;structured=false;showStructuredUi(false);$('qiCandidates').innerHTML='';candidates=[];$('qiFile').value='';$('qiMeta').hidden=true;$('qiStatus').textContent='پیش‌نمایش پاک شد.';$('qiResult').textContent=''};
 $('qiImport').onclick=()=>{
  if(structured&&st)return importStructured();
  const gr=String((S.prof&&S.prof.grade)||''),bk=$('qiBook').value.trim(),ls=$('qiLesson').value.trim(),ch=$('qiChapter').value.trim(),tp=$('qiTopic').value.trim(),lv=$('qiLevel').value;
  if(!gr){$('qiResult').textContent='پایه‌ی کلاس در «اطلاعات مدرسه و پایه» ثبت نشده است؛ ابتدا آن را ثبت کن.';return}
  if(!bk||!ls){$('qiResult').textContent='برای کل مجموعه، کتاب و درس را وارد کن.';return}
  const selected=candidates.filter(c=>c.include),bank=QBK.all(),now=Date.now(),toAdd=[],dups=[];
  for(const c of selected){
   const q=String(c.q||'').trim(),ans=String(c.ans||'').trim(),ty=c.type||'es';
   if(q.length<3){$('qiResult').textContent='متن یکی از سؤال‌ها خیلی کوتاه است؛ آن را اصلاح کن یا تیک ذخیره‌اش را بردار.';return}
   let op=[],ok=-1;
   if(ty==='mc'){
    op=Array.isArray(c.op)?c.op:String(c.op||'').split('\\n').map(x=>x.trim()).filter(Boolean);op=op.map(x=>String(x).trim()).filter(Boolean);
    const raw=String(c.ok||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));const n=parseInt(raw,10);
    if(op.length===1){$('qiResult').textContent='برای سؤال چندگزینه‌ای، اگر گزینه‌ها وجود دارند دست‌کم دو گزینه وارد کن؛ یا نوع سؤال را تغییر بده.';return}
    if(n>0&&n<=op.length)ok=n-1;
   }
   let normalizedAns=ans;
   if(ty==='tf'&&ans){const a=Core.norm(ans);if(['t','صحیح','درست','بله','true'].includes(a))normalizedAns='T';else if(['f','غلط','نادرست','خیر','false'].includes(a))normalizedAns='F';else normalizedAns=ans}
   const rec={v:1,gr,bk,ls,ch,tp,lv:c.lv||lv,ty,q,op,ok,ans:ty==='mc'&&ok>=0?op[ok]:normalizedAns,pt:1,src:String(c.src||fileName).trim(),ca:now};
   const key=Core.duplicateKey(rec);
   if(bank.some(x=>Core.duplicateKey(x)===key)||toAdd.some(x=>Core.duplicateKey(x)===key)){dups.push(q);continue}
   toAdd.push(rec);
  }
  if(!toAdd.length){$('qiResult').textContent=dups.length?'سؤال‌های انتخاب‌شده قبلاً وجود داشتند؛ چیزی ذخیره نشد.':'هیچ سؤالی برای ذخیره انتخاب نشده است.';return}
  const existing=new Set(bank.map(x=>x.id));let id=now;toAdd.forEach(r=>{while(existing.has(id))id++;r.id=id++;existing.add(r.id)});S.qbk=(Array.isArray(S.qbk)?S.qbk:[]).concat(toAdd);save();QBK.render();fillExamFilters();renderExamList();
  $('qiResult').textContent=`${fa(toAdd.length)} سؤال ذخیره شد${dups.length?'؛ '+fa(dups.length)+' مورد تکراری نادیده گرفته شد':''}. فایل اصلی روی لپ‌تاپت دست‌نخورده می‌ماند؛ برنامه فقط فایل انتخاب‌شده‌ی موقت را نگه نمی‌دارد.`;
  candidates=[];$('qiCandidates').innerHTML='';$('qiFile').value='';$('qiPasteText').value='';$('qiMeta').hidden=true;$('qiStatus').textContent='تمام شد؛ فایل موقت از انتخاب برنامه پاک شد. می‌توانی فایل بعدی را انتخاب کنی.';
 };
 /* ساخت برگه‌ی سفارشی؛ فیلتر دقیق درس/فصل/مبحث و انتخاب تصادفی قابل ویرایش */
 const normVal=id=>$(id)?.value||'';
 let selectedOrder=[],examEdits={};
 function examPool(){return QBK.all().filter(q=>(!normVal('qeGrade')||q.gr===normVal('qeGrade'))&&(!normVal('qeBook')||q.bk===normVal('qeBook'))&&(!normVal('qeLesson')||q.ls===normVal('qeLesson'))&&(!normVal('qeChapter')||(q.ch||'')===normVal('qeChapter'))&&(!normVal('qeTopic')||(q.tp||'')===normVal('qeTopic')))}
 function fillExamFilters(){const bank=QBK.all();const defs=[['qeBook','bk','همه‌ی کتاب‌ها',[]],['qeLesson','ls','همه‌ی درس‌ها',['qeBook']],['qeChapter','ch','همه‌ی فصل‌ها',['qeBook','qeLesson']],['qeTopic','tp','همه‌ی مباحث',['qeBook','qeLesson','qeChapter']]];for(const [id,key,label,parents] of defs){const el=$(id),old=el.value;const values=bank.filter(q=>(!normVal('qeGrade')||q.gr===normVal('qeGrade'))&&parents.every(pid=>{const parentKey=({'qeBook':'bk','qeLesson':'ls','qeChapter':'ch'})[pid];return !normVal(pid)||(q[parentKey]||'')===normVal(pid)})).map(q=>q[key]).filter(Boolean);el.innerHTML=`<option value="">${label}</option>`+[...new Set(values)].sort((a,b)=>String(a).localeCompare(String(b),'fa')).map(v=>`<option value="${E(v)}" ${v===old?'selected':''}>${E(v)}</option>`).join('');if(old&&!values.includes(old))el.value=''}}
 function renderExamList(){const list=$('qeQuestionList');if(!list)return;const pool=examPool();list.innerHTML=pool.length?pool.map(q=>`<label class="qi-exam-item"><input type="checkbox" data-exam-q value="${E(q.id)}" ${selectedOrder.includes(String(q.id))?'checked':''} style="width:auto;margin-top:5px"><span><b>${E(q.q)}</b><small style="display:block;color:var(--mut)">${E(q.gr)} · ${E(q.bk)} · ${E(q.ls)}${q.ch?' · فصل '+E(q.ch):''}${q.tp?' · '+E(q.tp):''} · ${E(({e:'آسان',m:'متوسط',h:'سخت'})[q.lv]||'متوسط')}</small></span></label>`).join(''):'<p class="qi-note">در این دسته‌بندی سؤالی پیدا نشد. پایه، کتاب، درس، فصل و مبحث را بررسی کن.</p>';renderSelected();}
 function renderSelected(){const box=$('qeSelectedList');if(!box)return;const byId=new Map(QBK.all().map(q=>[String(q.id),q]));selectedOrder=selectedOrder.filter(id=>byId.has(id));box.innerHTML=selectedOrder.length?selectedOrder.map((id,i)=>{const q=byId.get(id),text=examEdits[id]??q.q;return `<div class="qe-edit-row" data-selected-id="${E(id)}"><div class="qe-move"><b>سؤال ${fa(i+1)}</b><button type="button" class="sm" data-move="up" ${i===0?'disabled':''}>⬆️ بالا</button><button type="button" class="sm" data-move="down" ${i===selectedOrder.length-1?'disabled':''}>⬇️ پایین</button><button type="button" class="sm" data-remove="1">حذف از برگه</button></div><textarea data-exam-edit aria-label="ویرایش متن سؤال">${E(text)}</textarea><small class="qi-note">${E(q.bk)} · ${E(q.ls)}${q.ch?' · فصل '+E(q.ch):''}${q.tp?' · '+E(q.tp):''} · ${E(({e:'آسان',m:'متوسط',h:'سخت'})[q.lv]||'متوسط')}</small></div>`}).join(''):'<p class="qi-note">هنوز سؤالی برای برگه انتخاب نشده است.</p>'}
 function setSelected(ids){selectedOrder=[];const seen=new Set();ids.forEach(id=>{id=String(id);if(!seen.has(id)){seen.add(id);selectedOrder.push(id)}});renderExamList()}
 const examFilterOrder=['qeGrade','qeBook','qeLesson','qeChapter','qeTopic'];examFilterOrder.forEach((id,i)=>$(id).addEventListener('change',()=>{examFilterOrder.slice(i+1).forEach(next=>$(next).value='');fillExamFilters();renderExamList()}));fillExamFilters();renderExamList();
 $('qeQuestionList').addEventListener('change',e=>{if(!e.target.matches('[data-exam-q]'))return;const id=String(e.target.value);if(e.target.checked){if(!selectedOrder.includes(id))selectedOrder.push(id)}else selectedOrder=selectedOrder.filter(x=>x!==id);renderSelected()});
 $('qeSelectedList').addEventListener('input',e=>{if(!e.target.matches('[data-exam-edit]'))return;const row=e.target.closest('[data-selected-id]');if(row)examEdits[row.dataset.selectedId]=e.target.value});
 $('qeSelectedList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const row=b.closest('[data-selected-id]');if(!row)return;const id=row.dataset.selectedId,i=selectedOrder.indexOf(id);if(b.dataset.remove){selectedOrder=selectedOrder.filter(x=>x!==id);renderExamList();return}const j=b.dataset.move==='up'?i-1:i+1;if(i>=0&&j>=0&&j<selectedOrder.length){[selectedOrder[i],selectedOrder[j]]=[selectedOrder[j],selectedOrder[i]];renderSelected()}});
 $('qeRandom').onclick=()=>{if(!normVal('qeGrade')||!normVal('qeBook')||!normVal('qeLesson')){$('qeStatus').textContent='برای جلوگیری از قاطی‌شدن درس‌ها، قبل از انتخاب تصادفی حتماً پایه، کتاب و درس را مشخص کن.';return}const counts={e:Math.max(0,Math.min(100,parseInt(normVal('qeEasy'),10)||0)),m:Math.max(0,Math.min(100,parseInt(normVal('qeMedium'),10)||0)),h:Math.max(0,Math.min(100,parseInt(normVal('qeHard'),10)||0))};const pool=examPool(),picked=[],shortages=[];for(const lv of ['e','m','h']){const arr=pool.filter(q=>q.lv===lv).sort(()=>Math.random()-.5);picked.push(...arr.slice(0,counts[lv]).map(q=>String(q.id)));if(arr.length<counts[lv])shortages.push(`${({e:'آسان',m:'متوسط',h:'سخت'})[lv]}: ${fa(arr.length)} از ${fa(counts[lv])}`)}if(!picked.length){$('qeStatus').textContent='برای این دسته‌بندی سؤال پیدا نشد یا تعدادها صفر است.';return}examEdits={};setSelected(picked);$('qeCount').value=picked.length;$('qeStatus').textContent=`${fa(picked.length)} سؤال تصادفی انتخاب شد. می‌توانی ترتیب یا متنشان را تغییر بدهی.${shortages.length?' تعداد موجود کمتر بود: '+shortages.join('، '):''}`};
 $('qeSelectVisible').onclick=()=>{const ids=Array.from($('qeQuestionList').querySelectorAll('[data-exam-q]')).map(x=>String(x.value));setSelected([...selectedOrder,...ids]);$('qeStatus').textContent='سؤال‌های نمایش‌داده‌شده به برگه اضافه شدند.'};
 $('qeClearSelect').onclick=()=>{selectedOrder=[];examEdits={};renderExamList();$('qeStatus').textContent='انتخاب‌ها پاک شدند.'};
 $('qeMakePdf').onclick=()=>{
  const byId=new Map(QBK.all().map(q=>[String(q.id),q]));let pool=selectedOrder.map(id=>byId.get(id)).filter(Boolean).map(q=>Object.assign({},q,{q:examEdits[String(q.id)]??q.q}));
  const max=Math.max(1,Math.min(100,parseInt(normVal('qeCount'),10)||100));pool=pool.slice(0,max);
  if(!pool.length){$('qeStatus').textContent='ابتدا دست‌کم یک سؤال را انتخاب کن.';return}
  const esc=E,withPts=normVal('qePoints')!=='no';
  const items=pool.map((q,i)=>`<article class="question"><div class="qtext"><b>${fa(i+1)}.</b> ${esc(q.q)} ${withPts?`<span class="points">(${fa(q.pt||1)} نمره)</span>`:''}</div>${Array.isArray(q.op)&&q.op.length?`<div class="options">${q.op.map((op,j)=>`<div>${['الف','ب','پ','ت','ث','ج','چ','ح','خ','د'][j]||fa(j+1)}) ${esc(op)}</div>`).join('')}</div>`:''}<div class="answer-space" style="height:${['es','sa','fb'].includes(q.ty)?'42px':'8px'}"></div></article>`).join('');
  const title=esc(normVal('qeTitle')||'ارزشیابی آغازین'),school=esc(normVal('qeSchool')),instructions=esc(normVal('qeInstructions')),examGrade=esc(normVal('qeGrade')),examLesson=esc(normVal('qeLesson')),examBook=esc(normVal('qeBook')),teacher=esc(normVal('qeTeacher')||'');
  const nameLine=normVal('qeNameMode')==='line'?`<div class="meta">نام و نام خانوادگی: .............................................　 پایه: ${examGrade||'........'}　 تاریخ: ................</div>`:'';
  const html=`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:17mm}*{box-sizing:border-box}body{font-family:Tahoma,"Arial",sans-serif;color:#111;direction:rtl;font-size:14px;line-height:2}header{text-align:center;border-bottom:2px solid #222;padding-bottom:10px;margin-bottom:14px}h1{font-size:22px;margin:0}header .school{font-size:14px;margin-top:4px}.meta{margin:12px 0}.instructions{border:1px solid #aaa;padding:7px 10px;margin:12px 0}.question{margin:16px 0;break-inside:avoid}.qtext{font-size:15px}.points{font-size:12px;white-space:nowrap}.options{display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;margin:5px 22px}.answer-space{height:${pool.some(q=>['es','sa','fb'].includes(q.ty))?'42px':'8px'};border-bottom:1px dotted #bbb;margin-top:5px}.feedback{margin-top:26px;break-inside:avoid}.feedback table{width:100%;border-collapse:collapse;font-size:11px}.feedback td,.feedback th{border:1px solid #777;padding:4px;text-align:center}.feedback td:first-child,.feedback th:first-child{text-align:right}footer{margin-top:22px;text-align:center;font-size:11px;color:#555}@media print{button{display:none}}</style></head><body><header><div>به نام خداوند دانا</div>${school?`<div class="school">${school}</div>`:''}<h1>${title}</h1><div class="school">نام درس: ${examLesson||'................'}　 کتاب: ${examBook||'................'}　 آموزگار: ${teacher||'................'}</div></header>${nameLine}${instructions?`<div class="instructions">${instructions}</div>`:''}${items}<section class="feedback"><b>بازخورد آموزگار</b><table><tr><th>انتظارات</th><th>بله</th><th>تاحدودی</th><th>خیر</th></tr>${['مفاهیم درس را درک می‌کند','روش حل را به‌درستی به‌کار می‌برد','با دقت به سؤال‌ها پاسخ می‌دهد'].map(x=>`<tr><td>${x}</td><td>□</td><td>□</td><td>□</td></tr>`).join('')}</table></section><footer>تعداد سؤال: ${fa(pool.length)}　　*** با آرزوی موفقیت ***</footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`;
  const w=window.open('','_blank');if(!w){$('qeStatus').textContent='مرورگر پنجره‌ی چاپ را مسدود کرد؛ اجازه‌ی بازشدن پنجره را بده و دوباره تلاش کن.';return}w.document.open();w.document.write(html);w.document.close();$('qeStatus').textContent='برگه آماده است. در پنجره‌ی چاپ، «ذخیره به‌صورت PDF» را انتخاب کن.';
 };
 /* سطح اولیه‌ی دانش‌آموز و انتخاب سؤال در همان ساختار ذخیره‌سازی فعلی */
 function students(){return Array.isArray(S.students)?S.students:[]}
 function renderLevels(){
  let box=$('qiStudentLevels');if(!box){box=document.createElement('div');box.id='qiStudentLevels';box.className='card';box.innerHTML='<b>🎯 سطح اولیه و پیشنهاد سؤال</b><p class="qi-note">سطح هر دانش‌آموز در اطلاعات محلی برنامه ذخیره می‌شود. این سطح، برچسب آموزشی است و به‌تنهایی درباره‌ی توانایی دانش‌آموز قضاوت نمی‌کند.</p><div class="qi-meta"><div><label>پایه‌ی سؤال</label><select id="qiPickGrade"><option value="">همه‌ی پایه‌ها</option></select></div><div><label>کتاب</label><select id="qiPickBook"><option value="">همه‌ی کتاب‌ها</option></select></div><div><label>درس</label><select id="qiPickLesson"><option value="">همه‌ی درس‌ها</option></select></div></div><div id="qiLevelRows"></div><p id="qiPickResult" class="qi-note"></p>';section.appendChild(box)}
  const oldPick={gr:$('qiPickGrade')?.value||'',bk:$('qiPickBook')?.value||'',ls:$('qiPickLesson')?.value||''};
  const bankNow=QBK.all(),fillPick=(id,label,values,selected)=>{$(id).innerHTML=`<option value="">${label}</option>`+[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'fa')).map(v=>`<option value="${E(v)}" ${v===selected?'selected':''}>${E(v)}</option>`).join('')};
  fillPick('qiPickGrade','همه‌ی پایه‌ها',bankNow.map(q=>q.gr),oldPick.gr);fillPick('qiPickBook','همه‌ی کتاب‌ها',bankNow.map(q=>q.bk),oldPick.bk);fillPick('qiPickLesson','همه‌ی درس‌ها',bankNow.map(q=>q.ls),oldPick.ls);
  const ss=students();$('qiLevelRows').innerHTML=ss.length?ss.map(s=>`<div class="qi-grid" style="align-items:center;border-bottom:1px solid var(--line);padding:6px 0"><div>${E(s.name||('دانش‌آموز '+s.id))}</div><div><select data-student="${E(s.id)}"><option value="">هنوز تعیین نشده</option>${levels.map(l=>`<option value="${l[0]}" ${(s.qbkLevel||'')===l[0]?'selected':''}>${l[1]}</option>`).join('')}</select></div><div><button type="button" class="sm" data-pick="${E(s.id)}">🎲 پیشنهاد یک سؤال</button></div></div>`).join(''):'<p class="qi-note">فهرست دانش‌آموزان این کلاس در دسترس نیست.</p>';
 }
 $('qiStudentLevels')?.remove();renderLevels();
 $('qiLevelRows').addEventListener('change',e=>{const id=e.target.dataset.student;if(id==null)return;const s=students().find(x=>String(x.id)===String(id));if(!s)return;s.qbkLevel=e.target.value;save()});
 $('qiLevelRows').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(!b)return;const s=students().find(x=>String(x.id)===String(b.dataset.pick));if(!s)return;
  const lv=s.qbkLevel;if(!lv){$('qiPickResult').textContent='ابتدا سطح اولیه‌ی این دانش‌آموز را تعیین کنید.';return}
  const gr=$('qiPickGrade').value,bk=$('qiPickBook').value,ls=$('qiPickLesson').value;
  const pool=QBK.all().filter(q=>q.lv===lv&&(!gr||q.gr===gr)&&(!bk||q.bk===bk)&&(!ls||q.ls===ls));if(!pool.length){$('qiPickResult').textContent='سؤالی با این سطح و فیلترهای انتخاب‌شده در بانک پیدا نشد.';return}
  const q=pool[Math.floor(Math.random()*pool.length)];$('qiPickResult').textContent=`پیشنهاد برای ${s.name||'دانش‌آموز'} (${levels.find(x=>x[0]===lv)[1]}): ${q.q} — ${q.bk}، ${q.ls}. این سؤال از بانک موجود انتخاب شد.`;
 });
 window.QuestionImport=Object.freeze({parse:Core.parse,extract,selectForStudent:(student,opts)=>{opts=opts||{};const lv=student&&(student.qbkLevel||student.initialLevel);return QBK.all().filter(q=>(!lv||q.lv===lv)&&(!opts.gr||q.gr===opts.gr)&&(!opts.bk||q.bk===opts.bk)&&(!opts.ls||q.ls===opts.ls))}});
 const oldShow=window.show;window.show=function(id){const r=oldShow.apply(this,arguments);if(id==='qimp')renderLevels();return r};
}catch(e){console.error('question-import',e)}})();

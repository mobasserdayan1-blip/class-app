/* ساخت برگه‌ی امتحانی — محلی و آفلاین
   فقط از سؤال‌های موجود در بانک (S.qbk) انتخاب می‌کند؛ هیچ سؤال تازه‌ای نمی‌سازد و چیزی به اینترنت نمی‌فرستد.
   نام مدرسه، پایه و آموزگار از «اطلاعات مدرسه و پایه» (S.prof) خوانده می‌شود.
   داده‌ی تازه‌ی این ماژول فقط در S.exb (تنظیمات برگه) و سطح دانش‌آموز در همان s.qbkLevel قبلی ذخیره می‌شود. */
(function(){'use strict';
try{
 const C=window.ExamBuilderCore;
 if(!C||!window.QBK){console.warn('exam-builder: dependency missing');return}
 const $=id=>document.getElementById(id);
 const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const F=n=>typeof fa==='function'?fa(n):String(n);
 const LVN={e:'آسان',m:'متوسط',h:'سخت'};
 const TYPES=['ارزشیابی آغازین','آزمون ماهانه','آزمون مستمر','آزمون نیم‌سال اول','آزمون نیم‌سال دوم','آزمون پایان فصل','آزمون پایان سال','آزمونک',''];
 const FBL=['خیلی خوب','خوب','قابل قبول','نیاز به تلاش دارد'];
 const fullTitle=()=>[($('exbType')||{}).value||'',(($('exbTitle')||{}).value||'').trim()].filter(Boolean).join(' ')||'ارزشیابی';
 const prof=()=>S.prof||{};
 const grade=()=>String(prof().grade||'');
 const bank=()=>QBK.all();
 const cfg=()=>{S.exb=S.exb&&typeof S.exb==='object'?S.exb:{};return S.exb};
 const DEF_MIX=()=>JSON.parse(JSON.stringify(C.DEFAULT_MIX));
 /* سطح هر دانش‌آموز «به تفکیک درس»: s.qbkLv[کتاب]=سطح ثبت‌شده‌ی معلم، s.qbkLvD[کتاب]=تاریخ ثبت.
    بعد از ثبت، اگر دست‌کم ۲ آزمون جدید از همان درس نمره بخورد، سطح خودکار از میانگین ۳ آزمون آخر تعیین می‌شود. */
 function lvFor(s,bk){
  const cr=(S.courses||[]).find(c=>C.norm(c.name)===C.norm(bk));
  const ex=cr&&typeof nrm==='function'?(S.exams||[]).filter(e=>e.course===cr.id).map(e=>({d:e.date,v:nrm(e,s.id)})).filter(x=>x.v!=null):[];
  const k=s.qbkLv&&s.qbkLv[bk]||s.qbkLevel||'';
  return C.resolveLevel(k?{k,d:(s.qbkLvD&&s.qbkLvD[bk])||''}:null,ex);
 }
 let last=null; /* آخرین ساخت: {sheets, ctx} */

 const st=document.createElement('style');st.textContent=`
 #exh .exh-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
 #exh .exh-btns button{padding:22px 8px;font-size:17px;line-height:1.8}
 #exb .exb-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
 #exb input,#exb select,#exb textarea{width:100%;box-sizing:border-box;margin:4px 0 8px}
 #exb input[type=checkbox]{width:auto;margin:0 0 0 6px}
 #exb .exb-n{font-size:13px;line-height:1.9;color:var(--mut)}
 #exb .exb-st{display:grid;grid-template-columns:auto 1fr 190px;gap:8px;align-items:center;border-bottom:1px solid var(--line);padding:6px 0}
 #exb .exb-st select{margin:0}
 #exb .exb-ls{display:flex;flex-wrap:wrap;gap:6px 14px}
 #exb .exb-ls label{display:flex;align-items:center;font-size:13px}
 #exb .exb-warn{background:#fff6e0;border:1px solid #f0c060;color:#6a4a00;border-radius:10px;padding:8px 10px;margin:8px 0;font-size:13px;line-height:1.9}
 #exb .exb-ok{background:#e9f8ef;border:1px solid #8fd1a8;color:#14653a;border-radius:10px;padding:8px 10px;margin:8px 0;font-size:13px;line-height:1.9}
 #exb .exb-mx{border-collapse:collapse;width:100%;font-size:13px}
 #exb .exb-mx td,#exb .exb-mx th{border:1px solid var(--line);padding:4px;text-align:center}
 #exb .exb-mx input{margin:0;text-align:center}
 #exb .exb-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
 #exb .exb-seg button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:14px;padding:12px 6px;font:800 14px Vazirmatn,Tahoma,sans-serif;cursor:pointer;margin:0}
 #exb .exb-seg button.on{color:#fff;border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2))}
 #exb .exb-mb{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}#exb .exb-mb button{width:auto;flex:none;margin:0}#exb .exb-mb b{margin-right:auto;font-size:13px}
 #exb .exb-mq{display:flex;gap:8px;align-items:flex-start;padding:7px 2px;border-bottom:1px dashed var(--line);font-size:13px;line-height:1.8;cursor:pointer}
 #exb .exb-mq input{margin-top:6px}#exb .exb-mq .lvb{flex:none;color:#fff;border-radius:999px;padding:0 9px;font-size:11.5px;font-weight:800;line-height:22px;margin-top:2px}
 #exb .exb-mq small{color:var(--mut);white-space:nowrap}
 #exb .exb-un{display:grid;grid-template-columns:1fr 70px 70px 70px;gap:6px;align-items:center;border-bottom:1px solid var(--line);padding:5px 0;font-size:13px}
 #exb .exb-un input{margin:0}
 #exb .exb-pk{background:linear-gradient(135deg,rgba(99,102,241,.07),rgba(236,72,153,.06));border:1px solid var(--line);border-radius:16px;padding:12px 12px 4px;margin:10px 0}
 #exb .exb-pkh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
 #exb .exb-chip{display:inline-block;background:var(--card,#fff);border:1px solid var(--line);color:var(--p);border-radius:999px;padding:2px 12px;font-size:12px;font-weight:800}
 #exb .exb-chip:empty{display:none}
 #exb .exb-pk label{font-size:12.5px;font-weight:800;color:var(--mut)}
 #exb .exb-pk select{border-radius:12px;padding:9px 10px;font-size:13px;background:var(--card,#fff)}
 #exb .exb-pk select:disabled{opacity:.55}
 #exb details.exb-acc{border:1px solid var(--line);border-radius:14px;background:var(--card,#fff);padding:0 12px;margin:8px 0}
 #exb details.exb-acc>summary{cursor:pointer;font-weight:800;font-size:13px;padding:11px 0;list-style:none;display:flex;align-items:center;justify-content:space-between}
 #exb details.exb-acc>summary::-webkit-details-marker{display:none}
 #exb details.exb-acc>summary::after{content:'⌄';font-size:18px;color:var(--p);transition:transform .2s}
 #exb details.exb-acc[open]>summary::after{transform:rotate(180deg)}
 #exb .exb-ls label{background:var(--card,#fff);border:1px solid var(--line);border-radius:999px;padding:5px 12px;cursor:pointer;transition:all .15s}
 #exb .exb-ls label:has(input:checked){background:linear-gradient(90deg,var(--p),var(--p2));color:#fff;border-color:transparent}
 #exb .exb-ls label:has(input:checked) small{color:#fff!important}
 #exb #exbMl{display:flex;flex-direction:column;gap:10px;margin-top:6px}
 #exb .exb-ag{border:1px solid var(--line);border-radius:16px;background:var(--card,#fff);overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.04);transition:box-shadow .2s,border-color .2s}
 #exb .exb-ag.open{border-color:var(--p);box-shadow:0 4px 14px rgba(99,102,241,.14)}
 #exb .exb-agh{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;user-select:none;font-weight:800;font-size:13.5px}
 #exb .exb-agh .ttl{flex:1;min-width:0}
 #exb .exb-agh .cnt{flex:none;background:rgba(99,102,241,.1);color:var(--p);border-radius:999px;padding:2px 11px;font-size:12px;font-weight:800;white-space:nowrap}
 #exb .exb-ag.has .cnt{background:linear-gradient(90deg,var(--p),var(--p2));color:#fff}
 #exb .exb-agh .chev{flex:none;font-size:18px;color:var(--p);transition:transform .25s}
 #exb .exb-ag.open .chev{transform:rotate(180deg)}
 #exb .exb-agh input{margin:0;width:18px;height:18px;flex:none}
 #exb .exb-agb{border-top:1px solid var(--line);padding:2px 12px 6px;animation:exbDrop .22s ease}
 @keyframes exbDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
 #exbOv{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none;flex-direction:column}
 #exbOv.on{display:flex}
 #exbOv .exb-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:var(--card,#fff);padding:10px 12px}
 #exbOv .exb-bar span{flex:1 1 240px;font-size:13px}
 #exbOv .exb-bar button{width:auto;flex:none;margin:0;padding:8px 16px;font-size:14px}
 #exbOv iframe{flex:1;border:0;background:#777;width:100%}
   #exb .exb-fbh{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
  #exb .exb-fbh button{width:auto;margin:0}
  #exb .exb-fbg{margin:10px 0 2px;font-size:13px;font-weight:800;color:var(--p)}
  #exb .exb-fbr{display:flex;align-items:flex-start;gap:6px;padding:4px 2px;border-bottom:1px dashed var(--line);font-size:13.5px;line-height:1.9}
  #exb .exb-fbr label{display:flex;gap:8px;align-items:flex-start;flex:1;cursor:pointer;margin:0;font-weight:400;font-size:13.5px;color:var(--tx)}
  #exb .exb-fbr label:has(input:checked){color:var(--p);font-weight:700}
  #exb .exb-fbr input[type=checkbox]{width:18px;height:18px;flex:none;margin:6px 0 0}
  #exb .exb-fbr small{display:inline-block;margin-right:6px;color:var(--mut);font-size:11px;font-weight:400;background:rgba(99,102,241,.08);border-radius:999px;padding:0 8px;line-height:20px}
  #exb .exb-fbga{display:flex;gap:6px;align-items:center;margin:8px 0}#exb .exb-fbga input{margin:0}#exb .exb-fbga button{width:auto;flex:none;margin:0}
  #exb .exb-fba{flex:none;display:flex;gap:4px}
  #exb .exb-fba button{width:auto;margin:0;padding:3px 9px}
  #exb details.exb-fbs{border:1px solid var(--line);border-radius:14px;background:var(--card,#fff);padding:0 12px;margin:8px 0}
  #exb details.exb-fbs>summary{cursor:pointer;font-weight:800;font-size:13px;padding:10px 0;color:var(--p)}
@media print{#exh,#exb,#exbOv{display:none!important}}
 `;document.head.appendChild(st);

 /* ---------- صفحه‌ی اصلی: دو اقدام واضح ---------- */
 const hub=document.createElement('section');hub.id='exh';
 hub.innerHTML=`<h2>🧪 آزمون‌ساز</h2><div class="card"><p class="sub" style="text-align:right;margin:0 0 4px">سؤال‌ها را یک بار در بانک ذخیره کنید؛ بعد در چند ثانیه برای هر دانش‌آموز برگه‌ی متناسب بسازید و چاپ کنید.</p>
 <div class="exh-btns"><button class="big" type="button" data-exh="qbk">🗂️<br>بانک سؤال‌های من</button><button class="big" type="button" data-exh="exb">📝<br>ساخت برگه‌ی امتحانی</button></div>
 <button class="sm" type="button" data-exh="qimp" style="width:100%">📥 ورود سؤال‌ها از فایل یا متن (PDF، Word، TXT)</button>
 <p class="sub" id="exhCnt" style="text-align:right;margin:10px 0 0"></p></div>`;
 const main=document.querySelector('main');(main||document.body).appendChild(hub);
 hub.addEventListener('click',e=>{const b=e.target.closest('[data-exh]');if(b)show(b.dataset.exh)});
 const hubCnt=()=>{const n=bank().length;$('exhCnt').textContent=n?`در بانک الان ${F(n)} سؤال ذخیره است.`:'هنوز سؤالی در بانک نیست. از «بانک سؤال‌های من» یا «ورود سؤال‌ها از فایل» شروع کنید.'};

 /* ---------- صفحه‌ی ساخت برگه ---------- */
 const sec=document.createElement('section');sec.id='exb';
 sec.innerHTML=`<h2>📝 ساخت برگه‌ی امتحانی</h2>
 <div class="card"><b>۱. محدوده‌ی امتحان</b><p class="exb-n">فقط از سؤال‌های همین محدوده انتخاب می‌شود. هر فیلتری را که لازم ندارید خالی بگذارید.</p>
  <div class="exb-g"><div id="exbGw" hidden><label>پایه</label><select id="exbGr"></select></div><div><label>کتاب / درس</label><select id="exbBk"></select></div><div><label>مبحث (اختیاری)</label><select id="exbTp"></select></div></div>
  <div class="exb-pk"><div class="exb-pkh"><b>📚 درس و صفحه</b><span class="exb-chip" id="exbPkSum"></span></div>
   <div class="exb-seg" id="exbRm"><button type="button" data-rm="lesson" class="on">📖 بر اساس درس</button><button type="button" data-rm="page">📄 بر اساس صفحه</button></div>
   <p class="exb-n" id="exbPkN" style="margin:0 0 6px"></p>
   <div class="exb-g"><div id="exbWLf"><label>از درس</label><select id="exbLf"></select></div><div id="exbWLt"><label>تا درس</label><select id="exbLt"></select></div><div id="exbWPf" hidden><label>از صفحه</label><select id="exbPf"></select></div><div id="exbWPt" hidden><label>تا صفحه</label><select id="exbPt"></select></div></div></div>
  <details class="exb-acc" id="exbLsD"><summary>✋ یا درس‌ها را جداگانه انتخاب می‌کنم (مثلاً ۱ و ۳ و ۵)</summary><p class="exb-n">اگر اینجا درسی انتخاب شود، «از/تا درس» نادیده گرفته می‌شود.</p><div class="exb-ls" id="exbLs" style="padding-bottom:10px"></div></details>
  <label style="display:flex;align-items:center;margin-top:8px"><input type="checkbox" id="exbUnk"> سؤال‌هایی که شماره‌ی درس یا صفحه‌شان ثبت نشده هم در نظر گرفته شوند (به مسئولیت خودم)</label>
  <div id="exbSum"></div><div id="exbUnList"></div></div>
 <div class="card"><b>۲. انتخاب سؤال‌ها</b>
  <div class="exb-seg" id="exbMode"><button type="button" data-mode="auto" class="on">🎲 تصادفی و هوشمند</button><button type="button" data-mode="manual">✋ انتخاب دلخواه</button></div>
  <p class="exb-n" id="exbModeN"></p>
  <div id="exbManual" hidden>
   <input id="exbMs" placeholder="🔎 جستجو در سؤال‌های همین محدوده…" autocomplete="off">
   <div class="exb-mb"><button class="sm" type="button" id="exbMall">✔ انتخاب همه‌ی نمایش‌داده‌شده‌ها</button><button class="sm" type="button" id="exbMnone">✖ لغو همه‌ی انتخاب‌ها</button><button class="sm" type="button" id="exbMopen">⤢ باز کردن همه‌ی درس‌ها</button><button class="sm" type="button" id="exbMclose">⤡ بستن همه</button><b id="exbMc"></b></div>
   <div id="exbMl"></div>
   <label style="display:flex;align-items:center;margin-top:8px"><input type="checkbox" id="exbMfill"> اگر تعداد سؤال‌های انتخابی کمتر از «تعداد سؤال هر برگه» بود، بقیه به‌صورت تصادفی (متناسب با سطح هر دانش‌آموز) تکمیل شود</label>
  </div></div>
 <div class="card"><b>۳. دانش‌آموزان</b><p class="exb-n">سطح هر دانش‌آموز «در هر درس» را بعد از ارزشیابی آغازین شما ثبت می‌کنید؛ از آن به بعد، با ثبت نمره‌ی آزمون‌های بعدی همان درس، برنامه خودکار سطح را به‌روز می‌کند (هر وقت خواستید می‌توانید دستی اصلاح کنید). اگر هیچ‌کس را تیک نزنید، یک برگه‌ی عمومی ساخته می‌شود.</p>
  <div class="exb-g"><div><label>سطح برگه‌ی عمومی</label><select id="exbGenLv">${C.STUDENT_LEVELS.map(l=>`<option value="${l.k}" ${l.k==='m'?'selected':''}>${l.label}</option>`).join('')}</select></div></div>
  <div style="display:flex;gap:8px;margin:6px 0"><button class="sm" type="button" id="exbAll">انتخاب همه</button><button class="sm" type="button" id="exbNone">لغو انتخاب‌ها</button></div><div id="exbStu"></div></div>
 <div class="card"><b>۴. مشخصات برگه</b>
  <p class="exb-n">شعار، نام مدرسه، لوگو، نام آموزگار و نام درس خودکار از «اطلاعات مدرسه و پایه» و محدوده‌ی انتخابی خوانده می‌شود. شعار را هم همان‌جا می‌نویسید.</p>
  <div class="exb-g"><div><label>نوع آزمون</label><select id="exbType">${TYPES.map(t=>`<option value="${E(t)}">${E(t||'فقط عنوان دلخواه (بدون نوع)')}</option>`).join('')}</select></div><div><label>توضیح تکمیلی (اختیاری)</label><input id="exbTitle" placeholder="مثلاً ورودی سوم به چهارم"></div><div><label>تعداد سؤال هر برگه</label><input id="exbCount" inputmode="numeric" value="10"></div><div><label>تاریخ (اختیاری)</label><input id="exbDate" placeholder="خالی = جای نوشتن"></div></div>
  <label style="display:flex;align-items:center"><input type="checkbox" id="exbSame"> سؤال‌های همه‌ی دانش‌آموزان انتخاب‌شده یکسان باشد (مثل ارزشیابی آغازین؛ سطح سؤال‌ها از «سطح برگه‌ی عمومی» در بخش ۲ تعیین می‌شود و فقط نام دانش‌آموز فرق می‌کند)</label>
  <label style="display:flex;align-items:center"><input type="checkbox" id="exbMeta"> زیر عنوان، «محدوده‌ی امتحان و تاریخ» هم نوشته شود</label>
  <label style="display:flex;align-items:center"><input type="checkbox" id="exbFb" checked> کادر «بازخورد آموزگار» و جدول انتظارات (خیلی خوب / خوب / قابل قبول / نیاز به تلاش دارد)</label>
  <label>پاسخ سؤال‌ها در چاپ</label><select id="exbAns"><option value="none">بدون پاسخ (برگه‌ی دانش‌آموز)</option><option value="sep">پاسخ‌نامه در صفحه‌ی جدا، بعد از هر برگه (برای آموزگار)</option><option value="inline">پاسخ زیر هر سؤال (نسخه‌ی آموزگار)</option></select>
  <div id="exbFbW" class="exb-fbw">
   <label style="font-weight:800">📋 انتظارات جدول بازخورد <small style="font-weight:400;color:var(--mut)">(تیک بزنید؛ برای هر درس و هر نوع آزمون جدا ذخیره می‌شود)</small></label>
   <div class="exb-fbh"><span class="exb-chip" id="exbFbCnt"></span><button class="sm" type="button" id="exbFbClr">✖ برداشتن همه‌ی تیک‌ها</button></div>
   <div id="exbFbL"></div>
   <details class="exb-acc" id="exbFbD"><summary>➕ افزودن متن جدید به فهرست من</summary>
    <input id="exbFbNew" maxlength="200" placeholder="مثلاً: مسئله‌های کلامی را درست تحلیل می‌کند." autocomplete="off">
    <div class="exb-g"><div><label>ذخیره برای کدام درس؟</label><select id="exbFbSc"></select></div><div><label>ذخیره برای کدام آزمون؟</label><select id="exbFbTy"></select></div></div>
    <div class="exb-mb"><button class="sm" type="button" id="exbFbAdd">➕ افزودن</button><button class="sm" type="button" id="exbFbCan" hidden>انصراف</button></div>
    <p class="exb-n" id="exbFbMsg" style="margin:0 0 8px"></p></details>
   <label>✍️ متن دلخواه فقط برای همین برگه (هر خط یک مورد)</label><textarea id="exbFbRows" rows="3" placeholder="هر خط یک مورد؛ مثلاً: زمان جمله‌ها را کاملاً مسلط است."></textarea>
   <div class="exb-mb"><button class="sm" type="button" id="exbFbSaveMan">💾 ذخیره‌ی خطوط بالا در فهرست من</button></div>
   <p class="exb-n">اگر هیچ موردی تیک نخورد و چیزی هم نوشته نشود، سه ردیف خالی برای نوشتن دستی چاپ می‌شود.</p>
  </div>
  <details><summary>ترکیب سطح سؤال‌ها برای ۱۰ سؤال (قابل تنظیم)</summary><p class="exb-n">برای تعداد دیگر، نسبت‌ها خودکار مقیاس می‌شوند.</p><table class="exb-mx" id="exbMix"></table><button class="sm" type="button" id="exbMixReset" style="margin-top:6px">بازگشت به پیش‌فرض</button></details></div>
 <button class="big" type="button" id="exbGo" style="margin:6px 0 12px">👁️ ساخت برگه و پیش‌نمایش</button>
 <div id="exbRep"></div>`;
 (main||document.body).appendChild(sec);

 const ov=document.createElement('div');ov.id='exbOv';
 ov.innerHTML=`<div class="exb-bar"><span id="exbOvT"></span><button class="big" type="button" id="exbPrint">🖨️ چاپ / ذخیره به‌صورت PDF</button><button class="sm" type="button" id="exbAgain">🎲 سؤال‌های تصادفی جدید</button><button class="sm" type="button" id="exbClose">✖ بستن</button></div><iframe id="exbFr" title="پیش‌نمایش برگه"></iframe>`;
 document.body.appendChild(ov);

 if(typeof pages!=='undefined'){[['exh','🧪 آزمون‌ساز'],['exb','📝 ساخت برگه‌ی امتحانی']].forEach(p=>{if(!pages.some(x=>x[0]===p[0]))pages.push(p)})}
 if(typeof nav!=='undefined'&&!nav.querySelector('[data-p="exh"]')){const b=document.createElement('button');b.textContent='🧪 آزمون‌ساز';b.dataset.p='exh';b.onclick=()=>show('exh');nav.appendChild(b)}

 /* ---------- پر کردن گزینه‌ها ---------- */
 const uniq=a=>[...new Set(a.filter(x=>x!==''&&x!=null))];
 const opt=(v,t,sel)=>`<option value="${E(v)}"${sel?' selected':''}>${E(t)}</option>`;
 function curGrade(){return grade()||(($('exbGr')||{}).value||'')}
 function baseBank(){const g=curGrade();return bank().filter(q=>!g||q.gr===g)}
 function fillScope(){
  const g=grade();$('exbGw').hidden=!!g;
  if(!g){const old=$('exbGr').value,gs=uniq(bank().map(q=>q.gr));$('exbGr').innerHTML=opt('','انتخاب پایه',false)+gs.map(x=>opt(x,'پایه '+x,x===old)).join('')}
  const bb=baseBank(),oldB=$('exbBk').value,books=uniq(bb.map(q=>q.bk)).sort((a,b)=>a.localeCompare(b,'fa'));
  $('exbBk').innerHTML=opt('','انتخاب کتاب / درس',false)+books.map(x=>opt(x,x,x===oldB)).join('');
  if(oldB&&!books.includes(oldB))$('exbBk').value='';
  const bk=$('exbBk').value,inBk=bb.filter(q=>q.bk===bk),oldT=$('exbTp').value,tps=uniq(inBk.map(q=>q.tp));
  $('exbTp').innerHTML=opt('','همه‌ی مبحث‌ها',false)+tps.map(x=>opt(x,x,x===oldT)).join('');
  if(oldT&&!tps.includes(oldT))$('exbTp').value='';
  const checked=new Set(Array.from(sec.querySelectorAll('[data-ln]:checked')).map(x=>x.dataset.ln));
  const lns=uniq(inBk.map(q=>C.toNum(q.ln))).sort((a,b)=>a-b);
  fillRange();
  $('exbLs').innerHTML=lns.length?lns.map(n=>`<label><input type="checkbox" data-ln="${n}" ${checked.has(String(n))?'checked':''}>درس ${F(n)} <small style="color:var(--mut);margin-right:4px">(${F(inBk.filter(q=>C.toNum(q.ln)===n).length)} سؤال)</small></label>`).join(''):'<span class="exb-n">برای این کتاب هنوز شماره‌ی درسی روی سؤال‌ها ثبت نشده است.</span>';
 }
 let rmode='lesson';
 function fillRange(){
  const bk=$('exbBk').value,tp=$('exbTp').value,lf=$('exbLf'),lt=$('exbLt'),pf=$('exbPf'),pt=$('exbPt'),LM=rmode==='lesson';
  const inBk=baseBank().filter(q=>q.bk===bk&&(!tp||q.tp===tp));
  const lm=new Map();inBk.forEach(q=>{const n=C.toNum(q.ln);if(n==null)return;const o=lm.get(n)||{t:'',c:0};if(!o.t&&q.ls)o.t=q.ls;o.c++;lm.set(n,o)});
  const lns=[...lm.keys()].sort((a,b)=>a-b),lbl=n=>{const o=lm.get(n);return 'درس '+F(n)+(o.t?' — '+o.t:'')+' ('+F(o.c)+' سؤال)'};
  const man=!!sec.querySelector('[data-ln]:checked');
  /* دکمه‌های نوع محدوده و نمایش فقط فیلدهای همان نوع */
  sec.querySelectorAll('#exbRm [data-rm]').forEach(b=>b.classList.toggle('on',b.dataset.rm===rmode));
  $('exbWLf').hidden=$('exbWLt').hidden=!LM;$('exbWPf').hidden=$('exbWPt').hidden=LM;$('exbLsD').hidden=!LM;
  /* --- حالت درس --- */
  let a=null,b=null,endSel=false;
  if(LM){
   a=lf.value===''?null:+lf.value;if(a!=null&&!lm.has(a))a=null;
   if(lt.value==='end')endSel=a!=null;else if(lt.value!==''){b=+lt.value;if(!lm.has(b)||(a!=null&&b<=a))b=null}
   lf.innerHTML=opt('',lns.length?'همه‌ی درس‌ها':(bk?'درسی ثبت نشده':'ابتدا کتاب را انتخاب کنید'),false)+lns.map(n=>opt(n,lbl(n),n===a)).join('');
   lt.innerHTML=opt('',a!=null?'همان درس (فقط درس '+F(a)+')':(lns.length?'تا آخرین درس':(bk?'درسی ثبت نشده':'—')),false)+(a!=null?opt('end','تا آخر کتاب',endSel):'')+lns.filter(n=>a==null||n>a).map(n=>opt(n,lbl(n),n===b)).join('');
   lf.value=a==null?'':String(a);lt.value=endSel?'end':(b==null?'':String(b));
   lf.disabled=lt.disabled=!lns.length||man;
   pf.innerHTML=pt.innerHTML=opt('','',false);
  }else{
   lf.innerHTML=lt.innerHTML=opt('','',false);
  }
  /* --- حالت صفحه (درس‌ها نادیده‌اند) --- */
  if(!LM){
   const ov=[pf.value,pt.value].map(v=>v===''?null:+v);
   const pgs=[...new Set(inBk.flatMap(q=>[q.p1,q.p2]).map(x=>C.toNum(x)).filter(x=>x!=null&&x>0))].sort((x,y)=>x-y);
   let c=ov[0],d=ov[1];if(c!=null&&!pgs.includes(c))c=null;if(d!=null&&!pgs.includes(d))d=null;if(c!=null&&d!=null&&d<c)d=null;
   pf.innerHTML=opt('',pgs.length?'از اولین صفحه':(bk?'صفحه‌ای ثبت نشده':'ابتدا کتاب را انتخاب کنید'),false)+pgs.map(n=>opt(n,'صفحه‌ی '+F(n),n===c)).join('');
   pt.innerHTML=opt('',pgs.length?'تا آخرین صفحه':(bk?'صفحه‌ای ثبت نشده':'—'),false)+pgs.filter(n=>c==null||n>=c).map(n=>opt(n,'صفحه‌ی '+F(n),n===d)).join('');
   pf.value=c==null?'':String(c);pt.value=d==null?'':String(d);
   pf.disabled=pt.disabled=!pgs.length;
  }
  $('exbPkN').textContent=LM?(man?'درس‌ها را دستی انتخاب کرده‌اید؛ «از/تا درس» فعلاً غیرفعال است.':'اگر فقط «از درس» را انتخاب کنید، همان یک درس امتحان می‌شود. برای چند درس، «تا درس» را هم انتخاب کنید.'):'امتحان بر اساس صفحه‌ی کتاب است؛ درس‌ها در این حالت نادیده گرفته می‌شوند. خالی = همه‌ی صفحه‌ها.';
 }
 function setRm(m){
  rmode=m==='page'?'page':'lesson';
  if(rmode==='page'){$('exbLf').value='';$('exbLt').value='';sec.querySelectorAll('[data-ln]:checked').forEach(x=>x.checked=false)}
  else{$('exbPf').value='';$('exbPt').value=''}
  fillRange();renderSummary();
 }
 function students(){return Array.isArray(S.students)?S.students:[]}
 function fillStudents(){
  const keep=new Set(Array.from(sec.querySelectorAll('[data-sc]:checked')).map(x=>x.dataset.sc));
  const ss=students(),bk=$('exbBk').value;
  $('exbStu').innerHTML=ss.length?ss.map(s=>{const R=bk?lvFor(s,bk):{key:'m',src:'none'},lab=(C.STUDENT_LEVELS.find(l=>l.k===R.key)||{}).label;
   const note=!bk?'':R.src==='auto'?`<small class="exb-n"> · خودکار: ${lab} (میانگین ${F(R.n)} آزمون اخیر)</small>`:R.src==='manual'?`<small class="exb-n"> · ثبت معلم: ${lab}</small>`:'<small class="exb-n"> · سطح ثبت نشده (متوسط)</small>';
   return `<div class="exb-st"><input type="checkbox" data-sc="${E(s.id)}" ${keep.has(String(s.id))?'checked':''}><span>${E(s.name||('دانش‌آموز '+s.id))}${note}</span><select data-sl="${E(s.id)}" ${bk?'':'disabled'}><option value="">${bk?'تعیین سطح (ارزشیابی آغازین)':'ابتدا کتاب را انتخاب کنید'}</option>${C.STUDENT_LEVELS.map(l=>`<option value="${l.k}" ${R.src!=='none'&&R.key===l.k?'selected':''}>${l.label}</option>`).join('')}</select></div>`}).join(''):'<p class="exb-n">فهرست دانش‌آموزان این کلاس خالی است؛ برگه‌ی عمومی ساخته می‌شود.</p>';
 }
 function fillMix(){
  const m=Object.assign(DEF_MIX(),cfg().mix||{});
  $('exbMix').innerHTML=`<tr><th>سطح دانش‌آموز</th><th>آسان</th><th>متوسط</th><th>سخت</th></tr>`+C.STUDENT_LEVELS.map(l=>`<tr><td>${l.label}</td>${['e','m','h'].map(k=>`<td><input inputmode="numeric" data-mx="${l.k}${k}" value="${F((m[l.k]||{})[k]||0)}"></td>`).join('')}</tr>`).join('');
 }
 function readMix(){
  const out={};
  for(const l of C.STUDENT_LEVELS){out[l.k]={};for(const k of ['e','m','h']){const el=sec.querySelector(`[data-mx="${l.k}${k}"]`);const v=C.toNum(el&&el.value);out[l.k][k]=v==null?0:v}
   if(out[l.k].e+out[l.k].m+out[l.k].h<=0)return {err:`ترکیب «${l.label}» نباید همه صفر باشد.`}}
  return {mix:out};
 }

 /* ---------- خواندن محدوده‌ی فرم ---------- */
 function numField(id,label){const t=($(id).value||'').trim();if(!t)return{v:null};const n=C.toNum(t);if(n==null||n<=0)return{err:`«${label}» باید عدد صحیح مثبت باشد.`};return{v:n}}
 function readScope(){
  const g=curGrade(),bk=$('exbBk').value;
  if(!g)return{err:'پایه را انتخاب کنید.'};
  if(!bk)return{err:'کتاب / درس را انتخاب کنید.'};
  let lf={v:null},lt={v:null},pf={v:null},pt={v:null};
  if(rmode==='lesson'){
   lf=numField('exbLf','از درس');if(lf.err)return{err:lf.err};
   const raw=$('exbLt').value;
   if(raw==='end')lt={v:null};else if(raw===''&&lf.v!=null)lt={v:lf.v};else{lt=numField('exbLt','تا درس');if(lt.err)return{err:lt.err}}
  }else{
   pf=numField('exbPf','از صفحه');pt=numField('exbPt','تا صفحه');
   for(const r of [pf,pt])if(r.err)return{err:r.err};
  }
  if(lf.v!=null&&lt.v!=null&&lt.v<lf.v)return{err:'«تا درس» نباید کوچک‌تر از «از درس» باشد.'};
  if(pf.v!=null&&pt.v!=null&&pt.v<pf.v)return{err:'«تا صفحه» نباید کوچک‌تر از «از صفحه» باشد.'};
  const lessons=rmode==='lesson'?Array.from(sec.querySelectorAll('[data-ln]:checked')).map(x=>+x.dataset.ln):[];
  return{scope:{gr:g,bk,topic:$('exbTp').value||'',lessonFrom:lessons.length?null:lf.v,lessonTo:lessons.length?null:lt.v,lessons,pageFrom:pf.v,pageTo:pt.v}};
 }
 function scopeText(sc){
  const a=[];
  if(sc.lessons&&sc.lessons.length)a.push('درس‌های '+sc.lessons.map(F).join('، '));
  else if(sc.lessonFrom!=null||sc.lessonTo!=null)a.push(sc.lessonFrom!=null&&sc.lessonTo!=null?(sc.lessonFrom===sc.lessonTo?'درس '+F(sc.lessonFrom):'درس '+F(sc.lessonFrom)+' تا '+F(sc.lessonTo)):sc.lessonFrom!=null?'از درس '+F(sc.lessonFrom):'تا درس '+F(sc.lessonTo));
  if(sc.pageFrom!=null||sc.pageTo!=null)a.push(sc.pageFrom!=null&&sc.pageTo!=null?'صفحه‌ی '+F(sc.pageFrom)+' تا '+F(sc.pageTo):sc.pageFrom!=null?'از صفحه‌ی '+F(sc.pageFrom):'تا صفحه‌ی '+F(sc.pageTo));
  if(sc.topic)a.push('مبحث: '+sc.topic);
  return a.join(' | ');
 }

 /* ---------- خلاصه‌ی زنده‌ی محدوده + تکمیل شماره‌ی درس/صفحه با تأیید معلم ---------- */
 function renderSummary0(){
  const r=readScope(),box=$('exbSum'),un=$('exbUnList');un.innerHTML='';
  if(r.err){box.innerHTML=`<p class="exb-n">${E(r.err==='پایه را انتخاب کنید.'||r.err==='کتاب / درس را انتخاب کنید.'?'ابتدا کتاب / درس را انتخاب کنید تا تعداد سؤال‌های محدوده نمایش داده شود.':r.err)}</p>`;return}
  const f=C.filterScope(bank(),r.scope),n={e:0,m:0,h:0};f.inside.forEach(q=>{if(n[q.lv]!=null)n[q.lv]++});
  box.innerHTML=`<div class="${f.inside.length?'exb-ok':'exb-warn'}">در این محدوده <b>${F(f.inside.length)}</b> سؤال هست (آسان ${F(n.e)}، متوسط ${F(n.m)}، سخت ${F(n.h)}).</div>`+
   (f.unknown.length?`<div class="exb-warn">${F(f.unknown.length)} سؤال این کتاب شماره‌ی درس یا صفحه ندارند، برای همین در این محدوده حساب نشدند (حدس نمی‌زنیم). می‌توانید پایین شماره‌شان را وارد کنید، یا بالا تیک «در نظر گرفته شوند» را بزنید.</div>`:'');
  if(f.unknown.length){
   const shown=f.unknown.slice(0,40);
   un.innerHTML=`<details><summary>ثبت شماره‌ی درس و صفحه برای ${F(f.unknown.length)} سؤال</summary><p class="exb-n">فقط مواردی را پر کنید که مطمئنید. خانه‌های خالی بدون تغییر می‌مانند.${f.unknown.length>shown.length?' (۴۰ سؤال اول نمایش داده شده؛ بعد از ذخیره، بقیه نمایش داده می‌شوند.)':''}</p>`+
    shown.map(q=>`<div class="exb-un" data-uq="${E(q.id)}"><span>${E(String(q.q).slice(0,90))}</span><input data-u="ln" inputmode="numeric" placeholder="درس" value="${E(q.ln==null?'':q.ln)}"><input data-u="p1" inputmode="numeric" placeholder="از ص" value="${E(q.p1==null?'':q.p1)}"><input data-u="p2" inputmode="numeric" placeholder="تا ص" value="${E(q.p2==null?'':q.p2)}"></div>`).join('')+
    `<button class="sm" type="button" id="exbUnSave" style="margin-top:8px">💾 ذخیره‌ی شماره‌ها</button><span class="exb-n" id="exbUnMsg"></span></details>`;
  }
 }
 /* ---------- انتخاب دلخواه سؤال‌ها ---------- */
 let mode='auto';const selSet=new Set();
 const LVC={e:'#1a8f55',m:'#f0a030',h:'#d9534f'};
 function manualPool(){const r=readScope();if(r.err)return null;const f=C.filterScope(bank(),r.scope);return f.inside.concat($('exbUnk').checked?f.unknown:[])}
 function sortQ(a,b){const la=C.toNum(a.ln),lb=C.toNum(b.ln);return (la==null?9999:la)-(lb==null?9999:lb)||(a.p1==null?9999:a.p1)-(b.p1==null?9999:b.p1)||(a.ca||a.id)-(b.ca||b.id)}
 function visibleManual(pool){const t=(($('exbMs')||{}).value||'').trim();return pool.filter(q=>!t||[q.q,q.ans,q.tp,q.ls].join(' ').indexOf(t)>=0).sort(sortQ)}
 function manualCount(){const pool=manualPool()||[],ids=new Set(pool.map(q=>String(q.id)));let n=0;selSet.forEach(i=>{if(ids.has(i))n++});const el=$('exbMc');if(el)el.textContent=n?`${F(n)} سؤال انتخاب شده`:'هنوز سؤالی انتخاب نشده'}
 function setMode(m){mode=m==='manual'?'manual':'auto';sec.querySelectorAll('#exbMode [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode));$('exbManual').hidden=mode!=='manual';
  $('exbModeN').textContent=mode==='manual'?'سؤال‌های دلخواه را تیک بزنید؛ همان سؤال‌ها (به ترتیب درس و صفحه) روی برگه‌ی همه‌ی دانش‌آموزان انتخاب‌شده می‌آید. بدون تیک تکمیل خودکار، «تعداد سؤال هر برگه» نادیده گرفته می‌شود.':'برنامه از میان سؤال‌های محدوده، برای هر دانش‌آموز متناسب با سطح خودش به‌صورت تصادفی انتخاب می‌کند.';
  if(mode==='manual')renderManual()}
 const openG=new Set();let gInit=false;
 const gKey=q=>{const ln=C.toNum(q.ln);return ln!=null?'L'+ln:'U'+(q.ls||'')};
 function updGroup(k){
  const g=Array.from(sec.querySelectorAll('.exb-ag')).find(x=>x.dataset.g===k);if(!g)return;
  const cb=Array.from(g.querySelectorAll('[data-mq]')),n=cb.filter(x=>x.checked).length,al=g.querySelector('[data-gall]');
  g.querySelector('.cnt').textContent=n?F(n)+' از '+F(cb.length)+' انتخاب':F(cb.length)+' سؤال';
  g.classList.toggle('has',n>0);if(al){al.checked=n>0&&n===cb.length;al.indeterminate=n>0&&n<cb.length}
 }
 function renderManual(){
  const box=$('exbMl');if(!box||mode!=='manual')return;
  const pool=manualPool();
  if(!pool){box.innerHTML='<p class="exb-n">ابتدا در بخش ۱ کتاب / درس را انتخاب کنید.</p>';manualCount();return}
  const vis=visibleManual(pool);
  if(!vis.length){box.innerHTML='<p class="exb-n">سؤالی در این محدوده پیدا نشد.</p>';manualCount();return}
  const gs=[],ix={};
  vis.forEach(q=>{const k=gKey(q);if(!ix[k]){const ln=C.toNum(q.ln);ix[k]={k,h:ln!=null?'درس '+F(ln)+(q.ls?' — '+q.ls:''):(q.ls||'بدون شماره‌ی درس'),items:[]};gs.push(ix[k])}ix[k].items.push(q)});
  const searching=!!(($('exbMs')||{}).value||'').trim();
  if(!gInit&&gs.length){openG.add(gs[0].k);gInit=true}
  box.innerHTML=gs.map(g=>{const op=searching||openG.has(g.k);
   return `<div class="exb-ag${op?' open':''}" data-g="${E(g.k)}"><div class="exb-agh" data-gt="${E(g.k)}"><input type="checkbox" data-gall="${E(g.k)}" title="انتخاب همه‌ی سؤال‌های این درس"><span class="ttl">${E(g.h)}</span><span class="cnt"></span><span class="chev">⌄</span></div><div class="exb-agb"${op?'':' hidden'}>`+
   g.items.map(q=>{const pg=q.p1!=null?(q.p2!=null&&q.p2!==q.p1?'ص '+F(q.p1)+'–'+F(q.p2):'ص '+F(q.p1)):'';
    return `<label class="exb-mq"><input type="checkbox" data-mq="${E(q.id)}" ${selSet.has(String(q.id))?'checked':''}><span class="lvb" style="background:${LVC[q.lv]||'#888'}">${LVN[q.lv]||'—'}</span><span style="flex:1">${E(String(q.q).slice(0,160))}</span><small>${pg}</small></label>`}).join('')+`</div></div>`}).join('');
  gs.forEach(g=>updGroup(g.k));manualCount()}
 function renderSummary(){renderSummary0();renderManual();try{const r=readScope(),c=$('exbPkSum');if(c)c.textContent=r.scope?(scopeText(r.scope)||'همه‌ی درس‌ها و صفحه‌ها'):''}catch(x){}}
 sec.addEventListener('click',e=>{
  const rb=e.target.closest('#exbRm [data-rm]');if(rb){setRm(rb.dataset.rm);return}
  const mb=e.target.closest('#exbMode [data-mode]');if(mb){setMode(mb.dataset.mode);return}
  if(e.target.id==='exbMall'){const pool=manualPool()||[];visibleManual(pool).forEach(q=>selSet.add(String(q.id)));renderManual();return}
  if(e.target.id==='exbMnone'){selSet.clear();renderManual();return}
  if(e.target.id==='exbMopen'){sec.querySelectorAll('.exb-ag').forEach(g=>openG.add(g.dataset.g));renderManual();return}
  if(e.target.id==='exbMclose'){openG.clear();gInit=true;renderManual();return}
  const gh=e.target.closest('[data-gt]');
  if(gh&&!e.target.closest('input')){const k=gh.dataset.gt,g=gh.parentElement,o=!g.classList.contains('open');g.classList.toggle('open',o);g.querySelector('.exb-agb').hidden=!o;if(o)openG.add(k);else openG.delete(k);return}
 });
 sec.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.mq!=null){if(t.checked)selSet.add(t.dataset.mq);else selSet.delete(t.dataset.mq);const g=t.closest('.exb-ag');if(g)updGroup(g.dataset.g);manualCount();return}
  if(t.dataset&&t.dataset.gall!=null){const g=t.closest('.exb-ag');g.querySelectorAll('[data-mq]').forEach(x=>{x.checked=t.checked;if(t.checked)selSet.add(x.dataset.mq);else selSet.delete(x.dataset.mq)});updGroup(g.dataset.g);manualCount()}});
 sec.addEventListener('input',e=>{if(e.target.id==='exbMs')renderManual()});
 sec.addEventListener('click',e=>{
  if(e.target.id!=='exbUnSave')return;
  const rows=Array.from(sec.querySelectorAll('[data-uq]')),byId=new Map(bank().map(q=>[String(q.id),q]));let changed=0,bad=false;
  const upd=[];
  rows.forEach(row=>{const q=byId.get(row.dataset.uq);if(!q)return;const g=k=>(row.querySelector(`[data-u="${k}"]`).value||'').trim();
   const ln=g('ln'),p1=g('p1'),p2=g('p2');if(!ln&&!p1&&!p2)return;
   const nl=ln?C.toNum(ln):null,n1=p1?C.toNum(p1):null,n2=p2?C.toNum(p2):null;
   if((ln&&(nl==null||nl<=0))||(p1&&(n1==null||n1<=0))||(p2&&(n2==null||n2<=0))||(p2&&!p1)||(n1!=null&&n2!=null&&n2<n1)){bad=true;return}
   upd.push([q,nl,n1,n2])});
  if(bad){$('exbUnMsg').textContent=' ⚠️ یکی از شماره‌ها معتبر نیست؛ چیزی ذخیره نشد.';return}
  upd.forEach(([q,nl,n1,n2])=>{if(nl!=null){q.ln=nl;changed++}if(n1!=null){q.p1=n1;q.p2=n2!=null?n2:n1}});
  if(!changed&&!upd.length){$('exbUnMsg').textContent=' چیزی برای ذخیره وارد نشده است.';return}
  save();renderSummary();QBK.render&&QBK.render();
 });

 /* ---------- ساخت برگه ---------- */
 function build(){
  const rs=readScope();if(rs.err)return {err:rs.err};
  const manual=mode==='manual',fill=manual&&$('exbMfill').checked;
  let cnt=C.toNum($('exbCount').value);
  if(!manual||fill){if(cnt==null||cnt<1||cnt>100)return {err:'تعداد سؤال باید عددی بین ۱ و ۱۰۰ باشد.'}}
  const rm=readMix();if(rm.err)return {err:rm.err};
  const f=C.filterScope(bank(),rs.scope),pool=f.inside.concat($('exbUnk').checked?f.unknown:[]);
  if(!pool.length)return {err:'در این محدوده سؤالی پیدا نشد. محدوده را بازتر کنید یا شماره‌ی درس/صفحه‌ی سؤال‌ها را ثبت کنید.'};
  let pinned=null;
  if(manual){pinned=pool.filter(q=>selSet.has(String(q.id))).sort(sortQ);
   if(!pinned.length)return {err:'در حالت «انتخاب دلخواه» دست‌کم یک سؤال را تیک بزنید.'};
   if(!fill)cnt=pinned.length}
  const lvc=qs=>{const a={e:0,m:0,h:0};qs.forEach(q=>{if(a[q.lv]!=null)a[q.lv]++});return a};
  const mk=key=>{
   if(!pinned)return C.pick(pool,C.mixFor(key,cnt,rm.mix));
   const rest=Math.max(0,cnt-pinned.length);
   if(!rest)return {questions:pinned.slice(),requested:cnt,actual:lvc(pinned),shortage:0,changedMix:false};
   const ids=new Set(pinned.map(q=>String(q.id))),r=C.pick(pool.filter(q=>!ids.has(String(q.id))),C.mixFor(key,rest,rm.mix)),qs=pinned.concat(r.questions);
   return {questions:qs,requested:cnt,actual:lvc(qs),shortage:r.shortage,changedMix:r.changedMix};
  };
  const picked=Array.from(sec.querySelectorAll('[data-sc]:checked')).map(x=>students().find(s=>String(s.id)===x.dataset.sc)).filter(Boolean);
  const genLv=$('exbGenLv').value||'m';
  const targets=picked.length?picked:[{id:0,name:'',qbkLevel:genLv,_general:true}];
  const same=$('exbSame').checked&&picked.length>0,shared=same||manual&&!fill?mk(genLv):null;
  const sheets=targets.map(s=>{
   if(shared)return {student:s,levelKey:genLv,levelKnown:true,levelSrc:'manual',want:C.mixFor(genLv,cnt,rm.mix),result:shared};
   const R=s._general?{key:genLv,src:'manual'}:lvFor(s,rs.scope.bk),key=R.key,want=C.mixFor(key,cnt,rm.mix),r=mk(key);
   return {student:s,levelKey:key,levelKnown:R.src!=='none',levelSrc:R.src,want,result:r};
  });
  return {sheets,ctx:{scope:rs.scope,scopeText:scopeText(rs.scope),count:cnt,unknownUsed:$('exbUnk').checked&&f.unknown.length>0,mix:rm.mix}};
 }
 function report(b){
  const lvl=k=>(C.STUDENT_LEVELS.find(l=>l.k===k)||{}).label;
  const rows=b.sheets.map(s=>{const r=s.result,nm=s.student._general?'برگه‌ی عمومی':(s.student.name||'—');
   const bad=r.shortage>0,chg=r.changedMix;
   return `<tr><td>${E(nm)}</td><td>${E(lvl(s.levelKey))}${s.levelKnown?(s.levelSrc==='auto'?' (خودکار)':''):' (پیش‌فرض)'}</td><td>${F(r.requested)}</td><td>${F(r.questions.length)}</td><td>${F(r.actual.e)}/${F(r.actual.m)}/${F(r.actual.h)}</td><td>${bad?'⚠️ کمبود '+F(r.shortage):(chg?'ترکیب تغییر کرد':'✔')}</td></tr>`}).join('');
  const anyShort=b.sheets.some(s=>s.result.shortage>0),anyChg=b.sheets.some(s=>s.result.changedMix);
  return `<div class="card"><b>گزارش ساخت</b>${anyShort?'<div class="exb-warn">⚠️ در این محدوده به اندازه‌ی کافی سؤال نبود؛ تعداد واقعی کمتر شد. برای تکمیل، سؤال از بیرون محدوده نیاورده‌ایم. محدوده را بازتر کنید یا سؤال بیشتری به بانک اضافه کنید.</div>':''}${!anyShort&&anyChg?'<div class="exb-warn">در بانک شما از بعضی سطح‌ها (آسان/متوسط/سخت) به اندازه‌ی لازم سؤال نبود؛ جای خالی را با سؤال‌های سطح‌های دیگرِ همین محدوده پر کردیم. تعداد واقعیِ هر سطح در ستون «آسان/متوسط/سخت» جدول زیر است.</div>':''}${b.ctx.unknownUsed?'<div class="exb-warn">سؤال‌های بدون شماره‌ی درس/صفحه هم به انتخاب شما در نظر گرفته شدند.</div>':''}
  <div style="overflow-x:auto"><table class="exb-mx"><tr><th>برگه برای</th><th>سطح</th><th>درخواست</th><th>ساخته شد</th><th>آسان/متوسط/سخت</th><th>وضعیت</th></tr>${rows}</table></div></div>`;
 }

 /* ---------- HTML برگه (A4، راست‌به‌چپ) ---------- */
 function ansText(q){
  const L=['الف','ب','ج','د'];
  if(q.ty==='tf')return q.ans==='T'?'صحیح':q.ans==='F'?'غلط':'';
  if(q.ty==='mc'){const o=Array.isArray(q.op)?q.op[q.ok]:null;if(o!=null&&o!=='')return (L[q.ok]||F(q.ok+1))+') '+o;return q.ans||''}
  return q.ans||'';
 }
 /* فضای پاسخ: تعداد خط‌ها به اندازه‌ی طول پاسخ ثبت‌شده در بانک است (دست‌خط دانش‌آموز بزرگ‌تر از متن تایپی است، پس هر خط حدود ۴۸ نویسه و ارتفاع هر خط ۳۴ پیکسل حساب می‌شود تا جای نوشتن کم نیاید).
    پاسخ ثبت نشده: تشریحی ۴ خط، بقیه ۲ خط. در برگه‌ی دانش‌آموز هیچ خط یا نقطه‌چینی چاپ نمی‌شود؛ فقط همان قدر جای خالی می‌ماند تا دانش‌آموز آزادانه بنویسد. در حالت «زیر هر سؤال» خط‌ها حذف می‌شوند و فقط خود پاسخ زیر سؤال چاپ می‌شود. */
 const LH=34,CPL=48;
 function wrLines(q,a){
  if(a)return Math.min(8,Math.max(1,String(a).split(/\n/).reduce((n,t)=>n+Math.max(1,Math.ceil(t.trim().length/CPL)),0)));
  return q.ty==='es'?4:2;
 }
 function writeArea(q,a,show){
  if(show)return `<div class="wa">${a?E(a):'<i class="na">پاسخ ثبت نشده</i>'}</div>`;
  const h=wrLines(q,a)*LH;return `<div class="wr" data-h="${h}" style="height:${h}px"></div>`;
 }
 function qBlock(q,i,showPts,showAns){
  const L=['الف','ب','ج','د'],a=ansText(q);let body=`<div class="qt"><span>${E(q.q)}</span>${showPts?`<span class="pt">(${F(q.pt||1)} نمره)</span>`:''}</div>`;
  if(q.ty==='mc'&&Array.isArray(q.op)&&q.op.length)body+=`<div class="op">${q.op.map((o,j)=>{const ok=showAns&&j===q.ok;return `<div${ok?' class="ok"':''}>${ok?'✔ ':''}${L[j]||F(j+1)}) ${E(o)}</div>`}).join('')}</div>`;
  else if(q.ty==='tf'){const t=showAns&&q.ans==='T',f=showAns&&q.ans==='F';body+=`<div class="tf"><span${t?' class="ok"':''}>صحیح ${t?'☒':'☐'}</span> &nbsp;&nbsp;&nbsp; <span${f?' class="ok"':''}>غلط ${f?'☒':'☐'}</span></div>`}
  else body+=writeArea(q,a,showAns);
  return `<tr class="qr"><td class="no">${F(i+1)}</td><td class="bd">${body}</td></tr>`;
 }
 function sheetHtml(sh,ctx,opts){
  const P=prof(),school=P.school&&typeof schoolFull==='function'?schoolFull(P):(P.school||''),teacher=P.teacher||'';
  const nm=sh.student._general?'':(sh.student.name||'');
  const logo=P.logo?`<img src="${E(P.logo)}" alt="">`:'';
  const rows=sh.result.questions.map((q,i)=>qBlock(q,i,opts.pts,opts.ans==='inline')).join('');
  const fbRows=(opts.fbRows.length?opts.fbRows:['','','']);
  const fb=opts.fb?`<table class="fb"><tr><th>انتظارات</th>${FBL.map(x=>`<th>${x}</th>`).join('')}</tr>${fbRows.map(t=>`<tr><td class="ex">${E(t)}</td>${FBL.map(()=>'<td></td>').join('')}</tr>`).join('')}</table>`:'';
  const note=opts.fb?'<div class="fbx">بازخورد آموزگار:</div>':'';
  const key=opts.ans==='sep'?keyHtml(sh,ctx,opts,nm):'';
  const sl=typeof schoolSlogan==='function'?schoolSlogan(P):'',sn=school.length,sf=sn<=16?26:sn<=24?23:sn<=32?20:17;
  const meta=opts.meta?[ctx.scopeText?'محدوده‌ی امتحان: '+ctx.scopeText:'',opts.date?'تاریخ: '+opts.date:''].filter(Boolean).join(' | '):'';
  return `<div class="sheet unit"><div class="frame">
  <table class="hd"><tr><td class="r"><div>نام و نام خانوادگی: ${nm?`<b>${E(nm)}</b>`:''}</div><div>نام درس: <b>${E(ctx.scope.bk)}</b></div><div>آموزگار: ${teacher?`<b>${E(teacher)}</b>`:''}</div></td>
  <td class="c">${sl?`<div class="bism">${E(sl)}</div>`:''}${school?`<div class="sch" style="font-size:${sf}px">${E(school)}</div>`:''}<div class="tt">${E(opts.title)}</div>${meta?`<div class="scp">${E(meta)}</div>`:''}</td>
  <td class="l">${logo}</td></tr></table>
  <table class="qs"><thead><tr><th class="no">–</th><th>سؤالات</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="tl">${note}${fb}<div class="ft">*** با آرزوی موفقیت${teacher?` : ${E(teacher)}`:''} ***</div></div>
  <div class="ch"><span>نام و نام خانوادگی: ${nm?`<b>${E(nm)}</b>`:'.............................'}</span><span>${E(opts.title)} — ${E(ctx.scope.bk)}</span></div></div></div>${key}`;
 }
 /* پاسخ‌نامه‌ی آموزگار: فقط شماره و پاسخ */
 function keyHtml(sh,ctx,opts,nm){
  const rows=sh.result.questions.map((q,i)=>{const a=ansText(q);return `<tr class="qr"><td class="no">${F(i+1)}</td><td class="ka">${a?E(a):'<i class="na">پاسخ ثبت نشده</i>'}</td></tr>`}).join('');
  return `<div class="sheet unit key"><div class="frame"><div class="kh"><div class="kt">پاسخ‌نامه‌ی آموزگار — ${E(opts.title)}</div><div class="ks">${E(ctx.scope.bk)}${nm?' | '+E(nm):''}${ctx.scopeText?' | '+E(ctx.scopeText):''}</div></div>
  <table class="qs kk"><thead><tr><th class="no">–</th><th>پاسخ</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="ch"><span>پاسخ‌نامه‌ی آموزگار (ادامه)</span><span>${E(opts.title)}${nm?' — '+E(nm):''}</span></div></div></div>`;
 }
 /* هر صفحه‌ی A4 یک کادر کامل و بسته دارد. سؤال‌ها به ترتیب در صفحه‌ها چیده می‌شوند و هر وقت صفحه پر شد، سؤال بعدی به صفحه‌ی تازه می‌رود.
    کادر بازخورد و جدول بلافاصله بعد از آخرین سؤال می‌آید. اگر کمی جا کم بود، فضای پاسخ‌ها تا حداکثر ۲۶٪ (نه کمتر از اندازه‌ی قدیمی) فشرده می‌شود؛ اگر باز هم جا نشد، کادر بازخورد به صفحه‌ی بعد می‌رود و هیچ سؤالی جابه‌جا نمی‌شود. این تابع داخل خود سند چاپی اجرا می‌شود. */
 function paginate(){
  var pr=document.createElement('div');pr.style.cssText='position:absolute;visibility:hidden;width:1px;height:280mm';document.body.appendChild(pr);
  var H=pr.offsetHeight;document.body.removeChild(pr);
  var D='۰۱۲۳۴۵۶۷۸۹',fa=function(n){return String(n).replace(/\d/g,function(d){return D[d]})};
  [].slice.call(document.querySelectorAll('.unit')).forEach(function(u){
   var f=u.querySelector('.frame'),tb=f.querySelector('table.qs'),th=tb.tHead,body=tb.tBodies[0],rows=[].slice.call(body.rows),tl=f.querySelector('.tl'),ch=f.querySelector('.ch');
   if(ch)f.removeChild(ch);if(tl)f.removeChild(tl);
   rows.forEach(function(r){body.removeChild(r)});
   var frames=[f],cur=f,cb=body,last=u,isKey=/\bkey\b/.test(u.className);
   function fits(x){return x.offsetHeight<=H}
   function next(noTable){
    var s=document.createElement('div');s.className='sheet'+(isKey?' key':'');
    var nf=document.createElement('div');nf.className='frame';
    if(ch&&(frames.length+1)%2===1){var c=ch.cloneNode(true);c.className='ch on';nf.appendChild(c)}
    var nb=cb;
    if(!noTable){var t=tb.cloneNode(false);t.appendChild(th.cloneNode(true));nb=document.createElement('tbody');t.appendChild(nb);nf.appendChild(t)}
    s.appendChild(nf);last.parentNode.insertBefore(s,last.nextSibling);last=s;frames.push(nf);cur=nf;cb=nb;
   }
   rows.forEach(function(r){cb.appendChild(r);if(!fits(cur)&&cb.rows.length>1){cb.removeChild(r);next();cb.appendChild(r)}});
   function squeeze(fr){var w=[].slice.call(fr.querySelectorAll('.wr[data-h]'));if(!w.length)return false;
    for(var k=0.92;k>=0.74;k-=0.06){w.forEach(function(e){e.style.height=Math.round(+e.getAttribute('data-h')*k)+'px'});if(fits(fr))return true}
    w.forEach(function(e){e.style.height=e.getAttribute('data-h')+'px'});return false}
   if(tl){cur.appendChild(tl);if(!fits(cur)&&!squeeze(cur)){tl.className+=' cmp';if(!squeeze(cur)&&!fits(cur)){tl.className=tl.className.replace(' cmp','');cur.removeChild(tl);next(true);cur.appendChild(tl)}}}
   frames.forEach(function(x,i){x.className+=' fx';if(frames.length>1){var p=document.createElement('div');p.className='pn';p.textContent='صفحه '+fa(i+1)+' از '+fa(frames.length);x.appendChild(p)}});
  });
 }
 const CSS=`@page{size:A4;margin:8mm}*{box-sizing:border-box}html,body{margin:0}body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl;color:#111;font-size:12.5px;line-height:1.9;background:#777}
 .sheet{width:210mm;height:297mm;margin:10px auto;background:#fff;padding:8mm;box-shadow:0 2px 8px rgba(0,0,0,.4);break-after:page;page-break-after:always}
 .frame{border:2px solid #222;border-radius:4px;display:flex;flex-direction:column;position:relative;padding-bottom:18px}.frame.fx{height:280mm}
 .hd,.qs{flex:none;width:100%;border-collapse:collapse}.hd{border-bottom:1.5px solid #222}.hd td{vertical-align:middle;padding:6px 10px}
 .hd .r{width:27%;font-size:14px;font-weight:700}.hd .r div{line-height:2.7;white-space:nowrap}.hd .r b{font-weight:800}.hd .c{width:46%;text-align:center}.hd .c>*{margin:2px 0}.hd .l{width:27%;text-align:left;padding:4px 8px}
 .hd img{display:block;width:100%;height:33mm;object-fit:contain;object-position:left center}
 .bism{font-weight:800;font-size:15px}.sch{font-weight:900;line-height:1.5}.tt{font-size:15px}.scp{font-size:11.5px;color:#333}
 .qs th{background:#e6e6e6;border-bottom:1px solid #222;padding:2px 6px;font-size:12px}.qs th.no,.qs td.no{width:34px;text-align:center;border-left:1px solid #222;font-weight:800}
 .qs td{border-bottom:1px solid #222;vertical-align:top;padding:6px 10px}.qr{break-inside:avoid;page-break-inside:avoid}
 .qt{font-weight:700}.pt{font-weight:400;font-size:11px;margin-right:8px}.op{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;margin:3px 18px;font-weight:600}.tf{margin:4px 18px;font-weight:700}
 .tl{margin-top:0;flex:none}
 .fb{width:94%;margin:12px auto 4px;border-collapse:collapse;font-size:11px;break-inside:avoid}.fb th,.fb td{border:1px solid #444;padding:3px 5px;text-align:center}.fb th{background:#e6e6e6}.fb td.ex{text-align:right;height:22px}
 .fbx{border:1.5px dashed #444;border-radius:18px;margin:10px 14px 0;padding:6px 12px;min-height:64px;font-weight:800;font-size:12px}
 .tl.cmp .fbx{min-height:36px;margin-top:6px;padding:3px 12px}.tl.cmp .fb{margin-top:6px}.tl.cmp .fb td.ex{height:18px}.tl.cmp .ft{padding:2px 0}
 .ft{text-align:center;font-weight:800;font-size:11px;padding:6px 0}
 .wr{margin:4px 18px 0}
 .wa{margin:3px 18px 0;font-weight:700;color:#14653a;white-space:pre-wrap}.na{color:#999;font-weight:400}.ok{color:#14653a;font-weight:800}
 .kh{flex:none}.kt{text-align:center;font-weight:800;font-size:15px;padding:8px 0 0}.ks{text-align:center;font-size:11.5px;color:#333;padding:0 0 6px;border-bottom:1.5px solid #222}
 .kk td.ka{font-weight:800;color:#14653a;font-size:13px}.kk th:nth-child(2){text-align:right}
 .ch{display:none}.frame>.ch.on{display:flex;flex:none;justify-content:space-between;padding:6px 10px;border-bottom:1.5px solid #222;font-size:12px}
 .pn{position:absolute;left:0;right:0;bottom:1px;text-align:center;font-size:10px;color:#555;line-height:1.6}
 @media print{body{background:#fff}.sheet{margin:0;box-shadow:none;width:auto;height:auto;padding:0}.sheet:last-child{break-after:auto;page-break-after:auto}}`;
 function docHtml(b){
  const o={pts:false,meta:$('exbMeta').checked,fb:$('exbFb').checked,fbRows:fbRowsAll(),title:fullTitle(),date:($('exbDate').value||'').trim(),ans:($('exbAns').value||'none')};
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${E(o.title)}</title><link rel="stylesheet" href="assets/css/fonts.css"><style>${CSS}</style></head><body>${b.sheets.map(s=>sheetHtml(s,b.ctx,o)).join('')}<script>addEventListener('load',function(){var g=${paginate.toString()};if(document.fonts&&document.fonts.ready)document.fonts.ready.then(g);else g()})<\/script></body></html>`;
 }
 function missingAns(b){return $('exbAns').value==='none'?0:b.sheets.reduce((n,sh)=>n+sh.result.questions.filter(q=>!ansText(q)).length,0)}
 function openPreview(){
  const b=last;if(!b)return;
  $('exbFr').srcdoc=docHtml(b);
  $('exbOvT').textContent=`پیش‌نمایش: ${F(b.sheets.length)} برگه${$('exbAns').value==='sep'?' + '+F(b.sheets.length)+' صفحه‌ی پاسخ‌نامه':''} — در پنجره‌ی چاپ مقصد «ذخیره به‌صورت PDF» را بزنید.${missingAns(b)?' ⚠️ برای '+F(missingAns(b))+' سؤال پاسخ ثبت نشده است.':''}`;
  ov.classList.add('on');
 }
/* ---------- انتظارات جدول بازخورد: فهرست آماده + تیک (برای هر درس و هر نوع آزمون) ----------
   داده‌ها: S.exb.fbLib = فهرست متن‌های معلم [{id,t,bk,ty}] (bk/ty خالی = همه)
            S.exb.fbSel = تیک‌های هر ترکیب «درس|نوع آزمون» */
  const FB_SUG=[
   {k:['فارسی','املا','نگارش','انشا'],t:['به سؤالات درک مطلب پاسخ می‌دهد.','متن را روان و با لحن مناسب می‌خواند.','املای درست کلمات را می‌نویسد.','معنی واژه‌های درس را می‌داند.','جمله‌ها را کامل و با رعایت نشانه‌گذاری می‌نویسد.','نکته‌های دستوری درس را درست به‌کار می‌برد.','مفهوم شعر و متن را به زبان خود بیان می‌کند.']},
   {k:['ریاضی'],t:['مفهوم‌های درس را درک کرده است.','چهار عمل اصلی را درست انجام می‌دهد.','مسئله‌ها را درست تحلیل و حل می‌کند.','مراحل حل را مرتب و کامل می‌نویسد.','با دقت و سرعت مناسب محاسبه می‌کند.','از شکل و نمودار برای حل مسئله استفاده می‌کند.','راه حل خود را توضیح می‌دهد.']},
   {k:['علوم'],t:['مفهوم‌های علمی را درک می‌کند و با زبان خود بیان می‌کند.','به پرسش‌های «چرا» و «چگونه» پاسخ می‌دهد.','شکل‌ها و نمودارها را درست تحلیل می‌کند.','از فعالیت‌های آزمایشی نتیجه‌گیری می‌کند.','اصطلاحات علمی را درست به‌کار می‌برد.']},
   {k:['اجتماعی'],t:['مفهوم‌های درس را توضیح می‌دهد.','نقشه و جهت‌های جغرافیایی را درست می‌خواند.','اطلاعات درس را به یکدیگر ربط می‌دهد.','از زندگی روزمره برای درس مثال می‌آورد.']},
   {k:['قرآن'],t:['آیه‌ها را روان و با رعایت قواعد روخوانی می‌خواند.','مفهوم آیه‌های درس را می‌داند.','آیه‌های حفظی را درست و روان می‌خواند.']},
   {k:['هدیه','آسمان','دینی'],t:['مفهوم‌های درس را می‌داند.','نمونه‌هایی از رفتار مناسب درس را بیان می‌کند.','متن‌های حفظی را درست می‌خواند.']}
  ];
  const FB_GEN=['مفهوم‌های درس را درک کرده است.','پاسخ‌ها را کامل و مرتب می‌نویسد.','به صورت سؤال با دقت توجه می‌کند.','خوش‌خط و خوانا می‌نویسد.','زمان آزمون را درست مدیریت می‌کند.'];
  const fbCtx=()=>{const bk=($('exbBk')||{}).value||'',ty=($('exbType')||{}).value||'';return {bk,ty,key:C.norm(bk)+'|'+ty}};
  /* پیشنهادهای عمومی قابل‌ویرایش: تا وقتی معلم دست نزده، همان پیش‌فرض است؛ با اولین تغییر در S.exb.fbGen ذخیره می‌شود */
  const genList=()=>{const c=cfg();return Array.isArray(c.fbGen)?c.fbGen.filter(x=>x&&x.id&&x.t):FB_GEN.map(t=>({id:'s:'+C.norm(t),t}))};
  const genMat=()=>{const c=cfg();if(!Array.isArray(c.fbGen))c.fbGen=genList();return c.fbGen};
  function fbList(){
   const {bk,ty}=fbCtx(),c=cfg(),nb=C.norm(bk);
   const own=(Array.isArray(c.fbLib)?c.fbLib:[]).filter(x=>x&&x.id&&x.t&&(!x.bk||(nb&&C.norm(x.bk)===nb))&&(!x.ty||x.ty===ty));
   const mine=new Set(own.map(x=>C.norm(x.t)));
   const sug=[];if(nb)FB_SUG.forEach(g=>{if(g.k.some(w=>nb.includes(w)))g.t.forEach(t=>{const k=C.norm(t);if(!mine.has(k)&&!sug.some(z=>z.t===t))sug.push({id:'s:'+k,t})})});
   const gen=genList().filter(x=>!mine.has(C.norm(x.t))&&!sug.some(z=>z.t===x.t));
   return {own,sug,gen};
  }
  const fbSelSet=()=>new Set((cfg().fbSel||{})[fbCtx().key]||[]);
  function fbSelSave(set){const c=cfg(),k=fbCtx().key;c.fbSel=c.fbSel&&typeof c.fbSel==='object'?c.fbSel:{};if(set.size)c.fbSel[k]=Array.from(set);else delete c.fbSel[k];save()}
  const fbManual=()=>($('exbFbRows').value||'').split('\n').map(x=>x.trim()).filter(Boolean);
  function fbRowsAll(){
   const L=fbList(),sel=fbSelSet(),out=[];
   [...L.own,...L.sug,...L.gen].forEach(x=>{if(sel.has(x.id))out.push(x.t)});
   fbManual().forEach(t=>out.push(t));
   const seen=new Set();return out.filter(t=>{const k=C.norm(t);if(seen.has(k))return false;seen.add(k);return true});
  }
  const fbTag=x=>x.bk&&x.ty?'فقط این درس و این آزمون':x.bk?'فقط این درس':x.ty?'فقط این نوع آزمون':'همه‌ی درس‌ها';
  const fbRow=(x,sel,own)=>`<div class="exb-fbr"><label><input type="checkbox" data-fbk="${E(x.id)}" ${sel.has(x.id)?'checked':''}><span>${E(x.t)}${own===true?`<small>${fbTag(x)}</small>`:''}</span></label>${own?`<span class="exb-fba"><button type="button" class="sm" data-fbe="${E(x.id)}" title="ویرایش">✏️</button><button type="button" class="sm" data-fbd="${E(x.id)}" title="حذف">🗑️</button></span>`:''}</div>`;
  function fbCount(){const n=fbRowsAll().length,el=$('exbFbCnt');if(!el)return;el.textContent=n?`${F(n)} مورد در برگه چاپ می‌شود${n>8?' — بیش از ۸ مورد ممکن است برگه را شلوغ کند':''}`:'هنوز موردی انتخاب نشده (ردیف خالی چاپ می‌شود)'}
  function fbForm(force){
   const {bk,ty}=fbCtx(),sc=$('exbFbSc'),tyS=$('exbFbTy'),o1=force?'':sc.value,o2=force?'':tyS.value;
   sc.innerHTML=(bk?`<option value="bk">فقط «${E(bk)}»</option>`:'')+'<option value="all">همه‌ی درس‌ها</option>';
   tyS.innerHTML='<option value="all">همه‌ی آزمون‌ها</option>'+(ty?`<option value="ty">فقط «${E(ty)}»</option>`:'');
   sc.value=[...sc.options].some(o=>o.value===o1)?o1:(bk?'bk':'all');
   tyS.value=[...tyS.options].some(o=>o.value===o2)?o2:'all';
  }
  function renderFb(force){
   const box=$('exbFbL');if(!box)return;
   $('exbFbW').hidden=!$('exbFb').checked;
   const {bk}=fbCtx(),L=fbList(),sel=fbSelSet();fbForm(force);
   let h='';
   if(L.own.length)h+=`<div class="exb-fbg">⭐ فهرست من</div>`+L.own.map(x=>fbRow(x,sel,true)).join('');
   if(L.sug.length)h+=`<div class="exb-fbg">💡 پیشنهادی برای «${E(bk)}»</div>`+L.sug.map(x=>fbRow(x,sel,false)).join('');
   else if(!bk)h+=`<p class="exb-n">با انتخاب «کتاب / درس» در بخش ۱، پیشنهادهای مخصوص همان درس اینجا نمایش داده می‌شود.</p>`;
   if(force)fbGenOpen=null;
   h+=`<details class="exb-acc"${(fbGenOpen!==null?fbGenOpen:(!L.own.length&&!L.sug.length))?' open':''}><summary>پیشنهادهای عمومی (مناسب همه‌ی درس‌ها)</summary>${L.gen.map(x=>fbRow(x,sel,'g')).join('')||'<p class="exb-n">فهرست خالی است؛ می‌توانید در پایین متن اضافه کنید.</p>'}<div class="exb-fbga"><input id="exbFbGenNew" maxlength="200" placeholder="متن عمومی تازه…" autocomplete="off"><button type="button" class="sm" id="exbFbGenAdd">➕ افزودن</button></div><div class="exb-mb"><button type="button" class="sm" id="exbFbGenReset">↺ بازگشت به پیشنهادهای اولیه</button></div></details>`;
   box.innerHTML=h;fbCount();
  }
  let fbEdit=null,fbEditGen=false,fbGenOpen=null;
  function fbReset(){fbEdit=null;fbEditGen=false;$('exbFbNew').value='';$('exbFbAdd').textContent='➕ افزودن';$('exbFbCan').hidden=true}
  const fbMsg=t=>{$('exbFbMsg').textContent=t||''};
  function fbAdd(text){
   text=String(text||'').replace(/\s+/g,' ').trim();if(!text)return null;
   const c=cfg(),{bk,ty}=fbCtx();c.fbLib=Array.isArray(c.fbLib)?c.fbLib:[];
   const sb=$('exbFbSc').value==='bk'&&bk?bk:'',st=$('exbFbTy').value==='ty'&&ty?ty:'';
   const dup=c.fbLib.find(x=>C.norm(x.t)===C.norm(text)&&C.norm(x.bk||'')===C.norm(sb)&&(x.ty||'')===st);
   const id=dup?dup.id:'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   if(!dup)c.fbLib.push({id,t:text,bk:sb,ty:st});
   const sel=fbSelSet();sel.add(id);fbSelSave(sel);
   return dup?'dup':'new';
  }
  function fbDoAdd(){
   const t=$('exbFbNew').value;if(!String(t).trim()){fbMsg('اول متن را بنویسید.');$('exbFbNew').focus();return}
   if(fbEdit&&fbEditGen){
    const x=genMat().find(y=>y.id===fbEdit);
    if(x){x.t=String(t).replace(/\s+/g,' ').trim();save();fbMsg('✔ ویرایش ذخیره شد.')}
    fbReset();renderFb();return;
   }
   if(fbEdit){
    const c=cfg(),x=(c.fbLib||[]).find(y=>y.id===fbEdit),{bk,ty}=fbCtx();
    if(x){x.t=String(t).replace(/\s+/g,' ').trim();x.bk=$('exbFbSc').value==='bk'&&bk?bk:'';x.ty=$('exbFbTy').value==='ty'&&ty?ty:'';save();fbMsg('✔ ویرایش ذخیره شد.')}
    fbReset();renderFb();return;
   }
   const r=fbAdd(t);fbMsg(r==='dup'?'این متن قبلاً در فهرست بود؛ فقط تیک خورد.':'✔ به فهرست اضافه شد و تیک خورد.');
   $('exbFbNew').value='';renderFb();$('exbFbNew').focus();
  }
  function fbStartEdit(id){
   const g=!(cfg().fbLib||[]).some(y=>y.id===id),x=g?genList().find(y=>y.id===id):(cfg().fbLib||[]).find(y=>y.id===id);if(!x)return;
   fbEdit=id;fbEditGen=g;fbForm();$('exbFbNew').value=x.t;if(!g){$('exbFbSc').value=x.bk&&[...$('exbFbSc').options].some(o=>o.value==='bk')?'bk':'all';$('exbFbTy').value=x.ty&&[...$('exbFbTy').options].some(o=>o.value==='ty')?'ty':'all'}
   $('exbFbAdd').textContent='💾 ذخیره‌ی ویرایش';$('exbFbCan').hidden=false;$('exbFbD').open=true;fbMsg(g?'در حال ویرایش یک پیشنهاد عمومی (برای همه‌ی درس‌ها).':'');$('exbFbNew').focus();
  }
  function fbDelete(id){
   if(!confirm('این متن از فهرست شما حذف شود؟'))return;
   const c=cfg();if((c.fbLib||[]).some(x=>x.id===id))c.fbLib=c.fbLib.filter(x=>x.id!==id);else{const g=genMat();c.fbGen=g.filter(x=>x.id!==id)}
   if(c.fbSel)Object.keys(c.fbSel).forEach(k=>{c.fbSel[k]=(c.fbSel[k]||[]).filter(i=>i!==id);if(!c.fbSel[k].length)delete c.fbSel[k]});
   if(fbEdit===id)fbReset();save();renderFb();
  }
  function fbSaveManual(){
   const lines=fbManual();if(!lines.length){fbMsg('اول در کادر «متن دلخواه» چیزی بنویسید.');$('exbFbD').open=true;return}
   const {bk}=fbCtx();let n=0;lines.forEach(t=>{if(fbAdd(t)==='new')n++});
   $('exbFbRows').value='';persist();renderFb();
   fbMsg(`✔ ${F(lines.length)} متن در فهرست ذخیره و تیک خورد (${$('exbFbSc').value==='bk'&&bk?'برای «'+bk+'»':'برای همه‌ی درس‌ها'}).`);$('exbFbD').open=true;
  }
  sec.addEventListener('change',e=>{
   const t=e.target;if(!t)return;
   if(t.dataset&&t.dataset.fbk!=null){const sel=fbSelSet();if(t.checked)sel.add(t.dataset.fbk);else sel.delete(t.dataset.fbk);fbSelSave(sel);fbCount();return}
   if(t.id==='exbBk'||t.id==='exbType'||t.id==='exbGr'){fbReset();fbMsg('');renderFb(true)}
   if(t.id==='exbFb')renderFb();
  });
  sec.addEventListener('input',e=>{if(e.target.id==='exbFbRows')fbCount()});
  sec.addEventListener('click',e=>{
   const sm=e.target.closest&&e.target.closest('#exbFbL summary');if(sm)fbGenOpen=!sm.parentElement.open;
   const b=e.target.closest&&e.target.closest('button');if(!b)return;
   if(b.dataset.fbe)return fbStartEdit(b.dataset.fbe);
   if(b.dataset.fbd)return fbDelete(b.dataset.fbd);
   if(b.id==='exbFbAdd')return fbDoAdd();
   if(b.id==='exbFbGenAdd')return fbGenAdd();
   if(b.id==='exbFbGenReset'){if(!confirm('پیشنهادهای عمومی به حالت اولیه برگردد؟ (متن‌های خودتان در «فهرست من» دست نمی‌خورد)'))return;delete cfg().fbGen;save();renderFb();return}
   if(b.id==='exbFbCan'){fbReset();fbMsg('');return}
   if(b.id==='exbFbSaveMan')return fbSaveManual();
   if(b.id==='exbFbClr'){fbSelSave(new Set());renderFb()}
  });
  function fbGenAdd(){
   const i=$('exbFbGenNew'),t=String(i.value||'').replace(/\s+/g,' ').trim();if(!t){i.focus();return}
   const g=genMat(),dup=g.find(x=>C.norm(x.t)===C.norm(t)),id=dup?dup.id:'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   if(!dup)g.push({id,t});
   const sel=fbSelSet();sel.add(id);fbSelSave(sel);renderFb();const n=$('exbFbGenNew');if(n)n.focus();
  }
  sec.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='exbFbGenNew'){e.preventDefault();fbGenAdd()}});
  $('exbFbNew').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();fbDoAdd()}});

 function persist(){
  const c=cfg();c.type=$('exbType').value;c.title=$('exbTitle').value;c.count=$('exbCount').value;c.meta=$('exbMeta').checked;c.same=$('exbSame').checked;c.mode=mode;c.mfill=$('exbMfill').checked;c.sel=Array.from(selSet);c.fb=$('exbFb').checked;c.fbRows=$('exbFbRows').value;c.ans=$('exbAns').value;c.bk=$('exbBk').value;c.rm=rmode;
  const rm=readMix();if(rm.mix)c.mix=rm.mix;save();
 }
 let rmRestored=false;
 function restore(){
  const c=cfg();
  if(c.type!=null)$('exbType').value=c.type;else if(c.title&&TYPES.includes(c.title)){$('exbType').value=c.title;c.title=''}
  if(c.title!=null)$('exbTitle').value=c.title;if(c.count)$('exbCount').value=c.count;if(c.meta!=null)$('exbMeta').checked=!!c.meta;if(c.same!=null)$('exbSame').checked=!!c.same;if(c.mfill!=null)$('exbMfill').checked=!!c.mfill;if(Array.isArray(c.sel)){selSet.clear();c.sel.forEach(i=>selSet.add(String(i)))}setMode(c.mode);
  if(!rmRestored){rmRestored=true;if(c.rm==='page'||c.rm==='lesson'){rmode=c.rm;fillRange()}}
  if(c.fb!=null)$('exbFb').checked=!!c.fb;if(c.fbRows!=null)$('exbFbRows').value=c.fbRows;if(c.ans)$('exbAns').value=c.ans;
 }
 function go(){
  const b=build(),rep=$('exbRep');
  if(b.err){rep.innerHTML=`<div class="exb-warn">${E(b.err)}</div>`;last=null;return}
  persist();last=b;rep.innerHTML=report(b);openPreview();
 }

 /* ---------- رویدادها ---------- */
 $('exbGo').onclick=go;
 $('exbAgain').onclick=go;
 $('exbClose').onclick=()=>ov.classList.remove('on');
 $('exbPrint').onclick=()=>{const w=$('exbFr').contentWindow;if(w){w.focus();w.print()}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))ov.classList.remove('on')});
 $('exbAll').onclick=()=>{sec.querySelectorAll('[data-sc]').forEach(x=>x.checked=true)};
 $('exbNone').onclick=()=>{sec.querySelectorAll('[data-sc]').forEach(x=>x.checked=false)};
 $('exbMixReset').onclick=()=>{cfg().mix=DEF_MIX();fillMix()};
 sec.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='exbType')$('exbSame').checked=t.value==='ارزشیابی آغازین';
  if(t.dataset&&t.dataset.sl!=null){const s=students().find(x=>String(x.id)===t.dataset.sl),bk=$('exbBk').value;
   if(s&&bk){s.qbkLv=s.qbkLv||{};s.qbkLvD=s.qbkLvD||{};if(t.value){s.qbkLv[bk]=t.value;s.qbkLvD[bk]=new Date().toISOString().slice(0,10)}else{delete s.qbkLv[bk];delete s.qbkLvD[bk];delete s.qbkLevel}save();fillStudents()}return}
  if(t.id==='exbGr'){$('exbBk').value='';$('exbTp').value=''}
  if(t.id==='exbBk')$('exbTp').value='';
  if(t.id==='exbGr'||t.id==='exbBk'){fillScope();fillStudents()}
  if(['exbLf','exbLt','exbPf','exbPt','exbTp'].includes(t.id)||(t.dataset&&t.dataset.ln!=null))fillRange();
  if(t.id==='exbBk'){openG.clear();gInit=false}
  if(['exbGr','exbBk','exbTp','exbUnk','exbLf','exbLt','exbPf','exbPt'].includes(t.id)||(t.dataset&&t.dataset.ln!=null))renderSummary();
 });
 sec.addEventListener('input',e=>{if(['exbLf','exbLt','exbPf','exbPt'].includes(e.target.id))renderSummary()});
 function refresh(){hubCnt();fillScope();fillStudents();fillMix();restore();renderSummary();fbReset();fbMsg('');renderFb(true)}
 const _show=window.show;
 window.show=function(id){const r=_show.apply(this,arguments);try{if(id==='exh')hubCnt();if(id==='exb')refresh()}catch(e){console.error('exam-builder',e)}return r};
 window.ExamBuilder=Object.freeze({build,sheetHtml,docHtml:()=>last?docHtml(last):''});
}catch(e){console.error('exam-builder',e)}})();

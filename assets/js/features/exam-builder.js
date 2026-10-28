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
 #exb .exb-un{display:grid;grid-template-columns:1fr 70px 70px 70px;gap:6px;align-items:center;border-bottom:1px solid var(--line);padding:5px 0;font-size:13px}
 #exb .exb-un input{margin:0}
 #exbOv{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none;flex-direction:column}
 #exbOv.on{display:flex}
 #exbOv .exb-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:var(--card,#fff);padding:10px 12px}
 #exbOv .exb-bar span{flex:1 1 240px;font-size:13px}
 #exbOv .exb-bar button{width:auto;flex:none;margin:0;padding:8px 16px;font-size:14px}
 #exbOv iframe{flex:1;border:0;background:#777;width:100%}
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
  <div class="exb-g"><div><label>از درس شماره‌ی</label><input id="exbLf" inputmode="numeric" placeholder="مثلاً ۱"></div><div><label>تا درس شماره‌ی</label><input id="exbLt" inputmode="numeric" placeholder="مثلاً ۳"></div><div><label>از صفحه‌ی</label><input id="exbPf" inputmode="numeric" placeholder="مثلاً ۱۰"></div><div><label>تا صفحه‌ی</label><input id="exbPt" inputmode="numeric" placeholder="مثلاً ۲۵"></div></div>
  <details><summary>یا درس‌ها را دستی انتخاب کنم (مثلاً ۱ و ۳ و ۵ بدون درس‌های بین‌شان)</summary><p class="exb-n">اگر اینجا درسی تیک بخورد، «از/تا درس» نادیده گرفته می‌شود.</p><div class="exb-ls" id="exbLs"></div></details>
  <label style="display:flex;align-items:center;margin-top:8px"><input type="checkbox" id="exbUnk"> سؤال‌هایی که شماره‌ی درس یا صفحه‌شان ثبت نشده هم در نظر گرفته شوند (به مسئولیت خودم)</label>
  <div id="exbSum"></div><div id="exbUnList"></div></div>
 <div class="card"><b>۲. دانش‌آموزان</b><p class="exb-n">سطح هر دانش‌آموز «در هر درس» را بعد از ارزشیابی آغازین شما ثبت می‌کنید؛ از آن به بعد، با ثبت نمره‌ی آزمون‌های بعدی همان درس، برنامه خودکار سطح را به‌روز می‌کند (هر وقت خواستید می‌توانید دستی اصلاح کنید). اگر هیچ‌کس را تیک نزنید، یک برگه‌ی عمومی ساخته می‌شود.</p>
  <div class="exb-g"><div><label>سطح برگه‌ی عمومی</label><select id="exbGenLv">${C.STUDENT_LEVELS.map(l=>`<option value="${l.k}" ${l.k==='m'?'selected':''}>${l.label}</option>`).join('')}</select></div></div>
  <div style="display:flex;gap:8px;margin:6px 0"><button class="sm" type="button" id="exbAll">انتخاب همه</button><button class="sm" type="button" id="exbNone">لغو انتخاب‌ها</button></div><div id="exbStu"></div></div>
 <div class="card"><b>۳. مشخصات برگه</b>
  <div class="exb-g"><div><label>عنوان آزمون</label><input id="exbTitle" placeholder="مثلاً ارزشیابی آغازین"></div><div><label>تعداد سؤال هر برگه</label><input id="exbCount" inputmode="numeric" value="10"></div><div><label>تاریخ (اختیاری)</label><input id="exbDate" placeholder="خالی = جای نوشتن"></div></div>
  <label>سربرگ بالای برگه</label><input id="exbBism" value="به نام خداوند آفریننده‌ی دانا">
  <label style="display:flex;align-items:center"><input type="checkbox" id="exbFb" checked> کادر «بازخورد آموزگار» و جدول انتظارات (بله / تاحدودی / خیر)</label>
  <label>پاسخ سؤال‌ها در چاپ</label><select id="exbAns"><option value="none">بدون پاسخ (برگه‌ی دانش‌آموز)</option><option value="sep">پاسخ‌نامه در صفحه‌ی جدا، بعد از هر برگه (برای آموزگار)</option><option value="inline">پاسخ زیر هر سؤال (نسخه‌ی آموزگار)</option></select>
  <label>انتظارات جدول بازخورد (هر خط یک مورد؛ خالی = چند ردیف خالی برای نوشتن دستی)</label><textarea id="exbFbRows" rows="3"></textarea>
  <details><summary>ترکیب سطح سؤال‌ها برای ۱۰ سؤال (قابل تنظیم)</summary><p class="exb-n">برای تعداد دیگر، نسبت‌ها خودکار مقیاس می‌شوند.</p><table class="exb-mx" id="exbMix"></table><button class="sm" type="button" id="exbMixReset" style="margin-top:6px">بازگشت به پیش‌فرض</button></details></div>
 <button class="big" type="button" id="exbGo" style="margin:6px 0 12px">👁️ ساخت برگه و پیش‌نمایش</button>
 <div id="exbRep"></div>`;
 (main||document.body).appendChild(sec);

 const ov=document.createElement('div');ov.id='exbOv';
 ov.innerHTML=`<div class="exb-bar"><span id="exbOvT"></span><button class="big" type="button" id="exbPrint">🖨️ چاپ / ذخیره به‌صورت PDF</button><button class="sm" type="button" id="exbTab">↗️ باز کردن در تب جدید (برای چاپ مطمئن‌تر)</button><button class="sm" type="button" id="exbAgain">🎲 سؤال‌های تصادفی جدید</button><button class="sm" type="button" id="exbClose">✖ بستن</button></div><iframe id="exbFr" title="پیش‌نمایش برگه"></iframe>`;
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
  $('exbLs').innerHTML=lns.length?lns.map(n=>`<label><input type="checkbox" data-ln="${n}" ${checked.has(String(n))?'checked':''}>درس ${F(n)} <small style="color:var(--mut);margin-right:4px">(${F(inBk.filter(q=>C.toNum(q.ln)===n).length)} سؤال)</small></label>`).join(''):'<span class="exb-n">برای این کتاب هنوز شماره‌ی درسی روی سؤال‌ها ثبت نشده است.</span>';
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
  const lf=numField('exbLf','از درس'),lt=numField('exbLt','تا درس'),pf=numField('exbPf','از صفحه'),pt=numField('exbPt','تا صفحه');
  for(const r of [lf,lt,pf,pt])if(r.err)return{err:r.err};
  if(lf.v!=null&&lt.v!=null&&lt.v<lf.v)return{err:'«تا درس» نباید کوچک‌تر از «از درس» باشد.'};
  if(pf.v!=null&&pt.v!=null&&pt.v<pf.v)return{err:'«تا صفحه» نباید کوچک‌تر از «از صفحه» باشد.'};
  const lessons=Array.from(sec.querySelectorAll('[data-ln]:checked')).map(x=>+x.dataset.ln);
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
 function renderSummary(){
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
  const cnt=C.toNum($('exbCount').value);if(cnt==null||cnt<1||cnt>100)return {err:'تعداد سؤال باید عددی بین ۱ و ۱۰۰ باشد.'};
  const rm=readMix();if(rm.err)return {err:rm.err};
  const f=C.filterScope(bank(),rs.scope),pool=f.inside.concat($('exbUnk').checked?f.unknown:[]);
  if(!pool.length)return {err:'در این محدوده سؤالی پیدا نشد. محدوده را بازتر کنید یا شماره‌ی درس/صفحه‌ی سؤال‌ها را ثبت کنید.'};
  const picked=Array.from(sec.querySelectorAll('[data-sc]:checked')).map(x=>students().find(s=>String(s.id)===x.dataset.sc)).filter(Boolean);
  const genLv=$('exbGenLv').value||'m';
  const targets=picked.length?picked:[{id:0,name:'',qbkLevel:genLv,_general:true}];
  const sheets=targets.map(s=>{
   const R=s._general?{key:genLv,src:'manual'}:lvFor(s,rs.scope.bk),key=R.key,want=C.mixFor(key,cnt,rm.mix),r=C.pick(pool,want);
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
  return `<div class="card"><b>گزارش ساخت</b>${anyShort?'<div class="exb-warn">⚠️ در این محدوده به اندازه‌ی کافی سؤال نبود؛ تعداد واقعی کمتر شد. برای تکمیل، سؤال از بیرون محدوده نیاورده‌ایم. محدوده را بازتر کنید یا سؤال بیشتری به بانک اضافه کنید.</div>':''}${!anyShort&&anyChg?'<div class="exb-warn">تعداد بعضی سطح‌ها کافی نبود و با سؤال‌های دیگرِ همان محدوده جایگزین شد (ترکیب آسان/متوسط/سخت در جدول زیر دیده می‌شود).</div>':''}${b.ctx.unknownUsed?'<div class="exb-warn">سؤال‌های بدون شماره‌ی درس/صفحه هم به انتخاب شما در نظر گرفته شدند.</div>':''}
  <div style="overflow-x:auto"><table class="exb-mx"><tr><th>برگه برای</th><th>سطح</th><th>درخواست</th><th>ساخته شد</th><th>آسان/متوسط/سخت</th><th>وضعیت</th></tr>${rows}</table></div></div>`;
 }

 /* ---------- HTML برگه (A4، راست‌به‌چپ) ---------- */
 function ansText(q){
  const L=['الف','ب','ج','د'];
  if(q.ty==='tf')return q.ans==='T'?'صحیح':q.ans==='F'?'غلط':'';
  if(q.ty==='mc'){const o=Array.isArray(q.op)?q.op[q.ok]:null;if(o!=null&&o!=='')return (L[q.ok]||F(q.ok+1))+') '+o;return q.ans||''}
  return q.ans||'';
 }
 function qBlock(q,i,showPts,showAns){
  const L=['الف','ب','ج','د'];let body=`<div class="qt"><span>${E(q.q)}</span>${showPts?`<span class="pt">(${F(q.pt||1)} نمره)</span>`:''}</div>`;
  if(q.ty==='mc'&&Array.isArray(q.op)&&q.op.length)body+=`<div class="op">${q.op.map((o,j)=>`<div>${L[j]||F(j+1)}) ${E(o)}</div>`).join('')}</div>`;
  else if(q.ty==='tf')body+=`<div class="tf">صحیح ☐ &nbsp;&nbsp;&nbsp; غلط ☐</div>`;
  else if(q.ty==='es')body+=`<div class="sp" style="height:70px"></div>`;
  else body+=`<div class="sp" style="height:34px"></div>`;
  if(showAns){const a=ansText(q);body+=`<div class="an">پاسخ: ${a?E(a):'<i>ثبت نشده</i>'}</div>`}
  return `<tr class="qr"><td class="no">${F(i+1)}</td><td class="bd">${body}</td></tr>`;
 }
 function sheetHtml(sh,ctx,opts){
  const P=prof(),school=P.school&&typeof schoolFull==='function'?schoolFull():(P.school||''),teacher=P.teacher||'';
  const nm=sh.student._general?'':(sh.student.name||'');
  const logo=P.logo?`<img src="${E(P.logo)}" alt="">`:'';
  const rows=sh.result.questions.map((q,i)=>qBlock(q,i,opts.pts,opts.ans==='inline')).join('');
  const fbRows=(opts.fbRows.length?opts.fbRows:['','','']);
  const fb=opts.fb?`<table class="fb"><tr><th>انتظارات</th><th>بله</th><th>تاحدودی</th><th>خیر</th></tr>${fbRows.map(t=>`<tr><td class="ex">${E(t)}</td><td></td><td></td><td></td></tr>`).join('')}</table>`:'';
  const note=opts.fb?'<div class="fbx">بازخورد آموزگار:</div>':'',sg=typeof sigRow==='function'?sigRow('margin:6px 18px 4px;justify-content:space-around'):'';
  const key=opts.ans==='sep'?keyHtml(sh,ctx,opts,nm):'';
  return `<div class="sheet"><div class="frame">
  <table class="hd"><tr><td class="r"><div>نام و نام خانوادگی: ${nm?`<b>${E(nm)}</b>`:'.................................'}</div><div>نام درس: <b>${E(ctx.scope.bk)}</b></div><div>پایه: <b>${E(P.grade||'')}${P.sec?E(' ('+P.sec+')'):''}</b></div><div>آموزگار: ${teacher?`<b>${E(teacher)}</b>`:'.....................'}</div><div>مدیر: ${P.principal?`<b>${E(P.principal)}</b>`:'.....................'}</div></td>
  <td class="c"><div class="bism">${E(opts.bism)}</div>${school?`<div class="sch">${E(school)}</div>`:''}<div class="tt">${E(opts.title)}</div>${ctx.scopeText?`<div class="scp">محدوده‌ی امتحان: ${E(ctx.scopeText)}</div>`:''}<div class="scp">تاریخ: ${opts.date?E(opts.date):'................'}</div></td>
  <td class="l">${logo}</td></tr></table>
  <table class="qs"><tr><th class="no">–</th><th>سؤالات</th></tr>${rows}</table>
  ${note}${fb}${sg}<div class="ft">*** با آرزوی موفقیت ***</div></div></div>${key}`;
 }
 function keyHtml(sh,ctx,opts,nm){
  const rows=sh.result.questions.map((q,i)=>{const a=ansText(q);return `<tr class="qr"><td class="no">${F(i+1)}</td><td class="kq">${E(String(q.q).slice(0,80))}${String(q.q).length>80?'…':''}</td><td class="ka">${a?E(a):'<i>ثبت نشده</i>'}</td></tr>`}).join('');
  return `<div class="sheet key"><div class="frame"><div class="kt">پاسخ‌نامه‌ی آموزگار — ${E(opts.title)}</div><div class="ks">${E(ctx.scope.bk)}${nm?' | '+E(nm):''}${ctx.scopeText?' | '+E(ctx.scopeText):''}</div>
  <table class="qs kk"><tr><th class="no">–</th><th>سؤال</th><th>پاسخ</th></tr>${rows}</table></div></div>`;
 }
 const CSS=`@page{size:A4;margin:8mm}*{box-sizing:border-box}html,body{margin:0}body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl;color:#111;font-size:12.5px;line-height:1.9;background:#777}
 .sheet{width:210mm;min-height:297mm;margin:10px auto;background:#fff;padding:8mm;box-shadow:0 2px 8px rgba(0,0,0,.4)}
 .frame{border:2px solid #222;border-radius:4px}.hd{width:100%;border-collapse:collapse;border-bottom:1.5px solid #222}.hd td{vertical-align:middle;padding:6px 10px}
 .hd .r{width:34%;font-size:12px}.hd .c{text-align:center}.hd .l{width:18%;text-align:left}.hd img{max-width:70px;max-height:70px;object-fit:contain}
 .bism{font-weight:800;font-size:12px}.sch{font-weight:800;font-size:16px}.tt{font-size:12.5px}.scp{font-size:11.5px;color:#333}
 .qs{width:100%;border-collapse:collapse}.qs th{background:#e6e6e6;border-bottom:1px solid #222;padding:2px 6px;font-size:12px}.qs th.no,.qs td.no{width:34px;text-align:center;border-left:1px solid #222;font-weight:800}
 .qs td{border-bottom:1px solid #222;vertical-align:top;padding:6px 10px}.qr{break-inside:avoid;page-break-inside:avoid}
 .qt{font-weight:700}.pt{font-weight:400;font-size:11px;margin-right:8px}.op{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;margin:3px 18px;font-weight:600}.tf{margin:4px 18px;font-weight:700}.sp{border-bottom:1px dotted #aaa}
 .fb{width:94%;margin:12px auto 4px;border-collapse:collapse;font-size:11px;break-inside:avoid}.fb th,.fb td{border:1px solid #444;padding:3px 5px;text-align:center}.fb th{background:#e6e6e6}.fb td.ex{text-align:right;height:22px}
 .fbx{border:1.5px dashed #444;border-radius:18px;margin:10px 14px 0;padding:6px 12px;min-height:64px;font-weight:800;font-size:12px}
 .ft{text-align:center;font-weight:800;font-size:11px;padding:6px 0}
 .an{margin:4px 18px 0;padding:1px 8px;border:1px solid #2a7a4b;background:#eef9f2;border-radius:6px;font-size:11.5px;font-weight:700;color:#14653a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .kt{text-align:center;font-weight:800;font-size:15px;padding:8px 0 0}.ks{text-align:center;font-size:11.5px;color:#333;padding:0 0 6px;border-bottom:1.5px solid #222}
 .kk td.kq{font-size:11.5px;color:#333;width:50%}.kk td.ka{font-weight:800;color:#14653a}.kk th:nth-child(2),.kk th:nth-child(3){text-align:right}.kk td.kq,.kk td.ka{border-right:1px solid #ccc}
 .tb{position:sticky;top:0;z-index:5;background:#fff;padding:8px;text-align:center;border-bottom:1px solid #999}.tb button{font:inherit;font-size:15px;padding:8px 18px;cursor:pointer}
 .sheet{break-after:page;page-break-after:always}
 @media print{body{background:#fff}.tb{display:none!important}.sheet{margin:0;box-shadow:none;width:auto;min-height:0;padding:0;break-after:page;page-break-after:always;break-inside:auto}.sheet:last-child{break-after:auto;page-break-after:auto}.frame{break-inside:auto}.ft{break-before:avoid}}`;
 /* اگر محتوای یک برگه کمی بلندتر از یک صفحه‌ی A4 شد، کمی کوچک می‌شود (حداکثر تا ۶۵٪) تا هر برگه دقیقاً یک صفحه بماند */
 const FIT="(function(){function fit(){var H=1045;document.querySelectorAll('.sheet').forEach(function(s){var f=s.querySelector('.frame');s.style.zoom='';var h=f.offsetHeight;if(h>H)s.style.zoom=Math.max(H/h,.65)})}addEventListener('load',function(){if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);else fit()});})();";
 function docHtml(b,standalone){
  const o={pts:false,fb:$('exbFb').checked,fbRows:($('exbFbRows').value||'').split('\n').map(x=>x.trim()).filter(Boolean),title:($('exbTitle').value||'').trim()||'ارزشیابی',bism:($('exbBism').value||'').trim(),date:($('exbDate').value||'').trim(),ans:($('exbAns').value||'none')};
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${E(o.title)}</title>${standalone?`<base href="${E(document.baseURI)}">`:''}<link rel="stylesheet" href="assets/css/fonts.css"><style>${CSS}</style></head><body>${standalone?'<div class="tb"><button type="button" onclick="print()">🖨️ چاپ / ذخیره به‌صورت PDF</button></div>':''}${b.sheets.map(s=>sheetHtml(s,b.ctx,o)).join('')}<script>${FIT}</script></body></html>`;
 }
 function missingAns(b){return $('exbAns').value==='none'?0:b.sheets.reduce((n,sh)=>n+sh.result.questions.filter(q=>!ansText(q)).length,0)}
 function openPreview(){
  const b=last;if(!b)return;
  $('exbFr').srcdoc=docHtml(b);
  $('exbOvT').textContent=`پیش‌نمایش: ${F(b.sheets.length)} برگه${$('exbAns').value==='sep'?' + '+F(b.sheets.length)+' صفحه‌ی پاسخ‌نامه':''} — در پنجره‌ی چاپ مقصد «ذخیره به‌صورت PDF» را بزنید.${missingAns(b)?' ⚠️ برای '+F(missingAns(b))+' سؤال پاسخ ثبت نشده است.':''}`;
  ov.classList.add('on');
 }
 function persist(){
  const c=cfg();c.title=$('exbTitle').value;c.count=$('exbCount').value;c.bism=$('exbBism').value;c.fb=$('exbFb').checked;c.fbRows=$('exbFbRows').value;c.ans=$('exbAns').value;c.bk=$('exbBk').value;
  const rm=readMix();if(rm.mix)c.mix=rm.mix;save();
 }
 function restore(){
  const c=cfg();
  if(c.title!=null)$('exbTitle').value=c.title;if(c.count)$('exbCount').value=c.count;if(c.bism!=null)$('exbBism').value=c.bism;
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
 $('exbTab').onclick=()=>{if(!last)return;const u=URL.createObjectURL(new Blob([docHtml(last,true)],{type:'text/html;charset=utf-8'}));if(!window.open(u,'_blank'))alert('مرورگر باز شدن تب جدید را مسدود کرد؛ اجازه‌ی پاپ‌آپ بدهید یا از دکمه‌ی چاپ همین صفحه استفاده کنید.');setTimeout(()=>URL.revokeObjectURL(u),120000)};
 $('exbClose').onclick=()=>ov.classList.remove('on');
 $('exbPrint').onclick=()=>{const w=$('exbFr').contentWindow;if(w){w.focus();w.print()}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))ov.classList.remove('on')});
 $('exbAll').onclick=()=>{sec.querySelectorAll('[data-sc]').forEach(x=>x.checked=true)};
 $('exbNone').onclick=()=>{sec.querySelectorAll('[data-sc]').forEach(x=>x.checked=false)};
 $('exbMixReset').onclick=()=>{cfg().mix=DEF_MIX();fillMix()};
 sec.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.sl!=null){const s=students().find(x=>String(x.id)===t.dataset.sl),bk=$('exbBk').value;
   if(s&&bk){s.qbkLv=s.qbkLv||{};s.qbkLvD=s.qbkLvD||{};if(t.value){s.qbkLv[bk]=t.value;s.qbkLvD[bk]=new Date().toISOString().slice(0,10)}else{delete s.qbkLv[bk];delete s.qbkLvD[bk];delete s.qbkLevel}save();fillStudents()}return}
  if(t.id==='exbGr'){$('exbBk').value='';$('exbTp').value=''}
  if(t.id==='exbBk')$('exbTp').value='';
  if(t.id==='exbGr'||t.id==='exbBk'){fillScope();fillStudents()}
  if(['exbGr','exbBk','exbTp','exbUnk'].includes(t.id)||(t.dataset&&t.dataset.ln!=null))renderSummary();
 });
 sec.addEventListener('input',e=>{if(['exbLf','exbLt','exbPf','exbPt'].includes(e.target.id))renderSummary()});
 function refresh(){hubCnt();fillScope();fillStudents();fillMix();restore();renderSummary()}
 const _show=window.show;
 window.show=function(id){const r=_show.apply(this,arguments);try{if(id==='exh')hubCnt();if(id==='exb')refresh()}catch(e){console.error('exam-builder',e)}return r};
 window.ExamBuilder=Object.freeze({build,sheetHtml,docHtml:()=>last?docHtml(last):''});
}catch(e){console.error('exam-builder',e)}})();

/* دفتر جلسات اولیا — جدول ۱۲: «ثبت دیدار آموزگار با اولیا به صورت فردی»
   ستون‌های دفتر کاغذی: ردیف | نام و نام خانوادگی دانش‌آموز | نسبت (پدر/مادر) | تاریخ مراجعه | موضوع مراجعه
   در این برنامه «اطلاعات لازم» و «نتیجه‌ی جلسه» هم اضافه شده است.
   داده‌ها در همان دفتر تماس با ولی (S.info[شناسه‌ی دانش‌آموز].pcl) و با نوع t:'meet' ذخیره می‌شود؛
   یعنی دیدارهای قبلی دفتر تماس سر جایشان می‌مانند و در این دفتر هم دیده می‌شوند.
   فیلدهای هر دیدار: id, t:'meet', date (میلادی YYYY-MM-DD), rel ('f' پدر | 'm' مادر), sub (موضوع), n (اطلاعات لازم), res (نتیجه) */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const REL={f:'پدر',m:'مادر'};
const SUBJ=['وضعیت درسی','رفتار و انضباط','غیبت و تأخیر','مسائل خانوادگی','درخواست اولیا','دعوت از سوی آموزگار'];
const dIso=iso=>{try{return fmt(new Date(iso+'T12:00:00Z'))}catch(e){return iso||''}};
const ymOf=iso=>{try{const p=jp(new Date(iso+'T12:00:00Z'));return p.y*100+p.m}catch(e){return 0}};
const ymLab=k=>MN[(k%100)-1]+' '+fa(Math.floor(k/100));
const stu=id=>(S.students||[]).find(s=>s.id===id);
const lst=id=>{const I=(S.info||{})[id];return(I&&Array.isArray(I.pcl))?I.pcl:[]};
const sname=s=>{const same=(S.students||[]).filter(x=>x.name===s.name).length>1,fn=((S.info||{})[s.id]||{}).fn;return s.name+(same&&fn?' (فرزند '+fn+')':'')};
const todayIso=()=>iso(tdy());

/* همه‌ی دیدارها، به ترتیب زمان (قدیمی ← جدید) با شماره‌ی ردیف پایدار */
function all(){const o=[];(S.students||[]).forEach(s=>{lst(s.id).forEach(x=>{if(x&&x.t==='meet')o.push({sid:s.id,name:sname(s),x})})});
 o.sort((a,b)=>(a.x.date||'').localeCompare(b.x.date||'')||(a.x.id-b.x.id));o.forEach((r,i)=>{r.no=i+1;
  /* دیدارهای قدیمی دفتر تماس فقط متن آزاد داشتند؛ به‌عنوان موضوع نمایش داده می‌شوند */
  r.sub=r.x.sub||r.x.n||'';r.nt=r.x.sub?(r.x.n||''):'';r.res=r.x.res||'';r.rel=r.x.rel||''});return o}

/* ───── ظاهر ───── */
const st=document.createElement('style');
st.textContent=`
#pmt .pmt-top{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
#pmt .pmt-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#pmt .pmt-k b{display:block;font-size:20px;color:var(--p);line-height:1.3}#pmt .pmt-k span{font-size:12px;color:var(--mut);font-weight:700}
#pmt .pmt-fl{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0}
#pmt .pmt-fl input,#pmt .pmt-fl select{margin:0;width:100%}
#pmt .pmt-q{grid-column:1/-1}
#pmt .pmt-e{position:relative;padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#pmt .pmt-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14.5px}
#pmt .pmt-no{min-width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(90deg,var(--p),var(--p2));color:#fff;font-size:12px}
#pmt .pmt-rel{border-radius:999px;padding:2px 10px;font-size:12px;font-weight:800}
#pmt .pmt-rel.f{background:#e3eefd;color:#1f5fbf}#pmt .pmt-rel.m{background:#fde7f1;color:#b8386f}#pmt .pmt-rel.x{background:var(--bg2);color:var(--mut)}
#pmt .pmt-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#pmt .pmt-l{margin-top:7px;font-size:14px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#pmt .pmt-l i{font-style:normal;font-weight:800;color:var(--p);margin-left:4px;font-size:12.5px}
#pmt .pmt-ac{display:flex;gap:8px;margin-top:8px}
#pmt .pmt-ac button{flex:1;margin:0}
#pmt .pmt-ex{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#pmt .pmt-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
.pmt-ov{position:fixed;inset:0;z-index:9100;background:#0008;display:none;align-items:flex-end;justify-content:center}
.pmt-ov.on{display:flex}
.pmt-bx{background:var(--card);color:var(--tx);width:100%;max-width:560px;max-height:94vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px;box-shadow:0 -8px 30px #0004;direction:rtl;text-align:right}
@media(min-width:640px){.pmt-ov{align-items:center}.pmt-bx{border-radius:22px}}
.pmt-bx h3{margin:0 0 8px;font-size:16px;color:var(--p)}
.pmt-bx label{display:block;font-weight:800;font-size:13px;margin:10px 0 4px}
.pmt-bx select,.pmt-bx input,.pmt-bx textarea{width:100%;margin:0;border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:10px;font:inherit;box-sizing:border-box}
.pmt-bx textarea{min-height:74px;resize:vertical}
.pmt-rg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pmt-rg button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:14px;padding:11px;font:800 15px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pmt-rg button.on{border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2));color:#fff}
.pmt-dr{display:grid;grid-template-columns:1fr 1.5fr 1.2fr auto;gap:6px}
.pmt-dr button{border:0;border-radius:12px;background:var(--bg2);color:var(--p);font:800 13px Vazirmatn,Tahoma,sans-serif;padding:0 12px;cursor:pointer}
.pmt-ch{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pmt-ch button{border:0;border-radius:999px;background:var(--bg2);color:var(--tx);font:700 12.5px Vazirmatn,Tahoma,sans-serif;padding:6px 11px;cursor:pointer}
.pmt-er{color:#d9534f;font-weight:800;font-size:13px;min-height:18px;margin-top:8px}
.pmt-fa{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-top:6px}
.pmt-fa button{border:0;border-radius:14px;padding:12px;font:800 15px Vazirmatn,Tahoma,sans-serif;cursor:pointer;background:var(--bg2);color:var(--tx)}
.pmt-fa button.go{color:#fff;background:linear-gradient(90deg,var(--p),var(--p2))}
#pmtPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4{box-sizing:border-box;width:794px;height:1123px;overflow:hidden;position:relative;background:#fff;color:#222;direction:rtl;text-align:right;font:400 12px/1.5 Vazirmatn,Tahoma,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pmtA4 *{box-sizing:border-box}
.pmtA4 .pmt-in{padding:30px 38px 26px;height:1123px;position:relative}
.pmtA4 .pmt-hd{text-align:center;border-bottom:3px solid #7e57c2;padding-bottom:8px;margin-bottom:10px}
.pmtA4 .pmt-hd b{display:block;font-size:19px;color:#4b3478}
.pmtA4 .pmt-hd span{display:block;font-size:11.5px;color:#555;margin-top:3px}
.pmtA4 table{width:100%;border-collapse:collapse;table-layout:fixed;border:2px solid #222}
.pmtA4 th{background:#ece6f7!important;color:#222!important;border:1.5px solid #333;padding:7px 4px;font-size:12.5px;font-weight:800;text-align:center}
.pmtA4 td{color:#222;background:#fff;border:1.3px solid #333;padding:6px 7px;font-size:12px;text-align:right;vertical-align:middle;word-break:break-word;white-space:pre-wrap}
.pmtA4 td.c{text-align:center}.pmtA4 thead{display:table-header-group}
.pmtA4 td small{display:block;color:#555;font-size:10.5px;margin-top:3px}
.pmtA4 tr.bl td{height:34px}
.pmtA4 .pmt-ft{position:absolute;left:38px;right:38px;bottom:18px;display:flex;justify-content:space-between;font-size:11px;color:#444}
@media print{body.pmt-printing>*:not(#pmtPrintRoot){display:none!important}body.pmt-printing #pmtPrintRoot{position:static!important;left:auto!important;display:block!important}body.pmt-printing .pmtA4{break-after:page;page-break-after:always}body.pmt-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
@media(max-width:520px){#pmt .pmt-top{grid-template-columns:repeat(2,1fr)}#pmt .pmt-fl{grid-template-columns:1fr 1fr}}
`;
document.head.appendChild(st);

/* ───── صفحه ───── */
const sec=document.createElement('section');sec.id='pmt';
sec.innerHTML='<h2>🤝 دفتر جلسات اولیا</h2><div class="card"><b>📒 جدول ۱۲ — ثبت دیدار آموزگار با اولیا به صورت فردی</b><p class="sub" style="text-align:right;margin:6px 0 10px">هر دیدار حضوریِ پدر یا مادر را با تاریخ، موضوع، اطلاعات لازم و نتیجه ثبت کنید. این دفتر همان «دفتر تماس با ولی» در پرونده‌ی دانش‌آموز است؛ دیدارهای قبلی هم اینجا دیده می‌شوند.</p><button class="big" data-pm="new" style="font-size:16px;padding:12px">➕ ثبت دیدار جدید</button><div class="pmt-top" id="pmtK"></div></div><div class="card"><div class="pmt-fl"><input id="pmtQ" class="pmt-q" placeholder="🔍 جستجوی نام دانش‌آموز، موضوع یا نتیجه…"><select id="pmtR" aria-label="نسبت"><option value="">همه‌ی اولیا</option><option value="f">فقط پدر</option><option value="m">فقط مادر</option></select><select id="pmtMo" aria-label="ماه"></select></div><div id="pmtL"></div></div><div class="card"><b>📤 خروجی جدول ۱۲</b><p class="sub" style="text-align:right;margin:4px 0 0">همه‌ی دیدارها (یا فقط نتیجه‌ی فیلتر بالا) به‌صورت جدول A4 شبیه دفتر کاغذی.</p><div class="pmt-ex"><button class="big ex" data-pm="print">🖨️ چاپ</button><button class="big ex" data-pm="pdf">📄 فایل PDF</button><button class="big ex" data-pm="xls" style="grid-column:1/-1">📊 فایل اکسل</button></div><p class="sub" id="pmtMsg"></p></div>';
const anchor=$('rep')||$('pm');anchor?anchor.before(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='pmt'))pages.push(['pmt','🤝 دفتر جلسات اولیا']);

const F={q:'',r:'',mo:''};
function filtered(){const A=all(),q=F.q.trim();return A.filter(r=>(!F.r||r.rel===F.r)&&(!F.mo||String(ymOf(r.x.date))===F.mo)&&(!q||(r.name+' '+r.sub+' '+r.nt+' '+r.res).includes(q)))}
function render(){if(!$('pmtL'))return;const A=all(),cm=ymOf(todayIso());
 const kp=(v,t)=>`<div class="pmt-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('pmtK').innerHTML=kp(A.length,'کل دیدارها')+kp(A.filter(r=>r.rel==='f').length,'دیدار با پدر')+kp(A.filter(r=>r.rel==='m').length,'دیدار با مادر')+kp(A.filter(r=>ymOf(r.x.date)===cm).length,'دیدار این ماه');
 const ms=[...new Set(A.map(r=>ymOf(r.x.date)))].filter(Boolean).sort((a,b)=>b-a),sel=$('pmtMo');
 sel.innerHTML='<option value="">همه‌ی ماه‌ها</option>'+ms.map(k=>`<option value="${k}">${ymLab(k)}</option>`).join('');if(!ms.map(String).includes(F.mo))F.mo='';sel.value=F.mo;
 const L=filtered().slice().reverse();
 $('pmtL').innerHTML=L.length?L.map(r=>{const rl=r.rel?`<span class="pmt-rel ${r.rel}">${REL[r.rel]}</span>`:'<span class="pmt-rel x">نسبت ثبت نشده</span>';
  return `<div class="pmt-e"><div class="pmt-h"><span class="pmt-no">${fa(r.no)}</span><span>${E(r.name)}</span>${rl}<span class="pmt-d">📅 ${dIso(r.x.date)}</span></div>
  ${r.sub?`<div class="pmt-l"><i>موضوع مراجعه:</i>${E(r.sub)}</div>`:''}${r.nt?`<div class="pmt-l"><i>اطلاعات لازم:</i>${E(r.nt)}</div>`:''}${r.res?`<div class="pmt-l"><i>نتیجه:</i>${E(r.res)}</div>`:''}
  <div class="pmt-ac"><button class="sm" data-pm="edit" data-s="${r.sid}" data-i="${r.x.id}">✏️ ویرایش</button><button class="sm" data-pm="del" data-s="${r.sid}" data-i="${r.x.id}">🗑 حذف</button></div></div>`}).join(''):
  `<div class="pmt-em">${A.length?'موردی با این فیلتر پیدا نشد.':'هنوز دیداری ثبت نشده است.<br>با دکمه‌ی «ثبت دیدار جدید» اولین مورد را ثبت کنید.'}</div>`}

/* ───── فرم ثبت و ویرایش ───── */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='pmtOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;/* {sid,id,rel,y,m,d} */
const dim=(m)=>m<=6?31:30;
function formHtml(){const stus=(S.students||[]).slice().sort((a,b)=>a.name.localeCompare(b.name,'fa'));
 const y0=jp(tdy()).y,ys=[];for(let y=y0-2;y<=y0+1;y++)ys.push(y);if(ed.y&&!ys.includes(ed.y))ys.push(ed.y);ys.sort((a,b)=>a-b);
 return `<h3>${ed.id?'✏️ ویرایش دیدار':'🤝 ثبت دیدار جدید با اولیا'}</h3>
 <label>نام و نام خانوادگی دانش‌آموز</label><select id="pmtS"><option value="">— انتخاب دانش‌آموز —</option>${stus.map(s=>`<option value="${s.id}"${s.id===ed.sid?' selected':''}>${E(sname(s))}</option>`).join('')}</select>
 <label>نسبت (چه کسی مراجعه کرد؟)</label><div class="pmt-rg"><button type="button" data-rl="f" class="${ed.rel==='f'?'on':''}">👨 پدر</button><button type="button" data-rl="m" class="${ed.rel==='m'?'on':''}">👩 مادر</button></div>
 <label>تاریخ مراجعه (شمسی)</label><div class="pmt-dr"><select id="pmtD" aria-label="روز">${Array.from({length:31},(_,i)=>`<option value="${i+1}"${ed.d===i+1?' selected':''}>${fa(i+1)}</option>`).join('')}</select><select id="pmtM" aria-label="ماه">${MN.map((n,i)=>`<option value="${i+1}"${ed.m===i+1?' selected':''}>${n}</option>`).join('')}</select><select id="pmtY" aria-label="سال">${ys.map(y=>`<option value="${y}"${ed.y===y?' selected':''}>${fa(y)}</option>`).join('')}</select><button type="button" data-pm="today">امروز</button></div>
 <label>موضوع مراجعه</label><input id="pmtSub" maxlength="200" placeholder="مثلاً: بررسی وضعیت درسی و تکالیف" value="${E(ed.sub)}"><div class="pmt-ch">${SUBJ.map(t=>`<button type="button" data-ch="${E(t)}">${t}</button>`).join('')}</div>
 <label>اطلاعات لازم (اختیاری)</label><textarea id="pmtN" placeholder="نکته‌های مهمی که در جلسه مطرح شد یا باید به‌خاطر بماند…">${E(ed.n)}</textarea>
 <label>نتیجه‌ی جلسه (اختیاری)</label><textarea id="pmtRes" placeholder="مثلاً: قرار شد ولی هر روز تکالیف را کنترل کند و دو هفته‌ی دیگر پیگیری شود">${E(ed.res)}</textarea>
 <div class="pmt-er" id="pmtEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-pm="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت در دفتر'}</button><button type="button" data-pm="cancel">انصراف</button></div>`}
function setDate(iso0){const p=jp(new Date(iso0+'T12:00:00Z'));ed.y=p.y;ed.m=p.m;ed.d=p.d}
/* o: {sid} برای ثبت جدید برای یک دانش‌آموز | {sid,id} برای ویرایش */
function openForm(o){o=o||{};ed={sid:o.sid||0,id:o.id||0,rel:'',sub:'',n:'',res:''};
 if(o.id){const x=lst(o.sid).find(q=>q.id===o.id);if(!x)return;ed.rel=x.rel||'';ed.sub=x.sub||x.n||'';ed.n=x.sub?(x.n||''):'';ed.res=x.res||'';setDate(x.date||todayIso())}else setDate(todayIso());
 if(!(S.students||[]).length){alert('ابتدا دانش‌آموزان کلاس را ثبت کنید.');return}
 ov.firstElementChild.innerHTML=formHtml();ov.classList.add('on')}
function closeForm(){ov.classList.remove('on');ed=null}
function readDate(){const y=+$('pmtY').value,m=+$('pmtM').value,d=+$('pmtD').value;if(d>dim(m))return null;const g=fromJ(y,m,d),p=jp(g);return(p.y===y&&p.m===m&&p.d===d)?iso(g):null}
function saveForm(){const er=t=>{$('pmtEr').textContent=t};
 const sid=+$('pmtS').value,sub=$('pmtSub').value.trim(),n=$('pmtN').value.trim(),res=$('pmtRes').value.trim(),dt=readDate();
 if(!sid||!stu(sid)){er('لطفاً دانش‌آموز را انتخاب کنید.');return}
 if(!ed.rel){er('لطفاً نسبت را مشخص کنید: پدر یا مادر.');return}
 if(!dt){er('تاریخ انتخاب‌شده معتبر نیست.');return}
 if(!sub){er('موضوع مراجعه را بنویسید.');$('pmtSub').focus();return}
 S.info=S.info||{};
 if(ed.id){/* ویرایش (و در صورت تغییر دانش‌آموز، انتقال) */
  const old=lst(ed.sid),x=old.find(q=>q.id===ed.id);if(!x){closeForm();return}
  Object.assign(x,{t:'meet',date:dt,rel:ed.rel,sub,n,res});
  if(sid!==ed.sid){S.info[ed.sid].pcl=old.filter(q=>q!==x);const I=S.info[sid]=S.info[sid]||{};I.pcl=Array.isArray(I.pcl)?I.pcl:[];I.pcl.push(x)}
 }else{
  const I=S.info[sid]=S.info[sid]||{};I.pcl=Array.isArray(I.pcl)?I.pcl:[];
  let id=Date.now();const used=new Set(I.pcl.map(q=>q.id));while(used.has(id))id++;
  I.pcl.push({id,t:'meet',date:dt,rel:ed.rel,sub,n,res})}
 save();closeForm();render();try{if(window.renderSF&&$('sf')&&$('sf').classList.contains('on'))window.renderSF()}catch(e){}}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const rl=t.closest('[data-rl]');if(rl){ed.rel=rl.dataset.rl;ov.querySelectorAll('[data-rl]').forEach(b=>b.classList.toggle('on',b===rl));$('pmtEr').textContent='';return}
 const ch=t.closest('[data-ch]');if(ch){const i=$('pmtSub');i.value=ch.dataset.ch;i.focus();return}
 const a=t.closest('[data-pm]');if(!a)return;const k=a.dataset.pm;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();
 else if(k==='today'){setDate(todayIso());$('pmtY').value=ed.y;$('pmtM').value=ed.m;$('pmtD').value=ed.d}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});

/* ───── رویدادهای صفحه ───── */
sec.addEventListener('input',e=>{if(e.target.id==='pmtQ'){F.q=e.target.value;render()}});
sec.addEventListener('change',e=>{if(e.target.id==='pmtR'){F.r=e.target.value;render()}else if(e.target.id==='pmtMo'){F.mo=e.target.value;render()}});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-pm]');if(!b)return;const k=b.dataset.pm;
 if(k==='new')openForm();
 else if(k==='edit')openForm({sid:+b.dataset.s,id:+b.dataset.i});
 else if(k==='del'){if(!confirm('این دیدار از دفتر جلسات اولیا حذف شود؟'))return;const sid=+b.dataset.s,id=+b.dataset.i,I=(S.info||{})[sid];if(I&&Array.isArray(I.pcl)){I.pcl=I.pcl.filter(x=>x.id!==id);save();render()}}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* ───── خروجی ───── */
const msg=t=>{const m=$('pmtMsg');if(m)m.textContent=t||''};
const colsHead=['ردیف','نام و نام خانوادگی دانش‌آموز','نسبت','تاریخ مراجعه','موضوع مراجعه','نتیجه'];
const W=[44,150,52,84,238,150];/* جمع = ۷۱۸ پیکسل */
function rowHtml(r){return `<tr><td class="c">${fa(r.no)}</td><td>${E(r.name)}</td><td class="c">${r.rel?REL[r.rel]:'—'}</td><td class="c">${dIso(r.x.date)}</td><td>${E(r.sub)}${r.nt?`<small>اطلاعات لازم: ${E(r.nt)}</small>`:''}</td><td>${E(r.res)}</td></tr>`}
const theadHtml=`<thead><tr>${colsHead.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`;
const colgroup=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
function headHtml(){let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}
 return `<div class="pmt-hd"><b>جدول ۱۲ / ثبت دیدار آموزگار با اولیا به صورت فردی</b>${l?`<span>${E(l)}</span>`:''}</div>`}
function mountRoot(){let r=$('pmtPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='pmtPrintRoot';document.body.appendChild(r);return r}
/* ساخت صفحه‌های A4 با اندازه‌گیری واقعی ارتفاع ردیف‌ها */
function buildPages(rows){const root=mountRoot();
 const probe=document.createElement('div');probe.className='pmtA4';
 probe.innerHTML=`<div class="pmt-in">${headHtml()}<table>${colgroup}${theadHtml}<tbody>${rows.map(rowHtml).join('')}</tbody></table></div>`;root.appendChild(probe);
 const hh=probe.querySelector('.pmt-hd').offsetHeight+10,th=probe.querySelector('thead').offsetHeight,trs=[...probe.querySelectorAll('tbody tr')].map(t=>t.offsetHeight);
 const avail=1123-30-26-34-hh-th-6,BL=35,pg=[];let cur=[],used=0;
 rows.forEach((r,i)=>{const h=Math.min(trs[i]||BL,avail);if(cur.length&&used+h>avail){pg.push({rows:cur,used});cur=[];used=0}cur.push(r);used+=h});
 pg.push({rows:cur,used});
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,i)=>{let blank='';if(i===tot-1){const n=Math.floor((avail-p.used)/BL);blank=Array.from({length:Math.max(0,n)},()=>'<tr class="bl"><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}
  const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}<table>${colgroup}${theadHtml}<tbody>${p.rows.map(rowHtml).join('')}${blank}</tbody></table><div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(i+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 return root}
function cleanup(){document.body.classList.remove('pmt-printing');const r=$('pmtPrintRoot');if(r)r.remove()}
window.addEventListener('afterprint',cleanup);
function exportRows(){const r=filtered();if(!r.length){msg('ابتدا دست‌کم یک دیدار ثبت کنید (یا فیلتر را تغییر دهید).');return null}return r}
async function doPrint(){const rows=exportRows();if(!rows)return;msg('');try{await document.fonts.ready}catch(e){}buildPages(rows);document.body.classList.add('pmt-printing');setTimeout(()=>{try{window.print()}catch(e){cleanup()}},80)}
async function doPdf(){const rows=exportRows();if(!rows)return;msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=buildPages(rows),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('دفتر-جلسات-اولیا-جدول-۱۲-'+jstampSafe()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در مرورگر باز کنید یا از «چاپ» و گزینه‌ی Save as PDF استفاده کنید.')}
 catch(x){cleanup();msg('⚠️ ساخت PDF ناموفق بود: '+(x&&x.message?x.message:x))}}
const jstampSafe=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doXls(){const rows=exportRows();if(!rows)return;msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۲',title:'جدول ۱۲ / ثبت دیدار آموزگار با اولیا به صورت فردی',sub:'دفتر جلسات اولیا',info:typeof profLine==='function'?profLine():'',
   head:['ردیف','نام و نام خانوادگی دانش‌آموز','نسبت','تاریخ مراجعه','موضوع مراجعه','اطلاعات لازم','نتیجه'],
   rows:rows.map(r=>[r.no,r.name,r.rel?REL[r.rel]:'—',dIso(r.x.date),r.sub,r.nt,r.res]),nameCol:1,widths:[6,26,9,13,34,30,34],sign:true});
  await window.dlFile('دفتر-جلسات-اولیا-جدول-۱۲-'+jstampSafe()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در مرورگر باز کنید.')}
 catch(x){msg('⚠️ ساخت اکسل ناموفق بود: '+(x&&x.message?x.message:x))}}

/* ───── اتصال به منو و دفتر تماس ───── */
const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='pmt')render()}catch(e){console.error('pmt',e)}return r};
const _r=window.render;if(typeof _r==='function'){window.render=function(){const r=_r.apply(this,arguments);try{if($('pmt')&&$('pmt').classList.contains('on'))render()}catch(e){}return r}}
window.PMT={open:openForm,all,render};
}catch(e){console.error('parent-meetings',e)}})();

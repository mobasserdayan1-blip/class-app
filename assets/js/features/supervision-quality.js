/* کیفیت تدریس در کلاس‌های حضوری و مجازی توسط مدیر و معاون آموزشی — جدول ۱۶ / فرم ۹ (سال تحصیلی ۱۴۰۵-۱۴۰۶)
   ۲۵ شاخص با متن دقیقِ فرم کاغذی؛ برای هر شاخص یکی از چهار سطح: ۱ الگو (سرآمد) | ۲ بالاتر از حد انتظار | ۳ در حد انتظار | ۴ نیازمند بهبود
   ستون «حوزه» در عکس جدول بریده شده بود؛ پس خالی است و کاربر خودش پر می‌کند (برای هر ردیف یا یکجا برای چند ردیف).
   داده‌ها در S.nzq (شیء) ذخیره می‌شود: {sc:[۲۵ عدد ۰ تا ۴], dom:[۲۵ متن]}
   فقط کلید تازه؛ داده‌ی قبلی (از جمله جدول ۱۵ = S.nzr) تغییری نمی‌کند. ثبت/مشاهده/ویرایش/حذف با تأیید، چاپ، PDF و اکسل. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ── متن دقیق ۲۵ شاخص از تصویر جدول ۱۶: [شاخص ارزیابی, شواهد عینی] ── */
const ITEMS=[
['هدف گذاری و هم راستایی','اهداف درس به‌صورت عینی، قابل‌سنجش و هم‌راستا با اهداف کلی دوره و ساحت‌های شش‌گانه تربیتی در طرح درس درج شده است.'],
['ساختار و ترتیب منطقی محتوا','طرح درس دارای ساختار منسجم (شروع، توسعه، جمع‌بندی) و ترتیب منطقی در ارائه محتواست.'],
['شناخت مخاطب و توجه به تفاوت های فردی','در طراحی درس، به نیازها، سطح دانش پیشین و تفاوت‌های فردی دانش‌آموزان (دیرآموز، تیزهوش، دارای اختلال یادگیری) توجه شده است.'],
['طراحی فعالیت های یادگیری فعال','فعالیت‌های پیش‌بینی‌شده متنوع، فعال‌کننده (پویا، مشارکتی، مبتنی بر کاوش) و متناسب با اهداف درس هستند.'],
['جو عاطفی و روانی','کلاس دارای فضایی امن، حمایت‌گر، توأم با احترام متقابل و عاری از تنش است.'],
['مدیریت زمان و نظم','جریان درس با زمان‌بندی منطبق است، فعالیت‌ها به‌موقع شروع و خاتمه می‌یابند و زمان یادگیری به حداکثر می‌رسد.'],
['مدیریت رفتار و مشارکت','هنجارهای کلاسی شفاف است و رفتارهای نامطلوب با رویکردی تربیتی و ترمیمی مدیریت می‌شود.'],
['چیدمان و فضای یادگیری (ویژه حضوری)','چیدمان صندلی‌ها انعطاف‌پذیر و متناسب با نوع فعالیت (گروهی، فردی، بحث) است.'],
['شفاف‌سازی اهداف','اهداف درس و معیارهای موفقیت در ابتدای جلسه به‌طور شفاف برای دانش‌آموزان تبیین می‌شود.'],
['ارائه و توضیح محتوا','محتوا به شکلی دقیق، روشن، منطقی و متناسب با سطح درک دانش‌آموزان ارائه می‌شود.'],
['پرسشگری و تفکر سطح بالا','پرسش‌ها فراتر از حافظه بوده و تفکر انتقادی، تحلیلی و خلاقیت را در دانش‌آموزان برمی‌انگیزند.'],
['تنوع روش‌های تدریس','از روش‌های فعال و متنوع (کار گروهی، بحث، بازی، کاوشگری، حل مسئله) به‌طور هدفمند استفاده می‌شود.'],
['کاربست فناوری و ابزارهای دیجیتال','از ابزارها و محتوای دیجیتال (تخته هوشمند، ویدئو، نرم‌افزار، شاد) به‌طور مؤثر و هدفمند برای تسهیل یادگیری استفاده می‌شود.'],
['ارتباط با زندگی واقعی','محتوای درس با تجربیات و نیازهای روزمره دانش‌آموزان مرتبط و کاربردی‌سازی می‌شود.'],
['ارزشیابی تکوینی (فرایندی)','در حین تدریس، با روش‌های متنوع (پرسش، کارت‌های پاسخ، آزمونک) از درک و یادگیری دانش‌آموزان بازخورد لحظه‌ای گرفته می‌شود.'],
['ارائه بازخورد مؤثر','بازخورد ارائه‌شده به دانش‌آموزان، اختصاصی، به‌موقع، سازنده و بر بهبود فرایند یادگیری متمرکز است.'],
['انطباق و تمایز در ارزشیابی','نحوه ارزشیابی با اهداف درس هم‌راستا بوده و برای دانش‌آموزان با سطوح مختلف، تمایز قائل می‌شود.'],
['ارزشیابی پایانی و جمع‌بندی','در پایان جلسه، خلاصه‌ای از مفاهیم کلیدی ارائه و تکالیف به‌صورت شفاف تعیین می‌شود.'],
['استفاده از ابزارهای تعاملی مجازی','در کلاس مجازی، از ابزارهای تعاملی (نظرسنجی، گفت‌وگوی صوتی، کلاس مجازی) برای افزایش مشارکت دانش‌آموزان استفاده می‌شود.'],
['کیفیت محتوای دیجیتال','محتوای بارگذاری‌شده در بستر مجازی (فیلم‌های آموزشی، پادکست، فایل‌های تعاملی) از کیفیت فنی و محتوایی مناسبی برخوردار است.'],
['مدیریت کلاس مجازی','قوانین مشارکت در کلاس مجازی شفاف است، قطع‌های صوتی و تصویری به‌خوبی مدیریت می‌شود و دانش‌آموزان برای مشارکت تشویق می‌شوند.'],
['تأمل و بهبود مستمر','نسبت به عملکرد خود تأمل داشته و برای رفع کاستی‌ها و ارتقای دانش حرفه‌ای خود برنامه‌ریزی می‌کند.'],
['مشارکت در اجتماعات یادگیری','در جلسات گروه‌های آموزشی، شورای آموزگاران و شبکه‌های حرفه‌ای مشارکت فعال دارد و تجارب خود را به اشتراک می‌گذارد.'],
['تعامل با اولیا و جامعه','با اولیا ارتباطی برنامه‌ریزی‌شده و مستمر دارد و آنان را در جریان روند تربیتی و آموزشی فرزندشان قرار می‌دهد.'],
['تعهد به اجرای برنامه‌های مدرسه','در اجرای دقیق و خلاقانه طرح‌ها و برنامه‌های مصوب مدرسه و حوزه پرورشی همکاری می‌کند.']
];
const N=ITEMS.length;
const LV=['الگو (سرآمد)','بالاتر از حد انتظار','در حد انتظار','نیازمند بهبود'];
const LS=['الگو','بالاتر از انتظار','در حد انتظار','نیازمند بهبود'];
const LC=['#1a8f55','#2f80c8','#b8960a','#d9534f'];
const TITLE='جدول ۱۶ / فرم ۹ (کیفیت تدریس در کلاس‌های حضوری و مجازی توسط مدیر و معاون آموزشی) (سال تحصیلی ۱۴۰۵-۱۴۰۶)';
const FOOT='این فرم در پایان سال تحصیلی توسط مدیر یا معاون آموزشی تکمیل و در ارزشیابی سالانه مورد بهره‌برداری قرار گیرد.';

/* ── داده ── */
const rec=()=>{const o=S.nzq;return o&&typeof o==='object'&&!Array.isArray(o)?o:null};
const scOf=i=>{const r=rec(),v=r&&Array.isArray(r.sc)?r.sc[i]:0;return v>=1&&v<=4?v:0};
const domOf=i=>{const r=rec(),v=r&&Array.isArray(r.dom)?r.dom[i]:'';return v?String(v):''};
const filled=()=>ITEMS.filter((_,i)=>scOf(i)).length;
const has=()=>!!rec()&&(filled()>0||ITEMS.some((_,i)=>domOf(i)));
const cnt=v=>ITEMS.filter((_,i)=>scOf(i)===v).length;

const st=document.createElement('style');
st.textContent=`
#nzq .nzq-top{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:10px 0}
#nzq .nzq-k{border-radius:14px;padding:9px 2px;text-align:center;background:var(--bg2)}
#nzq .nzq-k b{display:block;font-size:19px;color:var(--p)}#nzq .nzq-k span{font-size:10.5px;color:var(--mut);font-weight:700;line-height:1.5;display:block}
#nzq .nzq-e{padding:10px 12px;margin-bottom:8px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#nzq .nzq-h{display:flex;align-items:flex-start;gap:8px;font-weight:800;font-size:14px;line-height:1.8}
#nzq .nzq-h i,.nzq-q i{font-style:normal;flex:none;width:24px;height:24px;border-radius:50%;background:var(--bg2);color:var(--p);display:grid;place-items:center;font-size:12px;font-weight:800;margin-top:2px}
#nzq .nzq-h span{flex:1}
#nzq .nzq-bd{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:800;white-space:nowrap;flex:none}
#nzq .nzq-bd.no{background:var(--bg2);color:var(--mut)}
#nzq .nzq-ev{margin:3px 34px 0 0;font-size:12.5px;line-height:1.9;color:var(--mut)}
#nzq .nzq-dm{margin:3px 34px 0 0;font-size:12px;font-weight:800;color:var(--p)}
#nzq .nzq-ac{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}#nzq .nzq-ac button{margin:0}
#nzq .nzq-ex{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}#nzq .nzq-ex button{margin:0;font-size:13px;padding:9px 4px}
#nzq .nzq-em{text-align:center;color:var(--mut);padding:14px 0;font-size:14px;line-height:2}
.nzq-av{position:sticky;top:-1px;z-index:3;margin:10px 0 2px;padding:9px 12px;border-radius:14px;background:var(--bg2);border:1.5px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:800;font-size:13.5px}
.nzq-av b{color:var(--p);font-size:17px}
.nzq-bk{padding:10px;border:1.5px dashed var(--line);border-radius:14px;margin-top:8px}
.nzq-bk .r{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px;font-size:13px;font-weight:700}
.nzq-bk input[type=number]{width:62px;margin:0;text-align:center}.nzq-bk input[type=text]{flex:1;min-width:120px;margin:0}.nzq-bk button{margin:0}
.nzq-it{padding:10px;border:1.5px solid var(--line);border-radius:14px;margin-top:8px;background:var(--card)}
.nzq-q{display:flex;gap:8px;font-size:13.5px;line-height:1.9;font-weight:700}
.nzq-q em{display:block;font-style:normal;font-weight:500;font-size:12.5px;color:var(--mut);line-height:1.85}
.nzq-sc{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:7px}
.nzq-sc button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:6px 2px;font:700 10.5px/1.4 Vazirmatn,Tahoma,sans-serif;cursor:pointer;margin:0;min-width:0}
.nzq-sc button.on{background:linear-gradient(90deg,var(--p),var(--p2));border-color:var(--p);color:#fff}
.nzq-it input.nzq-dmi{margin:7px 0 0;font-size:13px}
#nzqPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4 table.nzq-t td{padding:4px 6px;line-height:1.6;font-size:11px}.pmtA4 table.nzq-t th{padding:5px 2px;font-size:11.5px;line-height:1.45}
.pmtA4 table.nzq-t td.nzq-d{text-align:center;font-weight:800;font-size:10.5px;background:#f3f0f9}
.pmtA4 table.nzq-t td.nzq-t1{font-weight:800;text-align:center}
.pmtA4 table.nzq-t td.nzq-mk{font-size:16px;font-weight:800;color:#1a1a1a;text-align:center}
.pmtA4 .nzq-fn{margin-top:12px;font-size:12px;font-weight:800;line-height:1.9}
@media print{body.nzq-printing>*:not(#nzqPrintRoot){display:none!important}body.nzq-printing #nzqPrintRoot{position:static!important;left:auto!important;display:block!important}body.nzq-printing .pmtA4{break-after:page;page-break-after:always}body.nzq-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
@media(max-width:520px){.nzq-sc button{font-size:9.5px}}
`;
document.head.appendChild(st);

/* ── صفحه ── */
const sec=document.createElement('section');sec.id='nzq';
sec.innerHTML='<h2>📋 کیفیت تدریس — مدیر و معاون</h2><div class="card"><b>📒 جدول ۱۶ / فرم ۹ — کیفیت تدریس در کلاس‌های حضوری و مجازی توسط مدیر و معاون آموزشی (سال تحصیلی ۱۴۰۵-۱۴۰۶)</b><p class="sub" style="text-align:right;margin:6px 0 10px">برای هر یک از ۲۵ شاخص، یکی از چهار سطح «الگو (سرآمد)»، «بالاتر از حد انتظار»، «در حد انتظار» یا «نیازمند بهبود» را ثبت کنید. ستون «حوزه» را هم می‌توانید بنویسید.</p><button class="big" data-nq="edit" id="nzqBtn" style="font-size:16px;padding:12px">✏️ ثبت / ویرایش ارزیابی</button><div class="nzq-top" id="nzqK"></div></div><div class="card"><div id="nzqL"></div><div class="nzq-ac" id="nzqAc"></div></div><div class="card"><b>📤 خروجی جدول ۱۶</b><p class="sub" style="text-align:right;margin:6px 0 0">چاپ، PDF و اکسل با همان ستون‌ها و ۲۵ ردیف فرم کاغذی.</p><div class="nzq-ex"><button class="sm" data-nq="print">🖨️ چاپ</button><button class="sm" data-nq="pdf">📄 PDF</button><button class="sm" data-nq="xls">📊 اکسل</button></div><p class="sub" id="nzqMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p></div>';
const anchor=$('nzr')||$('hsv')||$('tex')||$('tsa')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='nzq'))pages.push(['nzq','📋 کیفیت تدریس (جدول ۱۶)']);

function render(){if(!$('nzqL'))return;
 const kp=(v,t)=>`<div class="nzq-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('nzqK').innerHTML=LS.map((t,k)=>kp(cnt(k+1),t)).join('')+kp(N-filled(),'بدون ارزیابی');
 $('nzqBtn').textContent=filled()||has()?'✏️ ویرایش ارزیابی':'✏️ ثبت ارزیابی';
 $('nzqL').innerHTML=ITEMS.map((t,i)=>{const v=scOf(i),d=domOf(i);
  return `<div class="nzq-e"><div class="nzq-h"><i>${fa(i+1)}</i><span>${E(t[0])}</span>${v?`<span class="nzq-bd" style="background:${LC[v-1]}">${LV[v-1]}</span>`:'<span class="nzq-bd no">—</span>'}</div>${d?`<div class="nzq-dm">حوزه: ${E(d)}</div>`:''}<div class="nzq-ev">${E(t[1])}</div></div>`}).join('');
 $('nzqAc').innerHTML=has()?'<button class="sm" data-nq="del" style="grid-column:1/-1">🗑 حذف کل ارزیابی جدول ۱۶</button>':'<div class="nzq-em" style="grid-column:1/-1">هنوز ارزیابی‌ای ثبت نشده است.<br>با «ثبت ارزیابی» شروع کنید.</div>'}

/* ── فرم ثبت / ویرایش ── */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='nzqOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;
const avHtml=()=>{const a=ed.sc.filter(v=>v>0).length;return `<span>ارزیابی‌شده: <b>${fa(a)}</b> از ${fa(N)} شاخص</span>`};
function formHtml(){return `<h3>✏️ جدول ۱۶ — کیفیت تدریس (مدیر و معاون)</h3>
 <div class="nzq-av" id="nzqAv">${avHtml()}</div>
 <div class="nzq-bk"><b style="font-size:13px">ستون «حوزه» (اختیاری) — یکجا برای چند ردیف</b><div class="r"><span>از ردیف</span><input type="number" id="nzqFa" min="1" max="${N}" inputmode="numeric"><span>تا</span><input type="number" id="nzqTo" min="1" max="${N}" inputmode="numeric"></div><div class="r"><input type="text" id="nzqDt" placeholder="نام حوزه"><button type="button" class="sm" data-nq="bulk">اعمال</button></div></div>
 ${ITEMS.map((t,i)=>`<div class="nzq-it" data-i="${i}"><div class="nzq-q"><i>${fa(i+1)}</i><span>${E(t[0])}<em>${E(t[1])}</em></span></div><div class="nzq-sc">${LV.map((l,k)=>`<button type="button" data-v="${k+1}" class="${ed.sc[i]===k+1?'on':''}">${l}</button>`).join('')}</div><input type="text" class="nzq-dmi" data-i="${i}" placeholder="حوزه (اختیاری)" value="${E(ed.dom[i])}"></div>`).join('')}
 <div class="pmt-er" id="nzqEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-nq="save">💾 ذخیره</button><button type="button" data-nq="cancel">انصراف</button></div>`}
function openForm(){ed={sc:ITEMS.map((_,i)=>scOf(i)),dom:ITEMS.map((_,i)=>domOf(i))};
 ov.firstElementChild.innerHTML=formHtml();ov.firstElementChild.scrollTop=0;ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const er=t=>{$('nzqEr').textContent=t};
 if(!ed.sc.some(v=>v>0)&&!ed.dom.some(d=>d.trim())){er('دست‌کم یک شاخص را ارزیابی کنید.');return}
 S.nzq=Object.assign({},rec()||{},{sc:ed.sc.slice(),dom:ed.dom.map(d=>d.trim())});
 save();closeForm();render()}
function bulk(){const er=t=>{$('nzqEr').textContent=t},a=parseInt($('nzqFa').value,10),b=parseInt($('nzqTo').value,10),t=$('nzqDt').value.trim();
 if(!(a>=1&&b>=1&&a<=N&&b<=N&&a<=b)){er(`شماره‌ی ردیف‌ها را از ۱ تا ${fa(N)} و «از» را کوچک‌تر یا مساوی «تا» وارد کنید.`);return}
 if(!t){er('نام حوزه را بنویسید.');return}er('');
 for(let i=a-1;i<b;i++){ed.dom[i]=t;const el=ov.querySelector(`.nzq-dmi[data-i="${i}"]`);if(el)el.value=t}}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const sb=t.closest('.nzq-sc button');if(sb&&ed){const it=sb.closest('.nzq-it'),i=+it.dataset.i,v=+sb.dataset.v;ed.sc[i]=ed.sc[i]===v?0:v;
  it.querySelectorAll('.nzq-sc button').forEach(b=>b.classList.toggle('on',+b.dataset.v===ed.sc[i]));$('nzqAv').innerHTML=avHtml();return}
 const a=t.closest('[data-nq]');if(!a||!ed)return;const k=a.dataset.nq;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();else if(k==='bulk')bulk()});
ov.addEventListener('input',e=>{const t=e.target;if(ed&&t.classList&&t.classList.contains('nzq-dmi'))ed.dom[+t.dataset.i]=t.value});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-nq]');if(!b)return;const k=b.dataset.nq;
 if(k==='edit')openForm();
 else if(k==='del'){if(!confirm('کل ارزیابی ثبت‌شده‌ی جدول ۱۶ حذف شود؟ این کار قابل بازگشت نیست.'))return;delete S.nzq;save();render()}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* ── خروجی: چاپ A4 / PDF / اکسل — همان چیدمان جدول کاغذی ── */
const msg=t=>{const m=$('nzqMsg');if(m)m.textContent=t||''};
const W=[58,36,98,254,68,68,68,68];
const cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
const thead=`<thead><tr><th>حوزه</th><th>ردیف</th><th>شاخص ارزیابی</th><th>شواهد عینی</th>${LV.map(l=>`<th>${l}</th>`).join('')}</tr></thead>`;
function rowsHtml(ix){let out='';ix.forEach((i,k)=>{const d=domOf(i);let dc='';
 if(k===0||!d||d!==domOf(ix[k-1])){let sp=1;if(d)while(k+sp<ix.length&&domOf(ix[k+sp])===d)sp++;dc=`<td class="nzq-d"${sp>1?` rowspan="${sp}"`:''}>${E(d)}</td>`}
 out+=`<tr>${dc}<td class="c">${fa(i+1)}</td><td class="nzq-t1">${E(ITEMS[i][0])}</td><td>${E(ITEMS[i][1])}</td>${[1,2,3,4].map(v=>`<td class="nzq-mk">${scOf(i)===v?'✓':''}</td>`).join('')}</tr>`});return out}
const headHtml=()=>{let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b style="font-size:16px">${TITLE}</b>${l?`<span>${E(l)}</span>`:''}</div>`};
const endHtml=()=>`<div class="nzq-fn">— ${FOOT}</div>`;
function mount(){let r=$('nzqPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='nzqPrintRoot';r.setAttribute('data-noresp','');document.body.appendChild(r);return r}
function build(){const root=mount(),all=ITEMS.map((_,i)=>i),pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml()}<table class="nzq-t">${cg}${thead}<tbody>${rowsHtml(all)}</tbody></table>${endHtml()}</div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+10,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map(t=>t.offsetHeight),eh=pr.querySelector('.nzq-fn').offsetHeight+14;
 const avail=1123-30-26-34-hh-th-6,pg=[];let cur=[],u=0;
 hs.forEach((h,i)=>{if(cur.length&&u+h>avail){pg.push({r:cur});cur=[];u=0}cur.push(i);u+=h});
 if(u+eh>avail){pg.push({r:cur});pg.push({r:[],end:1})}else pg.push({r:cur,end:1});
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,n)=>{const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}${p.r.length?`<table class="nzq-t">${cg}${thead}<tbody>${rowsHtml(p.r)}</tbody></table>`:''}${p.end?endHtml():''}<div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(n+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 return root}
const clean=()=>{document.body.classList.remove('nzq-printing');const r=$('nzqPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const need=()=>{if(!has()){msg('ابتدا ارزیابی را ثبت کنید.');return false}return true};
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(){if(!need())return;msg('');try{await document.fonts.ready}catch(e){}build();document.body.classList.add('nzq-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('نظارت-مدیر-جدول-۱۶-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(e){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(e&&e.message?e.message:e))}}
async function doXls(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۶',title:TITLE,sub:'نظارت مدیر و معاون',info:typeof profLine==='function'?profLine():'',
   head:['حوزه','ردیف','شاخص ارزیابی','شواهد عینی',...LV],
   rows:ITEMS.map((t,i)=>[domOf(i),i+1,t[0],t[1],...[1,2,3,4].map(v=>scOf(i)===v?'✓':'')]),nameCol:3,widths:[16,6,30,110,14,16,14,14],
   notesTitle:'توضیحات',notes:[FOOT]});
  await window.dlFile('نظارت-مدیر-جدول-۱۶-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(e){msg('⚠️ ساخت اکسل ناموفق بود: '+(e&&e.message?e.message:e))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='nzq')render()}catch(e){console.error('nzq',e)}return r};
window.NZQ={open:openForm,render,items:ITEMS};
}catch(e){console.error('supervision-quality',e)}})();

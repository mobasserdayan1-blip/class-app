/* فرم خودآگاهی آموزگار — جدول ۱۴ (مبتنی بر شاخص‌های برنامه‌ریزی وزارت آموزش و پرورش)
   ۲۰ شاخص با متن دقیقِ فرم کاغذی؛ هر شاخص امتیاز ۱ تا ۵: ۱ نیاز به تلاش | ۲ متوسط | ۳ خوب | ۴ خیلی خوب | ۵ عالی
   داده‌ها در S.tsa (آرایه) ذخیره می‌شود: {id, date (میلادی ISO), sc:[۲۰ عدد ۱ تا ۵], note}
   فقط کلید تازه است؛ داده‌ی قبلی تغییری نمی‌کند. ثبت/ویرایش/حذف، میانگین خودکار، چاپ، PDF و اکسل. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ── متن دقیق ۲۰ شاخص از تصویر جدول ۱۴ ── */
const ITEMS=[
'در تبدیل مدرسه، به مدرسه تراز سند تحول بنیادین نقش خود را در همکاری با مدیر مدرسه ایفا نمودم.',
'در طراحی سازوکارهای تدریس موفق، مدیریت کلاس با گروه‌های آموزشی منطقه در ارتباط بودم.',
'عضو اجتماعات یادگیری و فرایند شبکه سازی معلمان شدم تا بهتر یاد بگیرم.',
'تجربه موفق خود را با تأکید بر اصلاح روش‌های آموزش و تحول در محیط یادگیری در سامانه بارگذاری کردم تا در فرایند تجربه گردانی سهیم باشم.',
'تقویت روحیه پرسشگری در دانش‌آموزان برایم مهم بود لذا جشنواره جابربن حیان کلاسی را راه انداختم و در جشنواره مدرسه ای حضور فعال داشتم.',
'در طراحی تکالیف، طرح «عید و هنر و داستان» را برای دانش‌آموزان تبیین و نمونه فعالیت‌های خلاقانه را به مدیر مدرسه معرفی نمودم و به تکالیف مهارت محور اهمیت می‌دهم.',
'در روش تدریس خود از بازی استفاده نمودم تا یادگیری بهتر اتفاق بیفتد.',
'آموزش مهارت‌های زندگی به دانش‌آموزان برایم اهمیت داشت لذا برنامه «هر پایه یک مهارت» را دوست داشتم و نسبت به تحقق آن تلاش کردم.',
'شرایط بازماندگی از تحصیل و یا ترک تحصیل و یا غیبت دانش‌آموزان را با دفتر دبستان درمیان گذاشتم و درصدد رفع مشکل بر آمدم.',
'برای اجرای طرح حامی و جبران عقب ماندگی دانش‌آموزان هر کاری از دستم برآمد انجام دادم.',
'با علاقه در جلسات شورای آموزگاران شرکت نمودم و گزارش موفقیت‌های کلاسی خود را در اختیار سایر همکاران گذاشتم.',
'برای حضور در کلاس‌های و ارتقاء صلاحیت‌های حرفه ای خودم به ویژه طرح توانا داوطلب بودم و نیازهای آموزشی را به مدیر مدرسه اعلام کردم.',
'برای ارتقا شایستگی‌های دیجیتال و فناورانه و یادگیری هوش مصنوعی کوشا بودم و تولید محتواهای خوبی داشتم.',
'حضور به موقع در کلاس حضوری یا غیرحضوری داشتم.',
'نسبت به آراستگی ظاهری و رفتارهای خود در محیط کلاس و مدرسه مقید هستم.',
'برنامه « هویت سبز» مهمترین رویکرد در کلاس درسم بود و در حد توان به آموزش مسائل زیست محیطی و تلفیق هویت پرداختم.',
'در هفته ۳۰ دقیقه به کتابخوانی و تقویت مهارت‌ها به ویژه مهارت‌های چهارگانه زبانی (خواندن، نوشتن، سخن گفتن و گوش دادن) پرداخته‌ام، چون این موضوع بسیار مهم است.',
'به صورت موردی هر جا که لازم بود با اولیا تماس گرفته و ایشان را در جریان روند تحصیلی فرزندشان قرار دادم.',
'یک کتاب خوان حرفه ای هستم و با دانش افزایی و خودآموزی فردی به خود احترام می‌گذارم.',
'همواره به تغییر چیدمان کلاسی، استفاده از فضاهای متنوع، رویکرد کار گروهی و برگزاری اردوهای جذاب کلاسی علاقه داشتم.'
];
const N=ITEMS.length;
const LV=['نیاز به تلاش','متوسط','خوب','خیلی خوب','عالی'];
const LC=['#d9534f','#e8890c','#b8960a','#3d9a5f','#1a8f55'];
const TITLE='جدول ۱۴ / فرم خودآگاهی آموزگار';
const SUBT='(مبتنی بر شاخص‌های برنامه‌ریزی وزارت آموزش و پرورش)';
const FOOT='آموزگار محترم تصویر این فرم را پس از تکمیل در پایان اردیبهشت ۱۴۰۶ به مدیر مدرسه تحویل نمایید.';

const dIso=i=>{try{return fmt(new Date(i+'T12:00:00Z'))}catch(e){return i||''}};
const wdOf=i=>{try{return wd(new Date(i+'T12:00:00Z'))}catch(e){return ''}};
const todayIso=()=>iso(tdy());
const list=()=>{S.tsa=Array.isArray(S.tsa)?S.tsa:[];return S.tsa};
const okSc=v=>v>=1&&v<=5;
const avgOf=sc=>{const a=(sc||[]).filter(okSc);return a.length?a.reduce((p,c)=>p+c,0)/a.length:0};
const f2=n=>fa(n.toFixed(2)).replace('.','٫');
const lvIdx=a=>Math.min(5,Math.max(1,Math.round(a)))-1;
const lowIdx=sc=>sc.map((v,i)=>okSc(v)&&v<=2?i+1:0).filter(Boolean);
function all(){const o=list().slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')||a.id-b.id);return o}

const st=document.createElement('style');
st.textContent=`
#tsa .tsa-top{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
#tsa .tsa-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#tsa .tsa-k b{display:block;font-size:20px;color:var(--p)}#tsa .tsa-k span{font-size:12px;color:var(--mut);font-weight:700}
#tsa .tsa-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#tsa .tsa-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14.5px}
#tsa .tsa-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#tsa .tsa-bd{display:inline-block;color:#fff;border-radius:999px;padding:3px 11px;font-size:13px;font-weight:800}
#tsa .tsa-l{margin-top:7px;font-size:13.5px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#tsa .tsa-l i{font-style:normal;font-weight:800;color:var(--p);margin-left:4px;font-size:12.5px}
#tsa .tsa-det{margin-top:8px;border-top:1px dashed var(--line);padding-top:6px}
#tsa .tsa-dr{display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:13px;line-height:1.8;border-bottom:1px solid var(--line)}
#tsa .tsa-dr:last-child{border-bottom:0}
#tsa .tsa-dr i{font-style:normal;flex:none;min-width:22px;color:var(--mut);font-weight:800}
#tsa .tsa-dr span{flex:1}#tsa .tsa-dr b{flex:none;color:#fff;border-radius:8px;padding:0 8px;font-size:12.5px;min-width:26px;text-align:center}
#tsa .tsa-ac{display:flex;gap:8px;margin-top:8px}#tsa .tsa-ac button{flex:1;margin:0}
#tsa .tsa-ex{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}#tsa .tsa-ex button{margin:0;font-size:13px;padding:9px 4px}
#tsa .tsa-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
.tsa-av{position:sticky;top:-1px;z-index:3;margin:10px 0 2px;padding:9px 12px;border-radius:14px;background:var(--bg2);border:1.5px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:800;font-size:13.5px}
.tsa-av b{color:var(--p);font-size:17px}.tsa-av small{color:var(--mut);font-weight:700;font-size:12px}
.tsa-it{padding:10px;border:1.5px solid var(--line);border-radius:14px;margin-top:8px;background:var(--card)}
.tsa-it.miss{border-color:#d9534f;background:#fdeceb}
.tsa-q{display:flex;gap:8px;font-size:13.5px;line-height:1.9;font-weight:700}
.tsa-q i{font-style:normal;flex:none;width:24px;height:24px;border-radius:50%;background:var(--bg2);color:var(--p);display:grid;place-items:center;font-size:12px;font-weight:800}
.tsa-sc{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:7px}
.tsa-sc button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:6px 1px;font:700 10px/1.3 Vazirmatn,Tahoma,sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;margin:0;min-width:0}
.tsa-sc button b{font-size:16px;color:var(--p)}
.tsa-sc button.on{background:linear-gradient(90deg,var(--p),var(--p2));border-color:var(--p);color:#fff}.tsa-sc button.on b{color:#fff}
#tsaPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4 table.tsa-t td{padding:3px 7px;line-height:1.55;font-size:11.5px}.pmtA4 table.tsa-t td.mk{font-size:16px}.pmtA4 table.tsa-t th{padding:5px 3px}
.pmtA4 th.mk{font-size:11px;padding:5px 1px;line-height:1.45}.pmtA4 td.mk{font-size:16px;font-weight:800;color:#1a1a1a}
.pmtA4 .tsa-end{margin-top:14px}
.pmtA4 .tsa-res{border:1.5px solid #333;border-radius:8px;background:#f4f0fb!important;padding:8px 12px;display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;font-weight:800}
.pmtA4 .tsa-nt{margin-top:8px;font-size:12px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
.pmtA4 .tsa-fn{margin-top:8px;font-size:11.5px;color:#333;line-height:1.8}
.pmtA4 .tsa-sg{display:flex;justify-content:space-between;margin-top:38px;font-size:12.5px;font-weight:800;padding:0 20px}
@media print{body.tsa-printing>*:not(#tsaPrintRoot){display:none!important}body.tsa-printing #tsaPrintRoot{position:static!important;left:auto!important;display:block!important}body.tsa-printing .pmtA4{break-after:page;page-break-after:always}body.tsa-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
@media(max-width:520px){.tsa-sc button{font-size:9.5px}}
`;
document.head.appendChild(st);

/* ── صفحه ── */
const sec=document.createElement('section');sec.id='tsa';
sec.innerHTML='<h2>📝 فرم خودآگاهی آموزگار</h2><div class="card"><b>📒 جدول ۱۴ — فرم خودآگاهی آموزگار (مبتنی بر شاخص‌های برنامه‌ریزی وزارت آموزش و پرورش)</b><p class="sub" style="text-align:right;margin:6px 0 10px">به هر یک از ۲۰ شاخص امتیاز ۱ تا ۵ بدهید (۱ نیاز به تلاش، ۲ متوسط، ۳ خوب، ۴ خیلی خوب، ۵ عالی). میانگین امتیازها خودکار محاسبه می‌شود. طبق دستور فرم، تصویر فرم تکمیل‌شده در پایان اردیبهشت ۱۴۰۶ به مدیر مدرسه تحویل داده می‌شود.</p><button class="big" data-ts="new" style="font-size:16px;padding:12px">➕ تکمیل فرم جدید</button><div class="tsa-top" id="tsaK"></div></div><div class="card"><div id="tsaL"></div><p class="sub" id="tsaMsg"></p></div>';
const anchor=$('pmg')||$('pmt')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='tsa'))pages.push(['tsa','📝 فرم خودآگاهی آموزگار']);

let openId=0;
function render(){if(!$('tsaL'))return;const A=all(),last=A[A.length-1],prev=A[A.length-2];
 const kp=(v,t)=>`<div class="tsa-k"><b>${v}</b><span>${t}</span></div>`;
 let chg='—';if(last&&prev){const d=avgOf(last.sc)-avgOf(prev.sc);chg=(d>0?'▲ ':d<0?'▼ ':'= ')+f2(Math.abs(d))}
 $('tsaK').innerHTML=kp(fa(A.length),'تعداد فرم‌ها')+kp(last?f2(avgOf(last.sc)):'—','میانگین آخرین فرم')+kp(chg,'تغییر نسبت به قبل');
 $('tsaL').innerHTML=A.length?A.slice().reverse().map(x=>{const a=avgOf(x.sc),li=lvIdx(a),low=lowIdx(x.sc),o=openId===x.id;
  return `<div class="tsa-e"><div class="tsa-h"><span>📅 ${wdOf(x.date)} ${dIso(x.date)}</span><span class="tsa-d"><span class="tsa-bd" style="background:${LC[li]}">میانگین ${f2(a)} · ${LV[li]}</span></span></div>
 <div class="tsa-l"><i>موارد با امتیاز ۱ یا ۲ (${fa(low.length)}):</i>${low.length?'ردیف '+low.map(fa).join('، '):'ندارد'}</div>
 ${x.note?`<div class="tsa-l"><i>یادداشت:</i>${E(x.note)}</div>`:''}
 ${o?`<div class="tsa-det">${ITEMS.map((t,i)=>`<div class="tsa-dr"><i>${fa(i+1)}</i><span>${E(t)}</span><b style="background:${LC[(x.sc[i]||1)-1]}">${x.sc[i]?fa(x.sc[i]):'—'}</b></div>`).join('')}</div>`:''}
 <div class="tsa-ac"><button class="sm" data-ts="det" data-i="${x.id}">${o?'🔼 بستن جزئیات':'📋 دیدن ۲۰ شاخص'}</button><button class="sm" data-ts="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-ts="del" data-i="${x.id}">🗑 حذف</button></div>
 <div class="tsa-ex"><button class="big ex" data-ts="print" data-i="${x.id}">🖨️ چاپ</button><button class="big ex" data-ts="pdf" data-i="${x.id}">📄 PDF</button><button class="big ex" data-ts="xls" data-i="${x.id}">📊 اکسل</button></div></div>`}).join(''):'<div class="tsa-em">هنوز فرمی ثبت نشده است.<br>با «تکمیل فرم جدید» شروع کنید.</div>'}

/* ── فرم ثبت ── */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='tsaOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;
const setD=i=>{const p=jp(new Date(i+'T12:00:00Z'));ed.y=p.y;ed.m=p.m;ed.d=p.d};
const avHtml=()=>{const a=ed.sc.filter(okSc).length,m=avgOf(ed.sc);return `<span>میانگین فعلی: <b>${a?f2(m):'—'}</b>${a?` <small>(${LV[lvIdx(m)]})</small>`:''}</span><small>${fa(a)} از ${fa(N)} شاخص امتیاز دارد</small>`};
function formHtml(){const y0=jp(tdy()).y,ys=[];for(let y=y0-2;y<=y0+1;y++)ys.push(y);if(!ys.includes(ed.y))ys.push(ed.y);ys.sort((a,b)=>a-b);
 return `<h3>${ed.id?'✏️ ویرایش فرم خودآگاهی':'📝 فرم خودآگاهی آموزگار — جدول ۱۴'}</h3>
 <label>تاریخ تکمیل (شمسی)</label><div class="pmt-dr"><select id="tsaD">${Array.from({length:31},(_,i)=>`<option value="${i+1}"${ed.d===i+1?' selected':''}>${fa(i+1)}</option>`).join('')}</select><select id="tsaM">${MN.map((n,i)=>`<option value="${i+1}"${ed.m===i+1?' selected':''}>${n}</option>`).join('')}</select><select id="tsaY">${ys.map(y=>`<option value="${y}"${ed.y===y?' selected':''}>${fa(y)}</option>`).join('')}</select><button type="button" data-ts="today">امروز</button></div>
 <div class="tsa-av" id="tsaAv">${avHtml()}</div>
 ${ITEMS.map((t,i)=>`<div class="tsa-it" data-i="${i}"><div class="tsa-q"><i>${fa(i+1)}</i><span>${E(t)}</span></div><div class="tsa-sc">${LV.map((l,k)=>`<button type="button" data-v="${k+1}" class="${ed.sc[i]===k+1?'on':''}"><b>${fa(k+1)}</b>${l}</button>`).join('')}</div></div>`).join('')}
 <label>یادداشت (اختیاری)</label><textarea id="tsaN" placeholder="مثلاً: برنامه‌ی بهبود برای شاخص‌هایی که امتیاز پایین گرفتند…">${E(ed.note)}</textarea>
 <div class="pmt-er" id="tsaEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-ts="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت فرم'}</button><button type="button" data-ts="cancel">انصراف</button></div>`}
function openForm(id){ed={id:id||0,sc:Array(N).fill(0),note:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;ed.sc=Array.from({length:N},(_,i)=>okSc(x.sc&&x.sc[i])?x.sc[i]:0);ed.note=x.note||'';setD(x.date||todayIso())}else setD(todayIso());
 ov.firstElementChild.innerHTML=formHtml();ov.firstElementChild.scrollTop=0;ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const y=+$('tsaY').value,m=+$('tsaM').value,d=+$('tsaD').value,er=t=>{$('tsaEr').textContent=t};
 const g=d<=(m<=6?31:30)?fromJ(y,m,d):null,p=g&&jp(g);if(!g||p.y!==y||p.m!==m||p.d!==d){er('تاریخ انتخاب‌شده معتبر نیست.');return}
 const miss=ed.sc.map((v,i)=>okSc(v)?0:i+1).filter(Boolean);
 ov.querySelectorAll('.tsa-it').forEach(el=>el.classList.toggle('miss',miss.includes(+el.dataset.i+1)));
 if(miss.length){er(`${fa(miss.length)} شاخص هنوز امتیاز ندارد (ردیف ${miss.slice(0,8).map(fa).join('، ')}${miss.length>8?'، …':''}). همه‌ی ${fa(N)} مورد باید امتیاز بگیرد.`);const f=ov.querySelector('.tsa-it.miss');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
 const rec={date:iso(g),sc:ed.sc.slice(),note:$('tsaN').value.trim()},L=list();
 if(ed.id){const x=L.find(q=>q.id===ed.id);if(!x){closeForm();return}Object.assign(x,rec)}
 else{let id=Date.now();const u=new Set(L.map(q=>q.id));while(u.has(id))id++;L.push({id,...rec})}
 save();closeForm();render()}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const sb=t.closest('.tsa-sc button');if(sb&&ed){const it=sb.closest('.tsa-it'),i=+it.dataset.i,v=+sb.dataset.v;ed.sc[i]=ed.sc[i]===v?0:v;
  it.querySelectorAll('.tsa-sc button').forEach(b=>b.classList.toggle('on',+b.dataset.v===ed.sc[i]));it.classList.remove('miss');$('tsaAv').innerHTML=avHtml();return}
 const a=t.closest('[data-ts]');if(!a||!ed)return;const k=a.dataset.ts;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();else if(k==='today'){setD(todayIso());$('tsaY').value=ed.y;$('tsaM').value=ed.m;$('tsaD').value=ed.d}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-ts]');if(!b)return;const k=b.dataset.ts,id=+b.dataset.i;
 if(k==='new')openForm();else if(k==='edit')openForm(id);
 else if(k==='det'){openId=openId===id?0:id;render()}
 else if(k==='del'){if(!confirm('این فرم خودآگاهی حذف شود؟'))return;S.tsa=list().filter(x=>x.id!==id);if(openId===id)openId=0;save();render()}
 else{const x=list().find(q=>q.id===id);if(!x)return;if(k==='print')doPrint(x);else if(k==='pdf')doPdf(x);else if(k==='xls')doXls(x)}});

/* ── خروجی: چاپ A4 / PDF / اکسل — همان چیدمان جدول کاغذی ── */
const msg=t=>{const m=$('tsaMsg');if(m)m.textContent=t||''};
const W=[42,386,58,58,58,58,58];
const cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
const thead=`<thead><tr><th>ردیف</th><th>نمونه شاخص‌های خود ارزیابی</th>${LV.map((l,i)=>`<th class="mk">${l}<br><b>${fa(i+1)}</b></th>`).join('')}</tr></thead>`;
const rowHtml=(x,i)=>`<tr><td class="c">${fa(i+1)}</td><td>${E(ITEMS[i])}</td>${[1,2,3,4,5].map(k=>`<td class="c mk">${x.sc[i]===k?'✓':''}</td>`).join('')}</tr>`;
function headHtml(x){let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b>${TITLE}</b><span>${SUBT}</span><span>${l?E(l)+' | ':''}تاریخ تکمیل: ${wdOf(x.date)} ${dIso(x.date)}</span></div>`}
function endHtml(x){const a=avgOf(x.sc),low=lowIdx(x.sc),tn=(S.prof&&S.prof.teacher)||'';
 return `<div class="tsa-end"><div class="tsa-res"><span>میانگین امتیازها: ${f2(a)} از ${fa(5)}</span><span>سطح کلی: ${LV[lvIdx(a)]}</span><span>موارد با امتیاز ۱ یا ۲: ${low.length?low.map(fa).join('، '):'ندارد'}</span></div>${x.note?`<div class="tsa-nt"><b>یادداشت:</b> ${E(x.note)}</div>`:''}<div class="tsa-fn">۸- ${FOOT}</div><div class="tsa-sg"><span>امضای آموزگار: ${E(tn)}</span><span>مهر و امضای مدیر</span></div></div>`}
function mount(){let r=$('tsaPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='tsaPrintRoot';document.body.appendChild(r);return r}
function build(x){const root=mount(),pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml(x)}<table class="tsa-t">${cg}${thead}<tbody>${ITEMS.map((_,i)=>rowHtml(x,i)).join('')}</tbody></table>${endHtml(x)}</div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+10,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map(t=>t.offsetHeight),eh=pr.querySelector('.tsa-end').offsetHeight+14;
 const avail=1123-30-26-34-hh-th-6,pg=[];let cur=[],u=0;
 hs.forEach((h,i)=>{if(cur.length&&u+h>avail){pg.push({r:cur});cur=[];u=0}cur.push(i);u+=h});
 if(u+eh>avail){pg.push({r:cur});pg.push({r:[],end:1})}else pg.push({r:cur,end:1});
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,n)=>{const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml(x)}${p.r.length?`<table class="tsa-t">${cg}${thead}<tbody>${p.r.map(i=>rowHtml(x,i)).join('')}</tbody></table>`:''}${p.end?endHtml(x):''}<div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(n+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 return root}
const clean=()=>{document.body.classList.remove('tsa-printing');const r=$('tsaPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(x){msg('');try{await document.fonts.ready}catch(e){}build(x);document.body.classList.add('tsa-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(x){msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(x),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('خودآگاهی-آموزگار-جدول-۱۴-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(e){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(e&&e.message?e.message:e))}}
async function doXls(x){msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');const a=avgOf(x.sc),low=lowIdx(x.sc);
  const buf=await xbook({sheet:'جدول ۱۴',title:TITLE+' '+SUBT,sub:'تاریخ تکمیل: '+wdOf(x.date)+' '+dIso(x.date),info:typeof profLine==='function'?profLine():'',
   head:['ردیف','نمونه شاخص‌های خود ارزیابی',...LV.map((l,i)=>l+' ('+fa(i+1)+')'),'امتیاز'],
   rows:ITEMS.map((t,i)=>[i+1,t,...[1,2,3,4,5].map(k=>x.sc[i]===k?'✓':''),x.sc[i]]),nameCol:1,widths:[6,74,13,10,10,13,10,9],
   notesTitle:'نتیجه‌ی خودارزیابی',notes:['میانگین امتیازها: '+f2(a)+' از '+fa(5)+' — سطح کلی: '+LV[lvIdx(a)],'موارد با امتیاز ۱ یا ۲: '+(low.length?'ردیف '+low.map(fa).join('، '):'ندارد')].concat(x.note?['یادداشت: '+x.note]:[],['۸- '+FOOT]),sign:true});
  await window.dlFile('خودآگاهی-آموزگار-جدول-۱۴-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(e){msg('⚠️ ساخت اکسل ناموفق بود: '+(e&&e.message?e.message:e))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='tsa')render()}catch(e){console.error('tsa',e)}return r};
window.TSA={open:openForm,all,render,items:ITEMS,avg:avgOf};
}catch(e){console.error('teacher-self-assessment',e)}})();

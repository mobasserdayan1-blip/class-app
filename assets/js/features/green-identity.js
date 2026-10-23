/* دفتر برنامه‌ی هویت سبز — جدول ۱۷ «هویت سبز (ثبت برنامه‌ها، فعالیت‌ها، مشارکت دانش‌آموزان و مستندات اجرایی طرح در کلاس درس)»
   ساختار دفتر کاغذی: ردیف‌ها = آبان، آذر، دی، بهمن، اسفند | ستون‌ها = هفته اول، هفته دوم، هفته سوم، هفته چهارم
   داده‌ها در S.hsv (شیء) ذخیره می‌شود: { '8':[متن هفته۱..۴], '9':[…], '10':[…], '11':[…], '12':[…] } (کلید = شماره‌ی ماه شمسی)
   فقط کلید تازه؛ داده‌ی قبلی تغییری نمی‌کند. ثبت/مشاهده/ویرایش/پاک‌کردن، چاپ، PDF و اکسل. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const MONTHS=[[8,'آبان'],[9,'آذر'],[10,'دی'],[11,'بهمن'],[12,'اسفند']];
const WK=['هفته اول','هفته دوم','هفته سوم','هفته چهارم'];
const TITLE='جدول ۱۷ / هویت سبز';
const SUBT='(ثبت برنامه‌ها، فعالیت‌ها، مشارکت دانش‌آموزان و مستندات اجرایی طرح در کلاس درس)';
const FOOT='این جدول با توجه به هر پایه، توسط آموزگار از روی «کیوآرکد سرفصل‌های دوره آموزشی هویت سبز» تکمیل گردد.';
const store=()=>{if(!S.hsv||typeof S.hsv!=='object'||Array.isArray(S.hsv))S.hsv={};return S.hsv};
const cells=m=>{const a=store()[m];return WK.map((_,i)=>String(a&&a[i]!=null?a[i]:''))};
const filled=m=>cells(m).filter(t=>t.trim()).length;

const st=document.createElement('style');
st.textContent=`
#hsv .hsv-top{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
#hsv .hsv-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#hsv .hsv-k b{display:block;font-size:20px;color:var(--p)}#hsv .hsv-k span{font-size:12px;color:var(--mut);font-weight:700}
#hsv .hsv-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#hsv .hsv-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:15px}
#hsv .hsv-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#hsv .hsv-l{margin-top:7px;font-size:14px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#hsv .hsv-l i{font-style:normal;font-weight:800;color:var(--p);margin-left:4px;font-size:12.5px}
#hsv .hsv-l.no{color:var(--mut)}
#hsv .hsv-ac{display:flex;gap:8px;margin-top:8px}#hsv .hsv-ac button{flex:1;margin:0}
#hsv .hsv-ex{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#hsvPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4 .hsv-sub{text-align:center;font-size:11.5px;color:#333;margin:-2px 0 8px}
.pmtA4 .hsv-note{position:absolute;left:38px;right:38px;bottom:40px;font-size:11px;line-height:1.8;color:#333;font-weight:700}
.pmtA4 tr.hsv-r td{height:150px;vertical-align:top}.pmtA4 td.hsv-m{vertical-align:middle;text-align:center;font-weight:800;font-size:13.5px;background:#f3f0f9}
@media print{body.hsv-printing>*:not(#hsvPrintRoot){display:none!important}body.hsv-printing #hsvPrintRoot{position:static!important;left:auto!important;display:block!important}body.hsv-printing .pmtA4{break-after:page;page-break-after:always}body.hsv-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='hsv';
sec.innerHTML='<h2>🌱 برنامه‌ی هویت سبز</h2><div class="card"><b>📒 جدول ۱۷ — هویت سبز</b><p class="sub" style="text-align:right;margin:6px 0 0">'+SUBT+'<br>برای هر ماه (آبان تا اسفند) برنامه‌ها، فعالیت‌ها، مشارکت دانش‌آموزان و مستندات اجرایی هر هفته را ثبت کنید.</p><p class="sub" style="text-align:right;margin:6px 0 0">'+FOOT+'</p><div class="hsv-top" id="hsvK"></div></div><div class="card"><div id="hsvL"></div></div><div class="card"><b>📤 خروجی جدول ۱۷</b><p class="sub" style="text-align:right;margin:6px 0 0">چاپ، PDF و اکسل با همان ردیف‌ها و ستون‌های دفتر کاغذی.</p><div class="hsv-ex"><button class="sm" data-hs="print">🖨️ چاپ</button><button class="sm" data-hs="pdf">📄 PDF</button><button class="sm" data-hs="xls" style="grid-column:1/-1">📊 اکسل</button></div><p class="sub" id="hsvMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p></div>';
const anchor=$('tex')||$('tsa')||$('pmg')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='hsv'))pages.push(['hsv','🌱 برنامه‌ی هویت سبز']);

function render(){if(!$('hsvL'))return;
 const kp=(v,t)=>`<div class="hsv-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 const tot=MONTHS.reduce((n,[m])=>n+filled(m),0);
 $('hsvK').innerHTML=kp(tot,'هفته‌ی ثبت‌شده (از ۲۰)')+kp(MONTHS.filter(([m])=>filled(m)).length,'ماه دارای ثبت (از ۵)');
 $('hsvL').innerHTML=MONTHS.map(([m,n])=>{const c=cells(m),f=filled(m);
  return `<div class="hsv-e"><div class="hsv-h"><span>🌱 ${n}</span><span class="hsv-d">${fa(f)} از ۴ هفته ثبت شده</span></div>
  ${c.map((t,i)=>t.trim()?`<div class="hsv-l"><i>${WK[i]}:</i>${E(t)}</div>`:`<div class="hsv-l no"><i>${WK[i]}:</i>—</div>`).join('')}
  <div class="hsv-ac"><button class="sm" data-hs="edit" data-m="${m}">${f?'✏️ ویرایش':'➕ ثبت'}</button>${f?`<button class="sm" data-hs="clr" data-m="${m}">🗑 پاک‌کردن ماه</button>`:''}</div></div>`}).join('')}

/* فرم (ظاهر مشترک با دفترهای دیگر) */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='hsvOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let em=0;
function openForm(m){em=m;const c=cells(m),n=MONTHS.find(x=>x[0]===m)[1];
 ov.firstElementChild.innerHTML=`<h3>🌱 هویت سبز — ${n}</h3>`+WK.map((w,i)=>`<label>${w}</label><textarea id="hsvW${i}" style="min-height:90px">${E(c[i])}</textarea>`).join('')+`<div class="pmt-er" id="hsvEr"></div><div class="pmt-fa"><button class="go" type="button" data-hs="save">💾 ذخیره در دفتر</button><button type="button" data-hs="cancel">انصراف</button></div>`;
 ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');em=0};
function saveForm(){const v=WK.map((_,i)=>$('hsvW'+i).value.trim()),h=store();
 if(v.some(Boolean))h[em]=v;else delete h[em];
 save();closeForm();render()}
ov.addEventListener('click',e=>{if(e.target===ov){closeForm();return}
 const a=e.target.closest('[data-hs]');if(!a)return;if(a.dataset.hs==='cancel')closeForm();else if(a.dataset.hs==='save')saveForm()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-hs]');if(!b)return;const k=b.dataset.hs;
 if(k==='edit')openForm(+b.dataset.m);
 else if(k==='clr'){const n=MONTHS.find(x=>x[0]===+b.dataset.m)[1];if(!confirm('همه‌ی نوشته‌های ماه '+n+' از دفتر پاک شود؟'))return;delete store()[+b.dataset.m];save();render()}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* خروجی */
const msg=t=>{const m=$('hsvMsg');if(m)m.textContent=t||''};
const W=[80,155,155,155,155],cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
const thead=`<thead><tr><th style="background:#fff!important;border-top-color:transparent;border-right-color:transparent"></th>${WK.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`;
const rowHtml=([m,n])=>`<tr class="hsv-r"><td class="hsv-m">${n}</td>${cells(m).map(t=>`<td>${E(t)}</td>`).join('')}</tr>`;
const headHtml=()=>{let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b>${TITLE}</b>${l?`<span>${E(l)}</span>`:''}</div><div class="hsv-sub">${SUBT}</div>`};
function mount(){let r=$('hsvPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='hsvPrintRoot';r.setAttribute('data-noresp','');document.body.appendChild(r);return r}
function build(){const root=mount(),rows=MONTHS,pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${rows.map(rowHtml).join('')}</tbody></table></div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+pr.querySelector('.hsv-sub').offsetHeight+22,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map(t=>t.offsetHeight);
 const avail=1123-30-26-34-hh-th-6-46,pg=[];let cur=[],u=0;
 rows.forEach((r,i)=>{const h=Math.min(hs[i],avail);if(cur.length&&u+h>avail){pg.push(cur);cur=[];u=0}cur.push(r);u+=h});pg.push(cur);
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,i)=>{const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${p.map(rowHtml).join('')}</tbody></table><div class="hsv-note">${FOOT}</div><div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(i+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 return root}
const clean=()=>{document.body.classList.remove('hsv-printing');const r=$('hsvPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(){msg('');try{await document.fonts.ready}catch(e){}build();document.body.classList.add('hsv-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(){msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('هویت-سبز-جدول-۱۷-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(x){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(x&&x.message?x.message:x))}}
async function doXls(){msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۷',title:TITLE+' '+SUBT,sub:'هویت سبز',info:typeof profLine==='function'?profLine():'',head:['',...WK],
   rows:MONTHS.map(([m,n])=>[n,...cells(m)]),nameCol:0,widths:[10,34,34,34,34],sign:true});
  await window.dlFile('هویت-سبز-جدول-۱۷-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(x){msg('⚠️ ساخت اکسل ناموفق بود: '+(x&&x.message?x.message:x))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='hsv')render()}catch(e){console.error('hsv',e)}return r};
window.HSV={open:openForm,render};
}catch(e){console.error('green-identity',e)}})();

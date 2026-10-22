/* دفتر تجربیات و ایده‌ها — جدول ۱۱ «ثبت تجربیات، ایده‌ها، خلاقیت‌های معلمی»
   ستون‌های دفتر کاغذی (از راست): عنوان کار | روایت تجربه - طرح ایده | تاریخ
   داده‌ها در S.tex (آرایه) ذخیره می‌شود: {id, ttl (عنوان کار), nar (روایت تجربه/طرح ایده), date (میلادی ISO)}
   فقط کلید تازه؛ داده‌ی قبلی تغییری نمی‌کند. ثبت/مشاهده/ویرایش/حذف، چاپ، PDF و اکسل. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dIso=i=>{try{return fmt(new Date(i+'T12:00:00Z'))}catch(e){return i||''}};
const wdOf=i=>{try{return wd(new Date(i+'T12:00:00Z'))}catch(e){return ''}};
const todayIso=()=>iso(tdy());
const list=()=>{S.tex=Array.isArray(S.tex)?S.tex:[];return S.tex};
const H=['عنوان کار','روایت تجربه - طرح ایده','تاریخ'];
const TITLE='جدول ۱۱ / ثبت تجربیات، ایده‌ها، خلاقیت‌های معلمی';
const FOOT='آموزگار محترم چنانچه تمایل دارید در خرداد ۱۴۰۶ در جشنواره تجارب برتر شرکت نمایید تصویر این صفحه را تا پایان اردیبهشت ۱۴۰۶ به گروه‌های آموزشی منطقه ارسال نمایید.';
const ROWS_PAGE=5;
function all(){return list().slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')||a.id-b.id)}

const st=document.createElement('style');
st.textContent=`
#tex .tex-top{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
#tex .tex-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#tex .tex-k b{display:block;font-size:20px;color:var(--p)}#tex .tex-k span{font-size:12px;color:var(--mut);font-weight:700}
#tex .tex-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#tex .tex-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14.5px}
#tex .tex-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#tex .tex-l{margin-top:7px;font-size:14px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#tex .tex-ac{display:flex;gap:8px;margin-top:8px}#tex .tex-ac button{flex:1;margin:0}
#tex .tex-ex{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#tex .tex-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
#texPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4 .tex-note{position:absolute;left:38px;right:38px;bottom:40px;font-size:11px;line-height:1.8;color:#333}
.pmtA4 tr.tex-bl td{height:150px}
@media print{body.tex-printing>*:not(#texPrintRoot){display:none!important}body.tex-printing #texPrintRoot{position:static!important;left:auto!important;display:block!important}body.tex-printing .pmtA4{break-after:page;page-break-after:always}body.tex-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='tex';
sec.innerHTML='<h2>💡 تجربیات و ایده‌ها</h2><div class="card"><b>📒 جدول ۱۱ — ثبت تجربیات، ایده‌ها، خلاقیت‌های معلمی</b><p class="sub" style="text-align:right;margin:6px 0 10px">برای هر تجربه یا ایده، عنوان کار، روایت تجربه / طرح ایده و تاریخ را ثبت کنید.</p><button class="big" data-tx="new" style="font-size:16px;padding:12px">➕ ثبت تجربه / ایده‌ی جدید</button><div class="tex-top" id="texK"></div></div><div class="card"><div id="texL"></div></div><div class="card"><b>📤 خروجی جدول ۱۱</b><p class="sub" style="text-align:right;margin:6px 0 0">چاپ، PDF و اکسل با همان ستون‌های دفتر کاغذی.</p><div class="tex-ex"><button class="sm" data-tx="print">🖨️ چاپ</button><button class="sm" data-tx="pdf">📄 PDF</button><button class="sm" data-tx="xls" style="grid-column:1/-1">📊 اکسل</button></div><p class="sub" id="texMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p></div>';
const anchor=$('tsa')||$('pmg')||$('pmt')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='tex'))pages.push(['tex','💡 تجربیات و ایده‌ها']);

function render(){if(!$('texL'))return;const A=all();
 const kp=(v,t)=>`<div class="tex-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 const cm=(()=>{try{return jp(tdy()).m}catch(e){return 0}})();
 $('texK').innerHTML=kp(A.length,'کل تجربه‌ها و ایده‌ها')+kp(A.filter(x=>{try{return jp(new Date(x.date+'T12:00:00Z')).m===cm}catch(e){return false}}).length,'ثبت‌شده در این ماه');
 $('texL').innerHTML=A.length?A.slice().reverse().map(x=>`<div class="tex-e"><div class="tex-h"><span>${E(x.ttl)}</span><span class="tex-d">📅 ${wdOf(x.date)} ${dIso(x.date)}</span></div>
 <div class="tex-l">${E(x.nar)}</div>
 <div class="tex-ac"><button class="sm" data-tx="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-tx="del" data-i="${x.id}">🗑 حذف</button></div></div>`).join(''):'<div class="tex-em">هنوز تجربه یا ایده‌ای ثبت نشده است.<br>با «ثبت تجربه / ایده‌ی جدید» شروع کنید.</div>'}

/* فرم (ظاهر مشترک با دفترهای جلسات اولیا) */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='texOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;
const setD=i=>{const p=jp(new Date(i+'T12:00:00Z'));ed.y=p.y;ed.m=p.m;ed.d=p.d};
function formHtml(){const y0=jp(tdy()).y,ys=[];for(let y=y0-2;y<=y0+1;y++)ys.push(y);if(!ys.includes(ed.y))ys.push(ed.y);ys.sort((a,b)=>a-b);
 return `<h3>${ed.id?'✏️ ویرایش تجربه / ایده':'💡 ثبت تجربه / ایده‌ی جدید'}</h3>
 <label>عنوان کار</label><input id="texT" value="${E(ed.ttl)}">
 <label>روایت تجربه - طرح ایده</label><textarea id="texN" style="min-height:140px">${E(ed.nar)}</textarea>
 <label>تاریخ (شمسی)</label><div class="pmt-dr"><select id="texD">${Array.from({length:31},(_,i)=>`<option value="${i+1}"${ed.d===i+1?' selected':''}>${fa(i+1)}</option>`).join('')}</select><select id="texM">${MN.map((n,i)=>`<option value="${i+1}"${ed.m===i+1?' selected':''}>${n}</option>`).join('')}</select><select id="texY">${ys.map(y=>`<option value="${y}"${ed.y===y?' selected':''}>${fa(y)}</option>`).join('')}</select><button type="button" data-tx="today">امروز</button></div>
 <div class="pmt-er" id="texEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-tx="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت در دفتر'}</button><button type="button" data-tx="cancel">انصراف</button></div>`}
function openForm(id){ed={id:id||0,ttl:'',nar:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;ed.ttl=x.ttl||'';ed.nar=x.nar||'';setD(x.date||todayIso())}else setD(todayIso());
 ov.firstElementChild.innerHTML=formHtml();ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const y=+$('texY').value,m=+$('texM').value,d=+$('texD').value,er=t=>{$('texEr').textContent=t};
 const g=d<=(m<=6?31:30)?fromJ(y,m,d):null,p=g&&jp(g);if(!g||p.y!==y||p.m!==m||p.d!==d){er('تاریخ انتخاب‌شده معتبر نیست.');return}
 const ttl=$('texT').value.trim(),nar=$('texN').value.trim();
 if(!ttl){er('عنوان کار را بنویسید.');$('texT').focus();return}
 if(!nar){er('روایت تجربه یا طرح ایده را بنویسید.');$('texN').focus();return}
 const rec={ttl,nar,date:iso(g)},L=list();
 if(ed.id){const x=L.find(q=>q.id===ed.id);if(!x){closeForm();return}Object.assign(x,rec)}
 else{let id=Date.now();const u=new Set(L.map(q=>q.id));while(u.has(id))id++;L.push({id,...rec})}
 save();closeForm();render()}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const a=t.closest('[data-tx]');if(!a)return;const k=a.dataset.tx;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();else if(k==='today'){setD(todayIso());$('texY').value=ed.y;$('texM').value=ed.m;$('texD').value=ed.d}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-tx]');if(!b)return;const k=b.dataset.tx;
 if(k==='new')openForm();else if(k==='edit')openForm(+b.dataset.i);
 else if(k==='del'){if(!confirm('این مورد از دفتر حذف شود؟'))return;S.tex=list().filter(x=>x.id!==+b.dataset.i);save();render()}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* خروجی */
const msg=t=>{const m=$('texMsg');if(m)m.textContent=t||''};
const W=[170,424,100],cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
const thead=`<thead><tr>${H.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`;
const rowHtml=r=>r.blank?'<tr class="tex-bl"><td></td><td></td><td></td></tr>':`<tr><td class="c"><b>${E(r.x.ttl)}</b></td><td>${E(r.x.nar)}</td><td class="c">${wdOf(r.x.date)}<br>${dIso(r.x.date)}</td></tr>`;
const headHtml=()=>{let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b>${TITLE}</b>${l?`<span>${E(l)}</span>`:''}</div>`};
function mount(){let r=$('texPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='texPrintRoot';document.body.appendChild(r);return r}
function build(rows){const root=mount(),pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${rows.map(r=>rowHtml({x:r})).join('')}</tbody></table></div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+10,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map(t=>Math.max(t.offsetHeight,150));
 const avail=1123-30-26-34-hh-th-6-46,pg=[];let cur=[],hu=[],u=0;
 rows.forEach((r,i)=>{const h=Math.min(hs[i],avail);if((cur.length&&u+h>avail)||cur.length>=ROWS_PAGE){pg.push({r:cur,u});cur=[];u=0}cur.push(r);u+=h});pg.push({r:cur,u});
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,i)=>{const rs=p.r.map(x=>({x}));let u=p.u;if(i===tot-1)while(rs.length<ROWS_PAGE&&u+150<=avail){rs.push({blank:true});u+=150}
  const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${rs.map(rowHtml).join('')}</tbody></table><div class="tex-note">${FOOT}</div><div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(i+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 return root}
const clean=()=>{document.body.classList.remove('tex-printing');const r=$('texPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const need=()=>{if(!list().length){msg('ابتدا دست‌کم یک مورد ثبت کنید.');return false}return true};
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(){if(!need())return;msg('');try{await document.fonts.ready}catch(e){}build(all());document.body.classList.add('tex-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(all()),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('تجربیات-و-ایده-ها-جدول-۱۱-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(x){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(x&&x.message?x.message:x))}}
async function doXls(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۱',title:TITLE,sub:'تجربیات و ایده‌ها',info:typeof profLine==='function'?profLine():'',head:H,
   rows:all().map(x=>[x.ttl||'',x.nar||'',wdOf(x.date)+' '+dIso(x.date)]),nameCol:0,widths:[26,80,18],sign:true});
  await window.dlFile('تجربیات-و-ایده-ها-جدول-۱۱-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(x){msg('⚠️ ساخت اکسل ناموفق بود: '+(x&&x.message?x.message:x))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='tex')render()}catch(e){console.error('tex',e)}return r};
window.TEX={open:openForm,all,render};
}catch(e){console.error('teacher-experiences',e)}})();

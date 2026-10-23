/* دفتر نظارت بالینی مدیر و معاون — جدول ۱۵ «نظارت بالینی بر فرایند کلاس توسط مدیر و معاون آموزشی مدرسه»
   ستون‌های دفتر کاغذی (از راست): ماه | بازدید کننده (و «امضا و تاریخ») | ثبت دقیق مشاهدات (نحوه تدریس ـ تعامل با اولیا ـ اجرای برنامه‌های مدرسه و ...) | موارد پیشنهادی
   ردیف‌ها: مهر، آبان، آذر، دی، بهمن، اسفند، فروردین، اردیبهشت، خرداد
   داده‌ها در S.nzr (آرایه) ذخیره می‌شود: {id, m (شماره‌ی ماه شمسی), vis, sig, obs, sug}
   فقط کلید تازه؛ داده‌ی قبلی تغییری نمی‌کند. ثبت/مشاهده/ویرایش/حذف با تأیید، چاپ، PDF و اکسل. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ORD=[7,8,9,10,11,12,1,2,3],mi=m=>ORD.indexOf(m);
const H=['ماه','بازدید کننده','ثبت دقیق مشاهدات','موارد پیشنهادی'];
const SUB='(نحوه تدریس ـ تعامل با اولیا ـ اجرای برنامه‌های مدرسه و ...)';
const TITLE='جدول ۱۵ / نظارت بالینی بر فرایند کلاس توسط مدیر و معاون آموزشی مدرسه';
const list=()=>{S.nzr=Array.isArray(S.nzr)?S.nzr:[];return S.nzr};
const mName=m=>MN[m-1]||'';
function all(){return list().slice().sort((a,b)=>mi(a.m)-mi(b.m)||a.id-b.id)}
const curM=()=>{try{const m=jp(tdy()).m;return mi(m)>=0?m:7}catch(e){return 7}};

const st=document.createElement('style');
st.textContent=`
#nzr .nzr-top{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}
#nzr .nzr-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#nzr .nzr-k b{display:block;font-size:20px;color:var(--p)}#nzr .nzr-k span{font-size:12px;color:var(--mut);font-weight:700}
#nzr .nzr-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#nzr .nzr-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14.5px}
#nzr .nzr-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#nzr .nzr-l{margin-top:7px;font-size:14px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#nzr .nzr-l i{font-style:normal;font-weight:800;color:var(--p);margin-left:4px;font-size:12.5px}
#nzr .nzr-ac{display:flex;gap:8px;margin-top:8px}#nzr .nzr-ac button{flex:1;margin:0}
#nzr .nzr-ex{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#nzr .nzr-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
#nzrPrintRoot{position:fixed;left:-99999px;top:0}
.pmtA4 .nzr-sub{display:block;font-weight:600;font-size:10.5px;margin-top:2px}
.pmtA4 td.nzr-v small{display:block;font-weight:800;color:#333;font-size:10.5px;margin:0 0 4px}
.pmtA4 tr.nzr-bl td{height:86px}
@media print{body.nzr-printing>*:not(#nzrPrintRoot){display:none!important}body.nzr-printing #nzrPrintRoot{position:static!important;left:auto!important;display:block!important}body.nzr-printing .pmtA4{break-after:page;page-break-after:always}body.nzr-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='nzr';
sec.innerHTML='<h2>🔍 نظارت مدیر و معاون</h2><div class="card"><b>📒 جدول ۱۵ — نظارت بالینی بر فرایند کلاس توسط مدیر و معاون آموزشی مدرسه</b><p class="sub" style="text-align:right;margin:6px 0 10px">برای هر بازدید، ماه، بازدیدکننده (با امضا و تاریخ)، ثبت دقیق مشاهدات (نحوه تدریس، تعامل با اولیا، اجرای برنامه‌های مدرسه و ...) و موارد پیشنهادی را ثبت کنید.</p><button class="big" data-nz="new" style="font-size:16px;padding:12px">➕ ثبت بازدید جدید</button><div class="nzr-top" id="nzrK"></div></div><div class="card"><div id="nzrL"></div></div><div class="card"><b>📤 خروجی جدول ۱۵</b><p class="sub" style="text-align:right;margin:6px 0 0">چاپ، PDF و اکسل با ردیف‌های مهر تا خرداد، مثل دفتر کاغذی.</p><div class="nzr-ex"><button class="sm" data-nz="print">🖨️ چاپ</button><button class="sm" data-nz="pdf">📄 PDF</button><button class="sm" data-nz="xls" style="grid-column:1/-1">📊 اکسل</button></div><p class="sub" id="nzrMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p></div>';
const anchor=$('hsv')||$('tex')||$('tsa')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='nzr'))pages.push(['nzr','🔍 نظارت مدیر و معاون']);

function render(){if(!$('nzrL'))return;const A=all();
 const kp=(v,t)=>`<div class="nzr-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('nzrK').innerHTML=kp(A.length,'کل بازدیدها')+kp(new Set(A.map(x=>x.m)).size,'ماه دارای بازدید (از ۹)');
 $('nzrL').innerHTML=A.length?A.map(x=>`<div class="nzr-e"><div class="nzr-h"><span>📅 ${mName(x.m)}</span><span class="nzr-d">${E(x.vis)}</span></div>
 ${x.sig?`<div class="nzr-l"><i>امضا و تاریخ:</i>${E(x.sig)}</div>`:''}${x.obs?`<div class="nzr-l"><i>مشاهدات:</i>${E(x.obs)}</div>`:''}${x.sug?`<div class="nzr-l"><i>موارد پیشنهادی:</i>${E(x.sug)}</div>`:''}
 <div class="nzr-ac"><button class="sm" data-nz="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-nz="del" data-i="${x.id}">🗑 حذف</button></div></div>`).join(''):'<div class="nzr-em">هنوز بازدیدی ثبت نشده است.<br>با «ثبت بازدید جدید» شروع کنید.</div>'}

/* فرم (ظاهر مشترک با دفترهای دیگر) */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='nzrOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;
function formHtml(){return `<h3>${ed.id?'✏️ ویرایش بازدید':'🔍 ثبت بازدید جدید'}</h3>
 <label>ماه</label><select id="nzrM">${ORD.map(m=>`<option value="${m}"${ed.m===m?' selected':''}>${mName(m)}</option>`).join('')}</select>
 <label>بازدید کننده</label><input id="nzrV" value="${E(ed.vis)}">
 <label>امضا و تاریخ</label><input id="nzrS" value="${E(ed.sig)}">
 <label>ثبت دقیق مشاهدات <small style="color:var(--mut)">${SUB}</small></label><textarea id="nzrO" style="min-height:120px">${E(ed.obs)}</textarea>
 <label>موارد پیشنهادی</label><textarea id="nzrG">${E(ed.sug)}</textarea>
 <div class="pmt-er" id="nzrEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-nz="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت در دفتر'}</button><button type="button" data-nz="cancel">انصراف</button></div>`}
function openForm(id){ed={id:id||0,m:curM(),vis:'',sig:'',obs:'',sug:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;Object.assign(ed,{m:x.m,vis:x.vis||'',sig:x.sig||'',obs:x.obs||'',sug:x.sug||''})}
 ov.firstElementChild.innerHTML=formHtml();ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const er=t=>{$('nzrEr').textContent=t};
 const rec={m:+$('nzrM').value,vis:$('nzrV').value.trim(),sig:$('nzrS').value.trim(),obs:$('nzrO').value.trim(),sug:$('nzrG').value.trim()};
 if(!rec.vis&&!rec.sig&&!rec.obs&&!rec.sug){er('دست‌کم یکی از بخش‌ها را پر کنید.');return}
 const L=list();
 if(ed.id){const x=L.find(q=>q.id===ed.id);if(!x){closeForm();return}Object.assign(x,rec)}
 else{let id=Date.now();const u=new Set(L.map(q=>q.id));while(u.has(id))id++;L.push({id,...rec})}
 save();closeForm();render()}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const a=t.closest('[data-nz]');if(!a)return;const k=a.dataset.nz;if(k==='cancel')closeForm();else if(k==='save')saveForm()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-nz]');if(!b)return;const k=b.dataset.nz;
 if(k==='new')openForm();else if(k==='edit')openForm(+b.dataset.i);
 else if(k==='del'){if(!confirm('این بازدید از دفتر حذف شود؟'))return;S.nzr=list().filter(x=>x.id!==+b.dataset.i);save();render()}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* خروجی: ردیف‌های مهر تا خرداد حتی بدون بازدید، مثل دفتر کاغذی */
const msg=t=>{const m=$('nzrMsg');if(m)m.textContent=t||''};
function ledger(){const A=all(),rows=[];
 ORD.forEach(m=>{const xs=A.filter(x=>x.m===m);if(!xs.length)rows.push({m,blank:true});else xs.forEach((x,i)=>rows.push({m,first:i===0,x}))});return rows}
const W=[78,112,350,190],cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
const thead=`<thead><tr><th>${H[0]}</th><th>${H[1]}</th><th>${H[2]}<span class="nzr-sub">${SUB}</span></th><th>${H[3]}</th></tr></thead>`;
const visCell=x=>`<td class="nzr-v"><small>امضا و تاریخ${x&&x.sig?': '+E(x.sig):''}</small>${x?E(x.vis):''}</td>`;
function rowHtml(r){const mn=`<td class="c"><b>${mName(r.m)}</b></td>`;
 if(r.blank)return `<tr class="nzr-bl">${mn}${visCell(null)}<td></td><td></td></tr>`;
 return `<tr>${mn}${visCell(r.x)}<td>${E(r.x.obs)}</td><td>${E(r.x.sug)}</td></tr>`}
const headHtml=()=>{let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b>${TITLE}</b>${l?`<span>${E(l)}</span>`:''}</div>`};
function mount(){let r=$('nzrPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='nzrPrintRoot';r.setAttribute('data-noresp','');document.body.appendChild(r);return r}
function build(rows){const root=mount(),pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${rows.map(rowHtml).join('')}</tbody></table></div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+10,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map((t,i)=>rows[i].blank?Math.max(t.offsetHeight,86):t.offsetHeight);
 const avail=1123-30-26-34-hh-th-6,pg=[];let cur=[],u=0;
 rows.forEach((r,i)=>{const h=Math.min(hs[i],avail);if(cur.length&&u+h>avail){pg.push(cur);cur=[];u=0}cur.push(r);u+=h});pg.push(cur);
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,i)=>{const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${p.map(rowHtml).join('')}</tbody></table><div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(i+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 root.querySelectorAll('tr.nzr-bl td').forEach(td=>td.style.height='86px');return root}
const clean=()=>{document.body.classList.remove('nzr-printing');const r=$('nzrPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const need=()=>{if(!list().length){msg('ابتدا دست‌کم یک بازدید ثبت کنید.');return false}return true};
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(){if(!need())return;msg('');try{await document.fonts.ready}catch(e){}build(ledger());document.body.classList.add('nzr-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(ledger()),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('نظارت-مدیر-جدول-۱۵-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(x){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(x&&x.message?x.message:x))}}
async function doXls(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۵',title:TITLE,sub:'نظارت مدیر و معاون',info:typeof profLine==='function'?profLine():'',head:[H[0],H[1],H[2]+' '+SUB,H[3]],
   rows:ledger().map(r=>r.blank?[mName(r.m),'','','']:[mName(r.m),(r.x.vis||'')+(r.x.sig?'\nامضا و تاریخ: '+r.x.sig:''),r.x.obs||'',r.x.sug||'']),nameCol:1,widths:[10,24,52,36],sign:true});
  await window.dlFile('نظارت-مدیر-جدول-۱۵-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(x){msg('⚠️ ساخت اکسل ناموفق بود: '+(x&&x.message?x.message:x))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='nzr')render()}catch(e){console.error('nzr',e)}return r};
window.NZR={open:openForm,all,render};
}catch(e){console.error('supervision-log',e)}})();

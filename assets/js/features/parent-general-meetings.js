/* جلسات عمومی ماهانه‌ی آموزگار با اولیا — جدول ۱۳ دفتر فرآیندها
   ستون‌های دفتر کاغذی: ماه | تاریخ برگزاری | موضوع | خلاصه مباحث | تصمیمات نهایی | اسامی غایبین
   داده‌ها در S.pmm (آرایه) ذخیره می‌شود: {id, date (میلادی), sub, sum, dec, abs:[شناسه‌ی دانش‌آموز/ولی], ax (غایبان دیگر)}
   فرم، سبک و چاپ از «دفتر جلسات اولیا» (parent-meetings.js) هم‌خانواده است. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dIso=i=>{try{return fmt(new Date(i+'T12:00:00Z'))}catch(e){return i||''}};
const mOf=i=>{try{return jp(new Date(i+'T12:00:00Z')).m}catch(e){return 0}};
const wdOf=i=>{try{return wd(new Date(i+'T12:00:00Z'))}catch(e){return ''}};
const ORD=[7,8,9,10,11,12,1,2,3,4,5,6],mi=m=>ORD.indexOf(m);
const todayIso=()=>iso(tdy());
const list=()=>{S.pmm=Array.isArray(S.pmm)?S.pmm:[];return S.pmm};
const absNames=x=>{const n=(x.abs||[]).map(id=>(S.students||[]).find(s=>s.id===id)).filter(Boolean).map(s=>s.name);if(x.ax)n.push(...String(x.ax).split(/[،,\n]+/).map(t=>t.trim()).filter(Boolean));return n};
function all(){const o=list().slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')||a.id-b.id);o.forEach((x,i)=>x._no=i+1);return o}

const st=document.createElement('style');
st.textContent=`
#pmg .pmt-top{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
#pmg .pmt-k{border-radius:14px;padding:10px 4px;text-align:center;background:var(--bg2)}
#pmg .pmt-k b{display:block;font-size:20px;color:var(--p)}#pmg .pmt-k span{font-size:12px;color:var(--mut);font-weight:700}
#pmg .pmt-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#pmg .pmt-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:14.5px}
#pmg .pmt-d{margin-right:auto;color:var(--mut);font-size:12.5px;font-weight:700}
#pmg .pmt-l{margin-top:7px;font-size:14px;line-height:1.85;white-space:pre-wrap;word-break:break-word}
#pmg .pmt-l i{font-style:normal;font-weight:800;color:var(--p);margin-left:4px;font-size:12.5px}
#pmg .pmt-ac{display:flex;gap:8px;margin-top:8px}#pmg .pmt-ac button{flex:1;margin:0}
#pmg .pmt-ex{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#pmg .pmt-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
.pmg-ab{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.pmg-ab button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:999px;padding:5px 11px;font:700 12.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pmg-ab button.on{border-color:#d9534f;background:#fdeceb;color:#b52b27}
#pmgPrintRoot{position:fixed;left:-99999px;top:0}
@media print{body.pmg-printing>*:not(#pmgPrintRoot){display:none!important}body.pmg-printing #pmgPrintRoot{position:static!important;left:auto!important;display:block!important}body.pmg-printing .pmtA4{break-after:page;page-break-after:always}body.pmg-printing .pmtA4:last-child{break-after:auto;page-break-after:auto}}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='pmg';
sec.innerHTML='<h2>👪 جلسات عمومی اولیا</h2><div class="card"><b>📒 جدول ۱۳ — ثبت جلسات عمومی ماهانه‌ی آموزگار با اولیا</b><p class="sub" style="text-align:right;margin:6px 0 10px">برای هر جلسه تاریخ، موضوع، خلاصه‌ی مباحث، تصمیمات نهایی و اسامی غایبان را ثبت کنید.</p><button class="big" data-pg="new" style="font-size:16px;padding:12px">➕ ثبت جلسه‌ی جدید</button><div class="pmt-top" id="pmgK"></div></div><div class="card"><div id="pmgL"></div></div><div class="card"><b>📤 خروجی جدول ۱۳</b><p class="sub" style="text-align:right;margin:4px 0 0">جدول A4 با ردیف ماه‌های سال تحصیلی، شبیه دفتر کاغذی.</p><div class="pmt-ex"><button class="big ex" data-pg="print">🖨️ چاپ</button><button class="big ex" data-pg="pdf">📄 فایل PDF</button><button class="big ex" data-pg="xls" style="grid-column:1/-1">📊 فایل اکسل</button></div><p class="sub" id="pmgMsg"></p></div>';
const anchor=$('pmt')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='pmg'))pages.push(['pmg','👪 جلسات عمومی اولیا']);

function render(){if(!$('pmgL'))return;const A=all(),cm=mOf(todayIso());
 const kp=(v,t)=>`<div class="pmt-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('pmgK').innerHTML=kp(A.length,'کل جلسات')+kp(A.filter(x=>mOf(x.date)===cm).length,'جلسه‌ی این ماه')+kp(A.reduce((n,x)=>n+absNames(x).length,0),'مجموع غیبت‌ها');
 $('pmgL').innerHTML=A.length?A.slice().reverse().map(x=>{const ab=absNames(x);return `<div class="pmt-e"><div class="pmt-h"><span>${MN[mOf(x.date)-1]||''}</span><span class="pmt-d">📅 ${wdOf(x.date)} ${dIso(x.date)}</span></div>
 ${x.sub?`<div class="pmt-l"><i>موضوع:</i>${E(x.sub)}</div>`:''}${x.sum?`<div class="pmt-l"><i>خلاصه‌ی مباحث:</i>${E(x.sum)}</div>`:''}${x.dec?`<div class="pmt-l"><i>تصمیمات نهایی:</i>${E(x.dec)}</div>`:''}
 <div class="pmt-l"><i>غایبان (${fa(ab.length)}):</i>${ab.length?E(ab.join('، ')):'همه حاضر بودند'}</div>
 <div class="pmt-ac"><button class="sm" data-pg="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-pg="del" data-i="${x.id}">🗑 حذف</button></div></div>`}).join(''):'<div class="pmt-em">هنوز جلسه‌ای ثبت نشده است.<br>با «ثبت جلسه‌ی جدید» شروع کنید.</div>'}

/* فرم */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='pmgOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null;
const setD=i=>{const p=jp(new Date(i+'T12:00:00Z'));ed.y=p.y;ed.m=p.m;ed.d=p.d};
function formHtml(){const y0=jp(tdy()).y,ys=[];for(let y=y0-2;y<=y0+1;y++)ys.push(y);if(!ys.includes(ed.y))ys.push(ed.y);ys.sort((a,b)=>a-b);
 const S0=(S.students||[]).slice().sort((a,b)=>a.name.localeCompare(b.name,'fa'));
 return `<h3>${ed.id?'✏️ ویرایش جلسه':'👪 ثبت جلسه‌ی عمومی با اولیا'}</h3>
 <label>تاریخ برگزاری (شمسی)</label><div class="pmt-dr"><select id="pmgD">${Array.from({length:31},(_,i)=>`<option value="${i+1}"${ed.d===i+1?' selected':''}>${fa(i+1)}</option>`).join('')}</select><select id="pmgM">${MN.map((n,i)=>`<option value="${i+1}"${ed.m===i+1?' selected':''}>${n}</option>`).join('')}</select><select id="pmgY">${ys.map(y=>`<option value="${y}"${ed.y===y?' selected':''}>${fa(y)}</option>`).join('')}</select><button type="button" data-pg="today">امروز</button></div>
 <label>موضوع</label><textarea id="pmgS" style="min-height:56px" placeholder="مثلاً: اولین جلسه‌ی دیدار با اولیا و یادآوری قوانین کلاس">${E(ed.sub)}</textarea>
 <label>خلاصه‌ی مباحث</label><textarea id="pmgU" placeholder="مهم‌ترین نکته‌هایی که در جلسه مطرح شد…">${E(ed.sum)}</textarea>
 <label>تصمیمات نهایی</label><textarea id="pmgC" placeholder="مثلاً: انتخاب نماینده‌ی اولیا برای همکاری بهتر">${E(ed.dec)}</textarea>
 <label>اسامی غایبان <small style="color:var(--mut)">(روی نام لمس کنید؛ دانش‌آموزی که ولی‌اش غایب بود)</small></label>
 <div class="pmg-ab">${S0.map(s=>`<button type="button" data-ab="${s.id}" class="${ed.abs.includes(s.id)?'on':''}">${E(s.name)}</button>`).join('')||'<span class="sub">دانش‌آموزی ثبت نشده است.</span>'}</div>
 <input id="pmgX" style="margin-top:8px" placeholder="غایبان دیگر (اختیاری؛ با ویرگول جدا کنید)" value="${E(ed.ax)}">
 <div class="pmt-er" id="pmgEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-pg="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت در دفتر'}</button><button type="button" data-pg="cancel">انصراف</button></div>`}
function openForm(id){ed={id:id||0,sub:'',sum:'',dec:'',abs:[],ax:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;ed.sub=x.sub||'';ed.sum=x.sum||'';ed.dec=x.dec||'';ed.abs=(x.abs||[]).slice();ed.ax=x.ax||'';setD(x.date||todayIso())}else setD(todayIso());
 ov.firstElementChild.innerHTML=formHtml();ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const y=+$('pmgY').value,m=+$('pmgM').value,d=+$('pmgD').value,er=t=>{$('pmgEr').textContent=t};
 const g=d<=(m<=6?31:30)?fromJ(y,m,d):null,p=g&&jp(g);if(!g||p.y!==y||p.m!==m||p.d!==d){er('تاریخ انتخاب‌شده معتبر نیست.');return}
 const sub=$('pmgS').value.trim(),sum=$('pmgU').value.trim(),dec=$('pmgC').value.trim(),ax=$('pmgX').value.trim();
 if(!sub){er('موضوع جلسه را بنویسید.');$('pmgS').focus();return}
 const rec={date:iso(g),sub,sum,dec,abs:ed.abs.slice(),ax},L=list();
 if(ed.id){const x=L.find(q=>q.id===ed.id);if(!x){closeForm();return}Object.assign(x,rec)}
 else{let id=Date.now();const u=new Set(L.map(q=>q.id));while(u.has(id))id++;L.push({id,...rec})}
 save();closeForm();render()}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const ab=t.closest('[data-ab]');if(ab){const id=+ab.dataset.ab,i=ed.abs.indexOf(id);if(i<0)ed.abs.push(id);else ed.abs.splice(i,1);ab.classList.toggle('on',i<0);return}
 const a=t.closest('[data-pg]');if(!a)return;const k=a.dataset.pg;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();else if(k==='today'){setD(todayIso());$('pmgY').value=ed.y;$('pmgM').value=ed.m;$('pmgD').value=ed.d}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});
sec.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(!b)return;const k=b.dataset.pg;
 if(k==='new')openForm();else if(k==='edit')openForm(+b.dataset.i);
 else if(k==='del'){if(!confirm('این جلسه از دفتر حذف شود؟'))return;S.pmm=list().filter(x=>x.id!==+b.dataset.i);save();render()}
 else if(k==='print')doPrint();else if(k==='pdf')doPdf();else if(k==='xls')doXls()});

/* خروجی: ردیف‌های ماه‌های سال تحصیلی (مهر…اردیبهشت) حتی بدون جلسه، مثل دفتر کاغذی */
const msg=t=>{const m=$('pmgMsg');if(m)m.textContent=t||''};
function ledger(){const A=all(),rows=[];const ms=[7,8,9,10,11,12,1,2];A.forEach(x=>{const m=mOf(x.date);if(m&&!ms.includes(m))ms.push(m)});
 ms.sort((a,b)=>mi(a)-mi(b)).forEach(m=>{const xs=A.filter(x=>mOf(x.date)===m);if(!xs.length)rows.push({m,blank:true});else xs.forEach((x,i)=>rows.push({m,first:i===0,x}))});return rows}
const W=[72,86,146,164,144,106],H=['ماه','تاریخ برگزاری','موضوع','خلاصه مباحث','تصمیمات نهایی','اسامی غایبین'];
const thead=`<thead><tr>${H.map(h=>`<th>${h}</th>`).join('')}</tr></thead>`,cg=`<colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>`;
function rowHtml(r){const mn=`<td class="c"><b>${MN[r.m-1]}</b></td>`;if(r.blank)return `<tr class="bl">${mn}<td></td><td></td><td></td><td></td><td></td></tr>`;const x=r.x;
 return `<tr>${mn}<td class="c">${wdOf(x.date)}<br>${dIso(x.date)}</td><td>${E(x.sub)}</td><td>${E(x.sum)}</td><td>${E(x.dec)}</td><td>${E(absNames(x).join('، '))}</td></tr>`}
function headHtml(){let l='';try{l=typeof profLine==='function'?profLine():''}catch(e){}return `<div class="pmt-hd"><b>جدول ۱۳ / ثبت جلسات عمومی ماهانه آموزگار با اولیا</b>${l?`<span>${E(l)}</span>`:''}</div>`}
function mount(){let r=$('pmgPrintRoot');if(r)r.remove();r=document.createElement('div');r.id='pmgPrintRoot';document.body.appendChild(r);return r}
function build(rows){const root=mount(),pr=document.createElement('div');pr.className='pmtA4';
 pr.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${rows.map(rowHtml).join('')}</tbody></table></div>`;root.appendChild(pr);
 const hh=pr.querySelector('.pmt-hd').offsetHeight+10,th=pr.querySelector('thead').offsetHeight,hs=[...pr.querySelectorAll('tbody tr')].map((t,i)=>rows[i].blank?Math.max(t.offsetHeight,62):t.offsetHeight);
 const avail=1123-30-26-34-hh-th-6,pg=[];let cur=[],u=0;
 rows.forEach((r,i)=>{const h=Math.min(hs[i],avail);if(cur.length&&u+h>avail){pg.push(cur);cur=[];u=0}cur.push(r);u+=h});pg.push(cur);
 root.innerHTML='';const tot=pg.length,stamp=fmt(tdy());
 pg.forEach((p,i)=>{const d=document.createElement('div');d.className='pmtA4';
  d.innerHTML=`<div class="pmt-in">${headHtml()}<table>${cg}${thead}<tbody>${p.map(rowHtml).join('')}</tbody></table><div class="pmt-ft"><span>تاریخ تهیه: ${stamp}</span><span>صفحه ${fa(i+1)} از ${fa(tot)}</span></div></div>`;root.appendChild(d)});
 root.querySelectorAll('tr.bl td').forEach(td=>td.style.height='62px');return root}
const clean=()=>{document.body.classList.remove('pmg-printing');const r=$('pmgPrintRoot');if(r)r.remove()};
window.addEventListener('afterprint',clean);
const need=()=>{if(!list().length){msg('ابتدا دست‌کم یک جلسه ثبت کنید.');return false}return true};
const stampN=()=>{const p=jp(tdy());return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.d).padStart(2,'0')};
async function doPrint(){if(!need())return;msg('');try{await document.fonts.ready}catch(e){}build(ledger());document.body.classList.add('pmg-printing');setTimeout(()=>{try{window.print()}catch(e){clean()}},80)}
async function doPdf(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF آماده نیست');await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  const root=build(ledger()),doc=new(window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),els=[...root.children];
  for(let i=0;i<els.length;i++){const cv=await X.rast(els[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297)}
  root.remove();await window.dlFile('جلسات-عمومی-اولیا-جدول-۱۳-'+stampN()+'.pdf',doc.output('arraybuffer'));
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. از «چاپ» و Save as PDF استفاده کنید.')}
 catch(x){clean();msg('⚠️ ساخت PDF ناموفق بود: '+(x&&x.message?x.message:x))}}
async function doXls(){if(!need())return;msg('⏳ در حال ساخت فایل…');
 try{if(typeof xbook!=='function')throw new Error('ابزار اکسل آماده نیست');
  const buf=await xbook({sheet:'جدول ۱۳',title:'جدول ۱۳ / ثبت جلسات عمومی ماهانه آموزگار با اولیا',sub:'جلسات عمومی اولیا',info:typeof profLine==='function'?profLine():'',head:H,
   rows:ledger().map(r=>r.blank?[MN[r.m-1],'','','','','']:[MN[r.m-1],wdOf(r.x.date)+' '+dIso(r.x.date),r.x.sub||'',r.x.sum||'',r.x.dec||'',absNames(r.x).join('، ')]),nameCol:2,widths:[10,16,30,36,30,26],sign:true});
  await window.dlFile('جلسات-عمومی-اولیا-جدول-۱۳-'+stampN()+'.xlsx',buf);
  msg(window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد.')}
 catch(x){msg('⚠️ ساخت اکسل ناموفق بود: '+(x&&x.message?x.message:x))}}

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='pmg')render()}catch(e){console.error('pmg',e)}return r};
window.PMG={open:openForm,all,render};
}catch(e){console.error('parent-general-meetings',e)}})();

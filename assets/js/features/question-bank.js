/* بانک سؤالات امتحانی — زیرساخت مرحله‌ی ۱
   فقط ثبت، مشاهده، ویرایش و حذف سؤال + دسته‌بندی. (بارگذاری منبع و هوش مصنوعی در مراحل بعد)
   داده‌ها در S.qbk (آرایه) ذخیره می‌شود؛ هر سؤال:
   { id, v:1,               شناسه و نسخه‌ی ساختار (برای مهاجرت در مراحل بعد)
     gr پایه (اول…ششم)، bk کتاب، ls درس، ch فصل، tp مبحث (اختیاری)،
     lv  سطح: 'e' آسان | 'm' متوسط | 'h' سخت،
     ty  نوع: 'mc' چندگزینه‌ای | 'tf' صحیح/غلط | 'fb' جای‌خالی | 'sa' کوتاه‌پاسخ | 'es' تشریحی،
     q   متن سؤال،
     op  گزینه‌ها (فقط mc، آرایه‌ی ۲ تا ۴ متن)،  ok اندیس گزینه‌ی درست (mc) وگرنه -1،
     ans پاسخ (mc: متن گزینه‌ی درست | tf: 'T' یا 'F' | بقیه: متن پاسخ)،
     pt  بارم (عدد)،  src منبع (متن آزاد)،  ca/ua زمان ساخت/ویرایش }
   فقط کلید تازه؛ داده‌ی قبلی تغییری نمی‌کند. فیلدهای ناشناس هنگام ویرایش حفظ می‌شوند. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const TY=[['mc','چندگزینه‌ای'],['tf','صحیح / غلط'],['fb','جای‌خالی'],['sa','کوتاه‌پاسخ'],['es','تشریحی']];
const LV=[['e','آسان','#1a8f55'],['m','متوسط','#f0a030'],['h','سخت','#d9534f']];
const LET=['الف','ب','ج','د'];
const tyN=k=>(TY.find(x=>x[0]===k)||[0,'—'])[1];
const lvO=k=>LV.find(x=>x[0]===k)||['','—','#888'];
const grades=()=>typeof GR!=='undefined'?GR:['اول','دوم','سوم','چهارم','پنجم','ششم'];
const list=()=>{S.qbk=Array.isArray(S.qbk)?S.qbk:[];return S.qbk};
const nf=v=>fa(String(v).replace('.','٫'));
const toLat=t=>String(t||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫،,]/g,'.').trim();
const uniq=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y),'fa'));

const st=document.createElement('style');
st.textContent=`
#qbk .qbk-top{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
#qbk .qbk-k{border-radius:14px;padding:10px 2px;text-align:center;background:var(--bg2)}
#qbk .qbk-k b{display:block;font-size:20px;color:var(--p)}#qbk .qbk-k span{font-size:12px;color:var(--mut);font-weight:700}
#qbk .qbk-fl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#qbk .qbk-fl select,#qbk #qbkSrch{width:100%;margin:0;box-sizing:border-box}
#qbk #qbkSrch{margin-top:8px}
#qbk .qbk-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#qbk .qbk-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:13px}
#qbk .qbk-bd{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:800}
#qbk .qbk-ty{background:var(--bg2);color:var(--p);border-radius:999px;padding:2px 10px;font-size:12px}
#qbk .qbk-pt{margin-right:auto;color:var(--mut);font-size:12.5px}
#qbk .qbk-p{margin-top:6px;font-size:12.5px;color:var(--mut);font-weight:700;line-height:1.8}
#qbk .qbk-q{margin-top:6px;font-size:14.5px;line-height:1.95;white-space:pre-wrap;word-break:break-word;font-weight:700}
#qbk .qbk-o{margin-top:4px;font-size:13.5px;line-height:1.8;display:flex;gap:6px}
#qbk .qbk-o.ok{color:#1a8f55;font-weight:800}
#qbk .qbk-a{margin-top:6px;font-size:13.5px;line-height:1.9;white-space:pre-wrap;word-break:break-word}
#qbk .qbk-a b{color:#1a8f55}
#qbk .qbk-s{margin-top:4px;font-size:12px;color:var(--mut)}
#qbk .qbk-ac{display:flex;gap:8px;margin-top:8px}#qbk .qbk-ac button{flex:1;margin:0}
#qbk .qbk-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
.pmt-bx .qbk-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.pmt-bx .qbk-seg button,.pmt-bx .qbk-tf button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:9px 4px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pmt-bx .qbk-seg button.on,.pmt-bx .qbk-tf button.on{color:#fff;border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2))}
.pmt-bx .qbk-tf{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.pmt-bx .qbk-op{display:flex;gap:6px;align-items:center;margin-top:6px}
.pmt-bx .qbk-op button{flex:none;width:42px;height:42px;border:2px solid var(--line);background:var(--card);color:var(--mut);border-radius:12px;font:800 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer;padding:0}
.pmt-bx .qbk-op button.on{background:#1a8f55;border-color:#1a8f55;color:#fff}
.pmt-bx .qbk-op input{flex:1}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='qbk';
sec.innerHTML='<h2>🗂️ بانک سؤالات امتحانی</h2><div class="card"><b>📚 بانک سؤالات</b><p class="sub" style="text-align:right;margin:6px 0 10px">سؤال‌ها را بر اساس پایه، کتاب، درس، مبحث و سطح دشواری ذخیره کنید تا در مرحله‌های بعد برای ساخت آزمون استفاده شوند.</p><button class="big" data-qb="new" style="font-size:16px;padding:12px">➕ ثبت سؤال جدید</button><div class="qbk-top" id="qbkK"></div></div><div class="card"><b>🔎 فیلتر و جستجو</b><div class="qbk-fl" id="qbkF"></div><input id="qbkSrch" type="text" placeholder="جستجو در متن سؤال، پاسخ یا منبع…" autocomplete="off"><p class="sub" id="qbkCnt" style="text-align:right;margin:8px 0 0"></p></div><div class="card"><div id="qbkL"></div><p class="sub" id="qbkMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p></div>';
const anchor=$('exp')||$('mk')||$('crs')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='qbk'))pages.push(['qbk','🗂️ بانک سؤالات']);

/* ---------- فیلتر ---------- */
const F={gr:'',bk:'',ls:'',ch:'',tp:'',lv:'',ty:'',s:''};
const order=['gr','bk','ls','ch','tp'];
function base(upto){return list().filter(q=>{for(const k of order){if(k===upto)break;if(F[k]&&q[k]!==F[k])return false}return true})}
function match(q){
 for(const k of ['gr','bk','ls','tp','lv','ty'])if(F[k]&&q[k]!==F[k])return false;
 if(F.s){const h=[q.q,q.ans,(q.op||[]).join(' '),q.src,q.tp,q.ch,q.ls,q.bk].join(' ');if(h.indexOf(F.s)<0)return false}
 return true}
const sel=(k,all,vals,cur)=>`<select data-qf="${k}"><option value="">${all}</option>${vals.map(v=>`<option value="${E(v)}"${v===cur?' selected':''}>${E(v)}</option>`).join('')}</select>`;
function renderBar(){const box=$('qbkF');if(!box)return;
 order.forEach(k=>{const vals=uniq(base(k).map(q=>q[k]));if(F[k]&&vals.indexOf(F[k])<0)F[k]=''});
 const gv=uniq(list().map(q=>q.gr)).sort((a,b)=>grades().indexOf(a)-grades().indexOf(b));
 box.innerHTML=sel('gr','همه‌ی پایه‌ها',gv,F.gr)+sel('bk','همه‌ی کتاب‌ها',uniq(base('bk').map(q=>q.bk)),F.bk)
  +sel('ls','همه‌ی درس‌ها',uniq(base('ls').map(q=>q.ls)),F.ls)+sel('ch','همه‌ی فصل‌ها',uniq(base('ch').map(q=>q.ch)),F.ch)+sel('tp','همه‌ی مبحث‌ها',uniq(base('tp').map(q=>q.tp)),F.tp)
  +`<select data-qf="lv"><option value="">همه‌ی سطح‌ها</option>${LV.map(x=>`<option value="${x[0]}"${F.lv===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select>`
  +`<select data-qf="ty"><option value="">همه‌ی انواع</option>${TY.map(x=>`<option value="${x[0]}"${F.ty===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select>`}

/* ---------- نمایش ---------- */
function ansT(x){if(x.ty==='tf')return x.ans==='T'?'صحیح':'غلط';if(x.ty==='mc'){const o=(x.op||[])[x.ok];return o!=null&&o!==''?o:(x.ans||'')}return x.ans||''}
function card(x){const l=lvO(x.lv),path=[x.gr?'پایه '+x.gr:'',x.bk,x.ls,x.ln!=null?'درس شماره‌ی '+fa(x.ln):'',x.ch?'فصل '+x.ch:'',x.tp,x.p1!=null?(x.p2!=null&&x.p2!==x.p1?'صفحه‌ی '+fa(x.p1)+' تا '+fa(x.p2):'صفحه‌ی '+fa(x.p1)):''].filter(Boolean).map(E).join(' › ');
 let body=`<div class="qbk-q">${E(x.q)}</div>`;
 if(x.ty==='mc')body+=(x.op||[]).map((o,i)=>`<div class="qbk-o${i===x.ok?' ok':''}"><span>${LET[i]||fa(i+1)})</span><span>${E(o)}${i===x.ok?' ✔':''}</span></div>`).join('');
 else body+=`<div class="qbk-a"><b>پاسخ:</b> ${E(ansT(x)||'ثبت نشده')}</div>`;
 return `<div class="qbk-e"><div class="qbk-h"><span class="qbk-bd" style="background:${l[2]}">${l[1]}</span><span class="qbk-ty">${tyN(x.ty)}</span><span class="qbk-pt">بارم: ${nf(x.pt)}</span></div>
 <div class="qbk-p">${path}</div>${body}${x.src?`<div class="qbk-s">📖 منبع: ${E(x.src)}</div>`:''}
 <div class="qbk-ac"><button class="sm" data-qb="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-qb="del" data-i="${x.id}">🗑 حذف</button></div></div>`}
function renderList(){if(!$('qbkL'))return;const A=list(),R=A.filter(match).sort((a,b)=>(b.ca||b.id)-(a.ca||a.id));
 const kp=(v,t)=>`<div class="qbk-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('qbkK').innerHTML=kp(A.length,'کل سؤال‌ها')+LV.map(l=>kp(A.filter(q=>q.lv===l[0]).length,l[1])).join('');
 $('qbkCnt').textContent=A.length?(R.length===A.length?'':'نمایش '+fa(R.length)+' از '+fa(A.length)+' سؤال'):'';
 $('qbkL').innerHTML=R.length?R.map(card).join(''):(A.length?'<div class="qbk-em">سؤالی با این فیلترها پیدا نشد.</div>':'<div class="qbk-em">هنوز سؤالی ثبت نشده است.<br>با «ثبت سؤال جدید» شروع کنید.</div>')}
function render(){renderBar();renderList()}
const say=t=>{const m=$('qbkMsg');if(m)m.textContent=t||''};

/* ---------- پیشنهاد دسته‌بندی از فهرست درس‌های برنامه + سؤال‌های قبلی ---------- */
const crs=()=>(S.courses||[]).filter(c=>c&&c.name);
const bkOf=()=>uniq(crs().map(c=>c.book).concat(list().map(q=>q.bk)));
const csFor=bk=>crs().filter(c=>!bk||c.book===bk||c.name===bk);
const lsOf=bk=>uniq(csFor(bk).flatMap(c=>(c.ch||[]).map(h=>h&&h.name)).concat(list().filter(q=>!bk||q.bk===bk).map(q=>q.ls)));
const tpOf=(bk,ls)=>uniq(csFor(bk).flatMap(c=>(c.ch||[]).filter(h=>h&&(!ls||h.name===ls)).flatMap(h=>(h.tp||[]).map(t=>t&&t.name))).concat(list().filter(q=>(!bk||q.bk===bk)&&(!ls||q.ls===ls)).map(q=>q.tp)));
const dl=(id,a)=>`<datalist id="${id}">${a.map(v=>`<option value="${E(v)}">`).join('')}</datalist>`;
function refreshDL(){const bk=($('qfB')||{}).value||'',ls=($('qfL')||{}).value||'';
 $('qfBL').innerHTML=bkOf().map(v=>`<option value="${E(v)}">`).join('');$('qfLL').innerHTML=lsOf(bk.trim()).map(v=>`<option value="${E(v)}">`).join('');$('qfPL').innerHTML=tpOf(bk.trim(),ls.trim()).map(v=>`<option value="${E(v)}">`).join('')}

/* ---------- فرم ---------- */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='qbkOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null,LAST={};
function formHtml(){const g=grades();
 return `<h3>${ed.id?'✏️ ویرایش سؤال':'🗂️ ثبت سؤال جدید'}</h3>
 <label>پایه</label><select id="qfG"><option value="">انتخاب کنید</option>${g.map(x=>`<option value="${x}"${(ed.gr||(S.prof&&S.prof.grade)||'')===x?' selected':''}>پایه ${x}</option>`).join('')}</select>
 <label>کتاب</label><input id="qfB" list="qfBL" value="${E(ed.bk)}" placeholder="مثلاً کتاب فارسی پایه چهارم" autocomplete="off">
 <label>درس</label><input id="qfL" list="qfLL" value="${E(ed.ls)}" placeholder="نام درس یا فصل" autocomplete="off">
 <label>فصل (اختیاری)</label><input id="qfC" value="${E(ed.ch||'')}" placeholder="مثلاً فصل دوم" autocomplete="off">
 <label>مبحث (اختیاری)</label><input id="qfP" list="qfPL" value="${E(ed.tp)}" placeholder="مثلاً نگارش، دستور، ضرب" autocomplete="off">
 <label>شماره‌ی درس (اختیاری؛ برای انتخاب محدوده‌ی امتحان)</label><input id="qfLn" type="text" inputmode="numeric" value="${E(ed.ln)}" placeholder="مثلاً ۳" autocomplete="off">
 <label>صفحه‌ی کتاب (اختیاری)</label><div class="qbk-fl"><input id="qfP1" type="text" inputmode="numeric" value="${E(ed.p1)}" placeholder="از صفحه" autocomplete="off"><input id="qfP2" type="text" inputmode="numeric" value="${E(ed.p2)}" placeholder="تا صفحه (اگر یک صفحه است خالی بگذارید)" autocomplete="off"></div>
 ${dl('qfBL',[])}${dl('qfLL',[])}${dl('qfPL',[])}
 <label>سطح دشواری</label><div class="qbk-seg" id="qfLv">${LV.map(l=>`<button type="button" data-qb="lv" data-v="${l[0]}" class="${ed.lv===l[0]?'on':''}">${l[1]}</button>`).join('')}</div>
 <label>نوع سؤال</label><select id="qfT">${TY.map(t=>`<option value="${t[0]}"${ed.ty===t[0]?' selected':''}>${t[1]}</option>`).join('')}</select>
 <label>متن سؤال</label><textarea id="qfQ" style="min-height:96px">${E(ed.q)}</textarea>
 <div id="qfMc"><label>گزینه‌ها (اختیاری؛ در صورت داشتن پاسخ صحیح، دکمه‌ی کنار گزینه را بزنید)</label>${[0,1,2,3].map(i=>`<div class="qbk-op"><button type="button" data-qb="ok" data-i="${i}" class="${ed.ok===i?'on':''}">${LET[i]}</button><input id="qfO${i}" value="${E(ed.op[i]||'')}" placeholder="گزینه‌ی ${LET[i]}" autocomplete="off"></div>`).join('')}</div>
 <div id="qfTf"><label>پاسخ درست (اختیاری)</label><div class="qbk-tf"><button type="button" data-qb="tf" data-v="T" class="${ed.tfv==='T'?'on':''}">صحیح</button><button type="button" data-qb="tf" data-v="F" class="${ed.tfv==='F'?'on':''}">غلط</button></div></div>
 <div id="qfAn"><label>پاسخ (اختیاری)</label><textarea id="qfA">${E(ed.ans)}</textarea></div>
 <label>بارم</label><input id="qfPt" type="text" inputmode="decimal" value="${E(String(ed.pt).replace('.','٫'))}" autocomplete="off">
 <label>منبع (اختیاری)</label><input id="qfR" value="${E(ed.src)}" placeholder="مثلاً کتاب درسی صفحه‌ی ۴۲ یا طرح معلم" autocomplete="off">
 <div class="pmt-er" id="qfEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-qb="save">💾 ${ed.id?'ذخیره‌ی تغییرات':'ثبت در بانک'}</button><button type="button" data-qb="cancel">انصراف</button></div>`}
function togType(){const t=$('qfT').value;$('qfMc').hidden=t!=='mc';$('qfTf').hidden=t!=='tf';$('qfAn').hidden=t==='mc'||t==='tf'}
function openForm(id){
 ed={id:id||0,gr:'',bk:'',ls:'',ch:'',tp:'',ln:'',p1:'',p2:'',lv:'',ty:'mc',q:'',op:['','','',''],ok:-1,tfv:'',ans:'',pt:'1',src:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;
  Object.assign(ed,{gr:x.gr||'',bk:x.bk||'',ls:x.ls||'',ch:x.ch||'',tp:x.tp||'',ln:x.ln==null?'':String(x.ln),p1:x.p1==null?'':String(x.p1),p2:x.p2==null?'':String(x.p2),lv:x.lv||'',ty:x.ty||'mc',q:x.q||'',pt:String(x.pt==null?1:x.pt),src:x.src||''});
  if(x.ty==='mc'){(x.op||[]).slice(0,4).forEach((o,i)=>{ed.op[i]=o});ed.ok=typeof x.ok==='number'?x.ok:-1}
  else if(x.ty==='tf')ed.tfv=x.ans==='T'||x.ans==='F'?x.ans:'';else ed.ans=x.ans||''}
 else{ed.gr=LAST.gr||(S.prof&&S.prof.grade)||'';ed.bk=LAST.bk||'';ed.ls=LAST.ls||'';ed.ch=LAST.ch||'';ed.tp=LAST.tp||'';ed.ln=LAST.ln||'';ed.lv=LAST.lv||'';ed.ty=LAST.ty||'mc';ed.pt=LAST.pt||'1'}
 ov.firstElementChild.innerHTML=formHtml();togType();refreshDL();ov.classList.add('on')}
const closeForm=()=>{ov.classList.remove('on');ed=null};
function saveForm(){const er=t=>{$('qfEr').textContent=t},v=id=>$(id).value.trim();
 const gr=$('qfG').value,bk=v('qfB'),ls=v('qfL'),ch=v('qfC'),tp=v('qfP'),ty=$('qfT').value,q=v('qfQ'),src=v('qfR');
 if(!gr){er('پایه را انتخاب کنید.');$('qfG').focus();return}
 if(!bk){er('کتاب را بنویسید.');$('qfB').focus();return}
 if(!ls){er('درس را بنویسید.');$('qfL').focus();return}
 if(!ed.lv){er('سطح دشواری را انتخاب کنید.');return}
 if(!q){er('متن سؤال را بنویسید.');$('qfQ').focus();return}
 const pt=parseFloat(toLat(v('qfPt')));if(!(pt>0)||pt>100){er('بارم باید عددی بزرگ‌تر از صفر (حداکثر ۱۰۰) باشد.');$('qfPt').focus();return}
 const nz=id=>{const t=toLat(v(id));if(!t)return{ok:true,n:null};return /^\d{1,4}$/.test(t)&&+t>0?{ok:true,n:+t}:{ok:false}};
 const rLn=nz('qfLn'),rP1=nz('qfP1'),rP2=nz('qfP2');
 if(!rLn.ok){er('شماره‌ی درس باید یک عدد صحیح مثبت باشد (یا خالی بماند).');$('qfLn').focus();return}
 if(!rP1.ok||!rP2.ok){er('شماره‌ی صفحه باید عدد صحیح مثبت باشد (یا خالی بماند).');return}
 if(rP2.n!=null&&rP1.n==null){er('اگر «تا صفحه» را نوشته‌اید، «از صفحه» را هم بنویسید.');$('qfP1').focus();return}
 if(rP1.n!=null&&rP2.n!=null&&rP2.n<rP1.n){er('«تا صفحه» نباید کوچک‌تر از «از صفحه» باشد.');$('qfP2').focus();return}
 let op=[],ok=-1,ans='';
 if(ty==='mc'){const raw=[0,1,2,3].map(i=>v('qfO'+i));raw.forEach((o,i)=>{if(o){if(i===ed.ok)ok=op.length;op.push(o)}});
  if(op.length<2){er('دست‌کم دو گزینه بنویسید.');return}
  if(ok>=0)ans=op[ok]}
 else if(ty==='tf'){ans=(ed.tfv==='T'||ed.tfv==='F')?ed.tfv:''}
 else{ans=v('qfA')}
 const rec={v:1,gr,bk,ls,ch,tp,lv:ed.lv,ty,q,op,ok,ans,pt,src},L=list(),now=Date.now();
 if(rLn.n!=null)rec.ln=rLn.n;if(rP1.n!=null){rec.p1=rP1.n;rec.p2=rP2.n!=null?rP2.n:rP1.n}
 if(ed.id){const x=L.find(o=>o.id===ed.id);if(!x){closeForm();return}if(rec.ln==null)delete x.ln;if(rec.p1==null){delete x.p1;delete x.p2}Object.assign(x,rec,{ua:now})}
 else{let id=now;const u=new Set(L.map(o=>o.id));while(u.has(id))id++;L.push(Object.assign({id},rec,{ca:now}))}
 LAST={gr,bk,ls,ch,tp,ln:rLn.n!=null?String(rLn.n):'',lv:ed.lv,ty,pt:String(pt)};
 save();closeForm();render();say('✅ سؤال ذخیره شد')}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}
 const a=t.closest('[data-qb]');if(!a||!ed)return;const k=a.dataset.qb;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();
 else if(k==='lv'){ed.lv=a.dataset.v;ov.querySelectorAll('[data-qb="lv"]').forEach(b=>b.classList.toggle('on',b===a))}
 else if(k==='ok'){ed.ok=ed.ok===+a.dataset.i?-1:+a.dataset.i;ov.querySelectorAll('[data-qb="ok"]').forEach(b=>b.classList.toggle('on',+b.dataset.i===ed.ok))}
 else if(k==='tf'){ed.tfv=a.dataset.v;ov.querySelectorAll('[data-qb="tf"]').forEach(b=>b.classList.toggle('on',b===a))}});
ov.addEventListener('change',e=>{if(ed&&e.target.id==='qfT')togType()});
ov.addEventListener('input',e=>{if(ed&&(e.target.id==='qfB'||e.target.id==='qfL'))refreshDL()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))closeForm()});

/* ---------- رویدادهای صفحه ---------- */
sec.addEventListener('click',e=>{const b=e.target.closest('[data-qb]');if(!b)return;const k=b.dataset.qb;
 if(k==='new'){say('');openForm()}else if(k==='edit'){say('');openForm(+b.dataset.i)}
 else if(k==='del'){if(!confirm('این سؤال از بانک حذف شود؟ این کار قابل بازگشت نیست.'))return;S.qbk=list().filter(x=>x.id!==+b.dataset.i);save();render();say('🗑 سؤال حذف شد')}});
sec.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.qf;if(!k)return;F[k]=e.target.value;
 const i=order.indexOf(k);if(i>=0)order.slice(i+1).forEach(x=>{F[x]=''});renderBar();renderList()});
sec.addEventListener('input',e=>{if(e.target.id==='qbkSrch'){F.s=e.target.value.trim();renderList()}});

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='qbk')render()}catch(e){console.error('qbk',e)}return r};
window.QBK={open:openForm,all:()=>list().slice(),render};
}catch(e){console.error('question-bank',e)}})();

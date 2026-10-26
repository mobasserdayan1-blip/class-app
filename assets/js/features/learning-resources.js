/* مدیریت منابع درسی — زیرساخت مرحله‌ی ۲ (آماده‌سازی برای هوش مصنوعی در مرحله‌ی بعد)
   بارگذاری PDF، عکس و متن؛ ثبت پایه/کتاب/درس/مبحث؛ فهرست، مشاهده و حذف.
   ذخیره‌سازی دو بخش دارد:
   ۱) فراداده در S.rsc (آرایه، سبک، همراه پشتیبان و ذخیره‌ی ابری):
      { id, v:1, k:'pdf'|'img'|'txt', nm نام، mt نوع فایل، sz اندازه (بایت)، sha اثرانگشت SHA-256،
        gr پایه، bk کتاب، ls درس، tp مبحث (اختیاری)، nt توضیح،
        tx:'ready' (متن آماده است) | 'pending' (باید متن از PDF/عکس استخراج شود)، tc تعداد نویسه‌ی متن، ca/ua زمان }
   ۲) خودِ فایل در IndexedDB جداگانه (cl_rsc، فروشگاه f): { id, buf (ArrayBuffer), mt, text, sha }
      — فایل فقط با «افزودن» نوشته می‌شود (هیچ‌وقت جایگزین نمی‌شود) و محتوایش بعد از ثبت قابل ویرایش نیست.
      — بازنشانی/پاک‌سازی‌های دیگر برنامه به این پایگاه دست نمی‌زنند؛ فقط حذفِ تأییدشده‌ی همین صفحه پاکش می‌کند.
   برای مرحله‌ی بعد: window.RSC = { list, getFile(id)→{buf,mt,text,sha}, getText(id), pending() } */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const KD=[['pdf','PDF','📄'],['img','عکس','🖼️'],['txt','متن','📝']];
const kO=k=>KD.find(x=>x[0]===k)||['','—','📎'];
const MAX=20*1024*1024;
const grades=()=>typeof GR!=='undefined'?GR:['اول','دوم','سوم','چهارم','پنجم','ششم'];
const list=()=>{S.rsc=Array.isArray(S.rsc)?S.rsc:[];return S.rsc};
const uniq=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y),'fa'));
const szT=n=>n>=1048576?fa((n/1048576).toFixed(1).replace('.','٫'))+' مگابایت':fa(Math.max(1,Math.round(n/1024)))+' کیلوبایت';

/* ---------- IndexedDB (فایل‌ها) ---------- */
const DBN='cl_rsc',ST='f';let dbp=null;
const db=()=>dbp||(dbp=new Promise((res,rej)=>{try{const q=indexedDB.open(DBN,1);q.onupgradeneeded=()=>q.result.createObjectStore(ST,{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=()=>{dbp=null;rej(q.error)};q.onblocked=()=>{dbp=null;rej(new Error('blocked'))}}catch(e){dbp=null;rej(e)}}));
const tx=(mode,fn)=>db().then(d=>new Promise((res,rej)=>{let out;const t=d.transaction(ST,mode),r=fn(t.objectStore(ST));if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('abort'))}));
const addF=rec=>tx('readwrite',s=>s.add(rec)); /* add: اگر کلید وجود داشته باشد خطا می‌دهد، یعنی هرگز بازنویسی نمی‌شود */
const getF=id=>tx('readonly',s=>s.get(id));
const delF=id=>tx('readwrite',s=>s.delete(id));
const keysF=()=>tx('readonly',s=>s.getAllKeys());
async function sha(buf){try{if(!(window.crypto&&crypto.subtle))return'';const h=await crypto.subtle.digest('SHA-256',buf);return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){return''}}
function decode(buf){let t='';try{t=new TextDecoder('utf-8').decode(buf);if(t.indexOf('\uFFFD')>=0)t=new TextDecoder('windows-1256').decode(buf)}catch(e){}return t.replace(/^\uFEFF/,'')}

const st=document.createElement('style');
st.textContent=`
#rsc .rsc-top{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
#rsc .rsc-k{border-radius:14px;padding:10px 2px;text-align:center;background:var(--bg2)}
#rsc .rsc-k b{display:block;font-size:20px;color:var(--p)}#rsc .rsc-k span{font-size:12px;color:var(--mut);font-weight:700}
#rsc .rsc-fl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
#rsc .rsc-fl select,#rsc #rscSrch{width:100%;margin:0;box-sizing:border-box}#rsc #rscSrch{margin-top:8px}
#rsc .rsc-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card)}
#rsc .rsc-h{display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px;line-height:1.7}
#rsc .rsc-h i{font-style:normal;font-size:22px;flex:none}#rsc .rsc-h span{flex:1;word-break:break-word}
#rsc .rsc-p{margin-top:5px;font-size:12.5px;color:var(--mut);font-weight:700;line-height:1.8}
#rsc .rsc-m{margin-top:5px;display:flex;gap:6px;flex-wrap:wrap;font-size:12px;font-weight:800}
#rsc .rsc-m b{border-radius:999px;padding:2px 10px;background:var(--bg2);color:var(--p)}
#rsc .rsc-m b.w{background:#fdecea;color:#d9534f}#rsc .rsc-m b.ok{background:#e6f6ee;color:#1a8f55}
#rsc .rsc-n{margin-top:5px;font-size:13px;line-height:1.8;white-space:pre-wrap;word-break:break-word}
#rsc .rsc-ac{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}#rsc .rsc-ac button{margin:0}
#rsc .rsc-em{text-align:center;color:var(--mut);padding:18px 0;font-size:14px;line-height:2}
#rsc .rsc-nt{font-size:12.5px;line-height:1.9;color:var(--mut);text-align:right;margin:6px 0 0}
.pmt-bx .rsc-seg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.pmt-bx .rsc-seg button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:9px 4px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pmt-bx .rsc-seg button.on{color:#fff;border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2))}
.pmt-bx .rsc-fn{font-size:12.5px;color:var(--mut);margin-top:6px;line-height:1.8;word-break:break-word}
.pmt-bx .rsc-vw{margin-top:8px}.pmt-bx .rsc-vw iframe{width:100%;height:62vh;border:1.5px solid var(--line);border-radius:12px;background:#fff}
.pmt-bx .rsc-vw img{max-width:100%;border-radius:12px;display:block;margin:0 auto}
.pmt-bx .rsc-vw pre{white-space:pre-wrap;word-break:break-word;font:400 14px/1.9 Vazirmatn,Tahoma,sans-serif;margin:0;max-height:62vh;overflow:auto;border:1.5px solid var(--line);border-radius:12px;padding:10px}
.pmt-bx .rsc-wn{margin-top:8px;padding:8px 10px;border-radius:12px;background:#fdecea;color:#d9534f;font-weight:800;font-size:13px;line-height:1.8}
.pmt-bx .rsc-va{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.pmt-bx .rsc-va a,.pmt-bx .rsc-va button{border:0;border-radius:14px;padding:12px;font:800 14px Vazirmatn,Tahoma,sans-serif;cursor:pointer;background:var(--bg2);color:var(--tx);text-align:center;text-decoration:none;display:block}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='rsc';
sec.innerHTML='<h2>📎 منابع درسی</h2><div class="card"><b>📚 مدیریت منابع درسی</b><p class="sub" style="text-align:right;margin:6px 0 10px">فایل PDF، عکس یا متن درسی را بارگذاری و با پایه، کتاب، درس و مبحث ثبت کنید تا در مرحله‌ی بعد برای ساخت سؤال استفاده شود.</p><button class="big" data-rs="new" style="font-size:16px;padding:12px">➕ افزودن منبع جدید</button><div class="rsc-top" id="rscK"></div><p class="rsc-nt" id="rscSt"></p></div><div class="card"><b>🔎 فیلتر و جستجو</b><div class="rsc-fl" id="rscF"></div><input id="rscSrch" type="text" placeholder="جستجو در نام، توضیح یا مبحث…" autocomplete="off"><p class="sub" id="rscCnt" style="text-align:right;margin:8px 0 0"></p></div><div class="card"><div id="rscL"></div><p class="sub" id="rscMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p><p class="rsc-nt">🔒 فایل‌ها فقط روی همین دستگاه و مرورگر نگه‌داری می‌شوند و در «پشتیبان» و ذخیره‌ی ابری نیستند (فقط مشخصات آن‌ها همراه پشتیبان می‌رود). محتوای فایل بعد از ثبت تغییر نمی‌کند و حذف فقط با تأیید شما انجام می‌شود.</p></div>';
const anchor=$('qbk')||$('exp')||$('mk')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='rsc'))pages.push(['rsc','📎 منابع درسی']);
const say=t=>{const m=$('rscMsg');if(m)m.textContent=t||''};

/* ---------- فهرست و فیلتر ---------- */
const F={gr:'',bk:'',ls:'',tp:'',k:'',s:''},order=['gr','bk','ls','tp'];
let HAVE=null; /* مجموعه‌ی شناسه‌ی فایل‌های موجود در این دستگاه؛ null = هنوز نامعلوم */
const base=u=>list().filter(q=>{for(const k of order){if(k===u)break;if(F[k]&&q[k]!==F[k])return false}return true});
const match=q=>{for(const k of order)if(F[k]&&q[k]!==F[k])return false;if(F.k&&q.k!==F.k)return false;
 if(F.s&&[q.nm,q.nt,q.tp,q.ls,q.bk].join(' ').indexOf(F.s)<0)return false;return true};
const sel=(k,all,vals,cur)=>`<select data-rf="${k}"><option value="">${all}</option>${vals.map(v=>`<option value="${E(v)}"${v===cur?' selected':''}>${E(v)}</option>`).join('')}</select>`;
function renderBar(){const box=$('rscF');if(!box)return;
 order.forEach(k=>{if(F[k]&&uniq(base(k).map(q=>q[k])).indexOf(F[k])<0)F[k]=''});
 const gv=uniq(list().map(q=>q.gr)).sort((a,b)=>grades().indexOf(a)-grades().indexOf(b));
 box.innerHTML=sel('gr','همه‌ی پایه‌ها',gv,F.gr)+sel('bk','همه‌ی کتاب‌ها',uniq(base('bk').map(q=>q.bk)),F.bk)+sel('ls','همه‌ی درس‌ها',uniq(base('ls').map(q=>q.ls)),F.ls)+sel('tp','همه‌ی مبحث‌ها',uniq(base('tp').map(q=>q.tp)),F.tp)
  +`<select data-rf="k"><option value="">همه‌ی انواع</option>${KD.map(x=>`<option value="${x[0]}"${F.k===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select>`}
function card(x){const o=kO(x.k),miss=HAVE&&!HAVE.has(x.id),path=[x.gr?'پایه '+x.gr:'',x.bk,x.ls,x.tp].filter(Boolean).map(E).join(' › ');
 return `<div class="rsc-e"><div class="rsc-h"><i>${o[2]}</i><span>${E(x.nm)}</span></div><div class="rsc-p">${path}</div>
 <div class="rsc-m"><b>${o[1]}</b><b>${szT(x.sz||0)}</b>${x.tx==='ready'?'<b class="ok">متن آماده</b>':'<b>نیازمند استخراج متن</b>'}${miss?'<b class="w">فایل در این دستگاه نیست</b>':''}</div>
 ${x.nt?`<div class="rsc-n">${E(x.nt)}</div>`:''}
 <div class="rsc-ac"><button class="sm" data-rs="view" data-i="${x.id}">👁 مشاهده</button><button class="sm" data-rs="edit" data-i="${x.id}">✏️ ویرایش مشخصات</button><button class="sm" data-rs="del" data-i="${x.id}">🗑 حذف</button></div></div>`}
function renderList(){if(!$('rscL'))return;const A=list(),R=A.filter(match).sort((a,b)=>(b.ca||b.id)-(a.ca||a.id));
 const kp=(v,t)=>`<div class="rsc-k"><b>${fa(v)}</b><span>${t}</span></div>`;
 $('rscK').innerHTML=kp(A.length,'کل منابع')+KD.map(d=>kp(A.filter(q=>q.k===d[0]).length,d[1])).join('');
 $('rscCnt').textContent=A.length&&R.length!==A.length?'نمایش '+fa(R.length)+' از '+fa(A.length)+' منبع':'';
 $('rscL').innerHTML=R.length?R.map(card).join(''):(A.length?'<div class="rsc-em">منبعی با این فیلترها پیدا نشد.</div>':'<div class="rsc-em">هنوز منبعی بارگذاری نشده است.<br>با «افزودن منبع جدید» شروع کنید.</div>')}
async function refreshHave(){try{HAVE=new Set(await keysF())}catch(e){HAVE=null}renderList()}
async function storeInfo(){const el=$('rscSt');if(!el)return;let t='';try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();t='💾 فضای استفاده‌شده‌ی مرورگر: '+szT(e.usage||0)+(e.quota?' از '+szT(e.quota):'')}
 if(navigator.storage&&navigator.storage.persisted){const p=await navigator.storage.persisted();t+=(t?' · ':'')+(p?'🔒 ذخیره‌سازی پایدار فعال است':'⚠️ ذخیره‌سازی پایدار هنوز تأیید نشده')}}catch(e){}el.textContent=t}
function render(){renderBar();renderList();refreshHave();storeInfo()}

/* ---------- پیشنهاد دسته‌بندی ---------- */
const crs=()=>(S.courses||[]).filter(c=>c&&c.name);
const cs=bk=>crs().filter(c=>!bk||c.book===bk||c.name===bk);
const bkOf=()=>uniq(crs().map(c=>c.book).concat(list().map(q=>q.bk),(S.qbk||[]).map(q=>q.bk)));
const lsOf=bk=>uniq(cs(bk).flatMap(c=>(c.ch||[]).map(h=>h&&h.name)).concat(list().filter(q=>!bk||q.bk===bk).map(q=>q.ls),(S.qbk||[]).filter(q=>!bk||q.bk===bk).map(q=>q.ls)));
const tpOf=(bk,ls)=>uniq(cs(bk).flatMap(c=>(c.ch||[]).filter(h=>h&&(!ls||h.name===ls)).flatMap(h=>(h.tp||[]).map(t=>t&&t.name))).concat(list().filter(q=>(!bk||q.bk===bk)&&(!ls||q.ls===ls)).map(q=>q.tp)));
const opts=a=>a.map(v=>`<option value="${E(v)}">`).join('');
function refreshDL(){const bk=(($('rfB')||{}).value||'').trim(),ls=(($('rfL')||{}).value||'').trim();$('rfBL').innerHTML=opts(bkOf());$('rfLL').innerHTML=opts(lsOf(bk));$('rfPL').innerHTML=opts(tpOf(bk,ls))}

/* ---------- فرم افزودن / ویرایش ---------- */
const ov=document.createElement('div');ov.className='pmt-ov';ov.id='rscOv';ov.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(ov);
let ed=null,LAST={},busy=false;
function formHtml(){const g=grades(),add=!ed.id;
 return `<h3>${add?'📎 افزودن منبع جدید':'✏️ ویرایش مشخصات منبع'}</h3>
 ${add?`<label>نوع منبع</label><div class="rsc-seg"><button type="button" data-rs="mode" data-v="file" class="${ed.mode==='file'?'on':''}">📁 فایل (PDF، عکس، متن)</button><button type="button" data-rs="mode" data-v="text" class="${ed.mode==='text'?'on':''}">✍️ نوشتن / چسباندن متن</button></div>
 <div id="rfFile"><label>انتخاب فایل (حداکثر ${fa(20)} مگابایت برای هر فایل)</label><input id="rfFi" type="file" multiple accept=".pdf,.txt,application/pdf,text/plain,image/*"><div class="rsc-fn" id="rfFn"></div></div>
 <div id="rfText"><label>عنوان متن</label><input id="rfTi" autocomplete="off"><label>متن درسی</label><textarea id="rfTx" style="min-height:140px"></textarea></div>`
 :`<label>نام نمایشی</label><input id="rfNm" value="${E(ed.nm)}" autocomplete="off"><div class="rsc-fn">ℹ️ خودِ فایل بعد از ثبت قابل تغییر نیست؛ فقط مشخصات آن ویرایش می‌شود.</div>`}
 <label>پایه</label><select id="rfG"><option value="">انتخاب کنید</option>${g.map(x=>`<option value="${x}"${(ed.gr||(S.prof&&S.prof.grade)||'')===x?' selected':''}>پایه ${x}</option>`).join('')}</select>
 <label>کتاب</label><input id="rfB" list="rfBL" value="${E(ed.bk)}" placeholder="مثلاً کتاب فارسی پایه چهارم" autocomplete="off">
 <label>درس</label><input id="rfL" list="rfLL" value="${E(ed.ls)}" placeholder="نام درس یا فصل" autocomplete="off">
 <label>مبحث (اختیاری)</label><input id="rfP" list="rfPL" value="${E(ed.tp)}" autocomplete="off">
 <datalist id="rfBL"></datalist><datalist id="rfLL"></datalist><datalist id="rfPL"></datalist>
 <label>توضیح (اختیاری)</label><textarea id="rfN" style="min-height:64px">${E(ed.nt)}</textarea>
 <div class="pmt-er" id="rfEr"></div>
 <div class="pmt-fa"><button class="go" type="button" data-rs="save" id="rfSv">💾 ${add?'بارگذاری و ثبت':'ذخیره‌ی تغییرات'}</button><button type="button" data-rs="cancel">انصراف</button></div>`}
function togMode(){if(!$('rfFile'))return;$('rfFile').hidden=ed.mode!=='file';$('rfText').hidden=ed.mode!=='text'}
function openForm(id){if(busy)return;
 ed={id:id||0,mode:'file',nm:'',gr:'',bk:'',ls:'',tp:'',nt:''};
 if(id){const x=list().find(q=>q.id===id);if(!x)return;Object.assign(ed,{nm:x.nm||'',gr:x.gr||'',bk:x.bk||'',ls:x.ls||'',tp:x.tp||'',nt:x.nt||''})}
 else{ed.gr=LAST.gr||(S.prof&&S.prof.grade)||'';ed.bk=LAST.bk||'';ed.ls=LAST.ls||'';ed.tp=LAST.tp||''}
 ov.firstElementChild.innerHTML=formHtml();togMode();refreshDL();ov.classList.add('on')}
const closeForm=()=>{if(busy)return;ov.classList.remove('on');ed=null};

function kindOf(f){const n=(f.name||'').toLowerCase(),t=f.type||'';if(t==='application/pdf'||/\.pdf$/.test(n))return'pdf';if(/^image\/(jpeg|png|webp|gif)$/.test(t)||/\.(jpe?g|png|webp|gif)$/.test(n))return'img';if(t==='text/plain'||/\.txt$/.test(n))return'txt';return''}
function uid(){let id=Date.now();const u=new Set(list().map(q=>q.id));while(u.has(id))id++;return id}
async function ensurePersist(){try{if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted()))await navigator.storage.persist()}catch(e){}}
async function addOne(name,kind,mt,buf,text,cls){
 const h=await sha(buf),dup=h&&list().find(q=>q.sha===h);
 if(dup&&!confirm('«'+name+'» قبلاً با نام «'+dup.nm+'» ثبت شده است. باز هم ثبت شود؟'))return'skip';
 const id=uid();
 await addF({id,buf,mt,text:text||'',sha:h}); /* اول فایل، بعد مشخصات: اگر فایل ذخیره نشود چیزی ثبت نمی‌شود */
 list().push({id,v:1,k:kind,nm:name,mt,sz:buf.byteLength,sha:h,gr:cls.gr,bk:cls.bk,ls:cls.ls,tp:cls.tp,nt:cls.nt,tx:kind==='txt'?'ready':'pending',tc:kind==='txt'?(text||'').length:0,ca:Date.now()});
 save();return'ok'}
async function saveForm(){if(busy||!ed)return;const er=t=>{$('rfEr').textContent=t},v=id=>$(id).value.trim();
 const cls={gr:$('rfG').value,bk:v('rfB'),ls:v('rfL'),tp:v('rfP'),nt:v('rfN')};
 if(!cls.gr){er('پایه را انتخاب کنید.');return}if(!cls.bk){er('کتاب را بنویسید.');$('rfB').focus();return}if(!cls.ls){er('درس را بنویسید.');$('rfL').focus();return}
 if(ed.id){const x=list().find(q=>q.id===ed.id);if(!x){closeForm();return}const nm=v('rfNm');if(!nm){er('نام نمایشی را بنویسید.');return}
  Object.assign(x,{nm,gr:cls.gr,bk:cls.bk,ls:cls.ls,tp:cls.tp,nt:cls.nt,ua:Date.now()});LAST=cls;save();closeForm();render();say('✅ مشخصات ذخیره شد');return}
 const items=[];
 if(ed.mode==='file'){const fs=[...($('rfFi').files||[])];if(!fs.length){er('یک یا چند فایل انتخاب کنید.');return}
  for(const f of fs){const k=kindOf(f);if(!k){er('«'+f.name+'» پشتیبانی نمی‌شود (فقط PDF، عکس JPG/PNG/WebP/GIF و متن TXT).');return}if(f.size>MAX){er('«'+f.name+'» بزرگ‌تر از ۲۰ مگابایت است.');return}if(!f.size){er('«'+f.name+'» خالی است.');return}items.push({f,k})}}
 else{const ti=v('rfTi'),tx=$('rfTx').value.trim();if(!ti){er('عنوان متن را بنویسید.');return}if(!tx){er('متن را بنویسید یا بچسبانید.');return}items.push({ti,tx,k:'txt'})}
 busy=true;$('rfSv').disabled=true;er('⏳ در حال ذخیره…');let ok=0,sk=0,fail='';
 try{await ensurePersist();
  for(const it of items){try{let r;
    if(it.f){const buf=await it.f.arrayBuffer(),k=it.k,text=k==='txt'?decode(buf):'';
     if(k==='txt'&&!text.trim()){fail='«'+it.f.name+'» متن خوانا ندارد.';continue}
     r=await addOne(it.f.name,k,k==='pdf'?'application/pdf':(it.f.type||(k==='txt'?'text/plain':'image/*')),buf,text,cls)}
    else{const buf=new TextEncoder().encode(it.tx).buffer;r=await addOne(it.ti,'txt','text/plain',buf,it.tx,cls)}
    if(r==='ok')ok++;else sk++}
   catch(e){fail=(e&&e.name==='QuotaExceededError')?'فضای ذخیره‌سازی مرورگر پر است.':'ذخیره‌ی فایل انجام نشد'+(e&&e.message?': '+e.message:'')}}}
 finally{busy=false}
 if(ok){LAST=cls;ov.classList.remove('on');ed=null;render();say('✅ '+fa(ok)+' منبع ثبت شد'+(fail?' — ولی: '+fail:''));return}
 const b=$('rfSv');if(b)b.disabled=false;er(fail||(sk?'چیزی ثبت نشد.':'چیزی ثبت نشد.'))}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){closeForm();return}const a=t.closest('[data-rs]');if(!a||!ed)return;const k=a.dataset.rs;
 if(k==='cancel')closeForm();else if(k==='save')saveForm();
 else if(k==='mode'){ed.mode=a.dataset.v;ov.querySelectorAll('[data-rs="mode"]').forEach(b=>b.classList.toggle('on',b===a));togMode()}});
ov.addEventListener('input',e=>{if(ed&&(e.target.id==='rfB'||e.target.id==='rfL'))refreshDL()});
ov.addEventListener('change',e=>{if(ed&&e.target.id==='rfFi'){const fs=[...e.target.files];$('rfFn').textContent=fs.map(f=>f.name+' ('+szT(f.size)+')').join('، ')}});

/* ---------- مشاهده ---------- */
const vw=document.createElement('div');vw.className='pmt-ov';vw.id='rscVw';vw.style.zIndex=9200;vw.innerHTML='<div class="pmt-bx" role="dialog" aria-modal="true"></div>';document.body.appendChild(vw);
let url=null;
const closeVw=()=>{vw.classList.remove('on');if(url){try{URL.revokeObjectURL(url)}catch(e){}url=null}vw.firstElementChild.innerHTML=''};
async function view(id){const x=list().find(q=>q.id===id);if(!x)return;const bx=vw.firstElementChild;
 bx.innerHTML=`<h3>${kO(x.k)[2]} ${E(x.nm)}</h3><div class="rsc-fn">⏳ در حال خواندن فایل…</div>`;vw.classList.add('on');
 let f;try{f=await getF(id)}catch(e){f=null}
 if(!f||!f.buf){bx.innerHTML=`<h3>${E(x.nm)}</h3><div class="rsc-wn">فایل این منبع در این دستگاه پیدا نشد. (احتمالاً مشخصات از پشتیبان یا دستگاه دیگر آمده است.) می‌توانید این مورد را حذف و فایل را دوباره بارگذاری کنید.</div><div class="rsc-va"><button type="button" data-rv="close" style="grid-column:1/-1">بستن</button></div>`;return}
 const h=await sha(f.buf),bad=x.sha&&h&&x.sha!==h;
 const blob=new Blob([f.buf],{type:f.mt||x.mt||''});if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);
 let body='';if(x.k==='pdf')body=`<iframe src="${url}" title="${E(x.nm)}"></iframe><div class="rsc-fn">اگر PDF نمایش داده نشد، از «دانلود» استفاده کنید.</div>`;
 else if(x.k==='img')body=`<img src="${url}" alt="${E(x.nm)}">`;else body=`<pre>${E(f.text||decode(f.buf))}</pre>`;
 const ext=x.k==='pdf'?'.pdf':x.k==='txt'?'.txt':'',dn=/\.[a-z0-9]{2,5}$/i.test(x.nm)?x.nm:x.nm+ext;
 bx.innerHTML=`<h3>${kO(x.k)[2]} ${E(x.nm)}</h3><div class="rsc-fn">${[x.gr?'پایه '+x.gr:'',x.bk,x.ls,x.tp].filter(Boolean).map(E).join(' › ')}</div>${bad?'<div class="rsc-wn">⚠️ اثرانگشت فایل با زمان ثبت یکسان نیست؛ ممکن است فایل آسیب دیده باشد.</div>':''}<div class="rsc-vw">${body}</div><div class="rsc-va"><a href="${url}" download="${E(dn)}">⬇️ دانلود</a><button type="button" data-rv="close">بستن</button></div>`}
vw.addEventListener('click',e=>{if(e.target===vw||e.target.closest('[data-rv="close"]'))closeVw()});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(vw.classList.contains('on'))closeVw();else if(ov.classList.contains('on'))closeForm()});

/* ---------- حذف (فقط با تأیید) ---------- */
async function del(id){const x=list().find(q=>q.id===id);if(!x)return;
 if(!confirm('منبع «'+x.nm+'» برای همیشه حذف شود؟\nفایل از این دستگاه پاک می‌شود و قابل بازگشت نیست.'))return;
 try{await delF(id)}catch(e){say('⚠️ حذف فایل انجام نشد؛ مشخصات منبع نگه داشته شد.');return}
 S.rsc=list().filter(q=>q.id!==id);save();render();say('🗑 منبع حذف شد')}

sec.addEventListener('click',e=>{const b=e.target.closest('[data-rs]');if(!b)return;const k=b.dataset.rs;
 if(k==='new'){say('');openForm()}else if(k==='edit'){say('');openForm(+b.dataset.i)}else if(k==='view')view(+b.dataset.i);else if(k==='del')del(+b.dataset.i)});
sec.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.rf;if(!k)return;F[k]=e.target.value;const i=order.indexOf(k);if(i>=0)order.slice(i+1).forEach(x=>{F[x]=''});renderBar();renderList()});
sec.addEventListener('input',e=>{if(e.target.id==='rscSrch'){F.s=e.target.value.trim();renderList()}});

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='rsc')render()}catch(e){console.error('rsc',e)}return r};
/* رابط مرحله‌ی بعد (هوش مصنوعی): فقط خواندنی */
window.RSC={list:()=>list().slice(),getFile:id=>getF(id),getText:async id=>{const f=await getF(id);return f?(f.text||''):''},pending:()=>list().filter(q=>q.tx==='pending')};
}catch(e){console.error('learning-resources',e)}})();

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
#qbk .qd-hero{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;border-radius:22px;padding:18px;color:#fff;background:linear-gradient(120deg,var(--p),var(--p2));box-shadow:0 10px 26px rgba(0,0,0,.14);margin-bottom:12px}
#qbk .qd-hero h3{margin:0;font-size:19px;color:#fff}#qbk .qd-hero p{margin:4px 0 0;font-size:13px;opacity:.92;line-height:1.8}
#qbk .qd-acts{display:flex;gap:8px;flex-wrap:wrap}
#qbk .qd-btn{width:auto;margin:0;flex:none;border:0;border-radius:14px;padding:10px 16px;font:800 13.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer;background:rgba(255,255,255,.2);color:#fff}
#qbk .qd-btn.p{background:#fff;color:var(--p)}
#qbk .qd-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(62px,1fr));gap:6px;margin:0 0 12px}
#qbk .qd-k{border-radius:16px;padding:9px 2px;text-align:center;background:var(--card);border:1.5px solid var(--line)}
#qbk .qd-k b{display:block;font-size:19px;line-height:1.4}#qbk .qd-k span{font-size:11.5px;color:var(--mut);font-weight:800}
#qbk .qd-sr{width:100%;box-sizing:border-box;margin:0 0 10px;padding:12px 14px;border-radius:16px;font-size:14px}
#qbk .qd-chips{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 12px}
#qbk .qd-chip{width:auto;flex:none;margin:0;border:1.5px solid var(--line);background:var(--card);color:var(--tx);border-radius:999px;padding:6px 14px;font:800 12.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#qbk .qd-chip small{color:var(--mut);margin-right:4px}
#qbk .qd-chip.on{color:#fff;border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2))}#qbk .qd-chip.on small{color:#fff;opacity:.85}
#qbk .qd-h{font-weight:800;font-size:14px;margin:4px 2px 8px;color:var(--mut)}
#qbk .qd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px}
#qbk .qd-bk{width:auto;margin:0;text-align:right;display:block;border:1.5px solid var(--line);background:var(--card);color:var(--tx);border-radius:20px;padding:0;overflow:hidden;cursor:pointer;font-family:inherit;box-shadow:0 2px 10px rgba(0,0,0,.05);transition:transform .15s,box-shadow .15s}
#qbk .qd-bk:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.12)}
#qbk .qd-bt{height:8px}#qbk .qd-bb{padding:12px 12px 12px}
#qbk .qd-ic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;margin-bottom:8px}
#qbk .qd-bn{font-weight:800;font-size:14px;line-height:1.7;min-height:40px}
#qbk .qd-bm{font-size:12px;color:var(--mut);margin:2px 0 8px;line-height:1.8}
#qbk .qd-bar{display:flex;height:8px;border-radius:99px;overflow:hidden;background:var(--bg2)}#qbk .qd-bar i{display:block;height:100%}
#qbk .qd-bl{display:flex;gap:8px;margin-top:6px;font-size:11.5px;font-weight:800}
#qbk .qd-crumb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
#qbk .qd-back{width:auto;margin:0;flex:none;border:1.5px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:8px 14px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#qbk .qd-tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 0 8px;margin:0 0 6px;scrollbar-width:thin}#qbk .qd-tabs .qd-chip{white-space:nowrap}
#qbk .qd-tools{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px}
#qbk .qd-tools input,#qbk .qd-tools select{width:100%;margin:0;box-sizing:border-box}#qbk .qd-tools .qd-sr{grid-column:1/-1;margin:0}
#qbk .qd-gh{display:flex;align-items:center;gap:8px;margin:14px 2px 8px;font-weight:800;font-size:14px;color:var(--p)}
#qbk .qd-gh:after{content:"";flex:1;height:2px;border-radius:2px;background:var(--line)}#qbk .qd-gh small{color:var(--mut);font-weight:700}
#qbk .qbk-e{padding:11px 12px;margin-bottom:9px;border-radius:16px;border:1.5px solid var(--line);background:var(--card);border-right:5px solid var(--lc,var(--line))}
#qbk .qbk-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:13px}
#qbk .qbk-bd{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:800}
#qbk .qbk-ty{background:var(--bg2);color:var(--p);border-radius:999px;padding:2px 10px;font-size:12px}
#qbk .qbk-pg{margin-right:auto;color:var(--mut);font-size:12px}
#qbk .qbk-p{margin-top:6px;font-size:12.5px;color:var(--mut);font-weight:700;line-height:1.8}
#qbk .qbk-q{margin-top:6px;font-size:14.5px;line-height:1.95;white-space:pre-wrap;word-break:break-word;font-weight:700}
#qbk .qbk-o{margin-top:4px;font-size:13.5px;line-height:1.8;display:flex;gap:6px}
#qbk .qbk-o.ok{color:#1a8f55;font-weight:800}
#qbk .qbk-a{margin-top:6px;font-size:13.5px;line-height:1.9;white-space:pre-wrap;word-break:break-word}
#qbk .qbk-a b{color:#1a8f55}
#qbk .qbk-s{margin-top:4px;font-size:12px;color:var(--mut)}
#qbk .qbk-ac{display:flex;gap:8px;margin-top:8px}#qbk .qbk-ac button{flex:1;margin:0}
#qbk .qbk-em{text-align:center;color:var(--mut);padding:22px 0;font-size:14px;line-height:2.1}
#qbk .qd-more{width:100%;margin:6px 0 0}
#qbk .qd-first{border:2px dashed var(--line);border-radius:22px;padding:26px 16px;text-align:center;line-height:2.1;background:var(--card)}
#qbk .qd-first .qd-acts{justify-content:center;margin-top:10px}#qbk .qd-first .qd-btn{background:linear-gradient(90deg,var(--p),var(--p2));color:#fff}
.pmt-bx .qbk-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.pmt-bx .qbk-seg button,.pmt-bx .qbk-tf button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:9px 4px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.pmt-bx .qbk-seg button.on,.pmt-bx .qbk-tf button.on{color:#fff;border-color:var(--p);background:linear-gradient(90deg,var(--p),var(--p2))}
.pmt-bx .qbk-tf{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.pmt-bx .qbk-fl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.pmt-bx .qbk-op{display:flex;gap:6px;align-items:center;margin-top:6px}
.pmt-bx .qbk-op button{flex:none;width:42px;height:42px;border:2px solid var(--line);background:var(--card);color:var(--mut);border-radius:12px;font:800 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer;padding:0}
.pmt-bx .qbk-op button.on{background:#1a8f55;border-color:#1a8f55;color:#fff}
.pmt-bx .qbk-op input{flex:1}
`;
document.head.appendChild(st);

const sec=document.createElement('section');sec.id='qbk';
sec.innerHTML='<h2>🗂️ بانک سؤالات امتحانی</h2><div id="qbkMain"></div><p class="sub" id="qbkMsg" style="text-align:right;margin:8px 0 0;min-height:18px"></p>';
const anchor=$('exp')||$('mk')||$('crs')||$('rep');anchor?anchor.after(sec):document.querySelector('main').appendChild(sec);
if(typeof pages!=='undefined'&&!pages.some(q=>q[0]==='qbk'))pages.push(['qbk','🗂️ بانک سؤالات']);

/* ---------- وضعیت نمایش (داشبورد ← کتاب ← سؤال‌ها) ---------- */
const V={book:'',gf:'',gs:'',lv:'',ty:'',ls:'',s:'',lim:20};
const PAGE=20;
const bkey=q=>(q.gr||'')+'§'+(q.bk||'');
const gOrd=g=>{const i=grades().indexOf(g);return i<0?99:i};
function books(){const m=new Map();list().forEach(q=>{const k=bkey(q);let b=m.get(k);if(!b){b={key:k,gr:q.gr||'',bk:q.bk||'بدون نام',n:0,e:0,m:0,h:0,ls:new Set()};m.set(k,b)}b.n++;if(b[q.lv]!=null)b[q.lv]++;if(q.ls)b.ls.add(q.ls)});
 return [...m.values()].sort((a,b)=>gOrd(a.gr)-gOrd(b.gr)||a.bk.localeCompare(b.bk,'fa'))}
const hue=k=>{let h=0;for(const c of String(k))h=(h*31+c.charCodeAt(0))%360;return h};
const grad=k=>{const h=hue(k);return `linear-gradient(135deg,hsl(${h},62%,46%),hsl(${(h+40)%360},66%,56%))`};
const bar=b=>{const t=b.n||1;return `<div class="qd-bar">${LV.map(l=>`<i style="width:${(b[l[0]]||0)*100/t}%;background:${l[2]}"></i>`).join('')}</div>`};
const say=t=>{const m=$('qbkMsg');if(m)m.textContent=t||''};
const qHay=q=>[q.q,q.ans,(q.op||[]).join(' '),q.src,q.tp,q.ch,q.ls,q.bk].join(' ');
const qSort=(a,b)=>(a.ln==null?9999:a.ln)-(b.ln==null?9999:b.ln)||(a.p1==null?9999:a.p1)-(b.p1==null?9999:b.p1)||(a.ca||a.id)-(b.ca||b.id);

/* ---------- نمایش سؤال ---------- */
function ansT(x){if(x.ty==='tf')return x.ans==='T'?'صحیح':'غلط';if(x.ty==='mc'){const o=(x.op||[])[x.ok];return o!=null&&o!==''?o:(x.ans||'')}return x.ans||''}
function card(x,full){const l=lvO(x.lv);
 const pg=x.p1!=null?(x.p2!=null&&x.p2!==x.p1?'ص '+fa(x.p1)+' تا '+fa(x.p2):'ص '+fa(x.p1)):'';
 const path=full?[x.gr?'پایه '+x.gr:'',x.bk,x.ls,x.ch?'فصل '+x.ch:'',x.tp].filter(Boolean).map(E).join(' › '):[x.ch?'فصل '+x.ch:'',x.tp?'مبحث: '+x.tp:''].filter(Boolean).map(E).join(' › ');
 let body=`<div class="qbk-q">${E(x.q)}</div>`;
 if(x.ty==='mc')body+=(x.op||[]).map((o,i)=>`<div class="qbk-o${i===x.ok?' ok':''}"><span>${LET[i]||fa(i+1)})</span><span>${E(o)}${i===x.ok?' ✔':''}</span></div>`).join('');
 else body+=`<div class="qbk-a"><b>پاسخ:</b> ${E(ansT(x)||'ثبت نشده')}</div>`;
 return `<div class="qbk-e" style="--lc:${l[2]}"><div class="qbk-h"><span class="qbk-bd" style="background:${l[2]}">${l[1]}</span><span class="qbk-ty">${tyN(x.ty)}</span>${pg?`<span class="qbk-pg">${pg}</span>`:''}</div>
 ${path?`<div class="qbk-p">${path}</div>`:''}${body}${x.src?`<div class="qbk-s">📖 منبع: ${E(x.src)}</div>`:''}
 <div class="qbk-ac"><button class="sm" data-qb="edit" data-i="${x.id}">✏️ ویرایش</button><button class="sm" data-qb="del" data-i="${x.id}">🗑 حذف</button></div></div>`}

/* ---------- داشبورد (صفحه‌ی اول): کتاب‌ها ---------- */
function bookCard(b){const ls=b.ls.size;
 return `<button type="button" class="qd-bk" data-qb="book" data-k="${E(b.key)}"><div class="qd-bt" style="background:${grad(b.key)}"></div><div class="qd-bb">
 <div class="qd-ic" style="background:${grad(b.key)}">📘</div><div class="qd-bn">${E(b.bk)}</div>
 <div class="qd-bm">${b.gr?'پایه '+E(b.gr)+' · ':''}${fa(b.n)} سؤال${ls?' · '+fa(ls)+' درس':''}</div>${bar(b)}
 <div class="qd-bl">${LV.map(l=>`<span style="color:${l[2]}">${fa(b[l[0]]||0)} ${l[1]}</span>`).join('')}</div></div></button>`}
function dashHtml(){const A=list(),B=books();
 if(!A.length)return `<div class="qd-first"><div style="font-size:42px">🗂️</div><b style="font-size:16px">بانک سؤال شما هنوز خالی است</b><br>اولین سؤال را ثبت کنید یا سؤال‌های آماده را از فایل Word / PDF / متن وارد کنید.<div class="qd-acts"><button class="qd-btn" data-qb="new">➕ ثبت سؤال جدید</button><button class="qd-btn" data-qb="imp">📥 ورود از فایل</button></div></div>`;
 const kp=(v,t,c)=>`<div class="qd-k"><b${c?` style="color:${c}"`:''}>${fa(v)}</b><span>${t}</span></div>`;
 return `<div class="qd-hero"><div><h3>🗂️ بانک سؤال‌های من</h3><p>یک کتاب را انتخاب کنید تا درس‌ها و سؤال‌هایش نمایش داده شود.</p></div>
 <div class="qd-acts"><button class="qd-btn p" data-qb="new">➕ ثبت سؤال</button><button class="qd-btn" data-qb="imp">📥 ورود از فایل</button><button class="qd-btn" data-qb="build">📝 ساخت برگه</button></div></div>
 <div class="qd-kpis">${kp(A.length,'کل سؤال‌ها','var(--p)')}${kp(B.length,'کتاب')}${LV.map(l=>kp(A.filter(q=>q.lv===l[0]).length,l[1],l[2])).join('')}</div>
 <input id="qbkSrch" class="qd-sr" type="text" placeholder="🔎 جستجو در همه‌ی سؤال‌ها (متن، پاسخ، منبع…)" autocomplete="off" value="${E(V.gs)}">
 <div id="qbkRes"></div>`}
function dashRes(){const box=$('qbkRes');if(!box)return;
 if(V.gs){const R=list().filter(q=>qHay(q).indexOf(V.gs)>=0).sort((a,b)=>(b.ca||b.id)-(a.ca||a.id));
  box.innerHTML=`<div class="qd-h">نتیجه‌ی جستجو: ${fa(R.length)} سؤال</div>`+(R.length?R.slice(0,V.lim).map(q=>card(q,true)).join('')+(R.length>V.lim?`<button class="sm qd-more" data-qb="more">نمایش ${fa(Math.min(PAGE,R.length-V.lim))} سؤال بیشتر</button>`:''):'<div class="qbk-em">سؤالی پیدا نشد.</div>');return}
 const B=books(),gs=[...new Set(B.map(b=>b.gr).filter(Boolean))];
 const vis=B.filter(b=>!V.gf||b.gr===V.gf);
 box.innerHTML=(gs.length>1?`<div class="qd-chips"><button class="qd-chip${V.gf?'':' on'}" data-qb="gf" data-v="">همه‌ی پایه‌ها</button>${gs.map(g=>`<button class="qd-chip${V.gf===g?' on':''}" data-qb="gf" data-v="${E(g)}">پایه ${E(g)}</button>`).join('')}</div>`:'')
  +`<div class="qd-h">کتاب‌ها (${fa(vis.length)})</div><div class="qd-grid">${vis.map(bookCard).join('')}</div>`}

/* ---------- نمای یک کتاب ---------- */
function bookQs(){return list().filter(q=>bkey(q)===V.book)}
function lvTyFilter(arr){return arr.filter(q=>(!V.lv||q.lv===V.lv)&&(!V.ty||q.ty===V.ty)&&(!V.s||qHay(q).indexOf(V.s)>=0))}
function groupLs(arr){const m=new Map();arr.forEach(q=>{const k=q.ls||'بدون درس';let g=m.get(k);if(!g){g={name:k,ln:9999,items:[]};m.set(k,g)}if(q.ln!=null&&q.ln<g.ln)g.ln=q.ln;g.items.push(q)});
 const out=[...m.values()].sort((a,b)=>a.ln-b.ln||a.name.localeCompare(b.name,'fa'));out.forEach(g=>g.items.sort(qSort));return out}
function bookHtml(){const b=books().find(x=>x.key===V.book);if(!b){V.book='';return dashHtml()}
 return `<div class="qd-crumb"><button class="qd-back" data-qb="back">→ همه‌ی کتاب‌ها</button><b style="font-size:15px">${E(b.bk)}</b>${b.gr?`<span class="qbk-ty">پایه ${E(b.gr)}</span>`:''}<button class="qd-btn p" data-qb="new" style="background:linear-gradient(90deg,var(--p),var(--p2));color:#fff;margin-right:auto">➕ سؤال در این کتاب</button></div>
 <div class="qd-kpis">${[['کل',b.n,'var(--p)']].concat(LV.map(l=>[l[1],b[l[0]]||0,l[2]])).map(k=>`<div class="qd-k"><b style="color:${k[2]}">${fa(k[1])}</b><span>${k[0]}</span></div>`).join('')}</div>
 <div id="qbkCtl"></div>
 <div class="qd-tools"><input id="qbkSrchB" class="qd-sr" type="text" placeholder="🔎 جستجو در این کتاب…" autocomplete="off" value="${E(V.s)}"><select data-qf="ty"><option value="">همه‌ی انواع سؤال</option>${TY.map(x=>`<option value="${x[0]}"${V.ty===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select></div>
 <div id="qbkRes"></div>`}
function bookRes(){const ctl=$('qbkCtl'),box=$('qbkRes');if(!box)return;
 const all=bookQs(),f=lvTyFilter(all),G=groupLs(f);
 if(V.ls&&!G.some(g=>g.name===V.ls))V.ls='';
 const lvChip=(v,t,n)=>`<button class="qd-chip${V.lv===v?' on':''}" data-qb="lv" data-v="${v}">${t}<small>${fa(n)}</small></button>`;
 if(ctl)ctl.innerHTML=`<div class="qd-tabs"><button class="qd-chip${V.ls?'':' on'}" data-qb="ls" data-v="">همه‌ی درس‌ها<small>${fa(f.length)}</small></button>${G.map(g=>`<button class="qd-chip${V.ls===g.name?' on':''}" data-qb="ls" data-v="${E(g.name)}">${g.ln<9999?'درس '+fa(g.ln)+' · ':''}${E(g.name)}<small>${fa(g.items.length)}</small></button>`).join('')}</div>
  <div class="qd-chips">${lvChip('','همه‌ی سطح‌ها',all.filter(q=>(!V.ty||q.ty===V.ty)&&(!V.s||qHay(q).indexOf(V.s)>=0)).length)}${LV.map(l=>lvChip(l[0],l[1],all.filter(q=>q.lv===l[0]&&(!V.ty||q.ty===V.ty)&&(!V.s||qHay(q).indexOf(V.s)>=0)).length)).join('')}</div>`;
 const shown=V.ls?G.filter(g=>g.name===V.ls):G;let left=V.lim,html='',total=shown.reduce((n,g)=>n+g.items.length,0);
 shown.forEach(g=>{if(left<=0)return;const part=g.items.slice(0,left);left-=part.length;
  html+=`<div class="qd-gh">${g.ln<9999?'درس '+fa(g.ln)+' — ':''}${E(g.name)} <small>(${fa(g.items.length)} سؤال)</small></div>`+part.map(q=>card(q,false)).join('')});
 box.innerHTML=total?html+(total>V.lim?`<button class="sm qd-more" data-qb="more">نمایش ${fa(Math.min(PAGE,total-V.lim))} سؤال بیشتر (${fa(total-V.lim)} مانده)</button>`:''):'<div class="qbk-em">سؤالی با این فیلترها پیدا نشد.</div>'}

function render(){const m=$('qbkMain');if(!m)return;
 if(V.book&&!books().some(b=>b.key===V.book))V.book='';
 m.innerHTML=V.book?bookHtml():dashHtml();
 V.book?bookRes():dashRes()}

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
 const pt=parseFloat(ed.pt)>0?parseFloat(ed.pt):1; /* ابتدایی: ارزشیابی توصیفی؛ بارم نمایش/دریافت نمی‌شود */
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
 if(k==='new'){say('');if(V.book){const bk=books().find(x=>x.key===V.book);if(bk){LAST.gr=bk.gr;LAST.bk=bk.bk}}openForm()}
 else if(k==='edit'){say('');openForm(+b.dataset.i)}
 else if(k==='del'){if(!confirm('این سؤال از بانک حذف شود؟ این کار قابل بازگشت نیست.'))return;S.qbk=list().filter(x=>x.id!==+b.dataset.i);save();render();say('🗑 سؤال حذف شد')}
 else if(k==='book'){V.book=b.dataset.k;V.lv='';V.ty='';V.ls='';V.s='';V.lim=PAGE;say('');render();window.scrollTo({top:sec.offsetTop-10,behavior:'smooth'})}
 else if(k==='back'){V.book='';V.gs='';V.lim=PAGE;say('');render()}
 else if(k==='gf'){V.gf=b.dataset.v;dashRes()}
 else if(k==='lv'){V.lv=b.dataset.v;V.lim=PAGE;bookRes()}
 else if(k==='ls'){V.ls=b.dataset.v;V.lim=PAGE;bookRes()}
 else if(k==='more'){V.lim+=PAGE;V.book?bookRes():dashRes()}
 else if(k==='imp'){if(typeof show==='function')show('qimp')}
 else if(k==='build'){if(typeof show==='function')show('exb')}});
sec.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.qf==='ty'){V.ty=e.target.value;V.lim=PAGE;bookRes()}});
sec.addEventListener('input',e=>{
 if(e.target.id==='qbkSrch'){V.gs=e.target.value.trim();V.lim=PAGE;dashRes()}
 else if(e.target.id==='qbkSrchB'){V.s=e.target.value.trim();V.lim=PAGE;bookRes()}});

const _s=window.show;window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='qbk')render()}catch(e){console.error('qbk',e)}return r};
window.QBK={open:openForm,all:()=>list().slice(),render};
}catch(e){console.error('question-bank',e)}})();

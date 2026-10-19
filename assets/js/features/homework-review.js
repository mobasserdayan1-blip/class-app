/* بازدید تکلیف — بازخورد تکی و گروهی، تکالیف قدیمی‌تر، تحویل با تأخیر (غایب‌ها)
   داده: S.hwl[i] = {id,date,course,title,st:{شناسه:'d|p|n'}, fb:{شناسه:{tg:[],tx,d}}, ld:{شناسه:تاریخ تحویل با تأخیر}}
   فقط فیلدهای fb و ld جدیدند؛ st و گزارش‌های قبلی بدون تغییر کار می‌کنند. */
(function(){try{
const $=id=>document.getElementById(id),D=k=>new Date(k+'T12:00:00Z'),T=()=>iso(tdy());
const HI={'':'⬜',d:'✅',p:'🟡',n:'❌'},SQ=['','d','p','n'],SN={d:'کامل',p:'ناقص',n:'انجام نشده'};
const TG=['👏 عالی بود','✍️ خط و نظم خوب','📖 کامل‌تر کن','🔁 دوباره بنویس','🧠 نیاز به توضیح'];
const U={v:'h',sc:'day',op:0,ha:null,sid:null,sel:new Set(),dr:null,cd:0};
const cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'عمومی',tags=()=>S.hwtg&&S.hwtg.length?S.hwtg:TG;
const g=(h,k,id)=>h[k]&&h[k][id],isOpen=(h,id)=>!h.st[id]||h.st[id]==='n';
const dOpts=(sel,n)=>{const a=[...Array(n)].map((_,i)=>iso(addD(tdy(),-i)));if(!a.includes(sel))a.unshift(sel);return a.map(k=>`<option value="${k}"${k===sel?' selected':''}>${fmt(D(k))}${k===T()?' (امروز)':''}</option>`).join('')};
const sc=h=>{const c=iso(cur);if(U.sc==='day')return h.date===c;if(U.sc==='all')return true;return h.date<=c&&h.date>=iso(addD(cur,U.sc==='w'?-6:-29))};
const list=()=>S.hwl.filter(h=>sc(h)&&(!U.op||S.students.some(s=>isOpen(h,s.id)))).sort((a,b)=>b.date.localeCompare(a.date));
const ch=(x,v,t,on)=>`<button class="hxb${on?' on':''}" data-x="${x}" data-v="${v}">${t}</button>`;
const cnt=h=>{const c={d:0,p:0,n:0,'':0};S.students.forEach(s=>c[h.st[s.id]||'']++);return`✅${fa(c.d)} 🟡${fa(c.p)} ❌${fa(c.n)} ⬜${fa(c[''])}`};
const row=(h,s,key,label)=>{const x=h.st[s.id]||'',ab=((S.att[h.date]||{})[s.id])==='a',ld=g(h,'ld',s.id),fb=g(h,'fb',s.id),on=U.sel.has(key);
 return`<div class="hxs${on?' on':''}"><input type="checkbox" data-x="sel" data-v="${key}"${on?' checked':''}><span class="hxn" data-x="sel" data-v="${key}">${label}${ab?'<i class="hxt">🚫 غایب بود</i>':''}${ld?`<i class="hxt">⏰ تحویل ${fmt(D(ld))}</i>`:''}${fb?`<small>💬 ${esc2([...(fb.tg||[]),fb.tx||''].join(' ').trim().slice(0,70))}</small>`:''}</span><button class="hxb" data-x="cy" data-v="${key}" title="تغییر وضعیت">${HI[x]}</button></div>`};
const mk=()=>{const P=pairs();const o=P.length===1?{f:g(P[0][0],'fb',P[0][1]),l:g(P[0][0],'ld',P[0][1])}:{};return{st:null,late:!!o.l,ld:o.l||T(),tg:(o.f&&o.f.tg||[]).slice(),tx:(o.f&&o.f.tx)||''}};
const pairs=()=>[...U.sel].map(k=>U.v==='h'?[S.hwl.find(h=>h.id===U.ha),+k]:[S.hwl.find(h=>h.id===k),U.sid]).filter(p=>p[0]);
function editor(){const n=U.sel.size;if(!n)return'';const d=U.dr||(U.dr=mk());
 return`<div class="hxe"><b>💬 بازخورد برای ${fa(n)} ${U.v==='h'?'دانش‌آموز':'تکلیف'} انتخاب‌شده</b>
<div class="hxr"><span>وضعیت:</span>${['d','p','n',''].map(k=>ch('dst',k||'-',HI[k]+' '+(SN[k]||'پاک'),d.st===k)).join('')}</div>
<div class="hxr">${ch('late','1','⏰ با تأخیر نشان داد',d.late)}${d.late?`<select data-x="ld" style="margin:0">${dOpts(d.ld,45)}</select>`:''}</div>
<div class="hxr">${tags().map((t,i)=>ch('tag',i,t,d.tg.includes(t))).join('')}</div>
<textarea data-x="tx" placeholder="توضیح اختیاری برای دانش‌آموز یا والدین…">${esc2(d.tx)}</textarea>
<div class="hxr"><button class="sm hxp" data-x="apply">✅ ثبت برای ${fa(n)} مورد</button><button class="sm" data-x="clrfb">🧹 پاک کردن بازخورد</button><button class="sm" data-x="cancel">بستن</button></div></div>`}
function render(){const el=$('hwc');if(!el)return;if(mode!=='d'){el.innerHTML='';return}
 const L=list();if(!S.students.find(s=>s.id===U.sid))U.sid=S.students[0]&&S.students[0].id;
 if(U.v==='h'&&!L.find(h=>h.id===U.ha)){U.ha=L.length?L[0].id:null;U.sel.clear();U.dr=null}
 const A=S.hwl.find(h=>h.id===U.ha),h=[];
 h.push(`<div class="card hx"><b>📚 بازدید تکلیف</b>
<div class="hxr">${ch('view','h','📋 بر اساس تکلیف',U.v==='h')}${ch('view','s','👤 بر اساس دانش‌آموز',U.v==='s')}</div>
<div class="hxr">${[['day','این روز'],['w','۷ روز اخیر'],['m','۳۰ روز اخیر'],['all','همه‌ی تکالیف']].map(([k,t])=>ch('sc',k,t,U.sc===k)).join('')}${ch('op','1','⚠️ فقط موارد باز',U.op)}</div>`);
 if(U.v==='s')h.push(`<select data-x="sid" style="margin:0 0 6px">${S.students.map(s=>`<option value="${s.id}"${s.id===U.sid?' selected':''}>${esc2(s.name)}</option>`).join('')}</select>`);
 else h.push(`<div class="hxr">${L.map(x=>`<button class="hxb${x.id===U.ha?' on':''}" data-x="pick" data-v="${x.id}">${fmt(D(x.date))} · ${esc2(cn(x.course))}: ${esc2(x.title)}<small>${cnt(x)}</small></button>`).join('')||'<span class="sub">تکلیفی در این بازه نیست</span>'}</div>`);
 if(U.v==='h'&&A){h.push(`<div class="hxr"><b>${esc2(cn(A.course))}: ${esc2(A.title)}</b><span class="sub">(${fmt(D(A.date))})</span></div>
<div class="hxr">${ch('sa','all','انتخاب همه')}${ch('sa','open','انجام‌نشده/ثبت‌نشده‌ها')}${ch('sa','abs','غایب‌ها')}${ch('sa','none','لغو انتخاب')}</div>`+S.students.map(s=>row(A,s,s.id,esc2(s.name))).join('')+
  `<p class="sub">با تیک‌زدن چند نفر، بازخورد گروهی بدهید؛ نام یک نفر را بزنید برای بازخورد تکی. دکمه‌ی سمت چپ هر ردیف وضعیت را می‌چرخاند (✅ ← 🟡 ← ❌ ← ⬜).</p><div class="hxr"><button class="sm" data-x="all">✅ همه انجام داده‌اند</button><button class="sm" data-x="del">${U.cd?'⚠️ تأیید حذف':'🗑 حذف این تکلیف'}</button></div>`)}
 if(U.v==='s'){const hs=S.hwl.filter(sc).sort((a,b)=>b.date.localeCompare(a.date)).filter(x=>!U.op||isOpen(x,U.sid)),s=S.students.find(q=>q.id===U.sid);
  h.push(`<div class="hxr">${ch('sa','all','انتخاب همه')}${ch('sa','open','موارد باز')}${ch('sa','none','لغو انتخاب')}</div>`+(s&&hs.length?hs.map(x=>row(x,s,x.id,`${fmt(D(x.date))} · ${esc2(cn(x.course))}: ${esc2(x.title)}`)).join(''):'<p class="sub">تکلیفی در این بازه نیست؛ بازه را روی «همه‌ی تکالیف» بگذارید.</p>'))}
 h.push(editor());
 h.push(`<details style="margin-top:10px"><summary class="adds">➕ افزودن تکلیف (برای هر روز)</summary><div class="hxr"><select id="hxc" style="margin:0;flex:1;min-width:110px">${S.courses.map(c=>`<option value="${c.id}">${esc2(c.name)}</option>`).join('')}</select><select id="hxdt" style="margin:0;flex:1;min-width:110px">${dOpts(iso(cur),45)}</select><input id="hxtt" placeholder="مثلاً: صفحه ۴۷ یا درس سوم" style="margin:0;flex:2;min-width:140px"><button class="sm" data-x="add">➕ افزودن</button></div></details>
<div class="hxr" style="margin-top:10px">${L.length&&U.sc==='day'?'<button class="sm" id="hwxp">📄 PDF بازدید این روز</button><button class="sm" id="hwxx">📊 اکسل بازدید این روز</button>':''}<button class="sm" id="hwgo">📚 گزارش تکالیف با بازه‌ی دلخواه ←</button></div><p class="sub" id="hwmsg" style="margin:6px 0 0"></p></div>`);
 el.innerHTML=h.join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-x]'),el=$('hwc');if(!b||!el||!el.contains(b))return;
 const x=b.dataset.x,v=b.dataset.v,A=S.hwl.find(q=>q.id===U.ha),key=k=>U.v==='h'?+k:k;let sv=0;
 if(x!=='del')U.cd=0;
 if(x==='view'){U.v=v;U.sel.clear();U.dr=null}
 else if(x==='sc'){U.sc=v;U.sel.clear();U.dr=null}
 else if(x==='op')U.op=U.op?0:1;
 else if(x==='pick'){U.ha=v;U.sel.clear();U.dr=null}
 else if(x==='sel'){const k=key(v);U.sel.has(k)?U.sel.delete(k):U.sel.add(k);U.dr=null}
 else if(x==='sa'){U.sel.clear();U.dr=null;if(v!=='none'){if(U.v==='h'&&A)S.students.forEach(s=>{if(v==='all'||(v==='open'&&isOpen(A,s.id))||(v==='abs'&&((S.att[A.date]||{})[s.id])==='a'))U.sel.add(s.id)});
   if(U.v==='s')S.hwl.filter(sc).forEach(q=>{if(v==='all'||isOpen(q,U.sid))U.sel.add(q.id)})}}
 else if(x==='cy'){const q=U.v==='h'?A:S.hwl.find(z=>z.id===v),id=U.v==='h'?+v:U.sid;if(q){q.st[id]=SQ[(SQ.indexOf(q.st[id]||'')+1)%4];sv=1}}
 else if(x==='dst'){const d=U.dr;d.st=d.st===(v==='-'?'':v)?null:(v==='-'?'':v)}
 else if(x==='late'){U.dr.late=!U.dr.late}
 else if(x==='tag'){const t=tags()[+v],a=U.dr.tg,i=a.indexOf(t);i<0?a.push(t):a.splice(i,1)}
 else if(x==='cancel'){U.sel.clear();U.dr=null}
 else if(x==='clrfb'){pairs().forEach(([q,id])=>{q.fb&&delete q.fb[id];q.ld&&delete q.ld[id]});sv=1;U.sel.clear();U.dr=null}
 else if(x==='apply'){const d=U.dr,P=pairs(),one=P.length===1;P.forEach(([q,id])=>{q.fb=q.fb||{};q.ld=q.ld||{};const cu=q.st[id]||'';
   if(d.st!==null)q.st[id]=d.st;
   if(d.late){q.ld[id]=d.ld;if(d.st===null&&(cu===''||cu==='n'))q.st[id]='d'}else if(one)delete q.ld[id];
   if(d.tg.length||d.tx.trim())q.fb[id]={tg:d.tg.slice(),tx:d.tx.trim(),d:T()};else if(one)delete q.fb[id]});sv=1;U.sel.clear();U.dr=null}
 else if(x==='all'&&A){S.students.forEach(s=>A.st[s.id]='d');sv=1}
 else if(x==='del'&&A){if(!U.cd){U.cd=1}else{S.hwl=S.hwl.filter(q=>q!==A);U.ha=null;U.cd=0;sv=1}}
 else if(x==='add'){const t=($('hxtt').value||'').trim();if(!t)return;const q={id:'h'+Date.now(),date:$('hxdt').value,course:+$('hxc').value,title:t,st:{},fb:{},ld:{}};S.hwl.push(q);U.ha=q.id;U.v='h';if(!sc(q))U.sc='all';U.sel.clear();U.dr=null;sv=1}
 else return;
 if(sv)save();render()});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.x==='tx'&&U.dr)U.dr.tx=t.value});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if(t.dataset.x==='ld'&&U.dr)U.dr.ld=t.value;if(t.dataset.x==='sid'){U.sid=+t.value;U.sel.clear();U.dr=null;render()}});
const st=document.createElement('style');st.textContent=`.hx .hxr{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;align-items:center}.hxb{padding:8px 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--tx);font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}.hxb.on{background:var(--p);color:#fff;border-color:var(--p)}.hxb small{display:block;font-weight:400;opacity:.85;font-size:11px;margin-top:2px}.hxs{display:flex;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid var(--line)}.hxs.on{background:var(--bg2)}.hxs input{width:20px;height:20px;margin:0;flex:none}.hxn{flex:1;cursor:pointer;font-weight:700;font-size:14px}.hxn small{display:block;font-weight:400;color:#777;font-size:12px;margin-top:2px}.hxt{font-style:normal;font-size:11px;background:var(--bg2);border-radius:8px;padding:1px 6px;margin-inline-start:6px;white-space:nowrap}.hxe{position:sticky;bottom:8px;background:var(--card);border:2px solid var(--p);border-radius:14px;padding:10px;margin-top:10px;box-shadow:0 6px 20px #0003;z-index:5}.hxe textarea{width:100%;min-height:60px;margin:6px 0;box-sizing:border-box}.hxp{background:var(--p);color:#fff}`;
document.head.appendChild(st);
window.hwReview={render};
try{renderAtt()}catch(e){}
}catch(e){console.error('homework-review',e)}})();

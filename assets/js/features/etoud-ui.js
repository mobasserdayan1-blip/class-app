/* v88 — نمای گرافیکی، «یار هوشمند»، ثبت سریع حضور/نمره، تب‌های داشبورد مدیر
   همه‌چیز آفلاین و از روی داده‌های همین دستگاه کار می‌کند (بدون کتابخانه‌ی بیرونی). */
(function(){try{
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const f1=v=>v==null?'—':fa((Math.round(v*10)/10).toFixed(1).replace('.','٫'));
const isMgr=()=>{try{return !!(window.isSchoolManager&&window.isSchoolManager())}catch(e){return false}};
window.EXC_REASONS=window.EXC_REASONS||['بیماری','بیماری با گواهی پزشک','مراجعه به پزشک/دندان‌پزشکی','آزمایش یا درمان','مسافرت','مسافرت خانوادگی','مراسم خانوادگی','فوت بستگان','اعزام به مسابقه/اردو','شرکت در المپیاد/همایش','مشکل در رفت‌وآمد','شرایط جوی/آلودگی هوا','نامه‌ی ولی یا مدرسه'];
const WD=['ی','د','س','چ','پ','ج','ش'];
const lvl=v=>v==null?'#8a7aa6':v>=3.5?'#1a8f55':v>=3?'#14b8a6':v>=2.5?'#d98600':'#e5484d';
const lvT=v=>v==null?'—':v>=3.5?'عالی':v>=3?'خوب':v>=2.5?'قابل قبول':'نیازمند توجه';
const nz=t=>String(t||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').replace(/\s+/g,' ').trim();
const dig=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,،]/g,'.');
const tdI=()=>iso(tdy());
const toast=t=>{let b=document.getElementById('eutoast');if(!b){b=document.createElement('div');b.id='eutoast';b.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 18px;border-radius:30px;font:700 13px Vazirmatn,Tahoma,sans-serif;z-index:1100;box-shadow:0 8px 24px #0006;transition:opacity .3s;opacity:0';document.body.appendChild(b)}b.textContent=t;b.style.opacity=1;clearTimeout(b._t);b._t=setTimeout(()=>b.style.opacity=0,2200)};

/* ───── محاسبه‌ی آمار کلاس جاری ───── */
function M(){
 const st=S.students||[],T=tdI(),TA=S.att[T]||{},cl=S.closed||{};
 const ex=(S.exams||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const ov=id=>mean(S.courses.map(c=>cAvg(id,c.id,ex)).filter(nn));
 const per=st.map(s=>({s,o:ov(s.id)}));const withAvg=per.filter(x=>x.o!=null);
 const avg=withAvg.length?mean(withAvg.map(x=>x.o)):null;
 let p=0,t=0;Object.keys(S.att).forEach(k=>{if(cl[k])return;const d=S.att[k];st.forEach(s=>{const v=d[s.id];if(v){t++;if(v!=='a'||isExc(k,s.id))p++}})});
 let hd=0,ht=0;const hn={};(S.hwl||[]).forEach(h=>Object.keys(h.st||{}).forEach(id=>{const v=h.st[id];if(v==='d'||v==='p'||v==='n'){ht++;if(v==='d')hd++;if(v==='n')hn[id]=(hn[id]||0)+1}}));
 const dk=Object.keys(S.att).filter(k=>k<=T&&!cl[k]&&!hol(new Date(k+'T12:00:00Z'))&&st.some(s=>(S.att[k]||{})[s.id])).sort();
 const dayPct=k=>{const d=S.att[k]||{};let a=0,b=0;st.forEach(s=>{const v=d[s.id];if(v){b++;if(v!=='a'||isExc(k,s.id))a++}});return b?Math.round(a/b*100):0};
 const week=dk.slice(-7).map(k=>({k,v:dayPct(k),l:WD[new Date(k+'T12:00:00Z').getUTCDay()]+' '+fa(jp(new Date(k+'T12:00:00Z')).d)}));
 const cr=S.courses.map(c=>({n:c.name,a:mean(ex.filter(e=>e.course===c.id).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn))})).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);
 const abs10=id=>dk.slice(-10).filter(k=>(S.att[k]||{})[id]==='a'&&!isExc(k,id)).length;
 const risk=[];st.forEach(s=>{const w=[],o=ov(s.id),a=abs10(s.id),h=hn[s.id]||0;if(o!=null&&o<2.5)w.push('میانگین '+f1(o));if(a>=3)w.push(fa(a)+' غیبت در ۱۰ روز اخیر');if(h>=2)w.push(fa(h)+' تکلیف انجام‌نشده');if(w.length)risk.push({s,w,o})});
 risk.sort((a,b)=>b.w.length-a.w.length);
 const absT=st.filter(s=>TA[s.id]==='a'&&!isExc(T,s.id)),latT=st.filter(s=>TA[s.id]==='l'),preT=st.filter(s=>TA[s.id]==='p');
 return{st,T,TA,ex,ov,per,avg,att:t?Math.round(p/t*100):null,hw:ht?Math.round(hd/ht*100):null,hn,week,cr,risk,absT,latT,preT,dk,abs10,rec:Object.keys(TA).length>0,
  top:withAvg.slice().sort((a,b)=>b.o-a.o).slice(0,5)}}

/* ───── اجزای گرافیکی ───── */
const CI=2*Math.PI*34;
const ring=(v,txt,lab,c)=>{const pc=v==null?0:Math.max(0,Math.min(1,v));return`<div class="rg"><svg viewBox="0 0 90 90"><circle class="bg" cx="45" cy="45" r="34"/><circle class="fg" cx="45" cy="45" r="34" stroke="${c}" stroke-dasharray="${CI.toFixed(1)}" data-o="${(CI*(1-pc)).toFixed(1)}" stroke-dashoffset="${CI.toFixed(1)}"/><text x="45" y="52" text-anchor="middle">${txt}</text></svg><span>${lab}</span></div>`};
const hbar=(l,pct,txt,cls)=>`<div class="hb"><span title="${E(l)}">${E(l)}</span><u><i class="${cls||''}" data-w="${Math.max(2,Math.min(100,pct))}"></i></u><b>${txt}</b></div>`;
function bars(w){if(!w.length)return'<p class="sub" style="margin:4px 0">هنوز حضور و غیابی ثبت نشده است</p>';
 const W=300,H=118,n=w.length,bw=Math.min(26,(W-20)/n-8),gap=(W-n*bw)/(n+1);
 return`<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="روند حضور"><defs><linearGradient id="euG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7e57c2"/><stop offset="1" stop-color="#14b8a6"/></linearGradient><linearGradient id="euW" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e5484d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>
 ${[0,50,100].map(g=>`<line x1="0" x2="${W}" y1="${88-g*.7}" y2="${88-g*.7}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join('')}
 ${w.slice().reverse().map((d,i)=>{const h=Math.max(3,d.v*.7),x=gap+i*(bw+gap);return`<rect class="b" x="${x.toFixed(1)}" y="${(88-h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="7" fill="url(#${d.v<85?'euW':'euG'})" style="animation-delay:${i*70}ms"/><text class="v" x="${(x+bw/2).toFixed(1)}" y="${(88-h-5).toFixed(1)}" text-anchor="middle">${fa(d.v)}</text><text x="${(x+bw/2).toFixed(1)}" y="104" text-anchor="middle">${d.l.split(' ')[0]}</text><text x="${(x+bw/2).toFixed(1)}" y="114" text-anchor="middle" opacity=".7">${d.l.split(' ')[1]||''}</text>`}).join('')}</svg>`}
const grow=root=>{requestAnimationFrame(()=>requestAnimationFrame(()=>{root.querySelectorAll('.fg').forEach(c=>c.setAttribute('stroke-dashoffset',c.dataset.o));root.querySelectorAll('.hb i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%')}))};
const grow2=root=>{root.querySelectorAll('.fg').forEach(c=>c.setAttribute('stroke-dashoffset',c.dataset.o));root.querySelectorAll('.hb i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%')};

/* ───── کارت نمای گرافیکی در صفحه‌ی اصلی ───── */
let seen=false;
function viz(){
 const home=$('home');let el=$('euv');
 if(!home||!S.students||!S.students.length){if(el)el.remove();return}
 const m=M();if(!el){el=document.createElement('div');el.id='euv'}
 el.className='euv'+(seen?' euv-static':'');
 el.innerHTML=`<div class="euv-h"><b>📊 نمای گرافیکی کلاس</b><span>${fa(jp(tdy()).d)} ${['','فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][jp(tdy()).m]||''}</span></div>
 <div class="euv-tiles"><button data-eu="att"><i>📋</i>حضور سریع</button><button data-eu="sc"><i>✍️</i>ثبت نمره</button><button data-eu="bot"><i>🤖</i>یار هوشمند</button></div>
 <div class="euv-rings">${ring(m.att==null?null:m.att/100,m.att==null?'—':fa(m.att)+'٪','حضور کل سال','#14b8a6')}${ring(m.avg==null?null:m.avg/4,f1(m.avg),'میانگین از ۴','#7e57c2')}${ring(m.hw==null?null:m.hw/100,m.hw==null?'—':fa(m.hw)+'٪','تکالیف','#f59e0b')}</div>
 <div class="euv-sec"><b>📅 روند حضور ${fa(m.week.length||7)} روز اخیر (٪)</b>${bars(m.week)}</div>
 ${m.cr.length?`<div class="euv-sec"><b>📚 میانگین درس‌ها</b>${m.cr.map(c=>hbar(c.n,c.a/4*100,f1(c.a),c.a<2.5?'w':c.a>=3.5?'o':'')).join('')}</div>`:''}
`;
 const hero=home.querySelector('#tdash2 .thero');
 if(hero){if(hero.nextElementSibling!==el)hero.insertAdjacentElement('afterend',el)}
 else{const t=$('tdash2');if(t)t.prepend(el);else home.insertBefore(el,$('stats'))}
 if(seen)grow2(el);else{grow(el);seen=true}
}

/* ───── ورقه‌ی پایین ───── */
let sh=$('eus');if(!sh){sh=document.createElement('div');sh.id='eus';document.body.appendChild(sh)}
const closeSh=()=>{sh.classList.remove('open');sh.innerHTML=''};
sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('.x'))closeSh()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSh();closeBot()}});
function openSh(title,sub,body,foot){sh.innerHTML=`<div class="bx" role="dialog" aria-label="${E(title)}"><div class="hd"><div><b>${title}</b><small>${sub||''}</small></div><button class="x" aria-label="بستن">✕</button></div><div class="bd">${body}</div>${foot?`<div class="ft">${foot}</div>`:''}</div>`;sh.classList.add('open')}
const redraw=()=>{try{render()}catch(e){}};

/* — حضور و غیاب سریع (با کادر توضیحات برای «موجه») — */
function putA(key,id,n){const A=S.att[key]=S.att[key]||{},X=S.attx=S.attx||{};
 if(!n){delete A[id];if(X[key]){delete X[key][id];if(!Object.keys(X[key]).length)delete X[key]}return}
 if(n==='e'){A[id]='a';(X[key]=X[key]||{})[id]=(X[key]||{})[id]||''}
 else{A[id]=n;if(X[key]){delete X[key][id];if(!Object.keys(X[key]).length)delete X[key]}}}
const curA=(T,id)=>{const v=(S.att[T]||{})[id];return v==='a'&&isExc(T,id)?'e':(v||'')};
const REASONS=()=>window.EXC_REASONS||['بیماری','مسافرت','مراسم خانوادگی','اعزام به مسابقه/اردو'];
function attSum(T){const c={p:0,a:0,l:0,e:0,n:0};(S.students||[]).forEach(s=>{const v=curA(T,s.id);if(v)c[v]++;else c.n++});return`<div class="qa-sum"><span style="color:#2eaf6b">✅ ${fa(c.p)}</span><span style="color:#e5484d">❌ ${fa(c.a)}</span><span style="color:#d98600">⏰ ${fa(c.l)}</span><span style="color:#2f80ed">📄 ${fa(c.e)}</span>${c.n?`<span>— ${fa(c.n)} ثبت‌نشده</span>`:''}</div>`}
const noteBox=(T,id)=>curA(T,id)==='e'?`<div class="qa-x"><b>📝 توضیحات (دلیل موجه بودن غیبت)</b><textarea data-xn="${id}" rows="2" placeholder="مثلاً: بیماری با گواهی پزشک، مسافرت خانوادگی، مراسم...">${E(((S.attx||{})[T]||{})[id]||'')}</textarea><div class="chp">${REASONS().map(x=>`<button type="button" data-xq="${id}" data-xt="${E(x)}">${E(x)}</button>`).join('')}</div></div>`:'';
function attSheet(){
 const T=tdI();if(hol(tdy())||(S.closed&&S.closed[T])){openSh('📋 حضور و غیاب سریع',fmt(tdy()),'<div class="qa-note">امروز تعطیل است. برای ثبت روز دیگر از «دفتر حضور و غیاب» استفاده کنید.</div>','<button class="big" data-go="att">رفتن به دفتر حضور و غیاب</button>');return}
 const rows=S.students.map(s=>{const v=curA(T,s.id);return`<div class="qa-w" data-w="${s.id}"><div class="qa-r" data-id="${s.id}"><span>${E(s.name)}</span><div class="sg">${[['p','حاضر'],['a','غایب'],['l','تأخیر'],['e','موجه']].map(([k,l])=>`<button data-v="${k}" class="${v===k?'on':''}">${l}</button>`).join('')}</div></div>${noteBox(T,s.id)}</div>`}).join('');
 openSh('📋 حضور و غیاب سریع',fmt(tdy()),`<div id="eusum" style="margin-bottom:6px">${attSum(T)}</div>${rows}`,'<button class="sm" data-all="1">✅ همه حاضر</button><button class="big" data-done="1">ذخیره و بستن</button>')}
let svT;const saveSoon=()=>{clearTimeout(svT);svT=setTimeout(()=>{try{save()}catch(e){}},500)};
sh.addEventListener('click',e=>{
 const b=e.target.closest('.qa-r .sg button');
 if(b){const r=b.closest('.qa-r'),w=b.closest('.qa-w'),id=r.dataset.id,T=tdI(),k=b.dataset.v;putA(T,id,curA(T,id)===k?'':k);
  r.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.v===curA(T,id)));
  const nb=w.querySelector('.qa-x');if(nb)nb.remove();w.insertAdjacentHTML('beforeend',noteBox(T,id));
  $('eusum').innerHTML=attSum(T);save();const ta=w.querySelector('textarea');if(ta)setTimeout(()=>ta.focus({preventScroll:true}),50);return}
 const q=e.target.closest('[data-xq]');
 if(q){const id=q.dataset.xq,T=tdI(),X=S.attx=S.attx||{},o=(X[T]=X[T]||{})[id]||'';X[T][id]=o?(o.indexOf(q.dataset.xt)<0?o+'، '+q.dataset.xt:o):q.dataset.xt;
  const ta=q.closest('.qa-x').querySelector('textarea');ta.value=X[T][id];saveSoon();return}
 if(e.target.dataset.all){const T=tdI();S.students.forEach(s=>{if(!curA(T,s.id))putA(T,s.id,'p')});save();attSheet();return}
 if(e.target.dataset.done){closeSh();redraw();toast('✅ حضور و غیاب امروز ذخیره شد');return}
 if(e.target.dataset.go){closeSh();show(e.target.dataset.go)}
});
sh.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.xn!=null){const T=tdI(),X=S.attx=S.attx||{};(X[T]=X[T]||{})[t.dataset.xn]=t.value;saveSoon()}});

/* — ثبت نمره‌ی سریع (توصیفی) — */
const LV=[[4,'خیلی خوب','#1a8f55'],[3,'خوب','#14b8a6'],[2,'قابل قبول','#d98600'],[1,'نیاز به تلاش','#e5484d']];
let scEx=null,scD={},scMk={};
const toLv=(e,id)=>{const v=e.scores[id];return v==null?null:Math.min(4,Math.max(1,Math.round(v/e.max*4)))};
const isAbs=(e,id)=>((S.att[e.date]||{})[id])==='a';
const hasMk=(e,id)=>!!(e.mk&&e.mk[id]&&e.mk[id]!=='x');
const eligible=(e,id)=>!isAbs(e,id)||hasMk(e,id)||!!scMk[id];
function scRow(s){const e=scEx,id=s.id;
 if(!eligible(e,id))return`<div class="qs-r abs" data-sr="${id}"><div class="qs-h"><span>${E(s.name)}</span><i>🚫 غایب در روز آزمون</i></div><div class="qs-n">طبق قانون، غایب‌ها در این آزمون ارزیابی نمی‌شوند؛ فقط اگر در آزمون جبرانی شرکت کرده باشند.<button type="button" data-mk="${id}">🔄 شرکت در جبرانی</button></div></div>`;
 return`<div class="qs-r" data-sr="${id}"><div class="qs-h"><span>${E(s.name)}</span>${(hasMk(e,id)||scMk[id])?'<i class="mk">🔄 جبرانی</i>':''}</div><div class="lv">${LV.map(([n,t,c])=>`<button type="button" data-l="${n}" style="--c:${c}" class="${scD[id]===n?'on':''}">${t}</button>`).join('')}</div></div>`}
function scSum(){const el=S.students.filter(s=>eligible(scEx,s.id)),a=el.map(s=>scD[s.id]).filter(v=>v!=null),ab=S.students.length-el.length;
 const b=$('euavg');if(b)b.innerHTML=`<span>ثبت‌شده: ${fa(a.length)} از ${fa(el.length)}</span>${a.length?`<span>میانگین: ${fa((Math.round(mean(a)*10)/10).toString().replace('.','٫'))} از ۴</span>`:''}${ab?`<span style="color:#e5484d">🚫 ${fa(ab)} غایب</span>`:''}`}
function scSheet(id){
 const exs=(S.exams||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,40);
 if(!exs.length){openSh('✍️ ثبت نمره‌ی سریع','',`<div class="qa-note">هنوز آزمون یا ارزیابی‌ای ساخته نشده. ابتدا از «درس‌ها و آزمون‌ها» یک ارزیابی بسازید؛ بعد اینجا سریع نمره‌ها را وارد کنید.</div>`,'<button class="big" data-go="crs">📚 رفتن به درس‌ها و آزمون‌ها</button>');return}
 const ne=id?exs.find(e=>e.id===id)||exs[0]:(scEx&&exs.find(e=>e.id===scEx.id))||exs[0];
 scEx=ne;scD={};scMk={};S.students.forEach(s=>{scD[s.id]=toLv(ne,s.id)});
 const cn=e=>(S.courses.find(c=>c.id===e.course)||{}).name||'درس';
 const opt=exs.map(e=>`<option value="${e.id}" ${e.id===scEx.id?'selected':''}>${E(cn(e))} · ${E(e.title||e.type||'ارزیابی')} · ${fmt(new Date(e.date+'T12:00:00Z'))}</option>`).join('');
 openSh('✍️ ثبت نمره‌ی سریع','ارزیابی توصیفی · روی نام سطح بزنید؛ دوباره بزنید تا پاک شود',`<select id="eusel" class="fs">${opt}</select><div class="qs-bulk"><button type="button" data-bulk="4" style="--c:#1a8f55">⭐ همه «خیلی خوب»</button><button type="button" data-bulk="3" style="--c:#14b8a6">👍 همه «خوب»</button><button type="button" data-bulk="0" style="--c:#8a7aa6">🧹 پاک‌کردن</button></div><div class="qa-sum" id="euavg" style="margin:6px 0"></div><div id="eurows">${S.students.map(scRow).join('')}</div>`,'<button class="big" data-sv="1">💾 ذخیره‌ی نمره‌ها</button>');
 scSum()}
sh.addEventListener('change',e=>{if(e.target.id==='eusel')scSheet(+e.target.value)});
sh.addEventListener('click',e=>{
 if(!scEx||!sh.querySelector('#eurows'))return;
 const lb=e.target.closest('.lv button');
 if(lb){const r=lb.closest('.qs-r'),id=r.dataset.sr,n=+lb.dataset.l;scD[id]=scD[id]===n?null:n;r.querySelectorAll('.lv button').forEach(x=>x.classList.toggle('on',+x.dataset.l===scD[id]));scSum();return}
 const bk=e.target.closest('[data-bulk]');
 if(bk){const n=+bk.dataset.bulk;S.students.forEach(s=>{if(eligible(scEx,s.id))scD[s.id]=n||null});$('eurows').innerHTML=S.students.map(scRow).join('');scSum();toast(n?'همه ثبت شد؛ حالا موارد لازم را اصلاح کنید':'پاک شد');return}
 const mk=e.target.closest('[data-mk]');
 if(mk){const id=mk.dataset.mk;scMk[id]=true;scD[id]=null;const r=mk.closest('.qs-r'),s=S.students.find(x=>String(x.id)===String(id));r.outerHTML=scRow(s);scSum();return}
 if(e.target.dataset&&e.target.dataset.sv){
  const T=tdI();let n=0;S.students.forEach(s=>{const id=s.id;if(!eligible(scEx,id))return;const lv=scD[id],old=toLv(scEx,id);
   if(lv==null){if(scEx.scores[id]!=null){delete scEx.scores[id];n++}return}
   if(lv!==old){scEx.scores[id]=Math.round(lv/4*scEx.max*100)/100;n++}
   if(isAbs(scEx,id)&&!hasMk(scEx,id)){scEx.mk=scEx.mk||{};scEx.mk[id]=T}});
  save();closeSh();redraw();toast('✅ نمره‌ها ذخیره شد'+(n?' ('+fa(n)+' تغییر)':''))}});

/* ───── یار هوشمند (دستیار آفلاین) ───── */
const fab=document.createElement('button');fab.id='eufab';fab.type='button';fab.setAttribute('aria-label','یار هوشمند');fab.innerHTML='🤖';document.body.appendChild(fab);
const bot=document.createElement('div');bot.id='eub';bot.setAttribute('role','dialog');bot.setAttribute('aria-label','یار هوشمند');
bot.innerHTML=`<div class="eub-h"><div class="av">🤖</div><div><b>یار هوشمند</b><small>پاسخ از روی داده‌های همین دستگاه · کاملاً آفلاین و خصوصی</small></div><button type="button" id="eubx" aria-label="بستن">✕</button></div><div class="eub-m" id="eubm"></div><div class="eub-c" id="eubc"></div><div class="eub-i"><input id="eubi" placeholder="بپرس… مثلاً «غایب‌های امروز» یا نام یک دانش‌آموز" autocomplete="off"><button type="button" id="eubs" aria-label="ارسال">➤</button></div>`;
document.body.appendChild(bot);
const CATS_T=[
 ['⚡ کلی',[['🌟 وضعیت کلی کلاس','وضعیت کلی کلاس'],['📋 ثبت حضور سریع','ثبت حضور سریع'],['✍️ ثبت نمره سریع','ثبت نمره سریع'],['🎓 کارت یک دانش‌آموز','نام دانش‌آموز را بنویس']]],
 ['🚫 حضور',[['🚫 غایب‌های امروز','غایب امروز'],['⏰ دیر آمده‌ها','دیر آمده‌ها'],['📄 غیبت‌های موجه','غیبت‌های موجه'],['📈 روند حضور هفته','روند حضور'],['🔝 بیشترین غیبت‌ها','بیشترین غیبت'],['🏆 حضور کامل','حضور کامل']]],
 ['📝 نمره',[['🏅 برترین‌ها','برترین دانش‌آموزان'],['🚨 نیازمند توجه','نیازمند توجه'],['📚 میانگین درس‌ها','میانگین درس‌ها'],['🚀 بیشترین پیشرفت','بیشترین پیشرفت'],['🧪 آخرین آزمون','آخرین آزمون'],['🔄 جبرانی‌های باقی‌مانده','جبرانی‌های باقی‌مانده']]],
 ['📚 تکلیف',[['📝 وضعیت تکالیف','وضعیت تکالیف'],['❌ تکلیف انجام‌نشده','بیشترین تکلیف انجام نشده']]],
 ['🗓️ برنامه',[['📅 برنامه‌ی امروز','برنامه امروز'],['⏭️ زنگ بعدی','زنگ بعدی'],['🗓️ آزمون‌های پیش‌رو','آزمون‌های پیش‌رو']]]];
const CATS_M=[['🏫 مدرسه',[['⚖️ مقایسه کلاس‌ها','مقایسه کلاس‌ها'],['🚫 غیبت امروز مدرسه','غیبت امروز'],['⚠️ هشدار نمرات','هشدار نمرات'],['📅 کمترین حضور','کمترین حضور'],['🏆 بهترین کلاس','بهترین کلاس'],['📝 تکالیف کلاس‌ها','تکالیف کلاس‌ها']]]];
let catI=0;
function chipsUI(){const C=isMgr()?CATS_M:CATS_T;if(catI>=C.length)catI=0;
 $('eubc').innerHTML=(C.length>1?`<div class="ct">${C.map((c,i)=>`<button type="button" data-cat="${i}" class="${i===catI?'on':''}">${c[0]}</button>`).join('')}</div>`:'')+`<div class="cg">${C[catI][1].map(c=>`<button type="button" data-q="${E(c[1])}">${c[0]}</button>`).join('')}</div>`}
let greeted=false;
const msgs=$('eubm');
function say(html,who){const d=document.createElement('div');d.className='mg '+(who||'b');d.innerHTML=html;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;if(who==='b')grow2(d);return d}
function openBot(){bot.classList.add('open');fab.style.display='none';chipsUI();
 if(!greeted){greeted=true;const n=((S.prof||{}).teacher||'').trim();say(`سلام${n?' '+E(n):''} 👋 من «یار» هستم. می‌توانم از روی داده‌های همین برنامه درباره‌ی حضور، نمره‌ها، تکالیف و دانش‌آموزان پاسخ بدهم و نمودار نشان بدهم.<br>یکی از دکمه‌های پایین را بزن یا سؤالت را بنویس.`)}
 setTimeout(()=>{const i=$('eubi');i&&i.focus({preventScroll:true})},300)}
function closeBot(){bot.classList.remove('open');fab.style.display=''}
fab.onclick=openBot;$('eubx').onclick=closeBot;
const pl=(a,b)=>`<div class="pl"><span>${a}</span><em>${b||''}</em></div>`;
const noData='هنوز دانش‌آموز یا داده‌ای در این کلاس ثبت نشده است.';
function stuCard(s,m){const o=m.ov(s.id),ser=m.ex.map(e=>nrm(e,s.id)).filter(nn).slice(-6);
 let p=0,t=0,a=0;Object.keys(S.att).forEach(k=>{const v=(S.att[k]||{})[s.id];if(v){t++;if(v!=='a'||isExc(k,s.id))p++;else a++}});
 let hd=0,ht=0;(S.hwl||[]).forEach(h=>{const v=(h.st||{})[s.id];if(v==='d'||v==='p'||v==='n'){ht++;if(v==='d')hd++}});
 const spark=ser.length>1?`<svg viewBox="0 0 120 34" style="width:100%;height:34px"><polyline fill="none" stroke="#14b8a6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ser.map((v,i)=>((i*(116/(ser.length-1))+2).toFixed(1))+','+(32-v/4*30).toFixed(1)).join(' ')}"/></svg>`:'';
 return`<b>${E(s.name)}</b> — <span style="color:${lvl(o)};font-weight:800">${lvT(o)}</span><div class="kp"><div><b style="color:${lvl(o)}">${f1(o)}</b><span>میانگین</span></div><div><b>${t?fa(Math.round(p/t*100))+'٪':'—'}</b><span>حضور</span></div><div><b>${ht?fa(Math.round(hd/ht*100))+'٪':'—'}</b><span>تکالیف</span></div></div>${spark}<small style="color:var(--mut)">${fa(a)} غیبت ثبت‌شده · روند ${fa(ser.length)} ارزیابی اخیر</small><br><button class="lk" data-sf="${s.id}">🎓 باز کردن پرونده</button>`}
function mgrAnswer(q){
 const C=(S.classes||[]).filter(c=>!c.demo&&(!window.clsOK||window.clsOK(c.id))),T=tdI();
 const L=c=>c.name||('پایه '+(c.grade||'')+(c.sec?' '+c.sec:''));
 const sm=C.map(c=>({c,s:c.sum})).filter(x=>x.s);
 if(!sm.length)return'هنوز آمار هیچ کلاسی ذخیره نشده؛ هر کلاس را یک‌بار باز کنید تا آمارش در داشبورد مدیر ثبت شود.';
 if(/غیب|غیاب|غایب/.test(q)){const r=sm.filter(x=>x.s.d===T).sort((a,b)=>(b.s.ta||0)-(a.s.ta||0));const tot=r.reduce((a,x)=>a+(x.s.ta||0),0);return`امروز <b>${fa(tot)}</b> غایب در ${fa(r.length)} کلاس ثبت شده است.`+r.map(x=>hbar(L(x.c),(x.s.ta||0)*10,fa(x.s.ta||0),'w')).join('')}
 if(/هشدار|ضعیف|افت|نیاز/.test(q)){const r=sm.filter(x=>x.s.low||x.s.dn||(x.s.hw!=null&&x.s.hw<60));return r.length?'کلاس‌هایی که نیاز به توجه دارند:'+r.map(x=>pl('⚠️ '+E(L(x.c)),[x.s.low?fa(x.s.low)+' دانش‌آموز زیر ۲٫۵':'',x.s.dn?fa(x.s.dn)+' در حال افت':'',x.s.hw!=null&&x.s.hw<60?'تکالیف '+fa(x.s.hw)+'٪':''].filter(Boolean).join(' · '))).join(''):'هشدار مهمی وجود ندارد 🌟'}
 if(/تکلیف/.test(q)){const r=sm.filter(x=>x.s.hw!=null).sort((a,b)=>a.s.hw-b.s.hw);return r.length?'درصد انجام تکالیف کلاس‌ها (کمترین در بالا):'+r.map(x=>hbar(L(x.c),x.s.hw,fa(x.s.hw)+'٪',x.s.hw<60?'w':'o')).join(''):'آمار تکالیف ثبت نشده است.'}
 if(/حضور/.test(q)){const r=sm.filter(x=>x.s.att!=null).sort((a,b)=>a.s.att-b.s.att);return r.length?'درصد حضور کلاس‌ها در کل سال (کمترین در بالا):'+r.map(x=>hbar(L(x.c),x.s.att,fa(x.s.att)+'٪',x.s.att<85?'w':'o')).join(''):'آمار حضور ثبت نشده است.'}
 const r=sm.filter(x=>x.s.avg!=null).sort((a,b)=>b.s.avg-a.s.avg);if(!r.length)return'میانگینی برای مقایسه ثبت نشده است.';
 if(/بهترین|برتر/.test(q))return`🏆 بهترین کلاس از نظر میانگین: <b>${E(L(r[0].c))}</b> با ${f1(r[0].s.avg)} از ۴`;
 return`مقایسه‌ی میانگین کلاس‌ها (از ۴) — بالاترین: <b>${E(L(r[0].c))}</b>`+r.map(x=>hbar(L(x.c),x.s.avg/4*100,f1(x.s.avg),x.s.avg<2.5?'w':x.s.avg>=3.5?'o':'')).join('')}
const dayDiff=d=>Math.round((new Date(d+'T12:00:00Z')-new Date(tdI()+'T12:00:00Z'))/864e5);
const cnm=id=>(S.courses.find(c=>c.id===id)||{}).name||'درس';
function schedAns(q){const a=window.wscApi&&window.wscApi.today&&window.wscApi.today();
 if(!a||!a.has)return'برنامه‌ی هفتگی زنگ‌ها هنوز چیده نشده است.<br><button class="lk" data-go="wsc">🗓️ چیدن برنامه‌ی هفتگی</button>';
 if(a.off)return'امروز تعطیل است 🌴 برنامه‌ی کلاس از روز کاری بعد ادامه دارد.';
 if(!a.L.length)return'برای امروز ('+E(a.day)+') زنگی ثبت نشده است.';
 if(/بعدی/.test(q))return a.cur?`الان زنگ ${fa(a.cur.i+1)} («${E(a.cur.name)}») است؛ ${fa(a.cur.left)} دقیقه تا پایان.`+(a.nxt?`<br>بعدی: ${E(a.nxt.name)} ساعت ${fa(a.nxt.s)}`:''):a.nxt?`زنگ بعدی: <b>${E(a.nxt.name)}</b> ساعت ${fa(a.nxt.s)} (${fa(a.nxt.min)} دقیقه دیگر)`:'زنگ‌های امروز تمام شده است ✅';
 return`برنامه‌ی امروز (${E(a.day)}) — ${fa(a.L.length)} زنگ:`+a.L.map(x=>pl((x.cur?'🟢 ':x.past?'✔️ ':'⏳ ')+E(x.name),fa(x.s)+' تا '+fa(x.e))).join('')}
function examAns(){const T=tdI(),L=(S.exPlan||[]).filter(x=>x.st==='p'&&x.date>=T).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
 if(!L.length)return'آزمون پیش‌رویی در برنامه‌ی امتحانی ثبت نشده است.<br><button class="lk" data-go="exp">🗓️ ثبت آزمون</button>';
 return`آزمون‌های پیش‌رو:`+L.map(x=>{const d=dayDiff(x.date);return pl('📝 '+E(cnm(x.course))+(x.type?' · '+E(x.type):''),d===0?'امروز':d===1?'فردا':fa(d)+' روز دیگر')}).join('')}
function answer(raw){
 const q=nz(raw);if(isMgr())return mgrAnswer(q);
 const m=M();if(!m.st.length)return noData;
 if(/^(سلام|درود|hi)/.test(q))return'سلام! 😊 چه کمکی از من برمی‌آید؟ دکمه‌های پایین را ببین یا اسم یک دانش‌آموز را بنویس.';
 if(/ثبت.*(حضور|غیاب)|حضور سریع/.test(q))return'برای ثبت سریع حضور و غیاب، دکمه‌ی زیر را بزن:<br><button class="lk" data-eu="att">📋 حضور و غیاب سریع</button>';
 if(/ثبت.*نمره|نمره سریع/.test(q))return'برای ثبت سریع نمره (به‌صورت توصیفی)، دکمه‌ی زیر را بزن:<br><button class="lk" data-eu="sc">✍️ ثبت نمره‌ی سریع</button>';
 const byName=m.st.find(s=>q.includes(nz(s.name)))||m.st.find(s=>{const f=nz(s.name).split(' ')[0];return f.length>=3&&q.split(' ').includes(f)})||m.st.find(s=>nz(s.name).split(' ').some(w=>w.length>=4&&q.includes(w)));
 if(byName)return stuCard(byName,m);
 if(/نام دانش.?آموز/.test(q))return'اسم دانش‌آموز را بنویس (مثلاً «'+E(m.st[0].name.split(' ')[0])+'») تا کارت میانگین، حضور و تکالیفش را نشان بدهم.';
 if(/موجه/.test(q)){const X=S.attx||{},rows=[];Object.keys(X).sort().reverse().forEach(k=>Object.keys(X[k]).forEach(id=>{const s=m.st.find(x=>String(x.id)===String(id));if(s&&(S.att[k]||{})[id]==='a')rows.push([k,s,X[k][id]])}));
  return rows.length?`<b>${fa(rows.length)}</b> غیبت موجه ثبت شده (جدیدترین‌ها):`+rows.slice(0,8).map(r=>pl('📄 '+E(r[1].name),fmt(new Date(r[0]+'T12:00:00Z'))+(r[2]?' · '+E(String(r[2]).slice(0,40)):''))).join(''):'غیبت موجهی ثبت نشده است.'}
 if(/تاخیر|تأخیر|دیر/.test(q)){return m.rec?(m.latT.length?`امروز <b>${fa(m.latT.length)}</b> نفر با تأخیر آمده‌اند:`+m.latT.map(s=>pl('⏰ '+E(s.name),'تأخیر')).join(''):'امروز کسی تأخیر نداشته است 🌟'):'حضور و غیاب امروز هنوز ثبت نشده است.'}
 if(/بیشترین غیبت|پرغیبت|حضور کامل|بدون غیبت/.test(q)){const cl=S.closed||{},cnt=m.st.map(s=>{let c=0,t=0;Object.keys(S.att).forEach(k=>{if(cl[k])return;const v=S.att[k][s.id];if(v){t++;if(v==='a'&&!isExc(k,s.id))c++}});return{s,c,t}}).filter(x=>x.t);
  if(/کامل|بدون/.test(q)){const p=cnt.filter(x=>x.c===0);return p.length?`<b>${fa(p.length)}</b> دانش‌آموز تا امروز هیچ غیبتی نداشته‌اند 🏆`+p.slice(0,8).map(x=>pl('✅ '+E(x.s.name),'')).join(''):'همه‌ی دانش‌آموزان حداقل یک غیبت دارند.'}
  const mx=Math.max(1,...cnt.map(x=>x.c)),r=cnt.filter(x=>x.c>0).sort((a,b)=>b.c-a.c).slice(0,6);return r.length?'بیشترین غیبت‌ها (بدون احتساب موجه):'+r.map(x=>hbar(x.s.name,x.c/mx*100,fa(x.c)+' روز','w')).join(''):'غیبت ثبت‌نشده‌ای وجود ندارد 🌟'}
 if(/غیب|غیاب|غایب|نیومد|نیامد/.test(q)&&!/روند|هفته/.test(q)){const all=m.absT.length+m.latT.length;
  if(!m.rec)return'حضور و غیاب امروز هنوز ثبت نشده است.<br><button class="lk" data-eu="att">📋 ثبت حضور و غیاب</button>';
  return`امروز <b>${fa(m.absT.length)}</b> غایب و <b>${fa(m.latT.length)}</b> تأخیر دارید:`+(all?m.absT.map(s=>pl('❌ '+E(s.name),'غایب')).join('')+m.latT.map(s=>pl('⏰ '+E(s.name),'تأخیر')).join('')+(m.absT.length?'<small style="color:var(--mut)">پیشنهاد: با خانواده‌ی غایب‌ها تماس بگیرید.</small>':''):'<br>همه حاضر هستند 🌟')}
 if(/روند|هفته|حضور/.test(q)&&!/برنامه|زنگ/.test(q)){return m.week.length?`میانگین حضور ${fa(m.week.length)} روز اخیر: <b>${fa(Math.round(mean(m.week.map(w=>w.v))))}٪</b>`+m.week.slice().reverse().map(w=>hbar(w.l,w.v,fa(w.v)+'٪',w.v<85?'w':'o')).join(''):'هنوز حضور و غیابی ثبت نشده است.'}
 if(/برتر|بهترین|رتبه|ممتاز/.test(q)){return m.top.length?'برترین دانش‌آموزان بر اساس میانگین ارزیابی (از ۴):'+m.top.map(x=>hbar(x.s.name,x.o/4*100,f1(x.o),x.o>=3.5?'o':'')).join(''):'هنوز ارزیابی‌ای ثبت نشده است.'}
 if(/پیشرفت|بهبود/.test(q)){const r=m.st.map(s=>{const a=m.ex.map(e=>nrm(e,s.id)).filter(nn);return a.length>=4?{s,d:mean(a.slice(-2))-mean(a.slice(0,-2))}:null}).filter(x=>x&&x.d>0.15).sort((a,b)=>b.d-a.d).slice(0,6);
  return r.length?'بیشترین پیشرفت (دو ارزیابی اخیر نسبت به قبل):'+r.map(x=>pl('🚀 '+E(x.s.name),'+'+f1(x.d))).join(''):'هنوز داده‌ی کافی برای سنجش پیشرفت نیست (حداقل ۴ ارزیابی لازم است).'}
 if(/نیاز|ضعیف|افت|خطر|توجه|مشکل/.test(q)&&!/تکلیف/.test(q)){return m.risk.length?`<b>${fa(m.risk.length)}</b> دانش‌آموز نیازمند توجه‌اند:`+m.risk.slice(0,6).map(r=>pl('🚨 '+E(r.s.name),E(r.w.join(' · ')))).join(''):'عالیه! دانش‌آموزی در وضعیت هشدار نیست 🌟'}
 if(/تکلیف/.test(q)){const n=Object.keys(m.hn).map(id=>({s:m.st.find(s=>String(s.id)===id),c:m.hn[id]})).filter(x=>x.s).sort((a,b)=>b.c-a.c).slice(0,5);return m.hw==null?'هنوز تکلیفی ثبت نشده است.':`درصد انجام تکالیف کلاس: <b>${fa(m.hw)}٪</b>`+(n.length?'<br>بیشترین «انجام‌نشده»:'+n.map(x=>pl(E(x.s.name),fa(x.c)+' مورد')).join(''):'')}
 if(/آخرین/.test(q)){const e=m.ex[m.ex.length-1];if(!e)return'هنوز ارزیابی‌ای ثبت نشده است.';const v=m.st.map(s=>({s,v:nrm(e,s.id)})).filter(x=>x.v!=null),low=v.filter(x=>x.v<2.5);
  return`<b>${E(cnm(e.course))} · ${E(e.title||e.type||'ارزیابی')}</b> — ${fmt(new Date(e.date+'T12:00:00Z'))}<div class="kp"><div><b>${fa(v.length)}</b><span>شرکت‌کننده</span></div><div><b>${f1(v.length?mean(v.map(x=>x.v)):null)}</b><span>میانگین</span></div><div><b>${fa(low.length)}</b><span>نیاز به تلاش</span></div></div>`+(low.length?low.slice(0,5).map(x=>pl('⚠️ '+E(x.s.name),f1(x.v))).join(''):'')}
 if(/جبران/.test(q)){const r=[];m.ex.forEach(e=>m.st.forEach(s=>{if((S.att[e.date]||{})[s.id]==='a'&&e.scores[s.id]==null&&!(e.mk&&e.mk[s.id]))r.push([s,e])}));
  return r.length?`<b>${fa(r.length)}</b> مورد جبرانی باقی مانده:`+r.slice(0,8).map(x=>pl('🔄 '+E(x[0].name),E(cnm(x[1].course))+' · '+fmt(new Date(x[1].date+'T12:00:00Z')))).join('')+'<small style="color:var(--mut)">غایب‌ها فقط با شرکت در آزمون جبرانی ارزیابی می‌شوند.</small>':'جبرانی باقی‌مانده‌ای نیست ✅'}
 if(/پیش.?رو|آینده|امتحان|یادآور|فردا/.test(q))return examAns();
 if(/برنامه|زنگ|ساعت/.test(q))return schedAns(q);
 if(/میانگین|درس|نمره|ارزیابی/.test(q)){return m.cr.length?`میانگین کلاس: <b>${f1(m.avg)}</b> از ۴ — قوی‌ترین درس: <b>${E(m.cr[0].n)}</b>`+m.cr.map(c=>hbar(c.n,c.a/4*100,f1(c.a),c.a<2.5?'w':c.a>=3.5?'o':'')).join('')+(m.cr.length>1?`<small style="color:var(--mut)">پیشنهاد: مرور درس «${E(m.cr[m.cr.length-1].n)}» در کلاس.</small>`:''):'هنوز ارزیابی‌ای ثبت نشده است.'}
 if(/کلی|وضعیت|خلاصه|کلاس/.test(q))return`<b>خلاصه‌ی کلاس</b><div class="kp"><div><b>${m.rec?fa(m.preT.length+m.latT.length):'—'}</b><span>حاضر امروز</span></div><div><b>${m.rec?fa(m.absT.length):'—'}</b><span>غایب</span></div><div><b>${f1(m.avg)}</b><span>میانگین</span></div></div>`+pl('📅 حضور کل سال',m.att==null?'—':fa(m.att)+'٪')+pl('📝 تکالیف',m.hw==null?'—':fa(m.hw)+'٪')+pl('🚨 نیازمند توجه',fa(m.risk.length)+' نفر');
 return'متوجه نشدم 🤔 از دکمه‌های پایین انتخاب کن یا بنویس: «غایب‌های امروز»، «برنامه امروز»، «آزمون‌های پیش‌رو»، «نیازمند توجه» یا اسم یک دانش‌آموز.'}
function ask(t){t=(t||'').trim();if(!t)return;say(E(t),'u');const ty=say('<i></i><i></i><i></i>','t');
 setTimeout(()=>{ty.remove();let r;try{r=answer(t)}catch(e){console.warn(e);r='یک خطا رخ داد؛ دوباره امتحان کن.'}say(r,'b')},420)}
bot.addEventListener('click',e=>{const ct=e.target.closest('[data-cat]');if(ct){catI=+ct.dataset.cat;chipsUI();return}
 const gb=e.target.closest('[data-go]');if(gb){closeBot();show(gb.dataset.go);return}
 const q=e.target.closest('[data-q]');if(q){ask(q.dataset.q);return}
 if(e.target.id==='eubs'){const i=$('eubi');ask(i.value);i.value='';return}
 const sf=e.target.closest('[data-sf]');if(sf){closeBot();try{show('sf');const sel=$('sfs');if(sel){sel.value=sf.dataset.sf;sel.dispatchEvent(new Event('change',{bubbles:true}))}}catch(x){}return}
 const ac=e.target.closest('[data-eu]');if(ac){closeBot();act(ac.dataset.eu)}});
$('eubi').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ask(e.target.value);e.target.value=''}});
function act(k){if(k==='att')attSheet();else if(k==='sc')scSheet();else if(k==='bot')openBot()}
document.addEventListener('click',e=>{const b=e.target.closest('.euv-tiles [data-eu]');if(b)act(b.dataset.eu)});

/* ───── تب‌های داشبورد مدیر: مقایسه‌ی کلاس‌ها · روند غیبت · هشدار نمرات ───── */
let dmTab='o';
const TABS=[['o','🏫','نمای کلی'],['c','⚖️','مقایسه کلاس‌ها'],['a','🚫','روند غیبت'],['w','⚠️','هشدار نمرات']];
function dmPanel(t){
 const C=(S.classes||[]).filter(c=>!c.demo&&(!window.clsOK||window.clsOK(c.id))),T=tdI();
 const L=c=>c.name||('پایه '+(c.grade||'')+(c.sec?' '+c.sec:''));
 const sm=C.map(c=>({c,s:c.id===S.cur?(c.sum||null):c.sum})).filter(x=>x.s);
 if(!sm.length)return'<div class="em">هنوز آمار کلاسی ذخیره نشده؛ هر کلاس را یک‌بار باز کنید.</div>';
 if(t==='c'){const r=sm.filter(x=>x.s.avg!=null).sort((a,b)=>b.s.avg-a.s.avg);
  return`<b>⚖️ مقایسه‌ی میانگین کلاس‌ها (از ۴)</b>${r.length?r.map(x=>hbar(L(x.c),x.s.avg/4*100,f1(x.s.avg),x.s.avg<2.5?'w':x.s.avg>=3.5?'o':'')).join(''):'<div class="em">میانگینی ثبت نشده</div>'}
  <b style="margin-top:14px">📅 درصد حضور کلاس‌ها</b>${sm.filter(x=>x.s.att!=null).sort((a,b)=>b.s.att-a.s.att).map(x=>hbar(L(x.c),x.s.att,fa(x.s.att)+'٪',x.s.att<85?'w':'o')).join('')||'<div class="em">—</div>'}`}
 if(t==='a'){const r=sm.filter(x=>x.s.d===T).sort((a,b)=>(b.s.ta||0)-(a.s.ta||0));const tot=r.reduce((a,x)=>a+(x.s.ta||0),0);
  const wk=sm.filter(x=>x.s.att!=null).sort((a,b)=>a.s.att-b.s.att);
  return`<b>🚫 غایبین امروز: ${fa(tot)} نفر</b>${r.length?r.map(x=>hbar(L(x.c),Math.min(100,(x.s.ta||0)*12),fa(x.s.ta||0),'w')).join(''):'<div class="em">امروز آمار حضور و غیاب کلاسی به‌روز نشده است</div>'}
  <b style="margin-top:14px">📉 بیشترین غیبت در کل سال (کمترین حضور)</b>${wk.slice(0,6).map(x=>hbar(L(x.c),100-x.s.att,fa(100-x.s.att)+'٪','w')).join('')||'<div class="em">—</div>'}`}
 const r=sm.map(x=>{const s=x.s,w=[];if(s.low)w.push(fa(s.low)+' دانش‌آموز با میانگین زیر ۲٫۵');if(s.dn)w.push(fa(s.dn)+' دانش‌آموز در حال افت');if(s.avg!=null&&s.avg<2.5)w.push('میانگین کلاس '+f1(s.avg));if(s.hw!=null&&s.hw<60)w.push('تکالیف فقط '+fa(s.hw)+'٪');return{x,w,hi:(s.low||0)>=3||(s.avg!=null&&s.avg<2.5)}}).filter(o=>o.w.length).sort((a,b)=>b.hi-a.hi||b.w.length-a.w.length);
 return`<b>⚠️ هشدارهای نمره و پیشرفت</b>${r.length?r.map(o=>`<div class="al ${o.hi?'hi':''}"><div style="font-size:20px">${o.hi?'🚨':'⚠️'}</div><div><b>${E(L(o.x.c))}</b><small>${E(o.w.join(' · '))}</small></div></div>`).join(''):'<div class="em">هشداری وجود ندارد 🌟</div>'}`}
function dmInject(){
 const b=$('dmb');if(!b||$('eu-dmv')||!b.children.length)return;
 const v=document.createElement('div');v.id='eu-dmv';
 v.innerHTML=`<div class="eu-tabs">${TABS.map(t=>`<button type="button" data-t="${t[0]}" class="${t[0]===dmTab?'on':''}"><i>${t[1]}</i>${t[2]}</button>`).join('')}</div><div class="eu-pn" id="eu-pn" style="display:none"></div>`;
 b.prepend(v);dmApply()}
function dmApply(){const b=$('dmb'),pn=$('eu-pn');if(!b||!pn)return;b.classList.toggle('eu-alt',dmTab!=='o');
 document.querySelectorAll('#eu-dmv .eu-tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===dmTab));
 if(dmTab==='o'){pn.style.display='none';pn.innerHTML=''}else{pn.style.display='';pn.innerHTML=dmPanel(dmTab);grow(pn)}}
const dmb=$('dmb');
if(dmb){dmb.addEventListener('click',e=>{const t=e.target.closest('#eu-dmv .eu-tabs button');if(t){dmTab=t.dataset.t;dmApply()}});
 new MutationObserver(()=>{if(!$('eu-dmv'))dmInject()}).observe(dmb,{childList:true});dmInject()}

/* ───── اتصال به چرخه‌ی رندر برنامه ───── */
const _sh=smartHome;smartHome=function(){_sh.apply(this,arguments);try{viz()}catch(e){console.warn('euv',e)}};
try{viz()}catch(e){}
}catch(e){console.warn('etoud-ui',e)}})();

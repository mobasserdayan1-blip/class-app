/* امتیازها و خلاصه‌ی هوشمند صفحه‌ی اصلی */
(function(){
 S.activities=S.activities||[];
 const avg=a=>{a=a.filter(v=>v!=null&&!isNaN(v));return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),r0=v=>v==null?'—':fa(Math.round(v));
 const wm=p=>{const w=p.reduce((s,x)=>s+x[1],0);return w?p.reduce((s,x)=>s+x[0]*x[1],0)/w:null};
 const T=()=>iso(tdy()),dd=k=>new Date(k+'T12:00:00Z'),mon=k=>{const q=jp(dd(k));return q.y*100+q.m},curM=()=>mon(T());
 let per='m',sel=null;const inP=k=>per==='y'||mon(k)===curM();
 const attKeys=id=>Object.keys(S.att||{}).filter(k=>k<=T()&&!(S.closed||{})[k]&&(S.att[k]||{})[id]).sort();
 const attSt=(id,f)=>{let p=0,a=0,l=0;attKeys(id).filter(f||(()=>true)).forEach(k=>{const v=S.att[k][id];v==='p'?p++:v==='a'?a++:l++});const n=p+a+l;return{p,a,l,n,pct:n?(p+l)/n*100:null}};
 const run=(id,key)=>{let n=0;for(const k of attKeys(id).reverse()){if(S.att[k][id]===key)n++;else break}return n};
 const exs=()=>S.exams.slice().sort((a,b)=>a.date.localeCompare(b.date));
 const vals=(id,f)=>exs().filter(f||(()=>true)).map(e=>nrm(e,id)).filter(v=>v!=null);
 const prog=(id,f)=>{const v=vals(id,f);if(v.length<2)return null;const h=Math.floor(v.length/2),b=avg(v.slice(0,h)),a=avg(v.slice(h));return{d:a-b,pct:b?(a-b)/b*100:null}};
 const hw=id=>{let d=0,p=0,n=0;(S.hwl||[]).forEach(h=>{const v=h.st&&h.st[id];v==='d'?d++:v==='p'?p++:v==='n'&&n++});const t=d+p+n;return{pct:t?(d+p*.5)/t*100:null}};
 const acts=(id,f)=>S.activities.filter(x=>x.sid===id&&(!f||f(x.date)));
 const actPts=(id,f)=>acts(id,f).filter(x=>x.type==='positive').reduce((s,x)=>s+(x.points||5),0);
 const effN=id=>acts(id).filter(x=>x.type==='effort'&&!(window.ACTX&&ACTX.isAcad(x.kind))).length;
 const behavior=id=>{const a=attSt(id).pct,h=hw(id).pct,p=[];if(a!=null)p.push([a,.4]);if(h!=null)p.push([h,.4]);if(!p.length)return null;p.push([100-Math.min(60,effN(id)*10),.2]);return wm(p)};
 const maxAct=()=>Math.max(0,...S.students.map(s=>actPts(s.id)));
 const acad=id=>{const e=avg(vals(id));if(e==null)return null;const A=window.ACTX;if(!A)return e;const o=A.oral(id),w=A.cfg().wAcad/100;return o.t>=3&&w>0?e*(1-w)+o.score*w:e};
 const part=id=>window.ACTX?ACTX.partScore(id):null;
 const overall=id=>{const a=acad(id),b=behavior(id),pr=prog(id),m=maxAct(),p=[];if(a!=null)p.push([a/4*100,.4]);if(b!=null)p.push([b,.25]);{const q=part(id);if(q!=null)p.push([q,.15])}if(pr)p.push([clamp(50+pr.d*30),.2]);return p.length?Math.round(wm(p)):null};
 const pgT=pr=>pr&&pr.pct!=null?(pr.pct>=0?'+':'−')+fa(Math.abs(Math.round(pr.pct)))+'٪':'—';
 const BD=[['prog','🥇','نشان پیشرفت','بیشترین رشد'],['att','🏆','نشان حضور','بدون غیبت'],['eff','📚','نشان تلاش','پیشرفت تحصیلی زیاد'],['par','🌟','نشان مشارکت','فعال‌ترین'],['coop','🤝','نشان همکاری','بهترین عملکرد گروهی']];
 function badges(){const st=S.students,B={prog:[],att:[],eff:[],par:[],coop:[]},P=st.map(s=>({s,pr:prog(s.id,e=>inP(e.date))}));
  const top=P.filter(x=>x.pr&&x.pr.d>=.3).sort((a,b)=>b.pr.d-a.pr.d)[0];if(top)B.prog.push(top.s.id);
  P.forEach(x=>{if(x.pr&&x.pr.d>=.5)B.eff.push(x.s.id)});
  st.forEach(s=>{const a=attSt(s.id,inP);if(a.n>=3&&a.a===0)B.att.push(s.id)});
  const by=(f,min)=>{const c=st.map(s=>({id:s.id,n:acts(s.id,inP).filter(x=>x.type==='positive'&&f(x)).length})),m=Math.max(0,...c.map(x=>x.n));return m>=min?c.filter(x=>x.n===m).map(x=>x.id):[]};
  B.par=by(()=>true,2);B.coop=by(x=>x.kind==='فعالیت گروهی'||x.kind==='همکاری با دوستان',1);return B}
 function alerts(){const R=[],st=S.students,t=T(),cm=curM();
  st.forEach(s=>{const id=s.id,n=esc2(s.name),ra=run(id,'a'),rl=run(id,'l'),m=attSt(id,k=>mon(k)===cm);
   if(ra>=2)R.push([ra>=3?1:2,ra>=3?'🔴':'🟠',`${n}: ${fa(ra)} روز متوالی غایب`]);
   if(rl>=2)R.push([2,'🟠',`${n}: ${fa(rl)} تأخیر متوالی`]);else if(m.l>=3)R.push([2,'🟠',`${n}: ${fa(m.l)} تأخیر در این ماه`]);
   if(m.n>=3&&m.pct<85)R.push([m.pct<75?1:2,'⚠️',`حضور ${n} در ماه جاری ${r0(m.pct)}٪ است`]);
   const l10=attKeys(id).slice(-10),a10=l10.filter(k=>S.att[k][id]==='a').length;if(a10>=3&&ra<3)R.push([2,'⚠️',`${n}: ${fa(a10)} غیبت در ${fa(l10.length)} روز اخیر`]);
   S.courses.forEach(c=>{const v=exs().filter(e=>e.course===c.id).map(e=>nrm(e,id)).filter(x=>x!=null).slice(-3);if(v.length===3&&v[0]>v[1]&&v[1]>v[2])R.push([1,'⚠️',`${n} در سه آزمون اخیر «${esc2(c.name)}» روند نزولی داشته است`])})});
  (S.hwl||[]).filter(h=>h.date===t).forEach(h=>{const k=st.filter(s=>h.st&&h.st[s.id]==='n').length;if(k)R.push([2,'⚠️',`${fa(k)} دانش‌آموز تکلیف «${esc2(h.title||'')}» را امروز انجام نداده‌اند`])});
  const P=st.map(s=>({s,p:prog(s.id,e=>mon(e.date)===cm)})).filter(x=>x.p&&x.p.d>=.3).sort((a,b)=>b.p.d-a.p.d)[0];
  if(P)R.push([3,'🌟',`${esc2(P.s.name)} بیشترین پیشرفت ماه را داشته است`]);
  st.forEach(s=>{const A=window.ACTX;if(!A)return;const o=A.oral(s.id),e=avg(vals(s.id));if(e==null||o.t<3)return;const d=o.score-e,n=esc2(s.name);
   if(d>=1)R.push([2,'🟠',`${n}: عملکرد کلاسی (${f1(o.score)} از ۴) از نمره‌ی آزمون‌ها (${f1(e)}) بالاتر است؛ شاید بازآزمایی یا بررسی شرایط آزمون لازم باشد`]);
   else if(d<=-1)R.push([2,'🟠',`${n}: نمره‌ی آزمون‌ها (${f1(e)}) از عملکرد کلاسی (${f1(o.score)} از ۴) بالاتر است؛ تسلط واقعی را بررسی کنید`])});
  try{const A=window.ACTX;if(A&&(S.activities||[]).length){const idle=[];
   st.forEach(s=>{if(run(s.id,'a')>=3)return;const x=A.pstat(s.id);if(!x)return;const n=esc2(s.name);
    if(x.span>=7&&(x.gap==null||x.gap>=8))idle.push([s,x.gap==null?999:x.gap]);
    if(x.span>=28&&x.p>=3&&x.r<=Math.floor(x.p/2))R.push([2,'📉',`${n}: فعالیت کلاسی کاهش یافته (${fa(x.r)} نوبت در ۱۴ روز اخیر، در مقابل ${fa(x.p)} نوبت در ۱۴ روز قبل از آن)`]);
    if((x.o.t>=3&&x.o.mast<=.5)||(x.n3>=3&&x.eff>=2))R.push([2,'🔄',`${n}: در پرسش‌های درسی اخیر بیشتر «نیاز به تمرین» ثبت شده؛ تمرین جبرانی یا آزمون جبرانی پیشنهاد می‌شود`])});
   if(idle.length){idle.sort((a,b)=>b[1]-a[1]);const nm=idle.slice(0,4).map(x=>esc2(x[0].name)).join('، ');
    R.push([2,'🙋',`${fa(idle.length)} دانش‌آموز بیش از ۷ روز است نوبت پرسش یا فعالیت کلاسی نگرفته‌اند (${nm}${idle.length>4?' و …':''}) — در «نوبت امروز» اولویت با آن‌هاست`])}}}catch(e){console.warn('part alerts',e)}
  return R.sort((a,b)=>a[0]-b[0])}
 const alHtml=L=>L.map(x=>`<div class="sc-al p${x[0]}">${x[1]} ${x[2]}</div>`).join('');
 const css=document.createElement('style');css.textContent=`.sc-al{padding:9px 10px;border-radius:12px;margin-top:6px;font-size:14px;background:var(--bg2)}.sc-al.p1{background:#fde1e3;color:#8f1d22}.sc-al.p2{background:#fff1cf;color:#7a4a00}.sc-al.p3{background:#d8f3e3;color:#17653d}
 .sc-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:10px 0}.sc-c{background:var(--bg2);border-radius:16px;padding:12px;text-align:center}.sc-c b{display:block;font-size:22px;margin-top:4px}.sc-c small{color:var(--mut)}
 .sc-c.big{background:linear-gradient(135deg,var(--p),var(--p2));color:#fff}.sc-c.big small{color:#f3eaff}
 .sc-bd{display:inline-block;background:var(--bg2);border-radius:999px;padding:5px 10px;margin:3px;font-size:13px}.sc-row{cursor:pointer}
 nav details{margin:4px 0}nav summary{list-style:none;cursor:pointer;padding:11px 12px;font-weight:800;font-size:14px;color:var(--p);border-radius:12px}nav summary::-webkit-details-marker{display:none}nav summary::after{content:'▾';float:left;opacity:.6}nav details[open] summary::after{content:'▴'}nav details[open]>summary{background:var(--bg2)}nav details button{padding-right:26px;font-weight:600}`;
 document.head.appendChild(css);
 const sec=document.createElement('section');sec.id='sc';sec.innerHTML='<h2>🏆 امتیازها و نشان‌ها</h2><div id="scBody"></div>';$('rep').before(sec);
 if(!pages.some(p=>p[0]==='sc'))pages.push(['sc','🏆 امتیازها و نشان‌ها']);
 let alAll=false;function render(){const root=$('scBody');if(!root)return;const st=S.students;
  if(!st.length){root.innerHTML='<div class="card"><p class="sub">ابتدا دانش‌آموزان را اضافه کنید.</p></div>';return}
  const A=alerts(),B=badges(),mx=maxAct(),nameOf=id=>esc2((st.find(s=>s.id===id)||{}).name||'');
  const rows=st.map(s=>({s,o:overall(s.id),a:acad(s.id),ap:actPts(s.id),b:behavior(s.id),pr:prog(s.id)})).sort((x,y)=>(y.o??-1)-(x.o??-1));
  const mine=id=>BD.filter(b=>B[b[0]].includes(id)).map(b=>b[1]).join('');
  let h=`<div class="card"><b>🔔 هشدارهای هوشمند (${fa(A.length)})</b><p class="sub" style="text-align:right;margin:4px 0 0;font-size:12px">این هشدارها خودکار از حضور و غیاب، آزمون‌ها و تکالیف ثبت‌شده ساخته می‌شوند؛ چیزی جداگانه برای آن‌ها وارد نمی‌کنید و با تغییر داده‌ها خودشان به‌روز می‌شوند. قرمز = فوری، نارنجی = مهم، سبز = خبر خوب.</p>${A.length?alHtml(alAll?A:A.slice(0,5))+(A.length>5?`<button class="sm al-more" data-alm="1">${alAll?'نمایش کمتر':'نمایش همه‌ی '+fa(A.length)+' هشدار'}</button>`:''):'<p class="sub" style="margin:6px 0 0">در حال حاضر هشداری وجود ندارد 👌</p>'}</div>
  <div class="card"><div class="tabs"><button class="${per==='m'?'on':''}" data-per="m">این ماه</button><button class="${per==='y'?'on':''}" data-per="y">کل سال</button></div>
  <b>🎖️ نشان‌ها (${per==='m'?'این ماه':'کل سال'})</b>${BD.map(b=>`<div class="act-it" style="display:flex;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line)"><div style="min-width:130px">${b[1]} <b>${b[2]}</b><small style="display:block;color:var(--mut)">${b[3]}</small></div><div>${B[b[0]].length?B[b[0]].map(id=>`<span class="sc-bd">${nameOf(id)}</span>`).join(''):'<span class="sub">هنوز کسی دریافت نکرده</span>'}</div></div>`).join('')}</div>
  <div class="card"><b>📋 امتیاز دانش‌آموزان (بر پایه‌ی عملکرد کلی)</b><p class="sub" style="margin:4px 0">روی نام بزنید تا جزئیات را ببینید.</p><div class="wrap"><table class="at" style="margin-top:8px"><tr><th class="nm">نام</th><th>🏆 کلی</th><th>📘 تحصیلی</th><th>🌟 فعالیت</th><th>⭐ رفتار</th><th>📈 پیشرفت</th><th>نشان</th></tr>${rows.map(r=>`<tr class="sc-row" data-s="${r.s.id}"><td class="sc-nm" style="text-align:right;word-break:break-word"><b>${esc2(r.s.name)}</b></td><td>${r0(r.o)}</td><td>${r.a==null?'—':f1(r.a)}</td><td>${fa(r.ap)}</td><td>${r0(r.b)}</td><td>${pgT(r.pr)}</td><td>${mine(r.s.id)}</td></tr>`).join('')}</table></div></div>`;
  const s=st.find(x=>x.id===sel);
  if(s){const o=overall(s.id),a=acad(s.id),b=behavior(s.id),pr=prog(s.id),at=attSt(s.id);
   h+=`<div class="card"><b>👤 ${esc2(s.name)}</b><div class="sc-g"><div class="sc-c big"><small>🏆 عملکرد کلی</small><b>${r0(o)}</b></div><div class="sc-c"><small>📘 نمره‌ی تحصیلی (از ۴)</small><b>${a==null?'—':f1(a)}</b></div><div class="sc-c"><small>🌟 امتیاز فعالیت</small><b>${fa(actPts(s.id))}</b></div><div class="sc-c"><small>⭐ امتیاز رفتار</small><b>${r0(b)}</b></div><div class="sc-c"><small>📈 پیشرفت</small><b>${pgT(pr)}</b></div><div class="sc-c"><small>✅ درصد حضور</small><b>${at.pct==null?'—':r0(at.pct)+'٪'}</b></div></div>
   <b style="font-size:14px">نمره‌ی تحصیلی به تفکیک درس</b>${S.courses.map(c=>{const v=avg(vals(s.id,e=>e.course===c.id));return v==null?'':`<div class="act-it" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--line)"><span>${esc2(c.name)}</span><b>${f1(v)}</b></div>`}).join('')||'<p class="sub">هنوز آزمونی ثبت نشده.</p>'}
   <p style="margin:10px 0 0">${mine(s.id)?'نشان‌ها: '+BD.filter(x=>B[x[0]].includes(s.id)).map(x=>`<span class="sc-bd">${x[1]} ${x[2]}</span>`).join(''):'<span class="sub">در این بازه نشانی ندارد.</span>'}</p>${effN(s.id)?`<p class="sub">💪 ${fa(effN(s.id))} مورد «نیاز به تلاش بیشتر» ثبت شده است.</p>`:''}</div>`}
  h+=`<div class="card"><b>ℹ️ روش محاسبه</b><p class="sub" style="line-height:1.9;margin:6px 0 0">نمره‌ی تحصیلی از آزمون‌ها می‌آید و اگر دست‌کم ۳ پرسش شفاهی درسی (پاسخ به سؤال، حل مسئله روی تخته، ارائه) ثبت شده باشد، سهمی از «ارزشیابی مستمر» هم دارد (پیش‌فرض ۳۰٪، قابل تنظیم در صفحه‌ی فعالیت کلاسی؛ مسلط = ۴، نیاز به تمرین = ۲). امتیاز فعالیت (نمایشی): هر فعالیت مثبت ۵ امتیاز و ۲ امتیاز اضافه برای نوبت داوطلبانه. سهم فعالیت در عملکرد کلی بر پایه‌ی «هدف نوبت هفتگی» است، نه مقایسه با بقیه (غیبت از هدف کم می‌کند). «نیاز به تلاش» فقط در فعالیت‌های رفتاری از امتیاز رفتار کم می‌کند؛ «نیاز به تمرین» در پرسش‌های درسی جریمه‌ای ندارد. امتیاز رفتار از ۱۰۰: حضور ۴۰٪، تکالیف ۴۰٪ و تعداد موارد «نیاز به تلاش» ۲۰٪. پیشرفت: مقایسه‌ی نیمه‌ی دوم نمرات با نیمه‌ی اول. عملکرد کلی از ۱۰۰: نمره‌ی تحصیلی ۴۰٪، رفتار ۲۵٪، پیشرفت ۲۰٪، فعالیت ۱۵٪. اگر داده‌ای برای بخشی نباشد، سهم آن بین بقیه تقسیم می‌شود.</p></div>`;
  root.innerHTML=h}
 sec.addEventListener('click',e=>{if(e.target.closest('[data-alm]')){alAll=!alAll;render();return}const p=e.target.closest('[data-per]');if(p){per=p.dataset.per;render();return}const r=e.target.closest('[data-s]');if(r){sel=+r.dataset.s;render();$('scBody').children[3]&&$('scBody').children[3].scrollIntoView({behavior:'smooth'})}});
 window.SCX={avg,vals,prog,attSt,run,attKeys,mon,hw,acts,effN,alerts,BD,overall,behavior,actPts,acad,badgesY:()=>{const o=per;per='y';const b=badges();per=o;return b}};window.renderSc=render;
 const _sh=window.smartHome;window.smartHome=function(){_sh&&_sh.apply(this,arguments);try{const box=$('smart'),R=alerts().slice(0,4);if(box&&S.students.length&&R.length)box.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:12px"><b>🔔 هشدارهای هوشمند</b>${alHtml(R)}<button class="sm" style="margin-top:8px" onclick="show('sc')">دیدن همه‌ی هشدارها و امتیازها ‹</button></div>`)}catch(e){}};
 const GR=[['📅 کار روزانه',['att','act']],['📚 درس و ارزشیابی',['crs','mk']],['🏆 امتیاز و تشویق',['sc','teams','draw']],['📊 گزارش‌ها',['sf','rep','mr','mgr']],['⚙️ تنظیمات',['set','cls','bk','prof','edit']]];
 const mk=id=>{let b=nav.querySelector(`[data-p="${id}"]`);if(!b){const q=pages.find(x=>x[0]===id);b=document.createElement('button');b.textContent=q[1];b.dataset.p=id;b.onclick=()=>show(id)}return b};
 const bt={};pages.forEach(p=>bt[p[0]]=mk(p[0]));nav.innerHTML='';nav.appendChild(bt.home);nav.appendChild(bt.dm);
 GR.forEach(([t,ids])=>{const d=document.createElement('details'),s=document.createElement('summary');s.textContent=t;d.appendChild(s);ids.forEach(i=>d.appendChild(bt[i]));nav.appendChild(d)});
 const _show=window.show;window.show=function(id){_show(id);nav.querySelectorAll('details').forEach(d=>{d.open=!!d.querySelector(`[data-p="${id}"]`)});if(id==='sc')render()};
})();

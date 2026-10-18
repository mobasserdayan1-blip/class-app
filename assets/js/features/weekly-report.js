/* گزارش هفتگی */
(function(){try{
const $=id=>document.getElementById(id),q=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const D=k=>new Date(k+'T12:00:00Z'),addD=(k,n)=>{const d=D(k);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const wkS=k=>addD(k,-((D(k).getUTCDay()+1)%7)); /* هفته از شنبه شروع می‌شود */
const TD=()=>iso(tdy()),dl=k=>fmt(D(k)),CP=new Set(['حسین','رضا','محمد','علی','مهدی','حسن','عباس','امین','جواد','صالح','طاها','سینا','پارسا','هادی','مجتبی','کیان','آرین','یاسین','مبین','فرشاد','زهرا','فاطمه','سادات','سلطان','الدین','الله','اله']),first=s=>{const w=String(s.name||'').trim().split(/\s+/);return w.length>2&&CP.has(w[1])?w[0]+w[1]:w[0]},callN=s=>first(s)+' جان';
const lastTurn=id=>(S.activities||[]).reduce((m,x)=>x.sid===id&&x.date>m?x.date:m,'');
const join=a=>a.length<2?a.join(''):a.slice(0,-1).join('، ')+' و '+a[a.length-1];
const sty=document.createElement('style');sty.textContent='.pmc{padding:0;overflow:hidden}.pmc .pmh{margin:0;padding:12px;cursor:pointer;user-select:none}.pmh i{font-style:normal;transition:transform .3s}.pmc.open .pmh i{transform:rotate(180deg)}.pmb{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease}.pmc.open .pmb{grid-template-rows:1fr}.pmb>div{overflow:hidden;min-height:0}.pmb>div>div{padding:0 12px 12px}.pmx{width:100%;border:2px solid var(--line);border-radius:12px;padding:10px;font:inherit;font-size:14px;line-height:1.9;background:var(--card);color:var(--tx);resize:vertical}.pmr{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:6px;margin-top:8px}.pmh{display:flex;align-items:center;gap:8px;margin-bottom:8px}.pmh b{flex:1;min-width:0}.pmt{font-size:12px;border-radius:10px;padding:3px 9px;color:#fff;font-weight:700}.wrh{font-weight:800;color:var(--p);margin:14px 0 6px}.wrl{display:flex;justify-content:space-between;gap:8px;padding:6px 2px;border-bottom:1px solid var(--line);font-size:14px}.wrl small{color:var(--mut)}#wrBn{cursor:pointer;border-right:5px solid var(--wa);font-weight:700}';document.head.appendChild(sty);

function stat(id,a,b){
 const days=Object.keys(S.att||{}).filter(k=>k>=a&&k<=b&&!(S.closed||{})[k]&&Object.keys(S.att[k]||{}).length);
 let p=0,ab=0,l=0;days.forEach(k=>{const v=(S.att[k]||{})[id];if(v==='a')ab++;else if(v==='l'){l++;p++}else if(v==='p')p++});
 const A=(S.activities||[]).filter(x=>x.sid===id&&x.date>=a&&x.date<=b);
 const pos=A.filter(x=>x.type==='positive').length,eff=A.filter(x=>x.type==='effort').length;
 let hd=0,hp=0,hn=0;(S.hwl||[]).forEach(h=>{if(h.date>=a&&h.date<=b){const v=(h.st||{})[id];if(v==='d')hd++;else if(v==='p')hp++;else if(v==='n')hn++}});
 const vs=(S.exams||[]).filter(e=>e.date>=a&&e.date<=b).map(e=>nrm(e,id)).filter(nn);
 return{days:days.length,p,ab,l,pos,eff,hd,hp,hn,nA:A.length,avg:vs.length?mean(vs):null}}

const TONE={t:['🌟 تشویق','#1a8f55'],w:['⚠️ نگرانی','#d97706'],n:['📝 گزارش کوتاه','#7e57c2']};
let N=30,filt='all',ov={},ed={},openId=null;
function judge(id){const b=TD(),a=addD(b,-(N-1)),x=stat(id,a,b),y=stat(id,addD(a,-N),addD(a,-1)),d=x.avg!=null&&y.avg!=null?x.avg-y.avg:null,th=N>14?3:2,C=[],P=[];
 if(x.ab>=th)C.push(fa(x.ab)+' روز غیبت در این بازه ثبت شده است');
 if(x.hn>=2)C.push(fa(x.hn)+' تکلیف انجام‌نشده داشته‌اند');
 if(x.avg!=null&&x.avg<2.5)C.push('در ارزیابی‌های اخیر به تمرین و تقویت بیشتری نیاز دارند');
 if(x.eff>=2&&x.eff>x.pos)C.push('در فعالیت‌های کلاسی به تلاش و تمرین بیشتری نیاز دارند');
 if(d!=null&&d<=-.5)C.push('نمرات نسبت به دوره‌ی قبل کمی کاهش داشته است');
 if(x.ab===0&&x.days>=3)P.push('در این مدت هیچ غیبتی نداشته‌اند');
 if(x.pos>=2&&x.pos>=x.eff)P.push(fa(x.pos)+' بار در فعالیت‌های کلاسی عملکرد مثبت داشته‌اند');
 if(x.avg!=null&&x.avg>=3.5)P.push('نتایج ارزیابی‌ها عالی بوده است');
 if(d!=null&&d>=.3)P.push('نسبت به دوره‌ی قبل پیشرفت قابل توجهی در نمرات دیده می‌شود');
 if(x.hd>=3&&x.hn===0)P.push('تکالیف را به‌طور منظم انجام داده‌اند');
 return{k:C.length?'w':P.length?'t':'n',C,P,x}}
function draft(s,k){const J=judge(s.id),nm=first(s),tc=(S.prof||{}).teacher,end='\nبا تشکر و احترام'+(tc?'\n'+tc:''),hi='سلام و احترام؛ اولیای محترم دانش‌آموز، '+callN(s)+'،\n';
 if(k==='t'){const P=J.P.length?J.P:['حضور و مشارکت مناسبی در کلاس داشته‌اند'];return hi+'خوشحالم که گزارش خوبی از '+nm+' دارم: '+join(P)+'. از تلاش ایشان و همراهی شما سپاسگزارم و امیدوارم این روند ادامه پیدا کند.'+end}
 if(k==='w'){const C=J.C.length?J.C:['به پیگیری بیشتری نیاز است'];return hi+'می‌خواستم درباره‌ی وضعیت اخیر '+nm+' با شما هماهنگ باشم تا با همکاری هم بتوانیم کمک بیشتری به ایشان بکنیم. '+(J.P.length?'نکات مثبتی هم وجود دارد؛ '+join(J.P)+'. ':'')+(J.P.length?'در عین حال ':'بر اساس ثبت‌های کلاس، ')+join(C)+'. اگر نکته‌ای هست که لازم است من بدانم یا فرصتی برای گفت‌وگو دارید، خوشحال می‌شوم هماهنگ کنیم.'+end}
 const x=J.x,r=[];if(x.days)r.push('در '+fa(x.days)+' روز کلاسی، '+fa(x.p)+' روز حاضر بوده‌اند');if(x.nA)r.push(fa(x.nA)+' فعالیت کلاسی ثبت شده است');if(x.avg!=null)r.push('میانگین ارزیابی‌ها '+fa((Math.round(x.avg*10)/10).toString().replace('.','٫'))+' از ۴ است');
 return hi+'گزارش کوتاهی از وضعیت '+nm+' در این بازه خدمتتان ارسال می‌کنم: '+(r.length?join(r):'اطلاعات کافی ثبت نشده است')+'. در صورت نیاز، آماده‌ی گفت‌وگو هستم.'+end}
const latin=s=>String(s||'').replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g,'');
const intl=s=>{let d=latin(s);if(d.slice(0,2)==='00')d=d.slice(2);else if(d[0]==='0')d='98'+d.slice(1);else if(d.length===10&&d[0]==='9')d='98'+d;return d.length>=11?d:''};
function renderPm(){const box=$('pm_l');if(!box)return;
 if(!S.students.length){box.innerHTML='<div class="card"><p class="sub">ابتدا دانش‌آموزان را اضافه کنید.</p></div>';return}
 const L=S.students.map(s=>{const J=judge(s.id);return{s,J,k:ov[s.id]||J.k}}).filter(r=>filt==='all'||r.J.k===filt);
 const cnt=k=>S.students.filter(s=>judge(s.id).k===k).length;
 $('pm_f').innerHTML=[['all','همه ('+fa(S.students.length)+')'],['w','⚠️ نگرانی ('+fa(cnt('w'))+')'],['t','🌟 تشویق ('+fa(cnt('t'))+')']].map(x=>`<button data-f="${x[0]}" class="${filt===x[0]?'on':''}">${x[1]}</button>`).join('');
 box.innerHTML=L.length?L.map(({s,k})=>{const I=(S.info||{})[s.id]||{},f=intl(I.fp),m=intl(I.mp);if(ed[s.id]==null||ed[s.id].k!==k)ed[s.id]={k,t:draft(s,k)};
  const fx=intl(I.gp),P=[['پدر',f],['مادر',m],['قیم',fx]].filter(x=>x[1]),d1=P[0];
   return`<div class="card pmc${openId===s.id?' open':''}" data-sid="${s.id}"><div class="pmh" data-tg="1"><b>${q(s.name)}</b><span class="pmt" style="background:${TONE[k][1]}">${TONE[k][0]}</span><i>▾</i></div>
   <div class="pmb"><div><div><div class="tb2">${['t','w','n'].map(t=>`<button data-tn="${t}" class="${k===t?'on':''}">${TONE[t][0]}</button>`).join('')}</div>
   <textarea class="pmx" rows="7">${q(ed[s.id].t)}</textarea>
   <div class="pmr"><button class="sm" data-a="cp">📋 کپی</button>${d1?'<button class="sm" data-a="sm" data-n="'+d1[1]+'">✉️ ارسال پیامک ('+d1[0]+')</button>':''}</div>
   ${P.length?'<div class="pmr">'+P.map(x=>'<button class="sm" data-a="wa" data-n="'+x[1]+'">💬 واتساپ '+x[0]+'</button>'+(x!==d1?'<button class="sm" data-a="sm" data-n="'+x[1]+'">✉️ پیامک '+x[0]+'</button>':'')).join('')+'</div>':'<p class="sub" style="margin:6px 0 0;text-align:right">شماره‌ی پدر، مادر یا قیم در پرونده‌ی دانش‌آموز ثبت نشده؛ فقط «کپی» در دسترس است.</p>'}</div></div></div></div>`}).join(''):'<div class="card"><p class="sub">موردی با این فیلتر وجود ندارد 🌟</p></div>'}
function pmInit(){
 const sec=document.createElement('section');sec.id='pm';
 sec.innerHTML='<h2>💬 پیام به اولیا</h2><div class="card"><p class="sub" style="text-align:right">برای هر دانش‌آموز، از روی حضور، تکلیف، نمره و فعالیت کلاسی یک پیش‌نویس مؤدبانه ساخته می‌شود. پیش از ارسال می‌توانید متن را ویرایش کنید.</p><select id="pm_w" class="fs"><option value="7">بازه‌ی ۷ روز اخیر</option><option value="14">بازه‌ی ۱۴ روز اخیر</option><option value="30" selected>بازه‌ی ۳۰ روز اخیر</option></select><div class="tb2" id="pm_f"></div></div><div id="pm_l"></div>';
 $('rep').before(sec);
 sec.addEventListener('change',e=>{if(e.target.id==='pm_w'){N=+e.target.value;ov={};ed={};renderPm()}});
 sec.addEventListener('input',e=>{const c=e.target.closest('[data-sid]');if(c&&e.target.classList.contains('pmx')&&ed[c.dataset.sid])ed[c.dataset.sid].t=e.target.value});
 sec.addEventListener('click',e=>{const f=e.target.closest('[data-f]');if(f){filt=f.dataset.f;renderPm();return}
  const c=e.target.closest('[data-sid]');if(!c)return;const id=+c.dataset.sid,ta=c.querySelector('textarea'),t=e.target.closest('[data-tn]');
   if(e.target.closest('[data-tg]')){const was=c.classList.contains('open');sec.querySelectorAll('.pmc.open').forEach(x=>x.classList.remove('open'));openId=was?null:id;if(!was)c.classList.add('open');return}
  if(t){ov[id]=t.dataset.tn;ed[id]=null;renderPm();return}
  const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,txt=ta.value;
  if(a==='cp'){const ok=()=>{b.textContent='✅ کپی شد';setTimeout(()=>b.textContent='📋 کپی',1500)};try{navigator.clipboard.writeText(txt).then(ok,()=>{ta.select();document.execCommand('copy');ok()})}catch(x){ta.select();try{document.execCommand('copy');ok()}catch(y){}}}
  else if(a==='wa')window.open('https://wa.me/'+b.dataset.n+'?text='+encodeURIComponent(txt),'_blank');
  else if(a==='sm')location.href='sms:+'+b.dataset.n+'?&body='+encodeURIComponent(txt)})}

const cName=id=>{const c=(S.courses||[]).find(x=>x.id===id);return c?c.name:''};
const exName=e=>{const c=(S.courses||[]).find(x=>x.id===e.course);let t='';if(c&&e.tp)for(const h of(c.ch||[]))for(const p of(h.tp||[]))if(p.id===e.tp)t=p.name;return(c?c.name:'آزمون')+(t?' ← '+t:e.title?' — '+e.title:'')};
function weekData(a){const b=addD(a,6),st=S.students||[],X=st.map(s=>({s,x:stat(s.id,a,b)})),days=X.length?X[0].x.days:0;
 let ap=0,at=0;X.forEach(r=>{at+=r.x.p+r.x.ab;ap+=r.x.p});
 const noTurn=X.filter(r=>r.x.nA===0&&!(days&&r.x.ab===days)).map(r=>({s:r.s,last:lastTurn(r.s.id)}));
 const abs=X.filter(r=>r.x.ab>=2||r.x.l>=3).sort((u,v)=>v.x.ab-u.x.ab).map(r=>({s:r.s,ab:r.x.ab,l:r.x.l}));
 const hw=X.filter(r=>r.x.hn>=2).sort((u,v)=>v.x.hn-u.x.hn).map(r=>({s:r.s,n:r.x.hn}));
 const stars=X.filter(r=>r.x.pos>=2&&r.x.pos>r.x.eff).sort((u,v)=>v.x.pos-u.x.pos).map(r=>({s:r.s,n:r.x.pos}));
 const G={};(S.exams||[]).filter(e=>e.date>=a&&e.date<=b).forEach(e=>{const k=e.course+'|'+(e.tp||e.title||e.id),v=st.map(s=>nrm(e,s.id)).filter(nn);if(!v.length)return;const g=G[k]=G[k]||{name:exName(e),v:[]};g.v.push(...v)});
 const weak=Object.values(G).map(g=>({name:g.name,pct:Math.round(mean(g.v)/4*100),low:g.v.filter(z=>z<2).length,n:g.v.length})).sort((u,v)=>u.pct-v.pct);
 const T2={};(S.activities||[]).filter(x=>x.date>=a&&x.date<=b&&x.course).forEach(x=>{const k=x.tl||cName(x.course),g=T2[k]=T2[k]||{name:k,p:0,e:0};x.type==='effort'?g.e++:g.p++});
 const eff=Object.values(T2).filter(g=>g.e>=2&&g.e>=g.p).sort((u,v)=>v.e-u.e);
 return{a,b,days,att:at?Math.round(ap/at*100):null,noTurn,abs,hw,stars,weak,eff,nAct:(S.activities||[]).filter(x=>x.date>=a&&x.date<=b).length}}
function wrText(W){const L=['📅 گزارش هفتگی کلاس ('+dl(W.a)+' تا '+dl(W.b)+')',''];
 L.push('حضور کلاس: '+(W.att==null?'ثبت نشده':fa(W.att)+'٪')+' · روزهای ثبت‌شده: '+fa(W.days)+' · فعالیت‌های کلاسی: '+fa(W.nAct));
 L.push('','🎯 نوبت نگرفتند ('+fa(W.noTurn.length)+'): '+(W.noTurn.map(r=>r.s.name).join('، ')||'همه نوبت گرفتند'));
 L.push('','⏰ غیبت/تأخیر زیاد ('+fa(W.abs.length)+'): '+(W.abs.map(r=>r.s.name+' ('+fa(r.ab)+' غیبت'+(r.l>=3?'، '+fa(r.l)+' تأخیر':'')+')').join('، ')||'موردی نیست'));
 L.push('','📉 مباحث ضعیف: '+(W.weak.filter(w=>w.pct<70).map(w=>w.name+' ('+fa(w.pct)+'٪)').concat(W.eff.map(g=>g.name+' (نیاز به تمرین در فعالیت کلاسی)')).join('، ')||'موردی نیست'));
 if(W.hw.length)L.push('','📝 تکالیف انجام‌نشده: '+W.hw.map(r=>r.s.name+' ('+fa(r.n)+')').join('، '));
 return L.join('\n')}
const row=(l,r)=>`<div class="wrl"><span>${l}</span><small>${r||''}</small></div>`,none='<p class="sub" style="margin:4px 0">موردی نیست 🌟</p>';
let wrA=null;
function renderWr(){const body=$('wr_b');if(!body)return;const t0=wkS(TD()),sel=$('wr_w');
 if(!sel.options.length){for(let i=0;i<8;i++){const k=addD(t0,-7*i),o=document.createElement('option');o.value=k;o.textContent=(i?'':'این هفته: ')+dl(k)+' تا '+dl(addD(k,6));sel.appendChild(o)}}
 if(!wrA)wrA=t0;sel.value=wrA;const W=weekData(wrA);
 if(wrA===t0){S.wrSeen=t0;try{save()}catch(e){}wrBanner()}
 const bar=p=>`<div style="background:var(--bg2);border-radius:8px;height:8px;margin-top:4px"><div style="width:${p}%;height:8px;border-radius:8px;background:${p>=80?'#2eaf6b':p>=60?'#f59e0b':'#e5484d'}"></div></div>`;
 body.innerHTML=`<div class="card"><div class="stats"><div class="st" style="--c:#16a085"><b>${W.att==null?'—':fa(W.att)+'٪'}</b><span>حضور کلاس</span></div><div class="st" style="--c:#7e57c2"><b>${fa(W.nAct)}</b><span>فعالیت کلاسی</span></div></div></div>
 <div class="card"><div class="wrh">🎯 نوبت نگرفتند (${fa(W.noTurn.length)})</div>${W.noTurn.map(r=>row(q(r.s.name),r.last?'آخرین نوبت: '+dl(r.last):'تاکنون نوبتی ثبت نشده')).join('')||none}
 <div class="wrh">⏰ غیبت یا تأخیر زیاد (${fa(W.abs.length)})</div>${W.abs.map(r=>row(q(r.s.name),(r.ab?fa(r.ab)+' غیبت':'')+(r.ab&&r.l>=3?' · ':'')+(r.l>=3?fa(r.l)+' تأخیر':''))).join('')||none}
 <div class="wrh">📉 مباحث ضعیف</div>${W.weak.length?W.weak.map(w=>`<div style="margin:6px 0;font-size:14px"><div style="display:flex;justify-content:space-between;gap:8px"><span>${q(w.name)}</span><b>${fa(w.pct)}٪</b></div>${bar(w.pct)}<small style="color:var(--mut)">${fa(w.low)} از ${fa(w.n)} نمره زیر ۵۰٪</small></div>`).join(''):'<p class="sub" style="margin:4px 0">این هفته آزمونی ثبت نشده است.</p>'}
 ${W.eff.length?'<div class="sub" style="text-align:right;margin:8px 0 2px">از فعالیت‌های کلاسی:</div>'+W.eff.map(g=>row(q(g.name),fa(g.e)+' ثبت «نیاز به تمرین»')).join(''):''}
 <div class="wrh">📝 تکالیف انجام‌نشده (${fa(W.hw.length)})</div>${W.hw.map(r=>row(q(r.s.name),fa(r.n)+' تکلیف')).join('')||none}
 <div class="wrh">🌟 ستاره‌های هفته</div>${W.stars.map(r=>row(q(r.s.name),fa(r.n)+' فعالیت مثبت')).join('')||'<p class="sub" style="margin:4px 0">—</p>'}</div>
 <div class="card"><div class="pmr"><button class="sm" data-a="cp">📋 کپی خلاصه</button>${navigator.share?'<button class="sm" data-a="sh">📤 اشتراک‌گذاری</button>':''}</div></div>`;
 body._t=wrText(W)}
function wrBanner(){const hm=$('home');if(!hm)return;let b=$('wrBn');const t0=wkS(TD()),dow=D(TD()).getUTCDay(),want=(dow===4||dow===5)&&S.wrSeen!==t0&&(S.students||[]).length;
 if(!want){if(b)b.remove();return}
 const W=weekData(t0);if(!b){b=document.createElement('div');b.id='wrBn';b.className='card';b.onclick=()=>show('wr');const h=hm.querySelector('h2');h?h.after(b):hm.prepend(b)}
 b.innerHTML='📅 گزارش هفتگی آماده است<br><span class="sub" style="display:block;text-align:right;margin:4px 0 0">'+fa(W.noTurn.length)+' نفر نوبت نگرفتند · '+fa(W.abs.length)+' نفر غیبت/تأخیر زیاد · برای دیدن جزئیات بزنید</span>'}
function wrInit(){
 const sec=document.createElement('section');sec.id='wr';
 sec.innerHTML='<h2>📅 گزارش هفتگی</h2><div class="card"><p class="sub" style="text-align:right">خلاصه‌ی هفته: چه کسانی نوبت نگرفتند، چه کسانی غیبت زیاد داشتند و کدام مبحث ضعیف بود. پنجشنبه‌ها یادآوری در صفحه‌ی اصلی نمایش داده می‌شود.</p><select id="wr_w" class="fs"></select></div><div id="wr_b"></div>';
 $('rep').before(sec);
 sec.addEventListener('change',e=>{if(e.target.id==='wr_w'){wrA=e.target.value;renderWr()}});
 sec.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const t=$('wr_b')._t||'';
  if(b.dataset.a==='sh'){try{navigator.share({text:t})}catch(x){}return}
  const ok=()=>{b.textContent='✅ کپی شد';setTimeout(()=>b.textContent='📋 کپی خلاصه',1500)},ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{navigator.clipboard.writeText(t).then(ok,()=>{document.execCommand('copy');ok()})}catch(x){try{document.execCommand('copy');ok()}catch(y){}}ta.remove()})}
pmInit();wrInit();
if(typeof pages!=='undefined'){pages.push(['pm','💬 پیام به اولیا'],['wr','📅 گزارش هفتگی'])}
const o=window.show;window.show=function(id){const r=o.apply(this,arguments);try{if(id==='pm')renderPm();else if(id==='wr'){wrA=null;renderWr()}else if(id==='home')wrBanner()}catch(e){console.warn('chg8',e)}return r};
try{wrBanner()}catch(e){}
}catch(e){console.error('chg8',e)}})();

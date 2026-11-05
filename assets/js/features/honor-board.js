/* 🏅 تابلوی برترین‌ها — سه نفر برتر هر هفته و هر ماه، نسبت به عملکرد قبلیِ خودِ هر دانش‌آموز
   - فقط می‌خواند؛ هیچ داده‌ای در S نمی‌نویسد (منبع: S.dj.m + S.dj.ses، S.exams، S.att). با ورود داده‌ی جدید، هنگام باز کردن صفحه خودکار به‌روز می‌شود.
   - قواعد مثل میانگین خود برنامه: هر ثبت ۴سطحی/مثبت‌ومنفی دفتر و هر نمره‌ی آزمون (نسبت به بیشینه، مقیاس ۱ تا ۴) یک رویداد؛
     روز غیبت شمرده نمی‌شود؛ «انجام شد/نشد» (تکلیف) جزو امتیاز نیست.
   - برای حذف کامل ویژگی: این فایل را از assets/js/boot/modules.js و sw.js بردارید. */
(function(){try{
if(window.__hbLoaded)return;window.__hbLoaded=1;
const MIN=2,BMIN=3,KINDS=['eval','act','exam'],KL={eval:'ارزشیابی',act:'فعالیت',exam:'آزمون'};
const MN=['','فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const f1=v=>v==null?'—':fa((Math.round(v*10)/10).toFixed(1).replace('.','٫'));
const sg=v=>(v>0?'+':v<0?'−':'')+f1(Math.abs(v));
const dt=k=>new Date(k+'T12:00:00Z'),addD=(k,n)=>{const d=dt(k);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const wkS=k=>addD(k,-((dt(k).getUTCDay()+1)%7)); /* شنبه */
const todayIso=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)};
const SS=()=>typeof S!=='undefined'?S:(window.S||{});
const jm=k=>{const p=window.JDate.toJ(k);return{y:p.y,m:p.m}};
const jl=k=>{const p=window.JDate.toJ(k);return fa(p.d)+' '+MN[p.m]};

/* ───── ۱) رویدادها از داده‌ی زنده ───── */
function events(){
 const out=[],S_=SS(),sts=S_.students||[],ids=new Set(sts.map(s=>String(s.id))),att=S_.att||{},dj=S_.dj||{},ses=dj.ses||{};
 const abs=(k,id)=>(att[k]||{})[id]==='a';
 Object.keys(dj.m||{}).forEach(key=>{const p=key.split('|');if(p.length!==3)return;const se=ses[p[0]+'|'+p[1]],it=se&&(se.it||{})[p[2]];if(!it||it.t==='d')return;
  const marks=dj.m[key]||{};Object.keys(marks).forEach(sid=>{const v=marks[sid];if(!ids.has(String(sid))||!(v>=1&&v<=4)||abs(p[0],sid))return;
   out.push({k:p[0],sid:String(sid),c:String(se.c),v:+v,t:it.cg==='ارزشیابی'?'eval':'act'})})});
 (S_.exams||[]).forEach(e=>sts.forEach(s=>{let v=null;try{v=typeof nrm==='function'?nrm(e,s.id):(abs(e.date,s.id)?null:(e.scores[s.id]==null?null:e.scores[s.id]/e.max*4))}catch(x){}
  if(v!=null&&!isNaN(v))out.push({k:e.date,sid:String(s.id),c:String(e.course),v:v,t:'exam'})}));
 return out}
function agg(rows){if(!rows.length)return null;const o={n:rows.length,a:rows.reduce((s,r)=>s+r.v,0)/rows.length,k:{}};
 KINDS.forEach(t=>{const r=rows.filter(x=>x.t===t);if(r.length)o.k[t]={n:r.length,a:r.reduce((s,x)=>s+x.v,0)/r.length}});return o}

/* ───── ۲) دوره‌ها (هفته از شنبه، ماه شمسی) ───── */
function periods(ev){
 const wk=new Map(),mo=new Map(),T=todayIso();
 ev.forEach(e=>{const w=wkS(e.k);if(!wk.has(w))wk.set(w,[]);wk.get(w).push(e);const m=jm(e.k),mk=m.y*100+m.m;if(!mo.has(mk))mo.set(mk,{y:m.y,m:m.m,r:[]});mo.get(mk).r.push(e)});
 const mk=(type,label,from,to,rows)=>{const days=[...new Set(rows.map(r=>r.k))].sort(),S={};
  const by={};rows.forEach(r=>{(by[r.sid]=by[r.sid]||[]).push(r)});
  Object.keys(by).forEach(sid=>{const base=ev.filter(r=>r.sid===sid&&r.k<from);S[sid]={c:agg(by[sid]),b:base.length?{n:base.length,a:agg(base).a}:null}});
  return{type,label,from,to,days:days.length,first:days[0],last:days[days.length-1],S,n:rows.length,ca:agg(rows).a,live:T>=from&&T<=to}};
 const W=[...wk.keys()].sort().map((w,i)=>mk('w','هفته‌ی '+fa(i+1),w,addD(w,6),wk.get(w)));
 const M=[...mo.values()].sort((a,b)=>a.y*100+a.m-b.y*100-b.m).map(o=>mk('m',MN[o.m]+' '+fa(o.y),window.JDate.toIso(o.y,o.m,1),window.JDate.toIso(o.y,o.m,window.JDate.monthLen(o.y,o.m)),o.r));
 return{W,M}}

/* ───── ۳) رتبه‌بندی ───── */
function rank(P,mode){const L=[];Object.keys(P.S).forEach(sid=>{const x=P.S[sid],c=x.c;if(!c||c.n<MIN)return;
  const hasB=x.b&&x.b.n>=BMIN,dl=hasB?c.a-x.b.a:null;
  const sc=mode==='abs'?c.a:mode==='gro'?dl:0.6*c.a/4*100+0.4*Math.min(100,Math.max(0,50+(dl||0)/1.5*50));
  if(sc==null)return;L.push({sid,n:c.n,a:c.a,dl,sc,c,hasB})});
 const nm=sid=>{const s=(SS().students||[]).find(x=>String(x.id)===sid);return s?s.name:''};
 return L.sort((p,q)=>q.sc-p.sc||q.n-p.n||nm(p.sid).localeCompare(nm(q.sid),'fa'))}
window.HB={events,periods,rank,agg,MIN,BMIN};

/* ───── ۴) رابط کاربری ───── */
const $=id=>document.getElementById(id);
if(typeof document==='undefined'||!$('nav'))return;
let mode='mix',showAll=false;try{mode=localStorage.getItem('cl_hb_mode')||'mix'}catch(x){}
const MODES=[['mix','ترکیبی'],['abs','سطح عملکرد'],['gro','پیشرفت نسبت به خود']];
const HINT={mix:'ترکیبی: ۶۰٪ سطح عملکرد آن دوره + ۴۰٪ پیشرفت نسبت به میانگین خود دانش‌آموز پیش از آن دوره.',abs:'سطح عملکرد: فقط میانگین سطح (از ۴) در ارزشیابی، فعالیت و آزمونِ همان دوره.',gro:'پیشرفت: فقط اختلاف میانگین آن دوره با میانگین قبلیِ خود دانش‌آموز؛ کسی که ثبتِ قبلی ندارد رتبه نمی‌گیرد.'};
const COL=['','#e0a100','#8d99ae','#b5651d'];
const stu=sid=>(SS().students||[]).find(s=>String(s.id)===String(sid))||{name:'—'};
const av=(sid,sz)=>{const s=stu(sid);try{if(typeof window.stAv==='function')return window.stAv(s,sz)}catch(x){}return'<span class="hb-av" style="width:'+sz+'px;height:'+sz+'px">'+E((s.name||'?').trim()[0])+'</span>'};
const chip=r=>r.dl==null?'<span class="hb-dl z">بدون مبنای قبلی</span>':'<span class="hb-dl '+(r.dl>0.05?'u':r.dl<-0.05?'d':'z')+'">'+(r.dl>0.05?'▲':r.dl<-0.05?'▼':'●')+' '+sg(r.dl)+' نسبت به خود</span>';
const live=p=>p.live?'<span class="hb-live">در جریان — موقت</span>':'';
const css=document.createElement('style');css.textContent=`
#hbd .hb-bar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:10px 0 16px}
#hbd .hb-seg{display:flex;border:2px solid var(--line);border-radius:12px;overflow:hidden}
#hbd .hb-seg button{font:inherit;border:0;background:var(--card);color:var(--mut);padding:7px 14px;cursor:pointer}
#hbd .hb-seg button[aria-pressed=true]{background:var(--p);color:#fff;font-weight:700}
#hbd .hb-hint{flex:1 1 260px;font-size:13px;color:var(--mut)}
#hbd .hb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:8px}
#hbd .hb-card{background:var(--card);border:2px solid var(--line);border-radius:18px;padding:16px}
#hbd .hb-card h3{margin:0;font-size:18px}#hbd .hb-d{font-size:12.5px;color:var(--mut);margin:2px 0 10px}
#hbd .hb-live{display:inline-block;margin-inline-start:8px;font-size:11.5px;font-weight:600;padding:0 8px;border-radius:99px;background:var(--wa);color:#fff}
#hbd .hb-pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;min-height:230px}
#hbd .hb-pc{flex:1;max-width:150px;display:flex;flex-direction:column;align-items:center;text-align:center}
#hbd .hb-pc>button{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;width:100%}
#hbd .hb-nm{font-size:12.5px;font-weight:600;line-height:1.5;min-height:38px}
#hbd .hb-blk{width:100%;margin-top:8px;border-radius:10px 10px 0 0;color:#fff;font-weight:800;display:flex;flex-direction:column;align-items:center;padding-top:6px}
#hbd .hb-blk small{font-weight:400;font-size:11.5px}
#hbd .hb-r1 .hb-blk{height:100px;background:#e0a100}#hbd .hb-r2 .hb-blk{height:76px;background:#8d99ae}#hbd .hb-r3 .hb-blk{height:58px;background:#b5651d}
#hbd .hb-av{display:inline-grid;place-items:center;border-radius:50%;background:var(--p);color:#fff;font-weight:800}
#hbd .hb-dl{font-size:11.5px;font-weight:600;padding:0 8px;border-radius:99px}
#hbd .hb-dl.u{color:#157a47;background:#e3f5ec}#hbd .hb-dl.d{color:#b3262c;background:#fde7e8}#hbd .hb-dl.z{color:var(--mut);background:var(--line)}
#hbd .hb-row{all:unset;cursor:pointer;display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:8px 4px;border-top:1px solid var(--line);width:100%;box-sizing:border-box}
#hbd .hb-row:first-of-type{border-top:0}#hbd .hb-row:focus-visible,#hbd .hb-pc>button:focus-visible,#hbd .hb-seg button:focus-visible{outline:3px solid var(--p);outline-offset:2px}
#hbd .hb-m{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px}
#hbd .hb-t{font-size:13.5px;font-weight:600;line-height:1.5;display:block}
#hbd .hb-tr{display:block;height:5px;border-radius:3px;background:var(--line);margin-top:4px;overflow:hidden}#hbd .hb-tr i{display:block;height:100%;background:var(--p)}
#hbd .hb-v{text-align:center;font-weight:800}#hbd .hb-v .hb-dl{display:block;margin-top:2px}
#hbd .hb-tally{display:flex;flex-wrap:wrap;gap:8px}#hbd .hb-tally span{background:var(--card);border:2px solid var(--line);border-radius:99px;padding:3px 14px;font-size:13.5px}#hbd .hb-tally b{color:var(--p)}
#hbd .hb-kinds{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px}#hbd .hb-kinds div{border:2px solid var(--line);border-radius:12px;padding:6px 12px;font-size:13px}#hbd .hb-kinds b{display:block;font-size:19px}
#hbd svg{width:100%;height:auto;max-height:250px}#hbd .hb-empty{color:var(--mut);padding:24px 0;text-align:center}
#hbd .hb-more{font:inherit;margin:6px 0 14px;padding:6px 16px;border:2px solid var(--line);border-radius:12px;background:var(--card);color:var(--tx);cursor:pointer}
#hbd details{margin-top:16px;font-size:13px;color:var(--mut);line-height:1.9}#hbd summary{cursor:pointer;font-weight:700;color:var(--tx)}
@media print{header,nav,section:not(#hb),.hb-bar button{display:none!important}#hbd{display:block!important}#hbd .hb-card{break-inside:avoid}}`;
document.head.appendChild(css);
const sec=$('hbd')||document.createElement('section');sec.id='hbd';
if(!sec.parentNode){const ref=$('rep');if(ref&&ref.parentNode)ref.parentNode.insertBefore(sec,ref.nextSibling);else(document.querySelector('main')||document.body).appendChild(sec)}
try{if(typeof pages!=='undefined'&&!pages.some(p=>p[0]==='hbd')){const i=pages.findIndex(p=>p[0]==='rep');pages.splice(i<0?pages.length:i+1,0,['hbd','🏅 تابلوی برترین‌ها'])}
 const nav=$('nav');if(nav&&!nav.querySelector('[data-p="hbd"]')){const b=document.createElement('button');b.textContent='🏅 تابلوی برترین‌ها';b.dataset.p='hbd';b.onclick=()=>show('hbd');const ref=nav.querySelector('[data-p="rep"]');ref?ref.after(b):nav.appendChild(b)}}catch(e){console.warn('hb nav',e)}

function pod(P){const t=rank(P,mode).slice(0,3);if(t.length<3)return'<p class="hb-empty">داده‌ی کافی برای رتبه‌بندی در این مبنا نیست.</p>';
 return'<div class="hb-pod">'+[1,0,2].map(i=>{const r=t[i],k=i+1;return'<div class="hb-pc hb-r'+k+'"><button data-sid="'+E(r.sid)+'" aria-label="جزئیات '+E(stu(r.sid).name)+'">'+av(r.sid,52)+'<span class="hb-nm">'+E(stu(r.sid).name)+'</span>'+chip(r)+'</button><div class="hb-blk">'+fa(k)+'<small>'+f1(r.a)+' از ۴</small></div></div>'}).join('')+'</div>'}
function rows(P){const t=rank(P,mode).slice(0,3);if(!t.length)return'<p class="hb-empty">هنوز ثبت کافی نیست (برای رتبه‌گرفتن دست‌کم '+fa(MIN)+' ثبت لازم است).</p>';
 return t.map((r,i)=>'<button class="hb-row" data-sid="'+E(r.sid)+'"><span class="hb-m" style="background:'+COL[i+1]+'">'+fa(i+1)+'</span><span><span class="hb-t">'+E(stu(r.sid).name)+'</span><span class="hb-tr"><i style="width:'+Math.round(r.a/4*100)+'%"></i></span></span><span class="hb-v">'+f1(r.a)+chip(r)+'</span></button>').join('')}
function detail(sid,PR){const W=PR.W,pts=W.map(p=>({a:p.S[sid]&&p.S[sid].c?p.S[sid].c.a:null,c:p.ca,l:p.label.replace('هفته‌ی ','ه'),i:0}));
 const w=640,h=220,px=i=>50+i*(w-80)/Math.max(1,pts.length-1),py=v=>h-30-(Math.min(4,Math.max(1,v))-1)/3*(h-60);
 const ln=(k,c,d)=>{let s='',pen=0;pts.forEach((p,i)=>{if(p[k]==null){pen=0;return}s+=(pen?'L':'M')+px(i)+' '+py(p[k]);pen=1});return'<path d="'+s+'" fill="none" stroke="'+c+'" stroke-width="3"'+(d?' stroke-dasharray="6 5"':'')+'/>'};
 const kn=KINDS.map(t=>{let n=0,s=0;W.forEach(p=>{const k=p.S[sid]&&p.S[sid].c&&p.S[sid].c.k[t];if(k){n+=k.n;s+=k.n*k.a}});return'<div><b>'+(n?f1(s/n):'—')+'</b>'+KL[t]+' · '+fa(n)+' ثبت</div>'}).join('');
 const e=$('hbDet');e.hidden=false;
 e.innerHTML='<h3 style="margin:0 0 2px">'+E(stu(sid).name)+'</h3><div class="hb-d">روند میانگین هفتگی او (خط توپر) در برابر میانگین کلاس (خط‌چین)</div><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="روند هفتگی">'+[1,2,3,4].map(v=>'<line x1="40" x2="'+(w-20)+'" y1="'+py(v)+'" y2="'+py(v)+'" stroke="var(--line)"/><text x="30" y="'+(py(v)+4)+'" font-size="12" fill="var(--mut)" text-anchor="end">'+fa(v)+'</text>').join('')+ln('c','#8a7aa6',1)+ln('a','#7e57c2')+pts.map((p,i)=>'<text x="'+px(i)+'" y="'+(h-6)+'" font-size="11" fill="var(--mut)" text-anchor="middle">'+fa(i+1)+'</text>'+(p.a!=null?'<circle cx="'+px(i)+'" cy="'+py(p.a)+'" r="5" fill="#7e57c2"/>':'')).join('')+'</svg><div class="hb-kinds">'+kn+'</div>';
 e.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'})}
function renderHB(){
 const ev=events(),PR=periods(ev),box=$('hbd');
 const head='<h2>🏅 تابلوی برترین‌ها</h2><p class="sub">سه نفر برتر هر ماه و هر هفته، با سنجش هر دانش‌آموز نسبت به عملکرد قبلی خودش در ارزشیابی، فعالیت و آزمون. با ثبت داده‌ی جدید خودکار به‌روز می‌شود.</p>';
 if(!ev.length){box.innerHTML=head+'<div class="hb-card"><p class="hb-empty">هنوز ارزشیابی، فعالیت یا آزمونی ثبت نشده است. بعد از ثبت در «دفتر روزانه» یا «ثبت ارزشیابی/آزمون» اینجا نمایش داده می‌شود.</p></div>';return}
 const W=PR.W.slice().reverse(),Wv=showAll?W:W.slice(0,8),T={};
 PR.W.forEach(p=>rank(p,mode).slice(0,3).forEach(r=>{T[r.sid]=(T[r.sid]||0)+1}));
 box.innerHTML=head+'<div class="hb-bar"><div class="hb-seg" role="group" aria-label="مبنای رتبه‌بندی">'+MODES.map(m=>'<button data-m="'+m[0]+'" aria-pressed="'+(m[0]===mode)+'">'+m[1]+'</button>').join('')+'</div><div class="hb-hint">'+HINT[mode]+'</div><button class="hb-more" onclick="print()">🖨️ چاپ / PDF</button></div>'
 +'<h3>برترین‌های هر ماه</h3><div class="hb-grid">'+PR.M.map(p=>'<div class="hb-card"><h3>'+E(p.label)+live(p)+'</h3><div class="hb-d">'+jl(p.first)+' تا '+jl(p.last)+' · '+fa(p.days)+' روز ثبت · میانگین کلاس '+f1(p.ca)+'</div>'+pod(p)+'</div>').join('')+'</div>'
 +'<h3>برترین‌های هر هفته</h3><div class="hb-grid">'+Wv.map(p=>'<div class="hb-card"><h3>'+E(p.label)+live(p)+'</h3><div class="hb-d">'+jl(p.first)+' تا '+jl(p.last)+' · میانگین کلاس '+f1(p.ca)+'</div>'+rows(p)+'</div>').join('')+'</div>'
 +(W.length>8?'<button class="hb-more" id="hbAll">'+(showAll?'نمایش هفته‌های اخیر':'نمایش همه‌ی '+fa(W.length)+' هفته')+'</button>':'')
 +'<h3>چه کسانی بیشتر در سه نفر برتر هفته‌ها بودند؟</h3><div class="hb-tally">'+(Object.keys(T).sort((a,b)=>T[b]-T[a]).map(s=>'<span>'+E(stu(s).name)+' <b>'+fa(T[s])+'×</b></span>').join('')||'<span>—</span>')+'</div>'
 +'<section class="hb-card" id="hbDet" style="margin-top:18px" hidden></section>'
 +'<details><summary>روش محاسبه و محدودیت‌ها</summary><ul><li>هر ثبت دفتر روزانه (چهارسطحی و مثبت/منفی) و هر نمره‌ی آزمون (نسبت به بیشینه، مقیاس ۱ تا ۴) یک رویداد است. روز غیبت شمرده نمی‌شود و «انجام شد/نشد» تکلیف جزو امتیاز نیست.</li><li>«نسبت به خود» یعنی میانگین آن دوره منهای میانگین همان دانش‌آموز در همه‌ی ثبت‌های پیش از دوره (دست‌کم '+fa(BMIN)+' ثبت). برای رتبه‌گرفتن در هر دوره دست‌کم '+fa(MIN)+' ثبت لازم است.</li><li>دوره‌ی اول سال مبنای قبلی ندارد، پس رتبه‌ی آن عملاً همان سطح عملکرد است. دوره‌ی «در جریان» موقت است و با ثبت‌های بعدی عوض می‌شود. وقتی ثبت‌ها کم باشد، چند نفر با میانگین ۴٫۰ مساوی می‌شوند و تعداد ثبت و بعد نام تعیین‌کننده است.</li><li>پیشرفت‌محض دانش‌آموزِ قبلاً ضعیف را بالا می‌برد و دانش‌آموزِ همیشه قوی را کم‌امتیاز می‌کند؛ برای همین حالت پیش‌فرض «ترکیبی» (۶۰٪ عملکرد، ۴۰٪ پیشرفت) است.</li></ul></details>';
 box.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;try{localStorage.setItem('cl_hb_mode',mode)}catch(x){}renderHB()});
 box.querySelectorAll('[data-sid]').forEach(b=>b.onclick=()=>detail(b.dataset.sid,PR));
 const all=$('hbAll');if(all)all.onclick=()=>{showAll=!showAll;renderHB()}}
window.renderHB=renderHB;
/* هر بار که صفحه فعال شد (از منو، یا بازگردانی صفحه‌ی آخر) دوباره محاسبه می‌شود */
new MutationObserver(recs=>{if(!sec.classList.contains('on'))return;if(!recs.some(r=>!/(^|\s)on(\s|$)/.test(r.oldValue||'')))return;try{renderHB()}catch(e){console.warn('hb',e);sec.innerHTML='<p class="hb-empty">خطا در ساخت تابلو.</p>'}}).observe(sec,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
}catch(e){console.warn('honor-board',e)}})();

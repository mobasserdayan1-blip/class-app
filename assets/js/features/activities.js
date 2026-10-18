/* فعالیت‌های کلاسی */
(function(){
 S.activities=S.activities||[];S.activities.forEach(x=>{if(x&&x.type==='noans')x.type='effort'});
 const KB=[['پاسخ به سؤال','🙋','i'],['حل مسئله روی تخته','🧮','i'],['ارائه','🎤','ig'],['فعالیت گروهی','👥','g'],['همکاری با دوستان','🤝','ig'],['مسئولیت‌پذیری','🧩','i'],['مشارکت در بحث','💬','ig'],['فعالیت خلاقانه','🎨','ig'],['کمک به کلاس','🧹','ig'],['سایر','✏️','ig']];
 const SUBS={'ارائه':['نمایش / تئاتر','حفظ و خوانش شعر','سخنرانی / گزارش شفاهی','روخوانی متن','داستان‌گویی','سایر'],'فعالیت خلاقانه':['نقاشی / کاردستی','نوشتن خلاق','ساخت پروژه','سایر']};
 const ACAD=['پاسخ به سؤال','حل مسئله روی تخته','ارائه'];
 const isAcad=k=>ACAD.includes(k);
 const kindsAll=()=>{const o=S.actKinds||{},R=o.ren||{};return KB.filter(k=>!(o.del||[]).includes(k[0])).map(k=>R[k[0]]?[R[k[0]].n||k[0],R[k[0]].i||k[1],k[2]]:k).concat((o.add||[]).map(k=>[k[0],k[1]||'✏️','ig'])).filter(k=>!(o.hide||[]).includes(k[0]))};
 const kinds=m=>kindsAll().filter(k=>k[2].includes(m));
 const iconOf=k=>{const R=(S.actKinds||{}).ren||{},f=KB.map(b=>R[b[0]]?[R[b[0]].n||b[0],R[b[0]].i||b[1]]:b).concat(KB).concat(((S.actKinds||{}).add||[]).map(a=>[a[0],a[1]])).find(x=>x[0]===k);return f?f[1]:'✏️'};
 const TY={positive:{t:'فعالیت مثبت',i:'🌟',c:'#1a8f55',bg:'#d8f3e3',p:5},effort:{t:'نیاز به تلاش بیشتر',i:'💪',c:'#b26a00',bg:'#fff1cf',p:3}};
 const RL=(k,t)=>(isAcad(k)?{positive:'✅ مسلط',effort:'🔄 نیاز به تمرین'}:{positive:'🌟 مثبت',effort:'💪 نیاز به تلاش'})[t]||TY[t].t;
 const typesOf=k=>isAcad(k)?['positive','effort']:['positive','effort'];
 const cfg=()=>{const c=S.actCfg=S.actCfg||{};if(!c.tgt)c.tgt=3;if(c.wAcad==null)c.wAcad=30;if(!c.perDay)c.perDay=6;if(!c.subs)c.subs={};return c};
 const modeOf=()=>cfg().mode==='g'?'g':'i';
 const curKind=m=>{m=m||modeOf();const ks=kinds(m),c=cfg(),key=m==='g'?'gkind':'kind';return ks.some(k=>k[0]===c[key])?c[key]:(ks[0]?ks[0][0]:'سایر')};
 let sel=null,selType='positive',selKind=null,selVol=false,volOn=false,noteOpen=new Set(),bulk=new Set(),bkNote='',selNote=false,setOpen=false,gridOpen=false,seq=0,armed='';
 const cl01=v=>Math.max(0,Math.min(1,v));
 const q=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const today=()=>iso(tdy()),D=k=>new Date(k+'T12:00:00Z'),dl=k=>fmt(D(k));
 const addD=(k,n)=>{const d=D(k);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const wkStart=k=>addD(k,-((D(k).getUTCDay()+1)%7)); /* هفته از شنبه شروع می‌شود */
 const dayDiff=(a,b)=>Math.round((D(b)-D(a))/864e5);
 const turnsIn=(id,a,b)=>S.activities.filter(x=>x.sid===id&&x.date>=a&&x.date<=b).length;
 const lastTurn=id=>S.activities.reduce((m,x)=>x.sid===id&&x.date>m?x.date:m,'');
 const cnt=(sid,day)=>{const A=S.activities.filter(x=>x.sid===sid&&(!day||x.date===day)),ac=A.filter(x=>isAcad(x.kind)),bh=A.filter(x=>!isAcad(x.kind)),n=(L,t)=>L.filter(x=>x.type===t).length;return{m:n(ac,'positive'),e:n(ac,'effort'),p:n(bh,'positive'),f:n(bh,'effort'),g:A.filter(x=>x.grp).length,n:A.length}};
 const absentToday=sid=>((S.att||{})[today()]||{})[sid]==='a';
 const blockMsg=sid=>absentToday(sid)?'این دانش‌آموز امروز غایب است و در فعالیت کلاسی شرکت نمی‌کند':'';
 const dayRecs=(sid,day)=>S.activities.filter(x=>x.sid===sid&&x.date===day).sort((a,b)=>(a.ts||a.id)-(b.ts||b.id));
 const crs=()=>S.courses||[];
 const CHs=id=>{const c=crs().find(x=>x.id===id);return c&&c.ch?c.ch:[]};
 function ctx(){const c=cfg(),cid=+c.course||0;if(!crs().some(x=>x.id===cid))return{};const[h,p]=String(c.tp||'').split(':').map(Number);const ok=CHs(cid).some(H=>H.id===h&&(H.tp||[]).some(T=>T.id===p));return ok?{course:cid,ch:h,tp:p}:{course:cid}}
 const where=x=>{if(!x.course)return x.tl||'';const c=crs().find(z=>z.id===x.course);if(!c)return x.tl||'';let s=c.name;if(x.tp){const H=CHs(x.course).find(h=>h.id===x.ch),T=H&&(H.tp||[]).find(t=>t.id===x.tp);if(T)s+=' ← '+T.name;else if(x.tl)return x.tl}return s};
 const kl=x=>(x.kind||'سایر')+(x.sub?' ('+x.sub+')':'');
 const oral=id=>{let m=0,e=0;S.activities.forEach(x=>{if(x.sid===id&&isAcad(x.kind)){if(x.type==='positive')m++;else if(x.type==='effort')e++}});const t=m+e;return{m,e,t,mast:t?m/t:null,score:t?(m*4+e*2)/t:null}};
 function partScore(id){const c=cfg(),T=today(),A=S.activities;if(!A.length)return null;
  let first=T;A.forEach(x=>{if(x.date<first)first=x.date});
  const lim=addD(T,-27),start=first>lim?first:lim,days=dayDiff(start,T)+1;if(days<7)return null;
  const X=window.SCX,at=X&&X.attSt?X.attSt(id):null,pf=at&&at.pct!=null?Math.max(.3,at.pct/100):1;
  const n=A.filter(x=>x.sid===id&&x.date>=start&&x.date<=T).length;
  return Math.min(1,n/(c.tgt*(days/7)*pf))*100}
 function evAvg(id){const X=window.SCX;return X?X.avg(X.vals(id)):null}
 function tag(id){const o=oral(id),ev=evAvg(id);
  if((o.t>=3&&o.mast>=.8)||(o.t<3&&ev!=null&&ev>=3.5))return '⭐ سؤال چالشی یا «توضیح‌دادن به دوستان»';
  if((o.t>=3&&o.mast<=.5)||(o.t<3&&ev!=null&&ev<2.5))return '🤝 سؤال ساده‌تر و تشویق';return ''}
 function need(s,T,w0){const id=s.id,c=cfg();
  if(((S.att||{})[T]||{})[id]==='a')return null;
  const def=Math.max(0,c.tgt-turnsIn(id,w0,T))/c.tgt,ls=lastTurn(id),gap=ls?Math.min(14,dayDiff(ls,T))/14:1;
  const o=oral(id),ev=evAvg(id),weak=o.t>=2?1-o.mast:.3,ew=ev==null?.3:cl01((4-ev)/3);
  return def*1.6+gap+weak*.9+ew*.6+Math.random()*.35+(turnsIn(id,T,T)>0?-2:0)}
 function pickNow(){const T=today(),w0=wkStart(T),c=cfg();
  c.pick={date:T,n:c.perDay,ids:S.students.map(s=>({id:s.id,v:need(s,T,w0)})).filter(x=>x.v!=null).sort((a,b)=>b.v-a.v).slice(0,c.perDay).map(x=>x.id)};save()}
  const wsNow=()=>{try{return window.wscApi&&window.wscApi.now?window.wscApi.now():null}catch(e){return null}};
  const autoCx=()=>{const A=wsNow(),c=cfg();if(!A||!A.cid||!crs().some(x=>x.id===A.cid))return A;if(c.wsKey!==A.key){c.wsKey=A.key;if(c.course!==A.cid){c.course=A.cid;c.tp=''}save()}return A};
  const wsHint=cx=>{const A=wsNow();if(!A)return '';const L=A.ids.filter(id=>id!==cx.course&&crs().some(z=>z.id===id)),lb=A.state==='cur'?'الان':A.state==='prev'?'زنگ قبلی':'زنگ بعدی';
   return `<p class="sub" style="margin:0 0 6px;font-size:12px">🕘 ${lb}: زنگ ${fa(A.i+1)} — ${esc2(A.name)}${L.map(id=>` <button class="sm" type="button" data-cxauto="${id}">استفاده: ${esc2(crs().find(z=>z.id===id).name)}</button>`).join('')}</p>`};
  function pstat(id){const T=today(),A=S.activities||[];if(!A.length)return null;let first=T;A.forEach(x=>{if(x.date<first)first=x.date});
   const ls=lastTurn(id),o=oral(id),ac=A.filter(x=>x.sid===id&&isAcad(x.kind)).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.ts||a.id)-(b.ts||b.id)).slice(-3);
   return{span:dayDiff(first,T),gap:ls?dayDiff(ls,T):null,r:turnsIn(id,addD(T,-13),T),p:turnsIn(id,addD(T,-27),addD(T,-14)),o,eff:ac.filter(x=>x.type==='effort').length,n3:ac.length}}
  window.ACTX={isAcad,cfg,oral,partScore,wkStart,ACAD,where,kl,pstat,setCourse:id=>{const c=cfg();c.course=+id||0;c.tp='';const A=wsNow();if(A)c.wsKey=A.key;save()}};
 const css=document.createElement('style');
 css.textContent=`.act-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
 .act-st{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:16px;padding:12px 8px;font:inherit;font-weight:700;cursor:pointer;text-align:center}
 .act-st small{display:block;margin-top:5px;font-weight:600;color:var(--mut);font-size:12px}
 .act-st:active{transform:scale(.97)}
 .act-ov{position:fixed;inset:0;background:#0007;z-index:50;display:flex;align-items:flex-end;justify-content:center}
 .act-sh{background:var(--card);color:var(--tx);width:100%;max-width:560px;border-radius:24px 24px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));max-height:88vh;overflow:auto}
 .act-tp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
 .act-tp button{border:2px solid var(--line);background:var(--bg2);color:var(--tx);border-radius:14px;padding:14px 6px;font:inherit;font-weight:700;font-size:14px;cursor:pointer}
 .act-tp button.on.positive{background:#d8f3e3;border-color:#1a8f55;color:#1a8f55}
 .act-tp button.on.effort{background:#fff1cf;border-color:#b26a00;color:#b26a00}
 .act-kd{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}
 .act-kd button{border:1px solid var(--line);background:var(--bg2);color:var(--tx);border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}
 .act-kd button.on{background:var(--p);border-color:var(--p);color:#fff}
 .act-it{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line);font-size:14px}
 .act-it:last-child{border-bottom:0}.act-it small{color:var(--mut);display:block}
 .act-x{border:0;background:none;font-size:18px;cursor:pointer;color:var(--no);white-space:nowrap}
 .act-x.on{background:#e5484d;color:#fff;border-radius:10px;padding:7px 11px;font:inherit;font-size:13px;font-weight:700}
 .act-pk{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:10px 0;border-bottom:1px dashed var(--line)}
 .act-pk:last-child{border-bottom:0}.act-pk small{display:block;color:var(--mut);font-size:12px;margin-top:2px}
 .act-pr{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
 .act-pr button{border:2px solid var(--line);background:var(--bg2);color:var(--tx);border-radius:12px;padding:9px 10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
 .act-pr button.positive{border-color:#1a8f55;color:#1a8f55}.act-pr button.effort{border-color:#b26a00;color:#b26a00}
 .act-pr button:active{transform:scale(.96)}
 .act-dn{background:#d8f3e3;color:#17653d;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}
 .act-vl{border:2px dashed var(--line);background:var(--bg2);color:var(--tx);border-radius:12px;padding:9px 12px;font:inherit;font-size:13px;cursor:pointer;margin:4px 0}
 .act-vl.on{background:#e6f0ff;border:2px solid #4a7fd1;color:#285a9e;font-weight:700}
.act-bkc{display:flex;flex-wrap:wrap;gap:6px}.act-bkc button{border:2px solid var(--line);background:var(--bg2);color:var(--tx);border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}.act-bkc button.on{background:var(--p);border-color:var(--p);color:#fff}
 .act-wk{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;margin-top:8px}
 .act-bar{height:8px;border-radius:99px;background:var(--bg2);overflow:hidden;margin-top:4px}.act-bar i{display:block;height:100%;border-radius:99px}
 .act-set label{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;font-size:14px}.act-set select{font:inherit;padding:6px 8px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--tx)}
 .act-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
 .act-seg button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:16px;padding:13px 6px;font:inherit;font-weight:800;font-size:15px;cursor:pointer}
 .act-seg button.on{background:var(--p);border-color:var(--p);color:#fff}
 .act-cx{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 8px}.act-cx select{width:100%;margin:0}
 .act-nt{flex-basis:100%;width:100%}.act-nt input{width:100%;margin:4px 0 0;font:inherit;font-size:13px}.act-nt small{display:block;color:var(--mut);font-size:11.5px;margin-top:3px}
 .act-h{font-size:13px;font-weight:800;margin:14px 0 4px;padding:6px 10px;border-radius:10px;background:var(--bg2)}
 .act-fl{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#2a2238;color:#fff;border-radius:999px;padding:11px 18px;font-size:14px;font-weight:700;z-index:80;box-shadow:0 6px 18px #0005;max-width:90vw;text-align:center}
 details.card>summary{cursor:pointer;list-style:none}details.card>summary::-webkit-details-marker{display:none}`;
 document.head.appendChild(css);
 if(!pages.some(p=>p[0]==='act')){const i=pages.findIndex(p=>p[0]==='att');pages.splice(i+1,0,['act','🌟 فعالیت کلاسی']);
  const b=document.createElement('button');b.textContent='🌟 فعالیت کلاسی';b.dataset.p='act';b.onclick=()=>show('act');
  const ref=nav.querySelector('[data-p="att"]');ref?ref.after(b):nav.appendChild(b)}
 const _show=window.show;window.show=function(id){_show(id);if(id==='act')render()};
 function add(sid,type,kind,o){o=o||{};if(absentToday(sid))return null;{const L0=S.activities[S.activities.length-1];if(L0&&L0.sid===sid&&L0.kind===kind&&L0.type===type&&!!L0.grp===!!o.grp&&Date.now()-(L0.ts||0)<1200)return null}const r={id:Date.now()*100+(seq++%100),sid,type,kind,points:TY[type].p+(type==='positive'&&o.vol?2:0),note:o.note||'',date:today(),ts:Date.now()};
  if(o.vol)r.vol=1;if(o.grp){r.grp=o.grp;r.gb=o.gb}
  const cx=ctx();if(cx.course){r.course=cx.course;if(cx.tp){r.ch=cx.ch;r.tp=cx.tp}r.tl=where(r)}
  const sb=cfg().subs[kind];if(sb&&SUBS[kind])r.sub=sb;
  S.activities.push(r);return r}
 const fin=()=>{save();render();window.renderSmart&&window.renderSmart()};
 function flash(msg){let t=$('actFl');if(t)t.remove();t=document.createElement('div');t.id='actFl';t.className='act-fl';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{if(t.parentNode)t.remove()},2600)}
 const resBtns=(attr,val,kind)=>typesOf(kind).map(t=>`<button class="${t}" ${attr}="${val}|${t}">${RL(kind,t)}</button>`).join('');
 const gk=x=>x.gb?'b'+x.gb:'o'+x.grp+'|'+x.date+'|'+x.kind+'|'+x.type+'|'+Math.floor((x.ts||0)/10000);
 const uniq=L=>{const m=new Map();L.forEach(x=>{const k=gk(x);if(!m.has(k))m.set(k,{x,n:0});m.get(k).n++});return[...m.values()]};
 const delBtn=(a,id)=>armed===a+id?`<button class="act-x on" data-${a==='d'?'del':'delg'}="${q(id)}">حذف؟ ✓</button>`:`<button class="act-x" data-${a==='d'?'del':'delg'}="${q(id)}" aria-label="حذف">🗑️</button>`;
 const ctxHtml=()=>{const cs=crs();if(!cs.length)return '<p class="sub" style="margin:8px 0">برای ثبت «درس و مبحث»، ابتدا در بخش «درس‌ها» یک درس اضافه کنید.</p>';
  const cx=ctx(),ch=cx.course?CHs(cx.course):[],has=ch.some(h=>(h.tp||[]).length);
  return `<b style="font-size:13px;display:block;margin-top:10px">📚 درس و مبحث این نوبت</b><div class="act-cx"><select class="fs" data-cx="course"><option value="">درس (اختیاری)</option>${cs.map(z=>`<option value="${z.id}"${z.id===cx.course?' selected':''}>${esc2(z.name)}</option>`).join('')}</select>${has?`<select class="fs" data-cx="tp"><option value="">مبحث (اختیاری)</option>${ch.map(h=>`<optgroup label="${q(h.name)}">${(h.tp||[]).map(t=>`<option value="${h.id}:${t.id}"${cx.tp===t.id&&cx.ch===h.id?' selected':''}>${esc2(t.name)}</option>`).join('')}</optgroup>`).join('')}</select>`:'<div></div>'}</div>${wsHint(cx)}${cx.course&&!has?'<p class="sub" style="margin:0 0 6px;font-size:12px">برای این درس هنوز فصل و مبحثی ثبت نشده (درس‌ها ← فصل‌ها و مبحث‌ها).</p>':''}`};
 const subHtml=k=>{const L=SUBS[k];if(!L)return '';const cur=cfg().subs[k]||'';return `<b style="font-size:13px;display:block;margin-top:6px">${k==='ارائه'?'🎭 نوع ارائه':'نوع کار'} <small style="font-weight:400;color:var(--mut)">(اختیاری)</small></b><div class="act-kd">${L.map(s=>`<button class="${cur===s?'on':''}" data-sub="${q(s)}">${esc2(s)}</button>`).join('')}</div>`};
 const chips=(m,kind,attr)=>`<div class="act-kd">${kinds(m).map(([k,i])=>`<button class="${k===kind?'on':''}" ${attr}="${q(k)}">${i} ${esc2(k)}</button>`).join('')}</div>`;
 const tbl=(rows,cols)=>`<div class="wrap"><table class="at" style="margin-top:6px"><tr><th class="nm">نوع فعالیت</th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr>${rows.map(r=>`<tr><td class="nm">${iconOf(r.k)} ${esc2(r.k)}</td>${cols.map(c=>`<td>${fa(r[c[1]])}</td>`).join('')}</tr>`).join('')}</table></div>`;
 function summary(recs,grpMode){
  const U=grpMode?uniq(recs).map(o=>o.x):recs,by=(L,keys)=>{const m=new Map();L.forEach(x=>{const k=x.kind||'سایر';if(!m.has(k))m.set(k,{k,positive:0,effort:0});m.get(k)[x.type]++});return[...m.values()]};
  const A=by(U.filter(x=>isAcad(x.kind))),B=by(U.filter(x=>!isAcad(x.kind)));
  if(!A.length&&!B.length)return '';
  return `<div class="card"><b>📊 جمع‌بندی به تفکیک نوع فعالیت${grpMode?' (هر ثبت گروهی یک بار)':''}</b>
  ${A.length?`<div class="act-h">🎓 فعالیت‌های درسی</div>${tbl(A,[['✅ مسلط','positive'],['🔄 نیاز به تمرین','effort']])}`:''}
  ${B.length?`<div class="act-h">🌟 فعالیت‌های مشارکتی و رفتاری</div>${tbl(B,[['🌟 مثبت','positive'],['💪 نیاز به تلاش','effort']])}`:''}</div>`}
 const recRow=x=>{const w=where(x),op=noteOpen.has(String(x.id));return `<div class="act-nt"><div class="act-pr" style="margin-top:6px"><span class="act-dn">${x.grp?'👥 ':''}${esc2(kl(x))} · ${esc2(RL(x.kind||'سایر',x.type))}${x.vol?' · ✋':''}</span><button class="act-x" data-undo="${x.id}" aria-label="لغو">↩</button><button class="act-x${x.note?' on':''}" data-ntt="${x.id}" aria-label="توضیح" title="توضیح">📝</button></div>${op?`<input class="fs" data-nt="${x.id}" value="${q(x.note||'')}" placeholder="📝 توضیح (اختیاری)">${w?`<small>📚 ${esc2(w)}</small>`:''}`:''}</div>`};
 function render(){
  const root=$('actBody');if(!root)return;autoCx();const st=S.students,T=today(),c=cfg(),mode=modeOf(),kind=curKind(mode),w0=wkStart(T);
  if(!st.length){root.innerHTML='<div class="card"><p class="sub">ابتدا دانش‌آموزان را در بخش «ویرایش دانش‌آموزان» اضافه کنید.</p></div>';return}
  const TA=S.activities.filter(x=>x.date===T),byTs=(a,b)=>(b.ts||b.id)-(a.ts||a.id);
  const sl=(k,vs,cur)=>`<select data-cf="${k}">${vs.map(v=>`<option value="${v[0]}"${v[0]===cur?' selected':''}>${v[1]}</option>`).join('')}</select>`;
  const seg=`<div class="act-seg"><button data-mode="i" class="${mode==='i'?'on':''}">👤 فعالیت انفرادی</button><button data-mode="g" class="${mode==='g'?'on':''}">👥 فعالیت گروهی</button></div>`;
  const settings=`<details class="card act-set" id="actSetD" ${setOpen?'open':''}><summary><b>⚙️ تنظیمات فعالیت کلاسی</b></summary>
   <label>هدف نوبت هفتگی هر دانش‌آموز ${sl('tgt',[[3,'۳ نوبت'],[4,'۴ نوبت'],[5,'۵ نوبت']],c.tgt)}</label>
   <label>تعداد نوبت پیشنهادی در هر روز ${sl('perDay',[4,5,6,7,8,9,10].map(v=>[v,fa(v)]),c.perDay)}</label>
   <label>سهم پرسش‌های شفاهی درسی در نمره‌ی تحصیلی ${sl('wAcad',[0,10,20,30,40,50].map(v=>[v,v?fa(v)+'٪':'صفر (فقط آزمون)']),c.wAcad)}</label>
   <p class="sub" style="line-height:1.9;margin:6px 0 0">فعالیت‌های درسی (پاسخ به سؤال، حل مسئله روی تخته، ارائه): «مسلط» = ۴ و «نیاز به تمرین» = ۲ در ارزشیابی مستمر. حداقل ۳ مورد لازم است تا وارد نمره‌ی تحصیلی شود. فعالیت‌های مشارکتی و رفتاری («مثبت» و «نیاز به تلاش») فقط روی مشارکت و رفتار اثر دارند. فعالیت گروهی برای هر عضو حاضر تیم جداگانه ثبت می‌شود. امتیاز مشارکت بر پایه‌ی هدف هفتگی است، پس کسی با نوبت بیشتر امتیاز بیشتری نمی‌گیرد. دانش‌آموز غایبِ همان روز در فعالیت کلاسی شرکت داده نمی‌شود هر دانش‌آموز در یک روز می‌تواند هر تعداد فعالیت داشته باشد (برای ثبت اشتباهی، دکمه‌ی لغو کنار هر ثبت را بزنید).</p></details>`;
  if(mode==='g'){
   const nt=typeof NT==='number'?NT:3,teams=Array.from({length:nt},(_,i)=>i+1).map(t=>({t,m:st.filter(s=>s.team===t)})).filter(x=>x.m.length);
   const GR=S.activities.filter(x=>x.grp),GA=uniq(GR.filter(x=>isAcad(x.kind)).sort(byTs)),GB=uniq(GR.filter(x=>!isAcad(x.kind)).sort(byTs));
   const gi=({x,n})=>{const ty=TY[x.type]||TY.positive,w=where(x);return `<div class="act-it"><div>${ty.i} <b>🏅 ${esc2(tname(x.grp,'تیم '+x.grp))}</b> · ${esc2(kl(x))}<small>${esc2(RL(x.kind||'سایر',x.type))} · ${fa(n)} عضو · ${dl(x.date)}${w?' · 📚 '+esc2(w):''}${x.note?' · 📝 '+esc2(x.note):''}</small></div>${delBtn('g',gk(x))}</div>`};
   const rows=teams.map(({t,m})=>{const tb=TA.filter(x=>x.grp===t).sort(byTs),lk=tb[0]?gk(tb[0]):null,lb=lk?tb.filter(x=>gk(x)===lk):[],f=lb[0],w=f?where(f):'';
    return `<div class="act-pk"><div><b>🏅 ${esc2(tname(t,'تیم '+t))}</b><small>${fa(m.length)} عضو</small></div><div class="act-pr">${typesOf(kind).map(z=>`<button class="${z}" data-gr="${t}|${z}">${RL(kind,z)}</button>`).join('')}</div>
    ${f?`<div class="act-nt"><span class="act-dn">آخرین ثبت امروز: ${esc2(kl(f))} · ${esc2(RL(f.kind||'سایر',f.type))} · ${fa(lb.length)} نفر</span> <button class="act-x" data-undog="${q(lk)}" aria-label="لغو">↩ لغو</button><button class="act-x${f.note?' on':''}" data-ntt="g${q(lk)}" aria-label="توضیح" title="توضیح">📝</button>${noteOpen.has('g'+lk)?`${w?`<small>📚 ${esc2(w)}</small>`:''}<input class="fs" data-ntg="${q(lk)}" value="${q(f.note||'')}" placeholder="📝 توضیح درباره‌ی این فعالیت گروهی (اختیاری)">`:''}</div>`:''}</div>`}).join('');
   root.innerHTML=`${seg}<div class="card"><b>👥 ثبت فعالیت گروهی</b><p class="sub" style="margin:4px 0 6px">با یک لمس، نتیجه برای همه‌ی اعضای حاضر تیم ثبت می‌شود. نوع فعالیت، درس و مبحث را بالا انتخاب کنید؛ بعد از ثبت، کادر توضیحات زیر همان تیم ظاهر می‌شود.</p>
   <b style="font-size:13px">نوع فعالیتِ گروهی</b>${chips('g',kind,'data-ck')}${subHtml(kind)}${ctxHtml()}
   ${rows||'<p class="sub">تیمی با عضو وجود ندارد. از بخش «تیم‌ها» دانش‌آموزان را در تیم قرار دهید.</p>'}</div>
   <div class="card"><b>🕘 آخرین فعالیت‌های گروهی ثبت‌شده</b>
   <div class="act-h">🎓 فعالیت‌های درسی (مسلط / نیاز به تمرین)</div>${GA.length?GA.slice(0,8).map(gi).join(''):'<p class="sub">موردی ثبت نشده است.</p>'}
   <div class="act-h">🌟 فعالیت‌های مشارکتی و رفتاری (مثبت / نیاز به تلاش)</div>${GB.length?GB.slice(0,8).map(gi).join(''):'<p class="sub">موردی ثبت نشده است.</p>'}</div>
   ${summary(GR,true)}${settings}`;return}
  if(!c.pick||c.pick.date!==T||c.pick.n!==c.perDay)pickNow();
  const pk=c.pick.ids.map(id=>st.find(s=>s.id===id)).filter(Boolean).filter(s=>!absentToday(s.id)),TAI=TA.filter(x=>!x.grp);
  const IR=S.activities.filter(x=>!x.grp),IA=IR.filter(x=>isAcad(x.kind)).sort(byTs),IB=IR.filter(x=>!isAcad(x.kind)).sort(byTs);
  const W=st.map(s=>({s,n:turnsIn(s.id,w0,T)})).sort((a,b)=>a.n-b.n),zero=W.filter(x=>x.n===0).length,low=W.filter(x=>x.n>0&&x.n<c.tgt).length;
  const ii=x=>{const s=st.find(z=>z.id===x.sid),ty=TY[x.type]||TY.positive,w=where(x);return `<div class="act-it"><div>${ty.i} <b>${esc2(s?s.name:'(حذف‌شده)')}</b> · ${esc2(kl(x))}<small>${esc2(RL(x.kind||'سایر',x.type))} · ${dl(x.date)}${x.vol?' · ✋ داوطلب':''}${w?' · 📚 '+esc2(w):''}${x.note?' · 📝 '+esc2(x.note):''}</small></div>${delBtn('d',x.id)}</div>`};
  root.innerHTML=`${seg}<div class="card"><b>🎯 نوبت امروز</b><p class="sub" style="margin:4px 0 8px">${dl(T)} · ${fa(TAI.length)} ثبت انفرادی امروز · نوبت‌ها بر اساس کمبود مشارکت این هفته، فاصله از آخرین نوبت و نیاز درسی هر دانش‌آموز پیشنهاد می‌شوند (غایب‌های امروز نیستند).</p>
  <b style="font-size:13px">نوع فعالیتِ این نوبت</b>${chips('i',kind,'data-ck')}${subHtml(kind)}${ctxHtml()}
  <button class="act-vl${volOn?' on':''}" data-vol="1">✋ نوبت بعدی داوطلبانه است (+۲ امتیاز)</button>
  ${pk.map(s=>{const t=tag(s.id),rc=dayRecs(s.id,T);return `<div class="act-pk"><div><b>${esc2(s.name)}</b>${t?`<small>${t}</small>`:''}${rc.length?`<small>امروز ${fa(rc.length)} ثبت دارد · برای ثبت فعالیت دیگر دوباره دکمه‌ها را بزنید</small>`:''}</div><div class="act-pr">${resBtns('data-rs',s.id,kind)}</div>${rc.map(recRow).join('')}</div>`}).join('')||'<p class="sub">امروز دانش‌آموزی برای پیشنهاد نیست.</p>'}
  <button class="sm" data-repick="1" style="margin-top:10px">🔄 پیشنهاد جدید</button></div>
  ${bulkCard(st,kind,TA)}
  <div class="card"><b>📊 مشارکت این هفته</b><p class="sub" style="margin:4px 0 0">از ${dl(w0)} · هدف: ${fa(c.tgt)} نوبت برای هر دانش‌آموز${zero?` · <span style="color:#c97a00">${fa(zero)} نفر هنوز نوبت نگرفته‌اند</span>`:''}${low?` · ${fa(low)} نفر کمتر از هدف`:''}</p>
  <div class="act-wk">${W.map(({s,n})=>{const col=n>=c.tgt?'#2a9d6a':'#6693c9',lab=n===0?'هنوز ثبت نشده':n>=c.tgt?fa(n)+' نوبت ✓':fa(n)+' نوبت';return `<div><div style="display:flex;justify-content:space-between;gap:6px;font-size:13px"><b>${esc2(s.name)}</b><span style="color:${n===0?'#c97a00':col};white-space:nowrap">${lab}</span></div><div class="act-bar"><i style="width:${Math.min(100,n/c.tgt*100)}%;background:${col}"></i></div></div>`}).join('')}</div></div>
  <details class="card" id="actGridD" ${gridOpen?'open':''}><summary><b>👆 ثبت دستی برای هر دانش‌آموز</b></summary><p class="sub" style="margin:6px 0 10px">روی نام دانش‌آموز بزنید. در هر کارت: ✅ مسلط · 🔄 نیاز به تمرین (درسی)، 🌟 مثبت · 💪 نیاز به تلاش (مشارکتی)، 👥 ثبت‌های تیمی. همه‌ی ثبت‌ها (نوبت امروز، دسته‌جمعی، تیمی و دستی) اینجا جمع می‌شوند دانش‌آموز غایبِ امروز قابل ثبت نیست؛ برای هر دانش‌آموز در یک روز می‌توانید هر تعداد فعالیت ثبت کنید («ثبت و مورد بعدی ➕»).</p><div class="act-grid">${st.map(s=>{const t=cnt(s.id,T),a=cnt(s.id);return `<button class="act-st" data-sid="${s.id}"${absentToday(s.id)?' style="opacity:.55"':''}>${window.AV(s)}${esc2(s.name)}${absentToday(s.id)?'<small style="color:#e5484d">❌ غایب امروز</small>':''}<small>امروز: ✅${fa(t.m)} 🔄${fa(t.e)} · 🌟${fa(t.p)} 💪${fa(t.f)}${t.g?` · 👥${fa(t.g)}`:''}</small><small>کل: ✅${fa(a.m)} 🔄${fa(a.e)} · 🌟${fa(a.p)} 💪${fa(a.f)}</small></button>`}).join('')}</div></details>
  <div class="card"><b>🕘 آخرین فعالیت‌های انفرادی ثبت‌شده</b>
  <div class="act-h">🎓 فعالیت‌های درسی (مسلط / نیاز به تمرین)</div>${IA.length?IA.slice(0,10).map(ii).join(''):'<p class="sub">موردی ثبت نشده است.</p>'}
  <div class="act-h">🌟 فعالیت‌های مشارکتی و رفتاری (مثبت / نیاز به تلاش)</div>${IB.length?IB.slice(0,10).map(ii).join(''):'<p class="sub">موردی ثبت نشده است.</p>'}</div>
  ${summary(IR,false)}${settings}`}
function bulkCard(st,kind,TA){const at=(S.att||{})[today()]||{},L=st.filter(s=>at[s.id]!=='a');
  return `<div class="card"><b>👥 ثبت دسته‌جمعی</b><p class="sub" style="margin:4px 0 8px">یک سؤال را از چند نفر پرسیدید؟ دانش‌آموزان را انتخاب کنید و با یک لمس عملکرد همه را ثبت کنید.</p>
  <div class="act-bkc">${L.map(s=>`<button class="${bulk.has(s.id)?'on':''}" data-bks="${s.id}">${esc2(s.name)}</button>`).join('')||'<span class="sub">دانش‌آموزی نیست</span>'}</div>
  <div style="display:flex;gap:6px;margin:8px 0"><button class="sm" data-bka="1">انتخاب همه</button><button class="sm" data-bkn="1">پاک‌کردن</button><span class="sub" style="margin:0;align-self:center">${fa(bulk.size)} نفر انتخاب شده</span></div>
  <input class="fs" id="actBkNote" value="${q(bkNote)}" placeholder="📝 توضیح مشترک (اختیاری)" style="width:100%;margin:0 0 8px">
  <div class="act-pr">${typesOf(kind).map(t=>`<button class="${t}" data-bkr="${t}">${RL(kind,t)}</button>`).join('')}</div></div>`}
 function sheet(){
  const old=$('actOv');if(old)old.remove();if(!sel)return;
  const s=S.students.find(x=>x.id===sel);if(!s){sel=null;return}
  if(!kinds('i').some(k=>k[0]===selKind))selKind=curKind('i');
  const ts=typesOf(selKind);if(!ts.includes(selType))selType='positive';
  const o=document.createElement('div');o.className='act-ov';o.id='actOv';
  o.innerHTML=`<div class="act-sh"><b style="font-size:18px">${esc2(s.name)}</b>${(()=>{const R=dayRecs(s.id,today());return R.length?`<div class="act-h">📋 ثبت‌های امروز (${fa(R.length)})</div>`+R.map(x=>`<div class="act-it"><div>${(TY[x.type]||TY.positive).i} ${x.grp?'👥 ':''}${esc2(kl(x))}<small>${esc2(RL(x.kind||'سایر',x.type))}${x.vol?' · ✋ داوطلب':''}${x.note?' · 📝 '+esc2(x.note):''}</small></div><button class="act-x" data-undo="${x.id}" aria-label="حذف">🗑️</button></div>`).join(''):''})()}
  <b style="font-size:14px;display:block;margin-top:10px">نوع فعالیت</b>${chips('i',selKind,'data-kd')}${subHtml(selKind)}${ctxHtml()}
  <div class="act-tp" style="grid-template-columns:repeat(${ts.length},1fr)">${ts.map(k=>`<button class="${k}${selType===k?' on':''}" data-ty="${k}">${RL(selKind,k)}</button>`).join('')}</div>
  <button class="act-vl${selVol?' on':''}" data-vl="1">✋ داوطلب بود (+۲ امتیاز)</button>
  <button class="act-vl${selNote?' on':''}" data-snt="1">📝 افزودن توضیح</button>${selNote?'<input id="actNote" class="fs" placeholder="📝 توضیح درباره‌ی این فعالیت" style="margin:6px 0 10px">':''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="big" id="actSave" style="font-size:15px;padding:13px">ثبت و بستن</button><button class="big" id="actSave2" style="font-size:15px;padding:13px">ثبت و مورد بعدی ➕</button></div><button class="sm" id="actCancel" style="width:100%;margin-top:8px">انصراف</button></div>`;
  const keep=()=>{const n=$('actNote')?$('actNote').value:'';sheet();if($('actNote'))$('actNote').value=n};
  o.addEventListener('change',e=>{const x=e.target.closest('[data-cx]');if(x){setCx(x);keep()}});
  o.addEventListener('click',e=>{
   if(e.target===o||e.target.id==='actCancel'){sel=null;sheet();return}
   const ty=e.target.closest('[data-ty]');if(ty){selType=ty.dataset.ty;keep();return}
   const kd=e.target.closest('[data-kd]');if(kd){selKind=kd.dataset.kd;keep();return}
   const sb=e.target.closest('[data-sub]');if(sb){const S2=cfg().subs;S2[selKind]=S2[selKind]===sb.dataset.sub?'':sb.dataset.sub;save();keep();return}
   if(e.target.closest('[data-vl]')){selVol=!selVol;keep();return}
   if(e.target.closest('[data-snt]')){selNote=!selNote;keep();if($('actNote'))$('actNote').focus();return}
   const au=e.target.closest('[data-cxauto]');if(au){const c0=cfg();c0.course=+au.dataset.cxauto;c0.tp='';save();keep();render();return}
   const ud=e.target.closest('[data-undo]');if(ud){S.activities=S.activities.filter(x=>String(x.id)!==ud.dataset.undo);fin();keep();return}
   if(e.target.id==='actSave'||e.target.id==='actSave2'){const bm=blockMsg(sel);if(bm){flash(bm);return}add(sel,selType,selKind,{vol:selVol,note:($('actNote')?$('actNote').value:'').trim()});
    if(e.target.id==='actSave2'){selVol=false;selNote=false;fin();sheet();flash('✅ ثبت شد؛ مورد بعدی را وارد کنید');return}
    sel=null;sheet();fin()}});
  document.body.appendChild(o)}
 function setCx(el){const c=cfg();if(el.dataset.cx==='course'){c.course=+el.value||0;c.tp=''}else c.tp=el.value;save()}
 const act=$('act');
 act.addEventListener('change',e=>{const d=e.target.dataset||{};
  if(d.cf){cfg()[d.cf]=+e.target.value;save();render();window.renderSmart&&window.renderSmart();return}
  if(d.cx){setCx(e.target);render();return}
  if(d.nt||d.ntg)save()});
 act.addEventListener('input',e=>{const d=e.target.dataset||{};
  if(e.target.id==='actBkNote'){bkNote=e.target.value;return}
  if(d.nt){const r=S.activities.find(x=>String(x.id)===d.nt);if(r)r.note=e.target.value.trim()}
  else if(d.ntg){S.activities.forEach(x=>{if(x.grp&&gk(x)===d.ntg)x.note=e.target.value.trim()})}});
 act.addEventListener('click',e=>{const g=s=>e.target.closest(s);let b;
  if(armed&&!g('[data-del]')&&!g('[data-delg]')){armed='';if(!g('input,select,textarea,summary'))render()}
  if(b=g('[data-cxauto]')){const c0=cfg();c0.course=+b.dataset.cxauto;c0.tp='';save();render();return}
  if(g('#actSetD>summary'))setOpen=!setOpen;if(g('#actGridD>summary'))gridOpen=!gridOpen;
  if(b=g('[data-mode]')){cfg().mode=b.dataset.mode;save();render();return}
  if(b=g('[data-ck]')){cfg()[modeOf()==='g'?'gkind':'kind']=b.dataset.ck;save();render();return}
  if(b=g('[data-sub]')){const k=curKind(),S2=cfg().subs;S2[k]=S2[k]===b.dataset.sub?'':b.dataset.sub;save();render();return}
  if(g('[data-vol]')){volOn=!volOn;render();return}
  if(g('[data-repick]')){pickNow();render();return}
  if(b=g('[data-rs]')){const[sid,t]=b.dataset.rs.split('|'),bm=blockMsg(+sid);if(bm){flash(bm);return}add(+sid,t,curKind('i'),{vol:volOn});volOn=false;fin();return}
  if(b=g('[data-gr]')){const[t,ty]=b.dataset.gr.split('|'),k=curKind('g'),at=(S.att||{})[today()]||{},m=S.students.filter(s=>s.team===+t&&at[s.id]!=='a');
   if(!m.length){flash('هیچ عضو حاضری برای این تیم نیست');return}
   const gb=Date.now()*100+(seq++%100);const ok=m,skp=0;if(!ok.length){flash('همه‌ی اعضای حاضر این تیم برای این درس و مبحث قبلاً ثبت دارند');return}ok.forEach(s=>add(s.id,ty,k,{grp:+t,gb}));fin();flash('✅ ثبت شد برای '+fa(ok.length)+' عضو '+tname(+t,'تیم '+t)+(skp?' · '+fa(skp)+' نفر قبلاً ثبت داشتند':''));return}
  if(b=g('[data-ntt]')){const k=b.dataset.ntt;noteOpen.has(k)?noteOpen.delete(k):noteOpen.add(k);render();const i=act.querySelector('input[data-nt="'+k+'"],input[data-ntg="'+k.slice(1)+'"]');if(i)i.focus();return}
  if(b=g('[data-bks]')){const id=+b.dataset.bks;bulk.has(id)?bulk.delete(id):bulk.add(id);render();return}
  if(g('[data-bka]')){const at=(S.att||{})[today()]||{};S.students.forEach(s=>{if(at[s.id]!=='a')bulk.add(s.id)});render();return}
  if(g('[data-bkn]')){bulk.clear();render();return}
  if(b=g('[data-bkr]')){const ids0=[...bulk].filter(id=>S.students.some(s=>s.id===id));if(!ids0.length){flash('ابتدا دانش‌آموزان را انتخاب کنید');return}const ids=ids0.filter(id=>!absentToday(id)),skp=ids0.length-ids.length;if(!ids.length){flash('همه‌ی افراد انتخاب‌شده برای این درس و مبحث قبلاً ثبت دارند یا امروز غایب‌اند');return}const nt=($('actBkNote')?$('actBkNote').value:bkNote).trim(),k=curKind('i');ids.forEach(id=>add(id,b.dataset.bkr,k,{note:nt}));bulk.clear();bkNote='';fin();flash('✅ عملکرد '+fa(ids.length)+' دانش‌آموز ثبت شد'+(skp?' · '+fa(skp)+' نفر رد شدند (قبلاً ثبت داشتند یا غایب‌اند)':''));return}
  if(b=g('[data-undo]')){S.activities=S.activities.filter(x=>String(x.id)!==b.dataset.undo);fin();return}
  if(b=g('[data-undog]')){const k=b.dataset.undog;S.activities=S.activities.filter(x=>!(x.grp&&gk(x)===k));fin();return}
  if(b=g('[data-sid]')){if(absentToday(+b.dataset.sid)){flash('این دانش‌آموز امروز غایب است و در فعالیت کلاسی شرکت نمی‌کند');return}sel=+b.dataset.sid;selNote=false;selType='positive';selKind=curKind('i');selVol=false;sheet();return}
  if(b=g('[data-del]')){const id=b.dataset.del;if(armed==='d'+id){armed='';S.activities=S.activities.filter(x=>String(x.id)!==id);fin();flash('🗑️ حذف شد')}else{armed='d'+id;render();setTimeout(()=>{if(armed==='d'+id){armed='';render()}},4000)}return}
  if(b=g('[data-delg]')){const k=b.dataset.delg;if(armed==='g'+k){armed='';S.activities=S.activities.filter(x=>!(x.grp&&gk(x)===k));fin();flash('🗑️ حذف شد')}else{armed='g'+k;render();setTimeout(()=>{if(armed==='g'+k){armed='';render()}},4000)}return}});
 window.renderAct=render;
})();

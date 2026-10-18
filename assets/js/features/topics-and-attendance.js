/* فصل‌ها و مبحث‌ها، حضور و غیاب هفتگی */
(function(){
 const X=window.SCX,{avg,vals,prog,attSt,attKeys,mon,hw,acts,effN}=X;S.ai=S.ai||{};
 const cs=id=>S.courses.find(c=>c.id===id),CH=id=>{const c=cs(id);return c?(c.ch=c.ch||[]):[]},clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),r0=v=>v==null?'—':fa(Math.round(v)),dl=k=>fmt(new Date(k+'T12:00:00Z'));
 const LV={4:'خیلی خوب',3:'خوب',2:'قابل قبول',1:'نیاز به تلاش'},lv=v=>LV[clamp(Math.round(v),1,4)];
 const tpName=(cid,tid)=>{for(const h of CH(cid))for(const t of h.tp)if(t.id===tid)return[h.name,t.name];return null};
 const topicOpts=cid=>CH(cid).map(h=>`<optgroup label="${esc2(h.name)}">${h.tp.map(t=>`<option value="${h.id}:${t.id}">${esc2(t.name)}</option>`).join('')}</optgroup>`).join('');
 const setTp=(x,v)=>{const[h,p]=v.split(':').map(Number);x.ch=h;x.tp=p;if(!x.title){const q=tpName(x.course,p);if(q)x.title=q[0]+' – '+q[1]}};
 const tstat=(cid,tid,sid)=>{const E=S.exams.filter(e=>e.course===cid&&e.tp===tid),v=(sid?[sid]:S.students.map(s=>s.id)).flatMap(id=>E.map(e=>nrm(e,id)).filter(x=>x!=null));return{n:E.length,p:v.length?avg(v)/4*100:null}};
 const col=p=>p==null?'⚪':p>=80?'🟢':p>=60?'🟡':'🔴',bc=p=>p>=80?'#2eaf6b':p>=60?'#f59e0b':'#e5484d';
 const bar=p=>p==null?'':`<div style="background:var(--bg2);border-radius:8px;height:8px;margin-top:4px"><div style="width:${p}%;height:8px;border-radius:8px;background:${bc(p)}"></div></div>`;
 const card=document.createElement('div');card.className='card';card.id='chCard';$('crsList').before(card);let chc=null;
 function renderCh(){if(!S.courses.length){card.innerHTML='<b>🗂️ فصل‌ها و مبحث‌ها</b><p class="sub">ابتدا یک درس اضافه کنید.</p>';return}
  if(!cs(chc))chc=S.courses[0].id;const ch=CH(chc),nt=S.exams.filter(e=>e.course===chc&&!e.tp&&!/پایان نیمسال/.test(e.type||'')).slice(-8).reverse();
  card.innerHTML=`<b>🗂️ فصل‌ها و مبحث‌ها (درس ← فصل ← مبحث)</b><select id="chc" class="fs" style="margin-top:8px">${S.courses.map(c=>`<option value="${c.id}"${c.id===chc?' selected':''}>${esc2(c.name)}</option>`).join('')}</select>
  <div style="display:flex;gap:6px"><input id="chn" placeholder="نام فصل (مثلاً فصل ۲)" style="margin:0;flex:1"><button class="sm" id="cha">➕ فصل</button></div>
  ${ch.map(h=>`<div style="margin-top:10px;border-top:1px dashed var(--line);padding-top:8px"><b>📖 ${esc2(h.name)}</b> <button class="sm" data-ech="${h.id}">✏️</button> <button class="sm" data-dch="${h.id}">🗑️</button>${h.tp.length?`<div class="tpw">${h.tp.map(t=>`<div class="tpi"><span class="tpn">${esc2(t.name)}</span><span class="tpb"><button class="sm" data-etp="${h.id}:${t.id}">✏️</button> <button class="sm" data-dtp="${h.id}:${t.id}">✕</button></span></div>`).join('')}</div>`:''}<div style="display:flex;gap:6px;margin-top:6px"><input data-tn="${h.id}" placeholder="مبحث جدید (مثلاً جمع دو رقمی)" style="margin:0;flex:1"><button class="sm" data-ta="${h.id}">➕ مبحث</button></div></div>`).join('')}
  ${nt.length&&ch.some(h=>h.tp.length)?`<div style="margin-top:12px"><b style="font-size:14px">🔗 آزمون‌های این درس بدون مبحث</b>${nt.map(e=>`<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><span style="flex:1;font-size:13px">${esc2(e.type)} · ${dl(e.date)}${e.title?' · '+esc2(e.title):''}</span><select class="fs" data-set="${e.id}" style="margin:0;width:46%"><option value="">مبحث؟</option>${topicOpts(chc)}</select></div>`).join('')}</div>`:''}`}
 card.addEventListener('change',e=>{const t=e.target;if(t.id==='chc'){chc=+t.value;renderCh();return}if(t.dataset.set&&t.value){const x=S.exams.find(q=>q.id===+t.dataset.set);if(x){setTp(x,t.value);save();renderCh()}}});
 card.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const ch=CH(chc);
  if(t.id==='cha'){const n=$('chn').value.trim();if(n){ch.push({id:Date.now(),name:n,tp:[]});save();renderCh()}}
  else if(t.dataset.ta){const n=card.querySelector(`[data-tn="${t.dataset.ta}"]`).value.trim(),h=ch.find(x=>x.id===+t.dataset.ta);if(n&&h){h.tp.push({id:Date.now(),name:n});save();renderCh()}}
  else if(t.dataset.ech){const H=ch.find(x=>x.id===+t.dataset.ech),n=H&&prompt('نام فصل را ویرایش کنید',H.name);if(n&&n.trim()){H.name=n.trim();save();renderCh()}}
  else if(t.dataset.etp){const[h,p]=t.dataset.etp.split(':').map(Number),H=ch.find(x=>x.id===h),T=H&&H.tp.find(x=>x.id===p),n=T&&prompt('نام مبحث را ویرایش کنید',T.name);if(n&&n.trim()){T.name=n.trim();save();renderCh()}}
  else if(t.dataset.dch){if(!window.tap2(t))return;const id=+t.dataset.dch;cs(chc).ch=ch.filter(h=>h.id!==id);S.exams.forEach(x=>{if(x.ch===id){delete x.ch;delete x.tp}});save();renderCh()}
  else if(t.dataset.dtp){const[h,p]=t.dataset.dtp.split(':').map(Number),H=ch.find(x=>x.id===h);if(!H||!window.tap2(t))return;H.tp=H.tp.filter(x=>x.id!==p);S.exams.forEach(x=>{if(x.tp===p){delete x.ch;delete x.tp}});save();renderCh()}});
 const sel=document.createElement('select');sel.id='etp';sel.className='fs';$('et').after(sel);
 const fillTp=()=>{const cid=+$('ec').value;sel.innerHTML='<option value="">مبحث (اختیاری)</option>'+topicOpts(cid);const fin=/پایان نیمسال/.test($('et').value);sel.style.display=!fin&&CH(cid).some(h=>h.tp.length)?'':'none'};
 $('ec').addEventListener('change',fillTp);$('et').addEventListener('change',fillTp);
 const _ea=$('eadd').onclick;$('eadd').onclick=function(){const n=S.exams.length,v=/پایان نیمسال/.test($('et').value)?'':sel.value;_ea.call(this);if(S.exams.length>n&&v){setTp(S.exams[S.exams.length-1],v);save();window.render()}};
 const _r=window.render;window.render=function(){_r.apply(this,arguments);try{fillTp();if($('crs').classList.contains('on'))renderCh()}catch(e){}};
 const sec=document.createElement('section');sec.id='wk';sec.innerHTML='<h2>🎯 تحلیل و گزارش هوشمند</h2><div id="wkBody"></div>';$('rep').before(sec);let wc=null,ws=null;
 function gen(id){return window.genDesc?window.genDesc(id):''}
 function renderWk(){const root=$('wkBody');if(!S.students.length||!S.courses.length){root.innerHTML='<div class="card"><p class="sub">برای تحلیل، ابتدا دانش‌آموز و درس اضافه کنید.</p></div>';return}
  if(!cs(wc))wc=S.courses[0].id;if(!S.students.some(s=>s.id===ws))ws=S.students[0].id;
  const rows=CH(wc).filter(h=>h.tp.length),all=rows.flatMap(h=>h.tp.map(t=>({t,...tstat(wc,t.id)}))).filter(x=>x.p!=null).sort((a,b)=>a.p-b.p),unt=S.exams.filter(e=>e.course===wc&&!e.tp).length;
  const sug=all.filter(x=>x.p<60).map(x=>`📌 پیشنهاد: قبل از ورود به مبحث بعدی، مبحث «${esc2(x.t.name)}» نیاز به مرور مجدد دارد.`).concat(all.filter(x=>x.p>=60&&x.p<80).map(x=>`💡 مبحث «${esc2(x.t.name)}» با کمی تمرین بیشتر تقویت می‌شود.`));
  const mine=[];S.courses.forEach(c=>CH(c.id).forEach(h=>h.tp.forEach(t=>{const q=tstat(c.id,t.id,ws);if(q.p!=null)mine.push({c,t,p:q.p})})));mine.sort((a,b)=>a.p-b.p);
  const so=S.students.map(s=>`<option value="${s.id}"${s.id===ws?' selected':''}>${esc2(s.name)}</option>`).join(''),tx=(S.desc&&S.desc[ws])||'';
  root.innerHTML=`<div class="card"><b>🎯 نقاط ضعف و قوت کلاس به تفکیک مبحث</b><select id="wkc" class="fs" style="margin-top:8px">${S.courses.map(c=>`<option value="${c.id}"${c.id===wc?' selected':''}>${esc2(c.name)}</option>`).join('')}</select>
  ${rows.length?rows.map(h=>`<div style="margin-top:10px"><b style="font-size:14px">📖 ${esc2(h.name)}</b>${h.tp.map(t=>{const q=tstat(wc,t.id);return `<div style="padding:6px 0"><div style="display:flex;justify-content:space-between"><span>${col(q.p)} ${esc2(t.name)}</span><b>${q.p==null?'بدون ارزیابی':r0(q.p)+'٪'}</b></div>${bar(q.p)}</div>`}).join('')}</div>`).join(''):'<p class="sub">برای این درس فصل و مبحثی تعریف نشده. از بخش «درس‌ها و آزمون‌ها ← فصل‌ها و مبحث‌ها» اضافه کنید.</p>'}
  ${sug.length?`<div style="margin-top:10px">${sug.map(x=>`<div class="sc-al ${x[0]==='📌'?'p1':'p2'}">${x}</div>`).join('')}</div>`:''}${unt?`<p class="sub">${fa(unt)} آزمون این درس مبحث ندارد و در این تحلیل حساب نشده است.</p>`:''}</div>
  <div class="card"><b>👤 تحلیل یک دانش‌آموز</b><select id="wks" class="fs" style="margin-top:8px">${so}</select>
  ${mine.length?mine.slice(0,8).map(x=>`<div style="padding:6px 0"><div style="display:flex;justify-content:space-between"><span>${col(x.p)} ${esc2(x.t.name)} <small style="color:var(--mut)">(${esc2(x.c.name)})</small></span><b>${r0(x.p)}٪</b></div>${bar(x.p)}</div>`).join(''):'<p class="sub">هنوز آزمونی با مبحث برای این دانش‌آموز ثبت نشده.</p>'}
  <b style="display:block;margin-top:12px">📝 گزارش توصیفی</b><p class="sub" style="margin:4px 0">از حضور، نمرات، تکالیف، فعالیت و روند ثبت‌شده ساخته می‌شود؛ متن را می‌توانید ویرایش کنید.</p>
  <textarea id="wkt" rows="7" class="fs" style="width:100%;line-height:1.9" placeholder="برای ساخت گزارش، دکمه‌ی زیر را بزنید"></textarea>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"><button class="big" id="wkg" style="font-size:14px;padding:11px">✨ تولید</button><button class="sm" id="wkv">💾 ذخیره</button><button class="sm" id="wkcp">📋 کپی</button></div><p class="sub" id="wkm"></p></div>`;$('wkt').value=tx}
 sec.addEventListener('change',e=>{if(e.target.id==='wkc'){wc=+e.target.value;renderWk()}if(e.target.id==='wks'){ws=+e.target.value;renderWk()}});
 sec.addEventListener('click',e=>{const id=e.target.id;if(id==='wkg'){$('wkt').value=gen(ws)}
  else if(id==='wkv'){S.desc=S.desc||{};S.desc[ws]=$('wkt').value;save();$('wkm').textContent='✅ ذخیره شد'}
  else if(id==='wkcp'){const t=$('wkt');t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>$('wkm').textContent='📋 کپی شد',()=>{document.execCommand('copy');$('wkm').textContent='📋 کپی شد'})}});
 const an=document.createElement('div');an.className='card';an.id='attAn';$('attBody').after(an);
 function renderAn(){const st=S.students,cm=mon(iso(tdy())),ms=[...new Set(Object.keys(S.att).filter(k=>!(S.closed||{})[k]).map(mon))].sort().slice(-4),W=X.alerts().filter(x=>/غایب|تأخیر|حضور|غیبت/.test(x[2]));
  an.innerHTML=`<b>📈 تحلیل حضور و روند (${fa(W.length)} هشدار)</b>${W.map(x=>`<div class="sc-al p${x[0]}">${x[1]} ${x[2]}</div>`).join('')}<div class="wrap"><table class="at" style="margin-top:8px"><tr><th>نام</th><th>حضور کل</th><th>این ماه</th><th>روند ماهانه</th><th>غیبت</th><th>تأخیر</th></tr>${st.map(s=>{const a=attSt(s.id),m=attSt(s.id,k=>mon(k)===cm),t=ms.map(q=>attSt(s.id,k=>mon(k)===q).pct).filter(v=>v!=null),ic=t.length>1?(t[t.length-1]>t[0]?'📈':t[t.length-1]<t[0]?'📉':'➖'):'';return `<tr><td class="sc-nm" style="text-align:right;word-break:break-word">${esc2(s.name)}</td><td style="color:${a.pct!=null&&a.pct<85?'#c0262c':'inherit'}">${a.pct==null?'—':r0(a.pct)+'٪'}</td><td>${m.pct==null?'—':r0(m.pct)+'٪'}</td><td>${t.length?t.map(r0).join(' ← ')+' '+ic:'—'}</td><td>${fa(a.a)}</td><td>${fa(m.l)}</td></tr>`}).join('')}</table></div>`}
 const _ra=window.renderAtt;window.renderAtt=function(){_ra.apply(this,arguments);try{renderAn()}catch(e){}};try{renderAn();fillTp()}catch(e){}
 pages.push(['wk','🎯 تحلیل و گزارش هوشمند']);const b=document.createElement('button');b.textContent='🎯 تحلیل و گزارش هوشمند';b.dataset.p='wk';b.onclick=()=>show('wk');[...nav.querySelectorAll('summary')].find(s=>s.textContent.includes('گزارش‌ها')).parentNode.appendChild(b);
 const _show=window.show;window.show=function(id){_show(id);if(id==='wk')renderWk();if(id==='crs')renderCh()};
 window.WKX={tstat,CH,lv,cs};
})();

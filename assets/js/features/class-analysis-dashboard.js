/* داشبورد مدیر و تحلیل کلاس */
(function(){
const $=id=>document.getElementById(id),E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'),K='cl_pin',KS='cl_salt',root=document.documentElement;
const gi=g=>{const i=GR.indexOf(g);return i<0?9:i};
function calc(){const st=S.students;let p=0,t=0;Object.keys(S.att||{}).forEach(k=>{const d=S.att[k];st.forEach(s=>{const v=d[s.id];if(v){t++;if(v!=='a'||isExc(k,s.id))p++}})});
 const ov=id=>mean(S.courses.map(c=>cAvg(id,c.id,S.exams)).filter(nn));
 const av=st.map(s=>ov(s.id)).filter(nn),T=iso(tdy()),TA=S.att[T]||{};
 let gd=[];try{gd=progList().map(x=>x.P.d)}catch(e){}
 let hd=0,ht=0;(S.hwl||[]).forEach(h=>Object.values(h.st||{}).forEach(v=>{if(v==='d'||v==='p'||v==='n'){ht++;if(v==='d')hd++}}));
 const cr=S.courses.map(c=>({n:c.name,a:mean(S.exams.filter(e=>e.course===c.id).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn))})).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);
 const rk=st.map(s=>({n:s.name,o:ov(s.id)})).filter(x=>x.o!=null).sort((a,b)=>b.o-a.o);
 return{n:st.length,avg:av.length?Math.round(mean(av)*100)/100:null,att:t?Math.round(p/t*100):null,low:av.filter(v=>v<2.5).length,hi:av.filter(v=>v>=3.5).length,ta:st.filter(s=>TA[s.id]==='a'&&!isExc(T,s.id)).length,d:T,
  gr:gd.length?Math.round(mean(gd)*100)/100:null,up:gd.filter(v=>v>=.3).length,dn:gd.filter(v=>v<=-.3).length,hw:ht?Math.round(hd/ht*100):null,ex:S.exams.length,
  bc:cr.length?cr[0].n:null,wc:cr.length>1?cr[cr.length-1].n:null,tp:rk.slice(0,3).map(x=>x.n)}}
let tmr;function upd(){clearTimeout(tmr);tmr=setTimeout(()=>{try{const c=(S.classes||[]).find(x=>x.id===S.cur);if(!c)return;const o=calc();if(JSON.stringify(o)!==JSON.stringify(c.sum)){c.sum=o;save()}}catch(e){}},500)}
const _R=render;render=function(){_R.apply(this,arguments);upd()};upd();
const _sh=smartHome;smartHome=function(){_sh();try{const box=$('smart');if(!box||!S.students.length)return;const c=calc();if(c.ex===0&&c.att==null)return;
 const gcol=c.gr==null?'#8a7aa6':c.gr>=.3?'#1a8f55':c.gr<=-.3?'#e5484d':'#8a7aa6',gtx=c.gr==null?'داده‌ی کافی برای روند ثبت نشده':(c.gr>=.3?'📈 رشد':c.gr<=-.3?'📉 افت':'➖ ثابت')+' '+fa((c.gr>0?'+':'')+c.gr.toFixed(1).replace('.','٫'));
 const st=[];if(c.bc)st.push('📚 قوی‌ترین درس: '+E(c.bc));if(c.tp.length)st.push('🏅 برترین‌ها: '+c.tp.map(E).join('، '));if(c.hi)st.push('🌟 '+fa(c.hi)+' دانش‌آموز با میانگین بالای ۳٫۵');if(c.att!=null&&c.att>=90)st.push('✅ حضور کلاس '+fa(c.att)+'٪');if(c.hw!=null&&c.hw>=80)st.push('📝 تکالیف '+fa(c.hw)+'٪ انجام شده');
 const wk=[];if(c.wc)wk.push('📌 ضعیف‌ترین درس: '+E(c.wc));if(c.low)wk.push('⚠️ '+fa(c.low)+' دانش‌آموز با میانگین زیر ۲٫۵');if(c.dn)wk.push('📉 '+fa(c.dn)+' دانش‌آموز در حال افت');if(c.hw!=null&&c.hw<60)wk.push('📚 فقط '+fa(c.hw)+'٪ تکالیف انجام شده');
 box.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:12px"><b>📊 تحلیل کلاس</b><div class="stats" style="margin-top:8px"><div class="st" style="--c:${gcol}"><b style="font-size:17px">${gtx}</b><span>روند میانگین نمرات</span></div><div class="st" style="--c:#1a8f55"><b>${fa(c.up)}</b><span>در حال پیشرفت</span></div><div class="st" style="--c:#e5484d"><b>${fa(c.dn)}</b><span>در حال افت</span></div></div>
 <div style="margin-top:8px"><b style="font-size:14px">🌟 نقاط قوت</b>${st.length?st.map(x=>`<div style="padding:3px 0;font-size:14px">${x}</div>`).join(''):'<p class="sub" style="margin:4px 0">هنوز داده‌ی کافی ثبت نشده</p>'}</div>
 ${wk.length?`<div style="margin-top:8px"><b style="font-size:14px">⚠️ نیازمند توجه</b>${wk.map(x=>`<div style="padding:3px 0;font-size:14px">${x}</div>`).join('')}</div>`:''}
 <button class="sm" id="th_r" style="margin-top:10px">📄 گزارش کامل ←</button></div>`)}catch(e){console.warn('tsum',e)}};
document.addEventListener('click',e=>{if(e.target.id==='th_r')show('mgr')});
(function(){
const css=`
#home.tdon #smart,#home.tdon #stats{display:none}#hk{display:none!important}.tk>div[data-k]:active{transform:scale(.97)}@media(min-width:700px){#tdash2 .tk{grid-template-columns:repeat(3,1fr)}}
.tdg{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin:0 0 14px}
.tdg>*{grid-column:1/-1;min-width:0}
.tw{background:var(--card);border-radius:20px;padding:16px;box-shadow:0 4px 16px #7e57c21f}
.tw h3{margin:0 0 12px;font-size:15px;display:flex;align-items:center;gap:8px;color:var(--tx)}
.tw h3 small{margin-right:auto;color:var(--mut);font-weight:500;font-size:12px}
.thero{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;border-radius:22px;padding:18px 20px;box-shadow:0 8px 24px #7e57c244}
.thero b{font-size:20px;display:block}.thero span{font-size:13px;opacity:.9}
.thero .tc{background:#ffffff2e;border-radius:14px;padding:8px 14px;font-size:13px;font-weight:700}
.tk{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.tk>div{background:var(--card);border-radius:18px;padding:14px;border-top:4px solid var(--c);box-shadow:0 4px 12px #7e57c21a;display:flex;flex-direction:column;gap:2px}
.tk i{font-style:normal;font-size:22px}.tk b{font-size:26px;line-height:1.2}.tk span{color:var(--mut);font-size:12.5px}.tk em{font-style:normal;font-size:11.5px;color:var(--mut)}
.tcl{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.tcl button{text-align:right;font:inherit;color:var(--tx);background:var(--bg2);border:2px solid transparent;border-radius:16px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:6px}
.tcl button.cur{border-color:var(--p);background:var(--card);box-shadow:0 4px 14px #7e57c233}
.tcl b{font-size:15px}.tcl small{color:var(--mut);font-size:12px}
.tcl .rw{display:flex;justify-content:space-between;align-items:center;font-size:13px}
.chip{display:inline-block;border-radius:20px;padding:2px 10px;font-size:11.5px;font-weight:800;color:#fff;white-space:nowrap}
.tac{display:flex;flex-direction:column;gap:8px}
.tac button{font:inherit;text-align:right;border:0;border-radius:14px;padding:11px 12px;cursor:pointer;display:flex;gap:10px;align-items:center;color:var(--tx);background:var(--bg2);border-right:5px solid var(--c)}
.tac button span{font-size:13.5px;flex:1}.tac button u{text-decoration:none;color:var(--mut)}
.tok{padding:14px;text-align:center;color:var(--ok);font-weight:700;font-size:14px}
.tat{display:flex;flex-direction:column;gap:8px}
.tat div{display:flex;align-items:center;gap:10px;background:var(--bg2);border-radius:14px;padding:9px 12px}
.tat .av{flex:none;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;display:grid;place-items:center;font-weight:800}
.tat p{margin:0;flex:1;min-width:0}.tat p b{display:block;font-size:14px}.tat p span{font-size:12px;color:var(--mut)}
.tch{width:100%;height:auto;display:block}
.tab{display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:6px}
.tab div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%;font-size:11px;color:var(--mut)}
.tab i{display:block;width:100%;max-width:34px;border-radius:8px 8px 4px 4px;background:linear-gradient(180deg,var(--p2),var(--p))}
.tdn{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center}
.tdn ul{list-style:none;margin:0;padding:0;font-size:13px;display:flex;flex-direction:column;gap:6px}
.tdn li:before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--c);margin-left:8px}
.tsw{display:flex;flex-direction:column;gap:7px;font-size:13.5px;line-height:1.7}
.tsw div{padding:6px 10px;border-radius:12px;background:var(--bg2)}
.trk div{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px}
.trk div:last-child{border:0}.trk b{margin-right:auto}
.tem{color:var(--mut);font-size:13px;text-align:center;padding:14px 0;margin:0}
@media(min-width:640px){.tk{grid-template-columns:repeat(3,1fr)}.c4,.c6,.c8{grid-column:span 6}}
@media(min-width:1100px){.tk{grid-template-columns:repeat(6,1fr)}.c4{grid-column:span 4}.c6{grid-column:span 6}.c8{grid-column:span 8}}
@media(max-width:380px){.tk b{font-size:22px}.thero b{font-size:17px}}
`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
const go=id=>show(document.getElementById(id)?id:'att');
document.addEventListener('click',e=>{const q=e.target.closest&&e.target.closest('#tdash2 .tk>div[data-k]');if(q&&q.dataset.k){const k=q.dataset.k;if(['p','a','l','all'].includes(k)&&window.lst)lst(k);else show(document.getElementById(k)?k:'att');return}const b=e.target.closest&&e.target.closest('[data-tgo]');if(b)go(b.dataset.tgo);const k=e.target.closest&&e.target.closest('[data-tcls]');if(k&&window.switchCls)switchCls(+k.dataset.tcls||k.dataset.tcls)});
const lvl=v=>v==null?['—','#8a7aa6']:v>=3.5?['عالی','#1a8f55']:v>=3?['خوب','#3b82d8']:v>=2.5?['قابل قبول','#d98600']:['نیازمند توجه','#e5484d'];
const donut=(parts,mid)=>{const R=40,C=2*Math.PI*R,tot=parts.reduce((a,p)=>a+p.v,0);let o=0;const arcs=tot?parts.filter(p=>p.v>0).map(p=>{const l=p.v/tot*C,s=`<circle cx="60" cy="60" r="${R}" fill="none" stroke="${p.c}" stroke-width="14" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"/>`;o+=l;return s}).join(''):'';return `<svg viewBox="0 0 120 120" width="120" height="120" role="img"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="14"/>${arcs}<text x="60" y="66" text-anchor="middle" font-size="19" font-weight="800" fill="var(--tx)">${mid}</text></svg>`};
const line=vals=>{if(vals.length<2)return '<p class="tem">برای رسم روند، حداقل دو ارزیابی لازم است.</p>';const W=300,H=130,p=22,x=i=>W-p-i*(W-2*p)/(vals.length-1),y=v=>H-p-(v/4)*(H-2*p);const pts=vals.map((v,i)=>[x(i),y(v)]),d=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
return `<svg class="tch" viewBox="0 0 ${W} ${H}" role="img" aria-label="روند میانگین">${[0,2,4].map(g=>`<line x1="${p}" x2="${W-p}" y1="${y(g)}" y2="${y(g)}" stroke="var(--line)"/><text x="${p-6}" y="${y(g)+4}" font-size="10" text-anchor="end" fill="var(--mut)">${fa(g)}</text>`).join('')}<path d="${d} L${pts[pts.length-1][0]} ${H-p} L${pts[0][0]} ${H-p} Z" fill="var(--p)" opacity=".12"/><path d="${d}" fill="none" stroke="var(--p)" stroke-width="2.5" stroke-linejoin="round"/>${pts.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="var(--p)"><title>${f1(vals[i])}</title></circle>`).join('')}<text x="${pts[0][0]}" y="${pts[0][1]-8}" font-size="11" font-weight="700" text-anchor="middle" fill="var(--tx)">${f1(vals[0])}</text><text x="${pts[pts.length-1][0]}" y="${pts[pts.length-1][1]-8}" font-size="11" font-weight="700" text-anchor="middle" fill="var(--tx)">${f1(vals[vals.length-1])}</text></svg>`};
function tdash(){try{
 const home=document.getElementById('home');if(!home)return;let box=document.getElementById('tdash2');
 const st=S.students;if(!st.length){if(box)box.innerHTML='';home.classList.remove('tdon');return}
 if(!box){box=document.createElement('div');box.id='tdash2';box.className='tdg';home.insertBefore(box,document.getElementById('stats'))}
 home.classList.add('tdon');
 const T=iso(tdy()),c=calc(),TA=S.att[T]||{},rec=Object.keys(TA).length>0,hl=hol(tdy());
 const pc=st.filter(s=>TA[s.id]==='p'||TA[s.id]==='l').length,ac=st.filter(s=>TA[s.id]==='a'&&!isExc(T,s.id)).length;
 const ex=S.exams.slice().sort((a,b)=>a.date.localeCompare(b.date));
 const dk=Object.keys(S.att).filter(k=>k<=T&&!S.closed[k]&&!hol(new Date(k+'T12:00:00Z'))&&st.some(s=>(S.att[k]||{})[s.id])).sort();
 const ser=id=>ex.map(e=>nrm(e,id)).filter(nn),ov=id=>mean(S.courses.map(q=>cAvg(id,q.id,S.exams)).filter(nn));
 const R=[];st.forEach(s=>{const why=[];let run=0;for(let i=dk.length-1;i>=0;i--){if((S.att[dk[i]]||{})[s.id]==='a'&&!isExc(dk[i],s.id))run++;else break}
  if(run>=3)why.push(fa(run)+' غیبت متوالی');const l10=dk.slice(-10),a10=l10.filter(k=>(S.att[k]||{})[s.id]==='a'&&!isExc(k,s.id)).length;if(run<3&&a10>=3)why.push(fa(a10)+' غیبت در '+fa(l10.length)+' روز اخیر');
  const v=ser(s.id),av=mean(v);if(av!=null&&av<2.5)why.push('میانگین '+f1(av));
  if(v.length>=4){const h=Math.floor(v.length/2);if(mean(v.slice(h))-mean(v.slice(0,h))<=-.5)why.push('روند نزولی')}
  if(why.length)R.push({s,why,u:why.length>=2||(av!=null&&av<2)||run>=5})});
 R.sort((a,b)=>(b.u-a.u)||b.why.length-a.why.length);
 const cr=S.courses.map(q=>({n:q.name,a:mean(ex.filter(e=>e.course===q.id).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn))})).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);
 const trend=ex.map(e=>mean(st.map(s=>nrm(e,s.id)).filter(nn))).filter(nn).slice(-8).reverse();
 const days=dk.slice(-7).reverse().map(k=>{const d=S.att[k]||{};let t=0,p=0;st.forEach(s=>{const v=d[s.id];if(v){t++;if(v!=='a')p++}});return{d:fa(jp(new Date(k+'T12:00:00Z')).d),v:t?Math.round(p/t*100):0}});
 const H={d:0,p:0,n:0};(S.hwl||[]).forEach(h=>Object.values(h.st||{}).forEach(v=>{if(H[v]!=null)H[v]++}));const ht=H.d+H.p+H.n;
 const top=st.map(s=>({s,o:ov(s.id)})).filter(x=>x.o!=null).sort((a,b)=>b.o-a.o).slice(0,5);
 const act=[];
 if(!rec&&!hl)act.push(['#f59e0b','📋','حضور و غیاب امروز هنوز ثبت نشده','att']);
 if(R.filter(r=>r.u).length)act.push(['#e5484d','🚨',fa(R.filter(r=>r.u).length)+' دانش‌آموز نیازمند پیگیری فوری','sf']);
 if(ac>=1)act.push(['#f59e0b','📞',fa(ac)+' غایب امروز؛ پیگیری با خانواده','att']);
 if(H.n)act.push(['#e5484d','📚',fa(H.n)+' مورد تکلیف انجام‌نشده ثبت شده','att']);
 if(!ex.length)act.push(['#7e57c2','📝','هنوز ارزیابی یا آزمونی ثبت نشده','crs']);
 if(cr.length>1&&cr[cr.length-1].a<3)act.push(['#7e57c2','🔁','مرور درس «'+esc2(cr[cr.length-1].n)+'» (میانگین '+f1(cr[cr.length-1].a)+')','crs']);
 const sg=[],wk=[];
 if(c.bc)sg.push('📚 قوی‌ترین درس: '+esc2(c.bc));if(c.hi)sg.push('🌟 '+fa(c.hi)+' دانش‌آموز با میانگین بالای ۳٫۵');if(c.up)sg.push('📈 '+fa(c.up)+' دانش‌آموز در حال پیشرفت');if(c.att!=null&&c.att>=90)sg.push('✅ حضور کلاس '+fa(c.att)+'٪');if(c.hw!=null&&c.hw>=80)sg.push('📝 تکالیف '+fa(c.hw)+'٪ انجام شده');
 if(c.wc)wk.push('📌 ضعیف‌ترین درس: '+esc2(c.wc));if(c.low)wk.push('⚠️ '+fa(c.low)+' دانش‌آموز با میانگین زیر ۲٫۵');if(c.dn)wk.push('📉 '+fa(c.dn)+' دانش‌آموز در حال افت');if(c.hw!=null&&c.hw<60)wk.push('📚 فقط '+fa(c.hw)+'٪ تکالیف انجام شده');if(c.att!=null&&c.att<85)wk.push('📅 حضور کلاس '+fa(c.att)+'٪');
 const Lv=lvl(c.avg),P=S.prof||{};let sy='';try{sy=syLab(SY)}catch(e){}
 let wd='';try{wd=new Date().toLocaleDateString('fa-IR',{weekday:'long'})}catch(e){}
  const kp=(i,v,n,sub,col,k)=>`<div style="--c:${col};cursor:pointer" data-k="${k||''}"><i>${i}</i><b>${v}</b><span>${n}</span><em>${sub}</em></div>`;
 const gtx=c.gr==null?'—':(c.gr>=.3?'رشد ':c.gr<=-.3?'افت ':'ثابت ')+fa((c.gr>0?'+':'')+c.gr.toFixed(1).replace('.','٫'));
 const lt=st.filter(s=>TA[s.id]==='l').length;
 box.innerHTML=`
 <div class="thero"><div><b>سلام${P.teacher?'، '+esc2(P.teacher):''} 👋</b><span>${wd} ${fmt(tdy())}${sy?' · سال تحصیلی '+sy:''}${P.school?' · '+esc2(schoolFull(P)):''}</span></div><div class="tc">${Lv[0]==='—'?'وضعیت کلی: داده‌ی کافی نیست':'وضعیت کلی کلاس: '+Lv[0]}</div></div>
 <div class="tk">
  ${kp('👥',fa(c.n),'دانش‌آموز',(rec?fa(pc)+' حاضر · '+fa(ac)+' غایب امروز':hl?'امروز تعطیل است':'حضور امروز ثبت نشده'),'#3b6fd8','all')}
  ${kp('✅',fa(pc),'حاضر امروز',rec?(lt?fa(lt)+' مورد تأخیر':'بدون تأخیر'):'ثبت نشده','#2eaf6b','p')}
  ${kp('❌',fa(ac),'غایب امروز',rec?(ac?'نیازمند پیگیری':'همه حاضر'):'ثبت نشده','#e5484d','a')}
  ${kp('📅',c.att==null?'—':fa(c.att)+'٪','درصد حضور',c.att==null?'داده‌ای ثبت نشده':'کل سال','#16a085','att')}
  ${kp('📊',f1(c.avg),'میانگین کلاس (از ۴)',Lv[0],Lv[1],'rep')}
  ${kp('📈',gtx,'روند نمرات',c.gr==null?'داده‌ی کافی نیست':fa(c.up)+' پیشرفت · '+fa(c.dn)+' افت','#7e57c2','rep')}
  ${kp('📝',c.hw==null?'—':fa(c.hw)+'٪','تکالیف انجام‌شده',ht?fa(ht)+' ثبت':'داده‌ای ثبت نشده','#f59e0b','att')}
  ${kp('⚠️',fa(R.length),'نیازمند توجه',R.length?fa(R.filter(r=>r.u).length)+' مورد فوری':'موردی نیست',R.length?'#e5484d':'#2eaf6b','sf')}
  ${kp('🏅',fa(typeof NT!=='undefined'?NT:0),'تیم','رقابت تیمی','#9b6fd0','teams')}
  </div>
 
 <div class="tw c4"><h3>✅ نیازمند اقدام</h3>${act.length?`<div class="tac">${act.map(a=>`<button data-tgo="${a[3]}" style="--c:${a[0]}"><span>${a[1]} ${a[2]}</span><u>‹</u></button>`).join('')}</div>`:'<div class="tok">🎉 کار فوری ندارید</div>'}</div>
 <div class="tw c8"><h3>🧑‍🎓 دانش‌آموزان نیازمند توجه<small>${R.length>6?'و '+fa(R.length-6)+' مورد دیگر':''}</small></h3>${R.length?`<div class="tat">${R.slice(0,6).map(r=>`<div>${window.stAv?stAv(r.s,38):''}<p><b>${esc2(r.s.name)}</b><span>${r.why.join('، ')}</span></p><span class="chip" style="background:${r.u?'#e5484d':'#f59e0b'}">${r.u?'فوری':'متوسط'}</span></div>`).join('')}</div>`:'<p class="tem">در حال حاضر دانش‌آموزی در فهرست نیازمند توجه نیست 🌟</p>'}</div>
 <div class="tw c6"><h3>📈 روند میانگین ارزیابی‌ها<small>${fa(trend.length)} ارزیابی اخیر</small></h3>${line(trend)}</div>
 <div class="tw c6"><h3>📚 عملکرد دروس<small>میانگین از ۴</small></h3>${cr.length?cr.map(x=>bar(x.n,x.a)).join(''):'<p class="tem">هنوز نمره‌ای ثبت نشده است.</p>'}</div>
 <div class="tw c4"><h3>📅 حضور و غیاب<small>${fa(days.length)} روز اخیر</small></h3>${days.length?`<div class="tab">${days.map(d=>`<div><span>${fa(d.v)}٪</span><i style="height:${Math.max(4,d.v)*.8}%"></i><span>${d.d}</span></div>`).join('')}</div>`:'<p class="tem">هنوز حضور و غیابی ثبت نشده.</p>'}</div>
 <div class="tw c4"><h3>📝 وضعیت تکالیف</h3>${ht?`<div class="tdn">${donut([{v:H.d,c:'#2eaf6b'},{v:H.p,c:'#f59e0b'},{v:H.n,c:'#e5484d'}],fa(Math.round((H.d+H.p*.5)/ht*100))+'٪')}<ul><li style="--c:#2eaf6b">کامل: ${fa(H.d)}</li><li style="--c:#f59e0b">ناقص: ${fa(H.p)}</li><li style="--c:#e5484d">انجام‌نشده: ${fa(H.n)}</li></ul></div>`:'<p class="tem">هنوز تکلیفی ثبت نشده است.</p>'}</div>
 <div class="tw c4"><h3>🏆 دانش‌آموزان برتر</h3>${top.length?`<div class="trk">${top.map((x,i)=>`<div><span>${['🥇','🥈','🥉','④','⑤'][i]}</span>${window.stAv?stAv(x.s,30):''}<span>${esc2(x.s.name)}</span><b>${f1(x.o)}</b></div>`).join('')}</div>`:'<p class="tem">هنوز نمره‌ای ثبت نشده است.</p>'}</div>
 <div class="tw c6"><h3>🌟 نقاط قوت</h3>${sg.length?`<div class="tsw">${sg.map(x=>`<div>${x}</div>`).join('')}</div>`:'<p class="tem">هنوز داده‌ی کافی ثبت نشده</p>'}</div>
 <div class="tw c6"><h3>🔎 نقاط ضعف</h3>${wk.length?`<div class="tsw">${wk.map(x=>`<div>${x}</div>`).join('')}</div>`:'<p class="tem">مورد قابل‌توجهی دیده نمی‌شود 👌</p>'}</div>
 <div><button class="sm" id="th_r" style="width:100%;padding:12px">📄 گزارش کامل ←</button></div>`;
}catch(e){console.warn('tdash',e)}}
const _s2=smartHome;smartHome=function(){_s2.apply(this,arguments);tdash()};
try{smartHome()}catch(e){}
})();

window.renderDm=()=>{const T=iso(tdy()),C=S.classes.filter(c=>!c.demo&&window.clsOK(c.id)).slice().sort((a,b)=>gi(clsMeta(a).g)-gi(clsMeta(b).g)),sm=c=>c.id===S.cur?calc():(c.sum||null);
 let N=0,A=0,AN=0,P=0,PN=0,H=0,HN=0;
 C.forEach(c=>{const s=sm(c);if(!s)return;N+=s.n;if(s.avg!=null){A+=s.avg*s.n;AN+=s.n}if(s.att!=null){P+=s.att*s.n;PN+=s.n}if(s.hw!=null){H+=s.hw*s.n;HN+=s.n}});
 const k=(n,v,c)=>`<div class="st" style="--c:${c}"><b>${v}</b><span>${n}</span></div>`,al=[],sg=[];
 const gc=g=>g==null?'—':`<span style="font-weight:800;color:${g>=.3?'#1a8f55':g<=-.3?'#e5484d':'inherit'}">${g>=.3?'📈':g<=-.3?'📉':'➖'} ${fa((g>0?'+':'')+g.toFixed(1).replace('.','٫'))}</span>`;
 const rows=C.map(c=>{const s=sm(c),m=clsMeta(c),L=E(clsLab(c));
  if(s){if(s.low)al.push(`⚠️ ${L}: ${fa(s.low)} دانش‌آموز با میانگین پایین`);if(s.att!=null&&s.att<85)al.push(`📅 ${L}: حضور ${fa(s.att)}٪ است`);
   if(s.gr!=null&&s.gr<=-.3)al.push(`📉 ${L}: روند نمرات کلاس نزولی است (${fa((s.gr>0?'+':'')+s.gr.toFixed(1).replace('.','٫'))})`);if(s.hw!=null&&s.hw<60)al.push(`📚 ${L}: فقط ${fa(s.hw)}٪ تکالیف انجام شده است`);
   if(s.avg!=null&&s.avg>=3.3)sg.push(`🌟 ${L}: میانگین عالی (${f1(s.avg)})`);if(s.att!=null&&s.att>=95)sg.push(`✅ ${L}: حضور ${fa(s.att)}٪`);if(s.gr!=null&&s.gr>=.3)sg.push(`📈 ${L}: رشد نمرات (${fa((s.gr>0?'+':'')+s.gr.toFixed(1).replace('.','٫'))})`);if(s.hi)sg.push(`🏅 ${L}: ${fa(s.hi)} دانش‌آموز با میانگین بالای ۳٫۵`)}
  return `<tr><td class="nm">${L}${c.id===S.cur?' ✅':''}<br><span class="tm">${E(m.t||'—')}</span></td>${s?`<td>${fa(s.n)}</td><td style="font-weight:800;color:${s.avg==null?'inherit':s.avg<2.5?'#e5484d':s.avg<3?'#f59e0b':'#1a8f55'}">${s.avg==null?'—':f1(s.avg)}</td><td>${gc(s.gr)}</td><td>${s.att==null?'—':fa(s.att)+'٪'}</td><td>${s.hw==null?'—':fa(s.hw)+'٪'}</td><td>${s.low?'⚠️ '+fa(s.low):'—'}</td><td>${s.d===T?fa(s.ta):'—'}</td>`:'<td colspan="7">هنوز باز نشده</td>'}<td>${c.id===S.cur?'':`<button class="sm" data-o="${c.id}">باز کردن</button>`}</td></tr>`}).join('');
 const by={};C.forEach(c=>{const g=clsMeta(c).g||'';(by[g]=by[g]||[]).push(c)});
 const cmp=Object.keys(by).filter(g=>by[g].length>1).map(g=>`<div class="cgr"><b>📚 ${g?'پایه '+E(g):'بدون پایه'}</b>${by[g].map(c=>{const s=sm(c);return s&&s.avg!=null?bar(clsLab(c)+' · '+(clsMeta(c).t||'—'),s.avg):`<div class="br"><span class="bl">${E(clsLab(c))}</span><b>—</b></div>`}).join('')}</div>`).join('');
 const tops=C.map(c=>sm(c)).filter(x=>x&&x.tp&&x.tp.length).length;
 $('dmb').innerHTML=`<div class="stats">${k('کلاس',fa(C.length),'#7e57c2')}${k('دانش‌آموز',fa(N),'#3b6fd8')}${k('میانگین مدرسه (از ۴)',AN?f1(A/AN):'—','#9b6fd0')}${k('درصد حضور',PN?fa(Math.round(P/PN))+'٪':'—','#2eaf6b')}${k('تکالیف انجام‌شده',HN?fa(Math.round(H/HN))+'٪':'—','#f59e0b')}</div>
 <div class="card" style="margin-top:10px"><b>🏫 وضعیت کلاس‌ها</b><div class="wrap"><table class="at"><tr><th class="nm">کلاس</th><th>نفر</th><th>میانگین</th><th>رشد</th><th>حضور</th><th>تکالیف</th><th>نیازمند توجه</th><th>غایب امروز</th><th></th></tr>${rows}</table></div><p class="lg">آمار هر کلاس آخرین باری که آن کلاس باز بوده به‌روز شده است. رشد = تغییر میانگین نمرات از ابتدا تا انتهای سال (از ۴).</p></div>
 ${cmp?`<div class="card"><b>⚖️ مقایسه‌ی کلاس‌های هم‌پایه (میانگین از ۴)</b>${cmp}</div>`:''}
 <div class="card"><b>🚦 هشدارهای مدرسه</b>${al.length?al.map(x=>`<div style="padding:6px 0;font-size:14px">${x}</div>`).join(''):'<p class="sub">هشداری وجود ندارد 🌟</p>'}</div>
 <div class="card"><b>🌟 نقاط قوت مدرسه</b>${sg.length?sg.map(x=>`<div style="padding:6px 0;font-size:14px">${x}</div>`).join(''):'<p class="sub">هنوز داده‌ی کافی برای نقاط قوت ثبت نشده است</p>'}</div>
 <div class="card"><button class="big" id="dm_r" style="font-size:15px;padding:12px">🧾 گزارش‌های مدیر و خروجی PDF/اکسل ←</button></div>`};
$('dmb').addEventListener('click',e=>{if(e.target.id==='dm_r'){show('mgr');return}const o=e.target.dataset.o;if(o)window.switchCls(+o)});
(function(){
const css=`
.tdm-bars{display:flex;align-items:flex-end;gap:10px;height:190px;overflow-x:auto;padding:4px 2px 0}
.tdm-bars>div{flex:1 0 46px;max-width:90px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;font-size:11.5px;color:var(--mut);text-align:center}
.tdm-bars b{color:var(--tx);font-size:12.5px}
.tdm-bars i{display:block;width:100%;max-width:42px;border-radius:10px 10px 4px 4px;min-height:4px}
.tdm-pb{display:flex;align-items:center;gap:8px;font-size:13px;margin:7px 0}
.tdm-pb span{flex:0 0 30%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tdm-pb u{flex:1;height:10px;border-radius:10px;background:var(--line);overflow:hidden;text-decoration:none;display:block}
.tdm-pb u i{display:block;height:100%;border-radius:10px}
.tdm-pb b{flex:0 0 40px;text-align:left}
.tdm-t{width:100%;border-collapse:collapse;font-size:13px}
.tdm-t th{background:transparent!important;color:var(--mut)!important;font-weight:700;padding:8px 6px;text-align:right;word-break:break-word;border-bottom:2px solid var(--line)}
.tdm-t td{padding:9px 6px;border-bottom:1px solid var(--line);white-space:nowrap}
.tdm-t td:first-child{white-space:normal;min-width:110px}
.tdm-t button{font:700 12px inherit;font-family:inherit;border:0;border-radius:10px;padding:6px 10px;background:var(--bg2);color:var(--p);cursor:pointer}
.tdm-sc{overflow-x:auto}
.tdg .tk.k7{}@media(min-width:1100px){.tdg .tk.k7{grid-template-columns:repeat(7,1fr)}}
.tdm-why{display:flex;flex-wrap:wrap;gap:4px;white-space:normal}
.tdm-why span{font-size:11.5px;background:#e5484d1f;color:var(--no);border-radius:10px;padding:2px 8px;font-weight:700}
`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
const lvl=v=>v==null?['—','#8a7aa6']:v>=3.5?['عالی','#1a8f55']:v>=3?['خوب','#3b82d8']:v>=2.5?['قابل قبول','#d98600']:['نیازمند توجه','#e5484d'];
const donut=(parts,mid)=>{const R=40,C=2*Math.PI*R,tot=parts.reduce((a,p)=>a+p.v,0);let o=0;const arcs=tot?parts.filter(p=>p.v>0).map(p=>{const l=p.v/tot*C,s=`<circle cx="60" cy="60" r="${R}" fill="none" stroke="${p.c}" stroke-width="14" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"/>`;o+=l;return s}).join(''):'';return `<svg viewBox="0 0 120 120" width="130" height="130" role="img"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="14"/>${arcs}<text x="60" y="66" text-anchor="middle" font-size="19" font-weight="800" fill="var(--tx)">${mid}</text></svg>`};
const gtx=g=>g==null?'—':(g>=.3?'📈 ':g<=-.3?'📉 ':'➖ ')+fa((g>0?'+':'')+g.toFixed(1).replace('.','٫'));
window.clsStats=c=>{try{if(c.id===S.cur)return calc();const T=S.stash&&S.stash[c.id];if(!T)return c.sum||null;const real=S;const tmp=Object.assign({att:{},exams:[],courses:[],hwl:[],closed:{},students:[],classes:real.classes,cur:c.id,prof:{},stash:{},archive:real.archive},T);S=tmp;try{return calc()}finally{S=real}}catch(e){return c.sum||null}};
const _d=window.renderDm;
window.renderDm=function(){_d.apply(this,arguments);try{
 const box=document.getElementById('dmb');if(!box)return;
 const T=iso(tdy()),C=S.classes.filter(c=>!c.demo&&window.clsOK(c.id)).slice().sort((a,b)=>gi(clsMeta(a).g)-gi(clsMeta(b).g));
 const sm=c=>window.clsStats(c);
 const D=C.map(c=>({c,s:sm(c),L:clsLab(c),m:clsMeta(c)}));
 const V=D.filter(x=>x.s);
 let N=0,A=0,AN=0,P=0,PN=0,H=0,HN=0,LOW=0,HI=0,AB=0;
 V.forEach(({s})=>{N+=s.n;LOW+=s.low||0;HI+=s.hi||0;if(s.d===T)AB+=s.ta||0;if(s.avg!=null){A+=s.avg*s.n;AN+=s.n}if(s.att!=null){P+=s.att*s.n;PN+=s.n}if(s.hw!=null){H+=s.hw*s.n;HN+=s.n}});
 const avg=AN?A/AN:null,att=PN?Math.round(P/PN):null,hw=HN?Math.round(H/HN):null,Lv=lvl(avg);
 const al=[],sg=[],need=[];
 V.forEach(({s,L,c})=>{const why=[];
  if(s.low){why.push(fa(s.low)+' دانش‌آموز با میانگین پایین');al.push(`⚠️ ${esc2(L)}: ${fa(s.low)} دانش‌آموز با میانگین پایین`)}
  if(s.att!=null&&s.att<85){why.push('حضور '+fa(s.att)+'٪');al.push(`📅 ${esc2(L)}: حضور ${fa(s.att)}٪`)}
  if(s.gr!=null&&s.gr<=-.3){why.push('روند نزولی');al.push(`📉 ${esc2(L)}: روند نمرات نزولی`)}
  if(s.hw!=null&&s.hw<60){why.push('تکالیف '+fa(s.hw)+'٪');al.push(`📚 ${esc2(L)}: فقط ${fa(s.hw)}٪ تکالیف انجام شده`)}
  if(s.avg!=null&&s.avg>=3.3)sg.push(`🌟 ${esc2(L)}: میانگین عالی (${f1(s.avg)})`);
  if(s.att!=null&&s.att>=95)sg.push(`✅ ${esc2(L)}: حضور ${fa(s.att)}٪`);
  if(s.gr!=null&&s.gr>=.3)sg.push(`📈 ${esc2(L)}: رشد نمرات`);
  if(s.hi)sg.push(`🏅 ${esc2(L)}: ${fa(s.hi)} دانش‌آموز با میانگین بالای ۳٫۵`);
  if(why.length)need.push({L,id:c.id,why,avg:s.avg})});
 need.sort((a,b)=>b.why.length-a.why.length);
 const mid=Math.max(0,N-HI-LOW);
 const TM={};V.forEach(({s,L,m})=>{const k=String((m&&m.t)||'').trim();if(!k)return;const o=TM[k]=TM[k]||{n:k,cl:[],N:0,A:0,AN:0,P:0,PN:0,H:0,HN:0,low:0};o.cl.push(L);o.N+=s.n;o.low+=s.low||0;if(s.avg!=null){o.A+=s.avg*s.n;o.AN+=s.n}if(s.att!=null){o.P+=s.att*s.n;o.PN+=s.n}if(s.hw!=null){o.H+=s.hw*s.n;o.HN+=s.n}});
 const TL=Object.values(TM).map(o=>Object.assign(o,{avg:o.AN?o.A/o.AN:null,att:o.PN?Math.round(o.P/o.PN):null,hw:o.HN?Math.round(o.H/o.HN):null})).sort((a,b)=>(b.avg==null)-(a.avg==null)||(b.avg-a.avg));
 const P0=S.prof||{};let sy='',wd='';try{sy=syLab(SY)}catch(e){}try{wd=new Date().toLocaleDateString('fa-IR',{weekday:'long'})}catch(e){}
 const kp=(i,v,n,sub,col,m)=>`<div style="--c:${col};cursor:pointer" data-m="${m||''}"><i>${i}</i><b>${v}</b><span>${n}</span><em>${sub}</em></div>`;
 const open=id=>id===S.cur?'<span class="chip" style="background:#7e57c2">فعال</span>':`<button data-o="${id}">باز کردن</button>`;
 const unopened=D.length-V.length;
 box.innerHTML=`<div class="tdg">
 <div class="thero"><div><b>داشبورد مدیر 👔</b><span>${wd} ${fmt(tdy())}${(window.isSchoolManager&&window.isSchoolManager())?' · مدیر مدرسه':''}${sy?' · سال تحصیلی '+sy:''}${P0.school?' · '+esc2(P0.school):''}</span></div><div class="tc">${Lv[0]==='—'?'عملکرد کلی: داده‌ی کافی نیست':'عملکرد کلی مدرسه: '+Lv[0]}</div></div>
 <div class="tk k7">
  ${kp('🏫',fa(D.length),'کلاس',unopened?fa(unopened)+' کلاس بدون اطلاعات':'همه‌ی کلاس‌ها دارای آمار','#7e57c2','cls')}
  ${kp('👥',fa(N),'دانش‌آموز',unopened?'بدون '+fa(unopened)+' کلاس بدون اطلاعات':(AB?fa(AB)+' غایب امروز':'مجموع همه کلاس‌ها'),'#3b6fd8','stu')}
  ${kp('📊',f1(avg),'میانگین مدرسه (از ۴)',Lv[0],Lv[1],'avg')}
  ${kp('📅',att==null?'—':fa(att)+'٪','میانگین حضور',att==null?'داده‌ای نیست':'همه‌ی کلاس‌ها','#2eaf6b','att')}
  ${kp('📝',hw==null?'—':fa(hw)+'٪','تکالیف انجام‌شده',hw==null?'داده‌ای نیست':'همه‌ی کلاس‌ها','#f59e0b','hw')}
  ${kp('⚠️',fa(LOW),'دانش‌آموز نیازمند توجه','میانگین زیر ۲٫۵',LOW?'#e5484d':'#2eaf6b','low')}
  ${kp('🧑‍🏫',fa(TL.length),'معلم فعال',TL.length?fa(D.length)+' کلاس':'نام معلم کلاس‌ها ثبت نشده','#9b6fd0','tch')}
 </div>
 <div class="tw c8"><h3>⚖️ مقایسه‌ی میانگین کلاس‌ها<small>از ۴</small></h3>${V.some(x=>x.s.avg!=null)?`<div class="tdm-bars">${V.filter(x=>x.s.avg!=null).map(({s,L})=>`<div><b>${f1(s.avg)}</b><i style="height:${s.avg/4*78}%;background:${lvl(s.avg)[1]}"></i><span>${esc2(L)}</span></div>`).join('')}</div>`:'<p class="tem">هنوز نمره‌ای ثبت نشده است.</p>'}</div>
 <div class="tw c4"><h3>🍩 وضعیت دانش‌آموزان</h3>${N&&AN?`<div class="tdn">${donut([{v:HI,c:'#2eaf6b'},{v:mid,c:'#3b82d8'},{v:LOW,c:'#e5484d'}],fa(N))}<ul><li style="--c:#2eaf6b">عالی (≥۳٫۵): ${fa(HI)}</li><li style="--c:#3b82d8">میانی: ${fa(mid)}</li><li style="--c:#e5484d">نیازمند توجه: ${fa(LOW)}</li></ul></div>`:'<p class="tem">هنوز داده‌ی کافی نیست.</p>'}</div>
 <div class="tw c6"><h3>📅 حضور کلاس‌ها</h3>${V.some(x=>x.s.att!=null)?V.filter(x=>x.s.att!=null).map(({s,L})=>`<div class="tdm-pb"><span>${esc2(L)}</span><u><i style="width:${s.att}%;background:${s.att>=90?'#2eaf6b':s.att>=85?'#f59e0b':'#e5484d'}"></i></u><b>${fa(s.att)}٪</b></div>`).join(''):'<p class="tem">هنوز حضور و غیابی ثبت نشده.</p>'}</div>
 <div class="tw c6"><h3>📝 تکالیف کلاس‌ها</h3>${V.some(x=>x.s.hw!=null)?V.filter(x=>x.s.hw!=null).map(({s,L})=>`<div class="tdm-pb"><span>${esc2(L)}</span><u><i style="width:${s.hw}%;background:${s.hw>=80?'#2eaf6b':s.hw>=60?'#f59e0b':'#e5484d'}"></i></u><b>${fa(s.hw)}٪</b></div>`).join(''):'<p class="tem">هنوز تکلیفی ثبت نشده.</p>'}</div>
 <div class="tw"><h3>🧑‍🏫 عملکرد معلمان<small>بر اساس آمار کلاس‌های هر معلم</small></h3>${TL.length?`<div class="tdm-sc"><table class="tdm-t"><tr><th>رتبه</th><th>معلم</th><th>کلاس‌ها</th><th>دانش‌آموز</th><th>میانگین</th><th>حضور</th><th>تکالیف</th><th>وضعیت</th></tr>${TL.map((o,i)=>`<tr><td>${o.avg==null?'—':['🥇','🥈','🥉'][i]||fa(i+1)}</td><td><b>${esc2(o.n)}</b></td><td style="white-space:normal">${o.cl.map(esc2).join('، ')}</td><td>${fa(o.N)}</td><td>${f1(o.avg)}</td><td>${o.att==null?'—':fa(o.att)+'٪'}</td><td>${o.hw==null?'—':fa(o.hw)+'٪'}</td><td><span class="chip" style="background:${lvl(o.avg)[1]}">${lvl(o.avg)[0]}</span></td></tr>`).join('')}</table></div><p class="tem" style="padding-bottom:0">رتبه فقط از میانگین نمرات دانش‌آموزان همان معلم محاسبه می‌شود و به شرایط هر کلاس بستگی دارد؛ ملاک تنها قضاوت نیست.</p>`:'<p class="tem">نام معلم هر کلاس را در «مدرسه و کلاس‌ها» وارد کنید تا اینجا نمایش داده شود.</p>'}</div>
 <div class="tw"><h3>🚦 کلاس‌های نیازمند توجه</h3>${need.length?`<div class="tdm-sc"><table class="tdm-t"><tr><th>کلاس</th><th>موارد</th><th>میانگین</th><th></th></tr>${need.map(x=>`<tr><td><b>${esc2(x.L)}</b></td><td><div class="tdm-why">${x.why.map(w=>`<span>${w}</span>`).join('')}</div></td><td>${f1(x.avg)}</td><td>${open(x.id)}</td></tr>`).join('')}</table></div>`:'<p class="tem">هیچ کلاسی هشدار ندارد 🌟</p>'}</div>
 <div class="tw"><h3>🏫 وضعیت همه‌ی کلاس‌ها<small>آمار زنده‌ی هر کلاس</small></h3><div class="tdm-sc"><table class="tdm-t"><tr><th>کلاس</th><th>نفر</th><th>میانگین</th><th>رشد</th><th>حضور</th><th>تکالیف</th><th>غایب امروز</th><th></th></tr>${D.map(({c,s,L,m})=>`<tr><td><b>${esc2(L)}</b><br><small style="color:var(--mut)">${esc2(m.t||'—')}</small></td>${s?`<td>${fa(s.n)}</td><td><span class="chip" style="background:${lvl(s.avg)[1]}">${f1(s.avg)}</span></td><td>${gtx(s.gr)}</td><td>${s.att==null?'—':fa(s.att)+'٪'}</td><td>${s.hw==null?'—':fa(s.hw)+'٪'}</td><td>${s.d===T?fa(s.ta||0):'—'}</td>`:'<td colspan="6">بدون اطلاعات</td>'}<td>${open(c.id)}</td></tr>`).join('')}</table></div></div>
 <div class="tw c6"><h3>🌟 نقاط قوت مدرسه</h3>${sg.length?`<div class="tsw">${sg.slice(0,6).map(x=>`<div>${x}</div>`).join('')}</div>`:'<p class="tem">هنوز داده‌ی کافی ثبت نشده</p>'}</div>
 <div class="tw c6"><h3>⚠️ هشدارهای مدرسه</h3>${al.length?`<div class="tsw">${al.slice(0,6).map(x=>`<div>${x}</div>`).join('')}</div>`:'<p class="tem">هشداری وجود ندارد 🌟</p>'}</div>
 <div><button class="sm" id="dm_r" style="width:100%;padding:12px">🧾 گزارش‌های مدیر و خروجی PDF/اکسل ←</button></div>
 </div>`}catch(e){console.warn('dm2',e)}};

const stl2=document.createElement('style');stl2.textContent='#dmsh{position:fixed;inset:0;z-index:998;display:none;align-items:flex-end;justify-content:center;background:rgba(30,20,50,.5)}#dmsh.open{display:flex}#dmsh .bx{background:var(--card);border-radius:22px 22px 0 0;width:100%;max-width:560px;max-height:82vh;overflow:auto;padding:14px;animation:dmup .25s ease}@keyframes dmup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}#dmsh h3{margin:0 0 10px;display:flex;justify-content:space-between;align-items:center}#dmsh .r{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--line)}#dmsh .r .t{flex:1;min-width:0}#dmsh .r .t b{display:block;font-size:14px}#dmsh .r .t small{color:var(--mut)}#dmsh .cd{font-weight:800;letter-spacing:1px;color:var(--p)}';document.head.appendChild(stl2);
const sh=document.createElement('div');sh.id='dmsh';sh.innerHTML='<div class="bx"></div>';document.body.appendChild(sh);
sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-x]'))sh.classList.remove('open');const o=e.target.closest('[data-go]');if(o){sh.classList.remove('open');const id=+o.dataset.go;if(window.switchCls)switchCls(id);show('home')}});
const allStu=()=>{try{ensureCodes()}catch(e){}const out=[];S.classes.filter(c=>!c.demo&&window.clsOK(c.id)).forEach(c=>{const T=c.id===S.cur?S:(S.stash&&S.stash[c.id])||{};(T.students||[]).filter(x=>!x.demo).forEach(x=>out.push({s:x,I:(T.info||{})[x.id]||{},L:clsLab(c)}))});return out};
document.addEventListener('click',e=>{const q=e.target.closest&&e.target.closest('#dmb .tk>div[data-m]');if(!q)return;const m=q.dataset.m;
 const C=S.classes.filter(c=>!c.demo&&window.clsOK(c.id)).slice().sort((a,b)=>gi(clsMeta(a).g)-gi(clsMeta(b).g)),row=(av,t,sub,end)=>`<div class="r">${av||''}<div class="t"><b>${t}</b><small>${sub||''}</small></div>${end||''}</div>`;
 let h='',t='';
 if(m==='stu'){t='👥 دانش‌آموزان مدرسه';const A=allStu().sort((a,b)=>a.s.name.localeCompare(b.s.name,'fa'));h=A.map(x=>row(window.stAv?stAv(x.s,40):'',esc2(x.s.name),esc2(x.L),`<span class="cd">${fa(x.I.sc||'—')}</span>`)).join('')||'<p class="tem">دانش‌آموزی نیست</p>'}
 else if(m==='tch'){t='🧑‍🏫 معلمان فعال';const M={};C.forEach(c=>{const k=String((clsMeta(c)||{}).t||'').trim();if(k)(M[k]=M[k]||[]).push(clsLab(c))});h=Object.keys(M).map(k=>row('<span style="font-size:26px">🧑‍🏫</span>',esc2(k),M[k].map(esc2).join('، '),`<span class="chip" style="background:#7e57c2">${fa(M[k].length)} کلاس</span>`)).join('')||'<p class="tem">نام معلم برای کلاس‌ها ثبت نشده</p>'}
 else{const tt={cls:'🏫 کلاس‌ها',avg:'📊 میانگین کلاس‌ها',att:'📅 حضور کلاس‌ها',hw:'📝 تکالیف کلاس‌ها',low:'⚠️ نیازمند توجه'};t=tt[m]||'';
  h=C.map(c=>{const st=window.clsStats(c),L=clsLab(c),me=clsMeta(c)||{};let v='',sub=esc2(me.t||'—');
   if(!st)v='—';else if(m==='avg')v=f1(st.avg);else if(m==='att')v=st.att==null?'—':fa(st.att)+'٪';else if(m==='hw')v=st.hw==null?'—':fa(st.hw)+'٪';else if(m==='low')v=fa(st.low||0)+' نفر';else v=fa(st.n)+' نفر';
   return row('',esc2(L),sub,`<b>${v}</b> <button class="sm" data-go="${c.id}">باز کردن</button>`)}).join('')}
 sh.querySelector('.bx').innerHTML=`<h3><span>${t}</span><button class="sm" data-x="1">✕</button></h3>${h}`;sh.classList.add('open')});
})();

(function(){
const $=id=>document.getElementById(id);
const css=`
.stav{border-radius:50%;object-fit:cover;flex:none;background:var(--bg2);box-shadow:0 2px 6px #7e57c233}
.ed .top{align-items:center}
#idc{position:fixed;inset:0;z-index:999;display:none;align-items:center;justify-content:center;background:rgba(30,20,50,.5);padding:14px;overflow:auto}
#idc.open{display:flex}#idc .bx{background:var(--card);border-radius:20px;padding:14px;width:100%;max-width:440px;margin:auto}
.idcard{border:2px solid var(--p);border-radius:18px;overflow:hidden;background:#fff;color:#2b2140;font-size:13px}
.idcard .hd{background:linear-gradient(120deg,var(--p),var(--p2));color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.idcard .hd b{font-size:15px}.idcard .hd span{font-size:11.5px;opacity:.9}
.idcard .bd{display:flex;gap:12px;padding:14px;align-items:flex-start}
.idcard .bd img{border-radius:14px;width:92px;height:112px;object-fit:cover;background:#f0eaf8;flex:none;border:2px solid #e3d9f3}
.idcard dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:5px 10px;flex:1;min-width:0}
.idcard dt{color:#7a6a98;white-space:nowrap}.idcard dd{margin:0;font-weight:700;overflow-wrap:anywhere}
.idcard .ft{display:flex;justify-content:space-around;background:#f6f1fc;padding:8px;font-size:12px;border-top:1px solid #e3d9f3}
@media print{body>*:not(#idc){display:none!important}#idc{position:static!important;background:none!important;display:block!important;padding:0!important}#idc .bx{box-shadow:none;max-width:none;background:none;padding:0}#idc .noprint{display:none!important}}
`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
const svg=(bg1,bg2,hair,skin,girl,neutral)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><path d="M12 100c0-22 17-34 38-34s38 12 38 34z" fill="${neutral?'#fff':girl?'#f06fa4':'#3b82d8'}" opacity=".95"/>${girl?`<path d="M26 52c-4-30 10-40 24-40s28 10 24 40c0 12-4 20-8 24l-4-30H38l-4 30c-4-4-8-12-8-24z" fill="${hair}"/>`:''}<circle cx="50" cy="44" r="19" fill="${skin}"/>${neutral?'':girl?`<path d="M31 42c2-14 10-20 19-20s17 6 19 20c-8-3-14-9-17-14-3 6-10 12-21 14z" fill="${hair}"/><circle cx="68" cy="26" r="5" fill="#ff8fb8"/>`:`<path d="M31 42c-2-16 8-24 19-24s21 8 19 24c-4-6-8-9-12-10-6 3-16 3-26 10z" fill="${hair}"/>`}<circle cx="43" cy="46" r="2" fill="#2b2140"/><circle cx="57" cy="46" r="2" fill="#2b2140"/><path d="M44 54q6 5 12 0" stroke="#2b2140" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const URI=x=>'data:image/svg+xml;utf8,'+encodeURIComponent(x);
const AV={m:URI(svg('#cfe3ff','#a9c8f5','#3a2a20','#f4c9a0',0,0)),f:URI(svg('#ffd9e8','#f7b6d2','#4a2a22','#f6cfae',1,0)),n:URI(svg('#e6dcf7','#cdbbea','#6b4fa0','#f0d4b8',0,1))};
const gOf=s=>{const t=stN(S.prof&&S.prof.stype);return t==='دخترانه'?'f':t==='پسرانه'?'m':'n'};
window.stAvSrc=s=>s&&s.photo?s.photo:AV[gOf(s)];
window.stAv=(s,z)=>`<img class="stav" src="${stAvSrc(s)}" width="${z}" height="${z}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${AV.n.replace(/'/g,'%27')}'">`;
try{if(typeof smartHome==='function')smartHome()}catch(e){}
const ST=['','پسرانه','دخترانه'];
(function(){const i=$('p_school');if(!i||$('p_stype'))return;const w=document.createElement('div');w.innerHTML='<label class="sum">نوع مدرسه</label><select id="p_stype" class="fs">'+ST.map(x=>`<option value="${x}">${x||'انتخاب کنید'}</option>`).join('')+'</select>';i.after(w);const s=$('p_stype');S.prof.stype=stN(S.prof.stype);s.value=S.prof.stype;s.onchange=e=>{S.prof.stype=e.target.value;save();render()}})();
const sp=$('spro');
if(sp)new MutationObserver(()=>{const nm=sp.querySelector('input[data-nm]');if(!nm||sp.querySelector('[data-idc]'))return;const id=+nm.dataset.sid,s=S.students.find(x=>x.id===id);if(!s)return;const I=S.info[id]||{};
 nm.insertAdjacentHTML('afterend',`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label>کد دانش‌آموزی (۵ رقم)</label><input data-f="sc" value="${esc2(I.sc||'')}" inputmode="numeric" maxlength="5" dir="ltr" autocomplete="off" style="margin:0;text-align:right"></div></div><button class="sm" data-idc="${id}" style="margin:8px 0;width:100%">🪪 کارت شناسایی دانش‌آموز</button>`)}).observe(sp,{childList:true});
if(sp){sp.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.gd){const s=S.students.find(x=>x.id===+t.dataset.gd);if(s){s.gd=t.value;save()}}});
sp.addEventListener('click',e=>{const t=e.target;if(t.dataset&&t.dataset.idc)idCard(+t.dataset.idc)})}
const box=document.createElement('div');box.id='idc';document.body.appendChild(box);
window.idCard=id=>{const s=S.students.find(x=>x.id===id);if(!s)return;const I=S.info[id]||{};const c=S.classes.find(q=>q.id===S.cur)||{};
 const cl=window.clsLab?clsLab(c):'';const ov=mean(S.courses.map(q=>cAvg(id,q.id,S.exams)).filter(nn));
 let p=0,t=0;Object.keys(S.att).forEach(k=>{const v=S.att[k]&&S.att[k][id];if(v){t++;if(v!=='a')p++}});
 let sy='';try{sy=syLab(SY)}catch(e){}
 const g=gOf(s),gt=g==='m'?'پسر':g==='f'?'دختر':'—';const P=S.prof||{};
 const row=(a,b)=>b?`<dt>${a}</dt><dd>${esc2(b)}</dd>`:'';
 const par=[I.fn&&'پدر: '+I.fn,I.mn&&'مادر: '+I.mn].filter(Boolean).join(' · ');
 const tel=[I.fp,I.mp,I.hp,I.ep].filter(Boolean)[0];
 box.innerHTML=`<div class="bx"><div class="idcard"><div class="hd"><b>${esc2(P.school?schoolFull(P):'مدرسه')}</b><span>${sy?' · '+sy:''}</span></div><div class="bd"><img src="${stAvSrc(s)}" alt=""><dl>${row('نام',s.name)}${row('کد دانش‌آموزی',I.sc)}${row('کلاس',cl)}${row('تاریخ تولد',I.bd)}${row('والدین',par)}${row('تماس',tel)}${row('وضعیت',I.ls)}</dl></div><div class="ft"><span>میانگین: <b>${ov==null?'—':f1(ov)}</b></span><span>حضور: <b>${t?fa(Math.round(p/t*100))+'٪':'—'}</b></span></div></div><div class="noprint" style="display:flex;gap:8px;margin-top:10px"><button class="big" id="idp" style="flex:1;font-size:14px;padding:10px">🖨 چاپ</button><button class="sm" id="idx">بستن</button></div></div>`;box.classList.add('open')};
box.addEventListener('click',e=>{const t=e.target;if(t.id==='idc'||t.id==='idx')box.classList.remove('open');if(t.id==='idp')window.print()});
const DID=9999001,hasDemo=()=>S.classes.some(c=>c.demo);
function demoOn(){if(hasDemo())return;const nm=[['آرین کاظمی','m'],['سارا موسوی','f'],['امیرحسین نوری','m'],['مهسا رحیمی','f'],['پارسا فرهادی','m'],['الناز صادقی','f'],['کیان شریفی','m'],['یاسمن کریمی','f']];
 const st=nm.map((n,i)=>({id:DID+i+1,name:n[0],score:1000,team:i%3+1,att:'',gd:n[1],demo:true}));const crs=[{id:DID+101,name:'ریاضی'},{id:DID+102,name:'فارسی'},{id:DID+103,name:'علوم'}];
 const D=k=>{const d=new Date();d.setDate(d.getDate()-k);return d.toISOString().slice(0,10)};const ex=[],att={},hwl=[];let n=DID+200;
 for(let k=40;k>=2;k-=6)crs.forEach((c,ci)=>{const sc={};st.forEach((s,i)=>sc[s.id]=Math.max(5,Math.min(20,9+i*1.2+ci+((k*(i+2))%5))));ex.push({id:n++,date:D(k),course:c.id,max:20,type:'آزمون',scores:sc})});
 for(let k=14;k>=1;k--){const d={};st.forEach((s,i)=>d[s.id]=((k*(i+3))%11===0)?'a':((k+i)%9===0?'l':'p'));att[D(k)]=d}
 for(let k=12;k>=1;k-=3){const s={};st.forEach((x,i)=>s[x.id]=['d','d','p','n'][(k+i)%4]);hwl.push({id:n++,date:D(k),course:crs[0].id,title:'تکلیف نمونه',st:s})}
 S.classes.push({id:DID,name:'🧪 کلاس نمونه (آزمایشی)',teacher:'معلم نمونه',demo:true});
 S.stash[DID]={students:st,drawn:[],att,closed:{},exams:ex,courses:crs,info:{},hwl,notes:{},desc:{},bin:[],activities:[],tnm:[],ai:{},prof:{grade:'',sec:'',teacher:'معلم نمونه'}};save()}
function demoOff(){if(S.cur===DID)return false;delete S.stash[DID];S.classes=S.classes.filter(c=>!c.demo&&window.clsOK(c.id));save();return true}
const _rc=window.renderCls;window.renderCls=function(){_rc.apply(this,arguments);const b=$('clsb');if(!b)return;const on=hasDemo();b.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:12px"><b>🧪 داده‌ی آزمایشی</b><p class="sub" style="text-align:right;margin:6px 0">یک کلاس جدا با ۸ دانش‌آموز، حضور و غیاب، نمره و تکلیف نمونه می‌سازد تا طراحی را امتحان کنید. با اطلاعات واقعی شما مخلوط نمی‌شود و در آمار «داشبورد مدیر» حساب نمی‌شود.</p><button class="big" id="dm_on" style="font-size:14px;padding:10px">${on?'🗑 حذف کامل کلاس نمونه':'➕ ساخت کلاس نمونه'}</button><p class="sub" id="dm_m" style="margin:6px 0 0"></p></div>`)};
document.addEventListener('click',e=>{if(e.target.id!=='dm_on')return;if(hasDemo()){if(!demoOff()){$('dm_m').textContent='ابتدا به کلاس دیگری بروید، سپس کلاس نمونه را حذف کنید.';return}}else demoOn();renderCls()});
})();

const _c=window.renderCls;window.renderCls=function(){_c();const A=S.archive||{},ys=Object.keys(A).sort().reverse(),act=S.classes.find(c=>c.id===S.cur);
 const li=ys.map(y=>`<div class="crow"><div><b>سال تحصیلی ${E(y)}</b><small>${Object.values(A[y]).map(c=>E(c.label)+' ('+fa(c.st.length)+' نفر)').join('، ')}</small></div></div>`).join('')||'<p class="sub">هنوز سالی بایگانی نشده است</p>';
 $('clsb').insertAdjacentHTML('beforeend',`<div class="card"><b>📦 پایان سال تحصیلی و بایگانی</b><p class="sub" style="text-align:right;margin:6px 0">خلاصهٔ نتایج هر دانش‌آموز (میانگین، حضور، رتبه) در برنامه بایگانی می‌شود و در پروندهٔ او دیده می‌شود. سپس حضور و غیاب، آزمون‌ها، تکالیف و فعالیت‌های کلاس فعال برای سال جدید پاک می‌شود؛ دانش‌آموزان و مشخصات و عکس‌هایشان می‌ماند. بایگانی کامل همان فایل پشتیبان است، پس ابتدا پشتیبان بگیرید.</p><label class="sum" style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="ar_p" checked style="width:auto;margin:0"> ارتقای پایه‌ی این کلاس (درس‌ها پاک می‌شود؛ بعد دکمهٔ «افزودن درس‌های پیشنهادی» را بزنید)</label><button class="big" id="ar_b" style="font-size:15px;padding:12px;margin-top:8px">📦 بایگانی سال و شروع سال جدید: ${E(clsLab(act))}</button><p class="sub" id="ar_m"></p>${li}</div>`)};
document.addEventListener('click',async e=>{const t=e.target;if(t.id!=='ar_b')return;const m=x=>$('ar_m').textContent=x;
 if(Date.now()-(+sessionStorage.getItem('bk_ok')||0)>3600000){m('⚠️ اول در صفحهٔ «پشتیبان و امنیت» یک پشتیبان کامل بگیرید؛ این کار اطلاعات سال را پاک می‌کند.');return}
 if(!window.tap2(t))return;
 const Y=syLab(SY),rk=classTable().rk,act=S.classes.find(c=>c.id===S.cur);S.archive=S.archive||{};
 const st=S.students.map(s=>{let p=0,l=0,a=0;Object.values(S.att).forEach(d=>{const v=d[s.id];if(v==='p')p++;else if(v==='l')l++;else if(v==='a')a++});const n=p+l+a;return{id:s.id,name:s.name,fn:((S.info||{})[s.id]||{}).fn||'',avg:overall(s.id),att:n?Math.round((p+l)/n*100):null,ab:a,rank:rk.findIndex(r=>r.s.id===s.id)+1}});
 (S.archive[Y]=S.archive[Y]||{})[S.cur]={label:clsLab(act),grade:S.prof.grade,sec:S.prof.sec,teacher:S.prof.teacher,st};
 S.att={};S.attx={};S.closed={};S.exams=[];S.hwl=[];S.activities=[];S.desc={};S.notes={};S.drawn=[];S.ai={};if(S.mot){S.mot.log=[];S.mot.exc={}}S.students.forEach(s=>{s.score=1000});
 let msg='✅ بایگانی شد؛ کلاس برای سال جدید آماده است';
 if($('ar_p').checked){const i=GR.indexOf(S.prof.grade);if(i>=0&&i<GR.length-1){S.prof.grade=GR[i+1];S.courses=[];msg+=' · پایه به «'+S.prof.grade+'» ارتقا یافت'}else msg+=' · پایه ارتقا نیافت (آخرین پایه یا انتخاب‌نشده)'}
 save();render();window.renderCls();$('ar_m').textContent=msg});
const _s=window.renderSF;window.renderSF=function(){_s();const id=window.__sfid,A=S.archive||{},r=[];Object.keys(A).sort().forEach(y=>Object.values(A[y]).forEach(c=>{const q=c.st.find(x=>x.id===id);if(q)r.push([y,c.label,q])}));
 if(r.length)$('sfb').insertAdjacentHTML('beforeend',`<div class="card" style="grid-column:1/-1"><b>📚 سوابق سال‌های قبل</b><div class="wrap"><table class="at"><tr><th>سال</th><th>کلاس</th><th>میانگین</th><th>حضور</th><th>رتبه</th></tr>${r.map(([y,l,q])=>`<tr><td>${E(y)}</td><td>${E(l)}</td><td>${q.avg==null?'—':f1(q.avg)}</td><td>${q.att==null?'—':fa(q.att)+'٪'}</td><td>${q.rank?fa(q.rank):'—'}</td></tr>`).join('')}</table></div></div>`)};
const _s2=window.renderSF;window.renderSF=function(){_s2();const q=($('sfq').value||'').trim();if(!q||(S.classes||[]).length<2)return;
 const r=[];S.classes.forEach(c=>{if(c.id===S.cur||!window.clsOK(c.id))return;const T=S.stash[c.id];if(!T)return;(T.students||[]).forEach(s=>{const fn=((T.info||{})[s.id]||{}).fn||'';if((s.name+' '+fn).includes(q))r.push([c,s,fn])})});
 if(r.length)$('sfb').insertAdjacentHTML('beforeend',`<div class="card" style="grid-column:1/-1"><b>🔎 این نام در کلاس‌های دیگر</b>${r.slice(0,12).map(([c,s,fn])=>`<div class="crow"><div><b>${E(s.name)}</b><small>${E(clsLab(c))}${fn?' · پدر: '+E(fn):''}</small></div><button data-gs="${c.id}" data-gq="${E(s.name)}">باز کردن کلاس</button></div>`).join('')}</div>`)};
document.addEventListener('click',e=>{const t=e.target;if(t.dataset&&t.dataset.gs){try{sessionStorage.setItem('sf_q',t.dataset.gq)}catch(x){}window.__goto='sf';window.switchCls(+t.dataset.gs)}});
const ENC=new TextEncoder(),hx=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''),LK='cl_lkout';
const salt=()=>{let s=localStorage.getItem(KS);if(!s){s=hx(crypto.getRandomValues(new Uint8Array(16)));localStorage.setItem(KS,s)}return s};
const sha=async p=>hx(await crypto.subtle.digest('SHA-256',ENC.encode(salt()+'|'+p)));
const hash=async p=>{const k=await crypto.subtle.importKey('raw',ENC.encode(p),'PBKDF2',false,['deriveBits']);return 'p2:'+hx(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:ENC.encode(salt()),iterations:150000},k,256))};
const chk=async p=>{const st=localStorage.getItem(K)||'';if(st.indexOf('p2:')===0)return(await hash(p))===st;if((await sha(p))===st){try{localStorage.setItem(K,await hash(p))}catch(e){}return true}return false};
const lst=()=>{try{return JSON.parse(localStorage.getItem(LK)||'{}')}catch(e){return{}}};
const fail=()=>{const x=lst();x.bad=(x.bad||0)+1;x.tot=(x.tot||0)+1;if(x.bad>=5){x.until=Date.now()+[3e4,12e4,6e5,36e5][Math.min(3,Math.floor((x.tot-1)/5))];x.bad=0}try{localStorage.setItem(LK,JSON.stringify(x))}catch(e){}return x};
const waitTx=u=>{const sec=Math.ceil((u-Date.now())/1e3);return 'رمز چند بار اشتباه وارد شد؛ '+(sec>=60?fa(Math.ceil(sec/60))+' دقیقه':fa(sec)+' ثانیه')+' صبر کنید'};
const lock=()=>{if(localStorage.getItem(K)){root.classList.add('locked');$('lk_p').value='';$('lk_u').value='';syncU()}};let tm,hid=0;
const lkMs=()=>{let v=null;try{v=localStorage.getItem('cl_lkmin')}catch(e){}const n=v==null?10:+v;return n>0?n*60000:0};
const idle=()=>{clearTimeout(tm);const ms=lkMs();if(localStorage.getItem(K)&&ms)tm=setTimeout(lock,ms)};
const syncLkBtn=()=>{const b=$('lkb');if(b)b.style.display=localStorage.getItem(K)?'':'none'};
$('lkb').onclick=lock;syncLkBtn();
$('lk_b').onclick=async()=>{const x=lst();if(x.until&&Date.now()<x.until){$('lk_m').textContent=waitTx(x.until);return}
 try{if(await loginOK()){root.classList.remove('locked');try{localStorage.removeItem(LK)}catch(e){}$('lk_m').textContent='';$('lk_p').value='';idle()}
  else{const y=fail();$('lk_m').textContent=y.until&&y.until>Date.now()?waitTx(y.until):(hasU()?'نام کاربری یا رمز اشتباه است':'رمز اشتباه است');$('lk_p').value=''}}catch(e){$('lk_m').textContent='قفل در این محیط کار نمی‌کند (آدرس https لازم است)'}};
$('lk_p').onkeydown=e=>{if(e.key==='Enter')$('lk_b').click()};
$('lk_f').onclick=async()=>{if(!confirm('فراموشی رمز\n\nبرای برداشتن قفل باید اطلاعات ذخیره‌شده روی همین دستگاه پاک شود. اگر قبلاً با حساب گوگل در بخش ☁️ ذخیره کرده‌اید، بعد از ورود دوباره همه‌چیز برمی‌گردد؛ در غیر این صورت فقط با فایل پشتیبان قابل بازیابی است.\n\nادامه می‌دهید؟'))return;
 if((prompt('برای تأیید، کلمه‌ی «حذف» را بنویسید')||'').trim()!=='حذف')return;
 try{const ks=[];for(let i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));ks.forEach(k=>{if(/^(cl1|cl2_|cl_pin|cl_salt|cl_lkout|cl_usr)/.test(k))localStorage.removeItem(k)})}catch(e){}
 try{indexedDB.deleteDatabase('cl_hist')}catch(e){}
 setTimeout(()=>location.reload(),400)};
['pointerdown','keydown'].forEach(v=>addEventListener(v,idle,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)hid=Date.now();else{const ms=lkMs();if(hid&&ms&&Date.now()-hid>ms)lock()}});idle();
const _b=window.renderBk;window.renderBk=function(){_b();const has=!!localStorage.getItem(K);syncLkBtn();
 const ST=window.__stor,act=ST.isActive(),sz=ST.sizes(),tot=act?sz.reduce((a,x)=>a+x[1],0):(localStorage.getItem('cl1')||'').length,kb=n=>fa(Math.round(n/1024)),nm=id=>{const c=S.classes.find(x=>String(x.id)===String(id));return c?clsLab(c):'کلاس'};
 const lb=n=>n==='meta'?'📚 فهرست کلاس‌ها و بایگانی':n[0]==='c'?'🏫 کار کلاس «'+E(nm(n.slice(1)))+'»':'🎓 پرونده‌ها و عکس‌های «'+E(nm(n.slice(1)))+'»';
 const leg=localStorage.getItem('cl1_legacy');
 $('bkb').insertAdjacentHTML('beforeend',`<div class="card"><b>🔒 قفل و ورود</b><p class="sub" style="text-align:right;margin:6px 0">نام کاربری و رمز عبور حالا در بخش «⚙️ تنظیمات ← 🔐 تنظیمات و ورود» مدیریت می‌شود.</p><button class="big" style="font-size:15px;padding:12px" onclick="show('set')">رفتن به تنظیمات ورود</button></div>
 ${window.__idbStore?'<!--':''}<div class="card"><b>📊 فضای ذخیره‌سازی این دستگاه</b><p class="sub" style="margin:6px 0 0">${act?'اطلاعات هر کلاس، پرونده‌ی دانش‌آموزان و عکس‌ها جداگانه ذخیره می‌شوند:':'⚠️ فضای دستگاه برای جدا کردن خودکار کافی نبود و هنوز همه‌ی اطلاعات به‌صورت یک تکه ذخیره می‌شود. اگر هر ذخیره‌ی تازه، کل این تکه را دوباره می‌نویسد و با پر شدن حافظه خطر از دست رفتن تغییر آخر هست. راه‌حل: ابتدا بالا پشتیبان بگیرید، سپس دکمه‌ی زیر را بزنید تا اطلاعات هر کلاس، پرونده‌ها و عکس‌ها جداجدا ذخیره شوند (بعد از آن فقط بخش تغییرکرده نوشته می‌شود). برنامه پس از جدا کردن، درستی همه‌چیز را کنترل می‌کند و اگر مشکلی باشد، اطلاعات قبلی را دست‌نخورده برمی‌گرداند. توجه: سقف کل حافظه‌ی مرورگر (حدود ۵ مگابایت) با این کار بیشتر نمی‌شود.'}</p>`+
 (act?`<div class="wrap"><table class="at">${sz.map(([n,v])=>`<tr><td class="nm">${lb(n)}</td><td>${kb(v)} KB</td></tr>`).join('')}</table></div>`:`<button class="big" id="sx_up" style="font-size:15px;padding:12px;margin-top:8px">🧩 جدا کردن ذخیره‌سازی</button>`)+
 `<p class="sub" style="margin:8px 0 0">جمع: حدود ${kb(tot)} کیلوبایت از حدود ۵٬۰۰۰ مجاز${tot/1024>3500?' — ⚠️ نزدیک به سقف است؛ پشتیبان بگیرید و کلاس‌های قدیمی را بایگانی کنید':''}</p>${leg?`<p class="sub" style="margin:8px 0 0">یک نسخه‌ی ایمنی از ذخیره‌ی قدیمی تا ۱۴ روز نگه داشته می‌شود و اگر فضا کم شود خودکار پاک می‌شود. <button class="sm" id="sx_ld">پاک کردن همین حالا</button></p>`:''}<p class="sub" id="sx_m"></p></div>${window.__idbStore?'-->':''}
<div class="card" id="rsCard"><b>🧹 شروع از نو (ریست برنامه)</b><p class="sub" style="text-align:right;margin:6px 0">برای شروع با اطلاعات و داده‌های تازه: همهٔ دانش‌آموزان، حضور و غیاب، آزمون‌ها، تکالیف، تنظیمات و عکس‌ها از این دستگاه پاک می‌شود (و اگر به حساب گوگل ☁️ وارد باشید، از نسخهٔ ابری هم). نام کاربری و رمز ورود برنامه حفظ می‌شود. قبل از ریست حتماً از همین صفحه پشتیبان بگیرید؛ حذف برگشت‌پذیر نیست.</p><button class="big" id="bk_reset" style="font-size:15px;padding:12px;background:linear-gradient(90deg,#e5484d,#f97316)">🗑️ حذف کامل اطلاعات و ریست برنامه</button><p class="sub" id="bk_rm"></p></div>`)};
document.addEventListener('click',e=>{const t=e.target,m=x=>{const q=$('sx_m');if(q)q.textContent=x};
 if(t.id==='sx_ld'){try{localStorage.removeItem('cl1_legacy');localStorage.removeItem('cl1_legacy_t')}catch(x){}renderBk()}
 if(t.id==='sx_up'){if(Date.now()-(+sessionStorage.getItem('bk_ok')||0)>3600000){m('⚠️ اول در همین صفحه یک پشتیبان کامل بگیرید.');return}
  const r=window.__stor.upgrade();if(r==='ok'){m('✅ انجام شد؛ برنامه دوباره باز می‌شود');setTimeout(()=>location.reload(),600)}else m('❌ انجام نشد و اطلاعات قبلی دست‌نخورده ماند. چند عکس را حذف کنید یا کلاس‌های قدیمی را بایگانی کنید و دوباره امتحان کنید.')}});
document.addEventListener('click',async e=>{const t=e.target,m=x=>{const q=$('sc_m');if(q)q.textContent=x},ok=v=>/^\d{4,8}$/.test(v);
 try{if(t.id==='sc_s'){const a=$('sc_n').value,b=$('sc_r').value;if(!ok(a)){m('رمز باید ۴ تا ۸ رقم باشد');return}if(a!==b){m('تکرار رمز یکی نیست');return}localStorage.setItem(K,await hash(a));m('✅ قفل فعال شد');idle();setTimeout(renderBk,800)}
 if(t.id==='sc_c'){if(!(await chk($('sc_o').value))){m('رمز فعلی اشتباه است');return}const n=$('sc_n').value;if(!n){localStorage.removeItem(K);m('✅ قفل برداشته شد')}else if(!ok(n)){m('رمز جدید باید ۴ تا ۸ رقم باشد');return}else{localStorage.setItem(K,await hash(n));m('✅ رمز تغییر کرد')}setTimeout(renderBk,800)}
 if(t.id==='sc_l')lock()}catch(x){m('قفل در این محیط کار نمی‌کند (آدرس https لازم است)')}});
const UK='cl_usr',UN='cl_usrn',hasU=()=>!!localStorage.getItem(UK),uh=u=>sha('u:'+u.trim().toLowerCase());
const syncU=()=>{const u=$('lk_u');if(u)u.style.display=hasU()?'':'none'};
const loginOK=async()=>{const p=await chk($('lk_p').value);let u=true;if(hasU())u=(await uh($('lk_u').value))===localStorage.getItem(UK);return p&&u};
$('lk_u').onkeydown=e=>{if(e.key==='Enter')$('lk_p').focus()};syncU();
nav.addEventListener('toggle',e=>{const d=e.target;if(d.tagName==='DETAILS'&&d.open)nav.querySelectorAll('details').forEach(x=>{if(x!==d)x.open=false})},true);
const SEMD={1:[7,1,10,30],2:[11,1,3,31]};
window.semGet=n=>{const v=S.sem&&S.sem[n];return Array.isArray(v)&&v.length===4?v:SEMD[n]};
const mo=(i,sel)=>MN.map((n,k)=>`<option value="${k+1}"${k+1===sel?' selected':''}>${n}</option>`).join(''),dy=sel=>Array.from({length:31},(_,k)=>`<option value="${k+1}"${k+1===sel?' selected':''}>${fa(k+1)}</option>`).join('');
function renderSet(){const h=has=>has,u=localStorage.getItem(UN)||'',on=!!localStorage.getItem(K);
 const acc=on?`<p class="sub" style="text-align:right">وضعیت: ✅ ورود فعال است${u?' · نام کاربری: <b>'+E(u)+'</b>':' · نام کاربری ندارد (فقط رمز)'}</p>
 <label class="sum">رمز فعلی (لازم)</label><input id="st_o" type="password" autocomplete="current-password" placeholder="رمز فعلی">
 <label class="sum">نام کاربری جدید (اختیاری)</label><input id="st_u" autocomplete="username" placeholder="${u?E(u):'نام کاربری'}">
 <label class="sum">رمز جدید (اختیاری)</label><input id="st_p" type="password" autocomplete="new-password" placeholder="حداقل ۴ نویسه"><input id="st_r" type="password" autocomplete="new-password" placeholder="تکرار رمز جدید">
 <button class="big" data-st="chg" style="font-size:15px;padding:12px">ذخیره‌ی تغییرات</button>
 <div class="grid2" style="margin-top:8px"><button class="big" data-st="now" style="font-size:14px;padding:11px">🔒 قفل کن</button><button class="big" data-st="off" style="font-size:14px;padding:11px;background:var(--no)">حذف ورود</button></div>`
 :`<p class="sub" style="text-align:right">با فعال‌سازی، هنگام باز شدن برنامه نام کاربری و رمز خواسته می‌شود.</p>
 <input id="st_u" autocomplete="username" placeholder="نام کاربری (حداقل ۳ نویسه)"><input id="st_p" type="password" autocomplete="new-password" placeholder="رمز عبور (حداقل ۴ نویسه)"><input id="st_r" type="password" autocomplete="new-password" placeholder="تکرار رمز">
 <button class="big" data-st="on" style="font-size:15px;padding:12px">فعال‌سازی ورود</button>`;
 const sm=n=>{const v=window.semGet(n);return `<div style="margin-top:10px"><b>نیمسال ${n===1?'اول':'دوم'}</b><div class="sel" style="flex-wrap:wrap;margin-top:6px"><span class="sum">از</span><select id="sm${n}_1" class="fs">${dy(v[1])}</select><select id="sm${n}_0" class="fs">${mo(0,v[0])}</select><span class="sum">تا</span><select id="sm${n}_3" class="fs">${dy(v[3])}</select><select id="sm${n}_2" class="fs">${mo(0,v[2])}</select></div></div>`};
 $('setBody').innerHTML=`<div class="card"><b>🔐 حساب و ورود به برنامه</b>${acc}<div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:10px"><b style="font-size:14px">⏱️ قفل خودکار</b><p class="sub" style="text-align:right;margin:4px 0">اگر این مدت از برنامه استفاده نشود (یا برنامه در پس‌زمینه بماند)، دوباره نام کاربری و رمز عبور خواسته می‌شود.${on?'':' (بعد از فعال‌سازی ورود اعمال می‌شود)'}</p><select id="st_lk" class="fs">${[[1,'۱ دقیقه'],[2,'۲ دقیقه'],[3,'۳ دقیقه'],[5,'۵ دقیقه'],[10,'۱۰ دقیقه'],[15,'۱۵ دقیقه'],[30,'۳۰ دقیقه'],[60,'۱ ساعت'],[120,'۲ ساعت'],[0,'قفل خودکار نباشد (فقط هنگام باز شدن برنامه)']].map(([v,l])=>`<option value="${v}"${v===(lkMs()/60000)?' selected':''}>${l}</option>`).join('')}</select></div><p class="sub" id="st_m"></p><p class="sub" style="text-align:right;font-size:12px">قفل فقط روی همین دستگاه فعال است و اطلاعات را رمزگذاری نمی‌کند. رمز اشتباه، ورود را پله‌ای مسدود می‌کند.</p></div>
 <div class="card"><b>📅 نیمسال تحصیلی</b><p class="sub" style="text-align:right;margin:6px 0">تاریخ شروع و پایان هر نیمسال را مشخص کنید؛ در گزارش کامل (بازه‌ی دلخواه) و گزارش‌های مدیر می‌توانید نیمسال را انتخاب کنید.</p>${sm(1)}${sm(2)}<div class="grid2" style="margin-top:10px"><button class="big" data-st="sem" style="font-size:15px;padding:12px">ذخیره</button><button class="big" data-st="semr" style="font-size:15px;padding:12px;background:var(--mut)">پیش‌فرض</button></div><p class="sub" id="sm_m"></p></div>`}
window.renderSet=renderSet;
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='st_lk'){try{localStorage.setItem('cl_lkmin',t.value)}catch(x){}idle();const q=$('st_m');if(q)q.textContent=+t.value?'✅ قفل خودکار بعد از '+fa(t.value)+' دقیقه تنظیم شد':'✅ قفل خودکار خاموش شد'}});
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t){return}
 const sg=t.closest('#mp_sem');if(sg){const n=+t.dataset.n,A=$('mp'),B=$('mp2');if(!A||!B||!A.options.length)return;let x,y;if(n){const v=window.semGet(n);x=v[0];y=v[2]}else{x=A.options[0].value;y=B.options[B.options.length-1].value}
  if([...A.options].some(o=>+o.value===+x)&&[...B.options].some(o=>+o.value===+y)){A.value=String(x);B.value=String(y);A.dispatchEvent(new Event('change'));B.dispatchEvent(new Event('change'))}return}
 const a=t.dataset.st;if(!a)return;const m=x=>{const q=$('st_m');if(q)q.textContent=x};
 try{
 if(a==='on'){const un=$('st_u').value.trim(),p=$('st_p').value;if(un.length<3)return m('نام کاربری حداقل ۳ نویسه باشد');if(p.length<4)return m('رمز حداقل ۴ نویسه باشد');if(p!==$('st_r').value)return m('تکرار رمز یکی نیست');
  localStorage.setItem(K,await hash(p));localStorage.setItem(UK,await uh(un));localStorage.setItem(UN,un);syncLkBtn();syncU();idle();m('✅ ورود فعال شد');setTimeout(renderSet,700)}
 else if(a==='chg'){if(!(await chk($('st_o').value)))return m('رمز فعلی اشتباه است');const un=$('st_u').value.trim(),p=$('st_p').value;
  if(un&&un.length<3)return m('نام کاربری حداقل ۳ نویسه باشد');if(p&&p.length<4)return m('رمز جدید حداقل ۴ نویسه باشد');if(p&&p!==$('st_r').value)return m('تکرار رمز یکی نیست');if(!un&&!p)return m('چیزی برای تغییر وارد نشده');
  if(un){localStorage.setItem(UK,await uh(un));localStorage.setItem(UN,un)}if(p)localStorage.setItem(K,await hash(p));syncU();m('✅ ذخیره شد');setTimeout(renderSet,700)}
 else if(a==='off'){if(!(await chk($('st_o').value)))return m('برای حذف، رمز فعلی را وارد کنید');if(!confirm('ورود با رمز حذف شود؟'))return;[K,UK,UN].forEach(k=>localStorage.removeItem(k));syncLkBtn();syncU();m('✅ ورود حذف شد');setTimeout(renderSet,700)}
 else if(a==='now')lock();
 else if(a==='sem'||a==='semr'){const q=$('sm_m');S.sem=S.sem||{};if(a==='semr'){delete S.sem}else{const g=(n,i)=>+$('sm'+n+'_'+i).value,lm=m=>m<=6?31:m===12?29:30;[1,2].forEach(n=>{const m1=g(n,0),m2=g(n,2);S.sem[n]=[m1,Math.min(g(n,1),lm(m1)),m2,Math.min(g(n,3),lm(m2))]})}
  save();q.textContent='✅ ذخیره شد';renderSet()}
 }catch(x){m('این بخش در این محیط کار نمی‌کند (آدرس https لازم است)')}});
})();

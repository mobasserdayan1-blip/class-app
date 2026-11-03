/* پرونده‌ی دانش‌آموز */
(function(){
const $=id=>document.getElementById(id),E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const fnOf=s=>((S.info||{})[s.id]||{}).fn||'',dupN=s=>S.students.filter(x=>x.name.trim()===s.name.trim()).length>1,lab=s=>s.name+(dupN(s)&&fnOf(s)?' — فرزند '+fnOf(s):''),fam=s=>{const w=s.name.trim().split(/\s+/);return w.length>1?w[w.length-1]+' '+w.slice(0,-1).join(' '):w[0]};window.tap2=b=>{if(b.dataset.s)return true;b.dataset.s=1;const o=b.textContent;b.textContent='مطمئنید؟';b.style.background='var(--no)';b.style.color='#fff';setTimeout(()=>{delete b.dataset.s;b.textContent=o;b.style.background='';b.style.color=''},3000);return false};
window.LG=()=>{const P=S.prof||{};if(!P.logo&&!P.school)return'';return `<div style="position:absolute;left:0;top:0;width:96px;text-align:center;line-height:1.35">${P.logo?`<img src="${P.logo}" style="width:60px;height:60px;object-fit:contain">`:''}<div style="font-size:10px;font-weight:800;color:#4b3478">${E(P.school?schoolFull():'')}</div></div>`};
window.PH=(id,inl)=>{const s=S.students.find(x=>x.id===id);if(!s||!s.photo)return'';return inl?`<img src="${s.photo}" style="width:46px;height:58px;object-fit:cover;border-radius:8px;vertical-align:middle;margin-left:8px">`:`<img src="${s.photo}" style="position:absolute;right:0;top:0;width:68px;height:86px;object-fit:cover;border-radius:10px;border:2px solid #d9cdf0">`};
window.AV=s=>s.photo?`<img class="av" src="${s.photo}">`:`<span class="av">${E((s.name||'?').trim()[0])}</span>`;
window.imgFit=(f,mx,cb)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.6))};im.src=r.result};r.readAsDataURL(f)};
function showLogo(){const P=S.prof;$('p_logo').innerHTML=P.logo?`<img src="${P.logo}" style="height:64px;border-radius:8px"><button class="sm" id="p_logod">حذف لوگو</button>`:'<span class="sub" style="margin:0">لوگویی انتخاب نشده</span>'}
$('p_logof').onchange=e=>{const f=e.target.files[0];if(f)imgFit(f,420,u=>{S.prof.logo=u;save();showLogo()})};
document.addEventListener('click',e=>{const t=e.target;if(t.id==='p_logod'){delete S.prof.logo;save();showLogo()}
 if(t.dataset&&t.dataset.phd){const id=+t.dataset.phd,s=S.students.find(x=>x.id===id);if(s){delete s.photo;save();window.openProf(id)}}});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.ph)return;const id=+t.dataset.ph,f=t.files[0];if(!f)return;imgFit(f,150,u=>{const s=S.students.find(x=>x.id===id);if(s){s.photo=u;save();window.openProf(id)}})});
showLogo();setTimeout(()=>render(),0);
let cur=0;

let sfFilter={from:'',to:'',course:''};
const sfDate=k=>{try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'short',day:'numeric'}).format(new Date(k+'T12:00:00Z'))}catch(e){return k}};
function studentDashboard(s,I){
 const id=s.id,from=sfFilter.from,to=sfFilter.to,cid=sfFilter.course;
 const inRange=k=>(!from||k>=from)&&(!to||k<=to);
 const courseName=x=>((S.courses||[]).find(c=>String(c.id)===String(x))||{}).name||'بدون درس';
 const ex=(S.exams||[]).filter(e=>inRange(e.date)&&(!cid||String(e.course)===String(cid))).map(e=>({date:e.date,name:e.name||e.title||'ارزشیابی',course:courseName(e.course),v:typeof nrm==='function'?nrm(e,id):null})).filter(e=>e.v!=null).sort((a,b)=>b.date.localeCompare(a.date));
 const att=Object.keys(S.att||{}).filter(inRange).sort().map(k=>({date:k,v:S.att[k]&&S.att[k][id]})).filter(x=>x.v);
 const abs=att.filter(x=>x.v==='a'&&!isExc(x.date,id)).length,exc=att.filter(x=>x.v==='a'&&isExc(x.date,id)).length,late=att.filter(x=>x.v==='l').length,pres=att.filter(x=>x.v==='p'||x.v==='l'||(x.v==='a'&&isExc(x.date,id))).length;
 const hw=(S.hwl||[]).filter(h=>inRange(h.date)&&(!cid||String(h.course)===String(cid))&&h.st&&h.st[id]!=null).sort((a,b)=>b.date.localeCompare(a.date));
 const hDone=hw.filter(h=>h.st[id]==='d'||h.st[id]==='p').length;
 const acts=(S.activities||[]).filter(a=>String(a.sid)===String(id)&&inRange(a.date)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const dj=S.dj||{},marks=[],notes=[];
 Object.keys(dj.m||{}).forEach(key=>{const p=key.split('|');if(p.length!==3||!inRange(p[0]))return;const v=dj.m[key][id];if(v==null)return;const ses=(dj.ses||{})[p[0]+'|'+p[1]]||{},course=courseName(ses.c);if(cid&&String(ses.c)!==String(cid))return;let it=(dj.tpl&&dj.tpl[ses.c]||[]).find(x=>String(x.id)===p[2]);marks.push({date:p[0],course,activity:it?it.n:'فعالیت کلاسی',v:+v});const note=(dj.n||{})[key+'|'+id];if(note)notes.push({date:p[0],course,text:note})});
 Object.keys(dj.ses||{}).forEach(key=>{const p=key.split('|'),ses=dj.ses[key];if(p.length===2&&ses&&ses.nt&&inRange(p[0])&&(!cid||String(ses.c)===String(cid)))notes.push({date:p[0],course:courseName(ses.c),text:ses.nt})});
 marks.sort((a,b)=>b.date.localeCompare(a.date));
 const avg=ex.length?ex.reduce((a,x)=>a+x.v,0)/ex.length:null;
 const level=v=>v>=3.5?'خیلی خوب':v>=2.5?'خوب':v>=1.5?'قابل قبول':'نیاز به تلاش بیشتر';
 const esc2=x=>E(x==null?'':x);
 const card=(label,val,sub,ico)=>`<div class="sfd-kpi"><span>${ico}</span><b>${val}</b><small>${label}</small><em>${sub||''}</em></div>`;
 const examsBy=(S.courses||[]).filter(c=>!cid||String(c.id)===String(cid)).map(c=>{const a=ex.filter(x=>x.course===c.name);return a.length?{name:c.name,avg:a.reduce((n,x)=>n+x.v,0)/a.length,n:a.length}:null}).filter(Boolean);
 const strong=examsBy.filter(x=>x.avg>=3).sort((a,b)=>b.avg-a.avg).slice(0,3),needs=examsBy.filter(x=>x.avg<2.5).sort((a,b)=>a.avg-b.avg).slice(0,3);
 const rows=(arr,fn,empty)=>arr.length?arr.map(fn).join(''): `<p class="sfd-empty">${empty}</p>`;
 return `<style>
 #sfb .sfd{display:grid;gap:12px;margin-top:14px}.sfd-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.sfd-kpi{background:var(--bg2);border:1px solid var(--line);border-radius:15px;padding:12px;display:grid;gap:3px;min-width:0}.sfd-kpi span{font-size:18px}.sfd-kpi b{font-size:20px;color:var(--p)}.sfd-kpi small{font-weight:800}.sfd-kpi em{font-style:normal;color:var(--mut);font-size:11px}.sfd-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px;min-width:0}.sfd-panel h3{font-size:15px;margin:0 0 10px}.sfd-filters{display:flex;gap:8px;flex-wrap:wrap}.sfd-filters label{display:grid;gap:4px;flex:1;min-width:130px;font-size:12px;color:var(--mut)}.sfd-filters input,.sfd-filters select{width:100%;min-width:0}.sfd-row{display:flex;align-items:center;gap:8px;padding:8px 2px;border-bottom:1px solid var(--line);font-size:13px}.sfd-row:last-child{border:0}.sfd-row span{flex:1;min-width:0}.sfd-row small{color:var(--mut)}.sfd-pill{border-radius:99px;padding:3px 8px;background:var(--bg2);font-size:11px;font-weight:800}.sfd-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sfd-bar{height:7px;border-radius:99px;background:var(--line);overflow:hidden}.sfd-bar i{display:block;height:100%;background:var(--p)}.sfd-empty{color:var(--mut);font-size:13px;margin:8px 0}.sfd-trend{display:flex;gap:6px;align-items:end;height:105px;padding:8px 2px}.sfd-trend i{flex:1;min-width:7px;background:linear-gradient(180deg,var(--p),#8b7bd0);border-radius:6px 6px 2px 2px;position:relative}.sfd-trend i span{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--mut);white-space:nowrap}
 @media(max-width:620px){.sfd-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.sfd-two{grid-template-columns:1fr}.sfd-kpi{padding:10px}.sfd-kpi b{font-size:18px}}
 </style><div class="sfd">
 <div class="sfd-panel"><h3>🔎 فیلتر سوابق</h3><div class="sfd-filters">
 <label>از تاریخ<input type="date" data-sff="from" value="${from}"></label><label>تا تاریخ<input type="date" data-sff="to" value="${to}"></label>
 <label>درس<select data-sff="course"><option value="">همه درس‌ها</option>${(S.courses||[]).map(c=>`<option value="${c.id}" ${String(c.id)===String(cid)?'selected':''}>${esc2(c.name)}</option>`).join('')}</select></label></div></div>
 <div class="sfd-kpis">${card('میانگین ارزشیابی',avg==null?'—':fa(avg.toFixed(1))+' از ۴',avg==null?'هنوز ارزشیابی ثبت نشده':level(avg),'📘')}${card('حضور ثبت‌شده',fa(pres),`غیبت ${fa(abs)} · موجه ${fa(exc)}`,'📅')}${card('تکالیف انجام‌شده',hw.length?fa(hDone)+' از '+fa(hw.length):'—',hw.length?'بر اساس سوابق ثبت‌شده':'بدون سابقه','📝')}${card('فعالیت‌های کلاسی',fa(acts.length+marks.length),'ثبت‌شده در بازه انتخابی','🌟')}</div>
 <div class="sfd-two"><div class="sfd-panel"><h3>📚 وضعیت درس‌ها</h3>${rows(examsBy,x=>`<div class="sfd-row"><span>${esc2(x.name)}<div class="sfd-bar"><i style="width:${Math.max(0,Math.min(100,x.avg/4*100))}%"></i></div></span><b>${fa(x.avg.toFixed(1))} از ۴</b></div>`,'برای این فیلتر ارزشیابی درسی ثبت نشده است')}</div>
 <div class="sfd-panel"><h3>💪 نقاط قوت و زمینه‌های تلاش</h3><b>نقاط قوت</b>${rows(strong,x=>`<div class="sfd-row"><span>${esc2(x.name)}</span><b class="sfd-pill">${level(x.avg)}</b></div>`,'هنوز نقطه قوت قابل اتکایی ثبت نشده است')}<b>نیازمند تلاش بیشتر</b>${rows(needs,x=>`<div class="sfd-row"><span>${esc2(x.name)}</span><b class="sfd-pill">${level(x.avg)}</b></div>`,'موردی بر اساس داده‌های موجود شناسایی نشد')}</div></div>
 <div class="sfd-panel"><h3>📈 روند پیشرفت تحصیلی</h3>${ex.length?`<div class="sfd-trend">${ex.slice().reverse().slice(-12).map(x=>`<i style="height:${Math.max(8,Math.min(100,x.v/4*100))}%"><span>${sfDate(x.date).split(' ')[0]}</span></i>`).join('')}</div><small>بر اساس آخرین ${fa(Math.min(12,ex.length))} ارزشیابی ثبت‌شده</small>`:'<p class="sfd-empty">برای نمایش روند، حداقل یک ارزشیابی ثبت کنید.</p>'}</div>
 <div class="sfd-two"><div class="sfd-panel"><h3>📅 حضور و غیاب</h3>${rows(att.slice(0,12),x=>`<div class="sfd-row"><span>${sfDate(x.date)}</span><b class="sfd-pill">${x.v==='p'?'حاضر':x.v==='l'?'تأخیر':isExc(x.date,id)?'غیبت موجه':'غایب'}</b></div>`,'سابقه‌ای ثبت نشده است')}</div>
 <div class="sfd-panel"><h3>📝 تکالیف و تمرین‌ها</h3>${rows(hw.slice(0,12),x=>`<div class="sfd-row"><span>${esc2(x.title||'تکلیف')}<small> · ${sfDate(x.date)} · ${esc2(courseName(x.course))}</small></span><b class="sfd-pill">${x.st[id]==='d'?'انجام شد':x.st[id]==='p'?'نسبتاً انجام شد':'انجام نشد'}</b></div>`,'تکلیفی در بازه انتخابی وجود ندارد')}</div></div>
 <div class="sfd-two"><div class="sfd-panel"><h3>🌟 فعالیت‌های کلاسی</h3>${rows(acts.slice(0,12),x=>`<div class="sfd-row"><span>${esc2(x.kind||x.title||'فعالیت')}<small> · ${sfDate(x.date)}</small></span><b class="sfd-pill">${x.type==='positive'?'مثبت':'نیازمند پیگیری'}</b></div>`,'فعالیتی ثبت نشده است')}</div>
 <div class="sfd-panel"><h3>📓 سوابق دفتر روزانه و ارزشیابی توصیفی</h3>${rows(marks.slice(0,14),x=>`<div class="sfd-row"><span>${esc2(x.activity)}<small> · ${esc2(x.course)} · ${sfDate(x.date)}</small></span><b class="sfd-pill">${x.v>=1&&x.v<=4?['','نیاز به تلاش بیشتر','قابل قبول','خوب','خیلی خوب'][x.v]:x.v?'انجام شد':'انجام نشد'}</b></div>`,'در دفتر روزانه سابقه‌ای برای این دانش‌آموز ثبت نشده است')}</div></div>
 <div class="sfd-panel"><h3>🗒️ یادداشت‌ها و مشاهدات معلم</h3>${rows(notes.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12),x=>`<div class="sfd-row"><span>${esc2(x.text)}<small> · ${esc2(x.course)} · ${sfDate(x.date)}</small></span></div>`,"یادداشت یا مشاهده‌ای در بازه انتخابی ثبت نشده است")}<div class="sfd-row"><span>گزارش قابل ارائه به والدین</span><button class="sm" data-a="p">مشاهده گزارش والدین</button></div></div>
 </div>`;
}

window.renderSF=()=>{const q=($('sfq').value||'').trim(),a=S.students.filter(s=>!q||(s.name+' '+fnOf(s)).includes(q));
 if(!a.find(s=>s.id===cur))cur=a[0]?a[0].id:0;$('sfs').innerHTML=a.map(s=>`<option value="${s.id}"${s.id===cur?' selected':''}>${E(lab(s))}</option>`).join('');
 const s=S.students.find(x=>x.id===cur),b=$('sfb');if(!s){b.innerHTML='<div class="card"><p class="sub">دانش‌آموزی پیدا نشد</p></div>';return}
 window.__sfid=s.id;const I=S.info[s.id]||{};let p=0,l=0,ab=0,ex=0;const XL=[];Object.keys(S.att).sort().forEach(k=>{const v=S.att[k][s.id];if(v==='p')p++;else if(v==='l')l++;else if(v==='a'){if(isExc(k,s.id)){ex++;XL.push([k,((S.attx||{})[k]||{})[s.id]||''])}else ab++}});const tot=p+l+ab+ex,ov=overall(s.id),rk=classTable().rk.findIndex(r=>r.s.id===s.id)+1;
 const k=(n,v)=>`<div class="st" style="--c:#7e57c2"><b style="font-size:20px">${v}</b><span>${n}</span></div>`;
 b.innerHTML=`<div class="card sfh">${s.photo?`<img src="${s.photo}">`:'<div class="ph0">👤</div>'}<div><b style="font-size:19px">${E(s.name)}</b><div class="sub" style="text-align:right;margin:4px 0 0">پدر: ${E(I.fn||'ثبت نشده')}${S.prof.grade?' · پایه '+E(S.prof.grade):''}</div></div></div>
 <div class="stats">${k('میانگین کل',ov==null?'—':f1(ov)+' از ۴')}${k('رتبه در کلاس',rk?fa(rk)+' از '+fa(S.students.length):'—')}${k('درصد حضور',tot?fa(Math.round((p+l+ex)/tot*100))+'٪':'—')}${k('غیبت / موجه / تأخیر',fa(ab)+' / '+fa(ex)+' / '+fa(l))}</div>
 ${studentDashboard(s,I)}
 ${XL.length?`<details class="card"><summary><b>📝 غیبت‌های موجه (${fa(XL.length)})</b></summary>${XL.slice().reverse().map(([d,tx])=>`<div class="row"><b>${typeof fmt==='function'?fmt(new Date(d+'T12:00:00Z')):d}</b><span class="sub" style="margin:0;text-align:right;flex:1">${E(tx)||'—'}</span></div>`).join('')}</details>`:''}
 <div class="sfg"><button data-a="e">✏️ مشخصات، والدین و عکس</button><button data-a="c">🎓 کارنامه گرافیکی</button><button data-a="o">🏛 کارنامه رسمی</button><button data-a="p">👨‍👩‍👦 گزارش والدین</button><button data-a="g">📊 نمودار پیشرفت (سال/ماه/هفته)</button><button data-a="r">📈 گزارش نمرات فردی</button><button data-a="m">🧾 گزارش کامل مدیر</button>${I.fp?'<button data-a="t">📞 تماس با پدر</button>':''}${S.classes&&S.classes.length>1?'<button data-a="mv">🔀 انتقال به کلاس دیگر</button>':''}</div>`};
$('sfs').onchange=e=>{cur=+e.target.value;renderSF()};$('sfq').oninput=()=>renderSF();
$('sfb').addEventListener('change',e=>{const t=e.target;if(!t.dataset.sff)return;sfFilter[t.dataset.sff]=t.value;renderSF()});
$('sfb').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;const id=cur;
 if(a==='e')window.openProf(id);else if(a==='c')window.openRep(id,'c');else if(a==='o')window.openRep(id,'o');else if(a==='p')window.openRep(id,'p');else if(a==='m')window.mgrOpen(id);
 else if(a==='t'){const v=(S.info[id]||{}).fp;if(v)location.href='tel:'+v}
 else if(a==='r'){show('rep');document.querySelector('#rep .tb2 button[data-t="s"]').click();$('rs').value=id;$('rs').dispatchEvent(new Event('change',{bubbles:true}))}});
const _R=render;render=function(){S.students.sort((x,y)=>fam(x).localeCompare(fam(y),'fa')||fnOf(x).localeCompare(fnOf(y),'fa'));_R.apply(this,arguments);try{if($('sf').classList.contains('on'))renderSF()}catch(x){}};
const MS=[7,8,9,10,11,12,1,2,3];let fq='r';
$('fr_d1').innerHTML=$('fr_d2').innerHTML=Array.from({length:31},(_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join('');
$('fr_m1').innerHTML=$('fr_m2').innerHTML=MS.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');$('fr_d2').value=30;$('fr_m2').value=3;$('fr_m1').value=7;
$('fr_q').onclick=e=>{const q=e.target.dataset.q;if(!q)return;fq=q;[...$('fr_q').children].forEach(b=>b.classList.toggle('on',b.dataset.q===q));$('fr_r').style.display=q==='r'?'flex':'none'};
const yy=m=>m>=7?SY:SY+1,ld=m=>window.JDate?JDate.monthLen(yy(m),m):(m<=6?31:m===12?29:30);
function rng(){let a,b,l;if(fq==='y'||(fq==='m'&&!+$('rm').value)){a=fromJ(SY,7,1);b=fromJ(SY+1,3,31);l='سال تحصیلی '+syLab(SY)}
 else if(fq==='s1'||fq==='s2'){const v=window.semGet(fq==='s1'?1:2),m1=v[0],d1=v[1],m2=v[2],d2=v[3];a=fromJ(yy(m1),m1,d1);b=fromJ(yy(m2),m2,d2);l='نیمسال '+(fq==='s1'?'اول':'دوم')+' ('+fa(d1)+' '+MN[m1-1]+' تا '+fa(d2)+' '+MN[m2-1]+')'}
 else if(fq==='m'){const m=+$('rm').value;a=fromJ(yy(m),m,1);b=fromJ(yy(m),m,ld(m));l='ماه '+MN[m-1]}
 else{const d1=+$('fr_d1').value,m1=+$('fr_m1').value,d2=+$('fr_d2').value,m2=+$('fr_m2').value;a=fromJ(yy(m1),m1,d1);b=fromJ(yy(m2),m2,d2);l='از '+fa(d1)+' '+MN[m1-1]+' تا '+fa(d2)+' '+MN[m2-1]}
 return[iso(a),iso(b),l]}
async function fr(k){const g=rng();if(g[0]>g[1]){$('fr_msg').textContent='تاریخ شروع باید قبل از پایان باشد';return}window.__rg=g;$('fr_msg').textContent='⏳ در حال ساخت گزارش…';try{await runExp(k);$('fr_msg').textContent=''}finally{window.__rg=null}}
$('fr_x').onclick=()=>fr('x');$('fr_p').onclick=()=>fr('p');
})();

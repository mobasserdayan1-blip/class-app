/* هسته‌ی اصلی برنامه (صفحه‌ها، دانش‌آموزان، حضور و غیاب، ارزیابی) */
const $=id=>document.getElementById(id);
const pages=[['home','🏠 داشبورد معلم'],['sf','🎓 پرونده دانش‌آموز'],['cls','🏫 مدرسه و کلاس‌ها'],['bk','💾 پشتیبان و امنیت'],['dm','👔 داشبورد مدیر'],['att','📋 حضور و غیاب'],['draw','🎯 قرعه‌کشی'],['teams','🏅 تیم‌ها'],['crs','📚 درس‌ها و آزمون‌ها'],['mk','🔁 آزمون جبرانی'],['wsc','📅 برنامه هفتگی'],['exp','🗓️ برنامه امتحانی'],['rep','📈 گزارش نمرات'],['mgr','🧾 گزارش‌های مدیر'],['prof','🏫 اطلاعات مدرسه و پایه'],['edit','✏️ ویرایش دانش‌آموزان'],['set','🔐 تنظیمات و ورود'],['mr','🗓️ گزارش ماهانه‌ی درس']];
const names=['دانش‌آموز ۱','دانش‌آموز ۲','دانش‌آموز ۳','دانش‌آموز ۴','دانش‌آموز ۵','دانش‌آموز ۶','دانش‌آموز ۷','دانش‌آموز ۸','دانش‌آموز ۹','دانش‌آموز ۱۰','دانش‌آموز ۱۱','دانش‌آموز ۱۲'];
let NT=3;function tname(n,d){const v=((S&&S.tnm)||[])[n-1];return v&&String(v).trim()?String(v).trim():d}
let S={students:names.map((n,i)=>({id:i+1,name:n,score:1000,team:i%NT+1,att:''})),drawn:[]};
try{const r=localStorage.getItem('cl1');if(r)S=JSON.parse(r)}catch(e){}NT=Math.max(1,S.nt||3);
let __pa=0;function askPersist(){if(__pa)return;__pa=1;try{const N=navigator.storage;if(N&&N.persist)(N.persisted?N.persisted():Promise.resolve(false)).then(p=>p||N.persist()).then(g=>{window.__persist=g}).catch(()=>{})}catch(e){}}
let __sfT=0;function saveFail(e){try{console.error('save failed',e);if(Date.now()-__sfT<20000)return;__sfT=Date.now();const q=e&&(e.name==='QuotaExceededError'||e.code===22||e.code===1014);let b=document.getElementById('saveErr');if(!b){b=document.createElement('div');b.id='saveErr';b.setAttribute('role','alert');b.style.cssText='position:fixed;z-index:99999;top:10px;right:10px;left:10px;max-width:520px;margin:auto;background:#d9534f;color:#fff;padding:12px 14px;border-radius:14px;font-weight:700;font-size:14px;line-height:1.9;box-shadow:0 6px 24px rgba(0,0,0,.3);cursor:pointer;text-align:right';b.onclick=()=>b.remove();document.body.appendChild(b)}b.textContent='⚠️ ذخیره‌ی اطلاعات ناموفق بود'+(q?' (فضای مرورگر پر است)':'')+'. تغییرات اخیر ممکن است از بین برود؛ همین حالا از «پشتیبان و امنیت» پشتیبان بگیرید. (برای بستن لمس کنید)';clearTimeout(b._t);b._t=setTimeout(()=>b.remove(),12000);askPersist()}catch(_){}}
const save=()=>{try{const had=localStorage.getItem('cl1');try{window.binChk&&window.binChk(had)}catch(x){console.warn(x)}const j=JSON.stringify(S);if(j===had)return;try{window.histPush&&window.histPush(had)}catch(x){console.warn(x)}localStorage.setItem('cl1',j);askPersist();if(had!==null&&(!window.__auto||+localStorage.getItem('cl1_ts'))){localStorage.setItem('cl1_ts',Date.now());try{window.cloudPush&&window.cloudPush()}catch(x){console.warn(x)}}}catch(e){saveFail(e)}};
const today=new Date().toLocaleDateString('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'});
$('d2').textContent='امروز: '+today;
const nav=$('nav');
pages.forEach(([id,t])=>{const b=document.createElement('button');b.textContent=t;b.dataset.p=id;b.onclick=()=>show(id);nav.appendChild(b)});
$('mb').onclick=()=>nav.classList.toggle('open');document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!$('mb').contains(e.target))nav.classList.remove('open')});
function show(id){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===id));nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.p===id));nav.classList.remove('open');if(id==='mgr'&&window.renderMgr)renderMgr();if(id==='sf'&&window.renderSF)renderSF();if(id==='cls'&&window.renderCls)renderCls();if(id==='bk'&&window.renderBk)renderBk();if(id==='set'&&window.renderSet)renderSet();if(id==='mr'&&window.renderMr)renderMr();if(id==='dm'&&window.renderDm)renderDm();if(id==='mk'&&window.renderMk)renderMk();{const q=pages.find(x=>x[0]===id);if($('ptl'))$('ptl').textContent=q?q[1]:''}window.scrollTo(0,0)}
function smartHome(){const box=$('smart');if(!box)return;try{
const st=S.students,T=iso(tdy());
if(!st.length){box.innerHTML='';return}
const dk=Object.keys(S.att).filter(k=>k<=T&&!S.closed[k]&&!hol(new Date(k+'T12:00:00Z'))&&st.some(s=>(S.att[k]||{})[s.id])).sort();
const ex=S.exams.slice().sort((a,b)=>a.date.localeCompare(b.date));
const TA=S.att[T]||{},pc=st.filter(s=>TA[s.id]==='p'||TA[s.id]==='l').length,ac=st.filter(s=>TA[s.id]==='a').length;
const ser=id=>ex.map(e=>nrm(e,id)).filter(nn);
const R=[],prog=[];
st.forEach(s=>{const why=[];let run=0;for(let i=dk.length-1;i>=0;i--){if((S.att[dk[i]]||{})[s.id]==='a'&&!isX(dk[i],s.id))run++;else break}
 if(run>=3)why.push(fa(run)+' غیبت متوالی');
 const l10=dk.slice(-10),a10=l10.filter(k=>(S.att[k]||{})[s.id]==='a'&&!isX(k,s.id)).length;
 if(run<3&&a10>=3)why.push(fa(a10)+' غیبت در '+fa(l10.length)+' روز اخیر');
 const v=ser(s.id),av=mean(v);
 if(av!=null&&av<2.5)why.push('میانگین پایین ('+f1(av)+')');
 if(v.length>=4){const h=Math.floor(v.length/2),d=mean(v.slice(h))-mean(v.slice(0,h));if(d<=-.5)why.push('روند نزولی نمرات');if(d>=.5)prog.push({s,d})}
 if(why.length)R.push({s,why,pr:why.length>=2||(av!=null&&av<2)||run>=5?1:2})});
R.sort((a,b)=>a.pr-b.pr||b.why.length-a.why.length);prog.sort((a,b)=>b.d-a.d);
const cr=S.courses.map(c=>({n:c.name,a:mean(ex.filter(e=>e.course===c.id).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn))})).filter(x=>x.a!=null).sort((a,b)=>a.a-b.a);
const all=mean(st.map(s=>mean(ser(s.id))).filter(nn)),ratio=R.length/st.length;
let lv=['🟢','عالی','#1a8f55'];
if((all!=null&&all<2.5)||ratio>.25||R.filter(r=>r.pr===1).length>=3)lv=['🔴','نیازمند مداخله','#e5484d'];
else if((all!=null&&all<3)||ratio>.1||R.length)lv=['🟡','نیازمند توجه','#f59e0b'];
if(all==null&&!R.length&&!dk.length)lv=['⚪','هنوز داده‌ی کافی ثبت نشده','#8a7aa6'];
const li=[];
li.push(Object.keys(TA).length?`امروز ${fa(pc)} نفر حاضر و ${fa(ac)} نفر غایب‌اند.`:'حضور و غیاب امروز هنوز ثبت نشده است.');
li.push(R.length?`${fa(R.length)} دانش‌آموز نیازمند توجه هستند.`:'در حال حاضر دانش‌آموزی در فهرست نیازمند توجه نیست.');
{const PG=progList(),u=PG[0],d=PG[PG.length-1];if(u&&u.P.d>=.3)li.push(`📈 ${esc2(u.s.name)} بیشترین پیشرفت را داشته است (${gDf(u.P.d)}).`);if(d&&d.P.d<=-.3)li.push(`📉 ${esc2(d.s.name)} در حال افت است (${gDf(d.P.d)}).`)}
if(cr.length>1&&cr[0].a<3)li.push(`📌 ضعیف‌ترین درس کلاس: ${esc2(cr[0].n)} (میانگین ${f1(cr[0].a)}) — مرور پیشنهاد می‌شود.`);
const P=['','🔴 اولویت بالا','🟠 اولویت متوسط'];
box.innerHTML=`<div class="card" style="margin-top:12px;border-right:5px solid ${lv[2]}"><b>🚦 وضعیت کلی کلاس: ${lv[0]} ${lv[1]}</b><ul style="margin:8px 0 0;padding:0 18px;line-height:1.9;font-size:14px">${li.map(x=>`<li>${x}</li>`).join('')}</ul></div>`+(R.length?`<div class="card" style="margin-top:12px"><b>⚠️ دانش‌آموزان نیازمند توجه</b><div class="wrap"><table class="at" style="margin-top:8px"><tr><th>دانش‌آموز</th><th>دلیل</th><th>اولویت</th></tr>${R.slice(0,8).map(r=>`<tr><td>${esc2(r.s.name)}</td><td>${r.why.join('، ')}</td><td>${P[r.pr]}</td></tr>`).join('')}</table></div>${R.length>8?`<p class="sub" style="margin:6px 0 0">و ${fa(R.length-8)} مورد دیگر</p>`:''}</div>`:'');
}catch(e){box.innerHTML='';console.warn('smartHome',e)}}
function render(){
 const st=S.students,TA=S.att[iso(tdy())]||{},c=k=>st.filter(s=>k==='a'?(TA[s.id]==='a'&&!isX(iso(tdy()),s.id)):TA[s.id]===k).length;
 const avg=f1(mean(st.map(s=>mean(S.courses.map(c=>cAvg(s.id,c.id,S.exams)).filter(nn))).filter(nn)));
 $('stats').innerHTML=[['✅',c('p')+c('l'),'حاضر امروز','#2eaf6b','p'],['👥',st.length,'دانش‌آموز','#3b6fd8','all'],['⏰',c('l'),'تأخیر امروز','#f59e0b','l'],['❌',c('a'),'غایب امروز','#e5484d','a'],['🏅',NT,'تیم','#7e57c2','teams'],['📊',avg,'میانگین ارزیابی (از ۴)','#9b6fd0','rep']].map(x=>`<div class="st" data-k="${x[4]}" style="--c:${x[3]};cursor:pointer"><div style="font-size:22px">${x[0]}</div><b>${x[1]}</b><span>${x[2]}</span></div>`).join('');
 smartHome();renderAtt();renderCrs();renderRep();
 $('chips').innerHTML=st.map(s=>`<div class="chip${S.drawn.includes(s.id)?' done':''}">${s.name}</div>`).join('');
 tnEd();$('teamList').innerHTML=Array.from({length:NT},(_,i)=>i+1).map(t=>{const m=st.filter(s=>s.team===t);return `<div class="card team"><h3>🏅 ${esc2(tname(t,'تیم '+t))}<span class="badge">${m.length} عضو</span></h3>${m.map(s=>`<div class="row"><span>${s.name}</span><span class="sc">${fa(ptsOf(s.id))}</span></div>`).join('')}</div>`}).join('');
 renderRank();
 const q=$('q').value.trim(),esc=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const el=st.filter(s=>s.name.includes(q));
 $('editList').innerHTML=el.length?el.map(s=>`<div class="ed"><div class="top">${window.stAv?stAv(s,46):''}<div><label>نام</label><input value="${esc(s.name)}" onchange="upd(${s.id},'name',this.value)"></div><button class="del${delId===s.id?' sure':''}" onclick="del(${s.id})">${delId===s.id?'مطمئنید؟':'🗑 حذف'}</button><button class="del" style="background:var(--bg2);color:var(--p)" onclick="idCard(${s.id})">🪪 کارت</button></div><div class="f"><div><label>تیم</label><select onchange="upd(${s.id},'team',this.value)">${Array.from({length:NT},(_,i)=>`<option value="${i+1}"${s.team===i+1?' selected':''}>${esc(tname(i+1,'تیم '+(i+1)))}</option>`).join('')}</select></div><div><label>امتیاز (فقط نمایش)</label><div class="chip" style="padding:9px">${fa(ptsOf(s.id))}</div></div></div></div>`).join(''):'<p class="sub">موردی پیدا نشد</p>';
 save();
}
let delId=null;
function tnEd(){const b=$('tnames');if(!b)return;const v=i=>String((S.tnm||[])[i]||'');if(b.querySelectorAll('input').length===NT){b.querySelectorAll('input').forEach((x,i)=>{if(document.activeElement!==x&&x.value.trim()!==v(i))x.value=v(i)});return}
 b.innerHTML=Array.from({length:NT},(_,i)=>`<div style="display:flex;gap:8px;align-items:center;margin-top:6px"><span style="min-width:62px;font-size:13px;color:var(--mut)">تیم ${fa(i+1)}</span><input data-tn="${i}" value="${esc2(v(i)).replace(/"/g,'&quot;')}" placeholder="مثلاً بارسلونا" maxlength="30" style="margin:0;flex:1"></div>`).join('')}
document.addEventListener('change',e=>{const t=e.target,i=t&&t.dataset&&t.dataset.tn;if(i==null||!t.closest('#tnames'))return;S.tnm=S.tnm||[];while(S.tnm.length<NT)S.tnm.push('');S.tnm[+i]=t.value.trim();render()});
window.upd=(id,k,v)=>{const s=S.students.find(x=>x.id===id);if(k==='name'){v=v.trim();if(!v)return render();s.name=v}else s[k]=Number(v)||0;render()};
window.del=id=>{if(delId===id){S.students=S.students.filter(x=>x.id!==id);S.drawn=S.drawn.filter(x=>x!==id);delId=null}else{delId=id;setTimeout(()=>{if(delId===id){delId=null;render()}},3000)}render()};
$('q').oninput=()=>render();

window.pts=(id,d)=>{S.students.find(x=>x.id===id).score+=d;render()};
$('add').onclick=()=>{const v=$('nm').value.trim(),f=$('nfn').value.trim();if(!v)return;const z=x=>String(x||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\s]+/g,''),I=(S.info=S.info||{});if(S.students.some(s=>z(s.name)===z(v)&&z((I[s.id]||{}).fn)===z(f))&&!confirm('دانش‌آموزی با همین نام و نام پدر قبلاً ثبت شده است. باز هم افزوده شود؟'))return;const id=Date.now();S.students.push({id,name:v,score:1000,team:S.students.length%NT+1,att:''});if(f)I[id]={fn:f};$('nm').value='';$('nfn').value='';render()};
$('go').onclick=()=>{const left=S.students.filter(s=>!S.drawn.includes(s.id));if(!left.length){$('pick').textContent='همه قرعه‌کشی شدند 🎉';return}const p=left[Math.floor(Math.random()*left.length)];S.drawn.push(p.id);$('pick').textContent='🎉 '+p.name;render()};
$('reset').onclick=()=>{S.drawn=[];$('pick').textContent='';render()};
$('shuf').onclick=()=>{const a=[...S.students].sort(()=>Math.random()-.5);a.forEach((s,i)=>s.team=i%NT+1);render()};

const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const WN=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'],WS=['ش','ی','د','س','چ','پ','ج'];
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc2=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const jf=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
const jp=d=>{const o={};jf.formatToParts(d).forEach(p=>{if(p.type==='year'||p.type==='relatedYear')o.y=+p.value;else if(p.type==='month')o.m=+p.value;else if(p.type==='day')o.d=+p.value});return o};
function tdy(){const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12))}
const addD=(d,n)=>new Date(d.getTime()+n*864e5),iso=d=>d.toISOString().slice(0,10);
const fmt=d=>{const p=jp(d);return fa(p.y)+'/'+fa(String(p.m).padStart(2,'0'))+'/'+fa(String(p.d).padStart(2,'0'))};
const wd=d=>WN[(d.getUTCDay()+1)%7];
function fromJ(y,m,d){let g=addD(new Date(Date.UTC(y+621,2,21,12)),(m<=6?(m-1)*31:186+(m-7)*30)+d-1);const t=y*400+m*32+d;for(let i=0;i<10;i++){const p=jp(g),v=p.y*400+p.m*32+p.d;if(v===t)break;g=addD(g,v>t?-1:1)}return g}
function monthDays(d){const p=jp(d);let s=addD(d,-(p.d-1)),a=[];while(jp(s).m===p.m){a.push(s);s=addD(s,1)}return a}
S.att=S.att||{};
S.attx=S.attx||{};function isX(k,id){return((S.attx||{})[k]||{})[id]!==undefined}window.isExc=isX;
S.students.forEach(s=>{if(s.att){const k=iso(tdy());(S.att[k]=S.att[k]||{})[s.id]=s.att}delete s.att});
let cur=tdy(),mode='d';
const SEL={d:$('selD'),m:$('selM'),y:$('selY')},SYM={p:'ح',a:'غ',l:'ت',e:'م'},COL={'ح':'#1a8f55','غ':'#d12f35','ت':'#d98600','م':'#2f80ed'};
const SM=[7,8,9,10,11,12,1,2,3];
const schoolRange=d=>{const p=jp(d),Y=p.m>=7?p.y:p.y-1;return{Y,a:fromJ(Y,7,1),b:fromJ(Y+1,3,31)}};
let SY=schoolRange(tdy()).Y;
const rangeY=()=>({Y:SY,a:fromJ(SY,7,1),b:fromJ(SY+1,3,31)});
const LR='\u200E',syLab=Y=>LR+fa(Y)+'-'+fa(Y+1)+LR;
(function(){const Y0=schoolRange(tdy()).Y;SEL.y.innerHTML=[-1,0,1].map(k=>`<option value="${Y0+k}">سال تحصیلی ${syLab(Y0+k)}</option>`).join('');SEL.m.innerHTML=SM.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');SEL.d.innerHTML=Array.from({length:31},(_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join('')})();
[SEL.d,SEL.m,SEL.y].forEach(x=>x.onchange=()=>{const m=+SEL.m.value,Y=+SEL.y.value;SY=Y;cur=fromJ(m>=7?Y:Y+1,m,+SEL.d.value);renderAtt()});
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;renderAtt()});
function step(k){const r=rangeY(),a=iso(r.a),b=iso(r.b);let n;
 if(mode==='d'){n=cur;do{n=addD(n,k)}while(hol(n))}
 else if(mode==='w')n=addD(cur,7*k);
 else{const p=jp(cur);n=k<0?addD(cur,-p.d):addD(cur,monthDays(cur).length-p.d+1)}
 if(iso(n)<a)n=r.a;if(iso(n)>b)n=r.b;
 const ws=d=>iso(addD(d,-((d.getUTCDay()+1)%7)));
 if(mode==='d'?(iso(n)===iso(cur)||hol(n)):mode==='w'?ws(n)===ws(cur):jp(n).m===jp(cur).m)return;
 cur=n;renderAtt()}
$('pv').onclick=()=>step(-1);$('nx').onclick=()=>step(1);$('tdb').onclick=()=>{cur=tdy();SY=schoolRange(cur).Y;renderAtt()};
const hol=d=>{const w=d.getUTCDay();return w===4||w===5};
function allRange(){if(mode==='d')return[cur];if(mode==='w'){const s=addD(cur,-((cur.getUTCDay()+1)%7));return Array.from({length:7},(_,i)=>addD(s,i))}return monthDays(cur)}
function days(){if(mode==='d')return[cur];const r=rangeY(),a=iso(r.a),b=iso(r.b);return allRange().filter(d=>!hol(d)&&!S.closed[iso(d)]&&iso(d)>=a&&iso(d)<=b)}
function days_old(){if(mode==='d')return[cur];if(mode==='w'){const s=addD(cur,-((cur.getUTCDay()+1)%7));return Array.from({length:7},(_,i)=>addD(s,i)).filter(d=>!hol(d))}return monthDays(cur).filter(d=>!hol(d))}
function title(){const D=allRange();if(mode==='d')return wd(cur)+' '+fmt(cur);if(mode==='w')return 'هفته: '+fmt(D[0])+' تا '+fmt(D[4]);const p=jp(cur);return 'ماه '+MN[p.m-1]+' '+fa(p.y)}
const cnt=(id,keys)=>{const r={p:0,a:0,l:0,e:0};keys.forEach(k=>{const v=(S.att[k]||{})[id];if(v==='a'&&isX(k,id))r.e++;else if(v)r[v]++});return r};
const cellV=(k,id)=>{const v=(S.att[k]||{})[id]||'';return v==='a'&&isX(k,id)?'e':v};
const xBox=(id,k)=>{const t=((S.attx||{})[k]||{})[id]||'';return `<div class="exn"><label>📝 توضیحات (دلیل موجه بودن غیبت)</label><textarea data-xn="${id}" data-xk="${k}" placeholder="مثلاً: بیماری با گواهی پزشک، مسافرت خانوادگی، مراسم...">${esc2(t)}</textarea><div class="chp">${(window.EXC_REASONS=window.EXC_REASONS||['بیماری','بیماری با گواهی پزشک','مراجعه به پزشک/دندان‌پزشکی','آزمایش یا درمان','مسافرت','مسافرت خانوادگی','مراسم خانوادگی','فوت بستگان','اعزام به مسابقه/اردو','شرکت در المپیاد/همایش','مشکل در رفت‌وآمد','شرایط جوی/آلودگی هوا','نامه‌ی ولی یا مدرسه']).map(x=>`<button type="button" data-xc="${id}" data-xk="${k}" data-xt="${x}">${x}</button>`).join('')}</div></div>`};
function renderAtt(){
 {const r=rangeY();if(iso(cur)<iso(r.a))cur=r.a;else if(iso(cur)>iso(r.b))cur=r.b}
 const D=days(),st=S.students,p=jp(cur),ALL=Object.keys(S.att);
 const Ys=SY;if(!SEL.y.querySelector(`[value="${Ys}"]`))SEL.y.insertAdjacentHTML('beforeend',`<option value="${Ys}">سال تحصیلی ${syLab(Ys)}</option>`);
 SEL.y.value=Ys;SEL.m.value=p.m;SEL.d.value=p.d;
 SEL.d.style.display=mode==='d'?'':'none';SEL.m.style.display=mode==='m'?'none':'';
 let pk='';
 if(mode==='w'){const ws0=d=>addD(d,-((d.getUTCDay()+1)%7)),rg=rangeY(),a0=iso(rg.a),b0=iso(rg.b),seen={};
 const add=k=>{const d=new Date(k+'T12:00:00Z');if(k<a0||k>b0||hol(d)||S.closed[k])return;const w=iso(ws0(d));if(!seen[w]||k<seen[w])seen[w]=k};
 Object.keys(S.att).forEach(k=>{if(st.some(s=>(S.att[k]||{})[s.id]))add(k)});S.exams.forEach(e=>add(e.date));
 const cw=iso(ws0(cur)),ks=Object.keys(seen).sort().reverse();
 pk=`<b style="width:100%;font-size:14px">📅 هفته‌های ثبت‌شده (${fa(ks.length)})</b>`+(ks.map(w=>{const a=new Date(w+'T12:00:00Z'),pa=jp(a),pb=jp(addD(a,4));return `<button class="${w===cw?'on':''}" onclick="pickW('${seen[w]}')">${fa(pa.m+'/'+pa.d)} تا ${fa(pb.m+'/'+pb.d)}</button>`}).join('')||'<span class="sub">هنوز هفته‌ای با داده ثبت نشده</span>')}
 else if(mode==='m')pk=SM.map(m=>`<button class="${m===p.m?'on':''}" onclick="pickM(${m})">${MN[m-1]}</button>`).join('');
 $('pk').innerHTML=pk;$('pk').style.display=pk?'':'none';
 document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
 $('ttl').textContent=title();$('exinfo').textContent='خروجی بر اساس نمای فعلی: '+title();
 const reg=ALL.filter(k=>!S.closed[k]&&!hol(new Date(k+'T12:00:00Z'))&&st.some(s=>S.att[k][s.id])).sort().reverse();
 $('regCard').style.display=mode==='d'?'':'none';
 $('regt').textContent='📅 تاریخ‌های ثبت‌شده ('+fa(reg.length)+')';
 $('reg').innerHTML=reg.slice(0,8).map(k=>`<button class="${k===iso(cur)?'on':''}" onclick="goD('${k}')">${fmt(new Date(k+'T12:00:00Z'))}</button>`).join('')||'<span class="sub">هنوز چیزی ثبت نشده</span>';
 let body;
 if(mode==='d'&&S.closed[iso(cur)])body=closedCard();
 else if(mode==='d'&&hol(cur))body='<div class="card"><p class="sub" style="font-size:16px">🏖️ پنجشنبه و جمعه تعطیل است.<br>یک روز دیگر را انتخاب کنید.</p></div>';
 else if(mode==='d'){const A=S.att[iso(cur)]||{};
  body=`<div class="card"><button class="sm" onclick="allP()" style="width:100%;margin-bottom:6px">✅ ثبت همه به‌عنوان حاضر</button>${dayInfo()}${st.map(s=>{const c=cnt(s.id,ALL),kk=iso(cur),cs=cellV(kk,s.id);return `<div class="row"><div><b>${esc2(s.name)}</b><div class="sum">✅${fa(c.p)} | ❌${fa(c.a)} | 📝${fa(c.e)} | ⏰${fa(c.l)}</div></div><div class="btns">${[['p','حاضر'],['a','غایب'],['l','تأخیر'],['e','موجه']].map(([k,t])=>`<button class="a-${k}${cs===k?' on':''}" onclick="setAtt(${s.id},'${k}')">${t}</button>`).join('')}</div>${cs==='e'?xBox(s.id,kk):''}</div>`}).join('')}</div>`;
 }else{
  const head=D.map(d=>`<th class="${d.getUTCDay()===5?'fr':''}">${mode==='w'?wd(d)+'<br>'+fa(jp(d).m+'/'+jp(d).d):fa(jp(d).d)}</th>`).join('');
  const rows=st.map(s=>{const c=cnt(s.id,D.map(iso));return `<tr><td class="nm">${esc2(s.name)}</td>${D.map(d=>{const k=iso(d),v=cellV(k,s.id);return `<td class="c ${v}" onclick="cyc(${s.id},'${k}')">${SYM[v]||'·'}</td>`}).join('')}<td><b>${fa(c.p)}</b></td><td><b>${fa(c.a)}</b></td><td><b>${fa(c.e)}</b></td><td><b>${fa(c.l)}</b></td></tr>`}).join('');
  body=`<div class="card wrap"><table class="at"><tr><th class="nm">نام</th>${head}<th>ح</th><th>غ</th><th>م</th><th>ت</th></tr>${rows}</table><p class="sub">برای تغییر وضعیت روی هر خانه بزنید (ح حاضر، غ غایب، ت تأخیر، م غیبت موجه — توضیح «موجه» را در نمای روزانه بنویسید)</p></div>`;
 }
 $('attBody').innerHTML=body+weekExtra()+closedList();
}
window.pickW=k=>{cur=new Date(k+'T12:00:00Z');renderAtt()};
window.pickM=m=>{const Y=SY;cur=fromJ(m>=7?Y:Y+1,m,1);renderAtt()};
window.goD=k=>{cur=new Date(k+'T12:00:00Z');SY=schoolRange(cur).Y;renderAtt()};
const putAtt=(key,id,n)=>{const A=S.att[key]=S.att[key]||{},X=S.attx=S.attx||{};if(!n){delete A[id];if(X[key]){delete X[key][id];if(!Object.keys(X[key]).length)delete X[key]}return}
 if(n==='e'){A[id]='a';(X[key]=X[key]||{})[id]=(X[key]||{})[id]||''}else{A[id]=n;if(X[key]){delete X[key][id];if(!Object.keys(X[key]).length)delete X[key]}}};
window.setAtt=(id,k)=>{const key=iso(cur);putAtt(key,id,cellV(key,id)===k?'':k);render()};
window.cyc=(id,key)=>{const o=['','p','a','l','e'];putAtt(key,id,o[(o.indexOf(cellV(key,id))+1)%5]);render()};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.xn!==undefined&&t.dataset.xk){const X=S.attx=S.attx||{};(X[t.dataset.xk]=X[t.dataset.xk]||{})[t.dataset.xn]=t.value;try{save()}catch(x){}}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-xc]');if(!b)return;const X=S.attx=S.attx||{},k=b.dataset.xk,id=b.dataset.xc,o=(X[k]=X[k]||{})[id]||'';X[k][id]=o?(o.indexOf(b.dataset.xt)<0?o+'، '+b.dataset.xt:o):b.dataset.xt;render()});
window.allP=()=>{const A=S.att[iso(cur)]=S.att[iso(cur)]||{};S.students.forEach(s=>A[s.id]='p');if(S.attx)delete S.attx[iso(cur)];render()};

(function(){
 let vy,vm;const box=$('jcal');
 const mIdx=(y,m)=>y*12+(m-1);
 function bounds(){const r=rangeY(),a=jp(r.a),b=jp(r.b);return{lo:mIdx(a.y,a.m),hi:mIdx(b.y,b.m),a:iso(r.a),b:iso(r.b)}}
 function draw(){
  const B=bounds(),first=fromJ(vy,vm,1),n=monthDays(first).length,off=(first.getUTCDay()+1)%7,tk=iso(tdy()),ck=iso(cur);
  $('jhd').textContent=MN[vm-1]+' '+fa(vy);
  $('jpv').disabled=mIdx(vy,vm)<=B.lo;$('jnx').disabled=mIdx(vy,vm)>=B.hi;
  let h=WS.map((w,i)=>`<div class="wh${i===6?' fr':''}">${w}</div>`).join('');
  h+='<div></div>'.repeat(off);
  for(let d=1;d<=n;d++){
   const g=addD(first,d-1),k=iso(g),w=g.getUTCDay();
   const out=k<B.a||k>B.b,dis=out||hol(g)||(S.closed&&S.closed[k]);
   const has=S.att[k]&&S.students.some(s=>S.att[k][s.id]);
   h+=`<button class="dy${w===5||w===4?' fr':''}${k===tk?' td':''}${k===ck?' sel':''}${has?' has':''}" ${dis?'disabled':''} data-k="${k}">${fa(d)}</button>`;
  }
  $('jgr').innerHTML=h;
 }
 function open(){const p=jp(cur);vy=p.y;vm=p.m;draw();box.classList.add('open')}
 function close(){box.classList.remove('open')}
 $('ttl').onclick=open;
 $('ttl').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
 $('jpv').onclick=()=>{if(--vm<1){vm=12;vy--}draw()};
 $('jnx').onclick=()=>{if(++vm>12){vm=1;vy++}draw()};
 $('jcl').onclick=close;
 box.onclick=e=>{if(e.target===box)close()};
 $('jtd').onclick=()=>{cur=tdy();SY=schoolRange(cur).Y;close();renderAtt()};
 $('jgr').onclick=e=>{const b=e.target.closest('.dy');if(!b||b.disabled)return;cur=new Date(b.dataset.k+'T12:00:00Z');SY=schoolRange(cur).Y;close();renderAtt()};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();

(function(){
const CFG={apiKey:"AIzaSyC86e3fGrtIOV8xhHxLSSdXIrwB9T55iC4",authDomain:"class-league-6c89f.firebaseapp.com",projectId:"class-league-6c89f",storageBucket:"class-league-6c89f.firebasestorage.app",messagingSenderId:"40902200828",appId:"1:40902200828:web:c7efb837a6aafca8c63679"};
const B='https://www.gstatic.com/firebasejs/10.12.2/';
const ld=src=>new Promise((r,j)=>{const e=document.createElement('script');e.src=src;e.onload=r;e.onerror=j;document.head.appendChild(e)});
const ts=()=>+localStorage.getItem('cl1_ts')||0;
let auth,db,user=null,timer=null,busy=false;
const ui=(t,c)=>{$('cst').textContent=t;$('cb').dataset.s=c||''};
const ref=()=>db.collection('users').doc(user.uid);
window.cloudWipe=async()=>{if(!user)return false;const sn=await ref().collection('parts').get();await Promise.all(sn.docs.map(d=>d.ref.delete()));await ref().delete();return true};
const fmtT=t=>t?new Date(t).toLocaleString('fa-IR'):'—';
async function applyCloud(d){try{if(d.v===2){const sn=await ref().collection('parts').get(),m={},ix=Object.assign({},d.idx,d.fx||{});sn.forEach(x=>{const q=x.data();(m[q.p]=m[q.p]||[])[q.i]=q.d});
 const g=k=>{if(!ix[k])return undefined;const a=m[k];if(!a||a.length!==ix[k].n||a.some(x=>x==null))throw new Error('incomplete');return JSON.parse(a.join(''))};
 const ns=window.__stor.join(g,Object.keys(d.idx).filter(k=>k[0]==='c').map(k=>k.slice(1)));localStorage.setItem('cl1',JSON.stringify(ns))}else localStorage.setItem('cl1',d.data);
 localStorage.setItem('cl1_ts',d.ts);location.reload()}catch(e){ui('❌ دریافت کامل اطلاعات ابری ممکن نشد: '+(e.code||e.message),'err')}}
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h},CHK=250000;let lastIdx=null,v2=true;
const cut=s=>{const r=[];let i=0;do{let e=Math.min(s.length,i+CHK);if(e<s.length){const c=s.charCodeAt(e-1);if(c>=0xD800&&c<=0xDBFF)e++}r.push(s.slice(i,e));i=e}while(i<s.length);return r};
const parts=o=>window.__stor.split(o);
async function push(){if(!user)return;let note='';try{ui('در حال ذخیره…','');const raw=localStorage.getItem('cl1')||JSON.stringify(S),ts0=ts()||Date.now(),by=navigator.userAgent.slice(0,60),legacy=()=>ref().set({data:raw,ts:ts0,by});
 if(v2){try{const o=JSON.parse(raw),P=parts(o),idx={},col=ref().collection('parts'),W=[];
  Object.keys(P).forEach(k=>{const s=P[k],ch=cut(s),h=hs(s)+':'+s.length;idx[k]={n:ch.length,h};if(lastIdx&&lastIdx[k]&&lastIdx[k].h===h)return;ch.forEach((d,i)=>W.push(col.doc(k+'~'+i).set({p:k,i,d})))});
  await Promise.all(W);const stale=[];if(lastIdx)Object.keys(lastIdx).forEach(k=>{const n=idx[k]?idx[k].n:0;for(let i=n;i<lastIdx[k].n;i++)stale.push(col.doc(k+'~'+i).delete())});
  const ix1={},fx1={};Object.keys(idx).forEach(k=>(k[0]==='s'?fx1:ix1)[k]=idx[k]);await ref().set({v:2,idx:ix1,fx:fx1,ts:ts0,by});await Promise.all(stale);lastIdx=idx}catch(e){if(e.code==='permission-denied'){v2=false;await legacy();note='\n⚠️ حالت قدیمی (تک‌سند). قوانین Firestore را برای ذخیره‌ی بخش‌بخش اصلاح کنید.'}else throw e}}
 else{await legacy();note='\n⚠️ حالت قدیمی (تک‌سند). قوانین Firestore را اصلاح کنید.'}
 ui('✅ ذخیره شد · '+user.email+'\nآخرین ذخیره: '+fmtT(ts())+note,'ok')}catch(e){ui('❌ ذخیره نشد (اینترنت، دسترسی یا حجم): '+(e.code||e.message),'err')}}
let dirty=false;
window.cloudPush=()=>{if(!user)return;dirty=true;clearTimeout(timer);timer=setTimeout(()=>{dirty=false;push()},1200)};
let waitOn=false;
function wait(){if(waitOn)return;waitOn=true;let n=0;
 const go=async()=>{const a=document.activeElement;
  if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='file'&&n++<40){setTimeout(go,2500);return}
  waitOn=false;if(!user||dirty)return;
  if(n>40){ui('🔄 تغییر تازه‌ای در ابر هست؛ «همگام‌سازی الآن» را بزنید.','');return}
  try{const sn=await ref().get();const d=sn.exists&&sn.data();if(d&&d.ts>ts()){ui('🔄 دریافت تغییرات دستگاه دیگر…','');applyCloud(d)}}catch(e){}};
 go()}
async function sync(first){
 if(!user||busy)return;busy=true;
 try{ui('در حال همگام‌سازی…','');const snap=await ref().get(),lt=ts();
  if(!snap.exists){await push()}
  else{const d=snap.data();
   if(d.v===2&&d.idx&&d.ts<=lt&&!lastIdx)lastIdx=Object.assign({},d.idx,d.fx||{});
   if(d.ts>lt){
    if(first&&lt===0&&localStorage.getItem('cl1')&&!confirm('در حساب ابری شما اطلاعات ذخیره شده است.\n\nOK = اطلاعات ابری روی این دستگاه بیاید\nCancel = اطلاعات همین دستگاه جایگزین ابری شود')){localStorage.setItem('cl1_ts',Date.now());await push()}
    else if(first)applyCloud(d);else wait()
   }else if(d.ts<lt){await push()}
   else ui('✅ همه‌چیز به‌روز است · '+user.email+'\nآخرین تغییر: '+fmtT(lt),'ok')}
 }catch(e){ui('❌ خطا در همگام‌سازی: '+(e.code||e.message),'err')}
 busy=false}
function open(){$('cpan').classList.add('open');$('cin').style.display=user?'none':'';$('csy').style.display=$('cout').style.display=user?'':'none'}
$('cb').onclick=open;$('ccl').onclick=()=>$('cpan').classList.remove('open');
$('cpan').onclick=e=>{if(e.target.id==='cpan')$('cpan').classList.remove('open')};
if(!CFG.apiKey){ui('ذخیره‌ی ابری هنوز تنظیم نشده است. کلیدهای Firebase باید در فایل قرار بگیرد.','off');$('cin').style.display=$('csy').style.display=$('cout').style.display='none';return}
ui('در حال اتصال…','');
ld(B+'firebase-app-compat.js').then(()=>Promise.all([ld(B+'firebase-auth-compat.js'),ld(B+'firebase-firestore-compat.js')])).then(()=>{
 firebase.initializeApp(CFG);auth=firebase.auth();db=firebase.firestore();
 let un=null;auth.onAuthStateChanged(u=>{user=u;if(un){try{un()}catch(e){}un=null}if(u){try{un=ref().onSnapshot(sn=>{if(!sn.exists||sn.metadata.hasPendingWrites||busy||dirty)return;const d=sn.data();if(d&&ts()>0&&d.ts>ts())wait()},()=>{})}catch(e){}$('cin').style.display='none';$('csy').style.display=$('cout').style.display='';sync(true)}else{ui('وارد نشده‌اید. با ورود به حساب گوگل، اطلاعات شما در هر دستگاهی در دسترس است.','');$('cin').style.display='';$('csy').style.display=$('cout').style.display='none'}});
 $('cin').onclick=()=>{const pr=new firebase.auth.GoogleAuthProvider();pr.setCustomParameters({prompt:'select_account'});const MSG={'auth/popup-blocked':'پنجره‌ی ورود توسط مرورگر مسدود شد. اجازه‌ی پاپ‌آپ (Allow popups) را برای این سایت بدهید و دوباره بزنید.','auth/popup-closed-by-user':'پنجره‌ی ورود بسته شد. دوباره بزنید و ورود را تا آخر کامل کنید.','auth/cancelled-popup-request':'ورود قبلی هنوز باز است؛ آن را ببندید و دوباره بزنید.','auth/network-request-failed':'اتصال به گوگل برقرار نشد. اینترنت یا فیلترشکن را بررسی کنید.','auth/internal-error':'اتصال به سرویس ورود گوگل ناموفق بود. فیلترشکن را بررسی کنید یا مرورگر Chrome را امتحان کنید.','auth/unauthorized-domain':'دامنه‌ی این صفحه در Firebase مجاز نشده است.','auth/web-storage-unsupported':'مرورگر ذخیره‌ی اطلاعات را مسدود کرده است. کوکی‌ها را برای این سایت مجاز کنید.'};auth.signInWithPopup(pr).catch(e=>{ui('❌ ورود انجام نشد: '+(MSG[e.code]||e.code),'err')})};
 $('csy').onclick=()=>sync(false);
 $('cout').onclick=()=>auth.signOut();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync(false);else if(dirty&&user){clearTimeout(timer);dirty=false;push()}});
 addEventListener('pagehide',()=>{if(dirty&&user){clearTimeout(timer);dirty=false;push()}});
 setInterval(()=>{if(!document.hidden&&user&&!dirty&&!busy)sync(false)},60000);
 addEventListener('online',()=>sync(false));
}).catch(()=>ui('❌ بارگذاری Firebase ممکن نشد (اینترنت یا فایل از طریق آدرس وب باز نشده).','err'));
})();
const XL='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',H2C='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',JSP='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const msg=t=>{$('exmsg').textContent=t;const r=$('rmsg');if(r)r.textContent=t};
const MIR={};MIR[H2C]=['https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js','https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'];MIR[JSP]=['https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js','https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'];MIR['https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js']=['https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js','https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js'];
const loadJS=src=>new Promise((res,rej)=>{window.__ok=window.__ok||{};window.__bad=window.__bad||{};if(window.__ok[src])return res();if(window.__bad[src])return rej(new Error('load'));const L=[src].concat(MIR[src]||[]);let i=0;(function nx(){if(i>=L.length){window.__bad[src]=1;return rej(new Error('load'))}const e=document.createElement('script');let done=0;const t=setTimeout(()=>{if(!done){done=1;e.remove();nx()}},6000);e.src=L[i++];e.onload=()=>{if(done)return;done=1;clearTimeout(t);window.__ok[src]=1;res()};e.onerror=()=>{if(done)return;done=1;clearTimeout(t);e.remove();nx()};document.head.appendChild(e)})()});
async function pdfLibs(){if(window.html2canvas&&window.jspdf)return;try{await Promise.all([loadJS(H2C),loadJS(JSP)])}catch(e){}}
const rast=el=>{bdFix(el);return window.html2canvas?window.html2canvas(el,{scale:2,backgroundColor:'#ffffff'}):fobj(el,{scale:2})};
const errT=x=>'ساخت فایل ناموفق بود'+(x&&x.message?' ('+x.message+')':'');
function dlLink(u,name,data,box){let b=document.getElementById('dlbar');if(!b){b=document.createElement('div');b.id='dlbar';b.style.cssText='position:fixed;left:10px;right:10px;bottom:12px;z-index:99999;background:#2d1f4d;color:#fff;border-radius:14px;padding:10px 14px;font:700 13px Vazirmatn,Tahoma,sans-serif;display:flex;gap:10px;align-items:center;justify-content:space-between;box-shadow:0 6px 20px #0006;line-height:1.8';document.body.appendChild(b)}
 const F=data?new File([data],name):null,sh=F&&navigator.canShare&&(()=>{try{return navigator.canShare({files:[F]})}catch(e){return false}})();
 b.innerHTML='<span>'+(box?'⚠️ این پیش‌نمایش اجازه‌ی دانلود مستقیم نمی‌دهد. گزینه‌های زیر را امتحان کنید؛ اگر نشد، برنامه را از آدرس سایت در Chrome باز کنید.':'✅ فایل آماده شد. اگر دانلود شروع نشد، لینک را بزنید.')+' <a id="dla" style="color:#ffd54f;text-decoration:underline"></a>'+(sh?' <button id="dls" style="border:0;border-radius:10px;padding:6px 10px;background:#ffd54f;color:#2d1f4d;cursor:pointer;font:inherit">📤 ارسال / ذخیره</button>':'')+'</span><button id="dlx" style="border:0;border-radius:10px;padding:6px 10px;background:#ffffff26;color:#fff;cursor:pointer">✕</button>';
 const a=b.querySelector('#dla');a.href=u;a.download=name;a.textContent='دانلود با لینک';b.querySelector('#dlx').onclick=()=>b.remove();
 const bs=b.querySelector('#dls');if(bs)bs.onclick=async()=>{try{await navigator.share({files:[F],title:name})}catch(e){}};
 clearTimeout(b._t);b._t=setTimeout(()=>b.remove(),120000)}
const ExcelLite=(()=>{
const BF=t=>typeof t==='string'?t.replace(/([()«»])/g,'\u200f$1\u200f'):t;
const X=t=>String(t).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const colL=c=>{let t='';while(c>0){const m=(c-1)%26;t=String.fromCharCode(65+m)+t;c=Math.floor((c-1)/26)}return t};
const addr=a=>{const m=/^([A-Z]+)(\d+)$/.exec(a);let c=0;for(const ch of m[1])c=c*26+ch.charCodeAt(0)-64;return[+m[2],c]};
const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CT[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
const zip=files=>{const E=new TextEncoder(),parts=[],cen=[];let off=0;
 files.forEach(f=>{const nm=E.encode(f.n),cr=crc(f.d),h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,cr,true);h.setUint32(18,f.d.length,true);h.setUint32(22,f.d.length,true);h.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(h.buffer),nm,f.d);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,cr,true);c.setUint32(20,f.d.length,true);c.setUint32(24,f.d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+f.d.length});
 let cs=0;cen.forEach(q=>cs+=q.length);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 const all=[...parts,...cen,new Uint8Array(e.buffer)];let n=0;all.forEach(q=>n+=q.length);const out=new Uint8Array(n);let o=0;all.forEach(q=>{out.set(q,o);o+=q.length});return out};
class Cell{constructor(){this.value=null}}
class Row{constructor(ws,n){this.ws=ws;this.n=n;this.cells=new Map();this.height=null}
 getCell(c){if(typeof c==='string')c=addr(c+'1')[1];let x=this.cells.get(c);if(!x){x=new Cell();this.cells.set(c,x)}return x}
 eachCell(o,f){if(typeof o==='function'){f=o;o={}}const ks=[...this.cells.keys()].sort((a,b)=>a-b);
  if(o&&o.includeEmpty){const mx=ks.length?ks[ks.length-1]:0;for(let c=1;c<=mx;c++)f(this.getCell(c),c)}else ks.forEach(c=>{const x=this.cells.get(c);if(x.value!=null)f(x,c)})}}
class WS{constructor(wb,name,o){this.wb=wb;this.name=String(name).replace(/[\\\/?*\[\]:]/g,' ').slice(0,31)||'Sheet';this.o=o||{};this.views=this.o.views;this.pageSetup=this.o.pageSetup;this.headerFooter=null;this.rows=new Map();this.merges=[];this._cols=[];this._last=0}
 set columns(a){this._cols=a.map(c=>Object.assign({},c));if(a.some(c=>c.header!=null)){const r=this.getRow(1);a.forEach((c,i)=>{if(c.header!=null)r.getCell(i+1).value=c.header})}}
 get columns(){return this._cols}
 getColumn(n){return this._cols[n-1]=this._cols[n-1]||{}}
 getRow(n){let r=this.rows.get(n);if(!r){r=new Row(this,n);this.rows.set(n,r)}if(n>this._last)this._last=n;return r}
 addRow(a){const r=this.getRow(this._last+1);a.forEach((v,i)=>{r.getCell(i+1).value=v});return r}
 getCell(a){const[rn,c]=addr(a);return this.getRow(rn).getCell(c)}
 mergeCells(a){this.merges.push(a)}
 eachRow(o,f){if(typeof o==='function')f=o;[...this.rows.keys()].sort((a,b)=>a-b).forEach(n=>{const r=this.rows.get(n);if([...r.cells.values()].some(c=>c.value!=null))f(r,n)})}}
class WB{constructor(){this.sheets=[];this.xlsx={writeBuffer:async()=>this._build()}}
 addWorksheet(n,o){const w=new WS(this,n,o);this.sheets.push(w);return w}
 get worksheets(){return this.sheets}
 _build(){const E=new TextEncoder(),F=[],Fi=[],Bo=[],XF=[],FM={},fk={},lk={},bk={},xk={};let nf=164;
  const reg=(m,a,k,v)=>{if(m[k]==null){m[k]=a.length;a.push(v)}return m[k]};
  const font=f=>{f=f||{};return`<font>${f.bold?'<b/>':''}<sz val="${f.size||11}"/><color rgb="${f.color&&f.color.argb||'FF222222'}"/><name val="${X(f.name||'Tahoma')}"/></font>`};
  reg(fk,F,JSON.stringify({}),font());reg(lk,Fi,'n','<fill><patternFill patternType="none"/></fill>');reg(lk,Fi,'g','<fill><patternFill patternType="gray125"/></fill>');reg(bk,Bo,'n','<border><left/><right/><top/><bottom/><diagonal/></border>');
  const xf=c=>{const f=c.font?reg(fk,F,JSON.stringify(c.font),font(c.font)):0,
   fl=c.fill&&c.fill.fgColor?reg(lk,Fi,'f'+c.fill.fgColor.argb,`<fill><patternFill patternType="solid"><fgColor rgb="${c.fill.fgColor.argb}"/><bgColor indexed="64"/></patternFill></fill>`):0,
   bd=c.border?reg(bk,Bo,JSON.stringify(c.border),'<border>'+['left','right','top','bottom'].map(k=>{const q=c.border[k];return q&&q.style?`<${k} style="${q.style}"><color rgb="${q.color&&q.color.argb||'FF000000'}"/></${k}>`:`<${k}/>`}).join('')+'<diagonal/></border>'):0,
   nm=c.numFmt==='@'?49:0,a=c.alignment,key=[f,fl,bd,nm,a?JSON.stringify(a):''].join('|');
   if(!f&&!fl&&!bd&&!nm&&!a)return 0;
   return reg(xk,XF,key,`<xf numFmtId="${nm}" fontId="${f}" fillId="${fl}" borderId="${bd}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"${a?' applyAlignment="1"><alignment'+(a.horizontal?` horizontal="${a.horizontal}"`:'')+(a.vertical?` vertical="${a.vertical==='middle'?'center':a.vertical}"`:'')+(a.wrapText?' wrapText="1"':'')+(a.textRotation?' textRotation="'+a.textRotation+'"':'')+(a.readingOrder==='rtl'?' readingOrder="2"':'')+'/></xf>':'/>'}`)+1};
  const sheets=this.sheets.map((w,si)=>{const rows=[...w.rows.keys()].sort((a,b)=>a-b);let mxc=1,mxr=1;const dv={};
   const rx=rows.map(rn=>{const r=w.rows.get(rn),ks=[...r.cells.keys()].sort((a,b)=>a-b);mxr=Math.max(mxr,rn);
    const cx=ks.map(cn=>{const c=r.cells.get(cn);mxc=Math.max(mxc,cn);const s=xf(c),ref=colL(cn)+rn,sa=s?` s="${s}"`:'';let v=c.value;if(v&&typeof v==='object'&&!(v instanceof Date)&&'text' in v)v=v.text;
     if(c.dataValidation){const q=c.dataValidation,k=JSON.stringify(q);(dv[k]=dv[k]||{q,refs:[]}).refs.push([cn,rn])}
     if(v==null||v==='')return`<c r="${ref}"${sa}/>`;if(typeof v==='number'&&isFinite(v))return`<c r="${ref}"${sa}><v>${v}</v></c>`;if(typeof v==='boolean')return`<c r="${ref}"${sa} t="b"><v>${v?1:0}</v></c>`;
     return`<c r="${ref}"${sa} t="inlineStr"><is><t xml:space="preserve">${X(BF(v))}</t></is></c>`}).join('');
    return`<row r="${rn}"${r.height?` ht="${r.height}" customHeight="1"`:''}>${cx}</row>`}).join('');
   const vw=(w.views||[])[0]||{},fz=vw.state==='frozen'&&(vw.xSplit||vw.ySplit),xs=vw.xSplit||0,ys=vw.ySplit||0,ap=xs&&ys?'bottomRight':ys?'bottomLeft':'topRight',tl=colL(xs+1)+(ys+1);
   const ps=w.pageSetup||{},cols=w._cols.map((c,i)=>c&&(c.width||c.hidden)?`<col min="${i+1}" max="${i+1}" width="${c.width||10}" customWidth="1"${c.hidden?' hidden="1"':''}/>`:'').join('');
   const dvx=Object.values(dv).map(({q,refs})=>{refs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const runs=[];refs.forEach(([c,r])=>{const l=runs[runs.length-1];if(l&&l.c===c&&l.b===r-1)l.b=r;else runs.push({c,a:r,b:r})});
    return`<dataValidation type="${q.type||'list'}" allowBlank="${q.allowBlank?1:0}" showErrorMessage="1" sqref="${runs.map(u=>colL(u.c)+u.a+(u.b>u.a?':'+colL(u.c)+u.b:'')).join(' ')}"><formula1>${X((q.formulae||[''])[0])}</formula1></dataValidation>`});
   const mg=w.merges.length?`<mergeCells count="${w.merges.length}">${w.merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells>`:'';
   const mp=ps.margins||{},hf=w.headerFooter&&w.headerFooter.oddFooter;
   return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+(ps.fitToPage?'<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>':'')+`<dimension ref="A1:${colL(mxc)}${mxr}"/><sheetViews><sheetView workbookViewId="0"${si===0?' tabSelected="1"':''}${vw.rightToLeft?' rightToLeft="1"':''}${vw.showGridLines===false?' showGridLines="0"':''}>${fz?`<pane${xs?` xSplit="${xs}"`:''}${ys?` ySplit="${ys}"`:''} topLeftCell="${tl}" activePane="${ap}" state="frozen"/><selection pane="${ap}" activeCell="${tl}" sqref="${tl}"/>`:''}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>${cols?`<cols>${cols}</cols>`:''}<sheetData>${rx}</sheetData>${mg}${dvx.length?`<dataValidations count="${dvx.length}">${dvx.join('')}</dataValidations>`:''}<pageMargins left="${mp.left||.7}" right="${mp.right||.7}" top="${mp.top||.75}" bottom="${mp.bottom||.75}" header="${mp.header||.3}" footer="${mp.footer||.3}"/><pageSetup paperSize="${ps.paperSize||9}" orientation="${ps.orientation||'portrait'}"${ps.fitToPage?` fitToWidth="${ps.fitToWidth||1}" fitToHeight="${ps.fitToHeight==null?1:ps.fitToHeight}"`:''}/>${hf?`<headerFooter><oddFooter>${X(hf)}</oddFooter></headerFooter>`:''}</worksheet>`});
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+`<fonts count="${F.length}">${F.join('')}</fonts><fills count="${Fi.length}">${Fi.join('')}</fills><borders count="${Bo.length}">${Bo.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${XF.length+1}"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>${XF.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  const R='http://schemas.openxmlformats.org/officeDocument/2006/relationships',H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const files=[{n:'[Content_Types].xml',d:H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>'},
   {n:'_rels/.rels',d:H+`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
   {n:'xl/workbook.xml',d:H+`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R}"><bookViews><workbookView/></bookViews><sheets>${this.sheets.map((w,i)=>`<sheet name="${X(w.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`},
   {n:'xl/_rels/workbook.xml.rels',d:H+`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${R}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="${R}/styles" Target="styles.xml"/></Relationships>`},
   {n:'xl/styles.xml',d:styles}].concat(sheets.map((x,i)=>({n:`xl/worksheets/sheet${i+1}.xml`,d:x})));
  files.forEach(f=>{f.d=E.encode(f.d)});return zip(files).buffer}}
return{Workbook:WB}})();
async function xread(buf){const u=new Uint8Array(buf),dv=new DataView(buf),D=new TextDecoder(),P=t=>new DOMParser().parseFromString(t,'application/xml');
 let e=u.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('zip');
 const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const ent={};
 for(let i=0;i<n;i++){if(dv.getUint32(p,true)!==0x02014b50)throw new Error('zip');const m=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);ent[D.decode(u.subarray(p+46,p+46+nl))]={m,cs,lo};p+=46+nl+el+cl}
 const get=async nm=>{const f=ent[nm];if(!f)return null;const nl=dv.getUint16(f.lo+26,true),el=dv.getUint16(f.lo+28,true),st=f.lo+30+nl+el,raw=u.subarray(st,st+f.cs);if(f.m===0)return D.decode(raw);if(f.m!==8)throw new Error('zip');
  return D.decode(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())};
 const wbx=await get('xl/workbook.xml');if(!wbx)throw new Error('xlsx');
 const sh=P(wbx).getElementsByTagName('sheet')[0],rid=sh&&(sh.getAttribute('r:id')||sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'));
 let path='xl/worksheets/sheet1.xml';const rl=await get('xl/_rels/workbook.xml.rels');
 if(rl&&rid)[...P(rl).getElementsByTagName('Relationship')].forEach(r=>{if(r.getAttribute('Id')===rid){let t=r.getAttribute('Target');path=t[0]==='/'?t.slice(1):'xl/'+t}});
 const ssx=await get('xl/sharedStrings.xml'),tx=el=>{let t='';Array.from(el.children).forEach(c=>{if(c.localName==='t')t+=c.textContent;else if(c.localName==='r'){const q=c.getElementsByTagName('t')[0];if(q)t+=q.textContent}});return t};
 const ss=ssx?[...P(ssx).getElementsByTagName('si')].map(tx):[];
 const stx=await get('xl/styles.xml'),dfm=new Set();
 if(stx){const sd=P(stx),cf={};[...sd.getElementsByTagName('numFmt')].forEach(f=>{cf[f.getAttribute('numFmtId')]=f.getAttribute('formatCode')||''});
  const isD=id=>(id>=14&&id<=22)||(id>=45&&id<=47)||(cf[id]!=null&&/[dmy]/i.test(cf[id].replace(/"[^"]*"|\[[^\]]*\]/g,'')));
  const xs=sd.getElementsByTagName('cellXfs')[0];if(xs)Array.from(xs.children).forEach((x,i)=>{if(isD(+x.getAttribute('numFmtId')))dfm.add(i)})}
 const sx=await get(path);if(!sx)throw new Error('sheet');
 const idx=r=>{let c=0;for(const ch of r.replace(/\d+/g,''))c=c*26+ch.charCodeAt(0)-64;return c-1};
 const rows=[];[...P(sx).getElementsByTagName('row')].forEach(r=>{const a=[];let k=0;Array.from(r.children).forEach(c=>{if(c.localName!=='c')return;const ref=c.getAttribute('r'),ci=ref?idx(ref):k;k=ci+1;const t=c.getAttribute('t'),v=c.getElementsByTagName('v')[0],vt=v?v.textContent:'';let val='';
  if(t==='s')val=ss[+vt]||'';else if(t==='inlineStr'){const is=c.getElementsByTagName('is')[0];val=is?tx(is):''}else if(t==='str')val=vt;else if(t==='b')val=vt==='1'?'TRUE':'FALSE';else if(t==='e')val='';
  else if(vt!==''){if(dfm.has(+c.getAttribute('s'))&&isFinite(+vt)){const d=new Date(Math.round((+vt-25569)*864e5)),q=jp(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),12)));val=q.y+'/'+z2(q.m)+'/'+z2(q.d)}else val=/e/i.test(vt)?Number(vt).toLocaleString('en-US',{useGrouping:false,maximumFractionDigits:15}):vt}
  a[ci]=val});for(let i=0;i<a.length;i++)if(a[i]==null)a[i]='';if(a.some(x=>x!==''))rows.push(a)});
 return rows}
function bdFix(r){const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),a=[];let n;while(n=w.nextNode())a.push(n);a.forEach(t=>{let v=t.nodeValue;if(/[()«»]/.test(v))v=v.replace(/([()«»])/g,'\u200f$1\u200f');const re=/([0-9\u06f0-\u06f9]{4}\s*[-\u2013]\s*[0-9\u06f0-\u06f9]{4})/;if(re.test(v)&&t.parentNode){const f=document.createDocumentFragment();v.split(re).forEach((p,i)=>{if(i%2){const sp=document.createElement('span');sp.style.cssText='display:inline-block;direction:ltr;unicode-bidi:isolate';sp.textContent=p;f.appendChild(sp)}else if(p)f.appendChild(document.createTextNode(p))});t.parentNode.replaceChild(f,t)}else t.nodeValue=v})}
async function fobj(el,o){const sc=(o&&o.scale)||2,w=el.offsetWidth||parseFloat(el.style.width),h=el.offsetHeight||parseFloat(el.style.height),c=el.cloneNode(true);c.style.position='relative';c.style.left='0';c.style.top='0';c.style.margin='0';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}">${new XMLSerializer().serializeToString(c)}</foreignObject></svg>`,img=new Image();
 await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('render'));img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
 const cv=document.createElement('canvas');cv.width=w*sc;cv.height=h*sc;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);return cv}
function MiniPDF(o){const L=o&&o.orientation==='landscape',k=72/25.4,W=(L?297:210)*k,H=(L?210:297)*k,pg=[[]];
 this.addPage=()=>{pg.push([])};
 this.addImage=(url,f,x,y,w,h)=>{const b=atob(url.split(',')[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);let i=2,iw=0,ih=0,nc=3;
  while(i<u.length){if(u[i]!==0xFF){i++;continue}const m=u[i+1];if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC){ih=u[i+5]<<8|u[i+6];iw=u[i+7]<<8|u[i+8];nc=u[i+9];break}i+=2+(u[i+2]<<8|u[i+3])}
  pg[pg.length-1].push({u,iw,ih,nc,x,y,w,h})};
 this.output=()=>{const E=new TextEncoder(),parts=[],off=[];let len=0,id=2;const push=x=>{const b=typeof x==='string'?E.encode(x):x;parts.push(b);len+=b.length},ob=(n,h,st)=>{off[n]=len;push(`${n} 0 obj\n${h}`);if(st){push('\nstream\n');push(st);push('\nendstream')}push('\nendobj\n')};
  push('%PDF-1.4\n');const kids=[],pobj=[];pg.forEach(im=>{const pid=++id,cid=++id,ids=im.map(()=>++id);pobj.push({pid,cid,ids,im});kids.push(pid+' 0 R')});
  ob(1,'<< /Type /Catalog /Pages 2 0 R >>');ob(2,`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pg.length} >>`);
  pobj.forEach(({pid,cid,ids,im})=>{ob(pid,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << /XObject << ${im.map((_,i)=>`/Im${i} ${ids[i]} 0 R`).join(' ')} >> >> /Contents ${cid} 0 R >>`);
   const c=im.map((q,i)=>`q ${(q.w*k).toFixed(2)} 0 0 ${(q.h*k).toFixed(2)} ${(q.x*k).toFixed(2)} ${(H-(q.y+q.h)*k).toFixed(2)} cm /Im${i} Do Q`).join('\n');ob(cid,`<< /Length ${c.length} >>`,E.encode(c));
   im.forEach((q,i)=>ob(ids[i],`<< /Type /XObject /Subtype /Image /Width ${q.iw} /Height ${q.ih} /ColorSpace /${q.nc===1?'DeviceGray':'DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${q.u.length} >>`,q.u))});
  const xr=len,n=id+1;push(`xref\n0 ${n}\n0000000000 65535 f \n`);for(let i=1;i<n;i++)push(String(off[i]).padStart(10,'0')+' 00000 n \n');push(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
  const out=new Uint8Array(len);let o2=0;parts.forEach(b=>{out.set(b,o2);o2+=b.length});return out.buffer}}
async function dl(name,data){window.__dlok=false;const box=window.self!==window.top||!!window.claude;let ok=false;
 try{const D=window.claude?await window.claude.use('downloads'):null;if(D){await D.save({filename:name,data});ok=true}}catch(e){if(e&&e.code==='declined'){msg('');return false}}
 if(!ok){try{const u=URL.createObjectURL(new Blob([data])),l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();l.remove();dlLink(u,name,data,box);ok=!box}catch(e){}}
 window.__dlok=ok;window.dlFile=dl;window.__pdfx={pdfLibs,rast,MiniPDF};/* [CHG-1] اشتراک تابع دانلود */msg(ok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در مرورگر Chrome باز کنید.');return ok}
window.dlFile=dl;window.__pdfx={pdfLibs,rast,MiniPDF};/* [CHG-8] ابزار PDF از همان ابتدا در دسترس سایر بخش‌ها */
const z2=n=>String(n).padStart(2,'0'),jstamp=d=>{const q=jp(d);return q.y+'-'+z2(q.m)+'-'+z2(q.d)};
function fname(ext){const D=days(),d=D[0]||cur,q=jp(d);return 'attendance-'+{d:'daily',w:'weekly',m:'monthly'}[mode]+'-'+(mode==='m'?q.y+'-'+z2(q.m):jstamp(d))+'.'+ext}
const ORD=['اول','دوم','سوم','چهارم','پنجم','ششم'];
function exTitle(){const rg=rangeY(),a=iso(rg.a),b=iso(rg.b),R=allRange();
 if(mode==='d')return wd(cur)+' | '+MN[jp(cur).m-1]+' ماه | '+fmt(cur);
 if(mode==='w'){let s0=R[0],e0=R[4];if(iso(s0)<a)s0=rg.a;if(iso(e0)>b)e0=rg.b;const q=jp(s0),ws=d=>iso(addD(d,-((d.getUTCDay()+1)%7))),keys=[];monthDays(s0).forEach(d=>{const k=ws(d);if(!keys.includes(k))keys.push(k)});const i=Math.max(0,keys.indexOf(ws(s0)));return 'هفته '+ORD[i]+' | '+MN[q.m-1]+' ماه | '+fmt(s0)+' تا '+fmt(e0)}
 const md=monthDays(cur).filter(d=>iso(d)>=a&&iso(d)<=b);return MN[jp(cur).m-1]+' ماه | '+fmt(md[0])+' تا '+fmt(md[md.length-1])}
function matrix(){const D=days();return{wk:D.map(wd),dn:D.map(d=>mode==='m'?fa(jp(d).d):fa(jp(d).m)+'/'+fa(jp(d).d)),title:exTitle(),head:D.map(d=>mode==='m'?fa(jp(d).d):wd(d)),rows:S.students.map(s=>{const k=D.map(iso),c=cnt(s.id,k);return[s.name,...k.map(x=>SYM[cellV(x,s.id)]||''),c.p,c.a,c.e,c.l]})}}
function excNotes(){const D=days(),L=[];S.students.forEach(s=>{D.forEach(d=>{const k=iso(d);if((S.att[k]||{})[s.id]==='a'&&isX(k,s.id)){const t=String((S.attx[k]||{})[s.id]||'').trim();L.push({n:s.name,d:mode==='d'?'':wd(d)+' '+fmt(d),t:t||'(توضیحی ثبت نشده)'})}})});return L}
const EXJ='https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
async function xbook(o){
 const wb=new ExcelLite.Workbook();wb.views=[{x:0,y:0,width:10000,height:20000,firstSheet:0,activeTab:0,visibility:'visible'}];const ws=wb.addWorksheet(o.sheet,{views:[{rightToLeft:true,showGridLines:false}],pageSetup:{paperSize:9,orientation:o.land?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0}});
 const n=o.head.length,L=c=>{let t='';while(c>0){const m=(c-1)%26;t=String.fromCharCode(65+m)+t;c=Math.floor((c-1)/26)}return t};
 const ctr={horizontal:'center',vertical:'middle',readingOrder:'rtl'},bd={style:'thin',color:{argb:'FFC9BDE6'}},B={top:bd,left:bd,bottom:bd,right:bd};
 ws.views=[{state:'normal',rightToLeft:true,showGridLines:false}];
 if(o.footer)ws.headerFooter={oddFooter:o.footer};
 ws.columns=o.widths.map(w=>({width:w}));
 const mrg=(r,t,sz,bold,colr)=>{ws.mergeCells(`A${r}:${L(n)}${r}`);const c=ws.getCell(`A${r}`);c.value=t;c.font={name:'Tahoma',size:sz,bold,color:{argb:colr}};c.alignment={...ctr,wrapText:true};ws.getRow(r).height=(sz+14)*Math.max(1,Math.ceil(String(t).length*1.15/o.widths.reduce((a,b)=>a+b,0)))};
 mrg(1,o.title,16,true,'FF222222');mrg(2,o.sub,11,false,'FF555555');const il=[].concat(o.info||[]);il.forEach((t,i)=>mrg(3+i,t,11,false,'FF444444'));const H=3+Math.max(1,il.length),H2=H+(o.head2?1:0);
 const hr=ws.getRow(H);o.head.forEach((h,i)=>{const c=hr.getCell(i+1);c.value=h;c.font={name:'Tahoma',bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}};c.alignment=i===o.nameCol?{horizontal:'right',vertical:'middle',readingOrder:'rtl'}:(o.rot&&o.rot[i]?{...ctr,textRotation:90}:ctr);c.border=B});hr.height=o.rot?66:24;
 if(o.head2){const h2=ws.getRow(H+1);o.head2.forEach((h,i)=>{const c=h2.getCell(i+1);c.value=h===''?null:h;c.font={name:'Tahoma',bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}};c.alignment=ctr;c.border=B});h2.height=22;o.head2.forEach((h,i)=>{if(h==='')ws.mergeCells(`${L(i+1)}${H}:${L(i+1)}${H+1}`)})}
 o.rows.forEach((r,j)=>{const row=ws.getRow(H2+1+j);r.forEach((v,i)=>{const c=row.getCell(i+1),mk=typeof v==='string'&&COL[v];c.value=v;c.border=B;c.alignment=i===o.nameCol?{horizontal:'right',vertical:'middle',readingOrder:'rtl'}:ctr;c.font={name:'Tahoma',size:11,bold:!!mk,color:{argb:mk?'FF'+COL[v].slice(1).toUpperCase():'FF222222'}};const cs=o.cellStyle&&o.cellStyle(i,v,r);if(cs){c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+cs.bg.slice(1).toUpperCase()}};c.font={name:'Tahoma',size:11,bold:true,color:{argb:'FF'+cs.fg.slice(1).toUpperCase()}}}});row.height=20});
 let r0=H2+1+o.rows.length+1;
 if(o.notes&&o.notes.length){const TW=o.widths.reduce((x,y)=>x+y,0),nr=(t,bold,bg,fg)=>{ws.mergeCells(`A${r0}:${L(n)}${r0}`);for(let j=1;j<=n;j++)ws.getCell(L(j)+r0).border=B;const c=ws.getCell(`A${r0}`);c.value=t;c.font={name:'Tahoma',size:11,bold:!!bold,color:{argb:fg||'FF222222'}};c.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl',wrapText:true};if(bg)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};ws.getRow(r0).height=Math.max(22,Math.ceil(String(t).length*1.25/TW)*17+6);r0++};
  nr(o.notesTitle||'توضیحات',true,'FFE3EEFD','FF1F5FBF');o.notes.forEach(t=>nr(t));r0++}
 if(o.legend){ws.mergeCells(`A${r0}:${L(n)}${r0}`);const c=ws.getCell(`A${r0}`);c.value=o.legend;c.font={name:'Tahoma',size:10,color:{argb:'FF555555'}};c.alignment=ctr;r0+=2}
 if(o.sign){const mid=Math.ceil(n/2);ws.mergeCells(`A${r0}:${L(mid)}${r0}`);ws.mergeCells(`${L(mid+1)}${r0}:${L(n)}${r0}`);[['A','امضای آموزگار: '+(S.prof.teacher||'................')],[L(mid+1),'امضای مدیر: '+(S.prof.principal||'................')]].forEach(([a,t])=>{const c=ws.getCell(a+r0);c.value=t;c.font={name:'Tahoma',size:11};c.alignment=ctr});ws.getRow(r0).height=26}
 return await wb.xlsx.writeBuffer()}
$('xb').onclick=async()=>{try{const M=matrix();msg('در حال ساخت فایل…');const w0=mode==='m'?4.6:mode==='w'?11:12;
 const buf=await xbook({sheet:'حضور و غیاب',title:'دفتر حضور و غیاب کلاس',sub:M.title,info:profLine(),head:['ردیف','اسامی دانش‌آموزان',...M.wk,'ح','غ','م','ت'],head2:['','',...M.dn,'','','',''],rot:mode==='m'?[0,0,...M.wk.map(()=>1),0,0,0,0]:null,rows:M.rows.map((r,i)=>[i+1,r[0],...r.slice(1,-4).map(m=>m||'·'),...r.slice(-4)]),nameCol:1,widths:[6,24,...M.head.map(()=>w0),7,7,7,7],legend:'ح = حاضر | غ = غایب | م = غیبت موجه | ت = تأخیر',notesTitle:'توضیحات غیبت‌های موجه',notes:excNotes().map(x=>x.n+(x.d?' ('+x.d+')':'')+': '+x.t),sign:true});
 await dl(fname('xlsx'),buf)}catch(e){msg('ساخت فایل اکسل ناموفق بود: '+(e&&e.message||e))}};
$('pb').onclick=async()=>{try{const M=matrix();msg('در حال ساخت PDF…');await pdfLibs();try{await document.fonts.ready}catch(e){}
 let per=32,pages=Math.max(1,Math.ceil(M.rows.length/per));const doc=new (window.jspdf?window.jspdf.jsPDF:MiniPDF)({unit:'mm',format:'a4',orientation:'portrait'}),fs=M.head.length>10?9:13;
 const th='border:1px solid #9a86c9;background:#7e57c2;color:#fff;padding:5px 2px;text-align:center;vertical-align:middle;',td='border:1px solid #c9bde6;padding:'+(mode==='m'?'3px':'5px')+' 2px;text-align:center;vertical-align:middle;';
 const XN=excNotes(),nxh=XN.length?`<div style="margin-top:14px;border:1px solid #9a86c9;border-radius:6px;padding:8px 12px;font-size:12px;line-height:1.9;text-align:right"><div style="font-weight:800;margin-bottom:3px;color:#1f5fbf">توضیحات غیبت‌های موجه</div>${XN.map(x=>`<div style="border-top:1px dashed #c9bde6;padding:2px 0"><b>${esc2(x.n)}</b>${x.d?' <span style="color:#666">('+x.d+')</span>':''}: ${esc2(x.t)}</div>`).join('')}</div>`:'';let tot=0,onlyNotes=false;
 const mk=(i,nx,only)=>{
  const el=document.createElement('div');
  el.style.cssText='position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:#fff;color:#222;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;padding:40px 30px;box-sizing:border-box';
  const rows=M.rows.slice(i*per,(i+1)*per).map((r,j)=>`<tr><td style="${td}">${fa(i*per+j+1)}</td><td style="${td}text-align:right;padding-right:6px;word-break:break-word">${esc2(r[0])}</td>${r.slice(1,-4).map(m=>`<td style="${td}font-weight:800;color:${COL[m]||'#999'}">${m||'·'}</td>`).join('')}${r.slice(-4).map(n=>`<td style="${td}font-weight:700">${fa(n)}</td>`).join('')}</tr>`).join('');
  el.innerHTML=only?`<div style="text-align:center;font-weight:800;font-size:22px">دفتر حضور و غیاب کلاس</div><div style="text-align:center;font-size:14px;margin:6px 0 14px;color:#555">${M.title} — ادامه</div>${nxh}<div style="position:absolute;bottom:34px;left:30px;right:30px;font-size:12px;color:#555;display:flex;justify-content:space-between"><span>ح = حاضر | غ = غایب | م = غیبت موجه | ت = تأخیر</span><span>صفحه ${fa(i+1)} از ${fa(tot||pages)}</span></div>`:`<div style="text-align:center;font-weight:800;font-size:22px">دفتر حضور و غیاب کلاس</div>${profLine()?`<div style="text-align:center;font-size:13px;color:#444;margin-top:4px">${esc2(profLine())}</div>`:''}<div style="text-align:center;font-size:14px;margin:6px 0 14px;color:#555">${M.title}</div><table style="width:100%;border-collapse:collapse;font-size:${fs}px;text-align:center"><tr><th rowspan="2" style="${th}">ردیف</th><th rowspan="2" style="${th}text-align:right;padding-right:6px;word-break:break-word">اسامی دانش‌آموزان</th>${M.wk.map(h=>mode==='m'?`<th style="${th}height:64px;padding:0;position:relative"><div style="position:relative;width:100%;height:64px"><div style="position:absolute;left:50%;top:50%;width:64px;text-align:center;white-space:nowrap;font-size:11px;transform:translate(-50%,-50%) rotate(-90deg)">${h}</div></div></th>`:`<th style="${th}">${h}</th>`).join('')}<th rowspan="2" style="${th}">ح</th><th rowspan="2" style="${th}">غ</th><th rowspan="2" style="${th}">م</th><th rowspan="2" style="${th}">ت</th></tr><tr>${M.dn.map(h=>`<th style="${th}">${h}</th>`).join('')}</tr>${rows}</table>${nx?nxh:''}<div style="position:absolute;bottom:34px;left:30px;right:30px;font-size:12px;color:#555;display:flex;justify-content:space-between"><span>ح = حاضر | غ = غایب | م = غیبت موجه | ت = تأخیر</span><span>صفحه ${fa(i+1)} از ${fa(tot||pages)}</span></div>`;
  document.body.appendChild(el);return el};
 for(let g=0;g<12;g++){const e=mk(pages-1),ok=window.sigAfter(e,1050);e.remove();if(ok)break;pages++;per=Math.ceil(M.rows.length/pages)}
 if(XN.length){const e=mk(pages-1,true),ok=window.sigAfter(e,1050);e.remove();if(!ok)onlyNotes=true}
 tot=pages+(onlyNotes?1:0);
 for(let i=0;i<tot;i++){const el=onlyNotes&&i===pages?mk(i,false,true):mk(i,i===pages-1&&!onlyNotes);if(i===tot-1)window.sigAfter(el,1050);
  const cv=await rast(el);el.remove();
  if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}
 await dl(fname('pdf'),doc.output('arraybuffer'))}catch(e){msg('ساخت PDF ناموفق بود: '+(e&&e.message||e))}};

S.courses=S.courses||[];S.exams=S.exams||[];S.closed=S.closed||{};
let pend=null;
const ask=k=>{if(pend===k){pend=null;return true}pend=k;setTimeout(()=>{if(pend===k){pend=null;render()}},3000);render();return false};
function dayInfo(){const k=iso(cur),A=S.att[k]||{},st=S.students,c=x=>st.filter(s=>x==='e'?(A[s.id]==='a'&&isX(k,s.id)):x==='a'?(A[s.id]==='a'&&!isX(k,s.id)):A[s.id]===x).length,n=st.length-c('p')-c('a')-c('l')-c('e');
 return `<div class="cnts"><span class="cn p">✅ حاضر: ${fa(c('p')+c('l'))}</span><span class="cn a">❌ غایب: ${fa(c('a'))}</span><span class="cn e">📝 موجه: ${fa(c('e'))}</span><span class="cn l">⏰ از حاضرین با تأخیر: ${fa(c('l'))}</span><span class="cn n">بدون ثبت: ${fa(n)}</span></div><div class="grid2" style="margin-bottom:8px"><button class="sm" onclick="closeDay()">${pend==='close'+k?'مطمئنید؟':'🏖️ تعطیل کردن این روز'}</button><button class="sm" onclick="clearDay()">${pend==='clr'+k?'مطمئنید؟':'🧹 ریست ثبت‌های روز'}</button></div>`}

function weekExtra(){if(mode==='d')return '';const D=days(),R=allRange(),a=iso(R[0]),b=iso(R[R.length-1]),st=S.students;
 const tot=D.map(d=>{const kk=iso(d),A=S.att[kk]||{},c=x=>st.filter(s=>A[s.id]===x).length,ex=st.filter(s=>A[s.id]==='a'&&isX(kk,s.id)).length;return[c('p'),c('a')-ex,c('l'),ex]});
 let h=`<div class="card wrap"><b>📊 جمع روزانه‌ی ${mode==='w'?'هفته':'ماه'}</b><table class="at" style="margin-top:8px"><tr><th class="nm">وضعیت</th>${D.map(d=>`<th>${mode==='w'?wd(d):fa(jp(d).d)}</th>`).join('')}<th>جمع</th></tr>${[['✅ حاضر',0,'#1a8f55'],['❌ غایب',1,'#d12f35'],['⏰ تأخیر',2,'#d98600'],['📝 موجه',3,'#2f80ed']].map(([n,i,c])=>`<tr><td class="nm">${n}</td>${tot.map(t=>`<td style="color:${c};font-weight:700">${fa(t[i])}</td>`).join('')}<td><b>${fa(tot.reduce((x,t)=>x+t[i],0))}</b></td></tr>`).join('')}</table></div>`;
 const E=S.exams.filter(e=>e.date>=a&&e.date<=b).sort((x,y)=>x.date.localeCompare(y.date)),sd=e=>{const q=jp(new Date(e.date+'T12:00:00Z'));return fa(q.m+'/'+q.d)};
 h+=E.length?`<div class="card wrap"><b>📝 آزمون‌ها و فعالیت‌های ثبت‌شده در این ${mode==='w'?'هفته':'ماه'}</b><table class="at" style="margin-top:8px"><tr><th class="nm">نام</th>${E.map(e=>`<th>${esc2(S.courses.find(c=>c.id===e.course)?.name||'')}<br>${e.type}<br>${sd(e)}</th>`).join('')}</tr>${st.map(s=>`<tr><td class="nm">${esc2(s.name)}</td>${E.map(e=>`<td style="font-weight:700">${absent(e,s.id)?'غایب':e.scores[s.id]!=null?LVW[lvl(nrm(e,s.id))]:'·'}</td>`).join('')}</tr>`).join('')}</table></div>`:'<div class="card"><p class="sub">آزمون یا فعالیتی در این بازه ثبت نشده است</p></div>';
 return h}
function closedCard(){return '<div class="card"><p class="sub" style="font-size:16px">🏖️ این روز تعطیل شده است (تعطیلی غیرتقویمی)</p><button class="big" style="font-size:15px;padding:12px" onclick="openDay()">↩️ بازگرداندن این روز</button></div>'}
function closedList(){if(mode==='d')return '';const L=allRange().filter(d=>S.closed[iso(d)]);return L.length?`<div class="card"><b>🏖️ روزهای تعطیل‌شده</b><div class="chips2">${L.map(d=>`<button onclick="goDay('${iso(d)}')">${wd(d)} ${fmt(d)}</button>`).join('')}</div></div>`:''}
window.goDay=k=>{mode='d';cur=new Date(k+'T12:00:00Z');renderAtt()};
window.closeDay=()=>{const k=iso(cur);if(!ask('close'+k))return;delete S.att[k];if(S.attx)delete S.attx[k];S.closed[k]=true;render()};
window.clearDay=()=>{const k=iso(cur);if(!ask('clr'+k))return;delete S.att[k];if(S.attx)delete S.attx[k];render()};
window.openDay=()=>{delete S.closed[iso(cur)];render()};
S.prof=S.prof||{};
const TYPES=['پرسش و پاسخ کلاسی','آزمون کتبی','آزمون پایان نیمسال اول','آزمون پایان نیمسال دوم'];
S.exams.forEach(e=>{if(!TYPES.includes(e.type))e.type=e.type==='کتبی'?'آزمون کتبی':'پرسش و پاسخ کلاسی'});
delete S.prof.deputy;
const LVW={4:'خیلی خوب',3:'خوب',2:'قابل قبول',1:'نیاز به تلاش'},TN=['یک','دو','سه','چهار','پنج','شش','هفت'],GR=['اول','دوم','سوم','چهارم','پنجم','ششم'];
const lvl=v=>v==null?null:Math.min(4,Math.max(1,Math.round(v)));
$('et').innerHTML=TYPES.map(t=>`<option>${t}</option>`).join('');
$('rt').innerHTML='<option value="">همه‌ی نوع‌ها</option>'+TYPES.map(t=>`<option>${t}</option>`).join('');
function examDates(){const t=iso(tdy()),r=rangeY(),a=iso(r.a),b=iso(r.b);return Object.keys(S.att).filter(k=>k<=t&&k>=a&&k<=b&&!S.closed[k]&&!hol(new Date(k+'T12:00:00Z'))&&S.students.some(x=>S.att[k][x.id])).sort().reverse()}
let repTab='c',openEx=null,rkMode='lg',rkEdit=false;
const nn=x=>x!=null,mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const absent=(e,id)=>(S.att[e.date]||{})[id]==='a';
const nrm=(e,id)=>{if(absent(e,id)&&!(e.mk&&e.mk[id]&&e.mk[id]!=='x'))return null;const v=e.scores[id];return v==null?null:v/e.max*4};
const f1=v=>v==null?'—':fa(v.toFixed(1).replace(/\.0$/,'').replace('.','٫'));
const col=v=>v==null?'#999':v>=3.5?'#1a8f55':v>=2.5?'#5fa83a':v>=1.5?'#d98600':'#d12f35';
const inMonth=(d,m)=>{const q=jp(new Date(d+'T12:00:00Z'));return q.m===m&&q.y===(m>=7?SY:SY+1)};
const EXf=()=>{const g=window.__rg,t=$('rt').value,m=g?0:(+$('rm').value||0);return S.exams.filter(e=>(!t||e.type===t)&&(!m||inMonth(e.date,m))&&(!g||(e.date>=g[0]&&e.date<=g[1])))};
const cAvg=(id,cid,EX=EXf())=>mean(EX.filter(e=>e.course===cid).map(e=>nrm(e,id)).filter(nn));
const clsAvg=cid=>mean(EXf().filter(e=>e.course===cid).flatMap(e=>S.students.map(s=>nrm(e,s.id))).filter(nn));
const overall=id=>mean(S.courses.map(c=>cAvg(id,c.id)).filter(nn));
const bar=(l,v,v2)=>`<div class="br"><span class="bl">${esc2(l)}</span><div class="bt"><i style="width:${v==null?0:v/4*100}%;background:${col(v)}"></i>${v2!=null?`<i class="g2" style="width:${v2/4*100}%"></i>`:''}</div><b>${f1(v)}${window.__pct?window.__pct(v):''}</b></div>`;
const entry=e=>`<div class="card" style="background:var(--bg2);margin:6px 0;box-shadow:none"><div class="lg" style="margin:0 0 8px">۴ خیلی خوب | ۳ خوب | ۲ قابل قبول | ۱ نیاز به تلاش</div>${S.students.map(s=>{if(absent(e,s.id))return `<div style="opacity:.6;margin-bottom:8px"><b>${esc2(s.name)}</b> <span class="xb" style="background:#e5484d;color:#fff">غایب</span><div class="sum">در این روز غایب بوده و قابل ارزیابی نیست</div></div>`;const v=lvl(nrm(e,s.id));return `<div><b>${esc2(s.name)}</b><div class="lv">${[4,3,2,1].map(k=>`<button class="${v===k?'on'+k:''}" onclick="setLv(${e.id},${s.id},${k})">${fa(k)}<br>${LVW[k]}</button>`).join('')}</div></div>`}).join('')}</div>`;
window.setLv=(eid,sid,k)=>{const e=S.exams.find(x=>x.id===eid);if(absent(e,sid))return;if(e.max!==4){Object.keys(e.scores).forEach(x=>e.scores[x]=lvl(nrm(e,x)));e.max=4}if(e.scores[sid]===k)delete e.scores[sid];else e.scores[sid]=k;render()};
window.openE=id=>{openEx=openEx===id?null:id;renderCrs()};
window.openExNow=id=>{const x=S.exams.find(q=>q.id===id);if(!x)return false;window.__cco=window.__cco||{};window.__cco[x.course]=true;openEx=id;renderCrs();return true};
window.delCourse=id=>{if(!ask('c'+id))return;S.courses=S.courses.filter(c=>c.id!==id);S.exams=S.exams.filter(e=>e.course!==id);render()};
window.delExam=id=>{if(!ask('e'+id))return;S.exams=S.exams.filter(e=>e.id!==id);render()};
$('cadd').onclick=()=>{const n=$('cn').value.trim();if(!n)return;S.courses.push({id:Date.now(),name:n,book:$('cbk').value.trim()});$('cn').value=$('cbk').value='';render()};
$('eadd').onclick=()=>{const c=+$('ec').value;if(!c){$('emsg').textContent='ابتدا یک درس اضافه کنید';return}const dsel=$('ed_s').value;if(!dsel||dsel>iso(tdy())){$('emsg').textContent='تاریخی انتخاب کنید که کلاس برگزار شده و حضور و غیابش ثبت شده است (تاریخ آینده مجاز نیست)';return}$('emsg').textContent='';const e={id:Date.now(),course:c,type:$('et').value,title:$('etl').value.trim(),date:dsel,max:4,scores:{}};S.exams.push(e);$('etl').value='';openEx=e.id;render()};
const nz=t=>String(t||'').replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\s]+/g,'').toLowerCase();
function stuSearch(){const q=nz($('ssq').value),box=$('ssr');if(!q){box.innerHTML='';return}
 const M=S.students.filter(s=>nz(s.name).includes(q));
 if(!M.length){box.innerHTML='<p class="sub">دانش‌آموزی با این نام پیدا نشد</p>';return}
 if(M.length>3){box.innerHTML='<p class="sub">'+fa(M.length)+' نفر پیدا شد؛ یکی را انتخاب کنید:</p>'+M.slice(0,30).map(s=>`<button class="sm" data-sq="${s.id}" style="margin:3px">${esc2(s.name)}</button>`).join('');return}
 const cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'',E=S.exams.slice().sort((a,b)=>b.date.localeCompare(a.date));
 box.innerHTML=M.map(s=>`<div class="card" style="background:var(--bg2);box-shadow:none;margin:8px 0"><b>👤 ${esc2(s.name)}</b><div class="sum">${fa(E.length)} آزمون و ارزیابی ثبت شده است؛ برای تغییر نمره، سطح تازه را بزنید</div>${E.map(e=>{const ab=absent(e,s.id),v=lvl(nrm(e,s.id));return `<div style="margin-top:10px"><span class="xb">${esc2(e.type||'')}</span><b>${esc2(cn(e.course))}${e.title?': '+esc2(e.title):''}</b><div class="sum">${fmt(new Date(e.date+'T12:00:00Z'))}</div>${ab?'<span class="xb" style="background:#e5484d;color:#fff">غایب</span> <span class="sum">در این روز غایب بوده و قابل ارزیابی نیست</span>':`<div class="lv">${[4,3,2,1].map(k=>`<button class="${v===k?'on'+k:''}" onclick="setLv(${e.id},${s.id},${k})">${fa(k)}<br>${LVW[k]}</button>`).join('')}</div>`}</div>`}).join('')||'<p class="sub">آزمونی ثبت نشده</p>'}</div>`).join('')}
$('ssq').oninput=stuSearch;$('ssr').onclick=e=>{const b=e.target.closest('[data-sq]');if(b){const s=S.students.find(x=>x.id==b.dataset.sq);if(s){$('ssq').value=s.name;stuSearch()}}};
const _rc0=renderCrs;renderCrs=function(){_rc0();stuSearch()};
function renderCrs(){
 const ds=examDates(),pv=$('ed_s').value;
 $('ed_s').innerHTML=ds.length?ds.map(k=>{const d=new Date(k+'T12:00:00Z');return `<option value="${k}">${wd(d)} ${fmt(d)}</option>`}).join(''):'<option value="">— حضور و غیابی ثبت نشده —</option>';
 if(pv&&ds.includes(pv))$('ed_s').value=pv;
 $('ed_l').textContent=ds.length?'فقط روزهایی که کلاس برگزار شده و حضور و غیابش ثبت شده است (تا امروز) قابل انتخاب است':'ابتدا در بخش حضور و غیاب، حضور روزِ برگزاری کلاس را ثبت کنید';
 const st=S.students,v=$('ec').value;
 $('ec').innerHTML=S.courses.filter(c=>c.name!=='هنر'&&c.name!=='تربیت بدنی').map(c=>`<option value="${c.id}">${esc2(c.name)}</option>`).join('');if(v)$('ec').value=v;
 window.__cco=window.__cco||{};
 $('crsList').innerHTML=S.courses.length?S.courses.map(c=>{
   const ex=S.exams.filter(e=>e.course===c.id).sort((a,b)=>b.date.localeCompare(a.date)),allv=ex.flatMap(e=>st.map(s=>nrm(e,s.id)).filter(nn)),cav=allv.length?mean(allv):null;
   const op=window.__cco[c.id]!==undefined?window.__cco[c.id]:(S.courses.length===1||ex.some(e=>e.id===openEx));
   return `<details class="card cc" data-cid="${c.id}"${op?' open':''}><summary><span class="ct"><b>📘 ${esc2(c.name)}</b>${c.book?`<small>${esc2(c.book)}</small>`:''}</span><span class="cm">${ex.length?`${fa(ex.length)} ارزیابی${cav!=null?' · میانگین '+f1(cav):''}`:'بدون ارزیابی'}</span></summary>${ex.map(e=>{const av=mean(st.map(s=>nrm(e,s.id)).filter(nn));return `<div class="row" data-eid="${e.id}"><div><span class="xb">${e.type}</span><b>${esc2(e.title||'آزمون')}</b><div class="sum">${fmt(new Date(e.date+'T12:00:00Z'))} | میانگین کلاس (از ۴): ${f1(av)}</div></div><div class="btns"><button onclick="openE(${e.id})">${openEx===e.id?'بستن':'ارزیابی'}</button><button onclick="delExam(${e.id})">${pend==='e'+e.id?'مطمئنید؟':'🗑'}</button></div></div>${openEx===e.id?entry(e):''}`}).join('')||'<p class="sub">هنوز آزمونی ثبت نشده</p>'}<div style="margin-top:10px;text-align:left"><button class="del${pend==='c'+c.id?' sure':''}" onclick="delCourse(${c.id})">${pend==='c'+c.id?'مطمئنید؟':'🗑 حذف این درس'}</button></div></details>`}).join(''):'<p class="sub">ابتدا یک درس اضافه کنید</p>';
}
document.querySelectorAll('.tb2 button').forEach(b=>b.onclick=()=>{repTab=b.dataset.t;renderRep()});
$('rm').innerHTML='<option value="">کل سال تحصیلی</option>'+SM.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');
['rm','rt','rs','rc'].forEach(i=>$(i).onchange=renderRep);
function classTable(){const rk=S.students.map(s=>({s,o:overall(s.id)})).sort((a,b)=>(b.o??-1)-(a.o??-1));return{head:['رتبه','نام',...S.courses.map(c=>c.name),'میانگین'],rows:rk.map((r,i)=>[i+1,r.s.name,...S.courses.map(c=>cAvg(r.s.id,c.id)),r.o]),rk}}
function trend(a,b){const W=320,H=130,n=a.length,x=i=>n===1?W/2:20+i*(W-40)/(n-1),y=v=>H-15-(v/4)*(H-30);
 const ln=(arr,c)=>`<polyline fill="none" stroke="${c}" stroke-width="2.5" points="${arr.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>`+arr.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${c}"/>`).join('');
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;direction:ltr">${[1,2,3,4].map(g=>`<line x1="14" x2="${W-6}" y1="${y(g)}" y2="${y(g)}" stroke="#b9b0cf66"/><text x="0" y="${y(g)+4}" font-size="9" fill="#8a7aa6">${g}</text>`).join('')}${ln(b,'#b9b0cf')}${ln(a,'#7e57c2')}</svg>`}
const PW={learn:40,att:20,hw:20,part:10,prog:10},PL={learn:'📚 یادگیری',att:'📅 حضور',hw:'📝 تکالیف',part:'🙋 مشارکت',prog:'🌱 پیشرفت'};
function perfScore(sid){const T=iso(tdy()),st=S.students,ex=S.exams.slice().sort((a,b)=>a.date.localeCompare(b.date)),c={};
 const ser=ex.map(e=>nrm(e,sid)).filter(nn);
 c.learn=ser.length?Math.round(mean(ser)/4*100):null;
 let tot=0,sc=0;Object.keys(S.att).forEach(k=>{if(k>T||S.closed[k]||hol(new Date(k+'T12:00:00Z')))return;const v=(S.att[k]||{})[sid];if(v==='p'){tot++;sc+=1}else if(v==='l'){tot++;sc+=.5}else if(v==='a')tot++});
 c.att=tot?Math.round(sc/tot*100):null;
 let ht=0,hs=0;(S.hwl||[]).forEach(h=>{const v=(h.st||{})[sid];if(v==='d'){ht++;hs+=1}else if(v==='p'){ht++;hs+=.5}else if(v==='n')ht++});
 c.hw=ht?Math.round(hs/ht*100):null;
 const qa=id=>ex.filter(e=>e.type==='پرسش و پاسخ کلاسی'&&nn(nrm(e,id))).length,mx=Math.max(0,...st.map(s=>qa(s.id)));
 c.part=mx?Math.round(qa(sid)/mx*100):null;
 if(ser.length>=4){const h=Math.floor(ser.length/2),d=mean(ser.slice(h))-mean(ser.slice(0,h));c.prog=Math.round(Math.min(100,Math.max(0,50+d*25)))}else c.prog=null;
 let w=0,s=0;Object.keys(PW).forEach(k=>{if(c[k]!=null){w+=PW[k];s+=c[k]*PW[k]}});
 return{c,total:w?Math.round(s/w):null}}
const pCol=v=>v==null?'#999':v>=85?'#1a8f55':v>=70?'#5fa83a':v>=55?'#d98600':'#d12f35',pLab=v=>v==null?'—':v>=85?'عالی':v>=70?'خوب':v>=55?'قابل قبول':'نیازمند توجه';
function perfCard(sid){const P=perfScore(sid),ks=Object.keys(PW).filter(k=>P.c[k]!=null);
 if(P.total==null)return'<div class="card"><b>🧠 امتیاز عملکرد کلی</b><p class="sub">هنوز داده‌ی کافی (ارزیابی، حضور یا تکلیف) ثبت نشده است.</p></div>';
 const hi=ks.slice().sort((a,b)=>P.c[b]-P.c[a])[0],lo=ks.slice().sort((a,b)=>P.c[a]-P.c[b])[0];
 return`<div class="card"><b>🧠 امتیاز عملکرد کلی</b><div style="display:flex;align-items:center;gap:12px;margin:8px 0"><div style="font-size:34px;font-weight:800;color:${pCol(P.total)}">${fa(P.total)}</div><div><div class="sub" style="margin:0">از ۱۰۰ — ${pLab(P.total)}</div></div></div>`+
 Object.keys(PW).map(k=>`<div class="br"><span class="bl">${PL[k]}</span><div class="bt"><i style="width:${P.c[k]==null?0:P.c[k]}%;background:${pCol(P.c[k])}"></i></div><b>${P.c[k]==null?'—':fa(P.c[k])}</b></div>`).join('')+
 (ks.length>1&&hi!==lo?`<p class="sub" style="margin:8px 0 0">نقطه‌ی قوت: ${PL[hi]} (${fa(P.c[hi])}) · نیازمند توجه بیشتر: ${PL[lo]} (${fa(P.c[lo])})</p>`:'')+
 `<div class="lg">وزن‌ها: یادگیری ۴۰٪، حضور ۲۰٪، تکالیف ۲۰٪، مشارکت ۱۰٪، پیشرفت ۱۰٪ (مؤلفه‌ای که داده ندارد حذف و وزن‌ها تنظیم می‌شود). این امتیاز جدا از رتبه‌بندی است.</div></div>`}
function perfClass(){if(!S.students.length)return'';const R=S.students.map(s=>({s,P:perfScore(s.id)})),cell=v=>`<td style="color:${pCol(v)};font-weight:700">${v==null?'—':fa(v)}</td>`;
 return`<div class="card wrap"><b>🧠 امتیاز عملکرد دانش‌آموزان (از ۱۰۰)</b><table class="at" style="margin-top:8px"><tr><th class="nm">نام</th><th>کلی</th><th>یادگیری</th><th>حضور</th><th>تکالیف</th><th>مشارکت</th><th>پیشرفت</th></tr>${R.map(r=>`<tr><td class="nm">${esc2(r.s.name)}</td>${cell(r.P.total)}${['learn','att','hw','part','prog'].map(k=>cell(r.P.c[k])).join('')}</tr>`).join('')}</table></div>`}
const gDf=d=>d==null?'—':fa((d>0?'+':'')+d.toFixed(1).replace('.','٫'));
const grow=(sid,cid)=>SM.map(m=>({m,v:mean(S.exams.filter(e=>(!cid||e.course===cid)&&inMonth(e.date,m)).map(e=>sid?nrm(e,sid):null).filter(nn))}));
const growCls=cid=>SM.map(m=>({m,v:mean(S.exams.filter(e=>(!cid||e.course===cid)&&inMonth(e.date,m)).flatMap(e=>S.students.map(s=>nrm(e,s.id))).filter(nn))}));
function progOf(sid,cid){const pts=grow(sid,cid).filter(p=>p.v!=null);let d=null;
 if(pts.length>=2)d=pts[pts.length-1].v-pts[0].v;
 else{const v=S.exams.filter(e=>!cid||e.course===cid).sort((a,b)=>a.date.localeCompare(b.date)).map(e=>nrm(e,sid)).filter(nn);if(v.length>=4){const h=Math.floor(v.length/2);d=mean(v.slice(h))-mean(v.slice(0,h))}}
 if(d!=null)d=Math.round(d*10)/10;
 const ic=d==null?'—':d>=.3?'📈':d<=-.3?'📉':'➖',tx=d==null?'داده‌ی کافی نیست':d>=.3?'پیشرفت':d<=-.3?'افت':'ثابت';
 return{pts,d,ic,tx,sr:pts.map(p=>f1(p.v)).join(' ← ')}}
const progList=()=>S.students.map(s=>({s,P:progOf(s.id)})).filter(x=>x.P.d!=null).sort((a,b)=>b.P.d-a.P.d);
function growSvg(a,b){const W=340,H=150,x=i=>W-22-i*(W-44)/(SM.length-1),y=v=>H-26-(v/4)*(H-44);
 const ln=(arr,c,w)=>{const p=arr.map((q,i)=>q.v==null?null:[x(i),y(q.v)]).filter(Boolean);return(p.length>1?`<polyline fill="none" stroke="${c}" stroke-width="${w}" points="${p.map(q=>q.join(',')).join(' ')}"/>`:'')+p.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${c}"/>`).join('')};
 return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;direction:ltr">${[1,2,3,4].map(g=>`<line x1="14" x2="${W-6}" y1="${y(g)}" y2="${y(g)}" stroke="#b9b0cf66"/><text x="0" y="${y(g)+4}" font-size="9" fill="#8a7aa6">${fa(g)}</text>`).join('')}${SM.map((m,i)=>`<text x="${x(i)}" y="${H-8}" font-size="9" text-anchor="middle" fill="#8a7aa6">${MN[m-1]}</text>`).join('')}${ln(b,'#b9b0cf',2)}${ln(a,'#7e57c2',2.8)}</svg>`}
function growthCard(sid){const P=progOf(sid);
 if(!P.pts.length)return'<div class="card"><b>📈 نمودار رشد فردی</b><p class="sub">هنوز ارزیابی‌ای در ماه‌های سال تحصیلی ثبت نشده است.</p></div>';
 const rows=S.courses.map(c=>({c,P:progOf(sid,c.id)})).filter(r=>r.P.pts.length);
 return`<div class="card"><b>📈 نمودار رشد فردی (میانگین ماهانه، از ۴)</b><div class="cnts" style="margin:6px 0"><span class="cn" style="background:${P.d==null?'#999':P.d>=.3?'#1a8f55':P.d<=-.3?'#d12f35':'#8a7aa6'}">${P.ic} ${P.tx}${P.d!=null?' ('+gDf(P.d)+')':''}</span></div>${growSvg(grow(sid),growCls())}<div class="lg">خط بنفش: دانش‌آموز | خط خاکستری: میانگین کلاس | ماه‌ها از راست به چپ</div>
 ${rows.length?`<div class="wrap"><table class="at" style="margin-top:8px"><tr><th class="nm">درس</th><th>وضعیت</th><th>میانگین ماهانه</th><th>تغییر</th></tr>${rows.map(r=>`<tr><td class="nm">${esc2(r.c.name)}</td><td>${r.P.ic} ${r.P.tx}</td><td>${r.P.sr||'—'}</td><td>${gDf(r.P.d)}</td></tr>`).join('')}</table></div>`:''}</div>`}
function progClass(){const L=progList();if(!L.length)return'<div class="card"><b>⭐ پیشرفت دانش‌آموزان</b><p class="sub">برای تحلیل پیشرفت دست‌کم دو ماه ارزیابی (یا چهار ارزیابی) برای هر دانش‌آموز لازم است.</p></div>';
 const up=L.filter(x=>x.P.d>=.3),dn=L.filter(x=>x.P.d<=-.3).reverse(),m=[];
 if(up[0])m.push(`📈 <b>${esc2(up[0].s.name)}</b> بیشترین پیشرفت را داشته است (${gDf(up[0].P.d)}).`);
 if(dn[0])m.push(`📉 <b>${esc2(dn[0].s.name)}</b> بیشترین افت را داشته و نیازمند توجه است (${gDf(dn[0].P.d)}).`);
 const top=S.students.map(s=>({s,o:overall(s.id)})).filter(x=>x.o!=null).sort((a,b)=>b.o-a.o)[0];
 if(top&&up[0]&&top.s.id!==up[0].s.id)m.push(`ℹ️ بالاترین میانگین با ${esc2(top.s.name)} است، اما بیشترین رشد با ${esc2(up[0].s.name)}.`);
 return`<div class="card wrap"><b>⭐ پیشرفت دانش‌آموزان (مقایسه‌ی اولین و آخرین ماه ارزیابی)</b>${m.length?`<ul style="margin:8px 0;padding:0 18px;line-height:1.9;font-size:14px">${m.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<table class="at" style="margin-top:8px"><tr><th class="nm">نام</th><th>وضعیت</th><th>میانگین ماهانه</th><th>تغییر</th></tr>${L.map(x=>`<tr><td class="nm">${esc2(x.s.name)}</td><td>${x.P.ic} ${x.P.tx}</td><td>${x.P.sr||'—'}</td><td style="color:${x.P.d>=.3?'#1a8f55':x.P.d<=-.3?'#d12f35':'inherit'};font-weight:700">${gDf(x.P.d)}</td></tr>`).join('')}</table><div class="lg">این جدول بر اساس میزان رشد مرتب شده است، نه بر اساس نمره.</div></div>`}
function renderRep(){
 const st=S.students,sv=$('rs').value,cv=$('rc').value,EX=EXf();
 $('rs').innerHTML=st.map(s=>`<option value="${s.id}">${esc2(s.name)}</option>`).join('');if(sv)$('rs').value=sv;
 $('rc').innerHTML='<option value="0">همه‌ی درس‌ها (یک‌جا)</option>'+S.courses.map(c=>`<option value="${c.id}">${esc2(c.name)}</option>`).join('');if(cv)$('rc').value=cv;
 $('rs').style.display=repTab==='s'?'':'none';
 document.querySelectorAll('.tb2 button').forEach(b=>b.classList.toggle('on',b.dataset.t===repTab));
 if(!EX.some(e=>Object.keys(e.scores).length)){$('repBody').innerHTML='<div class="card"><p class="sub">هنوز ارزیابی‌ای ثبت نشده. از صفحه‌ی «درس‌ها و آزمون‌ها» آزمون بسازید و ارزیابی هر دانش‌آموز را وارد کنید.</p></div>';return}
 const T=classTable(),cid=+$('rc').value||0,cEx=EX.filter(e=>!cid||e.course===cid).sort((a,b)=>a.date.localeCompare(b.date));
 let h='';
 if(repTab==='c'){
  h+=`<div class="card"><b>📊 میانگین کلاس در هر درس (از ۴)</b>${S.courses.map(c=>bar(c.name,clsAvg(c.id))).join('')}</div>`;
  h+=`<div class="card"><b>📈 آزمون‌های درس انتخاب‌شده یا همه‌ی درس‌ها (میانگین کلاس)</b>${cEx.map(e=>bar((cid?'':((S.courses.find(c=>c.id===e.course)||{}).name||'')+': ')+(e.title||e.type),mean(st.map(s=>nrm(e,s.id)).filter(nn)))).join('')||'<p class="sub">آزمونی نیست</p>'}</div>`;
  h+=`<div class="card wrap"><b>🏆 جدول نتایج کلاس</b><table class="at rk" style="margin-top:8px"><tr><th>رتبه</th><th class="nm">نام</th>${S.courses.map(c=>`<th>${esc2(c.name)}</th>`).join('')}<th>میانگین</th></tr>${T.rows.map(r=>`<tr><td>${fa(r[0])}</td><td class="nm">${esc2(r[1])}</td>${r.slice(2).map(v=>`<td style="color:${col(v)};font-weight:700">${f1(v)}</td>`).join('')}</tr>`).join('')}</table><div class="grid2" style="margin-top:10px"><button class="sm" onclick="expRes()">📊 اکسل نتایج (A4 افقی)</button><button class="sm" onclick="expResPdf()">📄 PDF نتایج (A4 افقی)</button></div><button class="sm" style="margin-top:8px;width:100%" onclick="expRep()">📊 اکسل جدول میانگین‌ها</button><p class="sub" id="rmsg"></p></div>`;
 h+=progClass()+perfClass();
 }else{
  const sid=+$('rs').value,s=st.find(x=>x.id===sid);if(!s){$('repBody').innerHTML='';return}
  const o=T.rk.findIndex(r=>r.s.id===sid)+1,mine=EX.filter(e=>nn(nrm(e,sid))).sort((a,b)=>a.date.localeCompare(b.date)),ov=overall(sid);
  h+=`<div class="card"><b>👤 ${esc2(s.name)}</b><div class="cnts"><span class="cn" style="background:${col(ov)}">میانگین کل: ${f1(ov)}${ov!=null?' ('+LVW[lvl(ov)]+')':''}</span><span class="cn n">رتبه: ${fa(o)} از ${fa(st.length)}</span><span class="cn l">تعداد آزمون: ${fa(mine.length)}</span></div></div>`;h+=perfCard(sid)+growthCard(sid);
  h+=`<div class="card"><b>📊 عملکرد در هر درس (از ۴)</b>${S.courses.map(c=>bar(c.name,cAvg(sid,c.id),clsAvg(c.id))).join('')}<div class="lg">نوار رنگی: دانش‌آموز | نوار خاکستری: میانگین کلاس</div></div>`;
  const tp=cEx.filter(e=>nn(nrm(e,sid)));
  h+=`<div class="card"><b>📈 روند ارزیابی این درس</b>${tp.length?trend(tp.map(e=>nrm(e,sid)),tp.map(e=>mean(st.map(x=>nrm(e,x.id)).filter(nn)))):'<p class="sub">ارزیابی‌ای برای این درس نیست</p>'}<div class="lg">خط بنفش: دانش‌آموز | خط خاکستری: میانگین کلاس</div></div>`;
  h+=`<div class="card wrap"><b>📝 همه‌ی آزمون‌ها</b><table class="at" style="margin-top:8px"><tr><th class="nm">درس</th><th>نوع</th><th>تاریخ</th><th>ارزیابی</th><th>میانگین کلاس</th></tr>${mine.map(e=>`<tr><td class="nm">${esc2(S.courses.find(c=>c.id===e.course)?.name||'')}</td><td>${e.type}</td><td>${fmt(new Date(e.date+'T12:00:00Z'))}</td><td style="color:${col(nrm(e,sid))};font-weight:700">${LVW[lvl(nrm(e,sid))]}</td><td>${f1(mean(st.map(x=>nrm(e,x.id)).filter(nn)))}</td></tr>`).join('')}</table></div>`;
  h+=`<div class="card"><b>📤 خروجی عملکرد فردی</b><div class="grid2" style="margin-top:8px"><button class="sm" onclick="expStu('x')">📊 اکسل (A4 افقی)</button><button class="sm" onclick="expStu('p')">📄 PDF (A4 افقی)</button></div><p class="sub" id="rmsg"></p></div>`;
 }
 $('repBody').innerHTML=h;
}
window.expRep=async()=>{const T=classTable(),m=t=>{const e=$('rmsg');if(e)e.textContent=t};try{m('در حال ساخت فایل…');const r=v=>v==null?'':Math.round(v*10)/10;
 const buf=await xbook({sheet:'نتایج',title:'نتایج کلاس (ارزیابی توصیفی، از ۴)',sub:($('rt').value||'همه‌ی نوع‌ها')+' | '+($('rm').value?MN[+$('rm').value-1]+' ماه':'کل سال تحصیلی'),info:profLine(),head:T.head.map(h=>h==='نام'?'اسامی دانش‌آموزان':h),rows:T.rows.map(x=>[x[0],x[1],...x.slice(2).map(r)]),nameCol:1,widths:[6,24,...S.courses.map(()=>11),10],legend:'۴ خیلی خوب | ۳ خوب | ۲ قابل قبول | ۱ نیاز به تلاش'});
 await dl('class-results-'+jstamp(tdy())+'.xlsx',buf);m('')}catch(e){m('ساخت فایل ناموفق بود')}};
function profLine(){const P=S.prof,a=[];if(P.school)a.push(schoolFull());if(P.grade)a.push('پایه '+P.grade+(P.sec?' ('+P.sec+')':''));if(P.teacher)a.push('آموزگار: '+P.teacher);if(P.principal)a.push('مدیر: '+P.principal);if(P.city)a.push(P.city);return a.join(' | ')}
$('rkq').oninput=()=>renderRank();
window.rkM=m=>{rkMode=m;renderRank()};
const ptsOf=id=>S.exams.reduce((a,e)=>{const v=nrm(e,id);return v==null?a:a+lvl(v)},0);
function renderRank(){
 const st=S.students,av=s=>mean(S.courses.map(c=>cAvg(s.id,c.id,S.exams)).filter(nn));
 $('hsub').textContent=profLine()||'رقابت سالم، پیشرفت بی‌نهایت ✨';
 const rows=st.map(s=>({s,t:ptsOf(s.id),a:av(s)})).sort((x,y)=>rkMode==='lg'?(y.t-x.t)||((y.a??0)-(x.a??0)):((y.a??-1)-(x.a??-1))||(y.t-x.t));
 $('rkc').innerHTML=`<button class="${rkMode==='lg'?'on':''}" onclick="rkM('lg')">🏆 مجموع امتیاز</button><button class="${rkMode==='av'?'on':''}" onclick="rkM('av')">📘 میانگین ارزیابی</button>`;
 const q=$('rkq').value.trim(),isL=rkMode==='lg',mx=Math.max(1,...rows.map(r=>isL?r.t:(r.a||0))),md=['🥇','🥈','🥉'];
 const pod=!q&&rows.length>=3?`<div class="rkp">${[1,0,2].map(i=>{const r=rows[i];return `<div class="p${i+1}"><span class="mdl">${md[i]}</span>${window.stAv?stAv(r.s,i?44:54):''}<b>${esc2(r.s.name)}</b><em>${isL?fa(r.t)+' امتیاز':f1(r.a)}</em></div>`}).join('')}</div>`:'';
 $('tbl').innerHTML=pod+rows.map((r,i)=>({r,i})).filter(({r})=>r.s.name.includes(q)).map(({r,i})=>{const v=isL?r.t:(r.a||0);return `<details class="rki"><summary><span class="no">${i<3?md[i]:fa(i+1)}</span>${window.stAv?stAv(r.s,34):''}<span class="nm"><b>${esc2(r.s.name)}</b><small>${esc2(tname(r.s.team,'تیم '+(TN[r.s.team-1]||fa(r.s.team))))}${r.a!=null?' · '+LVW[lvl(r.a)]:''}</small><i class="bar"><u style="width:${Math.round(v/mx*100)}%;background:${col(r.a)}"></u></i></span><span class="sc" style="color:${col(r.a)}">${isL?fa(r.t):f1(r.a)}<small>${isL?'امتیاز':'از ۴'}</small></span></summary><div class="rkd">${S.courses.map(c=>{const x=cAvg(r.s.id,c.id,S.exams);return `<span style="border-color:${col(x)}">${esc2(c.name)} <b style="color:${col(x)}">${f1(x)}</b></span>`}).join('')}<span>مجموع امتیاز <b>${fa(r.t)}</b></span><span>میانگین کل <b>${f1(r.a)}</b></span></div></details>`}).join('')||'<p class="tem">موردی پیدا نشد</p>';
 $('rklg').textContent='این بخش برای دیدن سریع جایگاه، انگیزه‌دادن و پیدا کردن دانش‌آموزان نیازمند حمایت است؛ روی هر نفر بزنید تا نمرهٔ درس‌هایش باز شود. امتیاز فقط از پرسش و پاسخ کلاسی و آزمون کتبی به‌دست می‌آید: ۴ خیلی خوب | ۳ خوب | ۲ قابل قبول | ۱ نیاز به تلاش';
}
const CURR=g=>{const i=GR.indexOf(g);if(i<0)return[];const a=[['فارسی',i<2?'بخوانیم':'فارسی (بخوانیم)'],['نگارش',i<2?'بنویسیم':'نگارش'],['ریاضی','ریاضی'],['هدیه‌های آسمان','هدیه‌های آسمان'],['قرآن','آموزش قرآن'],['هنر','هنر'],['تربیت بدنی','تربیت بدنی']];if(i>=1)a.splice(3,0,['علوم تجربی','علوم تجربی']);if(i>=2)a.push(['مطالعات اجتماعی','مطالعات اجتماعی'],['کار و فناوری','کار و فناوری']);return a.map(([n,b])=>[n,'کتاب '+b+' پایه '+g])};
const LESSONS=g=>CURR(g).map(x=>x[0]);const LESSONS_OLD=g=>{const i=GR.indexOf(g);if(i<0)return[];const L=['فارسی','ریاضی','علوم تجربی','هدیه‌های آسمان','قرآن','هنر','تربیت بدنی'];if(i>=2)L.push('مطالعات اجتماعی','کار و فناوری');return L};
$('p_grade').innerHTML='<option value="">انتخاب کنید</option>'+GR.map(g=>`<option value="${g}">پایه ${g} ابتدایی</option>`).join('');
const chkT=()=>{const i=$('p_teacher'),w=$('p_teacher_w');if(!i)return;const bad=!i.value.trim();i.style.borderColor=bad?'#d9534f':'';if(w)w.textContent=bad?'(اجباری؛ نام آموزگار را بنویسید)':''};
['school','sec','teacher','principal','city'].forEach(k=>{$('p_'+k).value=S.prof[k]||'';$('p_'+k).oninput=e=>{S.prof[k]=e.target.value.trim();save();$('hsub').textContent=profLine()||'رقابت سالم، پیشرفت بی‌نهایت ✨';if(k==='teacher')chkT()}});chkT();
$('p_grade').value=S.prof.grade||'';
function renderProf(){const L=LESSONS(S.prof.grade);$('p_sug').textContent=L.length?'پایه '+S.prof.grade+': '+L.join('، '):'ابتدا پایه را انتخاب کنید'}
$('p_grade').onchange=e=>{S.prof.grade=e.target.value;save();renderProf();$('hsub').textContent=profLine()||'رقابت سالم، پیشرفت بی‌نهایت ✨'};
$('p_add').onclick=()=>{const L=LESSONS(S.prof.grade);if(!L.length){$('p_msg').textContent='ابتدا پایه را انتخاب کنید';return}const have=S.courses.map(c=>c.name);let n=0;CURR(S.prof.grade).forEach(([x,b])=>{const c=S.courses.find(q=>q.name===x);if(!c){S.courses.push({id:Date.now()+n,name:x,book:b});n++}else if(!c.book)c.book=b});$('p_msg').textContent=n?fa(n)+' درس اضافه شد':'همه‌ی این درس‌ها قبلاً اضافه شده‌اند';render()};
renderProf();window.__curr=CURR;
function tick(){const H=window.nextHol&&window.nextHol();if(H){const ms=H.at-new Date(),g=$('cdg'),t=$('cdt');if(t)t.textContent='🎉 '+H.title;const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,sc=Math.floor(ms/1e3)%60;g.innerHTML=[[d,'روز'],[h,'ساعت'],[m,'دقیقه'],[sc,'ثانیه']].map(([v,l])=>`<div>${fa(String(v).padStart(2,'0'))}<small>${l}</small></div>`).join('');$('cdi').textContent=H.when+(H.next?' | بعدی: '+H.next:'');return}const t0=$('cdt');if(t0)t0.textContent='⏳ زمان باقی‌مانده تا پایان سال تحصیلی';const r=schoolRange(tdy()),b=r.b,end=new Date(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate(),23,59,59),ms=end-new Date(),g=$('cdg');
 if(ms<=0)g.innerHTML='<div style="grid-column:1/-1;font-size:16px">سال تحصیلی به پایان رسیده است</div>';
 else{const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,sc=Math.floor(ms/1e3)%60;g.innerHTML=[[d,'روز'],[h,'ساعت'],[m,'دقیقه'],[sc,'ثانیه']].map(([v,l])=>`<div>${fa(String(v).padStart(2,'0'))}<small>${l}</small></div>`).join('')}
 $('cdi').textContent='شروع: '+fmt(r.a)+' | پایان: '+fmt(b)}
tick();setInterval(tick,1000);
const LVC={4:'#1a8f55',3:'#5fa83a',2:'#f59e0b',1:'#e5484d'},LEG='۴ خیلی خوب | ۳ خوب | ۲ قابل قبول | ۱ نیاز به تلاش';
const CS2=(k,v,r)=>(k===5||k===6)?{bg:LVC[r[5]]||'#8a7aa6',fg:'#ffffff'}:null;
const CS=(k,v,r)=>k>=6?{bg:LVC[r[6]]||'#8a7aa6',fg:'#ffffff'}:null;
const fnRes=(ext,pre='class-results')=>{const m=+$('rm').value;return pre+'-'+(m?(m>=7?SY:SY+1)+'-'+z2(m):SY+'-'+(SY+1))+'.'+ext};
function infoLines(extra){const P=S.prof,a=[],b=[];if(P.school)a.push(schoolFull());if(P.grade)a.push('پایه '+P.grade+(P.sec?' ('+P.sec+')':''));if(P.teacher)a.push('آموزگار: '+P.teacher);if(P.principal)b.push('مدیر: '+P.principal);if(P.city)b.push(P.city);extra.filter(Boolean).forEach(x=>b.push(x));return[a.join(' | '),b.join(' | ')].filter(Boolean)}
function resData(sid){
 const cn=e=>S.courses.find(c=>c.id===e.course)?.name||'';
 const EX=EXf().filter(e=>Object.keys(e.scores).length).sort((a,b)=>a.date.localeCompare(b.date)||cn(a).localeCompare(cn(b)));
 const st=sid?S.students.filter(s=>s.id===sid):S.students,rows=[];let n=0;
 EX.forEach(e=>{const dt=fmt(new Date(e.date+'T12:00:00Z')),ca=f1(mean(S.students.map(x=>nrm(e,x.id)).filter(nn))),ra=(e.title||'').trim()||'—';
  st.forEach(s=>{
   if(absent(e,s.id)){rows.push(sid?[++n,dt,cn(e),e.type,ra,'—','غایب',ca]:[++n,dt,s.name,cn(e),e.type,ra,'—','غایب']);return}
   const v=lvl(nrm(e,s.id));if(v==null)return;
   rows.push(sid?[++n,dt,cn(e),e.type,ra,v,LVW[v],ca]:[++n,dt,s.name,cn(e),e.type,ra,v,LVW[v]])})});
 const m=window.__rg?0:+$('rm').value,t=$('rt').value,mt=window.__rg?window.__rg[2]:(m?MN[m-1]+' ماه':'سال تحصیلی '+syLab(SY));let sub='—';
 if(EX.length){const A=jp(new Date(EX[0].date+'T12:00:00Z')),B=jp(new Date(EX[EX.length-1].date+'T12:00:00Z'));sub=fa(A.d)+' '+MN[A.m-1]+(A.y!==B.y?' '+fa(A.y):'')+' تا '+fa(B.d)+' '+MN[B.m-1]+' '+fa(B.y)}
 if(sid){const s=S.students.find(x=>x.id===sid),o=classTable().rk.findIndex(r=>r.s.id===sid)+1,ov=overall(sid);
  return{title:'گزارش عملکرد فردی — '+s.name+' — '+mt,sub,info:infoLines([t,'میانگین کل: '+f1(ov)+(ov!=null?' ('+LVW[lvl(ov)]+')':''),'رتبه: '+fa(o)+' از '+fa(S.students.length)]),sid,land:false,head:['ردیف','تاریخ آزمون/پرسش','درس','نوع','محدوده‌ی پرسش/آزمون','امتیاز','ارزیابی توصیفی','میانگین کلاس'],rows,nameCol:-1,widths:[5,13,14,15,26,8,13,10],cellStyle:CS2}}
 return{title:'گزارش نتایج کلاس — '+mt,sub,info:infoLines([t]),land:true,head:['ردیف','تاریخ آزمون/پرسش','اسامی دانش‌آموزان','درس','نوع','محدوده‌ی پرسش/آزمون','امتیاز','ارزیابی توصیفی'],rows,nameCol:2,widths:[6,15,22,14,16,26,8,14],cellStyle:CS}}
const MRM=[7,8,9,10,11,12,1,2,3,4,5,6],mrY=m=>m>=7?SY:SY+1;
const MRL=[null,{n:'نیاز به تلاش',c:'#d12f35',b:'#fde4e4'},{n:'قابل قبول',c:'#d98600',b:'#fff0d9'},{n:'خوب',c:'#3f9a63',b:'#e3f3e8'},{n:'خیلی خوب',c:'#1a8f55',b:'#d8f0e1'}];
const MRH={n:{n:'اصلا',c:'#d12f35',b:'#fde4e4'},p:{n:'ناقص',c:'#d98600',b:'#fff0d9'},c:{n:'کامل',c:'#1a8f55',b:'#d8f0e1'}};
function mrSel(){const c=$('mr_c'),m=$('mr_m');if(!c||!m)return null;const cid=+c.value,co=S.courses.find(x=>x.id===cid);return co?{co,m:+m.value}:null}
function mrCalc(co,m){const y=mrY(m),inM=d=>{const q=jp(new Date(d+'T12:00:00Z'));return q.m===m&&q.y===y};
 const ex=S.exams.filter(e=>e.course===co.id&&inM(e.date)),hw=(S.hwl||[]).filter(h=>h.course===co.id&&inM(h.date));
 const ak=Object.keys(S.att).filter(k=>inM(k)&&!S.closed[k]&&!hol(new Date(k+'T12:00:00Z')));
 const data=S.students.map(st=>{const sc=[];ex.forEach(e=>{const a=(S.att[e.date]||{})[st.id]==='a';if(a&&!(e.mk&&e.mk[st.id]&&e.mk[st.id]!=='x'))return;const v=e.scores&&e.scores[st.id];if(v!=null)sc.push(v/e.max*4)});
  const avg=sc.length?sc.reduce((a,b)=>a+b,0)/sc.length:null,lv=avg==null?0:Math.min(4,Math.max(1,Math.round(avg)));
  let d=0,p=0,n=0;hw.forEach(h=>{const v=(h.st||{})[st.id];if(v==='d')d++;else if(v==='p')p++;else if(v==='n')n++});const rec=d+p+n,hs=rec?((d+.5*p)/rec>=.8?'c':(d+p===0?'n':'p')):'';
  let ab=0,lt=0;ak.forEach(k=>{const v=(S.att[k]||{})[st.id];if(v==='a')ab++;else if(v==='l')lt++});
  const t=[];if(lv)t.push(lv===4?'عملکرد عالی':lv===3?'عملکرد خوب':'نیاز به مرور و تمرین بیشتر');
  if(hs==='n')t.push('تکلیف انجام نداده');else if(hs==='p'&&lv&&lv<=2)t.push('تکالیف ناقص');
  if(ab)t.push(fa(ab)+' روز غیبت');if(lt>=3)t.push('تأخیر زیاد');
  return{name:st.name,lv,hs,desc:t.join('، ')}});
 return{co,m,y,data,nHw:hw.length,nEx:ex.length}}
const MTH='border:1px solid #9a86c9;background:#7e57c2;color:#fff;padding:6px 4px;text-align:center;vertical-align:middle;font-weight:700;font-size:12px;',MTD='border:1px solid #d6cdea;padding:4px 4px;text-align:center;vertical-align:middle;font-size:12px;';
const mrCk=x=>x?`<td style="${MTD}background:${x.b};color:${x.c};font-size:15px;font-weight:800">✓</td>`:`<td style="${MTD}"></td>`;
function mrTable(R,a,b){const lv=[1,2,3,4].map(i=>`<th style="${MTH}">${MRL[i].n}</th>`).join(''),hw=['n','p','c'].map(k=>`<th style="${MTH}">${MRH[k].n}</th>`).join('');
 const rows=R.data.slice(a,b).map((r,j)=>`<tr><td style="${MTD}">${fa(a+j+1)}</td><td style="${MTD}text-align:right;padding-right:8px;word-break:break-word">${esc2(r.name)}</td><td style="${MTD}text-align:right;padding-right:8px;font-size:11px">${esc2(r.desc)}</td>${[1,2,3,4].map(i=>mrCk(r.lv===i?MRL[i]:null)).join('')}${['n','p','c'].map(k=>mrCk(r.hs===k?MRH[k]:null)).join('')}</tr>`).join('');
 return `<table style="width:100%;border-collapse:collapse;direction:rtl;min-width:620px"><thead><tr><th rowspan="2" style="${MTH}width:34px">ردیف</th><th rowspan="2" style="${MTH}width:130px">نام و نام خانوادگی</th><th rowspan="2" style="${MTH}">توضیحات</th><th colspan="4" style="${MTH}">سطح عملکرد<div style="font-weight:400;font-size:10px">(نیاز به تلاش / قابل قبول / خوب / خیلی خوب)</div></th><th colspan="3" style="${MTH}">تمرین و تکالیف<div style="font-weight:400;font-size:10px">(اصلا / ناقص / کامل)</div></th></tr><tr>${lv}${hw}</tr></thead><tbody>${rows}</tbody></table>`}
function mrHead(R){const P=S.prof,sch=P.school?schoolFull():'',m=MN[R.m-1],y2=R.m>=7?R.y:R.y;
 return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;border-bottom:3px solid #7e57c2;padding-bottom:8px"><div style="width:110px;text-align:center">${P.logo?`<img src="${P.logo}" style="height:58px;max-width:100px;object-fit:contain">`:''}<div style="font-size:10px;font-weight:800;color:#1f3b8a;margin-top:2px">${esc2(sch)}</div></div><div style="flex:1;text-align:center"><div style="font-weight:800;font-size:22px;color:#4a2f9a">ثبت گزارش عملکرد ماهانه درس «${esc2(R.co.name)}»</div><div style="font-size:14px;color:#555;margin-top:6px">ماه ${m} ${P.year?LR+fa(P.year)+LR:syLab(SY)}</div><div style="font-size:12px;color:#666;margin-top:6px">${esc2(profLine())}</div></div><div style="width:110px"></div></div>`}
function mrFoot(R,i,n){return `<div style="position:absolute;bottom:56px;left:30px;right:30px;font-size:10.5px;color:#555;line-height:1.7">سطح عملکرد = میانگین ارزیابی این درس در همین ماه (از ۱ تا ۴)؛ تمرین و تکالیف = از ${fa(R.nHw)} تکلیف ثبت‌شده؛ «کامل» یعنی حداقل ۸۰٪ انجام شده، «اصلا» یعنی هیچ‌کدام انجام نشده، بقیه «ناقص»؛ خانه‌ی خالی = داده‌ای ثبت نشده.</div>${n>1?`<div style="position:absolute;bottom:30px;left:30px;right:30px;text-align:center;font-size:11px;color:#666">صفحه ${fa(i+1)} از ${fa(n)}</div>`:''}`}
function mrFile(R){return ('گزارش-ماهانه-'+R.co.name+'-'+MN[R.m-1]+'-'+R.y).replace(/\s+/g,'-').replace(/[\\/:*?"<>|]/g,'')}
function renderMr(){const c=$('mr_c'),m=$('mr_m');if(!c)return;const keep=c.value;
 c.innerHTML=S.courses.length?S.courses.map(x=>`<option value="${x.id}">${esc2(x.name)}</option>`).join(''):'<option value="">ابتدا درسی بسازید</option>';if(keep&&S.courses.some(x=>String(x.id)===keep))c.value=keep;
 if(!m.options.length){m.innerHTML=MRM.map(k=>`<option value="${k}">${MN[k-1]} ${fa(mrY(k))}</option>`).join('');m.value=String(jp(tdy()).m)}
 const q=mrSel(),pv=$('mr_pv'),inf=$('mr_i');if(!q){pv.innerHTML='<p class="sub" style="padding:14px">درسی برای گزارش وجود ندارد.</p>';inf.textContent='';return}
 const R=mrCalc(q.co,q.m);inf.textContent=S.students.length?`${fa(R.nEx)} ارزیابی و ${fa(R.nHw)} تکلیف ثبت‌شده در این ماه برای این درس${R.nEx+R.nHw?'':' — هنوز داده‌ای ثبت نشده'}`:'دانش‌آموزی ثبت نشده است';
 pv.innerHTML=S.students.length?mrTable(R,0,S.students.length):''}
window.renderMr=renderMr;
if($('mr_c')){$('mr_c').onchange=renderMr;$('mr_m').onchange=renderMr;
 $('mr_pdf').onclick=async()=>{const q=mrSel();if(!q||!S.students.length){msg('درس و دانش‌آموز لازم است');return}
  try{msg('در حال ساخت PDF…');await pdfLibs();try{await document.fonts.ready}catch(e){}const R=mrCalc(q.co,q.m);let per=22,n=Math.max(1,Math.ceil(S.students.length/per));const doc=new (window.jspdf?window.jspdf.jsPDF:MiniPDF)({unit:'mm',format:'a4'});
   const mk=i=>{const el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:#fff;color:#222;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;padding:34px 30px;box-sizing:border-box';el.innerHTML=mrHead(R)+'<div style="height:12px"></div>'+mrTable(R,i*per,(i+1)*per)+mrFoot(R,i,n);document.body.appendChild(el);return el};
   for(let g=0;g<12;g++){const e=mk(n-1),ok=window.sigAfter(e,1000);e.remove();if(ok)break;n++;per=Math.ceil(S.students.length/n)}
   for(let i=0;i<n;i++){const el=mk(i);if(i===n-1)window.sigAfter(el,1000);const cv=await rast(el);el.remove();if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}
   await dl(mrFile(R)+'.pdf',doc.output('arraybuffer'));msg('')}catch(e){msg('ساخت PDF ناموفق بود: '+(e&&e.message||e))}}}
async function xpdf(o){await pdfLibs();try{await document.fonts.ready}catch(e){}
 let per=o.land?16:24,pages=Math.max(1,Math.ceil(o.rows.length/per));const doc=new (window.jspdf?window.jspdf.jsPDF:MiniPDF)({unit:'mm',format:'a4',orientation:o.land?'landscape':'portrait'});
 const th='border:1px solid #9a86c9;background:#7e57c2;color:#fff;padding:6px 3px;text-align:center;vertical-align:middle;font-weight:700;',td='border:1px solid #c9bde6;padding:5px 3px;text-align:center;vertical-align:middle;';
 const SL=o.land?730:1052,mk=i=>{
  const el=document.createElement('div');
  el.style.cssText='position:fixed;left:-9999px;top:0;'+(o.land?'width:1123px;height:794px;':'width:794px;height:1123px;')+'background:#fff;color:#222;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;padding:28px 36px;box-sizing:border-box';
  const rows=o.rows.slice(i*per,(i+1)*per).map(r=>`<tr>${r.map((v,k)=>{const cs=o.cellStyle&&o.cellStyle(k,v,r);return `<td style="${td}${k===o.nameCol?'text-align:right;padding-right:8px;':''}${cs?`background:${cs.bg};color:${cs.fg};font-weight:700;`:''}">${typeof v==='number'?fa(v):esc2(v)}</td>`}).join('')}</tr>`).join('');
  el.innerHTML=`<div style="position:relative;min-height:80px">${window.LG()}${o.sid?window.PH(o.sid):''}<div style="text-align:center;font-weight:800;font-size:22px;padding:0 104px">${esc2(o.title)}</div><div style="text-align:center;font-size:14px;margin:4px 0;color:#555;padding:0 104px">${esc2(o.sub)}</div></div>${[].concat(o.info||[]).map(x=>`<div style="text-align:center;font-size:13px;color:#444;margin-top:2px">${esc2(x)}</div>`).join('')}<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px"><tr>${o.head.map((h,k)=>`<th style="${th}${k===o.nameCol?'text-align:right;padding-right:8px;':''}">${esc2(h)}</th>`).join('')}</tr>${rows}</table><div style="position:absolute;bottom:30px;left:36px;right:36px;font-size:12px;color:#555;display:flex;justify-content:space-between"><span>${LEG}</span><span>صفحه ${fa(i+1)} از ${fa(pages)}</span></div>`;
  document.body.appendChild(el);return el};
 for(let g=0;g<12;g++){const e=mk(pages-1),ok=window.sigAfter(e,SL);e.remove();if(ok)break;pages++;per=Math.ceil(o.rows.length/pages)}
 for(let i=0;i<pages;i++){const el=mk(i);if(i===pages-1)window.sigAfter(el,SL);const cv=await rast(el);el.remove();
  if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,o.land?297:210,o.land?210:297)}
  return doc.output('arraybuffer')}
async function runExp(kind,sid){try{const D=resData(sid);if(!D.rows.length){msg('برای این فیلتر ارزیابی‌ای ثبت نشده');return}msg(kind==='x'?'در حال ساخت فایل…':'در حال ساخت PDF…');
 const fn=fnRes(kind==='x'?'xlsx':'pdf',sid?'student-results':'class-results');
 if(kind==='x'){const buf=await xbook({sheet:'نتایج',title:D.title,sub:D.sub,info:D.info,head:D.head,rows:D.rows,nameCol:D.nameCol,widths:D.widths,legend:LEG,sign:true,land:D.land,footer:'&Cصفحه &P از &N',cellStyle:D.cellStyle});await dl(fn,buf)}
 else await dl(fn,await xpdf(D))}catch(e){msg(errT(e))}}
window.expRes=()=>runExp('x');window.expResPdf=()=>runExp('p');window.expStu=k=>runExp(k,+$('rs').value);
show('home');render();
(function(){
S.notes=S.notes||{};
let tab='c',nk='t';
const F='font-family:Vazirmatn,Tahoma,sans-serif;',TH='border:1px solid #9a86c9;background:#7e57c2;color:#fff;padding:5px 3px;text-align:center;white-space:normal;',TD='border:1px solid #d9cdee;padding:4px 3px;text-align:center;white-space:normal;';
const NTP={t:['🌟 تشویق','#1a8f55'],n:['📝 نکته','#7e57c2'],w:['⚠️ هشدار','#d12f35']};
const pc=v=>v==null?'—':fa(Math.round(v))+'٪',r1=v=>v==null?'':Math.round(v*10)/10;
const rI=()=>{const x=SM.indexOf(+$('mp').value),y=SM.indexOf(+$('mp2').value);return[Math.max(0,Math.min(x,y)),Math.max(x,y)]};
const sub=()=>{const[a,b]=rI();return a<=0&&b>=SM.length-1?'سال تحصیلی '+syLab(SY):a===b?'ماه '+MN[SM[a]-1]+' '+syLab(SY):'از '+MN[SM[a]-1]+' تا '+MN[SM[b]-1]+' ('+syLab(SY)+')'};
const HW=(id,a,b,rg)=>{const o={d:0,p:0,n:0};(S.hwl||[]).forEach(h=>{if(h.date>=a&&h.date<=b&&rg(h.date)&&h.st[id])o[h.st[id]]++});return o};
const OR0='پرسش و پاسخ کلاسی';
function data(m){
 const r=rangeY(),a=iso(r.a),b=iso(r.b),st=S.students,A=S.att;
 const reg=k=>k>=a&&k<=b&&!S.closed[k]&&!hol(new Date(k+'T12:00:00Z'))&&st.some(s=>A[k][s.id]);
 const[i1,i2]=rI(),rg=k=>{const i=SM.indexOf(jp(new Date(k+'T12:00:00Z')).m);return i>=i1&&i<=i2};const aD=Object.keys(A).filter(reg).sort(),dk=aD.filter(rg);
 const aE=S.exams.filter(e=>e.date>=a&&e.date<=b&&Object.keys(e.scores).length).sort((x,y)=>x.date.localeCompare(y.date)),EX=aE.filter(e=>rg(e.date));
 const cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'—';
 const rows=st.map(s=>{
  const c=cnt(s.id,dk),n=dk.length,hw=HW(s.id,a,b,rg),per=S.courses.map(co=>mean(EX.filter(e=>e.course===co.id).map(e=>nrm(e,s.id)).filter(nn)));
  const avg=mean(per.filter(nn)),v=EX.map(e=>nrm(e,s.id)).filter(nn),h=v.length>>1,dr=v.length>=4?mean(v.slice(h))-mean(v.slice(0,h)):0,fl=[];
  if(n&&c.a/n>=.15)fl.push('غیبت زیاد');if(c.l>=3)fl.push('تأخیر زیاد');if(avg!=null&&avg<2.5)fl.push('میانگین پایین');if(dr<=-.5)fl.push('افت نمره');if(hw.n>=3)fl.push('تکلیف انجام‌نشده');const pd=EX.filter(e=>e.type!==OR0&&(A[e.date]||{})[s.id]==='a'&&e.scores[s.id]==null&&!(e.mk&&e.mk[s.id])).length;if(pd)fl.push('آزمون جبرانی باقی‌مانده');
  return{s,c,ap:n?(n-c.a)/n*100:null,per,avg,fl,dr,hw,pd}});
 const mon=SM.filter((mm,i)=>i>=i1&&i<=i2).map(mm=>{const ks=aD.filter(k=>inMonth(k,mm));let p=0,t=0;ks.forEach(k=>st.forEach(s=>{const x=A[k][s.id];if(x){t++;if(x!=='a'||isX(k,s.id))p++}}));
  return{l:MN[mm-1],ab:t-p,ap:t?p/t*100:null,av:mean(aE.filter(e=>inMonth(e.date,mm)).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn))}}).filter(x=>x.ap!=null||x.av!=null);
 const les=S.courses.map((c,i)=>({l:c.name,v:mean(rows.map(q=>q.per[i]).filter(nn))}));
 const lv=[4,3,2,1].map(k=>({l:LVW[k],v:EX.flatMap(e=>st.map(s=>lvl(nrm(e,s.id)))).filter(x=>x===k).length,c:LVC[k]}));
 const ex=EX.map(e=>{const v=st.map(s=>nrm(e,s.id)).filter(nn);return{d:e.date,c:cn(e.course),t:e.type,n:v.length,mk:Object.values(e.mk||{}).filter(x=>x!=='x').length,pd:st.filter(s=>e.type!==OR0&&(S.att[e.date]||{})[s.id]==='a'&&e.scores[s.id]==null&&!(e.mk&&e.mk[s.id])).length,av:mean(v),lo:v.length?Math.min(...v):null,hi:v.length?Math.max(...v):null}});
 const ok=ex.filter(x=>x.av!=null),weak=ok.length?ok.reduce((p,q)=>q.av<p.av?q:p):null;
 return{rows,dk,EX,mon,les,lv,ex,weak,m,avg:mean(rows.map(q=>q.avg).filter(nn)),ap:mean(rows.map(q=>q.ap).filter(nn)),ab:rows.reduce((t,q)=>t+q.c.a,0)};
}
const sv=(w,h,x)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;${F}">${x}</svg>`;
function bars(it,max,fm,cf){const W=340,H=150,n=it.length||1,bw=Math.min(40,(W-20)/n-8);return sv(W,H,it.map((q,i)=>{const x=10+(i+.5)*(W-20)/n,h=(q.v||0)/max*(H-50);return `<rect x="${x-bw/2}" y="${H-30-h}" width="${bw}" height="${h}" rx="4" fill="${q.c||(cf?cf(q.v):'#7e57c2')}"/><text x="${x}" y="${H-33-h}" font-size="11" text-anchor="middle" fill="#333">${q.v==null?'—':fm(q.v)}</text><text x="${x}" y="${H-14}" font-size="10" text-anchor="middle" fill="#555">${esc2(q.l.slice(0,10))}</text>`}).join(''))}
function line(it,max,fm,it2){const W=340,H=150,n=it.length,x=i=>n<2?W/2:25+i*(W-50)/(n-1),y=v=>H-30-v/max*(H-55),pl=(a,c)=>{const p=a.map((q,i)=>q.v==null?null:x(i)+','+y(q.v)).filter(Boolean).join(' ');return p?`<polyline points="${p}" fill="none" stroke="${c}" stroke-width="2.5"/>`:''};
 return sv(W,H,pl(it2||[],'#bbb')+pl(it,'#7e57c2')+it.map((q,i)=>(q.v==null?'':`<circle cx="${x(i)}" cy="${y(q.v)}" r="3.5" fill="#7e57c2"/><text x="${x(i)}" y="${y(q.v)-8}" font-size="10" text-anchor="middle" fill="#333">${fm(q.v)}</text>`)+`<text x="${x(i)}" y="${H-12}" font-size="10" text-anchor="middle" fill="#555">${esc2(q.l)}</text>`).join(''))}
const box=(t,c)=>`<div style="border:1px solid #e3d9f3;border-radius:12px;padding:8px;background:#fff"><div style="font-weight:800;font-size:13px;margin-bottom:4px;color:#4b3478">${t}</div>${c}</div>`;
const tbl=(h,rs,hi)=>`<table style="width:100%;border-collapse:collapse;font-size:12px"><tr>${h.map(x=>`<th style="${TH}">${x}</th>`).join('')}</tr>${rs.map((r,i)=>`<tr${hi===i?' style="background:#fde8ea"':''}>${r.map(c=>`<td style="${TD}">${c}</td>`).join('')}</tr>`).join('')}</table>`;
const h3=t=>`<div style="font-weight:800;font-size:14px;margin:6px 0 8px;color:#4b3478">${t}</div>`;
const K=(t,v)=>`<div style="flex:1;min-width:110px;background:#f5effc;border-radius:12px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:800;color:#4b3478">${v}</div><div style="font-size:12px;color:#666">${t}</div></div>`;
const kp=a=>`<div style="display:flex;gap:8px;flex-wrap:wrap">${a.map(x=>K(x[0],x[1])).join('')}</div>`;
const apc=v=>v>=90?'#1a8f55':v>=80?'#d98600':'#d12f35',chips=f=>f.map(x=>`<span style="background:#fde8ea;color:#c0262c;border-radius:10px;padding:2px 8px;font-size:12px;margin:0 0 2px 4px;display:inline-block">${x}</span>`).join(' ');
const gr=x=>`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;margin-top:10px">${x}</div>`;
const kC=d=>kp([['دانش‌آموزان',fa(S.students.length)],['میانگین کلاس (از ۴)',f1(d.avg)],['درصد حضور',pc(d.ap)],['مجموع غیبت',fa(d.ab)],['آزمون‌ها',fa(d.EX.length)]]);
const chC=d=>gr(box('📅 درصد حضور هر ماه',bars(d.mon.map(x=>({l:x.l,v:x.ap})),100,v=>fa(Math.round(v)),apc))+box('📈 میانگین کلاس در هر ماه',line(d.mon.map(x=>({l:x.l,v:x.av})),4,f1))+box('📚 میانگین هر درس',bars(d.les,4,f1,col))+box('🎯 توزیع سطح نمرات',bars(d.lv,Math.max(1,...d.lv.map(x=>x.v)),fa)));
const fx=(h,rs,w)=>`<table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed"><colgroup>${w.map(x=>`<col style="width:${x}">`).join('')}</colgroup><tr>${h.map(x=>`<th style="${TH}">${x}</th>`).join('')}</tr>${rs.map(r=>`<tr>${r.map(c=>`<td style="${TD}overflow-wrap:anywhere">${c}</td>`).join('')}</tr>`).join('')}</table>`;
const atH=['نام','علت','حضور','میانگین'],atW=['28%','46%','13%','13%'],atNone='<div style="text-align:center;color:#1a8f55;font-size:13px">✅ موردی دیده نشد</div>';
const atC=(d,n)=>{const L=d.rows.filter(q=>q.fl.length).sort((x,y)=>y.fl.length-x.fl.length).slice(0,n||99);return h3('⚠️ دانش‌آموزان نیازمند توجه')+(L.length?fx(atH,L.map(q=>[esc2(q.s.name),chips(q.fl),pc(q.ap),f1(q.avg)]),atW):atNone)};
const exR=(d,a,b)=>d.ex.slice(a,b).map(x=>[fmt(new Date(x.d+'T12:00:00Z')),esc2(x.c),esc2(x.t||''),f1(x.av),f1(x.lo),f1(x.hi),fa(x.n),x.mk||x.pd?(x.mk?fa(x.mk)+' جبرانی':'')+(x.pd?' | '+fa(x.pd)+' منتظر':''):'—']);
const exT=(d,a,b)=>tbl(['تاریخ','درس','نوع','میانگین','کمترین','بیشترین','شرکت‌کننده','جبرانی'],exR(d,a,b),d.weak?d.ex.indexOf(d.weak)-a:-1);
const mkTxt=(d,sid)=>{const L=[];d.EX.forEach(e=>{if(e.type===OR0)return;const lab=esc2((S.courses.find(c=>c.id===e.course)||{}).name||'')+' ('+fmt(new Date(e.date+'T12:00:00Z'))+')',m=e.mk&&e.mk[sid];if(m&&m!=='x')L.push('✅ '+lab+': در روز آزمون غایب بود و در تاریخ '+fmt(new Date(m+'T12:00:00Z'))+' آزمون جبرانی داد (نمره '+f1(nrm(e,sid))+' از ۴)');else if(m==='x')L.push('➖ '+lab+': غایب بود و از آزمون جبرانی معاف شد');else if((S.att[e.date]||{})[sid]==='a'&&e.scores[sid]==null)L.push('⏳ '+lab+': غایب بود و هنوز آزمون جبرانی نداده است')});return L.length?h3('🔁 آزمون‌های جبرانی (با بقیه‌ی کلاس در یک روز امتحان نداده)')+L.map(x=>`<div style="font-size:13px;margin:3px 0">${x}</div>`).join(''):''};
function sCard(d,sid,del){const r=d.rows.find(q=>q.s.id===sid);if(!r)return'';const st=S.students,E=d.EX.filter(e=>nn(nrm(e,sid))).slice(-10),dd=e=>{const q=jp(new Date(e.date+'T12:00:00Z'));return fa(q.m+'/'+q.d)};
 const lc=S.courses.map((c,i)=>{const Ec=d.EX.filter(e=>e.course===c.id&&nn(nrm(e,sid))),v=Ec.map(e=>nrm(e,sid)),n=v.length,h=n>>1,df=n>=2?mean(v.slice(n-Math.ceil(n/2)))-mean(v.slice(0,h)):null;return{c,Ec,v,n,vd:trendV(v)}});
 const lt=tbl(['درس','تعداد آزمون','میانگین','آخرین نمرات','آخرین در برابر قبلی','روند'],lc.map(x=>[esc2(x.c.name),fa(x.n),f1(mean(x.v)),x.v.slice(-6).map(f1).join(' ← ')||'—',x.n>1?f1(x.v[x.n-1])+' از '+f1(x.v[x.n-2]):'—',x.vd]))+gr(lc.filter(x=>x.n>=2).map(x=>{const E2=x.Ec.slice(-10);return box(esc2(x.c.name)+' — '+x.vd,line(E2.map(e=>({l:dd(e),v:nrm(e,sid)})),4,f1,E2.map(e=>({v:mean(st.map(s=>nrm(e,s.id)).filter(nn))}))))}).join(''));
 const al=S.notes[sid]||[];let nt='';for(let i=al.length-1;i>=Math.max(0,al.length-6);i--){const q=al[i],T=NTP[q.k]||NTP.n;nt+=`<div style="border-right:4px solid ${T[1]};background:#faf7ff;padding:5px 8px;margin:4px 0;font-size:12px"><b style="color:${T[1]}">${T[0]}</b> · ${fmt(new Date(q.d+'T12:00:00Z'))}: ${esc2(q.x)}${del?` <a onclick="mDel(${sid},${i})" style="color:#d12f35;cursor:pointer">✕</a>`:''}</div>`}
 return `<div style="font-size:18px;font-weight:800;margin-bottom:8px">${window.PH(sid,1)}👤 ${esc2(r.s.name)}</div>`+kp([['درصد حضور',pc(r.ap)],['غیبت / موجه / تأخیر',fa(r.c.a)+' / '+fa(r.c.e)+' / '+fa(r.c.l)],['تکالیف',fa(r.hw.d)+'✅ '+fa(r.hw.p)+'🟡 '+fa(r.hw.n)+'❌'],['میانگین کل',f1(r.avg)+' از ۴'+(window.__pct?window.__pct(r.avg):'')],['سطح',r.avg==null?'—':LVW[lvl(r.avg)]]])+(r.fl.length?`<div style="margin-top:8px">${chips(r.fl)}</div>`:'')+gr(box('📚 وضعیت درس‌ها',tbl(['درس','میانگین','وضعیت'],S.courses.map((c,i)=>[esc2(c.name),f1(r.per[i]),r.per[i]==null?'—':`<b style="color:${col(r.per[i])}">${LVW[lvl(r.per[i])]}</b>`])))+box('📈 روند نمرات (خاکستری: میانگین کلاس)',line(E.map(e=>({l:dd(e),v:nrm(e,sid)})),4,f1,E.map(e=>({v:mean(st.map(s=>nrm(e,s.id)).filter(nn))})))))+mkTxt(d,sid)+h3('🧾 ارزشیابی توصیفی')+`<div style="font-size:13px;line-height:2;background:#faf7ff;border-radius:10px;padding:8px">${esc2((S.desc&&S.desc[sid])||(window.genDesc?window.genDesc(sid):auto(d,sid)))}</div>`+(window.weakHtml?window.weakHtml(sid):'')+h3('🔁 مقایسه‌ی آزمون‌های هر درس با آزمون‌های قبلی')+lt+h3('📝 یادداشت‌های آموزگار')+(nt||'<div style="font-size:12px;color:#888">یادداشتی ثبت نشده</div>')}
const W=x=>`<div style="background:#fff;color:#222;border-radius:16px;padding:12px;margin-bottom:12px;${F}">${x}</div>`;
const hdr=(t,s)=>`<div style="text-align:center;position:relative;min-height:74px;padding:0 104px">${window.LG()}<div style="font-size:22px;font-weight:800;color:#4b3478">${t}</div><div style="font-size:13px;color:#555;margin-top:3px">${esc2(s)}</div><div style="font-size:12px;color:#777;margin-top:2px">${esc2(profLine())}</div></div><hr style="border:0;border-top:2px solid #7e57c2;margin:10px 0">`;
const ftr=()=>'';
const stH=['نام','حضور','غ','م','ت','میانگین','وضعیت'],stR=q=>[esc2(q.s.name),pc(q.ap),fa(q.c.a),fa(q.c.e),fa(q.c.l),f1(q.avg),chips(q.fl)||'—'];
const stT=d=>{const R=d.rows,h=Math.ceil(R.length/2),mk=a=>fx(stH,a.map(stR),['25%','12%','7%','7%','7%','13%','29%']);return `<div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1;min-width:0">${mk(R.slice(0,h))}</div>${R.length>1?`<div style="flex:1;min-width:0">${mk(R.slice(h))}</div>`:''}</div>`};
const rH=(t,fl,wt,wf)=>{const a=Math.ceil(String(t).length*6.6/(wt-8)),b=fl&&fl.length?Math.ceil(fl.reduce((x,y)=>x+y.length*6.4+24,0)/(wf-8)):1;return 27+(Math.max(1,a,b)-1)*21};
const flow=(t,segs,cap)=>{const P=[];let cur='',used=0,open=null;const close=()=>{if(open){cur+=fx(open.sg.head,open.rows,open.sg.w);open=null}},flush=()=>{close();if(cur)P.push(t+cur);cur='';used=0};
 segs.forEach(sg=>{if(!sg.rows.length){if(used+70>cap)flush();cur+=h3(sg.title)+(sg.none||'');used+=70;return}
  let started=false;sg.rows.forEach(r=>{const need=r.h+(open&&open.sg===sg?0:66);if(used+need>cap&&(open||cur))flush();
   if(!open||open.sg!==sg){close();cur+=h3(sg.title+(started?' (ادامه)':''));open={sg,rows:[]};used+=66;started=true}
   open.rows.push(r.c);used+=r.h});close()});flush();return P};
const exT2=d=>{if(!d.ex.length)return'<div style="font-size:12px;color:#888">آزمونی ثبت نشده</div>';const h=Math.ceil(d.ex.length/2),mk=(a,b)=>tbl(['تاریخ','درس','میانگین','کمترین','بیشترین'],d.ex.slice(a,b).map(x=>[fmt(new Date(x.d+'T12:00:00Z')),esc2(x.c),f1(x.av),f1(x.lo),f1(x.hi)]),d.weak?d.ex.indexOf(d.weak)-a:-1);return `<div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1">${mk(0,h)}</div>${d.ex.length>1?`<div style="flex:1">${mk(h,99)}</div>`:''}</div>`+(d.weak?`<div style="font-size:12px;margin-top:4px;color:#c0262c">ضعیف‌ترین آزمون: ${esc2(d.weak.c)} (${fmt(new Date(d.weak.d+'T12:00:00Z'))}) با میانگین ${f1(d.weak.av)}</div>`:'')};
const one=(d,s2)=>hdr('گزارش عملکرد کلاس',s2)+kC(d)+chC(d)+h3('👥 وضعیت دانش‌آموزان')+stT(d)+atC(d,8)+h3('📝 مقایسه‌ی آزمون‌ها')+exT2(d);
const full=(d,s2)=>{const t=hdr('گزارش کامل عملکرد کلاس',s2),A=d.rows.filter(q=>q.fl.length).sort((x,y)=>y.fl.length-x.fl.length),p=[t+kC(d)+chC(d),t+more(d)];
 p.push(...flow(t,[{title:'⚠️ دانش‌آموزان نیازمند توجه',head:atH,w:atW,none:atNone,rows:A.map(q=>({c:[esc2(q.s.name),chips(q.fl),pc(q.ap),f1(q.avg)],h:rH(q.s.name,q.fl,202,332)}))},
  {title:'👥 وضعیت دانش‌آموزان',head:stH,w:['25%','9%','6%','6%','10%','44%'],rows:d.rows.map(q=>({c:stR(q),h:rH(q.s.name,q.fl,180,318)}))}],800));
 for(let i=0;i<d.ex.length;i+=30)p.push(t+h3('📝 مقایسه‌ی آزمون‌ها')+exT(d,i,i+30));return p};
async function pdf(pg){await pdfLibs();try{await document.fonts.ready}catch(e){}const doc=new (window.jspdf?window.jspdf.jsPDF:MiniPDF)({unit:'mm',format:'a4'});
 for(let i=0;i<pg.length;i++){const el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:#fff;color:#222;direction:rtl;box-sizing:border-box;padding:28px 36px;overflow:hidden;'+F;el.innerHTML='<div style="width:722px;transform-origin:top right">'+pg[i]+'</div>'+ftr();document.body.appendChild(el);const fw=el.firstChild,hh=fw.offsetHeight;let sc=1;if(hh>900){sc=Math.max(.4,900/hh);fw.style.width=722/sc+'px';fw.style.transform='scale('+sc+')'}for(let g=0;g<8;g++){const v=fw.getBoundingClientRect().height;if(v<=900)break;sc=Math.max(.3,sc*900/v*.99);fw.style.width=722/sc+'px';fw.style.transform='scale('+sc+')'}{const vh=fw.getBoundingClientRect().height,sw=document.createElement('div');sw.className='sgw';sw.style.cssText='position:absolute;left:36px;right:36px;top:'+Math.round(28+vh+38)+'px';sw.innerHTML=window.sigRow();el.appendChild(sw)}const cv=await rast(el);el.remove();if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}return doc.output('arraybuffer')}
function __rh(row,W){var m=1,i=0;row.eachCell(function(c){var w=W[i++]||15,t=String(c.value==null?'':(c.value.richText?c.value.richText.map(function(x){return x.text}).join(''):c.value));var n=0;t.split(String.fromCharCode(10)).forEach(function(p){n+=Math.max(1,Math.ceil(p.length*1.15/w))});if(n>m)m=n});row.height=Math.max(20,m*16)}
async function xls(d){const wb=new ExcelLite.Workbook(),bd={style:'thin',color:{argb:'FFC9BDE6'}},B={top:bd,left:bd,bottom:bd,right:bd};
 const sh=(nm,h,rs,w)=>{const ws=wb.addWorksheet(nm,{views:[{rightToLeft:true,state:'frozen',ySplit:1}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0}});ws.columns=h.map((x,i)=>({width:(w&&w[i])||15}));ws.addRow(h);rs.forEach(r=>ws.addRow(r));ws.eachRow((row,ri)=>{__rh(row,h.map((x,i)=>(w&&w[i])||15));row.eachCell(c=>{c.border=B;c.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl',wrapText:true};c.font={name:'Tahoma',size:11,bold:ri===1,color:{argb:ri===1?'FFFFFFFF':'FF222222'}};if(ri===1)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}}})})};
 const ls=d.les.filter(x=>x.v!=null).sort((x,y)=>x.v-y.v);
 {const ws=wb.addWorksheet('گزارش یک‌برگه',{views:[{rightToLeft:true}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:1,margins:{left:.4,right:.4,top:.5,bottom:.5,header:.2,footer:.2}}});
 ws.columns=[20,12,12,12,12,12,28].map(w=>({width:w}));let r=0;const PF={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}},LF={type:'pattern',pattern:'solid',fgColor:{argb:'FFEFE6FB'}},ctr={horizontal:'center',vertical:'middle',readingOrder:'rtl',wrapText:true};
 const band=(t,big)=>{r++;ws.mergeCells(`A${r}:G${r}`);const c=ws.getCell(`A${r}`);c.value=t;c.font={name:'Tahoma',bold:true,size:big?15:11,color:{argb:big?'FF4B3478':'FFFFFFFF'}};if(!big)c.fill=PF;c.alignment=ctr};
 const tr=(v,hd)=>{r++;const row=ws.getRow(r);for(let i=0;i<7;i++)row.getCell(i+1).value=v[i]==null?'':v[i];row.eachCell({includeEmpty:true},c=>{c.border=B;c.alignment=ctr;c.font={name:'Tahoma',size:10,bold:!!hd};if(hd)c.fill=LF})};
 const gap=()=>{r++};
 band('گزارش عملکرد کلاس',1);band(sub(d.m)+' | '+profLine(),1);gap();
 tr(['دانش‌آموزان','میانگین کلاس (از ۴)','درصد حضور','مجموع غیبت','آزمون‌ها','روزهای ثبت‌شده',''],1);tr([S.students.length,r1(d.avg),r1(d.ap),d.ab,d.EX.length,d.dk.length,'']);gap();
 band('وضعیت دانش‌آموزان');tr(['نام','حضور٪','حاضر (با تأخیر)','غ','م','ت','میانگین','وضعیت'],1);d.rows.forEach(q=>tr([q.s.name,r1(q.ap),q.c.p+q.c.l,q.c.a,q.c.e,q.c.l,r1(q.avg),q.fl.join('، ')]));gap();
 band('روند ماهانه');tr(['ماه','حضور٪','میانگین کلاس'],1);d.mon.forEach(x=>tr([x.l,r1(x.ap),r1(x.av)]));gap();
 band('میانگین دروس و توزیع سطح نمرات');tr(['درس','میانگین','','سطح','تعداد'],1);for(let i=0;i<Math.max(d.les.length,4);i++){const L=d.les[i],V=d.lv[i];tr([L?L.l:'',L?r1(L.v):'','',V?V.l:'',V?V.v:''])}gap();
 band('مقایسه‌ی آزمون‌ها');tr(['تاریخ','درس','نوع','میانگین','کمترین','بیشترین','شرکت‌کننده'],1);d.ex.forEach(x=>tr([fmt(new Date(x.d+'T12:00:00Z')),x.c,x.t||'',r1(x.av),r1(x.lo),r1(x.hi),x.n]));
 if(d.weak){gap();band('ضعیف‌ترین آزمون: '+d.weak.c+' ('+fmt(new Date(d.weak.d+'T12:00:00Z'))+') با میانگین '+r1(d.weak.av))}}
 sh('دانش‌آموزان',['ردیف','نام','حضور٪','حاضر (با تأخیر)','غ','م','ت','میانگین',...S.courses.map(c=>c.name),'وضعیت'],d.rows.map((q,i)=>[i+1,q.s.name,r1(q.ap),q.c.p+q.c.l,q.c.a,q.c.e,q.c.l,r1(q.avg),...q.per.map(r1),q.fl.join('، ')]),[7,22]);
 sh('آزمون‌ها',['تاریخ','درس','نوع','میانگین','کمترین','بیشترین','شرکت‌کننده','جبرانی‌دادگان','منتظر جبرانی'],d.ex.map(x=>[fmt(new Date(x.d+'T12:00:00Z')),x.c,x.t||'',r1(x.av),r1(x.lo),r1(x.hi),x.n,x.mk,x.pd]));
 sh('روند ماهانه',['ماه','حضور٪','میانگین کلاس'],d.mon.map(x=>[x.l,r1(x.ap),r1(x.av)]));
 sh('نیازمند توجه',['نام','علت','حضور٪','میانگین'],d.rows.filter(q=>q.fl.length).map(q=>[q.s.name,q.fl.join('، '),r1(q.ap),r1(q.avg)]),[22,34,12,12]);
 sh('یادداشت‌ها',['دانش‌آموز','تاریخ','نوع','متن'],S.students.flatMap(s=>(S.notes[s.id]||[]).map(q=>[s.name,fmt(new Date(q.d+'T12:00:00Z')),(NTP[q.k]||NTP.n)[0],q.x])),[22,14,12,50]);
 return wb.xlsx.writeBuffer()}
function auto(d,sid){const r=d.rows.find(q=>q.s.id===sid);if(!r)return'';const nm=r.s.name.split(' ')[0],cs=S.courses,P=[],g=a=>a.join(' و ');
 const ap=r.ap;P.push(ap==null?'':ap>=95?nm+' در کلاس منظم و مرتب حاضر می‌شود.':ap>=85?'حضور '+nm+' در کلاس مناسب است.':'غیبت‌های '+nm+' نیاز به پیگیری با خانواده دارد.');
 const hi=cs.filter((c,i)=>r.per[i]>=3.5).map(c=>c.name),lo=cs.filter((c,i)=>r.per[i]!=null&&r.per[i]<2.5).map(c=>c.name),up=[],dn=[];
 if(hi.length)P.push('در '+g(hi)+' عملکرد بسیار خوبی دارد.');if(lo.length)P.push('در '+g(lo)+' به تمرین و حمایت بیشتر نیاز دارد.');
 cs.forEach(c=>{const v=d.EX.filter(e=>e.course===c.id).map(e=>nrm(e,sid)).filter(nn),n=v.length;if(n<2)return;const df=mean(v.slice(n-Math.ceil(n/2)))-mean(v.slice(0,n>>1));if(df>.25)up.push(c.name);if(df<-.25)dn.push(c.name)});
 if(up.length)P.push('در '+g(up)+' پیشرفت داشته است.');if(dn.length)P.push('در '+g(dn)+' نمره‌هایش کاهش یافته است.');
 if(d.EX.length&&d.EX.filter(e=>e.type==='پرسش و پاسخ کلاسی'&&nn(nrm(e,sid))).length<3)P.push('بهتر است در پرسش‌های کلاسی بیشتر مشارکت کند.');
 if(r.hw.n>=3)P.push('در انجام تکالیف باید دقت بیشتری داشته باشد.');else if(r.hw.d>=5&&!r.hw.n)P.push('تکالیفش را منظم انجام می‌دهد.');
 if(r.avg!=null)P.push('در مجموع در سطح «'+LVW[lvl(r.avg)]+'» قرار دارد.');return P.filter(Boolean).join(' ')}
function more(d){const st=S.students,A=S.att,ty=['پرسش و پاسخ کلاسی','آزمون کتبی'];
 const wk=[0,1,2,3,4].map(i=>{let a=0,t=0;d.dk.forEach(k=>{if((new Date(k+'T12:00:00Z').getUTCDay()+1)%7!==i)return;st.forEach(s=>{const x=A[k][s.id];if(x){t++;if(x==='a')a++}})});return{l:WN[i],v:t?a/t*100:null}});
 const tv=(c,t)=>mean(d.EX.filter(e=>e.type===t&&(c==null||e.course===c)).flatMap(e=>st.map(s=>nrm(e,s.id))).filter(nn));
 const rk=d.rows.filter(q=>q.avg!=null).sort((x,y)=>y.avg-x.avg),top=rk.slice(0,5),low=rk.slice(-5).reverse(),mv=d.rows.filter(q=>q.dr).sort((x,y)=>y.dr-x.dr);
 const bn=a=>a.map(q=>({l:q.s.name,v:q.avg})),oc=d.rows.map(q=>({q,n:d.EX.filter(e=>e.type===ty[0]&&nn(nrm(e,q.s.id))).length})).sort((x,y)=>x.n-y.n);
 const perf=d.rows.filter(q=>d.dk.length&&q.c.a===0),hist=[4,3,2,1].map(k=>({l:LVW[k],v:d.rows.filter(q=>q.avg!=null&&lvl(q.avg)===k).length,c:LVC[k]}));
 const mx=a=>Math.max(1,...a.map(x=>x.v||0)),cp=(a,c)=>a.length?a.map(q=>`<span style="background:${c};border-radius:10px;padding:2px 8px;font-size:12px;margin-left:4px;display:inline-block">${esc2(q.s.name)}</span>`).join(''):'—';
 const ab=d.mon.map(x=>({l:x.l,v:x.ab}));
 return h3('🔍 تحلیل‌های بیشتر')+gr(box('📆 درصد غیبت بر حسب روز هفته',bars(wk,Math.max(10,mx(wk)),v=>fa(Math.round(v))+'٪'))+box('🚫 تعداد غیبت در هر ماه',bars(ab,mx(ab),fa))+box('🗣️ پرسش کلاسی در برابر ✍️ کتبی',bars([{l:'پرسش کلاسی',v:tv(null,ty[0])},{l:'آزمون کتبی',v:tv(null,ty[1])}],4,f1,col))+box('📊 توزیع میانگین دانش‌آموزان',bars(hist,mx(hist),fa))+box('🏆 ۵ دانش‌آموز برتر',bars(bn(top),4,f1,col))+box('🤝 ۵ دانش‌آموز نیازمند حمایت',bars(bn(low),4,f1,col)))
 +h3('🗣️✍️ مقایسه‌ی پرسش کلاسی و آزمون کتبی در هر درس')+tbl(['درس','پرسش کلاسی','آزمون کتبی','تفاوت'],S.courses.map(c=>{const a=tv(c.id,ty[0]),b=tv(c.id,ty[1]);return[esc2(c.name),f1(a),f1(b),a!=null&&b!=null?fa((b-a>0?'+':'')+(b-a).toFixed(1)):'—']}))
 +h3('📈 بیشترین پیشرفت')+cp(mv.filter(q=>q.dr>0).slice(0,3),'#e3f5ea')+h3('📉 بیشترین افت')+cp(mv.filter(q=>q.dr<0).slice(-3).reverse(),'#fde8ea')
 +h3('🎖️ بدون غیبت در این بازه ('+fa(perf.length)+' نفر)')+cp(perf,'#e3f5ea')
 +h3('🙋 کمترین مشارکت در پرسش کلاسی')+tbl(['نام','تعداد پرسش پاسخ‌داده‌شده'],oc.slice(0,5).map(x=>[esc2(x.q.s.name),fa(x.n)]))}
const trendV=v=>{const n=v.length;if(n<2)return'—';const df=mean(v.slice(n-Math.ceil(n/2)))-mean(v.slice(0,n>>1)),m=mean(v);return df>.25?'📈 پیشرفت':df<-.25?'📉 پسرفت':m>=3.5?'🌟 عالی و پایدار':'➖ ثابت در سطح «'+LVW[lvl(m)]+'»'};
function hwData(ov){const o=ov?'x':$('hp').value,t=tdy(),r=rangeY(),[i1,i2]=rI();let a=iso(r.a),b=iso(r.b),lbl='کل سال تحصیلی '+syLab(SY);
 if(o==='w'){const s0=addD(t,-((t.getUTCDay()+1)%7));a=iso(s0);b=iso(addD(s0,6));lbl='هفته‌ی جاری ('+fmt(s0)+' تا '+fmt(addD(s0,6))+')'}
 else if(o==='m'){const q=jp(t),f=fromJ(q.y,q.m,1),n=monthDays(f);a=iso(f);b=iso(n[n.length-1]);lbl='ماه '+MN[q.m-1]+' '+fa(q.y)}else if(o==='r')lbl=sub();else if(o==='k'){const A=new Date(($('hkw').value||iso(tdy()))+'T12:00:00Z'),B=addD(A,6);a=iso(A);b=iso(B);lbl='هفته‌ی '+fmt(A)+' تا '+fmt(B)}else if(o==='d'){const g=(m,d)=>{const y=m>=7?SY:SY+1;return fromJ(y,m,Math.min(d,monthDays(fromJ(y,m,1)).length))};let A=g(+$('hd1m').value,+$('hd1d').value),B=g(+$('hd2m').value,+$('hd2d').value);if(A>B){const t=A;A=B;B=t}a=iso(A);b=iso(B);lbl='از '+fmt(A)+' تا '+fmt(B)}else if(ov){a=ov.a;b=ov.b;lbl=ov.lbl}
 const rg=k=>k>=a&&k<=b&&(o!=='r'||(i=>i>=i1&&i<=i2)(SM.indexOf(jp(new Date(k+'T12:00:00Z')).m)));
 const L=(S.hwl||[]).filter(h=>rg(h.date)).sort((x,y)=>x.date.localeCompare(y.date)),st=S.students,cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'عمومی';
 const pct=h=>{let d=0,n=0;st.forEach(s=>{const x=h.st[s.id];if(x){n++;d+=x==='d'?1:x==='p'?.5:0}});return n?d/n*100:null};
 const rows=st.map(s=>{const c={d:0,p:0,n:0};L.forEach(h=>{if(h.st[s.id])c[h.st[s.id]]++});const n=c.d+c.p+c.n;return{s,c,pc:n?(c.d+c.p/2)/n*100:null}});
 const byC=[...new Set(L.map(h=>h.course))].map(id=>({l:cn(id),n:L.filter(h=>h.course===id).length,v:mean(L.filter(h=>h.course===id).map(pct).filter(nn))}));
 return{lbl,L,rows,byC,pct,cn,all:mean(L.map(pct).filter(nn))}}
const hwLate=d=>{const R=[];d.L.forEach(h=>{S.students.forEach(s=>{const l=h.ld&&h.ld[s.id];if(l)R.push({s,h,l,x:h.st[s.id]||'',ab:((S.att[h.date]||{})[s.id])==='a'})})});return R},HXN={d:'کامل',p:'ناقص',n:'انجام‌نشده','':'—'},hwLd=l=>fmt(new Date(l+'T12:00:00Z'));
const nmS=()=>{const x=S.students.find(q=>q.id===+$('ms').value);return x?x.name.trim().replace(/\s+/g,'-'):'دانش‌آموز'};
const stSheets=(d,sid)=>{const r=d.rows.find(q=>q.s.id===sid),cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'',E=d.EX.filter(e=>nn(nrm(e,sid))),sd=x=>fmt(new Date(x+'T12:00:00Z'));
 return[['خلاصه',['شاخص','مقدار'],[['نام',r.s.name],['ارزشیابی توصیفی',(S.desc&&S.desc[sid])||(window.genDesc?window.genDesc(sid):'')],['مباحث نیازمند تمرین',window.weakTxt?window.weakTxt(sid):''],['بازه',sub()],['درصد حضور',r1(r.ap)],['حاضر (شامل تأخیر)',r.c.p+r.c.l],['غایب',r.c.a],['غایب موجه',r.c.e],['تأخیر',r.c.l],['میانگین کل (از ۴)',r1(r.avg)+(window.__pct?window.__pct(r.avg):'')],['تکالیف کامل / ناقص / انجام‌نشده',r.hw.d+' / '+r.hw.p+' / '+r.hw.n],['ارزشیابی توصیفی',(S.desc&&S.desc[sid])||auto(d,sid)]],[28,70]],
 ['درس‌ها',['درس','تعداد آزمون','مستمر (طول نیمسال)','پایان نیمسال اول','پایان نیمسال دوم','میانگین کل','سطح','روند / ارزشیابی توصیفی'],S.courses.map((c,i)=>{const sk=c.name==='هنر'?'art':c.name==='تربیت بدنی'?'pe':null;if(sk){const L=window.skillLevel?window.skillLevel(sid,sk):null,t=window.skillDesc?window.skillDesc(sid,sk):'';return[c.name,'—','—','—','—','—',L?LVW[L]:'—',t||'ارزشیابی توصیفی ثبت نشده']}const ex=d.EX.filter(e=>e.course===c.id),g=fn=>{const a=ex.filter(e=>fn(e.type)).map(e=>nrm(e,sid)).filter(nn);return a.length?r1(mean(a)):'—'},v=ex.map(e=>nrm(e,sid)).filter(nn);return[c.name,v.length,g(t=>t!=='آزمون پایان نیمسال اول'&&t!=='آزمون پایان نیمسال دوم'),g(t=>t==='آزمون پایان نیمسال اول'),g(t=>t==='آزمون پایان نیمسال دوم'),v.length?r1(r.per[i]):'—',v.length?LVW[Math.min(4,Math.max(1,Math.round(mean(v))))]:'—',v.length?trendV(v):'—']}),[16,10,13,13,13,11,13,40]],
 ['آزمون‌ها',['تاریخ','درس','نوع','نمره'],E.map(e=>[sd(e.date),cn(e.course),e.type||'',nrm(e,sid)]),[16,16,22,10]],
 ['تکالیف',['تاریخ','درس','تکلیف','وضعیت','تحویل با تأخیر'],S.hwl.filter(h=>h.st[sid]).map(h=>[sd(h.date),cn(h.course),h.title,{d:'کامل',p:'ناقص',n:'انجام‌نشده'}[h.st[sid]],h.ld&&h.ld[sid]?sd(h.ld[sid]):'']),[16,16,30,14,16]]]};
const hwT=(d,a,b)=>tbl(['تاریخ','درس','تکلیف','درصد انجام'],d.L.slice(a,b).map(h=>[fmt(new Date(h.date+'T12:00:00Z')),esc2(d.cn(h.course)),esc2(h.title),pc(d.pct(h))]));
const hwB=(d,lst)=>!d.L.length?'<div style="text-align:center;color:#888;font-size:13px">تکلیفی در این بازه ثبت نشده است</div>':kp([['تکالیف ثبت‌شده',fa(d.L.length)],['درصد انجام کلاس',pc(d.all)],['تعداد درس‌ها',fa(d.byC.length)]])+gr(box('📊 درصد انجام تکلیف هر درس',bars(d.byC.map(x=>({l:x.l,v:x.v})),100,v=>fa(Math.round(v)),apc))+box('⚠️ کمترین درصد انجام تکلیف',bars(d.rows.filter(q=>q.pc!=null).sort((x,y)=>x.pc-y.pc).slice(0,5).map(q=>({l:q.s.name,v:q.pc})),100,v=>fa(Math.round(v)),apc)))+h3('📚 به‌تفکیک درس')+tbl(['درس','تعداد تکلیف','درصد انجام'],d.byC.map(x=>[esc2(x.l),fa(x.n),pc(x.v)]))+h3('👥 وضعیت دانش‌آموزان')+tbl(['نام','✅ کامل','🟡 ناقص','❌ انجام‌نشده','درصد'],d.rows.map(q=>[esc2(q.s.name),fa(q.c.d),fa(q.c.p),fa(q.c.n),pc(q.pc)]))+(hwLate(d).length?h3('⏰ تحویل با تأخیر (پس از غیبت)')+tbl(['نام','درس','تکلیف','تاریخ تکلیف','تاریخ تحویل','وضعیت'],hwLate(d).map(r=>[esc2(r.s.name),esc2(d.cn(r.h.course)),esc2(r.h.title),fmt(new Date(r.h.date+'T12:00:00Z')),hwLd(r.l),HXN[r.x]])):'')+(lst?h3('📝 فهرست تکالیف')+hwT(d,0,9999):'');
function hkW(){const m=+$('hk1m').value,y=m>=7?SY:SY+1,f=fromJ(y,m,1),n=monthDays(f),t=iso(tdy());let s0=addD(f,-((f.getUTCDay()+1)%7)),i=0,h='',sel='';const l=n[n.length-1];while(s0<=l){const e=addD(s0,6),k=iso(s0);i++;h+=`<option value="${k}">هفته‌ی ${fa(i)}: ${fmt(s0).slice(5)} تا ${fmt(e).slice(5)}</option>`;if(t>=k&&t<=iso(e))sel=k;s0=addD(s0,7)}$('hkw').innerHTML=h;if(sel)$('hkw').value=sel}
function hdI(){const a=$('hd1m');if(!a||a.options.length)return;{const p=jp(tdy()),m0=SM.indexOf(p.m)>=0?p.m:7;$('hk1m').innerHTML=SM.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');$('hk1m').value=m0;hkW();$('hk1m').onchange=()=>{hkW();render()};$('hkw').onchange=render}const o=SM.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join(''),dd=Array.from({length:31},(_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join(''),p=jp(tdy()),m0=SM.indexOf(p.m)>=0?p.m:7;['hd1m','hd2m'].forEach(k=>{$(k).innerHTML=o;$(k).value=m0});['hd1d','hd2d'].forEach(k=>$(k).innerHTML=dd);$('hd1d').value=1;$('hd2d').value=p.d;document.querySelectorAll('#hdw select').forEach(x=>x.onchange=render)}
const HS={d:['✓','#d8f3e3','#1a8f55'],p:['½','#fff1cf','#b26a00'],n:['✗','#fde1e3','#c0262c']},HLEG='✓ کامل | ½ ناقص | ✗ انجام‌نشده | · ثبت‌نشده (یا غایب و هنوز تحویل نداده) | ⏰ تحویل با تأخیر پس از غیبت';
const hwGrid=(d,a,b,r0,r1)=>{const C=d.L.slice(a,b),w=Math.floor(68/Math.max(C.length,1));return fx(['نام',...C.map(h=>`<div style="font-size:10px;line-height:1.3">${fmt(new Date(h.date+'T12:00:00Z')).slice(5)}<br><span style="font-weight:400;font-size:9px">${esc2(d.cn(h.course))}</span></div>`),'درصد'],d.rows.slice(r0,r1).map(q=>[esc2(q.s.name),...C.map(h=>{const z=HS[h.st[q.s.id]],lt=h.ld&&h.ld[q.s.id];return z?`<span style="display:block;background:${z[1]};color:${z[2]};font-weight:800;border-radius:4px">${z[0]}${lt?'<small style="font-size:8px"> ⏰</small>':''}</span>`:'·'}),q.pc==null?'—':pc(q.pc)]),['24%',...C.map(()=>w+'%'),'8%'])};
const hwScr=d=>d.L.length?h3('✅ جدول تکالیف همه‌ی دانش‌آموزان')+`<div style="overflow-x:auto"><div style="min-width:${d.L.length*48+190}px">${hwGrid(d,0,d.L.length,0,d.rows.length)}</div></div><div style="font-size:11px;color:#777;margin-top:4px">${HLEG}</div>`:'';
const hwPages=d=>{const t=hdr('گزارش تکالیف دانش‌آموزان',d.lbl),p=[t+hwB(d)],cc=10,rc=26,nc=Math.ceil(d.L.length/cc),nr=Math.ceil(d.rows.length/rc);for(let c=0;c<nc;c++)for(let r=0;r<nr;r++)p.push(t+h3('✅ جدول تکالیف همه‌ی دانش‌آموزان'+(nc*nr>1?' (بخش '+fa(c*nr+r+1)+' از '+fa(nc*nr)+')':''))+hwGrid(d,c*cc,(c+1)*cc,r*rc,(r+1)*rc)+`<div style="font-size:11px;color:#777;margin-top:6px">${HLEG}</div>`);for(let i=0;i<d.L.length;i+=34)p.push(t+h3('📝 فهرست تکالیف')+hwT(d,i,i+34));return p};
window.hwExp=async(k,a,b,lbl,nm)=>{const d=hwData({a,b,lbl});await dl('گزارش-تکالیف-'+nm+(k==='x'?'.xlsx':'.pdf'),k==='x'?await xwb(hwSheets(d)):await pdf(hwPages(d)))};
const hwSheets=d=>[['خلاصه',['شاخص','مقدار'],[['بازه',d.lbl],['تعداد تکلیف',d.L.length],['درصد انجام کلاس',r1(d.all)]],[22,44]],['دانش‌آموزان',['نام','کامل','ناقص','انجام‌نشده','درصد'],d.rows.map(q=>[q.s.name,q.c.d,q.c.p,q.c.n,r1(q.pc)]),[24]],['درس‌ها',['درس','تعداد تکلیف','درصد انجام'],d.byC.map(x=>[x.l,x.n,r1(x.v)])],['فهرست تکالیف',['تاریخ','درس','تکلیف','درصد انجام'],d.L.map(h=>[fmt(new Date(h.date+'T12:00:00Z')),d.cn(h.course),h.title,r1(d.pct(h))]),[16,16,34,16]],['جدول تکالیف',['نام',...d.L.map(h=>fmt(new Date(h.date+'T12:00:00Z'))+' '+d.cn(h.course)+': '+h.title),'درصد'],d.rows.map(q=>[q.s.name,...d.L.map(h=>({d:'کامل',p:'ناقص',n:'انجام‌نشده'}[h.st[q.s.id]]||'')+(h.ld&&h.ld[q.s.id]&&h.st[q.s.id]?' ⏰':'')),r1(q.pc)]),[24,...d.L.map(()=>13),10],v=>({'کامل':['FFD8F3E3','FF1A8F55'],'ناقص':['FFFFF1CF','FFB26A00'],'انجام‌نشده':['FFFDE1E3','FFC0262C']}[String(v).replace(' ⏰','')])]].concat(hwLate(d).length?[['تحویل با تأخیر',['نام','درس','تکلیف','تاریخ تکلیف','تاریخ تحویل','وضعیت'],hwLate(d).map(r=>[r.s.name,d.cn(r.h.course),r.h.title,hwLd(r.h.date),hwLd(r.l),HXN[r.x]]),[24,16,30,16,16,14]]]:[]);
async function xwb(sh){const wb=new ExcelLite.Workbook(),bd={style:'thin',color:{argb:'FFC9BDE6'}},B={top:bd,left:bd,bottom:bd,right:bd};sh.forEach(([nm,h,rs,w,cs])=>{const ws=wb.addWorksheet(nm,{views:[Object.assign({rightToLeft:true,state:'frozen',ySplit:1},cs?{xSplit:1}:{})],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0}});ws.columns=h.map((x,i)=>({width:(w&&w[i])||16}));ws.addRow(h);rs.forEach(r=>ws.addRow(r));ws.eachRow((row,ri)=>{__rh(row,h.map((x,i)=>(w&&w[i])||16));row.eachCell(c=>{c.border=B;c.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl',wrapText:true};c.font={name:'Tahoma',size:11,bold:ri===1,color:{argb:ri===1?'FFFFFFFF':'FF222222'}};if(ri===1)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}};const z=cs&&ri>1&&cs(c.value);if(z){c.fill={type:'pattern',pattern:'solid',fgColor:{argb:z[0]}};c.font={name:'Tahoma',size:11,bold:true,color:{argb:z[1]}}}})})});return wb.xlsx.writeBuffer()}
let rpK='o';
const RP_CSS=`
.rpPv{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:#fff;margin-bottom:12px}
.rpSc{width:794px;height:1123px;margin:0 auto}
.rpseg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.rpseg button{border:2px solid var(--p);background:var(--card);color:var(--p);border-radius:14px;padding:12px 6px;font:800 14px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.rpseg button.on{background:linear-gradient(90deg,var(--p),var(--p2));color:#fff}
.rpact{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#rpPrintRoot{position:fixed;left:-99999px;top:0}
.rpA4{box-sizing:border-box;width:794px;height:1123px;overflow:hidden;position:relative;background:#fff;color:#2a2238;direction:rtl;text-align:right;font:400 12px/1.45 Vazirmatn,Tahoma,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rpA4 *{box-sizing:border-box}
.rpA4 .in{min-height:1123px;padding:2.2em 2.5em 1.5em;display:flex;flex-direction:column;gap:.45em}
.rpA4 .push{margin-top:auto}
.rpA4 .sgrow{gap:30px!important}
.rpA4 .sgrow>div>div:last-child{height:36px!important}
.rpA4 .sgrow img{height:34px!important;max-height:34px!important}
.rpA4 .stamp{text-align:center;font-weight:700;font-size:.95em;color:#333}
.rpA4 .nt{font-size:.8em;color:#6b5f84;line-height:1.6}
.rpA4 .rlv{font-weight:800;white-space:nowrap}
.rpA4 .o-head{display:flex;align-items:center;gap:1em;border-bottom:.2em solid #7e57c2;padding-bottom:.55em}
.rpA4 .o-head .t{flex:1;text-align:center}
.rpA4 .o-head .ti{font-size:1.7em;font-weight:800;color:#4b3478;line-height:1.3}
.rpA4 .o-head .s{font-size:1.02em;color:#555}
.rpA4 .o-lg{width:7.5em;text-align:center}.rpA4 .o-lg img{width:3.6em;height:3.6em;object-fit:contain}.rpA4 .o-lg b{display:block;font-size:.78em;color:#4b3478;line-height:1.3}
.rpA4 .o-sp{width:7.5em}
.rpA4 .o-info{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #cfc3e6;border-radius:.5em;overflow:hidden}
.rpA4 .o-info div{padding:.25em .6em;border-left:1px solid #e3d9f3;border-bottom:1px solid #e3d9f3;font-size:.92em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rpA4 .o-info span{color:#7a6c94;margin-left:.35em}
.rpA4 .o-kpi{display:grid;grid-template-columns:repeat(7,1fr);gap:.4em}
.rpA4 .o-kpi div{border:1px solid #d9cdee;background:#f7f3fd;border-radius:.5em;padding:.2em .15em;text-align:center}
.rpA4 .o-kpi b{display:block;font-size:1.35em;color:#4b3478;line-height:1.2}
.rpA4 .o-kpi span{display:block;font-size:.8em;color:#665a80;line-height:1.25}
.rpA4 .o-dc{display:flex;align-items:center;gap:.9em;border:1px solid #d9cdee;border-radius:.5em;padding:.2em .7em;font-size:.95em}
.rpA4 .o-dc .bar{flex:1;height:.85em;display:flex;border-radius:1em;overflow:hidden;background:#eee}
.rpA4 .o-dc .bar i{display:block;height:100%}
.rpA4 .o-rowA{display:grid;grid-template-columns:repeat(4,1fr);gap:.5em}
.rpA4 .o-p{border:1px solid #d9cdee;border-radius:.5em;padding:.35em .5em;min-width:0}
.rpA4 .o-p>b{display:block;font-size:.95em;color:#4b3478;margin-bottom:.1em}
.rpA4 .o-h{font-weight:800;font-size:1.08em;color:#4b3478;border-right:.3em solid #7e57c2;padding-right:.5em}
.rpA4 .o-t{width:100%;border-collapse:collapse;table-layout:fixed;font-size:.92em}
.rpA4 .o-t th{background:#ece4f8;color:#3b2a55;border:1px solid #c9bde4;padding:.2em .1em;font-weight:800;text-align:center}
.rpA4 .o-t td{border:1px solid #ddd3ee;padding:.08em .2em;text-align:center;white-space:nowrap;line-height:1.35}.rpA4 .o-t td.n{white-space:normal;overflow-wrap:break-word}
.rpA4 .o-t td.n{text-align:right}
.rpA4 .o-t tr:nth-child(even) td{background:#fbf9fe}
.rpA4 .o-t tr.hi td{background:#fde8ea}
.rpA4 .o-two{display:flex;gap:.5em;align-items:flex-start}.rpA4 .o-two>div{flex:1;min-width:0}
.rpA4 .o-sum{border:1px solid #d9cdee;border-radius:.5em;background:#faf7ff;padding:.45em .8em;line-height:1.85}
.rpA4 .o-ft{border-top:1px solid #d9cdee;padding-top:.35em}
.rpA4 .hb{display:flex;align-items:center;gap:.4em;font-size:.88em;margin:.2em 0}
.rpA4 .hb i{flex:0 0 40%;font-style:normal;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.rpA4 .hb u{flex:1;height:.7em;background:#ece7f5;border-radius:1em;overflow:hidden;display:block;text-decoration:none}
.rpA4 .hb u s{display:block;height:100%;border-radius:1em;text-decoration:none}
.rpA4 .hb em{flex:0 0 2.1em;font-style:normal;font-weight:800;text-align:left}
.rpA4.g{background:#fbf9ff}
.rpA4 .g-head{background:linear-gradient(115deg,#5f3fa6,#8f68cf);color:#fff;border-radius:1em;padding:.8em 1.1em;display:flex;align-items:center;gap:1em}
.rpA4 .g-head .t{flex:1;text-align:center}
.rpA4 .g-head .ti{font-size:1.85em;font-weight:800;line-height:1.3}
.rpA4 .g-pill{display:inline-block;background:#ffffff2e;border:1px solid #ffffff55;border-radius:2em;padding:.12em 1em;margin-top:.25em;font-size:.95em}
.rpA4 .g-lg{width:7em;text-align:center}.rpA4 .g-lg img{width:4.4em;height:4.4em;object-fit:contain;background:#fff;border-radius:50%;padding:.2em}.rpA4 .g-lg b{display:block;font-size:.75em;line-height:1.3;margin-top:.15em}
.rpA4 .g-info{width:14em;font-size:.88em;line-height:1.7;background:#ffffff1f;border-radius:.7em;padding:.35em .7em}
.rpA4 .g-info span{opacity:.8;margin-left:.3em}
.rpA4 .g-kpi{display:grid;grid-template-columns:repeat(6,1fr);gap:.5em}
.rpA4 .g-k{background:#fff;border:1px solid #e3d9f3;border-top:.3em solid var(--c);border-radius:.8em;padding:.4em .2em;text-align:center}
.rpA4 .g-k b{display:block;font-size:1.9em;color:var(--c);line-height:1.2}
.rpA4 .g-k span{display:block;font-size:.82em;color:#5d5073;line-height:1.3}
.rpA4 .g-row{display:flex;gap:.55em;align-items:stretch}
.rpA4 .g-p{background:#fff;border:1px solid #e3d9f3;border-radius:.9em;padding:.5em .65em;min-width:0}
.rpA4 .g-p>.gt{font-weight:800;color:#4b3478;font-size:1em;margin-bottom:.2em;display:flex;align-items:center;gap:.4em}
.rpA4 .g-p>.gt:before{content:"";width:.4em;height:1em;border-radius:.3em;background:var(--c,#7e57c2)}
.rpA4 .g-dn{display:flex;align-items:center;gap:.6em}.rpA4 .g-dn svg{width:8.2em;flex:0 0 8.2em}
.rpA4 .g-lg2{flex:1;font-size:.95em;line-height:2}.rpA4 .g-lg2 i{display:inline-block;width:.8em;height:.8em;border-radius:50%;margin-left:.4em;vertical-align:middle}
.rpA4 .g-ar{display:flex;gap:.5em;align-items:center;border-bottom:1px dashed #eadff7;padding:.22em 0;font-size:.92em}
.rpA4 .g-ar:last-child{border:0}
.rpA4 .g-ar b{flex:0 0 28%}.rpA4 .g-ar em{font-style:normal;font-weight:800;flex:0 0 2.2em;text-align:center}.rpA4 .g-ar span{flex:1;color:#8a2a2f;font-size:.92em}
.rpA4 .g-sr{display:flex;gap:.8em}.rpA4 .g-sr>div{flex:1;min-width:0}
.rpA4 .g-st{display:flex;align-items:center;gap:.4em;font-size:.88em;padding:.12em 0;border-bottom:1px solid #f1ebf9}
.rpA4 .g-st b{flex:0 0 44%;font-weight:700;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.rpA4 .g-st u{flex:1;height:.6em;background:#ece7f5;border-radius:1em;overflow:hidden;display:block;text-decoration:none}
.rpA4 .g-st u s{display:block;height:100%;border-radius:1em;text-decoration:none}
.rpA4 .g-st em{flex:0 0 1.9em;font-style:normal;font-weight:800;text-align:left}
.rpA4 .g-pl{flex:0 0 5.2em;white-space:nowrap;text-align:center;border-radius:2em;padding:0 .3em;font-size:.86em;font-weight:800;color:#fff}
.rpA4 .g-sum{background:linear-gradient(120deg,#f1eafc,#fdf3e0);border:1px solid #e3d9f3;border-radius:.9em;padding:.55em .9em;line-height:1.85}
@media print{
 @page{size:A4;margin:0}
 html,body{background:#fff!important;margin:0!important;padding:0!important;min-height:0!important}
 body.rp-printing>*:not(#rpPrintRoot){display:none!important}
 body.rp-printing #rpPrintRoot{position:static!important;left:auto!important;display:block!important}
 body.rp-printing .rpA4{break-inside:avoid;break-after:avoid;page-break-after:avoid}
}`;
(function(){if(!document.getElementById('rpCss')){const s=document.createElement('style');s.id='rpCss';s.textContent=RP_CSS;document.head.appendChild(s)}})();
const rpLvC=v=>v==null?'#999':LVC[lvl(v)];
const rpSug={'غیبت زیاد':'پیگیری علت غیبت با خانواده','تأخیر زیاد':'گفت‌وگو درباره‌ی وقت‌شناسی','میانگین پایین':'تقویت درسی و تمرین بیشتر','افت نمره':'بررسی علت افت و مرور مباحث','تکلیف انجام‌نشده':'پیگیری انجام تکالیف','آزمون جبرانی باقی‌مانده':'برگزاری آزمون جبرانی'};
const rpDN={g:'خوب',m:'متوسط',w:'ضعیف'},rpDC={g:'#1a8f55',m:'#d98600',w:'#d12f35'};
const rpStamp=()=>{const n=new Date(),p=jp(tdy());return 'تاریخ چاپ: '+fa(p.d)+' '+MN[p.m-1]+' '+fa(p.y)+' | ساعت '+fa(z2(n.getHours()))+':'+fa(z2(n.getMinutes()))};
const rpSd=d=>{const p=jp(new Date(d+'T12:00:00Z'));return fa(z2(p.m))+'/'+fa(z2(p.d))};
const rpSvg=(w,h,x)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;direction:ltr;font-family:Vazirmatn,Tahoma,sans-serif">${x}</svg>`;
function rpModel(d,cap){
 const R=d.rows,n=R.length,dsc=q=>q.ap==null?null:(q.fl.includes('غیبت زیاد')||q.fl.includes('تأخیر زیاد'))?'w':(q.ap>=90&&q.c.l<2)?'g':'m';
 const rows=R.map((q,i)=>({i:i+1,name:q.s.name,avg:q.avg,lv:q.avg==null?null:lvl(q.avg),ap:q.ap,a:q.c.a,l:q.c.l,dc:dsc(q),fl:q.fl}));
 const att=rows.filter(r=>r.fl.length).sort((x,y)=>y.fl.length-x.fl.length||(x.avg==null?9:x.avg)-(y.avg==null?9:y.avg));
 const dcn={g:0,m:0,w:0};rows.forEach(r=>{if(r.dc)dcn[r.dc]++});
 const ok=rows.filter(r=>r.avg!=null&&!r.fl.length).length,ms=d.mon.filter(x=>x.av!=null),delta=ms.length>=2?ms[ms.length-1].av-ms[0].av:null;
 const exAll=d.ex,exS=exAll.slice(-((cap&&cap.ex)||8));
 const fc={};att.forEach(r=>r.fl.forEach(f=>fc[f]=(fc[f]||0)+1));const top=Object.keys(fc).sort((a,b)=>fc[b]-fc[a])[0];
 const P=[];
 if(d.avg!=null)P.push('میانگین کلاس '+f1(d.avg)+' از ۴ ('+LVW[lvl(d.avg)]+') است');
 if(d.ap!=null)P.push('میانگین حضور '+pc(d.ap)+' و مجموع غیبت‌ها '+fa(d.ab)+' مورد بوده است');
 if(delta!=null)P.push(Math.abs(delta)<.15?'روند میانگین ماهانه تقریباً ثابت بوده است':delta>0?'روند میانگین ماهانه صعودی بوده است (از '+f1(ms[0].av)+' به '+f1(ms[ms.length-1].av)+')':'روند میانگین ماهانه نزولی بوده است (از '+f1(ms[0].av)+' به '+f1(ms[ms.length-1].av)+') و نیازمند توجه است');
 P[P.length-1]&&(P[P.length-1]+='.');
 let s=P.map((x,i)=>i<P.length-1?x+'.':x).join(' ');
 if(n)s+=' '+fa(ok)+' نفر از '+fa(n)+' دانش‌آموز عملکرد مطلوب دارند و '+fa(att.length)+' نفر نیازمند توجه‌اند'+(top?' (شایع‌ترین علت: '+top+')':'')+'.';
 if(d.weak)s+=' ضعیف‌ترین آزمون، '+d.weak.c+' ('+rpSd(d.weak.d)+') با میانگین '+f1(d.weak.av)+' بوده است.';
 return{rows,att,dcn,ok,delta,exAll,exS,text:s.replace(/\.\./g,'.').trim(),n,sub:sub(),stamp:rpStamp()};
}
const rpGrid=(W,H,pt,pb,ax,mx,ticks,tf)=>{const ph=H-pt-pb,y=v=>pt+ph-(v/mx)*ph;return ticks.map(t=>`<line x1="4" x2="${W-ax}" y1="${y(t)}" y2="${y(t)}" stroke="#e8e0f4"/><text x="${W-2}" y="${y(t)+3}" font-size="8.5" text-anchor="end" fill="#8a7aa6">${tf?tf(t):fa(t)}</text>`).join('')};
function rpBars(it,o){const W=o.W,H=o.H,mx=o.max||1,pt=14,pb=16,ax=24,pw=W-ax-4,ph=H-pt-pb,n=Math.max(1,it.length),st=pw/n,bw=Math.min(o.bw||30,st*.64),y=v=>pt+ph-(v/mx)*ph;
 let s=rpGrid(W,H,pt,pb,ax,mx,o.ticks||(mx<=4?[0,1,2,3,4].filter(t=>t<=mx):[0,mx]),o.tf);
 it.forEach((q,i)=>{const cx=W-ax-(i+.5)*st,v=q.v==null?0:q.v;s+=`<rect x="${cx-bw/2}" y="${y(v)}" width="${bw}" height="${v/mx*ph}" rx="3" fill="${q.c}"/><text x="${cx}" y="${y(v)-3}" font-size="${o.vf||10}" font-weight="700" text-anchor="middle" fill="#333">${q.v==null?'—':(o.fmt||f1)(q.v)}</text><text x="${cx}" y="${H-4}" font-size="${o.lf||9}" text-anchor="middle" fill="#555">${esc2(q.l)}</text>`});
 return rpSvg(W,H,s)}
function rpLine(it,o){const W=o.W,H=o.H,mx=o.max,pt=16,pb=16,ax=24,R=W-ax-14,Lf=14,n=it.length,x=i=>n<2?(R+Lf)/2:R-i*(R-Lf)/(n-1),y=v=>pt+(H-pt-pb)-(v/mx)*(H-pt-pb),sh=n>5||(R-Lf)/Math.max(1,n-1)<42;
 const pts=it.map((q,i)=>q.v==null?null:[x(i),y(q.v),q.v]).filter(Boolean);let s=rpGrid(W,H,pt,pb,ax,mx,o.ticks||[0,1,2,3,4]);
 if(pts.length>1)s+=`<polygon points="${pts.map(p=>p[0]+','+p[1]).join(' ')} ${pts[pts.length-1][0]},${H-pb} ${pts[0][0]},${H-pb}" fill="${o.c}22"/><polyline points="${pts.map(p=>p[0]+','+p[1]).join(' ')}" fill="none" stroke="${o.c}" stroke-width="2.4" stroke-linejoin="round"/>`;
 pts.forEach(p=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="${o.c}" stroke="#fff" stroke-width="1.2"/><text x="${p[0]}" y="${p[1]-7}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#333">${f1(p[2])}</text>`});
 it.forEach((q,i)=>{s+=`<text x="${x(i)}" y="${H-4}" font-size="9" text-anchor="middle" fill="#555">${esc2(sh?q.l.slice(0,3):q.l)}</text>`});
 return rpSvg(W,H,s)}
function rpDonut(parts,sz,ctr){const r=sz*.36,sw=sz*.17,C=2*Math.PI*r,tot=parts.reduce((a,p)=>a+p.v,0),c=sz/2;let off=0,s=`<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#ece7f5" stroke-width="${sw}"/>`;
 if(tot)parts.forEach(p=>{if(!p.v)return;const L=p.v/tot*C;s+=`<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${sw}" stroke-dasharray="${L} ${C-L}" stroke-dashoffset="${-off}" transform="rotate(-90 ${c} ${c})"/>`;off+=L});
 return rpSvg(sz,sz,s+`<text x="${c}" y="${c+sz*.07}" font-size="${sz*.22}" font-weight="800" text-anchor="middle" fill="#4b3478">${ctr}</text>`)}
const rpHb=(rows)=>rows.map(r=>`<div class="hb"><i>${esc2(r.l)}</i><u><s style="width:${r.v==null?0:Math.min(100,r.v/4*100)}%;background:${r.v==null?'#ccc':col(r.v)}"></s></u><em>${f1(r.v)}</em></div>`).join('')||'<div class="nt">—</div>';
const rpLv=v=>v==null?'—':`<span class="rlv" style="color:${LVC[lvl(v)]}">${LVW[lvl(v)]}</span>`;
const rpDs=k=>k?`<span class="rlv" style="color:${rpDC[k]}">${rpDN[k]}</span>`:'—';
const rpEmpty='<div class="in" style="justify-content:center;text-align:center;color:#888">برای این بازه هنوز داده‌ای (حضور و غیاب یا آزمون) ثبت نشده است.</div>';
function rpInfo(){const P=S.prof||{};return{sch:P.school?schoolFull():'',P}}
function rpSig(){return window.sigRow?window.sigRow():''}
function rpO(d,M,cap){
 const{sch,P}=rpInfo(),n=M.n,kv=(k,v)=>`<div><span>${k}:</span><b>${v?esc2(v):'—'}</b></div>`,two=n>12;
 const head=`<div class="o-head"><div class="o-sp"></div><div class="t"><div class="ti">گزارش عملکرد کلاس</div><div class="s">${esc2(M.sub)}</div></div><div class="o-lg">${P.logo?`<img src="${P.logo}">`:''}<b>${esc2(sch)}</b></div></div>`;
 const info=`<div class="o-info">${kv('پایه',P.grade)}${kv('کلاس',P.sec)}${kv('سال تحصیلی',syLab(SY))}${kv('آموزگار',P.teacher)}${kv('مدیر',P.principal)}${kv('منطقه / شهر',P.city)}${kv('بازه‌ی گزارش',d.mon.length?(d.mon.length>1?d.mon[0].l+' تا '+d.mon[d.mon.length-1].l:d.mon[0].l):M.sub)}</div>`;
 const kp=[['دانش‌آموزان',fa(n)],['میانگین کلاس (از ۴)',f1(d.avg)],['دانش‌آموز موفق',fa(M.ok)],['نیازمند توجه',fa(M.att.length)],['درصد حضور',pc(d.ap)],['مجموع غیبت',fa(d.ab)],['آزمون‌ها',fa(d.EX.length)]];
 const kpi=`<div class="o-kpi">${kp.map(x=>`<div><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>`;
 const dt=M.dcn.g+M.dcn.m+M.dcn.w,pp=k=>dt?fa(Math.round(M.dcn[k]/dt*100))+'٪':'—';
 const dc=`<div class="o-dc"><b>وضعیت انضباطی:</b>${['g','m','w'].map(k=>`<span><i style="display:inline-block;width:.7em;height:.7em;border-radius:50%;background:${rpDC[k]};margin-left:.3em"></i>${rpDN[k]}: <b>${fa(M.dcn[k])}</b> نفر (${pp(k)})</span>`).join('')}<div class="bar">${['g','m','w'].map(k=>`<i style="width:${dt?M.dcn[k]/dt*100:0}%;background:${rpDC[k]}"></i>`).join('')}</div></div>`;
 const mx=Math.max(1,...d.lv.map(x=>x.v));
 const rowA=`<div class="o-rowA"><div class="o-p"><b>📈 روند میانگین ماهانه (از ۴)</b>${rpLine(d.mon.map(x=>({l:x.l,v:x.av})),{W:176,H:84,max:4,c:'#7e57c2'})}</div><div class="o-p"><b>📅 درصد حضور هر ماه</b>${rpBars(d.mon.map(x=>({l:x.l.slice(0,3),v:x.ap,c:x.ap==null?'#ccc':apc(x.ap)})),{W:176,H:84,max:100,ticks:[0,50,100],fmt:v=>fa(Math.round(v)),bw:24})}</div><div class="o-p"><b>📚 میانگین هر درس (از ۴)</b>${rpHb(d.les)}</div><div class="o-p"><b>🎯 توزیع سطح نمرات</b>${rpBars(d.lv.map(x=>({l:x.l.replace('نیاز به تلاش','نیاز تلاش'),v:x.v,c:x.c})),{W:176,H:84,max:mx,ticks:[0,Math.ceil(mx/2),mx],lf:7.5,bw:24})}</div></div>`;
 const exr=M.exS.map(x=>[rpSd(x.d),esc2(x.c),f1(x.av),f1(x.lo),f1(x.hi)]);
 const exNote=M.exAll.length>M.exS.length?`<div class="nt">آخرین ${fa(M.exS.length)} آزمون از ${fa(M.exAll.length)} آزمون نمایش داده شده است.</div>`:'';
 const exRow=M.exAll.length?`<div class="o-two"><div class="o-p" style="flex:.9"><b>📝 مقایسه‌ی میانگین آزمون‌ها (از ۴)</b>${rpBars(M.exS.map(x=>({l:rpSd(x.d),v:x.av,c:rpLvC(x.av)})),{W:290,H:92,max:4,bw:26})}</div><div style="flex:1.25"><table class="o-t"><colgroup><col style="width:17%"><col style="width:33%"><col style="width:16%"><col style="width:17%"><col style="width:17%"></colgroup><tr><th>تاریخ</th><th>درس</th><th>میانگین</th><th>کمترین</th><th>بیشترین</th></tr>${exr.map((r,i)=>`<tr${d.weak&&M.exS[i]===d.weak?' class="hi"':''}>${r.map((c,j)=>`<td${j===1?' class="n"':''}>${c}</td>`).join('')}</tr>`).join('')}</table>${exNote}${d.weak?`<div class="nt" style="color:#c0262c">ضعیف‌ترین آزمون: ${esc2(d.weak.c)} (${rpSd(d.weak.d)}) با میانگین ${f1(d.weak.av)}</div>`:''}</div></div>`:'<div class="o-p nt">آزمونی در این بازه ثبت نشده است.</div>';
 const stRow=(r,w)=>`<tr><td>${fa(r.i)}</td><td class="n">${esc2(r.name)}</td><td><b>${f1(r.avg)}</b></td><td>${rpLv(r.avg)}</td><td>${pc(r.ap)}</td>${w?`<td>${fa(r.a)}</td><td>${fa(r.l)}</td>`:`<td>${fa(r.a)}/${fa(r.l)}</td>`}<td>${rpDs(r.dc)}</td>${w?`<td class="n" style="font-size:.9em">${r.fl.length?esc2(r.fl.join('، ')):'—'}</td>`:''}</tr>`;
 const stT=(a,w)=>`<table class="o-t"><colgroup>${(w?['5%','21%','8%','11%','8%','6%','6%','10%','25%']:['8%','31%','11%','17%','11%','8%','14%']).map(x=>`<col style="width:${x}">`).join('')}</colgroup><tr><th>ردیف</th><th>نام و نام خانوادگی</th><th>میانگین</th><th>سطح عملکرد</th><th>حضور</th>${w?'<th>غیبت</th><th>تأخیر</th>':'<th>غ/ت</th>'}<th>انضباط</th>${w?'<th>توضیحات</th>':''}</tr>${a.map(r=>stRow(r,w)).join('')}</table>`;
 const h=Math.ceil(M.rows.length/2),stu=n?(two?`<div class="o-two"><div>${stT(M.rows.slice(0,h),0)}</div><div>${stT(M.rows.slice(h),0)}</div></div>`:stT(M.rows,1)):'';
 const A=M.att.slice(0,cap.att),rest=M.att.length-A.length;
 const sg=r=>[...new Set(r.fl.map(f=>rpSug[f]).filter(Boolean))].slice(0,2).join('؛ ');
 const attT=M.att.length?`<table class="o-t"><colgroup><col style="width:5%"><col style="width:19%"><col style="width:8%"><col style="width:8%"><col style="width:30%"><col style="width:30%"></colgroup><tr><th>ردیف</th><th>نام دانش‌آموز</th><th>میانگین</th><th>حضور</th><th>علت نیاز به توجه</th><th>پیشنهاد پیگیری</th></tr>${A.map((r,i)=>`<tr><td>${fa(i+1)}</td><td class="n">${esc2(r.name)}</td><td><b>${f1(r.avg)}</b></td><td>${pc(r.ap)}</td><td class="n" style="color:#a9272d">${esc2(r.fl.join('، '))}</td><td class="n">${esc2(sg(r))||'—'}</td></tr>`).join('')}</table>${rest>0?`<div class="nt">و ${fa(rest)} مورد دیگر (فهرست کامل در «گزارش کامل کلاسی»)</div>`:''}`:'<div class="o-p" style="color:#1a8f55;text-align:center">✅ دانش‌آموز نیازمند توجهی در این بازه دیده نشد.</div>';
 return `<div class="rpA4 o"><div class="in">${head}${info}${kpi}${dc}${rowA}${exRow}${n?`<div class="o-h">وضعیت و عملکرد دانش‌آموزان</div>${stu}<div class="nt">معیارها: انضباط «خوب» = حضور ۹۰٪ یا بیشتر و کمتر از ۲ تأخیر؛ «ضعیف» = غیبت یا تأخیر زیاد؛ سایر موارد «متوسط». دانش‌آموز موفق = بدون هیچ مورد نیازمند توجه. نمرات بر مبنای ۴.</div>`:''}<div class="o-h">⚠️ دانش‌آموزان نیازمند توجه</div>${attT}<div class="o-h">جمع‌بندی عملکرد کلاس</div><div class="o-sum">${esc2(M.text)||'—'}</div><div class="o-ft push">${rpSig()}<div class="stamp" style="margin-top:.4em"><span data-rpst>${M.stamp}</span></div></div></div></div>`;
}
function rpG(d,M,cap){
 const{sch,P}=rpInfo(),n=M.n,mx=Math.max(1,...d.lv.map(x=>x.v)),dt=M.dcn.g+M.dcn.m+M.dcn.w;
 const head=`<div class="g-head"><div class="g-lg">${P.logo?`<img src="${P.logo}">`:''}<b>${esc2(sch)}</b></div><div class="t"><div class="ti">گزارش عملکرد کلاس</div><div class="g-pill">${esc2(M.sub)}</div><div style="font-size:.85em;margin-top:.35em;opacity:.95"><span data-rpst>${M.stamp}</span></div></div><div class="g-info"><div><span>پایه:</span>${esc2(P.grade||'—')}</div><div><span>کلاس:</span>${esc2(P.sec||'—')}</div><div><span>آموزگار:</span>${esc2(P.teacher||'—')}</div><div><span>مدیر:</span>${esc2(P.principal||'—')}</div><div><span>سال تحصیلی:</span>${syLab(SY)}</div></div></div>`;
 const kp=[['میانگین کلاس (از ۴)',f1(d.avg),'#7e57c2'],['تعداد دانش‌آموزان',fa(n),'#5b7fd6'],['دانش‌آموز موفق',fa(M.ok),'#1a8f55'],['نیازمند توجه',fa(M.att.length),'#d98600'],['درصد حضور',pc(d.ap),'#2f9bb0'],['تغییر میانگین ماهانه',M.delta==null?'—':(M.delta>0?'▲ ':M.delta<0?'▼ ':'')+f1(Math.abs(M.delta)),M.delta==null?'#999':M.delta>=0?'#1a8f55':'#d12f35']];
 const kpi=`<div class="g-kpi">${kp.map(x=>`<div class="g-k" style="--c:${x[2]}"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div>`;
 const examP=`<div class="g-p" style="flex:1.7;--c:#7e57c2"><div class="gt">مقایسه‌ی میانگین آزمون‌ها (از ۴)</div>${M.exS.length?rpBars(M.exS.map(x=>({l:rpSd(x.d),v:x.av,c:rpLvC(x.av)})),{W:430,H:150,max:4,bw:34,vf:11,lf:9.5}):'<div class="nt">آزمونی ثبت نشده است.</div>'}${M.exAll.length>M.exS.length?`<div class="nt">آخرین ${fa(M.exS.length)} آزمون از ${fa(M.exAll.length)}</div>`:''}</div>`;
 const dcP=`<div class="g-p" style="flex:1;--c:#1a8f55"><div class="gt">وضعیت انضباط دانش‌آموزان</div><div class="g-dn">${rpDonut(['g','m','w'].map(k=>({v:M.dcn[k],c:rpDC[k]})),110,fa(dt))}<div class="g-lg2">${['g','m','w'].map(k=>`<div><i style="background:${rpDC[k]}"></i>${rpDN[k]}: <b>${fa(M.dcn[k])}</b> نفر${dt?' ('+fa(Math.round(M.dcn[k]/dt*100))+'٪)':''}</div>`).join('')}</div></div><div class="nt">بر پایه‌ی حضور و تأخیر</div></div>`;
 const trP=`<div class="g-p" style="flex:1.25;--c:#7e57c2"><div class="gt">روند میانگین کلاس در طول سال</div>${rpLine(d.mon.map(x=>({l:x.l,v:x.av})),{W:300,H:130,max:4,c:'#7e57c2'})}</div>`;
 const lvP=`<div class="g-p" style="flex:1;--c:#d98600"><div class="gt">توزیع سطح نمرات</div>${rpBars(d.lv.map(x=>({l:x.l,v:x.v,c:x.c})),{W:240,H:130,max:mx,ticks:[0,Math.ceil(mx/2),mx],bw:30,lf:8.5})}</div>`;
 const lsP=`<div class="g-p" style="flex:1;--c:#2f9bb0"><div class="gt">میانگین هر درس (از ۴)</div>${rpHb(d.les)}</div>`;
 const A=M.att.slice(0,Math.min(cap.att,7)),rest=M.att.length-A.length;
 const attP=`<div class="g-p" style="flex:1;--c:#d98600;background:#fffaf0;border-color:#f3dfae"><div class="gt">⚠️ دانش‌آموزان نیازمند توجه</div>${A.length?A.map(r=>`<div class="g-ar"><b>${esc2(r.name)}</b><em style="color:${rpLvC(r.avg)}">${f1(r.avg)}</em><span>${esc2(r.fl.slice(0,2).join('، '))}</span></div>`).join('')+(rest>0?`<div class="nt">و ${fa(rest)} مورد دیگر</div>`:''):'<div style="color:#1a8f55;text-align:center">✅ موردی دیده نشد</div>'}</div>`;
 const st=r=>`<div class="g-st"><b>${esc2(r.name)}</b><u><s style="width:${r.avg==null?0:r.avg/4*100}%;background:${rpLvC(r.avg)}"></s></u><em>${f1(r.avg)}</em><span class="g-pl" style="background:${r.avg==null?'#aaa':LVC[lvl(r.avg)]}">${r.avg==null?'—':LVW[lvl(r.avg)]}</span></div>`;
 const h=Math.ceil(n/2),stuP=`<div class="g-p" style="flex:1.45;--c:#5b7fd6"><div class="gt">جدول خلاصه‌ی دانش‌آموزان</div><div class="g-sr"><div>${M.rows.slice(0,h).map(st).join('')}</div><div>${M.rows.slice(h).map(st).join('')}</div></div></div>`;
 return `<div class="rpA4 g"><div class="in">${head}${kpi}<div class="g-row">${examP}${dcP}</div><div class="g-row">${trP}${lvP}${lsP}</div><div class="g-row">${attP}${stuP}</div><div class="g-sum"><b style="color:#4b3478">جمع‌بندی و نکات مهم: </b>${esc2(M.text)||'—'}</div><div class="push">${rpSig()}</div></div></div>`;
}
const rpD=()=>data(+$('mp').value||0);
const rpCaps=[{att:99,ex:8},{att:10,ex:6},{att:6,ex:5}];
function rpFit(pg){let fs=13;pg.style.fontSize=fs+'px';const inn=pg.firstElementChild;while(fs>8.25&&inn.offsetHeight>1123){fs-=.25;pg.style.fontSize=fs+'px'}return inn.offsetHeight<=1123}
function rpFill(host,kind){const d=rpD();if(!S.students.length){host.innerHTML='<div class="rpA4"><div class="in" style="justify-content:center;text-align:center;color:#888">ابتدا دانش‌آموزان را در برنامه ثبت کنید.</div></div>';return}
 for(let i=0;i<rpCaps.length;i++){host.innerHTML=(kind==='g'?rpG:rpO)(d,rpModel(d,rpCaps[i]),rpCaps[i]);if(rpFit(host.firstElementChild))break}}
function rpLayout(){const pv=$('rpPv');if(!pv)return;const sc=pv.firstElementChild;rpFill(sc,rpK);const k=Math.min(1,pv.clientWidth/794);sc.style.transformOrigin='top right';sc.style.transform='scale('+k+')';pv.style.height=Math.round(1123*k)+'px'}
function rpView(d){requestAnimationFrame(rpLayout);return `<div class="card"><div class="rpseg"><button data-rp="o" class="${rpK==='o'?'on':''}">📄 گزارش رسمی عملکرد کلاس</button><button data-rp="g" class="${rpK==='g'?'on':''}">📊 گزارش گرافیکی عملکرد کلاس</button></div><div class="rpact"><button class="big" data-rpa="print" style="font-size:15px;padding:12px">🖨️ چاپ گزارش</button><button class="big" data-rpa="pdf" style="font-size:15px;padding:12px">⬇️ ذخیره / خروجی PDF</button></div><p class="sub" id="rpmsg" style="margin:8px 0 0">هر دو گزارش از یک داده‌ی واحد ساخته می‌شوند؛ بازه را از بالا (ماه … تا ماه …) تغییر دهید.</p></div><div id="rpPv" class="rpPv"><div class="rpSc"></div></div>`}
function rpMount(){const o=document.getElementById('rpPrintRoot');if(o)o.remove();const r=document.createElement('div');r.id='rpPrintRoot';document.body.appendChild(r);rpFill(r,rpK);return r}
function rpPrint(){const r=rpMount();document.body.classList.add('rp-printing');setTimeout(()=>{try{window.print()}catch(e){document.body.classList.remove('rp-printing');r.remove()}},60)}
window.addEventListener('beforeprint',()=>{document.querySelectorAll('[data-rpst]').forEach(e=>e.textContent=rpStamp())});
window.addEventListener('afterprint',()=>{document.body.classList.remove('rp-printing');const r=document.getElementById('rpPrintRoot');if(r)r.remove()});
window.addEventListener('resize',()=>{if($('rpPv'))rpLayout()});
async function rpPdf(){const o=$('rpmsg');o.textContent='⏳ در حال ساخت فایل…';try{await pdfLibs();try{await document.fonts.ready}catch(e){}const r=rpMount(),doc=new(window.jspdf?window.jspdf.jsPDF:MiniPDF)({unit:'mm',format:'a4'}),cv=await rast(r.firstElementChild);doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,210,297);r.remove();const[x,y]=rI(),n=i=>MN[SM[i]-1];
  await dl((rpK==='g'?'گزارش-گرافیکی-عملکرد-کلاس':'گزارش-رسمی-عملکرد-کلاس')+'-'+(x===y?n(x):n(x)+'-تا-'+n(y))+'-'+SY+'.pdf',doc.output('arraybuffer'));o.textContent=window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در مرورگر باز کنید یا از «چاپ گزارش» و گزینه‌ی Save as PDF استفاده کنید.'}catch(x){o.textContent=errT(x)}}
$('mgr').addEventListener('click',e=>{const t=e.target.closest('[data-rp],[data-rpa]');if(!t)return;if(t.dataset.rp){rpK=t.dataset.rp;return render()}if(t.dataset.rpa==='print')rpPrint();else rpPdf()});

function render(){const mp=$('mp'),ms=$('ms');
 if(!mp.options.length){const o=SM.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');mp.innerHTML=o;$('mp2').innerHTML=o;$('mp2').value=SM[SM.length-1]}
 if(!ms.options.length||ms.options.length!==S.students.length)ms.innerHTML=S.students.map(s=>`<option value="${s.id}">${esc2(s.name)}</option>`).join('');
 document.querySelectorAll('#mtab button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 $('mb1').style.display=tab==='c'?'':'none';$('mb3').style.display=$('hpw').style.display=tab==='h'?'':'none';hdI();$('hdw').style.display=tab==='h'&&$('hp').value==='d'?'':'none';$('hk0').style.display=tab==='h'&&$('hp').value==='k'?'':'none';$('mb2').style.display=$('mnote').style.display=ms.style.display=tab==='s'?'':'none';
 const m=+mp.value||0,d=data(m);
 $('mbody').innerHTML=W(h3('📅 بازه‌ی گزارش: '+(tab==='h'?hwData().lbl:sub())))+(tab==='c'?W(kC(d)+chC(d))+W(atC(d))+W(more(d))+W(h3('📝 مقایسه‌ی آزمون‌ها')+(d.ex.length?exT(d,0,99)+(d.weak?`<div style="font-size:12px;margin-top:6px;color:#c0262c">ضعیف‌ترین آزمون: ${esc2(d.weak.c)} (${fmt(new Date(d.weak.d+'T12:00:00Z'))}) با میانگین ${f1(d.weak.av)}</div>`:''):'<div style="font-size:13px;color:#888">آزمونی ثبت نشده</div>')):tab==='p'?rpView(d):tab==='h'?W(hwB(hwData(),1)+hwScr(hwData())):W(sCard(d,+ms.value,true)));if(tab==='s'&&$('dtx'))$('dtx').value=(S.desc&&S.desc[+ms.value])||(window.genDesc?window.genDesc(+ms.value):auto(d,+ms.value))}
$('mgr').addEventListener('click',async e=>{const t=e.target.closest('[data-t],[data-a],[data-k]');if(!t)return;
 if(t.dataset.t){tab=t.dataset.t;return render()}
 if(t.dataset.k){nk=t.dataset.k;document.querySelectorAll('#nty button').forEach(b=>b.classList.toggle('on',b.dataset.k===nk));return}
 if(t.dataset.a==='pc'){tab='p';return render()}if(t.dataset.a==='pr')return window.openProf(+$('ms').value);const a=t.dataset.a,m=+$('mp').value||0,d=data(m),s2=sub(m),o=$('mmsg'),rr=(()=>{const[x,y]=rI(),n=i=>MN[SM[i]-1];return x===y?'ماه-'+n(x):n(x)+'-تا-'+n(y)})(),zz='-'+rr+'-'+SY;o.textContent='⏳ در حال ساخت فایل…';
 try{if(a==='x')await dl('گزارش-اکسل-کلاس'+zz+'.xlsx',await xls(d));
  else if(a==='hp'){await dl('گزارش-تکالیف-'+($('hp').value==='w'?'هفته-جاری':$('hp').value==='m'?'ماه-'+MN[jp(tdy()).m-1]:$('hp').value==='y'?'کل-سال-تحصیلی':/^[dk]$/.test($('hp').value)?hwData().lbl.replace(/[\s\/]+/g,'-'):rr)+'-'+SY+'.pdf',await pdf(hwPages(hwData())))}
  else if(a==='hx'){await dl('گزارش-تکالیف-'+($('hp').value==='w'?'هفته-جاری':$('hp').value==='m'?'ماه-'+MN[jp(tdy()).m-1]:$('hp').value==='y'?'کل-سال-تحصیلی':/^[dk]$/.test($('hp').value)?hwData().lbl.replace(/[\s\/]+/g,'-'):rr)+'-'+SY+'.xlsx',await xwb(hwSheets(hwData())))}
  else if(a==='sx'){await dl('کارنامه-'+nmS()+zz+'.xlsx',await xwb(stSheets(d,+$('ms').value)))}
  else if(a==='pf'){await dl('گزارش-کامل-کلاس'+zz+'.pdf',await pdf(full(d,s2)))}
  else if(a==='pc'){await dl('گزارش-خلاصه-یک‌صفحه-کلاس'+zz+'.pdf',await pdf([one(d,s2)]))}
  else{const L=a==='ps'?[+$('ms').value]:S.students.map(s=>s.id);await dl((a==='ps'?'کارنامه-'+nmS():'کارنامه-همه-دانش‌آموزان')+zz+'.pdf',await pdf(L.map(id=>hdr('کارنامه‌ی عملکرد دانش‌آموز',s2)+sCard(d,id))))}
  o.textContent=window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد (راهنما در پایین صفحه). برنامه را از آدرس سایت در Chrome باز کنید.'}catch(x){o.textContent=errT(x)}});
$('mp').onchange=$('mp2').onchange=$('ms').onchange=$('hp').onchange=render;
$('tset').onclick=()=>{const n=S.students.length,a=+$('tn').value,b=+$('ts').value;let k=a>0?a:b>0?Math.ceil(n/b):0;if(!k){$('tmsg').textContent='تعداد تیم یا تعداد نفر در هر تیم را وارد کنید';return}k=Math.min(k,n);NT=k;S.nt=k;S.students.forEach((x,i)=>x.team=i%NT+1);$('tmsg').textContent='✅ '+fa(n)+' نفر در '+fa(k)+' تیم تقسیم شد';window.render()};
$('nadd').onclick=()=>{const x=$('ntx').value.trim(),id=+$('ms').value;if(!x||!id)return;(S.notes[id]=S.notes[id]||[]).push({d:iso(tdy()),k:nk,x});$('ntx').value='';save();render()};
window.mDel=(id,i)=>{(S.notes[id]||[]).splice(i,1);save();render()};
$('dsave').onclick=()=>{const id=+$('ms').value;S.desc=S.desc||{};S.desc[id]=$('dtx').value;save();render()};
$('dauto').onclick=()=>{const id=+$('ms').value;if(S.desc)delete S.desc[id];save();render()};
window.mgrOpen=id=>{tab='s';show('mgr');$('ms').value=id;render()};
window.renderMgr=render;
})();
(function(){
S.info=S.info||{};S.tnm=S.tnm||[];S.hwl=S.hwl||[];S.desc=S.desc||{};S.bin=S.bin||[];if(S.hw&&Object.keys(S.hw).length){Object.keys(S.hw).forEach(k=>S.hwl.push({id:'o'+k,date:k,course:0,title:(S.hwt&&S.hwt[k])||'تکلیف',st:S.hw[k]}));S.hw={};S.hwt={}}
const fm=t=>new Date(t).toLocaleString('fa-IR'),HI={'':'⬜',d:'✅',p:'🟡',n:'❌'},SQ=['','d','p','n'];
const BS='padding:8px 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--tx);font:700 13px Vazirmatn,Tahoma,sans-serif;margin:3px;cursor:pointer';
let ha=null;
function hwR(){if(window.hwReview)window.hwReview.render()}/* رابط بازدید تکلیف: features/homework-review.js */
document.addEventListener('click',async e=>{const b=e.target.closest('#hwxp,#hwxx,#hwgo');if(!b)return;if(b.id==='hwgo'){window.show('mgr');setTimeout(()=>{const t=document.querySelector('#mtab [data-t="h"]');if(t)t.click()},60);return}const m=$('hwmsg');m.textContent='⏳ در حال ساخت فایل…';try{await window.hwExp(b.id==='hwxx'?'x':'p',iso(cur),iso(cur),'بازدید تکالیف روز '+fmt(cur),iso(cur));m.textContent=window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در Chrome باز کنید.'}catch(x){m.textContent='ساخت فایل ناموفق بود'}});
const _ra=renderAtt;renderAtt=function(){_ra();hwR()};
let H=[],db,last=0;
new Promise(r=>{try{const q=indexedDB.open('cl_hist',1);q.onupgradeneeded=()=>q.result.createObjectStore('h');q.onsuccess=()=>{db=q.result;try{const g=db.transaction('h').objectStore('h').get('l');g.onsuccess=()=>{H=H.concat(g.result||[]);r()};g.onerror=()=>r()}catch(x){r()}};q.onerror=()=>r()}catch(x){r()}});
const put=()=>{try{db&&db.transaction('h','readwrite').objectStore('h').put(H,'l')}catch(x){}};
window.histPush=j=>{if(!j||Date.now()-last<8000)return;last=Date.now();H.unshift({t:Date.now(),j});H.length=Math.min(H.length,30);put()};
window.binChk=had=>{if(!had)return;try{const P=JSON.parse(had),ids=new Set(S.students.map(s=>s.id));P.students.filter(s=>!ids.has(s.id)).forEach(s=>{const e={t:Date.now(),s,att:{},sc:{},hw:{},info:(P.info||{})[s.id]};Object.keys(P.att||{}).forEach(k=>{if(P.att[k][s.id])e.att[k]=P.att[k][s.id]});e.attx={};Object.keys(P.attx||{}).forEach(k=>{if((P.attx[k]||{})[s.id]!==undefined)e.attx[k]=P.attx[k][s.id]});(P.exams||[]).forEach(x=>{if(x.scores&&x.scores[s.id]!=null)e.sc[x.id]=x.scores[s.id]});(P.hwl||[]).forEach(h=>{if(h.st&&h.st[s.id])e.hw[h.id]=h.st[s.id]});S.bin.push(e)})}catch(x){}};
function hshow(){$('hlist').innerHTML=H.length?H.map((x,i)=>{let c='';try{const P=JSON.parse(x.j);c=fa(P.students.length)+' دانش‌آموز، '+fa((P.exams||[]).length)+' آزمون'}catch(y){}return `<div style="border-bottom:1px solid var(--line);padding:6px 0;font-size:13px">${fm(x.t)} · ${c}<button data-r="${i}" style="margin-top:4px;padding:8px">بازگرداندن به این نقطه</button></div>`}).join(''):'<p class="sub">هنوز تغییری ثبت نشده</p>';
 $('hbin').innerHTML=S.bin.length?S.bin.map((b,i)=>`<div style="border-bottom:1px solid var(--line);padding:6px 0;font-size:13px">👤 ${esc2(b.s.name)} · ${fm(b.t)}<button data-b="${i}" style="margin-top:4px;padding:8px">بازگردانی دانش‌آموز</button></div>`).join(''):'<p class="sub">سطل بازیافت خالی است</p>'}
function restore(i){const x=H[i];if(!x)return;H.unshift({t:Date.now(),j:localStorage.getItem('cl1')});H.length=Math.min(H.length,30);put();localStorage.setItem('cl1',x.j);localStorage.setItem('cl1_ts',Date.now());setTimeout(()=>location.reload(),400)}
function rb(i){const b=S.bin[i];if(!b)return;S.students.push(b.s);Object.keys(b.att).forEach(k=>{(S.att[k]=S.att[k]||{})[b.s.id]=b.att[k]});if(b.attx)Object.keys(b.attx).forEach(k=>{((S.attx=S.attx||{})[k]=S.attx[k]||{})[b.s.id]=b.attx[k]});S.exams.forEach(x=>{if(b.sc[x.id]!=null)x.scores[b.s.id]=b.sc[x.id]});if(b.info)S.info[b.s.id]=b.info;S.hwl.forEach(h=>{if(b.hw&&b.hw[h.id])h.st[b.s.id]=b.hw[h.id]});S.bin.splice(i,1);save();render();renderAtt();hshow()}
$('hb').onclick=()=>{hshow();$('hpan').classList.add('open')};
$('hpan').onclick=e=>{const t=e.target;if(t.id==='hpan'||t.id==='hcl')return $('hpan').classList.remove('open');if(t.dataset.r!=null)restore(+t.dataset.r);if(t.dataset.b!=null)rb(+t.dataset.b);if(t.id==='hun')restore(0)};
const FL=[['پدر',[['fn','نام پدر'],['fp','شماره‌ی پدر',1],['fj','شغل پدر']]],['مادر',[['mn','نام مادر'],['mp','شماره‌ی مادر',1],['mj','شغل مادر']]],['قیم / سرپرست',[['gn','نام قیم'],['gr','نسبت با دانش‌آموز'],['gp','شماره‌ی قیم',1]]],['تماس و محل زندگی',[['hp','تلفن منزل',1],['ep','تلفن اضطراری',1],['ad','نشانی']]],['مشخصات و وضعیت',[['nc','کد ملی'],['bd','تاریخ تولد (مثلاً ۱۳۹۵/۰۴/۱۲)'],['sb','تعداد خواهر و برادر'],['hl','بیماری، حساسیت یا مشکل جسمی'],['hb','علایق و توانمندی‌ها'],['nt','توضیحات دیگر']]]];
let cid=0;
function openP(id){const s=S.students.find(x=>x.id===id);if(!s)return;cid=id;const I=S.info[id]||{};
 let h=`<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">👤 پرونده‌ی دانش‌آموز</b><button class="sm" id="spx">✕</button></div><div style="display:flex;gap:10px;align-items:center;margin:8px 0">${s.photo?`<img src="${s.photo}" style="width:72px;height:90px;object-fit:cover;border-radius:10px">`:'<div style="width:72px;height:90px;border-radius:10px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:30px">👤</div>'}<div style="flex:1"><label>📷 عکس دانش‌آموز</label><input type="file" accept="image/*" data-ph="${s.id}" style="margin:0">${s.photo?`<button class="sm" data-phd="${s.id}" style="margin-top:6px">حذف عکس</button>`:''}</div></div><label>نام و نام خانوادگی</label><input data-nm="1" data-sid="${s.id}" value="${esc2(s.name)}"><label>وضعیت زندگی والدین</label><select data-f="ls">${['','با هم زندگی می‌کنند','جدا از هم زندگی می‌کنند','پدر فوت شده','مادر فوت شده','سرپرست دیگر'].map(o=>`<option${I.ls===o?' selected':''}>${o}</option>`).join('')}</select>`;
 FL.forEach(([t,fs])=>{h+=`<div style="font-weight:800;margin:12px 0 2px;color:var(--p)">${t}</div>`+fs.map(([k,l,tl])=>`<label>${l}</label><div style="display:flex;gap:6px"><input data-f="${k}" ${tl?'type="tel" inputmode="tel" dir="ltr"':''} value="${esc2(I[k]||'')}" style="margin:0;flex:1">${tl?`<button class="sm" data-c="tel" data-k="${k}">📞</button><button class="sm" data-c="sms" data-k="${k}">💬</button>`:''}</div>`).join('')});
 h+=`<button class="big" id="spr" style="font-size:15px;padding:12px;margin-top:14px">📑 کارنامه و گزارش‌های این دانش‌آموز</button></div>`;$('spro').innerHTML=h;$('spro').classList.add('open')}
function closeP(){$('spro').classList.remove('open');render();renderAtt()}
$('spro').addEventListener('input',e=>{const t=e.target,s=S.students.find(x=>x.id===cid);if(!s)return;if(t.dataset.nm)s.name=t.value;else if(t.dataset.f){(S.info[cid]=S.info[cid]||{})[t.dataset.f]=t.value}save()});
$('spro').addEventListener('click',e=>{const t=e.target;if(t.id==='spro'||t.id==='spx')return closeP();if(t.dataset.pick)return openP(+t.dataset.pick);if(t.dataset.c){const v=$('spro').querySelector(`[data-f="${t.dataset.k}"]`).value.trim();if(v)location.href=t.dataset.c+':'+v}if(t.id==='spr'){const i=cid;closeP();window.mgrOpen(i)}});
document.addEventListener('click',e=>{if(e.target.closest('#spro,#cpan,#jcal,#hpan,#lpan'))return;const el=e.target.closest('td.nm,.row>span:first-child,.row>div>b');if(!el)return;const t=el.textContent.trim(),s=[...S.students].sort((a,b)=>b.name.length-a.name.length).find(x=>t===x.name||t.startsWith(x.name));if(!s)return;const same=S.students.filter(x=>x.name===s.name);if(same.length>1){$('spro').innerHTML='<div class="box"><b>کدام دانش‌آموز؟ (هم‌نام)</b>'+same.map(x=>`<button data-pick="${x.id}">${esc2(x.name)} — پدر: ${esc2((S.info[x.id]||{}).fn||'ثبت نشده')}</button>`).join('')+'</div>';$('spro').classList.add('open')}else openP(s.id)});
window.openProf=openP;
const imm={set t(v){document.querySelectorAll('.imsg').forEach(e=>e.textContent=v)}};
function imp(rows){let n=0;rows.forEach((c,i)=>{const nm=(c[0]||'').toString().trim();if(!nm||/^(نام( و نام خانوادگی)?|ردیف)$/.test(nm)||S.students.some(s=>s.name===nm))return;const id=Date.now()+i;S.students.push({id,name:nm,score:1000,team:S.students.length%NT+1,att:''});if(c[1]||c[2])S.info[id]={fp:(c[1]||'').toString().trim(),mp:(c[2]||'').toString().trim()};n++});save();render();imm.t=n?'✅ '+fa(n)+' دانش‌آموز اضافه شد (در صورت اشتباه، دکمه‌ی ↩️ بالای صفحه)':'موردی برای افزودن پیدا نشد'}
const sp=t=>t.split(/\r?\n/).map(l=>l.split(/[\t,،;؛]/));
$('ipaste').onclick=()=>imp(sp($('itx').value));
const XC=[['name','نام و نام خانوادگی',26],['ls','وضعیت زندگی والدین',22],['fn','نام پدر',18],['fp','شماره‌ی پدر',15,1],['fj','شغل پدر',16],['mn','نام مادر',18],['mp','شماره‌ی مادر',15,1],['mj','شغل مادر',16],['gn','نام قیم',18],['gr','نسبت با دانش‌آموز',14],['gp','شماره‌ی قیم',15,1],['hp','تلفن منزل',15,1],['ep','تلفن اضطراری',15,1],['ad','نشانی',34],['nc','کد ملی',14,1],['bd','تاریخ تولد',14],['sb','تعداد خواهر و برادر',12],['hl','بیماری، حساسیت یا مشکل جسمی',28],['hb','علایق و توانمندی‌ها',28],['nt','توضیحات دیگر',28],['id','شناسه (دست نزنید)',12]];
const LSO=['با هم زندگی می‌کنند','جدا از هم زندگی می‌کنند','پدر فوت شده','مادر فوت شده','سرپرست دیگر'],TELK=['fp','mp','gp','hp','ep'];
const d2l=t=>String(t).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));
const hn=t=>d2l(t==null?'':t).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[^\p{L}\p{N}]/gu,'');
const nk=t=>String(t==null?'':t).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f\u200e\s]+/g,'');
const AL={name:['نام','نام دانش‌آموز','دانش‌آموز','نام خانوادگی','اسم'],id:['شناسه'],fp:['موبایل پدر','تلفن پدر','همراه پدر','شماره پدر'],mp:['موبایل مادر','تلفن مادر','همراه مادر','شماره مادر'],gp:['موبایل قیم','تلفن قیم','شماره قیم'],hp:['تلفن ثابت','تلفن خانه'],ep:['شماره اضطراری'],ad:['آدرس'],nc:['شماره ملی'],bd:['تولد'],sb:['خواهر و برادر'],hl:['بیماری','حساسیت','مشکل جسمی'],hb:['علایق'],nt:['توضیحات'],ls:['وضعیت والدین']};
const HM={};XC.forEach(c=>HM[hn(c[1])]=c[0]);Object.keys(AL).forEach(k=>AL[k].forEach(a=>HM[hn(a)]=k));
const cv=c=>{if(c==null)return'';if(c instanceof Date){const q=jp(new Date(Date.UTC(c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate(),12)));return q.y+'/'+z2(q.m)+'/'+z2(q.d)}
 if(typeof c==='object'){if(c.richText)return c.richText.map(x=>x.text).join('');if(c.error)return'';if(c.text!=null)return String(c.text);if(c.result!=null)return cv(c.result);if(c.hyperlink)return String(c.hyperlink);return''}return String(c)};
const nv=(k,v)=>{v=String(v==null?'':v).trim();if(!v)return'';
 if(TELK.indexOf(k)>=0){v=d2l(v).replace(/[\s\-()]/g,'');if(/^9\d{9}$/.test(v))v='0'+v;return v}
 if(k==='nc'){v=d2l(v).replace(/\D/g,'');if(v.length>=8&&v.length<10)v=v.padStart(10,'0');return v}
 if(k==='ls')return LSO.find(o=>nk(o)===nk(v))||'';return v};
function ximp(rows){let hr=-1,cm=null;
 for(let i=0;i<Math.min(rows.length,6);i++){const m={};(rows[i]||[]).forEach((c,j)=>{const k=HM[hn(c)];if(k&&!(k in m))m[k]=j});if('name' in m){hr=i;cm=m;break}}
 if(hr<0)return false;
 const ks=Object.keys(cm).filter(k=>k!=='name'&&k!=='id'),g=(r,k)=>r[cm[k]]==null?'':r[cm[k]];
 const byId=new Map(S.students.map(s=>[String(s.id),s])),byNc=new Map(),byNm=new Map();
 S.students.forEach(s=>{const n=d2l((S.info[s.id]||{}).nc||'').replace(/\D/g,'');if(n)byNc.set(n,s);byNm.set(nk(s.name)+'|'+nk((S.info[s.id]||{}).fn||''),s)});
 const seen=new Set();let add=0,upd=0,dup=0;
 rows.slice(hr+1).forEach((r,ri)=>{r=r||[];const nm=String(g(r,'name')).trim();if(!nm)return;
  const vals={};ks.forEach(k=>{vals[k]=nv(k,g(r,k))});
  let s=('id' in cm)?byId.get(String(g(r,'id')).trim()):null;
  if(!s&&vals.nc)s=byNc.get(vals.nc);
  if(!s){s=byNm.get(nk(nm)+'|'+nk(vals.fn||''));if(!s){const c=S.students.filter(x=>nk(x.name)===nk(nm)&&(!vals.fn||!(S.info[x.id]||{}).fn));if(c.length===1)s=c[0]}}
  if(s&&seen.has(s.id)){dup++;return}
  if(s){let ch=0;if(nk(nm)!==nk(s.name)){s.name=nm;ch=1}const I=S.info[s.id]=S.info[s.id]||{};ks.forEach(k=>{if(vals[k]&&I[k]!==vals[k]){I[k]=vals[k];ch=1}});if(ch)upd++;seen.add(s.id)}
  else{const id=Date.now()+ri;S.students.push({id,name:nm,score:1000,team:S.students.length%NT+1,att:''});const I={};ks.forEach(k=>{if(vals[k])I[k]=vals[k]});if(Object.keys(I).length)S.info[id]=I;byNm.set(nk(nm)+'|'+nk(vals.fn||''),S.students[S.students.length-1]);seen.add(id);add++}});
 if(!seen.size){imm.t='در فایل، ردیفی با نام دانش‌آموز پیدا نشد';return true}
 const miss=S.students.filter(s=>!seen.has(s.id));let rm=0;
 if(miss.length&&confirm('این '+fa(miss.length)+' دانش‌آموز در فایل نیستند:\n'+miss.slice(0,8).map(s=>s.name).join('، ')+(miss.length>8?' و ...':'')+'\n\nاز برنامه حذف شوند؟\nتأیید = حذف  |  انصراف = نگه داشتن\n(حذف‌شده‌ها در سطل بازیافت می‌مانند و با دکمه‌ی ↩️ برمی‌گردند)')){const ids=new Set(miss.map(s=>s.id));S.students=S.students.filter(s=>!ids.has(s.id));S.drawn=(S.drawn||[]).filter(x=>!ids.has(x));rm=miss.length}
 save();render();try{renderAtt()}catch(e){}
 const t=[];if(add)t.push(fa(add)+' دانش‌آموز اضافه');if(upd)t.push(fa(upd)+' دانش‌آموز به‌روز');if(rm)t.push(fa(rm)+' دانش‌آموز حذف');if(dup)t.push(fa(dup)+' ردیف تکراری نادیده گرفته شد');
 imm.t=t.length?'✅ '+t.join('، ')+' (در صورت اشتباه، دکمه‌ی ↩️ بالای صفحه)':'تغییری لازم نبود؛ فایل با برنامه یکی است';return true}
const go=rows=>{if(!ximp(rows))imp(rows)};
$('ifile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{let rows;if(/\.xlsx$/i.test(f.name)){const buf=await f.arrayBuffer();try{rows=await xread(buf)}catch(er){await loadJS(EXJ);const wb=new ExcelJS.Workbook();await wb.xlsx.load(buf);rows=[];wb.worksheets[0].eachRow({includeEmpty:false},r=>{const a=[];r.eachCell({includeEmpty:true},(c,j)=>{a[j-1]=cv(c.value)});rows.push(a)})}}else rows=sp(await f.text());go(rows)}catch(x){imm.t='خواندن فایل ممکن نشد'+(x&&x.message?' ('+x.message+')':'')}e.target.value=''};
$('xout').onclick=async()=>{try{imm.t='⏳ در حال ساخت فایل…';
 const wb=new ExcelLite.Workbook(),ws=wb.addWorksheet('دانش‌آموزان',{views:[{rightToLeft:true,state:'frozen',xSplit:1,ySplit:1}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0}}),bd={style:'thin',color:{argb:'FFC9BDE6'}},B={top:bd,left:bd,bottom:bd,right:bd};
 ws.columns=XC.map(c=>({header:c[1],key:c[0],width:c[2],hidden:c[0]==='id'}));
 S.students.forEach(s=>{const I=S.info[s.id]||{};ws.addRow(XC.map(c=>c[0]==='name'?s.name:c[0]==='id'?String(s.id):(I[c[0]]==null?'':String(I[c[0]]))))});
 const last=S.students.length+31,lsc=XC.findIndex(c=>c[0]==='ls')+1;
 for(let r=1;r<=last;r++){const row=ws.getRow(r);XC.forEach((c,ci)=>{const cell=row.getCell(ci+1);cell.border=B;
  cell.alignment={horizontal:ci===0||c[0]==='ad'?'right':'center',vertical:'middle',readingOrder:'rtl',wrapText:true};
  if(r===1){cell.font={name:'Tahoma',size:11,bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7E57C2'}}}
  else{cell.font={name:'Tahoma',size:11,color:{argb:'FF222222'}};if(c[3]||c[0]==='id')cell.numFmt='@';if(ci+1===lsc)cell.dataValidation={type:'list',allowBlank:true,formulae:['"'+LSO.join(',')+'"']}}})}
 ws.getRow(1).height=34;
 const gd=wb.addWorksheet('راهنما',{views:[{rightToLeft:true,showGridLines:false}]});gd.getColumn(1).width=110;
 ['راهنمای استفاده از این فایل','',
  '۱) دانش‌آموز جدید: در برگه‌ی «دانش‌آموزان» در اولین ردیف خالی، دست‌کم نام و نام خانوادگی را بنویسید (بقیه‌ی ستون‌ها اختیاری است).',
  '۲) تغییر مشخصات: خانه‌ی مربوط را ویرایش کنید. خانه‌ی خالی، اطلاعات قبلی داخل برنامه را پاک نمی‌کند.',
  '۳) دانش‌آموزی که رفته: کل ردیفش را پاک کنید. هنگام ورود فایل، برنامه می‌پرسد حذف شود یا نه.',
  '۴) تغییر نام یک دانش‌آموز: اگر ستون «شناسه» یا «کد ملی» را دست نزنید، برنامه او را با نام تازه همان شخص می‌شناسد و دانش‌آموز تازه نمی‌سازد.',
  '۵) ستون «شناسه (دست نزنید)» مخفی است؛ برای دانش‌آموز جدید لازم نیست چیزی در آن بنویسید.',
  '۶) پس از ذخیره، فایل را در برنامه از «ویرایش دانش‌آموزان ← انتخاب فایل» وارد کنید.'].forEach((t,i)=>{const c=gd.addRow([t]).getCell(1);c.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl',wrapText:true};c.font={name:'Tahoma',size:i?11:14,bold:!i}});
 await dl('لیست-دانش‌آموزان-با-مشخصات.xlsx',await wb.xlsx.writeBuffer());imm.t=window.__dlok?'✅ فایل آماده شد':'⚠️ فایل ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در Chrome باز کنید.'}catch(x){imm.t=errT(x)}};
})();

(function(){const B={undefined:'⬜ ثبت‌نشده',p:'✅ حاضر',l:'✅ حاضر · ⏰ با تأخیر',a:'❌ غایب'};
function lst(k){const T=S.att[iso(tdy())]||{},st=S.students;let t,L;
 if(k==='all'){t='👥 همه‌ی دانش‌آموزان';L=st}else{const f={p:x=>x==='p'||x==='l',l:x=>x==='l',a:x=>x==='a'}[k];t={p:'✅ حاضرین امروز',l:'⏰ دانش‌آموزان با تأخیر امروز',a:'❌ غایبین امروز'}[k];L=st.filter(s=>f(T[s.id]))}
 $('lpan').innerHTML=`<div class="box"><b style="font-size:17px">${t} (${fa(L.length)})</b><div style="margin-top:8px;max-height:60vh;overflow:auto">${L.length?L.map((s,i)=>`<div data-sid="${s.id}" style="display:flex;justify-content:space-between;gap:8px;padding:9px 4px;border-bottom:1px solid var(--line);cursor:pointer"><span>${fa(i+1)}. <b>${esc2(s.name)}</b></span><span style="font-size:12px;color:var(--mut)">${k==='all'?'🏅 '+esc2(tname(s.team,'تیم '+fa(s.team)))+' · ':''}${B[T[s.id]]}</span></div>`).join(''):'<p class="sub">موردی وجود ندارد</p>'}</div><p class="sub" style="margin:8px 0 0">برای دیدن پرونده، روی نام بزنید.</p><button class="big" id="lcl" style="font-size:15px;padding:12px;margin-top:8px">بستن</button></div>`;$('lpan').classList.add('open')}
document.addEventListener('click',e=>{const c=e.target.closest('#stats .st');if(c){const k=c.dataset.k;if(k==='teams'||k==='rep')show(k);else lst(k);return}
 const L=$('lpan');if(!L.classList.contains('open'))return;if(e.target===L||e.target.id==='lcl')return L.classList.remove('open');const r=e.target.closest('[data-sid]');if(r){L.classList.remove('open');window.openProf(+r.dataset.sid)}});
})();
{const on=document.querySelector('nav button.on');if($('ptl'))$('ptl').textContent=on?on.textContent:''}
(function(){
const OR='پرسش و پاسخ کلاسی',cn=id=>(S.courses.find(c=>c.id===id)||{}).name||'',dt=d=>fmt(new Date(d+'T12:00:00Z')),ND=v=>v.replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x));
let P=[];
const pend=()=>{const o=[];S.exams.forEach(e=>{if(e.type===OR)return;const A=S.att[e.date];if(!A)return;S.students.forEach(s=>{if(A[s.id]==='a'&&e.scores[s.id]==null&&!(e.mk&&e.mk[s.id]))o.push({e,s})})});return o.sort((a,b)=>a.e.date.localeCompare(b.e.date))};
function rm(){const q=jp(tdy()),td=q.y+'/'+z2(q.m)+'/'+z2(q.d);P=pend();const D=[];S.exams.forEach(e=>Object.keys(e.mk||{}).forEach(id=>{const s=S.students.find(x=>x.id==id);if(s&&e.mk[id]!=='x')D.push({e,s,d:e.mk[id]})}));D.sort((a,b)=>b.d.localeCompare(a.d));
 $('mkbody').innerHTML=`<div class="card"><p class="sub" style="margin:0">دانش‌آموزی که روز آزمون غایب بوده، این‌جا می‌آید. وقتی در روز دیگری آزمون جبرانی داد، نمره و تاریخ را ثبت کنید. در گزارش‌ها مشخص می‌شود که با بقیه در یک روز امتحان نداده است.</p></div>
 <div class="card"><b>⏳ منتظر آزمون جبرانی (${fa(P.length)})</b>${P.map((x,i)=>`<div style="border-bottom:1px solid var(--line);padding:8px 0"><div><b>${esc2(x.s.name)}</b> · ${esc2(cn(x.e.course))} ${esc2(x.e.title||'')} · آزمون روز ${dt(x.e.date)}</div><div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><input data-s="${i}" type="number" step="0.5" min="0" max="${x.e.max||4}" placeholder="نمره (از ${fa(x.e.max||4)})" style="margin:0;flex:1;min-width:90px"><input data-d="${i}" value="${td}" dir="ltr" style="margin:0;flex:1;min-width:100px"><button class="sm" data-ok="${i}">✅ ثبت</button><button class="sm" data-no="${i}">معاف</button></div></div>`).join('')||'<p class="sub">موردی منتظر نیست 🎉</p>'}</div>
 <div class="card"><b>✅ آزمون‌های جبرانی انجام‌شده (${fa(D.length)})</b>${D.slice(0,30).map(x=>`<div style="border-bottom:1px solid var(--line);padding:6px 0;font-size:13px">${esc2(x.s.name)} · ${esc2(cn(x.e.course))} · آزمون روز ${dt(x.e.date)} · جبرانی در ${dt(x.d)} · نمره ${f1(nrm(x.e,x.s.id))}</div>`).join('')||'<p class="sub">هنوز ثبت نشده</p>'}</div>`}
$('mk').addEventListener('click',e=>{const b=e.target.closest('[data-ok],[data-no]');if(!b)return;const i=+(b.dataset.ok??b.dataset.no),x=P[i];if(!x)return;x.e.mk=x.e.mk||{};
 if(b.dataset.no!=null)x.e.mk[x.s.id]='x';else{const v=parseFloat($('mkbody').querySelector(`[data-s="${i}"]`).value),m=ND($('mkbody').querySelector(`[data-d="${i}"]`).value).match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);if(isNaN(v)||!m)return alert('نمره و تاریخ (مثل ۱۴۰۵/۰۸/۱۲) را درست وارد کنید');x.e.scores[x.s.id]=v;x.e.mk[x.s.id]=iso(fromJ(+m[1],+m[2],+m[3]))}
 save();rm()});
window.renderMk=rm;
})();

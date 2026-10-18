/* هنر و تربیت بدنی */
(function(){try{
const $=id=>document.getElementById(id),E=x=>esc2(x==null?'':x);
const FA=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const PF=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
const pp=d=>{const o={};PF.formatToParts(d).forEach(p=>{if(p.type==='year'||p.type==='relatedYear')o.y=+p.value;else if(p.type==='month')o.m=+p.value;else if(p.type==='day')o.d=+p.value});return o};
const ISO=d=>d.toISOString().slice(0,10),UT=s=>new Date(s+'T12:00:00Z');
const today=()=>{const t=new Date();return ISO(new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),12)))};
const pl=s=>{const p=pp(UT(s));return FA(p.y+'/'+String(p.m).padStart(2,'0')+'/'+String(p.d).padStart(2,'0'))};
const J=a=>a.length>1?a.slice(0,-1).join('، ')+' و '+a[a.length-1]:a[0]||'';
const ld=u=>new Promise(r=>{if(document.querySelector('script[src="'+u+'"]'))return r(1);const x=document.createElement('script');x.src=u;x.onload=()=>r(1);x.onerror=()=>r(0);document.head.appendChild(x)});
const H2C='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',JSP='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

const LV=[null,'نیاز به تلاش بیشتر','قابل قبول','خوب','خیلی خوب'],LC=[null,'#d12f35','#d98600','#3f9a63','#1a8f55'];
const SUBJ={
 art:{t:'هنر',ic:'🎨',first:'int',rc:['int','pre','acc'],
  ind:[['cre','خلاقیت و ایده‌پردازی'],['tool','مهارت استفاده از ابزار و مواد (رنگ‌آمیزی، کاردستی، طراحی، ترکیب مواد)'],['acc','دقت و نظم در انجام فعالیت'],['int','علاقه و مشارکت در فعالیت‌های هنری'],['pre','توانایی ارائه و توضیح اثر']],
  good:{int:'در فعالیت‌های هنری با علاقه شرکت می‌کند',cre:'در خلق آثار خلاقانه توانایی خوبی نشان می‌دهد',tool:'از ابزار و مواد هنری با مهارت استفاده می‌کند',acc:'فعالیت‌ها را با دقت و نظم انجام می‌دهد',pre:'اثر خود را به‌خوبی ارائه و توضیح می‌دهد'},
  imp:{int:'افزایش مشارکت در فعالیت‌های هنری',cre:'تقویت خلاقیت و ایده‌پردازی',tool:'بهبود مهارت استفاده از ابزار و مواد',acc:'افزایش دقت در اجرای جزئیات',pre:'ارائه و توضیح اثر'}},
 pe:{t:'تربیت بدنی',ic:'⚽',first:'par',
  ind:[['par','مشارکت و علاقه به فعالیت‌های ورزشی'],['rul','رعایت قوانین و همکاری گروهی'],['mot','مهارت‌های پایه حرکتی (دویدن، پرتاب، دریافت، تعادل، هماهنگی حرکتی) — نسبت به خودِ دانش‌آموز'],['eff','تلاش و پیشرفت فردی'],['saf','رعایت نکات ایمنی و بهداشت']],
  good:{par:'در فعالیت‌های ورزشی و گروهی مشارکت مناسبی دارد',rul:'قوانین بازی را رعایت می‌کند و با دوستان همکاری می‌کند',mot:'در مهارت‌های پایه حرکتی (دویدن، پرتاب، دریافت، تعادل و هماهنگی) پیشرفت نشان داده است',eff:'با تلاش خود روند پیشرفت مناسبی دارد',saf:'نکات ایمنی و بهداشت را رعایت می‌کند'},
  imp:{par:'افزایش مشارکت در فعالیت‌های ورزشی',rul:'رعایت بیشتر قوانین و همکاری گروهی',mot:'تقویت مهارت‌های پایه حرکتی',eff:'ادامه‌ی تلاش برای پیشرفت فردی',saf:'رعایت بیشتر نکات ایمنی و بهداشت'}}};
function sk(sid,key){return((S.skl||{})[sid]||{})[key]||null}
function descOf(sid,key,tmp,full){const D=tmp||sk(sid,key);if(!D)return'';const B=SUBJ[key],ks=((full||!B.rc)?B.ind.map(x=>x[0]):B.rc.slice()).sort((a,b)=>(a===B.first?-1:b===B.first?1:0));
 const g=[],w1=[],w2=[];ks.forEach(k=>{const v=D[k];if(!v)return;if(v>=3)g.push(B.good[k]);else if(v===2)w2.push(B.imp[k]);else w1.push(B.imp[k])});
 const P=[];if(g.length)P.push(J(g)+'.');if(w2.length)P.push('برای '+J(w2)+' با تمرین بیشتر می‌تواند عملکرد خود را ارتقا دهد.');if(w1.length)P.push('برای '+J(w1)+' نیاز به تمرین بیشتر دارد.');
 if(D.note&&D.note.trim())P.push(D.note.trim());return P.join(' ')}
let skKey='art',skSid=null,skTmp={};
function loadTmp(){const D=skSid?sk(skSid,skKey):null;skTmp=D?JSON.parse(JSON.stringify(D)):{}}
function skPersist(){if(!skSid)return;const has=Object.keys(skTmp).some(k=>k!=='ts'&&(k==='note'?(skTmp.note||'').trim():skTmp[k]));if(!has)return;S.skl=S.skl||{};(S.skl[skSid]=S.skl[skSid]||{})[skKey]=Object.assign({},skTmp,{ts:Date.now()});save()}
function skLvl(){const B=SUBJ[skKey],v=B.ind.map(x=>skTmp[x[0]]).filter(Boolean);if(!v.length)return '';const a=v.reduce((x,y)=>x+y,0)/v.length,r=a>=3.5?4:a>=2.5?3:a>=1.5?2:1;return LV[r]}
let skT=null;
function rSk(){const sel=$('sk_s');if(!sel)return;const st=S.students||[];
 if(!st.some(s=>s.id===skSid)){skSid=st[0]?st[0].id:null;loadTmp()}
 sel.innerHTML=st.map(s=>`<option value="${s.id}"${s.id===skSid?' selected':''}>${E(s.name)}${sk(s.id,skKey)?' ✅':''}</option>`).join('');
 $('sk_tabs').innerHTML=Object.keys(SUBJ).map(k=>`<button data-sk="${k}" style="flex:1;padding:10px;border-radius:12px;border:2px solid ${k===skKey?'#7e57c2':'var(--line)'};background:${k===skKey?'#7e57c2':'var(--bg2)'};color:${k===skKey?'#fff':'var(--tx)'};font:inherit;font-weight:700;cursor:pointer">${SUBJ[k].ic} ${SUBJ[k].t}</button>`).join('');
 const B=SUBJ[skKey];if(!skSid){$('sk_f').innerHTML='<p class="sub">دانش‌آموزی ثبت نشده است.</p>';$('sk_l').innerHTML='';return}
 $('sk_f').innerHTML=`<p class="sub" style="text-align:right;margin:8px 0;line-height:1.9">${skKey==='art'?'در درس هنر نمره ثبت نمی‌شود؛ فقط سطح عملکرد در هر شاخص انتخاب می‌شود و گزارش توصیفی خودکار ساخته می‌شود.':'در تربیت بدنی دانش‌آموزان با هم مقایسه نمی‌شوند؛ معیار اصلی، رشد فردی، تلاش و مشارکتِ خودِ دانش‌آموز است.'}</p>`+
 B.ind.map(([k,t])=>`<div style="margin:10px 0"><div style="font-size:13.5px;font-weight:700;margin-bottom:5px">${t}${B.rc&&!B.rc.includes(k)?' <span style="font-size:11px;font-weight:400;color:#999">(فقط ثبت شخصی؛ در کارنامه نمی‌آید)</span>':''}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">${[4,3,2,1].map(v=>`<button data-skk="${k}" data-skv="${v}" style="padding:8px 2px;border-radius:10px;border:2px solid ${LC[v]};background:${skTmp[k]===v?LC[v]:'transparent'};color:${skTmp[k]===v?'#fff':LC[v]};font:inherit;font-size:12px;font-weight:700;cursor:pointer">${LV[v]}</button>`).join('')}</div></div>`).join('')+
 `<textarea id="sk_n" rows="2" placeholder="توضیح تکمیلی معلم (اختیاری)" style="width:100%;margin-top:6px">${E(skTmp.note||'')}</textarea>
 <div style="background:#f6f2fd;color:#333;border-radius:12px;padding:10px;margin-top:8px;font-size:13px;line-height:2"><b>📝 پیش‌نمایش گزارش توصیفی:</b><br>${E(descOf(skSid,skKey,skTmp))||'<span style="color:#888">شاخص‌ها را انتخاب کنید.</span>'}</div>
 <p class="sub" id="sk_m" style="margin-top:8px">${skLvl()?'سطح کلی: <b>'+skLvl()+'</b> · ':''}✅ ذخیره‌ی خودکار فعال است</p>`;
 const done=st.filter(s=>sk(s.id,skKey)).length;
 $('sk_l').innerHTML=`<p class="sub" style="text-align:right">${B.ic} ${B.t}: ${FA(done)} از ${FA(st.length)} دانش‌آموز ارزشیابی شده‌اند.</p>`+st.map(s=>{const d=descOf(s.id,skKey);return `<div style="border-top:1px solid var(--line);padding:8px 0"><b>${E(s.name)}</b><div style="font-size:12.5px;line-height:1.9;margin-top:3px;color:${d?'inherit':'#999'}">${d?E(d):'هنوز ثبت نشده'}</div></div>`}).join('')}
document.addEventListener('click',e=>{const t=e.target.closest('[data-sk],[data-skk],[data-sksave]');if(!t||!$('skl')||!$('skl').classList.contains('on'))return;
 if(t.dataset.sk){skKey=t.dataset.sk;loadTmp();rSk();return}
 if(t.dataset.skk){const n=$('sk_n');if(n)skTmp.note=n.value;skTmp[t.dataset.skk]=+t.dataset.skv;skPersist();rSk();return}
 if(t.dataset.sksave){const n=$('sk_n');if(n)skTmp.note=n.value;S.skl=S.skl||{};(S.skl[skSid]=S.skl[skSid]||{})[skKey]=Object.assign({},skTmp,{ts:Date.now()});save();rSk();const m=$('sk_m');if(m)m.textContent='✅ ذخیره شد'}});
document.addEventListener('input',e=>{if(e.target.id==='sk_n'){skTmp.note=e.target.value;clearTimeout(skT);skT=setTimeout(()=>{skPersist();const d=$('sk_l');},400)}});
document.addEventListener('change',e=>{if(e.target.id==='sk_n'){skTmp.note=e.target.value;skPersist();rSk();return}if(e.target.id==='sk_s'){skSid=+e.target.value;loadTmp();rSk()}});
{const g0=window.genDesc;if(typeof g0==='function')window.genDesc=function(id){let t=g0.apply(this,arguments);const x=['art','pe'].map(k=>{const d=descOf(id,k);return d?SUBJ[k].t+': '+d:''}).filter(Boolean).join(' ');return x?(t?t+' ':'')+x:t}}
window.skillDesc=descOf;
window.skillLevel=(sid,key)=>{const D=sk(sid,key),B=SUBJ[key];if(!D||!B)return null;const v=(B.rc||B.ind.map(x=>x[0])).map(k=>D[k]).filter(Boolean);return v.length?Math.min(4,Math.max(1,Math.round(v.reduce((a,b)=>a+b,0)/v.length))):null};

const ACAD=['پاسخ به سؤال','حل مسئله روی تخته','ارائه'],isA=k=>ACAD.includes(k);
const gk=x=>x.gb?'b'+x.gb:'o'+x.grp+'|'+x.date+'|'+x.kind+'|'+x.type+'|'+Math.floor((x.ts||0)/10000);
const GC='#1a8f55',OC='#e08a00',PC='#4a2f9a';
let YC=null;
function yearDays(){const c=pp(UT(today())),SYr=c.m>=7?c.y:c.y-1;if(YC&&YC.sy===SYr)return YC;
 let d=new Date(Date.UTC(SYr+621,8,10,12));while(!(pp(d).m===7&&pp(d).d===1))d=new Date(d.getTime()+864e5);
 const L=[];for(;;){const p=pp(d);if(p.y>SYr+1||(p.y===SYr+1&&p.m>3))break;L.push({iso:ISO(d),y:p.y,m:p.m,d:p.d});d=new Date(d.getTime()+864e5)}
 return YC={sy:SYr,days:L}}
const st={mode:'d',date:today(),month:null},MS=[7,8,9,10,11,12,1,2,3],WD=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const wdi=iso=>(UT(iso).getUTCDay()+1)%7,wkS=iso=>ISO(new Date(UT(iso).getTime()-wdi(iso)*864e5));
function actDays(){const Y=yearDays(),a=Y.days[0].iso,b=Y.days[Y.days.length-1].iso;return[...new Set((S.activities||[]).filter(x=>x.sid!=null&&x.date>=a&&x.date<=b).map(x=>x.date))].sort()}
function actWeeks(){const o=[],seen={};actDays().forEach(d=>{const w=wkS(d);if(!seen[w]){seen[w]=1;o.push({ws:w,first:d})}});return o}
function actMonths(){const h={};actDays().forEach(d=>h[pp(UT(d)).m]=1);return MS.filter(m=>h[m])}
function range(){const Y=yearDays(),AD=actDays();
 if(AD.length&&!AD.includes(st.date)){const lt=AD.filter(x=>x<=st.date);st.date=lt.length?lt[lt.length-1]:AD[0]}
 if(!AD.length&&!Y.days.some(x=>x.iso===st.date))st.date=today()>Y.days[Y.days.length-1].iso?Y.days[Y.days.length-1].iso:Y.days[0].iso;
 if(st.mode==='d')return{a:st.date,b:st.date,days:[st.date],label:'گزارش روزانه · '+pl(st.date)};
 if(st.mode==='w'){const d=UT(st.date),a=new Date(d.getTime()-((d.getUTCDay()+1)%7)*864e5),L=[];for(let i=0;i<7;i++)L.push(ISO(new Date(a.getTime()+i*864e5)));return{a:L[0],b:L[6],days:L,label:'گزارش هفتگی · '+pl(L[0])+' تا '+pl(L[6])}}
 if(st.mode==='m'){const AM=actMonths();if(!MS.includes(st.month)||(AM.length&&!AM.includes(st.month))){const cm=pp(UT(st.date)).m;st.month=AM.length?(AM.includes(cm)?cm:AM[AM.length-1]):(MS.includes(pp(UT(today())).m)?pp(UT(today())).m:7)}const L=Y.days.filter(x=>x.m===st.month);return{a:L[0].iso,b:L[L.length-1].iso,days:L.map(x=>x.iso),label:'گزارش ماهانه · '+MN[st.month-1]+' '+FA(L[0].y)}}
 return{a:Y.days[0].iso,b:Y.days[Y.days.length-1].iso,days:Y.days.map(x=>x.iso),label:'گزارش سال تحصیلی '+FA(Y.sy)+'-'+FA(Y.sy+1)}}
const lab=(x)=>x.type==='positive'?(isA(x.kind)?'مسلط':'مثبت'):(isA(x.kind)?'نیاز به تمرین':'نیاز به تلاش');
function calc(){const r=range(),A=(S.activities||[]).filter(x=>x.date>=r.a&&x.date<=r.b&&x.sid!=null);
 const by=new Map(),seen=new Set(),U=[];
 A.forEach(x=>{let o=by.get(x.sid);if(!o){o={sid:x.sid,p:0,e:0,n:0,list:[]};by.set(x.sid,o)}x.type==='positive'?o.p++:o.e++;o.n++;o.list.push(x);
  if(x.grp){const k=gk(x);if(seen.has(k))return;seen.add(k)}U.push(x)});
 const nm=id=>(S.students.find(s=>s.id===id)||{}).name||'؟';
 const rows=[...by.values()].map(o=>Object.assign(o,{name:nm(o.sid)})).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name,'fa'));
 const c={ap:0,ae:0,bp:0,be:0,grp:0},K=new Map();
 U.forEach(x=>{const p=x.type==='positive',a=isA(x.kind);if(a)p?c.ap++:c.ae++;else p?c.bp++:c.be++;if(x.grp)c.grp++;const k=x.kind||'سایر';const o=K.get(k)||{k,p:0,e:0};p?o.p++:o.e++;K.set(k,o)});
 const Y=yearDays().days,T=new Map();
 if(st.mode==='y'){const mo=[7,8,9,10,11,12,1,2,3];mo.forEach(m=>T.set(m,{l:MN[m-1],p:0,e:0}));U.forEach(x=>{const d=Y.find(q=>q.iso===x.date);if(!d)return;const o=T.get(d.m);if(o)x.type==='positive'?o.p++:o.e++})}
 else if(st.mode!=='d'){const W=['ش','ی','د','س','چ','پ','ج'];r.days.forEach(d=>T.set(d,{l:st.mode==='w'?W[wdi(d)]:FA(pp(UT(d)).d),p:0,e:0}));U.forEach(x=>{const o=T.get(x.date);if(o)x.type==='positive'?o.p++:o.e++})}
 return{r,rows,U,c,K:[...K.values()].sort((a,b)=>(b.p+b.e)-(a.p+a.e)),T:[...T.values()].filter(x=>x.p+x.e>0)}}
const ttl=t=>`<div style="font-weight:800;color:${PC};font-size:14px;margin:0 0 10px;border-right:4px solid #7e57c2;padding-right:8px">${t}</div>`;
const box=h=>`<div style="background:#fff;border:1px solid #e6def5;border-radius:14px;padding:12px 14px">${h}</div>`;
const dot=c=>`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-left:5px"></span>`;
const kp=(v,l,c,b)=>`<div style="flex:1;min-width:104px;background:${b};border-radius:12px;padding:10px 6px;text-align:center"><div style="font-size:22px;font-weight:800;color:${c}">${v}</div><div style="font-size:11.5px;color:#555;margin-top:2px">${l}</div></div>`;
function donut(p,e,lp,le,t){const n=p+e;if(!n)return`<div style="flex:1;min-width:210px;text-align:center"><div style="font-weight:700;font-size:13px;margin-bottom:6px">${t}</div><div style="color:#999;font-size:12px;padding:30px 0">ثبتی نیست</div></div>`;
 const R=42,C=2*Math.PI*R,a=C*p/n;
 return`<div style="flex:1;min-width:210px"><div style="font-weight:700;font-size:13px;text-align:center;margin-bottom:6px">${t}</div><div style="display:flex;align-items:center;gap:12px;justify-content:center"><svg width="104" height="104" viewBox="0 0 110 110"><circle cx="55" cy="55" r="${R}" fill="none" stroke="${OC}" stroke-width="16"/><circle cx="55" cy="55" r="${R}" fill="none" stroke="${GC}" stroke-width="16" stroke-dasharray="${a} ${C-a}" transform="rotate(-90 55 55)"/><text x="55" y="61" text-anchor="middle" font-size="19" font-weight="800" fill="#333">${FA(Math.round(p*100/n))}٪</text></svg><div style="font-size:12.5px;line-height:2.1"><div>${dot(GC)}${lp}: <b>${FA(p)}</b></div><div>${dot(OC)}${le}: <b>${FA(e)}</b></div></div></div></div>`}
const bar=(name,p,e,mx,w)=>`<div style="display:flex;align-items:center;gap:8px;margin:5px 0"><div style="width:${w||128}px;font-size:12.5px;font-weight:700;text-align:right;word-break:break-word;overflow:hidden;text-overflow:ellipsis">${E(name)}</div><div style="flex:1;display:flex;height:15px;background:#f1edf8;border-radius:8px;overflow:hidden"><div style="width:${p/mx*100}%;background:${GC}"></div><div style="width:${e/mx*100}%;background:${OC}"></div></div><b style="width:26px;text-align:center;font-size:12.5px">${FA(p+e)}</b></div>`;
function trend(T){const mx=Math.max(1,...T.map(x=>x.p+x.e));return`<div style="display:flex;align-items:flex-end;gap:${T.length>12?2:6}px;height:120px;border-bottom:2px solid #d9cff0;padding-top:4px">${T.map(x=>`<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;align-items:stretch">${x.p+x.e?`<div style="text-align:center;font-size:10px;color:#555">${FA(x.p+x.e)}</div>`:''}<div style="height:${x.e/mx*100}px;background:${OC};border-radius:3px 3px 0 0"></div><div style="height:${x.p/mx*100}px;background:${GC}"></div></div>`).join('')}</div><div style="display:flex;gap:${T.length>12?2:6}px;margin-top:3px">${T.map(x=>`<div style="flex:1;text-align:center;font-size:${T.length>12?8:10.5}px;color:#666;white-space:nowrap;overflow:hidden">${x.l}</div>`).join('')}</div>`}
function build(){const D=calc(),r=D.r,P=S.prof||{},tot=(S.students||[]).length,c=D.c;
 const head=`<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #7e57c2;padding-bottom:10px"><div style="width:70px">${P.logo?`<img src="${P.logo}" style="height:56px;max-width:70px;object-fit:contain">`:''}</div><div style="flex:1;text-align:center"><div style="font-size:21px;font-weight:800;color:${PC}">گزارش فعالیت‌های کلاسی</div><div style="font-size:13.5px;color:#444;margin-top:5px;font-weight:700">${E(r.label)}</div><div style="font-size:11.5px;color:#777;margin-top:4px">${[P.school&&E(P.school),P.grade&&'پایه '+E(P.grade)+(P.sec?' ('+E(P.sec)+')':''),P.teacher&&'آموزگار: '+E(P.teacher),P.principal&&'مدیر: '+E(P.principal)].filter(Boolean).join(' | ')}</div></div><div style="width:70px"></div></div>`;
 const B=[];
 if(!D.U.length){B.push(box('<div style="text-align:center;color:#888;padding:40px 0;font-size:14px">در این بازه فعالیتی ثبت نشده است.</div>'));return{head,blocks:B,D}}
 B.push(box(ttl('📌 خلاصه در یک نگاه')+`<div style="display:flex;gap:8px;flex-wrap:wrap">${kp(FA(D.rows.length)+' از '+FA(tot),'دانش‌آموز فعال',PC,'#efe9fb')}${kp(FA(D.U.length),'ثبت فعالیت',PC,'#efe9fb')}${kp(FA(c.ap+c.bp),'مسلط / مثبت',GC,'#d8f3e3')}${kp(FA(c.ae+c.be),'نیاز به تمرین / تلاش',OC,'#fff1cf')}</div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;border-top:1px dashed #e0d6f3;padding-top:12px">${donut(c.ap,c.ae,'مسلط','نیاز به تمرین','🎓 فعالیت‌های درسی')}${donut(c.bp,c.be,'مثبت','نیاز به تلاش','🌟 مشارکت و رفتار')}</div>${c.grp?`<div style="font-size:12px;color:#666;margin-top:8px">👥 فعالیت‌های گروهی: ${FA(c.grp)} ثبت</div>`:''}`));
 if(st.mode!=='d')B.push(box(ttl(st.mode==='w'?'📈 فعالیت هر روزِ هفته':st.mode==='m'?'📈 فعالیت هر روزِ ماه':'📈 فعالیت هر ماه')+trend(D.T)+`<div style="font-size:11.5px;margin-top:6px">${dot(GC)}مسلط/مثبت ${dot(OC)}نیاز به تمرین/تلاش</div>`));
 B.push(box(ttl('🧩 فعالیت‌ها به تفکیک نوع')+(()=>{const mx=Math.max(1,...D.K.map(x=>x.p+x.e));return D.K.map(x=>bar(x.k,x.p,x.e,mx,150)).join('')})()));
 const mx=Math.max(1,...D.rows.map(x=>x.n));
 for(let i=0;i<D.rows.length;i+=14)B.push(box(ttl(i?'👥 مشارکت دانش‌آموزان (ادامه)':'👥 مشارکت دانش‌آموزان — فقط دانش‌آموزان فعال')+D.rows.slice(i,i+14).map(x=>bar(x.name,x.p,x.e,mx)).join('')+(i+14>=D.rows.length?`<div style="font-size:11.5px;margin-top:6px">${dot(GC)}مسلط/مثبت ${dot(OC)}نیاز به تمرین/تلاش</div>`:'')));
 const top=D.rows.filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,5),need=D.rows.filter(x=>x.e>0).sort((a,b)=>b.e-a.e).slice(0,5);
 const chips=(L,k,c,b)=>L.map(x=>`<span style="display:inline-block;background:${b};color:${c};border-radius:999px;padding:4px 11px;margin:3px;font-size:12.5px;font-weight:700">${E(x.name)} · ${FA(x[k])}</span>`).join('');
 B.push(box(ttl('🔎 نگاه سریع')+`<div style="font-size:12.5px;font-weight:700;margin-bottom:2px">🌟 بیشترین فعالیت موفق</div>${top.length?chips(top,'p',GC,'#d8f3e3'):'<span style="color:#999;font-size:12px">—</span>'}<div style="font-size:12.5px;font-weight:700;margin:10px 0 2px">🔄 نیازمند تمرین و حمایت بیشتر</div>${need.length?chips(need,'e','#a85f00','#fff1cf'):'<span style="color:#999;font-size:12px">موردی نیست 🎉</span>'}`));
 if(st.mode==='d'||st.mode==='w'){const wh=x=>{try{return window.ACTX&&ACTX.where?ACTX.where(x):''}catch(e){return''}};
  for(let i=0;i<D.rows.length;i+=6)B.push(box(ttl(i?'🗒️ ریز فعالیت‌ها (ادامه)':'🗒️ ریز فعالیت‌ها')+D.rows.slice(i,i+6).map(o=>`<div style="border-top:1px solid #eee;padding:6px 0"><b style="font-size:13px">${E(o.name)}</b><div style="margin-top:3px">${o.list.sort((a,b)=>(a.ts||0)-(b.ts||0)).slice(0,8).map(x=>`<span style="display:inline-block;font-size:11.5px;margin:2px;padding:3px 9px;border-radius:8px;background:${x.type==='positive'?'#d8f3e3':'#fff1cf'};color:${x.type==='positive'?'#136b3d':'#8a5200'}">${E([x.kind,wh(x),lab(x)].filter(Boolean).join(' · '))}${x.note?' — '+E(x.note):''}</span>`).join('')}${o.list.length>8?`<span style="font-size:11px;color:#777"> و ${FA(o.list.length-8)} مورد دیگر</span>`:''}</div></div>`).join('')))}
 return{head,blocks:B.map(b=>`<div style="margin-top:14px">${b}</div>`),D}}
function rAr(){const pv=$('ar_pv');if(!pv)return;const Y=yearDays();
 $('ar_tabs').innerHTML=[['d','روز'],['w','هفته'],['m','ماه'],['y','سال تحصیلی']].map(([k,t])=>`<button data-ar="${k}" style="flex:1;padding:9px 4px;border-radius:12px;border:2px solid ${st.mode===k?'#7e57c2':'var(--line)'};background:${st.mode===k?'#7e57c2':'var(--bg2)'};color:${st.mode===k?'#fff':'var(--tx)'};font:inherit;font-weight:700;cursor:pointer">${t}</button>`).join('');
 const r=range();
 const AD=actDays();
 $('ar_ctl').innerHTML=!AD.length?'<span style="font-size:13px">هنوز فعالیتی ثبت نشده است؛ بعد از ثبت فعالیت، روزهای دارای فعالیت این‌جا نمایش داده می‌شود.</span>':
 st.mode==='d'?(()=>{const cu=Y.days.find(x=>x.iso===st.date)||Y.days[0],AM=actMonths();return `<button class="sm" data-arn="-1">›</button><select id="ar_pd" class="fs" style="margin:0;flex:1">${AD.filter(d=>pp(UT(d)).m===cu.m).map(d=>`<option value="${d}"${d===st.date?' selected':''}>${WD[wdi(d)]} ${FA(pp(UT(d)).d)}</option>`).join('')}</select><select id="ar_pm" class="fs" style="margin:0;flex:2">${AM.map(m=>`<option value="${m}"${m===cu.m?' selected':''}>${MN[m-1]} ${FA(m>=7?Y.sy:Y.sy+1)}</option>`).join('')}</select><button class="sm" data-arn="1">‹</button>`})():
 st.mode==='w'?(()=>{const cw=wkS(st.date);return `<button class="sm" data-arn="-1">›</button><select id="ar_pw" class="fs" style="margin:0;flex:1">${actWeeks().map(w=>{const e=ISO(new Date(UT(w.ws).getTime()+6*864e5));return `<option value="${w.first}"${w.ws===cw?' selected':''}>${pl(w.ws)} تا ${pl(e)}</option>`}).join('')}</select><button class="sm" data-arn="1">‹</button>`})():
 st.mode==='m'?`<select id="ar_mo" class="fs" style="margin:0;flex:1">${actMonths().map(m=>`<option value="${m}"${m===st.month?' selected':''}>${MN[m-1]} ${FA(m>=7?Y.sy:Y.sy+1)}</option>`).join('')}</select>`:`<span style="font-size:13px">سال تحصیلی ${FA(Y.sy)}-${FA(Y.sy+1)} (فقط ماه‌های دارای فعالیت در نمودار)</span>`;
 const B=build();pv.innerHTML=B.head+B.blocks.join('')}
async function pdf(){const m=$('ar_msg'),say=t=>{m.textContent=t};
 try{say('در حال ساخت PDF…');const X=window.__pdfx;if(!X){say('❌ ابزار PDF برنامه در دسترس نیست');return}
  await X.pdfLibs();
  try{await document.fonts.ready}catch(e){}
  const D=build(),pages=[],mk=()=>{const el=document.createElement('div');el.style.cssText='position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:#fff;color:#222;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;padding:30px 34px;box-sizing:border-box;overflow:hidden';el.innerHTML=D.head;document.body.appendChild(el);pages.push(el);return el},LIM=1030;
  let el=mk(),cnt=0;
  D.blocks.forEach(b=>{const w=document.createElement('div');w.innerHTML=b;el.appendChild(w);if(cnt&&w.getBoundingClientRect().bottom-el.getBoundingClientRect().top>LIM-20){w.remove();el=mk();el.appendChild(w);cnt=0}cnt++});
  if(!window.sigAfter(el,1060)){el=mk();window.sigAfter(el,1060)}
  const n=pages.length;pages.forEach((p,i)=>p.insertAdjacentHTML('beforeend',`<div style="position:absolute;bottom:14px;left:0;right:0;text-align:center;font-size:11px;color:#777">صفحه ${FA(i+1)} از ${FA(n)}</div>`));
  const doc=new (window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'});
  for(let i=0;i<n;i++){const cv=await X.rast(pages[i]);if(i)doc.addPage();doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}
  pages.forEach(p=>p.remove());
  const ok=await window.dlFile('class-activity-'+st.mode+'-'+range().a+'.pdf',doc.output('arraybuffer'));say(ok?'✅ PDF آماده شد':'⚠️ PDF ساخته شد ولی مرورگر اجازه‌ی دانلود نداد؛ برنامه را در Chrome از آدرس سایت باز کنید.')}
 catch(e){say('❌ ساخت PDF ناموفق بود: '+(e&&e.message||e))}}
{const pb=$('ar_pdf');if(pb)pb.onclick=pdf}
document.addEventListener('click',e=>{const t=e.target.closest('[data-ar],[data-arn]');if(!t||!$('arep')||!$('arep').classList.contains('on'))return;
 if(t.dataset.ar){st.mode=t.dataset.ar;rAr();return}
 if(t.dataset.arn){const n=+t.dataset.arn;range();
  if(st.mode==='w'){const W=actWeeks(),i=W.findIndex(w=>w.ws===wkS(st.date));if(i>=0&&W[i+n])st.date=W[i+n].first}
  else{const L=actDays(),i=L.indexOf(st.date);if(i>=0&&L[i+n])st.date=L[i+n]}
  rAr()}});
document.addEventListener('change',e=>{if(e.target.id==='ar_pd'||e.target.id==='ar_pw'){st.date=e.target.value;rAr()}else if(e.target.id==='ar_pm'){const mm=+e.target.value,L=actDays().filter(d=>pp(UT(d)).m===mm),cd=pp(UT(st.date)).d;st.date=L.find(d=>pp(UT(d)).d>=cd)||L[L.length-1];rAr()}else if(e.target.id==='ar_mo'){st.month=+e.target.value;rAr()}});

[['skl','🎨 هنر و تربیت بدنی'],['arep','📊 گزارش فعالیت کلاسی']].forEach(([id,t])=>{if(!pages.some(q=>q[0]===id))pages.push([id,t])});
const _s=window.show;window.show=function(id){_s.apply(this,arguments);try{if(id==='skl')rSk();if(id==='arep')rAr()}catch(e){console.error(e)}};
}catch(err){console.error('art-pe/activity-report module',err)}})();

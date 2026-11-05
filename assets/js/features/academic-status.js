/* 🎯 وضعیت تحصیلی یکپارچه — دفتر روزانه + ارزشیابی‌ها/آزمون‌ها + تکالیف + فعالیت کلاسی + حضور و غیاب
   - فقط می‌خواند؛ هیچ داده‌ای نمی‌نویسد (منبع داده‌ها: S.dj, S.exams, S.hwl, S.activities, S.att).
   - خروجی ۱: کارت «وضعیت تحصیلی کلاس» در داشبورد معلم (#asxHome)
   - خروجی ۲: بلوک «وضعیت تحصیلی» در کارنامه‌ی دانش‌آموز (window.ASX.cardHtml → sCard در app-core)
   - برای حذف کامل ویژگی: این فایل را از assets/js/boot/modules.js و sw.js بردارید. */
(function(){try{
if(window.__asxLoaded)return;window.__asxLoaded=1;
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const f1=v=>v==null?'—':fa((Math.round(v*10)/10).toFixed(1).replace('.','٫'));
const pc=v=>v==null?'—':fa(Math.round(v))+'٪';
const todayIso=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)};
const addD=(k,n)=>{const d=new Date(k+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const SPEC={sp_emla:'املا',sp_ensha:'انشا و نگارش'};

/* ───── سطوح و وضعیت‌ها ───── */
const LV={4:{t:'خیلی خوب',c:'#1a8f55'},3:{t:'خوب',c:'#5a9f2a'},2:{t:'قابل قبول',c:'#d98a00'},1:{t:'نیاز به تلاش',c:'#d03a3a'}};
const lv=v=>v==null?null:Math.min(4,Math.max(1,Math.round(v)));
const lvCol=v=>v==null?'#94a3b8':LV[lv(v)].c;
const STAT={
 top:{k:'top',t:'عالی',i:'🌟',c:'#157a47',bg:'#e3f5ec'},
 good:{k:'good',t:'خوب',i:'👍',c:'#3f7f1f',bg:'#ecf6df'},
 ok:{k:'ok',t:'در مسیر پیشرفت',i:'🟡',c:'#a96a00',bg:'#fff3d6'},
 risk:{k:'risk',t:'نیازمند توجه',i:'🚨',c:'#b3262c',bg:'#fde7e8'},
 none:{k:'none',t:'بدون ارزشیابی',i:'⚪',c:'#64748b',bg:'#eef1f5'}};
const statOf=a=>a==null?STAT.none:a>=3.5?STAT.top:a>=2.75?STAT.good:a>=2?STAT.ok:STAT.risk;

/* ───── ابزارهای داده ───── */
const nrmOf=(e,id)=>{try{return typeof nrm==='function'?nrm(e,id):null}catch(x){return null}};
const isExcused=(k,sid)=>{try{return typeof window.isExc==='function'&&!!window.isExc(k,sid)}catch(x){return false}};
const inR=(k,from,to)=>!!k&&(!from||k>=from)&&(!to||k<=to);
const wmean=L=>{let s=0,w=0;L.forEach(x=>{if(x&&x.v!=null&&!isNaN(x.v)){s+=x.v*x.w;w+=x.w}});return w?s/w:null};
const courseName=id=>{const c=(S.courses||[]).find(x=>String(x.id)===String(id));return c?c.name:(SPEC[id]||'عمومی')};
const absentOn=(k,sid)=>((S.att||{})[k]||{})[sid]==='a';

/* ───── محاسبه‌ی وضعیت همه‌ی دانش‌آموزان در یک بازه ───── */
function calc(from,to){
 const sts=S.students||[],R=new Map(),order=[];
 const mk=s=>({s,cr:{},samples:[],init:[],att:{p:0,a:0,l:0,e:0},hw:{d:0,p:0,n:0},act:{p:0,e:0},ok:0,no:0,pp:0,pn:0,notes:[]});
 sts.forEach(s=>R.set(String(s.id),mk(s)));
 const crs=(r,name)=>{if(!r.cr[name]){r.cr[name]={name,dj:[],ex:[],g:{1:0,2:0,3:0,4:0},ok:0,no:0,pp:0,pn:0,hd:0,ht:0,exT:[]}}if(order.indexOf(name)<0)order.push(name);return r.cr[name]};
 const D=S.dj||{},ses=D.ses||{};
 /* ۱) دفتر روزانه */
 Object.keys(D.m||{}).forEach(key=>{
  const p=key.split('|'),k=p[0];if(!inR(k,from,to))return;
  const ss=ses[k+'|'+p[1]],it=ss&&(ss.it||{})[p[2]];if(!it)return;
  const name=courseName(ss.c),marks=D.m[key]||{},pmk=(D.pm||{})[key]||{};
  Object.keys(marks).forEach(sid=>{
   const r=R.get(String(sid));if(!r||absentOn(k,sid))return;
   const v=marks[sid],c=crs(r,name);
   if(it.t==='d'){if(v===1){r.ok++;c.ok++}else{r.no++;c.no++}return}
   if(typeof v!=='number'||v<1||v>4)return;
   c.dj.push({v,k});c.g[v]++;
   const q=pmk[sid];if(it.t==='p'&&q){r.pp+=q[0]||0;r.pn+=q[1]||0;c.pp+=q[0]||0;c.pn+=q[1]||0}
   const w=it.t==='p'?.5:1;r.samples.push({v,k,w});
   if(/آغازین/.test((it.cg||'')+' '+(it.n||'')))r.init.push(v);
   const nt=(D.n||{})[key+'|'+sid];if(nt)r.notes.push({k,a:it.n||'',t:nt,c:name})});
 });
 /* ۲) آزمون‌ها و ارزشیابی‌های «درس‌ها و آزمون‌ها» */
 (S.exams||[]).forEach(e=>{
  if(!e||!inR(e.date,from,to))return;const name=courseName(e.course);
  sts.forEach(s=>{const r=R.get(String(s.id)),v=nrmOf(e,s.id);if(!r||v==null||isNaN(v))return;
   const c=crs(r,name);c.ex.push({v,k:e.date,t:e.type||''});c.exT.push(e.type||'');r.samples.push({v,k:e.date,w:1.5});
   if(/آغازین/.test(e.type||''))r.init.push(v)});
 });
 /* ۳) تکالیف (هم از دفتر روزانه، هم از صفحه‌ی تکالیف: هر دو در S.hwl) */
 (S.hwl||[]).forEach(h=>{if(!h||!inR(h.date,from,to))return;const name=h.course?courseName(h.course):null;
  Object.keys(h.st||{}).forEach(sid=>{const r=R.get(String(sid)),v=h.st[sid];if(!r||!(v==='d'||v==='p'||v==='n'))return;r.hw[v]++;
   if(name){const c=crs(r,name);c.ht++;c.hd+=v==='d'?1:v==='p'?.5:0}})});
 /* ۴) فعالیت کلاسی */
 (S.activities||[]).forEach(x=>{if(!x||!inR(x.date,from,to))return;const r=R.get(String(x.sid));if(!r)return;x.type==='positive'?r.act.p++:r.act.e++});
 /* ۵) حضور و غیاب */
 Object.keys(S.att||{}).forEach(k=>{if(!inR(k,from,to))return;const day=S.att[k]||{};
  R.forEach((r,sid)=>{const v=day[sid];if(!v)return;if(v==='p')r.att.p++;else if(v==='l')r.att.l++;else if(v==='a'){if(isExcused(k,sid))r.att.e++;else r.att.a++}})});
 /* جمع‌بندی هر دانش‌آموز */
 const rows=[];
 R.forEach(r=>{
  Object.values(r.cr).forEach(c=>{
   const L=[].concat(c.dj.map(x=>({v:x.v,w:1})),c.ex.map(x=>({v:x.v,w:1.5})));
   c.avgDj=c.dj.length?c.dj.reduce((a,x)=>a+x.v,0)/c.dj.length:null;
   c.avgEx=c.ex.length?c.ex.reduce((a,x)=>a+x.v,0)/c.ex.length:null;
   c.avg=wmean(L);c.n=c.dj.length+c.ex.length;c.hwP=c.ht?c.hd/c.ht*100:null;
   const T=[].concat(c.dj,c.ex).sort((a,b)=>a.k.localeCompare(b.k));
   c.trend=trendOf(T.map(x=>x.v))});
  r.avg=wmean(r.samples);r.n=r.samples.length;
  r.djAvg=avgOf(Object.values(r.cr).flatMap(c=>c.dj.map(x=>x.v)));
  r.exAvg=avgOf(Object.values(r.cr).flatMap(c=>c.ex.map(x=>x.v)));
  r.initAvg=avgOf(r.init);
  const ht=r.hw.d+r.hw.p+r.hw.n;r.hwP=ht?(r.hw.d+r.hw.p*.5)/ht*100:null;r.hwN=ht;
  const at=r.att.p+r.att.l+r.att.a;r.attP=at?(r.att.p+r.att.l)/at*100:null;r.attN=at;
  const okT=r.ok+r.no;r.okP=okT?r.ok/okT*100:null;
  r.trend=trendOf(r.samples.slice().sort((a,b)=>a.k.localeCompare(b.k)).map(x=>x.v));
  r.st=statOf(r.avg);
  const F=[];
  if(r.avg!=null&&r.trend<0)F.push({t:'📉 روند نزولی',c:'#b3262c'});
  if(r.avg!=null&&r.trend>0)F.push({t:'📈 روند صعودی',c:'#157a47'});
  if(r.hwP!=null&&r.hwN>=3&&r.hwP<60)F.push({t:'📚 تکلیف کم ('+pc(r.hwP)+')',c:'#a96a00'});
  if(r.attP!=null&&r.attN>=5&&r.attP<85)F.push({t:'🚪 غیبت زیاد ('+pc(r.attP)+' حضور)',c:'#b3262c'});
  const weak=Object.values(r.cr).filter(c=>c.avg!=null&&c.n>=2&&c.avg<2).map(c=>c.name);
  if(weak.length)F.push({t:'🔄 ضعیف در: '+weak.join('، '),c:'#b3262c'});
  if(r.pn>=3&&r.pn>r.pp)F.push({t:'➖ پاسخ‌های منفی بیشتر از مثبت',c:'#a96a00'});
  r.flags=F;rows.push(r)});
 const names=(S.courses||[]).map(c=>c.name).filter(n=>order.indexOf(n)>=0);
 order.forEach(n=>{if(names.indexOf(n)<0)names.push(n)});
 /* جمع کلاس */
 const dist={top:0,good:0,ok:0,risk:0,none:0};rows.forEach(r=>dist[r.st.k]++);
 const withA=rows.filter(r=>r.avg!=null);
 const cls={avg:withA.length?withA.reduce((a,r)=>a+r.avg,0)/withA.length:null,samples:rows.reduce((a,r)=>a+r.n,0),
  hwP:avgOf(rows.map(r=>r.hwP).filter(v=>v!=null)),attP:avgOf(rows.map(r=>r.attP).filter(v=>v!=null)),dist,
  courseAvg:names.map(n=>({n,v:avgOf(rows.map(r=>r.cr[n]&&r.cr[n].avg).filter(v=>v!=null))}))};
 return{rows,names,cls,from,to};
}
function avgOf(L){return L&&L.length?L.reduce((a,x)=>a+x,0)/L.length:null}
/* روند: میانگین نیمه‌ی دوم نمونه‌ها − نیمه‌ی اول (۰ = ثابت/کم‌داده؛ ۱ = صعودی؛ −۱ = نزولی) */
function trendOf(V){if(V.length<4)return 0;const h=Math.floor(V.length/2),a=avgOf(V.slice(0,h)),b=avgOf(V.slice(V.length-h)),d=b-a;return d>=.35?1:d<=-.35?-1:0}
const trendI=t=>t>0?'<span style="color:#157a47;font-weight:900" title="روند صعودی">▲</span>':t<0?'<span style="color:#b3262c;font-weight:900" title="روند نزولی">▼</span>':'<span style="color:#94a3b8" title="ثابت یا داده‌ی کم">●</span>';

/* ───── اجزای نمایشی با استایل درون‌خطی (برای صفحه، چاپ و PDF) ───── */
const pill=(st,extra)=>`<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11.5px;font-weight:800;color:${st.c};background:${st.bg};white-space:nowrap;${extra||''}">${st.i} ${st.t}</span>`;
const chip=(txt,c)=>`<span style="display:inline-block;padding:2px 9px;margin:2px;border-radius:8px;font-size:11px;font-weight:700;color:${c};background:${c}18;border:1px solid ${c}33">${E(txt)}</span>`;
const heat=v=>{const c=lvCol(v);return `<span style="display:inline-block;min-width:34px;padding:3px 4px;border-radius:7px;text-align:center;font-size:11.5px;font-weight:900;color:#fff;background:${v==null?'#cbd5e1':c}">${v==null?'—':f1(v)}</span>`};
/* نوار چهارپارچه‌ی سطوح (با table تا در PDF هم درست دیده شود) */
function stack(g,w){const t=g[1]+g[2]+g[3]+g[4];if(!t)return '<span style="color:#94a3b8;font-size:11px">—</span>';
 const cell=l=>g[l]?`<td style="width:${g[l]/t*100}%;background:${LV[l].c};height:10px;padding:0"></td>`:'';
 return `<table style="border-collapse:collapse;width:${w||90}px;border-radius:5px;overflow:hidden;display:inline-table;vertical-align:middle" title="خیلی خوب ${g[4]} · خوب ${g[3]} · قابل قبول ${g[2]} · نیاز به تلاش ${g[1]}"><tr>${cell(4)}${cell(3)}${cell(2)}${cell(1)}</tr></table>`}
const tile=(ic,lab,val,sub,c)=>`<div style="flex:1 1 112px;min-width:104px;background:#fff;border:1px solid #e3d9f3;border-radius:12px;padding:8px 6px;text-align:center"><div style="font-size:11px;color:#6b5b8c;font-weight:700">${ic} ${lab}</div><div style="font-size:19px;font-weight:900;color:${c||'#3b2a55'};margin:2px 0">${val}</div><div style="font-size:10.5px;color:#8a7aa6">${sub||'&nbsp;'}</div></div>`;

/* ───── بلوک کارنامه‌ی دانش‌آموز ───── */
function cardHtml(sid){
 try{
  const B=calc('',todayIso()),r=B.rows.find(x=>String(x.s.id)===String(sid));if(!r)return '';
  if(!r.n&&!r.attN&&!r.hwN&&!r.act.p&&!r.act.e&&!(r.ok+r.no))return `<div style="border:1px dashed #cbbfe6;border-radius:12px;padding:8px;margin:10px 0;font-size:12px;color:#8a7aa6">🎯 وضعیت تحصیلی: هنوز ارزشیابی یا آزمونی برای این دانش‌آموز ثبت نشده است.</div>`;
  const names=B.names.filter(n=>r.cr[n]);
  const j=r.initAvg!=null&&r.avg!=null?`${f1(r.initAvg)} ← ${f1(r.avg)}`:null;
  const rows=names.map(n=>{const c=r.cr[n],st=statOf(c.avg);
   return `<tr><td style="font-weight:800;padding:5px 6px;border-bottom:1px solid #eee">${E(n)}</td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${stack(c.g,84)}<div style="font-size:10px;color:#6b5b8c;margin-top:2px">${c.dj.length?fa(c.dj.length)+' ارزشیابی · '+f1(c.avgDj):(c.ok+c.no?fa(c.ok)+' از '+fa(c.ok+c.no)+' انجام شد':'—')}</div></td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${c.ex.length?heat(c.avgEx)+'<div style="font-size:10px;color:#6b5b8c">'+fa(c.ex.length)+' آزمون</div>':'<span style="color:#94a3b8">—</span>'}</td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center;font-size:12px;font-weight:800;color:${c.hwP==null?'#94a3b8':c.hwP>=80?'#157a47':c.hwP>=50?'#a96a00':'#b3262c'}">${pc(c.hwP)}</td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${heat(c.avg)}</td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${trendI(c.trend)}</td>`+
   `<td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${pill(st,'font-size:10.5px;padding:1px 8px')}</td></tr>`}).join('');
  const notes=r.notes.sort((a,b)=>b.k.localeCompare(a.k)).slice(0,3).map(x=>`<div style="font-size:11.5px;border-right:3px solid #7e57c2;background:#faf7ff;padding:3px 8px;margin:3px 0"><b>${E(x.c)}</b> · ${E(x.a)}: ${E(x.t)}</div>`).join('');
  return `<div style="border:1.5px solid #d9cdf0;border-radius:14px;padding:10px;margin:10px 0;background:#fcfaff">`+
   `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><b style="font-size:15px;color:#4b3478">🎯 وضعیت تحصیلی (دفتر روزانه + ارزشیابی‌ها)</b>${pill(r.st,'font-size:13px;padding:3px 14px')}</div>`+
   `<div style="display:flex;gap:6px;flex-wrap:wrap">`+
    tile('📊','میانگین کل',r.avg==null?'—':f1(r.avg),r.avg==null?'':LV[lv(r.avg)].t,lvCol(r.avg))+
    tile('📓','ارزشیابی روزانه',r.djAvg==null?'—':f1(r.djAvg),fa(Object.values(r.cr).reduce((a,c)=>a+c.dj.length,0))+' ثبت',lvCol(r.djAvg))+
    tile('📝','آزمون‌ها',r.exAvg==null?'—':f1(r.exAvg),fa(Object.values(r.cr).reduce((a,c)=>a+c.ex.length,0))+' آزمون',lvCol(r.exAvg))+
    tile('📚','تکالیف',pc(r.hwP),r.hwN?fa(r.hw.d)+' کامل · '+fa(r.hw.n)+' نکرده':'',r.hwP==null?'#94a3b8':r.hwP>=80?'#157a47':r.hwP>=50?'#a96a00':'#b3262c')+
    tile('🏫','حضور',pc(r.attP),r.attN?fa(r.att.a)+' غیبت · '+fa(r.att.l)+' تأخیر':'',r.attP==null?'#94a3b8':r.attP>=90?'#157a47':r.attP>=80?'#a96a00':'#b3262c')+
    tile('🌟','فعالیت کلاسی',fa(r.act.p)+' / '+fa(r.act.e),'مثبت / نیاز به تلاش','#4b3478')+
   `</div>`+
   (j?`<div style="margin-top:8px;font-size:12.5px;background:#eef6ff;border:1px solid #cfe2ff;border-radius:10px;padding:6px 10px">🧭 سیر پیشرفت: ارزشیابی آغازین <b>${f1(r.initAvg)}</b> ← میانگین فعلی <b>${f1(r.avg)}</b> ${r.avg>r.initAvg+.2?'<b style="color:#157a47">(رشد)</b>':r.avg<r.initAvg-.2?'<b style="color:#b3262c">(افت)</b>':'(ثابت)'}</div>`:'')+
   (r.flags.length?`<div style="margin-top:8px">${r.flags.map(f=>chip(f.t,f.c)).join('')}</div>`:'')+
   (names.length?`<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:12px"><thead><tr style="background:#efe6fb;color:#4b3478"><th style="padding:5px 6px;text-align:right">درس</th><th style="padding:5px 6px">ارزشیابی دفتر روزانه</th><th style="padding:5px 6px">آزمون</th><th style="padding:5px 6px">تکلیف</th><th style="padding:5px 6px">میانگین</th><th style="padding:5px 6px">روند</th><th style="padding:5px 6px">وضعیت</th></tr></thead><tbody>${rows}</tbody></table>`:'')+
   (notes?`<div style="margin-top:8px"><b style="font-size:12px;color:#4b3478">📝 آخرین یادداشت‌های دفتر روزانه</b>${notes}</div>`:'')+
   `<div style="margin-top:6px;font-size:10px;color:#8a7aa6">راهنما: نوار رنگی = فراوانی سطوح (سبز تیره خیلی خوب، سبز خوب، نارنجی قابل قبول، قرمز نیاز به تلاش). از ابتدای سال تا امروز.</div></div>`;
 }catch(e){console.warn('asx card',e);return ''}
}

/* ───── کارت داشبورد معلم ───── */
let per='y',sortBy='need',open=false;
const PER={w:['۷ روز اخیر',7],m:['۳۰ روز اخیر',30],y:['کل سال',0]};
function homeHtml(){
 const T=todayIso(),from=PER[per][1]?addD(T,-PER[per][1]+1):'',B=calc(from,T);
 if(!(S.students||[]).length)return '';
 const c=B.cls,sc=statOf(c.avg),D=c.dist,tot=B.rows.length||1;
 const seg=['top','good','ok','risk','none'].filter(k=>D[k]).map(k=>`<td style="width:${D[k]/tot*100}%;background:${STAT[k].c};color:#fff;text-align:center;font-size:11px;font-weight:900;padding:3px 0">${fa(D[k])}</td>`).join('');
 const leg=['top','good','ok','risk','none'].map(k=>`<span style="font-size:11px;margin-left:10px;white-space:nowrap"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${STAT[k].c};vertical-align:middle;margin-left:4px"></i>${STAT[k].t} (${fa(D[k])})</span>`).join('');
 const kp=(ic,l,v,s,col)=>`<div class="asx-k"><div class="asx-kl">${ic} ${l}</div><div class="asx-kv" style="color:${col||'inherit'}">${v}</div><div class="asx-ks">${s||'&nbsp;'}</div></div>`;
 let R=B.rows.slice();
 const nameCmp=(a,b)=>String(a.s.name).localeCompare(String(b.s.name),'fa');
 if(sortBy==='name')R.sort(nameCmp);else if(sortBy==='best')R.sort((a,b)=>(b.avg==null?-1:b.avg)-(a.avg==null?-1:a.avg)||nameCmp(a,b));
 else R.sort((a,b)=>(a.avg==null?9:a.avg)-(b.avg==null?9:b.avg)||nameCmp(a,b)),R=R.filter(x=>x.avg!=null).concat(R.filter(x=>x.avg==null));
 const need=B.rows.filter(r=>r.st.k==='risk').length;
 const head=B.names.map(n=>`<th title="${E(n)}">${E(n.length>7?n.slice(0,7)+'…':n)}</th>`).join('');
 const body=R.map((r,i)=>{
  const cells=B.names.map(n=>{const x=r.cr[n];return `<td>${x&&x.avg!=null?heat(x.avg):'<span class="asx-m">·</span>'}</td>`}).join('');
  const g={1:0,2:0,3:0,4:0};Object.values(r.cr).forEach(x=>{for(let l=1;l<=4;l++)g[l]+=x.g[l]});
  return `<tr><td class="asx-n">${fa(i+1)}</td><td class="asx-nm"><a data-asx-open="${r.s.id}">${E(r.s.name)}</a>${r.flags.length?`<div class="asx-fl">${r.flags.slice(0,2).map(f=>`<span style="color:${f.c}">${E(f.t)}</span>`).join(' · ')}</div>`:''}</td><td>${pill(r.st,'font-size:10.5px;padding:1px 8px')}</td><td>${r.avg==null?'<span class="asx-m">—</span>':heat(r.avg)}<div>${stack(g,64)}</div></td>${cells}<td style="font-weight:800;color:${r.hwP==null?'#94a3b8':r.hwP>=80?'#157a47':r.hwP>=50?'#a96a00':'#b3262c'}">${pc(r.hwP)}</td><td style="font-weight:800;color:${r.attP==null?'#94a3b8':r.attP>=90?'#157a47':r.attP>=80?'#a96a00':'#b3262c'}">${pc(r.attP)}</td><td>${fa(r.act.p)}<span class="asx-m">/</span>${fa(r.act.e)}</td><td>${trendI(r.trend)}</td></tr>`}).join('');
 const courseRow=c.courseAvg.filter(x=>x.v!=null).map(x=>`<span class="asx-cc">${E(x.n)} ${heat(x.v)}</span>`).join('');
 return `<div class="asx-h"><div><b>🎯 وضعیت تحصیلی کلاس</b><div class="asx-s">ترکیب ارزشیابی‌های دفتر روزانه، آزمون‌ها، تکالیف، فعالیت کلاسی و حضور</div></div><div class="asx-pr">${Object.keys(PER).map(k=>`<button data-asx-per="${k}" class="${k===per?'on':''}">${PER[k][0]}</button>`).join('')}</div></div>`+
 `<div class="asx-ks4">${kp('📊','میانگین کلاس',c.avg==null?'—':f1(c.avg),c.avg==null?'هنوز ارزشیابی ثبت نشده':pill(sc,'font-size:10.5px;padding:0 8px'),lvCol(c.avg))}${kp('📓','ارزشیابی‌های ثبت‌شده',fa(c.samples),'دفتر روزانه + آزمون')}${kp('📚','انجام تکلیف',pc(c.hwP),'میانگین کلاس',c.hwP==null?null:c.hwP>=80?'#157a47':c.hwP>=50?'#a96a00':'#b3262c')}${kp('🏫','حضور',pc(c.attP),'میانگین کلاس',c.attP==null?null:c.attP>=90?'#157a47':c.attP>=80?'#a96a00':'#b3262c')}</div>`+
 `<div style="margin:10px 0 4px"><table style="border-collapse:collapse;width:100%;border-radius:8px;overflow:hidden"><tr>${seg||'<td style="background:#cbd5e1;height:18px"></td>'}</tr></table><div style="margin-top:5px">${leg}</div></div>`+
 (need?`<div class="asx-al">🚨 ${fa(need)} دانش‌آموز نیازمند توجه‌اند (در جدول، اول فهرست)</div>`:'')+
 (courseRow?`<div class="asx-cr"><b>میانگین هر درس:</b> ${courseRow}</div>`:'')+
 `<div class="asx-pr" style="margin:8px 0 4px"><span class="asx-sl">مرتب‌سازی:</span><button data-asx-sort="need" class="${sortBy==='need'?'on':''}">نیازمند توجه</button><button data-asx-sort="best" class="${sortBy==='best'?'on':''}">بهترین‌ها</button><button data-asx-sort="name" class="${sortBy==='name'?'on':''}">الفبایی</button><button data-asx-go="dj" style="margin-right:auto">📓 دفتر روزانه</button></div>`+
 `<div class="asx-w"><table class="asx-t"><thead><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th><th>میانگین</th>${head}<th>تکلیف</th><th>حضور</th><th title="فعالیت کلاسی: مثبت / نیاز به تلاش">فعالیت</th><th>روند</th></tr></thead><tbody>${body}</tbody></table></div>`+
 `<div class="asx-lg">برای دیدن کارنامه‌ی کامل هر دانش‌آموز روی نامش بزنید. سلول‌های رنگی میانگین هر درس‌اند (از ۴)؛ نوار زیر میانگین = فراوانی سطوح.</div>`;
}

const CSS=`
#asxHome{margin:0 0 12px;padding:14px;background:var(--card,#fff);border-radius:22px;box-shadow:0 6px 18px #7e57c21f;border:1px solid var(--line,#eadff7);color:var(--tx,#3b2a55)}
#asxHome .asx-h{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap}
#asxHome .asx-h b{font-size:17px}#asxHome .asx-s{font-size:11.5px;color:var(--mut,#8a7aa6);margin-top:2px}
#asxHome .asx-pr{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#asxHome .asx-pr button{border:1px solid var(--line,#eadff7);background:transparent;color:var(--tx,#3b2a55);border-radius:10px;padding:5px 11px;font:700 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#asxHome .asx-pr button.on{background:var(--p,#7e57c2);color:#fff;border-color:transparent}
#asxHome .asx-sl{font-size:12px;color:var(--mut,#8a7aa6)}
#asxHome .asx-ks4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
@media(max-width:640px){#asxHome .asx-ks4{grid-template-columns:repeat(2,1fr)}}
#asxHome .asx-k{border:1px solid var(--line,#eadff7);border-radius:14px;padding:8px 6px;text-align:center}
#asxHome .asx-kl{font-size:11.5px;color:var(--mut,#8a7aa6);font-weight:700}#asxHome .asx-kv{font-size:22px;font-weight:900;margin:2px 0}#asxHome .asx-ks{font-size:10.5px;color:var(--mut,#8a7aa6)}
#asxHome .asx-al{margin-top:8px;padding:7px 10px;border-radius:10px;background:#fde7e8;color:#b3262c;font-size:12.5px;font-weight:800}
#asxHome .asx-cr{margin-top:8px;font-size:12px;line-height:2.3}#asxHome .asx-cc{display:inline-block;margin-left:10px;white-space:nowrap}
#asxHome .asx-w{overflow:auto;max-height:520px;border:1px solid var(--line,#eadff7);border-radius:14px}
#asxHome .asx-t{border-collapse:collapse;width:100%;font-size:12px;text-align:center}
#asxHome .asx-t th{position:sticky;top:0;background:var(--bg2,#efe6fb);color:var(--tx,#3b2a55);padding:7px 6px;white-space:nowrap;z-index:1}
#asxHome .asx-t td{padding:5px 5px;border-top:1px solid var(--line,#eadff7);vertical-align:middle}
#asxHome .asx-t td.asx-nm{text-align:right;min-width:130px}#asxHome .asx-nm a{font-weight:800;cursor:pointer;color:var(--p,#7e57c2)}
#asxHome .asx-fl{font-size:10px;margin-top:1px;line-height:1.5}#asxHome .asx-m{color:#94a3b8}#asxHome .asx-n{color:var(--mut,#8a7aa6)}
#asxHome .asx-lg{margin-top:6px;font-size:11px;color:var(--mut,#8a7aa6)}`;
const stl=document.createElement('style');stl.id='asx-css';stl.textContent=CSS;document.head.appendChild(stl);

function mount(){
 try{const h=$('home');if(!h)return;let b=$('asxHome');
  if(!b){b=document.createElement('div');b.id='asxHome';const a=$('smart');if(a&&a.parentNode===h)a.before(b);else h.appendChild(b)}
  const html=homeHtml();b.style.display=html?'':'none';
  if(b.__h!==html){b.__h=html;b.innerHTML=html}
 }catch(e){console.warn('asx mount',e)}
}
document.addEventListener('click',ev=>{
 const t=ev.target.closest&&ev.target.closest('#asxHome [data-asx-per],#asxHome [data-asx-sort],#asxHome [data-asx-open],#asxHome [data-asx-go]');if(!t)return;
 if(t.dataset.asxPer){per=t.dataset.asxPer;mount()}
 else if(t.dataset.asxSort){sortBy=t.dataset.asxSort;mount()}
 else if(t.dataset.asxOpen){if(typeof window.openProf==='function')window.openProf(+t.dataset.asxOpen)}
 else if(t.dataset.asxGo){try{show(t.dataset.asxGo)}catch(e){}}
});
/* به‌روزرسانی هم‌زمان با رندر برنامه و بازگشت به داشبورد */
const _r=window.render;if(typeof _r==='function'){window.render=function(){const r=_r.apply(this,arguments);try{mount()}catch(e){}return r}}
const _s=window.show;if(typeof _s==='function'){window.show=function(id){const r=_s.apply(this,arguments);try{if(id==='home')mount()}catch(e){}return r}}
window.ASX={calc,cardHtml,mount,statOf};
setTimeout(mount,400);
}catch(e){console.warn('academic-status',e)}})();

/* ============================================================
   خروجی سؤال‌های بانک سؤال (Word + PDF) — با پاسخ / بدون پاسخ
   - ورودی: QBK.all() (بانک سؤال)، تنظیمات در S.qexp
   - یک «مدل» مشترک ساخته می‌شود و از آن هم HTML (چاپ/PDF) و هم فایل واقعی .docx تولید می‌شود
   - بدون کتابخانه‌ی بیرونی و کاملاً آفلاین (zip به‌صورت store با crc32 ساخته می‌شود)
   - ورود: QEXP.open({key,gr,bk,ls,pick}) — از صفحه‌ی کتاب در «بانک سؤال» صدا زده می‌شود
   ============================================================ */
(function(){try{
if(window.QEXP)return;
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const F=n=>typeof fa==='function'?fa(n):String(n);
const LET=['الف','ب','ج','د','ه','و'];
const TY=[['mc','چندگزینه‌ای'],['tf','صحیح / غلط'],['fb','جای‌خالی'],['sa','کوتاه‌پاسخ'],['es','تشریحی']];
const LV=[['e','آسان','#1a8f55'],['m','متوسط','#c77d0a'],['h','سخت','#d9534f']];
const ACC='#5b3fd0',ACC_L='#f1eefb';
const tyN=k=>(TY.find(x=>x[0]===k)||[0,'—'])[1];
const lvO=k=>LV.find(x=>x[0]===k)||['','—','#777'];
const bank=()=>window.QBK&&QBK.all?QBK.all():[];
const qSort=(a,b)=>(a.ln==null?9999:a.ln)-(b.ln==null?9999:b.ln)||(a.p1==null?9999:a.p1)-(b.p1==null?9999:b.p1)||(a.ca||a.id)-(b.ca||b.id);
const lsTitle=(name,ln)=>ln<9999&&!/^\s*(درس|فصل|واحد|بخش|مرحله)/.test(name)?'درس '+F(ln)+' — '+name:name;
const st=()=>{S.qexp=S.qexp&&typeof S.qexp==='object'?S.qexp:{};return S.qexp};
const DEF={mode:'q',meta:true,lines:true,school:true,nameLine:false,num:'cont',shuffle:false,size:'m'};
const opt=k=>{const v=st()[k];return v===undefined?DEF[k]:v};
const setOpt=(k,v)=>{st()[k]=v;try{save()}catch(e){}};
const MODES={q:'بدون پاسخ',a:'با پاسخ',qa:'سؤال + پاسخ‌نامه'};
const FS={s:{px:11.5,pt:10},m:{px:13,pt:11},l:{px:15,pt:13}};

/* ---------- داده‌ها ---------- */
let X=null; /* وضعیت گفت‌وگو */
function ansText(q){
 if(q.ty==='tf')return q.ans==='T'?'صحیح':q.ans==='F'?'غلط':(q.ans||'');
 if(q.ty==='mc'){const o=(q.op||[])[q.ok];return o!=null&&String(o)!==''?String(o):(q.ans||'')}
 return q.ans||'';
}
function hasAns(q){return !!String(ansText(q)).trim()}
function loadBook(key){
 const all=bank().filter(q=>((q.gr||'')+'§'+(q.bk||''))===key).sort(qSort);
 const m=new Map();
 all.forEach(q=>{const k=q.ls||'بدون درس';let g=m.get(k);if(!g){g={name:k,ln:9999,items:[]};m.set(k,g)}if(q.ln!=null&&q.ln<g.ln)g.ln=q.ln;g.items.push(q)});
 const groups=[...m.values()].sort((a,b)=>a.ln-b.ln||a.name.localeCompare(b.name,'fa'));
 groups.forEach(g=>{g.items.sort(qSort);g.title=lsTitle(g.name,g.ln);g.pg=pgRange(g.items)});
 return {all,groups};
}
function pgRange(items){let a=null,b=null;items.forEach(q=>{if(q.p1==null)return;const e=q.p2!=null?q.p2:q.p1;if(a==null||q.p1<a)a=q.p1;if(b==null||e>b)b=e});return a==null?'':(a===b?F(a):F(a)+' تا '+F(b))}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuf(arr,seed){const r=rng(seed),a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* سؤال‌های انتخاب‌شده به‌ترتیب درس */
function picked(){
 return X.groups.filter(g=>X.pickLs.has(g.name)).map(g=>({g,items:g.items.filter(q=>X.lv.has(q.lv||'')&&X.ty.has(q.ty||''))})).filter(x=>x.items.length);
}

/* ---------- مدل مشترک ---------- */
function model(){
 const P=(S.prof||{}),mode=opt('mode'),showAns=mode==='a',key=mode==='qa';
 const sel=picked();let n=0,missing=0,total=0;
 const groups=sel.map(({g,items})=>{
  let its=opt('shuffle')?shuf(items,X.seed+g.name.length*7):items;
  if(opt('num')==='ls')n=0;
  const out=its.map(q=>{
   n++;total++;if((showAns||key)&&!hasAns(q))missing++;
   const ops=q.ty==='mc'?(q.op||[]).map((t,i)=>({i,t:String(t==null?'':t)})).filter(o=>o.t!==''):[];
   const l=lvO(q.lv);
   return {n,text:String(q.q||''),ty:q.ty||'',tyName:tyN(q.ty),lv:q.lv||'',lvName:l[1],lvColor:l[2],ops,ok:q.ok,ans:ansText(q),has:hasAns(q),src:q.src||''};
  });
  return {title:g.title,pg:g.pg,count:out.length,items:out};
 });
 const schoolName=P.school&&typeof schoolFull==='function'?schoolFull(P):(P.school||'');
 const lessons=groups.length;
 const lsSum=lessons<=2?groups.map(g=>g.title).join(' و '):F(lessons)+' درس';
 const date=(()=>{try{return new Date().toLocaleDateString('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'})}catch(e){return ''}})();
 const title=(($('qxTitle')||{}).value||'').trim()||('سؤال‌های '+X.bk);
 const sub=(($('qxSub')||{}).value||'').trim();
 return {title,sub,gr:X.gr,bk:X.bk,lsSum,date,school:opt('school')?schoolName:'',teacher:opt('school')?(P.teacher||''):'',logo:opt('school')?(P.logo||''):'',
  mode,showAns,key,total,missing,groups,meta:!!opt('meta'),lines:!!opt('lines'),nameLine:!!opt('nameLine'),size:opt('size')};
}
const chipsOf=m=>[m.gr?'پایه '+m.gr:'',m.bk,m.lsSum,F(m.total)+' سؤال',m.date].filter(Boolean);
const modeBadge=m=>m.showAns?'نسخه‌ی آموزگار (با پاسخ)':m.key?'همراه با پاسخ‌نامه':'';

/* ---------- HTML (پیش‌نمایش و چاپ / PDF) ---------- */
const nl=t=>E(t).replace(/\n/g,'<br>');
function optsHtml(it,m){
 if(!it.ops.length)return '';
 const mx=Math.max(...it.ops.map(o=>o.t.length)),cls=mx<=12?'c4':mx<=38?'c2':'c1';
 return `<div class="ops ${cls}">${it.ops.map(o=>{const ok=m.showAns&&o.i===it.ok;return `<div class="o${ok?' ok':''}"><b>${LET[o.i]||F(o.i+1)})</b> <span>${nl(o.t)}${ok?' ✔':''}</span></div>`}).join('')}</div>`;
}
function qHtml(it,m){
 let b=`<div class="t"><span class="tx">${nl(it.text)}</span>${m.meta?`<span class="mt"><i style="background:${it.lvColor}"></i>${E(it.lvName)} · ${E(it.tyName)}</span>`:''}</div>`;
 if(it.ty==='mc')b+=optsHtml(it,m);
 if(m.showAns){
  if(it.ty!=='mc')b+=`<div class="an${it.has?'':' no'}"><b>پاسخ:</b> ${it.has?nl(it.ans):'ثبت نشده'}</div>`;
  else if(!it.has)b+=`<div class="an no"><b>پاسخ:</b> ثبت نشده</div>`;
 }else{
  if(it.ty==='tf')b+=`<div class="tf">( &nbsp; ) صحیح &nbsp;&nbsp;&nbsp; ( &nbsp; ) غلط</div>`;
  else if(m.lines&&(it.ty==='es'||it.ty==='sa'))b+=Array(it.ty==='es'?3:1).fill('<div class="ln"></div>').join('');
 }
 return `<div class="q"><div class="n">${F(it.n)}</div><div class="b">${b}</div></div>`;
}
function keyHtml(m){
 return `<section class="key"><h2 class="kh">🔑 پاسخنامه</h2>${m.groups.map(g=>`<div class="kg">${E(g.title)}</div><div class="kl">${g.items.map(it=>{
  const a=it.ty==='mc'&&it.ops.some(o=>o.i===it.ok)?`${LET[it.ok]||F(it.ok+1)}) ${nl(it.ops.find(o=>o.i===it.ok).t)}`:(it.has?nl(it.ans):'<i class="mu">—</i>');
  return `<div class="ki"><b>${F(it.n)}.</b> <span>${a}</span></div>`}).join('')}</div>`).join('')}</section>`;
}
function htmlDoc(m){
 const fs=FS[m.size]?FS[m.size].px:13;
 const css=`@font-face{font-family:Vazirmatn;src:url(assets/fonts/Vazirmatn-VF.woff2) format("woff2");font-weight:100 900;font-style:normal}
@page{size:A4;margin:14mm 13mm 16mm;@bottom-center{content:counter(page) " / " counter(pages);font:9px Vazirmatn,Tahoma,sans-serif;color:#9a96ab}}
*{box-sizing:border-box}html,body{margin:0}
body{font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl;color:#1d1b2e;font-size:${fs}px;line-height:1.95;background:#e8e5f1;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:210mm;max-width:100%;margin:10px auto;background:#fff;padding:12mm 12mm 14mm;box-shadow:0 4px 18px rgba(0,0,0,.25);border-radius:4px}
.hd{border-bottom:2.5px solid ${ACC};padding-bottom:8px;margin-bottom:10px}
.hd-top{display:grid;grid-template-columns:1fr 2fr 1fr;gap:10px;align-items:center}
.hd-s{font-weight:700;font-size:.92em;line-height:1.7}.hd-s small{display:block;font-weight:400;color:#6b6780;font-size:.88em}
.hd-t{text-align:center}.hd-t h1{margin:0;font-size:1.55em;line-height:1.6;color:${ACC};font-weight:800}
.hd-sub{color:#5d5973;font-size:.95em}
.hd-l{text-align:left}.hd-l img{max-height:62px;max-width:100%;object-fit:contain}
.bdg{display:inline-block;margin-top:2px;padding:0 12px;border-radius:99px;background:${ACC};color:#fff;font-size:.8em;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}
.chips span{background:${ACC_L};color:#3f2f98;border-radius:99px;padding:0 11px;font-size:.82em;font-weight:600}
.nm{display:flex;gap:14px;margin-top:10px;font-size:.92em;color:#444}.nm span{flex:1;border-bottom:1px dotted #888;white-space:nowrap}.nm span:last-child{flex:.6}
.lh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:14px 0 6px;padding:3px 12px;background:${ACC_L};border-right:4px solid ${ACC};border-radius:8px;font-size:1.02em;color:#2f2377;font-weight:800;break-after:avoid;page-break-after:avoid}
.lh small{font-weight:500;color:#6b6780;font-size:.8em}
.q{display:flex;gap:9px;align-items:flex-start;margin:0 0 9px;break-inside:avoid;page-break-inside:avoid}
.n{flex:none;min-width:24px;height:24px;margin-top:3px;padding:0 4px;border-radius:99px;background:${ACC};color:#fff;font-size:.78em;font-weight:700;line-height:24px;text-align:center}
.b{flex:1;min-width:0}
.t{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}.tx{flex:1;font-weight:600}
.mt{flex:none;margin-top:5px;font-size:.66em;color:#807b94;white-space:nowrap}.mt i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-left:4px}
.ops{display:grid;gap:1px 16px;margin-top:2px;padding-right:2px}.ops.c4{grid-template-columns:repeat(4,1fr)}.ops.c2{grid-template-columns:repeat(2,1fr)}.ops.c1{grid-template-columns:1fr}
.o b{color:${ACC};font-weight:700}.o.ok{background:#e7f6ee;border-radius:6px;padding:0 6px;color:#136a3d;font-weight:700;margin:0 -6px}.o.ok b{color:#136a3d}
.an{margin-top:3px;padding:2px 10px;background:#eaf7f0;border-right:3px solid #1a8f55;border-radius:6px;color:#136a3d;font-size:.95em}.an.no{background:#f4f2f8;border-color:#bbb;color:#777}
.tf{margin-top:3px;color:#444}
.ln{border-bottom:1px dotted #8c8aa0;height:26px}
.key{break-before:page;page-break-before:always}
.kh{margin:0 0 6px;font-size:1.3em;color:${ACC};border-bottom:2.5px solid ${ACC};padding-bottom:4px}
.kg{margin:10px 0 3px;font-weight:800;color:#2f2377;background:${ACC_L};border-right:4px solid ${ACC};border-radius:8px;padding:1px 12px;break-after:avoid}
.kl{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.ki{break-inside:avoid;padding:1px 0;border-bottom:1px dashed #e3e0ee}.ki b{color:${ACC}}.mu{color:#aaa}
.ft{margin-top:14px;text-align:center;color:#8a86a0;font-size:.8em}
@media print{body{background:#fff}.sheet{width:auto;max-width:none;margin:0;padding:0;box-shadow:none;border-radius:0}}`;
 const logo=m.logo?`<img src="${E(m.logo)}" alt="">`:'';
 const left=(m.school||m.teacher)?`<div class="hd-s">${E(m.school)}${m.teacher?`<small>آموزگار: ${E(m.teacher)}</small>`:''}</div>`:'<div></div>';
 const hd=`<header class="hd"><div class="hd-top">${left}<div class="hd-t"><h1>${E(m.title)}</h1>${m.sub?`<div class="hd-sub">${E(m.sub)}</div>`:''}${modeBadge(m)?`<span class="bdg">${modeBadge(m)}</span>`:''}</div><div class="hd-l">${logo}</div></div>
<div class="chips">${chipsOf(m).map(c=>`<span>${E(c)}</span>`).join('')}</div>${m.nameLine?'<div class="nm"><span>نام و نام‌خانوادگی:</span><span>پایه / کلاس:</span><span>تاریخ:</span></div>':''}</header>`;
 const body=m.groups.map(g=>`<section><h2 class="lh"><span>${E(g.title)}</span><small>${F(g.count)} سؤال${g.pg?' · صفحه‌ی '+g.pg:''}</small></h2>${g.items.map(it=>qHtml(it,m)).join('')}</section>`).join('');
 return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${E(m.title)}</title><style>${css}</style></head><body><div class="sheet">${hd}${body}${m.key?keyHtml(m):''}<div class="ft">— پایان —</div></div></body></html>`;
}

/* ---------- DOCX (فایل واقعی Word) ---------- */
const xe=s=>String(s==null?'':s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const FONT='Tahoma';
const rF=`<w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}" w:cs="${FONT}" w:eastAsia="${FONT}"/>`;
function run(text,o){o=o||{};const sz=o.sz?`<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`:'';
 const rp=`<w:rPr>${o.font?`<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:cs="${o.font}"/>`:rF}${o.b?'<w:b/><w:bCs/>':''}${o.color?`<w:color w:val="${o.color}"/>`:''}${sz}${o.fill?`<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>`:''}<w:rtl/></w:rPr>`;
 const parts=String(text==null?'':text).split('\n');
 return `<w:r>${rp}${parts.map((t,i)=>(i?'<w:br/>':'')+`<w:t xml:space="preserve">${xe(t)}</w:t>`).join('')}</w:r>`;
}
const tab=(o)=>`<w:r><w:rPr>${rF}<w:rtl/></w:rPr><w:tab/></w:r>`;
function para(runs,o){o=o||{};
 const pp=`<w:pPr>${o.style?`<w:pStyle w:val="${o.style}"/>`:''}${o.keepNext?'<w:keepNext/>':''}${o.keepLines?'<w:keepLines/>':''}${o.pageBreak?'<w:pageBreakBefore/>':''}${o.bdr?`<w:pBdr>${o.bdr}</w:pBdr>`:''}${o.fill?`<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>`:''}<w:bidi/><w:spacing w:before="${o.before||0}" w:after="${o.after||0}"${o.line?` w:line="${o.line}" w:lineRule="${o.rule||'auto'}"`:''}/>${(o.left!=null||o.hang)?`<w:ind w:left="${o.left||0}"${o.hang?` w:hanging="${o.hang}"`:''}/>`:''}${o.jc?`<w:jc w:val="${o.jc}"/>`:''}</w:pPr>`;
 return `<w:p>${pp}${runs||''}</w:p>`;
}
function docxBody(m){
 const sz=(FS[m.size]||FS.m).pt*2,small=Math.max(15,sz-4),IND=454,GREEN='136A3D',MUT='807B94';
 const b=[];
 const top=[];
 if(m.school||m.teacher)b.push(para(run(m.school,{b:1,sz:sz,color:'1D1B2E'})+(m.teacher?run('     آموزگار: '+m.teacher,{sz:small+2,color:MUT}):''),{jc:'center',after:40}));
 b.push(para(run(m.title,{b:1,sz:sz+10,color:ACC.slice(1)}),{style:'Heading1',jc:'center',after:30}));
 if(m.sub)b.push(para(run(m.sub,{sz:sz,color:'5D5973'}),{jc:'center',after:30}));
 if(modeBadge(m))b.push(para(run(' '+modeBadge(m)+' ',{b:1,sz:small+2,color:'FFFFFF',fill:ACC.slice(1)}),{jc:'center',after:40}));
 b.push(para(run(chipsOf(m).join('   •   '),{sz:small+2,color:'3F2F98'}),{jc:'center',before:30,after:160,bdr:`<w:bottom w:val="single" w:sz="18" w:space="6" w:color="${ACC.slice(1)}"/>`}));
 if(m.nameLine)b.push(para(run('نام و نام‌خانوادگی: ................................      پایه / کلاس: ................      تاریخ: ................',{sz:sz,color:'444444'}),{after:120}));
 m.groups.forEach(g=>{
  b.push(para(run(g.title,{b:1,sz:sz+2,color:'2F2377'})+run('      '+F(g.count)+' سؤال'+(g.pg?' · صفحه‌ی '+g.pg:''),{sz:small,color:MUT}),{style:'Heading2',keepNext:1,fill:ACC_L.slice(1),before:240,after:100,bdr:`<w:bottom w:val="single" w:sz="8" w:space="2" w:color="${ACC.slice(1)}"/>`}));
  g.items.forEach(it=>{
   const meta=m.meta?run('   ('+it.lvName+' · '+it.tyName+')',{sz:small-2,color:it.lvColor.slice(1)}):'';
   const last=!(it.ty==='mc'&&it.ops.length)&&!(m.showAns&&(it.ty!=='mc'||!it.has))&&it.ty!=='tf'&&!(m.lines&&(it.ty==='es'||it.ty==='sa')&&!m.showAns);
   b.push(para(run(F(it.n)+'.',{b:1,sz:sz,color:ACC.slice(1)})+tab()+run(it.text,{b:1,sz:sz,color:'1D1B2E'})+meta,{keepNext:last?0:1,keepLines:1,before:140,after:40,left:IND,hang:IND}));
   if(it.ty==='mc'&&it.ops.length){
    const mx=Math.max(...it.ops.map(o=>o.t.length)),inl=mx<=14&&it.ops.length<=4;
    const opRuns=it.ops.map(o=>{const ok=m.showAns&&o.i===it.ok,lab=(LET[o.i]||F(o.i+1))+') ';
     return run(lab,{b:1,sz:sz,color:ok?GREEN:ACC.slice(1)})+run(o.t+(ok?' ':''),{sz:sz,b:ok,color:ok?GREEN:'1D1B2E',fill:ok?'E7F6EE':''})+(ok?run('✔',{font:'Segoe UI Symbol',sz:sz,color:GREEN,b:1}):'')});
    const needNote=m.showAns&&!it.has;
    if(inl)b.push(para(opRuns.join(run('\u2003\u2003',{sz:sz})),{left:IND,after:30,keepNext:needNote?1:0,keepLines:1}));
    else opRuns.forEach((r,i)=>b.push(para(r,{left:IND,after:10,keepNext:(i<opRuns.length-1||needNote)?1:0,keepLines:1})));
   }
   if(m.showAns){
    if(it.ty!=='mc'||!it.has)b.push(para(run('پاسخ: ',{b:1,sz:sz,color:it.has?GREEN:'777777'})+run(it.has?it.ans:'ثبت نشده',{sz:sz,color:it.has?GREEN:'777777'}),{left:IND,fill:it.has?'EAF7F0':'F4F2F8',after:60,keepLines:1}));
   }else{
    if(it.ty==='tf')b.push(para(run('(       ) صحیح          (       ) غلط',{sz:sz,color:'444444'}),{left:IND,after:60}));
    else if(m.lines&&(it.ty==='es'||it.ty==='sa')){const k=it.ty==='es'?3:1;for(let i=0;i<k;i++)b.push(para('',{left:IND+i*3,line:500,rule:'exact',keepNext:i<k-1?1:0,bdr:`<w:bottom w:val="dotted" w:sz="6" w:space="${1+i%2}" w:color="8C8AA0"/>`}))}
   }
  });
 });
 if(m.key){
  b.push(para(run('🔑 پاسخنامه',{b:1,sz:sz+8,color:ACC.slice(1),font:FONT}),{style:'Heading1',pageBreak:1,after:100,bdr:`<w:bottom w:val="single" w:sz="18" w:space="4" w:color="${ACC.slice(1)}"/>`}));
  m.groups.forEach(g=>{
   b.push(para(run(g.title,{b:1,sz:sz,color:'2F2377'}),{style:'Heading2',keepNext:1,fill:ACC_L.slice(1),before:200,after:60}));
   g.items.forEach(it=>{
    const okOp=it.ty==='mc'?it.ops.find(o=>o.i===it.ok):null;
    const a=okOp?(LET[it.ok]||F(it.ok+1))+') '+okOp.t:(it.has?it.ans:'—');
    b.push(para(run(F(it.n)+'.',{b:1,sz:sz,color:ACC.slice(1)})+tab()+run(a,{sz:sz,color:'1D1B2E'}),{left:IND,hang:IND,before:30,after:30,keepLines:1,bdr:'<w:bottom w:val="dotted" w:sz="4" w:space="1" w:color="E3E0EE"/>'}));
   });
  });
 }
 return b.join('');
}
const NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
function docxFiles(m){
 const sz=(FS[m.size]||FS.m).pt*2;
 const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${NS}><w:body>${docxBody(m)}<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1000" w:header="500" w:footer="450" w:gutter="0"/><w:bidi/></w:sectPr></w:body></w:document>`;
 const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr>${rF}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="fa-IR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/><w:spacing w:after="0" w:line="340" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:bCs/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:bCs/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/></w:style></w:styles>`;
 const settings=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings ${NS}><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:themeFontLang w:val="en-US" w:bidi="fa-IR"/></w:settings>`;
 const fr=t=>`<w:r><w:rPr>${rF}<w:color w:val="9A96AB"/><w:sz w:val="18"/><w:szCs w:val="18"/><w:rtl/></w:rPr>${t}</w:r>`;
 const footer=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${NS}><w:p><w:pPr><w:pStyle w:val="Footer"/><w:bidi/><w:jc w:val="center"/></w:pPr>${fr('<w:t xml:space="preserve">صفحه </w:t>')}<w:fldSimple w:instr=" PAGE ">${fr('<w:t>1</w:t>')}</w:fldSimple>${fr('<w:t xml:space="preserve"> از </w:t>')}<w:fldSimple w:instr=" NUMPAGES ">${fr('<w:t>1</w:t>')}</w:fldSimple></w:p></w:ftr>`;
 const iso=new Date().toISOString().replace(/\.\d+Z$/,'Z');
 const core=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xe(m.title)}</dc:title><dc:creator>${xe(m.teacher||'برنامه‌ی کلاس')}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${iso}</dcterms:modified></cp:coreProperties>`;
 return [
  ['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`],
  ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`],
  ['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`],
  ['word/document.xml',doc],['word/styles.xml',styles],['word/settings.xml',settings],['word/footer1.xml',footer],['docProps/core.xml',core]
 ];
}
/* zip ساده (بدون فشرده‌سازی) با crc32 */
const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zipStore(files){
 const enc=new TextEncoder(),d=new Date(),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
 const parts=[],cen=[];let off=0;
 const w16=(a,v)=>a.push(v&255,(v>>8)&255),w32=(a,v)=>a.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255);
 files.forEach(([name,txt])=>{
  const nb=enc.encode(name),db=typeof txt==='string'?enc.encode(txt):txt,crc=crc32(db),h=[];
  w32(h,0x04034b50);w16(h,20);w16(h,0x0800);w16(h,0);w16(h,tm);w16(h,dt);w32(h,crc);w32(h,db.length);w32(h,db.length);w16(h,nb.length);w16(h,0);
  parts.push(new Uint8Array(h),nb,db);
  const c=[];w32(c,0x02014b50);w16(c,20);w16(c,20);w16(c,0x0800);w16(c,0);w16(c,tm);w16(c,dt);w32(c,crc);w32(c,db.length);w32(c,db.length);w16(c,nb.length);w16(c,0);w16(c,0);w16(c,0);w16(c,0);w32(c,0);w32(c,off);
  cen.push(new Uint8Array(c),nb);off+=h.length+nb.length+db.length;
 });
 let cl=0;cen.forEach(x=>cl+=x.length);
 const e=[];w32(e,0x06054b50);w16(e,0);w16(e,0);w16(e,files.length);w16(e,files.length);w32(e,cl);w32(e,off);w16(e,0);
 const all=[...parts,...cen,new Uint8Array(e)];let n=0;all.forEach(x=>n+=x.length);
 const out=new Uint8Array(n);let p=0;all.forEach(x=>{out.set(x,p);p+=x.length});return out;
}
const fileBase=m=>(m.bk+' - '+(m.showAns?'با پاسخ':m.key?'با پاسخنامه':'بدون پاسخ')).replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,90);
function saveDocx(){
 const m=model();if(!m.total)return;
 const bytes=zipStore(docxFiles(m));
 const name=fileBase(m)+'.docx';
 if(typeof window.dlFile==='function')window.dlFile(name,bytes);
 else{const u=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
}

/* ---------- رابط: گفت‌وگوی تنظیمات + پیش‌نمایش ---------- */
const css=document.createElement('style');css.textContent=`
#qxOv,#qxPv{position:fixed;inset:0;z-index:9998;background:rgba(30,20,50,.55);display:none}
#qxOv.on{display:flex;align-items:flex-end;justify-content:center}
#qxPv{z-index:9999;flex-direction:column}#qxPv.on{display:flex}
#qxOv .qx-bx{background:var(--card,#fff);width:min(680px,100%);max-height:94vh;overflow:auto;border-radius:22px 22px 0 0;padding:14px 16px 18px;box-shadow:0 -8px 40px rgba(0,0,0,.3);color:var(--tx,#3b2a55)}
@media(min-width:720px){#qxOv{align-items:center}#qxOv .qx-bx{border-radius:22px}}
#qxOv h3{margin:0 0 2px;font-size:17px}#qxOv .qx-sub{color:var(--mut,#8a7aa6);font-size:12.5px;margin-bottom:10px}
#qxOv .qx-s{margin:12px 0 4px;font-weight:800;font-size:13.5px;color:var(--p,#7e57c2)}
#qxOv .qx-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#qxOv .qx-ls{max-height:210px;overflow:auto;border:1px solid var(--line,#eadff7);border-radius:14px;padding:4px 8px;margin-top:6px}
#qxOv .qx-l{display:flex;gap:8px;align-items:center;padding:5px 2px;border-bottom:1px dashed var(--line,#eadff7);cursor:pointer;font-size:13.5px;margin:0}
#qxOv .qx-l:last-child{border:0}#qxOv .qx-l span{flex:1}#qxOv .qx-l small{color:var(--mut,#8a7aa6);font-size:11.5px}
#qxOv input[type=checkbox],#qxOv input[type=radio]{width:19px;height:19px;flex:none;margin:0}
#qxOv .qx-chip{border:1.5px solid var(--line,#eadff7);background:#fff;color:var(--tx,#3b2a55);border-radius:99px;padding:3px 12px;font-size:12.5px;cursor:pointer;width:auto;margin:0;font-family:inherit}
#qxOv .qx-chip.on{background:var(--p,#7e57c2);border-color:var(--p,#7e57c2);color:#fff;font-weight:700}
#qxOv .qx-chip small{opacity:.8;margin-right:5px}
#qxOv .qx-md{display:grid;gap:8px;margin-top:6px}
#qxOv .qx-m{display:flex;gap:10px;align-items:center;border:2px solid var(--line,#eadff7);border-radius:16px;padding:9px 12px;cursor:pointer;margin:0}
#qxOv .qx-m.on{border-color:var(--p,#7e57c2);background:rgba(126,87,194,.08)}
#qxOv .qx-m b{display:block;font-size:14px}#qxOv .qx-m small{color:var(--mut,#8a7aa6);font-size:12px}
#qxOv .qx-ck{display:flex;gap:8px;align-items:center;padding:4px 0;font-size:13.5px;cursor:pointer;margin:0}
#qxOv input[type=text],#qxOv select{width:100%;margin:2px 0 6px}
#qxOv .qx-g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#qxOv .qx-sum{margin-top:12px;padding:8px 12px;border-radius:14px;background:rgba(126,87,194,.1);font-weight:700;font-size:13.5px}
#qxOv .qx-sum.w{background:#fff4e0;color:#8a5a00}#qxOv .qx-sum.z{background:#fde8e8;color:#a33}
#qxOv .qx-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;position:sticky;bottom:-18px;background:var(--card,#fff);padding:8px 0 4px}
#qxOv .qx-act button{flex:1 1 150px;margin:0;width:auto;padding:11px 14px;font-size:14px}
#qxOv .qx-act button:disabled{opacity:.45;pointer-events:none}
#qxPv .qx-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:var(--card,#fff);padding:10px 12px}
#qxPv .qx-bar span{flex:1 1 200px;font-size:13px}#qxPv .qx-bar button{width:auto;flex:none;margin:0;padding:8px 16px;font-size:14px}
#qxPv iframe{flex:1;border:0;background:#e8e5f1;width:100%}
@media print{#qxOv,#qxPv{display:none!important}}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='qxOv';ov.innerHTML='<div class="qx-bx" role="dialog" aria-modal="true" aria-label="خروجی سؤال‌ها"></div>';document.body.appendChild(ov);
const pv=document.createElement('div');pv.id='qxPv';pv.innerHTML='<div class="qx-bar"><span id="qxPvT"></span><button class="big" type="button" data-qx="print">🖨️ چاپ / ذخیره PDF</button><button class="sm" type="button" data-qx="word">📄 Word</button><button class="sm" type="button" data-qx="back">⚙️ تنظیمات</button><button class="sm" type="button" data-qx="close">✖ بستن</button></div><iframe id="qxFr" title="پیش‌نمایش خروجی"></iframe>';document.body.appendChild(pv);
const box=ov.firstChild;

function dlgHtml(){
 const o=k=>opt(k);
 const chk=(k,t)=>`<label class="qx-ck"><input type="checkbox" data-o="${k}"${o(k)?' checked':''}>${t}</label>`;
 const md=(v,ic,t,d)=>`<label class="qx-m${o('mode')===v?' on':''}"><input type="radio" name="qxm" data-o="mode" value="${v}"${o('mode')===v?' checked':''}><span>${ic}</span><span><b>${t}</b><small>${d}</small></span></label>`;
  return `<h3>📤 خروجی سؤال‌های «${E(X.bk)}»</h3><div class="qx-sub">${X.gr?'پایه '+E(X.gr)+' · ':''}${F(X.all.length)} سؤال در ${F(X.groups.length)} درس — خروجی Word یا PDF بگیرید</div>
<div class="qx-s">۱) کدام درس‌ها؟</div>
<div class="qx-row"><button type="button" class="qx-chip" data-qx="lsall">انتخاب همه</button><button type="button" class="qx-chip" data-qx="lsnone">هیچ‌کدام</button></div>
<div class="qx-ls">${X.groups.map((g,i)=>`<label class="qx-l"><input type="checkbox" data-ls="${i}"${X.pickLs.has(g.name)?' checked':''}><span>${E(g.title)}</span><small>${F(g.items.length)} سؤال${g.pg?' · ص '+g.pg:''}</small></label>`).join('')}</div>
<div class="qx-s">۲) سطح و نوع سؤال</div>
<div class="qx-row" id="qxLv"></div>
<div class="qx-row" id="qxTy" style="margin-top:6px"></div>
<div class="qx-s">۳) نسخه‌ی خروجی</div>
<div class="qx-md">${md('q','📄','بدون پاسخ','برگه‌ی سؤال برای دانش‌آموز؛ زیر سؤال‌های تشریحی خط پاسخ می‌آید')}${md('a','✅','با پاسخ (نسخه‌ی آموزگار)','پاسخ درست زیر هر سؤال؛ گزینه‌ی درست مشخص می‌شود')}${md('qa','📑','سؤال‌ها + پاسخنامه‌ی جدا','سؤال‌ها بدون پاسخ، و پاسخنامه در صفحه‌ی آخر')}</div>
<div class="qx-s">۴) عنوان و ظاهر</div>
<input type="text" id="qxTitle" maxlength="120" placeholder="عنوان" value="${E('سؤال‌های '+X.bk)}">
<input type="text" id="qxSub" maxlength="120" placeholder="زیرعنوان (اختیاری؛ مثلاً: مرور فصل اول)">
<div class="qx-g2"><div><label style="font-size:12.5px">شماره‌گذاری سؤال‌ها</label><select data-o="num"><option value="cont"${o('num')==='cont'?' selected':''}>پیوسته (۱ تا آخر)</option><option value="ls"${o('num')==='ls'?' selected':''}>از ۱ در هر درس</option></select></div>
<div><label style="font-size:12.5px">اندازه‌ی قلم</label><select data-o="size"><option value="s"${o('size')==='s'?' selected':''}>کوچک</option><option value="m"${o('size')==='m'?' selected':''}>متوسط</option><option value="l"${o('size')==='l'?' selected':''}>بزرگ</option></select></div></div>
${chk('school','نام مدرسه و آموزگار در سربرگ')}${chk('meta','نمایش سطح و نوع کنار هر سؤال')}${chk('lines','خط پاسخ زیر سؤال‌های تشریحی و کوتاه‌پاسخ (فقط در نسخه‌ی بدون پاسخ)')}${chk('nameLine','خط نام دانش‌آموز و تاریخ')}${chk('shuffle','مخلوط‌کردن ترتیب سؤال‌ها در هر درس')}
<div class="qx-sum" id="qxSum"></div>
<div class="qx-act"><button type="button" class="big" data-qx="preview" id="qxB1">👁️ پیش‌نمایش و PDF</button><button type="button" class="big" data-qx="word" id="qxB2" style="background:linear-gradient(90deg,#2b6cd4,#4a90e2)">📄 دریافت Word</button><button type="button" class="sm" data-qx="close">انصراف</button></div>`;
}
function refresh(){
 const sel=X.groups.filter(g=>X.pickLs.has(g.name)),pool=sel.flatMap(g=>g.items);
 const cLv=k=>pool.filter(q=>(q.lv||'')===k&&X.ty.has(q.ty||'')).length,cTy=k=>pool.filter(q=>(q.ty||'')===k&&X.lv.has(q.lv||'')).length;
 const lv=$('qxLv'),ty=$('qxTy');
 if(lv)lv.innerHTML=LV.map(l=>`<button type="button" class="qx-chip${X.lv.has(l[0])?' on':''}" data-qx="lv" data-v="${l[0]}">${l[1]}<small>${F(cLv(l[0]))}</small></button>`).join('');
 if(ty){const ts=TY.filter(t=>X.all.some(q=>q.ty===t[0]));ty.innerHTML=ts.length>1?ts.map(t=>`<button type="button" class="qx-chip${X.ty.has(t[0])?' on':''}" data-qx="ty" data-v="${t[0]}">${t[1]}<small>${F(cTy(t[0]))}</small></button>`).join(''):''}
 const m=model(),s=$('qxSum');let cls='',txt;
 if(!m.total){cls='z';txt='سؤالی انتخاب نشده است؛ دست‌کم یک درس را تیک بزنید.'}
 else{txt=`${F(m.total)} سؤال از ${F(m.groups.length)} درس آماده‌ی خروجی است`;if(m.missing){cls='w';txt+=` — ⚠️ ${F(m.missing)} سؤال پاسخ ثبت‌شده ندارد و در پاسخ‌ها «ثبت نشده» می‌آید`}}
 s.className='qx-sum '+cls;s.textContent=txt;
 ['qxB1','qxB2'].forEach(id=>{const b=$(id);if(b)b.disabled=!m.total});
}
function openDlg(){box.innerHTML=dlgHtml();ov.classList.add('on');refresh();box.scrollTop=0}
function closeAll(){ov.classList.remove('on');pv.classList.remove('on');const fr=$('qxFr');fr.onload=null;fr.srcdoc=''}
function openPreview(){
 const m=model();if(!m.total)return;
 ov.classList.remove('on');
 const fr=$('qxFr');fr.onload=()=>{try{fr.contentDocument.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeAll()})}catch(e){}};
 fr.srcdoc=htmlDoc(m);
 $('qxPvT').textContent=`${m.title} — ${F(m.total)} سؤال · ${MODES[m.mode]} · برای PDF: «چاپ» را بزنید و مقصد را Save as PDF بگذارید`;
 pv.classList.add('on');
}
async function printNow(){const w=$('qxFr').contentWindow;if(!w)return;try{if(w.document.fonts&&w.document.fonts.ready)await w.document.fonts.ready}catch(e){}w.focus();w.print()}

ov.addEventListener('click',e=>{if(e.target===ov){closeAll();return}});
ov.addEventListener('change',e=>{
 const t=e.target;if(!X)return;
 if(t.dataset.ls!=null){const g=X.groups[+t.dataset.ls];if(g){if(t.checked)X.pickLs.add(g.name);else X.pickLs.delete(g.name)}refresh();return}
 const k=t.dataset.o;if(!k)return;
 if(t.type==='checkbox'){setOpt(k,t.checked);if(k==='shuffle')X.seed=(Math.random()*1e9)|0}
 else setOpt(k,t.value);
 if(k==='mode')box.querySelectorAll('.qx-m').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked));
 refresh();
});
function act(e){
 const b=e.target.closest&&e.target.closest('[data-qx]');if(!b||!X)return;const k=b.dataset.qx;
 if(k==='close')closeAll();
 else if(k==='lsall'){X.groups.forEach(g=>X.pickLs.add(g.name));box.querySelectorAll('[data-ls]').forEach(c=>c.checked=true);refresh()}
 else if(k==='lsnone'){X.pickLs.clear();box.querySelectorAll('[data-ls]').forEach(c=>c.checked=false);refresh()}
 else if(k==='lv'){const v=b.dataset.v;if(X.lv.has(v)&&X.lv.size>1)X.lv.delete(v);else X.lv.add(v);refresh()}
 else if(k==='ty'){const v=b.dataset.v,all=TY.filter(t=>X.all.some(q=>q.ty===t[0]));if(X.ty.has(v)&&X.ty.size>1)X.ty.delete(v);else X.ty.add(v);refresh()}
 else if(k==='preview')openPreview();
 else if(k==='word')saveDocx();
 else if(k==='back'){pv.classList.remove('on');ov.classList.add('on');refresh()}
 else if(k==='print')printNow();
}
ov.addEventListener('click',act);pv.addEventListener('click',act);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(ov.classList.contains('on')||pv.classList.contains('on')))closeAll()});

window.QEXP={
 open(o){
  o=o||{};const key=o.key||((o.gr||'')+'§'+(o.bk||''));
  const d=loadBook(key);if(!d.all.length){alert('این کتاب هنوز سؤالی ندارد.');return}
  const names=d.groups.map(g=>g.name);
  let pk=(o.pick&&o.pick.length?o.pick:(o.ls?[o.ls]:[])).filter(n=>names.includes(n));
  X={key,gr:o.gr||'',bk:o.bk||'بدون نام',all:d.all,groups:d.groups,pickLs:new Set(pk.length?pk:names),
   lv:new Set(['e','m','h','']),ty:new Set(TY.map(t=>t[0]).concat([''])),seed:(Math.random()*1e9)|0};
  openDlg();
 },
 /* برای تست و استفاده‌ی برنامه‌نویسی */
 _model:()=>X?model():null,_html:()=>X?htmlDoc(model()):'',_docx:()=>X?zipStore(docxFiles(model())):null
};
}catch(e){console.error('question-export',e)}})();

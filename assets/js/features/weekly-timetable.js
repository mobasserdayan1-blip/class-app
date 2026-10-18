/* برنامه‌ی هفتگی کلاس */
(function(){try{
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const DAYS=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه'];
const ORD=['اول','دوم','سوم','چهارم','پنجم','ششم','هفتم','هشتم','نهم','دهم'];const ORDW=i=>ORD[i]||fa(i+1);
const DEF_KINDS=[{name:'انشا',cn:'فارسی'},{name:'املا',cn:'فارسی'},{name:'ورزش',cn:'تربیت بدنی'},{name:'نماز'},{name:'زنگ آزاد'}];
const tm=s=>{const a=(s||'0:0').split(':').map(Number);return(a[0]||0)*60+(a[1]||0)};
const tstr=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const hhmm=s=>fa(tstr(tm(s)));
const nowM=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const todayIdx=()=>(new Date().getDay()+1)%7;
const todayISO=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12)).toISOString().slice(0,10)};
const isOff=()=>todayIdx()>4||!!(S.closed&&S.closed[todayISO()]);
const persist=()=>{try{save()}catch(e){console.warn('wsc save',e)}};
const courseBy=id=>(S.courses||[]).find(c=>c.id===id);

function recalc(w){let m=tm(w.start);w.per=Array.from({length:w.n},(_,i)=>{const s=tstr(m);m+=w.dur+(+w.gaps[i]||0);return{s}})}
const W=()=>{
 let w=S.wsc;if(!w||typeof w!=='object')w=S.wsc={};
 w.cell=w.cell||{};w.dur=Math.max(10,Math.min(180,+w.dur||45));
 const legacy=Array.isArray(w.per)&&w.per.length?w.per:[{s:'07:30'},{s:'08:15'},{s:'09:15'},{s:'10:00'}];
 if(!w.start)w.start=legacy[0].s||'07:30';
 const n=Math.max(1,Math.min(10,w.n||legacy.length));w.n=n;
 if(!Array.isArray(w.gaps)){w.gaps=[];for(let i=0;i<n-1;i++){const g=legacy[i+1]?tm(legacy[i+1].s)-(tm(legacy[i].s)+w.dur):10;w.gaps.push(Math.max(0,Math.min(60,isFinite(g)?g:10)))}}
 while(w.gaps.length<n-1)w.gaps.push(10);w.gaps.length=n-1;
 if(!Array.isArray(w.kinds)){const t=Date.now();w.kinds=DEF_KINDS.map((k,i)=>Object.assign({id:t+i},k))}
 recalc(w);
 return w};
const kindBy=id=>(W().kinds||[]).find(k=>k.id===id);
const linked=k=>k&&k.cn?(S.courses||[]).find(c=>c.name===k.cn):null;
const itName=it=>it.c!=null?courseBy(it.c).name:kindBy(it.k).name;
const itCid=it=>it.c!=null?it.c:(linked(kindBy(it.k))||{}).id;
const hueC=id=>{const i=(S.courses||[]).findIndex(c=>c.id===id);return(Math.max(i,0)*47+265)%360};
const hueIt=it=>{if(it.c!=null)return hueC(it.c);const k=kindBy(it.k),l=linked(k);if(l)return hueC(l.id);const i=W().kinds.indexOf(k);return(i*73+25)%360};
const items=(d,i)=>{const v=W().cell[d+'_'+i];if(v==null||v==='')return[];const a=(Array.isArray(v)?v:[v]).map(x=>x&&typeof x==='object'?x:{c:x});return a.filter(x=>x&&(x.c!=null?courseBy(x.c):x.k!=null&&kindBy(x.k))).slice(0,2)};
const lab=its=>its.map(itName).join(' + ');
const cids=its=>[...new Set(its.map(itCid).filter(x=>x!=null))];
const endM=i=>tm(W().per[i].s)+W().dur;
const hasAny=()=>Object.keys(W().cell).some(k=>items(+k.split('_')[0],+k.split('_')[1]).length);
function dayAll(idx){const w=W();return w.per.map((p,i)=>({i,s:p.s,e:tm(p.s)+w.dur,its:items(idx,i)}))}
function status(){
 const idx=todayIdx();if(isOff())return{off:true,idx,L:[]};
 const all=dayAll(idx),L=all.filter(x=>x.its.length),n=nowM();
 const cur=L.find(x=>n>=tm(x.s)&&n<x.e),nxt=L.find(x=>tm(x.s)>n),prev=[...L].reverse().find(x=>x.e<=n);
 let brk=null;for(let i=0;i<all.length-1;i++){const a=all[i].e,b=tm(all[i+1].s);if(b>a&&n>=a&&n<b)brk={i,until:b,len:b-a}}
 return{idx,L,all,cur,nxt,prev,brk};
}

const css=document.createElement('style');css.id='wscCss';css.textContent=`
#wsc .ws-hero{position:relative;overflow:hidden;border-radius:26px;padding:18px;color:#fff;margin-bottom:12px;background:linear-gradient(135deg,#2f80ed 0%,#7e57c2 55%,#ff7aa2 100%);box-shadow:0 12px 30px #2f80ed40;animation:wsin .5s both}
#wsc .ws-hero::before,#wsc .ws-hero::after{content:"";position:absolute;border-radius:50%;background:#ffffff24;animation:wsfloat 7s ease-in-out infinite}
#wsc .ws-hero::before{width:130px;height:130px;left:-36px;top:-46px}#wsc .ws-hero::after{width:80px;height:80px;left:80px;bottom:-34px;animation-delay:-3s}
#wsc .ws-hero h3{position:relative;z-index:1;margin:0 0 6px;font-size:18px}
#wsc .ws-hero p{position:relative;z-index:1;margin:0;font-size:13.5px;line-height:1.95;opacity:.97}
#wsc .ws-card{background:var(--card);border-radius:22px;padding:14px;margin-bottom:12px;box-shadow:0 4px 16px #7e57c21f;animation:wsin .5s both}
#wsc .ws-card h4{margin:0 0 10px;font-size:15px}
#wsc .ws-tw{overflow-x:auto;margin:0 -4px;padding:4px}
#wsc table.ws-t{width:100%;min-width:330px;border-collapse:separate;border-spacing:5px;table-layout:fixed}
#wsc .ws-t th,#wsc .ws-t td{background:none;border:0;padding:3px 2px;text-align:center;white-space:normal}
#wsc .ws-t th{font-size:12px;font-weight:800;color:var(--mut);padding:4px 2px;text-align:center}
#wsc .ws-t th.td{color:var(--p)}
#wsc .ws-t th.td span{display:block;margin:3px auto 0;width:22px;height:4px;border-radius:4px;background:linear-gradient(90deg,#7e57c2,#ff7aa2)}
#wsc .ws-pt{width:54px}#wsc .ws-pt b{display:block;font-size:12px;color:var(--tx)}#wsc .ws-pt small{font-size:10.5px;color:var(--mut)}
#wsc .ws-c{width:100%;min-height:52px;border:2px dashed var(--line);border-radius:14px;background:transparent;color:var(--mut);font:700 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer;padding:4px 3px;line-height:1.5;transition:transform .15s,box-shadow .2s,background .2s;animation:wspop .45s both;animation-delay:calc(var(--i,0)*28ms)}
#wsc .ws-c:active{transform:scale(.92)}
#wsc .ws-c.f{border:2px solid transparent;background:hsl(var(--h) 75% 62% / .22);color:var(--tx)}
#wsc .ws-c.f:hover{box-shadow:0 6px 16px hsl(var(--h) 70% 50% / .25);transform:translateY(-2px)}
#wsc .ws-c.now{border-color:hsl(var(--h) 80% 55%);animation:wspop .45s both,wsglow 1.8s ease-in-out infinite}
#wsc .ws-c.tdcol{background-image:linear-gradient(#7e57c20d,#7e57c20d)}
#wsc .ws-row{display:flex;gap:8px;flex-wrap:wrap}
#wsc .ws-b{flex:1;min-width:130px;border:0;border-radius:16px;padding:11px 10px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;color:#fff;background:linear-gradient(90deg,#7e57c2,#ff7aa2);box-shadow:0 6px 16px #7e57c23a;transition:transform .15s}
#wsc .ws-b:active{transform:scale(.95)}#wsc .ws-b.g{background:var(--bg2);color:var(--tx);box-shadow:none}
#wsc .ws-ld{display:flex;align-items:center;gap:8px;margin:7px 0;font-size:12.5px}
#wsc .ws-ld span{flex:none;width:76px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#wsc .ws-ld i{display:block;height:11px;border-radius:8px;background:hsl(var(--h) 70% 58%);width:0;transition:width .9s cubic-bezier(.2,.8,.2,1)}
#wsc .ws-ld b{flex:none;font-size:12px}
#wsc details.ws-set summary{cursor:pointer;font-weight:800;font-size:14px;list-style:none}
#wsc .ws-st{display:flex;align-items:center;gap:10px;margin:10px 0}
#wsc .ws-st button{width:36px;height:36px;border-radius:12px;border:0;background:var(--bg2);color:var(--tx);font-size:20px;cursor:pointer;transition:transform .15s}
#wsc .ws-st button:active{transform:scale(.88)}#wsc .ws-st b{min-width:28px;text-align:center;font-size:18px}
#wsc .ws-pr{display:flex;align-items:center;gap:10px;margin:7px 0;font-size:13px}#wsc .ws-pr span{width:56px;font-weight:700}
#wsc .ws-in{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:8px 10px;font:inherit;font-size:14px}
#wsc .ws-note{font-size:12px;color:var(--mut);line-height:2;background:var(--bg2);border-radius:14px;padding:10px 12px;margin-top:10px}
#wsSheetBg{position:fixed;inset:0;background:#1d123a73;z-index:99990;display:none;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s}
#wsSheetBg.on{display:flex;opacity:1}
#wsSheet{width:100%;max-width:520px;background:var(--card);color:var(--tx);border-radius:26px 26px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));max-height:80vh;overflow:auto;animation:wsup .3s cubic-bezier(.2,.9,.3,1.1) both}
#wsSheet h4{margin:0 0 4px;font-size:16px}#wsSheet p{margin:0 0 12px;font-size:12.5px;color:var(--mut)}
#wsSheet .g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#wsSheet .g button{border:2px solid transparent;border-radius:14px;padding:12px 6px;font:800 13px Vazirmatn,Tahoma,sans-serif;color:var(--tx);cursor:pointer;background:hsl(var(--h) 75% 62% / .22);transition:transform .15s}
#wsSheet .g button:active{transform:scale(.93)}#wsSheet .g button.sel{border-color:hsl(var(--h) 80% 50%)}
#wsSheet .g button.em{background:var(--bg2);color:var(--mut)}
#wsSheet label{display:flex;align-items:center;gap:8px;font-size:13px;margin-top:12px;cursor:pointer}
.ws-today{position:relative;overflow:hidden;border-radius:22px;padding:14px;margin-bottom:12px;background:linear-gradient(135deg,#e7f0ff,#f3ebff);box-shadow:0 6px 18px #2f80ed26;cursor:pointer;animation:wsin .5s both;color:var(--tx)}
:root[data-theme="dark"] .ws-today{background:linear-gradient(135deg,#1e2a44,#2c2142)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ws-today{background:linear-gradient(135deg,#1e2a44,#2c2142)}}
.ws-today{cursor:default}.ws-today h4{cursor:pointer}.ws-today .ws-pl span{cursor:pointer}
.ws-bar{height:8px;border-radius:99px;background:#7e57c233;overflow:hidden;margin:-2px 0 10px}.ws-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7e57c2,#ff7aa2);transition:width .6s}
.ws-qb{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.ws-ql{grid-column:1/-1;font-size:12px;font-weight:700;color:var(--mut)}
.ws-qb button,.ws-qa button{border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:16px;padding:11px 6px;font:800 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.ws-qb button:active,.ws-qa button:active{transform:scale(.97)}
.ws-qa{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ws-qa button{padding:14px 6px;font-size:14px}
.ws-tm{margin-top:10px;font-size:12.5px;font-weight:700;color:var(--mut);line-height:1.8}
.ws-today h4{margin:0 0 5px;font-size:14.5px}.ws-today p{margin:0 0 10px;font-size:13px;line-height:1.9;font-weight:600}
.ws-pl{display:flex;gap:6px;flex-wrap:wrap}
.ws-pl span{border-radius:12px;padding:5px 10px;font-size:12px;font-weight:700;background:hsl(var(--h) 75% 62% / .25);animation:wspop .45s both;animation-delay:calc(var(--i,0)*70ms)}
.ws-pl span.past{opacity:.45;text-decoration:line-through}
.ws-pl span.now{outline:2px solid hsl(var(--h) 80% 50%);animation:wspop .45s both,wspulse 1.7s ease-in-out infinite}
.ws-hw{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0;font-size:12.5px;font-weight:700}
.ws-hw button{border:0;border-radius:14px;padding:5px 11px;font:700 12px Vazirmatn,Tahoma,sans-serif;color:var(--tx);cursor:pointer;background:hsl(var(--h) 75% 62% / .28);transition:transform .15s}
.ws-hw button:active{transform:scale(.92)}
#wsPrint{display:none}
@keyframes wsin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes wspop{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:none}}
@keyframes wsup{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}
@keyframes wsfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes wsglow{0%,100%{box-shadow:0 0 0 0 hsl(var(--h) 80% 55% / .5)}50%{box-shadow:0 0 0 8px hsl(var(--h) 80% 55% / 0)}}
@keyframes wspulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@media (prefers-reduced-motion:reduce){#wsc *,.ws-today,.ws-today *,#wsSheet{animation:none!important;transition:none!important}}
#wsc .ws-pt{width:54px}#wsc .ws-pt small{display:block;font-size:9.5px;line-height:1.45}
#wsc table.ws-t{border-spacing:3px}#wsc .ws-c{font-size:11.5px;padding:4px 1px;word-break:keep-all;overflow-wrap:normal;hyphens:none}
#wsSheet label{justify-content:flex-start}
#wsc .ws-c.two{background-image:linear-gradient(135deg,hsl(var(--h) 75% 62% / .3) 50%,hsl(var(--h2) 75% 62% / .3) 50%)}
#wsc .ws-c .w2{display:block;font-size:11px;opacity:.85;margin-top:2px}
#wsc .ws-rc td{padding:0 2px;text-align:center;font-size:10.5px;color:var(--mut);height:20px}
#wsc .ws-rc td span{display:block;border-radius:10px;background:var(--bg2);padding:2px 6px}
#wsc .ws-rc.now td span{background:#ffe9b8;color:#7a4b00;font-weight:800}
#wsc .ws-kr{display:flex;align-items:center;gap:6px;margin:7px 0;flex-wrap:wrap}
#wsc .ws-kr .ws-in{flex:1;min-width:90px}
#wsc .ws-kr select.ws-in{flex:1;min-width:110px}
#wsc .ws-kr button{border:0;border-radius:10px;background:var(--bg2);color:var(--tx);padding:7px 10px;cursor:pointer;font:700 12px Vazirmatn,Tahoma,sans-serif}
#wsc .ws-kh{font-size:12px;color:var(--mut);margin:12px 0 4px;font-weight:800}
#wsc .ws-tl{font-size:12px;color:var(--mut);line-height:2;margin:6px 0}
#wsc .ws-tl b{color:var(--tx)}
#wsSheet h5{margin:12px 0 6px;font-size:13px}
#wsSheet .ws-sel{display:flex;gap:6px;flex-wrap:wrap;min-height:30px;margin-bottom:4px}
#wsSheet .ws-sel em{color:var(--mut);font-size:12.5px}
#wsSheet .ws-sc{display:inline-flex;align-items:center;gap:6px;border-radius:12px;padding:4px 6px 4px 10px;font-size:12.5px;font-weight:800;background:hsl(var(--h) 75% 62% / .3)}
#wsSheet .ws-sc button{border:0;background:#0000001f;border-radius:50%;width:20px;height:20px;line-height:20px;padding:0;cursor:pointer;color:inherit;font-size:11px}
#wsSheet .ws-er{color:#c62828;font-size:12.5px;margin:6px 0;font-weight:700}
#wsSheet .ws-row{display:flex;gap:8px;margin-top:14px}
#wsSheet .ws-row button{flex:1;border:0;border-radius:16px;padding:12px 8px;font:800 13.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer;color:#fff;background:linear-gradient(90deg,#7e57c2,#ff7aa2)}
#wsSheet .ws-row button.g{background:var(--bg2);color:var(--tx)}
#wsSheet .ws-row button.dg{background:#d32f2f}
#wsSheet .g button.ks{background:hsl(var(--h) 60% 70% / .28);border-style:dashed}
#wsSheet .g button.ks.sel{border-style:solid}
`;document.head.appendChild(css);

let tt;const toast=m=>{let t=$('exToast');if(!t){t=document.createElement('div');t.id='exToast';document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2800)};
let setOpen=false,kOpen=false,sh={d:0,p:0,sel:[],all:false,msg:''},pendAct=null;
const fmt1=x=>fa(String(+x.toFixed(1)).replace('.','٫'));
const bellRange=i=>hhmm(W().per[i].s)+' تا '+hhmm(tstr(endM(i)));

function hero(){
 const st=status();let h,p;
 if(!hasAny()){h='🗓️ برنامه هفتگی کلاس';p='هنوز برنامه‌ای نچیده‌اید. روی هر خانه‌ی جدول بزنید و درس یا زنگ ویژه‌ی آن زنگ را انتخاب کنید.'}
 else if(st.off){h='🌴 امروز تعطیل است';p=(todayIdx()>4?'پنجشنبه و جمعه تعطیل‌اند':'این روز در برنامه تعطیل ثبت شده')+'؛ برنامه‌ی کلاس از روز بعدی ادامه دارد.'}
 else if(!st.L.length){h='☀️ امروز زنگی ثبت نشده';p='برای '+DAYS[st.idx]+' هنوز چیزی تعیین نشده است.'}
 else{h='امروز '+fa(st.L.length)+' زنگ دارید';
  const nx=x=>'زنگ بعدی: '+esc(lab(x.its))+'، ساعت '+hhmm(x.s);
  if(st.cur)p='الان زنگ '+fa(st.cur.i+1)+': «'+esc(lab(st.cur.its))+'» است (تا ساعت '+hhmm(tstr(st.cur.e))+')'+(st.nxt?'<br>'+nx(st.nxt):'');
  else if(st.brk)p='☕ الان تفریح است (تا ساعت '+hhmm(tstr(st.brk.until))+')'+(st.nxt?'<br>'+nx(st.nxt):'');
  else p=st.nxt?nx(st.nxt):'زنگ‌های امروز تمام شده است ✅'}
 return`<div class="ws-hero"><h3>${h}</h3><p>${p}</p></div>`;
}
function cellBtn(d,i,st,ti,n){
 const its=items(d,i),has=its.length>0,now=has&&st.cur&&d===ti&&st.cur.i===i;
 const h=has?hueIt(its[0]):0,h2=its[1]?hueIt(its[1]):h;
 const inner=has?`${esc(itName(its[0]))}${its[1]?`<span class="w2">+ ${esc(itName(its[1]))}</span>`:''}`:'＋';
 return`<td><button class="ws-c ${has?'f':''} ${its.length>1?'two':''} ${now?'now':''} ${d===ti?'tdcol':''}" data-d="${d}" data-p="${i}" style="--i:${n};--h:${h};--h2:${h2}">${inner}</button></td>`;
}
function grid(){
 const w=W(),st=status(),ti=todayIdx();let n=0;
 const head=`<tr><th class="ws-pt"></th>${DAYS.map((d,i)=>`<th class="${i===ti?'td':''}">${d}${i===ti?'<span></span>':''}</th>`).join('')}</tr>`;
 const rows=w.per.map((p,i)=>{
  const r=`<tr><th class="ws-pt"><b>زنگ ${fa(i+1)}</b><small>${hhmm(p.s)}</small><small>تا ${hhmm(tstr(endM(i)))}</small></th>${DAYS.map((_,d)=>cellBtn(d,i,st,ti,n++)).join('')}</tr>`;
  const g=+w.gaps[i]||0;
  const rc='';
  return r+rc}).join('');
 return`<div class="ws-card" style="animation-delay:.05s"><div class="ws-tw" data-noresp><table class="ws-t" data-noresp><thead>${head}</thead><tbody>${rows}</tbody></table></div>
 <div class="ws-note">💡 روی هر خانه بزنید تا درس یا زنگ ویژه (انشا، املا، نماز، ورزش، آزاد…) را انتخاب کنید؛ هر زنگ تا دو مورد می‌پذیرد. ساعت هر زنگ از روی «شروع + مدت زنگ + تفریح» خودکار حساب می‌شود.</div></div>`;
}
function load(){
 const w=W(),cnt={},sub={};
 Object.keys(w.cell).forEach(k=>{const[d,i]=k.split('_').map(Number);if(i>=w.per.length||d>4)return;const its=items(d,i);if(!its.length)return;const wt=1/its.length;
  its.forEach(it=>{const cid=itCid(it),key=cid!=null?'c'+cid:'k'+it.k;cnt[key]=(cnt[key]||0)+wt;if(it.k!=null&&cid!=null){const s=sub[key]=sub[key]||{};const nm=kindBy(it.k).name;s[nm]=(s[nm]||0)+wt}})});
 const keys=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]);if(!keys.length)return'';
 const mx=cnt[keys[0]],tot=keys.reduce((s,k)=>s+cnt[k],0);
 const row=key=>{const isC=key[0]==='c',id=+key.slice(1),nm=isC?courseBy(id).name:kindBy(id).name,h=isC?hueC(id):hueIt({k:id}),sb=sub[key]?Object.keys(sub[key]).map(n=>fmt1(sub[key][n])+' '+n).join('، '):'';
  return`<div class="ws-ld" style="--h:${h}"><span>${esc(nm)}</span><i data-w="${Math.round(cnt[key]/mx*100)}"></i><b>${fmt1(cnt[key])}</b></div>${sb?`<div class="ws-tl" style="margin:-4px 0 4px">↳ شامل: ${esc(sb)}</div>`:''}`};
 return`<div class="ws-card" style="animation-delay:.12s"><h4>📊 تعداد زنگ هفتگی هر درس <small style="font-weight:600;color:var(--mut)">(جمعاً ${fmt1(tot)} زنگ)</small></h4>${keys.map(row).join('')}<div class="ws-tl">زنگ‌هایی که دو مورد دارند، نیم‌نیم حساب می‌شوند؛ انشا و املا به درس مادرشان (مثلاً فارسی) اضافه می‌شوند.</div></div>`;
}
function settings(){
 const w=W(),n=w.per.length;
 const tl=w.per.map((p,i)=>`<div class="ws-tl"><b>زنگ ${fa(i+1)}:</b> ${bellRange(i)}</div>${i<n-1?`<div class="ws-pr"><span style="width:auto;flex:1">☕ تفریح بعد از زنگ ${fa(i+1)}</span><input class="ws-in" type="number" min="0" max="60" data-gap="${i}" value="${+w.gaps[i]||0}" style="width:72px"> دقیقه</div>`:''}`).join('');
 return`<div class="ws-card" style="animation-delay:.18s"><details class="ws-set" id="wsSetD" ${setOpen?'open':''}><summary>⚙️ تنظیم زنگ‌ها، مدت و تفریح</summary>
 <div class="ws-st"><span>تعداد زنگ‌ها</span><button data-a="pm">−</button><b>${fa(n)}</b><button data-a="pp">+</button></div>
 <div class="ws-pr"><span style="width:auto">شروع اولین زنگ</span><input class="ws-in" type="time" id="wsStart" value="${esc(w.start)}"></div>
 <div class="ws-pr"><span style="width:auto">مدت هر زنگ</span><input class="ws-in" type="number" min="10" max="180" id="wsDur" value="${w.dur}" style="width:84px"> دقیقه</div>
 <div class="ws-pr"><span style="width:auto">همه‌ی تفریح‌ها یکسان</span><input class="ws-in" type="number" min="0" max="60" id="wsGapAll" value="10" style="width:72px"> دقیقه <button class="ws-b g" data-a="gapall" style="flex:none;min-width:0;padding:8px 12px">اعمال</button></div>
 <div class="ws-kh">⏱️ ساعت هر زنگ (خودکار)</div>${tl}
 <div class="ws-tl">پایان آخرین زنگ: <b>${hhmm(tstr(endM(n-1)))}</b></div></details></div>
 <div class="ws-card" style="animation-delay:.2s"><details class="ws-set" id="wsKD" ${kOpen?'open':''}><summary>🔔 زنگ‌های ویژه (انشا، املا، نماز، ورزش، آزاد…)</summary>
 <div class="ws-tl">این‌ها کتاب درسی جدا ندارند ولی برایشان زنگ تعریف می‌شود. با «درس مادر» می‌توانید مشخص کنید در آمار و انتخاب خودکار درس، جزو کدام درس حساب شوند (مثلاً انشا ← فارسی، ورزش ← تربیت بدنی).</div>
 ${w.kinds.map(k=>`<div class="ws-kr"><input class="ws-in" data-kn="${k.id}" value="${esc(k.name)}" maxlength="24"><select class="ws-in" data-kc="${k.id}"><option value="">درس مادر: مستقل</option>${(S.courses||[]).map(c=>`<option value="${esc(c.name)}" ${c.name===k.cn?'selected':''}>${esc(c.name)}</option>`).join('')}${k.cn&&!linked(k)?`<option value="${esc(k.cn)}" selected>${esc(k.cn)} (در این کلاس نیست)</option>`:''}</select><button data-kd="${k.id}" title="حذف">🗑</button></div>`).join('')}
 <div class="ws-kr"><input class="ws-in" id="wsKNew" placeholder="زنگ ویژه‌ی جدید، مثلاً «مطالعه‌ی آزاد»" maxlength="24"><button data-a="kadd">➕ افزودن</button></div></details></div>`;
}
function actions(){
 return`<div class="ws-card" style="animation-delay:.24s"><div class="ws-row"><button class="ws-b" data-a="pdf">📄 دریافت PDF (A4)</button><button class="ws-b g" data-a="print">🖨️ چاپ مستقیم</button><button class="ws-b g" data-a="clear">🧹 پاک‌کردن همه</button></div><div class="ws-note">هر کلاس برنامه‌ی مستقل خودش را دارد؛ با تعویض کلاس از بالای صفحه، برنامه‌ی همان کلاس نمایش داده می‌شود و تغییر در یک کلاس روی کلاس‌های دیگر اثری ندارد.</div></div>`;
}
function renderW(){
 const b=$('wscBody');if(!b)return;
 b.innerHTML=hero()+grid()+load()+settings()+actions();
 requestAnimationFrame(()=>requestAnimationFrame(()=>b.querySelectorAll('.ws-ld i').forEach(i=>i.style.width=i.dataset.w+'%')));
}

function ensureBg(){
 let bg=$('wsSheetBg');if(bg)return bg;
 bg=document.createElement('div');bg.id='wsSheetBg';bg.innerHTML='<div id="wsSheet"></div>';document.body.appendChild(bg);
 bg.addEventListener('click',e=>{
  if(e.target===bg){bg.classList.remove('on');pendAct=null;return}
  const t=e.target.closest('button,input');if(!t)return;
  if(t.id==='wsAll'){sh.all=t.checked;return}
  if(t.dataset.no!=null){bg.classList.remove('on');pendAct=null;return}
  if(t.dataset.yes!=null){const f=pendAct;pendAct=null;bg.classList.remove('on');if(f)f();return}
  if(t.dataset.c!=null||t.dataset.k!=null){
   const it=t.dataset.c!=null?{c:+t.dataset.c}:{k:+t.dataset.k},same=x=>(x.c!=null&&x.c===it.c)||(x.k!=null&&x.k===it.k),ix=sh.sel.findIndex(same);
   if(ix>=0){sh.sel.splice(ix,1);sh.msg=''}else if(sh.sel.length>=2)sh.msg='هر زنگ حداکثر دو مورد دارد؛ ابتدا یکی را بردارید.';else{sh.sel.push(it);sh.msg=''}
   sheetUI();return}
  if(t.dataset.rm!=null){sh.sel.splice(+t.dataset.rm,1);sh.msg='';sheetUI();return}
  if(t.dataset.em!=null){sh.sel=[];sh.msg='';sheetUI();return}
  if(t.dataset.sv!=null){
   const w=W(),days=sh.all?[0,1,2,3,4]:[sh.d];
   days.forEach(dd=>{const k=dd+'_'+sh.p;if(!sh.sel.length)delete w.cell[k];else w.cell[k]=sh.sel.map(x=>Object.assign({},x))});
   persist();bg.classList.remove('on');renderW();toast(sh.sel.length?'ثبت شد ✅':'خانه خالی شد');return}
 });
 return bg;
}
function sheetUI(){
 const w=W(),cs=S.courses||[],{d,p,sel}=sh;
 const chip=(it,i)=>`<span class="ws-sc" style="--h:${hueIt(it)}">${esc(itName(it))}<button data-rm="${i}" aria-label="حذف">✕</button></span>`;
 const on=x=>sel.some(s=>(x.c!=null&&s.c===x.c)||(x.k!=null&&s.k===x.k));
 $('wsSheet').innerHTML=`<h4>${DAYS[d]} — زنگ ${fa(p+1)}</h4><p>ساعت ${bellRange(p)}؛ حداکثر دو مورد برای یک زنگ.</p>
 <div class="ws-sel">${sel.length?sel.map(chip).join(''):'<em>خالی (چیزی انتخاب نشده)</em>'}</div>${sh.msg?`<div class="ws-er">${esc(sh.msg)}</div>`:''}
 <h5>📚 درس‌ها</h5><div class="g">${cs.map(c=>`<button data-c="${c.id}" class="${on({c:c.id})?'sel':''}" style="--h:${hueC(c.id)}">${esc(c.name)}</button>`).join('')||'<span style="grid-column:1/-1;color:var(--mut);font-size:12.5px">هنوز درسی تعریف نشده است.</span>'}</div>
 <h5>🔔 زنگ‌های ویژه</h5><div class="g">${w.kinds.map(k=>`<button class="ks ${on({k:k.id})?'sel':''}" data-k="${k.id}" style="--h:${hueIt({k:k.id})}">${esc(k.name)}</button>`).join('')}</div>
 <label><input type="checkbox" id="wsAll" ${sh.all?'checked':''}> همین انتخاب را برای همه‌ی روزهای این زنگ بگذار</label>
 <div class="ws-row"><button data-sv>✅ ثبت</button><button class="g" data-em>خالی کردن</button></div>`;
}
function openSheet(d,p){
 const bg=ensureBg();sh={d,p,sel:items(d,p).map(x=>Object.assign({},x)),all:false,msg:''};sheetUI();bg.classList.add('on');
}
function confirmDlg(title,text,yesLabel,fn){
 const bg=ensureBg();pendAct=fn;
 $('wsSheet').innerHTML=`<h4>${title}</h4><p style="font-size:13.5px;line-height:2">${text}</p><div class="ws-row"><button class="dg" data-yes>${yesLabel}</button><button class="g" data-no>انصراف</button></div>`;
 bg.classList.add('on');
}

const EMO=[[/ریاضی/,'📐'],[/قرآن/,'📕'],[/نگارش|انشا/,'📝'],[/فارسی/,'📘'],[/علوم/,'⚛️'],[/مطالعات/,'🌍'],[/هدیه/,'⭐'],[/هنر/,'🎨'],[/ورزش|تربیت/,'⚽'],[/نماز/,'🤲'],[/املا/,'✏️'],[/آزاد|بیکار/,'🎈'],[/کار و فناوری|کارورزی/,'🛠️'],[/تفکر/,'💡'],[/زبان|انگلیسی/,'🔤'],[/مطالعه/,'📚'],[/بازی/,'🎲']];
const emo=n=>{for(const[r,e]of EMO)if(r.test(n))return e;return'⭐'};
const DAYC=[['#fff1c9','#ffe3a0','#f4c95d'],['#ffdbe4','#ffc1d1','#f08aa5'],['#d6ecff','#b9dcfa','#6fb2ea'],['#d3f5e8','#b3ebd5','#58c9a0'],['#e6dcff','#d2c1fb','#9a7be8']];
const schYear=()=>{try{const f=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric'}).formatToParts(new Date());let y=0,m=0;f.forEach(p=>{if(p.type==='year'||p.type==='relatedYear')y=+p.value;if(p.type==='month')m=+p.value});return m>=7?y+'-'+(y+1):(y-1)+'-'+y}catch(e){return''}};
function sheetHTML(px=true){
 const w=W(),me=(S.classes||[]).find(c=>c.id===S.cur)||{},pf=S.prof||{},n=w.per.length;
 const F='font-family:Vazirmatn,Tahoma,sans-serif;';
 const grade=me.grade||pf.grade||'',sec=me.sec||pf.sec||'',teacher=me.teacher||pf.teacher||'',principal=pf.principal||'';
 const school=(window.schoolFull?window.schoolFull(pf):pf.school)||'';
 const hh=60,fs=n<=6?22:n<=8?19:16,ef=n<=6?19:15;
 const tile=(it,small)=>{const nm=itName(it);return small?`<div style="font-size:${fs-5}px;font-weight:700;margin-top:3px;color:#4a3a78">+ ${esc(nm)}</div>`:`<div style="font-size:${fs}px;font-weight:800;color:#2f2457;line-height:1.5"><span style="font-size:${ef}px">${emo(nm)}</span> ${esc(nm)}</div>`};
 const cb='display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;min-width:0;border-radius:20px;';
 const cell=(d,i)=>{const its=items(d,i),c=DAYC[d%5];
  if(!its.length)return`<div style="${cb}background:#ffffffa6;border:2px dashed ${c[2]}66"></div>`;
  return`<div style="${cb}padding:5px 4px;background:linear-gradient(160deg,${c[0]},${c[1]});border:2px solid ${c[2]}88;box-shadow:0 4px 0 ${c[2]}55">${its.map((x,j)=>tile(x,j>0)).join('')}</div>`};
 const hb=cb+'border-radius:18px;';
 const head=`<div style="${hb}background:#fff;color:#6a45bf;font-size:16px;font-weight:800;box-shadow:0 4px 0 #b9a6ee66;border:2px solid #cdbdf5">روز ⁄ زنگ</div>`+w.per.map((p,i)=>`<div style="${hb}background:linear-gradient(160deg,#cfe8ff,#a9d3f7);color:#17446e;box-shadow:0 4px 0 #6fb2ea66;border:2px solid #8cc3ee"><div style="font-size:${fs+1}px;font-weight:800;line-height:1.4">زنگ ${ORDW(i)}</div><div style="font-size:11.5px;font-weight:700;margin-top:1px;color:#2d5f8f;line-height:1.4">${hhmm(p.s)} تا ${hhmm(tstr(endM(i)))}</div></div>`).join('');
 const rows=DAYS.map((d,di)=>{const c=DAYC[di];return`<div style="${hb}background:linear-gradient(160deg,${c[0]},${c[1]});border:2px solid ${c[2]};font-size:${fs+1}px;font-weight:800;color:#2f2457;box-shadow:0 4px 0 ${c[2]}66">${d}</div>`+w.per.map((_,i)=>cell(di,i)).join('')}).join('');
 const html=`<div style="display:grid;direction:rtl;grid-template-columns:118px repeat(${n},minmax(0,1fr));grid-template-rows:${hh}px repeat(${DAYS.length},minmax(0,1fr));gap:9px 8px;height:100%">${head}${rows}</div>`;
 const logo=pf.logo?`<img src="${pf.logo}" style="position:absolute;left:30px;top:14px;height:90px;max-width:150px;object-fit:contain;border-radius:50%;background:#fff;padding:3px;box-shadow:0 4px 12px #7e57c233">`:'';
 const sub=[grade?'پایه‌ی '+esc(grade)+(sec?' ('+fa(esc(sec))+')':'')+' ابتدایی':'',teacher?'آموزگار: '+esc(teacher):''].filter(Boolean).join(' ـ ');
 const yr=schYear();
 const RW=px?'width:1123px;height:794px;':'width:297mm;height:209.5mm;';
 return`<div dir="rtl" style="${F}${RW}box-sizing:border-box;color:#2f2457;background:linear-gradient(160deg,#eef1f7 0%,#e3e7f2 100%);padding:16px 28px 14px;display:flex;flex-direction:column;position:relative;overflow:hidden">
  ${logo}
  <div style="text-align:center;position:relative;flex:none"><div style="display:inline-block;padding:2px 40px;border-radius:40px;background:#ffffffb8;font-size:36px;font-weight:800;color:#7a4cc8;margin-bottom:4px">برنامه کلاسی</div>
   <div style="font-size:16px;font-weight:800;color:#4a3a78;margin-top:2px">${sub}</div>
   <div style="font-size:13px;font-weight:700;color:#6a5a96;margin-top:2px">${[esc(school),pf.city?esc(pf.city):'',yr?'سال تحصیلی '+fa(yr):''].filter(Boolean).join(' ـ ')}</div></div>
  <div style="flex:1;min-height:0;margin:12px 0 10px;position:relative">${html}</div>
  <div style="flex:none;position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 60px">
   <div style="font-size:13px;font-weight:800;color:#4a3a78">${principal?'👔 مدیر مدرسه: '+esc(principal):''}</div>
   <div style="padding:6px 28px;border-radius:14px;background:#b9e4ee;color:#17446e;font-size:14px;font-weight:800">با آرزوی یک روز شاد و پُر از یادگیری</div>
   <div style="font-size:13px;font-weight:800;color:#4a3a78">${teacher?'👩‍🏫 آموزگار: '+esc(teacher):''}</div></div>
 </div>`;
}
function printW(){
 let box=$('wsPrint');if(!box){box=document.createElement('div');box.id='wsPrint';box.setAttribute('data-noresp','');document.body.appendChild(box)}
 box.innerHTML=sheetHTML(false);
 const old=$('wsPrintCss');if(old)old.remove();
 const st=document.createElement('style');st.id='wsPrintCss';st.textContent='@page{size:A4 landscape;margin:0}@media print{body.ws-printing>*:not(#wsPrint){display:none!important}body.ws-printing #wsPrint{display:block!important;margin:0;padding:0}body.ws-printing{background:#fff!important}#wsPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
 document.head.appendChild(st);document.body.classList.add('ws-printing');
 const done=()=>{document.body.classList.remove('ws-printing');const s=$('wsPrintCss');if(s)s.remove();window.removeEventListener('afterprint',done)};
 window.addEventListener('afterprint',done);
 setTimeout(()=>{try{window.print()}catch(e){done();toast('چاپ مستقیم در این محیط ممکن نیست؛ «دریافت PDF» را بزنید')}},150);
 setTimeout(()=>{if(document.body.classList.contains('ws-printing'))done()},60000);
}
let pdfBusy=false;
async function pdfW(){
 if(pdfBusy)return;pdfBusy=true;toast('⏳ در حال ساخت PDF…');let host=null;
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF برنامه در دسترس نیست');
  await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  host=document.createElement('div');host.setAttribute('data-noresp','');host.style.cssText='position:fixed;left:-99999px;top:0;width:1123px;max-width:1123px;margin:0;background:#fff';host.innerHTML=sheetHTML(true);document.body.appendChild(host);
  await new Promise(r=>setTimeout(r,60));
  const el=host.firstElementChild,cv=await X.rast(el);
  const doc=new (window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({orientation:'landscape',unit:'mm',format:'a4'}),PW=297,PH=210;
  doc.addImage(cv.toDataURL('image/jpeg',.95),'JPEG',0,0,PW,PH);
  const me=(S.classes||[]).find(c=>c.id===S.cur)||{},nm=('برنامه هفتگی '+(me.grade||'')+' '+(me.sec||'')).replace(/[\\\/:*?"<>|]/g,'').trim()+'.pdf';
  const ok=await window.dlFile(nm,doc.output('arraybuffer'));
  toast(ok?'✅ فایل PDF آماده شد':'⚠️ PDF ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد؛ برنامه را در Chrome از آدرس سایت باز کنید.');
 }catch(x){console.warn('wsc pdf',x);toast('❌ ساخت PDF ناموفق بود؛ «چاپ مستقیم» را امتحان کنید.')}
 finally{if(host)host.remove();pdfBusy=false}
}

function act(a,el){
 const w=W();
 if(a==='pm'&&w.per.length>1){w.n=w.per.length-1;w.gaps.length=Math.max(0,w.n-1);Object.keys(w.cell).forEach(k=>{if(+k.split('_')[1]>=w.n)delete w.cell[k]});setOpen=true;persist();renderW()}
 else if(a==='pp'&&w.per.length<10){w.n=w.per.length+1;w.gaps.push(10);setOpen=true;persist();renderW()}
 else if(a==='gapall'){const v=Math.max(0,Math.min(60,+($('wsGapAll')||{}).value||0));w.gaps=w.gaps.map(()=>v);setOpen=true;persist();renderW();toast('تفریح همه‌ی زنگ‌ها '+fa(v)+' دقیقه شد')}
 else if(a==='kadd'){const inp=$('wsKNew'),v=(inp&&inp.value||'').trim().slice(0,24);if(!v){toast('نام زنگ ویژه را بنویسید');return}
  if(w.kinds.some(k=>k.name===v)||(S.courses||[]).some(c=>c.name===v)){toast('این نام قبلاً هست');return}
  w.kinds.push({id:Date.now(),name:v});kOpen=true;persist();renderW();toast('افزوده شد ✅')}
 else if(a==='pdf')pdfW();
 else if(a==='print')printW();
 else if(a==='clear')confirmDlg('🧹 پاک‌کردن همه‌ی برنامه؟','همه‌ی خانه‌های جدول برنامه‌ی هفتگی «همین کلاس» خالی می‌شود (تنظیم ساعت‌ها و زنگ‌های ویژه می‌ماند). برنامه‌ی کلاس‌های دیگر دست نمی‌خورد.','بله، پاک شود',()=>{const w2=W();w2.cell={};persist();renderW();toast('برنامه پاک شد')});
}
const body=()=>$('wscBody');
document.addEventListener('click',e=>{
 const b=body();if(!b||!b.contains(e.target))return;
 const c=e.target.closest('.ws-c');if(c){openSheet(+c.dataset.d,+c.dataset.p);return}
 const kd=e.target.closest('[data-kd]');if(kd){const id=+kd.dataset.kd,k=kindBy(id);if(!k)return;
  confirmDlg('🗑 حذف «'+esc(k.name)+'»؟','این زنگ ویژه از فهرست و از همه‌ی خانه‌های جدول همین کلاس برداشته می‌شود.','بله، حذف شود',()=>{const w=W();w.kinds=w.kinds.filter(x=>x.id!==id);Object.keys(w.cell).forEach(key=>{const a=(Array.isArray(w.cell[key])?w.cell[key]:[]).filter(x=>x.k!==id);if(a.length)w.cell[key]=a;else if(Array.isArray(w.cell[key]))delete w.cell[key]});kOpen=true;persist();renderW()});return}
 const a=e.target.closest('[data-a]');if(a)act(a.dataset.a,a);
});
document.addEventListener('change',e=>{
 const b=body();if(!b||!b.contains(e.target))return;const w=W(),t=e.target;
 if(t.id==='wsDur'){w.dur=Math.max(10,Math.min(180,+t.value||45));setOpen=true;persist();renderW()}
 else if(t.id==='wsStart'){if(t.value){w.start=t.value;setOpen=true;persist();renderW()}}
 else if(t.dataset&&t.dataset.gap!=null){w.gaps[+t.dataset.gap]=Math.max(0,Math.min(60,+t.value||0));setOpen=true;persist();renderW()}
 else if(t.dataset&&t.dataset.kn!=null){const k=kindBy(+t.dataset.kn),v=t.value.trim().slice(0,24);if(k&&v&&!w.kinds.some(x=>x!==k&&x.name===v)){k.name=v;persist()}kOpen=true;renderW()}
 else if(t.dataset&&t.dataset.kc!=null){const k=kindBy(+t.dataset.kc);if(k){if(t.value)k.cn=t.value;else delete k.cn;persist()}kOpen=true;renderW()}
});

function nextDayInfo(){let idx=(todayIdx()+1)%7,lb='فردا',k=0;while(idx>4&&k<7){idx=(idx+1)%7;k++;lb='روز مدرسه‌ی بعد'}
 if(idx>4)return null;const w=W(),seen=new Set(),names=[];w.per.forEach((_,i)=>items(idx,i).forEach(it=>{const nmx=itName(it);if(!seen.has(nmx)){seen.add(nmx);names.push(nmx)}}));
 return names.length?{label:lb,day:DAYS[idx],names}:null}
function goQ(q,cid){
 if(q==='att')window.show('att');
 else if(q==='act'){if(cid&&window.ACTX&&window.ACTX.setCourse)window.ACTX.setCourse(cid);window.show('act')}
 else if(q==='crs'){window.__wsCourse=cid?{id:cid,t:Date.now()}:null;window.show('crs')}
 else window.show('wsc')}
function openDay(pi){const old=$('wsDay');if(old)old.remove();
 const its=items(todayIdx(),pi),ids=cids(its).filter(courseBy);let cid=ids[0]||0;
 const o=document.createElement('div');o.id='wsDay';o.className='act-ov';
 const draw=()=>{o.innerHTML=`<div class="act-sh"><b style="font-size:18px">زنگ ${fa(pi+1)} — ${esc(lab(its))}</b><p class="sub" style="margin:4px 0 10px">${bellRange(pi)}</p>${ids.length>1?`<p class="sub" style="margin:0 0 6px">درس مورد نظر:</p><div class="ws-pl" style="margin-bottom:12px">${ids.map(id=>`<span data-cid="${id}" style="--h:${hueC(id)}" class="${id===cid?'now':''}">${esc(courseBy(id).name)}</span>`).join('')}</div>`:''}<div class="ws-qa"><button data-q="att">✅ حضور و غیاب</button><button data-q="act">🌟 ثبت فعالیت کلاسی</button><button data-q="crs">📝 آزمون و تکلیف</button><button data-q="wsc">📅 برنامه‌ی هفتگی</button></div><button class="sm" data-x="1" style="width:100%;margin-top:10px">بستن</button></div>`};
 draw();
 o.onclick=e=>{if(e.target===o||e.target.closest('[data-x]')){o.remove();return}
  const c=e.target.closest('[data-cid]');if(c){cid=+c.dataset.cid;draw();return}
  const q=e.target.closest('[data-q]');if(q){o.remove();goQ(q.dataset.q,cid)}};
 document.body.appendChild(o)}
function homeCard(){
  const hm=$('home');if(!hm||typeof S==='undefined'||!S||!S.courses)return;const o=$('wsToday');if(o)o.remove();
  if(!hasAny())return;const st=status(),n=nowM(),nd=nextDayInfo();
  const nm=x=>esc(lab(x.its));
  const tom=nd?`<div class="ws-tm">📌 ${nd.label}${nd.label==='فردا'?'':''} (${nd.day}): ${nd.names.map(esc).join('، ')}</div>`:'';
  const box=document.createElement('div');box.id='wsToday';box.className='ws-today';
  if(st.off||!st.L.length){
   if(!tom)return;
   box.innerHTML=`<h4>${st.off?'🌴 امروز تعطیل است':'☀️ امروز زنگی ثبت نشده'}</h4>${tom}`;
  }else{
   let line,bar='';
   if(st.cur){const tot=Math.max(1,st.cur.e-tm(st.cur.s)),left=st.cur.e-n,pct=Math.min(100,Math.max(0,(n-tm(st.cur.s))/tot*100));
    line=`<b>الان: زنگ ${fa(st.cur.i+1)} — ${nm(st.cur)}</b><br>${fa(left)} دقیقه تا پایان زنگ${st.nxt?` · بعدی: ${nm(st.nxt)} (${hhmm(st.nxt.s)})`:''}`;bar=`<div class="ws-bar"><i style="width:${pct.toFixed(0)}%"></i></div>`}
   else if(st.brk&&st.nxt)line=`<b>☕ تفریح</b> — ${fa(tm(st.nxt.s)-n)} دقیقه تا «${nm(st.nxt)}» (${hhmm(st.nxt.s)})`;
   else if(st.nxt){const d=tm(st.nxt.s)-n;line=`<b>زنگ بعدی: ${fa(st.nxt.i+1)} — ${nm(st.nxt)}</b><br>ساعت ${hhmm(st.nxt.s)}${d<=120?` · ${fa(d)} دقیقه دیگر`:''}`}
   else line='<b>زنگ‌های امروز تمام شده است ✅</b>';
   const A=window.wscApi.now(),f=A?st.L.find(x=>x.i===A.i):(st.nxt||st.prev||st.L[0]),fp=f?f.i:st.L[0].i;
   const fx=st.L.find(x=>x.i===fp);
   box.innerHTML=`<h4>📅 برنامه‌ی امروز — ${DAYS[st.idx]} <small style="font-weight:600;color:var(--mut)">(${fa(st.L.length)} زنگ)</small></h4><p>${line}</p>${bar}
   <div class="ws-pl">${st.L.map((x,i)=>`<span data-pi="${x.i}" style="--h:${hueIt(x.its[0])};--i:${i}" class="${st.cur&&st.cur.i===x.i?'now':x.e<=n?'past':''}">${hhmm(x.s)} ${nm(x)}</span>`).join('')}</div>
   <div class="ws-qb"><div class="ws-ql">برای زنگ ${fa(fp+1)}${fx?' — '+nm(fx):''}:</div><button data-q="att" data-p="${fp}">✅ حضور و غیاب</button><button data-q="act" data-p="${fp}">🌟 فعالیت کلاسی</button><button data-q="crs" data-p="${fp}">📝 آزمون و تکلیف</button></div>${tom}`;
  }
  box.onclick=e=>{const q=e.target.closest('[data-q]');if(q){const pi=+q.dataset.p,its=items(todayIdx(),pi),ids=cids(its).filter(courseBy);goQ(q.dataset.q,ids[0]||0);return}
   const c=e.target.closest('[data-pi]');if(c){openDay(+c.dataset.pi);return}
   if(e.target.closest('h4'))window.show('wsc')};
  const r=$('exRem'),a1=$('tdash2'),a2=$('stats');
  if(r)r.before(box);else if(a1)a1.before(box);else if(a2)a2.before(box);else hm.prepend(box);
 }
 setInterval(()=>{try{const h=$('home');if(h&&h.classList.contains('on'))homeCard();const s=$('wsc');if(s&&s.classList.contains('on')&&!$('wsSheetBg')?.classList.contains('on')&&document.activeElement&&!/INPUT|SELECT/.test(document.activeElement.tagName))renderW()}catch(e){}},60000);

function autoCourse(){
 try{const fc=window.__wsCourse;if(fc&&fc.id&&Date.now()-fc.t<4000){const ec=$('ec'),h=$('hwc2');[ec,h].forEach(el=>{if(el&&[...el.options].some(o=>String(o.value)===String(fc.id))&&el.value!==String(fc.id)){el.value=String(fc.id);el.dispatchEvent(new Event('change',{bubbles:true}))}});return}
   if(!hasAny())return;const st=status();if(st.off||!st.L.length)return;
  const p=st.cur||st.prev||st.nxt;if(!p)return;const ec=$('ec'),id=cids(p.its)[0];if(id==null)return;
  if(ec&&[...ec.options].some(o=>String(o.value)===String(id))&&ec.dataset.wsDone!==todayISO()+p.i){ec.value=String(id);ec.dispatchEvent(new Event('change',{bubbles:true}));ec.dataset.wsDone=todayISO()+p.i}}catch(e){}
}

function hwChips(){
 const sel=$('hwc2');if(!sel||$('wsHw'))return;
 let idx=(todayIdx()+1)%7,lab0='فردا',k=0;while(idx>4&&k<7){idx=(idx+1)%7;k++;lab0='روز مدرسه‌ی بعد ('+DAYS[idx]+')'}
 if(idx>4)return;
 const w=W(),ids=[...new Set(w.per.flatMap((_,i)=>cids(items(idx,i))))].filter(id=>courseBy(id));if(!ids.length)return;
 const d=document.createElement('div');d.id='wsHw';d.className='ws-hw';
 d.innerHTML='<span>📌 برای '+lab0+':</span>'+ids.map(id=>`<button type="button" data-c="${id}" style="--h:${hueC(id)}">${esc(courseBy(id).name)}</button>`).join('');
 d.onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;sel.value=b.dataset.c;sel.dispatchEvent(new Event('change',{bubbles:true}));const t=$('hwt');t&&t.focus()};
 (sel.parentNode||sel).before(d);
}
let hq=0;new MutationObserver(()=>{if(hq||!$('hwc2')||$('wsHw'))return;hq=requestAnimationFrame(()=>{hq=0;try{hwChips()}catch(e){console.warn('wsc hw',e)}})}).observe(document.body,{childList:true,subtree:true});

const dayOfISO=k=>(new Date(k+'T12:00:00Z').getUTCDay()+1)%7;
const lastBell=di=>{const w=W();let r=-1;w.per.forEach((_,i)=>{if(items(di,i).length)r=i});return r>=0?r:w.per.length-1};
const resolve=(b,k)=>{if(b==null||b==='')return null;const w=W();if(b==='last')return lastBell(k?dayOfISO(k):0);const i=+b;return i>=0&&i<w.per.length?i:null};
window.wscApi={
  now:()=>{try{if(!hasAny())return null;const st=status();if(st.off||!st.L.length)return null;const n=nowM();let p=null,state='';
   if(st.cur){p=st.cur;state='cur'}else if(st.prev&&n-st.prev.e<=20&&(!st.nxt||tm(st.nxt.s)-n>10)){p=st.prev;state='prev'}else if(st.nxt&&tm(st.nxt.s)-n<=15){p=st.nxt;state='nxt'}
   if(!p)return null;const ids=cids(p.its).filter(id=>courseBy(id));
   return{key:todayISO()+'#'+p.i,i:p.i,state,ids,cid:ids[0]||0,name:lab(p.its),s:p.s,e:p.e}}catch(e){return null}},
 options:()=>{const w=W();return[{v:'',t:'— مشخص نشده —'}].concat(w.per.map((p,i)=>({v:String(i),t:'زنگ '+ORD[i]+' ('+hhmm(p.s)+')'})),[{v:'last',t:'آخرین زنگ روز'}])},
 text:(b,k)=>{const i=resolve(b,k);if(b==null||b==='')return'';if(i==null)return b==='last'?'آخرین زنگ':'زنگ '+ORD[+b];return(b==='last'?'آخرین زنگ (زنگ '+ORD[i]+')':'زنگ '+ORD[i])+' — '+hhmm(W().per[i].s)},
 start:(b,k)=>{const i=resolve(b,k);return i==null?'':W().per[i].s},
 suggest:(cid,k)=>{const di=dayOfISO(k);if(di>4)return'';for(let i=0;i<W().per.length;i++)if(cids(items(di,i)).includes(cid))return String(i);return''}
};
const _sh=window.show;
window.show=function(id){const r=_sh.apply(this,arguments);try{if(id==='wsc')renderW();else if(id==='home')homeCard();else if(id==='crs'){autoCourse();setTimeout(autoCourse,80)}}catch(e){console.warn('wsc',e)}return r};
window.wscHwChips=hwChips;window.wscRefresh=()=>{try{homeCard();const s=$('wsc');if(s&&s.classList.contains('on'))renderW()}catch(e){}};
try{const h=$('home');if(h&&h.classList.contains('on'))homeCard()}catch(e){}
}catch(e){console.error('wsc-module',e)}})();

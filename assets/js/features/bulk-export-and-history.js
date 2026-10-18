/* خروجی گروهی گزارش‌ها، تاریخچه و سطل بازیافت */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const META=['classes','cur','stash','archive','glib'],SH=['school','principal','city','logo','stype'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const FN=n=>typeof fa==='function'?fa(n):String(n);
if(!pages.some(p=>p[0]==='bz'))pages.push(['bz','📦 خروجی گروهی گزارش‌ها']);
(($('tf')||$('dm'))).insertAdjacentHTML('afterend','<section id="bz"><h2>📦 خروجی گروهی گزارش‌ها</h2><div id="bzb"></div></section>');
const css=document.createElement('style');
css.textContent='#bzov{position:fixed;inset:0;z-index:100000;background:rgba(30,20,50,.72);display:none;align-items:center;justify-content:center;padding:14px}#bzov.open{display:flex}#bzov .bx{background:var(--card);color:var(--tx);border-radius:20px;width:100%;max-width:520px;padding:16px;max-height:90vh;overflow:auto;box-shadow:0 12px 40px rgba(0,0,0,.35)}#bzov .pb{height:14px;background:var(--bg2);border-radius:9px;overflow:hidden;margin:10px 0}#bzov .pb i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--p),var(--p2));transition:width .25s}#bzov .lg{font-size:12px;max-height:150px;overflow:auto;background:var(--bg2);border-radius:10px;padding:8px;margin-top:8px;white-space:pre-wrap;text-align:right}#bzb label.ck{display:flex;gap:8px;align-items:center;margin:6px 0;font-size:14px}#bzb .fs{width:100%}';
document.head.appendChild(css);

const css2=document.createElement('style');css2.textContent=`
#bzb{display:flex;flex-direction:column;gap:14px}
#bzb .bzh{display:flex;gap:14px;align-items:center;padding:18px;border-radius:18px;color:#fff;background:linear-gradient(135deg,var(--p),var(--p2,var(--p)));box-shadow:0 8px 22px rgba(0,0,0,.14)}
#bzb .bzhi{flex:none;width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.2);display:grid;place-items:center;font-size:30px}
#bzb .bzht{display:flex;flex-direction:column;gap:5px;text-align:right}
#bzb .bzht b{font-size:18px}
#bzb .bzht span{font-size:12.5px;line-height:1.8;opacity:.93}
#bzb .bzchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
#bzb .bzchips i{font-style:normal;font-size:12px;padding:3px 10px;border-radius:99px;background:rgba(255,255,255,.22)}
#bzb .bzs{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px}
#bzb .bzsh{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#bzb .bzsh b{font-size:15px}
#bzb .bzn{width:28px;height:28px;border-radius:50%;background:var(--p);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:700;flex:none}
#bzb .bzsh em{font-style:normal;margin-right:auto;font-size:12px;padding:3px 11px;border-radius:99px;background:var(--bg2);color:var(--p);font-weight:700}
#bzb .bzsh em.z{color:#c0392b}
#bzb .bzta{display:flex;gap:8px}
#bzb .bzta button{flex:1;padding:8px;border-radius:12px;border:1px dashed var(--line);background:var(--bg2);color:var(--tx);font:inherit;font-size:13px;cursor:pointer;transition:.15s}
#bzb .bzta button:active{transform:scale(.97)}
#bzb .bzg{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
#bzb .bzk{position:relative;display:flex;align-items:center;gap:11px;padding:12px;border-radius:14px;border:2px solid var(--line);background:var(--bg2);cursor:pointer;transition:border-color .2s,background .2s,transform .15s,box-shadow .2s;-webkit-tap-highlight-color:transparent;user-select:none}
#bzb .bzk:active{transform:scale(.98)}
#bzb .bzk input{position:absolute;opacity:0;pointer-events:none}
#bzb .bzc{position:relative;flex:none;width:28px;height:28px;border-radius:9px;border:2px solid var(--line);background:var(--card);display:grid;place-items:center;transition:background .2s,border-color .2s}
#bzb .bzc::after{content:"";position:absolute;inset:-2px;border-radius:11px;border:2px solid var(--p);opacity:0;pointer-events:none}
#bzb .bzc svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:22;stroke-dashoffset:22}
#bzb .bzk input:checked~.bzc{background:var(--p);border-color:var(--p);animation:bzpop .38s cubic-bezier(.34,1.56,.64,1)}
#bzb .bzk input:checked~.bzc svg{animation:bzdraw .32s .08s ease-out forwards}
#bzb .bzk input:checked~.bzc::after{animation:bzring .5s ease-out}
#bzb .bzk input:focus-visible~.bzc{outline:3px solid var(--p);outline-offset:2px}
#bzb .bzk:has(input:checked){border-color:var(--p);background:var(--card);box-shadow:0 4px 14px rgba(0,0,0,.08)}
#bzb .bzi{flex:none;font-size:24px}
#bzb .bzb{display:flex;flex-direction:column;gap:2px;text-align:right;min-width:0}
#bzb .bzb b{font-size:13.5px}
#bzb .bzb small{font-size:11.5px;color:var(--mut)}
#bzb .bzo{display:flex;flex-direction:column;gap:6px;padding-top:10px;border-top:1px dashed var(--line)}
#bzb .bzo label{font-size:13px;font-weight:700}
#bzb .bzr{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
#bzb .bzp{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--bg2)}
#bzb .bzp .sub{margin:0;text-align:right;flex:1}
#bzb .bzpt{display:flex;align-items:center;gap:8px}
#bzb .bzpt span{font-size:22px}
#bzb .bzp .big{margin-top:auto;font-size:14px;padding:11px}
#bzb .bznote{padding:11px 14px;border-radius:14px;background:var(--bg2);border:1px dashed var(--line);font-size:12.5px;line-height:1.9;color:var(--mut);text-align:right}
@keyframes bzdraw{to{stroke-dashoffset:0}}
@keyframes bzpop{0%{transform:scale(.7)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes bzring{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.7)}}
@media(max-width:480px){#bzb .bzg{grid-template-columns:1fr}#bzb .bzh{padding:14px}}
@media(prefers-reduced-motion:reduce){#bzb *{animation:none!important;transition:none!important}#bzb .bzk input:checked~.bzc svg{stroke-dashoffset:0}}
`;document.head.appendChild(css2);
const gi=g=>{const i=(typeof GR!=='undefined'?GR:[]).indexOf(g);return i<0?99:i};
const realCls=()=>(S.classes||[]).filter(c=>!c.demo&&window.clsOK(c.id));
const TOF=c=>c.id===S.cur?S:((S.stash||{})[c.id]||null);
const cinfo=c=>{const T=TOF(c)||{},P=(c.id===S.cur?S.prof:T.prof)||{};return{g:P.grade||c.grade||'',s:P.sec||c.sec||'',n:c.name||''}};
const ordC=(a,b)=>{const x=cinfo(a),y=cinfo(b);return gi(x.g)-gi(y.g)||String(x.s).localeCompare(String(y.s),'fa')};
const clab=c=>{const i=cinfo(c);return(i.g?'پایه '+i.g:'بدون پایه')+(i.s?' — '+i.s:'')+(i.n&&!i.g&&!i.s?' '+i.n:'')};
const sn=x=>String(x==null?'':x).replace(/[\\\/:*?"<>|\u0000-\u001f\u200e\u200f]/g,'').replace(/\s+/g,'_').replace(/^[._]+|[._]+$/g,'').slice(0,60);
const fam=n=>{const w=String(n||'').trim().split(/\s+/);return w.length>1?w[w.length-1]+' '+w.slice(0,-1).join(' '):(w[0]||'')};
function classStudents(c){const T=TOF(c);if(!T)return[];const I=T.info||{};return(T.students||[]).filter(x=>!x.demo).map(s=>({id:s.id,name:s.name,code:String((I[s.id]||{}).sc||'')})).sort((a,b)=>fam(a.name).localeCompare(fam(b.name),'fa'))}
const hasScores=id=>(S.exams||[]).some(e=>e.scores&&e.scores[id]!=null&&e.scores[id]!=='');
const hasAtt=id=>Object.keys(S.att||{}).some(d=>(S.att[d]||{})[id]);
const mkey=d=>{const q=jp(new Date(d+'T12:00:00Z'));return q.y*100+q.m};
function monthsOf(id){const s=new Set();(S.exams||[]).forEach(e=>{if(e.scores&&e.scores[id]!=null&&e.scores[id]!=='')s.add(mkey(e.date))});Object.keys(S.att||{}).forEach(d=>{if((S.att[d]||{})[id])s.add(mkey(d))});return[...s].sort((a,b)=>b-a)}

const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function Zip(){const enc=new TextEncoder(),parts=[],cen=[],names=new Set();let off=0,cnt=0;const d=new Date(),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
 return{get count(){return cnt},get size(){return off},
  async add(path,blob){let p=path,i=1;while(names.has(p)){i++;p=path.replace(/(\.[^.\/]*)?$/,'-'+i+'$1')}names.add(p);
   const u=new Uint8Array(await blob.arrayBuffer()),crc=crc32(u),nb=enc.encode(p),sz=u.length;if(off+sz>3.8e9)throw new Error('حجم فایل ZIP از ۳٫۸ گیگابایت بیشتر می‌شود؛ خروجی را کلاس‌به‌کلاس بگیرید');
   const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);h.setUint32(14,crc,true);h.setUint32(18,sz,true);h.setUint32(22,sz,true);h.setUint16(26,nb.length,true);h.setUint16(28,0,true);
   parts.push(h.buffer,nb,blob);
   const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,tm,true);c.setUint16(14,dt,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nb.length,true);c.setUint16(30,0,true);c.setUint16(32,0,true);c.setUint16(34,0,true);c.setUint16(36,0,true);c.setUint32(38,0,true);c.setUint32(42,off,true);
   cen.push(c.buffer,nb);off+=30+nb.length+sz;cnt++;return p},
  finish(){let cs=0;cen.forEach(x=>cs+=x.byteLength);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(4,0,true);e.setUint16(6,0,true);e.setUint16(8,cnt,true);e.setUint16(10,cnt,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);e.setUint16(20,0,true);
   return new Blob([...parts,...cen,e.buffer],{type:'application/zip'})}}}
window.__bzZip=Zip;

let CAP=null;const BL=new Map();let oCU=null;
function arm(){if(oCU)return;oCU=URL.createObjectURL;URL.createObjectURL=function(b){const u=oCU.call(URL,b);if(CAP)BL.set(u,b);return u};
 HTMLAnchorElement.prototype.click=function(){if(CAP&&this.download&&BL.has(this.href)){CAP.push({name:this.download,blob:BL.get(this.href)});return}return HTMLElement.prototype.click.apply(this,arguments)}}
function disarm(){if(!oCU)return;URL.createObjectURL=oCU;delete HTMLAnchorElement.prototype.click;oCU=null;BL.clear()}
let guard=null;
function lock(){if(guard)return;const LS=window.localStorage,native=typeof Storage!=='undefined'&&LS instanceof Storage,tg=native?Storage.prototype:LS,so=tg.setItem,go=tg.getItem,hp=window.histPush,bc=window.binChk;
 tg.setItem=function(k){if(/^cl1/.test(String(k))||/^cl_ab_/.test(String(k)))return;return so.apply(this,arguments)};
 tg.getItem=function(k){if(k==='cl_ab_on')return'0';return go.apply(this,arguments)};
 window.histPush=function(){};window.binChk=function(){};
 guard=()=>{tg.setItem=so;tg.getItem=go;window.histPush=hp;window.binChk=bc;guard=null}}
function enter(cid){if(cid===S.cur)return()=>{};const T=(S.stash||{})[cid];if(!T)throw new Error('اطلاعات کلاس پیدا نشد');
 const keep={};Object.keys(S).forEach(k=>{if(META.indexOf(k)<0){keep[k]=S[k];delete S[k]}});
 const sh={};SH.forEach(k=>{if(keep.prof&&keep.prof[k]!==undefined)sh[k]=keep.prof[k]});
 Object.keys(T).forEach(k=>{S[k]=T[k]});S.prof=Object.assign({},T.prof||{},sh);
 ['info','notes','desc','att','closed'].forEach(k=>{if(!S[k])S[k]={}});['hwl','tnm','exams','courses','drawn','bin','activities','students'].forEach(k=>{if(!S[k])S[k]=[]});
 return()=>{Object.keys(S).forEach(k=>{if(META.indexOf(k)<0)delete S[k]});Object.assign(S,keep)}}
const syncSel=()=>{const o=S.students.map(s=>'<option value="'+s.id+'">'+E(s.name)+'</option>').join('');$('rs').innerHTML=o;$('ms').innerHTML=o};
const cleanUI=()=>{['dlbar','stpm','spw'].forEach(i=>{const e=$(i);if(e)e.remove()});['rpOv','pcO'].forEach(i=>{const e=$(i);if(e)e.remove()})};
const withTO=(p,ms)=>Promise.race([Promise.resolve(p),new Promise((_,j)=>setTimeout(()=>j(new Error('زمان ساخت بیش از حد طول کشید')),ms))]);
async function waitMsg(get,to){const t0=Date.now();await sleep(150);while(Date.now()-t0<(to||150000)){const m=get();if(m&&!/^⏳/.test(m))return m;await sleep(150)}throw new Error('زمان ساخت بیش از حد طول کشید')}

async function viaRep(id,kind,month){window.openRep(id,kind);
 try{if(month){const sel=$('rpM');if(!sel)throw new Error('ماه گزارش پیدا نشد');sel.value=String(month);if(sel.value!==String(month))throw new Error('این ماه در فهرست گزارش نیست');sel.dispatchEvent(new Event('change',{bubbles:true}))}
  const b=$('rpP');if(!b)throw new Error('دکمه‌ی دریافت در دسترس نیست');b.click();await waitMsg(()=>$('rpMsg')&&$('rpMsg').textContent)}
 finally{const o=$('rpOv');if(o)o.remove()}}
async function viaChart(id){const sfb=$('sfb'),keep=window.__sfid;window.__sfid=id;const b=document.createElement('button');b.dataset.a='g';sfb.appendChild(b);try{b.click()}finally{b.remove();window.__sfid=keep}
 if(!$('pcO'))throw new Error('نمودار پیشرفت باز نشد');
 try{$('pc_pdf').click();await waitMsg(()=>$('pc_msg')&&$('pc_msg').textContent)}finally{const o=$('pcO');if(o)o.remove()}}
async function viaRes(id){$('rs').value=String(id);await window.expStu('p');await window.expStu('x')}
async function viaXl(id){$('ms').value=String(id);const m=$('mmsg');m.textContent='';const b=document.querySelector('#mgr [data-a="sx"]');if(!b)throw new Error('دکمه‌ی اکسل دانش‌آموز پیدا نشد');b.click();await waitMsg(()=>m.textContent,90000)}

const KINDS=[['file','📁 پرونده‌ی کامل دانش‌آموز (PDF)'],['card','🎓 کارنامه‌ی گرافیکی (PDF)'],['off','🏛 کارنامه‌ی رسمی (PDF)'],['par','👨‍👩‍👦 گزارش ماهانه‌ی والدین؛ گرافیکی و رسمی (PDF)'],['chart','📊 نمودار پیشرفت تحصیلی (PDF)'],['res','📈 گزارش نمرات فردی (PDF و Excel)'],['xl','📗 کارنامه‌ی Excel']];
const SEL={file:1,card:1,off:1,par:1,chart:1,res:1,xl:1};let MON='latest',ONE={cid:0,sid:0},CLS=0,RUN=false,CANCEL=false;

const ov=document.createElement('div');ov.id='bzov';ov.innerHTML='<div class="bx"><b id="bz_t" style="font-size:17px">📦 در حال ساخت خروجی…</b><div class="pb"><i id="bz_p"></i></div><div id="bz_s" style="font-size:14px;line-height:1.9"></div><div class="lg" id="bz_l" style="display:none"></div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="sm" id="bz_c" style="flex:1">⏹ لغو</button><a id="bz_a" class="sm" style="display:none;flex:1;text-align:center;padding:9px;border-radius:12px;border:1.5px solid var(--line);color:var(--tx);text-decoration:none">⬇️ دانلود با لینک</a><button class="sm" id="bz_x" style="display:none;flex:1">بستن</button></div></div>';document.body.appendChild(ov);
const say=(t,p)=>{$('bz_s').innerHTML=t;if(p!=null)$('bz_p').style.width=Math.max(0,Math.min(100,p))+'%'};
$('bz_c').onclick=()=>{CANCEL=true;$('bz_c').disabled=true;$('bz_s').insertAdjacentHTML('beforeend','<br>⏳ لغو می‌شود (بعد از پایان گزارشِ در حال ساخت)…')};
$('bz_x').onclick=()=>{ov.classList.remove('open');if($('bz_a').dataset.u){try{URL.revokeObjectURL($('bz_a').dataset.u)}catch(e){}}};

async function run(scope){
 if(RUN||document.documentElement.classList.contains('locked'))return;
 const msg=$('bzmsg'),kinds=KINDS.map(x=>x[0]).filter(k=>SEL[k]);
 if(!kinds.length){msg.textContent='⚠️ حداقل یک نوع گزارش را انتخاب کنید';return}
 if(!window.stPdf||!window.openRep||!window.expStu){msg.textContent='❌ بخش‌های گزارش برنامه هنوز بارگذاری نشده‌اند؛ چند ثانیه بعد دوباره تلاش کنید';return}
 let groups;
 if(scope==='one'){const c=realCls().find(x=>x.id===ONE.cid);groups=c?[{c,sts:classStudents(c).filter(x=>x.id===ONE.sid)}]:[]}
 else if(scope==='cls'){const c=realCls().find(x=>x.id===CLS);groups=c?[{c,sts:classStudents(c)}]:[]}
 else groups=realCls().slice().sort(ordC).map(c=>({c,sts:classStudents(c)}));
 groups=groups.filter(g=>g.sts.length);const total=groups.reduce((a,g)=>a+g.sts.length,0);
 if(!total){msg.textContent='⚠️ دانش‌آموزی برای خروجی گرفتن پیدا نشد';return}
 msg.textContent='';RUN=true;CANCEL=false;const t0=Date.now();
 ov.classList.add('open');$('bz_t').textContent='📦 در حال ساخت خروجی…';$('bz_c').style.display='';$('bz_c').disabled=false;$('bz_a').style.display='none';$('bz_x').style.display='none';$('bz_l').style.display='none';$('bz_l').textContent='';say('آماده‌سازی…',0);
 let wl=null;try{wl=navigator.wakeLock&&await navigator.wakeLock.request('screen')}catch(e){}
 const log=[],zip=Zip(),usedP=new Set();let done=0,withFiles=0,skipped=0,files=0,fails=0,stopped=false,ui0=null,back=()=>{};
 const uniq=p=>{let q=p,i=1;while(usedP.has(q)){i++;q=p+'_'+i}usedP.add(q);return q};
 try{
  try{window.ensureCodes&&window.ensureCodes()}catch(e){}
  if(!$('mp').options.length&&window.renderMgr)try{window.renderMgr()}catch(e){}
  ui0={rm:$('rm').value,rt:$('rt').value,mp:$('mp').value,mp2:$('mp2').value,rs:$('rs').innerHTML,rsv:$('rs').value,ms:$('ms').innerHTML,msv:$('ms').value,rg:window.__rg};
  lock();arm();window.__rg=null;$('rm').value='';$('rt').value='';
  if($('mp').options.length){$('mp').value=$('mp').options[0].value;$('mp2').value=$('mp2').options[$('mp2').options.length-1].value}
  for(const g of groups){if(CANCEL){stopped=true;break}
   const ci=cinfo(g.c),gF='پایه_'+(sn(ci.g)||'بدون_پایه'),cF='کلاس_'+(sn(ci.s||ci.n)||(realCls().indexOf(g.c)+1)),base=scope==='all'?uniq(gF+'/'+cF):'';
   back=enter(g.c.id);
   try{syncSel();
    for(const st of g.sts){if(CANCEL){stopped=true;break}
     const s=S.students.find(x=>x.id===st.id);if(!s){done++;continue}
     const I=S.info[s.id]||{},code=String(I.sc||st.code||''),sF=(code?code+'_':'')+(sn(s.name)||'دانش‌آموز'),folder=(base?base+'/':'')+(scope==='all'?'':'')+sF,fp=uniq(folder);
     const hs=hasScores(s.id),ha=hasAtt(s.id),hd=hs||ha;let n=0;
     say('<b>'+FN(done+1)+' از '+FN(total)+'</b> — '+E(s.name)+'<br><span style="color:var(--mut)">'+E(clab(g.c))+(done?' · زمان باقی‌مانده تقریبی: '+FN(Math.max(1,Math.round((Date.now()-t0)/done*(total-done)/60000)))+' دقیقه':'')+'</span><br>فایل‌های ساخته‌شده: '+FN(files),done/total*100);
     const step=async(label,pre,fn)=>{if(CANCEL)return;CAP=[];let err=null;try{await withTO(fn(),200000)}catch(e){err=e}
      const got=CAP;CAP=null;cleanUI();
      if(!got.length){if(err){fails++;log.push('❌ '+s.name+' — '+label+': '+(err.message||err))}else log.push('⚠️ '+s.name+' — '+label+': داده‌ی کافی برای ساخت این گزارش ثبت نشده بود');return}
      const seen={};for(const c of got){const m=/\.([a-z0-9]+)$/i.exec(c.name),ext=m?m[1].toLowerCase():'bin';seen[ext]=(seen[ext]||0)+1;await zip.add(fp+'/'+pre+(seen[ext]>1?'-'+seen[ext]:'')+'.'+ext,c.blob);files++;n++}
      if(err)log.push('⚠️ '+s.name+' — '+label+': فقط بخشی از فایل‌ها ساخته شد ('+(err.message||err)+')')};
     if(!hd)log.push('ℹ️ '+s.name+': نمره یا حضور و غیابی ثبت نشده؛ فقط پرونده‌ی کامل ساخته می‌شود');
     if(kinds.includes('file'))await step('پرونده‌ی کامل','01-پرونده-کامل',()=>window.stPdf(s.id));
     if(hd&&kinds.includes('card'))await step('کارنامه‌ی گرافیکی','02-کارنامه-گرافیکی',()=>viaRep(s.id,'c'));
     if(hd&&kinds.includes('off'))await step('کارنامه‌ی رسمی','03-کارنامه-رسمی',()=>viaRep(s.id,'o'));
     if(hd&&kinds.includes('par')){let ms=monthsOf(s.id);if(MON==='latest')ms=ms.slice(0,1);
      for(const m of ms){const mn=MN[m%100-1];await step('گزارش ماهانه‌ی گرافیکی '+mn,'04-گزارش-ماهانه-گرافیکی-'+mn,()=>viaRep(s.id,'p',m));await step('گزارش ماهانه‌ی رسمی '+mn,'05-گزارش-ماهانه-رسمی-'+mn,()=>viaRep(s.id,'po',m))}}
     if(hs&&kinds.includes('chart'))await step('نمودار پیشرفت','06-نمودار-پیشرفت',()=>viaChart(s.id));
     if(hs&&kinds.includes('res'))await step('گزارش نمرات فردی','07-گزارش-نمرات-فردی',()=>viaRes(s.id));
     if(hd&&kinds.includes('xl'))await step('کارنامه‌ی Excel','08-کارنامه-اکسل',()=>viaXl(s.id));
     if(n)withFiles++;else{skipped++;log.push('⛔ '+s.name+' ('+code+'): هیچ گزارشی ساخته نشد؛ پوشه‌ای برای او ایجاد نشد')}
     done++;await sleep(20)}
   }finally{back();back=()=>{}}}
 }catch(e){fails++;log.push('❌ خطای کلی: '+(e&&e.message||e))}
 finally{try{back()}catch(e){}
  if(ui0){try{$('rm').value=ui0.rm;$('rt').value=ui0.rt;$('mp').value=ui0.mp;$('mp2').value=ui0.mp2;$('rs').innerHTML=ui0.rs;$('rs').value=ui0.rsv;$('ms').innerHTML=ui0.ms;$('ms').value=ui0.msv;window.__rg=ui0.rg}catch(e){}}
  CAP=null;cleanUI();disarm();if(guard)guard();try{wl&&wl.release()}catch(e){}}
 try{
  if(!zip.count){$('bz_t').textContent=stopped?'⏹ لغو شد':'⚠️ گزارشی برای خروجی پیدا نشد';say((stopped?'عملیات لغو شد و فایلی ساخته نشد.':'برای این انتخاب هیچ گزارش قابل‌ساختی وجود نداشت (نمره یا حضور و غیاب ثبت نشده است).')+(log.length?'<br>جزئیات در پایین آمده است.':''),100);}
  else{
   const head=['گزارش وضعیت خروجی گروهی','تاریخ: '+(typeof fmt==='function'&&typeof tdy==='function'?fmt(tdy()):''),'دانش‌آموزان بررسی‌شده: '+total,'دارای گزارش: '+withFiles,'بدون گزارش (بدون پوشه): '+skipped,'تعداد فایل‌ها: '+files,'خطاها: '+fails,stopped?'⚠️ عملیات پیش از پایان لغو شد؛ این فایل ناقص است.':'',''].filter(x=>x!=='');
   await zip.add('_گزارش-وضعیت.txt',new Blob(['\ufeff'+head.concat(log).join('\r\n')],{type:'text/plain'}));
   const sc=S.prof&&S.prof.school?sn(S.prof.school):'',nm=scope==='one'?'گزارش-'+sn(groups[0].sts[0].code?groups[0].sts[0].code+'_'+groups[0].sts[0].name:groups[0].sts[0].name):scope==='cls'?'گزارش-'+sn(clab(groups[0].c).replace(/\s+—\s+/g,'-')):'گزارش-کل-مدرسه'+(sc?'-'+sc:'');
   const blob=zip.finish(),fname=nm+(stopped?'-ناقص':'')+'.zip',u=URL.createObjectURL(blob);
   $('bz_t').textContent=stopped?'⏹ لغو شد (فایل ناقص ساخته شد)':(fails||skipped?'✅ آماده شد (با چند هشدار)':'✅ ZIP آماده شد');
   say('حجم: <b>'+FN(Math.max(1,Math.round(blob.size/1048576)))+' مگابایت</b> · '+FN(files)+' فایل برای '+FN(withFiles)+' دانش‌آموز'+(skipped?' · '+FN(skipped)+' نفر بدون گزارش':'')+(fails?' · '+FN(fails)+' خطا':'')+'<br><span style="color:var(--mut)">نام فایل: '+E(fname)+'</span>',100);
   const a=$('bz_a');a.href=u;a.download=fname;a.dataset.u=u;a.style.display='';
   let ok=false;try{ok=await window.dlFile(fname,blob)}catch(e){}
   msg.textContent=ok?'✅ دانلود شروع شد: '+fname:'⚠️ اگر دانلود شروع نشد، دکمه‌ی «دانلود با لینک» را بزنید. در پیش‌نمایش‌های محدود، برنامه را از آدرس سایت در Chrome باز کنید.'}
 }catch(e){$('bz_t').textContent='❌ ساخت ZIP ناموفق بود';say(E(e&&e.message||e),100);fails++}
 if(log.length){const l=$('bz_l');l.style.display='';l.textContent=log.slice(0,80).join('\n')+(log.length>80?'\n… و '+FN(log.length-80)+' مورد دیگر (در فایل _گزارش-وضعیت.txt)':'')}
 $('bz_c').style.display='none';$('bz_x').style.display='';RUN=false}

function render(){const b=$('bzb');if(!b)return;const cs=realCls().slice().sort(ordC);if(!cs.length){b.innerHTML='<div class="card"><p class="sub">کلاسی ثبت نشده است.</p></div>';return}
 if(!cs.some(c=>c.id===ONE.cid))ONE.cid=(cs.find(c=>c.id===S.cur)||cs[0]).id;if(!cs.some(c=>c.id===CLS))CLS=(cs.find(c=>c.id===S.cur)||cs[0]).id;
 const c1=cs.find(c=>c.id===ONE.cid),st1=classStudents(c1);if(!st1.some(x=>x.id===ONE.sid))ONE.sid=st1[0]?st1[0].id:0;
 const opt=(c,v)=>'<option value="'+c.id+'"'+(c.id===v?' selected':'')+'>'+E(clab(c))+' · '+FN(classStudents(c).length)+' نفر</option>';
 const all=cs.reduce((a,c)=>a+classStudents(c).length,0),nk=KINDS.filter(k=>SEL[k[0]]).length;
 const KD=[['file','📁','پرونده‌ی کامل دانش‌آموز','PDF · همه‌ی اطلاعات در یک فایل'],['card','🎓','کارنامه‌ی گرافیکی','PDF · رنگی و تصویری'],['off','🏛','کارنامه‌ی رسمی','PDF · قالب اداری'],['par','👨‍👩‍👦','گزارش ماهانه‌ی والدین','PDF · گرافیکی و رسمی'],['chart','📊','نمودار پیشرفت تحصیلی','PDF · روند نمرات'],['res','📈','گزارش نمرات فردی','PDF و Excel'],['xl','📗','کارنامه‌ی Excel','فایل اکسل']];
 const nsel=KD.filter(k=>SEL[k[0]]).length;
 b.innerHTML='<div class="bzh"><div class="bzhi">📦</div><div class="bzht"><b>خروجی گروهی گزارش‌ها</b><span>گزارش‌ها با ابزارهای خود برنامه ساخته و در یک فایل ZIP، به‌صورت پوشه‌ی جداگانه برای هر دانش‌آموز (کد + نام) ذخیره می‌شوند.</span><div class="bzchips"><i>🏫 '+FN(cs.length)+' کلاس</i><i>👩‍🎓 '+FN(all)+' دانش‌آموز</i></div></div></div>'
 +'<div class="bzs"><div class="bzsh"><span class="bzn">۱</span><b>گزارش‌هایی که در خروجی باشند</b><em id="bz_cnt">'+FN(nsel)+' از '+FN(KD.length)+' انتخاب شده</em></div>'
 +'<div class="bzta"><button type="button" data-ka="all">✓ انتخاب همه</button><button type="button" data-ka="none">✕ هیچ‌کدام</button></div>'
 +'<div class="bzg">'+KD.map(k=>'<label class="bzk"><input type="checkbox" data-k="'+k[0]+'"'+(SEL[k[0]]?' checked':'')+'><span class="bzc"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg></span><span class="bzi">'+k[1]+'</span><span class="bzb"><b>'+k[2]+'</b><small>'+k[3]+'</small></span></label>').join('')+'</div>'
 +'<div class="bzo"><label for="bz_mon">📅 ماه‌های گزارش والدین</label><select id="bz_mon" class="fs"><option value="latest"'+(MON==='latest'?' selected':'')+'>فقط آخرین ماهِ دارای اطلاعات</option><option value="all"'+(MON==='all'?' selected':'')+'>همه‌ی ماه‌های دارای اطلاعات (زمان‌برتر)</option></select></div></div>'
 +'<div class="bzs"><div class="bzsh"><span class="bzn">۲</span><b>دریافت برای چه کسانی؟</b></div><div class="bzr">'
 +'<div class="bzp"><div class="bzpt"><span>🧑‌🎓</span><b>یک دانش‌آموز</b></div><select id="bz_c1" class="fs">'+cs.map(c=>opt(c,ONE.cid)).join('')+'</select><select id="bz_s1" class="fs">'+(st1.length?st1.map(x=>'<option value="'+x.id+'"'+(x.id===ONE.sid?' selected':'')+'>'+E((x.code?x.code+' — ':'')+x.name)+'</option>').join(''):'<option value="0">دانش‌آموزی نیست</option>')+'</select><button class="big" data-go="one">📥 دریافت</button></div>'
 +'<div class="bzp"><div class="bzpt"><span>🏫</span><b>یک کلاس</b></div><select id="bz_c2" class="fs">'+cs.map(c=>opt(c,CLS)).join('')+'</select><p class="sub">همه‌ی دانش‌آموزان کلاس انتخاب‌شده</p><button class="big" data-go="cls">📥 دریافت</button></div>'
 +'<div class="bzp"><div class="bzpt"><span>🏛</span><b>کل مدرسه</b></div><p class="sub">'+FN(cs.length)+' کلاس · '+FN(all)+' دانش‌آموز<br>ساختار: پایه ← کلاس ← دانش‌آموز</p><button class="big" data-go="all">📥 دریافت</button></div>'
 +'</div></div>'
 +'<div class="bznote">⏳ ساخت گزارش‌ها زمان‌بر است؛ صفحه را باز نگه دارید. دانش‌آموزی که نمره یا حضور و غیاب ندارد، گزارش خالی نمی‌گیرد.</div><p class="sub" id="bzmsg" style="text-align:right"></p>'}
document.addEventListener('change',e=>{const t=e.target;if(!t||!$('bzb')||!$('bzb').contains(t))return;
 if(t.dataset.k)SEL[t.dataset.k]=t.checked?1:0;else if(t.id==='bz_mon')MON=t.value;else if(t.id==='bz_c1'){ONE.cid=+t.value;ONE.sid=0;render()}else if(t.id==='bz_s1')ONE.sid=+t.value;else if(t.id==='bz_c2')CLS=+t.value});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#bzb [data-go]');if(t)run(t.dataset.go)});
function cnt(){const el=$('bz_cnt');if(!el)return;const n=KINDS.filter(k=>SEL[k[0]]).length;el.textContent=FN(n)+' از '+FN(KINDS.length)+' انتخاب شده';el.classList.toggle('z',!n)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#bzb [data-ka]');if(!t)return;const on=t.dataset.ka==='all'?1:0;KINDS.forEach(k=>SEL[k[0]]=on);document.querySelectorAll('#bzb input[data-k]').forEach(i=>i.checked=!!on);cnt()});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.k&&$('bzb')&&$('bzb').contains(t))cnt()});
const _sh=window.show;window.show=function(id){const r=_sh.apply(this,arguments);if(id==='bz')try{render()}catch(e){console.warn('bz',e)}return r};
}catch(e){console.warn('bulkzip',e)}})();

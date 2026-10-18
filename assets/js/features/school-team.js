/* تیم مدرسه و ذخیره‌ی ابری */
(function(){try{
const $=id=>document.getElementById(id),E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const ST={user:null,mem:null,school:null,team:[],busy:false,loaded:false,msg:'',err:''};
let db=null,auth=null;
const norm=s=>String(s||'').trim().toLowerCase();
const okMail=s=>/^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(s);
const fe=e=>{const c=e&&e.code||'';
 if(c==='permission-denied')return 'دسترسی مجاز نیست. اگر قوانین Firestore را هنوز جایگزین نکرده‌اید ابتدا آن را انجام دهید؛ یا این ایمیل در مدرسه‌ی دیگری ثبت شده است.';
 if(c==='unavailable')return 'اتصال اینترنت برقرار نیست.';
 return (e&&(e.code||e.message))||'خطای نامشخص'};
const stamp=()=>firebase.firestore.FieldValue.serverTimestamp();
const roleName=r=>r==='manager'?'مدیر':'معلم';
window.__schRole=()=>{try{if(!ST.user)return null;if(!ST.loaded&&!ST.err)return'pending';if(!ST.mem)return null;return ST.mem.active===false?'teacher':ST.mem.role}catch(e){return null}};
const myEmail=()=>ST.user?norm(ST.user.email):'';
const schoolClasses=()=>(ST.school&&ST.school.classes)||{};
const localClasses=()=>{try{return (S.classes||[]).filter(c=>!c.demo)}catch(e){return[]}};
const clsName=c=>{try{return window.clsLab?window.clsLab(c):((c.grade||'')+' '+(c.sec||'')).trim()||('کلاس '+c.id)}catch(e){return 'کلاس '+c.id}};

function html(){
 const sub=t=>'<p class="sub" style="text-align:right;margin:6px 0">'+t+'</p>';
 let h='<b>🏫 مدرسه و معلم‌ها</b>';
 if(!auth)return h+sub('در حال اتصال به Firebase… اگر اینترنت قطع است این بخش کار نمی‌کند.');
 if(!ST.user)return h+sub('برای استفاده از این بخش ابتدا با حساب گوگل (Gmail) وارد شوید.')+'<button class="big" data-sc="login" style="font-size:15px;padding:12px">☁️ ورود با حساب گوگل</button>';
 if(ST.busy&&!ST.loaded)return h+sub('در حال دریافت اطلاعات مدرسه…');
 if(ST.err)return h+sub('❌ '+E(ST.err))+'<button class="sm" data-sc="reload">🔄 تلاش دوباره</button>';
 if(!ST.mem){
  const nm=(window.schoolFull?(()=>{try{return schoolFull()}catch(e){return ''}})():'');
  return h+sub('حساب شما ('+E(myEmail())+') هنوز عضو هیچ مدرسه‌ای نیست.')+
   sub('<b>اگر مدیر مدرسه هستید:</b> مدرسه را بسازید؛ بعد ایمیل گوگل معلم‌ها را اضافه کنید.')+
   '<div class="cadd" style="margin-top:8px"><input id="sc_name" placeholder="نام مدرسه" value="'+E(nm)+'"></div>'+
   '<button class="big" data-sc="create" style="font-size:15px;padding:12px;margin-top:8px">🏫 ساخت مدرسه (من مدیر هستم)</button>'+
   sub('<b>اگر معلم هستید:</b> از مدیر بخواهید همین ایمیل ('+E(myEmail())+') را به عنوان معلم اضافه کند، سپس «تازه‌سازی» را بزنید.')+
   '<button class="sm" data-sc="reload">🔄 تازه‌سازی</button>'+(ST.msg?sub(E(ST.msg)):'');
 }
 if(ST.mem.active===false)return h+sub('دسترسی حساب شما ('+E(myEmail())+') توسط مدیر غیرفعال شده است.')+'<button class="sm" data-sc="reload">🔄 تازه‌سازی</button>';
 const sc=ST.school||{},mgr=ST.mem.role==='manager';
 h+=sub('مدرسه: <b>'+E(sc.name||'—')+'</b><br>حساب شما: '+E(myEmail())+' · نقش: <b>'+roleName(ST.mem.role)+'</b>');
 if(!mgr){
  const mine=Object.entries(schoolClasses()).filter(([id,v])=>v&&norm(v.teacher)===myEmail());
  h+='<b style="display:block;margin-top:10px">کلاس‌های شما</b>'+
   (mine.length?mine.map(([id,v])=>'<div class="crow"><div><b>'+E(v.label||('کلاس '+id))+'</b></div></div>').join(''):sub('هنوز کلاسی به شما اختصاص داده نشده است.'))+
   '<button class="sm" data-sc="reload" style="margin-top:8px">🔄 تازه‌سازی</button>';
  return h+(ST.msg?sub(E(ST.msg)):'');
 }
 const me=myEmail();
 h+='<b style="display:block;margin-top:10px">👥 اعضای مدرسه</b>'+
  (ST.team.map(m=>{const self=norm(m.email)===me;
   return '<div class="crow"><div><b'+(m.active===false?' style="opacity:.5"':'')+'>'+E(m.name||m.email)+'</b><small>'+E(m.email)+' · '+roleName(m.role)+(m.active===false?' · غیرفعال':'')+(self?' · شما':'')+'</small></div>'+
    (self?'':'<span style="display:flex;gap:6px"><button class="sm" data-sc="tg" data-e="'+E(m.email)+'">'+(m.active===false?'فعال کردن':'غیرفعال')+'</button><button class="dl" data-sc="rm" data-e="'+E(m.email)+'">حذف</button></span>')+'</div>'}).join('')||sub('هنوز عضوی نیست.'))+
  '<b style="display:block;margin-top:12px">➕ افزودن معلم</b>'+
  '<div class="cadd" style="margin-top:8px"><input id="sc_em" type="email" inputmode="email" dir="ltr" placeholder="ایمیل گوگل معلم"><input id="sc_nm" placeholder="نام معلم (اختیاری)"><select id="sc_rl" class="fs"><option value="teacher">معلم</option><option value="manager">مدیر</option></select></div>'+
  '<button class="big" data-sc="add" style="font-size:15px;padding:12px;margin-top:8px">➕ افزودن</button>';
 const lc=localClasses(),sch=schoolClasses();
 h+='<b style="display:block;margin-top:14px">📚 معلم هر کلاس</b>';
 if(!lc.length)h+=sub('هنوز کلاسی در این دستگاه ثبت نشده است.');
 else{
  h+=lc.map(c=>{const cur=norm((sch[c.id]||{}).teacher);
   const opts='<option value="">— بدون معلم —</option>'+ST.team.map(m=>'<option value="'+E(norm(m.email))+'"'+(norm(m.email)===cur?' selected':'')+'>'+E((m.name||m.email)+(m.active===false?' (غیرفعال)':''))+'</option>').join('')+
    (cur&&!ST.team.some(m=>norm(m.email)===cur)?'<option value="'+E(cur)+'" selected>'+E(cur)+'</option>':'');
   return '<div class="crow"><div><b>'+E(clsName(c))+'</b></div><select class="fs" data-sca="'+E(c.id)+'">'+opts+'</select></div>'}).join('')+
   sub('تغییر هر کلاس همان لحظه ذخیره می‌شود. با اختصاص کلاس به معلم، اطلاعات همان کلاس به مدرسه ارسال می‌شود و فقط روی دستگاه همان معلم نصب می‌شود.');
 }
 h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="sm" data-sc="up">⬆️ ارسال کلاس‌ها به مدرسه</button><button class="sm" data-sc="down">⬇️ دریافت تغییرات معلم‌ها</button><button class="sm" data-sc="reload">🔄 تازه‌سازی</button></div>';
 return h+(ST.msg?sub(E(ST.msg)):'');
}
function render(){const c=$('scCard');if(c)c.innerHTML=html();if(!ST.msg)ST.shown='';else if(ST.msg!==ST.shown){ST.shown=ST.msg;try{window.__raToast&&window.__raToast(ST.msg)}catch(x){}}}
function say(t){ST.msg=t;render()}

async function load(){
 if(!db||!ST.user||ST.busy)return;
 ST.busy=true;ST.err='';render();
 try{
  const ms=await db.collection('members').doc(myEmail()).get();
  if(!ms.exists){ST.mem=null;ST.school=null;ST.team=[]}
  else{
   ST.mem=ms.data();ST.school=null;ST.team=[];
   if(ST.mem.active!==false){
    const ss=await db.collection('schools').doc(ST.mem.schoolId).get();
    ST.school=ss.exists?ss.data():null;
    if(ST.mem.role==='manager'){
     const q=await db.collection('members').where('schoolId','==',ST.mem.schoolId).get();
     ST.team=q.docs.map(d=>d.data()).sort((a,b)=>(a.role===b.role?0:a.role==='manager'?-1:1)||String(a.name||a.email).localeCompare(String(b.name||b.email),'fa'));
    }
   }
  }
  try{setAcc()}catch(x){}
  try{enforce()}catch(x){}
  ST.loaded=true;
 }catch(e){ST.err=fe(e)}
 ST.busy=false;render();
 try{hookPush();watch()}catch(x){}
 syncTeacher().catch(e=>say('❌ '+fe(e)));
}

function enforce(){
 let lk=document.getElementById('clsLock');
 const ok=(S.classes||[]).filter(c=>window.clsOK(c.id)&&!c.demo);
 if(window.clsOK(S.cur)){if(lk)lk.remove();try{window.renderCls&&window.renderCls()}catch(x){}return}
 if(ok.length){window.__goto='home';window.switchCls(ok[0].id);if(lk)lk.remove();try{window.renderCls&&window.renderCls()}catch(x){}return}
 if(!lk){lk=document.createElement('div');lk.id='clsLock';lk.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;color:#222;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;font-family:inherit';lk.innerHTML='<b style="font-size:18px">هنوز کلاسی به شما اختصاص داده نشده است</b><span>از مدیر بخواهید کلاس شما را در بخش «مدرسه و معلم‌ها» تعیین کند، سپس دکمه را بزنید.</span><button class="big" id="clsLockBtn" style="max-width:260px">🔄 تازه‌سازی</button>';document.body.appendChild(lk);document.getElementById('clsLockBtn').onclick=()=>{ST.loaded=false;load()}}
}
const CHUNK=300000,KEYS=['classes','cur','stash','archive','glib'];
const V=()=>{try{return JSON.parse(localStorage.getItem('schV')||'{}')}catch(e){return{}}};
const setV=(id,v)=>{const o=V();o[id]=v;try{localStorage.setItem('schV',JSON.stringify(o))}catch(e){}};
function setAcc(){
 let a=null;try{a=JSON.parse(localStorage.getItem('schAcc')||'null')}catch(x){}
 const me=myEmail(),put=ids=>localStorage.setItem('schAcc',JSON.stringify({role:'teacher',email:me||(a&&a.email)||'',ids}));
 try{localStorage.removeItem('schMgr')}catch(x){}
 if(ST.mem&&ST.mem.active===false){put([]);return}
 if(ST.mem&&ST.mem.role==='manager'){localStorage.removeItem('schAcc');try{localStorage.setItem('schMgr',JSON.stringify({email:me,name:ST.mem.name||(ST.user&&ST.user.displayName)||'',school:(ST.school&&ST.school.name)||''}))}catch(x){}return}
 if(ST.mem){put(Object.entries(schoolClasses()).filter(([id,v])=>v&&norm(v.teacher)===me).map(([id])=>id));return}
 if(!(a&&a.role==='teacher'))localStorage.removeItem('schAcc');else put([]);
}
const cdRef=(sid,id)=>db.collection('schools').doc(sid).collection('classData').doc(String(id));
function clsSnap(id){
 if(String(id)===String(S.cur)){const o={};Object.keys(S).forEach(k=>{if(KEYS.indexOf(k)<0)o[k]=S[k]});return o}
 return Object.assign({},(S.stash||{})[id]||{});
}
async function pushCls(id,force){
 const sid=ST.mem.schoolId,me=myEmail(),ref=cdRef(sid,id),j=JSON.stringify(clsSnap(id));
 if(!force&&ST.last&&ST.last[id]===j)return 0;
 const mm=await ref.get(),md=mm.exists?mm.data():{},rv=md.v||0;
 if(!force&&rv>(V()[id]||0)&&md.by!==me)throw new Error('نسخه‌ی تازه‌تری از مدیر رسیده؛ ابتدا «تازه‌سازی» را بزنید.');
 const n=Math.max(1,Math.ceil(j.length/CHUNK)),pc=ref.collection('parts'),b=db.batch();
 for(let i=0;i<n;i++)b.set(pc.doc(String(i)),{i,s:j.slice(i*CHUNK,(i+1)*CHUNK)});
 for(let i=n;i<(md.n||0);i++)b.delete(pc.doc(String(i)));
 b.set(ref,{n,v:rv+1,by:me,t:stamp(),len:j.length});
 await b.commit();
 (ST.last=ST.last||{})[id]=j;setV(id,rv+1);return 1;
}
async function pullCls(id){
 const ref=cdRef(ST.mem.schoolId,id),m=await ref.get();if(!m.exists)return null;
 const q=await ref.collection('parts').get(),a=[];q.forEach(d=>{const x=d.data();a[x.i]=x.s});
 const md=m.data();if(a.length!==md.n||a.some(x=>x==null))throw new Error('اطلاعات این کلاس در مدرسه کامل نیست؛ دوباره تلاش کنید.');
 return{st:JSON.parse(a.join('')),meta:md};
}
function writeState(ns){
 localStorage.setItem('cl1',JSON.stringify(ns));localStorage.setItem('cl1_ts',Date.now());
 try{sessionStorage.setItem('cl_skip',Date.now())}catch(x){}
 return Promise.resolve(window.__flushStore&&window.__flushStore()).then(()=>setTimeout(()=>location.reload(),150));
}
function wipeHist(){return new Promise(r=>{try{const q=indexedDB.open('cl_hist',1);q.onsuccess=()=>{try{const d=q.result,x=d.transaction('h','readwrite');x.objectStore('h').put([],'l');x.oncomplete=()=>{d.close();r()};x.onerror=()=>r()}catch(e){r()}};q.onerror=()=>r()}catch(e){r()}})}
function dlBackup(){try{const b=new Blob([localStorage.getItem('cl1')||'{}'],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='backup-before-school-sync.json';document.body.appendChild(a);a.click();a.remove()}catch(e){}}
let pt=null;
function hookPush(){
 if(window.__schHook||typeof window.cloudPush!=='function')return;
 window.__schHook=1;const cp=window.cloudPush;
 window.cloudPush=function(){try{cp.apply(this,arguments)}catch(e){}sched()};
}
function sched(){
 if(!db||!ST.mem||ST.mem.active===false||(ST.mem.role!=='teacher'&&ST.mem.role!=='manager'))return;
 clearTimeout(pt);
 pt=setTimeout(()=>{pt=null;const id=S.cur;if(!window.clsOK(id)||!Object.prototype.hasOwnProperty.call(schoolClasses(),String(id)))return;pushCls(id).catch(e=>{ST.msg='❌ همگام‌سازی با مدرسه: '+fe(e);render()})},6000);
}
async function syncTeacher(){
 if(ST.sy||!db||!ST.mem||ST.mem.role!=='teacher'||ST.mem.active===false||pt)return;
 ST.sy=1;
 try{
  const me=myEmail();
  const ids=Object.entries(schoolClasses()).filter(([id,v])=>v&&norm(v.teacher)===me).map(([id])=>id);
  const have=(S.classes||[]).filter(c=>!c.demo).map(c=>String(c.id)),extra=have.some(id=>ids.indexOf(id)<0),got={};
  for(const id of ids){const r=await pullCls(id);if(r)got[id]=r}
  const gk=Object.keys(got),lv=V();
  const newer=id=>have.indexOf(id)<0||((got[id].meta.v||0)>(lv[id]||0)&&got[id].meta.by!==me);
  if(!gk.length||!(extra||gk.some(newer)))return;
  if(extra){if(!confirm('برای امنیت، کلاس‌هایی که به شما اختصاص داده نشده از این دستگاه حذف می‌شود و فقط کلاس‌های خودتان می‌ماند. یک نسخه‌ی پشتیبان از اطلاعات فعلی دانلود می‌شود. ادامه می‌دهید؟'))return;dlBackup();await wipeHist()}
  else if(have.length&&!confirm('نسخه‌ی تازه‌تری از کلاس شما از طرف مدرسه رسیده است. به‌روزرسانی شود؟'))return;
  const classes=[],stash={};
  gk.forEach(id=>{const cloud=newer(id),st=cloud?got[id].st:clsSnap(id),p=st.prof||{};if(cloud)setV(id,got[id].meta.v||0);classes.push({id:+id,grade:p.grade,sec:p.sec,teacher:p.teacher});stash[id]=st});
  const cur=gk.indexOf(String(S.cur))>=0?+S.cur:classes[0].id,top=stash[cur];delete stash[cur];
  await writeState(Object.assign({classes,cur,stash,archive:extra?{}:S.archive,glib:S.glib},top));
 }finally{ST.sy=0}
}
async function managerDown(){
 const me=myEmail(),got={},lv=V();
 for(const id of Object.keys(schoolClasses())){
  if(!(S.classes||[]).some(c=>String(c.id)===id))continue;
  const r=await pullCls(id);if(r&&r.meta.by!==me&&(r.meta.v||0)>(lv[id]||0))got[id]=r;
 }
 const ks=Object.keys(got);
 if(!ks.length){say('✅ تغییر تازه‌ای از طرف معلم‌ها نیست.');return}
 if(!confirm('تغییرات '+ks.length+' کلاس از طرف معلم‌ها دریافت و جایگزین نسخه‌ی این دستگاه می‌شود. ادامه می‌دهید؟'))return;
 const stash=Object.assign({},S.stash||{});let top=clsSnap(S.cur);
 const classes=(S.classes||[]).map(c=>Object.assign({},c));
 ks.forEach(id=>{const st=got[id].st,p=st.prof||{},c=classes.find(x=>String(x.id)===id);if(c){c.grade=p.grade;c.sec=p.sec;c.teacher=p.teacher}setV(id,got[id].meta.v||0);if(id===String(S.cur))top=st;else stash[id]=st});
 await writeState(Object.assign({classes,cur:S.cur,stash,archive:S.archive,glib:S.glib},top));
}
function watch(){
 if(ST.un||!ST.mem||!db)return;
 const sid=ST.mem.schoolId,me=myEmail();
 const u1=db.collection('members').doc(me).onSnapshot(sn=>{
  if(!sn.exists){ST.mem=null;ST.school=null;try{setAcc();enforce()}catch(x){}render();return}
  const o=ST.mem;ST.mem=sn.data();
  if(o&&(o.active!==ST.mem.active||o.role!==ST.mem.role)){try{setAcc();enforce()}catch(x){}render();syncTeacher().catch(()=>{})}
 },()=>{});
 const u2=db.collection('schools').doc(sid).onSnapshot(sn=>{
  if(!sn.exists)return;
  const o=JSON.stringify(ST.school&&ST.school.classes);ST.school=sn.data();
  if(o!==JSON.stringify(ST.school.classes)){try{setAcc();enforce()}catch(x){}render();syncTeacher().catch(()=>{})}
 },()=>{});
 ST.un=()=>{try{u1();u2()}catch(x){}};
}
async function act(fn){
 if(ST.busy)return;
 ST.busy=true;ST.msg='';
 try{await fn();ST.busy=false;await load();return}
 catch(e){ST.busy=false;say('❌ '+fe(e))}
}

document.addEventListener('click',ev=>{
 const t=ev.target.closest('[data-sc]');if(!t)return;
 const a=t.dataset.sc,em=norm(t.dataset.e);
 if(a==='login'){const b=$('cb');if(b)b.click();return}
 if(a==='reload'){ST.loaded=false;load();return}
 if(!db||!ST.user)return;
 if(a==='create'){
  const name=($('sc_name').value||'').trim();
  if(!name){say('نام مدرسه را بنویسید.');return}
  act(async()=>{
   const me=myEmail(),sid=db.collection('schools').doc().id;
   await db.collection('schools').doc(sid).set({name,ownerUid:ST.user.uid,ownerEmail:me,createdAt:stamp(),classes:{}});
   await db.collection('members').doc(me).set({email:me,schoolId:sid,role:'manager',active:true,name:ST.user.displayName||'',addedAt:stamp()});
  });return}
 if(!ST.mem||ST.mem.role!=='manager')return;
 const sid=ST.mem.schoolId;
 if(a==='up'){act(async()=>{let n=0;for(const id of Object.keys(schoolClasses())){if((S.classes||[]).some(c=>String(c.id)===id)){await pushCls(id,true);n++}}ST.msg='✅ '+n+' کلاس به مدرسه ارسال شد.'});return}
 if(a==='down'){act(()=>managerDown());return}
 if(a==='add'){
  const e2=norm($('sc_em').value),nm=($('sc_nm').value||'').trim(),rl=$('sc_rl').value==='manager'?'manager':'teacher';
  if(!okMail(e2)){say('ایمیل را درست وارد کنید (مثلاً name@gmail.com).');return}
  if(ST.team.some(m=>norm(m.email)===e2)){say('این ایمیل قبلاً اضافه شده است.');return}
  act(async()=>{await db.collection('members').doc(e2).set({email:e2,schoolId:sid,role:rl,active:true,name:nm,addedAt:stamp()})});return}
 if(a==='tg'){
  const m=ST.team.find(x=>norm(x.email)===em);if(!m||em===myEmail())return;
  act(async()=>{await db.collection('members').doc(em).update({active:m.active===false})});return}
 if(a==='rm'){
  if(em===myEmail())return;
  if(!confirm('این عضو از مدرسه حذف شود؟ کلاس‌هایی که به او داده شده بدون معلم می‌شوند. سوابق ثبت‌شده‌ی کلاس‌ها حذف نمی‌شود.'))return;
  act(async()=>{
   const upd={};Object.entries(schoolClasses()).forEach(([id,v])=>{if(v&&norm(v.teacher)===em)upd['classes.'+id+'.teacher']=''});
   if(Object.keys(upd).length)await db.collection('schools').doc(sid).update(upd);
   await db.collection('members').doc(em).delete();
  });return}
});
document.addEventListener('change',ev=>{
 const t=ev.target.closest('[data-sca]');if(!t||!db||!ST.mem||ST.mem.role!=='manager')return;
 const id=t.dataset.sca,c=localClasses().find(x=>String(x.id)===String(id));if(!c)return;
 const teacher=norm(t.value),sid=ST.mem.schoolId;
 act(async()=>{await db.collection('schools').doc(sid).update({['classes.'+id]:{label:clsName(c),teacher}});if(teacher)await pushCls(id,true)});
});

function card(){
 const b=$('setBody');if(!b||$('scCard'))return;
 b.insertAdjacentHTML('beforeend','<div class="card" id="scCard"></div>');
 render();
 if(ST.user&&!ST.loaded&&!ST.busy)load();
}
{const b=$('setBody');if(b)new MutationObserver(card).observe(b,{childList:true})}
card();

let n=0;const tm=setInterval(()=>{n++;
 if(window.firebase&&firebase.apps&&firebase.apps.length&&typeof firebase.auth==='function'&&typeof firebase.firestore==='function'){
  clearInterval(tm);auth=firebase.auth();db=firebase.firestore();
  auth.onAuthStateChanged(u=>{if(!u){try{localStorage.removeItem('schMgr')}catch(x){}}if(ST.un){ST.un();ST.un=null}ST.user=u;ST.mem=null;ST.school=null;ST.team=[];ST.loaded=false;ST.err='';ST.msg='';render();if(u)load()});
 }else if(n>120)clearInterval(tm);
},500);
}catch(e){console.error('school-team',e)}})();

/* ورود مدیر با رمز عبور (بدون نیاز به Gmail) — دکمه‌ی «🔑 ورود مدیر» در انتهای منوی اصلی
   • رمز عبور هیچ‌جای کد یا مخزن نیست: تأیید رمز را خود Firebase Authentication (سرور) انجام می‌دهد.
   • فقط «شناسه‌ی ورود مدیر» (یک ایمیل غیرمحرمانه) در کد است؛ حساب مدیر با رمز را صاحب پروژه در کنسول Firebase می‌سازد (راهنما: README بخش ۱۶).
   • نقش مدیر همچنان از سند members/{ایمیل} در Firestore خوانده می‌شود (همان سازوکار قبلی)؛ دسترسی واقعی به داده‌ها را «قوانین Firestore» روی سرور کنترل می‌کند (firestore.rules).
   • حساب‌های Gmail معلم‌ها و ورود قبلی با گوگل بدون تغییر کار می‌کنند. */
(function(){try{
const $=id=>document.getElementById(id),nav=$('nav');if(!nav)return;
const MANAGER_LOGIN_EMAIL='manager@class-league-6c89f.firebaseapp.com';   /* غیرمحرمانه؛ اگر حساب مدیر را با ایمیل دیگری ساختید همین‌جا عوض کنید */
const norm=s=>String(s||'').trim().toLowerCase();
const isMgr=()=>{try{return !!(window.isSchoolManager&&window.isSchoolManager())}catch(e){return false}};
const A=()=>{try{return window.firebase&&firebase.apps&&firebase.apps.length&&typeof firebase.auth==='function'?firebase.auth():null}catch(e){return null}};
const toast=t=>{try{window.__raToast&&window.__raToast(t)}catch(e){}};

const st=document.createElement('style');
st.textContent='#mglOv{position:fixed;inset:0;z-index:99990;display:none;align-items:center;justify-content:center;padding:16px;background:#0008}#mglOv.on{display:flex}'
+'#mglOv .bx{width:100%;max-width:380px;background:var(--card,#fff);color:var(--tx,#222);border-radius:20px;padding:18px;box-shadow:0 16px 50px #0006;text-align:right;font-family:inherit}'
+'#mglOv h3{margin:0 0 6px;font-size:18px}#mglOv p{margin:0 0 10px;font-size:13px;line-height:1.9;color:var(--mut,#666)}'
+'#mglOv .pw{display:flex;gap:6px;align-items:center}#mglOv input{flex:1;margin:0;min-width:0}#mglOv .pw button{margin:0;flex:none;width:44px}'
+'#mglEr{min-height:22px;margin:8px 0 0;font-size:13px;font-weight:700;color:#d9534f;line-height:1.8}'
+'#mglOv .ac{display:flex;gap:8px;margin-top:8px}#mglOv .ac button{flex:1;margin:0}'
+'#mglBtn{margin-top:12px!important;border-top:1px dashed var(--line,#ddd)!important;border-radius:0 0 12px 12px!important}';
document.head.appendChild(st);

const ov=document.createElement('div');ov.id='mglOv';
ov.innerHTML='<div class="bx" role="dialog" aria-modal="true" aria-labelledby="mglT"><h3 id="mglT">🔑 ورود مدیر</h3>'
+'<p>رمز عبور مدیر را وارد کنید. برای ورود مدیر نیازی به حساب Gmail نیست.</p>'
+'<input type="text" autocomplete="username" value="'+MANAGER_LOGIN_EMAIL+'" style="display:none" tabindex="-1" aria-hidden="true" readonly>'
+'<div class="pw"><input id="mglPw" type="password" autocomplete="current-password" placeholder="رمز عبور مدیر" dir="ltr"><button type="button" class="sm" id="mglEye" aria-label="نمایش یا پنهان کردن رمز">👁</button></div>'
+'<div id="mglEr" role="alert"></div>'
+'<div class="ac"><button type="button" class="big" id="mglGo" style="font-size:15px;padding:11px">ورود</button><button type="button" class="sm" id="mglX">انصراف</button></div></div>';
document.body.appendChild(ov);

let busy=false,fails=0,lockUntil=0;
try{const f=JSON.parse(sessionStorage.getItem('mglF')||'{}');fails=f.n||0;lockUntil=f.u||0}catch(e){}
const saveF=()=>{try{sessionStorage.setItem('mglF',JSON.stringify({n:fails,u:lockUntil}))}catch(e){}};
const err=t=>{$('mglEr').textContent=t||''};
const setBusy=b=>{busy=b;$('mglGo').disabled=b;$('mglGo').textContent=b?'در حال بررسی…':'ورود'};
const MSG={'auth/wrong-password':'رمز عبور اشتباه است.','auth/invalid-credential':'رمز عبور اشتباه است.','auth/invalid-login-credentials':'رمز عبور اشتباه است.',
 'auth/user-not-found':'حساب مدیر هنوز در Firebase ساخته نشده است (راهنمای راه‌اندازی در README).','auth/too-many-requests':'تلاش‌های ناموفق زیاد بود؛ چند دقیقه بعد دوباره تلاش کنید.',
 'auth/network-request-failed':'اینترنت برقرار نیست؛ اتصال را بررسی کنید.','auth/user-disabled':'این حساب مدیر غیرفعال شده است.',
 'auth/operation-not-allowed':'ورود با ایمیل و رمز در Firebase فعال نیست (Authentication ← Sign-in method ← Email/Password).','auth/invalid-email':'شناسه‌ی ورود مدیر در برنامه درست تنظیم نشده است.'};

/* ورود مدیر روی دستگاهی که معلم وارد شده، محدودیت‌های معلم را پاک می‌کند؛ پس قبل از ورود نگه می‌داریم و بعد از خروج مدیر برمی‌گردانیم */
const keepPrev=()=>{try{const p=localStorage.getItem('schAcc');if(p&&!localStorage.getItem('mglPrevAcc'))localStorage.setItem('mglPrevAcc',p)}catch(e){}};
const restorePrev=()=>{try{const p=localStorage.getItem('mglPrevAcc');if(p){localStorage.setItem('schAcc',p);localStorage.removeItem('mglPrevAcc')}}catch(e){}};

function openDlg(){err('');$('mglPw').value='';$('mglPw').type='password';ov.classList.add('on');setTimeout(()=>{try{$('mglPw').focus()}catch(e){}},50)}
function closeDlg(){ov.classList.remove('on');$('mglPw').value='';err('');const b=$('mglBtn');if(b)try{b.focus()}catch(e){}}
/* نتیجه فقط وقتی معتبر است که مربوط به همین حساب مدیر باشد (نه حساب قبلیِ هنوز-بدون-خروج): نقش + نشانه‌ی ذخیره‌شده با ایمیل همین حساب */
async function waitRole(){const me=norm(MANAGER_LOGIN_EMAIL),J=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
 for(let i=0;i<27;i++){const a=A(),cu=a&&a.currentUser;
  if(cu&&norm(cu.email)===me){const r=window.__schRole&&window.__schRole(),mi=J('schMgr'),ac=J('schAcc');
   if(r==='manager'&&mi&&norm(mi.email)===me)return 'manager';
   if(r==='teacher'&&ac&&norm(ac.email)===me)return 'teacher'}
  await new Promise(r=>setTimeout(r,300))}
 return null}

async function submit(){
 if(busy)return;
 const now=Date.now();
 if(lockUntil>now){err('تلاش‌های ناموفق زیاد بود؛ '+Math.ceil((lockUntil-now)/1000)+' ثانیه دیگر دوباره تلاش کنید.');return}
 const pw=$('mglPw').value;
 if(!pw){err('رمز عبور را وارد کنید.');return}
 const a=A();
 if(!a){err('اتصال به Firebase برقرار نیست. اینترنت را بررسی کنید و چند ثانیه بعد دوباره تلاش کنید.');return}
 const cu=a.currentUser;
 if(cu&&!isMgr()&&norm(cu.email)!==norm(MANAGER_LOGIN_EMAIL)&&!confirm('الآن با حساب «'+(cu.email||'')+'» وارد هستید. با ورود مدیر، این حساب از این دستگاه خارج می‌شود (اطلاعات کلاس‌ها حذف نمی‌شود؛ بعداً با گوگل دوباره وارد شوید). ادامه می‌دهید؟'))return;
 setBusy(true);err('');
 try{
  keepPrev();
  await a.signInWithEmailAndPassword(MANAGER_LOGIN_EMAIL,pw);
  fails=0;lockUntil=0;saveF();$('mglPw').value='';err('در حال بررسی دسترسی مدیر…');
  const r=await waitRole();
  if(r==='manager'){closeDlg();toast('✅ ورود مدیر انجام شد.');show('dm')}
  else if(r==='teacher'){try{await a.signOut()}catch(e){}restorePrev();err('رمز درست است ولی این حساب مدیر مدرسه نیست.')}
  else{err('رمز درست است، اما اطلاعات مدرسه برای این حساب دریافت نشد: یا حساب هنوز به مدرسه‌ای متصل نیست یا قوانین Firestore اجازه نمی‌دهد. از «تنظیمات و ورود» وضعیت را ببینید و راهنمای README (بخش ۱۶) را دنبال کنید.')}
 }catch(e){
  const c=e&&e.code||'';
  if(c==='auth/wrong-password'||c==='auth/invalid-credential'||c==='auth/invalid-login-credentials'||c==='auth/user-not-found'){fails++;if(fails>=5){lockUntil=Date.now()+60000;fails=0}saveF()}
  err(MSG[c]||('ورود انجام نشد: '+(c||(e&&e.message)||'خطای نامشخص')));
 }
 setBusy(false)}

async function exitMgr(){
 if(!confirm('از پنل مدیر خارج می‌شوید؟'))return;
 const a=A();try{if(a)await a.signOut()}catch(e){}
 restorePrev();try{show('home')}catch(e){}toast('از پنل مدیر خارج شدید.')}

$('mglGo').onclick=submit;$('mglX').onclick=closeDlg;
$('mglEye').onclick=()=>{const p=$('mglPw');p.type=p.type==='password'?'text':'password'};
$('mglPw').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit()}});
ov.addEventListener('click',e=>{if(e.target===ov&&!busy)closeDlg()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on')&&!busy)closeDlg()});

/* دکمه‌ی انتهای منو: «ورود مدیر» یا (وقتی مدیر وارد است) «خروج از پنل مدیر» */
function paint(){
 const m=isMgr(),want=m?'out':'in';let b=$('mglBtn');
 if(!b||b.dataset.m!==want){if(b)b.remove();b=document.createElement('button');b.id='mglBtn';b.type='button';b.dataset.m=want;b.textContent=m?'🚪 خروج از پنل مدیر':'🔑 ورود مدیر';b.onclick=m?exitMgr:openDlg;nav.appendChild(b)}
 else if(nav.lastElementChild!==b)nav.appendChild(b)}
new MutationObserver(paint).observe(nav,{childList:true});
setInterval(paint,1000);paint();
window.MGL={open:openDlg,email:MANAGER_LOGIN_EMAIL};
}catch(e){console.error('manager-login',e)}})();

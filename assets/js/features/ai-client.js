/* اتصال امن هوش مصنوعی — لایه‌ی سمت کاربر (مرحله‌ی زیرساخت).
   - هیچ کلیدی در مرورگر نیست؛ فقط وضعیت تنظیمات سرور بررسی می‌شود (aiStatus) و هیچ درخواستی به سرویس هوش مصنوعی ارسال نمی‌شود.
   - window.AI.status() وضعیت تنظیمات را بررسی می‌کند؛ window.AI.testConnection() یک درخواست ثابت و کم‌هزینه می‌فرستد.
   - کارت اتصال فقط وضعیت و آزمایش را نشان می‌دهد؛ هیچ منبع یا داده‌ی دانش‌آموزی ارسال نمی‌شود. */
(function(){try{
const $=id=>document.getElementById(id);
const E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const CFG=window.AI_PUBLIC_CONFIG||{};
const SECRET_RE=/(sk-[A-Za-z0-9_-]{8,}|AIza[0-9A-Za-z_-]{20,}|Bearer\s+\S+|eyJ[A-Za-z0-9_-]{10,}\.)/;
const SECRET_KEY=/(api[_-]?key|secret|token|password|authorization)/i;
const fail=(state,message,extra)=>Object.assign({ok:false,configured:false,state,message},extra||{});

/* اگر کسی اشتباهاً کلید را در ai-config.js گذاشته باشد، کار متوقف و هشدار داده می‌شود (مقدار هرگز چاپ نمی‌شود) */
function cfgProblem(){
 for(const k of Object.keys(CFG)){
  if(SECRET_KEY.test(k)||SECRET_RE.test(String(CFG[k])))
   return 'در ai-config.js مقداری شبیه کلید/توکن پیدا شد. آن را فوراً حذف کنید و کلید را باطل (Revoke) کنید؛ کلید فقط باید روی سرور ثبت شود.';
 }
 return '';
}
function normBase(v){
 let u;try{u=new URL(String(v||'').trim())}catch(e){return ''}
 const local=u.hostname==='localhost'||u.hostname==='127.0.0.1';
 if(u.protocol!=='https:'&&!(u.protocol==='http:'&&local))return '';
 if(u.username||u.password||u.search||u.hash)return '';
 return (u.origin+u.pathname).replace(/\/+$/,'');
}

async function status(){
 const p=cfgProblem();if(p)return fail('client_config',p);
 if(!String(CFG.functionsBase||'').trim())
  return fail('client_missing','آدرس سرویس هوش مصنوعی (functionsBase) در فایل assets/js/features/ai-config.js تنظیم نشده است.');
 const base=normBase(CFG.functionsBase);
 if(!base)return fail('client_missing','مقدار functionsBase در ai-config.js معتبر نیست (باید https باشد، بدون پارامتر و بدون نام تابع).');
 const fb=window.firebase;
 const user=fb&&fb.apps&&fb.apps.length&&fb.auth?fb.auth().currentUser:null;
 if(!user)return fail('auth','برای بررسی وضعیت، ابتدا با حساب گوگل یا «ورود مدیر» وارد شوید.');
 let token;try{token=await user.getIdToken()}catch(e){return fail('auth','دریافت نشست ورود ممکن نشد؛ دوباره وارد شوید.')}
 const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
 try{
  const r=await fetch(base+'/aiStatus',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:ctl.signal});
  let j=null;try{j=await r.json()}catch(e){}
  if(r.status===401)return fail('auth',(j&&j.message)||'نشست ورود معتبر نیست؛ دوباره وارد شوید.');
  if(r.status===403)return fail('forbidden',(j&&j.message)||'این حساب اجازه‌ی دسترسی ندارد.');
  if(!r.ok||!j)return fail('error','پاسخ نامعتبر از سرویس (کد '+r.status+'). استقرار تابع aiStatus را بررسی کنید.');
  return Object.assign({},j,{ok:true,state:j.configured?'ok':(j.enabled===false?'disabled':'not_configured')});
 }catch(e){
  return fail('network','ارتباط با سرویس برقرار نشد. آدرس functionsBase، استقرار تابع و تنظیم AI_ALLOWED_ORIGINS (CORS) را بررسی کنید.');
 }finally{clearTimeout(tm)}
}

let testPromise=null, lastTestAt=0;
async function testConnection(){
 if(testPromise)return testPromise;
 const elapsed=Date.now()-lastTestAt;
 if(elapsed<10000)return fail('cooldown','برای جلوگیری از هزینه و درخواست تکراری، چند ثانیه صبر کنید.',{retryAfterSeconds:Math.ceil((10000-elapsed)/1000)});
 const p=cfgProblem();if(p)return fail('client_config',p);
 const base=normBase(CFG.functionsBase);
 if(!base)return fail('client_missing','ابتدا functionsBase را در assets/js/features/ai-config.js تنظیم کنید.');
 const fb=window.firebase;
 const user=fb&&fb.apps&&fb.apps.length&&fb.auth?fb.auth().currentUser:null;
 if(!user)return fail('auth','برای آزمایش، ابتدا با حساب مدیر وارد شوید.');
 testPromise=(async()=>{
  let token;try{token=await user.getIdToken()}catch(e){return fail('auth','دریافت نشست ورود ممکن نشد؛ دوباره وارد شوید.')}
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),35000);
  try{
   lastTestAt=Date.now();
   const r=await fetch(base+'/aiTest',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:ctl.signal});
   let j=null;try{j=await r.json()}catch(e){}
   if(r.ok&&j&&j.ok)return Object.assign({},j,{state:'ok'});
   const state=j&&j.code==='timeout'?'timeout':(j&&j.code==='provider_auth'?'provider_auth':(j&&j.code==='network_error'?'network':(j&&j.code==='cooldown'?'cooldown':'error')));
   return fail(state,(j&&j.message)||('آزمایش اتصال موفق نبود (کد '+r.status+').'),{code:j&&j.code,retryAfterSeconds:j&&j.retryAfterSeconds});
  }catch(e){return fail(ctl.signal.aborted?'timeout':'network',ctl.signal.aborted?'مهلت انتظار تمام شد.':'ارتباط با تابع آزمایش برقرار نشد؛ آدرس functionsBase و استقرار aiTest را بررسی کنید.')}
  finally{clearTimeout(tm)}
 })();
 try{return await testPromise}finally{testPromise=null}
}
window.AI=Object.freeze({ status, testConnection, ask:()=>Promise.reject(Object.assign(new Error('تولید سؤال در این مرحله فعال نیست.'),{code:'AI_NOT_ENABLED'})), version:2 });

/* ===== کارت تنظیمات (فقط مدیر) ===== */
const ICON={ok:'✅',not_configured:'⚠️',disabled:'⏸️',timeout:'⏱️',provider_auth:'🔑',network:'🌐',cooldown:'⌛'};
function resultHtml(r){
 const ic=ICON[r.state]||'❌';
 let h='<div style="margin-top:10px;font-weight:700;line-height:1.9">'+ic+' '+E(r.message)+'</div>';
 if(r.provider||r.model)h+='<div class="sub" style="text-align:right;margin-top:6px">سرویس: <b>'+E(r.provider||'—')+'</b> · مدل: <b>'+E(r.model||'—')+'</b></div>';
 if(r.issues&&r.issues.length)h+='<ul style="margin:8px 0 0;padding-right:20px;text-align:right;line-height:1.9;font-size:13.5px">'+r.issues.map(x=>'<li>'+E(x)+'</li>').join('')+'</ul>';
 return h;
}
function card(){
 const b=$('setBody');if(!b)return;
 const old=$('aiCard');
 const teacher=typeof window.isTeacherRole==='function'&&window.isTeacherRole();
 if(teacher){if(old)old.remove();return}
 if(old)return;
 const c=document.createElement('div');c.className='card';c.id='aiCard';
 c.innerHTML='<b>🤖 اتصال هوش مصنوعی</b><p class="sub" style="text-align:right;margin:6px 0 10px">کلید فقط روی سرور می‌ماند. آزمایش، یک پیام ثابت و غیرشخصی می‌فرستد؛ هیچ اطلاعات دانش‌آموز یا منبع درسی ارسال نمی‌شود و درخواست‌ها محدود شده‌اند.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="big" id="aiChk" style="font-size:15px;padding:11px">🔍 بررسی تنظیمات</button><button class="big" id="aiTest" style="font-size:15px;padding:11px">🧪 آزمایش واقعی اتصال</button></div><div id="aiRes" aria-live="polite"></div>';
 b.appendChild(c);
}
document.addEventListener('click',async e=>{
 const t=e.target.closest&&e.target.closest('#aiChk, #aiTest');if(!t)return;
 const isTest=t.id==='aiTest',out=$('aiRes');
 const peer=$(isTest?'aiChk':'aiTest');t.disabled=true;if(peer)peer.disabled=true;
 if(out)out.innerHTML='<div class="sub" style="text-align:right;margin-top:8px">'+(isTest?'در حال ارسال یک درخواست آزمایشی ثابت…':'در حال بررسی…')+'</div>';
 try{const r=isTest?await testConnection():await status();if(out)out.innerHTML=resultHtml(r)}
 catch(x){if(out)out.innerHTML=resultHtml(fail('error','خطای غیرمنتظره در ارتباط.'))}
 finally{t.disabled=false;if(peer)peer.disabled=false}
});
{const b=$('setBody');if(b){new MutationObserver(card).observe(b,{childList:true});card()}}
}catch(e){console.warn('ai-client',e&&e.message)}})();

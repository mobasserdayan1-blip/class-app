/* ذخیره‌سازی پایدار (IndexedDB) و راه‌انداز برنامه — قبل از هر چیز اجرا می‌شود */
(function(){
const NAT=(function(){try{return window.localStorage}catch(e){return null}})(),DBN='cl_store',ST='kv',BIG=40000,mem=new Map();
let db=null,dirty=new Set(),tm=null,warned=false,waiters=[];
const open=()=>new Promise((res,rej)=>{try{const q=indexedDB.open(DBN,1);q.onupgradeneeded=()=>q.result.createObjectStore(ST);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);q.onblocked=()=>rej(new Error('blocked'))}catch(e){rej(e)}});
const tx=(mode,fn)=>new Promise((res,rej)=>{const t=db.transaction(ST,mode);const r=fn(t.objectStore(ST));t.oncomplete=()=>res(r&&r.result);t.onerror=t.onabort=()=>rej(t.error)});
function flush(){clearTimeout(tm);tm=null;if(!db||!dirty.size)return;const ks=[...dirty];dirty.clear();
 try{const t=db.transaction(ST,'readwrite'),s=t.objectStore(ST);ks.forEach(k=>mem.has(k)?s.put(mem.get(k),k):s.delete(k));
  t.oncomplete=()=>{const w=waiters;waiters=[];w.forEach(f=>f())};
  t.onabort=t.onerror=()=>{ks.forEach(k=>dirty.add(k));if(!warned){warned=true;alert('⚠️ ذخیره‌ی اطلاعات ناموفق بود. فضای دستگاه را بررسی کنید و از «پشتیبان و امنیت» پشتیبان بگیرید.')}}}
 catch(e){ks.forEach(k=>dirty.add(k))}}
const queue=k=>{dirty.add(k);if(!tm)tm=setTimeout(flush,250)};
async function boot(){
 if(!window.indexedDB||!NAT)return;
 db=await open();
 const keys=await tx('readonly',s=>s.getAllKeys()),vals=await tx('readonly',s=>s.getAll());
 keys.forEach((k,i)=>mem.set(k,vals[i]));
 const first=!mem.has('cl1'),add=[];
 for(let i=0;i<NAT.length;i++){const k=NAT.key(i);if(!mem.has(k)){const v=NAT.getItem(k);if(v!=null){mem.set(k,v);add.push(k)}}}
 if(add.length){await tx('readwrite',s=>{add.forEach(k=>s.put(mem.get(k),k))});
  if(first&&mem.has('cl1')){const back=await tx('readonly',s=>s.get('cl1'));if(back===mem.get('cl1'))add.forEach(k=>{if(mem.get(k).length>=BIG)try{NAT.removeItem(k)}catch(e){}})}}
 const shim={getItem:k=>mem.has(String(k))?mem.get(String(k)):null,
  setItem(k,v){k=String(k);v=String(v);mem.set(k,v);queue(k);try{if(v.length<BIG)NAT.setItem(k,v);else NAT.removeItem(k)}catch(e){}},
  removeItem(k){k=String(k);mem.delete(k);queue(k);try{NAT.removeItem(k)}catch(e){}},
  clear(){const ks=[...mem.keys()];mem.clear();ks.forEach(queue);try{NAT.clear()}catch(e){}},
  key:i=>{const a=[...mem.keys()];return i<a.length?a[i]:null},get length(){return mem.size}};
 Object.defineProperty(window,'localStorage',{get:()=>shim,configurable:true});
 window.__idbStore=true;window.__flushStore=()=>new Promise(r=>{if(!db||(!dirty.size&&!tm)){r();return}waiters.push(r);flush();setTimeout(r,2500)});
 addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
}
const ready=new Promise(r=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',r):r());
/* [ساختار جدید] اسکریپت‌های برنامه از پوشه‌ی assets/js دریافت می‌شوند. بعد از آماده شدن ذخیره‌سازی، همه‌ی آن‌ها
   با همان ترتیب و همان لحظه‌ی قبلی (پشت‌سرهم و هم‌زمان) اجرا می‌شوند؛ پس رفتار برنامه تغییری نمی‌کند. */
const MODS=window.APP_MODULES||[];
const getText=m=>fetch(m.src).then(r=>{if(!r.ok)throw new Error(m.src+' ('+r.status+')');return r.text()});
const fetched=location.protocol==='file:'?null:Promise.all(MODS.map(getText));
if(fetched)fetched.catch(()=>{});
const patchEvents=()=>[window,document].map(o=>{const f=o.addEventListener;o.addEventListener=function(t,fn,op){if(t==='load'&&document.readyState==='complete'||t==='DOMContentLoaded'){setTimeout(()=>fn.call(this,new Event(t)),0);return}return f.call(this,t,fn,op)};return[o,f]});
const unpatch=saved=>saved.forEach(([o,f])=>{o.addEventListener=f});
const runAll=texts=>{const saved=patchEvents();try{MODS.forEach((m,i)=>{const s=document.createElement('script');if(m.id)s.id=m.id;s.textContent=texts[i]+'\n//# sourceURL='+m.src;document.body.appendChild(s)})}finally{unpatch(saved)}};
/* حالت باز کردن مستقیم فایل (file://): دریافت با fetch ممکن نیست؛ پس با تگ script و پشت‌سرهم بارگذاری می‌شود */
const runViaTags=()=>new Promise((res,rej)=>{const saved=patchEvents();let i=0;const next=()=>{if(i>=MODS.length){unpatch(saved);return res()}const m=MODS[i++];const s=document.createElement('script');if(m.id)s.id=m.id;s.src=m.src;s.onload=next;s.onerror=()=>{unpatch(saved);rej(new Error(m.src))};document.body.appendChild(s)};next()});
const showErr=e=>{console.error(e);const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;color:#b00020;padding:24px;font:16px Tahoma,sans-serif;direction:rtl;text-align:center;overflow:auto';d.textContent='⚠️ بارگذاری فایل‌های برنامه ناموفق بود ('+((e&&e.message)||e)+'). یک بار صفحه را دوباره بارگذاری کنید؛ اگر ادامه داشت، مطمئن شوید همه‌ی فایل‌های پوشه‌ی assets روی هاست آپلود شده‌اند.';document.body.appendChild(d)};
Promise.all([boot().catch(e=>console.warn('idb',e)),ready]).then(()=>fetched?fetched.then(runAll):runViaTags()).catch(showErr);
})();

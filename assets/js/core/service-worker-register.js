/* ثبت سرویس‌ورکر و اعلان به‌روزرسانی */
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))(function(){
const hadCtl=!!navigator.serviceWorker.controller;let reloading=false;
navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl||reloading)return;reloading=true;location.reload()});
function offer(w){if(document.getElementById('swUpd'))return;const b=document.createElement('div');b.id='swUpd';b.setAttribute('role','status');
 b.style.cssText='position:fixed;z-index:99998;bottom:14px;right:12px;left:12px;max-width:520px;margin:auto;background:#2f2a55;color:#fff;padding:12px 14px;border-radius:16px;box-shadow:0 8px 28px rgba(0,0,0,.35);display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:14px;font-weight:700;line-height:1.8;text-align:right';
 b.innerHTML='<span style="flex:1;min-width:180px">🔄 نسخه‌ی جدید برنامه آماده است.</span>';
 const u=document.createElement('button'),l=document.createElement('button');u.textContent='به‌روزرسانی';l.textContent='بعداً';
 u.style.cssText='background:#fff;color:#2f2a55;border:0;border-radius:12px;padding:8px 16px;font:inherit;font-weight:800;cursor:pointer';
 l.style.cssText='background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:12px;padding:8px 14px;font:inherit;cursor:pointer';
 u.onclick=()=>{u.disabled=true;u.textContent='در حال به‌روزرسانی…';Promise.resolve(window.__flushStore&&window.__flushStore()).catch(()=>{}).then(()=>{try{w.postMessage({type:'SKIP_WAITING'})}catch(e){location.reload()}})};
 l.onclick=()=>b.remove();b.appendChild(u);b.appendChild(l);document.body.appendChild(b)}
function go(){navigator.serviceWorker.register('sw.js').then(reg=>{
 if(reg.waiting&&navigator.serviceWorker.controller)offer(reg.waiting);
 reg.addEventListener('updatefound',()=>{const n=reg.installing;if(n)n.addEventListener('statechange',()=>{if(n.state==='installed'&&navigator.serviceWorker.controller)offer(n)})});
 const chk=()=>reg.update().catch(()=>{});setInterval(chk,30*60*1000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')chk()})
}).catch(()=>{})}
if(document.readyState==='complete')go();else addEventListener('load',go)})()

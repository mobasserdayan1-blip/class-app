const C='cl-v32',A=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
/* نصب مقاوم: اگر یکی از فایل‌ها روی سایت نبود، نصب سرویس‌ورکر خراب نمی‌شود */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{
 const f=fetch(r).then(res=>{if(res&&res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res})
  .catch(()=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined)||new Response('',{status:504,statusText:'offline'}));
 return m||f}))});

const C='cl-v37',A=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
/* [CHG-7] کتابخانه‌های PDF/اکسل بعد از اولین بارگذاری موفق، آفلاین هم کار می‌کنند */
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'];
const isCDN=u=>/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)\//.test(u);
/* نصب مقاوم: اگر یکی از فایل‌ها روی سایت نبود، نصب سرویس‌ورکر خراب نمی‌شود */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all([...A.map(u=>c.add(u).catch(()=>{})),...CDN.map(u=>fetch(new Request(u,{mode:'no-cors'})).then(r=>c.put(u,r)).catch(()=>{}))])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(isCDN(r.url)){e.respondWith(caches.open(C).then(c=>c.match(r.url).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r.url,res.clone()).catch(()=>{});return res}).catch(()=>new Response('',{status:504})))));return}
if(u.origin!==location.origin)return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{
 const f=fetch(r).then(res=>{if(res&&res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res})
  .catch(()=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined)||new Response('',{status:504,statusText:'offline'}));
 return m||f}))});

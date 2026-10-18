/* نمایش فضای ذخیره‌سازی */
(function(){try{
const $=id=>document.getElementById(id);let EST=null,PER=null;
const fm=n=>{n/=1048576;return n>=1024?(n/1024).toFixed(1)+' گیگابایت':n.toFixed(1)+' مگابایت'};
function draw(){const bk=$('bk');if(!bk)return;let b=$('stg');if(!b){b=document.createElement('div');b.id='stg';b.className='card';const h=bk.querySelector('h2');h?h.after(b):bk.prepend(b)}
 const u=EST?EST.usage||0:0,q=EST?EST.quota||0:0,p=q?u/q*100:0,c=p>=85?'#d9534f':p>=65?'#f0a030':'#1a8f55',F=typeof fa==='function'?fa:(x=>x);
 b.innerHTML=`<b>💽 فضای ذخیره‌سازی برنامه</b><div style="height:10px;background:var(--bg2);border-radius:9px;margin:8px 0;overflow:hidden"><i style="display:block;height:10px;width:${Math.max(1,Math.min(100,p))}%;background:${c};border-radius:9px"></i></div><p class="sub" style="margin:0;text-align:right">${q?`حدود ${F(fm(u))} از ${F(fm(q))} فضای در دسترس (${F(p<1?'کمتر از ۱':Math.round(p))}٪)`:'اطلاعات فضا از مرورگر در دسترس نیست'}${window.__idbStore?' — ذخیره‌سازی بزرگ (IndexedDB) فعال است؛ نگران حجم عکس‌ها و اطلاعات نباشید.':' — ⚠️ ذخیره‌سازی بزرگ در این مرورگر فعال نشد و محدودیت حدود ۵ مگابایت برقرار است.'}${PER===true?' 🔒 در برابر پاک‌شدن خودکار محافظت شده است.':PER===false?' ⚠️ برای اطمینان، گاهی پشتیبان بگیرید.':''}</p>`}
function upd(){try{navigator.storage.estimate().then(e=>{EST=e;draw()});navigator.storage.persisted().then(v=>{PER=v;draw()})}catch(e){draw()}}
const o=window.show;window.show=function(id){const r=o.apply(this,arguments);try{if(id==='bk')upd()}catch(e){}return r};
}catch(e){console.error('storage meter',e)}})();

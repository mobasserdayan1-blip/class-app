/* انواع فعالیت کلاسی */
(function(){
const $=id=>document.getElementById(id),e=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const BASE=[['پاسخ به سؤال','🙋'],['حل مسئله روی تخته','🧮'],['ارائه','🎤'],['فعالیت گروهی','👥'],['همکاری با دوستان','🤝'],['مسئولیت‌پذیری','🧩'],['مشارکت در بحث','💬'],['فعالیت خلاقانه','🎨'],['کمک به کلاس','🧹'],['سایر','✏️']];
const K=()=>{S.actKinds=S.actKinds||{};const o=S.actKinds;o.add=o.add||[];o.hide=o.hide||[];o.del=o.del||[];o.ren=o.ren||{};return o};
const rows=()=>{const o=K();return BASE.filter(b=>!o.del.includes(b[0])).map(b=>{const r=o.ren[b[0]]||{};return{k:'b|'+b[0],n:r.n||b[0],i:r.i||b[1]}}).concat(o.add.map(a=>({k:'a|'+a[0],n:a[0],i:a[1]||'✏️'})))};
function card(){const b=$('setBody');if(!b||$('akCard'))return;const o=K(),all=rows(),ch=o.del.length||Object.keys(o.ren).length;
 b.insertAdjacentHTML('beforeend','<div class="card" id="akCard"><b>🧩 انواع فعالیت کلاسی</b><p class="sub" style="text-align:right;margin:6px 0">همه‌ی فعالیت‌ها، چه پیش‌فرض و چه دلخواه، قابل ویرایش، غیرفعال‌کردن و حذف هستند. فعالیت‌های ثبت‌شده‌ی قبلی حفظ می‌شوند.</p>'+
 all.map(r=>{const h=o.hide.includes(r.n);return '<div class="crow"><div><b'+(h?' style="opacity:.5"':'')+'>'+e(r.i+' '+r.n)+'</b></div><span style="display:flex;gap:6px"><button data-ak="e" data-k="'+e(r.k)+'">✏️</button><button data-ak="t" data-n="'+e(r.n)+'">'+(h?'فعال کردن':'غیرفعال')+'</button><button class="dl" data-ak="d" data-k="'+e(r.k)+'">🗑</button></span></div>'}).join('')+
 '<div class="cadd" style="margin-top:8px"><input id="ak_n" placeholder="نام فعالیت جدید"><input id="ak_i" placeholder="ایموجی (اختیاری)" maxlength="4"></div><button class="big" data-ak="a" style="font-size:15px;padding:12px;margin-top:8px">➕ افزودن نوع فعالیت</button>'+(ch?'<button class="sm" data-ak="r" style="margin-top:8px">↩️ بازگرداندن فعالیت‌های پیش‌فرض</button>':'')+'<p class="sub" id="ak_m"></p></div>')}
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-ak]');if(!t)return;const o=K(),a=t.dataset.ak,n=t.dataset.n,kk=(t.dataset.k||'').split('|'),ty=kk[0],nm=kk.slice(1).join('|'),msg=x=>{const m=$('ak_m');if(m)m.textContent=x};
 if(a==='a'){const v=$('ak_n').value.trim(),ic=$('ak_i').value.trim()||'✏️';if(!v){msg('نام فعالیت را بنویسید');return}if(rows().some(x=>x.n===v)){msg('این نوع قبلاً هست');return}o.add.push([v,ic])}
 else if(a==='t'){const i=o.hide.indexOf(n);if(i<0)o.hide.push(n);else o.hide.splice(i,1)}
 else if(a==='e'){const r=rows().find(x=>x.k===t.dataset.k);if(!r)return;const nn=prompt('نام فعالیت:',r.n);if(nn==null)return;const v=nn.trim();if(!v){msg('نام نباید خالی باشد');return}if(v!==r.n&&rows().some(x=>x.n===v)){msg('این نام قبلاً هست');return}const ic=prompt('ایموجی:',r.i),i2=(ic==null?r.i:ic.trim())||r.i;
  if(ty==='b')o.ren[nm]={n:v,i:i2};else{const x=o.add.find(y=>y[0]===nm);if(x){x[0]=v;x[1]=i2}}
  const hi=o.hide.indexOf(r.n);if(hi>=0&&v!==r.n)o.hide[hi]=v}
 else if(a==='d'){if(!confirm('این نوع فعالیت حذف شود؟ فعالیت‌های ثبت‌شده‌ی قبلی باقی می‌مانند.'))return;const r=rows().find(x=>x.k===t.dataset.k);if(ty==='b'){if(!o.del.includes(nm))o.del.push(nm);delete o.ren[nm]}else o.add=o.add.filter(x=>x[0]!==nm);if(r)o.hide=o.hide.filter(x=>x!==r.n)}
 else if(a==='r'){if(!confirm('فعالیت‌های پیش‌فرض (حذف‌شده و ویرایش‌شده) به حالت اول برگردند؟'))return;o.del=[];o.ren={}}
 save();const c=$('akCard');if(c)c.remove();card()});
const b=$('setBody');if(b)new MutationObserver(card).observe(b,{childList:true});
})();

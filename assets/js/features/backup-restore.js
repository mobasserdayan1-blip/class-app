/* پشتیبان‌گیری و بازیابی */
(function(){
const $=id=>document.getElementById(id),z=n=>String(n).padStart(2,'0');let pend=null;
const cnt=d=>{let n=(d.students||[]).length;Object.values(d.stash||{}).forEach(c=>n+=(c.students||[]).length);return{k:(d.classes||[1]).length,n}};
const last=()=>{try{return localStorage.getItem('cl_bk')}catch(e){return null}};
window.renderBk=()=>{const c=cnt(S),l=last();
 $('bkb').innerHTML=`<div class="card"><b>💾 پشتیبان کامل</b><p class="sub" style="text-align:right;margin:6px 0">یک فایل با پسوند «.school» که همهٔ اطلاعات برنامه را دارد: ${fa(c.k)} کلاس، ${fa(c.n)} دانش‌آموز، حضور و غیاب، آزمون‌ها، تکالیف، پرونده‌ها، عکس‌ها و لوگو. این فایل مستقل از حساب گوگل است؛ آن را روی گوشی، فلش یا ایمیل خودتان نگه دارید.</p><button class="big" id="bk_s" style="font-size:16px;padding:13px">💾 گرفتن پشتیبان</button><p class="sub" id="bk_m">${l?'آخرین پشتیبان: '+E2(l):'⚠️ هنوز پشتیبانی گرفته نشده است'}</p></div>
 ${abCard()}
 <div class="card"><b>♻️ بازیابی پشتیبان</b><p class="sub" style="text-align:right;margin:6px 0">فایل «.school» را انتخاب کنید. اطلاعات فعلی با محتوای فایل جایگزین می‌شود (با دکمهٔ ↩️ بالای صفحه می‌توانید برگردید).</p><input type="file" id="bk_f"><div id="bk_i"></div></div>
 <div class="card"><b>🗑️ حذف کامل اطلاعات</b><p class="sub" style="text-align:right;margin:6px 0">همه‌ی اطلاعات این دستگاه پاک می‌شود و برگشت‌پذیر نیست؛ اگر به حساب گوگل (☁️) وارد باشید، نسخه‌ی ابری هم پاک می‌شود. قبل از حذف حتماً پشتیبان بگیرید.</p><button class="big" id="bk_reset" style="font-size:15px;padding:12px;background:linear-gradient(90deg,#e5484d,#f97316)">🗑️ حذف کامل همه‌ی اطلاعات</button><p class="sub" id="bk_rm"></p></div>`};
const E2=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const LS=k=>{try{return localStorage.getItem(k)}catch(e){return null}},SL=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const sig=s=>{let h=0;for(let i=0;i<s.length;i+=7)h=(h*31+s.charCodeAt(i))|0;return s.length+':'+h};
const IV=[[15,'هر ۱۵ دقیقه'],[30,'هر ۳۰ دقیقه'],[60,'هر ۱ ساعت'],[120,'هر ۲ ساعت'],[240,'هر ۴ ساعت'],[480,'هر ۸ ساعت'],[720,'هر ۱۲ ساعت'],[1440,'هر ۲۴ ساعت']];
const abTxt=()=>{const n=+LS('cl_ab_n')||0;return n?'تعداد پشتیبان‌های خودکار تا حالا: '+fa(n)+' · آخرین: '+E2(LS('cl_ab_lbl')||''):'هنوز پشتیبان خودکاری گرفته نشده است'};
window.abCard=()=>{const on=LS('cl_ab_on')==='1',mn=+LS('cl_ab_min')||60;return `<div class="card"><b>⏱️ پشتیبان‌گیری خودکار</b><p class="sub" style="text-align:right;margin:6px 0">اگر فراموش کنید، برنامه خودش در بازه‌ی انتخابی یک فایل «.school» ذخیره می‌کند. فقط وقتی برنامه باز است کار می‌کند و اگر اطلاعات تغییری نکرده باشد فایل تازه‌ای نمی‌سازد. اسم فایل: شماره‌ی نوبت + تاریخ شمسی + ساعت.</p><label class="sum" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ab_on"${on?' checked':''}> فعال باشد</label><select id="ab_min" class="fs">${IV.map(x=>`<option value="${x[0]}"${x[0]===mn?' selected':''}>${x[1]}</option>`).join('')}</select><button class="sm" id="ab_now">همین حالا یک نسخه‌ی خودکار بگیر</button><p class="sub" id="ab_st">${abTxt()}</p><p class="sub" style="text-align:right;font-size:12px">مرورگر ممکن است یک بار اجازه‌ی «دانلود چند فایل» را بپرسد؛ «اجازه بده» را بزنید. فایل‌ها در پوشه‌ی دانلودها ذخیره می‌شوند.</p></div>`};
function autoBk(force){if(!force&&LS('cl_ab_on')!=='1')return;const mn=+LS('cl_ab_min')||60,last=+LS('cl_ab_ts')||0;if(!force&&Date.now()-last<mn*60000)return;
 try{const body=JSON.stringify(S),sg=sig(body);if(!force&&sg===LS('cl_ab_sig')){SL('cl_ab_ts',Date.now());return}
  const n=(+LS('cl_ab_n')||0)+1,q=jp(tdy()),d=new Date(),name='auto-backup-'+String(n).padStart(3,'0')+'_'+q.y+'-'+z(q.m)+'-'+z(q.d)+'_'+z(d.getHours())+'-'+z(d.getMinutes())+'.school',
  b=new Blob([JSON.stringify({app:'school',v:1,ts:Date.now(),auto:n,data:S})],{type:'application/octet-stream'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},4000);
  SL('cl_ab_n',n);SL('cl_ab_ts',Date.now());SL('cl_ab_sig',sg);SL('cl_ab_lbl',fmt(tdy())+' · '+z(d.getHours())+':'+z(d.getMinutes())+' ('+name+')');const s=$('ab_st');if(s)s.innerHTML=abTxt()}catch(x){console.warn('autobk',x)}}
setInterval(()=>autoBk(false),30000);setTimeout(()=>autoBk(false),8000);
document.addEventListener('change',e=>{const t=e.target;if(t.id==='ab_on'){SL('cl_ab_on',t.checked?'1':'0');if(t.checked&&!+LS('cl_ab_ts'))SL('cl_ab_ts',Date.now())}if(t.id==='ab_min'){SL('cl_ab_min',t.value);SL('cl_ab_ts',Date.now())}});
document.addEventListener('click',e=>{if(e.target.id==='ab_now')autoBk(true)});
document.addEventListener('click',e=>{const t=e.target;
 if(t.id==='bk_s'){try{window.save&&0;const q=jp(tdy()),name='backup-'+q.y+'-'+z(q.m)+'-'+z(q.d)+'.school',json=JSON.stringify({app:'school',v:1,ts:Date.now(),data:S}),b=new Blob([json],{type:'application/octet-stream'}),f=new File([b],name);
  const dlA=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},4000)};
  const ok=()=>{try{sessionStorage.setItem('bk_ok',Date.now())}catch(x){}const s=fmt(tdy())+' · '+new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});try{localStorage.setItem('cl_bk',s)}catch(x){}$('bk_m').textContent='✅ پشتیبان ساخته شد: '+name+' ('+Math.round(json.length/1024)+' کیلوبایت)'};
  if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:name}).then(ok).catch(x=>{if(x&&x.name!=='AbortError'){dlA();ok()}});else{dlA();ok()}}catch(x){$('bk_m').textContent='❌ ساخت پشتیبان انجام نشد'}}
 if(t.id==='bk_go'&&pend){if(!window.tap2(t))return;try{window.histPush&&window.histPush(localStorage.getItem('cl1'))}catch(x){}localStorage.setItem('cl1',JSON.stringify(pend));localStorage.setItem('cl1_ts',Date.now());window.cloudPush&&window.cloudPush();sessionStorage.setItem('goto','bk');Promise.resolve(window.__flushStore&&window.__flushStore()).then(()=>setTimeout(()=>location.reload(),150))}});
document.addEventListener('change',e=>{if(e.target.id!=='bk_f')return;const f=e.target.files[0],o=$('bk_i');if(!f)return;pend=null;
 const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result),d=j&&j.app==='school'?j.data:j;if(!d||!Array.isArray(d.students)||typeof d!=='object')throw 0;pend=d;const c=cnt(d);
  o.innerHTML=`<p class="sub" style="text-align:right">✅ فایل معتبر است: ${fa(c.k)} کلاس · ${fa(c.n)} دانش‌آموز${j.ts?' · ساخته‌شده: '+new Date(j.ts).toLocaleDateString('fa-IR'):''}</p><button class="big" id="bk_go" style="font-size:15px;padding:12px;background:linear-gradient(90deg,#e5484d,#f97316)">♻️ جایگزین کردن اطلاعات فعلی</button>`}catch(x){o.innerHTML='<p class="sub" style="color:var(--no)">❌ این فایل پشتیبان معتبر برنامه نیست</p>'}};r.readAsText(f)});
})();

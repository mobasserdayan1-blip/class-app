/* پروفایل معلم */
(function(){try{
const $=id=>document.getElementById(id),E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
pages.push(['tme','👤 پروفایل من']);
$('set').insertAdjacentHTML('beforebegin','<section id="tme"><h2>👤 پروفایل من</h2><div id="tmeb"></div></section>');
const css=document.createElement('style');
css.textContent='.tme-h{display:flex;gap:14px;align-items:center}.tme-h img{width:96px;height:96px;border-radius:24px;object-fit:cover;flex:none;border:2px solid var(--line);cursor:pointer}.tme-h>div{min-width:0;flex:1}.tme-bar{height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin:6px 0 2px}.tme-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--p),var(--p2))}.tme-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:12px}.tme-g label{font-size:12px;color:var(--mut);display:block;margin-bottom:3px}.tme-g input,.tme-g select,.tme-g textarea{width:100%;margin:0;box-sizing:border-box}.tme-g .w{grid-column:1/-1}.tme-req{color:#d9534f;font-weight:700}';
document.head.appendChild(css);
const DEF='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" fill="#e6dcf7"/><circle cx="36" cy="28" r="13" fill="#b79be0"/><path d="M10 72c2-18 14-26 26-26s24 8 26 26z" fill="#9b6fd0"/></svg>');
const EDU=['','دیپلم','کاردانی','کارشناسی','کارشناسی ارشد','دکتری'];
const get=()=>((S.prof||{}).tself)||{};
const pct=()=>{const T=get(),P=S.prof||{},k=[P.teacher,T.photo,T.edu,T.major,T.yrs,T.tel,T.em,T.addr,T.exp];return Math.round(k.filter(x=>String(x==null?'':x).trim()).length/k.length*100)};
let msg='';
function rnd(){const b=$('tmeb');if(!b)return;const T=get(),P=S.prof||{},nm=P.teacher||'',p=pct();
 const inp=(id,l,v,x)=>'<div><label>'+l+'</label><input id="'+id+'" value="'+E(v)+'" '+(x||'')+'></div>';
 b.innerHTML='<div class="card"><div class="tme-h"><img id="tme_img" src="'+E(T.photo||DEF)+'" alt="" title="تغییر عکس"><div><b style="font-size:17px">'+(nm?E(nm):'نام خود را وارد کنید')+'</b><div class="tme-bar"><i style="width:'+p+'%"></i></div><small class="sub" style="margin:0">پروفایل '+fa(p)+'٪ کامل است</small><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="sm" id="tme_ph">📷 '+(T.photo?'تغییر عکس':'افزودن عکس')+'</button>'+(T.photo?'<button class="sm" id="tme_pd">حذف عکس</button>':'')+'</div></div></div></div>'
 +'<div class="card"><b>✏️ مشخصات من</b><div class="tme-g">'
 +'<div class="w"><label>نام و نام‌خانوادگی <span class="tme-req">* اجباری</span></label><input id="tme_name" value="'+E(nm)+'"></div>'
 +'<div><label>تحصیلات (آخرین مدرک)</label><select id="tme_edu" class="fs">'+EDU.map(x=>'<option value="'+x+'"'+(T.edu===x?' selected':'')+'>'+(x||'انتخاب کنید')+'</option>').join('')+'</select></div>'
 +inp('tme_major','رشته‌ی تحصیلی',T.major)+inp('tme_uni','دانشگاه / مرکز آموزشی',T.uni)+inp('tme_yrs','سابقه‌ی خدمت (سال)',T.yrs,'inputmode="numeric"')
 +inp('tme_tel','شماره تماس',T.tel,'inputmode="tel"')+inp('tme_em','تماس ضروری',T.em)
 +'<div class="w"><label>محل زندگی</label><input id="tme_addr" value="'+E(T.addr)+'"></div>'
 +'<div class="w"><label>سوابق کاری و دوره‌های آموزشی</label><textarea id="tme_exp" rows="3">'+E(T.exp)+'</textarea></div>'
 +'<div class="w"><label>درباره‌ی من / توضیحات</label><textarea id="tme_note" rows="2">'+E(T.note)+'</textarea></div></div>'
 +'<button class="big" id="tme_s" style="font-size:15px;padding:12px;margin-top:12px">💾 ذخیره‌ی پروفایل</button><p class="sub" id="tme_m" style="text-align:right">'+E(msg)+'</p>'
 +'<p class="sub" style="text-align:right;margin:0">پس از همگام‌سازی با مدرسه، مدیر این اطلاعات را در «پرونده‌ی معلمان» می‌بیند.</p></div>';
 msg=''}
function sv(){const n=$('tme_name'),m=$('tme_m'),name=n.value.trim();
 if(!name){m.textContent='❌ نام و نام‌خانوادگی اجباری است.';n.style.borderColor='#d9534f';n.focus();return}
 const old=String(S.prof.teacher||'').trim(),g=id=>$(id).value.trim();
 const t={photo:get().photo||'',edu:$('tme_edu').value,major:g('tme_major'),uni:g('tme_uni'),yrs:g('tme_yrs'),tel:g('tme_tel'),em:g('tme_em'),addr:g('tme_addr'),exp:g('tme_exp'),note:g('tme_note'),upd:Date.now()};
 S.prof.teacher=name;S.prof.tself=t;
 const cl=(S.classes||[]).find(c=>c.id===S.cur);if(cl)cl.teacher=name;
 if(old)Object.keys(S.stash||{}).forEach(id=>{const st=S.stash[id],sp=st&&st.prof;if(sp&&String(sp.teacher||'').trim()===old){sp.teacher=name;sp.tself=t;const c2=(S.classes||[]).find(c=>String(c.id)===String(id));if(c2)c2.teacher=name}});
 const pi=$('p_teacher');if(pi){pi.value=name;pi.style.borderColor='';const w=$('p_teacher_w');if(w)w.textContent=''}
 try{$('hsub').textContent=profLine()||'رقابت سالم، پیشرفت بی‌نهایت ✨'}catch(e){}
 save();msg='✅ پروفایل ذخیره شد.';rnd()}
function setPhoto(u){const t=Object.assign({},get(),{photo:u,upd:Date.now()});S.prof.tself=t;
 const old=String(S.prof.teacher||'').trim();if(old)Object.keys(S.stash||{}).forEach(id=>{const sp=(S.stash[id]||{}).prof;if(sp&&String(sp.teacher||'').trim()===old)sp.tself=t});
 save();rnd()}
const fi=document.createElement('input');fi.type='file';fi.accept='image/*';
fi.onchange=()=>{const f=fi.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const n=220,k=n/Math.min(im.width,im.height),cv=document.createElement('canvas');cv.width=cv.height=n;const c=cv.getContext('2d'),w=im.width*k,h=im.height*k;c.drawImage(im,(n-w)/2,(n-h)/2,w,h);setPhoto(cv.toDataURL('image/jpeg',.82))};im.src=r.result};r.readAsDataURL(f);fi.value=''};
$('tmeb').addEventListener('click',e=>{const t=e.target;if(t.id==='tme_img'||t.id==='tme_ph')fi.click();else if(t.id==='tme_pd')setPhoto('');else if(t.id==='tme_s')sv()});
const _s=window.show;window.show=function(id){
 try{const need=sessionStorage.getItem('needTeacher');
  if(need){if(String(S.cur)!==need)sessionStorage.removeItem('needTeacher');
   else if(String(S.prof.teacher||'').trim())sessionStorage.removeItem('needTeacher');
   else if(id!=='prof'){window.__raToast&&window.__raToast('نام آموزگار اجباری است؛ ابتدا آن را بنویسید.');id='prof'}}}catch(e){}
 const r=_s.call(this,id);if(id==='tme')rnd();return r};
}catch(e){console.error('tme',e)}})();

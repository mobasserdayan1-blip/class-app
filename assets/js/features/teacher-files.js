/* پرونده‌ی معلمان */
(function(){
const $=id=>document.getElementById(id),E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
pages.push(['tf','🧑‍🏫 پرونده‌ی معلمان']);
$('dm').insertAdjacentHTML('afterend','<section id="tf"><h2>🧑‍🏫 پرونده‌ی معلمان</h2><div id="tfb"></div></section>');
const nb=document.createElement('button');nb.textContent='🧑‍🏫 پرونده‌ی معلمان';nb.dataset.p='tf';nb.onclick=()=>show('tf');
const dmb=nav.querySelector('[data-p="dm"]');if(dmb)dmb.after(nb);else nav.appendChild(nb);
const css=document.createElement('style');css.textContent='.tfc{display:flex;gap:12px;align-items:flex-start}.tfc img{width:72px;height:72px;border-radius:18px;object-fit:cover;flex:none;border:2px solid var(--line);cursor:pointer}.tfc>div{min-width:0;flex:1}.tfc b{font-size:16px}.tfi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 12px;margin:8px 0;font-size:13px}.tfi span{color:var(--mut)}.tfi div{overflow-wrap:anywhere}.tfa{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.tfa button{flex:1 1 140px}.tff{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:10px}.tff label{font-size:12px;color:var(--mut);display:block;margin-bottom:3px}.tff input,.tff select,.tff textarea{width:100%;margin:0}.tff .w{grid-column:1/-1}';document.head.appendChild(css);
const names=()=>{const o=[];S.classes.filter(c=>!c.demo&&window.clsOK(c.id)).forEach(c=>{const t=String(clsMeta(c).t||'').trim();if(t&&!o.includes(t))o.push(t)});return o};
const cls=t=>S.classes.filter(c=>!c.demo&&String(clsMeta(c).t||'').trim()===t);
const selfOf=t=>{for(const c of cls(t)){const P=c.id===S.cur?S.prof:((S.stash[c.id]||{}).prof);if(P&&P.tself)return P.tself}return{}};
const prof=t=>{const c=cls(t).find(x=>x.tp),tp=c?c.tp:{},me=selfOf(t),a=(me.upd||0)>(tp.upd||0)?[tp,me]:[me,tp],o={};a.forEach(q=>Object.keys(q).forEach(k=>{if(q[k]!==''&&q[k]!=null)o[k]=q[k]}));return o};
const courses=c=>{const d=c.id===S.cur?S:(S.stash[c.id]||{});return(d.courses||[]).map(x=>x.name).filter(Boolean)};
const av=(t,p)=>p.photo||'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" fill="#e6dcf7"/><circle cx="36" cy="28" r="13" fill="#b79be0"/><path d="M10 72c2-18 14-26 26-26s24 8 26 26z" fill="#9b6fd0"/></svg>');
let ed=null,op=null;
window.renderTf=()=>{const L=names(),b=$('tfb');
 if(!L.length){b.innerHTML='<div class="card"><p class="sub">هنوز نام آموزگاری برای کلاس‌ها ثبت نشده است. هر کلاس را باز کنید و در «🏫 اطلاعات مدرسه و پایه» نام آموزگار (اجباری) را بنویسید.</p></div>';return}
 if(op!=null&&!L.includes(op)){op=null;ed=null}
 const chipH=on=>`<span class="chip" style="background:${on?'#2eaf6b':'#8a7aa6'}">${on?'فعال':'غیرفعال'}</span>`;
 const tile=t=>{const p=prof(t),C=cls(t),on=p.active!==false;
  return `<div class="tl-t" role="button" tabindex="0" data-tf="v" data-t="${E(t)}"><img src="${E(av(t,p))}" alt=""><b>${E(t)}</b>${chipH(on)}<small>${E(C.map(c=>clsLab(c)).join('، ')||'—')}</small></div>`};
 const full=t=>{const p=prof(t),C=cls(t),cr=[...new Set([].concat(...C.map(courses)))],on=p.active!==false;
  const row=(k,v)=>`<div><span>${k}</span><br>${v?E(v):'—'}</div>`;
  let h=`<div class="tfc"><img src="${E(av(t,p))}" data-tp="${E(t)}" alt="" title="تغییر عکس"><div><b>${E(t)}</b> ${chipH(on)}<div class="tfi">${row('نام کاربری',p.user)}${row('شماره تماس',p.tel)}${row('تماس ضروری',p.em)}${row('محل زندگی',p.addr)}${row('تحصیلات',[p.edu,p.major].filter(Boolean).join(' · '))}${row('دانشگاه / مرکز',p.uni)}${row('سال‌های خدمت',p.yrs?fa(p.yrs)+' سال':'')}${row('سابقه',p.exp)}${row('کلاس‌ها',C.map(c=>clsLab(c)+' ('+fa(clsMeta(c).n)+' نفر)').join('، '))}${row('دروس',cr.join('، '))}</div>${p.note?`<div style="font-size:13px"><span style="color:var(--mut)">توضیحات:</span> ${E(p.note)}</div>`:''}</div></div>`;
  if(ed===t)h+=`<div class="tff"><div><label>نام کاربری</label><input id="tf_u" value="${E(p.user)}"></div><div><label>وضعیت حساب</label><select id="tf_a"><option value="1"${on?' selected':''}>فعال</option><option value="0"${on?'':' selected'}>غیرفعال</option></select></div><div><label>شماره تماس</label><input id="tf_t" inputmode="tel" value="${E(p.tel)}"></div><div><label>تماس ضروری</label><input id="tf_e" value="${E(p.em)}"></div><div><label>تحصیلات</label><input id="tf_edu" value="${E(p.edu)}"></div><div><label>رشته</label><input id="tf_mj" value="${E(p.major)}"></div><div><label>دانشگاه / مرکز</label><input id="tf_un" value="${E(p.uni)}"></div><div><label>سال‌های خدمت</label><input id="tf_y" inputmode="numeric" value="${E(p.yrs)}"></div><div class="w"><label>محل زندگی</label><input id="tf_d" value="${E(p.addr)}"></div><div class="w"><label>سابقه / اطلاعات تکمیلی</label><input id="tf_x" value="${E(p.exp)}"></div><div class="w"><label>توضیحات</label><textarea id="tf_n" rows="2">${E(p.note)}</textarea></div></div><div class="tfa"><button class="big" data-tf="s" data-t="${E(t)}" style="font-size:14px;padding:10px">💾 ذخیره</button><button class="sm" data-tf="c">انصراف</button></div>`;
  else h+=`<div class="tfa"><button class="sm" data-tf="e" data-t="${E(t)}">✏️ ویرایش پرونده</button><button class="big" data-tf="o" data-t="${E(t)}" style="font-size:14px;padding:10px">🏠 باز کردن داشبورد</button></div>`;
  return h};
 b.innerHTML='<p class="sub">'+fa(L.length)+' معلم · برای دیدن اطلاعات، روی هر معلم بزنید.</p><div class="tl-grid">'+L.map(tile).join('')+'</div>'+(op!=null?`<div class="act-ov"><div class="act-sh">${full(op)}<button class="sm" data-tf="x" style="width:100%;margin-top:10px">✖ بستن</button></div></div>`:'')+'<p class="sub" style="margin-top:12px">کلاس‌ها و دروس هر معلم خودکار از روی «نام آموزگار» کلاس‌ها ساخته می‌شود. نام کاربری و وضعیت حساب فعلاً فقط ثبت می‌شود و ورود جداگانه‌ای با آن‌ها وجود ندارد.</p>'};
const setP=(t,f)=>{const C=cls(t),p=Object.assign({},prof(t));f(p);p.upd=Date.now();C.forEach(c=>c.tp=p);save()};
const fi=document.createElement('input');fi.type='file';fi.accept='image/*';let pt=null;
fi.onchange=()=>{const f=fi.files[0];if(!f||!pt)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const n=220,k=Math.min(1,n/Math.min(im.width,im.height)),cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d'),w=im.width*Math.max(k,n/Math.min(im.width,im.height)),h=im.height*Math.max(k,n/Math.min(im.width,im.height));g.drawImage(im,(n-w)/2,(n-h)/2,w,h);const u=cv.toDataURL('image/jpeg',.82);setP(pt,p=>p.photo=u);renderTf()};im.src=r.result};r.readAsDataURL(f);fi.value=''};
$('tfb').addEventListener('click',e=>{if(e.target.classList.contains('act-ov')){op=null;ed=null;renderTf();return}
 const im=e.target.closest('[data-tp]');if(im){pt=im.dataset.tp;fi.click();return}
 const t=e.target.closest('[data-tf]');if(!t)return;const a=t.dataset.tf,n=t.dataset.t;
 if(a==='v'){op=n;ed=null;renderTf()}else if(a==='x'){op=null;ed=null;renderTf()}
 else if(a==='e'){op=n;ed=n;renderTf()}else if(a==='c'){ed=null;renderTf()}
 else if(a==='s'){setP(n,p=>{p.user=$('tf_u').value.trim();p.active=$('tf_a').value==='1';p.tel=$('tf_t').value.trim();p.em=$('tf_e').value.trim();p.addr=$('tf_d').value.trim();p.edu=$('tf_edu').value.trim();p.major=$('tf_mj').value.trim();p.uni=$('tf_un').value.trim();p.yrs=$('tf_y').value.trim();p.exp=$('tf_x').value.trim();p.note=$('tf_n').value.trim()});ed=null;renderTf()}
 else if(a==='o'){op=null;ed=null;renderTf();const c=cls(n).find(x=>x.id===S.cur)||cls(n)[0];if(!c)return;if(c.id===S.cur)show('home');else{window.__goto='home';switchCls(c.id)}}});
$('tfb').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('tl-t')){e.preventDefault();e.target.click()}});
const _s=window.show;window.show=function(id){_s.apply(this,arguments);if(id==='tf')renderTf()};
})();

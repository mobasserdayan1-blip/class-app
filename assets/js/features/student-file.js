/* پرونده‌ی دانش‌آموز */
(function(){
const $=id=>document.getElementById(id),E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const fnOf=s=>((S.info||{})[s.id]||{}).fn||'',dupN=s=>S.students.filter(x=>x.name.trim()===s.name.trim()).length>1,lab=s=>s.name+(dupN(s)&&fnOf(s)?' — فرزند '+fnOf(s):''),fam=s=>{const w=s.name.trim().split(/\s+/);return w.length>1?w[w.length-1]+' '+w.slice(0,-1).join(' '):w[0]};window.tap2=b=>{if(b.dataset.s)return true;b.dataset.s=1;const o=b.textContent;b.textContent='مطمئنید؟';b.style.background='var(--no)';b.style.color='#fff';setTimeout(()=>{delete b.dataset.s;b.textContent=o;b.style.background='';b.style.color=''},3000);return false};
window.LG=()=>{const P=S.prof||{};if(!P.logo&&!P.school)return'';return `<div style="position:absolute;left:0;top:0;width:96px;text-align:center;line-height:1.35">${P.logo?`<img src="${P.logo}" style="width:60px;height:60px;object-fit:contain">`:''}<div style="font-size:10px;font-weight:800;color:#4b3478">${E(P.school?schoolFull():'')}</div></div>`};
window.PH=(id,inl)=>{const s=S.students.find(x=>x.id===id);if(!s||!s.photo)return'';return inl?`<img src="${s.photo}" style="width:46px;height:58px;object-fit:cover;border-radius:8px;vertical-align:middle;margin-left:8px">`:`<img src="${s.photo}" style="position:absolute;right:0;top:0;width:68px;height:86px;object-fit:cover;border-radius:10px;border:2px solid #d9cdf0">`};
window.AV=s=>s.photo?`<img class="av" src="${s.photo}">`:`<span class="av">${E((s.name||'?').trim()[0])}</span>`;
window.imgFit=(f,mx,cb)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.6))};im.src=r.result};r.readAsDataURL(f)};
function showLogo(){const P=S.prof;$('p_logo').innerHTML=P.logo?`<img src="${P.logo}" style="height:64px;border-radius:8px"><button class="sm" id="p_logod">حذف لوگو</button>`:'<span class="sub" style="margin:0">لوگویی انتخاب نشده</span>'}
$('p_logof').onchange=e=>{const f=e.target.files[0];if(f)imgFit(f,160,u=>{S.prof.logo=u;save();showLogo()})};
document.addEventListener('click',e=>{const t=e.target;if(t.id==='p_logod'){delete S.prof.logo;save();showLogo()}
 if(t.dataset&&t.dataset.phd){const id=+t.dataset.phd,s=S.students.find(x=>x.id===id);if(s){delete s.photo;save();window.openProf(id)}}});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.ph)return;const id=+t.dataset.ph,f=t.files[0];if(!f)return;imgFit(f,150,u=>{const s=S.students.find(x=>x.id===id);if(s){s.photo=u;save();window.openProf(id)}})});
showLogo();setTimeout(()=>render(),0);
let cur=0;
window.renderSF=()=>{const q=($('sfq').value||'').trim(),a=S.students.filter(s=>!q||(s.name+' '+fnOf(s)).includes(q));
 if(!a.find(s=>s.id===cur))cur=a[0]?a[0].id:0;$('sfs').innerHTML=a.map(s=>`<option value="${s.id}"${s.id===cur?' selected':''}>${E(lab(s))}</option>`).join('');
 const s=S.students.find(x=>x.id===cur),b=$('sfb');if(!s){b.innerHTML='<div class="card"><p class="sub">دانش‌آموزی پیدا نشد</p></div>';return}
 window.__sfid=s.id;const I=S.info[s.id]||{};let p=0,l=0,ab=0;Object.values(S.att).forEach(d=>{const v=d[s.id];if(v==='p')p++;else if(v==='l')l++;else if(v==='a')ab++});const tot=p+l+ab,ov=overall(s.id),rk=classTable().rk.findIndex(r=>r.s.id===s.id)+1;
 const k=(n,v)=>`<div class="st" style="--c:#7e57c2"><b style="font-size:20px">${v}</b><span>${n}</span></div>`;
 b.innerHTML=`<div class="card sfh">${s.photo?`<img src="${s.photo}">`:'<div class="ph0">👤</div>'}<div><b style="font-size:19px">${E(s.name)}</b><div class="sub" style="text-align:right;margin:4px 0 0">پدر: ${E(I.fn||'ثبت نشده')}${S.prof.grade?' · پایه '+E(S.prof.grade):''}</div></div></div>
 <div class="stats">${k('میانگین کل',ov==null?'—':f1(ov)+' از ۴')}${k('رتبه در کلاس',rk?fa(rk)+' از '+fa(S.students.length):'—')}${k('درصد حضور',tot?fa(Math.round((p+l)/tot*100))+'٪':'—')}${k('غیبت / تأخیر',fa(ab)+' / '+fa(l))}</div>
 <div class="sfg"><button data-a="e">✏️ مشخصات، والدین و عکس</button><button data-a="c">🎓 کارنامه گرافیکی</button><button data-a="o">🏛 کارنامه رسمی</button><button data-a="p">👨‍👩‍👦 گزارش والدین</button><button data-a="g">📊 نمودار پیشرفت (سال/ماه/هفته)</button><button data-a="r">📈 گزارش نمرات فردی</button><button data-a="m">🧾 گزارش کامل مدیر</button>${I.fp?'<button data-a="t">📞 تماس با پدر</button>':''}${S.classes&&S.classes.length>1?'<button data-a="mv">🔀 انتقال به کلاس دیگر</button>':''}</div>`};
$('sfs').onchange=e=>{cur=+e.target.value;renderSF()};$('sfq').oninput=()=>renderSF();
$('sfb').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;const id=cur;
 if(a==='e')window.openProf(id);else if(a==='c')window.openRep(id,'c');else if(a==='o')window.openRep(id,'o');else if(a==='p')window.openRep(id,'p');else if(a==='m')window.mgrOpen(id);
 else if(a==='t'){const v=(S.info[id]||{}).fp;if(v)location.href='tel:'+v}
 else if(a==='r'){show('rep');document.querySelector('#rep .tb2 button[data-t="s"]').click();$('rs').value=id;$('rs').dispatchEvent(new Event('change',{bubbles:true}))}});
const _R=render;render=function(){S.students.sort((x,y)=>fam(x).localeCompare(fam(y),'fa')||fnOf(x).localeCompare(fnOf(y),'fa'));_R.apply(this,arguments);try{if($('sf').classList.contains('on'))renderSF()}catch(x){}};
const MS=[7,8,9,10,11,12,1,2,3];let fq='r';
$('fr_d1').innerHTML=$('fr_d2').innerHTML=Array.from({length:31},(_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join('');
$('fr_m1').innerHTML=$('fr_m2').innerHTML=MS.map(m=>`<option value="${m}">${MN[m-1]}</option>`).join('');$('fr_d2').value=30;$('fr_m2').value=3;$('fr_m1').value=7;
$('fr_q').onclick=e=>{const q=e.target.dataset.q;if(!q)return;fq=q;[...$('fr_q').children].forEach(b=>b.classList.toggle('on',b.dataset.q===q));$('fr_r').style.display=q==='r'?'flex':'none'};
const yy=m=>m>=7?SY:SY+1,ld=m=>m<=6?31:m===12?29:30;
function rng(){let a,b,l;if(fq==='y'||(fq==='m'&&!+$('rm').value)){a=fromJ(SY,7,1);b=fromJ(SY+1,3,31);l='سال تحصیلی '+syLab(SY)}
 else if(fq==='s1'||fq==='s2'){const v=window.semGet(fq==='s1'?1:2),m1=v[0],d1=v[1],m2=v[2],d2=v[3];a=fromJ(yy(m1),m1,d1);b=fromJ(yy(m2),m2,d2);l='نیمسال '+(fq==='s1'?'اول':'دوم')+' ('+fa(d1)+' '+MN[m1-1]+' تا '+fa(d2)+' '+MN[m2-1]+')'}
 else if(fq==='m'){const m=+$('rm').value;a=fromJ(yy(m),m,1);b=fromJ(yy(m),m,ld(m));l='ماه '+MN[m-1]}
 else{const d1=+$('fr_d1').value,m1=+$('fr_m1').value,d2=+$('fr_d2').value,m2=+$('fr_m2').value;a=fromJ(yy(m1),m1,d1);b=fromJ(yy(m2),m2,d2);l='از '+fa(d1)+' '+MN[m1-1]+' تا '+fa(d2)+' '+MN[m2-1]}
 return[iso(a),iso(b),l]}
async function fr(k){const g=rng();if(g[0]>g[1]){$('fr_msg').textContent='تاریخ شروع باید قبل از پایان باشد';return}window.__rg=g;$('fr_msg').textContent='⏳ در حال ساخت گزارش…';try{await runExp(k);$('fr_msg').textContent=''}finally{window.__rg=null}}
$('fr_x').onclick=()=>fr('x');$('fr_p').onclick=()=>fr('p');
})();

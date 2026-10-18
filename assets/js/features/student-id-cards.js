/* خروجی کارت دانش‌آموزان */
(function(){
const $=id=>document.getElementById(id),E=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const L=['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'],J=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'];
const ld=async(urls,ok)=>{for(const u of urls){if(ok())return;await new Promise(r=>{const e=document.createElement('script');e.src=u;e.onload=r;e.onerror=r;document.head.appendChild(e)})}};
const css=document.createElement('style');css.textContent='#pcw{position:fixed;left:-99999px;top:0;direction:rtl}.pcp{width:794px;height:1123px;background:#fff;padding:30px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,1fr);gap:14px;box-sizing:border-box;font-family:Vazirmatn,Tahoma,sans-serif}.pcp .idcard{height:100%;display:flex;flex-direction:column;border-radius:14px;font-size:11.5px}.pcp .idcard .hd{padding:6px 10px}.pcp .idcard .hd b{font-size:12.5px}.pcp .idcard .hd span{font-size:10px}.pcp .idcard .bd{padding:8px 10px;gap:10px;flex:1;min-height:0;overflow:hidden}.pcp .idcard .bd img{width:66px;height:84px;border-radius:10px}.pcp .idcard dl{gap:3px 8px}.pcp .idcard .ft{padding:5px;font-size:10.5px}';document.head.appendChild(css);
$('editList').insertAdjacentHTML('beforebegin','<div class="card"><b>🪪 خروجی کارت دانش‌آموزان</b><p class="sub" style="text-align:right;margin:6px 0">همه‌ی دانش‌آموزان این کلاس به‌صورت کارت شناسایی در یک فایل PDF با اندازه‌ی A4 (۱۰ کارت در هر صفحه) ساخته می‌شود. نیاز به اینترنت دارد.</p><button class="big" id="pc_b" style="font-size:15px;padding:12px">📄 ساخت PDF کارت‌ها</button><p class="sub" id="pc_m" style="margin:8px 0 0"></p></div>');
const card=s=>{const I=(S.info||{})[s.id]||{},P=S.prof||{},c=S.classes.find(q=>q.id===S.cur)||{},cl=window.clsLab?clsLab(c):'';
 const g=s.gd==='m'?'پسر':s.gd==='f'?'دختر':'';
 const par=[I.fn&&'پدر: '+I.fn,I.mn&&'مادر: '+I.mn].filter(Boolean).join(' · '),tel=[I.fp,I.mp,I.hp,I.ep].filter(Boolean)[0];
 const row=(a,b)=>b?`<dt>${a}</dt><dd>${E(b)}</dd>`:'';
 const sc=P.school?schoolFull(P):'مدرسه';
 return `<div class="idcard"><div class="hd"><b>${E(sc)}</b><span></span></div><div class="bd"><img src="${window.stAvSrc?stAvSrc(s):''}" alt=""><dl>${row('نام',s.name)}${row('کد دانش‌آموزی',I.sc)}${row('پایه',P.grade?'پایه '+P.grade:'')}${row('کلاس',cl)}${row('جنسیت',g)}${row('تاریخ تولد',I.bd)}${row('والدین',par)}${row('تماس',tel)}</dl></div></div>`};
$('pc_b').onclick=async()=>{const m=$('pc_m'),b=$('pc_b'),st=S.students.filter(x=>!x.demo);
 if(!st.length){m.textContent='دانش‌آموزی در این کلاس نیست';return}
 b.disabled=true;let w;
 try{m.textContent='در حال آماده‌سازی…';await ld(L,()=>window.html2canvas);await ld(J,()=>window.jspdf);
  if(!window.html2canvas||!window.jspdf)throw new Error('کتابخانه‌ی ساخت PDF (html2canvas/jsPDF) از CDN بارگذاری نشد. اتصال اینترنت یا فیلترشکن را بررسی کنید و دوباره تلاش کنید.');
  try{await document.fonts.ready}catch(e){}
  w=document.createElement('div');w.id='pcw';document.body.appendChild(w);
  const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait'}),n=Math.ceil(st.length/10);
  for(let p=0;p<n;p++){m.textContent='در حال ساخت صفحه‌ی '+(p+1)+' از '+n+'…';
   w.innerHTML='<div class="pcp">'+st.slice(p*10,p*10+10).map(card).join('')+'</div>';
   await Promise.all([...w.querySelectorAll('img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));
   const cv=await html2canvas(w.firstChild,{scale:2,backgroundColor:'#ffffff'});
   if(p)pdf.addPage();pdf.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}
  const u=URL.createObjectURL(pdf.output('blob')),a=document.createElement('a');a.href=u;a.download='student-cards.pdf';document.body.appendChild(a);a.click();a.remove();
  m.innerHTML='✅ فایل ساخته شد ('+fa(st.length)+' کارت، '+fa(n)+' صفحه). اگر دانلود نشد <a href="'+u+'" target="_blank" style="color:var(--p)">اینجا را بزنید</a>.'}
 catch(x){m.textContent='❌ '+(x&&x.message?x.message:'ساخت فایل ناموفق بود')}
 finally{if(w)w.remove();b.disabled=false}};
})();

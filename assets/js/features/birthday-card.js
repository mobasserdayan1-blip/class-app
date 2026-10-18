/* کارت تولد */
(function(){const nd=t=>String(t||'').replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)),es=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function bdOf(id){const v=nd(((S.info||{})[id]||{}).bd).trim(),m=v.match(/(\d{1,4})\D+(\d{1,2})\D+(\d{1,4})/);if(!m)return null;let y,mo,da;if(m[1].length===4||+m[1]>31){y=+m[1];mo=+m[2];da=+m[3]}else{da=+m[1];mo=+m[2];y=+m[3]}if(mo<1||mo>12||da<1||da>31)return null;return{y,m:mo,d:da}}
function list(off){const q=jp(addD(tdy(),off));return S.students.map(s=>({s,b:bdOf(s.id)})).filter(x=>x.b&&x.b.m===q.m&&x.b.d===q.d).map(x=>({n:x.s.name,age:x.b.y>1250&&x.b.y<q.y?q.y-x.b.y:null,q}))}
const _s=window.smartHome;
function card(){try{const box=document.getElementById('smart');if(!box||!S.students.length)return;const old=document.getElementById('bdCard');if(old)old.remove();
 const t=list(0),up=[];for(let i=1;i<=7;i++)list(i).forEach(x=>up.push({...x,i}));if(!t.length&&!up.length)return;
 let h='<div class="card" id="bdCard" style="margin-top:12px;border:2px solid #f59e0b55"><b>🎂 تولد دانش‌آموزان</b>';
 h+=t.length?`<p style="margin:8px 0 0;font-size:16px">🎉 امروز تولد ${t.map(x=>'<b>'+es(x.n)+'</b>'+(x.age?' ('+fa(x.age)+' ساله می‌شود)':'')).join('، ')} است. فراموش نکنید تبریک بگویید!</p>`:'<p class="sub" style="margin:8px 0 0">امروز تولد کسی نیست.</p>';
 if(up.length)h+=`<p class="sub" style="margin:8px 0 0;text-align:right">در ۷ روز آینده: ${up.map(x=>es(x.n)+' ('+(x.i===1?'فردا':fa(x.i)+' روز دیگر')+')').join('، ')}</p>`;
 box.insertAdjacentHTML('afterbegin',h+'</div>')}catch(e){}}
window.smartHome=function(){_s&&_s.apply(this,arguments);card()};card();
})();

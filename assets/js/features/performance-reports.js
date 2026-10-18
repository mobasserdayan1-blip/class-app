/* گزارش عملکرد و چاپ */
(function(){try{
const $=id=>document.getElementById(id),q=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const MS=[7,8,9,10,11,12,1,2,3],D=k=>new Date(k+'T12:00:00Z'),addDays=(k,n)=>{const d=D(k);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)},wkS=k=>addDays(k,-((D(k).getUTCDay()+1)%7)),jm=k=>{const p=jp(D(k));return p.y*100+p.m},fx=v=>v==null?'—':fa((Math.round(v*100)/100).toString().replace('.','٫')),FF="Tahoma,'Segoe UI',Arial,sans-serif";
const st=document.createElement('style');st.textContent='.pco{position:fixed;inset:0;z-index:95;background:#000a;overflow:auto;padding:10px}.pcbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;max-width:820px;margin:0 auto 10px;background:var(--card);border-radius:16px;padding:10px;color:var(--tx)}.pcbar select{margin:0;flex:1;min-width:130px}.pcbar b{flex:1 1 100%}.pcs{max-width:820px;margin:0 auto;background:#fff;color:#222;border-radius:16px;padding:16px;direction:rtl}.pcs [data-pb]{background:#fff;padding:10px 6px;border-bottom:1px dashed #e3dcf3}.pcs h3{margin:0 0 6px;color:#5b3fa8;font-size:16px}.pcl{stroke-dasharray:1;stroke-dashoffset:1;animation:pcd 1.4s ease forwards}.pcs.noanim .pcl{animation:none;stroke-dashoffset:0}@keyframes pcd{to{stroke-dashoffset:0}}.pck{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:8px 0}.pck div{background:#f5f0ff;border-radius:12px;padding:8px;text-align:center}.pck b{display:block;font-size:19px}.pck span{font-size:12px;color:#6b5f8a}.pct{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}.pct th{background:#7e57c2;color:#fff;padding:4px}.pct td{border:1px solid #e3dcf3;padding:4px;text-align:center}.pcn{font-size:13px;line-height:1.9;margin:6px 0}.pcb{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px}.pcb>span{flex:0 0 120px}.pcb>i{flex:1;height:12px;background:#eee;border-radius:8px;position:relative;overflow:hidden}.pcb>i>u{position:absolute;inset:0 auto 0 auto;right:0;border-radius:8px}.pcb>i>s{position:absolute;top:-2px;bottom:-2px;width:3px;background:#222}.pcs.pdfc{padding:6px 12px;border-radius:0;box-sizing:border-box}.pcs.pdfc [data-pb]{padding:3px 2px}.pcs.pdfc h3{font-size:14px;margin:0 0 2px}.pcs.pdfc .pck{margin:4px 0;gap:6px}.pcs.pdfc .pck div{padding:5px}.pcs.pdfc .pck b{font-size:17px}.pcs.pdfc .pct{font-size:11px;margin-top:3px}.pcs.pdfc .pct th,.pcs.pdfc .pct td{padding:2px 4px}.pcs.pdfc .pcn{font-size:12px;line-height:1.6;margin:3px 0}.pcs.pdfc .pcb{margin:3px 0}.pcs.pdfc .sgrow{margin-top:8px!important}@media print{body>*:not(#pcO){display:none!important}.pco{position:static;background:none;padding:0}.pcbar{display:none}}';document.head.appendChild(st);

function pts(id){return(S.exams||[]).map(e=>{const v=nrm(e,id);if(v==null)return null;const c=(S.courses||[]).find(x=>x.id===e.course);return{d:e.date,v,c:mean(S.students.map(s=>nrm(e,s.id)).filter(nn)),n:c?c.name:'آزمون',cid:e.course}}).filter(Boolean).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)}
const agg=(a,l)=>({l,v:mean(a.map(x=>x.v)),c:mean(a.map(x=>x.c).filter(nn)),n:a.length});
const colr=v=>v==null?'#999':v>=3.5?'#1a8f55':v>=2.5?'#5fa83a':v>=1.5?'#d98600':'#d12f35';
function curve(P,y0,y1){const cl=y=>Math.max(y0,Math.min(y1,y));let d='M'+P[0][0].toFixed(1)+','+P[0][1].toFixed(1);for(let i=0;i<P.length-1;i++){const a=P[i-1]||P[i],b=P[i],c=P[i+1],e=P[i+2]||c,t=.18;d+='C'+(b[0]+(c[0]-a[0])*t).toFixed(1)+','+cl(b[1]+(c[1]-a[1])*t).toFixed(1)+' '+(c[0]-(e[0]-b[0])*t).toFixed(1)+','+cl(c[1]-(e[1]-b[1])*t).toFixed(1)+' '+c[0].toFixed(1)+','+c[1].toFixed(1)}return d}
function chart(R,uid){const W=720,H=window.__pcH||300,pl=16,pr=44,pt=30,pb=44,n=R.length,sw=(W-pl-pr)/n,X=i=>pl+(n-1-i+.5)*sw,Y=v=>pt+(1-v/4)*(H-pt-pb),has=R.some(r=>r.v!=null);
 let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" font-family="${FF}"><defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7e57c2" stop-opacity=".38"/><stop offset="1" stop-color="#7e57c2" stop-opacity=".02"/></linearGradient></defs>`;
 [[3.5,4,'#1a8f55'],[2.5,3.5,'#5fa83a'],[1.5,2.5,'#d98600'],[0,1.5,'#d12f35']].forEach(b=>s+=`<rect x="${pl}" y="${Y(b[1])}" width="${W-pl-pr}" height="${Y(b[0])-Y(b[1])}" fill="${b[2]}" opacity=".07"/>`);
 for(let g=0;g<=4;g++)s+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(g)}" y2="${Y(g)}" stroke="#d9d0ee" stroke-width="1"${g?' stroke-dasharray="4 4"':''}/><text x="${W-pr+10}" y="${Y(g)+4}" font-size="12" fill="#6b5f8a">${fa(g)}</text>`;
 const every=n>16?2:1;R.forEach((r,i)=>{if(i%every===0)s+=`<text x="${X(i)}" y="${H-pb+20}" font-size="${n>10?11:12}" text-anchor="middle" fill="#444">${q(r.l)}</text>`;if(r.n)s+=`<text x="${X(i)}" y="${H-pb+34}" font-size="10" text-anchor="middle" fill="#9a90b5">${fa(r.n)} آزمون</text>`});
 if(!has)return s+`<text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="15" fill="#8a7aa6">در این بازه آزمونی ثبت نشده است</text></svg>`;
 const P=[],C=[];R.forEach((r,i)=>{if(r.v!=null)P.push([X(i),Y(r.v),r.v,i]);if(r.c!=null)C.push([X(i),Y(r.c)])});
 if(C.length>1)s+=`<path d="${curve(C,pt,H-pb)}" fill="none" stroke="#8a8a9a" stroke-width="2.2" stroke-dasharray="6 5"/>`;C.forEach(c=>s+=`<circle cx="${c[0]}" cy="${c[1]}" r="3" fill="#8a8a9a"/>`);
 if(P.length>1){const d=curve(P,pt,H-pb);s+=`<path d="${d}L${P[P.length-1][0].toFixed(1)},${Y(0)}L${P[0][0].toFixed(1)},${Y(0)}Z" fill="url(#g${uid})"/><path class="pcl" pathLength="1" d="${d}" fill="none" stroke="#7e57c2" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`}
 const mx=Math.max(...P.map(p=>p[2])),mn=Math.min(...P.map(p=>p[2]));
 P.forEach(p=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6.5" fill="${colr(p[2])}" stroke="#fff" stroke-width="2.5"/>`;if(n<=14||p[2]===mx||p[2]===mn)s+=`<text x="${p[0]}" y="${p[1]-12}" font-size="12.5" font-weight="700" text-anchor="middle" fill="${colr(p[2])}">${fx(p[2])}</text>`});
 return s+'</svg>'}
function tbl(R,keep){if(window.__pcH&&!keep)return '';const a=R.filter(r=>r.v!=null);if(!a.length)return '';return `<table class="pct"><tr><th>بازه</th><th>میانگین دانش‌آموز</th><th>میانگین کلاس</th><th>اختلاف</th><th>آزمون</th></tr>${a.map(r=>{const d=r.c==null?null:r.v-r.c;return `<tr><td>${q(r.l)}</td><td><b style="color:${colr(r.v)}">${fx(r.v)}</b></td><td>${fx(r.c)}</td><td style="color:${d==null?'#666':d>=0?'#1a8f55':'#d12f35'}">${d==null?'—':(d>0?'+':'')+fx(d)}</td><td>${fa(r.n)}</td></tr>`}).join('')}</table>`}

let CID=0,SM=0,SW='';
function data(id){const P=pts(id),Y=typeof SY!=='undefined'?SY:jp(tdy()).y;
 const yr=MS.map(m=>{const k=(m>=7?Y:Y+1)*100+m;return agg(P.filter(x=>jm(x.d)===k),MN[m-1])});
 const k=(SM>=7?Y:Y+1)*100+SM,mp=P.filter(x=>jm(x.d)===k),days={};mp.forEach(x=>(days[x.d]=days[x.d]||[]).push(x));
 const mo=Object.keys(days).sort().map(d=>agg(days[d],fa(jp(D(d)).d)));
 const w0=SW,wk=[0,1,2,3,4,5,6].map(i=>{const d=addDays(w0,i),a=P.filter(x=>x.d===d);return agg(a,WN[i])});
 return{P,yr,mo,wk,Y}}
function weeks(P){const s={};P.forEach(x=>s[wkS(x.d)]=1);const t=wkS(iso(tdy()));s[t]=1;return Object.keys(s).sort().reverse()}
const wl=k=>{const a=jp(D(k)),b=jp(D(addDays(k,6)));return fa(a.d)+' '+MN[a.m-1]+' تا '+fa(b.d)+' '+MN[b.m-1]};
function sheet(){const s=S.students.find(x=>x.id===CID);if(!s)return '';const I=(S.info||{})[s.id]||{},d=data(s.id),P=d.P,all=P.map(x=>x.v),ov=mean(all),oc=mean(P.map(x=>x.c).filter(nn));
 let tr='داده‌ی کافی برای روند وجود ندارد',tc='#8a7aa6';if(P.length>=4){const h=Math.floor(P.length/2),a=mean(P.slice(0,h).map(x=>x.v)),b=mean(P.slice(h).map(x=>x.v)),df=b-a;tc=df>=.3?'#1a8f55':df<=-.3?'#d12f35':'#8a7aa6';tr=(df>=.3?'📈 رو به رشد':df<=-.3?'📉 رو به افت':'➖ تقریباً ثابت')+' ('+(df>0?'+':'')+fx(df)+')'}
 const ym=d.yr.filter(r=>r.v!=null),best=ym.length?ym.reduce((a,b)=>b.v>a.v?b:a):null,low=ym.length?ym.reduce((a,b)=>b.v<a.v?b:a):null;
 const note=ov==null?'هنوز آزمونی برای این دانش‌آموز ثبت نشده است.':'میانگین کل '+fx(ov)+' از ۴ است'+(oc!=null?'؛ '+(ov-oc>.05?'بالاتر از':ov-oc<-.05?'پایین‌تر از':'برابر با')+' میانگین کلاس ('+fx(oc)+').':'.')+(best&&low&&best.l!==low.l?' بهترین ماه: '+best.l+' ('+fx(best.v)+')، پایین‌ترین ماه: '+low.l+' ('+fx(low.v)+').':'');
 const cs=(S.courses||[]).map(c=>{const a=P.filter(x=>x.cid===c.id);return a.length?{n:c.name,v:mean(a.map(x=>x.v)),c:mean(a.map(x=>x.c).filter(nn))}:null}).filter(Boolean);
 const sc=window.schoolFull?schoolFull():'',pr=S.prof||{};
 return `<div data-pb><div style="display:flex;gap:12px;align-items:center;border-bottom:3px solid #7e57c2;padding-bottom:8px">${s.photo?`<img src="${s.photo}" style="width:64px;height:64px;border-radius:14px;object-fit:cover">`:'<div style="font-size:42px">👤</div>'}<div style="flex:1"><div style="font-size:12px;color:#6b5f8a">${q(sc)}</div><b style="font-size:20px">📊 نمودار پیشرفت تحصیلی — ${q(s.name)}</b><div style="font-size:12px;color:#6b5f8a">${pr.grade?'پایه '+q(pr.grade)+' · ':''}آموزگار: ${q(pr.teacher||'—')} · تاریخ گزارش: ${fmt(tdy())}</div></div></div>
 <div class="pck"><div><b style="color:${colr(ov)}">${fx(ov)}</b><span>میانگین کل (از ۴)</span></div><div><b>${fx(oc)}</b><span>میانگین کلاس</span></div><div><b style="font-size:15px;color:${tc}">${tr}</b><span>روند کلی</span></div><div><b>${fa(P.length)}</b><span>آزمون ثبت‌شده</span></div></div><div class="pcn">${q(note)}</div></div>
 <div data-pb><h3>📅 روند سالانه (ماه‌به‌ماه)</h3>${chart(d.yr,'y')}${tbl(d.yr,1)}<div class="pcn" style="color:#6b5f8a">خط بنفش: دانش‌آموز · خط خاکستری چین‌دار: میانگین کلاس</div></div>
 <div data-pb><h3>🗓️ روند ماهانه — ${MN[SM-1]} (روز‌به‌روز)</h3>${chart(d.mo,'m')}${tbl(d.mo)}</div>
 <div data-pb><h3>📆 روند هفتگی — ${wl(SW)}</h3>${chart(d.wk,'w')}${tbl(d.wk)}</div>
 <div data-pb><h3>📚 میانگین به تفکیک درس</h3>${cs.length?cs.map(r=>`<div class="pcb"><span>${q(r.n)}</span><i><u style="width:${r.v/4*100}%;background:${colr(r.v)}"></u>${r.c!=null?`<s style="right:${r.c/4*100}%"></s>`:''}</i><b style="color:${colr(r.v)}">${fx(r.v)}</b></div>`).join('')+'<div class="pcn" style="color:#6b5f8a">نوار رنگی: دانش‌آموز · خط سیاه: میانگین کلاس</div>':'<div class="pcn">داده‌ای ثبت نشده است.</div>'}${window.sigRow?sigRow('margin-top:18px'):''}</div>`}
function draw(){const e=$('pcSheet');if(e)e.innerHTML=sheet()}
function open(id){CID=id;const P=pts(id),last=P.length?P[P.length-1].d:iso(tdy()),Y=typeof SY!=='undefined'?SY:jp(tdy()).y,p=jp(D(last));SM=MS.indexOf(p.m)>=0?p.m:7;SW=wkS(last);
 let o=$('pcO');if(o)o.remove();o=document.createElement('div');o.id='pcO';o.className='pco';
 o.innerHTML=`<div class="pcbar"><b>📊 نمودار پیشرفت</b><select id="pc_m">${MS.map(m=>`<option value="${m}"${m===SM?' selected':''}>ماه: ${MN[m-1]}</option>`).join('')}</select><select id="pc_w">${weeks(P).map(k=>`<option value="${k}"${k===SW?' selected':''}>هفته: ${wl(k)}</option>`).join('')}</select><button class="sm" id="pc_pdf">📄 دریافت PDF</button><button class="sm" id="pc_pr">🖨️ چاپ</button><button class="sm" id="pc_x">✖ بستن</button><span class="sub" id="pc_msg" style="margin:0"></span></div><div class="pcs" id="pcSheet"></div>`;
 document.body.appendChild(o);draw()}
const msg=t=>{const m=$('pc_msg');if(m)m.textContent=t};
const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)});
async function libs(){if(!window.html2canvas)await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').catch(()=>load('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'));if(!window.jspdf)await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').catch(()=>load('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'))}
async function pdf(){const sh=$('pcSheet'),s=S.students.find(x=>x.id===CID);if(!sh||!s)return;msg('⏳ در حال ساخت PDF…');let host=null;
 try{const X=window.__pdfx;if(!X)throw new Error('ابزار PDF برنامه در دسترس نیست');
  await X.pdfLibs();try{await document.fonts.ready}catch(e){}
  host=document.createElement('div');host.className='pcs pdfc noanim';host.style.cssText='position:fixed;left:-99999px;top:0;width:794px;max-width:794px;margin:0';document.body.appendChild(host);
  window.__pcH=165;try{host.innerHTML=sheet()}finally{window.__pcH=0}
  await Promise.all([...host.querySelectorAll('img')].map(m=>m.complete?0:new Promise(r=>{m.onload=m.onerror=r})));await new Promise(r=>setTimeout(r,60));
  const blocks=[...host.querySelectorAll('[data-pb]')].filter(b=>!/در این بازه آزمونی ثبت نشده/.test(b.textContent));
  const cvs=[];for(const b of blocks)cvs.push(await X.rast(b));
  const doc=new (window.jspdf?window.jspdf.jsPDF:X.MiniPDF)({unit:'mm',format:'a4'}),W0=190,G=2,PH=277,hs=cvs.map(c=>c.height*W0/c.width),tot=hs.reduce((a,b)=>a+b,0)+G*Math.max(0,hs.length-1);
  const k=tot>PH&&tot<=PH/.7?(PH-.5)/tot:1;let y=10;/* اگر کمی بیشتر از یک صفحه بود، برای جا شدن در یک صفحه کمی کوچک می‌شود */
  cvs.forEach((cv,i)=>{const w=W0*k,h=hs[i]*k;if(y+h>287.5&&y>10){doc.addPage();y=10}doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',10+(W0-w)/2,y,w,h);y+=h+G*k});
  const nm='نمودار پیشرفت '+s.name.replace(/[\\\/:*?"<>|]/g,'')+'.pdf',ok=await window.dlFile(nm,doc.output('arraybuffer'));
  msg(ok?'✅ PDF ساخته شد':'⚠️ PDF ساخته شد ولی این محیط اجازه‌ی دانلود نمی‌دهد. برنامه را از آدرس سایت در Chrome باز کنید یا از «چاپ» استفاده کنید.')}
 catch(x){msg('❌ ساخت PDF ناموفق بود'+(x&&x.message?' ('+x.message+')':'')+'. از دکمه‌ی «چاپ» و گزینه‌ی ذخیره به‌صورت PDF استفاده کنید.')}
 finally{window.__pcH=0;if(host)host.remove()}}
document.addEventListener('click',e=>{const t=e.target;if(t.closest&&t.closest('#sfb [data-a="g"]')){open(window.__sfid);return}if(t.id==='pc_x'){const o=$('pcO');if(o)o.remove()}else if(t.id==='pc_pdf')pdf();else if(t.id==='pc_pr')window.print()});
document.addEventListener('change',e=>{if(e.target.id==='pc_m'){SM=+e.target.value;draw()}else if(e.target.id==='pc_w'){SW=e.target.value;draw()}});
}catch(e){console.warn('chart',e)}})();

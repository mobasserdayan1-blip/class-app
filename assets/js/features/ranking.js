/* رده‌بندی */
(function(){
const $=id=>document.getElementById(id);let all=false;
const f=v=>v==null?'—':fa((Math.round(v*10)/10).toString().replace('.','٫'));
window.rkM=m=>{all=m==='all';renderRank()};
renderRank=function(){try{$('hsub').textContent=(typeof profLine==='function'&&profLine())||'رقابت سالم، پیشرفت بی‌نهایت ✨'}catch(e){}
 const st=S.students,ex=(S.exams||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const ov=id=>mean(S.courses.map(c=>cAvg(id,c.id,S.exams)).filter(nn));
 const gr=id=>{const v=ex.map(e=>nrm(e,id)).filter(nn);if(v.length<2)return null;const h=Math.floor(v.length/2),a=mean(v.slice(0,h)),b=mean(v.slice(h));return{d:b-a,p:a>0?Math.round((b-a)/a*100):null}};
 const R=st.map(s=>({s,g:gr(s.id),a:ov(s.id)}));
 const IMP=R.filter(x=>x.g&&x.g.p!=null&&x.g.d>0).sort((x,y)=>y.g.p-x.g.p);
 const TOP=R.filter(x=>x.a!=null).sort((x,y)=>y.a-x.a);
 const md=['🥇','🥈','🥉'],sg=p=>'\u2066'+(p>0?'+':'')+fa(p)+'٪\u2069';
 $('rkc').innerHTML=`<button class="${all?'':'on'}" onclick="rkM('top')">🏆 سکوهای قهرمانی</button><button class="${all?'on':''}" onclick="rkM('all')">👁 فهرست کامل (فقط معلم)</button>`;
 const q=$('rkq');if(q)q.style.display='none';
 const pod=(L,txt)=>L.length?`<div class="rkp">${[1,0,2].map(i=>{const r=L[i];return r?`<div class="p${i+1}"><span class="mdl">${md[i]}</span>${window.stAv?stAv(r.s,i?44:54):''}<b>${esc2(r.s.name)}</b><em>${txt(r)}</em></div>`:''}).join('')}</div>`:'';
 const bars=(L,val,max,txt,col)=>L.map((r,k)=>`<div style="display:flex;align-items:center;gap:8px;margin:7px 0;font-size:13px"><span style="width:20px;text-align:center">${fa(k+4)}</span><span style="flex:0 0 30%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc2(r.s.name)}</span><u style="flex:1;height:10px;border-radius:10px;background:var(--line);overflow:hidden;display:block;text-decoration:none"><i style="display:block;height:100%;width:${Math.max(4,Math.round(val(r)/max*100))}%;background:${col};border-radius:10px"></i></u><b style="flex:0 0 46px;text-align:left">${txt(r)}</b></div>`).join('');
 const sec=(title,sub,L,val,txt,col)=>`<div style="margin-bottom:18px"><b style="font-size:15px">${title}</b><p class="sub" style="margin:2px 0 8px">${sub}</p>${L.length?pod(L.slice(0,3),txt)+bars(L.slice(3,5),val,Math.max(1,...L.slice(0,5).map(val)),txt,col):'<p class="tem">هنوز داده‌ی کافی نیست؛ پس از ثبت چند ارزیابی نمایش داده می‌شود.</p>'}</div>`;
 if(all){const A=R.filter(x=>x.a!=null||x.g).sort((x,y)=>((y.g&&y.g.p)||-999)-((x.g&&x.g.p)||-999));
  $('tbl').innerHTML=A.map(x=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--line)">${window.stAv?stAv(x.s,36):''}<div style="flex:1;min-width:0"><b>${esc2(x.s.name)}</b><small style="display:block;color:var(--mut)">میانگین: ${f(x.a)}</small></div><b style="color:${x.g&&x.g.d>0?'#1a8f55':x.g&&x.g.d<0?'#e5484d':'inherit'}">${x.g&&x.g.p!=null?sg(x.g.p):'—'}</b></div>`).join('')+'<p class="sub" style="margin:8px 0 0">این فهرست کامل فقط برای معلم است؛ آن را به دانش‌آموزان نشان ندهید.</p>'}
 else $('tbl').innerHTML=sec('🚀 قهرمانان پیشرفت','درصد پیشرفت نسبت به ارزیابی‌های قبلیِ خودِ هر دانش‌آموز',IMP,r=>r.g.p,r=>sg(r.g.p),'#2eaf6b')+sec('🏆 دانش‌آموزان برتر','بر اساس میانگین ارزیابی (از ۴)',TOP,r=>r.a,r=>f(r.a),'#7e57c2');
 $('rklg').textContent='هر دانش‌آموز می‌تواند در سکوی پیشرفت بیاید، چون فقط با خودش مقایسه می‌شود. در هر سکو فقط ۵ نفر اول دیده می‌شوند.'};
try{renderRank()}catch(e){console.warn('rank',e)}
})();

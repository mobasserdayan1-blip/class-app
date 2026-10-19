/* مدیریت کلاس‌ها */
(function(){
window.clsOK=id=>{try{const a=JSON.parse(localStorage.getItem('schAcc')||'null');if(!a||a.role!=='teacher'||String(id)==='9999001')return true;return (a.ids||[]).map(String).includes(String(id))}catch(e){return true}};
const VC=()=>S.classes.filter(c=>window.clsOK(c.id));
const $=id=>document.getElementById(id),E=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),META=['classes','cur','stash','archive','glib'],SH=['school','principal','city','logo','stype'];
let mg=false;if(!S.classes||!S.classes.length){S.classes=[{id:1}];S.cur=1;S.stash={};mg=true}if(!S.stash)S.stash={};if(!S.cur)S.cur=S.classes[0].id;if(mg)save();
const gOrd=g=>{const i=GR.indexOf(g);return i<0?9:i};
const meta=c=>{const a=c.id===S.cur,P=a?S.prof:c,T=a?null:(S.stash[c.id]||{});return{g:P.grade,s:P.sec,t:P.teacher,n:a?S.students.length:((T.students)||[]).length}};
const lab=c=>{const m=meta(c);return c.name||(m.g?'پایه '+m.g+(m.s?' ('+m.s+')':''):'کلاس '+fa(S.classes.indexOf(c)+1))};
window.clsLab=c=>bidi(lab(c));window.clsMeta=meta;function fillSel(){const s=$('clsSel');s.innerHTML=VC().map(c=>`<option value="${c.id}"${c.id===S.cur?' selected':''}>🏫 ${E(lab(c))}${meta(c).t?' · 👩‍🏫 '+E(String(meta(c).t).slice(0,18)):''} · ${fa(meta(c).n)} نفر</option>`).join('')+'<option value="__m">⚙️ مدیریت کلاس‌ها…</option>'}
window.switchCls=id=>{if(id===S.cur||!S.stash[id]||!window.clsOK(id))return;try{window.histPush&&window.histPush(localStorage.getItem('cl1'))}catch(x){}
 const oc=S.classes.find(c=>c.id===S.cur);if(oc){oc.grade=S.prof.grade;oc.sec=S.prof.sec;oc.teacher=S.prof.teacher}
 const old={};Object.keys(S).forEach(k=>{if(META.indexOf(k)<0)old[k]=S[k]});const sh={};SH.forEach(k=>{if(S.prof[k]!==undefined)sh[k]=S.prof[k]});
 const stash=S.stash;stash[S.cur]=old;const nx=stash[id];delete stash[id];const ns=Object.assign({classes:S.classes,cur:id,stash,archive:S.archive,glib:S.glib},nx);ns.prof=Object.assign({},ns.prof||{},sh);
 localStorage.setItem('cl1',JSON.stringify(ns));localStorage.setItem('cl1_ts',Date.now());sessionStorage.setItem('goto',window.__goto||'cls');window.__goto=null;try{sessionStorage.setItem('cl_skip',Date.now())}catch(x){}window.cloudPush&&window.cloudPush();Promise.resolve(window.__flushStore&&window.__flushStore()).then(()=>setTimeout(()=>location.reload(),150))};
$('clsSel').onchange=e=>{const v=e.target.value;if(v==='__m'){fillSel();show('cls')}else{window.__goto='home';window.switchCls(+v)}};
const grOpts='<option value="">پایه</option>'+GR.map(g=>`<option value="${g}">پایه ${g}</option>`).join('');
window.renderCls=()=>{fillSel();const by={};VC().forEach(c=>{const g=meta(c).g||'';(by[g]=by[g]||[]).push(c)});let tot=0;VC().forEach(c=>tot+=meta(c).n);
 const sc=S.prof.school?schoolFull():'مدرسه (نام را در «اطلاعات مدرسه و پایه» بنویسید)';
 let h=`<div class="card"><b style="font-size:17px">🏫 ${E(sc)}</b><p class="sub" style="margin:4px 0 0;text-align:right">${fa(VC().length)} کلاس · ${fa(tot)} دانش‌آموز</p>`;
 if(window._opG===undefined){const cu=S.classes.find(c=>c.id===S.cur);window._opG=cu?(meta(cu).g||''):null}Object.keys(by).sort((a,b)=>gOrd(a)-gOrd(b)).forEach(g=>{const op=window._opG===g;h+=`<div class="cgr acc${op?' open':''}"><button class="cgh" data-gh="${E(g)}"><span>📚 ${g?'پایه '+E(g):'بدون پایه'}</span><small>${fa(by[g].length)} کلاس</small><i>⌄</i></button><div class="cgw"><div class="cgi">`+by[g].map(c=>{const m=meta(c),a=c.id===S.cur;return `<div class="crow${a?' on':''}"><div><b>${E(lab(c))}</b><small>آموزگار: ${m.t?E(m.t):'<b style="color:#d9534f">⚠️ ثبت نشده (اجباری)</b>'} · ${fa(m.n)} نفر</small></div>${a?'<span>✅ فعال</span>':`<span style="display:flex;gap:6px"><button data-sw="${c.id}">باز کردن</button><button class="dl" data-cd="${c.id}">🗑</button></span>`}</div>`}).join('')+'</div></div></div>'});
 h+=`</div><div class="card"><b>➕ افزودن کلاس جدید</b><div class="cadd" style="margin-top:8px"><select id="cl_g" class="fs">${grOpts}</select><input id="cl_s" placeholder="شعبه (مثلاً الف)"></div><button class="big" id="cl_a" style="font-size:15px;padding:12px;margin-top:8px">➕ افزودن کلاس</button><p class="sub" id="cl_m"></p><p class="sub" style="margin:0">هر کلاس دانش‌آموزان، حضور و غیاب، درس‌ها، آزمون‌ها و گزارش‌های جداگانه دارد. کلاس فعال را از بالای صفحه عوض کنید. پس از ساخت، کلاس خودکار باز می‌شود تا نام آموزگار (اجباری) را در «اطلاعات مدرسه و پایه» ثبت کنید.</p></div>`;
 $('clsb').innerHTML=h};
$('clsb').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.gh!==undefined){const g=t.dataset.gh,gr=t.closest('.cgr'),was=gr.classList.contains('open');$('clsb').querySelectorAll('.cgr.open').forEach(x=>x.classList.remove('open'));if(!was)gr.classList.add('open');window._opG=was?null:g;return}
 if(t.dataset.sw)window.switchCls(+t.dataset.sw);
 else if(t.dataset.cd){if(!window.tap2(t))return;const id=+t.dataset.cd;delete S.stash[id];S.classes=S.classes.filter(c=>c.id!==id);save();renderCls()}
 else if(t.id==='cl_a'){const g=$('cl_g').value;if(!g){$('cl_m').textContent='ابتدا پایه را انتخاب کنید';return}const id=Date.now();S.classes.push({id,grade:g,sec:$('cl_s').value.trim(),teacher:''});
  S.stash[id]={students:[],drawn:[],att:{},closed:{},exams:[],courses:[],info:{},hwl:[],notes:{},desc:{},bin:[],activities:[],tnm:[],ai:{},prof:{grade:g,sec:$('cl_s').value.trim(),teacher:''}};save();
  try{sessionStorage.setItem('needTeacher',String(id))}catch(x){}
  $('cl_m').textContent='✅ کلاس ساخته شد؛ در حال باز کردن برای ثبت نام آموزگار…';window.__goto='prof';window.switchCls(id)}});
function moveStu(id,to){const s=S.students.find(x=>x.id===id),T=S.stash[to];if(!s||!T)return;T.students=T.students||[];
 let nid=id;while(T.students.some(x=>x.id===nid))nid=Date.now()+Math.floor(Math.random()*1000);
 T.students.push(Object.assign({},s,{id:nid,team:(T.students.length)%Math.max(1,T.nt||3)+1}));
 if(S.info[id]){T.info=T.info||{};T.info[nid]=S.info[id]}if(S.notes[id]){T.notes=T.notes||{};T.notes[nid]=S.notes[id]}if(S.desc[id]){T.desc=T.desc||{};T.desc[nid]=S.desc[id]}
 T.att=T.att||{};Object.keys(S.att).forEach(k=>{if(S.att[k][id]){(T.att[k]=T.att[k]||{})[nid]=S.att[k][id];delete S.att[k][id]}});T.attx=T.attx||{};Object.keys(S.attx||{}).forEach(k=>{if((S.attx[k]||{})[id]!==undefined){(T.attx[k]=T.attx[k]||{})[nid]=S.attx[k][id];delete S.attx[k][id]}});
 S.students=S.students.filter(x=>x.id!==id);delete S.info[id];delete S.notes[id];delete S.desc[id];S.drawn=(S.drawn||[]).filter(x=>x!==id);save();$('spro').classList.remove('open');render()}
document.addEventListener('click',e=>{const t=e.target;if(!t.dataset)return;
 if(t.dataset.a==='mv'&&t.closest('#sfb')){const id=window.__sfid,o=VC().filter(c=>c.id!==S.cur);$('spro').innerHTML='<div class="box"><b>🔀 انتقال به کدام کلاس؟</b><p class="sub">مشخصات، یادداشت‌ها و حضور و غیاب منتقل می‌شود؛ نمره‌های آزمون در کلاس فعلی می‌ماند (درس‌های دو کلاس یکی نیست).</p>'+o.map(c=>`<button data-mvto="${c.id}" data-sid="${id}">${E(lab(c))}</button>`).join('')+'<button id="spx">انصراف</button></div>';$('spro').classList.add('open')}
 if(t.dataset.mvto)moveStu(+t.dataset.sid,+t.dataset.mvto)});
fillSel();
const g=sessionStorage.getItem('goto');if(g){sessionStorage.removeItem('goto');const q0=sessionStorage.getItem('sf_q');if(q0){sessionStorage.removeItem('sf_q');$('sfq').value=q0}show(g)}
})();

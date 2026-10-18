/* فهرست مبحث‌های اختصاصی هر کلاس */
(function(){try{
const $=id=>document.getElementById(id),cp=o=>JSON.parse(JSON.stringify(o||[]));
const lib=()=>{S.glib=S.glib||{};const g=S.prof&&S.prof.grade;if(!g)return null;return S.glib[g]=S.glib[g]||{}};
const used=c=>(S.exams||[]).some(x=>x.course===c.id&&(x.ch||x.tp));
function sync(){const L=lib();if(!L)return false;let ch=false;S.courses=S.courses||[];
 S.courses.forEach(c=>{if(!L[c.name]&&((c.ch||[]).length||c.book)){L[c.name]={book:c.book||'',ch:cp(c.ch),v:Date.now()};c.lv=L[c.name].v;ch=true}});
 Object.keys(L).forEach(n=>{const e=L[n];let c=S.courses.find(q=>q.name===n);
  if(!c){c={id:Date.now()+Math.floor(Math.random()*1e6),name:n,book:e.book||''};S.courses.push(c);ch=true}
  if(!c.book&&e.book){c.book=e.book;ch=true}
  if(!c.custom&&c.lv!==e.v&&!used(c)){c.ch=cp(e.ch);c.lv=e.v;ch=true}});
 return ch}
const cur=()=>{const n=($('pt_c')||{}).value;return n?S.courses.find(q=>q.name===n):null};
function stat(){const m=$('pt_st'),c=cur(),L=lib();if(!m)return;m.textContent=!c||!L?'':(c.custom?'✏️ نسخه‌ی اختصاصی این کلاس (فقط همین کلاس تغییر می‌کند)':'📌 مطابق مرجع پایه‌ی '+S.prof.grade)}
function afterSave(){const c=cur(),L=lib(),m=$('pt_m');if(!c||!L)return;
 if(!L[c.name]){const v=Date.now();L[c.name]={book:c.book||'',ch:cp(c.ch),v};c.lv=v;c.custom=false;if(m)m.textContent+=' · به‌عنوان مرجع پایه‌ی '+S.prof.grade+' ثبت شد'}
 else{c.custom=true;if(m)m.textContent+=' · نسخه‌ی اختصاصی این کلاس (مرجع پایه تغییر نکرد)'}
 save();stat()}
const b=$('pt_s');if(b){b.addEventListener('click',()=>setTimeout(afterSave,0));
 const w=document.createElement('div');w.innerHTML='<p class="sub" id="pt_st" style="text-align:right;margin:6px 0;font-weight:700"></p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="sm" id="pt_ref" style="flex:1">📌 ثبت به‌عنوان مرجع پایه</button><button class="sm" id="pt_rs" style="flex:1">↩️ بازگشت به مرجع پایه</button></div><p class="sub" style="text-align:right;margin:6px 0">ℹ️ مرجع پایه برای همه‌ی کلاس‌های همان پایه (از جمله کلاس‌های جدید) خودکار اعمال می‌شود. «ذخیره‌ی فهرست» فقط نسخه‌ی همین کلاس را عوض می‌کند.</p>';b.after(w);
 $('pt_ref').type=$('pt_rs').type='button';
 const say=t=>{const m=$('pt_m');if(m)m.textContent=t};
 $('pt_ref').addEventListener('click',()=>{try{const n=$('pt_c').value,L=lib();if(!n||!L){say('ابتدا پایه‌ی کلاس را در همین صفحه انتخاب کنید');return}
  if(L[n]&&!confirm('مرجع پایه‌ی '+S.prof.grade+' برای «'+n+'» با فهرست این کلاس جایگزین شود؟'))return;
  $('pt_s').click();setTimeout(()=>{const c=S.courses.find(q=>q.name===n);if(!c){say('درس «'+n+'» پیدا نشد');return}const v=Date.now();L[n]={book:c.book||'',ch:cp(c.ch),v};c.lv=v;c.custom=false;save();stat();say('✅ مرجع پایه‌ی '+S.prof.grade+' برای «'+n+'» ثبت شد؛ کلاس‌های دیگر هنگام باز شدن آن را می‌گیرند')},30)}catch(e){say('خطا: '+e.message)}});
 $('pt_rs').addEventListener('click',()=>{try{const n=$('pt_c').value,L=lib();if(!n||!L||!L[n]){say('برای این درس هنوز مرجع پایه ثبت نشده؛ ابتدا «ثبت به‌عنوان مرجع پایه» را بزنید');return}
  let c=S.courses.find(q=>q.name===n);if(!c){sync();c=S.courses.find(q=>q.name===n)}if(!c){say('درس پیدا نشد');return}
  if(used(c)&&!confirm('آزمون‌هایی به فصل/مبحث این درس وصل‌اند؛ پیوند آن‌ها پاک می‌شود. ادامه می‌دهید؟'))return;
  const ids=new Set();(c.ch||[]).forEach(h=>{ids.add(h.id);(h.tp||[]).forEach(t=>ids.add(t.id))});S.exams.forEach(x=>{if(x.course===c.id&&(ids.has(x.ch)||ids.has(x.tp))){delete x.ch;delete x.tp}});
  c.ch=cp(L[n].ch);if(L[n].book)c.book=L[n].book;c.lv=L[n].v;c.custom=false;save();window.render&&window.render();$('pt_t').value=(()=>{const o=[];(c.ch||[]).forEach(h=>{o.push(h.name);(h.tp||[]).forEach(t=>o.push('  '+t.name))});return o.join('\n')})();stat();say('✅ به مرجع پایه برگشت')}catch(e){say('خطا: '+e.message)}});
 $('pt_c').addEventListener('change',stat)}
const bk=$('cadd');if(bk)bk.addEventListener('click',()=>setTimeout(()=>{const L=lib();if(!L)return;S.courses.forEach(c=>{if(!L[c.name]){L[c.name]={book:c.book||'',ch:cp(c.ch),v:Date.now()};c.lv=L[c.name].v}});save()},0));
const pa=$('p_add');if(pa)pa.addEventListener('click',()=>setTimeout(()=>{if(sync()){save();window.render&&window.render()}stat()},80));
if(sync()){save();window.render&&window.render()}setTimeout(stat,100);
}catch(e){console.error('grade library',e)}})();

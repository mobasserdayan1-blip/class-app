/* ویرایشگر فصل‌ها و مبحث‌ها */
(function(){const $=id=>document.getElementById(id);
const names=()=>{const L=((window.__curr&&S.prof.grade)?window.__curr(S.prof.grade):[]).map(x=>x[0]);S.courses.forEach(c=>{if(!L.includes(c.name))L.push(c.name)});return L};
const ser=n=>{const c=S.courses.find(q=>q.name===n),o=[];((c&&c.ch)||[]).forEach(h=>{o.push(h.name);h.tp.forEach(t=>o.push('  '+t.name))});return o.join('\n')};
function fill(keep){const sel=$('pt_c'),L=names(),cur=keep&&sel.value;sel.innerHTML=L.length?L.map(n=>`<option>${n.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join(''):'<option value="">ابتدا پایه را انتخاب کنید یا درسی بسازید</option>';if(cur&&L.includes(cur))sel.value=cur;$('pt_t').value=sel.value?ser(sel.value):''}
const isT=l=>/^(\s+\S|[-•↳↲▪◦]\s*\S)/.test(l);
function apply(){const n=$('pt_c').value,m=$('pt_m'),txt=$('pt_t').value;if(!n){m.textContent='درس را انتخاب کنید';return}
 let c=S.courses.find(q=>q.name===n);const lines=txt.split(/\r?\n/);let P;
 if(lines.some(isT)){P=[];let cur=null;lines.forEach(l=>{if(!l.trim())return;const t=l.replace(/^[\s\-•↳↲▪◦]+/,'').trim();if(!t)return;if(isT(l)){if(!cur){cur={name:'فهرست کتاب',tp:[]};P.push(cur)}cur.tp.push(t)}else{cur={name:t,tp:[]};P.push(cur)}})}else P=window.parseToc(txt);
 if(!P.length&&c&&(c.ch||[]).length&&!confirm('فهرست خالی است؛ همه‌ی فصل‌ها و مبحث‌های این درس حذف می‌شود. ادامه می‌دهید؟'))return;
 if(!c){const cu=((window.__curr&&window.__curr(S.prof.grade))||[]).find(x=>x[0]===n);c={id:Date.now(),name:n,book:cu?cu[1]:''};S.courses.push(c)}
 const old=c.ch||[],keepCh=new Set(),keepTp=new Set();let k=0,nt=0;
 const nw=P.map(p=>{let h=old.find(x=>x.name===p.name&&!keepCh.has(x.id));if(!h)h={id:Date.now()+(k++),name:p.name,tp:[]};keepCh.add(h.id);const oldTp=h.tp||[],tp=[];p.tp.forEach(t=>{let q=oldTp.find(x=>x.name===t&&!keepTp.has(x.id));if(!q)q={id:Date.now()+500+(nt++)*3,name:t};keepTp.add(q.id);tp.push(q)});return{id:h.id,name:p.name,tp}});
 old.forEach(h=>{if(!keepCh.has(h.id))S.exams.forEach(x=>{if(x.ch===h.id){delete x.ch;delete x.tp}});h.tp.forEach(t=>{if(!keepTp.has(t.id))S.exams.forEach(x=>{if(x.tp===t.id){delete x.ch;delete x.tp}})})});
 c.ch=nw;save();window.render&&window.render();m.textContent='✅ ذخیره شد: '+nw.length+' فصل و '+nw.reduce((a,h)=>a+h.tp.length,0)+' مبحث';fill(true)}
$('pt_c').onchange=()=>{$('pt_t').value=ser($('pt_c').value)};$('pt_s').onclick=apply;
$('p_grade').addEventListener('change',()=>fill(true));$('p_add').addEventListener('click',()=>setTimeout(()=>fill(true),50));fill(false);
})();

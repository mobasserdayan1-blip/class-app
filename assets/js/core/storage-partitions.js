/* ذخیره‌سازی بخش‌بخش اطلاعات */
(function(){
const META=['classes','cur','stash','archive','glib'],P0='cl2_';
const LS=window.localStorage,SP=Storage.prototype,_g=SP.getItem,_s=SP.setItem,_r=SP.removeItem;
const R=k=>_g.call(LS,P0+k),W=(k,v)=>_s.call(LS,P0+k,v),D=k=>_r.call(LS,P0+k);
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function splitCls(c){
 const ops=Object.assign({},c),fl={};
 if(Array.isArray(c.students)){
  const info=Object.assign({},c.info||{});
  ops.students=c.students.map(s=>{
   if(!s||typeof s!=='object')return s;
   const k=String(s.id),f={};let h=false;
   if(s.photo){f.p=s.photo;h=true}
   if(has(info,k)){f.i=info[k];delete info[k];h=true}
   if(h)fl[k]=f;
   if(!s.photo)return s;
   const t=Object.assign({},s);delete t.photo;return t});
  if(c.info!==undefined)ops.info=info;
 }
 if(c.prof&&c.prof.logo){ops.prof=Object.assign({},c.prof);delete ops.prof.logo;fl._l=c.prof.logo}
 return{ops,fl};
}
function joinCls(ops,fl){
 if(!ops||!fl)return ops;
 const c=Object.assign({},ops);let inf=null;
 if(Array.isArray(c.students)){
  c.students=c.students.map(s=>{
   const f=s&&typeof s==='object'?fl[String(s.id)]:null;if(!f)return s;
   if(f.i!==undefined){inf=inf||Object.assign({},c.info||{});inf[String(s.id)]=f.i}
   return f.p?Object.assign({},s,{photo:f.p}):s});
  if(inf)c.info=inf;
 }
 if(fl._l)c.prof=Object.assign({},c.prof||{},{logo:fl._l});
 return c;
}
function split(o){
 const a={};Object.keys(o).forEach(k=>{if(META.indexOf(k)<0)a[k]=o[k]});
 const P={meta:JSON.stringify({classes:o.classes||[],cur:o.cur,archive:o.archive||{},glib:o.glib||{}})},F={};
 const add=(id,c)=>{const r=splitCls(c||{});P['c'+id]=JSON.stringify(r.ops);if(Object.keys(r.fl).length)F['s'+id]=JSON.stringify(r.fl)};
 add(o.cur,a);Object.keys(o.stash||{}).forEach(id=>add(id,o.stash[id]));
 return Object.assign(P,F);
}
function join(g,ids){
 const me=g('meta'),ns={classes:me.classes,cur:me.cur,archive:me.archive,glib:me.glib||{},stash:{}};
 const one=id=>{const c=g('c'+id);if(c===undefined)throw new Error('missing c'+id);return joinCls(c,g('s'+id))};
 Object.assign(ns,one(me.cur));
 ids.forEach(id=>{if(String(id)!==String(me.cur))ns.stash[id]=one(id)});
 return ns;
}
let active=false,cache=null,mem={},warned=0;
window.__auto=true;['pointerdown','keydown','touchstart','change','input'].forEach(ev=>addEventListener(ev,()=>{window.__auto=false},{capture:true,once:true,passive:true}));
const note=m=>{const t=Date.now();if(t-warned<20000)return;warned=t;try{alert(m)}catch(e){}};
function assemble(){
 const m=R('m'),ix=R('idx');if(m==null||ix==null)return null;
 const names=JSON.parse(ix).n,newMem={};
 const g=n=>{const v=R(n);if(v==null)return undefined;newMem[n]=v;return JSON.parse(v)};
 newMem.meta=m;const me=JSON.parse(m);
 const ids=names.filter(n=>n[0]==='c').map(n=>n.slice(1));
 const o=join(n=>n==='meta'?me:g(n),ids);
 mem=newMem;mem.__idx=ix;
 return JSON.stringify(o);
}
function writeAll(P){
 const names=Object.keys(P),undo=[];
 try{
  names.forEach(n=>{const key=n==='meta'?'m':n;if(mem[n]===P[n])return;undo.push([key,R(key)]);W(key,P[n])});
  const ni=JSON.stringify({n:names});
  if(mem.__idx!==ni){undo.push(['idx',R('idx')]);W('idx',ni)}
 }catch(e){
  undo.reverse().forEach(([k,old])=>{try{old==null?D(k):W(k,old)}catch(x){}});
  throw e}
 const old=mem.__idx?JSON.parse(mem.__idx).n:[];
 old.forEach(n=>{if(!(n in P)){try{D(n==='meta'?'m':n)}catch(x){}}});
 const nm={};names.forEach(n=>nm[n]=P[n]);nm.__idx=JSON.stringify({n:names});mem=nm;
}
function commit(j){
 const P=split(JSON.parse(j));
 try{writeAll(P)}
 catch(e){
  let done=false;
  try{if(_g.call(LS,'cl1_legacy')!=null){_r.call(LS,'cl1_legacy');_r.call(LS,'cl1_legacy_t');writeAll(P);done=true}}catch(x){}
  if(!done){note('⚠️ حافظه‌ی این دستگاه پر است و تغییر آخر ذخیره نشد.\nهمین حالا از صفحه‌ی «پشتیبان و امنیت» پشتیبان بگیرید و فایل‌ها یا عکس‌های سنگین را کم کنید.');throw e}
 }
 cache=j;
}
function migrate(lg){
 const o=JSON.parse(lg);if(!o||!Array.isArray(o.students))throw new Error('bad');
 const want=JSON.stringify(o).length;let back;
 try{
  mem={};commit(lg);
  back=assemble();
  if(!back||back.length!==want)throw new Error('verify');
 }catch(e){
  try{const ix=R('idx');if(ix){JSON.parse(ix).n.forEach(n=>D(n==='meta'?'m':n));D('idx')}}catch(x){}
  mem={};throw e}
 try{_s.call(LS,'cl1_legacy',lg);_s.call(LS,'cl1_legacy_t',String(Date.now()))}catch(x){}
 _r.call(LS,'cl1');
 cache=back;
}
function init(){
 try{
  const a=assemble();
  if(a!=null){cache=a;active=true;return}
  const lg=_g.call(LS,'cl1');
  if(lg==null){cache=null;active=true;return}
  migrate(lg);active=true;
 }catch(e){active=false;window.__storErr=String(e&&e.message||e)}
 try{const t=+_g.call(LS,'cl1_legacy_t');if(t&&Date.now()-t>14*864e5){_r.call(LS,'cl1_legacy');_r.call(LS,'cl1_legacy_t')}}catch(x){}
}
init();
SP.getItem=function(k){if(this===LS&&k==='cl1'&&active)return cache;return _g.apply(this,arguments)};
SP.setItem=function(k,v){if(this===LS&&k==='cl1'&&active){commit(String(v));return}return _s.apply(this,arguments)};
SP.removeItem=function(k){if(this===LS&&k==='cl1'&&active){try{const ix=R('idx');if(ix)JSON.parse(ix).n.forEach(n=>D(n==='meta'?'m':n));D('idx')}catch(x){}cache=null;mem={};return}return _r.apply(this,arguments)};
addEventListener('storage',e=>{if(active&&e.key&&e.key.indexOf(P0)===0){try{const a=assemble();if(a!=null)cache=a}catch(x){}}});
function upgrade(){
 if(active)return'already';
 const lg=_g.call(LS,'cl1');if(lg==null)return'nodata';
 JSON.parse(lg);
 _r.call(LS,'cl1');
 try{mem={};commit(lg);const back=assemble();if(!back||back.length!==JSON.stringify(JSON.parse(lg)).length)throw new Error('verify');active=true;cache=back;return'ok'}
 catch(e){
  try{const ix=R('idx');if(ix){JSON.parse(ix).n.forEach(n=>D(n==='meta'?'m':n));D('idx')}}catch(x){}
  _s.call(LS,'cl1',lg);active=false;return'fail'}
}
function sizes(){
 const r=[];try{const ix=R('idx');if(ix)JSON.parse(ix).n.forEach(n=>{const v=R(n==='meta'?'m':n);r.push([n,v?v.length:0])})}catch(e){}
 return r}
window.__stor={split,join,splitCls,joinCls,upgrade,sizes,isActive:()=>active};
})();

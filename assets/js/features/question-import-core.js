/* هسته‌ی تشخیص سؤال از متن — محلی و بدون وابستگی آنلاین */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.QuestionImportCore=factory();
})(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const norm=s=>String(s||'').normalize('NFKC').replace(/[ي]/g,'ی').replace(/[ك]/g,'ک')
  .replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  .replace(/\s+/g,' ').trim().toLowerCase();
 const clean=s=>String(s||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').trim();
 const isQStart=s=>/^\s*(?:(?:سؤال|سوال|پرسش)\s*)?(?:\d{1,3}|[۰-۹٠-٩]{1,3})\s*[\].\-:：ـ،]\s*\S/.test(s);
 const stripStart=s=>clean(s).replace(/^\s*(?:(?:سؤال|سوال|پرسش)\s*)?(?:\d{1,3}|[۰-۹٠-٩]{1,3})\s*[\].\-:：ـ،]\s*/,'');
 function parse(text){
  const lines=String(text||'').replace(/\uFEFF/g,'').split(/\n/).map(clean).filter(Boolean);
  const starts=lines.map((line,i)=>isQStart(line)?i:-1).filter(i=>i>=0);
  const groups=[];
  if(starts.length){
   for(let n=0;n<starts.length;n++)groups.push(lines.slice(starts[n],starts[n+1]??lines.length));
  }else{
   const qlines=lines.map((line,i)=>/[؟?]\s*$/.test(line)?i:-1).filter(i=>i>=0);
   if(qlines.length){
    for(let n=0;n<qlines.length;n++)groups.push(lines.slice(qlines[n],qlines[n+1]??lines.length));
   }else if(lines.length) groups.push(lines);
  }
  return groups.map((g,i)=>{
   let q=[],op=[],ans=[],seenAnswer=false;
   for(let j=0;j<g.length;j++){
    let line=clean(j===0?stripStart(g[j]):g[j]);
    if(!line)continue;
    const am=/^(?:پاسخ|جواب|کلید پاسخ|پاسخ صحیح)\s*[:：\-]\s*(.*)$/i.exec(line);
    if(am){seenAnswer=true;if(am[1])ans.push(am[1]);continue}
    const om=/^(?:[\(\[]?(الف|ب|پ|ت|ث|ج|چ|ح|خ|د|ذ|ر|ز|ژ|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ک|گ|ل|م|ن|و|ه|ی|[a-dA-D]|[1-4۰-۴٠-٤])[\)\].:\-]|گزینه\s*(الف|ب|پ|ت|ث|ج|چ|ح|خ|د|ذ|ر|ز|ژ|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ک|گ|ل|م|ن|و|ه|ی))\s*(.*)$/i.exec(line);
    if(om){op.push(clean(om[3]||''));continue}
    if(seenAnswer)ans.push(line);else q.push(line);
   }
   const answer=clean(ans.join(' '));
   const labels=['الف','ب','پ','ت','ث','ج','چ','ح','خ','د'];
   let ok='';
   if(op.length>=2&&answer){
    const a=norm(answer).replace(/[\.،,\)\]]+$/,'');
    const li=labels.indexOf(a);
    if(li>=0&&li<op.length)ok=String(li+1);
    else if(/^[1-4۱-۴١-٤]$/.test(a))ok=String(Number(a.replace(/[۱-۴١-٤]/g,d=>({'۱':'1','۲':'2','۳':'3','۴':'4','١':'1','٢':'2','٣':'3','٤':'4'}[d]||d))));
    else {const oi=op.findIndex(x=>norm(x)===a);if(oi>=0)ok=String(oi+1)}
   }
   return {key:i+1,q:clean(q.join(' ')),op,ans:answer,ok,type:op.length>=2?'mc':'es',
    confidence:starts.length?'numbered':/[؟?]\s*$/.test(g[0])?'question-mark':'low'};
  }).filter(x=>x.q.length>=3);
 }
 function duplicateKey(q){return norm(q&&q.gr)+'|'+norm(q&&q.bk)+'|'+norm(q&&q.ls)+'|'+norm(q&&q.q)}
 return Object.freeze({norm,parse,duplicateKey});
});
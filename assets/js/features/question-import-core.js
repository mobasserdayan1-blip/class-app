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

 /* ===== ورود ساختاریافته (Word با عنوان‌ها + «س:» / «پ:») — نسخه‌ی ۱۱۴ ===== */
 const LV_MAP={'آسان':'e','متوسط':'m','سخت':'h'};
 const TYPE_MAP={'تشریحی':'es','کوتاهپاسخ':'sa','چندگزینهای':'mc','صحیح/غلط':'tf','صحیحغلط':'tf','جایخالی':'fb'};
 const tagKey=s=>String(s||'').replace(/[\u200c\u200f\u200e\s‌]/g,'').replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[‐-―ـ-]/g,'');
 const STOP_RE=/^\s*پایان\s*(?:سؤالات|سوالات|سوال‌ها|سؤال‌ها|سوالها|سؤالها)\s*[.:]?\s*$/;
 const OPT_RE=/^\s*[\(\[]?(الف|ب|ج|د|[a-dA-D]|[1-4۱-۴٠-٤])\s*[\)\]\.\-]\s*(\S.*)$/;
 const Q_RE=/^\s*س\s*[:：]\s*(.*)$/, A_RE=/^\s*پ\s*[:：]\s*(.*)$/;
 const digit=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
 function takeTags(text){
  let t=clean(text),lv='',type='',unknown=[];
  for(;;){
   const m=/\s*\[([^\[\]]{1,30})\]\s*$/.exec(t);if(!m)break;
   const k=tagKey(m[1]);
   if(LV_MAP[k]&&!lv)lv=LV_MAP[k];
   else if(TYPE_MAP[k]&&!type)type=TYPE_MAP[k];
   else {unknown.push(m[1]);break}
   t=t.slice(0,m.index);
  }
  return {text:clean(t),lv,type,unknown};
 }
 /* paras: [{h:0|1|2|3, t:'متن (می‌تواند چندخطی با \n باشد)'}]
    خروجی: {items:[{bk,ls,tp,q,ans,op,ok,type,lv,flags:[]}], warnings:[], ended:bool, mode:'sp'|'plain'} */
 function parseStructured(paras){
  const list=(paras||[]).map(p=>({h:p.h|0,t:String(p.t==null?'':p.t).replace(/\uFEFF/g,'')}));
  const hasSP=list.some(p=>!p.h&&p.t.split(/\n/).some(l=>Q_RE.test(l)));
  const items=[],warnings=[];let bk='',ls='',tp='',cur=null,ended=false,ansOpen=false;
  const push=()=>{if(cur){finish(cur);items.push(cur)}cur=null;ansOpen=false};
  function finish(c){
   c.q=clean(c.ql.join(' '));c.ans=clean(c.al.join(' '));delete c.ql;delete c.al;
   if(!c.type)c.type=c.op.length>=2?'mc':'es';
   c.ok='';
   if(c.type==='mc'&&c.op.length>=2&&c.ans){
    const a=norm(digit(c.ans)).replace(/[\.،,\)\]]+$/,''),labels=['الف','ب','ج','د'],li=labels.indexOf(a);
    if(li>=0&&li<c.op.length)c.ok=String(li+1);
    else if(/^[1-4]$/.test(a)&&+a<=c.op.length)c.ok=a;
    else{const oi=c.op.findIndex(x=>norm(x)===a);if(oi>=0)c.ok=String(oi+1)}
   }
   c.flags=[];
   if(c.q.length<3)c.flags.push('short');
   if(!c.ans&&c.type!=='mc')c.flags.push('noans');
   if(!bk&&!c.bk)c.flags.push('nobook');
   if(!c.ls)c.flags.push('nolesson');
  }
  function start(text,lineNo){
   push();
   const tg=takeTags(text);
   if(tg.unknown.length)warnings.push({line:lineNo,msg:'برچسب ناشناخته «['+tg.unknown[0]+']» در متن سؤال ماند: '+tg.text.slice(0,40)});
   cur={bk,ls,tp,ql:[tg.text],al:[],op:[],type:tg.type,lv:tg.lv,line:lineNo};
  }
  let lineNo=0;
  for(const p of list){
   if(ended)break;
   if(p.h){
    const name=clean(p.t.replace(/\n/g,' '));if(!name)continue;
    push();
    if(p.h===1){bk=name;ls='';tp=''}
    else if(p.h===2){ls=name;tp=''}
    else tp=name;
    continue;
   }
   for(const raw of p.t.split(/\n/)){
    lineNo++;
    const line=clean(raw);if(!line)continue;
    if(STOP_RE.test(line)){push();ended=true;break}
    if(hasSP){
     let m;
     if((m=Q_RE.exec(line))){start(m[1],lineNo);continue}
     if((m=A_RE.exec(line))){
      if(!cur){warnings.push({line:lineNo,msg:'پاسخ بدون سؤال نادیده گرفته شد: '+line.slice(0,40)});continue}
      ansOpen=true;if(m[1])cur.al.push(m[1]);continue}
     if(!cur)continue; /* متن اضافی قبل از اولین سؤال (عنوان فایل، توضیح) */
     if(ansOpen){cur.al.push(line);continue}
     const om=OPT_RE.exec(line);
     if(om){cur.op.push(clean(om[2]));continue}
     cur.ql.push(line);
    }else{
     /* قالب ساده: خط سؤال، خط بعد پاسخ */
     if(!bk&&!ls&&!cur&&!/[؟?]\s*$/.test(line)&&!isQStart(line))continue;
     if(isQStart(line)||/[؟?]\s*$/.test(line)&&(!cur||ansOpen||cur.al.length||!cur.ql.length)){start(stripStart(line),lineNo);continue}
     if(!cur){start(line,lineNo);continue}
     const om=OPT_RE.exec(line);
     if(om&&!ansOpen){cur.op.push(clean(om[2]));continue}
     ansOpen=true;cur.al.push(line);
    }
   }
  }
  push();
  return {items,warnings,ended,mode:hasSP?'sp':'plain'};
 }
 /* علامت‌گذاری تکراری‌ها داخل فایل و نسبت به بانک؛ existing: آرایه‌ی سؤال‌های بانک ({bk,ls,q}) */
 function markDuplicates(items,existing){
  const key=x=>norm(x.bk)+'|'+norm(x.ls)+'|'+norm(x.q);
  const seen=new Set((existing||[]).map(key));
  for(const it of items){
   const k=key(it);
   if(seen.has(k)){if(it.flags.indexOf('dup')<0)it.flags.push('dup')}else seen.add(k);
  }
  return items;
 }
 function duplicateKey(q){return norm(q&&q.gr)+'|'+norm(q&&q.bk)+'|'+norm(q&&q.ls)+'|'+norm(q&&q.q)}
 return Object.freeze({norm,parse,parseStructured,markDuplicates,duplicateKey});
});
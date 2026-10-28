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
 const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
 /* ----- شماره‌ی درس و محدوده‌ی صفحه از عنوان‌ها (نسخه‌ی ۱۱۵) ----- */
 const ORD_UNITS={'یکم':1,'اول':1,'دوم':2,'سوم':3,'چهارم':4,'پنجم':5,'ششم':6,'هفتم':7,'هشتم':8,'نهم':9};
 const ORD_ALL=Object.assign({'دهم':10,'یازدهم':11,'دوازدهم':12,'سیزدهم':13,'چهاردهم':14,'پانزدهم':15,'شانزدهم':16,'هفدهم':17,'هجدهم':18,'نوزدهم':19,'بیستم':20,'سیام':30},ORD_UNITS);
 const ORD_CAP='((?:(?:بیست|سی)[\\s\\u200c]*و?[\\s\\u200c]*(?:یکم|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم)|سی[\\s\\u200c]*ام|یازدهم|دوازدهم|سیزدهم|چهاردهم|پانزدهم|شانزدهم|هفدهم|هجدهم|نوزدهم|بیستم|دهم|یکم|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم))(?=$|[\\s:：\\-–—.،؛\\u200c])';
 function ordNum(w){const k=String(w||'').replace(/[\s\u200c]/g,'');if(ORD_ALL[k])return ORD_ALL[k];const m=/^(بیست|سی)و?(یکم|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم)$/.exec(k);return m?(m[1]==='بیست'?20:30)+ORD_UNITS[m[2]]:null}
 const PG_KEY='(?:صفحه[\\u200c\\s]*(?:ی|های|ها)?|صفحات|ص{1,2})';
 const PG_SEP='(?:-|–|—|تا|الی)';
 const PG_RE=new RegExp('(^|[\\s(\\[（\\-–—:،,])'+PG_KEY+'\\s*[:：.]?\\s*(\\d{1,4})(?:\\s*'+PG_SEP+'\\s*(\\d{1,4}))?(?=$|[\\s)\\]）\\-–—:،,.])');
 const PG_TAG_RE=new RegExp('^'+PG_KEY+'\\s*[:：.]?\\s*(\\d{1,4})(?:\\s*'+PG_SEP+'\\s*(\\d{1,4}))?$');
 const PG_BARE_RE=new RegExp('\\(\\s*(\\d{1,4})\\s*'+PG_SEP+'\\s*(\\d{1,4})\\s*\\)\\s*$');
 const tidy=s=>clean(s).replace(/^[\s:：\-–—.،؛]+|[\s:：\-–—.،؛]+$/g,'');
 /* «ص ۱۵ تا ۲۶» یا «صفحه‌ی ۱۵» یا «(۱۵-۲۶)» را از انتهای/میان عنوان جدا می‌کند → {text,p1,p2,bad} */
 function parsePagesIn(raw){
  const text=clean(raw),d=digit(text);let m=PG_RE.exec(d);
  if(m){
   const a=+m[2],b=m[3]!=null?+m[3]:a,pre=m[1]||'',start=m.index+pre.length,end=m.index+m[0].length;
   let before=text.slice(0,m.index+(/[(\[（]/.test(pre)?0:0)),after=text.slice(end);
   if(/[(\[（]/.test(pre))after=after.replace(/^\s*[)\]）]/,'');
   const rest=tidy((before+' '+after).replace(/\(\s*\)|\[\s*\]|（\s*）/g,' '));
   return b<a?{text:rest,p1:null,p2:null,bad:true}:{text:rest,p1:a,p2:b,bad:false};
  }
  m=PG_BARE_RE.exec(d);
  if(m){const a=+m[1],b=+m[2],rest=tidy(text.slice(0,m.index));return b<a?{text:rest,p1:null,p2:null,bad:true}:{text:rest,p1:a,p2:b,bad:false}}
  return {text:text,p1:null,p2:null,bad:false};
 }
 /* عنوان درس: «درس ۲: نام درس (ص ۱۵ تا ۲۶)» / «درس دوم - نام» / «۲- نام» → {name,ln,p1,p2,badPages} */
 function parseLessonHeading(raw){
  const pg=parsePagesIn(raw),text=pg.text,d=digit(text);let ln=null,name=text,m;
  if((m=/^درس\s*(?:شماره(?:[\u200c\s]*ی)?\s*)?(\d{1,3})(?=$|[\s:：\-–—.،؛)])\s*[:：\-–—.،؛)]*\s*/.exec(d))){ln=+m[1];name=text.slice(m[0].length)}
  else if((m=new RegExp('^درس\\s+'+ORD_CAP+'\\s*[:：\\-–—.،؛]*\\s*').exec(d))){ln=ordNum(m[1]);name=text.slice(m[0].length)}
  else if((m=/^(\d{1,3})\s*[\-–—.:：)]\s*(?=\S)/.exec(d))){ln=+m[1];name=text.slice(m[0].length)}
  /* نام درس همان متن عنوان (بدون بخش صفحه) می‌ماند تا کلید تکراری‌ها با سؤال‌های قبلاً واردشده یکی باشد */
  name=tidy(text);
  return {name,ln,p1:pg.p1,p2:pg.p2,badPages:pg.bad};
 }
 /* برچسب صفحه‌ی انتهای سؤال: [ص ۱۸] یا [ص ۱۸-۲۰] */
 function parsePageTag(inner){
  const m=PG_TAG_RE.exec(digit(clean(inner)));if(!m)return null;
  const a=+m[1],b=m[2]!=null?+m[2]:a;return b<a?{bad:true}:{p1:a,p2:b};
 }
 function takeTags(text){
  let t=clean(text),lv='',type='',unknown=[],pages=null;
  for(;;){
   const m=/\s*\[([^\[\]]{1,30})\]\s*$/.exec(t);if(!m)break;
   const pgt=parsePageTag(m[1]);
   if(pgt&&!pages){pages=pgt;t=t.slice(0,m.index);continue}
   const k=tagKey(m[1]);
   if(LV_MAP[k]&&!lv)lv=LV_MAP[k];
   else if(TYPE_MAP[k]&&!type)type=TYPE_MAP[k];
   else {unknown.push(m[1]);break}
   t=t.slice(0,m.index);
  }
  return {text:clean(t),lv,type,unknown,pages};
 }
 /* paras: [{h:0|1|2|3, t:'متن (می‌تواند چندخطی با \n باشد)'}]
    خروجی: {items:[{bk,ls,tp,ln,p1,p2,lp1,lp2,pov,q,ans,op,ok,type,lv,flags:[]}], warnings:[], ended:bool, mode:'sp'|'plain'}
    ln شماره‌ی درس (از عنوان ۲)، p1/p2 محدوده‌ی صفحه (برچسب [ص ..] سؤال > عنوان ۳ > عنوان ۲)، lp1/lp2 صفحه‌ی خودِ درس */
 function parseStructured(paras){
  const list=(paras||[]).map(p=>({h:p.h|0,t:String(p.t==null?'':p.t).replace(/\uFEFF/g,'')}));
  const hasSP=list.some(p=>!p.h&&p.t.split(/\n/).some(l=>Q_RE.test(l)));
  const items=[],warnings=[];let bk='',ls='',tp='',cur=null,ended=false,ansOpen=false;
  let ln=null,lp1=null,lp2=null,tp1=null,tp2=null,lsN=0,usedLn=new Set();
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
   cur={bk,ls,tp,ln,lp1,lp2,p1:tp1!=null?tp1:lp1,p2:tp1!=null?tp2:lp2,pov:tp1!=null,ql:[tg.text],al:[],op:[],type:tg.type,lv:tg.lv,line:lineNo};
   if(tg.pages){if(tg.pages.bad)warnings.push({line:lineNo,msg:'محدوده‌ی صفحه‌ی این سؤال معتبر نیست (عدد اول باید کوچک‌تر باشد): '+tg.text.slice(0,40)});else{cur.p1=tg.pages.p1;cur.p2=tg.pages.p2;cur.pov=true}}
  }
  let lineNo=0;
  for(const p of list){
   if(ended)break;
   if(p.h){
    const name=clean(p.t.replace(/\n/g,' '));if(!name)continue;
    push();
    if(p.h===1){bk=name;ls='';tp='';ln=null;lp1=lp2=tp1=tp2=null;lsN=0;usedLn=new Set()}
    else if(p.h===2){
     const hd=parseLessonHeading(name);lsN++;ls=hd.name;tp='';tp1=tp2=null;lp1=hd.p1;lp2=hd.p2;
     if(hd.badPages)warnings.push({line:lineNo,msg:'محدوده‌ی صفحه‌ی درس «'+ls+'» معتبر نیست؛ مثل «ص ۱۵ تا ۲۶» بنویس (عدد اول کوچک‌تر).'});
     if(hd.ln!=null)ln=hd.ln;
     else{ln=ln!=null?ln+1:lsN;warnings.push({line:lineNo,msg:'در عنوان «'+ls+'» شماره‌ی درس نبود؛ شماره‌ی '+fa(ln)+' در نظر گرفته شد. بهتر است «درس '+fa(ln)+': …» بنویسی.'})}
     if(usedLn.has(ln))warnings.push({line:lineNo,msg:'شماره‌ی درس '+fa(ln)+' در این کتاب تکراری است («'+ls+'»).'});
     usedLn.add(ln);
    }
    else{const hp=parsePagesIn(name);tp=hp.text||name;tp1=hp.bad?null:hp.p1;tp2=hp.bad?null:hp.p2}
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
 return Object.freeze({norm,parse,parseStructured,markDuplicates,duplicateKey,parseLessonHeading,parsePageTag,parsePagesIn});
});
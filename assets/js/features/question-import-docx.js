/* خواندن DOCX با حفظ سبک عنوان‌ها (Heading 1/2/3) — محلی، بدون وابستگی. نسخه‌ی ۱۱۴
   QuestionImportDocx.parse(arrayBuffer) → Promise<[{h:0..3, t:'متن پاراگراف (با \n برای Shift+Enter)'}]>
   پارامتر دوم اختیاری: {DOMParser, DecompressionStream} برای تست خارج از مرورگر. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.QuestionImportDocx=factory();
})(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const digits=s=>String(s||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
 async function parse(buf,env){
  env=env||{};const DP=env.DOMParser||(typeof DOMParser!=='undefined'?DOMParser:null);
  const DS=env.DecompressionStream||(typeof DecompressionStream!=='undefined'?DecompressionStream:null);
  if(!DP)throw Error('مرورگر این روش محلی خواندن DOCX را پشتیبانی نمی‌کند.');
  if(!DS)throw Error('مرورگر این روش محلی خواندن DOCX را پشتیبانی نمی‌کند. فایل را در Word با فرمت TXT ذخیره کنید.');
 async function zipReader(buf){
  const b=new Uint8Array(buf),v=new DataView(b.buffer,b.byteOffset,b.byteLength);
  let eocd=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--){if(v.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw Error('ساختار ZIP داخل فایل DOCX پیدا نشد. مطمئن شو فایل با پسوند docx ذخیره شده (نه doc قدیمی).');
  const count=v.getUint16(eocd+10,true);let p=v.getUint32(eocd+16,true);const map={};
  for(let i=0;i<count&&p+46<=b.length;i++){
   if(v.getUint32(p,true)!==0x02014b50)break;
   const method=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),el=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true);
   map[new TextDecoder().decode(b.slice(p+46,p+46+nl))]={method,cs,lo};p+=46+nl+el+cl;
  }
  return async name=>{
   const t=map[name];if(!t)return null;
   const nl=v.getUint16(t.lo+26,true),el=v.getUint16(t.lo+28,true),start=t.lo+30+nl+el,packed=b.slice(start,start+t.cs);let raw;
   if(t.method===0)raw=packed;
   else if(t.method===8){const stream=new Blob([packed]).stream().pipeThrough(new DS('deflate-raw'));raw=new Uint8Array(await new Response(stream).arrayBuffer())}
   else throw Error('روش فشرده‌سازی این DOCX پشتیبانی نمی‌شود.');
   return new TextDecoder('utf-8').decode(raw);
  };
 }
 const xmlDoc=xml=>{const d=new DP().parseFromString(xml,'application/xml');if(d.querySelector('parsererror'))throw Error('ساختار فایل Word معتبر نیست.');return d};
 const kids=(n,name)=>Array.from(n.childNodes).filter(c=>c.nodeType===1&&c.localName===name);
 /* سطح عنوان هر سبک: از نام سبک (Heading n / عنوان n)، outlineLvl، یا سبکِ پایه */
 function styleLevels(xml){
  const info={};if(xml){for(const st of kids(xmlDoc(xml).documentElement,'style')){
   const id=st.getAttribute('w:styleId')||'',nm=(kids(st,'name')[0]||{getAttribute(){return ''}}).getAttribute('w:val')||'';
   const ppr=kids(st,'pPr')[0],ol=ppr&&kids(ppr,'outlineLvl')[0],bo=kids(st,'basedOn')[0];
   let l=0;const m=/^heading\s*([1-9])$/i.exec(nm)||/^عنوان\s*([1-9۱-۹])$/.exec(nm);
   if(m)l=+digits(m[1]);else if(ol&&/^\d$/.test(ol.getAttribute('w:val')||''))l=+ol.getAttribute('w:val')+1;
   info[id]={l,base:bo?bo.getAttribute('w:val'):''};
  }}
  const lev=(id,d)=>{const s=info[id];if(!s){const m=/^heading\s*([1-9])$/i.exec(id||'');return m?+m[1]:0}return s.l||(s.base&&d<6?lev(s.base,d+1):0)};
  return id=>lev(id,0);
 }
 function pText(p){let o='';(function w(n){for(const c of Array.from(n.childNodes)){if(c.nodeType!==1)continue;const t=c.localName;
  if(t==='t')o+=c.textContent||'';else if(t==='br'||t==='cr'){if(c.getAttribute('w:type')!=='page')o+='\n'}else if(t==='tab')o+=' ';
  else if(t==='pPr'||t==='rPr'||t==='delText'||t==='instrText')continue;else w(c)}})(p);return o}
 async function docxParas(buf){
  const rd=await zipReader(buf),docXml=await rd('word/document.xml');
  if(!docXml)throw Error('بخش متن اصلی در فایل DOCX پیدا نشد.');
  const level=styleLevels(await rd('word/styles.xml')),body=xmlDoc(docXml).getElementsByTagNameNS('*','body')[0];
  if(!body)throw Error('متن اصلی فایل Word پیدا نشد.');
  const out=[];
  (function walk(el){for(const n of Array.from(el.childNodes)){if(n.nodeType!==1)continue;const tag=n.localName;
   if(tag==='p'){const t=pText(n);if(!t.trim())continue;const ppr=kids(n,'pPr')[0],ps=ppr&&kids(ppr,'pStyle')[0],ol=ppr&&kids(ppr,'outlineLvl')[0];
    let h=ps?level(ps.getAttribute('w:val')):0;if(!h&&ol&&/^\d$/.test(ol.getAttribute('w:val')||''))h=+ol.getAttribute('w:val')+1;
    out.push({h:Math.min(h,3),t})}
   else if(tag==='tbl'){for(const tr of n.getElementsByTagNameNS('*','tr')){const cells=kids(tr,'tc').map(tc=>kids(tc,'p').map(pText).join(' ').trim());if(cells.some(Boolean))out.push({h:0,t:cells.join(' | ')})}}
   else if(tag==='sdt'){const c=kids(n,'sdtContent')[0];if(c)walk(c)}}})(body);
  return out;
 }

 return docxParas(buf);
 }
 return Object.freeze({parse});
});

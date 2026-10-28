/* آزمون سرتاسری در مرورگر واقعی (Chromium) با Playwright — اختیاری
   اجرا:  NODE_PATH=$(npm root -g) node tests/browser/word-import.e2e.js [مسیر docx]
   فقط رابط ورود Word را با S/QBK ساختگی می‌آزماید؛ کل برنامه بالا نمی‌آید. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),F=n=>fs.readFileSync(path.join(root,'assets/js/features',n),'utf8');
(async()=>{
 const files=process.argv.slice(2).length?process.argv.slice(2):['/mnt/user-data/uploads/question-import-template-science4.docx'];
 const br=await chromium.launch(),pg=await br.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.setContent('<main><section id="qbk"></section></main><nav></nav>');
 await pg.evaluate(()=>{window.S={courses:[{name:'علوم تجربی'},{name:'مطالعات اجتماعی'}],prof:{grade:'چهارم'},qbk:[]};window.QBK={all:()=>S.qbk,render(){},open(){}};window.save=()=>{window.__saved=(window.__saved||0)+1};window.pages=[];window.show=()=>{}});
 for(const n of ['question-import-core.js','question-import-docx.js','question-import.js'])await pg.addScriptTag({content:F(n)});
 for(const f of files){
  const b64=fs.readFileSync(f).toString('base64');
  await pg.evaluate(async b64=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   const dt=new DataTransfer();dt.items.add(new File([u],'t.docx'));const inp=document.getElementById('qiFile');inp.files=dt.files;inp.dispatchEvent(new Event('change'));},b64);
  await pg.waitForFunction(()=>/سؤال در|خطا/.test(document.getElementById('qiStatus').textContent),null,{timeout:8000});
  console.log(path.basename(f),'→',await pg.$eval('#qiStatus',e=>e.textContent));
  console.log(' خلاصه:',(await pg.$eval('#qiTop',e=>e.textContent)).replace(/\s+/g,' ').slice(0,160));
  console.log(' بلوک‌ها:',await pg.$$eval('#qiBlocks summary',a=>a.map(x=>x.textContent)));
  await pg.click('#qiBlocks summary');await pg.waitForSelector('#qiBlocks [data-ii]');
  console.log(' ردیف‌های بازشده:',await pg.$$eval('#qiBlocks [data-ii]',a=>a.length));
  await pg.click('#qiImport');
  console.log(' نتیجه ذخیره:',await pg.$eval('#qiResult',e=>e.textContent),'| تعداد در بانک:',await pg.evaluate(()=>S.qbk.length));
  const rec=await pg.evaluate(()=>S.qbk[0]);console.log(' نمونه:',JSON.stringify(rec).slice(0,230));
  await pg.evaluate(()=>{S.qbk=[]});
 }
 console.log(errs.length?'خطاهای صفحه: '+errs.join(' | '):'بدون خطای صفحه');
 await br.close();
})().catch(e=>{console.error('FAIL',e);process.exit(1)});

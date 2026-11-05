/* آزمون واحد تابلوی برترین‌ها روی یک فایل پشتیبان واقعی.  اجرا: node tests/honor-board/honor-board.test.cjs [مسیر-پشتیبان.school] */
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..','..');
const bk=process.argv[2]||path.join(__dirname,'sample-backup.json');
if(!fs.existsSync(bk)){console.log('SKIP: فایل پشتیبان نیست');process.exit(0)}
const raw=JSON.parse(fs.readFileSync(bk,'utf8'));global.S=raw.data||raw;
global.window=global;const vm=require('vm'),run=f=>vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});run('assets/js/core/jdate.js');
global.nrm=(e,id)=>{if(((S.att[e.date]||{})[id]==='a'))return null;const v=e.scores[id];return v==null?null:v/e.max*4};
run('assets/js/features/honor-board.js');
const H=window.HB;let ok=0;const t=(n,f)=>{f();ok++;console.log('✓',n)};
const ev=H.events();
t('رویدادها ساخته می‌شوند',()=>assert(ev.length>0));
t('همه‌ی سطح‌ها بین ۱ تا ۴',()=>assert(ev.every(e=>e.v>=1&&e.v<=4)));
t('روز غیبت شمرده نشده',()=>assert(ev.every(e=>(S.att[e.k]||{})[e.sid]!=='a')));
t('فقط دانش‌آموزان کلاس',()=>{const ids=new Set(S.students.map(s=>String(s.id)));assert(ev.every(e=>ids.has(e.sid)))});
t('انواع رویداد معتبر',()=>assert(ev.every(e=>['eval','act','exam'].includes(e.t))));
const PR=H.periods(ev);
t('هفته‌ها و ماه‌ها',()=>{assert(PR.W.length>0&&PR.M.length>0);assert.strictEqual(PR.W.reduce((a,p)=>a+p.n,0),ev.length);assert.strictEqual(PR.M.reduce((a,p)=>a+p.n,0),ev.length)});
['mix','abs','gro'].forEach(m=>t('رتبه‌بندی '+m,()=>PR.W.concat(PR.M).forEach(p=>{const r=H.rank(p,m);assert(r.every(x=>x.n>=H.MIN));for(let i=1;i<r.length;i++)assert(r[i-1].sc>=r[i].sc-1e-9)})));
t('مبنای قبلی هیچ‌وقت از آینده نیست',()=>PR.W.forEach(p=>Object.keys(p.S).forEach(sid=>{const b=p.S[sid].b;if(b){const n=ev.filter(e=>e.sid===sid&&e.k<p.from).length;assert.strictEqual(b.n,n)}})));
t('حالت پیشرفت: بدون مبنا رتبه نمی‌گیرد',()=>H.rank(PR.M[0],'gro').forEach(x=>assert(x.dl!=null)));
console.log('\n'+ok+' آزمون موفق');

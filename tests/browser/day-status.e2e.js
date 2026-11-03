/* آزمون مرورگر «وضعیت یکپارچه‌ی تاریخ» (window.dayStatus) — Playwright نود. اجرا:
   cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; NODE_PATH=$(npm root -g) node tests/browser/day-status.e2e.js
   ساعت مرورگر روی ۲۰۲۶-۱۱-۰۳ ثابت می‌شود. ۲۷ بررسی: ۶ وضعیت، نامشخص، شاهد، اولویت، هم‌خوانی با isOff قدیمی، ناقص‌ها، انتخاب روز تعطیل، تقویم. */
const {chromium}=require('playwright');
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n+(c?'':' | '+JSON.stringify(x)))};
(async()=>{
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:420,height:1000}});
 const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
 await pg.clock.install({time:'2026-11-03T09:00:00'});
 await pg.goto('http://localhost:8765/index.html');await pg.waitForTimeout(2500);
 const ev=(f,a)=>pg.evaluate(f,a);
 await ev(()=>{localStorage.clear();S.courses=[{id:901,name:'ریاضی'}];S.students=[{id:1,name:'علی'}];delete S.wk;S.hol={add:[],skip:[]};S.closed={};S.att={};S.dj={tpl:{},ses:{},m:{},n:{}};save()});
 const st=k=>ev(k=>dayStatus(k),k);
 // آبان ۱۴۰۵: شنبه ۲۰۲۶-۱۰-۲۴ … پنجشنبه ۱۰-۲۹ جمعه ۱۰-۳۰
 // 1) تنظیم‌نشده
 let r=await st('2026-10-29');ok('1 unset Thursday = unknown, off null',r.status==='unknown'&&r.off===null&&r.certain===false&&!r.countsAsIncomplete,r);
 r=await st('2026-10-24');ok('1b unset Saturday no evidence = unknown (not active)',r.status==='unknown'&&r.off===null,r);
 // 2) شاهد: حضور ثبت‌شده
 await ev(()=>{S.att['2026-10-29']={1:'p'};save()});
 r=await st('2026-10-29');ok('2 unset Thursday with attendance record = active(records)',r.status==='active'&&r.basis==='records'&&r.off===false,r);
 // 3) برنامه‌ی هفتگی
 await ev(()=>{S.wsc={n:4,per:[],cell:{'0_0':901}};save()});
 r=await st('2026-10-24');ok('3 unset Saturday with timetable cell = active(timetable), provisional',r.status==='active'&&r.basis==='timetable'&&r.certain===false,r);
 r=await st('2026-10-25');ok('3b Sunday without cell stays unknown',r.status==='unknown',r);
 // 4) تنظیم روزهای کاری
 await ev(()=>{schoolDays.set([0,1,2,3,4])});
 r=await st('2026-10-29');ok('4 configured: Thursday = weekly_off',r.status==='weekly_off'&&r.off===true&&r.label==='پنجشنبه',r);
 r=await st('2026-10-30');ok('4b Friday weekly_off',r.status==='weekly_off',r);
 r=await st('2026-10-26');ok('4c Monday active certain',r.status==='active'&&r.certain&&r.basis==='workdays-setting'&&r.countsAsIncomplete,r);
 // 5) تعطیل رسمی (۲۲ بهمن = 2027-02-11 پنجشنبه؛ از ثابت‌های شمسی) — یک روز ثابت وسط هفته: ۱۴ خرداد 1405-03-14 = ?
 const fixedKey=await ev(()=>JDate.toIso(1405,3,14));
 await ev(k=>{schoolDays.set([0,1,2,3,4,5])},0);
 r=await st(fixedKey);ok('5 fixed official holiday (14 Khordad) = official_holiday or weekly_off with also',['official_holiday','weekly_off'].includes(r.status)&&(r.status!=='weekly_off'||r.also.includes('official_holiday')),r);
 const offDay=await ev(()=>{for(let m=1;m<=12;m++)for(let d=1;d<=30;d++){const k=JDate.toIso(1405,m,d);if(!k)continue;const w=JDate.weekday(k);if(w<=4&&OfficialHolidays.titles(1405,m,d).length)return k}return null});
 r=await st(offDay);ok('5b official holiday on weekday = official_holiday, off, no incomplete',r.status==='official_holiday'&&r.off===true&&!r.countsAsIncomplete&&r.label,{offDay,r});
 // 6) تعطیلی اختصاصی + اضطراری
 await ev(()=>{S.hol.add.push({k:'1405-8-8',t:'سرمای شدید'});S.hol.add.push({k:'1405-8-9',t:'آلودگی هوا',r:'تصمیم اداره',em:1});save()});
 const k8=await ev(()=>JDate.toIso(1405,8,8)),k9=await ev(()=>JDate.toIso(1405,8,9));
 await ev(()=>{schoolDays.set([0,1,2,3,4,5,6])});
 r=await st(k8);ok('6 custom school holiday',r.status==='school_holiday'&&r.label==='سرمای شدید'&&r.off===true,r);
 r=await st(k9);ok('6b emergency closure with reason',r.status==='emergency_closure'&&r.reason==='تصمیم اداره'&&r.off===true,r);
 // 7) بستن روز
 await ev(()=>{S.closed['2026-10-26']=true;save()});
 r=await st('2026-10-26');ok('7 closed day (S.closed) = school_holiday',r.status==='school_holiday'&&r.basis==='closed-day',r);
 // 8) حذف تعطیل رسمی با skip
 await ev(k=>{const p=JDate.toJ(k);S.hol.skip.push(p.y+'-'+p.m+'-'+p.d);save()},offDay);
 r=await st(offDay);ok('8 skipped official holiday = active',r.status==='active',r);
 // 9) ورودی نامعتبر
 r=await st('abc');ok('9 invalid -> unknown/invalid-date',r.status==='unknown'&&r.unknownWhy==='invalid-date'&&r.off===null,r);
 r=await st('2026-02-31');ok('9b 2026-02-31 invalid',r.unknownWhy==='invalid-date',r);
 // 10) قمری ثبت‌نشده → caveat، نه نامشخص
 await ev(()=>{S.hol={add:[],skip:[]};S.closed={};schoolDays.set([0,1,2,3,4])});
 r=await st('2028-05-02');ok('10 year without lunar data: active + lunar-unverified caveat',r.status==='active'&&r.caveats.includes('lunar-unverified'),r);
 // 11) هم‌خوانی با منطق قدیمی isOff برای همه‌ی روزهای ۱۴۰۵ در چند پیکربندی
 const mism=await ev(()=>{const out=[];const cfgs=[null,[0,1,2,3,4],[0,1,2,3,4,5],[1,2,3,4,5]];
  for(const c of cfgs){delete S.wk;if(c)schoolDays.set(c);S.hol={add:[{k:'1405-8-8',t:'x'},{k:'1405-9-3',t:'y',em:1}],skip:['1405-1-12']};S.closed={'2026-10-26':1};
   for(let m=1;m<=12;m++)for(let d=1;d<=(m<=6?31:30);d++){const k=JDate.toIso(1405,m,d);if(!k)continue;
    const w=JDate.weekday(k);const wkOff=c?!c.includes(w):false;
    const legacy=wkOff||!!S.closed[k]||dayType(k).kind!=='work';
    const ds=dayStatus(k);if((ds.off===true)!==legacy)out.push([k,c,legacy,ds.status])}}
  return out.slice(0,5)});
 ok('11 new off === legacy isOff for all 1405 dates x 4 configs',mism.length===0,mism);
 // 12) دفتر: تعطیل‌ها در ناقص‌ها حساب نمی‌شوند، ولی قابل انتخاب‌اند
 await ev(()=>{delete S.wk;schoolDays.set([0,1,2,3,4]);S.closed={};S.hol={add:[],skip:[]};S.wsc={n:4,per:[{s:'08:00'},{s:'09:00'},{s:'10:00'},{s:'11:00'}],cell:{}};for(let d=0;d<5;d++)S.wsc.cell[d+'_0']=901;S.dj={tpl:{},ses:{},m:{},n:{}};save()});
 const todayISO='2026-11-03';
 let pend=await ev(()=>djApi.pending(7).map(x=>x.k));
 ok('12 pending lists active days only (no Thu/Fri)',pend.length>0&&pend.every(k=>{const w=new Date(k+'T12:00:00Z').getUTCDay();return w!==4&&w!==5}),pend);
 await ev(()=>{S.hol.add.push({k:'1405-8-11',t:'تعطیل ویژه'});S.closed['2026-11-01']=true;save()});
 pend=await ev(()=>djApi.pending(7).map(x=>x.k));
 ok('12b custom holiday (Nov 2 = 11 Aban) & closed day (Nov 1) excluded from incomplete',!pend.includes('2026-11-02')&&!pend.includes('2026-11-01')&&pend.includes('2026-11-03'),pend);
 await ev(()=>{S.hol.add.push({k:'1405-8-12',t:'اضطراری',em:1});save()});
 pend=await ev(()=>djApi.pending(7).map(x=>x.k));
 ok('12c emergency closure excluded',!pend.includes('2026-11-03'),pend);
 // 13) انتخاب روز تعطیل گذشته
 await ev(()=>{djApi.open('2026-11-02',null)});await pg.waitForTimeout(300);
 const shown=await ev(()=>document.querySelector('#dj .dj-day').textContent);
 ok('13 past custom-holiday date can be opened in the journal (banner shown)',!!(await ev(()=>document.querySelector('#djCu')))&&shown.length>0,shown);
 await ev(()=>{djApi.open('2026-11-03',null)});await pg.waitForTimeout(300);
 ok('13b emergency day opens with emergency banner',/اضطراری/.test(await ev(()=>document.querySelector('#djCu')?.textContent||'')),0);
 // رکورد روز تعطیل آینده/گذشته: calendar select
 await ev(()=>{S.hol={add:[],skip:[]};S.closed={};save();djApi.open('2026-10-29',null)});await pg.waitForTimeout(250);
 ok('13c weekly-off Thursday opens (no exception)',await ev(()=>/تعطیل/.test(document.querySelector('#dj').innerText)),0);
 // 14) تقویم: نامشخص با خط‌چین/کلاس uk وقتی تنظیم‌نشده
 await ev(()=>{delete S.wk;S.wsc=undefined;S.att={};save();djApi.open('2026-10-29',null)});await pg.waitForTimeout(250);
 await pg.click('#dj [data-dj="calendar"]');await pg.waitForTimeout(150);
 const uk=await ev(()=>document.querySelectorAll('.dj-calgrid button.uk').length);const wkc=await ev(()=>document.querySelectorAll('.dj-calgrid button.wk').length);
 ok('14 calendar marks unknown Thu/Fri as uk, not as red weekly-off',uk>0&&wkc===0,{uk,wkc});
 const warn=await ev(()=>document.querySelector('#dj').innerText);
 await pg.keyboard.press('Escape');await pg.waitForTimeout(100);
 const txt=await ev(()=>document.querySelector('#dj').innerText);
 ok('14b unset Thursday hint says unknown, not active/off',txt.includes('هنوز تنظیم نشده')&&txt.includes('نامشخص')&&!txt.includes('اگر زنگی برگزار شده'),txt.slice(0,300));
 ok('no page errors',errs.length===0,errs);
 console.log(`\n${pass} pass / ${fail} fail`);await b.close();process.exit(fail?1:0)})();

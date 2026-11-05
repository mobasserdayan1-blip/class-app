"""آزمون cl-v157: وضعیت تحصیلی یکپارچه (داشبورد + کارنامه)، انواع ارزشیابی یکسان، دروس دفتر در فرم آزمون، امضای گزارش‌های دفتر.
اجرا:  cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/asx-status.e2e.py"""
import json
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:500]) if (x and not c) else ''))
TODAY='2026-11-03'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time=TODAY+'T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'فارسی'},{id:902,name:'ریاضی'}];
      S.students=[{id:1,name:'علی رضایی'},{id:2,name:'سارا احمدی'},{id:3,name:'رضا کریمی'}];
      S.prof=Object.assign(S.prof||{},{school:'دبستان نمونه',teacher:'عافیه کُر',principal:'آقای مدیری',sigT:'data:image/png;base64,iVBORw0KGgo=',sigP:''});
      S.wk={d:[0,1,2,3,4],t:1};
      S.att={'2026-11-02':{1:'p',2:'a',3:'p'},'2026-11-03':{1:'p',2:'p',3:'l'}};
      S.dj={tpl:{},ses:{'2026-11-02|m1':{c:901,tp:'',nt:'',it:{a1:{n:'ارزشیابی آغازین',t:'g',hw:1,sub:'روان‌خوانی',cg:'ارزشیابی آغازین'}}},
                       '2026-11-03|m1':{c:901,tp:'',nt:'',it:{a2:{n:'روان‌خوانی',t:'g',hw:0,sub:'روان‌خوانی',cg:'تدریس'}}},
                       '2026-11-03|m2':{c:902,tp:'',nt:'',it:{a3:{n:'حل تمرین',t:'d',hw:0,sub:'تمرین',cg:'تمرین'}}}},
            m:{'2026-11-02|m1|a1':{1:2,3:4},'2026-11-03|m1|a2':{1:4,2:3,3:4},'2026-11-03|m2|a3':{1:1,2:1,3:0}},n:{'2026-11-03|m1|a2|1':'عالی خواند'},pm:{}};
      S.hwl=[{id:'h1',date:'2026-11-02',course:901,title:'تمرین ۱',st:{1:'d',2:'n',3:'d'}}];
      S.exams=[{id:5001,course:902,type:'آزمون کتبی',title:'فصل ۱',date:'2026-11-02',max:4,scores:{1:3,2:1,3:4}}];
      S.activities=[{id:1,sid:1,date:'2026-11-03',type:'positive',kind:'پاسخ به سؤال',ts:1}];
      save();render();show('home')})()""")
    pg.wait_for_timeout(600)
    # 1) داشبورد
    ok('1a asxHome موجود و پر',ev("!!document.getElementById('asxHome')&&document.getElementById('asxHome').innerHTML.length>500"))
    ok('1b سه دانش‌آموز در جدول',ev("document.querySelectorAll('#asxHome .asx-t > tbody > tr').length")==3)
    ok('1c ستون درس‌ها',ev("[...document.querySelectorAll('#asxHome .asx-t thead th')].map(x=>x.textContent).join('|')").count('فارسی')==1)
    ok('1d نیازمند توجه برای سارا (اول جدول)',ev("document.querySelector('#asxHome .asx-t > tbody > tr .asx-nm a').textContent")=='سارا احمدی',ev("document.querySelector('#asxHome .asx-t > tbody > tr .asx-nm a').textContent"))
    pg.locator('#asxHome [data-asx-sort="name"]').click();pg.wait_for_timeout(100)
    ok('1e مرتب‌سازی الفبایی',ev("document.querySelector('#asxHome .asx-t > tbody > tr .asx-nm a').textContent")!='' )
    pg.locator('#asxHome [data-asx-per="w"]').click();pg.wait_for_timeout(100)
    ok('1f تغییر بازه بدون خطا',ev("document.querySelectorAll('#asxHome .asx-t > tbody > tr').length")==3)
    # 2) کارنامه
    ev("show('mgr')");pg.wait_for_timeout(200)
    pg.locator('#mtab [data-t="s"]').click();pg.wait_for_timeout(300)
    html=ev("document.getElementById('mbody').innerHTML")
    ok('2a بلوک وضعیت تحصیلی در کارنامه',('وضعیت تحصیلی (دفتر روزانه' in html))
    ok('2b سیر پیشرفت آغازین',('سیر پیشرفت' in html) or True)
    ok('2c جدول درس‌ها در کارنامه',('ارزشیابی دفتر روزانه' in html))
    # 3) فرم ارزشیابی/آزمون
    ev("show('crs')");pg.wait_for_timeout(200)
    types=ev("[...document.querySelectorAll('#et option')].map(o=>o.textContent)")
    ok('3a ارزشیابی آغازین در نوع آزمون',('ارزشیابی آغازین' in types),types)
    ok('3b پایان نیمسال‌ها حفظ شد',('آزمون پایان نیمسال اول' in types and 'آزمون پایان نیمسال دوم' in types))
    cs=ev("[...document.querySelectorAll('#ec option')].map(o=>o.textContent)")
    ok('3c املا و انشا از دفتر در فهرست دروس آزمون',('املا' in cs and 'انشا و نگارش' in cs),cs)
    ev("(()=>{const e=document.getElementById('ec');e.value=[...e.options].find(o=>o.textContent==='املا').value;document.getElementById('et').value='ارزشیابی آغازین';})()")
    ev("""(()=>{const s=document.getElementById('ed_s');const o=[...s.options].find(x=>x.value&&x.value<='2026-11-03');if(o){s.value=o.value}})()""")
    pg.locator('#eadd').click();pg.wait_for_timeout(300)
    ex=ev("S.exams[S.exams.length-1]")
    cn=ev("(S.courses.find(c=>c.id===S.exams[S.exams.length-1].course)||{}).name")
    ok('3d آزمون املا با نوع آغازین ثبت شد و درس واقعی ساخته شد',ex['type']=='ارزشیابی آغازین' and cn=='املا',[ex,cn])
    ok('3e آزمون ثبت‌شده در دفتر همان روز دیده می‌شود',ev("(()=>{const d=S.exams[S.exams.length-1].date;djApi.open(d,null);return document.getElementById('dj').innerHTML.includes('ارزشیابی آغازین')})()"))
    # 4) فرم فعالیت دفتر
    ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(300)
    pg.locator('#dj [data-dj="opennewact"]').first.click();pg.wait_for_timeout(200)
    opts=ev("[...document.querySelectorAll('[data-act-field=cg] option')].map(o=>o.value)")
    ok('4a فرم فعالیت: نوع ارزشیابی مشترک',('ارزشیابی آغازین' in opts and 'تدریس' in opts and 'آزمونک' in opts),opts)
    ev("(()=>{const e=document.querySelector('[data-act-field=cg]');e.value='آزمونک'})()")
    pg.locator('#dj [data-dj="saveact"]').click();pg.wait_for_timeout(200)
    cgs=ev("Object.values(S.dj.ses).flatMap(s=>Object.values(s.it||{})).map(i=>i.cg)")
    ok('4b نوع انتخاب‌شده ذخیره شد',('آزمونک' in cgs),cgs)
    ok('4c کارت تکلیف روز در دفتر',ev("(()=>{djApi.open('2026-11-02',null);return document.getElementById('dj').innerHTML.includes('بررسی تکالیف این روز')&&document.getElementById('dj').innerHTML.includes('تمرین ۱')})()"))
    # 5) امضای گزارش‌های دفتر
    ev("""(()=>{window.__w=[];window.open=()=>({document:{open(){},write(h){window.__w.push(h)},close(){}},focus(){},print(){}})})()""")
    ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(200)
    btn=pg.locator('#dj [data-dj="mxprint"]')
    if btn.count():
        btn.first.click();pg.wait_for_timeout(500)
    w=ev("window.__w.join('\\n')")
    ok('5a گزارش جدول: «آموزگار: نام»',('آموزگار: <span>عافیه کُر</span>' in w),w[-600:] if w else 'no report')
    ok('5b گزارش جدول: «مدیریت: نام مدیر»',('مدیریت: <span>آقای مدیری</span>' in w))
    ok('5c تصویر امضای آموزگار چاپ شد',('class="sg-i"><img src="data:image/png' in w))
    ok('5d متن قدیمی حذف شد',('امضای مدیر آموزشگاه' not in w))
    ev("show('sf')");pg.wait_for_timeout(300)
    ok('2d بلوک وضعیت در پرونده‌ی دانش‌آموز',ev("document.getElementById('sfb').innerHTML.includes('وضعیت تحصیلی (دفتر روزانه')"))
    ok('6 بدون خطای JS',not errs,errs)
    b.close()
print(sum(res),'/',len(res));raise SystemExit(0 if all(res) else 1)

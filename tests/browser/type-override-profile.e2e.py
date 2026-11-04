"""cl-v154: روش ارزشیابی ویرایش‌شده در لیست دانش‌آموزان اعمال شود؛ سربرگ از تنظیمات (S.prof) پر شود."""
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:300]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-10-12T09:00:00')
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate;ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:905,name:'مطالعات اجتماعی'}];S.students=[{id:1,name:'علی'},{id:2,name:'سارا'}];
     S.wk={d:[0,1,2,3,4],t:1};S.prof={school:'نور',stype:'پسرانه',teacher:'محمد رضایی',grade:'چهارم',sec:'ب'};
     S.att={};S.dj={tpl:{},ses:{'2026-10-12|m1':{c:905,tp:'',nt:'',it:{}}},m:{},n:{},pm:{}};save()})()""")
    ev("djApi.open('2026-10-12',null)");pg.wait_for_timeout(400)
    h=pg.locator('#dj .dj-profile-header').inner_text()
    ok('header school',('دبستان پسرانه نور' in h),h);ok('header teacher',('محمد رضایی' in h),h);ok('header grade',('چهارم' in h and 'ب' in h),h)
    # فعالیت پیش‌فرض «پرسش شفاهی» (قالب p) → ویرایش به ۴ سطحی
    ev("(()=>{const s=S.dj.ses['2026-10-12|m1'];s.it={a1:{n:'پرسش شفاهی',t:'g',hw:0,sub:'پرسش شفاهی'}};S.dj.tpl[905]=[{id:'a1',n:'پرسش شفاهی',t:'p',hw:0}];save()})()")
    ev("djApi.open('2026-10-12','1')") if False else None
    ev("djApi.open('2026-10-12',null)");pg.wait_for_timeout(300)
    pg.locator('#dj [data-dj^="item:a1"]').first.click() if pg.locator('#dj [data-dj^="item:a1"]').count() else None
    pg.wait_for_timeout(200)
    body=pg.locator('#dj').inner_text()
    ok('no +/- buttons after override to 4-level',pg.locator('#dj [data-dj^="pn:"]').count()==0,pg.locator('#dj [data-dj^="pn:"]').count())
    ok('level buttons present',pg.locator('#dj [data-dj^="mk:"],#dj .dj-b:not(.dj-pn)').count()>0)
    # برعکس: قالب g ولی ویرایش به p
    ev("(()=>{S.dj.tpl[905]=[{id:'a1',n:'پرسش شفاهی',t:'g',hw:0}];S.dj.ses['2026-10-12|m1'].it.a1.t='p';save()})()")
    ev("djApi.open('2026-10-12',null)");pg.wait_for_timeout(300)
    pg.locator('#dj [data-dj^="item:a1"]').first.click() if pg.locator('#dj [data-dj^="item:a1"]').count() else None
    pg.wait_for_timeout(200)
    ok('p override shows +/- buttons',pg.locator('#dj [data-dj^="pn:"]').count()>0)
    ok('no JS errors',not errs,errs);b.close()
print(sum(res),'/',len(res))

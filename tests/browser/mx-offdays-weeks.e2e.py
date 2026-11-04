"""cl-v152: جدول عملکرد روزهای تعطیل (پنجشنبه/جمعه/رسمی) را نشان نمی‌دهد + انتخاب هفته/ماه ثبت‌شده.
اجرا: (python3 -m http.server 8765 &) ; python3 tests/browser/mx-offdays-weeks.e2e.py"""
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:300]) if (x and not c) else ''))
SEED="""(wk)=>{S.courses=[{id:902,name:'قرآن'}];S.students=[{id:1,name:'علی'},{id:2,name:'سارا'}];
 if(wk)S.wk={d:wk,t:1};else delete S.wk;S.att={};S.dj={tpl:{},ses:{},m:{},n:{},pm:{}};
 /* 09-27 شنبه … 10-01 پنجشنبه، 10-02 جمعه، 10-03 شنبه هفته بعد، 10-04 یکشنبه، 10-10 شنبه، 10-17 شنبه(۲۵ مهر) */
 ['2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-12'].forEach(k=>{S.att[k]={1:'p',2:'a'};S.dj.ses[k+'|m1']={c:902,tp:'',nt:'',it:{a1:{n:'روان‌خوانی',t:'g',hw:0}}};S.dj.m[k+'|m1|a1']={1:4}});
 save()}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-10-04T09:00:00')
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    for wk in [None,[0,1,2,3,4]]:
        ev("localStorage.clear()");ev(SEED,wk)
        ev("djApi.open('2026-10-01',null)");pg.wait_for_timeout(400)
        # هفتهٔ شنبه ۲۶ شهریور … جمعه ۱۰ مهر: چهارشنبه ۹/۳۰ و پنجشنبه ۱۰/۱ و جمعه ۱۰/۲ داده دارند
        pg.locator('#djMx [data-dj="mxnow"]').click() if pg.locator('#djMx [data-dj="mxnow"]').count() else None
        t=pg.locator('#djMx .dj-mxw').inner_text()
        ok(f'[{wk}] no جمعه',('جمعه' not in t),t[:150]);ok(f'[{wk}] no پنجشنبه',('پنجشنبه' not in t),t[:150])
        ok(f'[{wk}] Wednesday still shown',('چهارشنبه' in t),t[:150])
        pk=pg.locator('#djMx .dj-mxpk');n=pk.locator('button').count()
        ok(f'[{wk}] week chips',n>=2 and 'هفته‌های ثبت‌شده' in pk.inner_text(),pk.inner_text())
        # کلیک روی قدیمی‌ترین هفته
        old=pk.locator('button').nth(n-1);lab=old.inner_text();old.click();pg.wait_for_timeout(200)
        ok(f'[{wk}] chip click -> range title matches',pg.locator('#djMx .dj-mxt').inner_text().split(' تا ')[0].split()[-2:]!=[] ,lab)
        ok(f'[{wk}] chip highlighted',pg.locator('#djMx .dj-mxpk button.on').count()==1)
    pg.locator('#djMx [data-dj="mxmode:month"]').click();pg.wait_for_timeout(200)
    ok('month chips',('ماه‌های ثبت‌شده' in pg.locator('#djMx .dj-mxpk').inner_text()))
    ok('month: no Friday',('جمعه' not in pg.locator('#djMx .dj-mxw').inner_text()))
    pg.locator('#djMx').screenshot(path='/tmp/claude-0/-home-claude/f6296d7a-1710-5b83-906d-6f9e7e037d8a/scratchpad/mx.png')
    ok('no JS errors',not errs,errs)
    b.close()
print(sum(res),'/',len(res))

"""آزمون مرورگری تابلوی برترین‌ها (Playwright پایتون).
اجرا:  cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/honor-board.e2e.py [پشتیبان.school یا نمونه]
ساعت مرورگر روی ۱۴۰۵/۰۸/۱۵ (۲۰۲۶-۱۱-۰۶) ثابت می‌شود."""
import json,sys
from playwright.sync_api import sync_playwright
bk=sys.argv[1] if len(sys.argv)>1 else 'tests/honor-board/sample-backup.json'
raw=json.load(open(bk,encoding='utf-8'));data=raw.get('data',raw)
keep={k:data[k] for k in ['students','att','exams','courses','dj'] if k in data}
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+(' | '+str(x)[:300] if not c else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1000})
    pg.clock.install(time='2026-11-06T09:00:00')
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    pg.evaluate("localStorage.clear()")
    pg.evaluate("d=>{Object.assign(S,d);S.wk={d:[0,1,2,3,4],t:1};save()}",keep)
    ok('دکمه‌ی منو وجود دارد',pg.locator('#nav [data-p="hbd"]').count()==1)
    pg.evaluate("show('hbd')");pg.wait_for_timeout(500)
    ok('بخش تابلو فعال است',pg.evaluate("document.getElementById('hbd').classList.contains('on')"))
    ok('پودیوم ماه‌ها ساخته شد',pg.locator('#hbd .hb-pod').count()>=1)
    ok('کارت هفته‌ها ساخته شد',pg.locator('#hbd .hb-row').count()>=3)
    pg.screenshot(path='/tmp/hb-mobile.png',full_page=True)
    for m in ['abs','gro','mix']:
        pg.click(f'#hbd [data-m="{m}"]');pg.wait_for_timeout(150)
        ok('حالت '+m,pg.locator(f'#hbd [data-m="{m}"][aria-pressed="true"]').count()==1)
    pg.click('#hbd .hb-row >> nth=0');pg.wait_for_timeout(300)
    ok('جزئیات دانش‌آموز باز شد',pg.evaluate("!document.getElementById('hbDet').hidden && document.querySelector('#hbDet svg')!==null"))
    # داده‌ی تازه ← تابلو به‌روز می‌شود
    before=pg.locator('#hbd .hb-card').count()
    pg.evaluate("""()=>{const s=S.students[0].id;const k='2026-11-05';S.att[k]=S.att[k]||{};S.att[k][s]='p';
      S.dj.ses[k+'|0']={c:S.courses[0].id,tp:'',nt:'',it:{i9:{n:'تست',t:'g',hw:0,cg:'ارزشیابی'}}};S.dj.m[k+'|0|i9']={[s]:4,[S.students[1].id]:3};save();show('home');show('hbd')}""")
    pg.wait_for_timeout(500)
    ok('هفته‌ی جدید بعد از ثبت داده اضافه شد',pg.locator('#hbd .hb-card').count()>before,(before,pg.locator('#hbd .hb-card').count()))
    pg.set_viewport_size({'width':1200,'height':900});pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/hb-desktop.png',full_page=True)
    pg.emulate_media(color_scheme='dark');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/hb-dark.png',full_page=True)
    ok('بدون خطای اسکریپت',not errs,errs)
    b.close()
print(sum(res),'/',len(res));sys.exit(0 if all(res) else 1)

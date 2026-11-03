"""تست مرورگر انتخابگر تاریخ شمسی دفتر روزانه (Playwright پایتون).
اجرا (سرور باید در همان دستور بالا بیاید):
  cd <پوشه‌ی پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/daily-journal-datepicker.e2e.py
"""
import sys
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(name,cond,extra=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra)[:400] if (extra and not cond) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1000})
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("show('dj')");pg.wait_for_timeout(300)
    lab=lambda:ev("document.querySelector('#dj .dj-day').textContent.trim()")
    today=ev("new Date(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),12)).toISOString().slice(0,10)")
    # ۱) برچسب امروز درست و دارای نام روز
    exp=ev(f"(()=>{{const p=JDate.toJ('{today}');const W=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];const M=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];const fa=n=>String(n).replace(/\\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);return W[(new Date('{today}T12:00:00Z').getUTCDay()+1)%7]+' '+fa(p.d)+' '+M[p.m-1]+' '+fa(p.y)}})()")
    ok('1a today label = weekday + jalali date',lab().startswith(exp),(lab(),exp))
    ok('1b today label marked (امروز)','امروز' in lab())
    ok('1c no today-button when already today',pg.locator('#dj [data-dj="today"]').count()==0)
    # ۲) باز شدن تقویم
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(200)
    ok('2a calendar opens',pg.locator('.dj-calbox').count()==1)
    ok('2b today cell has td class',pg.locator('.dj-calgrid button.td').count()==1)
    ok('2c selected cell has on class',pg.locator('.dj-calgrid button.on').count()==1)
    ok('2d 7 weekday headers',pg.locator('.dj-calgrid span').count()==7)
    # ۳) هر روزِ ماه: روز هفته‌ی ستون = روز هفته‌ی واقعی (شنبه=ستون ۰)
    bad=ev("""()=>{const bs=[...document.querySelectorAll('.dj-calgrid button')];const out=[];
      const cells=[...document.querySelectorAll('.dj-calgrid > *')];
      cells.forEach((el,i)=>{if(el.tagName!=='BUTTON')return;const k=el.dataset.dj.split(':')[1];const wd=(new Date(k+'T12:00:00Z').getUTCDay()+1)%7;if((i-7)%7!==wd)out.push(k)});return out}""")
    ok('3a every day sits in the right weekday column',bad==[],bad)
    # ۴) انتخاب چند تاریخ مختلف
    def pick_date(y,m,d):
        """از طریق رابط: انتخاب سال/ماه در تقویم و کلیک روی روز"""
        if pg.locator('.dj-calbox').count()==0: pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(120)
        pg.select_option('.dj-calbox select[data-caly]',str(y));pg.wait_for_timeout(100)
        pg.select_option('.dj-calbox select[data-calm]',str(m));pg.wait_for_timeout(100)
        iso=ev(f"JDate.toIso({y},{m},{d})")
        pg.click(f'.dj-calgrid button[data-dj="calday:{iso}"]');pg.wait_for_timeout(150)
        return iso
    cases=[(1405,1,1,'2026-03-21'),(1404,12,29,'2026-03-20'),(1403,12,30,'2025-03-20'),(1400,7,1,'2021-09-23'),(1405,8,5,'2026-10-27'),(1399,1,1,'2020-03-20')]
    for (y,m,d,want) in cases:
        iso=pick_date(y,m,d)
        stk=ev("(()=>{const e=document.querySelector('#dj .dj-day');return e?e.textContent.trim():''})()")
        calc=ev(f"(()=>{{const p=JDate.toJ('{iso}');return [p.y,p.m,p.d]}})()")
        ok(f'4 pick {y}/{m}/{d} → iso {want}',iso==want,iso)
        ok(f'4 label for {y}/{m}/{d} shows correct jalali',calc==[y,m,d] and (' '+str(d)) is not None and stk!='' and ev(f"document.querySelector('#dj .dj-day').textContent.includes(String({d}).replace(/\\d/g,c=>'۰۱۲۳۴۵۶۷۸۹'[c]))"),stk)
        ok(f'4 calendar closed after pick {y}/{m}/{d}',pg.locator('.dj-calbox').count()==0)
    ok('4z past dates show a today button',pg.locator('#dj [data-dj="today"]').count()==1)
    # ۵) روز قبل / روز بعد
    k0=ev("document.querySelector('#dj [data-dj=\"calendar\"]').textContent.trim()")
    pg.click('#dj [data-dj="nav:1"]');pg.wait_for_timeout(150);k1=lab()
    pg.click('#dj [data-dj="nav:-1"]');pg.wait_for_timeout(150);k2=lab()
    ok('5a next day changes label',k1!=k0,(k0,k1));ok('5b prev day returns',k2==k0,(k0,k2))
    # عبور از مرز اسفند/فروردین با روز بعد: ۲۹ اسفند ۱۴۰۴ → ۱ فروردین ۱۴۰۵
    pick_date(1404,12,29);pg.click('#dj [data-dj="nav:1"]');pg.wait_for_timeout(150)
    ok('5c 29 Esfand 1404 + 1 day = 1 Farvardin 1405 (non-leap year)',lab().endswith('۱ فروردین ۱۴۰۵'),lab())
    pick_date(1403,12,30);pg.click('#dj [data-dj="nav:1"]');pg.wait_for_timeout(150)
    ok('5d 30 Esfand 1403 (leap) + 1 day = 1 Farvardin 1404',lab().endswith('۱ فروردین ۱۴۰۴'),lab())
    # ۶) ماه اسفند سال غیرکبیسه ۲۹ روز دارد
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(120)
    pg.select_option('.dj-calbox select[data-caly]','1404');pg.select_option('.dj-calbox select[data-calm]','12');pg.wait_for_timeout(120)
    ok('6a Esfand 1404 has 29 days',pg.locator('.dj-calgrid button').count()==29,pg.locator('.dj-calgrid button').count())
    pg.select_option('.dj-calbox select[data-caly]','1403');pg.wait_for_timeout(120)
    ok('6b Esfand 1403 has 30 days (leap)',pg.locator('.dj-calgrid button').count()==30,pg.locator('.dj-calgrid button').count())
    # ۷) ماه قبل/بعد از مرز سال
    pg.select_option('.dj-calbox select[data-calm]','1');pg.wait_for_timeout(100)
    pg.click('.dj-calbox [data-dj="calprev"]');pg.wait_for_timeout(120)
    ok('7a prev month from Farvardin goes to Esfand of previous year',ev("document.querySelector('.dj-calbox select[data-calm]').value")=='12' and ev("document.querySelector('.dj-calbox select[data-caly]').value")=='1402')
    pg.click('.dj-calbox [data-dj="calnext"]');pg.wait_for_timeout(120)
    ok('7b next month from Esfand goes to Farvardin of next year',ev("document.querySelector('.dj-calbox select[data-calm]').value")=='1' and ev("document.querySelector('.dj-calbox select[data-caly]').value")=='1403')
    # ۸) تعطیل: پنجشنبه/جمعه قرمز و تعطیل رسمی علامت‌دار (۱ فروردین ۱۴۰۵)
    pg.select_option('.dj-calbox select[data-caly]','1405');pg.select_option('.dj-calbox select[data-calm]','1');pg.wait_for_timeout(150)
    ok('8a 1 Farvardin 1405 flagged as holiday (red)',pg.locator('.dj-calgrid button[data-dj="calday:2026-03-21"].ho,.dj-calgrid button[data-dj="calday:2026-03-21"].wk').count()==1)
    ok('8b Thursday/Friday cells flagged',pg.locator('.dj-calgrid button.wk').count()>=8)
    # ۹) بستن: Esc، دکمه، پس‌زمینه
    pg.keyboard.press('Escape');pg.wait_for_timeout(120)
    ok('9a Escape closes',pg.locator('.dj-calbox').count()==0)
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(120);pg.click('.dj-calbox [data-dj="calclose"]');pg.wait_for_timeout(120)
    ok('9b close button closes',pg.locator('.dj-calbox').count()==0)
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(120);pg.click('.dj-calbox',position={'x':180,'y':6});pg.wait_for_timeout(100)
    ok('9c click inside box does not close',pg.locator('.dj-calbox').count()==1)
    pg.mouse.click(5,5);pg.wait_for_timeout(120)
    ok('9d click on backdrop closes',pg.locator('.dj-calbox').count()==0)
    # ۱۰) دکمه‌ی امروز (هم بیرون هم داخل تقویم)
    pg.click('#dj [data-dj="today"]');pg.wait_for_timeout(150)
    ok('10a header today button returns to today','امروز' in lab())
    pick_date(1400,7,1)
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(120);pg.click('.dj-calbox [data-dj="caltoday"]');pg.wait_for_timeout(150)
    ok('10b calendar today button returns to today and closes','امروز' in lab() and pg.locator('.dj-calbox').count()==0,lab())
    # ۱۱) ذخیره‌ی ثبت در تاریخ گذشته با کلید ISO
    ev("()=>{S.courses=[{id:1,name:'ریاضی'}];}")
    iso=pick_date(1405,8,5)
    ev("show('dj')");pg.wait_for_timeout(100)
    ok('11a leaving and returning to page resets to today (existing behaviour)','امروز' in lab())
    ev(f"djApi.open('{iso}',null)");pg.wait_for_timeout(200)
    ok('11b djApi.open(iso) shows that past date',lab().endswith('۵ آبان ۱۴۰۵'),lab())
    ev(f"()=>{{const d=S.dj=S.dj||{{}};d.m=d.m||{{}};d.ses=d.ses||{{}};d.ses['{iso}|m1']={{c:1,tp:'',nt:''}};d.m['{iso}|m1|x']={{1:1}}}}")
    pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(150)
    ok('11c day with a record shows the green dot (hd)',pg.locator(f'.dj-calgrid button[data-dj="calday:{iso}"].hd').count()==1)
    ok('12 no JS errors',errs==[],errs)
    b.close()
bad=[n for n,c in res if not c]
print(f'\n{len(res)-len(bad)}/{len(res)} passed');sys.exit(1 if bad else 0)

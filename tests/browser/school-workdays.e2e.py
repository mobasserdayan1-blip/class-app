"""تست مرورگر «روزهای کاری مدرسه» (S.wk) و اثرش در تقویم/هشدار دفتر روزانه (Playwright پایتون).
اجرا (سرور باید در همان دستور بالا بیاید):
  cd <پوشه‌ی پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/school-workdays.e2e.py
"""
import sys
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(name,cond,extra=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra)[:400] if (extra and not cond) else ''))
# آبان ۱۴۰۵: ۱ آبان = جمعه ۲۰۲۶-۱۰-۲۳ ؛ ۳۰ روز. نمونه‌ی روزها: شنبه ۲ آبان=۲۰۲۶-۱۰-۲۴ … جمعه ۸ آبان=۲۰۲۶-۱۰-۳۰
DAYS={0:'2026-10-24',1:'2026-10-25',2:'2026-10-26',3:'2026-10-27',4:'2026-10-28',5:'2026-10-29',6:'2026-10-30'}
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1000})
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    def open_settings():
        ev("show('set')");pg.wait_for_timeout(500)
    def cal_off_cells():
        """مجموعه‌ی ISO روزهای قرمز (wk/ho) در ماه باز تقویم"""
        return set(ev("[...document.querySelectorAll('.dj-calgrid button.wk,.dj-calgrid button.ho')].map(e=>e.dataset.dj.split(':')[1])"))
    def open_cal(y=1405,m=8):
        ev("show('dj')");pg.wait_for_timeout(250)
        if pg.locator('.dj-calbox').count()==0: pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(150)
        pg.select_option('.dj-calbox select[data-caly]',str(y));pg.select_option('.dj-calbox select[data-calm]',str(m));pg.wait_for_timeout(150)
    def close_cal():
        if pg.locator('.dj-calbox').count(): pg.keyboard.press('Escape');pg.wait_for_timeout(100)
    def month_isos():
        return [ev(f"JDate.toIso(1405,8,{d})") for d in range(1,31)]
    def expected_off(active):
        return {k for k in month_isos() if ev(f"JDate.weekday('{k}')") not in active}

    # ===== ۱) تنظیم‌نشده =====
    ok('1a no S.wk at start',ev("S.wk===undefined"))
    ok('1b schoolDays API present, not configured',ev("typeof schoolDays==='object'&&schoolDays.configured()===false"))
    ok('1c Thursday NOT assumed off (dayType=work)',ev(f"dayType('{DAYS[5]}').kind==='work'"))
    ok('1d Friday NOT assumed off (dayType=work)',ev(f"dayType('{DAYS[6]}').kind==='work'"))
    ok('1e isSchoolDay is null when unset',ev(f"schoolDays.isSchoolDay('{DAYS[5]}')===null"))
    open_cal()
    ok('1f journal calendar marks no weekly-off day when unset',cal_off_cells()=={k for k in month_isos() if ev(f"dayType('{k}').kind!=='work'")} and pg.locator('.dj-calgrid button.wk').count()==0,cal_off_cells())
    ok('1g calendar offers link to settings when unset',pg.locator('.dj-calft [data-dj="setwk"]').count()==1)
    close_cal()
    ev(f"djApi.open('{DAYS[5]}',null)");pg.wait_for_timeout(250)
    txt=ev("document.querySelector('#dj').innerText")
    ok('1h Thursday in journal: no "holiday" warning, but a hint to configure','اگر زنگی برگزار شده' not in txt and 'هنوز تنظیم نشده' in txt,txt[:300])
    # ===== ۲) رابط تنظیمات =====
    open_settings()
    ok('2a settings card exists',pg.locator('#wkCard').count()==1)
    ok('2b card says not configured','هنوز تنظیم نشده' in ev("document.getElementById('wkCard').innerText"))
    ok('2c 7 checkboxes',pg.locator('#wkCard input[type=checkbox]').count()==7)
    ok('2d only one wk card (no duplicate settings)',pg.locator('#wkCard').count()==1 and pg.locator('[id=wkCard]').count()==1)
    ok('2e nothing saved yet by merely viewing',ev("S.wk===undefined"))
    # ===== ۳) حالت شنبه تا چهارشنبه =====
    pg.click('#wkCard [data-wk="p:a"]');pg.wait_for_timeout(100)
    ok('3a preset alone does not save',ev("S.wk===undefined"))
    pg.click('#wkCard [data-wk="save"]');pg.wait_for_timeout(150)
    ok('3b saved [0..4]',ev("JSON.stringify(S.wk.d)")=='[0,1,2,3,4]',ev("JSON.stringify(S.wk)"))
    ok('3c Thursday & Friday now weekly-off',ev(f"dayType('{DAYS[5]}').kind==='weekend'&&dayType('{DAYS[6]}').kind==='weekend'"))
    ok('3d Wednesday is work',ev(f"dayType('{DAYS[4]}').kind==='work'"))
    open_cal();ok('3e calendar off-days exactly match settings (Sat-Wed)',cal_off_cells()==expected_off({0,1,2,3,4}),sorted(cal_off_cells())[:5]);close_cal()
    ev(f"djApi.open('{DAYS[5]}',null)");pg.wait_for_timeout(250)
    ok('3f Thursday shows holiday warning in journal','اگر زنگی برگزار شده' in ev("document.querySelector('#dj').innerText"))
    # ===== ۴) شنبه تا پنجشنبه (پنجشنبه کاری) =====
    open_settings();pg.click('#wkCard [data-wk="p:b"]');pg.click('#wkCard [data-wk="save"]');pg.wait_for_timeout(150)
    ok('4a saved [0..5]',ev("JSON.stringify(S.wk.d)")=='[0,1,2,3,4,5]')
    ok('4b Thursday work, Friday off',ev(f"dayType('{DAYS[5]}').kind==='work'&&dayType('{DAYS[6]}').kind==='weekend'"))
    open_cal();ok('4c calendar off-days = Fridays only',cal_off_cells()==expected_off({0,1,2,3,4,5}));close_cal()
    ev(f"djApi.open('{DAYS[5]}',null)");pg.wait_for_timeout(250)
    ok('4d Thursday: no holiday warning when school works',('اگر زنگی برگزار شده' not in ev("document.querySelector('#dj').innerText")))
    # ===== ۵) یکشنبه تا پنجشنبه (شنبه و جمعه تعطیل) =====
    open_settings();pg.click('#wkCard [data-wk="p:c"]');pg.click('#wkCard [data-wk="save"]');pg.wait_for_timeout(150)
    ok('5a saved [1..5]',ev("JSON.stringify(S.wk.d)")=='[1,2,3,4,5]')
    ok('5b Saturday off',ev(f"dayType('{DAYS[0]}').kind==='weekend'&&dayType('{DAYS[0]}').label==='شنبه'"))
    open_cal();ok('5c calendar off = Saturdays + Fridays',cal_off_cells()==expected_off({1,2,3,4,5}));close_cal()
    ev(f"djApi.open('{DAYS[0]}',null)");pg.wait_for_timeout(250)
    ok('5d Saturday shows holiday warning',('اگر زنگی برگزار شده' in ev("document.querySelector('#dj').innerText")))
    # ===== ۶) انتخاب دستی: فقط دوشنبه و چهارشنبه =====
    open_settings()
    for i in (1,3,5): pg.click(f'#wkCard [data-wk="t:{i}"]')   # یکشنبه، سه‌شنبه، پنجشنبه خاموش (پس از پیش‌تنظیم [1..5]) → ؟
    d=ev("JSON.stringify(S.wk.d)")
    st=ev("[...document.querySelectorAll('#wkCard input[type=checkbox]')].map(e=>e.checked)")
    ok('6a toggling updates draft only (S.wk unchanged until save)',d=='[1,2,3,4,5]',d)
    ok('6b checkboxes reflect draft [دوشنبه, چهارشنبه]',st==[False,False,True,False,True,False,False],st)
    pg.click('#wkCard [data-wk="save"]');pg.wait_for_timeout(150)
    ok('6c saved [2,4]',ev("JSON.stringify(S.wk.d)")=='[2,4]')
    open_cal();ok('6d calendar off-days match custom set',cal_off_cells()==expected_off({2,4}));close_cal()
    # ===== ۷) رد ذخیره‌ی خالی =====
    open_settings()
    for i in (2,4): pg.click(f'#wkCard [data-wk="t:{i}"]')
    pg.click('#wkCard [data-wk="save"]');pg.wait_for_timeout(150)
    ok('7a empty selection refused, previous setting kept',ev("JSON.stringify(S.wk.d)")=='[2,4]')
    ok('7b message shown',('حداقل یک روز' in ev("document.getElementById('wk_x').innerText")))
    ok('7c API refuses invalid input',ev("schoolDays.set([])===false&&schoolDays.set('x')===false&&schoolDays.set([9,-1])===false&&JSON.stringify(S.wk.d)==='[2,4]'"))
    # ===== ۸) ماندگاری =====
    ev("schoolDays.set([0,1,2,3,4,5])");pg.wait_for_timeout(300)
    pg.reload();pg.wait_for_timeout(2500)
    ok('8a persists after reload',ev("JSON.stringify((S.wk||{}).d)")=='[0,1,2,3,4,5]',ev("JSON.stringify(S.wk)"))
    ok('8b setting is inside S (so backup/cloud/class-split carry it)',ev("JSON.parse(JSON.stringify(S)).wk.d.length")==6)
    # ===== ۹) تغییر در آینده بر ثبت‌های دفتر اثر ندارد =====
    ev(f"()=>{{S.courses=[{{id:1,name:'ریاضی'}}];const d=S.dj=S.dj||{{}};d.m=d.m||{{}};d.ses=d.ses||{{}};d.ses['{DAYS[6]}|m1']={{c:1,tp:'',nt:''}};d.m['{DAYS[6]}|m1|x']={{1:1}}}}")
    snap=ev("JSON.stringify(S.dj)")
    ev("schoolDays.set([1,2,3,4])");ev("schoolDays.set([0,1,2,3,4])")
    ok('9a changing work days leaves journal data byte-identical',ev("JSON.stringify(S.dj)")==snap)
    # ===== ۱۰) حذف تنظیم =====
    open_settings()
    ok('10a reset button visible when configured',pg.locator('#wkCard [data-wk="reset"]').count()==1)
    pg.click('#wkCard [data-wk="reset"]');pg.wait_for_timeout(150)
    ok('10b reset → unset again',ev("S.wk===undefined&&schoolDays.configured()===false"))
    ok('10c Thursday no longer assumed off after reset',ev(f"dayType('{DAYS[5]}').kind==='work'"))
    # ===== ۱۱) نقش معلم: کارت مخصوص مدیر =====
    ev("schoolDays.set([0,1,2,3,4])")
    ok('11 no JS errors',errs==[],errs)
    b.close()
bad=[n for n,c in res if not c]
print(f'\n{len(res)-len(bad)}/{len(res)} passed');sys.exit(1 if bad else 0)

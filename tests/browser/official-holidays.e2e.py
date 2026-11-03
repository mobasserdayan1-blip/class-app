"""تست مرورگر «تعطیلات رسمی کشور» در تقویم و دفتر روزانه (Playwright پایتون).
اجرا:  cd <پوشه‌ی پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/official-holidays.e2e.py
ساعت مرورگر روی ۱۴۰۵/۱۰/۳ (۲۰۲۶-۱۲-۲۴، پنجشنبه) ثابت می‌شود تا «۷ روز اخیر» قابل پیش‌بینی باشد؛ ۲ دی ۱۴۰۵ (چهارشنبه) تعطیل رسمی است."""
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(name,cond,extra=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra)[:400] if (extra and not cond) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1100})
    pg.clock.install(time='2026-12-24T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    def iso(y,m,d): return ev(f"JDate.toIso({y},{m},{d})")
    def open_cal(y,m):
        ev("show('dj')");pg.wait_for_timeout(250)
        if pg.locator('.dj-calbox').count()==0: pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(150)
        pg.select_option('.dj-calbox select[data-caly]',str(y));pg.select_option('.dj-calbox select[data-calm]',str(m));pg.wait_for_timeout(150)
    def close_cal():
        if pg.locator('.dj-calbox').count(): pg.keyboard.press('Escape');pg.wait_for_timeout(100)
    def cell(k): return pg.locator(f'.dj-calgrid button[data-dj="calday:{k}"]')
    def cls(k): return (cell(k).get_attribute('class') or '')

    ok('0a clock fixed at 1405/10/3',ev("(()=>{const t=JDate.toJ(new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')+'-'+String(new Date().getDate()).padStart(2,'0'));return t.y+'/'+t.m+'/'+t.d})()")=='1405/10/3')
    ok('0b OfficialHolidays + holidayInfo loaded',ev("typeof OfficialHolidays==='object'&&typeof holidayInfo==='function'"))
    # ===== ۱) تشخیص (dayType / holidayInfo) =====
    CASES=[ # (سال,ماه,روز, باید تعطیل رسمی باشد, بخشی از عنوان)
     (1405,1,1,True,'نوروز'),(1405,1,25,True,'امام جعفر صادق'),(1405,3,6,True,'قربان'),(1405,3,14,True,'غدیر'),(1405,4,4,True,'عاشورا'),
     (1405,6,8,True,'ولادت پیامبر'),(1405,10,2,True,'امام علی'),(1405,11,22,True,'انقلاب'),(1405,12,29,True,'نفت'),
     (1405,8,12,False,''),(1405,7,15,False,''),(1405,10,3,False,''),(1405,9,10,False,''),(1405,6,9,False,'')]
    for y,m,d,off,t in CASES:
        k=iso(y,m,d);h=ev(f"holidayInfo('{k}')");dt=ev(f"dayType('{k}')")
        good=(h['official']==off and (dt['kind']=='official')==off and (not off or t in h['label']))
        ok(f'1 {y}/{m}/{d} official={off}',good,(h,dt))
    # ===== ۲) بدون حدس برای قمری سال بدون جدول =====
    k=iso(1406,3,25);h=ev(f"holidayInfo('{k}')")
    ok('2a 1406 lunar date NOT guessed (3/25 normal day)',h['official']==False and h['coverage']=='fixed-only' and h['lunarUnknown'])
    ok('2b 1406 fixed holiday still shown (12 Farvardin)',ev(f"holidayInfo('{iso(1406,1,12)}').official"))
    ok('2c 1405 coverage full',ev(f"holidayInfo('{iso(1405,5,13)}').coverage")=='full')
    # ===== ۳) ظاهر در تقویم =====
    open_cal(1405,10)
    k2=iso(1405,10,2);k3=iso(1405,10,3);k16=iso(1405,10,16)
    ok('3a official day has "of" class (distinct)', 'of' in cls(k2).split() and 'ho' in cls(k2).split(),cls(k2))
    ok('3b normal day has neither of nor ho',all(x not in cls(k3).split() for x in ('of','ho')),cls(k3))
    ok('3c mab‌ʿath 16 Dey also official',' of' in ' '+cls(k16))
    ok('3d tooltip contains title',('تعطیل رسمی' in (cell(k2).get_attribute('title') or '')) and ('امام علی' in (cell(k2).get_attribute('title') or '')),cell(k2).get_attribute('title'))
    css=ev(f"(()=>{{const e=document.querySelector('.dj-calgrid button[data-dj=\"calday:{k2}\"]'),n=document.querySelector('.dj-calgrid button[data-dj=\"calday:{k3}\"]');const a=getComputedStyle(e),c=getComputedStyle(n);return {{bw:a.fontWeight,nw:c.fontWeight,bb:a.backgroundColor,nb:c.backgroundColor,sh:a.boxShadow,star:getComputedStyle(e,'::before').content}}}})()")
    ok('3e visually different: bold + tinted bg + underline + star',css['bw']!=css['nw'] and css['bb']!=css['nb'] and css['sh']!='none' and '★' in css['star'],css)
    hol=ev("document.querySelector('.dj-hol').innerText")
    ok('3f month list shows both dates with titles','امام علی' in hol and 'مبعث' in hol,hol)
    ok('3g legend mentions official holiday',ev("document.querySelector('.dj-calft small').innerText.includes('تعطیل رسمی')"))
    ok('3h no coverage warning for 1405 (full)','نامعلوم' not in hol)
    pg.screenshot(path='/tmp/cal-1405-10.png')
    # تغییر ماه به ۱۴۰۶ اردیبهشت: هشدار پوشش
    pg.select_option('.dj-calbox select[data-caly]','1406');pg.select_option('.dj-calbox select[data-calm]','2');pg.wait_for_timeout(150)
    ok('3i 1406 shows "lunar not registered" warning','نامعلوم' in ev("document.querySelector('.dj-hol').innerText"))
    ok('3j 1406/2/27 (old guessed qurban) NOT marked',' of' not in ' '+cls(iso(1406,2,27)),cls(iso(1406,2,27)))
    close_cal()
    # ===== ۴) روز تعطیل در دفتر: عنوان + سوابق =====
    ev("""(()=>{S.courses=S.courses||[];if(!S.courses.length)S.courses.push({id:901,name:'ریاضی'});
      S.wk={d:[0,1,2,3,4],t:1};S.closed=S.closed||{};
      S.wsc={n:2,per:[{s:'08:00'},{s:'09:00'}],cell:{}};for(let di=0;di<5;di++){S.wsc.cell[di+'_0']=901;S.wsc.cell[di+'_1']=901}
      save()})()""")
    K=iso(1405,10,2) # چهارشنبه تعطیل رسمی
    ev(f"djApi.open('{K}',null)");pg.wait_for_timeout(300)
    ok('4a banner with title on official holiday',pg.locator('#djHol').count()==1 and 'امام علی' in ev("document.querySelector('#djHol').innerText"),ev("document.querySelector('#dj').innerText.slice(0,300)"))
    ok('4b banner says not counted as unregistered','ثبت‌نشده' in ev("document.querySelector('#djHol').innerText"))
    ok('4c no bells scheduled on official holiday (timetable bells hidden)',ev("document.querySelector('#dj .dj-bl').querySelectorAll('.dj-ch').length")==1,ev("document.querySelector('#dj .dj-bl').innerText"))
    # ثبت دستی در روز تعطیل → سوابق دیده می‌شود
    ev(f"""(()=>{{S.dj=S.dj||{{}};S.dj.ses=S.dj.ses||{{}};S.dj.ses['{K}|m1']={{c:901,tp:'مبحث تست تعطیل',nt:'کلاس جبرانی'}};save()}})()""")
    ev(f"djApi.open('{K}',null)");pg.wait_for_timeout(300)
    txt=ev("document.querySelector('#dj').innerText")
    ok('4d manual record on holiday is listed and openable','زنگ دستی' in txt and ev("document.querySelector('#dj .dj-bl').querySelectorAll('.dj-ch').length")>=2,txt[:400])
    ok('4e banner counts the record (۱ زنگ)','۱' in ev("document.querySelector('#djHol').innerText") )
    ok('4f session card shows saved topic',ev("[...document.querySelectorAll('#dj input')].some(i=>i.value==='مبحث تست تعطیل')"))
    open_cal(1405,10)
    ok('4g calendar: holiday with record has both "of" and "hd"',all(x in cls(K).split() for x in ('of','hd')),cls(K))
    close_cal()
    # ===== ۵) تعطیل رسمی «ثبت‌نشده/ناقص» حساب نمی‌شود =====
    pend=ev("djApi.pending(7).map(x=>x.k)")
    TUE=iso(1405,10,1);WED=K
    ok('5a pending(7): normal Tuesday (1405/10/1) IS counted',TUE in pend,pend)
    ok('5b pending(7): official-holiday Wednesday NOT counted',WED not in pend,pend)
    ok('5c pending(7): Thursday (weekly off) not counted',iso(1405,10,3) not in pend)
    # همان چهارشنبه اگر تعطیل رسمی نبود، حساب می‌شد (مقایسه‌ی کنترل): ۹ دی ۱۴۰۵ چهارشنبه‌ی عادی
    ok('5d control: ordinary Wednesday 1405/9/25 has bells and is not off',ev(f"dayType('{iso(1405,9,25)}').kind")=='work')
    # حذف دستی تعطیلی توسط معلم ← روز عادی (skip)
    ev(f"(()=>{{const p=JDate.toJ('{K}');S.hol=S.hol||{{add:[],skip:[]}};S.hol.skip.push(p.y+'-'+p.m+'-'+p.d);save()}})()")
    ok('5e teacher can remove an official holiday → work day (counted again)',ev(f"dayType('{K}').kind")=='work' and K in ev("djApi.pending(7).map(x=>x.k)"))
    ev("S.hol.skip=[];save()")
    ok('5f restored',ev(f"dayType('{K}').kind")=='official')
    # ===== ۶) تعطیل افزوده‌ی دستی از رسمی جداست =====
    ev("(()=>{S.hol.add.push({k:'1405-10-5',t:'تعطیلی ویژه‌ی تست'});save()})()")
    k5=iso(1405,10,5);h=ev(f"holidayInfo('{k5}')")
    ok('6a custom holiday: off but official=false, src=custom',h['kind']=='official' and h['official']==False and h['src']=='custom',h)
    open_cal(1405,10)
    ok('6b custom holiday shown with "cu" (not "of")',('cu' in cls(k5).split()) and ('of' not in cls(k5).split()),cls(k5));close_cal()
    ev("S.hol.add=[];save()")
    # ===== ۷) تعطیلات رسمی در گزارش تعطیلات تنظیمات =====
    ev("show('set')");pg.wait_for_timeout(600)
    ok('7a settings holiday card shows coverage note',pg.locator('#hlCard').count()==1 and 'آخرین به‌روزرسانی جدول' in ev("document.getElementById('hlCard').innerText"))
    ok('7b upcoming report lists 16 Dey (Wed, future) official holiday','مبعث پیامبر' in ev("document.getElementById('hlCard').innerText"))
    ok('7c 1406 fixed-only warning appears (report spans into 1406)','نامعلوم' in ev("document.getElementById('hlCard').innerText"))
    # ===== ۸) نبود خطای اجرایی =====
    ok('8 no JS errors',not errs,errs[:3])
    b.close()
bad=[n for n,c in res if not c]
print(f"\n{len(res)-len(bad)} از {len(res)} بررسی موفق");raise SystemExit(1 if bad else 0)

"""آزمون «تعطیلی‌های اختصاصی مدرسه»: افزودن/ویرایش/حذف، اضطراری، تشخیص از رسمی، تقویم، سوابق دفتر، تأیید ثبت در روز تعطیل.
اجرا: cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/school-closures.e2e.py
ساعت مرورگر: ۱۴۰۵/۰۸/۱۲ (۲۰۲۶-۱۱-۰۳)."""
import json,sys
from playwright.sync_api import sync_playwright
errs=[];res=[];dlg=[];POL={'accept':False}
def ok(name,cond,extra=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra)[:500] if (extra and not cond) else ''))
def ond(d):
    dlg.append(d.message)
    d.accept() if POL['accept'] else d.dismiss()
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1100})
    pg.clock.install(time='2026-11-03T09:00:00')
    pg.on('dialog',ond)
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate;ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'ریاضی'}];S.students=[{id:1,name:'علی'},{id:2,name:'سارا'}];S.wk={d:[0,1,2,3,4],t:1};save()})()""")
    iso=lambda y,m,d: ev(f"JDate.toIso({y},{m},{d})")
    def settings():
        ev("show('set')");pg.wait_for_timeout(500)
    def fill(y,m,d,t,r='',em=False):
        pg.fill('#hl_y',str(y));pg.fill('#hl_m',str(m));pg.fill('#hl_d',str(d));pg.fill('#hl_t',t);pg.fill('#hl_r',r)
        if pg.is_checked('#hl_e')!=em: pg.click('#hl_e')
    def save_form(): pg.click('#hlCard [data-hl="a"]');pg.wait_for_timeout(250)
    def add_():  return ev("JSON.parse(JSON.stringify(S.hol.add))")
    def skip_(): return ev("JSON.parse(JSON.stringify(S.hol.skip))")
    def cal_cell(k):
        ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(200)
        if pg.locator('.dj-calbox').count()==0: pg.click('#dj [data-dj="calendar"]');pg.wait_for_timeout(150)
        return pg.locator(f'.dj-calgrid button[data-dj="calday:{k}"]')
    def close_cal():
        if pg.locator('.dj-calbox').count(): pg.keyboard.press('Escape');pg.wait_for_timeout(100)
    ok('0 holiday card present in settings',(settings() or True) and pg.locator('#hlCard').count()==1)
    sk0=skip_()

    # ===== ۱) افزودن: عنوان + علت + اضطراری =====
    K1='1405-8-13';I1=iso(1405,8,13)   # چهارشنبه
    fill(1405,8,13,'تعطیلی بارش برف','بارش شدید برف و یخبندان',True);save_form()
    a=[x for x in add_() if x['k']==K1]
    ok('1a custom closure saved with title+reason+emergency',len(a)==1 and a[0]['t']=='تعطیلی بارش برف' and a[0]['r']=='بارش شدید برف و یخبندان' and a[0].get('em')==1,add_())
    h=ev(f"holidayInfo('{I1}')")
    ok('1b detected as CUSTOM not official',h['custom'] and not h['official'] and h['src']=='custom' and h['emergency'] and h['reason']=='بارش شدید برف و یخبندان' and h['kind']!='work',h)
    ok('1c dayType carries custom flags',ev(f"(()=>{{const d=dayType('{I1}');return d.custom&&d.emergency&&d.src==='custom'}})()"))
    ok('1d no skip entries created by adding',skip_()==sk0)
    ok('1e custom list shows entry with badges',pg.locator('#hlCu [data-cu="'+K1+'"]').count()==1 and '🚨' in pg.locator('#hlCu [data-cu="'+K1+'"]').inner_text() and 'برف' in pg.locator('#hlCu [data-cu="'+K1+'"]').inner_text())

    # ===== ۲) تشخیص از تعطیل رسمی =====
    OFF=ev("(()=>{for(let m=11;m<=12;m++)for(let d=1;d<=29;d++){const k=JDate.toIso(1405,m,d);if(JDate.weekday(k)<=4&&holidayInfo(k).official)return k}})()")
    ho=ev(f"holidayInfo('{OFF}')")
    ok('2a official day: official=true custom=false',ho['official'] and not ho['custom'],ho)
    ok('2b custom day: official=false custom=true',not h['official'] and h['custom'])
    # سابقه‌ی قدیمی بدون r/em هم کار می‌کند
    ev("(()=>{S.hol.add.push({k:'1405-8-6',t:'تعطیلی قدیمی'});save()})()")
    hl=ev(f"holidayInfo('{iso(1405,8,6)}')");ok('2c legacy entry (no reason/emergency) works',hl['custom'] and hl['label']=='تعطیلی قدیمی' and not hl['emergency'] and hl['reason']=='',hl)
    ev("(()=>{S.hol.add=S.hol.add.filter(x=>x.k!=='1405-8-6');save()})()")

    # ===== ۳) تقویم شمسی =====
    c=cal_cell(I1);cls=c.get_attribute('class') or '';ttl=c.get_attribute('title') or ''
    ok('3a calendar shows custom closure (cu) with emergency (em)','cu' in cls.split() and 'em' in cls.split() and 'of' not in cls.split(),cls)
    ok('3b tooltip has title, emergency and reason','تعطیلی بارش برف' in ttl and 'اضطراری' in ttl and 'بارش شدید برف' in ttl,ttl)
    ok('3c month list under calendar shows reason','بارش شدید برف' in ev("document.querySelector('.dj-hol').innerText"))
    ok('3d legend mentions custom/emergency','اختصاصی' in ev("document.querySelector('.dj-calft small').innerText"))
    close_cal()

    # ===== ۷+قانون ۴) سوابق در روز تعطیل + تأیید ثبت =====
    ev(f"djApi.open('{I1}',null)");pg.wait_for_timeout(250)
    ok('7a banner for custom closure with reason',ev("!!document.getElementById('djCu')") and 'علت' in ev("document.getElementById('djCu').innerText") and 'اضطراری' in ev("document.getElementById('djCu').innerText"))
    # روز تعطیل برای مشاهده قابل انتخاب است
    ok('7b closure day selectable (page shows that date)','۱۳ آبان ۱۴۰۵' in ev("document.querySelector('#dj .dj-day').textContent"),ev("document.querySelector('#dj .dj-day').textContent"))
    # ثبت: ابتدا رد می‌کنیم
    # (تاریخ ۱۳ آبان آینده است؛ برای تست ثبت از یک روز گذشته استفاده می‌کنیم)
    PAST='1405-8-9';PI=iso(1405,8,9)  # یکشنبه گذشته
    ev(f"(()=>{{S.hol.add.push({{k:'{PAST}',t:'تعطیلی اضطراری آب‌گرفتگی',r:'آب‌گرفتگی حیاط',em:1}});save()}})()")
    ev(f"djApi.open('{PI}',null)");pg.wait_for_timeout(250)
    pg.click('#dj [data-dj="manual"]');pg.wait_for_timeout(150)
    ev("(()=>{const s=document.querySelector('#dj select[data-f=course]');s.value='901';s.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(150)
    POL['accept']=False;n0=len(dlg)
    pg.click('#dj [data-dj="item:i1"]');pg.click('#dj [data-dj="mk:1:4"]');pg.wait_for_timeout(200)
    ok('4a registering on closure day asks confirmation',len(dlg)==n0+1 and 'تعطیل' in dlg[-1],dlg[n0:])
    ok('4b declining confirmation → nothing recorded',ev("Object.keys(S.dj.m).filter(k=>k.startsWith('%s')).length"%PI)==0)
    POL['accept']=True;n1=len(dlg)
    pg.click('#dj [data-dj="mk:1:4"]');pg.wait_for_timeout(200)
    ok('4c accepting → recorded',ev("(S.dj.m['%s|m1|i1']||{})['1']"%PI)==4 and len(dlg)==n1+1)
    n2=len(dlg);pg.click('#dj [data-dj="mk:2:3"]');pg.wait_for_timeout(200)
    ok('4d no repeated prompt for same day',len(dlg)==n2 and ev("S.dj.m['%s|m1|i1']['2']"%PI)==3)
    ev("djApi.open('2026-11-02',null)");pg.wait_for_timeout(200);pg.click('#dj [data-dj="manual"]');pg.wait_for_timeout(100)
    ev("(()=>{const s=document.querySelector('#dj select[data-f=course]');s.value='901';s.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(100)
    n3=len(dlg);pg.click('#dj [data-dj="item:i1"]');pg.click('#dj [data-dj="mk:1:4"]');pg.wait_for_timeout(200)
    ok('4e work day: no confirmation prompt',len(dlg)==n3 and ev("S.dj.m['2026-11-02|m1|i1']['1']")==4)
    snapM=ev("JSON.stringify([S.dj.m,S.dj.ses,S.dj.n])")

    # ===== ۴) ویرایش =====
    settings()
    ok('4f past closure listed in custom list',pg.locator(f'#hlCu [data-cu="{PAST}"]').count()==1)
    pg.click(f'#hlCu [data-cu="{PAST}"] [data-hl="ec"]');pg.wait_for_timeout(200)
    ok('5a edit form prefilled (title/reason/emergency)',pg.input_value('#hl_t')=='تعطیلی اضطراری آب‌گرفتگی' and pg.input_value('#hl_r')=='آب‌گرفتگی حیاط' and pg.is_checked('#hl_e') and pg.input_value('#hl_d')=='9',(pg.input_value('#hl_t'),pg.input_value('#hl_d')))
    sk1=skip_()
    pg.fill('#hl_t','تعطیلی تعمیرات ساختمان');pg.fill('#hl_r','تعمیر سیستم گرمایش');pg.click('#hl_e');pg.fill('#hl_d','10');save_form()
    A=add_()
    ok('5b edit moved entry 9→10 with new title/reason, emergency off',not any(x['k']==PAST for x in A) and any(x['k']=='1405-8-10' and x['t']=='تعطیلی تعمیرات ساختمان' and x['r']=='تعمیر سیستم گرمایش' and not x.get('em') for x in A),A)
    ok('5c editing a custom closure does not hide any official holiday (skip unchanged)',skip_()==sk1)
    ok('5d journal records of old date untouched by edit',ev("JSON.stringify([S.dj.m,S.dj.ses,S.dj.n])")==snapM)
    h=ev(f"holidayInfo('{PI}')");ok('5e old date now a normal work day in dayType',h['kind']=='work' and not h['custom'],h)
    ev(f"djApi.open('{PI}',null)");pg.wait_for_timeout(200)
    ok('5f records of the old date still visible when opening it',ev("document.querySelectorAll('#dj [data-dj^=\"bell:\"]').length")==1 and ev("djApi.summary(1).some(r=>r.g[4]>=1)"))
    settings()

    # ===== ۵) حذف =====
    K2='1405-8-10';I2=iso(1405,8,10)
    ev(f"(()=>{{S.dj.ses['{I2}|m1']={{c:901,tp:'',nt:'',it:{{i1:{{n:'حل مسئله',t:'g',hw:0}}}}}};S.dj.m['{I2}|m1|i1']={{1:3}};save()}})()")
    snapM=ev("JSON.stringify([S.dj.m,S.dj.ses,S.dj.n])")
    POL['accept']=False;nd=len(dlg)
    pg.click(f'#hlCu [data-cu="{K2}"] [data-hl="dc"]');pg.wait_for_timeout(200)
    ok('6a delete asks confirmation; decline keeps entry',len(dlg)==nd+1 and any(x['k']==K2 for x in add_()))
    POL['accept']=True
    pg.click(f'#hlCu [data-cu="{K2}"] [data-hl="dc"]');pg.wait_for_timeout(250)
    ok('6b accepted delete removes closure',not any(x['k']==K2 for x in add_()))
    ok('6c deleting closure did NOT delete journal records',ev("JSON.stringify([S.dj.m,S.dj.ses,S.dj.n])")==snapM)
    ok('6d day returns to normal (work)',ev(f"dayType('{I2}').kind")=='work')
    c=cal_cell(I2);ok('6e calendar no longer marks the day as closure','cu' not in (c.get_attribute('class') or '').split() and 'hd' in (c.get_attribute('class') or '').split(),c.get_attribute('class'));close_cal()
    ev(f"djApi.open('{I2}',null)");pg.wait_for_timeout(200)
    ok('6f records still viewable after deletion (bell + mark)',ev("document.querySelectorAll('#dj [data-dj^=\"bell:\"]').length")==1 and ev("djApi.summary(1).some(r=>r.g[3]>=1)"))
    ok('6g official holidays unaffected by deleting custom',ev(f"holidayInfo('{OFF}').official"))
    ok('6h deleted custom does not appear in skip list ("restore" not needed)',skip_()==sk0)

    # ===== اضطراری برای امروز =====
    settings();pg.click('#hlCard [data-hl="em"]');pg.wait_for_timeout(200)
    ok('8a emergency button prefills today + emergency',pg.input_value('#hl_y')=='1405' and pg.input_value('#hl_m')=='8' and pg.input_value('#hl_d')=='12' and pg.is_checked('#hl_e'),(pg.input_value('#hl_y'),pg.input_value('#hl_m'),pg.input_value('#hl_d')))
    pg.fill('#hl_t','تعطیلی اضطراری امروز');pg.fill('#hl_r','قطع آب و برق');save_form()
    ok('8b today emergency closure saved',any(x['k']=='1405-8-12' and x.get('em')==1 and x['r']=='قطع آب و برق' for x in add_()))
    ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(250)
    ok('8c journal today shows emergency banner',ev("!!document.getElementById('djCu')") and 'اضطراری' in ev("document.getElementById('djCu').innerText"))
    ok('8d dashboard nextHol reports today closed',ev("(()=>{const n=nextHol();return n?n.title:''})()").startswith('امروز تعطیل است'),ev("(()=>{const n=nextHol();return n?n.title:''})()"))
    # ===== اعتبارسنجی =====
    settings();na=len(add_())
    fill(1405,13,5,'ماه نامعتبر');save_form();ok('9a invalid month rejected',len(add_())==na and 'وجود ندارد' in pg.inner_text('#hl_x'))
    fill(1405,8,20,'');save_form();ok('9b empty title rejected',len(add_())==na and 'عنوان' in pg.inner_text('#hl_x'))
    # ===== ماندگاری =====
    keep=ev("JSON.stringify(S.hol)");pg.reload();pg.wait_for_timeout(2500)
    ok('10 closures survive reload',ev("JSON.stringify(S.hol)")==keep and 'قطع آب و برق' in keep)
    ok('11 no JS errors',not errs,errs[:5])
    bad=[n for n,c in res if not c];print(f"\n{len(res)-len(bad)}/{len(res)} passed")
    if bad:print('FAILED:',bad)
    b.close();sys.exit(1 if bad else 0)

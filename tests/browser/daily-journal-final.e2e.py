"""آزمون نهایی دفتر روزانه (Playwright پایتون): ثبت ارزشیابی، حفظ سوابق، تعطیل، ناقص‌ها، تقویم، موبایل/دسکتاپ، سایر بخش‌ها.
اجرا:  cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/daily-journal-final.e2e.py
ساعت مرورگر روی ۱۴۰۵/۰۸/۱۲ (سه‌شنبه ۲۰۲۶-۱۱-۰۳) ثابت می‌شود."""
import json,sys
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(name,cond,extra=''):
    res.append((name,bool(cond)));print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra)[:500] if (extra and not cond) else ''))
TODAY='2026-11-03'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':420,'height':1100})
    pg.clock.install(time=TODAY+'T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'ریاضی'},{id:902,name:'فارسی'}];
      S.students=[{id:1,name:'علی'},{id:2,name:'سارا'},{id:3,name:'رضا'},{id:4,name:'مینا'}];
      S.wk={d:[0,1,2,3,4],t:1};S.att=S.att||{};S.att['2026-11-03']={4:'a'};S.att['2026-11-02']={4:'a'};save()})()""")
    def go(k,b_=None):
        ev(f"djApi.open('{k}',{json.dumps(b_)})");pg.wait_for_timeout(200)
    def click(sel): pg.click(sel);pg.wait_for_timeout(120)
    def M(): return ev("JSON.parse(JSON.stringify(S.dj.m))")
    def mark(sid,v): click(f'#dj [data-dj="mk:{sid}:{v}"]')
    ok('0 clock fixed on 2026-11-03',ev("(()=>{const n=new Date();return n.getFullYear()+'-'+(n.getMonth()+1)+'-'+n.getDate()})()")=='2026-11-3')
    other_before=ev("JSON.stringify({s:S.students,c:S.courses,a:S.att})")

    # ===== ۱) ثبت خارج از برنامه‌ی هفتگی (S.wsc تعریف نشده) =====
    WSC0=ev("JSON.stringify(S.wsc===undefined?null:S.wsc)")
    ok('1a weekly schedule has no lesson cells (nothing scheduled)',ev("!S.wsc||!S.wsc.cell||Object.keys(S.wsc.cell).length===0"),WSC0)
    go(TODAY);ok('1b today has no bells but page works',ev("document.querySelectorAll('#dj [data-dj^=\"bell:\"]').length")==0 and pg.locator('#dj [data-dj="manual"]').count()==1)
    click('#dj [data-dj="manual"]')
    ok('1c manual bell m1 created',ev("!!S.dj.ses['2026-11-03|m1']"))
    ev("document.querySelector('#dj select[data-f=course]').value='901';document.querySelector('#dj select[data-f=course]').dispatchEvent(new Event('change',{bubbles:true}))");pg.wait_for_timeout(150)
    items=ev("[...document.querySelectorAll('#dj .dj-it [data-dj^=\"item:\"]')].map(e=>e.dataset.dj.slice(5))")
    ok('1d suggested activities of ریاضی listed',len(items)>=5 and 'i0' in items,items)
    click('#dj [data-dj="item:i1"]');mark(1,4)
    ok('1e record saved without weekly schedule',M().get('2026-11-03|m1|i1',{}).get('1')==4)
    ok('1f S.wsc not changed by journal',ev("JSON.stringify(S.wsc===undefined?null:S.wsc)")==WSC0)

    # ===== ۲) چند فعالیت برای یک روز =====
    click('#dj [data-dj="item:i0"]');mark(1,1)   # تکلیف انجام شد
    click('#dj [data-dj="item:i4"]');mark(2,3)
    click('#dj [data-dj="manual"]')
    ev("document.querySelector('#dj select[data-f=course]').value='902';document.querySelector('#dj select[data-f=course]').dispatchEvent(new Event('change',{bubbles:true}))");pg.wait_for_timeout(150)
    click('#dj [data-dj="item:i2"]');mark(1,2);mark(3,1)
    m=M()
    ok('2a three activities in bell1 + one in bell2 recorded',all(k in m for k in ['2026-11-03|m1|i1','2026-11-03|m1|i0','2026-11-03|m1|i4','2026-11-03|m2|i2']),list(m))
    ok('2b earlier record untouched after later ones',m['2026-11-03|m1|i1']['1']==4)
    ok('2c two sessions in same day',ev("Object.keys(S.dj.ses).filter(k=>k.startsWith('2026-11-03')).length")==2)

    # ===== ۵) ارزشیابی: برچسب‌ها، بدون کد کوتاه، ویرایش، گروهی =====
    go(TODAY,'m1');click('#dj [data-dj="item:i1"]')
    labs=ev("[...new Set([...document.querySelectorAll('#dj .dj-row [data-dj^=\"mk:\"]')].map(e=>e.textContent.trim()))]")
    ok('5a only the 4 full phrases as buttons',sorted(labs)==sorted(['خیلی خوب','خوب','قابل قبول','نیاز به تلاش بیشتر']),labs)
    txt=ev("document.getElementById('dj').innerText")
    import re
    short=[t for t in ['خخ','ق','ن'] if re.search(r'(^|[\s·:/،])'+t+r'($|[\s·:/،])',txt)]
    ok('5b short codes خخ/خ/ق/ن never shown in journal',not short and not re.search(r'(^|\s)خ(\s|$)',txt),short)
    ok('5c student list shows present+absent students',ev("document.querySelectorAll('#dj .dj-row').length")==4 and ev("document.querySelectorAll('#dj .dj-row.ab').length")==1)
    ok('5d absent student buttons disabled',ev("[...document.querySelectorAll('#dj .dj-row.ab [data-dj^=\"mk:\"]')].every(e=>e.disabled)"))
    mark(2,2);ok('5e individual eval saved',M()['2026-11-03|m1|i1']['2']==2)
    mark(2,4);ok('5f edit evaluation 2→4',M()['2026-11-03|m1|i1']['2']==4)
    snap=M()
    click('#dj [data-dj="bulk:3"]')   # فقط ثبت‌نشده‌ها
    m=M()['2026-11-03|m1|i1']
    ok('5g bulk fills only unregistered (3 only)',m['3']==3 and m['1']==4 and m['2']==4 and '4' not in m,m)
    click('#dj [data-dj="selmode"]');ev("document.querySelector('#dj input[type=checkbox]').click()");pg.wait_for_timeout(100)
    click('#dj [data-dj="bulk:1"]')
    m=M()['2026-11-03|m1|i1']
    ok('5h bulk on selected leaves unselected students intact',m['2']==4 and m['3']==3 and m['1']==1,m)
    click('#dj [data-dj="selmode"]');mark(1,4)  # برگرداندن
    other=M()
    ok('5i other activities not overwritten by new evaluation',other['2026-11-03|m1|i4']=={'2':3} and other['2026-11-03|m2|i2']=={'1':2,'3':1},other)

    # ===== ۶) تکلیف و توضیح اختصاصی =====
    go(TODAY,'m1');click('#dj [data-dj="item:i0"]')
    hw=ev("JSON.parse(JSON.stringify(S.hwl||[]))")
    ok('6a homework item mirrored to S.hwl',any(h['id']=='dj:2026-11-03|m1|i0' and h['st'].get('1')=='d' for h in hw),hw)
    mark(2,0)
    hw=ev("S.hwl.find(h=>h.id==='dj:2026-11-03|m1|i0')");ok('6b homework not-done recorded (n)',hw['st']['2']=='n' and hw['st']['1']=='d',hw)
    click('#dj [data-dj="note:2"]');ev("(()=>{const i=document.querySelector('#dj input[data-nt=\"2\"]');i.value='دفتر را نیاورده';i.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(150)
    ok('6c per-student note saved',ev("S.dj.n['2026-11-03|m1|i0|2']")=='دفتر را نیاورده')
    ok('6d note of another student/activity absent',ev("Object.keys(S.dj.n).length")==1)
    sm=ev("djApi.summary(2)");ok('6e student record shows math: not done=1 and note',any(r['c']==901 and r['no']==1 and any(n['t']=='دفتر را نیاورده' for n in r['last']) for r in sm),sm)

    # ===== ۳/۴) ویرایش و حذف فعالیت پیشنهادی بدون تغییر سوابق =====
    before=json.dumps({'m':M(),'n':ev("S.dj.n"),'ses':ev("S.dj.ses"),'hwl':ev("S.hwl"),'sum1':ev("djApi.summary(1)"),'sum2':ev("djApi.summary(2)")},sort_keys=True)
    go(TODAY,'m1')
    if pg.locator('#dj .dj-ted').count()==0: click('#dj [data-dj="tpl"]')
    ev("(()=>{const i=document.querySelector('#dj input[data-tn=\"i1\"]');i.value='حل مسئله‌ی کلامی (نام جدید)';i.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(150)
    ok('3a rename saved in template',ev("S.dj.tpl[901].find(x=>x.id==='i1').n")=='حل مسئله‌ی کلامی (نام جدید)')
    ev("(()=>{const i=document.querySelector('#dj select[data-tt=\"i1\"]');i.value='d';i.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(150)
    after=json.dumps({'m':M(),'n':ev("S.dj.n"),'ses':ev("S.dj.ses"),'hwl':ev("S.hwl"),'sum1':ev("djApi.summary(1)"),'sum2':ev("djApi.summary(2)")},sort_keys=True)
    ok('4a rename+type change leaves records/snapshots/hwl/summary unchanged',before==after)
    ok('4b old record still evaluated 4-level after type change (snapshot t=g)',ev("S.dj.ses['2026-11-03|m1'].it.i1.t")=='g' and ev("S.dj.ses['2026-11-03|m1'].it.i1.n")=='حل مسئله')
    go(TODAY,'m1')
    if pg.locator('#dj .dj-ted').count()==0: click('#dj [data-dj="tpl"]')
    click('#dj [data-dj="tpldel:i1"]')
    after2=json.dumps({'m':M(),'n':ev("S.dj.n"),'ses':ev("S.dj.ses"),'hwl':ev("S.hwl"),'sum1':ev("djApi.summary(1)"),'sum2':ev("djApi.summary(2)")},sort_keys=True)
    ok('3b delete activity keeps all records, notes, snapshots, hwl, summaries',before==after2)
    ok('3c delete does not touch other course template/records',ev("Array.isArray(S.dj.tpl[902])===false")  and 'i2' in ' '.join(ev("Object.keys(S.dj.m)")) )
    vis=ev("document.getElementById('dj').innerText")
    ok('3d OLD records of deleted activity still visible in journal page (chip + student marks)',ev("!!document.querySelector('#dj [data-dj=\"item:i1\"]')"),'deleted activity chip missing from session card')
    click('#dj [data-dj="item:i1"]');ok('3d2 old record values shown and editable after delete',ev("document.querySelectorAll('#dj .dj-row .dj-b.on').length")>=3 and ev("S.dj.m['2026-11-03|m1|i1']['1']")==4)
    ok('3e student file summary still lists the old record',any(r['c']==901 and r['g']['4']>=1 for r in ev("djApi.summary(1)")))

    # ===== ۷) روز تعطیل و سوابق =====
    ev("(()=>{S.closed=S.closed||{};S.closed['2026-11-03']=1;save()})()")
    go(TODAY);ok('7a closed day shows holiday warning',ev("!!document.querySelector('#dj .dj-warn')") and 'تعطیل' in ev("document.getElementById('dj').innerText"))
    ok('7b records of the closed day still listed (2 bells)',ev("document.querySelectorAll('#dj [data-dj^=\"bell:\"]').length")==2)
    go(TODAY,'m1');click('#dj [data-dj="item:i4"]');ok('7c records visible on closed day (student mark shown as selected)',ev("document.querySelectorAll('#dj .dj-row .dj-b.on').length")>=1 and ev("S.dj.m['2026-11-03|m1|i4']['2']")==3)
    ev("(()=>{delete S.closed['2026-11-03'];save()})()")
    # تعطیل رسمی: ۱۴۰۵/۱۱/۲۲ ؛ تاریخ آینده -> ثبت نمی‌شود
    fut=ev("(()=>{for(let m=11;m<=12;m++)for(let d=1;d<=29;d++){const k=JDate.toIso(1405,m,d);if(k>'2026-11-03'&&JDate.weekday(k)<=4&&holidayInfo(k).official)return k}})()");go(fut)
    ok('7d official holiday banner appears',ev("!!document.getElementById('djHol')"))
    click('#dj [data-dj="manual"]');ev("document.querySelector('#dj select[data-f=course]').value='901';document.querySelector('#dj select[data-f=course]').dispatchEvent(new Event('change',{bubbles:true}))");pg.wait_for_timeout(100)
    click('#dj [data-dj="item:i0"]');mark(1,1)
    ok('7e future date rejected (no record)',not any(k.startswith(fut) for k in ev("Object.keys(S.dj.m)")))

    # ===== ۸) دفترهای ناقص =====
    ev("""(()=>{S.wsc={n:2,per:[{s:'08:00'},{s:'09:00'}],cell:{}};for(let di=0;di<5;di++){S.wsc.cell[di+'_0']=901;S.wsc.cell[di+'_1']=902}save()})()""")
    pend=ev("djApi.pending(7)")
    ok('8a pending lists unrecorded bells of recent workdays',len(pend)>=8,len(pend))
    d2='2026-11-02'  # دوشنبه: dow=2
    go(d2,'0');click('#dj [data-dj="item:i4"]');mark(1,3)
    ok('8b partially recorded bell flagged "part"',any(x['k']==d2 and x['b']=='0' and x['q']=='part' for x in ev("djApi.pending(7)")))
    # کامل‌کردن: همه حاضرها (۳ نفر) برای تنها فعالیت ثبت‌شده
    click('#dj [data-dj="bulk:3"]')
    ok('8c bell becomes full (not pending) after all present registered',not any(x['k']==d2 and x['b']=='0' for x in ev("djApi.pending(7)")))
    click('#dj [data-dj="skip"]') if False else None
    ev("(()=>{const s=S.dj.ses['2026-11-02|1']||(S.dj.ses['2026-11-02|1']={c:902,tp:'',nt:''});s.st='skip';save()})()")
    ok('8d skipped bell not pending',not any(x['k']==d2 and x['b']=='1' for x in ev("djApi.pending(7)")))
    ev("(w=>{S.wsc=w;save()})(JSON.parse(%s))"%json.dumps(WSC0))

    # ===== ۹) تقویم شمسی =====
    go(TODAY);click('#dj [data-dj="calendar"]')
    ok('9a calendar opens on current Shamsi month',ev("document.querySelector('.dj-calsel select[data-calm]').value")=='8' and ev("document.querySelector('.dj-calsel select[data-caly]').value")=='1405')
    ok('9b day label is Shamsi (12 Aban 1405)','۱۲ آبان ۱۴۰۵' in ev("document.querySelector('#dj .dj-day').textContent"),ev("document.querySelector('#dj .dj-day').textContent"))
    iso=ev("JDate.toIso(1405,8,5)");click(f'.dj-calgrid button[data-dj="calday:{iso}"]')
    ok('9c pick 5 Aban 1405 → label',ev("document.querySelector('#dj .dj-day').textContent").startswith('جمعه ۵ آبان ۱۴۰۵') or '۵ آبان ۱۴۰۵' in ev("document.querySelector('#dj .dj-day').textContent"),ev("document.querySelector('#dj .dj-day').textContent"))
    click('#dj [data-dj="nav:-1"]');ok('9d previous day = 4 Aban',('۴ آبان' in ev("document.querySelector('#dj .dj-day').textContent")))
    click('#dj [data-dj="calendar"]');ok('9e recorded days marked in calendar',ev("document.querySelectorAll('.dj-calgrid button.hd').length")>=2)
    pg.keyboard.press('Escape');pg.wait_for_timeout(100);ok('9f Esc closes calendar',pg.locator('.dj-calbox').count()==0)

    # ===== ۱۰) موبایل و دسکتاپ =====
    for w,h in [(360,740),(420,900),(768,1024),(1440,900)]:
        pg.set_viewport_size({'width':w,'height':h});go(TODAY,'m1');click('#dj [data-dj="item:i4"]')
        ov=ev("({d:document.documentElement.scrollWidth-document.documentElement.clientWidth,j:document.getElementById('dj').scrollWidth-document.getElementById('dj').clientWidth})")
        ok(f'10 no horizontal overflow at {w}px',ov['d']<=1 and ov['j']<=1,ov)
        small=ev("[...document.querySelectorAll('#dj .dj-b')].filter(e=>e.getBoundingClientRect().height<36).length")
        ok(f'10 touch targets >=36px at {w}px',small==0,small)
        pg.screenshot(path=f'/tmp/dj-{w}.png')
    pg.set_viewport_size({'width':420,'height':1100})

    # ===== پایداری بعد از بارگذاری مجدد =====
    keep=ev("JSON.stringify(S.dj)");pg.reload();pg.wait_for_timeout(2500)
    ok('12 journal data survives reload',ev("JSON.stringify(S.dj)")==keep)
    ok('12b hwl survives reload',ev("(S.hwl||[]).some(h=>h.id==='dj:2026-11-03|m1|i0')"))

    # ===== ۱۱) سایر بخش‌ها =====
    now=ev("JSON.stringify({s:S.students.map(x=>[x.id,x.name]).sort(),c:S.courses.map(x=>[x.id,x.name]),a:S.att})")
    ok('11a students/courses/attendance unchanged (app may re-sort students and add empty ch[] on load)',now==json.dumps({'s':sorted([[1,'علی'],[2,'سارا'],[3,'رضا'],[4,'مینا']]),'c':[[901,'ریاضی'],[902,'فارسی']],'a':{'2026-11-03':{'4':'a'},'2026-11-02':{'4':'a'}}},separators=(',',':'),ensure_ascii=False),now)
    pages=ev("pages.map(p=>p[0])");bad=[]
    for pid in pages:
        before_e=len(errs)
        try: ev(f"show('{pid}')");pg.wait_for_timeout(150)
        except Exception as ex: bad.append((pid,str(ex)[:80]))
        if len(errs)>before_e: bad.append((pid,errs[before_e:]))
    ok(f'11b all {len(pages)} pages open without JS errors',not bad,bad)
    ev("show('home')");pg.wait_for_timeout(200)
    ok('12 no JS errors during whole run',not errs,errs[:5])
    bad=[n for n,c in res if not c]
    print(f"\n{len(res)-len(bad)}/{len(res)} passed");
    if bad: print('FAILED:',bad)
    b.close();sys.exit(1 if bad else 0)

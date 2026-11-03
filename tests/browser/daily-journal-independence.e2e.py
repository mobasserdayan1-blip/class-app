"""تست مرورگر «استقلال کامل دفتر روزانه از برنامه‌ی هفتگی و زنگ‌ها» (Playwright پایتون).
بر خلاف daily-journal.e2e.py اینجا برنامه‌ی هفتگی با خودِ رابط (کلیک روی خانه‌ها) ساخته/تغییر داده می‌شود،
نه با نوشتن مستقیم در S.wsc.
اجرا (سرور باید در همان دستور بالا بیاید):
  cd <پوشه‌ی پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/daily-journal-independence.e2e.py
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
    ev("""()=>{S.courses=[{id:1,name:'قرآن'},{id:2,name:'ریاضی'},{id:3,name:'علوم'}];delete S.wsc;S.dj=undefined;delete S.dj;}""")
    today=ev("new Date(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),12)).toISOString().slice(0,10)")
    di=ev("(new Date().getDay()+1)%7")
    sid1=ev("S.students[0].id");sid2=ev("S.students[1].id")
    # اطمینان از غایب نبودن دانش‌آموزان آزمون
    ev("()=>{S.att=S.att||{};}")
    def subj(name): return ev(f"DailyJournalCore.getCat(S.dj||(S.dj={{}})).find(s=>s.n==='{name}').id")
    def first_path(sj):
        return ev(f"(()=>{{const s=DailyJournalCore.subjOf(S.dj,'{sj}');const u=s.subs.find(x=>!x.x);const a=u.acts.find(x=>!x.x&&x.t==='g');return [u.id,a.id]}})()")
    def record(sname,sid,val=3):
        sj=subj(sname);u,a=first_path(sj)
        ev("djApi.open(null,null)")  # صفحه‌ی دفتر در تاریخ جاری
        pg.click(f'#dj [data-dj="subj:{sj}"]');pg.click(f'#dj [data-dj="sub:{u}"]');pg.click(f'#dj [data-dj="act:{a}"]')
        pg.click(f'#dj [data-dj="mk:{sid}:{val}"]')
        return f"{today}|{sj}|{u}|{a}"

    # ===== ۱) بدون هیچ برنامه‌ی هفتگی =====
    ev("show('dj')");pg.wait_for_timeout(300)
    ok('1a journal page renders with no timetable at all',pg.locator('#dj [data-dj^="subj:"]').count()>=9)
    k1=record('علوم',sid1)
    ok('1b record saved for a subject with no timetable (key has 4 parts, no bell)',ev(f"(S.dj.rec['{k1}']||{{}})[{sid1}]")==3 and len(k1.split('|'))==4,ev("JSON.stringify(S.dj.rec)"))
    ok('1c journal did NOT create S.wsc',ev("S.wsc===undefined"),ev("JSON.stringify(S.wsc)"))

    # ===== ۲) ساختن برنامه‌ی هفتگی با رابط واقعی: قرآن زنگ ۱، ریاضی زنگ ۲ (علوم عمداً نیست) =====
    if di<=4:
        ev("show('wsc')");pg.wait_for_timeout(400)
        for per,cid in ((0,1),(1,2)):
            pg.click(f'#wsc .ws-c[data-d="{di}"][data-p="{per}"]');pg.wait_for_timeout(100)
            pg.click(f'#wsSheet [data-c="{cid}"]');pg.click('#wsSheet [data-sv]');pg.wait_for_timeout(150)
        ok('2a timetable built through real UI',ev(f"JSON.stringify(S.wsc.cell['{di}_0'])+JSON.stringify(S.wsc.cell['{di}_1'])").count('"c"')==2 or ev(f"!!S.wsc.cell['{di}_0']&&!!S.wsc.cell['{di}_1']"),ev("JSON.stringify(S.wsc)"))
        wsnap=ev("JSON.stringify(S.wsc)")
        ev("show('dj')");pg.wait_for_timeout(300)
        ok('2b timetable only suggests: dashed chips for قرآن/ریاضی',pg.locator('#dj .dj-ch.sg').count()>=2,pg.locator('#dj .dj-ch.sg').count())
        # --- سناریوی اصلی: ثبت برای درسی که امروز در برنامه‌ی هفتگی نیست (علوم) ---
        k2=record('علوم',sid2,4)
        ok('2c MAIN: record for subject outside today\'s timetable saved',ev(f"(S.dj.rec['{k2}']||{{}})[{sid2}]")==4,ev("JSON.stringify(S.dj.rec)"))
        ok('2d MAIN: recording left the weekly timetable byte-identical',ev("JSON.stringify(S.wsc)")==wsnap)
        k3=record('قرآن',sid1,2)
        ok('2e record for a subject that IS in the timetable also has no bell in key',ev(f"(S.dj.rec['{k3}']||{{}})[{sid1}]")==2 and len(k3.split('|'))==4)
        ok('2f recording left the timetable unchanged (again)',ev("JSON.stringify(S.wsc)")==wsnap)
        djsnap=ev("JSON.stringify(S.dj)")

        # ===== ۳) تغییر برنامه‌ی هفتگی با رابط واقعی؛ دفتر نباید عوض شود =====
        ev("show('wsc')");pg.wait_for_timeout(300)
        pg.click(f'#wsc .ws-c[data-d="{di}"][data-p="0"]');pg.wait_for_timeout(100)
        pg.click('#wsSheet [data-em]');pg.click('#wsSheet [data-sv]');pg.wait_for_timeout(150)   # خالی کردن زنگ ۱ (حذف قرآن)
        ok('3a bell 1 emptied via UI',ev(f"!S.wsc.cell['{di}_0']||(Array.isArray(S.wsc.cell['{di}_0'])&&!S.wsc.cell['{di}_0'].length)"),ev("JSON.stringify(S.wsc.cell)"))
        ok('3b journal data identical after emptying a bell',ev("JSON.stringify(S.dj)")==djsnap)
        pg.click(f'#wsc .ws-c[data-d="{di}"][data-p="1"]');pg.wait_for_timeout(100)
        pg.click('#wsSheet [data-c="3"]');pg.click('#wsSheet [data-c="2"]');pg.click('#wsSheet [data-sv]');pg.wait_for_timeout(150)  # تغییر ریاضی→علوم
        ok('3c0 sanity: timetable REALLY changed through the UI (test is not vacuous)',ev("JSON.stringify(S.wsc)")!=wsnap)
        ok('3c journal data identical after changing a bell\'s course',ev("JSON.stringify(S.dj)")==djsnap)
        ev("""()=>{const w=S.wsc;w.n=2;w.start='09:30';w.dur=40;save()}""")   # تغییر تعداد/ساعت زنگ‌ها
        ev("show('wsc');show('dj')");pg.wait_for_timeout(300)
        ok('3d journal data identical after changing bell count/times',ev("JSON.stringify(S.dj)")==djsnap)
        # پاک‌کردن کل برنامه‌ی هفتگی
        ev("show('wsc')");pg.wait_for_timeout(300)
        if pg.locator('#wsc [data-a="clear"]').count():
            pg.click('#wsc [data-a="clear"]');pg.wait_for_timeout(150)
            if pg.locator('#wsSheet [data-yes]').count(): pg.click('#wsSheet [data-yes]')
            pg.wait_for_timeout(200)
        else:
            ev("S.wsc.cell={};save()")
        ok('3e whole timetable cleared',ev("Object.keys((S.wsc||{}).cell||{}).filter(k=>S.wsc.cell[k]&&(!Array.isArray(S.wsc.cell[k])||S.wsc.cell[k].length)).length")==0,ev("JSON.stringify(S.wsc&&S.wsc.cell)"))
        ev("show('dj')");pg.wait_for_timeout(300)
        ok('3f journal data identical after clearing the timetable',ev("JSON.stringify(S.dj)")==djsnap)
        ok('3g records still shown in journal day list',pg.locator('#dj').inner_text().count('ثبت')>=1)
    else:
        print('SKIP timetable-UI steps (today is outside the 5-day timetable)')

    # ===== ۴) روز تعطیل (جمعه) و روز بسته: فقط هشدار، ثبت مجاز =====
    fri='2026-10-30'
    ev(f"djApi.open('{fri}',null)");pg.wait_for_timeout(300)
    ok('4a holiday shows warning only',pg.locator('#dj .dj-warn').count()>=1)
    sj=subj('ریاضی');u,a=first_path(sj)
    pg.click(f'#dj [data-dj="subj:{sj}"]');pg.click(f'#dj [data-dj="sub:{u}"]');pg.click(f'#dj [data-dj="act:{a}"]')
    pg.click(f'#dj [data-dj="mk:{sid1}:3"]')
    ok('4b record on a Friday saved (no timetable for that day)',ev(f"(S.dj.rec['{fri}|{sj}|{u}|{a}']||{{}})[{sid1}]")==3,ev("JSON.stringify(Object.keys(S.dj.rec))"))
    ev("S.closed=S.closed||{};S.closed['2026-10-28']=true;save()")
    ev("djApi.open('2026-10-28',null)");pg.wait_for_timeout(300)
    pg.click(f'#dj [data-dj="subj:{sj}"]');pg.click(f'#dj [data-dj="sub:{u}"]');pg.click(f'#dj [data-dj="act:{a}"]')
    pg.click(f'#dj [data-dj="mk:{sid2}:1"]')
    ok('4c record on a closed (S.closed) day saved',ev(f"(S.dj.rec['2026-10-28|{sj}|{u}|{a}']||{{}})[{sid2}]")==1)

    # ===== ۵) حذف ثبت (toggle) برنامه‌ی هفتگی را نمی‌زند؛ ثبت‌های دیگر می‌مانند =====
    ev("S.wsc=S.wsc||{cell:{},n:2};save()")
    wsnap2=ev("JSON.stringify(S.wsc)");before=ev("Object.keys(S.dj.rec).length")
    pg.click(f'#dj [data-dj="mk:{sid2}:1"]')   # دوباره همان سطح → برداشتن
    ok('5a removing a mark leaves timetable byte-identical',ev("JSON.stringify(S.wsc)")==wsnap2)
    ok('5b removing a mark does not delete other records',ev("Object.values(S.dj.rec).reduce((n,o)=>n+Object.keys(o).length,0)")>=3)

    # ===== ۶) ماندگاری بعد از بازخوانی =====
    snap=ev("JSON.stringify(S.dj.rec)")
    pg.evaluate("window.__flushStore&&window.__flushStore()");pg.wait_for_timeout(600)
    pg.reload();pg.wait_for_timeout(2500)
    ok('6a journal records persisted after reload',ev("JSON.stringify(S.dj.rec)")==snap)
    ok('6b journal still renders after reload',(ev("show('dj')") or True) and pg.locator('#dj [data-dj^="subj:"]').count()>=9)
    ok('7 no JS errors',not errs,errs)
    n=sum(1 for _,c in res if c);print(f'\nTOTAL {n} / {len(res)}')
    b.close()
    sys.exit(0 if n==len(res) else 1)

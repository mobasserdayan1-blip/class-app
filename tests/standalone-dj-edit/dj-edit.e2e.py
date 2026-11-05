"""آزمون مستقل cl-v158 (بدون نیاز به کل برنامه): ویرایش خانه‌های جدول عملکرد + شاخص کل سال. اجرا: python3 tests/standalone-dj-edit/dj-edit.e2e.py"""
from playwright.sync_api import sync_playwright
import http.server,threading,socketserver,functools,os
BASE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.normpath(os.path.join(BASE,'..','..'))
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT)
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',8793),H);threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:400]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-11-03T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto('http://127.0.0.1:8793/tests/standalone-dj-edit/index.html');pg.wait_for_timeout(800)
    ev=pg.evaluate
    ok('بارگذاری ماژول',ev("!!window.djApi && typeof djApi.levels==='function'"))
    ok('جدول عملکرد رندر شد',ev("!!document.querySelector('#djMx table')"),errs)
    n=ev("document.querySelectorAll('#djMx td.dj-ed').length");ok('خانه‌های قابل ویرایش وجود دارند',n>0,n)
    # levels API
    ok('levels فارسی علی',sorted(ev("djApi.levels(1,901)"))==[2,4],ev("djApi.levels(1,901)"))
    ok('levels ریاضی علی (بدون تکلیف d، با مثبت/منفی)',ev("djApi.levels(1,902)")==[3],ev("djApi.levels(1,902)"))
    ok('levels غایب (سارا ۱۱-۰۲) حذف',ev("djApi.levels(2,null,{pred:k=>k==='2026-11-02'})")==[],ev("djApi.levels(2,null,{pred:k=>k==='2026-11-02'})"))
    # سطح ۴سطحی: کلیک روی خانه‌ی علی در a2
    def cell(txt_col):
        return None
    # همه‌ی ستون‌ها را پیدا کن
    cols=ev("mxBuild? 1:0") if False else None
    # از روی data-dj
    a2=ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)")
    k_a2=[x for x in a2 if 'a2' in x and x.endswith(':1')]
    ok('خانه‌ی a2 برای علی',len(k_a2)==1,a2)
    pg.locator(f'#djMx td[data-dj="{k_a2[0]}"]').click();pg.wait_for_timeout(150)
    ok('پنجره‌ی ویرایش باز شد',ev("!!document.getElementById('djMxEd')"))
    pg.locator('#djMxEd [data-me="mk:2"]').click();pg.wait_for_timeout(200)
    ok('سطح علی در a2 شد ۲',ev("S.dj.m['2026-11-03|m1|a2'][1]")==2,ev("S.dj.m['2026-11-03|m1|a2'][1]"))
    ok('جدول بازرسم شد و پنجره باز ماند',ev("!!document.getElementById('djMxEd')&&!!document.querySelector('#djMx table')"))
    pg.locator('#djMxEd [data-me="clr"]').click();pg.wait_for_timeout(200)
    ok('پاک‌کردن ثبت',ev("S.dj.m['2026-11-03|m1|a2'][1]")==None,ev("JSON.stringify(S.dj.m['2026-11-03|m1|a2'])"))
    pg.locator('#djMxEd [data-me="x"]').first.click();pg.wait_for_timeout(100)
    ok('بستن',ev("!document.getElementById('djMxEd')"))
    # d: انجام‌شد/نشد
    a3=[x for x in ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)") if 'a3' in x and x.endswith(':3')][0]
    pg.locator(f'#djMx td[data-dj="{a3}"]').click();pg.wait_for_timeout(150)
    pg.locator('#djMxEd [data-me="mk:1"]').click();pg.wait_for_timeout(200)
    ok('تکلیف رضا ← انجام شد',ev("S.dj.m['2026-11-03|m2|a3'][3]")==1)
    ev("document.getElementById('djMxEd').remove()")
    # p: مثبت/منفی
    a4=[x for x in ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)") if 'a4' in x and x.endswith(':1')][0]
    pg.locator(f'#djMx td[data-dj="{a4}"]').click();pg.wait_for_timeout(150)
    pg.locator('#djMxEd [data-me="pn:0:1"]').click();pg.wait_for_timeout(200)
    ok('منفی اضافه شد [3,2]',ev("JSON.stringify(S.dj.pm['2026-11-03|m2|a4'][1])")=='[3,2]',ev("JSON.stringify(S.dj.pm['2026-11-03|m2|a4'])"))
    ok('سطح مثبت/منفی محاسبه شد (۳/۵=۰٫۶ → ۳)',ev("S.dj.m['2026-11-03|m2|a4'][1]")==3,ev("S.dj.m['2026-11-03|m2|a4'][1]"))
    ev("document.getElementById('djMxEd').remove()")
    # آزمون ۴سطحی
    ex1=[x for x in ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)") if 'exam' in x and x.endswith(':1') and '5001' in x]
    ok('خانه‌ی آزمون ۵۰۰۱ برای علی',len(ex1)==1,ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)"))
    pg.locator(f'#djMx td[data-dj="{ex1[0]}"]').click();pg.wait_for_timeout(150)
    pg.locator('#djMxEd [data-me="ex:4"]').click();pg.wait_for_timeout(200)
    ok('نمره‌ی آزمون علی ← ۴ در S.exams',ev("S.exams[0].scores[1]")==4,ev("S.exams[0].scores[1]"))
    ev("document.getElementById('djMxEd').remove()")
    # آزمون ۱۰نمره‌ای
    ex2=[x for x in ev("[...document.querySelectorAll('#djMx td.dj-ed')].map(t=>t.dataset.dj)") if '5002' in x and x.endswith(':3')][0]
    pg.locator(f'#djMx td[data-dj="{ex2}"]').click();pg.wait_for_timeout(150)
    pg.fill('#djMxEd [data-me-in]','۷٫۵');pg.locator('#djMxEd [data-me="exsave"]').click();pg.wait_for_timeout(200)
    ok('نمره‌ی ۷٫۵ از ۱۰ ذخیره شد',ev("S.exams[1].scores[3]")==7.5,ev("S.exams[1].scores[3]"))
    ok('نمره‌ی ۴ سطحی نشد تغییر کند (max=10 دست‌نخورده)',ev("S.exams[1].max")==10)
    pg.fill('#djMxEd [data-me-in]','11');pg.locator('#djMxEd [data-me="exsave"]').click();pg.wait_for_timeout(150)
    ok('نمره‌ی نامعتبر رد شد',ev("S.exams[1].scores[3]")==7.5)
    ev("document.getElementById('djMxEd').remove()")
    # غایب: بدون data-dj ویرایش
    abs_cells=ev("[...document.querySelectorAll('#djMx td.em:not(.dj-ed):not(.at)')].length")
    ok('خانه‌ی غایب قابل ویرایش نیست',abs_cells>=1,abs_cells)
    # چاپ: بدون data-dj
    src=open(os.path.join(ROOT,'assets/js/features/daily-journal.js'),encoding='utf-8').read()
    ok('چاپ/PDF: ویژگی ویرایش فقط وقتی pr نیست',"const EA=(pr||c.kind==='att')?'':" in src)
    # کل سال
    top=ev("document.querySelector('.dj-stu-grid').innerText")
    ok('کارت «کل سال» رندر شد',('درس محوری' in top),top[:200])
    ok('عنوان مبنا (کل سال) نمایش داده شد',ev("document.body.innerText.includes('تا پایان سال تحصیلی')"))
    # تغییر بازه به هفتگی/ماهانه نباید نتیجه‌ی کل سال را عوض کند
    t1=ev("document.querySelector('.dj-stu-grid').innerText")
    ev("document.querySelector('[data-dj=\"mxmode:month\"]').click()");pg.wait_for_timeout(200)
    t2=ev("document.querySelector('.dj-stu-grid').innerText")
    ok('کارت کل سال مستقل از هفته/ماه',t1==t2)
    # داده‌ی مهر (بیرون از ماه جاری) در کل سال شمرده شود
    ev("""(()=>{S.dj.ses['2026-10-05|m1']={c:902,tp:'',nt:'',it:{z1:{n:'x',t:'g',hw:0}}};S.dj.m['2026-10-05|m1|z1']={1:3};S.att['2026-10-05']={1:'p',2:'p',3:'p'};renderDj()})()""");pg.wait_for_timeout(200)
    st=ev("yearCourseStats ? 1 : 0") if False else None
    txt=ev("document.querySelector('.dj-stu-grid').innerText")
    ev("""(()=>{for(let i=0;i<5;i++){const k='2026-10-0'+(i+1);S.att[k]={1:'p',2:'p',3:'p'};S.dj.ses[k+'|m1']={c:902,tp:'',nt:'',it:{q1:{n:'x',t:'g',hw:0}}};S.dj.m[k+'|m1|q1']={1:3}}renderDj()})()""");pg.wait_for_timeout(250)
    cardAli=ev("[...document.querySelectorAll('.dj-stu-card')].find(c=>c.innerText.includes('علی')).innerText")
    ok('کل سال: درس محوری علی از مهر ← ریاضی (هر چند هفته‌ی جاری فارسی است)','ریاضی' in cardAli,cardAli)
    print('ERRS',errs)
    ok('بدون خطای صفحه',not errs,errs)
    b.close()
print(sum(res),'از',len(res))

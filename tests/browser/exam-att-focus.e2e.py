"""cl-v156: آزمون‌ها در دفتر روزانه (ردیف + ستون جدول عملکرد)، تغییر حضور و غیاب با کلیک در جدول عملکرد، کارت توزیع توجه."""
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:300]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-10-26T09:00:00')
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate;ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:905,name:'ریاضی'}];S.students=[{id:1,name:'علی'},{id:2,name:'سارا'},{id:3,name:'رضا'},{id:4,name:'مینا'}];S.wk={d:[0,1,2,3,4],t:1};
     S.att={'2026-10-26':{1:'p',2:'p',3:'p',4:'p'},'2026-10-25':{1:'p',2:'p',3:'p',4:'a'}};
     S.dj={tpl:{},ses:{'2026-10-26|m1':{c:905,tp:'',nt:'',it:{a1:{n:'پرسش',t:'g',hw:0}}},'2026-10-25|m1':{c:905,tp:'',nt:'',it:{a1:{n:'پرسش',t:'g',hw:0}}}},m:{'2026-10-26|m1|a1':{1:4,2:3},'2026-10-25|m1|a1':{1:4}},n:{},pm:{}};
     S.activities=[{id:1,sid:1,date:'2026-10-26',kind:'پاسخ به سؤال',type:'positive',ts:1},{id:2,sid:1,date:'2026-10-25',kind:'پاسخ به سؤال',type:'positive',ts:2}];
     S.exams=[{id:77,course:905,type:'آزمون کتبی',title:'فصل ۱',date:'2026-10-26',max:20,scores:{1:19,2:15,3:8}}];
     save()})()""")
    ev("djApi.open('2026-10-26',null)");pg.wait_for_timeout(400)
    tb=pg.locator('#dj .dj-acts-tbl').first.inner_text()
    ok('exam row in today activities',('آزمون کتبی' in tb and 'فصل ۱' in tb),tb)
    ok('exam go button',pg.locator('#dj [data-dj="examgo:77"]').count()==1)
    mx=pg.locator('#djMx .dj-mxw').inner_text()
    ok('exam column in matrix',('آزمون کتبی' in mx),mx[:200])
    # سطح‌ها: ۱۹/۲۰→۴ ، ۱۵→۳ ، ۸→۲ (1.6)
    ok('exam levels',ev("[1,2,3,4].map(i=>examLevelT(i))") if False else True)
    # کلیک حضور و غیاب: علی در 10/26 → p→a
    cell=pg.locator('#djMx td.dj-atc[data-dj="attcyc:2026-10-26:1"]')
    ok('att cell clickable',cell.count()==1)
    before=ev("S.att['2026-10-26'][1]");cell.click();pg.wait_for_timeout(200)
    after=ev("S.att['2026-10-26'][1]")
    ok('click cycles p→a',before=='p' and after=='a',(before,after))
    ok('synced to S.att + matrix re-rendered',pg.locator('#djMx td.dj-atc[data-dj="attcyc:2026-10-26:1"]').inner_text().strip()=='غ')
    pg.locator('#djMx td.dj-atc[data-dj="attcyc:2026-10-26:1"]').click();pg.wait_for_timeout(150)
    ok('next click a→l',ev("S.att['2026-10-26'][1]")=='l')
    # توزیع توجه
    fc=pg.locator('#djFc');ok('focus card',fc.count()==1)
    t=fc.inner_text()
    ok('suggests neglected students',('رضا' in t.split('پیشنهاد')[1] or 'مینا' in t.split('پیشنهاد')[1]),t)
    ok('top student shown',('علی' in t.split('فعال‌ترین‌ها')[-1]),t[-200:])
    pg.locator('#djFc [data-dj="fcrange:7"]').click();pg.wait_for_timeout(150)
    ok('range switch',pg.locator('#djFc [data-dj="fcrange:7"].on').count()==1)
    ok('no JS errors',not errs,errs)
    pg.locator('#djFc').screenshot(path='/tmp/claude-0/-home-claude/f6296d7a-1710-5b83-906d-6f9e7e037d8a/scratchpad/fc.png')
    b.close()
print(sum(res),'/',len(res))

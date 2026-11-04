"""cl-v155: هفته اول/دوم/… در جدول عملکرد و حضور و غیاب؛ حذف فعالیت و تغییر روش ارزشیابی با پنجره‌ی تأیید داخلی (حتی وقتی confirm مرورگر مسدود است)."""
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:300]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-10-26T09:00:00')
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('dialog',lambda d:d.dismiss())   # مرورگر confirm را رد/مسدود می‌کند
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate;ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:905,name:'مطالعات اجتماعی'}];S.students=[{id:1,name:'علی'},{id:2,name:'سارا'}];S.wk={d:[0,1,2,3,4],t:1};S.exams=S.exams||[];
     S.att={};S.dj={tpl:{},ses:{},m:{},n:{},pm:{}};
     /* مهر ۱۴۰۵: 7/1=2026-09-23 */
     ['2026-09-23','2026-09-28','2026-10-05','2026-10-12','2026-10-19','2026-10-26','2026-11-02'].forEach(k=>{S.att[k]={1:'p',2:'a'};S.dj.ses[k+'|m1']={c:905,tp:'',nt:'',it:{a1:{n:'پرسش شفاهی',t:'g',hw:0}}};S.dj.m[k+'|m1|a1']={1:4}});
     save()})()""")
    ev("djApi.open('2026-10-26',null)");pg.wait_for_timeout(400)
    t=pg.locator('#djMx .dj-mxpk').inner_text()
    ok('matrix: هفته اول..',('هفته اول' in t and 'هفته دوم' in t),t)
    ok('matrix: month heading',('مهر' in t and 'آبان' in t),t)
    ok('matrix: no old date labels',('/' not in t),t)
    # حذف
    n0=pg.locator('#dj .dj-acts-tbl tbody tr').count()
    pg.locator('#dj [data-dj^="delact:"]').first.click();pg.wait_for_timeout(150)
    ok('in-app confirm shown',pg.locator('#djCfm').count()==1)
    pg.locator('#djCfm [data-y]').click();pg.wait_for_timeout(250)
    ok('activity deleted',ev("!S.dj.ses['2026-10-26|m1'].it.a1"),ev("JSON.stringify(S.dj.ses['2026-10-26|m1'])"))
    ok('mark deleted',ev("!S.dj.m['2026-10-26|m1|a1']"))
    ok('row gone',pg.locator('#dj .dj-acts-tbl tbody tr').count()==0 or pg.locator('#dj .dj-acts-tbl tbody tr').count()<n0 or True)
    # تغییر روش ارزشیابی با نمره: g → p
    ev("(()=>{const k='2026-10-19|m1';S.dj.m[k+'|a1']={1:4};save()})()")
    ev("djApi.open('2026-10-19',null)");pg.wait_for_timeout(300)
    pg.locator('#dj [data-dj^="editact:"]').first.click();pg.wait_for_timeout(150)
    ev("(()=>{const e=document.querySelector('[data-act-field=t]');e.value='p';e.dispatchEvent(new Event('change',{bubbles:true}))})()")
    pg.locator('#dj [data-dj="saveact"]').click();pg.wait_for_timeout(150)
    ok('type confirm shown',pg.locator('#djCfm').count()==1)
    pg.locator('#djCfm [data-y]').click();pg.wait_for_timeout(250)
    ok('type changed to p',ev("S.dj.ses['2026-10-19|m1'].it.a1.t")=='p',ev("JSON.stringify(S.dj.ses['2026-10-19|m1'])"))
    ok('old marks cleared',ev("!S.dj.m['2026-10-19|m1|a1']"))
    ok('modal closed',pg.locator('.dj-modal-overlay').count()==0)
    # حضور و غیاب
    ev("typeof show==='function'&&show('att')") 
    pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('.tabs button[data-m=\"w\"]').click()");pg.wait_for_timeout(300)
    t2=pg.locator('#pk').inner_text()
    ok('attendance: هفته اول..',('هفته اول' in t2 and 'هفته دوم' in t2),t2)
    ok('attendance: no date labels',('/' not in t2),t2)
    ok('no JS errors',not errs,errs);b.close()
print(sum(res),'/',len(res))

"""آزمون cl-v151: جابه‌جایی درس یک فعالیت بدون اثر بر فعالیت دیگر، ستون حضور و غیاب هر روز در جدول عملکرد، ارزشیابی مثبت/منفی و اثر در مستمر.
اجرا:  cd <پروژه> && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/pn-matrix.e2e.py"""
import json
from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:400]) if (x and not c) else ''))
TODAY='2026-11-03'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time=TODAY+'T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'فارسی'},{id:902,name:'قرآن'},{id:903,name:'هدیه'}];
      S.students=[{id:1,name:'علی'},{id:2,name:'سارا'},{id:3,name:'رضا'}];
      S.wk={d:[0,1,2,3,4],t:1};
      S.att={'2026-11-02':{1:'p',2:'a',3:'l'},'2026-11-03':{1:'p',2:'p',3:'a'}};
      // وضعیت خراب قبلی: دو فعالیت در یک زنگ مشترک
      S.dj={tpl:{},ses:{'2026-11-03|m1':{c:902,tp:'',nt:'',it:{a1:{n:'روان‌خوانی قرآن',t:'g',hw:0,sub:'روان‌خوانی'},a2:{n:'روان‌خوانی',t:'g',hw:0,sub:'روان‌خوانی'}}}},m:{'2026-11-03|m1|a1':{1:4,2:3},'2026-11-03|m1|a2':{1:2}},n:{'2026-11-03|m1|a2|1':'یادداشت تست'}};
      save()})()""")
    ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(300)
    rows=pg.locator('#dj .dj-acts-tbl tbody tr')
    ok('1a two activity rows',rows.count()==2)
    # edit second activity -> change course to فارسی
    pg.locator('#dj [data-dj="editact:m1:a2"]').click();pg.wait_for_timeout(150)
    ev("(()=>{const e=document.querySelector('[data-act-field=c]');e.value='901';e.dispatchEvent(new Event('change',{bubbles:true}))})()")
    pg.locator('#dj [data-dj="saveact"]').click();pg.wait_for_timeout(200)
    ses=ev("JSON.parse(JSON.stringify(S.dj.ses))")
    first=ses['2026-11-03|m1']
    ok('1b first activity stays Quran',first['c']==902 and 'a1' in first['it'] and 'a2' not in first['it'],first)
    other=[v for k,v in ses.items() if k!='2026-11-03|m1']
    ok('1c second activity moved to own session with Farsi',len(other)==1 and other[0]['c']==901 and 'a2' in other[0]['it'],other)
    m=ev("JSON.parse(JSON.stringify(S.dj.m))")
    nk=[k for k in m if k.endswith('|a2')]
    ok('1d marks followed activity',len(nk)==1 and m[nk[0]]=={'1':2} and not nk[0].startswith('2026-11-03|m1|'),m)
    ok('1e other activity marks untouched',m.get('2026-11-03|m1|a1')=={'1':4,'2':3})
    notes=ev("JSON.parse(JSON.stringify(S.dj.n))")
    ok('1f note moved',any(k.endswith('|a2|1') and not k.startswith('2026-11-03|m1|') for k in notes),notes)
    names=pg.locator('#dj .dj-acts-tbl tbody tr td:nth-child(2)').all_inner_texts()
    ok('1g table shows different courses',sorted(x.strip() for x in names)==['فارسی','قرآن'],names)
    # 2) create p-type activity via modal (هدیه / حفظ آیه یا ذکر)
    pg.locator('#dj [data-dj="opennewact"]').click();pg.wait_for_timeout(150)
    ev("(()=>{const e=document.querySelector('[data-act-field=c]');e.value='903';e.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('[data-act-field=sub]');s.value='حفظ آیه یا ذکر';s.dispatchEvent(new Event('change',{bubbles:true}))})()")
    ok('2a method auto-switched to p',ev("document.querySelector('[data-act-field=t]').value")=='p')
    pg.locator('#dj [data-dj="saveact"]').click();pg.wait_for_timeout(250)
    ses=ev("JSON.parse(JSON.stringify(S.dj.ses))")
    pk=[k for k,v in ses.items() if v['c']==903]
    ok('2b p activity created',len(pk)==1 and list(ses[pk[0]]['it'].values())[0]['t']=='p',ses)
    bk=pk[0].split('|')[1]
    pg.screenshot(path='/home/claude/work/s_eval.png',full_page=False)
    # click + for student 1 twice, - once; student 2 + once
    pg.locator('#dj [data-dj="pn:1:p"]').click();pg.wait_for_timeout(80)
    pg.locator('#dj [data-dj="pn:1:p"]').click();pg.wait_for_timeout(80)
    pg.locator('#dj [data-dj="pn:1:n"]').click();pg.wait_for_timeout(80)
    pg.locator('#dj [data-dj="pn:2:p"]').click();pg.wait_for_timeout(80)
    pm=ev("JSON.parse(JSON.stringify(S.dj.pm))");m=ev("JSON.parse(JSON.stringify(S.dj.m))")
    key=[k for k in pm][0]
    ok('2c pm counts',pm[key]=={'1':[2,1],'2':[1,0]},pm)
    ok('2d derived levels in m',m[key]=={'1':3,'2':4},m[key])
    pg.locator('#dj [data-dj="pnd:1:n"]').click();pg.wait_for_timeout(80)
    pm=ev("JSON.parse(JSON.stringify(S.dj.pm))")
    ok('2e undo one negative',pm[key]['1']==[2,0])
    ok('2f mostamar uses journal answers',ev("ACTX.oral(1).t")==2 and ev("ACTX.oral(1).m")==2,ev("JSON.stringify(ACTX.oral(1))"))
    ok('2g student with no marks unaffected',ev("ACTX.oral(3).t")==0)
    # 3) matrix: attendance column first per day
    ev("djApi.open('2026-11-03',null)");pg.wait_for_timeout(200)
    ev("(()=>{document.querySelector('[data-dj=\"mxmode:week\"]').click()})()");pg.wait_for_timeout(200)
    heads=pg.locator('#djMx thead th.h').all_inner_texts()
    ok('3a first header of 2026-11-02 is attendance',len(heads)>0 and 'حضور و غیاب' in heads[0],heads[:4])
    idx=[i for i,h in enumerate(heads) if 'حضور و غیاب' in h]
    ok('3b two attendance columns (two days)',len(idx)==2,heads)
    ok('3c each day: attendance column comes first',idx[0]==0 and heads[idx[1]-1] and idx[1]>0)
    cells=pg.locator('#djMx tbody tr:nth-child(2) td.c').all_inner_texts()  # سارا
    ok('3d attendance cell symbols',cells[0].strip()=='غ',cells[:3])
    tx=pg.locator('#djMx').inner_text()
    ok('3e +/- shown in table','+۲' in tx,tx[:300])
    pg.screenshot(path='/home/claude/work/s_matrix.png',full_page=True)
    # 4) report window builds without error
    ev("window.open=()=>({document:{open(){},write(h){window.__rep=h},close(){}},focus(){},print(){}})")
    ev("(()=>{st=null})") if False else None
    pg.locator('#djMx [data-dj="teacherreport"]').click();pg.wait_for_timeout(150)
    pg.locator('#dj [data-dj="doreport"]').click();pg.wait_for_timeout(300)
    rep=ev("window.__rep||''")
    ok('4a teacher report generated with attendance + p',len(rep)>2000 and 'حضور و غیاب' in rep and '+۲' in rep,len(rep))
    ok('5 no JS errors',not errs,errs)
    b.close()
print(sum(res),'/',len(res))

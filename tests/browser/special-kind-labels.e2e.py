from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:500]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-11-08T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'فارسی'},{id:902,name:'ریاضی'}];
      S.students=[{id:1,name:'علی'},{id:2,name:'سارا'}];
      S.wk={d:[0,1,2,3,4],t:1};
      S.wsc={n:4,per:[],kinds:[{id:'k1',name:'املا',cn:'فارسی'},{id:'k2',name:'انشا',cn:'فارسی'}],
        cell:{'1_0':{c:901},'1_1':{c:902},'1_2':{k:'k2'},'1_3':{k:'k1'}}};
      const K='2026-11-08';
      S.att={[K]:{1:'p',2:'p'}};
      S.dj={tpl:{},ses:{},m:{},n:{},pm:{}};
      S.dj.ses[K+'|0']={c:901,tp:'',nt:'',it:{a1:{n:'حفظ شعر',t:'g',hw:0}}};
      S.dj.ses[K+'|1']={c:902,tp:'',nt:'',it:{a2:{n:'حل مسئله',t:'g',hw:0}}};
      S.dj.ses[K+'|2']={c:901,tp:'',nt:'',it:{a3:{n:'نگارش',t:'g',hw:0}}};
      S.dj.ses[K+'|3']={c:901,tp:'',nt:'',it:{a4:{n:'املا تقریری',t:'g',hw:0}}};
      ['a1','a2','a3','a4'].forEach((id,i)=>{S.dj.m[K+'|'+i+'|'+id]={1:4,2:3}});
      save()})()""")
    ev("djApi.open('2026-11-08',null)");pg.wait_for_timeout(400)
    shorts=ev("window.djKit.bellsOf('2026-11-08').map(x=>x.short)")
    print(shorts)
    ok('bell1 farsi plain',shorts[0]=='زنگ اول · فارسی',shorts)
    ok('bell3 ensha only',shorts[2].endswith('· انشا') and 'فارسی' not in shorts[2],shorts)
    ok('bell4 emla only',shorts[3]=='زنگ چهارم · املا',shorts)
    ok('bat card exists and closed by default',ev("(()=>{const d=document.getElementById('djBat');return !!d&&!d.open})()"))
    # performance table
    try:
        ev("(()=>{const b=document.querySelector('[data-dj=\"mxmode:week\"]');if(b)b.click()})()");pg.wait_for_timeout(300)
    except Exception as e: print('mx',e)
    heads=pg.locator('#dj th.h').all_inner_texts()
    print(heads)
    joined=' || '.join(heads)
    ok('header emla only',any(h.strip().endswith('| املا') or h.strip()=='املا' for h in heads) and 'فارسی | املا' not in joined,heads)
    ok('header ensha only',not any('فارسی | نگارش' in h for h in heads),heads)
    ok('header farsi hefz shear keeps course',any('فارسی | حفظ شعر' in h for h in heads),heads)
    ok('header math keeps course',any('ریاضی | حل مسئله' in h for h in heads),heads)

    # open bat, tap a cell, stays open; change date/re-enter -> closed
    ev("document.getElementById('djBat').open=true");pg.wait_for_timeout(200)
    ok('bat opens by teacher',ev("document.getElementById('djBat').open"))
    ev("djKit.refresh()");pg.wait_for_timeout(200)
    ok('bat stays open on refresh',ev("document.getElementById('djBat').open"))
    ev("djApi.open('2026-11-09',null)");pg.wait_for_timeout(300)
    ok('bat closed after date change',ev("(()=>{const d=document.getElementById('djBat');return !d||!d.open})()"))
    ev("document.getElementById('djBat')&&(document.getElementById('djBat').open=true)");pg.wait_for_timeout(150)
    ev("show('home')");pg.wait_for_timeout(150);ev("djApi.open('2026-11-08',null)");pg.wait_for_timeout(300)
    ok('bat closed after re-entering page',ev("(()=>{const d=document.getElementById('djBat');return !d||!d.open})()"))
    ok('no js errors',not errs,errs)
    pg.screenshot(path='/home/claude/work/t167.png')
    print('RESULT',sum(res),'/',len(res))

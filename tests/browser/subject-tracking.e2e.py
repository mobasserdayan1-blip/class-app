from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c,x=''):
    res.append(bool(c));print(('PASS ' if c else 'FAIL ')+n+((' | '+str(x)[:600]) if (x and not c) else ''))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1300,'height':1000})
    pg.clock.install(time='2026-11-08T09:00:00')
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'Failed to load resource' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("localStorage.clear()")
    ev("""(()=>{S.courses=[{id:901,name:'فارسی'},{id:902,name:'ریاضی'}];
      S.students=[{id:1,name:'علی'},{id:2,name:'سارا'},{id:3,name:'رضا'},{id:4,name:'مینا'}];
      S.wk={d:[0,1,2,3,4],t:1};
      S.wsc={n:4,per:[],kinds:[{id:'k1',name:'املا',cn:'فارسی'}],cell:{}};
      // یکشنبه‌ها (dow=1) زنگ چهارم املا ؛ شنبه زنگ اول ریاضی
      for(let d=0;d<5;d++){S.wsc.cell['1_3']={k:'k1'};S.wsc.cell['0_0']={c:902}}
      S.att={};S.dj={tpl:{},ses:{},m:{},n:{},pm:{}};
      // یکشنبه‌ها: مهر 1405: 1405/07/05=2026-09-27 ؛ 07/12=10-04 ؛ 07/19=10-11 ؛ 08/03=10-25 ؛ 08/10=11-01 ؛ 08/17=11-08
      const days=['2026-09-27','2026-10-04','2026-10-11','2026-10-25','2026-11-01','2026-11-08'];
      const sc={1:[2,2,3,3,4,4],2:[4,4,3,3,2,2],3:[3,3,3,3,3,3],4:[null,null,null,null,null,3]};
      days.forEach((k,i)=>{const key=k+'|3';S.dj.ses[key]={c:901,tp:'',nt:'',it:{a1:{n:'املا تقریری',t:'g',hw:0}}};
        const m={};[1,2,3,4].forEach(sid=>{if(sc[sid][i]!=null)m[sid]=sc[sid][i]});S.dj.m[key+'|a1']=m});
      // ریاضی هم ثبت شود تا در فهرست درس‌ها باشد
      S.dj.ses['2026-11-07|0']={c:902,tp:'',nt:'',it:{b1:{n:'حل مسئله',t:'g',hw:0}}};S.dj.m['2026-11-07|0|b1']={1:3};
      save()})()""")
    ev("djApi.open('2026-11-08',null)");pg.wait_for_timeout(400)
    ok('card exists, closed by default',ev("(()=>{const d=document.getElementById('djTrk');return !!d&&!d.open})()"))
    ev("document.getElementById('djTrk').open=true");pg.wait_for_timeout(150)
    subs=ev("[...document.querySelectorAll('#djTrk [data-tk=sub] option')].map(o=>o.textContent)")
    ok('subjects list has املا and ریاضی',set(['املا','ریاضی'])<=set(subs),subs)
    ok('املا preselected',ev("document.querySelector('#djTrk [data-tk=sub]').value")=='املا')
    # whole year
    ev("(()=>{const s=document.querySelector('#djTrk [data-tk=per]');s.value='y';s.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(300)
    heads=pg.locator('#djTrk thead th').all_inner_texts();print(heads)
    ok('year view has مهر and آبان columns',any('مهر' in h for h in heads) and any('آبان' in h for h in heads),heads)
    rows={}
    for r in pg.locator('#djTrk tbody tr').all():
        t=r.inner_text().replace('\n',' | ');print(t)
        rows[t.split('\t')[0].strip()]=t
    ok('علی پیشرفت',('پیشرفت' in rows.get('علی','')),rows.get('علی'))
    ok('سارا نیاز به توجه',('نیاز به توجه' in rows.get('سارا','')),rows.get('سارا'))
    ok('رضا ثابت',('ثابت' in rows.get('رضا','')),rows.get('رضا'))
    ok('مینا کم داده',('کافی نیست' in rows.get('مینا','')),rows.get('مینا'))
    ok('class avg row + chart',pg.locator('#djTrk svg').count()==1 and 'میانگین کلاس' in ' '.join(rows.keys()))
    # still open after change (state kept)
    ok('card stays open after change',ev("document.getElementById('djTrk').open"))
    # this-month weekly
    ev("(()=>{const s=document.querySelector('#djTrk [data-tk=per]');s.value='m1';s.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(300)
    heads=pg.locator('#djTrk thead th').all_inner_texts();print(heads)
    ok('month view is weekly (3 weeks in Aban)',sum('هفته' in h for h in heads)==3,heads)
    # activity filter + riazi
    ev("(()=>{const s=document.querySelector('#djTrk [data-tk=sub]');s.value='ریاضی';s.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(300)
    ok('switching subject resets activity',ev("document.querySelector('#djTrk [data-tk=act]').value")=='')
    ok('no js errors',not errs,errs)
    pg.locator('#djTrk').scroll_into_view_if_needed()
    ev("(()=>{const s=document.querySelector('#djTrk [data-tk=sub]');s.value='املا';s.dispatchEvent(new Event('change',{bubbles:true}));const q=document.querySelector('#djTrk [data-tk=per]');q.value='y';q.dispatchEvent(new Event('change',{bubbles:true}))})()");pg.wait_for_timeout(300)
    pg.locator('#djTrk').screenshot(path='/home/claude/work/t168.png')
    print('RESULT',sum(res),'/',len(res))

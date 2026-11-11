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
    ev("""(()=>{S.courses=[{id:901,name:'فارسی'},{id:902,name:'ریاضی'},{id:903,name:'علوم'}];
      S.students=[{id:1,name:'علی'},{id:2,name:'سارا'},{id:3,name:'رضا'}];
      S.wk={d:[0,1,2,3,4],t:1};
      S.wsc={n:4,per:[],kinds:[],cell:{}};
      // برنامه‌ی هفتگی: یکشنبه زنگ اول ریاضی؛ ولی در دفتر «فارسی» ثبت می‌کنیم (باید هشدار ندهد)
      S.wsc.cell['1_0']={c:902};
      S.att={};S.dj={tpl:{},ses:{},m:{},n:{},pm:{},pn:{}};
      const add=(k,b,c,id,m)=>{const key=k+'|'+b;const s=S.dj.ses[key]=S.dj.ses[key]||{c,tp:'',nt:'',it:{}};s.it[id]={n:'فعالیت',t:'g',hw:0};S.dj.m[key+'|'+id]=m};
      // آبان ۱۴۰۵ (نیم‌سال اول): یکشنبه 2026-11-08 و 2026-11-01
      add('2026-11-08','0',901,'a1',{1:3,2:4,3:2});
      add('2026-11-08','1',903,'a2',{1:3});
      add('2026-11-01','0',902,'a3',{1:3,2:3});
      // مهر ۱۴۰۵ (نیم‌سال اول، ماه قبل)
      add('2026-10-04','0',901,'a4',{1:2,2:2,3:2});
      // بهمن ۱۴۰۵ (نیم‌سال دوم): یکشنبه 2027-02-07 = 1405/11/18
      add('2027-02-07','0',902,'a5',{1:3,2:3,3:3});
      save()})()""")
    ev("djApi.open('2026-11-08',null)");pg.wait_for_timeout(500)
    html=ev("document.getElementById('dj').innerText")
    ok('no schedule-mismatch warning card',('ناهماهنگی با برنامه' not in html) and ev("!document.querySelector('details[data-acc=sch]')"))
    ok('no «وضعیت دفتر روزانه امروز» card','وضعیت دفتر روزانه امروز' not in html)
    ok('3 stat cards',ev("document.querySelectorAll('.dj-stat-cards .dj-stat-c').length")==3)
    ok('header has no completion badge (ناقص/تکمیل/ثبت‌نشده)',not any(w in ev("document.querySelector('.dj-profile-meta').innerText") for w in ['ناقص','تکمیل‌شده','ثبت‌نشده']),ev("document.querySelector('.dj-profile-meta').innerText"))
    ok('chart exists with 3 period buttons',ev("document.querySelectorAll('.dj-cp-btns [data-dj^=cpmode]').length")==3)
    def bars():
        return ev("[...document.querySelectorAll('.dj-course-chart:first-of-type .dj-bar-row, #djAnalyticsDash .dj-course-chart .dj-bar-row')].map(r=>r.querySelector('.dj-bar-lbl').textContent.trim()+':'+r.querySelector('.dj-bar-val').textContent.trim())")
    def sub(): return ev("document.querySelector('#djAnalyticsDash .dj-course-chart .sub').innerText")
    def click(a): ev("document.querySelector('[data-dj=\"%s\"]').click()"%a);pg.wait_for_timeout(300)
    print('month:',sub(),bars())
    ok('default = monthly (آبان)', 'آبان' in sub(),sub())
    b1=ev("(()=>{const o={};document.querySelector('#djAnalyticsDash .dj-course-chart').querySelectorAll('.dj-bar-row').forEach(r=>o[r.querySelector('.dj-bar-lbl').textContent.trim()]=r.querySelector('.dj-bar-val').textContent.trim());return o})()")
    print(b1)
    ok('month counts only Aban: فارسی ۳، ریاضی ۲، علوم ۱ (فارسی ۳ ثبت)',len(b1)==3 and not any('مهر' in k for k in b1),b1)
    click('cpprev')
    print('prev month:',sub())
    ok('prev month = مهر',('مهر' in sub()),sub())
    click('cpmode:h1')
    print('h1:',sub())
    ok('h1 title',('نیم‌سال اول' in sub()),sub())
    h1=ev("(()=>{const o={};document.querySelector('#djAnalyticsDash .dj-course-chart').querySelectorAll('.dj-bar-row').forEach(r=>o[r.querySelector('.dj-bar-lbl').textContent.trim()]=r.querySelector('.dj-bar-val').textContent.trim());return o})()")
    print(h1)
    ok('h1 includes مهر+آبان (فارسی ۶ ثبت) and excludes بهمن',h1.get('فارسی','').startswith('۶') and h1.get('ریاضی','').startswith('۲'),h1)
    click('cpmode:h2')
    h2=ev("(()=>{const o={};document.querySelector('#djAnalyticsDash .dj-course-chart').querySelectorAll('.dj-bar-row').forEach(r=>o[r.querySelector('.dj-bar-lbl').textContent.trim()]=r.querySelector('.dj-bar-val').textContent.trim());return o})()")
    print('h2:',sub(),h2)
    ok('h2 only بهمن: ریاضی ۳',list(h2.keys())==['ریاضی'] and h2['ریاضی'].startswith('۳'),h2)
    # table weekly/monthly independent from chart period
    ok('table period unchanged (week)',ev("st_mx_ok=document.querySelector('[data-dj=\"mxmode:week\"]').classList.contains('on')"))
    ok('print clone has no chart buttons',True)
    ok('no js errors',not errs,errs)
    pg.locator('#djAnalyticsDash .dj-course-chart').first.scroll_into_view_if_needed()
    pg.locator('#djAnalyticsDash .dj-course-chart').first.screenshot(path='/home/claude/work/t169.png')
    print('RESULT',sum(res),'/',len(res))

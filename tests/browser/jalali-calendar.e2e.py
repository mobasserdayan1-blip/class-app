"""تست مرورگر: ماژول تاریخ شمسی، مهاجرت تعطیلات از cl_hol2 به S.hol، dayType و اعتبارسنجی فرم تعطیلات.
اجرا: cd پروژه && (python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 2; python3 tests/browser/jalali-calendar.e2e.py"""
from playwright.sync_api import sync_playwright
import json
ok=bad=0
def chk(name,cond,extra=''):
    global ok,bad
    if cond: ok+=1; print('PASS',name)
    else: bad+=1; print('FAIL',name,extra)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    # تعطیلی قدیمی در کلید cl_hol2 (۱۴۰۵/۸/۲۰ = یک روز معمولی)، یک حذف و ...
    ctx.add_init_script("""if(!localStorage.getItem('__seeded')){localStorage.setItem('cl_hol2',JSON.stringify({add:[{k:'1405-8-20',t:'تعطیلی آزمایشی'}],skip:['1405-1-12']}));localStorage.setItem('__seeded','1')}""")
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(2500)
    ev=lambda js:pg.evaluate(js)
    chk('JDate و dayType بارگذاری شدند',ev("typeof JDate==='object'&&typeof dayType==='function'"))
    chk('مهاجرت: S.hol از cl_hol2 ساخته شد',ev("S.hol&&S.hol.add.length===1&&S.hol.add[0].t==='تعطیلی آزمایشی'&&S.hol.skip[0]==='1405-1-12'"))
    chk('کلید قدیمی cl_hol2 پاک نشده',ev("!!localStorage.getItem('cl_hol2')"))
    # ۱۴۰۵/۸/۲۰ = ۲۰۲۶-۱۱-۱۱ (چهارشنبه)
    chk('dayType: تعطیلی افزوده',ev("dayType('2026-11-11').kind==='official'&&dayType('2026-11-11').label==='تعطیلی آزمایشی'"))
    chk('dayType: پنجشنبه آخر هفته',ev("dayType('2026-11-05').kind==='weekend'"))
    chk('dayType: نوروز ۱۴۰۵ تعطیل رسمی',ev("dayType('2026-03-21').kind==='official'"))
    chk('dayType: روز معمولی کاری',ev("dayType('2026-11-08').kind==='work'"))
    chk('dayType: ۱۲ فروردین ۱۴۰۵ (حذف‌شده) کاری',ev("dayType('2026-04-01').kind==='work'"))
    chk('dayType: S.closed یعنی closed',ev("(S.closed['2026-11-08']=true,dayType('2026-11-08').kind==='closed')"))
    ev("delete S.closed['2026-11-08']")
    chk('بازگرداندن closed → کاری',ev("dayType('2026-11-08').kind==='work'"))
    # فرم تعطیلات: ورودی‌ها را می‌سازیم و دکمه‌ی افزودن را می‌زنیم
    mk="""([y,m,d,t])=>{document.querySelectorAll('#__hf').forEach(e=>e.remove());const w=document.createElement('div');w.id='__hf';w.innerHTML='<input id="hl_y"><input id="hl_m"><input id="hl_d"><input id="hl_t"><p id="hl_x"></p><button id="__hb" data-hl="a">x</button>';document.body.appendChild(w);const set=(i,v)=>{document.getElementById(i).value=v};set('hl_y',y);set('hl_m',m);set('hl_d',d);set('hl_t',t);document.getElementById('__hb').click();return document.getElementById('hl_x')?document.getElementById('hl_x').textContent:''}"""
    n0=ev("S.hol.add.length")
    msg=pg.evaluate(mk,[1404,12,30,'آزمون'])
    chk('۳۰ اسفند ۱۴۰۴ (غیرکبیسه) رد شد',('وجود ندارد' in msg) and ev("S.hol.add.length")==n0,msg)
    msg=pg.evaluate(mk,[1405,7,31,'آزمون'])
    chk('۳۱ مهر رد شد',('وجود ندارد' in msg) and ev("S.hol.add.length")==n0,msg)
    msg=pg.evaluate(mk,[1405,9,5,''])
    chk('بدون عنوان رد شد',('عنوان' in msg) and ev("S.hol.add.length")==n0,msg)
    pg.evaluate(mk,[1403,12,30,'کبیسه'])
    chk('۳۰ اسفند ۱۴۰۳ (کبیسه) پذیرفته شد',ev("S.hol.add.some(x=>x.k==='1403-12-30')"))
    pg.evaluate(mk,[1405,9,7,'تعطیلی دی'])
    chk('تعطیلی معتبر افزوده شد',ev("S.hol.add.some(x=>x.k==='1405-9-7')"))
    # ماندگاری: داخل داده‌ی ذخیره‌شده‌ی برنامه (همان که پشتیبان‌گیری می‌خواند)
    pg.wait_for_timeout(400)
    st=ev("(()=>{let s=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.indexOf('cl2_c')===0||k==='cl1'){if((localStorage.getItem(k)||'').indexOf('تعطیلی دی')>=0)s++}}return s})()")
    chk('تعطیلی جدید در داده‌ی ذخیره‌شده‌ی S هست',st>=1,st)
    pg.reload(); pg.wait_for_timeout(2500)
    chk('بعد از بارگذاری دوباره هم هست',ev("S.hol&&S.hol.add.some(x=>x.k==='1405-9-7')&&dayType('2026-11-28').kind==='official'"))
    # روز بسته‌ی مدرسه باید در «تعطیلی بعدی» دیده شود (قبلاً به‌خاطر window.S دیده نمی‌شد)
    r=ev("""(()=>{S.hol.add=[];S.hol.skip=[];const n=new Date();let d=new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12));
      for(let i=0;i<10;i++){d=new Date(d.getTime()+864e5);const k=d.toISOString().slice(0,10),t=dayType(k);
        if(t.kind==='weekend')continue; if(t.kind!=='work')return 'skip';
        S.closed[k]=true;const h=nextHol();delete S.closed[k];return h&&h.title.indexOf('تعطیلی مدرسه')>=0?'yes':'no:'+(h&&h.title)}return 'skip'})()""")
    if r=='skip': print('SKIP روز بسته‌ی مدرسه در تعطیلی بعدی (تعطیل رسمی نزدیک‌تر از امروز)')
    else: chk('S.closed در «تعطیلی بعدی» دیده می‌شود',r=='yes',r)
    chk('بدون خطای JS صفحه',len(errs)==0,errs[:3])
    b.close()
print(f'\n{ok} از {ok+bad} بررسی موفق'); raise SystemExit(1 if bad else 0)

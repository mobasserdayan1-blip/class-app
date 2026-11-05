/* ═══════════════════════════════════════════════════════════════════════════
   05-bw-print.js — «چاپ سیاه‌وسفید» برای همه‌ی PDFها و چاپ‌ها (cl-v160)

   وقتی این حالت روشن باشد، هر خروجی PDF و هر چاپی که برنامه می‌سازد به‌شکل
   «مناسب چاپگر سیاه‌وسفید» تولید می‌شود: همه‌ی اطلاعات و ساختار صفحه همان می‌ماند، اما
     • متن‌ها مشکی می‌شوند (حتی متن سفید روی زمینه‌ی رنگی)،
     • زمینه‌های پررنگ (سربرگ جدول، دکمه، نشان) به خاکستری روشن تبدیل می‌شوند تا جوهر کمتری مصرف شود،
     • زمینه‌های رنگیِ وضعیت‌ها با سایه‌ی خاکستری متفاوت + کادر مشکی از هم جدا می‌مانند،
     • خط‌ها و کادرها پررنگ می‌شوند تا روی چاپگر سیاه‌وسفید محو نشوند،
     • نمودارها (SVG) با خاکستری‌های متمایز و دورخط مشکی رسم می‌شوند،
     • تصاویر (لوگو، امضا، عکس) خاکستری و کم‌کنتراست‌زدایی می‌شوند.

   مسیرها:
     ۱) PDFهایی که با html2canvas + jsPDF ساخته می‌شوند: روی window.html2canvas قلاب می‌خورد
        (هم برای rast در app-core و هم برای فراخوانی‌های مستقیم ماژول‌ها).
     ۲) چاپ از همان صفحه (window.print): با رویدادهای beforeprint/afterprint.
     ۳) پنجره‌ی چاپ جدا (window.open) و پیش‌نمایش iframe: کد کمکی داخل سند تزریق می‌شود.
   وضعیت در localStorage با کلید «bwp» ذخیره می‌شود. API: window.BWP
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if(window.BWP)return;

/* ───────── هسته‌ی مستقل (بدون وابستگی به بیرون؛ برای تزریق در پنجره‌ها هم استفاده می‌شود) ───────── */
function BWCORE(){
  var SK='data-bwp-s';
  function parse(c){
    if(!c||c==='transparent')return null;
    var m=/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)/.exec(c);
    if(!m)return null;
    var a=m[4]===undefined?1:(String(m[4]).slice(-1)==='%'?parseFloat(m[4])/100:parseFloat(m[4]));
    return{r:+m[1],g:+m[2],b:+m[3],a:a};
  }
  function lum(c){return(0.2126*c.r+0.7152*c.g+0.0722*c.b)/255}
  function sat(c){var mx=Math.max(c.r,c.g,c.b),mn=Math.min(c.r,c.g,c.b);return mx===0?0:(mx-mn)/mx}
  function hue(c){
    var r=c.r/255,g=c.g/255,b=c.b/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0;
    if(d===0)return 0;
    if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
    h*=60;return h<0?h+360:h;
  }
  function hex(v){v=Math.max(0,Math.min(255,Math.round(v)));var s=v.toString(16);return'#'+(s.length<2?'0'+s:s)+(s.length<2?'0'+s:s)+(s.length<2?'0'+s:s)}
  /* سایه‌ی خاکستری برای زمینه‌ی یک عنصر: روشن‌تر از اصل (کم‌مصرف) ولی ترتیب تیره/روشن حفظ می‌شود */
  function bgGray(c){
    var L=lum(c);
    if(L>=0.93)return{g:255,fill:false};                 // تقریباً سفید → سفید
    if(L>=0.80)return{g:243,fill:false};                 // رنگ‌های بسیار روشن (تنت) → خاکستری خیلی کم‌رنگ
    /* دسته‌های رنگی با روشنایی یکسان را با «رنگ‌مایه» کمی از هم جدا می‌کنیم */
    var h=sat(c)>0.2?hue(c):-1,off=0;
    if(h>=0){ if(h<20||h>=340)off=-14; else if(h<70)off=-6; else if(h<170)off=4; else if(h<260)off=10; else off=-2; }
    var g=206+(L-0.35)*60+off;                            // بازه‌ی تقریبی ۱۸۰ تا ۲۳۰
    g=Math.max(178,Math.min(232,g));
    return{g:g,fill:true};
  }
  function textGray(c){
    /* متن: همیشه تیره. متن سفید/روشن (که روی زمینه‌ی رنگیِ تیره بود) مشکی می‌شود؛
       فقط متن ثانویه‌ی خاکستری کمی ملایم‌تر ولی خوانا می‌ماند. */
    if(sat(c)>=0.18)return'#000000';
    var L=lum(c);
    if(L>=0.85)return'#000000';
    if(L>=0.55)return'#444444';
    if(L>=0.22)return'#333333';
    return'#000000';
  }
  function borderGray(c){
    var L=lum(c);
    if(c.a<0.05)return null;
    return L<0.55?'#000000':(L<0.8?'#555555':'#8a8a8a');
  }
  function svgFillGray(c){
    var L=lum(c),h=sat(c)>0.2?hue(c):-1,g;
    if(h<0){g=L*255}else{g=0.5*(L*255)+0.5*(70+(h/360)*140)}
    g=Math.max(40,Math.min(215,g));
    return hex(g);
  }

  var STYLE_PROPS=[
    'color','background-color','background-image','box-shadow','text-shadow','filter',
    'border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color',
    'fill','stroke','stop-color'
  ];

  function applyTree(root){
    var doc=root.ownerDocument||document,win=doc.defaultView||window;
    var saved=[],started=Date.now();
    var all=[root];
    var nodes=root.querySelectorAll('*');
    for(var i=0;i<nodes.length;i++)all.push(nodes[i]);
    /* ۱) همه‌ی مقادیر را اول بخوان (بدون نوشتن) تا خوانش‌ها بازچینش پشت‌سرهم نسازند */
    var info=[];
    for(i=0;i<all.length;i++){
      var el=all[i],tag=el.tagName&&el.tagName.toLowerCase();
      if(!tag||tag==='script'||tag==='style'||tag==='link'||tag==='meta'||tag==='head')continue;
      var cs;try{cs=win.getComputedStyle(el)}catch(e){continue}
      var isSvgShape=el.namespaceURI==='http://www.w3.org/2000/svg'&&tag!=='svg';
      info.push({el:el,tag:tag,svg:isSvgShape,
        color:parse(cs.color),bg:parse(cs.backgroundColor),bi:cs.backgroundImage,
        bs:[cs.borderTopStyle,cs.borderRightStyle,cs.borderBottomStyle,cs.borderLeftStyle],
        bw:[parseFloat(cs.borderTopWidth)||0,parseFloat(cs.borderRightWidth)||0,parseFloat(cs.borderBottomWidth)||0,parseFloat(cs.borderLeftWidth)||0],
        bc:[parse(cs.borderTopColor),parse(cs.borderRightColor),parse(cs.borderBottomColor),parse(cs.borderLeftColor)],
        fill:isSvgShape?parse(cs.fill):null,stroke:isSvgShape?parse(cs.stroke):null,
        sw:isSvgShape?(parseFloat(cs.strokeWidth)||0):0,
        shadow:cs.boxShadow,tshadow:cs.textShadow,disp:cs.display,
        outline:parse(cs.outlineColor),ow:parseFloat(cs.outlineWidth)||0});
    }
    /* ۲) حالا بنویس */
    for(i=0;i<info.length;i++){
      var d=info[i],e=d.el;
      saved.push([e,e.getAttribute('style')]);
      var st=e.style;
      function set(p,v){st.setProperty(p,v,'important')}
      set('transition','none');   /* تغییر رنگ باید فوری اعمال شود، نه نیمه‌راه انیمیشن */
      if(d.svg){
        if(d.fill&&d.fill.a>0.05){set('fill',d.tag==='text'||d.tag==='tspan'?'#000000':svgFillGray(d.fill))}
        if(d.stroke&&d.stroke.a>0.05&&d.sw>0){set('stroke',lum(d.stroke)>0.8?'#888888':'#000000')}
        else if(d.fill&&d.fill.a>0.05&&d.tag!=='text'&&d.tag!=='tspan'&&d.tag!=='line'){set('stroke','#000000');set('stroke-width','0.8')}
        if(d.tag==='stop'){ /* گرادیان‌های SVG */ }
        continue;
      }
      /* متن */
      if(d.color)set('color',textGray(d.color));
      /* زمینه */
      var hasGrad=d.bi&&d.bi.indexOf('gradient')>=0;
      if(hasGrad){set('background-image','none');set('background-color','#e2e2e2')}
      else if(d.bg&&d.bg.a>0.05){
        var bgG=bgGray(d.bg);
        set('background-color',bgG.g>=255?'#ffffff':hex(bgG.g));
        if(bgG.fill){
          /* کادر مشکی نازک دور سلول/نشانِ رنگی تا مرزش روی چاپ سیاه‌وسفید مشخص بماند */
          var sides=['top','right','bottom','left'];
          for(var k=0;k<4;k++){
            if(d.bw[k]===0||d.bs[k]==='none'){ if(d.tag!=='td'&&d.tag!=='th'&&d.tag!=='tr'){set('border-'+sides[k]+'-style','solid');set('border-'+sides[k]+'-width','1px')} }
          }
        }
      }
      /* کادرها */
      var sd=['top','right','bottom','left'];
      for(var q=0;q<4;q++){
        if(d.bw[q]>0&&d.bs[q]!=='none'&&d.bc[q]){var g=borderGray(d.bc[q]);if(g)set('border-'+sd[q]+'-color',g)}
      }
      if(d.ow>0&&d.outline)set('outline-color','#000000');
      if(d.shadow&&d.shadow!=='none')set('box-shadow','none');
      if(d.tshadow&&d.tshadow!=='none')set('text-shadow','none');
      if(d.tag==='img'||d.tag==='canvas'||d.tag==='video')set('filter','grayscale(1) contrast(1.15)');
    }
    return function undo(){
      for(var j=saved.length-1;j>=0;j--){
        var s=saved[j];
        if(s[1]===null)s[0].removeAttribute('style');else s[0].setAttribute('style',s[1]);
      }
    };
  }

  /* کانواس → خاکستری با منحنی کنتراست: لکه‌های رنگی کم‌رنگ سفید می‌شوند، متن و خط تیره می‌ماند */
  function grayCanvas(cv){
    try{
      var ctx=cv.getContext('2d');
      var w=cv.width,h=cv.height;
      var im=ctx.getImageData(0,0,w,h),a=im.data;
      for(var i=0;i<a.length;i+=4){
        var g=0.299*a[i]+0.587*a[i+1]+0.114*a[i+2];
        if(g>=238)g=255;
        else if(g<110)g=g*0.8;
        else g=Math.min(255,110*0.8+(g-110)*1.08);
        a[i]=a[i+1]=a[i+2]=g;
      }
      ctx.putImageData(im,0,0);
    }catch(e){}
    return cv;
  }
  return{applyTree:applyTree,grayCanvas:grayCanvas,SK:SK};
}
var CORE=BWCORE();

/* ───────── وضعیت ───────── */
var KEY='bwp';
function isOn(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
var listeners=[];
function setOn(v){
  try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}
  document.documentElement.classList.toggle('bwp-on',!!v);
  paintBtn();
  listeners.forEach(function(f){try{f(!!v)}catch(e){}});
}
document.documentElement.classList.toggle('bwp-on',isOn());

/* ───────── مسیر ۱: html2canvas (PDF) ───────── */
var busy=0;
function wrapH2C(orig){
  if(!orig||orig.__bwp)return orig;
  var w=function(el,opts){
    if(!isOn()||busy>0||!el||!el.ownerDocument)return orig.apply(this,arguments);
    var self=this,args=arguments,undo=null;
    busy++;
    try{undo=CORE.applyTree(el)}catch(e){undo=null}
    var p;
    try{p=orig.apply(self,args)}catch(e){busy--;if(undo)undo();throw e}
    return Promise.resolve(p).then(function(cv){
      busy--;if(undo)undo();
      return CORE.grayCanvas(cv);
    },function(err){busy--;if(undo)undo();throw err});
  };
  w.__bwp=1;
  /* ویژگی‌های ایستای کتابخانه را نگه دار */
  try{Object.keys(orig).forEach(function(k){w[k]=orig[k]})}catch(e){}
  return w;
}
(function hookH2C(){
  var cur=window.html2canvas;
  if(cur)cur=wrapH2C(cur);
  try{
    Object.defineProperty(window,'html2canvas',{
      configurable:true,enumerable:true,
      get:function(){return cur},
      set:function(v){cur=wrapH2C(v)}
    });
  }catch(e){}
})();

/* برای مسیر جایگزین (fobj) که html2canvas ندارد: app-core می‌تواند BWP.wrap را صدا بزند */
function wrapAsync(fn,el,opts){
  if(!isOn()||busy>0)return fn(el,opts);
  var undo=null;busy++;
  try{undo=CORE.applyTree(el)}catch(e){undo=null}
  return Promise.resolve(fn(el,opts)).then(function(cv){busy--;if(undo)undo();return CORE.grayCanvas(cv)},function(err){busy--;if(undo)undo();throw err});
}

/* ───────── مسیر ۲: چاپ از همین صفحه ───────── */
var printUndo=null;
window.addEventListener('beforeprint',function(){
  if(!isOn()||printUndo)return;
  try{printUndo=CORE.applyTree(document.body)}catch(e){printUndo=null}
});
window.addEventListener('afterprint',function(){
  if(printUndo){try{printUndo()}catch(e){}printUndo=null}
});

/* ───────── مسیر ۳: پنجره‌ها و iframeهای چاپ ───────── */
var INJ_STYLE='<style id="bwp-inj">@media print{*{text-shadow:none!important;box-shadow:none!important}img{filter:grayscale(1) contrast(1.15)!important}}</style>';
function injectScript(){
  return '<script id="bwp-inj-js">(function(){var C=('+BWCORE.toString()+')(),u=null;'+
    'function on(){if(u)return;try{u=C.applyTree(document.body)}catch(e){}}'+
    'function off(){if(u){try{u()}catch(e){}u=null}}'+
    'addEventListener("beforeprint",on);addEventListener("afterprint",off);'+
    'if(matchMedia){var m=matchMedia("print");if(m.addListener)m.addListener(function(x){x.matches?on():off()})}'+
    '})();<\/script>';
}
function injectHtml(h){
  if(typeof h!=='string'||!isOn()||h.indexOf('bwp-inj')>=0)return h;
  var add=INJ_STYLE+injectScript();
  var i=h.lastIndexOf('</body>');
  if(i>=0)return h.slice(0,i)+add+h.slice(i);
  return h+add;
}
/* window.open: نوشتن سند را قلاب کن */
var _open=window.open;
window.open=function(){
  var w=_open.apply(window,arguments);
  try{
    if(w&&isOn()){
      var d=w.document,_w=d.write;
      d.write=function(){var a=[].slice.call(arguments);if(a.length&&typeof a[0]==='string')a[0]=injectHtml(a[0]);return _w.apply(d,a)};
    }
  }catch(e){}
  return w;
};
/* iframe.srcdoc (پیش‌نمایش چاپ آزمون و ...) */
try{
  var desc=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'srcdoc');
  if(desc&&desc.set){
    Object.defineProperty(HTMLIFrameElement.prototype,'srcdoc',{
      configurable:true,enumerable:desc.enumerable,
      get:desc.get,
      set:function(v){return desc.set.call(this,injectHtml(v))}
    });
  }
}catch(e){}

/* ───────── رابط کاربری: دکمه‌ی هدر ───────── */
var ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/><circle cx="17" cy="12" r=".6" fill="currentColor"/></svg>';
var btn=null;
function paintBtn(){
  if(!btn)return;
  var on=isOn();
  btn.setAttribute('aria-pressed',on?'true':'false');
  btn.title=on?'چاپ سیاه‌وسفید روشن است: همه‌ی PDFها و چاپ‌ها بدون رنگ و کم‌مصرف ساخته می‌شوند (برای خاموش‌کردن بزنید)':'چاپ سیاه‌وسفید: PDFها و چاپ‌ها را مناسب چاپگر سیاه‌وسفید بساز';
  btn.innerHTML=ICON+'<span class="tl">'+(on?'چاپ سیاه‌وسفید: روشن':'چاپ سیاه‌وسفید')+'</span>';
}
function mount(){
  if(btn||!document.body)return;
  var hd=document.querySelector('header');
  if(!hd)return;
  btn=document.createElement('button');
  btn.type='button';btn.id='bwb';btn.setAttribute('aria-label','چاپ سیاه‌وسفید');
  btn.addEventListener('click',function(){setOn(!isOn());toast(isOn()?'🖨️ حالت چاپ سیاه‌وسفید روشن شد؛ از این پس همه‌ی PDFها و چاپ‌ها بی‌رنگ و کم‌مصرف ساخته می‌شوند.':'🎨 حالت چاپ سیاه‌وسفید خاموش شد؛ PDFها دوباره رنگی ساخته می‌شوند.')});
  var tg=document.getElementById('thg');
  if(tg&&tg.parentNode===hd)hd.insertBefore(btn,tg);else hd.appendChild(btn);
  paintBtn();
}
function toast(t){
  var o=document.getElementById('bwt');if(o)o.remove();
  var d=document.createElement('div');d.id='bwt';d.setAttribute('role','status');d.textContent=t;
  d.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:100000;max-width:min(92vw,520px);background:#0f172a;color:#fff;padding:11px 16px;border-radius:12px;font:700 13px Vazirmatn,Tahoma,sans-serif;line-height:1.8;box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:center';
  document.body.appendChild(d);setTimeout(function(){d.remove()},3600);
}
/* نشانگر کوچک کنار دکمه‌های PDF/چاپ: وقتی حالت روشن است، کاربر بداند خروجی سیاه‌وسفید است */
var CSS='html.bwp-on #bwb{outline:0}'+
 'html.bwp-on [data-bwp-note]{display:inline}';
var st=document.createElement('style');st.id='bwp-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st);

function boot(){mount();if(!btn){var n=0,t=setInterval(function(){mount();if(btn||++n>40)clearInterval(t)},150)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
/* theme-toggle.js بعداً بارگذاری می‌شود؛ جای دکمه را پس از آن مرتب کن */
window.addEventListener('load',function(){
  var tg=document.getElementById('thg'),hd=document.querySelector('header');
  if(btn&&tg&&hd&&tg.parentNode===hd&&btn.nextSibling!==tg)hd.insertBefore(btn,tg);
});

window.BWP={
  on:isOn,set:setOn,toggle:function(){setOn(!isOn())},
  apply:CORE.applyTree,gray:CORE.grayCanvas,wrap:wrapAsync,
  onChange:function(f){listeners.push(f)},
  /* برای تست‌ها */
  _inject:injectHtml
};
})();

/* برنامه‌ی آزمون‌ها */
(function(){try{
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const WN=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const TYPES=['آزمون کتبی','آزمون پایان نیمسال اول','آزمون پایان نیمسال دوم'];
const isFin=t=>/پایان نیمسال/.test(t||'');
const jf=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
const jp=d=>{const o={};jf.formatToParts(d).forEach(p=>{if(p.type==='year'||p.type==='relatedYear')o.y=+p.value;else if(p.type==='month')o.m=+p.value;else if(p.type==='day')o.d=+p.value});return o};
const addD=(d,n)=>new Date(d.getTime()+n*864e5),iso=d=>d.toISOString().slice(0,10),dt=k=>new Date(k+'T12:00:00Z');
function fromJ(y,m,d){let g=addD(new Date(Date.UTC(y+621,2,21,12)),(m<=6?(m-1)*31:186+(m-7)*30)+d-1);const t=y*400+m*32+d;for(let i=0;i<10;i++){const p=jp(g),v=p.y*400+p.m*32+p.d;if(v===t)break;g=addD(g,v>t?-1:1)}return g}
const today=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),12))};
const dim=(y,m)=>m<=6?31:m<=11?30:(jp(fromJ(y,12,30)).m===12?30:29);
const wdn=d=>WN[(d.getUTCDay()+1)%7];
const fmtJ=k=>{const p=jp(dt(k));return fa(p.y)+'/'+fa(String(p.m).padStart(2,'0'))+'/'+fa(String(p.d).padStart(2,'0'))};
const diff=k=>Math.round((dt(k)-today())/864e5);
const P=()=>(S.exPlan=S.exPlan||[]);
const cname=id=>((S.courses||[]).find(c=>c.id===id)||{}).name||'درس';
const CHs=cid=>{const c=(S.courses||[]).find(x=>x.id===cid);return c&&c.ch?c.ch:[]};
const tpName=(cid,tid)=>{for(const h of CHs(cid))for(const t of (h.tp||[]))if(t.id===tid)return[h.name,t.name];return null};
const persist=()=>{try{save()}catch(e){console.warn('exp save',e)}};

window.__pct=v=>(typeof S!=='undefined'&&S&&S.pct&&v!=null&&!isNaN(v))?' (حدود '+fa(Math.round(v/4*100))+'٪)':'';

const css=document.createElement('style');css.id='expCss';css.textContent=`
#exp .ex-hero{position:relative;overflow:hidden;border-radius:26px;padding:18px 18px 16px;color:#fff;margin-bottom:12px;background:linear-gradient(135deg,#7e57c2 0%,#b36bd6 45%,#ff7aa2 80%,#ffb86b 100%);box-shadow:0 12px 30px #7e57c24d;animation:exin .5s both}
#exp .ex-hero::before,#exp .ex-hero::after{content:"";position:absolute;border-radius:50%;background:#ffffff26;animation:exfloat 7s ease-in-out infinite}
#exp .ex-hero::before{width:120px;height:120px;left:-30px;top:-40px}
#exp .ex-hero::after{width:80px;height:80px;left:70px;bottom:-34px;animation-delay:-3s}
#exp .ex-hrow{position:relative;z-index:1;display:flex;align-items:center;gap:14px}
#exp .ex-ring{width:84px;height:84px;flex:none;position:relative}
#exp .ex-ring svg{width:84px;height:84px;transform:rotate(-90deg)}
#exp .ex-ring circle{fill:none;stroke-width:8;stroke-linecap:round}
#exp .ex-ring .bg{stroke:#ffffff40}
#exp .ex-ring .fg{stroke:#fff;stroke-dasharray:214;stroke-dashoffset:214;transition:stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)}
#exp .ex-ring b{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:24px;line-height:1}
#exp .ex-ring small{font-size:10px;font-weight:600;opacity:.9;margin-top:2px}
#exp .ex-ht{flex:1;min-width:0}
#exp .ex-ht h3{margin:0 0 4px;font-size:17px}
#exp .ex-ht p{margin:0;font-size:13px;opacity:.95;line-height:1.8}
#exp .ex-chips{position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#exp .ex-chip{background:#ffffff2e;backdrop-filter:blur(4px);border-radius:14px;padding:5px 11px;font-size:12px;font-weight:700}
#exp .ex-card{background:var(--card);border-radius:22px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px #7e57c21f;animation:exin .5s both}
#exp .ex-card h4{margin:0 0 10px;font-size:15px;display:flex;align-items:center;gap:8px}
#exp .ex-card h4 i{font-style:normal;width:30px;height:30px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ede4fb,#ffe3ec);font-size:16px}
#exp label.ex-l{display:block;font-size:12.5px;font-weight:700;color:var(--mut);margin:10px 4px 5px}
#exp .ex-in{width:100%;box-sizing:border-box;border:2px solid var(--line);background:var(--card);color:var(--tx);border-radius:14px;padding:11px 12px;font:inherit;font-size:14px;transition:border-color .2s,box-shadow .2s,transform .2s}
#exp .ex-in:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 4px #7e57c224}
#exp .ex-g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#exp .ex-d3{display:grid;grid-template-columns:1.1fr 1.6fr 1fr;gap:8px}
#exp .ex-quick{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
#exp .ex-q{border:1px dashed var(--p2);background:transparent;color:var(--p);border-radius:20px;padding:5px 12px;font:700 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer;transition:transform .15s,background .2s}
#exp .ex-q:hover{background:#7e57c21a}#exp .ex-q:active{transform:scale(.93)}
#exp .ex-dl{margin:9px 4px 0;font-size:13px;font-weight:700;color:var(--p)}
#exp .ex-warn{display:flex;flex-direction:column;gap:6px;margin-top:8px}
#exp .ex-w{display:flex;gap:8px;align-items:flex-start;background:#fff4dc;color:#8a5a00;border-radius:12px;padding:8px 11px;font-size:12.5px;line-height:1.8;animation:expop .35s both}
#exp .ex-w.b{background:#ffe5e7;color:#a3262c}
:root[data-theme="dark"] #exp .ex-w{background:#3b3017;color:#ffd98a}:root[data-theme="dark"] #exp .ex-w.b{background:#401c20;color:#ffb3b8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #exp .ex-w{background:#3b3017;color:#ffd98a}:root:not([data-theme="light"]) #exp .ex-w.b{background:#401c20;color:#ffb3b8}}
#exp .ex-btn{position:relative;overflow:hidden;width:100%;margin-top:14px;border:0;border-radius:40px;padding:14px;font:800 16px Vazirmatn,Tahoma,sans-serif;color:#fff;cursor:pointer;background:linear-gradient(90deg,#7e57c2,#ff7aa2);box-shadow:0 8px 20px #7e57c244;transition:transform .15s,box-shadow .2s,opacity .2s}
#exp .ex-btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,#ffffff59,transparent);transform:skewX(-20deg);animation:exshine 3.6s ease-in-out infinite}
#exp .ex-btn:active{transform:scale(.97)}#exp .ex-btn[disabled]{opacity:.45;box-shadow:none;cursor:not-allowed}
#exp .ex-btn.g{background:var(--bg2);color:var(--tx);box-shadow:none;margin-top:8px;padding:11px;font-size:14px}#exp .ex-btn.g::after{display:none}
#exp .ex-tabs{display:flex;gap:6px;background:var(--bg2);padding:5px;border-radius:18px;margin:4px 0 12px}
#exp .ex-tabs button{flex:1;border:0;background:transparent;color:var(--mut);border-radius:14px;padding:9px 4px;font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer;transition:background .25s,color .25s,box-shadow .25s}
#exp .ex-tabs button.on{background:var(--card);color:var(--p);box-shadow:0 3px 10px #7e57c230}
#exp .ex-it{position:relative;background:var(--card);border-radius:20px;padding:14px 14px 12px;margin-bottom:10px;box-shadow:0 4px 14px #7e57c21c;border-right:6px solid var(--p2);animation:exin .5s both;animation-delay:calc(var(--i,0)*70ms);transition:transform .2s,box-shadow .2s}
#exp .ex-it:hover{transform:translateY(-2px);box-shadow:0 10px 24px #7e57c230}
#exp .ex-it.fin{border-right-color:#ff7aa2}#exp .ex-it.done{border-right-color:var(--ok);opacity:.92}#exp .ex-it.x{border-right-color:#b4a6cf;opacity:.7}
#exp .ex-it.due{border-right-color:var(--wa)}
#exp .ex-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
#exp .ex-nm{font-size:16px;font-weight:800;margin:0}
#exp .ex-tp{display:inline-block;background:var(--bg2);border-radius:9px;padding:2px 9px;font-size:11.5px;font-weight:700;margin-top:5px;color:var(--p)}
#exp .ex-meta{margin-top:8px;font-size:12.5px;color:var(--mut);line-height:1.9}
#exp .ex-meta b{color:var(--tx)}
#exp .ex-cd{flex:none;min-width:62px;text-align:center;border-radius:16px;padding:7px 9px;background:linear-gradient(135deg,#ede4fb,#e6f0ff);color:var(--p);font-weight:800;font-size:12px;line-height:1.4}
#exp .ex-cd b{display:block;font-size:20px}
#exp .ex-cd.now{background:linear-gradient(135deg,#ff7aa2,#ffb86b);color:#fff;animation:expulse 1.6s ease-in-out infinite}
#exp .ex-cd.soon{background:linear-gradient(135deg,#ffe9b5,#ffd1dc);color:#8a4b00}
#exp .ex-cd.late{background:#ffe5e7;color:#a3262c}
#exp .ex-cd.ok{background:#dcf5e8;color:#16744a}
#exp .ex-cd.mut{background:var(--bg2);color:var(--mut)}
#exp .ex-st{display:inline-block;border-radius:9px;padding:2px 9px;font-size:11.5px;font-weight:700;margin-right:6px}
#exp .ex-st.mv{background:#fff0d6;color:#935f00}#exp .ex-st.dn{background:#dcf5e8;color:#16744a}#exp .ex-st.cx{background:#ececf2;color:#6b6b80}
#exp .ex-acts{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}
#exp .ex-a{border:1px solid var(--line);background:var(--card);color:var(--tx);border-radius:12px;padding:7px 12px;font:700 12.5px Vazirmatn,Tahoma,sans-serif;cursor:pointer;transition:transform .15s,background .2s}
#exp .ex-a:active{transform:scale(.93)}#exp .ex-a:hover{background:var(--bg2)}
#exp .ex-a.pr{border:0;color:#fff;background:linear-gradient(90deg,#2eaf6b,#4cc9a0);box-shadow:0 5px 14px #2eaf6b40}
#exp .ex-a.pr[disabled]{background:var(--bg2);color:var(--mut);box-shadow:none;cursor:not-allowed}
#exp .ex-a.dg{color:var(--no)}
#exp .ex-emp{text-align:center;padding:26px 10px;color:var(--mut);font-size:14px;line-height:2}
#exp .ex-emp i{display:block;font-style:normal;font-size:44px;animation:exfloat 4s ease-in-out infinite}
#exp .ex-sw{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}
#exp .ex-sw .t{font-weight:800;font-size:14px}#exp .ex-sw .s{font-size:12px;color:var(--mut);line-height:1.9;margin-top:3px}
#exp .ex-tg{flex:none;position:relative;width:52px;height:30px;border-radius:30px;background:#cfc4e4;transition:background .3s}
#exp .ex-tg::after{content:"";position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 6px #0003;transition:transform .3s cubic-bezier(.3,1.4,.5,1)}
#exp .ex-tg.on{background:linear-gradient(90deg,#7e57c2,#ff7aa2)}#exp .ex-tg.on::after{transform:translateX(-22px)}
#exp .ex-note{font-size:12px;color:var(--mut);line-height:2;background:var(--bg2);border-radius:14px;padding:10px 12px;margin-top:10px}
#exToast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translate(-50%,30px);background:#3b2a55;color:#fff;border-radius:30px;padding:11px 20px;font:700 13px Vazirmatn,Tahoma,sans-serif;opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.3,1.3,.5,1);z-index:99999;max-width:88vw;text-align:center}
#exToast.on{opacity:1;transform:translate(-50%,0)}
.ex-rem{position:relative;overflow:hidden;border-radius:22px;padding:14px;margin-bottom:12px;background:linear-gradient(135deg,#f3ebff,#ffe8f0);box-shadow:0 6px 18px #7e57c224;animation:exin .5s both}
:root[data-theme="dark"] .ex-rem{background:linear-gradient(135deg,#2c2142,#3a2338)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ex-rem{background:linear-gradient(135deg,#2c2142,#3a2338)}}
.ex-rem h4{margin:0 0 9px;font-size:14.5px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--tx)}
.ex-rem h4 button{border:0;background:transparent;color:var(--p);font:700 12px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
.ex-ri{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:15px;padding:9px 11px;margin-top:7px;cursor:pointer;animation:exin .45s both;animation-delay:calc(var(--i,0)*80ms);transition:transform .15s;color:var(--tx)}
.ex-ri:active{transform:scale(.98)}
.ex-ri i{font-style:normal;font-size:20px;flex:none}
.ex-ri span{flex:1;font-size:13px;line-height:1.8;font-weight:600}
.ex-ri em{font-style:normal;flex:none;border-radius:11px;padding:3px 9px;font-size:11.5px;font-weight:800;background:#ede4fb;color:#7e57c2}
.ex-ri.now em{background:linear-gradient(135deg,#ff7aa2,#ffb86b);color:#fff;animation:expulse 1.6s ease-in-out infinite}
.ex-rem.urgent{border:2px solid #ff7aa2;animation:exin .5s both,exurg 2.4s ease-in-out .6s infinite}
.ex-lowk{margin-top:9px;background:#fff4dc;color:#8a5a00;border-radius:12px;padding:8px 11px;font-size:12.5px;line-height:1.9;font-weight:600}
:root[data-theme="dark"] .ex-lowk{background:#3b3017;color:#ffd98a}
.ex-ri.late em{background:#ffe5e7;color:#a3262c}
@keyframes exin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes expop{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.04)}100%{opacity:1;transform:none}}
@keyframes expulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 #ff7aa280}50%{transform:scale(1.05);box-shadow:0 0 0 9px #ff7aa200}}
@keyframes exfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes exurg{0%,100%{box-shadow:0 6px 18px #7e57c224}50%{box-shadow:0 0 0 7px #ff7aa233,0 6px 18px #7e57c224}}
@keyframes exshine{0%,55%{left:-60%}100%{left:130%}}
@media (prefers-reduced-motion:reduce){#exp *,.ex-rem,.ex-rem *,#exToast{animation:none!important;transition:none!important}}
`;document.head.appendChild(css);

let tt;const toast=m=>{let t=$('exToast');if(!t){t=document.createElement('div');t.id='exToast';document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)};
let built=false,editId=null,tab='up',D={y:0,m:1,d:1},pend=null,blTouched=false;
const hasBl=e=>e.bell!==''&&e.bell!=null;
const bt=e=>{const a=window.wscApi;return a&&hasBl(e)?a.text(e.bell,e.date):''};
const tk=e=>{const a=window.wscApi;if(a&&hasBl(e)){const s=a.start(e.bell,e.date);if(s)return s}return e.time||''};
function fillBells(){const a=window.wscApi,s=$('exBl');if(!s||!a)return;const v=s.value;s.innerHTML=a.options().map(o=>`<option value="${o.v}">${esc(o.t)}</option>`).join('');s.value=v;if(s.value!==v)s.value=''}
function bellHint(){const a=window.wscApi,h=$('exBlH'),s=$('exBl');if(!a||!h||!s)return;const c=+$('exC').value,k=curISO(),sg=c?a.suggest(c,k):'';
 h.textContent=sg!==''?'طبق برنامه‌ی هفتگی، «'+cname(c)+'» در آن روز '+a.text(sg,k).replace(' — ',' (ساعت ')+') دارد.':'';
 if(sg!==''&&!blTouched&&!editId)s.value=sg}
const curISO=()=>iso(fromJ(D.y,D.m,D.d));
const ownLabel=e=>e.rng||(e.tp&&tpName(e.course,e.tp)?tpName(e.course,e.tp)[1]:'');

function conflicts(k,ignore){
 const out=[],d=dt(k),t0=iso(today());
 if(k<t0)out.push({b:1,m:'این تاریخ گذشته است؛ برنامه امتحانی فقط برای امروز و روزهای آینده ثبت می‌شود.'});
 const w=d.getUTCDay();
 if(w===4||w===5||(S.closed&&S.closed[k]))out.push({m:(w===4?'پنجشنبه':w===5?'جمعه':'این روز در برنامه تعطیل ثبت شده')+(w===4||w===5?' تعطیل است':'')+'؛ معمولاً کلاس برگزار نمی‌شود.'});
 const act=P().filter(x=>x.st==='p'&&x.id!==ignore),same=act.filter(x=>x.date===k);
 if(same.length)out.push({m:'در همین روز '+fa(same.length)+' آزمون دیگر هم برنامه‌ریزی شده ('+same.map(x=>cname(x.course)).join('، ')+').'});
 {const a=window.wscApi,bl=$('exBl')?$('exBl').value:'';if(a&&bl!==''&&same.some(x=>hasBl(x)&&a.start(x.bell,k)&&a.start(x.bell,k)===a.start(bl,k)))out.push({m:'در همین روز، آزمون دیگری هم در همین زنگ برنامه‌ریزی شده؛ دو آزمون هم‌زمان می‌شود.'})}
 const idx=(w+1)%7,ws=iso(addD(d,-idx)),we=iso(addD(d,6-idx)),n=act.filter(x=>x.date>=ws&&x.date<=we).length+1;
 if(n>2)out.push({m:'با این آزمون، '+fa(n)+' آزمون در یک هفته جمع می‌شود؛ فشار روی دانش‌آموزان زیاد است.'});
 return out;
}

function build(){
 const b=$('expBody');if(!b)return;
 b.innerHTML=`<div id="exHero"></div>
 <div class="ex-card" id="exFormCard" style="animation-delay:.08s"><h4><i>➕</i><span id="exFt">ثبت آزمون آینده</span></h4>
  <div class="ex-g2"><div><label class="ex-l">درس</label><select id="exC" class="ex-in"></select></div><div><label class="ex-l">نوع آزمون</label><select id="exT" class="ex-in">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div></div>
  <div id="exTpW"><label class="ex-l">مبحث (اختیاری)</label><select id="exTp" class="ex-in"></select></div>
  <label class="ex-l">محدوده یا توضیح (اختیاری)</label><input id="exR" class="ex-in" placeholder="مثلاً درس ۳ تا ۵، صفحه‌ی ۱۲ تا ۲۰" maxlength="80">
  <label class="ex-l">تاریخ برگزاری (شمسی)</label>
  <div class="ex-d3"><select id="exY" class="ex-in"></select><select id="exM" class="ex-in"></select><select id="exD" class="ex-in"></select></div>
  <div class="ex-quick"><button class="ex-q" data-q="1">فردا</button><button class="ex-q" data-q="3">۳ روز بعد</button><button class="ex-q" data-q="7">هفته‌ی بعد</button><button class="ex-q" data-q="14">۲ هفته‌ی بعد</button></div>
  <div class="ex-dl" id="exDl"></div><div class="ex-warn" id="exWarn"></div>
  <label class="ex-l">زنگ برگزاری (اختیاری)</label><select id="exBl" class="ex-in"></select><div id="exBlH" style="font-size:12px;color:var(--mut);margin:4px 2px 0;line-height:1.9"></div>
  <button class="ex-btn" id="exAdd">ثبت در برنامه امتحانی</button><button class="ex-btn g" id="exCan" style="display:none">انصراف از ویرایش</button></div>
 <div class="ex-tabs" id="exTabs"><button data-t="up" class="on">پیش‌رو</button><button data-t="old">بایگانی</button><button data-t="all">همه</button></div>
 <div id="exList"></div>
 <div class="ex-card" id="exPctC"><div class="ex-sw" id="exPctS"><div><div class="t">📊 نمایش درصد تقریبی کنار نمره</div><div class="s">مثلاً «۳٫۲ از ۴ (حدود ۸۰٪)» در نمودارهای کلاس و گزارش والدین. پیش‌فرض خاموش است.</div></div><div class="ex-tg" id="exTg"></div></div>
  <div class="ex-note">⚠️ سطح ۱ می‌شود ۲۵٪ و ممکن است اولیا را نگران کند، و ارزشیابی توصیفی رسمی درصد نمی‌دهد. برچسب توصیفی (مثل «خوب») همیشه کنار نمره می‌ماند.<br>🔔 یادآورها فقط وقتی برنامه باز است نمایش داده می‌شوند؛ اعلان خودکار روی دستگاه نیاز به نسخه‌ی نصب‌شده با Push دارد.</div></div>`;
 const cy=jp(today()).y;
 $('exY').innerHTML=[cy-1,cy,cy+1].map(y=>`<option value="${y}">${fa(y)}</option>`).join('');
 $('exM').innerHTML=MN.map((n,i)=>`<option value="${i+1}">${n}</option>`).join('');
 setISO(iso(addD(today(),1)));
 const ev=(id,f)=>$(id).addEventListener('change',f);
 ev('exC',()=>{fillTp();upd()});ev('exT',()=>{fillTp();upd()});
 ev('exY',()=>{D.y=+$('exY').value;fixDay()});ev('exM',()=>{D.m=+$('exM').value;fixDay()});ev('exD',()=>{D.d=+$('exD').value;upd()});
 $('exBl').addEventListener('change',()=>{blTouched=true;upd()});$('exAdd').onclick=submit;$('exCan').onclick=()=>{resetForm();toast('ویرایش لغو شد')};
 $('exPctS').onclick=()=>{S.pct=!S.pct;persist();paintPct();toast(S.pct?'درصد تقریبی روشن شد':'درصد تقریبی خاموش شد')};
 b.addEventListener('click',e=>{
  const q=e.target.closest('[data-q]');if(q){setISO(iso(addD(today(),+q.dataset.q)));return}
  const t=e.target.closest('#exTabs [data-t]');if(t){tab=t.dataset.t;document.querySelectorAll('#exTabs button').forEach(x=>x.classList.toggle('on',x===t));list();return}
  const a=e.target.closest('[data-a]');if(a)act(a.dataset.a,+a.dataset.id,a)});
 built=true;
}
function setISO(k){const p=jp(dt(k));D={y:p.y,m:p.m,d:p.d};$('exY').value=D.y;$('exM').value=D.m;fillDays();upd()}
function fillDays(){const n=dim(D.y,D.m);if(D.d>n)D.d=n;$('exD').innerHTML=Array.from({length:n},(_,i)=>`<option value="${i+1}">${fa(i+1)}</option>`).join('');$('exD').value=D.d}
function fixDay(){fillDays();upd()}
function fillCourses(){const sel=$('exC'),v=sel.value,cs=(S.courses||[]).filter(c=>c.name!=='هنر'&&c.name!=='تربیت بدنی');
 sel.innerHTML=cs.length?cs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(''):'<option value="">— ابتدا یک درس اضافه کنید —</option>';if(v&&cs.some(c=>String(c.id)===v))sel.value=v;fillTp()}
function fillTp(){const cid=+$('exC').value,fin=isFin($('exT').value),ch=CHs(cid),has=ch.some(h=>(h.tp||[]).length),w=$('exTpW');
 w.style.display=!fin&&has?'':'none';const v=$('exTp').value;
 $('exTp').innerHTML='<option value="">بدون مبحث مشخص</option>'+ch.map(h=>`<optgroup label="${esc(h.name)}">${(h.tp||[]).map(t=>`<option value="${h.id}:${t.id}">${esc(t.name)}</option>`).join('')}</optgroup>`).join('');
 if(v)$('exTp').value=v;if(!$('exTp').value)$('exTp').value=''}
function upd(){
 fillBells();bellHint();const k=curISO(),d=dt(k),n=diff(k),w=conflicts(k,editId);
 $('exDl').textContent=wdn(d)+' '+fmtJ(k)+' — '+(n===0?'امروز':n===1?'فردا':n>1?fa(n)+' روز دیگر':fa(-n)+' روز پیش');
 $('exWarn').innerHTML=w.map(x=>`<div class="ex-w${x.b?' b':''}"><span>${x.b?'⛔':'⚠️'}</span><span>${x.m}</span></div>`).join('');
 $('exAdd').disabled=w.some(x=>x.b)||!+$('exC').value;
}
function resetForm(){editId=null;$('exFt').textContent='ثبت آزمون آینده';$('exAdd').textContent='ثبت در برنامه امتحانی';$('exCan').style.display='none';$('exR').value='';$('exBl').value='';blTouched=false;$('exTp').value='';setISO(iso(addD(today(),1)))}

function submit(){
 const c=+$('exC').value;if(!c){toast('ابتدا یک درس اضافه کنید');return}
 const k=curISO();if(conflicts(k,editId).some(x=>x.b)){toast('تاریخ گذشته قابل ثبت نیست');return}
 const type=$('exT').value,tpv=!isFin(type)?$('exTp').value:'',r=$('exR').value.trim().slice(0,80),bl=$('exBl').value||'',tm=bl?'':(editId?((P().find(x=>x.id===editId)||{}).time||''):'');
 let ch=null,tp=null;if(tpv){const a=tpv.split(':').map(Number);ch=a[0];tp=a[1]}
 if(editId){const e=P().find(x=>x.id===editId);if(e){if(e.date!==k){e.mv=e.mv||e.date;e.mvN=(e.mvN||0)+1}Object.assign(e,{course:c,type,rng:r,time:tm,bell:bl,date:k,ch,tp});toast('تغییرات ذخیره شد ✅')}resetForm()}
 else{P().push({id:Date.now(),course:c,type,rng:r,time:tm,bell:bl,date:k,ch,tp,st:'p'});toast('آزمون در برنامه ثبت شد ✅');$('exR').value='';$('exBl').value='';blTouched=false;$('exTp').value='';setISO(iso(addD(today(),1)))}
 persist();hero();list();
}
function edit(id){const e=P().find(x=>x.id===id);if(!e)return;editId=id;fillCourses();$('exC').value=e.course;$('exT').value=TYPES.includes(e.type)?e.type:TYPES[0];fillTp();$('exTp').value=e.tp?e.ch+':'+e.tp:'';$('exR').value=e.rng||'';fillBells();$('exBl').value=e.bell||'';blTouched=true;setISO(e.date);
 $('exFt').textContent='ویرایش آزمون';$('exAdd').textContent='ذخیره‌ی تغییرات';$('exCan').style.display='';$('exFormCard').scrollIntoView({behavior:'smooth',block:'start'})}

function gotoExam(exId){
 try{window.show('crs')}catch(er){}
 const go=()=>{try{
  window.openExNow&&window.openExNow(exId);
  window.__crsTab&&window.__crsTab('c');
  const el=document.querySelector('#crsList .row[data-eid="'+exId+'"]');
  (el||$('crsList')).scrollIntoView({behavior:'smooth',block:'start'});
 }catch(er){console.warn('gotoExam',er)}};
 go();setTimeout(go,250);
}
function convert(id){
 const e=P().find(x=>x.id===id);if(!e||e.st!=='p')return;
 if(e.date>iso(today())){toast('روز آزمون که برسد، ثبت نمرات فعال می‌شود');return}
 if(!(S.courses||[]).some(c=>c.id===e.course)){toast('درس این آزمون دیگر وجود ندارد');return}
 const x={id:Date.now(),course:e.course,type:e.type,title:e.rng||'',date:e.date,max:4,scores:{}};
 if(e.tp&&!isFin(e.type)){x.ch=e.ch;x.tp=e.tp;if(!x.title){const q=tpName(e.course,e.tp);if(q)x.title=q[0]+' – '+q[1]}}
 S.exams=S.exams||[];S.exams.push(x);e.st='done';e.exam=x.id;persist();
 toast('آزمون ساخته شد؛ نمرات را وارد کنید 📝');
 gotoExam(x.id);
}
function act(a,id,btn){
 const e=P().find(x=>x.id===id);if(!e)return;
 if(a==='conv')return convert(id);
 if(a==='edit')return edit(id);
 if(a==='view'){if(!e.exam||!(S.exams||[]).some(q=>q.id===e.exam)){toast('نمرات این آزمون پیدا نشد؛ ممکن است از بخش درس‌ها حذف شده باشد');return}gotoExam(e.exam);return}
 if(a==='cancel'){e.st='x';persist();hero();list();toast('آزمون لغو شد');return}
 if(a==='back'){e.st='p';persist();hero();list();toast('به برنامه برگشت');return}
 if(a==='del'){if(pend!==id){pend=id;btn.textContent='مطمئنید؟';setTimeout(()=>{if(pend===id){pend=null;list()}},3000);return}
  pend=null;S.exPlan=P().filter(x=>x.id!==id);persist();hero();list();toast('حذف شد')}
}

function kpi(){const t0=iso(today()),A=P(),dn=A.filter(x=>x.st==='done').length,ov=A.filter(x=>x.st==='p'&&x.date<t0).length,tot=dn+ov;return{dn,ov,tot,rate:tot?Math.round(dn/tot*100):null}}

function cd(e){
 const n=diff(e.date);
 if(e.st==='done')return`<div class="ex-cd ok"><b>✓</b>برگزار شد</div>`;
 if(e.st==='x')return`<div class="ex-cd mut"><b>—</b>لغو</div>`;
 if(n===0)return`<div class="ex-cd now"><b>امروز</b>روز آزمون</div>`;
 if(n===1)return`<div class="ex-cd soon"><b>فردا</b>آماده باشید</div>`;
 if(n>1)return`<div class="ex-cd ${n<=3?'soon':''}"><b>${fa(n)}</b>روز دیگر</div>`;
 return`<div class="ex-cd late"><b>${fa(-n)}</b>روز گذشته</div>`;
}
function hero(){
 const h=$('exHero');if(!h)return;fillBells();
 const t0=iso(today()),up=P().filter(x=>x.st==='p'&&x.date>=t0).sort((a,b)=>a.date.localeCompare(b.date)||tk(a).localeCompare(tk(b))),nx=up[0],
  K=kpi(),wk=up.filter(x=>diff(x.date)<=7).length,due=P().filter(x=>x.st==='p'&&x.date<t0).length,n=nx?diff(nx.date):0,pr=nx?Math.max(0,1-Math.min(n,14)/14):0;
 h.innerHTML=`<div class="ex-hero"><div class="ex-hrow"><div class="ex-ring"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="34"/><circle class="fg" id="exFg" cx="42" cy="42" r="34"/></svg><b>${nx?(n===0?'امروز':n===1?'فردا':fa(n)):'🗓️'}${nx&&n>1?'<small>روز</small>':''}</b></div>
  <div class="ex-ht"><h3>${nx?'آزمون بعدی: '+esc(cname(nx.course)):'برنامه امتحانی کلاس'}</h3><p>${nx?esc(nx.type)+(ownLabel(nx)?' — '+esc(ownLabel(nx)):'')+'<br>'+wdn(dt(nx.date))+' '+fmtJ(nx.date)+(bt(nx)?' — '+bt(nx):nx.time?' ساعت '+fa(nx.time):''):'هنوز آزمونی برنامه‌ریزی نشده. از فرم پایین اولین آزمون را ثبت کنید.'}</p></div></div>
  <div class="ex-chips"><span class="ex-chip">📌 ${fa(up.length)} آزمون پیش‌رو</span><span class="ex-chip">📅 ${fa(wk)} مورد در ۷ روز آینده</span>${due?`<span class="ex-chip">⏰ ${fa(due)} مورد منتظر ثبت نمره</span>`:''}${K.rate!=null?`<span class="ex-chip" title="آزمون‌های سررسیدشده‌ای که نمره‌شان ثبت شده">🎯 ${fa(K.rate)}٪ به ثبت نمره رسیده</span>`:''}</div></div>`;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=$('exFg');if(f)f.style.strokeDashoffset=String(214*(1-(nx?Math.max(.08,pr):0)))}));
}
function item(e,i){
 const n=diff(e.date),due=e.st==='p'&&n<0,can=e.st==='p'&&n<=0;
 const lab=ownLabel(e),mv=e.mv?`<span class="ex-st mv">جابه‌جا شد${e.mvN>1?' ('+fa(e.mvN)+' بار)':''}</span>`:'';
 const st=e.st==='done'?'<span class="ex-st dn">برگزار شد</span>':e.st==='x'?'<span class="ex-st cx">لغو شد</span>':'';
 const acts=e.st==='p'?`<button class="ex-a pr" data-a="conv" data-id="${e.id}" ${can?'':'disabled'}>📝 ثبت نمرات</button><button class="ex-a" data-a="edit" data-id="${e.id}">✏️ ویرایش / جابه‌جایی</button><button class="ex-a" data-a="cancel" data-id="${e.id}">لغو</button><button class="ex-a dg" data-a="del" data-id="${e.id}">${pend===e.id?'مطمئنید؟':'🗑'}</button>`
  :e.st==='done'?`<button class="ex-a pr" data-a="view" data-id="${e.id}">📊 دیدن نمرات</button><button class="ex-a dg" data-a="del" data-id="${e.id}">${pend===e.id?'مطمئنید؟':'🗑'}</button>`
  :`<button class="ex-a" data-a="back" data-id="${e.id}">↩️ بازگرداندن</button><button class="ex-a dg" data-a="del" data-id="${e.id}">${pend===e.id?'مطمئنید؟':'🗑'}</button>`;
 return`<div class="ex-it ${isFin(e.type)?'fin':''} ${e.st==='done'?'done':e.st==='x'?'x':due?'due':''}" style="--i:${i}"><div class="ex-top"><div><p class="ex-nm">${esc(cname(e.course))}</p><span class="ex-tp">${esc(e.type)}</span>${st}${mv}</div>${cd(e)}</div>
  <div class="ex-meta">📅 <b>${wdn(dt(e.date))} ${fmtJ(e.date)}</b>${bt(e)?' — 🕒 '+bt(e):e.time?' — 🕒 '+fa(e.time):''}${lab?'<br>📖 '+esc(lab):''}${e.mv?'<br>تاریخ قبلی: '+fmtJ(e.mv):''}${due?'<br>⏰ زمان آزمون گذشته؛ اگر برگزار شده، نمره‌ها را ثبت کنید.':''}${can||e.st!=='p'?'':'<br>🔒 ثبت نمرات از روز آزمون فعال می‌شود'}</div><div class="ex-acts">${acts}</div></div>`;
}
function list(){
 const L=$('exList');if(!L)return;let a=P().slice();
 if(tab==='up')a=a.filter(x=>x.st==='p').sort((x,y)=>x.date.localeCompare(y.date)||tk(x).localeCompare(tk(y)));
 else if(tab==='old')a=a.filter(x=>x.st!=='p').sort((x,y)=>y.date.localeCompare(x.date));
 else a.sort((x,y)=>x.date.localeCompare(y.date));
 L.innerHTML=a.length?a.map((e,i)=>item(e,i)).join(''):`<div class="ex-emp"><i>${tab==='old'?'📚':'🌤️'}</i>${tab==='old'?'هنوز آزمونی برگزار یا لغو نشده است.':'آزمونی در انتظار نیست.<br>از فرم بالا اولین آزمون را برنامه‌ریزی کنید.'}</div>`;
}
function paintPct(){const t=$('exTg');if(t)t.classList.toggle('on',!!S.pct)}
function renderExp(){if(!built)build();fillCourses();hero();list();paintPct();upd()}

function homeRem(){
 const hm=$('home');if(!hm)return;const old=$('exRem');if(old)old.remove();
 if(!S||!S.courses)return;
 const t0=iso(today()),A=P().filter(x=>x.st==='p');
 const due=A.filter(x=>x.date<=t0&&diff(x.date)>=-14).sort((a,b)=>a.date.localeCompare(b.date));
 const up=A.filter(x=>x.date>t0&&diff(x.date)<=7).sort((a,b)=>a.date.localeCompare(b.date));
 const rows=[];
 due.forEach(e=>{const n=diff(e.date),l=ownLabel(e),c=cname(e.course);rows.push({k:n===0?'now':'late',i:n===0?'🔔':'⏰',t:n===0?`امروز آزمون ${esc(c)} دارید${l?' ('+esc(l)+')':''}؛ بعد از برگزاری نمره‌ها را ثبت کنید.`:`آزمون ${esc(c)} (${fa(-n)} روز پیش) هنوز نمره‌ای ندارد.`,b:n===0?'امروز':'ثبت نمره'})});
 up.forEach(e=>{const n=diff(e.date),l=ownLabel(e),c=cname(e.course);rows.push({k:'',i:isFin(e.type)?'🎓':'📝',t:n===1?`فردا آزمون ${esc(c)} دارید${l?' ('+esc(l)+')':''}.`:isFin(e.type)?`${fa(n)} روز تا ${esc(e.type)} (${esc(c)})`:`${fa(n)} روز تا آزمون ${esc(c)}${l?' ('+esc(l)+')':''}`,b:n===1?'فردا':fa(n)+' روز'})});
 if(!rows.length){const nx=A.filter(x=>x.date>t0).sort((a,b)=>a.date.localeCompare(b.date))[0];rows.push({k:'',i:'✅',t:nx?`آزمونی در ۷ روز آینده نیست. نزدیک‌ترین: ${esc(cname(nx.course))} — ${fa(diff(nx.date))} روز دیگر`:'آزمونی در برنامه ثبت نشده است؛ برای یادآوری خودکار (فردا، امروز، عقب‌افتاده) آزمون‌های پیش‌رو را در «برنامه‌ی امتحانی» ثبت کنید.',b:nx?fa(diff(nx.date))+' روز':'ثبت'})}
 const box=document.createElement('div');const K=kpi(),urgent=due.length>0;box.id='exRem';box.className='ex-rem'+(urgent?' urgent':'');
 box.innerHTML=`<h4><span>🗓️ یادآور آزمون‌ها</span><button data-go>برنامه امتحانی ›</button></h4>`+rows.slice(0,4).map((r,i)=>`<div class="ex-ri ${r.k}" style="--i:${i}" data-go><i>${r.i}</i><span>${r.t}</span><em>${r.b}</em></div>`).join('')+(K.tot>=3&&K.rate!=null&&K.rate<60?`<div class="ex-lowk">⚠️ فقط ${fa(K.rate)}٪ از آزمون‌های سررسیدشده نمره‌شان ثبت شده؛ بعد از هر آزمون نمره‌ها را همان روز وارد کنید.</div>`:'')+(rows.length>4?`<div class="sub" style="margin:8px 0 0;font-size:12px">و ${fa(rows.length-4)} مورد دیگر…</div>`:'');
 box.addEventListener('click',e=>{if(e.target.closest('[data-go]'))window.show('exp')});
 const a1=$('tdash2'),a2=$('stats');if(a1)a1.before(box);else if(a2)a2.before(box);else hm.prepend(box);
}

const _sh=window.show;
window.show=function(id){const r=_sh.apply(this,arguments);try{if(id==='exp')renderExp();else if(id==='home')homeRem()}catch(e){console.warn('exp',e)}return r};
window.expRefresh=()=>{try{homeRem();if($('exp')&&$('exp').classList.contains('on'))renderExp()}catch(e){}};
try{if($('home')&&$('home').classList.contains('on'))homeRem()}catch(e){}
}catch(e){console.error('exp-module',e)}})();

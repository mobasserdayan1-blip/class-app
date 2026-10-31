/* ⚠️ با هر تغییر در فایل‌ها، شماره‌ی نسخه‌ی کش (cl-v..) را یکی بالا ببرید تا کاربران نسخه‌ی جدید را بگیرند */
const C='cl-v124';
const A=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-512.png',
  './assets/fonts/Vazirmatn-VF.woff2',
  './assets/css/fonts.css',
  './assets/css/01-base.css',
  './assets/css/02-components.css',
  './assets/css/03-reset-fixes.css',
  './assets/css/04-student-file-and-avatars.css',
  './assets/css/05-patch-lottery.css',
  './assets/css/06-motivation-dashboard.css',
  './assets/css/07-home-menu.css',
  './assets/css/08-responsive-v1.css',
  './assets/css/09-responsive-v2.css',
  './assets/css/10-theme-unified.css',
  './assets/css/11-nav-collapse.css',
  './assets/css/12-manager-tabs-and-reset.css',
  './assets/css/13-results-table-and-draw.css',
  './assets/css/14-editor-panels.css',
  './assets/css/15-excused-and-theme-toggle.css',
  './assets/css/16-etoud-ui.css',
  './assets/js/boot/01-helpers.js',
  './assets/js/boot/02-lock-flash.js',
  './assets/js/boot/modules.js',
  './assets/js/boot/03-storage-boot.js',
  './assets/js/boot/04-nav-collapse.js',
  './assets/js/core/storage-partitions.js',
  './assets/js/core/app-core.js',
  './assets/js/features/activities.js',
  './assets/js/features/smart-home-scores.js',
  './assets/js/features/topics-and-attendance.js',
  './assets/js/features/book-import-reports.js',
  './assets/js/features/student-file.js',
  './assets/js/features/classes.js',
  './assets/js/features/backup-restore.js',
  './assets/js/features/class-analysis-dashboard.js',
  './assets/js/features/topics-editor.js',
  './assets/js/features/birthday-card.js',
  './assets/js/features/settings-signature.js',
  './assets/js/features/activity-types.js',
  './assets/js/features/teacher-files.js',
  './assets/js/features/student-id-cards.js',
  './assets/js/features/holidays-and-schedule.js',
  './assets/js/features/motivation-dashboard.js',
  './assets/js/features/class-specific-topics.js',
  './assets/js/patches/remove-score-tab.js',
  './assets/js/features/weekly-report.js',
  './assets/js/features/bulk-export-and-history.js',
  './assets/js/features/teacher-profile.js',
  './assets/js/ui/home-subtabs.js',
  './assets/js/features/storage-usage.js',
  './assets/js/core/service-worker-register.js',
  './assets/js/features/arts-and-pe.js',
  './assets/js/ui/responsive-tables.js',
  './assets/js/features/teacher-dashboard.js',
  './assets/js/features/ranking.js',
  './assets/js/features/performance-reports.js',
  './assets/js/features/global-search.js',
  './assets/js/features/exam-schedule.js',
  './assets/js/features/weekly-timetable.js',
  './assets/js/features/school-team.js',
  './assets/js/features/role-access.js',
  './assets/js/features/manager-login.js',
  './assets/js/features/dashboard-simplify.js',
  './assets/js/features/quick-attendance.js',
  './assets/js/features/parent-contact-log.js',
  './assets/js/features/parent-meetings.js',
  './assets/js/features/parent-general-meetings.js',
  './assets/js/features/teacher-experiences.js',
  './assets/js/features/green-identity.js',
  './assets/js/features/supervision-log.js',
  './assets/js/features/supervision-quality.js',
  './assets/js/features/question-bank.js',
  './assets/js/features/learning-resources.js',
  './assets/js/features/teacher-self-assessment.js',
  './assets/js/features/homework-review.js',
  './assets/js/features/theme-toggle.js',
  './assets/js/features/etoud-ui.js',
  './assets/js/features/ai-config.js',
  './assets/js/features/ai-client.js',
  './assets/js/features/text-extract-core.js',
  './assets/js/features/text-extract.js',
  './assets/js/features/question-import-core.js',
  './assets/js/features/question-import-docx.js',
  './assets/js/features/question-import.js',
  './assets/templates/question-import-template.docx',
  './assets/js/features/exam-builder-core.js',
  './assets/js/features/exam-builder.js'
  /* pdf.js (assets/js/vendor/pdfjs/) عمداً پیش‌ذخیره نمی‌شود (حدود ۱٫۵ مگابایت)؛ بعد از اولین استفاده در کش می‌ماند و آفلاین هم کار می‌کند */
];
/* [CHG-7] کتابخانه‌های PDF/اکسل بعد از اولین بارگذاری موفق، آفلاین هم کار می‌کنند */
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
/* کتابخانه‌های Firebase (باید با نسخه‌ی B در index.html یکی باشند) */
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
const isCDN=u=>/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|www\.gstatic\.com\/firebasejs)\//.test(u);
/* فونت گوگل (جایگزین اگر فایل محلی نبود): اول از کش، و در پس‌زمینه به‌روز می‌شود */
const isGF=u=>/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//.test(u);
/* نصب مقاوم: اگر یکی از فایل‌ها روی سایت نبود، نصب سرویس‌ورکر خراب نمی‌شود */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all([...A.map(u=>c.add(u).catch(()=>{})),...CDN.map(u=>fetch(new Request(u,{mode:'no-cors'})).then(r=>c.put(u,r)).catch(()=>{}))])))});
/* [CHG-8] نسخه‌ی جدید منتظر می‌ماند تا کاربر در برنامه «به‌روزرسانی» را بزند */
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
if(isCDN(r.url)){e.respondWith(caches.open(C).then(c=>c.match(r.url).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r.url,res.clone()).catch(()=>{});return res}).catch(()=>new Response('',{status:504})))));return}
if(isGF(r.url)){e.respondWith(caches.open(C).then(c=>c.match(r.url).then(m=>{const f=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r.url,res.clone()).catch(()=>{});return res}).catch(()=>m||new Response('',{status:504}));return m||f})));return}
if(u.origin!==location.origin)return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{
 const f=fetch(r).then(res=>{if(res&&res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res})
  .catch(()=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined)||new Response('',{status:504,statusText:'offline'}));
 return m||f}))});

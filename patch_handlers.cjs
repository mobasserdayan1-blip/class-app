const fs = require('fs');
let dj = fs.readFileSync('assets/js/features/daily-journal.js', 'utf8');

// In act(a) events, add handlers for:
// - mxpdf
// - mxtogglesum
// - printdash
// Also update teacherreport modal buttons to have direct PDF download and print

// Check if mxpdf is in act(a)
if (!dj.includes("c==='mxpdf'")) {
  dj = dj.replace(
    "else if(c==='mxprint'){printMatrix();return}",
    `else if(c==='mxprint'){printTeacherJournalReport(false);return}
 else if(c==='mxpdf'){printTeacherJournalReport(true);return}
 else if(c==='mxtogglesum'){st.mxHideSum = !st.mxHideSum; render(); return}
 else if(c==='printdash'){printDashboardReport(); return}`
  );
  console.log('Added mxpdf, mxtogglesum, and printdash action handlers');
}

// Check teacherReportModalHtml buttons
const oldModBtns = `<button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:14px;padding:10px 20px;border-radius:12px;border:0;cursor:pointer" data-dj="doreport">🖨️ چاپ و ذخیره PDF</button>`;
const newModBtns = `<button type="button" class="dj-sm on" style="background:#059669;color:#fff;font-size:13px;padding:9px 15px;border-radius:10px;border:0;cursor:pointer;font-weight:800" data-dj="doreportpdf">📄 دریافت مستقیم فایل PDF</button>
    <button type="button" class="big on" style="background:#1d4ed8;color:#fff;font-size:13px;padding:9px 16px;border-radius:10px;border:0;cursor:pointer;font-weight:800" data-dj="doreport">🖨️ چاپ مستقیم صفحات</button>`;

if (dj.includes(oldModBtns)) {
  dj = dj.replace(oldModBtns, newModBtns);
  console.log('Updated teacher report modal with both Print and Direct PDF buttons');
}

// In act(a) for doreport:
if (!dj.includes("c==='doreportpdf'")) {
  dj = dj.replace(
    "else if(c==='doreport'){printTeacherJournalReport();st.repModal=null;render();return}",
    `else if(c==='doreport'){printTeacherJournalReport(false);st.repModal=null;render();return}
 else if(c==='doreportpdf'){printTeacherJournalReport(true);st.repModal=null;render();return}`
  );
  console.log('Handled doreport and doreportpdf in act()');
}

fs.writeFileSync('assets/js/features/daily-journal.js', dj, 'utf8');

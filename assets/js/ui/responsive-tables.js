/* جدول‌های واکنش‌گرا */
(function(){
function fix(t){if(t.dataset.rt||t.closest('.rpA4,.kc,[id^=pdf],[data-noresp]'))return;
 var hr=t.tHead?t.tHead.rows:[],rows=t.rows;if(!rows.length)return;
 var h=hr.length===1?hr[0]:(!t.tHead&&rows[0].querySelectorAll('th').length===rows[0].cells.length?rows[0]:null);
 var n=rows[0].cells.length,simple=h&&!t.querySelector('[rowspan]')&&!t.querySelector('thead [colspan]');
 t.dataset.rt=1;
 if(simple&&n<=6){var L=[].map.call(h.cells,function(c){return c.textContent.trim()});
  t.classList.add('rt-stack');
  [].forEach.call(t.querySelectorAll('tr'),function(r){if(r===h)return;[].forEach.call(r.cells,function(c,i){c.setAttribute('data-label',L[i]||'')})})}
 else t.classList.add('rt-fit')}
var q=0;function run(){q=0;document.querySelectorAll('table:not([data-rt])').forEach(fix)}
new MutationObserver(function(){if(!q)q=setTimeout(run,60)}).observe(document.body,{childList:true,subtree:true});
run()})();

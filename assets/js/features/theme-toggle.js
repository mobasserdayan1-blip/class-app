/* کلید تم: خودکار / روز / شب (آیکن‌دار) — از data-theme پشتیبانی‌شده در CSS استفاده می‌کند */
(function(){try{
const IC={auto:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',dark:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'};
const TL={auto:'تم خودکار (طبق دستگاه)',light:'تم روز',dark:'تم شب'};
let m='auto';try{m=localStorage.getItem('thm')||'auto'}catch(e){}if(!IC[m])m='auto';
const hd=document.querySelector('header'),box=document.createElement('div');box.className='tg';box.id='thg';box.setAttribute('role','group');box.setAttribute('aria-label','تم برنامه');
const meta=document.querySelector('meta[name="theme-color"]');
function apply(){const r=document.documentElement;m==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',m);
 box.innerHTML=Object.keys(IC).map(k=>'<button type="button" class="'+(k===m?'on':'')+'" data-th="'+k+'" title="'+TL[k]+'" aria-label="'+TL[k]+'" aria-pressed="'+(k===m)+'"><svg viewBox="0 0 24 24">'+IC[k]+'</svg></button>').join('')}
box.addEventListener('click',e=>{const b=e.target.closest('[data-th]');if(!b)return;m=b.dataset.th;try{localStorage.setItem('thm',m)}catch(x){}apply()});
if(hd){const t=document.getElementById('ptl');t&&t.nextSibling?hd.insertBefore(box,t.nextSibling):hd.appendChild(box)}
apply();
}catch(e){console.error('theme-toggle',e)}})();

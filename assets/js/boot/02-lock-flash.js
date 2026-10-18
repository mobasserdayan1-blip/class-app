/* اگر برنامه قفل دارد، همان ابتدا کلاس locked را می‌گذارد تا محتوا لحظه‌ای دیده نشود */
try{const sk=+sessionStorage.getItem('cl_skip')||0;sessionStorage.removeItem('cl_skip');if(localStorage.getItem('cl_pin')&&!(sk&&Date.now()-sk<20000))document.documentElement.classList.add('locked')}catch(e){}

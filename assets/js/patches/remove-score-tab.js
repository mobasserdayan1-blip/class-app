/* حذف تب امتیاز از منو */
(function(){try{const b=document.querySelector('#nav [data-p="sc"]');if(b)b.remove();if(typeof pages!=='undefined'){const i=pages.findIndex(p=>p[0]==='sc');if(i>=0)pages.splice(i,1)}
const o=window.show;window.show=function(id){return o.call(this,id==='sc'?'mot':id)};const sc=document.getElementById('sc');if(sc)sc.remove()}catch(e){console.error(e)}})();

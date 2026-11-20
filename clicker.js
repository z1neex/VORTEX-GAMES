// Игра «Кликер». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('clicker', {title:'Кликер',cat:'Кликеры',emoji:'🍪',desc:'Тапай печеньку и покупай помощников',start(el){
  let n=0,cursors=0,grandma=0;const cur={cost:15,per:1},gma={cost:100,per:8};
  const info=msg(el,'');
  const wrap=document.createElement('div');wrap.className='cookie-wrap';el.appendChild(wrap);
  const ck=document.createElement('button');ck.className='cookie';ck.textContent='🍪';wrap.appendChild(ck);
  const tap=e=>{
    n++;ck.classList.remove('hit');void ck.offsetWidth;ck.classList.add('hit');
    const r=wrap.getBoundingClientRect();const f=document.createElement('span');f.className='plus';f.textContent='+1';
    f.style.left=((e.clientX||r.left+r.width/2)-r.left)+'px';f.style.top=((e.clientY||r.top+r.height/2)-r.top)+'px';
    wrap.appendChild(f);setTimeout(()=>f.remove(),700);draw();
  };
  ck.onpointerdown=tap;
  const row1=row(el);
  const bc=btn(row1,'',()=>{if(n>=cur.cost){n-=cur.cost;cursors++;cur.cost=Math.ceil(cur.cost*1.4);draw()}});
  const bg=btn(row1,'',()=>{if(n>=gma.cost){n-=gma.cost;grandma++;gma.cost=Math.ceil(gma.cost*1.5);draw()}});
  const draw=()=>{
    const perSec=cursors*cur.per+grandma*gma.per;
    info.textContent=`Печенек: ${n} · В секунду: ${perSec}`;
    bc.textContent=`👆 Курсор (${cur.cost}) x${cursors}`;bc.disabled=n<cur.cost;
    bg.textContent=`👵 Бабушка (${gma.cost}) x${grandma}`;bg.disabled=n<gma.cost;
  };
  const t=setInterval(()=>{n+=cursors*cur.per+grandma*gma.per;draw()},1000);
  draw();
  return()=>clearInterval(t);
}});

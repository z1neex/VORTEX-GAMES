// Игра «Память». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('memory', {title:'Память',cat:'Головоломки',emoji:'🧠',desc:'Найди все пары',start(el){
  const E=['🔥','⚡','💎','🎯','🚀','👾','🌙','🧪'];
  let cards,open=[],found=0,moves=0,lock=false;
  const info=msg(el,'');
  const g=document.createElement('div');g.className='mem';el.appendChild(g);
  const render=()=>{
    g.innerHTML='';
    cards.forEach((c,i)=>{const b=document.createElement('button');
      const show=c.up||c.done;
      b.className='mcard'+(show?' up':'')+(c.done?' done':'');
      b.textContent=show?c.v:'?';b.onclick=()=>flip(i);g.appendChild(b)});
    info.textContent=`Ходы: ${moves} · Пары: ${found}/8`+(found===8?' · Готово!':'');
  };
  const flip=i=>{
    if(lock||cards[i].up||cards[i].done)return;
    cards[i].up=true;open.push(i);render();
    if(open.length===2){
      moves++;lock=true;const[a,b]=open;
      if(cards[a].v===cards[b].v){cards[a].done=cards[b].done=true;found++;open=[];lock=false;render()}
      else setTimeout(()=>{cards[a].up=cards[b].up=false;open=[];lock=false;render()},800);
    }
  };
  const init=()=>{cards=[...E,...E].sort(()=>Math.random()-.5).map(v=>({v,up:false,done:false}));open=[];found=0;moves=0;lock=false;render()};
  init();
  btn(el,'Заново',init);
  return()=>{};
}});

// Игра «Реакция». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('reaction', {title:'Реакция',cat:'Аркады',emoji:'⚡',desc:'Жми на зелёный как можно быстрее',start(el){
  const pad=document.createElement('div');pad.className='pad2';el.appendChild(pad);
  const res=msg(el,'Пять раундов. Жди зелёного');
  let times=[],st=0,to=null,round=0,phase='idle',alive=true;
  const next=()=>{
    if(!alive)return;
    if(round>=5){const avg=Math.round(times.reduce((a,b)=>a+b,0)/times.length);
      res.textContent=`Среднее: ${avg} мс · Лучшее: ${Math.min(...times)} мс`;pad.textContent='Сыграть ещё';pad.className='pad2';phase='end';return}
    phase='idle';pad.className='pad2 wait';pad.textContent='Жди зелёного...';
    to=setTimeout(()=>{if(!alive)return;phase='go';pad.className='pad2 go';pad.textContent='ЖМИ!';st=performance.now()},1000+rnd(3000));
  };
  pad.onpointerdown=()=>{
    if(phase==='end'){times=[];round=0;next();return}
    if(phase==='idle'){clearTimeout(to);res.textContent='Рано! Жди зелёного';next();return}
    if(phase==='go'){const t=Math.round(performance.now()-st);times.push(t);round++;phase='result';res.textContent=`${t} мс`;setTimeout(next,800)}
  };
  next();
  return()=>{alive=false;clearTimeout(to)};
}});

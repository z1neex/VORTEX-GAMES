// Игра «Саймон». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('simon', {title:'Саймон',cat:'Головоломки',emoji:'🎵',desc:'Запомни и повтори последовательность',start(el){
  const colors=['#22c55e','#ef4444','#3b82f6','#eab308'];
  const grid=document.createElement('div');grid.className='simon';el.appendChild(grid);
  const pads=colors.map((c,i)=>{const b=document.createElement('button');b.className='spad';b.style.background=c;b.style.color=c;b.onpointerdown=()=>press(i);grid.appendChild(b);return b});
  const info=msg(el,'Нажми «Старт»');
  let seq=[],inp=[],busy=true,timers=[];
  const at=(f,ms)=>timers.push(setTimeout(f,ms));
  const flash=i=>{pads[i].classList.add('lit');at(()=>pads[i].classList.remove('lit'),350)};
  const play=()=>{
    busy=true;info.textContent=`Уровень ${seq.length}`;
    seq.forEach((v,k)=>at(()=>flash(v),600+k*550));
    at(()=>{busy=false;inp=[];info.textContent='Твой ход'},600+seq.length*550);
  };
  const press=i=>{
    if(busy||!seq.length)return;
    flash(i);inp.push(i);const k=inp.length-1;
    if(inp[k]!==seq[k]){busy=true;info.textContent=`Ошибка на уровне ${seq.length}. Нажми «Старт»`;seq=[];return}
    if(inp.length===seq.length){busy=true;info.textContent='Верно!';at(()=>{seq.push(rnd(4));play()},800)}
  };
  btn(el,'Старт',()=>{timers.forEach(clearTimeout);timers=[];seq=[rnd(4)];play()});
  return()=>timers.forEach(clearTimeout);
}});

// Игра «Крестики-нолики». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('ttt', {title:'Крестики-нолики',cat:'Настольные',emoji:'❌',desc:'Играй против ИИ',start(el){
  let b=Array(9).fill(''),over=false;
  const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=(p,bd)=>W.some(l=>l.every(i=>bd[i]===p));
  const minimax=(bd,turn)=>{
    if(win('O',bd))return{s:10};if(win('X',bd))return{s:-10};if(bd.every(Boolean))return{s:0};
    let best=turn==='O'?{s:-Infinity}:{s:Infinity};
    bd.forEach((v,i)=>{if(v)return;bd[i]=turn;const r=minimax(bd,turn==='O'?'X':'O');bd[i]='';
      if(turn==='O'?r.s>best.s:r.s<best.s)best={s:r.s,i}});
    return best;
  };
  const info=msg(el,'Ты — X. Твой ход.');
  const grid=document.createElement('div');grid.className='ttt';el.appendChild(grid);
  const cells=b.map((_,i)=>{const x=document.createElement('button');x.className='cell';x.onclick=()=>move(i);grid.appendChild(x);return x});
  const render=()=>cells.forEach((c,i)=>{c.textContent=b[i];c.className='cell '+(b[i]==='X'?'x':b[i]==='O'?'o':'')});
  const end=()=>{
    render();
    if(win('X',b)){over=true;info.textContent='Ты победил!';return true}
    if(win('O',b)){over=true;info.textContent='Победил ИИ';return true}
    if(b.every(Boolean)){over=true;info.textContent='Ничья';return true}
    return false;
  };
  const move=i=>{
    if(over||b[i])return;
    b[i]='X';if(end())return;
    const m=minimax(b.slice(),'O');b[m.i]='O';end();
  };
  btn(el,'Новая игра',()=>{b=Array(9).fill('');over=false;info.textContent='Ты — X. Твой ход.';render()});
  render();
  return()=>{};
}});

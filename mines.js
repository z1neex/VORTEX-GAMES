// Игра «Сапёр». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('mines', {title:'Сапёр',cat:'Головоломки',emoji:'💣',desc:'Открывай клетки и не подорвись',start(el){
  const N=8,M=10;let grid,open,flag,over,first,flagMode=false;
  const info=msg(el,'');
  const board=document.createElement('div');board.className='mboard';board.style.gridTemplateColumns=`repeat(${N},1fr)`;el.appendChild(board);
  const place=safe=>{
    let k=0;while(k<M){const i=rnd(N*N);if(i===safe||grid[i].m)continue;grid[i].m=true;k++}
    for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N;let n=0;
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<N&&cc<N&&grid[rr*N+cc].m)n++}
      grid[i].n=n}
  };
  const reveal=i=>{
    if(open[i]||flag[i])return;open[i]=true;
    if(grid[i].n===0&&!grid[i].m){const r=Math.floor(i/N),c=i%N;
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<N&&cc<N)reveal(rr*N+cc)}}
  };
  const check=()=>{if(grid.every((c,i)=>c.m||open[i])){over=true;info.textContent='Победа!'}};
  const render=()=>{
    board.innerHTML='';
    for(let i=0;i<N*N;i++){
      const b=document.createElement('button');b.className='mcell';
      if(open[i]){b.classList.add('open');if(grid[i].m)b.textContent='💣';else if(grid[i].n)b.textContent=grid[i].n}
      else if(flag[i])b.textContent='🚩';
      b.onclick=()=>click(i);
      b.oncontextmenu=e=>{e.preventDefault();if(over||open[i])return;flag[i]=!flag[i];render()};
      board.appendChild(b);
    }
    if(!over)info.textContent=`Мин: ${M} · Флаг: ${flagMode?'вкл':'выкл'}`;
  };
  const click=i=>{
    if(over)return;
    if(flagMode){if(!open[i]){flag[i]=!flag[i];render()}return}
    if(first){place(i);first=false}
    if(flag[i]||open[i])return;
    if(grid[i].m){over=true;grid.forEach((c,k)=>{if(c.m)open[k]=true});info.textContent='Бум! Игра окончена';render();return}
    reveal(i);check();render();
  };
  const init=()=>{grid=Array(N*N).fill(0).map(()=>({m:false,n:0}));open=Array(N*N).fill(false);flag=Array(N*N).fill(false);over=false;first=true;render()};
  const fb=row(el);
  const flagBtn=btn(fb,'🚩 Флаг: выкл',()=>{flagMode=!flagMode;flagBtn.textContent=`🚩 Флаг: ${flagMode?'вкл':'выкл'}`;render()});
  btn(fb,'Заново',init);
  init();
  return()=>{};
}});

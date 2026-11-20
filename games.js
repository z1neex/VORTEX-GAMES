// Каталог игр. Чтобы добавить игру: скопируй блок и вставь внутрь GAMES.
// start(el) рисует игру внутри el и возвращает функцию остановки (или ничего).
const rnd=n=>Math.floor(Math.random()*n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function cv(el,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;c.className='cv';el.appendChild(c);return c}
function btn(parent,text,fn,cls=''){const b=document.createElement('button');b.className='gbtn '+cls;b.textContent=text;b.onclick=fn;parent.appendChild(b);return b}
function msg(el,text){const m=document.createElement('div');m.className='gmsg';m.textContent=text;el.appendChild(m);return m}
function row(el){const r=document.createElement('div');r.className='row';el.appendChild(r);return r}
// Управление. allowed задаёт только нужные стрелки: остальные не показываются и не перехватываются.
// cb(kind, pressed): kind = up|down|left|right
function controls(el,cb,allowed=['up','down','left','right']){
  const map={ArrowUp:'up',w:'up',W:'up',' ':'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  const lab={up:'▲',left:'◀',right:'▶',down:'▼'};
  const ok=k=>allowed.includes(k);
  const kd=e=>{const k=map[e.key];if(k&&ok(k)){e.preventDefault();cb(k,true)}};
  const ku=e=>{const k=map[e.key];if(k&&ok(k))cb(k,false)};
  addEventListener('keydown',kd);addEventListener('keyup',ku);
  const p=document.createElement('div');p.className='pad';
  allowed.forEach(k=>{const b=document.createElement('button');b.className='pbtn pb-'+k;b.textContent=lab[k];
    b.onpointerdown=e=>{e.preventDefault();cb(k,true)};
    const off=()=>cb(k,false);b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off;p.appendChild(b)});
  el.appendChild(p);
  return()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku)};
}

const GAMES={

clicker:{title:'Кликер',cat:'Кликеры',emoji:'🍪',desc:'Тапай печеньку и покупай помощников',start(el){
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
}},

reaction:{title:'Реакция',cat:'Аркады',emoji:'⚡',desc:'Жми на зелёный как можно быстрее',start(el){
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
}},

snake:{title:'Змейка',cat:'Аркады',emoji:'🐍',desc:'Собирай еду и не врезайся',start(el){
  const N=20,S=20;const c=cv(el,N*S,N*S),g=c.getContext('2d');
  let s,dir,nd,f,score,over,t;
  const spawn=()=>{do{f={x:rnd(N),y:rnd(N)}}while(s.some(p=>p.x===f.x&&p.y===f.y))};
  const reset=()=>{s=[{x:10,y:10},{x:9,y:10}];dir=nd={x:1,y:0};score=0;over=false;spawn()};
  const ctl=controls(el,(k,on)=>{
    if(!on)return;
    if(over){reset();return}
    const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[k];
    if(v[0]===-dir.x&&v[1]===-dir.y)return;
    nd={x:v[0],y:v[1]};
  });
  const draw=()=>{
    g.fillStyle='#0b0618';g.fillRect(0,0,N*S,N*S);
    g.fillStyle='#ff4d8d';g.beginPath();g.arc(f.x*S+S/2,f.y*S+S/2,S/3,0,7);g.fill();
    s.forEach((p,i)=>{g.fillStyle=i?'#a855f7':'#22d3ee';g.fillRect(p.x*S+2,p.y*S+2,S-4,S-4)});
    g.fillStyle='#fff';g.font='14px sans-serif';g.fillText('Очки: '+score,8,18);
    if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,N*S,N*S);g.fillStyle='#fff';
      g.font='bold 18px sans-serif';g.textAlign='center';g.fillText('Конец игры. Нажми стрелку',N*S/2,N*S/2);g.textAlign='left'}
  };
  const tick=()=>{
    if(over)return;
    dir=nd;const h={x:s[0].x+dir.x,y:s[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||s.some(p=>p.x===h.x&&p.y===h.y)){over=true}
    else{s.unshift(h);if(h.x===f.x&&h.y===f.y){score++;spawn()}else s.pop()}
    draw();
  };
  reset();draw();t=setInterval(tick,120);
  return()=>{clearInterval(t);ctl()};
}},

pong:{title:'Пинг-понг',cat:'Спорт',emoji:'🏓',desc:'Отбивай мяч. Соперник думает',start(el){
  const W=400,H=300,PH=60;const c=cv(el,W,H),g=c.getContext('2d');c.style.touchAction='none';
  let py=H/2-PH/2,ay=H/2-PH/2,pS=0,aS=0,hold={up:false,down:false},err=0,spd=4;
  let b={x:W/2,y:H/2,vx:4,vy:3};
  const serve=d=>{spd=4;b={x:W/2,y:H/2,vx:d*spd,vy:Math.random()<.5?-3:3};err=(Math.random()-.5)*30};
  // Предсказание: куда прилетит мяч с учётом отскоков от стен
  const predict=()=>{let x=b.x,y=b.y,vx=b.vx,vy=b.vy;
    for(let i=0;i<800&&x<W-16;i++){x+=vx;y+=vy;if(y<6){y=12-y;vy=-vy}if(y>H-6){y=2*(H-6)-y;vy=-vy}}
    return y};
  const ctl=controls(el,(k,on)=>{if(k==='up')hold.up=on;if(k==='down')hold.down=on},['up','down']);
  c.onpointermove=e=>{const r=c.getBoundingClientRect();py=(e.clientY-r.top)*H/r.height-PH/2};
  const draw=()=>{
    g.fillStyle='#0b0618';g.fillRect(0,0,W,H);
    g.fillStyle='#2d1b55';for(let y=0;y<H;y+=20)g.fillRect(W/2-1,y,2,10);
    g.fillStyle='#22d3ee';g.fillRect(8,py,8,PH);
    g.fillStyle='#a855f7';g.fillRect(W-16,ay,8,PH);
    g.fillStyle='#fff';g.beginPath();g.arc(b.x,b.y,6,0,7);g.fill();
    g.font='bold 28px sans-serif';g.textAlign='center';g.fillText(pS+'  :  '+aS,W/2,34);g.textAlign='left';
  };
  serve(1);
  const t=setInterval(()=>{
    if(hold.up)py-=6;if(hold.down)py+=6;
    py=clamp(py,0,H-PH);
    // ИИ: идёт туда, где мяч будет на его стороне, с небольшой ошибкой и ограниченной скоростью
    const target=b.vx>0?predict()-PH/2+err:H/2-PH/2;
    ay+=clamp((target-ay)*0.25,-4.6,4.6);ay=clamp(ay,0,H-PH);
    b.x+=b.vx;b.y+=b.vy;
    if(b.y<6){b.y=12-b.y;b.vy=-b.vy}
    if(b.y>H-6){b.y=2*(H-6)-b.y;b.vy=-b.vy}
    // удар игрока
    if(b.vx<0&&b.x<16&&b.x>8&&b.y>py-4&&b.y<py+PH+4){
      spd=Math.min(9,spd*1.05);b.vx=spd;b.x=16;b.vy+=((b.y-(py+PH/2))/PH)*3;err=(Math.random()-.5)*30}
    // удар компьютера
    if(b.vx>0&&b.x>W-16&&b.x<W-8&&b.y>ay-4&&b.y<ay+PH+4){
      spd=Math.min(9,spd*1.05);b.vx=-spd;b.x=W-16;b.vy+=((b.y-(ay+PH/2))/PH)*3}
    if(b.x<0){aS++;serve(1)}
    if(b.x>W){pS++;serve(-1)}
    draw();
  },16);
  draw();
  return()=>{clearInterval(t);ctl();c.onpointermove=null};
}},

breakout:{title:'Арканоид',cat:'Аркады',emoji:'🧱',desc:'Разбей все кирпичи платформой',start(el){
  const W=400,H=300,PW=70,bw=46,bh=16,gap=4,rows=5,cols=8;
  const c=cv(el,W,H),g=c.getContext('2d');c.style.touchAction='none';
  let bricks,px,ball,lives,score,state='wait';
  const hold={l:false,r:false};
  const reset=()=>{bricks=[];for(let r=0;r<rows;r++)for(let k=0;k<cols;k++)bricks.push({x:k*(bw+gap)+12,y:r*(bh+gap)+40,a:true,hue:r*50});
    px=W/2-PW/2;ball={x:W/2,y:H-60,vx:3,vy:-3};lives=3;score=0;state='play'};
  reset();state='wait';
  const ctl=controls(el,(k,on)=>{
    if(k==='left')hold.l=on;if(k==='right')hold.r=on;
    if(on&&(k==='left'||k==='right')){if(state==='wait')state='play';else if(state!=='play')reset()}
  },['left','right']);
  c.onpointermove=e=>{const r=c.getBoundingClientRect();px=(e.clientX-r.left)*W/r.width-PW/2;if(state==='wait')state='play'};
  const draw=()=>{
    g.fillStyle='#0b0618';g.fillRect(0,0,W,H);
    bricks.forEach(b=>{if(!b.a)return;g.fillStyle=`hsl(${b.hue},80%,60%)`;g.fillRect(b.x,b.y,bw,bh)});
    g.fillStyle='#22d3ee';g.fillRect(px,H-30,PW,10);
    g.fillStyle='#fff';g.beginPath();g.arc(ball.x,ball.y,6,0,7);g.fill();
    g.font='14px sans-serif';g.fillText(`Очки: ${score}  Жизни: ${lives}`,8,H-8);
    if(state!=='play'){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.textAlign='center';g.font='bold 18px sans-serif';
      const txt=state==='wait'?'Двигай мышью или стрелкой':state==='won'?'Победа! Жми стрелку для новой игры':'Проигрыш. Жми стрелку для новой игры';
      g.fillText(txt,W/2,H/2);g.textAlign='left'}
  };
  const t=setInterval(()=>{
    if(state!=='play'){draw();return}
    if(hold.l)px-=6;if(hold.r)px+=6;px=clamp(px,0,W-PW);
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.x<5||ball.x>W-5)ball.vx*=-1;
    if(ball.y<5)ball.vy*=-1;
    if(ball.vy>0&&ball.y>H-38&&ball.y<H-24&&ball.x>px&&ball.x<px+PW){
      ball.vy*=-1;ball.vx=clamp((ball.x-(px+PW/2))/8,-6,6)}
    for(const b of bricks){
      if(b.a&&ball.x>b.x&&ball.x<b.x+bw&&ball.y>b.y&&ball.y<b.y+bh){b.a=false;ball.vy*=-1;score+=10;break}
    }
    if(ball.y>H){lives--;if(lives<=0)state='lost';else ball={x:px+PW/2,y:H-60,vx:3,vy:-3}}
    if(bricks.every(b=>!b.a))state='won';
    draw();
  },16);
  draw();
  return()=>{clearInterval(t);ctl();c.onpointermove=null};
}},

ttt:{title:'Крестики-нолики',cat:'Настольные',emoji:'❌',desc:'Играй против ИИ',start(el){
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
}},

mines:{title:'Сапёр',cat:'Головоломки',emoji:'💣',desc:'Открывай клетки и не подорвись',start(el){
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
}},

simon:{title:'Саймон',cat:'Головоломки',emoji:'🎵',desc:'Запомни и повтори последовательность',start(el){
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
}},

memory:{title:'Память',cat:'Головоломки',emoji:'🧠',desc:'Найди все пары',start(el){
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
}},

runner:{title:'Бегун 3D',cat:'Аркады',emoji:'🏃',desc:'Прыгай через препятствия (▲ или пробел)',start(el){
  const W=480,H=260,HY=110,GY=240,ZMAX=1400,PWd=30,PHd=40;
  const c=cv(el,W,H),g=c.getContext('2d');
  const scale=z=>1/(1+z/160);           // дальше = меньше
  const fy=z=>HY+(GY-HY)*scale(z);      // экранная Y пола на глубине z
  let obs,fr,vy,jy,over,jumpReq,speed,nextSpawn;
  const reset=()=>{obs=[];fr=0;jy=0;vy=0;over=false;jumpReq=false;speed=7;nextSpawn=60};
  reset();
  const ctl=controls(el,(k,on)=>{
    if(k!=='up')return;
    if(over){if(on)reset();return}
    if(on)jumpReq=true;
  },['up']);
  const spawn=()=>{
    const n=Math.random()<0.45?2:1;          // иногда пара препятствий подряд
    for(let i=0;i<n;i++)obs.push({z:ZMAX+i*80,w:26+rnd(20),h:34+rnd(28)});
  };
  const draw=()=>{
    // небо и горизонт
    const sky=g.createLinearGradient(0,0,0,HY);sky.addColorStop(0,'#07040f');sky.addColorStop(1,'#3b1a6e');
    g.fillStyle=sky;g.fillRect(0,0,W,HY);
    g.fillStyle='rgba(236,72,153,.55)';g.beginPath();g.arc(W/2,HY-10,46,Math.PI,0);g.fill();
    // пол
    const gr=g.createLinearGradient(0,HY,0,H);gr.addColorStop(0,'#1a0d33');gr.addColorStop(1,'#0b0618');
    g.fillStyle=gr;g.fillRect(0,HY,W,H-HY);
    // полосы движения (перспектива)
    const off=(fr*speed)%60;
    for(let z=-off;z<ZMAX;z+=60){const zz=Math.max(0,z);const y=fy(zz);
      g.strokeStyle=`rgba(168,85,247,${0.15+0.45*scale(zz)})`;g.lineWidth=1+2*scale(zz);
      g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
    // боковые линии дороги
    g.strokeStyle='rgba(34,211,238,.25)';g.lineWidth=1;
    for(let k=-6;k<=6;k++){g.beginPath();g.moveTo(W/2,HY);g.lineTo(W/2+k*90,H);g.stroke()}
    // препятствия: дальние первыми
    [...obs].sort((a,b)=>b.z-a.z).forEach(o=>{
      const s=scale(o.z),base=fy(o.z),w=o.w*s,h=o.h*s,x0=W/2-w/2,top=base-h,d=6*s;
      g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(W/2,base,w*0.6,4*s,0,0,7);g.fill();
      g.fillStyle='#a855f7';g.fillRect(x0,top,w,h);                       // лицевая грань
      g.fillStyle='#d8b4fe';g.beginPath();g.moveTo(x0,top);g.lineTo(x0+w,top);g.lineTo(x0+w+d,top-d);g.lineTo(x0+d,top-d);g.closePath();g.fill(); // верх
      g.fillStyle='#6b21a8';g.beginPath();g.moveTo(x0+w,top);g.lineTo(x0+w+d,top-d);g.lineTo(x0+w+d,base-d);g.lineTo(x0+w,base);g.closePath();g.fill(); // бок
    });
    // игрок
    const px=W/2,by=GY-jy,top=by-PHd;
    g.fillStyle=`rgba(0,0,0,${Math.max(0.15,0.5-jy/200)})`;g.beginPath();g.ellipse(px,GY,PWd*(1-jy/250)*0.7,4,0,0,7);g.fill();
    g.fillStyle='#22d3ee';g.fillRect(px-PWd/2,top,PWd,PHd);
    g.fillStyle='#a5f3fc';g.fillRect(px-PWd/2,top,PWd,6);
    g.fillStyle='#0e7490';g.fillRect(px+PWd/2-6,top+6,6,PHd-6);
    // HUD
    g.fillStyle='#fff';g.font='14px sans-serif';g.fillText('Очки: '+Math.floor(fr/6),8,18);
    if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.textAlign='center';g.font='bold 18px sans-serif';
      g.fillText('Конец. Нажми ▲ для новой игры',W/2,H/2);g.textAlign='left'}
  };
  const t=setInterval(()=>{
    if(over){draw();return}
    fr++;speed=Math.min(14,7+fr/900);
    if(jumpReq&&jy===0){vy=10}
    jumpReq=false;
    jy+=vy;vy-=0.55;if(jy<0){jy=0;vy=0}
    nextSpawn-=speed;if(nextSpawn<=0){spawn();nextSpawn=110+rnd(150)}
    obs.forEach(o=>o.z-=speed);
    obs=obs.filter(o=>o.z>-30);
    // столкновение: препятствие проходит через зону игрока
    if(obs.some(o=>o.z>-12&&o.z<22&&jy<o.h-4))over=true;
    draw();
  },16);
  draw();
  return()=>{clearInterval(t);ctl()};
}},

stock:{title:'Фондовый рынок',cat:'Экономика',emoji:'📈',desc:'5 минут, 100 V. Покупай дешевле, продавай дороже',start(el){
  const DUR=300,W=480,H=200;const c=cv(el,W,H),g=c.getContext('2d');
  let cash=100,sh=0,price=100,hist=[100],t=0,left=DUR,run=false,timer=null;
  let best=0;try{best=+(localStorage.getItem('vx_stock_best')||0)}catch(e){}
  const info=msg(el,'');
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const FEE=0.03;
  const value=()=>Math.round(cash+sh*price*(1-FEE));
  const draw=()=>{
    g.fillStyle='#0b0618';g.fillRect(0,0,W,H);
    const lo=Math.min(...hist,price)*0.95,hi=Math.max(...hist,price)*1.05;
    const y=v=>H-10-(v-lo)/(hi-lo||1)*(H-20);
    g.strokeStyle='#2d1b55';g.beginPath();g.moveTo(0,y(100));g.lineTo(W,y(100));g.stroke();
    g.strokeStyle=price>=100?'#22c55e':'#ef4444';g.lineWidth=2;g.beginPath();
    hist.forEach((v,i)=>{const x=i*(W/Math.max(1,hist.length-1));i?g.lineTo(x,y(v)):g.moveTo(x,y(v))});g.stroke();g.lineWidth=1;
    g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText(`Цена: ${price.toFixed(1)} V`,8,18);
  };
  const refresh=()=>{
    info.textContent=`Баланс: ${Math.floor(cash)} V · Акций: ${sh} · Осталось: ${fmt(left)} · Итог: ${value()} V · Рекорд: ${best} V`;
    draw();
  };
  const tick=()=>{
    t+=0.25;
    const trend=100*(1+0.38*Math.sin(t*2*Math.PI/60));  // рынок качается циклами примерно по 60 сек
    const noise=(Math.random()-0.5)*0.05*price;          // случайные колебания
    const bots=(Math.random()<0.5?1:-1)*Math.random()*0.02*price; // боты покупают и продают
    price=Math.max(5,price+(trend-price)*0.12+noise+bots);
    hist.push(price);if(hist.length>240)hist.shift();
    left=Math.max(0,DUR-t);
    if(left<=0)finish();
    refresh();
  };
  const finish=()=>{
    run=false;clearInterval(timer);timer=null;
    cash+=sh*price*(1-FEE);sh=0;
    const v=Math.round(cash);
    if(v>best){best=v;try{localStorage.setItem('vx_stock_best',String(best))}catch(e){}}
    info.textContent=`Время вышло! Итог: ${v} V · Рекорд: ${best} V`;
    draw();
  };
  const buy=n=>{if(!run)return;const q=Math.min(n,Math.floor(cash/(price*(1+FEE))));if(q<=0)return;cash-=q*price*(1+FEE);sh+=q;refresh()};
  const sell=n=>{if(!run)return;const q=Math.min(n,sh);if(q<=0)return;cash+=q*price*(1-FEE);sh-=q;refresh()};
  const start=()=>{
    cash=100;sh=0;price=100;hist=[100];t=0;left=DUR;run=true;
    clearInterval(timer);timer=setInterval(tick,250);refresh();
  };
  const b1=row(el);
  btn(b1,'Старт (5 минут)',start,'big2');
  const b2=row(el);
  btn(b2,'Купить 1',()=>buy(1));
  btn(b2,'Купить на всё',()=>buy(Infinity));
  btn(b2,'Продать 1',()=>sell(1));
  btn(b2,'Продать всё',()=>sell(Infinity));
  info.textContent='Нажми «Старт». У тебя 100 V на 5 минут. Комиссия брокера 3% за сделку.';
  draw();
  return()=>clearInterval(timer);
}}

};

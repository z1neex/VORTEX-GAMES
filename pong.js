// Игра «Пинг-понг». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('pong', {title:'Пинг-понг',cat:'Спорт',emoji:'🏓',desc:'Отбивай мяч. Соперник думает',start(el){
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
}});

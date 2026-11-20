// Игра «Арканоид». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('breakout', {title:'Арканоид',cat:'Аркады',emoji:'🧱',desc:'Разбей все кирпичи платформой',start(el){
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
}});

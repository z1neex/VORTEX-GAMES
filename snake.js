// Игра «Змейка». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('snake', {title:'Змейка',cat:'Аркады',emoji:'🐍',desc:'Собирай еду и не врезайся',start(el){
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
}});

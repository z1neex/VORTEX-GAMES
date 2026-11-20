// Трасса: едешь по дороге, объезжаешь машины и столбы стрелками ◀ ▶.
registerGame('highway', {
  title:'Трасса', cat:'Аркады', emoji:'🏎️', desc:'Объезжай машины и столбы на трассе',
  start(el){
    const W=300,H=480,LW=W/3,PY=H-90,CELL=40;
    const c=cv(el,W,H),g=c.getContext('2d');
    const laneX=i=>LW*i+LW/2;
    let lane,rows,dist,speed,over,nextRow,stripe,lastMove;
    const reset=()=>{lane=1;rows=[];dist=0;speed=5;over=false;nextRow=0;stripe=0;lastMove=0};
    reset();
    const ctl=controls(el,(k,on)=>{
      if(!on)return;
      if(over){reset();return}
      const now=performance.now();
      if(now-lastMove<120)return;            // защита от залипания клавиши
      if(k==='left'&&lane>0){lane--;lastMove=now}
      if(k==='right'&&lane<2){lane++;lastMove=now}
    },['left','right']);
    const drawCar=(x,y,color,wind)=>{
      g.fillStyle=color;g.beginPath();g.roundRect?g.roundRect(x-CELL*0.35,y-CELL/2,CELL*0.7,CELL,6):g.rect(x-CELL*0.35,y-CELL/2,CELL*0.7,CELL);g.fill();
      g.fillStyle=wind;g.fillRect(x-CELL*0.25,y-CELL*0.3,CELL*0.5,CELL*0.22);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-CELL*0.3,y+CELL*0.3,CELL*0.6,4);
    };
    const drawPole=(x,y)=>{
      g.fillStyle='#64748b';g.fillRect(x-5,y-CELL/2,10,CELL);
      g.fillStyle='#ef4444';g.fillRect(x-5,y-CELL/2,10,8);
      g.fillStyle='#fde047';g.fillRect(x-5,y-2,10,4);
    };
    const draw=()=>{
      g.fillStyle='#14532d';g.fillRect(0,0,W,H);
      g.fillStyle='#262631';g.fillRect(0,0,W,H);
      // обочины
      g.fillStyle='#e5e7eb';g.fillRect(4,0,4,H);g.fillRect(W-8,0,4,H);
      // пунктир между полосами
      g.fillStyle='#facc15';
      for(let y=-60+stripe;y<H;y+=60){g.fillRect(LW-2,y,4,34);g.fillRect(2*LW-2,y,4,34)}
      rows.forEach(r=>r.cells.forEach(cell=>{
        const x=laneX(cell.lane);
        if(cell.kind==='pole')drawPole(x,r.y);else drawCar(x,r.y,cell.color,'#bae6fd');
      }));
      drawCar(laneX(lane),PY,'#ef4444','#fecaca');
      g.fillStyle='#fff';g.font='bold 16px sans-serif';g.fillText(Math.floor(dist/10)+' м',10,22);
      if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.textAlign='center';g.font='bold 18px sans-serif';
        g.fillText('Авария! Жми ◀ или ▶ для новой',W/2,H/2);g.textAlign='left'}
    };
    const colors=['#22c55e','#3b82f6','#f97316','#eab308','#e879f9'];
    const t=setInterval(()=>{
      if(over){draw();return}
      dist+=speed;speed=Math.min(13,5+dist/3000);stripe=(stripe+speed)%60;
      nextRow-=speed;
      if(nextRow<=0){
        // в ряду всегда есть свободная полоса
        const blocked=Math.random()<0.5?1:2;
        const lanes=[0,1,2].sort(()=>Math.random()-.5).slice(0,blocked);
        rows.push({y:-CELL,cells:lanes.map(l=>({lane:l,kind:Math.random()<0.3?'pole':'car',color:colors[rnd(colors.length)]}))});
        nextRow=CELL*2.6+rnd(60);
      }
      rows.forEach(r=>r.y+=speed);
      rows=rows.filter(r=>r.y<H+CELL);
      // столкновение: ряд совпадает с полосой игрока в зоне машины
      if(rows.some(r=>Math.abs(r.y-PY)<CELL*0.8&&r.cells.some(cl=>cl.lane===lane)))over=true;
      draw();
    },16);
    draw();
    return()=>{clearInterval(t);ctl()};
  }
});

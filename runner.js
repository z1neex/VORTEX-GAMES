// Игра «Бегун 3D». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('runner', {title:'Бегун 3D',cat:'Аркады',emoji:'🏃',desc:'Прыгай через препятствия (▲ или пробел)',start(el){
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
}});

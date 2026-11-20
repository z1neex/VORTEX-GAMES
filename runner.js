// Бегун 2D. Прыжок стрелкой ▲ или пробелом. Препятствия идут с одинаковыми промежутками.
registerGame('runner', {
  title:'Бегун', cat:'Аркады', emoji:'🏃', desc:'Прыгай через препятствия (▲ или пробел)',
  start(el){
    const W=480,H=200,G=170,PS=34,PX=60,PW=26;
    const c=cv(el,W,H),g=c.getContext('2d');
    let jy,vy,obs,fr,over,jumpReq,speed,nextIn;
    const reset=()=>{jy=0;vy=0;obs=[];fr=0;over=false;jumpReq=false;speed=6;nextIn=120};
    reset();
    const ctl=controls(el,(k,on)=>{
      if(k!=='up')return;
      if(over){if(on)reset();return}
      if(on)jumpReq=true;
    },['up']);
    const draw=()=>{
      const sky=g.createLinearGradient(0,0,0,G);sky.addColorStop(0,'#07040f');sky.addColorStop(1,'#2e1065');
      g.fillStyle=sky;g.fillRect(0,0,W,G);
      g.fillStyle='#120a24';g.fillRect(0,G,W,H-G);
      g.fillStyle='#a855f7';g.fillRect(0,G,W,2);
      // пролетающие полосы земли
      const off=(fr*speed)%40;g.fillStyle='rgba(168,85,247,.25)';
      for(let x=-off;x<W;x+=40)g.fillRect(x,G+8,20,3);
      // препятствия
      obs.forEach(o=>{
        g.fillStyle='#c084fc';g.fillRect(o.x,G-o.h,o.w,o.h);
        g.fillStyle='#f0abfc';g.fillRect(o.x,G-o.h,o.w,5);
      });
      // игрок
      const top=G-PS-jy;
      g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(PX+PW/2,G,PW/2*(1-jy/200),3,0,0,7);g.fill();
      g.fillStyle='#22d3ee';g.fillRect(PX,top,PW,PS);
      g.fillStyle='#a5f3fc';g.fillRect(PX,top,PW,5);
      g.fillStyle='#fff';g.font='14px sans-serif';g.fillText('Очки: '+Math.floor(fr/6),8,18);
      if(over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.textAlign='center';g.font='bold 18px sans-serif';
        g.fillText('Конец. Нажми ▲ для новой игры',W/2,H/2);g.textAlign='left'}
    };
    const t=setInterval(()=>{
      if(over){draw();return}
      fr++;speed=Math.min(12,6+fr/900);
      if(jumpReq&&jy===0)vy=10;
      jumpReq=false;
      jy+=vy;vy-=0.55;if(jy<0){jy=0;vy=0}
      nextIn-=speed;
      if(nextIn<=0){
        const h=24+rnd(24),w=18+rnd(14);
        obs.push({x:W+10,w,h});
        if(Math.random()<0.3)obs.push({x:W+10+w+70,w:18+rnd(10),h:24+rnd(20)}); // иногда пара
        nextIn=200+rnd(120);
      }
      obs.forEach(o=>o.x-=speed);
      obs=obs.filter(o=>o.x>-40);
      // столкновение: игрок ниже верхней точки препятствия и стоит в его полосе
      if(obs.some(o=>PX<o.x+o.w&&PX+PW>o.x&&jy<o.h-4))over=true;
      draw();
    },16);
    draw();
    return()=>{clearInterval(t);ctl()};
  }
});

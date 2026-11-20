// Игра «Фондовый рынок». Файл появится на сайте сам, как только лежит в папке games/.
// Функции rnd, cv, btn, msg, row, controls и registerGame берутся из lib.js.
registerGame('stock', {title:'Фондовый рынок',cat:'Экономика',emoji:'📈',desc:'5 минут, 100 V. Покупай дешевле, продавай дороже',start(el){
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
}});

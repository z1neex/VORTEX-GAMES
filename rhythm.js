// Ритм-дорожки: три дорожки, ноты падают к линии. Жми в такт (клавиши A S D или кнопки внизу).
registerGame('rhythm', {
  title:'Ритм-дорожки', cat:'Музыка', emoji:'🎵', desc:'Жми в такт падающим нотам (A S D)',
  start(el){
    const W=300,H=460,HIT=H-80,LEAD=1500,SONG=60000,BEAT=60000/110;
    const c=cv(el,W,H),g=c.getContext('2d');
    const colors=['#22d3ee','#a855f7','#f472b6'];
    const info=msg(el,'Нажми «Старт», затем жми A S D или кнопки внизу');
    let notes=[],t0=0,running=false,score=0,combo=0,best=0,timer=null;
    let flash=[0,0,0],fx=null,fxT=0;
    const build=()=>{
      notes=[];
      for(let b=2;b*BEAT<SONG;b++){
        const t=b*BEAT,r=Math.random();
        if(r<0.5)notes.push({t,lane:rnd(3),hit:false});
        else if(r<0.72){const a=rnd(3);const bb=(a+1+rnd(2))%3;notes.push({t,lane:a,hit:false},{t,lane:bb,hit:false})}
        if(Math.random()<0.3)notes.push({t:t+BEAT/2,lane:rnd(3),hit:false});
      }
    };
    const now=()=>performance.now()-t0;
    const label=(txt)=>{fx=txt;fxT=now()};
    const judge=lane=>{
      if(!running)return;
      flash[lane]=8;
      const n0=now();let target=null,bd=Infinity;
      for(const n of notes){if(n.hit||n.lane!==lane)continue;const d=Math.abs(n.t-n0);if(d<bd){bd=d;target=n}}
      if(!target||bd>200){combo=0;label('Промах');return}
      target.hit=true;
      const pts=bd<50?300:bd<100?200:100;
      combo++;
      score+=Math.round(pts*(1+Math.min(combo,50)/25));
      label(bd<50?'Идеально!':bd<100?'Отлично':'Хорошо');
    };
    const keys={a:0,A:0,s:1,S:1,d:2,D:2};
    const kd=e=>{if(e.repeat)return;const l=keys[e.key];if(l!==undefined){e.preventDefault();judge(l)}};
    addEventListener('keydown',kd);
    const pads=document.createElement('div');pads.className='row';el.appendChild(pads);
    ['A','S','D'].forEach((lab,i)=>{const b=document.createElement('button');b.className='pad2';
      b.style.cssText='height:90px;width:90px;font-size:22px;padding:0;background:'+colors[i]+';color:#0b0618;border-radius:18px;';
      b.textContent=lab;b.onpointerdown=e=>{e.preventDefault();judge(i)};pads.appendChild(b)});
    const update=()=>{
      const n0=now();
      for(const n of notes){if(!n.hit&&n0>n.t+200){n.hit=true;combo=0;label('Мимо')}}
      if(n0>SONG+1000){finish()}
    };
    const draw=()=>{
      g.fillStyle='#0b0618';g.fillRect(0,0,W,H);
      for(let i=0;i<3;i++){
        const x=i*100;
        g.fillStyle=flash[i]>0?'rgba(255,255,255,.12)':'rgba(255,255,255,.03)';g.fillRect(x,0,100,H);
        g.strokeStyle='#2d1b55';g.strokeRect(x,0,100,H);
      }
      const n0=now();
      notes.forEach(n=>{
        if(n.hit)return;
        const y=HIT-(n.t-n0)*(HIT/LEAD);
        if(y<-20||y>H+20)return;
        g.fillStyle=colors[n.lane];g.fillRect(n.lane*100+10,y-8,80,16);
      });
      g.fillStyle='#fff';g.fillRect(0,HIT,W,3);
      flash=flash.map(v=>Math.max(0,v-1));
      g.font='bold 20px sans-serif';g.fillText(String(score),10,26);
      g.font='14px sans-serif';g.fillText('Комбо: '+combo+'  Рекорд: '+best,10,46);
      if(fx&&n0-fxT<600){g.globalAlpha=1-(n0-fxT)/600;g.fillStyle='#fff';g.textAlign='center';g.font='bold 20px sans-serif';g.fillText(fx,W/2,HIT-40);g.textAlign='left';g.globalAlpha=1}
    };
    const finish=()=>{
      running=false;clearInterval(timer);timer=null;
      best=Math.max(best,score);
      info.textContent=`Песня окончена. Очки: ${score}. Рекорд: ${best}. Нажми «Старт»`;
    };
    const startSong=()=>{
      clearInterval(timer);
      build();score=0;combo=0;running=true;fx=null;t0=performance.now();
      info.textContent='Играем! Жми в такт';
      timer=setInterval(()=>{update();draw()},16);
    };
    const sb=row(el);btn(sb,'Старт',startSong,'big2');
    draw();
    return()=>{clearInterval(timer);removeEventListener('keydown',kd)};
  }
});

// Общие функции для всех игр. Не редактируй без нужды.
// Каждая игра в папке games/ вызывает registerGame(id, описание).
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


const GAMES={};
function registerGame(id,g){GAMES[id]=g}

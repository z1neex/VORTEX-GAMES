// Каталог, загрузка игр и открытие. Игры лежат в папке games/, каждая в своём файле.
const $=s=>document.querySelector(s);
let cleanup=null, cat='Все', query='';

// Запасной список на случай, если список файлов с GitHub не загрузился (например, офлайн).
// Новые игры и так находятся сами через GitHub; этот список используется только как запасной.
const FALLBACK_GAMES=['breakout','clicker','memory','mines','pong','reaction','runner','simon','snake','stock','ttt'];

function repoInfo(){
  const host=location.hostname, parts=location.pathname.split('/').filter(Boolean);
  const owner=host.split('.')[0];
  const repo=parts.length?parts[0]:owner+'.github.io';
  return {owner,repo};
}
async function listGameFiles(){
  const {owner,repo}=repoInfo();
  try{
    const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/games`);
    if(!r.ok)throw new Error('api '+r.status);
    const list=await r.json();
    return list.filter(f=>f.name.endsWith('.js')).map(f=>f.name);
  }catch(e){
    return FALLBACK_GAMES.map(n=>n+'.js');
  }
}
function loadScript(src){
  return new Promise(res=>{const s=document.createElement('script');s.src=src;s.onload=s.onerror=()=>res();document.body.appendChild(s)});
}
async function loadGames(){
  if(window.BUNDLED)return;                  // одиночный HTML: все игры уже внутри
  const files=await listGameFiles();
  await Promise.all(files.map(f=>loadScript('games/'+f)));
}

const CATS=()=>['Все',...new Set(Object.values(GAMES).map(g=>g.cat))];

function renderChips(){
  const box=$('#chips');box.innerHTML='';
  CATS().forEach(c=>{const b=document.createElement('button');b.className='chip'+(c===cat?' on':'');b.textContent=c;
    b.onclick=()=>{cat=c;renderChips();renderGrid()};box.appendChild(b)});
}
function renderGrid(){
  const q=query.trim().toLowerCase();
  const list=Object.entries(GAMES)
    .filter(([,g])=>(cat==='Все'||g.cat===cat)&&(!q||g.title.toLowerCase().includes(q)||g.desc.toLowerCase().includes(q)))
    .sort((a,b)=>a[1].title.localeCompare(b[1].title,'ru'));
  const grid=$('#grid');grid.innerHTML='';
  if(!list.length){grid.innerHTML='<p style="color:var(--mut)">Ничего не найдено</p>';return}
  list.forEach(([id,g])=>{const a=document.createElement('a');a.className='card';a.href='#'+id;
    a.innerHTML=`<div class="emo">${g.emoji}</div><b></b><small></small>`;
    a.querySelector('b').textContent=g.title;a.querySelector('small').textContent=g.desc;
    a.onclick=e=>{e.preventDefault();openGame(id)};
    grid.appendChild(a)});
}
function show(id){
  if(cleanup){try{cleanup()}catch(e){}cleanup=null}
  if(!id||!GAMES[id]){$('#home').hidden=false;$('#play').hidden=true;return}
  const g=GAMES[id];
  $('#home').hidden=true;$('#play').hidden=false;
  $('#ptitle').textContent=g.emoji+' '+g.title;
  const stage=$('#stage');stage.innerHTML='';
  try{
    const c=g.start(stage);cleanup=typeof c==='function'?c:null;
  }catch(e){stage.textContent='Не удалось запустить игру: '+e.message}
}
function openGame(id){try{history.replaceState(null,'','#'+id)}catch(e){}show(id)}
function goHome(){try{history.replaceState(null,'',location.pathname)}catch(e){}show('')}

$('#theme').onchange=e=>{document.body.className='theme-'+e.target.value};
$('#back').onclick=e=>{e.preventDefault();goHome()};
$('#search').oninput=e=>{query=e.target.value;renderGrid()};
$('#fs').onclick=()=>{const el=$('#stage');
  if(document.fullscreenElement)document.exitFullscreen();
  else if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});};
addEventListener('hashchange',()=>show(location.hash.slice(1)));

(async()=>{
  await loadGames();
  renderChips();renderGrid();
  show(location.hash.slice(1));
})();

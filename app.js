// Каталог и открытие игр. Игры описаны в games.js.
// Открытие не зависит от адреса (hash), поэтому работает и в предпросмотре, где переходы по ссылкам заблокированы.
const $=s=>document.querySelector(s);
let cleanup=null, cat='Все', query='';
const CATS=()=>['Все',...new Set(Object.values(GAMES).map(g=>g.cat))];

function renderChips(){
  const box=$('#chips');box.innerHTML='';
  CATS().forEach(c=>{const b=document.createElement('button');b.className='chip'+(c===cat?' on':'');b.textContent=c;
    b.onclick=()=>{cat=c;renderChips();renderGrid()};box.appendChild(b)});
}
function renderGrid(){
  const q=query.trim().toLowerCase();
  const list=Object.entries(GAMES).filter(([,g])=>(cat==='Все'||g.cat===cat)&&(!q||g.title.toLowerCase().includes(q)||g.desc.toLowerCase().includes(q)));
  const grid=$('#grid');grid.innerHTML='';
  if(!list.length){grid.innerHTML='<p style="color:var(--mut)">Ничего не найдено</p>';return}
  list.forEach(([id,g])=>{const a=document.createElement('a');a.className='card';a.href='#'+id;
    a.innerHTML=`<div class="emo">${g.emoji}</div><b></b><small></small>`;
    a.querySelector('b').textContent=g.title;a.querySelector('small').textContent=g.desc;
    a.style.setProperty('--c',g.col||'#7c3aed');a.onclick=e=>{e.preventDefault();openGame(id)};
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
renderChips();renderGrid();
show(location.hash.slice(1));

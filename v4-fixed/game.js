const SAVE_KEY='v4_fixed_save';
let player={hp:150,maxHp:150,mp:60,maxMp:60,rage:0,atk:15,inventory:['potion_small'],equipment:{weapon:null,armor:null,accessory:null},location:'ruin'};
let currentEnemy=null;

function updateUI(){
 document.getElementById('hp-text').innerText=player.hp+'/'+player.maxHp;
 document.getElementById('mp-text').innerText=player.mp+'/'+player.maxMp;
 document.getElementById('rage-text').innerText=player.rage+'/100';
 document.getElementById('hp-bar').style.width=(player.hp/player.maxHp*100)+'%';
 document.getElementById('mp-bar').style.width=(player.mp/player.maxMp*100)+'%';
 document.getElementById('rage-bar').style.width=player.rage+'%';
}

function renderMap(){
 const el=document.getElementById('map-panel'); el.innerHTML='';
 Object.keys(mapData).forEach(k=>{
  const n=mapData[k]; const d=document.createElement('div');
  d.className='map-node'+(n.unlocked?'':' locked');
  d.innerText=n.name;
  if(n.unlocked){d.onclick=()=>enterMap(k);} el.appendChild(d);
 });
}

function enterMap(k){ player.location=k; const n=mapData[k]; if(n.battle)startBattle(n.battle); }

function startBattle(key){ currentEnemy={...enemies[key],currentHp:enemies[key].hp}; document.getElementById('battle-panel').classList.remove('hidden'); renderBattle(); }

function renderBattle(){
 document.getElementById('enemy-name').innerText=currentEnemy.name;
 document.getElementById('enemy-hp-text').innerText=currentEnemy.currentHp+'/'+currentEnemy.hp;
 document.getElementById('enemy-hp-bar').style.width=(currentEnemy.currentHp/currentEnemy.hp*100)+'%';
 const actions=document.getElementById('battle-actions'); actions.innerHTML='';
 ['攻擊','技能','回復','終極'].forEach((t,i)=>{
  const b=document.createElement('button'); b.innerText=t;
  b.onclick=()=>playerTurn(i); actions.appendChild(b);
 });
}

function playerTurn(type){
 let dmg=0;
 if(type===0){dmg=player.atk+Math.random()*5; player.rage+=20;}
 if(type===1 && player.mp>=10){player.mp-=10; dmg=player.atk+15;}
 if(type===2){player.mp+=10;}
 if(type===3 && player.rage>=100){player.rage=0; dmg=player.atk+40;}
 currentEnemy.currentHp-=dmg;
 if(currentEnemy.currentHp<=0){winBattle(); return;}
 enemyTurn(); renderBattle(); updateUI();
}

function enemyTurn(){
 player.hp-=currentEnemy.atk;
 if(player.hp<=0){alert('你死了'); location.reload();}
}

function winBattle(){
 document.getElementById('battle-panel').classList.add('hidden');
 if(currentEnemy.drop){player.inventory.push(currentEnemy.drop[0]);}
 mapData['wasteland'].unlocked=true;
}

function renderInventory(){
 const el=document.getElementById('inventory-panel'); el.innerHTML='';
 player.inventory.forEach(id=>{
  const it=items[id]; const d=document.createElement('div'); d.innerText=it.name;
  d.onclick=()=>{ if(it.effect?.hp)player.hp+=it.effect.hp; if(it.effect?.mp)player.mp+=it.effect.mp; updateUI(); };
  el.appendChild(d);
 });
}

function saveGame(){ localStorage.setItem(SAVE_KEY,JSON.stringify({player,mapData})); }
function loadGame(){ const s=JSON.parse(localStorage.getItem(SAVE_KEY)); if(!s)return; player=s.player; Object.assign(mapData,s.mapData); init(); }

function init(){
 document.getElementById('start-game-btn').onclick=()=>{document.getElementById('title-screen').classList.add('hidden');document.getElementById('game-app').classList.remove('hidden');updateUI();renderMap();renderInventory();};
 document.getElementById('save-btn').onclick=saveGame;
 document.getElementById('load-btn').onclick=loadGame;
}

init();
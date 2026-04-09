const $=id=>document.getElementById(id);
let p={hp:150,mp:50,atk:15,lv:1,inventory:['potion_small'],loc:'ruin'};
let currentEnemy=null;
function log(t){$('story').innerText=t}
function renderMap(){const el=$('map-panel');el.innerHTML='';Object.keys(mapData).forEach(k=>{const n=mapData[k];const b=document.createElement('button');b.innerText=n.name;b.disabled=!n.unlocked;b.onclick=()=>move(k);el.appendChild(b);})}
function move(k){p.loc=k;log('你來到 '+mapData[k].name);
if(k==='wasteland')startBattle('bandit');
if(k==='city')startBattle('ghost');
if(k==='boss')startBattle('boss');}
function startBattle(type){currentEnemy={...enemies[type]};$('battle-panel').classList.remove('hidden');renderBattle()}
function renderBattle(){const e=currentEnemy;$('enemy-name').innerText=e.name;$('enemy-hp-text').innerText=e.hp;
const box=$('battle-actions');box.innerHTML='';['攻擊','技能','回復'].forEach((t,i)=>{const b=document.createElement('button');b.innerText=t;b.onclick=()=>turn(i);box.appendChild(b);})}
function turn(i){let dmg=p.atk+Math.random()*5;currentEnemy.hp-=dmg;if(currentEnemy.hp<=0){win();return;}p.hp-=currentEnemy.atk;renderBattle()}
function win(){log('擊敗 '+currentEnemy.name);if(p.loc==='ruin')mapData.wasteland.unlocked=true;if(p.loc==='wasteland')mapData.city.unlocked=true;if(p.loc==='city')mapData.boss.unlocked=true;$('battle-panel').classList.add('hidden');renderMap()}
function start(){ $('title-screen').classList.add('hidden');$('game-app').classList.remove('hidden');renderMap();log('從廢墟出發');}
$('start-game-btn').onclick=start;
const $=id=>document.getElementById(id);

// ===== 資料整合（不再依賴外部檔） =====
const mapData={ruin:{name:'天都廢墟',unlocked:true},wasteland:{name:'邊境荒原',unlocked:false},city:{name:'迷城古都',unlocked:false},boss:{name:'深淵核心',unlocked:false}};
const story={ruin:'你自廢墟甦醒，戰火未熄。',wasteland:'荒原風沙瀰漫，敵影浮現。',city:'古都陰影籠罩，危機四伏。',boss:'深淵核心震動，最終敵人降臨。'};
const items={potion:{name:'小還丹',hp:40},blade:{name:'戰刃',atk:10},armor:{name:'戰甲',hpMax:50}};
const enemies={bandit:{name:'掠奪者',hp:80,atk:10},ghost:{name:'鬼智師',hp:100,atk:15},boss:{name:'魔化將軍',hp:200,atk:25}};

let p={hp:150,maxHp:150,atk:15,lv:1,loc:'ruin',clears:{w:0,c:0}};
let enemy=null;

function log(t){$('story').innerText=t;}
function renderMap(){const el=$('map-panel');el.innerHTML='';Object.keys(mapData).forEach(k=>{const b=document.createElement('button');b.innerText=mapData[k].name;b.disabled=!mapData[k].unlocked;b.onclick=()=>move(k);el.appendChild(b);});}

function move(k){p.loc=k;let txt='你來到 '+mapData[k].name+'\n'+story[k];
if(k==='boss'&&(p.clears.w<1||p.clears.c<1)){log(txt+'\n封鎖中');return;}
if(k==='wasteland'){startBattle('bandit');}
else if(k==='city'){startBattle(Math.random()<0.5?'ghost':'bandit');}
else if(k==='boss'){startBattle('boss');}
else{log(txt);} }

function startBattle(type){enemy={...enemies[type]};$('battle-panel').classList.remove('hidden');renderBattle();}

function renderBattle(){const e=enemy;$('enemy-name').innerText=e.name;$('enemy-hp-text').innerText=e.hp;
const box=$('battle-actions');box.innerHTML='';['攻擊','技能','大招'].forEach((t,i)=>{const b=document.createElement('button');b.innerText=t;b.onclick=()=>turn(i);box.appendChild(b);});}

function turn(i){let dmg=p.atk+Math.random()*5;enemy.hp-=dmg;if(enemy.hp<=0){win();return;}p.hp-=enemy.atk;renderBattle();}

function win(){log('擊敗 '+enemy.name);
if(p.loc==='ruin')mapData.wasteland.unlocked=true;
if(p.loc==='wasteland'){mapData.city.unlocked=true;p.clears.w++;}
if(p.loc==='city'){mapData.boss.unlocked=true;p.clears.c++;}
$('battle-panel').classList.add('hidden');renderMap();}

function start(){ $('title-screen').classList.add('hidden');$('game-app').classList.remove('hidden');renderMap();log(story.ruin);}

$('start-game-btn').onclick=start;
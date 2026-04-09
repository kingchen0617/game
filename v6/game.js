const $=id=>document.getElementById(id);
const map={ruin:{n:'廢墟',u:true},wasteland:{n:'荒原',u:false},city:{n:'古都',u:false},boss:{n:'深淵',u:false}};
const story={ruin:'你從廢墟醒來。',wasteland:'荒原危機四伏。',city:'古都暗藏殺機。',boss:'最終決戰來臨。'};
const enemies={bandit:{n:'掠奪者',hp:80,atk:10},ghost:{n:'鬼智師',hp:100,atk:15},boss:{n:'魔化將軍',hp:200,atk:25}};
let p={hp:150,atk:15,loc:'ruin',w:0,c:0};
let e=null;
function log(t){$('story').innerText=t}
function render(){const m=$('map-panel');m.innerHTML='';Object.keys(map).forEach(k=>{const b=document.createElement('button');b.innerText=map[k].n;b.disabled=!map[k].u;b.onclick=()=>move(k);m.appendChild(b)});}
function move(k){p.loc=k;log(story[k]);if(k==='wasteland')fight('bandit');if(k==='city')fight(Math.random()<0.5?'ghost':'bandit');if(k==='boss'){if(p.w<1||p.c<1){log('Boss未解鎖');return;}fight('boss');}}
function fight(t){e={...enemies[t]};$('battle-panel').classList.remove('hidden');updateBattle();}
function updateBattle(){const box=$('battle-actions');box.innerHTML='';['攻擊','技能','大招'].forEach((t,i)=>{const b=document.createElement('button');b.innerText=t;b.onclick=()=>turn();box.appendChild(b)});$('enemy-name').innerText=e.n;$('enemy-hp-text').innerText=e.hp;}
function turn(){e.hp-=p.atk;if(e.hp<=0){win();return;}p.hp-=e.atk;updateBattle();}
function win(){log('擊敗 '+e.n);if(p.loc==='ruin')map.wasteland.u=true;if(p.loc==='wasteland'){map.city.u=true;p.w++;}if(p.loc==='city'){map.boss.u=true;p.c++;}$('battle-panel').classList.add('hidden');render();}
function start(){ $('title-screen').classList.add('hidden');$('game-app').classList.remove('hidden');render();log(story.ruin)}
$('start-game-btn').onclick=start;
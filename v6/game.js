const $=id=>document.getElementById(id);
const SAVE_KEY='v6_save';
const DATA={
  map:{
    ruin:{name:'天都廢墟',open:true},
    wasteland:{name:'邊境荒原',open:true},
    city:{name:'迷城古都',open:false},
    boss:{name:'深淵核心',open:false}
  },
  story:{
    ruin:'你自天都廢墟甦醒，殘火未熄。點擊地圖開始探索。',
    wasteland:'邊境荒原風沙漫天，掠奪者潛伏於沙塵之後。',
    city:'迷城古都陰影重重，鬼智師正在暗中觀察你。',
    boss:'你踏入深淵核心，魔化將軍的殺意籠罩四周。'
  },
  items:{
    potion:{name:'小還丹',type:'consumable',hp:40},
    ether:{name:'凝元散',type:'consumable',mp:20},
    blade:{name:'戰刃',type:'weapon',slot:'weapon',atk:10},
    armor:{name:'戰甲',type:'armor',slot:'armor',hpMax:40}
  },
  enemies:{
    bandit:{name:'掠奪者',hp:80,atk:10,drop:['potion']},
    ghost:{name:'鬼智師',hp:110,atk:14,drop:['ether','blade']},
    boss:{name:'魔化將軍',hp:220,atk:22,drop:['armor']}
  }
};
let state={
  player:{hp:150,maxHp:150,mp:50,maxMp:50,atk:15,rage:0,lv:1,loc:'ruin',clears:{w:0,c:0},inventory:['potion'],equip:{weapon:null,armor:null}},
  enemy:null
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gearBonus=(slot,stat)=>{const id=state.player.equip[slot];return id&&DATA.items[id]&&DATA.items[id][stat]?DATA.items[id][stat]:0};
const hpMax=()=>state.player.maxHp+gearBonus('armor','hpMax');
const mpMax=()=>state.player.maxMp;
const atk=()=>state.player.atk+gearBonus('weapon','atk');
function txt(id,v){const el=$(id);if(el)el.innerText=v;}
function html(id,v){const el=$(id);if(el)el.innerHTML=v;}
function show(id){const el=$(id);if(el)el.classList.remove('hidden');}
function hide(id){const el=$(id);if(el)el.classList.add('hidden');}
function msg(v){txt('system-message',v||'');}
function story(v){txt('story',v||'');}
function renderStatus(){const p=state.player;p.hp=clamp(p.hp,0,hpMax());p.mp=clamp(p.mp,0,mpMax());txt('hp-text',`${p.hp}/${hpMax()}`);txt('mp-text',`${p.mp}/${mpMax()}`);txt('rage-text',`${p.rage}/100`);if($('hp-bar'))$('hp-bar').style.width=(p.hp/hpMax()*100)+'%';if($('mp-bar'))$('mp-bar').style.width=(p.mp/mpMax()*100)+'%';if($('rage-bar'))$('rage-bar').style.width=p.rage+'%';html('stats',`<div>等級：${p.lv}</div><div>攻擊：${atk()}</div><div>位置：${DATA.map[p.loc].name}</div><div>荒原/古都：${p.clears.w}/${p.clears.c}</div>`);html('equipment-panel',`<div class='equipment-item'>武器：${p.equip.weapon?DATA.items[p.equip.weapon].name:'無'}</div><div class='equipment-item'>防具：${p.equip.armor?DATA.items[p.equip.armor].name:'無'}</div>`);}
function renderMap(){const el=$('map-panel');if(!el)return;el.innerHTML='';Object.keys(DATA.map).forEach(k=>{const node=DATA.map[k];const b=document.createElement('button');b.className='map-node';b.innerText=node.name;b.disabled=!node.open;b.onclick=()=>move(k);el.appendChild(b);});}
function renderInventory(){const el=$('inventory-panel');if(!el)return;el.innerHTML='';state.player.inventory.forEach(id=>{const it=DATA.items[id];if(!it)return;const b=document.createElement('button');b.className='inventory-item'+(it.slot?' equip':'');b.innerText=it.name;b.onclick=()=>{if(it.type==='consumable')useItem(id);else equipItem(id);};el.appendChild(b);});}
function equipItem(id){const it=DATA.items[id];if(!it||!it.slot)return;state.player.equip[it.slot]=id;msg('已裝備：'+it.name);renderAll();}
function useItem(id){const it=DATA.items[id];if(!it)return;if(it.hp)state.player.hp=clamp(state.player.hp+it.hp,0,hpMax());if(it.mp)state.player.mp=clamp(state.player.mp+it.mp,0,mpMax());const i=state.player.inventory.indexOf(id);if(i>=0)state.player.inventory.splice(i,1);msg('已使用：'+it.name);renderAll();}
function randomEnemy(region){if(region==='wasteland')return 'bandit';if(region==='city')return Math.random()<0.6?'ghost':'bandit';return null;}
function move(k){state.player.loc=k;let text='你移動到 '+DATA.map[k].name+'。\n'+DATA.story[k];if(k==='boss'){if(state.player.clears.w<1||state.player.clears.c<1){story(text+'\n深淵核心被封鎖，必須先清除荒原與古都的敵人。');msg('Boss 未解鎖');renderAll();return;}story(text+'\nBoss 現身：'+DATA.enemies.boss.name);startBattle('boss');return;}const foe=randomEnemy(k);story(text+(foe?'\n你在此地遭遇敵人！':'\n此地暫時安全。'));if(foe)startBattle(foe);else{msg('已移動');renderAll();}}
function startBattle(type){const src=DATA.enemies[type];if(!src){msg('敵人資料缺失');return;}state.enemy={key:type,name:src.name,hp:src.hp,maxHp:src.hp,atk:src.atk,drop:src.drop||[]};show('battle-panel');renderBattle();}
function renderBattle(){const e=state.enemy;if(!e)return;txt('enemy-name',e.name);txt('enemy-level',e.key==='boss'?'Boss':'Lv.'+state.player.lv);txt('enemy-hp-text',`${e.hp}/${e.maxHp}`);if($('enemy-hp-bar'))$('enemy-hp-bar').style.width=(e.hp/e.maxHp*100)+'%';const box=$('battle-actions');if(!box)return;box.innerHTML='';[['普通攻擊',()=>turn('a')],['武君戰印',()=>turn('s')],['計略觀心',()=>turn('m')],['計都斬',()=>turn('u')]].forEach(([t,f])=>{const b=document.createElement('button');b.innerText=t;b.onclick=f;box.appendChild(b);});renderStatus();}
function battleLog(v){txt('battle-log',v||'');}
function turn(type){const p=state.player,e=state.enemy;if(!e)return;let dmg=0,log='';if(type==='a'){dmg=Math.floor(atk()+Math.random()*6);p.rage=clamp(p.rage+20,0,100);log='你揮刀造成 '+dmg+' 傷害。';}if(type==='s'){if(p.mp<10){battleLog('真元不足。');return;}p.mp-=10;dmg=Math.floor(atk()+12+Math.random()*6);p.rage=clamp(p.rage+10,0,100);log='武君戰印造成 '+dmg+' 傷害。';}if(type==='m'){p.mp=clamp(p.mp+10,0,mpMax());battleLog('你恢復了真元。');renderStatus();return;}if(type==='u'){if(p.rage<100){battleLog('怒氣不足。');return;}p.rage=0;dmg=Math.floor(atk()+28+Math.random()*8);log='計都斬爆發，造成 '+dmg+' 傷害。';}e.hp-=dmg;if(e.hp<=0){winBattle(log);return;}const edmg=Math.floor(e.atk+Math.random()*5);p.hp=clamp(p.hp-edmg,0,hpMax());if(p.hp<=0){battleLog(log+'\n'+e.name+' 反擊 '+edmg+'，你戰敗了。');html('battle-actions','');msg('請讀檔或重新開始');renderStatus();return;}battleLog(log+'\n'+e.name+' 反擊 '+edmg+'。');renderBattle();}
function maybeDrop(arr){if(!arr||!arr.length)return null;return Math.random()<0.8?arr[Math.floor(Math.random()*arr.length)]:null;}
function unlockFlow(){if(state.player.clears.w>=1)DATA.map.city.open=true;if(state.player.clears.w>=1&&state.player.clears.c>=1)DATA.map.boss.open=true;}
function winBattle(prefix){const e=state.enemy;hide('battle-panel');html('battle-actions','');state.player.lv++;state.player.hp=clamp(state.player.hp+20,0,hpMax());state.player.mp=clamp(state.player.mp+8,0,mpMax());if(state.player.loc==='wasteland')state.player.clears.w++;if(state.player.loc==='city')state.player.clears.c++;unlockFlow();const drop=maybeDrop(e.drop);let t=prefix+'\n你擊敗了 '+e.name+'。';if(drop&&DATA.items[drop]){state.player.inventory.push(drop);t+='\n獲得掉寶：'+DATA.items[drop].name+'。';msg('獲得：'+DATA.items[drop].name);}if(e.key==='boss'){t+='\n你擊敗了最終 Boss，完成了這段征途。';msg('Boss 已擊敗！');}story(t);state.enemy=null;renderAll();}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({state,open:{city:DATA.map.city.open,boss:DATA.map.boss.open}}));msg('已儲存進度');}
function load(){const raw=localStorage.getItem(SAVE_KEY);if(!raw){msg('沒有存檔');return;}const s=JSON.parse(raw);state=s.state||state;if(s.open){DATA.map.city.open=!!s.open.city;DATA.map.boss.open=!!s.open.boss;}renderAll();story(DATA.story[state.player.loc]);msg('已讀取進度');}
function restart(){state={player:{hp:150,maxHp:150,mp:50,maxMp:50,atk:15,rage:0,lv:1,loc:'ruin',clears:{w:0,c:0},inventory:['potion'],equip:{weapon:null,armor:null}},enemy:null};DATA.map.wasteland.open=true;DATA.map.city.open=false;DATA.map.boss.open=false;hide('battle-panel');story(DATA.story.ruin+'\n請點擊地圖開始探索。');renderAll();msg('已重新開始');}
function renderAll(){renderStatus();renderMap();renderInventory();}
function start(){hide('title-screen');show('game-app');DATA.map.wasteland.open=true;story(DATA.story.ruin+'\n請點擊地圖開始探索。');renderAll();msg('遊戲開始');}
function bind(){if($('start-game-btn'))$('start-game-btn').onclick=start;if($('show-help-btn'))$('show-help-btn').onclick=()=>show('help-modal');if($('close-help-btn'))$('close-help-btn').onclick=()=>hide('help-modal');if($('save-btn'))$('save-btn').onclick=save;if($('load-btn'))$('load-btn').onclick=load;if($('restart-btn'))$('restart-btn').onclick=restart;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
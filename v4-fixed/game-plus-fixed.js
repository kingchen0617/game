const SAVE_PLUS_FIXED='v4_fixed_plus_fixed';
let p={hp:150,maxHp:150,mp:60,maxMp:60,rage:0,atk:15,lv:1,inventory:['potion_small','blade_jidu'],equipment:{weapon:null,armor:null,accessory:null},location:'ruin'};
let e=null;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const bonus=(slot,stat)=>{const id=p.equipment[slot];return id&&items&&items[id]&&items[id][stat]?items[id][stat]:0};
const hpMax=()=>p.maxHp+bonus('armor','hp');
const mpMax=()=>p.maxMp+bonus('accessory','mp');
const atk=()=>p.atk+bonus('weapon','atk');
function text(id,val){const el=$(id); if(el) el.innerText=val;}
function html(id,val){const el=$(id); if(el) el.innerHTML=val;}
function msg(t){text('system-message',t||'');}
function show(id){const el=$(id); if(el) el.classList.remove('hidden');}
function hide(id){const el=$(id); if(el) el.classList.add('hidden');}
function ui(){p.hp=clamp(p.hp,0,hpMax());p.mp=clamp(p.mp,0,mpMax());text('hp-text',`${p.hp}/${hpMax()}`);text('mp-text',`${p.mp}/${mpMax()}`);text('rage-text',`${p.rage}/100`);if($('hp-bar')) $('hp-bar').style.width=(p.hp/hpMax()*100)+'%';if($('mp-bar')) $('mp-bar').style.width=(p.mp/mpMax()*100)+'%';if($('rage-bar')) $('rage-bar').style.width=p.rage+'%';html('stats',`<div>等級：${p.lv}</div><div>攻擊：${atk()}</div><div>位置：${mapData&&mapData[p.location]?mapData[p.location].name:''}</div><div>狀態：${p.hp>0?'可戰':'倒下'}</div>`);html('equipment-panel',`<div class='equipment-item'>武器：${p.equipment.weapon&&items[p.equipment.weapon]?items[p.equipment.weapon].name:'無'}</div><div class='equipment-item'>防具：${p.equipment.armor&&items[p.equipment.armor]?items[p.equipment.armor].name:'無'}</div><div class='equipment-item'>飾品：${p.equipment.accessory&&items[p.equipment.accessory]?items[p.equipment.accessory].name:'無'}</div>`);}
function storyText(t){text('story',t||'');}
function mapView(){const el=$('map-panel'); if(!el||!mapData) return; el.innerHTML=''; Object.keys(mapData).forEach(k=>{const n=mapData[k]; const d=document.createElement('div'); d.className='map-node'+(n.unlocked?'':' locked'); d.innerText=n.name; if(n.unlocked)d.onclick=()=>go(k); el.appendChild(d);});}
function inv(){const el=$('inventory-panel'); if(!el||!items) return; el.innerHTML=''; p.inventory.forEach(id=>{const it=items[id]; if(!it) return; const d=document.createElement('div'); d.className='inventory-item'; d.innerText=it.name+'\n'+(it.desc||''); d.onclick=()=>it.type==='consumable'?use(id):equip(id); el.appendChild(d);});}
function equip(id){const it=items&&items[id]; if(!it||!it.slot) return; p.equipment[it.slot]=id; msg('已裝備：'+it.name); ui(); inv();}
function use(id){const it=items&&items[id]; if(!it) return; if(it.effect&&it.effect.hp) p.hp=clamp(p.hp+it.effect.hp,0,hpMax()); if(it.effect&&it.effect.mp) p.mp=clamp(p.mp+it.effect.mp,0,mpMax()); const i=p.inventory.indexOf(id); if(i>=0) p.inventory.splice(i,1); msg('已使用：'+it.name); ui(); inv();}
function go(k){p.location=k; msg('前往：'+(mapData[k]?mapData[k].name:k)); const n=mapData[k]; if(n&&n.battle) battle(n.battle); else ui();}
function battle(key){if(!enemies||!enemies[key]){msg('找不到敵人資料。'); return;} e={...enemies[key],currentHp:enemies[key].hp}; show('battle-panel'); storyText('遭遇敵人：'+e.name+'\n'+(e.intro||'')); drawBattle();}
function log(t){text('battle-log',t);}
function drawBattle(){ if(!e) return; text('enemy-name',e.name); text('enemy-level','Lv.'+e.level); text('enemy-hp-text',`${e.currentHp}/${e.hp}`); if($('enemy-hp-bar')) $('enemy-hp-bar').style.width=(e.currentHp/e.hp*100)+'%'; const a=$('battle-actions'); if(!a) return; a.innerHTML=''; [['普通攻擊',()=>turn('a')],['武君戰印',()=>turn('s')],['計略觀心',()=>turn('m')],['終式・計都斬',()=>turn('u')]].forEach(([t,f])=>{const b=document.createElement('button'); b.innerText=t; b.onclick=f; a.appendChild(b);}); ui(); }
function turn(t){ if(!e) return; let d=0,m=''; if(t==='a'){d=Math.floor(atk()+Math.random()*6); p.rage=clamp(p.rage+20,0,100); m='你造成 '+d+' 傷害。';} if(t==='s'){if(p.mp<10){log('真元不足。'); return;} p.mp-=10; d=Math.floor(atk()+15+Math.random()*5); p.rage=clamp(p.rage+10,0,100); m='武君戰印造成 '+d+' 傷害。';} if(t==='m'){p.mp=clamp(p.mp+10,0,mpMax()); m='你恢復真元。';} if(t==='u'){if(p.rage<100){log('怒氣不足。'); return;} p.rage=0; d=Math.floor(atk()+35+Math.random()*8); m='終式造成 '+d+' 傷害。';} e.currentHp-=d; if(e.currentHp<=0){win(m); return;} enemy(m); }
function enemy(prefix){ const d=Math.floor((e?e.atk:0)+Math.random()*4); p.hp=clamp(p.hp-d,0,hpMax()); if(p.hp<=0){log(prefix+'\n'+e.name+' 反擊 '+d+'。\n你戰敗了。'); html('battle-actions',''); msg('已戰敗，請重新開始或讀檔。'); ui(); return;} log(prefix+'\n'+e.name+' 反擊 '+d+'。'); drawBattle(); }
function unlock(){ if(p.location==='ruin'&&mapData&&mapData.wasteland) mapData.wasteland.unlocked=true; if(p.location==='wasteland'&&mapData&&mapData.ghost_city) mapData.ghost_city.unlocked=true; }
function win(prefix){ hide('battle-panel'); html('battle-actions',''); p.lv++; p.hp=clamp(p.hp+20,0,hpMax()); p.mp=clamp(p.mp+10,0,mpMax()); if(e&&e.drop&&e.drop.length&&items&&items[e.drop[0]]){const drop=e.drop[0]; p.inventory.push(drop); msg('獲得：'+items[drop].name); log(prefix+'\n你擊敗了 '+e.name+'，獲得 '+items[drop].name+'。');} unlock(); e=null; ui(); mapView(); inv(); }
function save(){ localStorage.setItem(SAVE_PLUS_FIXED,JSON.stringify({p,mapData})); msg('已儲存進度。'); }
function load(){ const s=JSON.parse(localStorage.getItem(SAVE_PLUS_FIXED)||'null'); if(!s){ msg('沒有存檔。'); return; } p=s.p||p; if(s.mapData&&mapData) Object.assign(mapData,s.mapData); ui(); mapView(); inv(); msg('已讀取進度。'); }
function restart(){ p={hp:150,maxHp:150,mp:60,maxMp:60,rage:0,atk:15,lv:1,inventory:['potion_small','blade_jidu'],equipment:{weapon:null,armor:null,accessory:null},location:'ruin'}; if(mapData&&mapData.wasteland) mapData.wasteland.unlocked=false; if(mapData&&mapData.ghost_city) mapData.ghost_city.unlocked=false; hide('battle-panel'); storyText('你從天都廢墟醒來。'); ui(); mapView(); inv(); msg('已重新開始。'); }
function startGame(){ hide('title-screen'); show('game-app'); storyText('你從天都廢墟醒來。'); ui(); mapView(); inv(); msg('遊戲開始。'); }
function bind(){ const s=$('start-game-btn'); if(s) s.onclick=startGame; const h=$('show-help-btn'); if(h) h.onclick=()=>show('help-modal'); const c=$('close-help-btn'); if(c) c.onclick=()=>hide('help-modal'); const sv=$('save-btn'); if(sv) sv.onclick=save; const ld=$('load-btn'); if(ld) ld.onclick=load; const r=$('restart-btn'); if(r) r.onclick=restart; const a=$('toggle-audio-btn'); if(a) a.onclick=()=>msg('音效預留，後續可接入。'); }
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', bind); } else { bind(); }
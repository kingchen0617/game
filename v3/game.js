let player = {
  hp: 150, mp: 60, rage: 0, atk: 15,
  fate:{tyrant:0,king:0,truth:0},
  inventory:["potion_small","blade_jidu"],
  equipment:{weapon:null,armor:null,accessory:null},
  location:"ruin"
};

let currentNode = "start";
let gameState = {};

function renderMap(){
  const el = document.getElementById("map-panel");
  el.innerHTML = "";
  Object.keys(mapData).forEach(k=>{
    const node = mapData[k];
    const div = document.createElement("div");
    div.className = "map-node" + (node.unlocked?"":" locked");
    div.innerText = node.name;
    if(node.unlocked){
      div.onclick = ()=>enterMap(k);
    }
    el.appendChild(div);
  });
}

function enterMap(key){
  player.location = key;
  const node = mapData[key];
  if(node.battle){ startBattle(node.battle); }
}

function renderInventory(){
  const el = document.getElementById("inventory-panel");
  el.innerHTML = "";
  player.inventory.forEach(id=>{
    const item = items[id];
    const div = document.createElement("div");
    div.className="inventory-item";
    div.innerText=item.name;
    div.onclick=()=>useItem(id);
    el.appendChild(div);
  });
}

function useItem(id){
  const item = items[id];
  if(item.type==="consumable"){
    if(item.effect.hp) player.hp+=item.effect.hp;
    if(item.effect.mp) player.mp+=item.effect.mp;
  }
}

function renderNode(){
  const node = story[currentNode];
  if(node.unlockMap){
    node.unlockMap.forEach(k=>mapData[k].unlocked=true);
  }
  document.getElementById("story").innerText=node.text;
  renderMap();
  renderInventory();
}

function startBattle(key){
  alert("遭遇敵人："+enemies[key].name);
}

function saveGame(){
  localStorage.setItem("save_v3",JSON.stringify({player,currentNode,mapData}));
}

function loadGame(){
  const s=JSON.parse(localStorage.getItem("save_v3"));
  if(!s)return;
  player=s.player;
  currentNode=s.currentNode;
  Object.assign(mapData,s.mapData);
  renderNode();
}

function init(){
  document.getElementById("start-game-btn").onclick=()=>{
    document.getElementById("title-screen").classList.add("hidden");
    document.getElementById("game-app").classList.remove("hidden");
    renderNode();
  };
  document.getElementById("save-btn").onclick=saveGame;
  document.getElementById("load-btn").onclick=loadGame;
}

init();

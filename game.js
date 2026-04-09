const SAVE_KEY = "luohou_rpg_save_v2";

let player = {};
let currentNode = "start";
let currentEnemy = null;
let battleActive = false;
let audioEnabled = false;
let storyLog = [];

const chapters = [
  "序章：天都殘火",
  "第一章：血路孤行",
  "第二章：迷城鬼語",
  "第三章：王與魔",
  "第四章：天都舊誓",
  "終章：羅喉之道"
];

function createNewPlayer() {
  return {
    name: "武君・羅喉",
    maxHp: 160,
    hp: 160,
    maxMp: 60,
    mp: 60,
    rage: 0,
    atk: 18,
    level: 1,
    fate: {
      tyrant: 0,
      king: 0,
      truth: 0
    }
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setSystemMessage(message) {
  document.getElementById("system-message").innerText = message || "";
}

function addStoryLog(text) {
  storyLog.unshift(text);
  storyLog = storyLog.slice(0, 12);
  document.getElementById("story-log").innerText = storyLog.join("\n\n");
}

function updateChapterMap(currentChapter) {
  const el = document.getElementById("chapter-map");
  el.innerHTML = "";
  chapters.forEach(ch => {
    const div = document.createElement("div");
    div.className = "chapter-map-item" + (ch === currentChapter ? " active" : "");
    div.innerText = ch;
    el.appendChild(div);
  });
}

function applyEffects(effect = {}) {
  if (effect.tyrant) player.fate.tyrant += effect.tyrant;
  if (effect.king) player.fate.king += effect.king;
  if (effect.truth) player.fate.truth += effect.truth;
  if (effect.hp) player.hp = clamp(player.hp + effect.hp, 0, player.maxHp);
  if (effect.mp) player.mp = clamp(player.mp + effect.mp, 0, player.maxMp);
}

function updateStatusUI() {
  const hpPct = (player.hp / player.maxHp) * 100;
  const mpPct = (player.mp / player.maxMp) * 100;
  const ragePct = clamp(player.rage, 0, 100);

  document.getElementById("hp-text").innerText = `${player.hp} / ${player.maxHp}`;
  document.getElementById("mp-text").innerText = `${player.mp} / ${player.maxMp}`;
  document.getElementById("rage-text").innerText = `${player.rage} / 100`;

  document.getElementById("hp-bar").style.width = `${hpPct}%`;
  document.getElementById("mp-bar").style.width = `${mpPct}%`;
  document.getElementById("rage-bar").style.width = `${ragePct}%`;

  document.getElementById("fate-tyrant").innerText = player.fate.tyrant;
  document.getElementById("fate-king").innerText = player.fate.king;
  document.getElementById("fate-truth").innerText = player.fate.truth;

  document.getElementById("stats").innerHTML = `
    <div>等級：${player.level}</div>
    <div>攻擊：${player.atk}</div>
    <div>稱號：武君</div>
    <div>狀態：${player.hp > 0 ? "可戰" : "倒下"}</div>
  `;
}

function renderTags(tags = []) {
  const tagsEl = document.getElementById("story-tags");
  tagsEl.innerHTML = "";
  tags.forEach(tag => {
    const span = document.createElement("span");
    span.innerText = tag;
    tagsEl.appendChild(span);
  });
}

function typeText(target, text, speed = 16) {
  target.innerText = "";
  let i = 0;
  const timer = setInterval(() => {
    target.innerText += text[i] || "";
    i++;
    if (i > text.length) clearInterval(timer);
  }, speed);
}

function renderChoices(choices = []) {
  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => {
      playClick();
      applyEffects(choice.effect);
      addStoryLog(`【選擇】${choice.text}`);
      currentNode = choice.next;
      renderNode(currentNode);
    };
    choicesEl.appendChild(btn);
  });
}

function renderEnding() {
  const t = player.fate.tyrant;
  const k = player.fate.king;
  const r = player.fate.truth;

  const values = [t, k, r].sort((a, b) => b - a);
  const closeEnding = Math.abs(values[0] - values[1]) <= 1 && Math.abs(values[1] - values[2]) <= 2;

  let title = "";
  let text = "";
  let tag = "";

  if (closeEnding) {
    title = "隱藏結局：孤峰止戰";
    tag = "平衡";
    text = `你最終沒有成為純粹的王，也沒有成為純粹的魔。\n你轉身離開王座與血海，只留下震懾亂世的一道孤峰背影。`;
  } else if (t >= k && t >= r) {
    title = "結局：魔君降世";
    tag = "霸道";
    text = `你用絕對力量重塑天下秩序。\n天都再起，但新王朝建立在眾生對你的恐懼之上。`;
  } else if (k >= t && k >= r) {
    title = "結局：重建天都";
    tag = "王道";
    text = `你背負戰火與責任，重整天都。\n羅喉不再只是毀滅的名字，而是亂世的鎮柱。`;
  } else {
    title = "結局：看破輪迴";
    tag = "真相";
    text = `你揭穿所有佈局，也放下了被命運綑綁的自己。\n從此，羅喉之名化作傳說。`;
  }

  document.getElementById("chapter-title").innerText = title;
  document.getElementById("chapter-badge").innerText = tag;
  renderTags(["終局", tag]);
  typeText(document.getElementById("story"), text);
  document.getElementById("choices").innerHTML = `<button onclick="resetGame()">重新開始</button>`;
  document.getElementById("battle-panel").classList.add("hidden");
  addStoryLog(`【結局】${title}`);
}

function renderBattle(enemyKey, winNext) {
  currentEnemy = {
    ...enemies[enemyKey],
    currentHp: enemies[enemyKey].hp,
    winNext
  };
  battleActive = true;

  document.getElementById("battle-panel").classList.remove("hidden");
  document.getElementById("choices").innerHTML = "";
  document.getElementById("enemy-name").innerText = currentEnemy.name;
  document.getElementById("enemy-level").innerText = `Lv.${currentEnemy.level}`;
  document.getElementById("battle-log").innerText = currentEnemy.intro;

  const actionsEl = document.getElementById("battle-actions");
  actionsEl.innerHTML = "";

  const actions = [
    { text: "普通攻擊", handler: normalAttack },
    { text: "武君戰印（12 真元）", handler: powerSkill },
    { text: "計略觀心（回復真元）", handler: meditate },
    { text: "終式・計都斬（怒氣 100）", handler: rageSkill }
  ];

  actions.forEach(action => {
    const btn = document.createElement("button");
    btn.innerText = action.text;
    btn.onclick = action.handler;
    actionsEl.appendChild(btn);
  });

  updateBattleUI();
}

function updateBattleUI(logText) {
  if (!currentEnemy) return;
  const pct = (currentEnemy.currentHp / currentEnemy.hp) * 100;
  document.getElementById("enemy-hp-text").innerText = `${Math.max(0, currentEnemy.currentHp)} / ${currentEnemy.hp}`;
  document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, pct)}%`;
  if (logText) document.getElementById("battle-log").innerText = logText;
  updateStatusUI();
}

function enemyTurn(extraText = "") {
  if (!battleActive || !currentEnemy || currentEnemy.currentHp <= 0) return;
  const dmg = currentEnemy.atk + Math.floor(Math.random() * 6);
  player.hp = clamp(player.hp - dmg, 0, player.maxHp);

  if (player.hp <= 0) {
    battleActive = false;
    updateBattleUI(`${extraText}\n${currentEnemy.name}重創了你。\n羅喉倒下了。`);
    document.getElementById("choices").innerHTML = `<button onclick="resetGame()">重新開始</button>`;
    document.getElementById("battle-actions").innerHTML = "";
    addStoryLog(`【戰敗】敗於 ${currentEnemy.name}`);
    return;
  }

  updateBattleUI(`${extraText}\n${currentEnemy.name}反擊，造成 ${dmg} 點傷害。`);
}

function checkBattleWin(extraText = "") {
  if (currentEnemy.currentHp > 0) return false;

  battleActive = false;
  player.level += 1;
  player.atk += 2;
  player.maxHp += 10;
  player.hp = clamp(player.hp + 35, 0, player.maxHp);
  player.mp = clamp(player.mp + 20, 0, player.maxMp);
  player.rage = 0;

  updateBattleUI(`${extraText}\n你擊敗了 ${currentEnemy.name}！`);
  document.getElementById("battle-actions").innerHTML = "";
  document.getElementById("choices").innerHTML = `<button onclick="proceedAfterBattle()">繼續前進</button>`;
  addStoryLog(`【勝利】擊敗 ${currentEnemy.name}`);
  return true;
}

function proceedAfterBattle() {
  document.getElementById("battle-panel").classList.add("hidden");
  currentNode = currentEnemy.winNext;
  currentEnemy = null;
  renderNode(currentNode);
}

function normalAttack() {
  const dmg = player.atk + Math.floor(Math.random() * 8);
  currentEnemy.currentHp -= dmg;
  player.rage = clamp(player.rage + 18, 0, 100);
  if (checkBattleWin(`你揮出沉重一擊，造成 ${dmg} 點傷害。`)) return;
  enemyTurn(`你揮出沉重一擊，造成 ${dmg} 點傷害。`);
}

function powerSkill() {
  if (player.mp < 12) {
    updateBattleUI("真元不足，無法施展武君戰印。");
    return;
  }
  player.mp -= 12;
  const dmg = player.atk + 18 + Math.floor(Math.random() * 10);
  currentEnemy.currentHp -= dmg;
  player.rage = clamp(player.rage + 12, 0, 100);
  if (checkBattleWin(`你施展武君戰印，造成 ${dmg} 點傷害。`)) return;
  enemyTurn(`你施展武君戰印，造成 ${dmg} 點傷害。`);
}

function meditate() {
  const gain = 8;
  player.mp = clamp(player.mp + gain, 0, player.maxMp);
  player.fate.truth += 1;
  enemyTurn(`你運轉心法，回復 ${gain} 點真元。`);
}

function rageSkill() {
  if (player.rage < 100) {
    updateBattleUI("怒氣未滿，無法施展終式・計都斬。");
    return;
  }
  player.rage = 0;
  const dmg = player.atk + 42 + Math.floor(Math.random() * 14);
  currentEnemy.currentHp -= dmg;
  if (checkBattleWin(`怒氣爆發！終式・計都斬造成 ${dmg} 點傷害。`)) return;
  enemyTurn(`怒氣爆發！終式・計都斬造成 ${dmg} 點傷害。`);
}

function renderNode(nodeKey) {
  const node = story[nodeKey];
  if (!node) return;

  setSystemMessage("");
  document.getElementById("chapter-title").innerText = node.chapter || "";
  document.getElementById("chapter-badge").innerText = node.badge || "";
  renderTags(node.tags || []);
  updateChapterMap(node.chapter || "");
  document.getElementById("battle-panel").classList.add("hidden");

  addStoryLog(`【章節】${node.chapter}`);
  typeText(document.getElementById("story"), node.text || "");

  if (node.ending) {
    renderEnding();
    updateStatusUI();
    return;
  }

  if (node.battle) {
    renderBattle(node.battle, node.winNext);
  } else {
    renderChoices(node.choices || []);
  }

  updateStatusUI();
}

function saveGame() {
  const data = { player, currentNode, storyLog, audioEnabled };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  setSystemMessage("進度已儲存。");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    setSystemMessage("沒有可讀取的存檔。");
    return;
  }
  try {
    const data = JSON.parse(raw);
    player = data.player;
    currentNode = data.currentNode || "start";
    storyLog = data.storyLog || [];
    audioEnabled = !!data.audioEnabled;
    updateAudioButton();
    renderNode(currentNode);
    setSystemMessage("已讀取存檔。");
  } catch {
    setSystemMessage("讀檔失敗。");
  }
}

function resetGame() {
  player = createNewPlayer();
  currentNode = "start";
  currentEnemy = null;
  battleActive = false;
  storyLog = [];
  renderNode(currentNode);
  setSystemMessage("已重新開始。");
}

function updateAudioButton() {
  document.getElementById("toggle-audio-btn").innerText = `音效：${audioEnabled ? "開" : "關"}`;
}

function playClick() {
  if (!audioEnabled) return;
  const el = document.getElementById("click-audio");
  el.currentTime = 0;
  el.play().catch(() => {});
}

document.getElementById("start-game-btn").addEventListener("click", () => {
  document.getElementById("title-screen").classList.add("hidden");
  document.getElementById("game-app").classList.remove("hidden");
  if (!player.name) resetGame();
});

document.getElementById("show-help-btn").addEventListener("click", () => {
  document.getElementById("help-modal").classList.remove("hidden");
});

document.getElementById("close-help-btn").addEventListener("click", () => {
  document.getElementById("help-modal").classList.add("hidden");
});

document.getElementById("save-btn").addEventListener("click", saveGame);
document.getElementById("load-btn").addEventListener("click", loadGame);
document.getElementById("restart-btn").addEventListener("click", resetGame);
document.getElementById("toggle-audio-btn").addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  updateAudioButton();
  setSystemMessage(`音效已${audioEnabled ? "開啟" : "關閉"}。`);
});

player = createNewPlayer();
updateAudioButton();

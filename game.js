const SAVE_KEY = "luohou_rpg_save_v3";
const SAVE_VERSION = 2;

let player = {};
let currentNode = "start";
let currentEnemy = null;
let battleActive = false;
let audioEnabled = false;
let storyLog = [];
let typingTimer = null;
let currentTypingText = "";
let typingIndex = 0;
let activeTextTarget = null;

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
    maxHp: 170,
    hp: 170,
    maxMp: 65,
    mp: 65,
    rage: 0,
    atk: 19,
    level: 1,
    potions: 1,
    guard: false,
    victories: 0,
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
  if (!text) return;
  storyLog.unshift(text);
  storyLog = storyLog.slice(0, 14);
  document.getElementById("story-log").innerText = storyLog.join("\n\n");
}

function updateChapterMap(currentChapter) {
  const el = document.getElementById("chapter-map");
  el.innerHTML = "";
  chapters.forEach((ch, index) => {
    const div = document.createElement("div");
    const isActive = ch === currentChapter;
    const isReached = chapters.indexOf(currentChapter) >= index;
    div.className = "chapter-map-item" + (isActive ? " active" : "") + (isReached ? " reached" : "");
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
  if (effect.potions) player.potions = clamp(player.potions + effect.potions, 0, 9);
}

function updateStatusUI() {
  const hpPct = (player.hp / player.maxHp) * 100;
  const mpPct = (player.mp / player.maxMp) * 100;
  const ragePct = clamp(player.rage, 0, 100);

  document.getElementById("hp-text").innerText = `${player.hp} / ${player.maxHp}`;
  document.getElementById("mp-text").innerText = `${player.mp} / ${player.maxMp}`;
  document.getElementById("rage-text").innerText = `${player.rage} / 100`;
  document.getElementById("potion-count").innerText = player.potions;
  document.getElementById("guard-status").innerText = player.guard ? "已架勢" : "未啟動";

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
    <div>戰績：${player.victories} 勝</div>
  `;

  updateBattleButtonsState();
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

function finishTypeText() {
  if (!typingTimer || !activeTextTarget) return;
  clearInterval(typingTimer);
  typingTimer = null;
  activeTextTarget.innerText = currentTypingText;
  typingIndex = currentTypingText.length;
}

function typeText(target, text, speed = 16) {
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  activeTextTarget = target;
  currentTypingText = text || "";
  typingIndex = 0;
  target.innerText = "";

  typingTimer = setInterval(() => {
    target.innerText += currentTypingText[typingIndex] || "";
    typingIndex++;
    if (typingIndex >= currentTypingText.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
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
      autoSave("節點推進自動存檔。");
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

  const summary = `\n\n【戰役總結】\n等級：${player.level}\n戰績：${player.victories} 勝\n軍糧丹剩餘：${player.potions}\n霸道 ${t} / 王道 ${k} / 真相 ${r}`;

  document.getElementById("chapter-title").innerText = title;
  document.getElementById("chapter-badge").innerText = tag;
  renderTags(["終局", tag]);
  typeText(document.getElementById("story"), text + summary);
  document.getElementById("choices").innerHTML = `<button onclick="resetGame()">重新開始</button>`;
  document.getElementById("battle-panel").classList.add("hidden");
  addStoryLog(`【結局】${title}`);
  setSystemMessage("已抵達結局。");
}

function renderBattle(enemyKey, winNext) {
  currentEnemy = {
    ...enemies[enemyKey],
    currentHp: enemies[enemyKey].hp,
    winNext
  };
  battleActive = true;
  player.guard = false;

  document.getElementById("battle-panel").classList.remove("hidden");
  document.getElementById("choices").innerHTML = "";
  document.getElementById("enemy-name").innerText = currentEnemy.name;
  document.getElementById("enemy-level").innerText = `Lv.${currentEnemy.level}`;
  document.getElementById("enemy-intent").innerText = `敵方意圖：${currentEnemy.intent || "試探攻擊"}`;
  document.getElementById("battle-log").innerText = currentEnemy.intro;

  const actionsEl = document.getElementById("battle-actions");
  actionsEl.innerHTML = "";

  const actions = [
    { text: "普通攻擊", handler: normalAttack, key: "attack" },
    { text: "武君戰印（12 真元）", handler: powerSkill, key: "skill" },
    { text: "計略觀心（回復真元）", handler: meditate, key: "meditate" },
    { text: "戰場防禦", handler: guardStance, key: "guard" },
    { text: "軍糧丹（恢復 35）", handler: usePotion, key: "potion" },
    { text: "終式・計都斬（怒氣 100）", handler: rageSkill, key: "rage" }
  ];

  actions.forEach(action => {
    const btn = document.createElement("button");
    btn.innerText = action.text;
    btn.dataset.action = action.key;
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
  document.getElementById("enemy-intent").innerText = `敵方意圖：${currentEnemy.intent || "試探攻擊"}`;
  updateStatusUI();
}

function updateBattleButtonsState() {
  if (!battleActive) return;
  const btns = Array.from(document.querySelectorAll("#battle-actions button"));
  btns.forEach(btn => {
    const action = btn.dataset.action;
    btn.disabled =
      (action === "skill" && player.mp < 12) ||
      (action === "rage" && player.rage < 100) ||
      (action === "potion" && player.potions <= 0);
  });
}

function enemyTurn(extraText = "") {
  if (!battleActive || !currentEnemy || currentEnemy.currentHp <= 0) return;

  const baseDmg = currentEnemy.atk + Math.floor(Math.random() * 6);
  const dmg = player.guard ? Math.ceil(baseDmg * 0.5) : baseDmg;
  player.hp = clamp(player.hp - dmg, 0, player.maxHp);

  const guardText = player.guard ? "\n你的防禦架勢減輕了部分傷害。" : "";
  player.guard = false;

  if (player.hp <= 0) {
    battleActive = false;
    updateBattleUI(`${extraText}\n${currentEnemy.name}重創了你，造成 ${dmg} 點傷害。${guardText}\n羅喉倒下了。`);
    document.getElementById("choices").innerHTML = `<button onclick="resetGame()">重新開始</button>`;
    document.getElementById("battle-actions").innerHTML = "";
    addStoryLog(`【戰敗】敗於 ${currentEnemy.name}`);
    setSystemMessage("戰鬥失敗。可讀檔或重新開始。");
    return;
  }

  updateBattleUI(`${extraText}\n${currentEnemy.name}反擊，造成 ${dmg} 點傷害。${guardText}`);
}

function grantBattleReward() {
  if (!currentEnemy || !currentEnemy.reward) return [];

  const rewards = [];
  const reward = currentEnemy.reward;

  if (reward.potions) {
    player.potions = clamp(player.potions + reward.potions, 0, 9);
    rewards.push(`軍糧丹 +${reward.potions}`);
  }
  if (reward.hp) {
    player.hp = clamp(player.hp + reward.hp, 0, player.maxHp);
    rewards.push(`氣血 +${reward.hp}`);
  }
  if (reward.mp) {
    player.mp = clamp(player.mp + reward.mp, 0, player.maxMp);
    rewards.push(`真元 +${reward.mp}`);
  }

  return rewards;
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
  player.victories += 1;

  const rewards = grantBattleReward();
  const rewardText = rewards.length ? `\n戰利品：${rewards.join("、")}` : "";

  updateBattleUI(`${extraText}\n你擊敗了 ${currentEnemy.name}！${rewardText}`);
  document.getElementById("battle-actions").innerHTML = "";
  document.getElementById("choices").innerHTML = `<button onclick="proceedAfterBattle()">繼續前進</button>`;
  addStoryLog(`【勝利】擊敗 ${currentEnemy.name}`);
  autoSave("戰鬥勝利自動存檔。");
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
  enemyTurn(`你運轉心法，回復 ${gain} 點真元，心境更趨澄明。`);
}

function guardStance() {
  player.guard = true;
  player.mp = clamp(player.mp + 4, 0, player.maxMp);
  enemyTurn("你穩住身形，擺出防禦架勢，並趁隙回復少許真元。");
}

function usePotion() {
  if (player.potions <= 0) {
    updateBattleUI("軍糧丹不足。");
    return;
  }
  player.potions -= 1;
  const heal = 35;
  player.hp = clamp(player.hp + heal, 0, player.maxHp);
  enemyTurn(`你迅速吞下軍糧丹，回復 ${heal} 點氣血。`);
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

function serializeGameData() {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player,
    currentNode,
    storyLog,
    audioEnabled
  };
}

function getSaveData() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasSaveData() {
  return !!getSaveData();
}

function formatSaveTime(savedAt) {
  if (!savedAt) return "未知時間";
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "未知時間";
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateContinueButton() {
  const continueBtn = document.getElementById("continue-game-btn");
  if (!continueBtn) return;

  const saveData = getSaveData();
  if (!saveData) {
    continueBtn.classList.add("hidden");
    continueBtn.innerText = "繼續遊戲";
    return;
  }

  continueBtn.classList.remove("hidden");
  continueBtn.innerText = `繼續遊戲（${formatSaveTime(saveData.savedAt)}）`;
}

function autoSave(message = "") {
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGameData()));
  updateContinueButton();
  if (message) setSystemMessage(message);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGameData()));
  updateContinueButton();
  setSystemMessage("進度已儲存。");
}

function loadGame() {
  const data = getSaveData();
  if (!data) {
    setSystemMessage("沒有可讀取的存檔。");
    return;
  }

  player = { ...createNewPlayer(), ...(data.player || {}) };
  currentNode = data.currentNode || "start";
  storyLog = data.storyLog || [];
  audioEnabled = !!data.audioEnabled;
  updateAudioButton();
  renderNode(currentNode);
  setSystemMessage("已讀取存檔。");
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

document.getElementById("story").addEventListener("click", () => {
  finishTypeText();
});

document.getElementById("start-game-btn").addEventListener("click", () => {
  document.getElementById("title-screen").classList.add("hidden");
  document.getElementById("game-app").classList.remove("hidden");
  resetGame();
});

document.getElementById("continue-game-btn").addEventListener("click", () => {
  document.getElementById("title-screen").classList.add("hidden");
  document.getElementById("game-app").classList.remove("hidden");
  if (hasSaveData()) {
    loadGame();
    return;
  }
  resetGame();
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
updateContinueButton();

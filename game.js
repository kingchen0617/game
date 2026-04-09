let player = {
  hp: 100,
  atk: 15
};

let enemy = {
  hp: 50,
  atk: 8
};

function render(node) {
  document.getElementById('battle').classList.add('hidden');
  const data = story[node];
  document.getElementById('story').innerText = data.text;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  data.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.innerText = c.text;
    btn.onclick = () => {
      if (c.next === 'battle1') startBattle();
      else render(c.next);
    };
    choicesDiv.appendChild(btn);
  });
}

function startBattle() {
  document.getElementById('battle').classList.remove('hidden');
  document.getElementById('story').innerText = '戰鬥開始！';
  document.getElementById('choices').innerHTML = '';
}

function attack() {
  enemy.hp -= player.atk;
  if (enemy.hp <= 0) {
    document.getElementById('battle-log').innerText = '你擊敗了敵人！';
    return;
  }

  player.hp -= enemy.atk;
  document.getElementById('battle-log').innerText = `你攻擊敵人，敵人剩餘 ${enemy.hp} HP\n敵人反擊，你剩餘 ${player.hp} HP`;
}

function skill() {
  enemy.hp -= player.atk * 2;
  document.getElementById('battle-log').innerText = '你使用強力技能！';
}

render('start');
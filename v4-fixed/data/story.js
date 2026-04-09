const story = {
  start: {
    chapter: '序章',
    badge: '甦醒',
    text: '你從天都廢墟醒來。',
    unlockMap: ['wasteland'],
    choices: [
      { text: '前往荒原', next: 'explore' }
    ]
  },
  explore: {
    chapter: '探索',
    badge: '自由',
    text: '選擇地圖進行探索。'
  }
};
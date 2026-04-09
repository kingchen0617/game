const mapData = {
  ruin: {
    name: '天都廢墟',
    unlocked: true,
    neighbors: ['wasteland'],
    event: 'start'
  },
  wasteland: {
    name: '邊境荒原',
    unlocked: false,
    neighbors: ['ruin','ghost_city'],
    battle: 'bandit'
  },
  ghost_city: {
    name: '迷城古都',
    unlocked: false,
    neighbors: ['wasteland'],
    battle: 'ghost_scholar'
  }
};
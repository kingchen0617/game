const story = {
  start: {
    chapter: "序章：天都殘火",
    badge: "命運啟程",
    tags: ["甦醒","地圖解鎖"],
    text: "你從天都廢墟中醒來，世界已然改變。你必須踏上探索之路。",
    unlockMap: ["wasteland"],
    choices: [
      { text: "前往荒原", next: "explore" }
    ]
  },
  explore: {
    chapter: "探索",
    badge: "自由行動",
    tags: ["地圖"],
    text: "你可以自由探索已解鎖區域。",
    freeMap: true
  }
};

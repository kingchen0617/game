const story = {
  start: {
    text: "你是羅喉，甦醒於戰火之中。天都已毀，你將如何抉擇？",
    choices: [
      { text: "踏上復仇之路", next: "battle1" },
      { text: "尋找真相", next: "truth" }
    ]
  },
  truth: {
    text: "你發現背後另有陰謀……",
    choices: [
      { text: "面對敵人", next: "battle1" }
    ]
  }
};
const story = {
  start: {
    chapter: "序章：天都殘火",
    badge: "命運啟程",
    tags: ["甦醒", "焦土", "抉擇"],
    text:
`烈焰已滅，餘燼仍熱。
你──武君羅喉──自天都崩毀後再度睜眼。殘城之外，百姓逃竄，舊部失散，江湖只記得一個名字：會讓天下顫慄的霸者。

但你知道，天都之滅並不單純。
今日的第一步，將決定你走向霸道、王道，或真相。`,
    choices: [
      { text: "踏著焦土，立誓清算仇敵", next: "blood_road", effect: { tyrant: 2 } },
      { text: "先救援殘民，重整秩序", next: "refuge", effect: { king: 2 } },
      { text: "追查天都覆滅背後線索", next: "spy_trace", effect: { truth: 2 } }
    ]
  },

  refuge: {
    chapter: "序章：天都殘火",
    badge: "仁與威",
    tags: ["殘民", "秩序"],
    text:
`你命殘兵收攏流民，將糧車分予飢民。
百姓看向你的目光，不再只有恐懼，還多了一絲難以言說的寄望。

只是，遠處戰鼓再響。有人不願看見天都餘火重燃。`,
    choices: [
      { text: "親赴前線，護送百姓離城", next: "battle_wolf", effect: { king: 1 } },
      { text: "命人安置百姓，自己轉向追查敵軍來源", next: "spy_trace", effect: { truth: 1 } }
    ]
  },

  spy_trace: {
    chapter: "序章：天都殘火",
    badge: "暗流",
    tags: ["密探", "陰謀"],
    text:
`你沿著當年殘留的軍令與路線痕跡一路追查，終於在荒道邊擒下一名密探。
對方臨死前吐出一句話：『開城者，不只一人；布局者，也不只一方。』

血戰之路，已然開始。`,
    choices: [
      { text: "逼問餘黨，順藤摸瓜", next: "ghost_city", effect: { truth: 1 } },
      { text: "不再多言，直接斬向前方敵軍", next: "battle_wolf", effect: { tyrant: 1 } }
    ]
  },

  blood_road: {
    chapter: "第一章：血路孤行",
    badge: "刀與火",
    tags: ["復仇", "邊境"],
    text:
`你孤身踏上邊境戰道。
昔日敵軍、地方豪強、掠奪者，都因天都崩毀而群起分食舊土。

他們以為羅喉已死。
現在，你要讓他們知道──武君仍在。`,
    choices: [
      { text: "迎戰攔路大軍", next: "battle_wolf", effect: { tyrant: 1 } },
      { text: "先探敵陣虛實，再出手", next: "ghost_city", effect: { truth: 1 } }
    ]
  },

  battle_wolf: {
    chapter: "第一章：血路孤行",
    badge: "首戰",
    tags: ["血狼將軍", "BOSS"],
    text:
`血狼將軍統率邊軍而來，嘲笑天都只剩亡魂。
你緩緩握緊兵刃，殺氣橫掃荒野。

此戰，是羅喉歸來的第一聲。`,
    battle: "wolf_general",
    winNext: "after_wolf"
  },

  after_wolf: {
    chapter: "第一章：血路孤行",
    badge: "餘震",
    tags: ["初勝", "江湖震動"],
    text:
`血狼將軍倒下後，邊軍四散。
你在其軍帳中搜出一封密令，落款竟指向一座早已荒廢的古城。

有人在那裡等你。`,
    choices: [
      { text: "立刻前往荒城", next: "ghost_city", effect: { truth: 1 } },
      { text: "先整肅周遭勢力，再進古城", next: "ghost_city", effect: { king: 1 } }
    ]
  },

  ghost_city: {
    chapter: "第二章：迷城鬼語",
    badge: "古城",
    tags: ["內應", "密令", "幻局"],
    text:
`古城風沙漫天，斷垣之中仍可見昔日天都戰旗殘片。
你在地窖中找到當年密令副本：有人自內部開門，也有人在外圍故意拖延援軍。

這不是單純戰敗，而是一場被設計好的毀滅。`,
    choices: [
      { text: "焚毀叛徒據點，以血還血", next: "battle_ghost", effect: { tyrant: 2 } },
      { text: "收編殘兵與難民，重建古城秩序", next: "battle_ghost", effect: { king: 2 } },
      { text: "破解密文，追查真正主使", next: "battle_ghost", effect: { truth: 2 } }
    ]
  },

  battle_ghost: {
    chapter: "第二章：迷城鬼語",
    badge: "謀者現身",
    tags: ["鬼智師", "試探"],
    text:
`黑霧漫出地窖，一名披著殘袍的謀士現身。
他自稱鬼智師，曾參與天都滅亡那夜的布局，並笑問你：

『羅喉，你究竟想做王，還是想做魔？』`,
    battle: "ghost_scholar",
    winNext: "inner_trial"
  },

  inner_trial: {
    chapter: "第三章：王與魔",
    badge: "心魔",
    tags: ["幻境", "自我審判"],
    text:
`鬼智師死前施下幻術，你被捲入一場心靈審判。
幻境之中，你看見三個自己：
一者以血統世，
一者以王守民，
一者追索真相至盡頭。

你必須選擇，哪一個才是羅喉真正的道路。`,
    choices: [
      { text: "力量即真理，天下只配臣服", next: "battle_shadow", effect: { tyrant: 2 } },
      { text: "王者當背負眾生與秩序", next: "battle_shadow", effect: { king: 2 } },
      { text: "若無真相，王與魔皆是虛妄", next: "battle_shadow", effect: { truth: 2 } }
    ]
  },

  battle_shadow: {
    chapter: "第三章：王與魔",
    badge: "幻影羅喉",
    tags: ["心魔", "自我"],
    text:
`黑暗中，一道與你相同的身影緩步而出。
那是暴怒、野心、悔恨與執念凝聚而成的幻影羅喉。

若你不能勝過他，你將永遠只是過去的囚徒。`,
    battle: "shadow_luo_hou",
    winNext: "old_oath"
  },

  old_oath: {
    chapter: "第四章：天都舊誓",
    badge: "真相逼近",
    tags: ["舊部", "誓言", "布局者"],
    text:
`你終於與殘存舊部會合，也拼湊出完整真相：
天都並非亡於一場叛變，而是亡於多方勢力共同推動的陷阱。
你的強勢、江湖的懼怕、敵人的野心，全被利用成為摧毀天都的燃料。

如今，幕後黑手黑謀宰已現身。`,
    choices: [
      { text: "以武破局，血債血償", next: "final_battle", effect: { tyrant: 2 } },
      { text: "召集舊部與百姓，建立新天都秩序", next: "final_battle", effect: { king: 2 } },
      { text: "逼黑謀宰說出所有幕後真相", next: "final_battle", effect: { truth: 2 } }
    ]
  },

  final_battle: {
    chapter: "終章：羅喉之道",
    badge: "最後一戰",
    tags: ["黑謀宰", "終局"],
    text:
`黑謀宰站在殘破王座之前，承認他只是其中一枚棋子。
真正讓天都走向毀滅的，是人心、恐懼與無法節制的野望。

但你知道，無論他如何狡辯，今日都必須有人為一切付出代價。`,
    battle: "black_chancellor",
    winNext: "ending"
  },

  ending: {
    chapter: "終章：羅喉之道",
    badge: "命運已定",
    tags: ["結局"],
    ending: true,
    text: ""
  }
};

const enemies = {
  wolf_general: {
    name: "血狼將軍",
    level: 8,
    hp: 110,
    atk: 15,
    intro: "血狼將軍揮舞戰刀，帶著邊軍的血氣殺來。"
  },
  ghost_scholar: {
    name: "鬼智師",
    level: 12,
    hp: 135,
    atk: 18,
    intro: "鬼智師笑聲詭異，擅長以幻術消磨你的意志。"
  },
  shadow_luo_hou: {
    name: "幻影羅喉",
    level: 16,
    hp: 180,
    atk: 24,
    intro: "面對自己的心魔，任何遲疑都會化成致命破綻。"
  },
  black_chancellor: {
    name: "黑謀宰",
    level: 20,
    hp: 240,
    atk: 28,
    intro: "黑謀宰終於現出全力，準備以最後謀局吞噬一切。"
  }
};

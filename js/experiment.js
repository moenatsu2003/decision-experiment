/***************************************
 * experiment.js（完全安定版）
 * 6属性方式 + レビュー列 + 16パターン + 参加者情報＋尺度
 ***************************************/

// ================================
// 0. Google スプレッドシート URL
// ================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycby_o4HDcqstrqBKpbgyq_fYOtRW66c-FDJHO53xs5AvNBIbTqYdZ-TpHDU_1OHIt4MX/exec";

// -------------------------------------------
// 🔥 patternID（1〜16）をページ読み込みごとに自動決定
// -------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
let patternID = Number(urlParams.get("pattern"));

if (!patternID) {
  // ランダムに 1〜16 を割り当てる
  patternID = Math.floor(Math.random() * 16) + 1;

  // URL を pattern=xx に書き換えて再読み込み
  window.location.search = "?pattern=" + patternID;
}

const rand = makeSeededRandom(patternID);

/* ===========================================
   参加者情報入力画面（#app 内だけを書き換える）
=========================================== */

function participantInfoTrial() {
  return new Promise((resolve) => {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div style="max-width:700px;margin:40px auto;font-size:18px;line-height:1.7;">
        <h2>参加者情報の入力</h2>
        <p>以下の項目に回答してください。</p>

        <label>性別：</label><br>
        <select id="gender" style="font-size:18px;">
          <option value="">選択してください</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
          <option value="その他">その他</option>
          <option value="回答しない">回答しない</option>
        </select><br><br>

        <label>年齢：</label><br>
        <input id="age" type="number" min="16" max="80" style="font-size:18px;width:200px;"><br><br>

        <label>学年：</label><br>
        <select id="grade" style="font-size:18px;">
          <option value="">選択してください</option>
          <option value="大学1年">大学1年</option>
          <option value="大学2年">大学2年</option>
          <option value="大学3年">大学3年</option>
          <option value="大学4年">大学4年</option>
          <option value="大学院 修士">大学院 修士</option>
          <option value="大学院 博士">大学院 博士</option>
          <option value="その他">その他</option>
        </select><br><br>

        <label>大学所在地：</label><br>
        <select id="location" style="font-size:18px;width:600px;">
          <option value="">選択してください</option>
          <option value="北海道">北海道</option>
          <option value="東北（青森・岩手・宮城・秋田・山形・福島）">東北（青森・岩手・宮城・秋田・山形・福島）</option>
          <option value="関東（茨城・栃木・群馬・埼玉・千葉・東京・神奈川）">関東（茨城・栃木・群馬・埼玉・千葉・東京・神奈川）</option>
          <option value="中部（新潟・富山・石川・福井・山梨・長野・岐阜・静岡・愛知）">中部（新潟・富山・石川・福井・山梨・長野・岐阜・静岡・愛知）</option>
          <option value="近畿（三重・滋賀・京都・大阪・兵庫・奈良・和歌山）">近畿（三重・滋賀・京都・大阪・兵庫・奈良・和歌山）</option>
          <option value="中国（鳥取・島根・岡山・広島・山口）">中国（鳥取・島根・岡山・広島・山口）</option>
          <option value="四国（徳島・香川・愛媛・高知）">四国（徳島・香川・愛媛・高知）</option>
          <option value="九州・沖縄（福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島・沖縄）">九州・沖縄（福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島・沖縄）</option>
        </select><br><br>

        <label>専攻分野：</label><br>
        <select id="major_field" style="font-size:18px;">
          <option value="">選択してください</option>
          <option value="文系">文系</option>
          <option value="理系">理系</option>
          <option value="その他">その他</option>
        </select><br><br>

        <label>専攻領域：</label><br>
        <select id="major_detail" style="font-size:18px;width:400px;">
          <option value="">選択してください</option>
          <option value="心理学">心理学</option>
          <option value="経済・経営・商学">経済・経営・商学</option>
          <option value="文学・人文系">文学・人文系</option>
          <option value="法学・政治学">法学・政治学</option>
          <option value="教育学">教育学</option>
          <option value="社会学">社会学</option>
          <option value="理学">理学（数学・物理・化学など）</option>
          <option value="工学・情報系">工学・情報系</option>
          <option value="医・薬・看護・保健系">医・薬・看護・保健系</option>
          <option value="農学・生命科学">農学・生命科学</option>
          <option value="その他">その他</option>
        </select><br><br>

        <button id="nextBtn" style="font-size:20px;padding:10px 25px;">次へ</button>
      </div>
    `;

    document.getElementById("nextBtn").onclick = () => {
      const info = {
        gender: document.getElementById("gender").value,
        age: document.getElementById("age").value,
        grade: document.getElementById("grade").value,
        location: document.getElementById("location").value,
        major_field: document.getElementById("major_field").value,
        major_detail: document.getElementById("major_detail").value
      };

      if (Object.values(info).includes("") || info.age === "") {
        alert("すべての項目を入力してください。");
        return;
      }

      // グローバルに保存
      window.participantInfo = info;

      resolve();
    };
  });
}

/* ===========================================
   優柔不断尺度 16項目（#app 内で表示）
=========================================== */

const INDECISIVE_ITEMS = [
  // F1 熟慮
  { id: "F1_1", text: "何かを決めるときには，かなりあれこれ迷うほうだ。" },
  { id: "F1_2", text: "いいなと思うものがあったら，他の選択肢はあまり見ない。" },
  { id: "F1_3", text: "重要なことを決めるとき，些細な問題にこだわり多くの時間を費やす。" },
  { id: "F1_4", text: "些細なことを決めるのでも，自分はとても時間がかかる。" },
  { id: "F1_5", text: "何かを選ぶときは些細なことは気にしない。" },

  // F2 先延ばし
  { id: "F2_1", text: "決断を先送りにしようとする。" },
  { id: "F2_2", text: "どうしても決断が必要になるまで決断しない。" },
  { id: "F2_3", text: "予定を決めるとき，締め切り間際まで決断しない。" },
  { id: "F2_4", text: "重要な問題は，直前まで決定を延ばす。" },

  // F3 他者参照
  { id: "F3_1", text: "他の人が何を選ぶのか気になる。" },
  { id: "F3_2", text: "何かを決めるとき，人の意見を聞こうとする。" },
  { id: "F3_3", text: "自分が選んだものが他の人と違うと不安になる。" },
  { id: "F3_4", text: "何かを決めるとき，人の意見に左右されない。" },

  // F4 不安
  { id: "F4_1", text: "決断した後，その決断に後悔しない。" },
  { id: "F4_2", text: "決めたあとで，間違ってしまったと思うことがよくある。" },
  { id: "F4_3", text: "決断をするとき，自信を持って選ぶことができる。" }
];

const LIKERT_LABELS = [
  "非常にあてはまらない（1）",
  "あまりあてはまらない（2）",
  "どちらとも言えない（3）",
  "ややあてはまる（4）",
  "非常にあてはまる（5）"
];

function indecisivenessScaleTrial() {
  return new Promise((resolve) => {
    const app = document.getElementById("app");

    let html = `
      <div style="max-width:800px;margin:30px auto;font-size:18px;line-height:1.7;">
        <h2>日常の選択行動についての質問</h2>
        <p>
          次の文章について，あなた自身にどの程度あてはまるかをお尋ねします。<br>
          もっとも適切だと思う選択肢を1つ選んでください。
        </p>
        <form id="scaleForm">
    `;

    INDECISIVE_ITEMS.forEach((item, idx) => {
      html += `
        <div style="margin:15px 0;padding:10px;border-bottom:1px solid #ccc;">
          <div style="margin-bottom:8px;">
            <b>Q${idx + 1}.</b> ${item.text}
          </div>
      `;
      LIKERT_LABELS.forEach((label, v) => {
        const value = v + 1; // 1〜5
        const name = item.id;
        const inputId = `${name}_${value}`;
        html += `
          <label for="${inputId}" style="margin-right:12px;">
            <input type="radio" id="${inputId}" name="${name}" value="${value}">
            ${label}
          </label>
        `;
      });
      html += `</div>`;
    });

    html += `
        <div style="text-align:center;margin-top:20px;">
          <button type="submit" style="font-size:20px;padding:10px 30px;">次へ</button>
        </div>
        </form>
      </div>
    `;

    app.innerHTML = html;

    const form = document.getElementById("scaleForm");
    form.onsubmit = (e) => {
      e.preventDefault();

      const answers = {};
      let missing = false;

      INDECISIVE_ITEMS.forEach(item => {
        const checked = document.querySelector(`input[name="${item.id}"]:checked`);
        if (!checked) {
          missing = true;
        } else {
          answers[item.id] = parseInt(checked.value, 10);
        }
      });

      if (missing) {
        alert("すべての質問に回答してください。");
        return;
      }

      // グローバルに保存
      window.indecisivenessScale = answers;

      resolve();
    };
  });
}

/***************************************
 * レビュー割り当てテーブル（固定）
 ***************************************/
const REVIEW_TABLE = {
  laptop: {
    A: 3.3,
    B: 4.8,
    C: 4.5,
    D: 4.1,
    E: 3.7
  },
  apartment: {
    1: 4.8,
    2: 4.4,
    3: 3.3,
    4: 3.6,
    5: 4.2
  },
  company: {
    1: 4.5,
    2: 3.8,
    3: 4.8,
    4: 4.2,
    5: 3.3
  },
  souvenir: {
    1: 4.2,
    2: 4.8,
    3: 3.7,
    4: 4.5,
    5: 3.3
  },
  detergent: {
    A: 4.2,
    B: 4.8,
    C: 3.3,
    D: 4.5,
    E: 3.7
  },
  course: {
  1: 4.7,
  2: 4.0,
  3: 3.6,
  4: 3.2,
  5: 4.3
  }
};

// 数値（例：4.5）を「4.5 (★★★★★)」の形に変換
function formatReviewValue(num) {
  const rounded = Math.round(num * 10) / 10;
  const starsCount = Math.round(rounded);
  const starStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);
  return `${rounded.toFixed(1)} (${starStr})`;
}

// ================================
// 1. シード付き乱数 & パターン
// ================================
function makeSeededRandom(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return function () {
    x = x * 16807 % 2147483647;
    return (x - 1) / 2147483646;
  };
}

// 16パターンのうち、レビュー有無を3ビットで表現
function decodePattern(pattern) {
  const rGroup = ((pattern - 1) % 8);     // 0〜7
  const orderFlag = (pattern > 8 ? 1 : 0); // 0 or 1（今回は未使用だが残しておく）

  const highBit = (rGroup & 1) ? 1 : 0;
  const lowBit  = (rGroup & 2) ? 1 : 0;
  const noneBit = (rGroup & 4) ? 1 : 0;

  return { highBit, lowBit, noneBit, orderFlag };
}

const PAT = decodePattern(patternID);

// シャッフル（シード付き）
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// スプレッドシート送信
function sendToSheet(resultObj) {
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: Math.random().toString(36).slice(2, 10),
      result: resultObj
    })
  }).catch(e => console.error("送信失敗:", e));
}

/***************************************
 * 6課題データ（5属性）ベース
 ***************************************/
const TASKS_BASE = {
    // -------------- 練習課題（必ず先に実施） --------------
  practiceGift: {
  name: "友人へのプレゼント（練習）",
  cost: "practice",   // ★これで記録をスキップできる
  attributes: ["価格","デザイン","使いやすさ","耐久性","サイズ","ブランド"],
  options: [
    ["2000円","良い","ふつう","やや強い","ふつう","一般的"],
    ["1500円","ふつう","良い","ふつう","やや小さい","やや有名"],
    ["2500円","やや良い","やや悪い","強い","やや大きい","やや一般的"],
    ["1800円","悪い","ふつう","弱い","ふつう","無名"],
    ["3000円","良い","良い","やや強い","やや小さい","有名"]
  ],
  labels: ["A","B","C","D","E"]
},


  // 高コスト
  laptop: {
    name: "ノートパソコン",
    cost: "high",
    attributes: ["重さ", "価格", "電源の持ち", "HDD容量（保存容量）", "処理速度"],
    options: [
      ["1.8kg","10万円","10時間","標準","やや速い"],
      ["1.4kg","12万円","8時間","多い","やや遅い"],
      ["1.2kg","4万円","6時間","やや少ない","遅い"],
      ["1.0kg","6万円","4時間","少ない","標準"],
      ["1.6kg","8万円","2時間","やや多い","速い"]
    ],
    labels: ["A","B","C","D","E"]
  },

  apartment: {
    name: "アパート",
    cost: "high",
    attributes: ["日当たり","駅までの距離","周辺の便利さ","家賃","通学時間"],
    options: [
      ["良い","9分","不便","4万円","45分"],
      ["やや良い","3分","ふつう","6万円","60分"],
      ["やや悪い","15分","やや便利","5万円","5分"],
      ["ふつう","12分","便利","7万円","15分"],
      ["悪い","6分","やや不便","3万円","30分"]
    ],
    labels: ["1","2","3","4","5"]
  },

  // 低コスト
  souvenir: {
    name: "お土産（お菓子）",
    cost: "low",
    attributes: ["価格","量","保存期間","味","パッケージ"],
    options: [
      ["800円","少ない","20日","やや美味しい","良い"],
      ["1000円","ふつう","60日","まずい","やや良い"],
      ["600円","多い","14日","ふつう","やや悪い"],
      ["400円","やや多い","30日","ややまずい","悪い"],
      ["1200円","やや少ない","45日","美味しい","ふつう"]
    ],
    labels: ["1","2","3","4","5"]
  },

  detergent: {
    name: "洗剤（食器用）",
    cost: "low",
    attributes: ["手荒れ","知名度","価格","汚れ落ち","量"],
    options: [
      ["ややする","やや高い","100円","ふつう","少ない"],
      ["する","高い","300円","やや悪い","やや多い"],
      ["ふつう","低い","400円","やや良い","多い"],
      ["しない","ふつう","200円","悪い","やや少ない"],
      ["あまりしない","やや低い","500円","良い","ふつう"]
    ],
    labels: ["A","B","C","D","E"]
  },

  // コストなし
  company: {
    name: "就職会社",
    cost: "none",
    attributes: ["業種への興味","平均就業時間","将来性","創業年","初任給"],
    options: [
      ["ふつう","8時間","やや低い","5年","20万"],
      ["低い","10時間","やや高い","20年","27万"],
      ["やや高い","11時間","ふつう","65年","19万"],
      ["やや低い","12時間","高い","50年","21万"],
      ["高い","9時間","低い","35年","24万"]
    ],
    labels: ["1","2","3","4","5"]
  },

    course: {
    name: "大学授業",
    cost: "none",
    attributes: [
      "興味関心",
      "テストの容易さ",
      "授業の分かりやすさ",  // ← ここを変更
      "将来への関連",
      "課題量"
    ],
    options: [
      // 旧） ["やや高い","やや難しい","低い","高い","ふつう"]
      // 新しい「分かりやすさ」軸に変更
      ["やや高い", "やや難しい", "分かりにくい", "高い", "ふつう"],

      // 旧） ["やや低い","ふつう","やや高い","低い","少ない"]
      ["やや低い", "ふつう", "やや分かりやすい", "低い", "少ない"],

      // 旧） ["ふつう","簡単","やや低い","やや高い","多い"]
      ["ふつう", "簡単", "やや分かりにくい", "やや高い", "多い"],

      // 旧） ["高い","難しい","ふつう","やや低い","やや少ない"]
      ["高い", "難しい", "ふつう", "やや低い", "やや少ない"],

      // 旧） ["低い","やや簡単","高い","ふつう","やや多い"]
      ["低い", "やや簡単", "分かりやすい", "ふつう", "やや多い"]
    ],
    labels: ["1","2","3","4","5"]
  }

};

/***************************************
 * 6属性化：レビュー or ダミー属性を付与
 ***************************************/
function buildTasksWithReview() {
  const tasks = JSON.parse(JSON.stringify(TASKS_BASE));

  const highPair = ["laptop","apartment"];
  const lowPair  = ["souvenir","detergent"];
  const nonePair = ["company","course"];

  const selectedHigh = highPair[PAT.highBit];
  const selectedLow  = lowPair[PAT.lowBit];
  const selectedNone = nonePair[PAT.noneBit];

  for (const key of Object.keys(tasks)) {
    const t = tasks[key];

    // ★★★ 練習課題だけはレビュー判定を完全にスキップ ★★★
    if (t.cost === "practice") {
      t.review_present = false;
      // 何も追加しない（6属性のまま）
      continue;
    }

    // ここ以降は本番6課題のみ

    if (key === selectedHigh || key === selectedLow || key === selectedNone) {
      // レビューあり
      t.attributes.push("レビュー評価");
      t.options = t.options.map((row, idx) => {
        const r = row.slice();
        const label = t.labels[idx];
        const score = REVIEW_TABLE[key][label];
        r.push(formatReviewValue(score));
        return r;
      });
      t.review_present = true;

    } else {
      // レビューなし（ダミー属性）
      t.attributes.push("その他情報");
      t.options = t.options.map(row => {
        const r = row.slice();
        r.push("—");
        return r;
      });
      t.review_present = false;
    }
  }

  return tasks;
}

const ALL_TASKS = buildTasksWithReview();

/***************************************
 * 属性順シャッフル
 ***************************************/
function applyAttributeOrder(tasks) {
  for (const key of Object.keys(tasks)) {
    const t = tasks[key];

    const zipped = t.attributes.map((attr, idx) => {
      return { attr, col: t.options.map(row => row[idx]) };
    });

    const shuffled = shuffle(zipped);

    t.attributes = shuffled.map(z => z.attr);

    const newOptions = [];
    for (let r = 0; r < t.options.length; r++) {
      newOptions[r] = [];
      for (let c = 0; c < shuffled.length; c++) {
        newOptions[r][c] = shuffled[c].col[r];
      }
    }
    t.options = newOptions;
  }
  return tasks;
}

const TASKS_ORDERED = applyAttributeOrder(JSON.parse(JSON.stringify(ALL_TASKS)));

// 本番課題だけシャッフル
const MAIN_TASK_KEYS = shuffle(["laptop","apartment","souvenir","detergent","company","course"]);

// 練習課題 → 本番課題 の順に実施
const TASK_KEYS = ["practiceGift", ...MAIN_TASK_KEYS];

/***************************************
 * UIレンダリング＋ログ
 ***************************************/
let currentTaskIndex = 0;
let startTime = 0;
let clickLog = [];
let lastOpenedCell = null;

function renderTask() {
  const key = TASK_KEYS[currentTaskIndex];
  const task = TASKS_ORDERED[key];

  clickLog = [];
  lastOpenedCell = null;
  startTime = performance.now();

  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = task.name;
  title.style.textAlign = "center";
  title.style.margin = "15px";
  app.appendChild(title);

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "120px repeat(6, 120px)";
  grid.style.gap = "0";
  grid.style.margin = "0 auto";
  grid.style.border = "1px solid #ccc";
  grid.style.background = "#ccc";
  grid.style.maxWidth = "900px";
  grid.style.overflowX = "auto";
  app.appendChild(grid);

  function makeCell(text, isHeader) {
    const div = document.createElement("div");
    div.textContent = text;
    div.style.width = "120px";
    div.style.height = "70px";
    div.style.boxSizing = "border-box";
    div.style.border = "1px solid #ccc";
    div.style.fontSize = "13px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.background = isHeader ? "#f0f0f0" : "#fff";
    return div;
  }

  // 1行目：空 + 属性名
  grid.appendChild(makeCell("", true));
  for (let c = 0; c < task.attributes.length; c++) {
    grid.appendChild(makeCell(task.attributes[c], true));
  }

  // 各行：選択肢ラベル + 6属性パネル
  for (let r = 0; r < task.options.length; r++) {
    grid.appendChild(makeCell(task.labels[r], true));

    for (let c = 0; c < task.attributes.length; c++) {
      const cell = makeCell("", false);
      cell.dataset.rowLabel = task.labels[r];
      cell.dataset.attrName = task.attributes[c];
      cell.dataset.value = task.options[r][c];

      cell.onclick = () => {
        if (lastOpenedCell && lastOpenedCell !== cell) {
          lastOpenedCell.textContent = "";
          lastOpenedCell.style.background = "#fff";
        }
        lastOpenedCell = cell;

        const t = Math.round(performance.now() - startTime);
        cell.textContent = cell.dataset.value;
        cell.style.background = "#e6f0ff";

        clickLog.push({
          panel: `${cell.dataset.rowLabel}_${cell.dataset.attrName}`,
          attribute: cell.dataset.attrName,
          value: cell.dataset.value,
          time: t
        });
      };

      grid.appendChild(cell);
    }
  }

  // 決定ボタン
  const decideBtn = document.createElement("button");
  decideBtn.textContent = "決定";
  decideBtn.style.display = "block";
  decideBtn.style.margin = "20px auto";
  decideBtn.style.padding = "8px 20px";
  decideBtn.style.fontSize = "16px";
  app.appendChild(decideBtn);

  const choiceArea = document.createElement("div");
  choiceArea.style.textAlign = "center";
  app.appendChild(choiceArea);

  decideBtn.onclick = () => {
    renderChoiceButtons(task, choiceArea);
  };
}

// 選択肢ボタン部分
function renderChoiceButtons(task, box) {
  box.innerHTML = "";

  const msg = document.createElement("h3");
  msg.textContent = "どの選択肢を選びますか？";
  msg.style.marginTop = "20px";
  box.appendChild(msg);

  const chDiv = document.createElement("div");
  let taskSubmitted = false;

  task.labels.forEach(label => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.margin = "5px";
    b.style.padding = "8px 16px";
    b.style.fontSize = "16px";

    b.onclick = () => {
      if (taskSubmitted) return;
      taskSubmitted = true;
      finishTask(task, label);
      highlightSelected(chDiv, b);
    };

    chDiv.appendChild(b);
  });
  box.appendChild(chDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "次の課題へ進む";
  nextBtn.style.marginTop = "15px";
  nextBtn.style.padding = "8px 20px";
  nextBtn.style.fontSize = "16px";
  nextBtn.onclick = () => {
    currentTaskIndex++;
    if (currentTaskIndex < TASK_KEYS.length) {
      renderTask();
    } else {
      showEnd();
    }
  };
  box.appendChild(nextBtn);
}

function highlightSelected(div, btn) {
  [...div.children].forEach(b => b.style.background = "");
  btn.style.background = "#c8e6c9";
}

// 課題終了 → スプレッドシート送信
// =====================================
// 13. 課題終了 → スプレッドシート送信
// =====================================
function finishTask(task, choice) {
  const endTime = Math.round(performance.now() - startTime);

  // ---- ここを追加：練習課題は記録しない ----
  if (task.cost === "practice") {
    console.log("練習課題のため送信をスキップ");
    return;
  }
  // ------------------------------------------

  // ------ ★ chosen_review_value を計算 ------
  let chosen_review_value = null;

  if (task.review_present) {
    const idx = task.labels.indexOf(choice);
    if (idx >= 0) {
      const reviewIndex = task.attributes.indexOf("レビュー評価");
      if (reviewIndex >= 0) {
        chosen_review_value = task.options[idx][reviewIndex];
      }
    }
  }

  const resultObj = {
    task_name: task.name,
    cost_level: task.cost,
    review_present: task.review_present,
    attributes: task.attributes,
    choice,
    decision_time: endTime,
    click_log: clickLog,
    attribute_order: task.attributes,
    chosen_review_value: chosen_review_value,   // ← 正しい参照
    participant_info: window.participantInfo || null,
    indecisiveness_scale: window.indecisivenessScale || null,
  };

  sendToSheet(resultObj);
}

// 終了画面
function showEnd() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="text-align:center;margin-top:80px;">
      <h2>以上で終了です。ご協力ありがとうございました。</h2>
    </div>
  `;
}

/***************************************
 * 実行エントリポイント
 ***************************************/
async function runExperiment() {
  await participantInfoTrial();
  await indecisivenessScaleTrial();
  currentTaskIndex = 0;
  renderTask();
}

window.addEventListener("load", () => {
  const app = document.getElementById("app");
  if (app) {
    app.textContent = "読み込み中…";
  }
  runExperiment();
});

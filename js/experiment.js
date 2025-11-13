/***************************************
 * experiment.js (Part 1)
 * 6属性方式 + レビュー列位置ランダム化 + 16 URLパターン
 ***************************************/

// ================================
// 0. Google スプレッドシート URL
// ================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyvns6ShmHxZWVgjSDO8FxWby3PtadnwjQy3fKxcCDHS7Kczh4At4n4JO6QghyIUDjn/exec";


// ================================
// 1. Utility: シード付き乱数
// （参加者ごとに乱数を固定したい場合）
// ================================
function makeSeededRandom(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return function() {
    x = x * 16807 % 2147483647;
    return (x - 1) / 2147483646;
  };
}

// URLパラメータから参加者ID（乱数シード）を生成
const urlParams = new URLSearchParams(window.location.search);
const patternID = Number(urlParams.get("pattern") || "1");

// 参加者ID（patternID をそのまま使う：再現性確保）
const rand = makeSeededRandom(patternID);


// ================================
// 2. 評定（レビュー）生成
// ================================

// 高いレビューほど選ばれやすくなるようにしたいので、
// 選択肢差が明確になる 3.4〜4.8 程度の範囲に設定。
function makeReviewScore() {
  const base = 3.4 + rand() * 1.4;  // 3.4〜4.8
  const v = Math.round(base * 10) / 10;  // 小数1桁
  const stars = "★".repeat(Math.round(v)) + "☆".repeat(5 - Math.round(v));
  return `${v.toFixed(1)} (${stars})`;
}

// レビューなし条件ではダミー属性（中立情報）を置く
function makeDummyValue() {
  // 課題間で中立な6属性目として使う
  const list = ["—", "標準", "ふつう", "中程度", "一般的"];
  return list[Math.floor(rand() * list.length)];
}


// ================================
// 3. 16パターン：レビュー有無（3ビット）＋属性順（2パターン）
// ================================
// 各コスト帯の2課題ペア：1つを「レビューあり」にする
// highPair = 0: laptop, 1: apartment
// lowPair  = 0: souvenir, 1: detergent
// nonePair = 0: company, 1: course
//
// 属性順 0=通常, 1=逆順
//
// パターン1〜16 = 8(review組み合わせ) × 2(order)

function decodePattern(pattern) {
  // (1) 1〜16を 1〜8 と 0/1 に分解
  const rGroup = ((pattern - 1) % 8);     // 0〜7
  const orderFlag = (pattern > 8 ? 1 : 0); // 0 or 1

  // (2) 3ビット分解
  const highBit = (rGroup & 1) ? 1 : 0;       // 高コスト: laptop=0 or apartment=1
  const lowBit  = (rGroup & 2) ? 1 : 0;       // 低コスト
  const noneBit = (rGroup & 4) ? 1 : 0;       // コストなし

  return {
    highBit,
    lowBit,
    noneBit,
    orderFlag
  };
}

const PAT = decodePattern(patternID);


// ================================
// 4. 課題の順番：全6課題をランダムシャッフル
// ================================
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


// ================================
// 5. スプレッドシート送信
// ================================
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


// ================================
// 6. ここから Part 2（課題データ）へ続く
// ================================

/***************************************
 * experiment.js (Part 2)
 * 6課題データ：5属性 + レビュー/ダミー（6属性化）
 ***************************************/

// =====================================
// 7. 元の 5 属性データ
// =====================================

const TASKS_BASE = {

  // -------- 高コスト帯 --------
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

  // -------- 低コスト帯 --------
  souvenir: {
    name: "お土産（お菓子）",
    cost: "low",
    attributes: ["価格","量","おすすめ度","味","パッケージ"],
    options: [
      ["800円","少ない","やや低い","やや美味しい","良い"],
      ["1000円","ふつう","高い","まずい","やや良い"],
      ["600円","多い","低い","ふつう","やや悪い"],
      ["400円","やや多い","ふつう","ややまずい","悪い"],
      ["1200円","やや少ない","やや高い","美味しい","ふつう"]
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

  // -------- コストなし --------
  company: {
    name: "就職会社",
    cost: "none",
    attributes: ["業種への興味","平均就業時間","将来性","創業年","初任給"],
    options: [
      ["ふつう","8時間","やや低い","5年","18万"],
      ["低い","10時間","やや高い","20年","27万"],
      ["やや高い","11時間","ふつう","65年","15万"],
      ["やや低い","12時間","高い","50年","21万"],
      ["高い","9時間","低い","35年","24万"]
    ],
    labels: ["1","2","3","4","5"]
  },

  course: {
    name: "大学授業",
    cost: "none",
    attributes: ["興味関心","テストの容易さ","友人の推薦","将来への関連","課題量"],
    options: [
      ["やや高い","やや難しい","低い","高い","ふつう"],
      ["やや低い","ふつう","やや高い","低い","少ない"],
      ["ふつう","簡単","やや低い","やや高い","多い"],
      ["高い","難しい","ふつう","やや低い","やや少ない"],
      ["低い","やや簡単","高い","ふつう","やや多い"]
    ],
    labels: ["1","2","3","4","5"]
  }

};


// =====================================
// 8. 6属性化：レビュー or ダミー属性を付与
//    （PAT.highBit / lowBit / noneBit に従う）
// =====================================

function buildTasksWithReview() {
  const tasks = JSON.parse(JSON.stringify(TASKS_BASE));

  // コスト帯ごとに決定
  const highPair = ["laptop","apartment"];
  const lowPair  = ["souvenir","detergent"];
  const nonePair = ["company","course"];

  const selectedHigh = highPair[PAT.highBit];
  const selectedLow  = lowPair[PAT.lowBit];
  const selectedNone = nonePair[PAT.noneBit];

  // 全課題に対して 6 属性を作る
  for (const key of Object.keys(tasks)) {
    const t = tasks[key];

    // 5属性を複製して6属性目を足す
    if (
      key === selectedHigh ||
      key === selectedLow ||
      key === selectedNone
    ) {
      // ★レビュー属性を追加する
      t.attributes.push("レビュー評価");
      t.options = t.options.map(row => {
        const r = row.slice();
        r.push(makeReviewScore());   // 各選択肢でレビュー評価
        return r;
      });
      t.review_present = true;
    } else {
      // ★ダミー属性を追加
      t.attributes.push("その他情報");  // レビューなし条件の6列目
      t.options = t.options.map(row => {
        const r = row.slice();
        r.push(makeDummyValue());
        return r;
      });
      t.review_present = false;
    }
  }

  return tasks;
}

const ALL_TASKS = buildTasksWithReview();


// Part 3（UIと実行部分）につづく
/***************************************
 * experiment.js (Part 3)
 * UI（6属性×5行のパネル）＋クリックログ＋決定＋送信
 ***************************************/

// =====================================
// 9. 各課題の属性順をシャッフル
// =====================================

function applyAttributeOrder(tasks) {
  for (const key of Object.keys(tasks)) {
    const t = tasks[key];
    const zipped = t.attributes.map((attr, idx) => {
      return { attr, col: t.options.map(row => row[idx]) };
    });

    // ★レビュー属性も含めて毎課題シャッフル
    const shuffled = shuffle(zipped);

    t.attributes = shuffled.map(z => z.attr);

    // options の列順をシャッフル後に再構成
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


// =====================================
// 10. 課題の順番をランダム化
// =====================================
const TASK_KEYS = shuffle(["laptop","apartment","souvenir","detergent","company","course"]);


// =====================================
// 11. UIレンダリングとログ
// =====================================
let currentTaskIndex = 0;
let startTime = 0;
let clickLog = [];
let lastOpened = null;

function renderTask() {
  const key = TASK_KEYS[currentTaskIndex];
  const task = TASKS_ORDERED[key];

  clickLog = [];
  lastOpened = null;
  startTime = performance.now();

  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = task.name;
  title.style.textAlign = "center";
  title.style.margin = "15px";
  app.appendChild(title);

  // === グリッド ===
  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "120px repeat(6, 120px)";  // 7列（ラベル1 + 属性6）
  grid.style.gap = "0";
  grid.style.margin = "0 auto";
  grid.style.border = "1px solid #ccc";
  grid.style.background = "#ccc";
  grid.style.maxWidth = "900px";
  grid.style.overflowX = "auto";

  app.appendChild(grid);

  // セル作成
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

  // === 上段（空 + 属性6列）
  grid.appendChild(makeCell("", true));
  for (let c = 0; c < task.attributes.length; c++) {
    grid.appendChild(makeCell(task.attributes[c], true));
  }

  // === 各行（選択肢ラベル＋6パネル）
  for (let r = 0; r < task.options.length; r++) {
    grid.appendChild(makeCell(task.labels[r], true));

    for (let c = 0; c < task.attributes.length; c++) {
      const cell = makeCell("", false);
      cell.dataset.rowLabel = task.labels[r];
      cell.dataset.attrName = task.attributes[c];
      cell.dataset.value = task.options[r][c];

      cell.onclick = () => {
        if (lastOpened && lastOpened !== cell) {
          lastOpened.textContent = "";
          lastOpened.style.background = "#fff";
        }
        lastOpened = cell;

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

  // === 決定ボタン ===
  const decideBtn = document.createElement("button");
  decideBtn.textContent = "決定";
  decideBtn.style.display = "block";
  decideBtn.style.margin = "20px auto";
  decideBtn.style.padding = "8px 20px";
  decideBtn.style.fontSize = "16px";
  app.appendChild(decideBtn);

  // === 選択肢選択エリア（後から表示）===
  const choiceArea = document.createElement("div");
  choiceArea.style.textAlign = "center";
  app.appendChild(choiceArea);

  decideBtn.onclick = () => {
    renderChoiceButtons(task, choiceArea);
  };
}


// =====================================
// 12. 選択肢ボタン部分
// =====================================
function renderChoiceButtons(task, box) {
  box.innerHTML = "";

  const msg = document.createElement("h3");
  msg.textContent = "どの選択肢を選びますか？";
  msg.style.marginTop = "20px";
  box.appendChild(msg);

  // 選択肢ボタン
  const chDiv = document.createElement("div");
  task.labels.forEach(label => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.margin = "5px";
    b.style.padding = "8px 16px";
    b.style.fontSize = "16px";

    b.onclick = () => {
      finishTask(task, label);
      highlightSelected(chDiv, b);
    };

    chDiv.appendChild(b);
  });
  box.appendChild(chDiv);

  // 次へ進む
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


// =====================================
// 13. 課題終了 → スプレッドシート送信
// =====================================
function finishTask(task, choice) {
  const endTime = Math.round(performance.now() - startTime);

  const resultObj = {
    task_name: task.name,
    cost_level: task.cost,
    review_present: task.review_present,
    attributes: task.attributes,
    choice,
    decision_time: endTime,
    click_log: clickLog,
    attribute_order: task.attributes  // 保存しておく
  };

  sendToSheet(resultObj);
}


// =====================================
// 14. 終了画面
// =====================================
function showEnd() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="text-align:center;margin-top:80px;">
      <h2>以上で終了です。ご協力ありがとうございました。</h2>
    </div>
  `;
}


// =====================================
// 15. 実行
// =====================================
window.onload = () => {
  renderTask();  // 最初の課題
};

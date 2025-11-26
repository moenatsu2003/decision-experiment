/***************************************
 * experiment.js（完全版）
 * 6属性方式 + レビュー列 + 16パターン
 * 導入説明 / 参加者情報 / 尺度 / 練習課題 / 本番6課題 / 終了画面
 ***************************************/

// ================================
// 0. Google スプレッドシート URL
// ================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz2AYuQJU9igRHOX0M6BPlW4dCPqrEjkzIPHC3QFR6Dn1TW60FcaUJZul2Z7-AWAntv/exec";

// 画面共通ヘルパー
function setAppHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

/* ===========================================
   0-1: 実験導入ページ（研究倫理風）
=========================================== */
function showIntroPage() {
  return new Promise((resolve) => {
    setAppHTML(`
      <div style="max-width:720px;margin:24px auto;padding:16px 18px;
                  background:#FFFFFF;border-radius:12px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="margin-top:0;color:#1A73E8;font-size:22px;">
          オンライン実験へのご協力のお願い
        </h2>

        <p>
          本研究は、日常的な選択行動において
          <b>商品情報をどのように利用しているか</b> を調べることを目的としています。
          大学生・大学院生の方を対象とした心理学の卒業研究です。
        </p>

        <h3 style="color:#1A73E8;font-size:19px;">参加について</h3>
        <ul style="padding-left:20px;">
          <li>参加は <b>完全に自由意志</b> に基づくものです。</li>
          <li>途中で画面を閉じることで、いつでも中止することができます。</li>
          <li>中止された場合でも、不利益を被ることは一切ありません。</li>
        </ul>

        <h3 style="color:#1A73E8;font-size:19px;">所要時間と内容</h3>
        <ul style="padding-left:20px;">
          <li>所要時間はおよそ <b>10〜15分程度</b> を予定しています。</li>
          <li>はじめに、属性（性別・年齢など）と日常の意思決定に関する短い質問に回答していただきます。</li>
          <li>その後、いくつかの商品や場面の中から、<b>もっとも魅力的だと思う選択肢を選ぶ課題</b> に取り組んでいただきます。</li>
        </ul>

        <h3 style="color:#1A73E8;font-size:19px;">個人情報とデータの取り扱い</h3>
        <ul style="padding-left:20px;">
          <li>回答データは <b>統計的にまとめてのみ</b> 利用され、個人が特定されることはありません。</li>
          <li>学籍番号・氏名など、個人を特定できる情報は収集しません。</li>
          <li>収集されたデータは、卒業論文および学会発表などの研究目的にのみ使用されます。</li>
        </ul>

        <p style="margin-top:16px;">
          上記の説明をお読みいただき、研究の趣旨をご理解のうえで、
          実験への参加にご同意いただける場合は、下の「同意して進む」ボタンを押してください。
        </p>

        <div style="text-align:center;margin-top:20px;">
          <button id="consentBtn"
                  class="btn-main"
                  style="background:#1A73E8;color:#fff;border-radius:999px;
                         padding:12px 32px;font-size:18px;">
            同意して進む
          </button>
        </div>
      </div>
    `);

    document.getElementById("consentBtn").onclick = () => {
      resolve();
    };
  });
}

/* ===========================================
   1. 参加者情報入力画面
=========================================== */
function participantInfoTrial() {
  return new Promise((resolve) => {
    setAppHTML(`
      <div style="max-width:720px;margin:24px auto;padding:16px 18px;
                  background:#FFFFFF;border-radius:12px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="margin-top:0;color:#1A73E8;font-size:22px;">
          参加者情報の入力
        </h2>
        <p>以下の項目に回答してください。</p>

        <div style="margin-top:12px;">
          <label>性別：</label><br>
          <select id="gender" style="font-size:17px;width:100%;padding:6px;">
            <option value="">選択してください</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他">その他</option>
            <option value="回答しない">回答しない</option>
          </select>
        </div>

        <div style="margin-top:12px;">
          <label>年齢：</label><br>
          <input id="age" type="number" min="16" max="80"
                 style="font-size:17px;width:120px;padding:6px;">
        </div>

        <div style="margin-top:12px;">
          <label>学年：</label><br>
          <select id="grade" style="font-size:17px;width:100%;padding:6px;">
            <option value="">選択してください</option>
            <option value="大学1年">大学1年</option>
            <option value="大学2年">大学2年</option>
            <option value="大学3年">大学3年</option>
            <option value="大学4年">大学4年</option>
            <option value="大学院 修士">大学院 修士</option>
            <option value="大学院 博士">大学院 博士</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div style="margin-top:12px;">
          <label>大学所在地：</label><br>
          <select id="location" style="font-size:17px;width:100%;padding:6px;">
            <option value="">選択してください</option>
            <option value="北海道">北海道</option>
            <option value="東北（青森・岩手・宮城・秋田・山形・福島）">東北（青森・岩手・宮城・秋田・山形・福島）</option>
            <option value="関東（茨城・栃木・群馬・埼玉・千葉・東京・神奈川）">関東（茨城・栃木・群馬・埼玉・千葉・東京・神奈川）</option>
            <option value="中部（新潟・富山・石川・福井・山梨・長野・岐阜・静岡・愛知）">中部（新潟・富山・石川・福井・山梨・長野・岐阜・静岡・愛知）</option>
            <option value="近畿（三重・滋賀・京都・大阪・兵庫・奈良・和歌山）">近畿（三重・滋賀・京都・大阪・兵庫・奈良・和歌山）</option>
            <option value="中国（鳥取・島根・岡山・広島・山口）">中国（鳥取・島根・岡山・広島・山口）</option>
            <option value="四国（徳島・香川・愛媛・高知）">四国（徳島・香川・愛媛・高知）</option>
            <option value="九州・沖縄（福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島・沖縄）">九州・沖縄（福岡・佐賀・長崎・熊本・大分・宮崎・鹿児島・沖縄）</option>
          </select>
        </div>

        <div style="margin-top:12px;">
          <label>専攻分野：</label><br>
          <select id="major_field" style="font-size:17px;width:100%;padding:6px;">
            <option value="">選択してください</option>
            <option value="文系">文系</option>
            <option value="理系">理系</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div style="margin-top:12px;">
          <label>専攻領域：</label><br>
          <select id="major_detail" style="font-size:17px;width:100%;padding:6px;">
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
          </select>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <button id="nextBtn"
                  class="btn-next"
                  style="background:#0B875B;color:#fff;border-radius:999px;
                         padding:10px 28px;font-size:18px;">
            次へ
          </button>
        </div>
      </div>
    `);

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

      window.participantInfo = info;
      resolve();
    };
  });
}

/* ===========================================
   2. 優柔不断尺度 16項目
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
    let html = `
      <div style="max-width:800px;margin:24px auto;padding:16px 18px;
                  background:#FFFFFF;border-radius:12px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="margin-top:0;color:#1A73E8;font-size:22px;">
          日常の選択行動についての質問
        </h2>
        <p>
          次の文章について，あなた自身にどの程度あてはまるかをお尋ねします。<br>
          もっとも適切だと思う選択肢を1つ選んでください。
        </p>
        <form id="scaleForm">
    `;

    INDECISIVE_ITEMS.forEach((item, idx) => {
      html += `
        <div style="margin:14px 0;padding:10px 6px;border-bottom:1px solid #e0e0e0;">
          <div style="margin-bottom:6px;">
            <b>Q${idx + 1}.</b> ${item.text}
          </div>
      `;
      LIKERT_LABELS.forEach((label, v) => {
        const value = v + 1;
        const name = item.id;
        const inputId = `${name}_${value}`;
        html += `
          <label for="${inputId}" style="margin-right:8px;display:inline-block;margin-bottom:4px;">
            <input type="radio" id="${inputId}" name="${name}" value="${value}">
            ${label}
          </label>
        `;
      });
      html += `</div>`;
    });

    html += `
        <div style="text-align:center;margin-top:20px;">
          <button type="submit"
                  class="btn-next"
                  style="background:#0B875B;color:#fff;border-radius:999px;
                         padding:10px 28px;font-size:18px;">
            次へ
          </button>
        </div>
        </form>
      </div>
    `;

    setAppHTML(html);

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

      window.indecisivenessScale = answers;
      resolve();
    };
  });
}

/***************************************
 * 3. レビュー割り当てテーブル（course 含む）
 ***************************************/
const REVIEW_TABLE = {
  laptop:   { A: 3.3, B: 4.8, C: 4.5, D: 4.1, E: 3.7 },
  apartment:{ 1: 4.8, 2: 4.4, 3: 3.3, 4: 3.6, 5: 4.2 },
  company:  { 1: 4.5, 2: 3.8, 3: 4.8, 4: 4.2, 5: 3.3 },
  souvenir: { 1: 4.2, 2: 4.8, 3: 3.7, 4: 4.5, 5: 3.3 },
  detergent:{ A: 4.2, B: 4.8, C: 3.3, D: 4.5, E: 3.7 },
  course:   { 1: 4.4, 2: 3.7, 3: 4.1, 4: 4.8, 5: 3.3 } // ←追加
};

// レビュー値の表示整形
function formatReviewValue(num) {
  const rounded = Math.round(num * 10) / 10;
  const starsCount = Math.round(rounded);
  const starStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);
  return `${rounded.toFixed(1)} (${starStr})`;
}

/***************************************
 * 4. シード付き乱数 & パターン処理
 ***************************************/
function makeSeededRandom(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return function () {
    x = x * 16807 % 2147483647;
    return (x - 1) / 2147483646;
  };
}

const url = new URL(window.location.href);
const urlParams = url.searchParams;

// pattern 指定がなければ 1〜16 からランダムに付与
let patternID = Number(urlParams.get("pattern") || "0");
if (!patternID || patternID < 1 || patternID > 16) {
  patternID = Math.floor(Math.random() * 16) + 1;
  console.log("pattern 未指定のためランダム割当:", patternID);
} else {
  console.log("URL指定 pattern:", patternID);
}

const rand = makeSeededRandom(patternID);

// パターン分解：レビュー有課題の組み合わせ
function decodePattern(pattern) {
  const rGroup = ((pattern - 1) % 8);
  const orderFlag = (pattern > 8 ? 1 : 0); // 今回は未使用だが保持

  const highBit = (rGroup & 1) ? 1 : 0;
  const lowBit  = (rGroup & 2) ? 1 : 0;
  const noneBit = (rGroup & 4) ? 1 : 0;

  return { highBit, lowBit, noneBit, orderFlag };
}
const PAT = decodePattern(patternID);

// シャッフル
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
 * 5. 課題データ（5属性ベース）
 ***************************************/
const TASKS_BASE = {
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
    // 「おすすめ度」を「保存期間」に変更済み
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
    // 「友人の推薦」 → 「授業の分かりやすさ」に変更してレビューと被りにくく
    attributes: ["興味関心","テストの容易さ","授業の分かりやすさ","将来への関連","課題量"],
    options: [
      ["やや高い","やや難しい","分かりにくい","高い","ふつう"],
      ["やや低い","ふつう","やや分かりやすい","低い","少ない"],
      ["ふつう","簡単","やや分かりにくい","やや高い","多い"],
      ["高い","難しい","ふつう","やや低い","やや少ない"],
      ["低い","やや簡単","分かりやすい","ふつう","やや多い"]
    ],
    labels: ["1","2","3","4","5"]
  }
};

/***************************************
 * 6. 練習課題データ（保存しない / 6属性）
 ***************************************/
const PRACTICE_TASK = {
  name: "友人へのプレゼント（練習）",
  attributes: ["知名度","価格","入手困難さ","実用性","趣味の合致","デザイン"],
  options: [
    ["高い","500円","低い","高い","合う","シンプル"],
    ["やや高い","1000円","やや低い","やや高い","やや合う","かわいい"],
    ["ふつう","1500円","ふつう","ふつう","ふつう","おしゃれ"],
    ["やや低い","2000円","やや高い","やや低い","やや合わない","個性的"],
    ["低い","2500円","高い","低い","合わない","派手"]
  ],
  labels: ["A","B","C","D","E"]
};

/***************************************
 * 7. 6属性化：レビュー or ダミー属性付与
 ***************************************/
function buildTasksWithReview() {
  const tasks = JSON.parse(JSON.stringify(TASKS_BASE));

  const highPair = ["laptop", "apartment"];
  const lowPair  = ["souvenir", "detergent"];
  const nonePair = ["company", "course"];

  const selectedHigh = highPair[PAT.highBit];
  const selectedLow  = lowPair[PAT.lowBit];
  const selectedNone = nonePair[PAT.noneBit];

  for (const key of Object.keys(tasks)) {
    const t = tasks[key];

    // レビューあり課題
    if (key === selectedHigh || key === selectedLow || key === selectedNone) {
      t.attributes.push("レビュー評価");
      t.options = t.options.map((row, idx) => {
        const r = row.slice();
        const label = t.labels[idx];
        const score = REVIEW_TABLE[key][label];
        r.push(formatReviewValue(score));
        return r;
      });
      t.review_present = true;

    // レビューなし課題
    } else {
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
 * 8. 属性順シャッフル
 ***************************************/
function applyAttributeOrder(tasks) {
  for (const key of Object.keys(tasks)) {
    const t = tasks[key];

    const zipped = t.attributes.map((attr, idx) => ({
      attr,
      col: t.options.map(row => row[idx])
    }));

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
const TASK_KEYS = shuffle(["laptop","apartment","souvenir","detergent","company","course"]);

/***************************************
 * 9. 共通 UI（本番課題＋ログ）
 ***************************************/
let currentTaskIndex = 0;
let startTime = 0;
let clickLog = [];
let lastOpenedCell = null;

function createGridCell(text, isHeader) {
  const div = document.createElement("div");
  div.textContent = text;
  div.style.width = "120px";
  div.style.height = "70px";
  div.style.boxSizing = "border-box";
  div.style.border = "1px solid #ddd";
  div.style.fontSize = "13px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.background = isHeader ? "#E8F1FD" : "#fff";
  return div;
}

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
  title.style.margin = "12px 0 8px";
  title.style.color = "#1A73E8";
  app.appendChild(title);

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "90px repeat(6, 110px)";
  grid.style.gap = "0";
  grid.style.margin = "0 auto";
  grid.style.border = "1px solid #ccc";
  grid.style.background = "#ccc";
  grid.style.maxWidth = "780px";
  grid.style.overflowX = "auto";
  app.appendChild(grid);

  // 1行目：空 + 属性名
  grid.appendChild(createGridCell("", true));
  for (let c = 0; c < task.attributes.length; c++) {
    grid.appendChild(createGridCell(task.attributes[c], true));
  }

  // 各行：行ラベル + パネル
  for (let r = 0; r < task.options.length; r++) {
    grid.appendChild(createGridCell(task.labels[r], true));

    for (let c = 0; c < task.attributes.length; c++) {
      const cell = createGridCell("", false);
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
        cell.style.background = "#FFF8E1";

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

  const decideBtn = document.createElement("button");
  decideBtn.textContent = "決定";
  decideBtn.className = "btn-next";
  decideBtn.style.display = "block";
  decideBtn.style.margin = "16px auto 8px";
  decideBtn.style.background = "#0B875B";
  decideBtn.style.color = "#fff";
  decideBtn.style.borderRadius = "999px";
  decideBtn.style.padding = "8px 24px";
  decideBtn.style.fontSize = "16px";
  app.appendChild(decideBtn);

  const choiceArea = document.createElement("div");
  choiceArea.style.textAlign = "center";
  app.appendChild(choiceArea);

  decideBtn.onclick = () => {
    renderChoiceButtons(task, choiceArea);
  };
}

function renderChoiceButtons(task, box) {
  box.innerHTML = "";

  const msg = document.createElement("h3");
  msg.textContent = "どの選択肢を選びますか？";
  msg.style.marginTop = "10px";
  msg.style.color = "#333";
  box.appendChild(msg);

  const chDiv = document.createElement("div");
  chDiv.style.marginTop = "6px";
  let taskSubmitted = false;

  task.labels.forEach(label => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.margin = "4px";
    b.style.padding = "8px 14px";
    b.style.fontSize = "16px";
    b.style.borderRadius = "999px";
    b.style.border = "1px solid #1A73E8";
    b.style.background = "#fff";

    b.onclick = () => {
      if (taskSubmitted) return;
      taskSubmitted = true;
      finishTask(task, label);
      [...chDiv.children].forEach(btn => btn.style.background = "#fff");
      b.style.background = "#C8E6C9";
    };

    chDiv.appendChild(b);
  });
  box.appendChild(chDiv);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "次の課題へ進む";
  nextBtn.className = "btn-main";
  nextBtn.style.marginTop = "14px";
  nextBtn.style.background = "#1A73E8";
  nextBtn.style.color = "#fff";
  nextBtn.style.borderRadius = "999px";
  nextBtn.style.padding = "8px 22px";
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

// 課題終了 → スプレッドシート送信
function finishTask(task, choice) {
  const endTime = Math.round(performance.now() - startTime);

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
    chosen_review_value: chosen_review_value,
    participant_info: window.participantInfo || null,
    indecisiveness_scale: window.indecisivenessScale || null,
    pattern_id: patternID
  };

  sendToSheet(resultObj);
}

/***************************************
 * 10. 練習課題用 UI（保存しない）
 ***************************************/
function showPracticeIntro() {
  return new Promise((resolve) => {
    setAppHTML(`
      <div style="max-width:720px;margin:24px auto;padding:16px 18px;
                  background:#FFFFFF;border-radius:12px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="margin-top:0;color:#1A73E8;font-size:22px;">
          練習課題の説明
        </h2>
        <p>
          これから、本番と同じ形式の <b>練習用の課題</b> を1問行っていただきます。<br>
          画面には、行（A〜E）と、いくつかの属性の列からなる表が表示されます。
        </p>
        <ul style="padding-left:20px;">
          <li>各マスをタップすると、そのマスの情報が表示されます。</li>
          <li>新しいマスをタップすると、前に開いていたマスの表示は消えます。</li>
          <li>十分に確認したら、「決定」ボタンを押して、もっとも良いと思う選択肢を選んでください。</li>
        </ul>
        <p>
          練習課題の結果は、本研究の分析には使用しません。<br>
          操作方法に慣れるために、気軽にお答えください。
        </p>
        <div style="text-align:center;margin-top:18px;">
          <button id="practiceIntroNext"
                  class="btn-main"
                  style="background:#1A73E8;color:#fff;border-radius:999px;
                         padding:10px 28px;font-size:18px;">
            練習課題を始める
          </button>
        </div>
      </div>
    `);

    document.getElementById("practiceIntroNext").onclick = () => resolve();
  });
}

function practiceTaskTrial() {
  return new Promise((resolve) => {
    clickLog = [];
    lastOpenedCell = null;
    startTime = performance.now();

    const task = PRACTICE_TASK;
    const app = document.getElementById("app");
    app.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = task.name;
    title.style.textAlign = "center";
    title.style.margin = "12px 0 8px";
    title.style.color = "#1A73E8";
    app.appendChild(title);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "90px repeat(6, 110px)";
    grid.style.gap = "0";
    grid.style.margin = "0 auto";
    grid.style.border = "1px solid #ccc";
    grid.style.background = "#ccc";
    grid.style.maxWidth = "780px";
    grid.style.overflowX = "auto";
    app.appendChild(grid);

    grid.appendChild(createGridCell("", true));
    for (let c = 0; c < task.attributes.length; c++) {
      grid.appendChild(createGridCell(task.attributes[c], true));
    }

    for (let r = 0; r < task.options.length; r++) {
      grid.appendChild(createGridCell(task.labels[r], true));

      for (let c = 0; c < task.attributes.length; c++) {
        const cell = createGridCell("", false);
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
          cell.style.background = "#FFF8E1";

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

    const decideBtn = document.createElement("button");
    decideBtn.textContent = "決定";
    decideBtn.className = "btn-next";
    decideBtn.style.display = "block";
    decideBtn.style.margin = "16px auto 8px";
    decideBtn.style.background = "#0B875B";
    decideBtn.style.color = "#fff";
    decideBtn.style.borderRadius = "999px";
    decideBtn.style.padding = "8px 24px";
    decideBtn.style.fontSize = "16px";
    app.appendChild(decideBtn);

    const choiceArea = document.createElement("div");
    choiceArea.style.textAlign = "center";
    app.appendChild(choiceArea);

    decideBtn.onclick = () => {
      choiceArea.innerHTML = "";

      const msg = document.createElement("h3");
      msg.textContent = "どの選択肢を選びますか？（練習）";
      msg.style.marginTop = "10px";
      choiceArea.appendChild(msg);

      const chDiv = document.createElement("div");
      chDiv.style.marginTop = "6px";

      task.labels.forEach(label => {
        const b = document.createElement("button");
        b.textContent = label;
        b.style.margin = "4px";
        b.style.padding = "8px 14px";
        b.style.fontSize = "16px";
        b.style.borderRadius = "999px";
        b.style.border = "1px solid #1A73E8";
        b.style.background = "#fff";

        b.onclick = () => {
          [...chDiv.children].forEach(btn => btn.style.background = "#fff");
          b.style.background = "#C8E6C9";
        };

        chDiv.appendChild(b);
      });
      choiceArea.appendChild(chDiv);

      const nextBtn = document.createElement("button");
      nextBtn.textContent = "本番課題へ進む";
      nextBtn.className = "btn-main";
      nextBtn.style.marginTop = "14px";
      nextBtn.style.background = "#1A73E8";
      nextBtn.style.color = "#fff";
      nextBtn.style.borderRadius = "999px";
      nextBtn.style.padding = "8px 22px";
      nextBtn.style.fontSize = "16px";
      nextBtn.onclick = () => resolve();
      choiceArea.appendChild(nextBtn);
    };
  });
}

/***************************************
 * 11. 本番課題の前説明
 ***************************************/
function showMainIntro() {
  return new Promise((resolve) => {
    setAppHTML(`
      <div style="max-width:720px;margin:24px auto;padding:16px 18px;
                  background:#FFFFFF;border-radius:12px;
                  box-shadow:0 2px 6px rgba(0,0,0,0.08);">
        <h2 style="margin-top:0;color:#1A73E8;font-size:22px;">
          本番課題の説明
        </h2>
        <p>
          これから、本番の<b>6つの選択課題</b>に取り組んでいただきます。<br>
          練習課題と同様に、各マスをタップすると、そのマスの情報が表示されます。
        </p>
        <ul style="padding-left:20px;">
          <li>各課題ごとに、もっとも良いと思う選択肢を1つ選んでください。</li>
          <li>「決定」ボタンを押したあと、選択肢（A〜E または 1〜5）の中から1つを選び、「次の課題へ進む」を押してください。</li>
          <li>直感的にお答えいただいてかまいませんが、実際にその場面に直面したつもりでお考えください。</li>
        </ul>
        <p>
          それでは、本番課題を開始します。
        </p>
        <div style="text-align:center;margin-top:18px;">
          <button id="mainIntroNext"
                  class="btn-main"
                  style="background:#1A73E8;color:#fff;border-radius:999px;
                         padding:10px 28px;font-size:18px;">
            本番課題を始める
          </button>
        </div>
      </div>
    `);

    document.getElementById("mainIntroNext").onclick = () => resolve();
  });
}

/***************************************
 * 12. 終了画面（倫理文書風）
 ***************************************/
function showEnd() {
  setAppHTML(`
    <div style="max-width:720px;margin:24px auto;padding:16px 18px;
                background:#FFFFFF;border-radius:12px;
                box-shadow:0 2px 6px rgba(0,0,0,0.08);text-align:left;">
      <h2 style="margin-top:0;color:#1A73E8;font-size:22px;text-align:center;">
        実験は以上です
      </h2>
      <p>
        すべての課題が終了しました。<br>
        ご協力ありがとうございました。
      </p>
      <p>
        みなさまにご回答いただいたデータは、匿名化されたうえで集計され、
        卒業論文および学術的な発表のためにのみ使用されます。
        個人が特定されるかたちで公表されることはありません。
      </p>
      <p>
        もし本研究の内容やデータの取り扱いについてご質問がある場合は、
        担当者（指導教員または学生）までお問い合わせください。
      </p>
      <p>
        あらためて、本研究にご協力いただきましたことに深く感謝申し上げます。
      </p>
      <div style="text-align:center;margin-top:18px;color:#666;font-size:14px;">
        画面を閉じて終了してください。
      </div>
    </div>
  `);
}

/***************************************
 * 13. 実行エントリポイント
 ***************************************/
async function runExperiment() {
  await showIntroPage();          // 倫理説明＋同意
  await participantInfoTrial();   // 参加者情報
  await indecisivenessScaleTrial(); // 優柔不断尺度
  await showPracticeIntro();      // 練習課題説明
  await practiceTaskTrial();      // 練習課題（保存なし）
  await showMainIntro();          // 本番課題説明
  currentTaskIndex = 0;
  renderTask();                   // 本番6課題開始
}

window.addEventListener("load", () => {
  const app = document.getElementById("app");
  if (app) {
    app.textContent = "読み込み中…";
  }
  runExperiment();
});

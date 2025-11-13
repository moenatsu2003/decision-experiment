/***** 0) Google スプレッドシート WebアプリURL（差し替え必須） *****/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyvns6ShmHxZWVgjSDO8FxWby3PtadnwjQy3fKxcCDHS7Kczh4At4n4JO6QghyIUDjn/exec";

/***** 1) URLパラメータ：16パターン、被験者ID、動作モード *****
  ?pattern=1..16      → 1..8: 通常順 / 9..16: 逆順（reviewは各8通り）
  ?pid=任意           → 参加者ID兼シード（順序再現用）
  ?one=1              → 1課題だけ動作確認モード（任意）
**************************************************************/
const params = new URLSearchParams(location.search);
const PATTERN = Math.max(1, Math.min(16, Number(params.get("pattern") || "1")));
const PARTICIPANT_ID = params.get("pid") || Math.random().toString(36).slice(2, 10);
const ONE_TASK_MODE = params.get("one") === "1";

/***** 2) 乱数（pidベースの再現性あるシャッフル用） *****/
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const seedInt = [...PARTICIPANT_ID].reduce((s,c)=> (s*31 + c.charCodeAt(0))|0, 0x9e3779b1);
const rand = mulberry32(seedInt);
function shuffleStable(arr){return arr.map(x=>({x,r:rand()})).sort((a,b)=>a.r-b.r).map(o=>o.x);}

/***** 3) レビュー8パターン×属性順2の16パターン割当 *****
  pattern 1..8  : reviewBits = [high, low, none], order=通常
  pattern 9..16 : reviewBits = [high, low, none], order=逆順
**************************************************************/
const mapReviewBits = {
  1:[1,1,1], 2:[1,1,0], 3:[1,0,1], 4:[1,0,0],
  5:[0,1,1], 6:[0,1,0], 7:[0,0,1], 8:[0,0,0],
};
const REVIEW_BITS = mapReviewBits[((PATTERN-1)%8)+1];
const ORDER_REVERSED = PATTERN > 8;

/***** 4) 刺激（6課題） *****/
const STIMULI_BASE = {
  "ノートパソコン": {
    cost:"high", kind:"A-E",
    attributes:["重さ","価格","電源の持ち","HDD容量（保存容量）","処理速度"],
    options:[
      ["1.8kg","10万円","10時間","標準","やや速い"],
      ["1.4kg","12万円","8時間","多い","やや遅い"],
      ["1.2kg","4万円","6時間","やや少ない","遅い"],
      ["1.0kg","6万円","4時間","少ない","標準"],
      ["1.6kg","8万円","2時間","やや多い","速い"]
    ],
  },
  "アパート": {
    cost:"high", kind:"1-5",
    attributes:["日当たり","駅までの距離","周辺の便利さ","家賃","通学にかかる時間"],
    options:[
      ["良い","9分","不便","4万円","45分"],
      ["やや良い","3分","ふつう","6万円","60分"],
      ["やや悪い","15分","やや便利","5万円","5分"],
      ["ふつう","12分","便利","7万円","15分"],
      ["悪い","6分","やや不便","3万円","30分"]
    ],
  },
  "会社": {
    cost:"none", kind:"1-5",
    attributes:["業種への興味","平均就業時間","将来性","創業年","初任給"],
    options:[
      ["ふつう","8時間","やや低い","5年","18万"],
      ["低い","10時間","やや高い","20年","27万"],
      ["やや高い","11時間","ふつう","65年","15万"],
      ["やや低い","12時間","高い","50年","21万"],
      ["高い","9時間","低い","35年","24万"]
    ],
  },
  "大学授業": {
    cost:"none", kind:"1-5",
    attributes:["興味関心","テストの容易さ","友人の推薦","将来への関連","課題の量"],
    options:[
      ["やや高い","やや難しい","低い","高い","ふつう"],
      ["やや低い","ふつう","やや高い","低い","少ない"],
      ["ふつう","簡単","やや低い","やや高い","多い"],
      ["高い","難しい","ふつう","やや低い","やや少ない"],
      ["低い","やや簡単","高い","ふつう","やや多い"]
    ],
  },
  "お土産（お菓子）": {
    cost:"low", kind:"1-5",
    attributes:["価格","量","おすすめ度","味","パッケージの良さ"],
    options:[
      ["800円","少ない","やや低い","やや美味しい","良い"],
      ["1000円","ふつう","高い","まずい","やや良い"],
      ["600円","多い","低い","ふつう","やや悪い"],
      ["400円","やや多い","ふつう","ややまずい","悪い"],
      ["1200円","やや少ない","やや高い","美味しい","ふつう"]
    ],
  },
  "洗剤（食器用）": {
    cost:"low", kind:"A-E",
    attributes:["手荒れ","知名度","価格","汚れ落ち","量"],
    options:[
      ["ややする","やや高い","100円","ふつう","少ない"],
      ["する","高い","300円","やや悪い","やや多い"],
      ["ふつう","低い","400円","やや良い","多い"],
      ["しない","ふつう","200円","悪い","やや少ない"],
      ["あまりしない","やや低い","500円","良い","ふつう"]
    ],
  },
};
const TASK_NAMES = Object.keys(STIMULI_BASE);

/***** 5) コスト帯ペア（レビュー付与先を決めるため） *****/
const PAIRS = {
  high: ["ノートパソコン","アパート"],
  low:  ["お土産（お菓子）","洗剤（食器用）"],
  none: ["会社","大学授業"],
};

/***** 6) レビュー列の付与（5番目の属性をレビュー評価に置換） *****/
function makeReviewStars(){
  const vals = [3.6, 3.8, 4.0, 4.2, 4.4, 4.6];
  const v = vals[Math.floor(rand() * vals.length)];
  const stars = "★".repeat(Math.round(v)) + "☆".repeat(5 - Math.round(v));
  return `${v.toFixed(1)} (${stars})`;
}

function applyReviewColumns(stimuli, bits){
  const which = { high: bits[0]?0:1, low: bits[1]?0:1, none: bits[2]?0:1 };
  const res = JSON.parse(JSON.stringify(stimuli));

  for (const band of ["high","low","none"]) {
    const [a,b] = PAIRS[band];
    const reviewed = [a,b][which[band]];
    const s = res[reviewed];
    if (s) {
      // 5番目の属性をレビュー評価に置き換える
      s.attributes[4] = "レビュー評価";
      s.options = s.options.map(row => {
        const newRow = row.slice();
        newRow[4] = makeReviewStars(); // 5番目のみ置換
        return newRow;
      });
    }
  }
  return res;
}

/***** 7) 属性順の反転 *****/
function maybeReverseAttributes(stimuli, reversed){
  if(!reversed) return stimuli;
  const res = JSON.parse(JSON.stringify(stimuli));
  for(const name of Object.keys(res)){
    res[name].attributes.reverse();
    res[name].options = res[name].options.map(r => r.slice().reverse());
  }
  return res;
}

/***** 8) 課題順（被験者単位でランダム） *****/
function buildTaskOrder(){
  const order = shuffleStable([...TASK_NAMES]);
  return ONE_TASK_MODE ? [order[0]] : order;
}

/***** 9) 36パネルUI（左列=選択肢名、上段=属性名、中央25マスがクリック表示） *****/
const app = document.getElementById("app");
let STIMULI_USE = null;
let taskOrder = [];
let trialIndex = 0;

let startTime = 0;
let decisionTime = null;
let click_log = [];
let lastOpened = null;
let selectedChoice = null;
let choiceAreaVisible = false;

function boot(){
  // 刺激へレビュー列付与→属性順反転を適用
  const withReview = applyReviewColumns(STIMULI_BASE, REVIEW_BITS);
  STIMULI_USE = maybeReverseAttributes(withReview, ORDER_REVERSED);
  taskOrder = buildTaskOrder();
  trialIndex = 0;
  renderTrial();
}

function renderTrial(){
  if(trialIndex >= taskOrder.length) return renderFinish();

  const taskName = taskOrder[trialIndex];
  const stim = STIMULI_USE[taskName];
  const rowLabels = (stim.kind==="A-E") ? ["A","B","C","D","E"] : ["1","2","3","4","5"];

  // 状態初期化
  startTime = performance.now();
  decisionTime = null;
  click_log = [];
  lastOpened = null;
  selectedChoice = null;
  choiceAreaVisible = false;

  // 画面
  app.innerHTML = `
    <div style="text-align:center;margin:20px;">
      <h2 style="margin-bottom:6px;">${taskName}</h2>
      <div style="color:#666;margin-bottom:4px;">課題 ${trialIndex+1} / ${taskOrder.length}　PID: ${PARTICIPANT_ID}　pattern:${PATTERN}（ord=${ORDER_REVERSED?1:0}）</div>

      <div id="grid"
           style="
             display:grid;
             grid-template-columns: 120px repeat(5, 120px);
             gap:0;
             border:1px solid #ccc;
             max-width:750px;
             margin:10px auto;
             background:#ccc;
           ">
      </div>

      <button id="decideBtn"
              style="margin-top:20px;padding:8px 20px;font-size:16px;">決定</button>

      <div id="choiceArea"></div>
    </div>
  `;

  const grid = document.getElementById("grid");

  // 上段：空 + 属性
  grid.appendChild(makeCell("", true));
  for(let c=0;c<stim.attributes.length;c++){
    grid.appendChild(makeCell(stim.attributes[c], true));
  }

  // 各行：選択肢名 + クリックパネル
  for(let r=0;r<rowLabels.length;r++){
    grid.appendChild(makeCell(rowLabels[r], true));
    for(let c=0;c<stim.attributes.length;c++){
      const panel = makeCell("", false);
      panel.dataset.row = rowLabels[r];
      panel.dataset.attr = stim.attributes[c];
      panel.dataset.value = stim.options[r][c];
      panel.onclick = ()=> onPanelClick(panel);
      grid.appendChild(panel);
    }
  }

  document.getElementById("decideBtn").onclick = ()=> showChoiceButtons(stim, rowLabels);
}

function makeCell(text, isStatic){
  const cell = document.createElement("div");
  cell.textContent = text;
  cell.style.cssText = `
    background:${isStatic ? "#f0f0f0" : "#fff"};
    border:1px solid #ccc;
    font-size:13px;
    line-height:1.2;
    display:flex;
    align-items:center;
    justify-content:center;
    width:120px;
    height:70px;
    text-align:center;
    box-sizing:border-box;
    cursor:${isStatic ? "default" : "pointer"};
    user-select:none;
  `;
  return cell;
}

function onPanelClick(panel){
  // 直前の表示を消去
  if(lastOpened && lastOpened!==panel){
    lastOpened.textContent = "";
    lastOpened.style.background = "#fff";
  }
  lastOpened = panel;

  // 表示
  panel.textContent = panel.dataset.value;
  panel.style.background = "#e6f0ff";

  // ログ
  const t = Math.round(performance.now() - startTime);
  click_log.push({
    panel: `${panel.dataset.row}_${panel.dataset.attr}`,
    attribute: panel.dataset.attr,
    value: panel.dataset.value,
    time: t
  });
}

function showChoiceButtons(stim, rowLabels){
  if(choiceAreaVisible) return;
  choiceAreaVisible = true;
  decisionTime = Math.round(performance.now() - startTime); // 課題提示→決定ボタンまで

  const area = document.getElementById("choiceArea");
  area.innerHTML = `
    <div style="margin-top:20px;">
      <h3 style="margin-bottom:10px;">どの選択肢を選びますか？</h3>
      <div id="choices" style="margin-bottom:15px;">
        ${rowLabels.map(r =>
          `<button class="choiceBtn" data-row="${r}"
             style="margin:4px;padding:8px 16px;font-size:16px;">${r}</button>`
        ).join("")}
      </div>
      <button id="nextBtn" style="padding:8px 20px;font-size:16px;">次の課題へ進む</button>
    </div>
  `;

  document.querySelectorAll(".choiceBtn").forEach(btn=>{
    btn.onclick = ()=>{
      selectedChoice = btn.dataset.row;
      sendTrial(stim, selectedChoice, decisionTime);
      // 見た目
      document.querySelectorAll(".choiceBtn").forEach(b=> b.style.background="");
      btn.style.background = "#c8e6c9";
    };
  });

  document.getElementById("nextBtn").onclick = ()=>{
    if(!selectedChoice){
      alert("選択肢を選んでから次へ進んでください。");
      return;
    }
    trialIndex += 1;
    renderTrial();
  };
}

/***** 10) この課題にレビュー列が付いているか *****/
function hasReview(taskName){
  const stim = STIMULI_USE[taskName];
  return stim && stim.attributes.includes("レビュー評価");
}

/***** 11) 送信 *****/
function sendTrial(stim, choice, decisionTimeMs){
  const taskName = taskOrder[trialIndex];
  const payload = {
    task_name: taskName,
    cost_level: stim.cost,
    review_presence: hasReview(taskName) ? "yes" : "no",
    choice,
    time: decisionTimeMs,       // 課題提示→決定ボタンまで
    click_log,                  // パネル閲覧の時系列ログ
    _meta: {
      pid: PARTICIPANT_ID,
      pattern: PATTERN,
      ord: ORDER_REVERSED ? 1 : 0,
      trial_index: trialIndex+1,
      total_trials: taskOrder.length
    }
  };

  fetch(SHEET_URL, {
    method:"POST", mode:"no-cors",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ id: PARTICIPANT_ID, result: payload })
  })
  .then(()=> console.log("✅送信:", payload))
  .catch(err=> console.error("❌送信失敗:", err));
}

/***** 12) 全終了 *****/
function renderFinish(){
  app.innerHTML = `
    <div style="text-align:center;margin-top:80px;">
      <h2>終了しました。ご協力ありがとうございました。</h2>
      <div style="color:#666;margin-top:6px;">
        PID: ${PARTICIPANT_ID} / pattern: ${PATTERN}（ord=${ORDER_REVERSED?1:0}）
      </div>
    </div>
  `;
}

/***** 13) 起動 *****/
boot();

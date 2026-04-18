const langSelect = document.getElementById("langSelect");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const manualArea = document.getElementById("manualArea");
const resultBox = document.getElementById("result");

const appTitle = document.getElementById("appTitle");
const languageLabel = document.getElementById("languageLabel");
const photoTitle = document.getElementById("photoTitle");
const manualTitle = document.getElementById("manualTitle");
const manualDescription = document.getElementById("manualDescription");
const fileLabel = document.getElementById("fileLabel");
const fileStatus = document.getElementById("fileStatus");

let currentLang = "ja";
let featuresData = [];
let currentImageBase64 = "";
let currentMimeType = "";

const uiText = {
  ja: {
    appTitle: "🐱 猫の気持ちアプリ",
    languageLabel: "言語",
    photoTitle: "写真でみる",
    manualTitle: "手動でえらぶ",
    manualDescription: "見える部分だけ選べばOK",
    fileLabel: "ファイルを選択",
    fileNone: "ファイル未選択",
    chooseOne: "選ばなくてもOK",
    analyze: "判定する",
    aiAnalyze: "AIで写真をみる",
    aiLoading: "AIが写真を見ています…",
    aiDone: "AI候補を入れました。必要なら手で直してから判定してください。",
    selectedFeatures: "選んだ特徴",
    stateTitle: "状態",
    emotionTitle: "気持ち",
    vibeTitle: "雰囲気",
    catLineTitle: "猫のひとこと",
    whyTitle: "なぜこの判定？",
    citationTitle: "出典 / Sources",
    noImage: "先に写真を選んでください",
    aiError: "AI判定でエラーが起きました",
    noSelection: "何か1つ以上選んでください。"
  },
  en: {
    appTitle: "🐱 Cat Emotion App",
    languageLabel: "Language",
    photoTitle: "Check by Photo",
    manualTitle: "Choose Manually",
    manualDescription: "Select only what you can see",
    fileLabel: "Choose File",
    fileNone: "No file selected",
    chooseOne: "Optional",
    analyze: "Analyze",
    aiAnalyze: "Analyze Photo with AI",
    aiLoading: "AI is checking the photo...",
    aiDone: "AI suggestions were added. Adjust them if needed, then analyze.",
    selectedFeatures: "Selected Features",
    stateTitle: "State",
    emotionTitle: "Emotion",
    vibeTitle: "Vibe",
    catLineTitle: "Cat's Line",
    whyTitle: "Why this result?",
    citationTitle: "Sources",
    noImage: "Please choose a photo first",
    aiError: "AI analysis failed",
    noSelection: "Please select at least one sign."
  },
  th: {
    appTitle: "🐱 แอปอ่านอารมณ์แมว",
    languageLabel: "ภาษา",
    photoTitle: "ดูจากรูปภาพ",
    manualTitle: "เลือกเอง",
    manualDescription: "เลือกเฉพาะที่มองเห็นก็พอ",
    fileLabel: "เลือกไฟล์",
    fileNone: "ยังไม่ได้เลือกไฟล์",
    chooseOne: "ไม่จำเป็นต้องเลือก",
    analyze: "วิเคราะห์",
    aiAnalyze: "ใช้ AI ดูจากรูป",
    aiLoading: "AI กำลังดูรูปอยู่...",
    aiDone: "AI ใส่ตัวเลือกให้แล้ว ปรับเองได้ก่อนวิเคราะห์",
    selectedFeatures: "ลักษณะที่เลือก",
    stateTitle: "สถานะ",
    emotionTitle: "ความรู้สึก",
    vibeTitle: "บรรยากาศ",
    catLineTitle: "คำพูดจากแมว",
    whyTitle: "ทำไมจึงวิเคราะห์แบบนี้?",
    citationTitle: "แหล่งอ้างอิง",
    noImage: "กรุณาเลือกรูปก่อน",
    aiError: "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI",
    noSelection: "กรุณาเลือกอย่างน้อยหนึ่งอย่าง"
  }
};

const stateLabels = {
  relaxed: {
    ja: "リラックス状態",
    en: "Relaxed State",
    th: "อยู่ในสภาวะผ่อนคลาย"
  },
  sleep_mode: {
    ja: "眠気モード",
    en: "Sleep Mode",
    th: "โหมดง่วงนอน"
  },
  tolerating: {
    ja: "受け入れつつ我慢中",
    en: "Tolerating",
    th: "กำลังอดทนยอมรับ"
  },
  alert: {
    ja: "警戒モード",
    en: "Alert Mode",
    th: "โหมดระวังตัว"
  },
  play_mode: {
    ja: "遊びモード",
    en: "Play Mode",
    th: "โหมดเล่น"
  },
  dominant: {
    ja: "余裕・優位モード",
    en: "Confident Mode",
    th: "โหมดมั่นใจ"
  },
  curious: {
    ja: "興味しんしんモード",
    en: "Curious Mode",
    th: "โหมดอยากรู้อยากเห็น"
  }
};

const emotionLabels = {
  relaxed: {
    ja: "リラックス",
    en: "Relaxed",
    th: "ผ่อนคลาย"
  },
  sleepy: {
    ja: "眠い",
    en: "Sleepy",
    th: "ง่วง"
  },
  observing: {
    ja: "観察中",
    en: "Observing",
    th: "กำลังสังเกต"
  },
  cautious: {
    ja: "警戒",
    en: "Cautious",
    th: "ระวังตัว"
  },
  annoyed: {
    ja: "ちょっとイヤ",
    en: "Annoyed",
    th: "ไม่ค่อยชอบ"
  },
  playful: {
    ja: "遊びたい",
    en: "Playful",
    th: "อยากเล่น"
  },
  affectionate: {
    ja: "甘えたい",
    en: "Affectionate",
    th: "อยากอ้อน"
  },
  tolerating: {
    ja: "我慢中",
    en: "Tolerating",
    th: "กำลังอดทน"
  }
};

const citationMap = {
  relaxed: {
    ja: [
      "ゆっくり瞬き: University of Sussex (2020)",
      "香箱座り / リラックス姿勢: Cats.com",
      "お腹見せ: Wikipedia / ねこのきもち"
    ],
    en: [
      "Slow blink: University of Sussex (2020)",
      "Loaf / relaxed posture: Cats.com",
      "Belly-up posture: Wikipedia / Neko no Kimochi"
    ],
    th: [
      "การกะพริบตาช้าๆ: University of Sussex (2020)",
      "ท่านั่งเก็บขา / ท่าผ่อนคลาย: Cats.com",
      "ท่าโชว์พุง: Wikipedia / Neko no Kimochi"
    ]
  },
  sleepy: {
    ja: [
      "半目 / 目を閉じる: 猫行動学の一般的観察",
      "丸まって寝る / だらけ寝: Cats.com"
    ],
    en: [
      "Half-open or closed eyes: general feline behavior observation",
      "Curled sleep / relaxed lying: Cats.com"
    ],
    th: [
      "ตาปรือ / หลับตา: การสังเกตพฤติกรรมแมวทั่วไป",
      "นอนขด / นอนผ่อนคลาย: Cats.com"
    ]
  },
  observing: {
    ja: [
      "普通座り / じっと見る: 一般的な観察行動",
      "耳が前向き / 目が開く: 猫行動観察"
    ],
    en: [
      "Normal sitting / staring: general observation behavior",
      "Forward ears / open eyes: feline observation cues"
    ],
    th: [
      "นั่งปกติ / จ้องมอง: พฤติกรรมการสังเกตทั่วไป",
      "หูชี้ไปข้างหน้า / ตาเปิด: สัญญาณการสังเกตของแมว"
    ]
  },
  cautious: {
    ja: [
      "耳が後ろ / 横向き: sippo / ねこのきもち",
      "体を低くする: 一般的な警戒姿勢"
    ],
    en: [
      "Ears back / sideways: sippo / Neko no Kimochi",
      "Low body posture: general cautious posture"
    ],
    th: [
      "หูไปด้านหลัง / ออกข้าง: sippo / Neko no Kimochi",
      "ลำตัวต่ำ: ท่าทางระวังตัวทั่วไป"
    ]
  },
  annoyed: {
    ja: [
      "イカ耳: sippo / petride / ねこのきもち",
      "しっぽを激しく振る: 一般的な不快サイン"
    ],
    en: [
      "Flattened ears: sippo / petride / Neko no Kimochi",
      "Fast tail swish: general irritation cue"
    ],
    th: [
      "หูพับ / หูแบน: sippo / petride / Neko no Kimochi",
      "หางสะบัดแรง: สัญญาณความหงุดหงิดทั่วไป"
    ]
  },
  playful: {
    ja: [
      "つかむ / 離さない: 一般的な遊び・狩猟モード",
      "目が丸い / 興味集中: 猫行動観察"
    ],
    en: [
      "Holding / grabbing: common play or hunting mode",
      "Wide eyes / focused interest: feline observation"
    ],
    th: [
      "จับ / ไม่ปล่อย: พฤติกรรมเล่นหรือโหมดล่า",
      "ตาโต / สนใจมาก: การสังเกตพฤติกรรมแมว"
    ]
  },
  affectionate: {
    ja: [
      "ゆっくり瞬き: University of Sussex (2020)",
      "ふみふみ: Wikipedia / Cats.com"
    ],
    en: [
      "Slow blink: University of Sussex (2020)",
      "Kneading: Wikipedia / Cats.com"
    ],
    th: [
      "กะพริบตาช้าๆ: University of Sussex (2020)",
      "การนวด: Wikipedia / Cats.com"
    ]
  },
  tolerating: {
    ja: [
      "抱っこ中 + 半目 + 脱力: 実観察ベースの推定",
      "押す / 逃げない: 距離を取りたいが強く拒否していない状態"
    ],
    en: [
      "Being held + half-open eyes + limp posture: observation-based inference",
      "Pushing without escaping: wants distance but not full rejection"
    ],
    th: [
      "ถูกอุ้ม + ตาปรือ + ปล่อยตัว: การตีความจากการสังเกตจริง",
      "ผลักแต่ไม่หนี: ต้องการระยะห่างแต่ยังไม่ปฏิเสธเต็มที่"
    ]
  }
};

function text(key) {
  return uiText[currentLang][key];
}

function getOptionText(option) {
  return option[currentLang] || option.ja;
}

function getGroupLabel(group) {
  return group[`label_${currentLang}`] || group.label_ja;
}

function updateStaticText() {
  if (appTitle) appTitle.textContent = text("appTitle");
  if (languageLabel) languageLabel.textContent = text("languageLabel");
  if (photoTitle) photoTitle.textContent = text("photoTitle");
  if (manualTitle) manualTitle.textContent = text("manualTitle");
  if (manualDescription) manualDescription.textContent = text("manualDescription");
  if (fileLabel) fileLabel.textContent = text("fileLabel");

  if (fileStatus && !fileStatus.dataset.hasFile) {
    fileStatus.textContent = text("fileNone");
  }

  document.title = text("appTitle").replace("🐱 ", "");
}

async function loadFeatures() {
  const res = await fetch("./data/features.json");
  featuresData = await res.json();
  updateStaticText();
  renderManualSelectors();
}

function renderManualSelectors() {
  manualArea.innerHTML = "";

  const aiButton = document.createElement("button");
  aiButton.textContent = text("aiAnalyze");
  aiButton.onclick = analyzePhotoWithAI;
  manualArea.appendChild(aiButton);

  featuresData.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "feature-group";

    const label = document.createElement("label");
    label.textContent = getGroupLabel(group);

    const select = document.createElement("select");
    select.dataset.group = group.group;

    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = text("chooseOne");
    select.appendChild(empty);

    group.options.forEach(option => {
      const op = document.createElement("option");
      op.value = option.key;
      op.textContent = getOptionText(option);
      select.appendChild(op);
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    manualArea.appendChild(wrap);
  });

  const button = document.createElement("button");
  button.textContent = text("analyze");
  button.onclick = analyzeSelection;
  manualArea.appendChild(button);
}

async function analyzePhotoWithAI() {
  if (!currentImageBase64 || !currentMimeType) {
    alert(text("noImage"));
    return;
  }

  resultBox.innerHTML = `
    <div class="result-card">
      <h3>${text("aiLoading")}</h3>
    </div>
  `;

  try {
    const response = await fetch("/api/analyze-cat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageBase64: currentImageBase64,
        mimeType: currentMimeType
      })
    });

    const data = await response.json();
    applyAIResultToSelectors(data);

    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("aiAnalyze")}</h3>
        <p>${text("aiDone")}</p>
      </div>
    `;
  } catch (error) {
    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("aiError")}</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function applyAIResultToSelectors(data) {
  const selects = manualArea.querySelectorAll("select");

  selects.forEach(select => {
    const group = select.dataset.group;
    const value = data[group];

    if (value && value !== "unknown") {
      select.value = value;
    }
  });
}

function analyzeSelection() {
  const selects = manualArea.querySelectorAll("select");
  const selected = {};

  selects.forEach(select => {
    if (select.value) {
      selected[select.dataset.group] = select.value;
    }
  });

  if (Object.keys(selected).length === 0) {
    alert(text("noSelection"));
    return;
  }

  const result = judgeEmotion(selected);
  renderResult(result, selected);
}

function detectState(selected) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  const stateScore = {
    relaxed: 0,
    sleep_mode: 0,
    tolerating: 0,
    alert: 0,
    play_mode: 0,
    dominant: 0,
    curious: 0
  };

  const reasons = [];

  if (has("eyes_closed")) {
    stateScore.sleep_mode += 4;
    reasons.push({
      ja: "目を閉じていて眠気が強そうです。",
      en: "Closed eyes suggest strong sleepiness.",
      th: "หลับตา บ่งบอกถึงความง่วงอย่างชัดเจน"
    });
  }

  if (has("eyes_half_open")) {
    stateScore.sleep_mode += 2;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "半目は眠さや、少し気が乗らない時にも見られます。",
      en: "Half-open eyes can appear when sleepy or not fully engaged.",
      th: "ตาปรืออาจพบได้ตอนง่วงหรือไม่ได้อยากมีส่วนร่วมมากนัก"
    });
  }

  if (has("eyes_soft") || has("slow_blink") || has("eyes_narrow")) {
    stateScore.relaxed += 2;
    reasons.push({
      ja: "やわらかい目つきは落ち着きのサインです。",
      en: "Soft or narrowed eyes suggest calmness.",
      th: "สายตานุ่มนวลหรือตาหรี่เป็นสัญญาณของความสงบ"
    });
  }

  if (has("eyes_wide") || has("pupils_large") || has("eyes_staring")) {
    stateScore.curious += 2;
    stateScore.alert += 1;
    reasons.push({
      ja: "目が大きい・じっと見るのは興味や注意のサインです。",
      en: "Wide or staring eyes suggest curiosity or attention.",
      th: "ตาเบิกกว้างหรือจ้อง บ่งบอกถึงความสนใจหรือการระวัง"
    });
  }

  if (has("ears_back_strong")) {
    stateScore.alert += 3;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "耳が強く後ろならかなり警戒寄りです。",
      en: "Strongly pinned back ears suggest strong alertness.",
      th: "หูพับไปด้านหลังชัดเจน แปลว่าระวังตัวมาก"
    });
  }

  if (has("ears_back_soft") || has("ears_side") || has("ears_flat_side")) {
    stateScore.alert += 2;
    reasons.push({
      ja: "耳の後ろ・横向きは少し警戒のサインです。",
      en: "Back or sideways ears suggest caution.",
      th: "หูไปด้านหลังหรือออกข้าง บ่งบอกถึงความระวัง"
    });
  }

  if (has("ears_forward") || has("ears_neutral")) {
    stateScore.curious += 1;
    stateScore.relaxed += 1;
    reasons.push({
      ja: "耳が普通か前向きで、環境を見ています。",
      en: "Neutral or forward ears suggest calm attention to the environment.",
      th: "หูปกติหรือชี้ไปข้างหน้า แปลว่ากำลังรับรู้สิ่งรอบตัวอย่างสงบ"
    });
  }

  if (has("held_in_arms")) {
    stateScore.tolerating += 3;
    reasons.push({
      ja: "抱っこ中は我慢して受け入れている可能性があります。",
      en: "Being held can suggest tolerating contact.",
      th: "การถูกอุ้มอาจหมายถึงกำลังอดทนยอมรับการสัมผัส"
    });
  }

  if (has("paws_hanging")) {
    stateScore.tolerating += 2;
    stateScore.relaxed += 1;
    reasons.push({
      ja: "前足だらんは脱力か、抱っこを受け入れている時に見られます。",
      en: "Hanging paws can suggest limp relaxation or tolerating handling.",
      th: "ขาหน้าห้อยอาจหมายถึงการปล่อยตัวหรือยอมให้จับ"
    });
  }

  if (has("paw_cross") || has("paws_crossed")) {
    stateScore.relaxed += 2;
    stateScore.dominant += 1;
    reasons.push({
      ja: "前足クロスは余裕や落ち着きの印象があります。",
      en: "Crossed paws suggest poise and calmness.",
      th: "การไขว้ขาหน้าสื่อถึงความนิ่งและดูมีความมั่นใจ"
    });
  }

  if (has("paw_lift") || has("ghost_pose")) {
    stateScore.curious += 2;
    stateScore.alert += 1;
    reasons.push({
      ja: "前足を少し上げるのは様子見や興味のサインです。",
      en: "A lifted paw suggests curiosity or cautious observation.",
      th: "การยกขาหน้าสื่อถึงการสังเกตหรือความสนใจ"
    });
  }

  if (has("paws_holding") || has("grab_hold") || has("paw_touch_face")) {
    stateScore.play_mode += 3;
    stateScore.curious += 1;
    reasons.push({
      ja: "つかむ動きは遊びや関わりたい気持ちが出やすいです。",
      en: "Holding or grabbing suggests play or engagement.",
      th: "การจับหรือกอดบ่งบอกถึงความอยากเล่นหรือมีปฏิสัมพันธ์"
    });
  }

  if (has("paws_pushing") || has("paw_push") || has("claws_out")) {
    stateScore.alert += 2;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "押す・爪を出す動きは距離を取りたいサインのことがあります。",
      en: "Pushing or claws out can suggest wanting space.",
      th: "การผลักหรือกางเล็บอาจหมายถึงต้องการระยะห่าง"
    });
  }

  if (has("loaf")) {
    stateScore.relaxed += 2;
    reasons.push({
      ja: "香箱座りは安心して落ち着いている時に多いです。",
      en: "Loaf position often appears when a cat feels calm and safe.",
      th: "ท่านั่งเก็บขามักพบเมื่อน้องรู้สึกสงบและปลอดภัย"
    });
  }

  if (has("lying_relaxed") || has("body_flat")) {
    stateScore.relaxed += 3;
    stateScore.sleep_mode += 1;
    reasons.push({
      ja: "だらけて横になるのはかなりリラックス寄りです。",
      en: "Lying loosely suggests strong relaxation.",
      th: "การนอนเหยียดยาวแสดงถึงความผ่อนคลายมาก"
    });
  }

  if (has("curled_sleep")) {
    stateScore.sleep_mode += 3;
    stateScore.relaxed += 1;
    reasons.push({
      ja: "丸まって寝るのは睡眠モードに近いです。",
      en: "Curled sleeping suggests sleep mode.",
      th: "การนอนขดตัวบ่งบอกถึงโหมดนอน"
    });
  }

  if (has("belly_up") || has("belly_exposed")) {
    stateScore.relaxed += 3;
    stateScore.dominant += 1;
    reasons.push({
      ja: "お腹を見せるのは安心感が高いサインです。",
      en: "Showing the belly suggests a high level of comfort.",
      th: "การโชว์พุงบ่งบอกถึงความรู้สึกปลอดภัยสูง"
    });
  }

  if (has("sitting_normal")) {
    stateScore.curious += 2;
    reasons.push({
      ja: "普通座りは様子見や観察中に多いです。",
      en: "Normal sitting often appears during observation.",
      th: "การนั่งปกติมักพบเมื่อน้องกำลังสังเกตอยู่"
    });
  }

  if (has("upright_alert") || has("body_low")) {
    stateScore.alert += 2;
    reasons.push({
      ja: "上体を起こす・低くする姿勢は警戒と関係しやすいです。",
      en: "Upright or low body posture often relates to alertness.",
      th: "ท่าลุกตัวขึ้นหรือลำตัวต่ำมักเกี่ยวข้องกับการระวังตัว"
    });
  }

  if (has("high_position")) {
    stateScore.dominant += 2;
    stateScore.relaxed += 1;
    reasons.push({
      ja: "高い場所では余裕を持って周囲を見ることがあります。",
      en: "A high position can suggest confidence and calm observation.",
      th: "การอยู่ในที่สูงอาจสื่อถึงความมั่นใจและการมองรอบตัวอย่างสบายใจ"
    });
  }

  let topKey = "curious";
  let topScore = -1;

  for (const [key, score] of Object.entries(stateScore)) {
    if (score > topScore) {
      topKey = key;
      topScore = score;
    }
  }

  return { state: topKey, reasons };
}

function stateToEmotion(state, selected) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  if (state === "sleep_mode") return "sleepy";

  if (state === "relaxed") {
    if (has("slow_blink") || has("kneading")) return "affectionate";
    return "relaxed";
  }

  if (state === "tolerating") return "tolerating";

  if (state === "alert") {
    if (has("ears_back_strong") || has("paws_pushing") || has("paw_push")) return "annoyed";
    return "cautious";
  }

  if (state === "play_mode") return "playful";
  if (state === "dominant") return "observing";
  if (state === "curious") return "observing";

  return "observing";
}

function buildMessage(emotion) {
  const map = {
    relaxed: {
      ja: "落ち着いて安心している可能性があります。",
      en: "Your cat may feel calm and secure.",
      th: "น้องอาจกำลังรู้สึกสงบและปลอดภัย"
    },
    sleepy: {
      ja: "眠い、または休みたい気分の可能性があります。",
      en: "Your cat may be sleepy or want to rest.",
      th: "น้องอาจง่วงหรือต้องการพัก"
    },
    observing: {
      ja: "周囲を見ながら様子をうかがっている可能性があります。",
      en: "Your cat may be observing the surroundings.",
      th: "น้องอาจกำลังสังเกตสิ่งรอบตัว"
    },
    cautious: {
      ja: "少し警戒している可能性があります。",
      en: "Your cat may be a little cautious.",
      th: "น้องอาจกำลังระวังตัวเล็กน้อย"
    },
    annoyed: {
      ja: "少しイヤだったり、距離を取りたい可能性があります。",
      en: "Your cat may be slightly annoyed or want some space.",
      th: "น้องอาจไม่ค่อยชอบและต้องการระยะห่าง"
    },
    playful: {
      ja: "遊びたい、またはちょっかいを出したい気分かもしれません。",
      en: "Your cat may want to play or interact.",
      th: "น้องอาจอยากเล่นหรือมีปฏิสัมพันธ์"
    },
    affectionate: {
      ja: "甘えたい、安心して関わりたい気持ちかもしれません。",
      en: "Your cat may feel affectionate and want connection.",
      th: "น้องอาจอยากอ้อนและมีความรู้สึกผูกพัน"
    },
    tolerating: {
      ja: "嫌ではないけれど、自分から積極的ではなく我慢して受け入れている可能性があります。",
      en: "Your cat may be accepting the situation, but not actively enjoying it.",
      th: "น้องอาจยอมรับสถานการณ์อยู่ แต่ไม่ได้ชอบแบบเต็มใจ"
    }
  };

  return map[emotion];
}

function buildVibe(selected, state, emotion) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  let ja = [];
  let en = [];
  let th = [];

  if (has("eyes_half_open")) {
    ja.push("ちょっと眠そう");
    en.push("a little sleepy");
    th.push("ดูง่วงนิดๆ");
  }

  if (has("eyes_soft") || has("slow_blink") || has("eyes_narrow")) {
    ja.push("表情がやわらかい");
    en.push("a soft expression");
    th.push("สีหน้าดูนุ่มนวล");
  }

  if (has("held_in_arms")) {
    ja.push("抱っこされながら受け入れている感じ");
    en.push("seems to be accepting being held");
    th.push("ดูเหมือนกำลังยอมให้อุ้ม");
  }

  if (has("paws_hanging")) {
    ja.push("少し脱力している");
    en.push("a little limp and loose");
    th.push("ดูปล่อยตัวเล็กน้อย");
  }

  if (has("paw_cross") || has("paws_crossed")) {
    ja.push("ちょっと上品で余裕がある");
    en.push("a little elegant and composed");
    th.push("ดูนิ่งและมีความสบายใจ");
  }

  if (has("paws_holding") || has("grab_hold")) {
    ja.push("何かに夢中");
    en.push("really into something");
    th.push("กำลังสนใจบางอย่างมาก");
  }

  if (has("paws_pushing") || has("paw_push")) {
    ja.push("少し距離を取りたそう");
    en.push("seems to want a little space");
    th.push("ดูเหมือนอยากมีระยะห่าง");
  }

  if (has("belly_up") || has("belly_exposed")) {
    ja.push("かなり無防備");
    en.push("very open and unguarded");
    th.push("ดูเปิดเผยและไม่ระวังตัวมาก");
  }

  if (has("lying_relaxed") || has("body_flat")) {
    ja.push("かなりだらけている");
    en.push("very loose and relaxed");
    th.push("ดูสบายมากและปล่อยตัว");
  }

  if (has("high_position")) {
    ja.push("ちょっと余裕あり");
    en.push("a bit confident");
    th.push("ดูมั่นใจเล็กน้อย");
  }

  if (emotion === "tolerating") {
    ja.push("嫌ではないけど自分からではなさそう");
    en.push("not unhappy, but not fully into it");
    th.push("ไม่ได้ไม่ชอบ แต่ก็ไม่ได้เต็มใจนัก");
  }

  if (emotion === "playful") {
    ja.push("遊びスイッチが入りそう");
    en.push("looks ready to play");
    th.push("ดูเหมือนพร้อมจะเล่น");
  }

  if (emotion === "sleepy") {
    ja.push("今は休みたい感じ");
    en.push("seems to want to rest");
    th.push("ดูเหมือนอยากพักตอนนี้");
  }

  if (emotion === "observing") {
    ja.push("静かに観察している感じ");
    en.push("quietly observing");
    th.push("กำลังเงียบๆ แล้วสังเกตอยู่");
  }

  return {
    ja: ja.length ? ja.join("、") : "今の雰囲気はまだはっきりしません",
    en: en.length ? en.join(", ") : "The vibe is still unclear",
    th: th.length ? th.join("、") : "บรรยากาศตอนนี้ยังไม่ชัดเจน"
  };
}

function buildCatLine(selected, state, emotion) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  if (emotion === "sleepy") {
    return {
      ja: "いまはそっとしてほしいニャ…",
      en: "Let me nap a little... meow.",
      th: "ตอนนี้ขอพักก่อนนะ... เมี้ยว"
    };
  }

  if (emotion === "relaxed") {
    return {
      ja: "ここ、けっこう落ち着くニャ",
      en: "This feels pretty nice, meow.",
      th: "ตรงนี้สบายดีนะ... เมี้ยว"
    };
  }

  if (emotion === "affectionate") {
    return {
      ja: "ちょっと甘えてもいいかニャ？",
      en: "Can I be a little sweet right now, meow?",
      th: "ขออ้อนหน่อยได้ไหม... เมี้ยว"
    };
  }

  if (emotion === "tolerating") {
    return {
      ja: "まあ…イヤじゃないけど長くはナシだニャ",
      en: "Well... I can allow this, but not for too long, meow.",
      th: "ก็...พอได้อยู่ แต่ไม่นานนะ เมี้ยว"
    };
  }

  if (emotion === "cautious") {
    return {
      ja: "ちょっと様子を見るニャ",
      en: "I’m keeping an eye on this, meow.",
      th: "ขอดูสถานการณ์ก่อนนะ เมี้ยว"
    };
  }

  if (emotion === "annoyed") {
    return {
      ja: "今はちょっと放っておいてほしいニャ",
      en: "Please give me a little space right now, meow.",
      th: "ตอนนี้ขออยู่เงียบๆ หน่อยนะ เมี้ยว"
    };
  }

  if (emotion === "playful") {
    return {
      ja: "それ、ちょっと触ってみたいニャ！",
      en: "I really want to paw at that, meow!",
      th: "อันนั้นน่าเล่นจัง เมี้ยว!"
    };
  }

  if (emotion === "observing") {
    return {
      ja: "ふむ…ちょっと見てるだけだニャ",
      en: "Hmm... I’m just watching for now, meow.",
      th: "อืม... ตอนนี้ขอดูเฉยๆ ก่อนนะ เมี้ยว"
    };
  }

  if (has("held_in_arms") && has("eyes_half_open")) {
    return {
      ja: "抱っこはOKだけど、今日は省エネだニャ",
      en: "Being held is okay, but I’m in low-power mode today, meow.",
      th: "อุ้มได้อยู่ แต่วันนี้ขอประหยัดพลังงานนะ เมี้ยว"
    };
  }

  return {
    ja: "今日はこんな気分だニャ",
    en: "This is my mood today, meow.",
    th: "วันนี้อารมณ์ประมาณนี้นะ เมี้ยว"
  };
}

function judgeEmotion(selected) {
  const values = Object.values(selected);

  if (values.length === 0) {
    return {
      state: {
        ja: "未選択",
        en: "No Selection",
        th: "ยังไม่ได้เลือก"
      },
      emotion: {
        ja: "未選択",
        en: "No Selection",
        th: "ยังไม่ได้เลือก"
      },
      emotionKey: "observing",
      message: {
        ja: "何か1つ以上選んでください。",
        en: "Please select at least one sign.",
        th: "กรุณาเลือกอย่างน้อยหนึ่งอย่าง"
      },
      vibe: {
        ja: "まだ判断材料がありません",
        en: "No vibe yet",
        th: "ยังไม่มีข้อมูลพอ"
      },
      catLine: {
        ja: "ヒントを少し見せてほしいニャ",
        en: "Show me a little more, meow.",
        th: "ขอข้อมูลเพิ่มอีกนิดนะ เมี้ยว"
      },
      why: {
        ja: "情報がまだありません。",
        en: "No data yet.",
        th: "ยังไม่มีข้อมูล"
      }
    };
  }

  const detected = detectState(selected);
  const emotion = stateToEmotion(detected.state, selected);
  const topReasons = detected.reasons.slice(0, 2).map(r => r[currentLang]).join(" ");
  const vibe = buildVibe(selected, detected.state, emotion);
  const catLine = buildCatLine(selected, detected.state, emotion);

  return {
    state: stateLabels[detected.state],
    emotion: emotionLabels[emotion],
    emotionKey: emotion,
    message: buildMessage(emotion),
    vibe,
    catLine,
    why: {
      ja: topReasons || "選ばれた特徴から総合的に判断しました。",
      en: topReasons || "Judged from the selected features.",
      th: topReasons || "วิเคราะห์จากลักษณะที่เลือก"
    }
  };
}

function renderResult(result, selected) {
  const list = Object.entries(selected).map(([g, k]) => {
    const group = featuresData.find(x => x.group === g);
    if (!group) return "";
    const opt = group.options.find(o => o.key === k);
    if (!opt) return "";
    return `<li><strong>${getGroupLabel(group)}:</strong> ${getOptionText(opt)}</li>`;
  }).join("");

  const citations = citationMap[result.emotionKey]
    ? citationMap[result.emotionKey][currentLang]
    : [];

  resultBox.innerHTML = `
    <div class="result-card">
      <p><strong>${text("stateTitle")}:</strong> ${result.state[currentLang]}</p>
      <h3>${text("emotionTitle")}: ${result.emotion[currentLang]}</h3>
      <p>${result.message[currentLang]}</p>
      <p><strong>${text("vibeTitle")}:</strong> ${result.vibe[currentLang]}</p>
      <p><strong>${text("catLineTitle")}:</strong> ${result.catLine[currentLang]}</p>
      <p><strong>${text("whyTitle")}</strong></p>
      <p>${result.why[currentLang]}</p>

      ${
        citations.length
          ? `<p><strong>${text("citationTitle")}</strong></p>
             <ul>${citations.map(item => `<li>${item}</li>`).join("")}</ul>`
          : ""
      }

      ${
        list
          ? `<p><strong>${text("selectedFeatures")}</strong></p><ul>${list}</ul>`
          : ""
      }
    </div>
  `;
}

if (langSelect) {
  langSelect.addEventListener("change", e => {
    currentLang = e.target.value;
    updateStaticText();
    renderManualSelectors();
    resultBox.innerHTML = "";
  });
}

if (imageInput) {
  imageInput.addEventListener("change", e => {
    const file = e.target.files[0];

    if (!file) {
      if (fileStatus) {
        fileStatus.textContent = text("fileNone");
        delete fileStatus.dataset.hasFile;
      }
      currentImageBase64 = "";
      currentMimeType = "";

      if (preview && preview.tagName === "IMG") {
        preview.src = "";
        preview.style.display = "none";
      } else if (preview) {
        preview.innerHTML = "";
      }
      return;
    }

    if (fileStatus) {
      fileStatus.textContent = file.name;
      fileStatus.dataset.hasFile = "true";
    }
    currentMimeType = file.type;

    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target.result;
      currentImageBase64 = result.split(",")[1];

      if (preview && preview.tagName === "IMG") {
        preview.src = result;
        preview.style.display = "block";
      } else if (preview) {
        preview.innerHTML = `<img src="${result}" alt="preview" style="max-width:100%; border-radius:16px;">`;
      }
    };
    reader.readAsDataURL(file);
  });
}

loadFeatures();

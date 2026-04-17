const API_URL = "https://あなたのVercelURL/api/analyze-cat"; // ←ここだけ自分のVercel URLに変更

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
    selectedFeatures: "選んだ特徴",
    whyTitle: "なぜこの判定？",
    noImage: "先に写真を選んでください",
    aiApplied: "AI候補を選択欄に反映しました。",
    aiError: "AI解析でエラーが出ました"
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
    selectedFeatures: "Selected Features",
    whyTitle: "Why this result?",
    noImage: "Please choose a photo first",
    aiApplied: "AI suggestions were applied to the selectors.",
    aiError: "AI analysis failed"
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
    selectedFeatures: "ลักษณะที่เลือก",
    whyTitle: "ทำไมจึงวิเคราะห์แบบนี้?",
    noImage: "กรุณาเลือกรูปก่อน",
    aiApplied: "AI ใส่ค่าลงในช่องเลือกให้แล้ว",
    aiError: "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI"
  }
};

function text(key) {
  return uiText[currentLang][key];
}

function getOptionText(option) {
  return option[currentLang] || option.ja || option.en || option.th || option.key;
}

function getGroupLabel(group) {
  return group[`label_${currentLang}`] || group.label_ja || group.group;
}

function updateStaticText() {
  appTitle.textContent = text("appTitle");
  languageLabel.textContent = text("languageLabel");
  photoTitle.textContent = text("photoTitle");
  manualTitle.textContent = text("manualTitle");
  manualDescription.textContent = text("manualDescription");
  fileLabel.textContent = text("fileLabel");

  if (!fileStatus.dataset.hasFile) {
    fileStatus.textContent = text("fileNone");
  }
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

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileStatus.textContent = file.name;
  fileStatus.dataset.hasFile = "1";
  currentMimeType = file.type || "image/jpeg";

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    currentImageBase64 = dataUrl.split(",")[1];
    preview.innerHTML = `<img src="${dataUrl}" alt="preview" style="max-width:100%; border-radius:12px;">`;
  };
  reader.readAsDataURL(file);
});

const aiMap = {
  ears: {
    forward: "ears_forward",
    sideways: "ears_side",
    back: "ears_back",
    flat: "ears_back"
  },
  eyes: {
    soft: "eyes_narrow",
    wide: "eyes_wide",
    half_closed: "eyes_narrow",
    staring: "eyes_wide"
  },
  pupils: {
    normal: "",
    large: "pupils_large",
    small: ""
  },
  tail: {
    up: "tail_up",
    down: "",
    tucked: "tail_tucked",
    puffed: "",
    relaxed: ""
  },
  body: {
    relaxed: "loaf",
    low: "body_low",
    tense: "",
    arched: ""
  },
  fur: {
    normal: "",
    puffed: ""
  },
  mouth: {
    closed: "",
    open: "",
    hissing: ""
  }
};

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
    const response = await fetch(API_URL, {
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

    if (!response.ok) {
      throw new Error(data.error || "API error");
    }

    applyAIResultToSelectors(data.features || {});
    analyzeSelection();

  } catch (error) {
    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("aiError")}</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function applyAIResultToSelectors(features) {
  const selects = manualArea.querySelectorAll("select");

  selects.forEach(select => {
    const group = select.dataset.group;
    const aiValue = features[group];

    if (!aiValue || aiValue === "unknown") return;

    const mapped = aiMap[group]?.[aiValue];
    if (mapped) {
      select.value = mapped;
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

  const result = judgeEmotion(selected);
  renderResult(result, selected);
}

function renderResult(result, selected) {
  const selectedValues = Object.values(selected);

  resultBox.innerHTML = `
    <div class="result-card">
      <h3>${result.title[currentLang]}</h3>
      <p>${result.message[currentLang]}</p>
      <hr>
      <p><strong>${text("selectedFeatures")}:</strong> ${selectedValues.length ? selectedValues.join(", ") : "-"}</p>
      <p><strong>${text("whyTitle")}:</strong> ${result.why[currentLang]}</p>
    </div>
  `;
}

function judgeEmotion(selected) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  if (values.length === 0) {
    return {
      title: {
        ja: "未選択",
        en: "No Selection",
        th: "ยังไม่ได้เลือก"
      },
      message: {
        ja: "何か1つ以上選んでください。",
        en: "Please select at least one sign.",
        th: "กรุณาเลือกอย่างน้อยหนึ่งอย่าง"
      },
      why: {
        ja: "情報がまだありません。",
        en: "No data yet.",
        th: "ยังไม่มีข้อมูล"
      }
    };
  }

  const scores = {
    relaxed: 0,
    affectionate: 0,
    alert: 0,
    anxious: 0,
    irritated: 0,
    focused: 0
  };

  const reasons = [];

  if (has("slow_blink")) {
    scores.relaxed += 3;
    scores.affectionate += 2;
    reasons.push({
      ja: "ゆっくり瞬きは安心や信頼のサインです。",
      en: "A slow blink is a sign of calmness and trust.",
      th: "การกะพริบตาช้าๆ เป็นสัญญาณของความสบายใจและความไว้ใจ"
    });
  }

  if (has("eyes_narrow")) {
    scores.relaxed += 2;
    reasons.push({
      ja: "目を細めるのは落ち着きのサインになりやすいです。",
      en: "Narrowed eyes often suggest calmness.",
      th: "การหรี่ตามักเป็นสัญญาณของความผ่อนคลาย"
    });
  }

  if (has("eyes_wide")) {
    scores.alert += 2;
    scores.focused += 2;
    reasons.push({
      ja: "目が大きく開いていると、警戒や集中の可能性があります。",
      en: "Wide eyes can suggest alertness or focus.",
      th: "ตาเบิกกว้างอาจหมายถึงการระวังตัวหรือจดจ่อ"
    });
  }

  if (has("pupils_large")) {
    scores.alert += 2;
    scores.focused += 2;
    scores.anxious += 1;
    reasons.push({
      ja: "瞳孔が大きいと、興奮・集中・緊張の可能性があります。",
      en: "Large pupils can suggest excitement, focus, or tension.",
      th: "รูม่านตาขยายอาจหมายถึงความตื่นเต้น การจดจ่อ หรือความตึงเครียด"
    });
  }

  if (has("ears_forward")) {
    scores.focused += 2;
    scores.alert += 1;
    reasons.push({
      ja: "耳が前向きだと、興味や集中の可能性があります。",
      en: "Forward ears can suggest interest or focus.",
      th: "หูชี้ไปข้างหน้าอาจหมายถึงความสนใจหรือการจดจ่อ"
    });
  }

  if (has("ears_side")) {
    scores.alert += 2;
    scores.anxious += 1;
    reasons.push({
      ja: "耳が横向きだと、少し警戒している可能性があります。",
      en: "Sideways ears can suggest caution.",
      th: "หูหันออกข้างอาจหมายถึงการระวังตัว"
    });
  }

  if (has("ears_back")) {
    scores.anxious += 3;
    scores.irritated += 2;
    reasons.push({
      ja: "耳が後ろ向きだと、不安や不快の可能性があります。",
      en: "Ears back can suggest anxiety or discomfort.",
      th: "หูพับไปข้างหลังอาจหมายถึงความกังวลหรือความไม่สบายใจ"
    });
  }

  if (has("kneading")) {
    scores.affectionate += 3;
    scores.relaxed += 2;
    reasons.push({
      ja: "ふみふみは甘えや安心のサインになりやすいです。",
      en: "Kneading often suggests affection and comfort.",
      th: "การนวดมักเป็นสัญญาณของความอ้อนและความสบายใจ"
    });
  }

  if (has("paw_tense")) {
    scores.alert += 2;
    scores.focused += 1;
    reasons.push({
      ja: "前足に力が入っていると、緊張しながら集中している可能性があります。",
      en: "Tense front paws can suggest focus with tension.",
      th: "ขาหน้าเกร็งอาจหมายถึงกำลังจดจ่อพร้อมความตึงเครียด"
    });
  }

  if (has("paw_lift")) {
    scores.alert += 1;
    scores.focused += 1;
    reasons.push({
      ja: "前足を少し上げるのは、様子見や軽い興味のサインかもしれません。",
      en: "A slightly lifted paw can suggest curiosity or hesitation.",
      th: "การยกขาหน้าขึ้นเล็กน้อยอาจหมายถึงความสนใจหรือการลังเล"
    });
  }

  if (has("ghost_pose")) {
    scores.alert += 2;
    scores.focused += 1;
    reasons.push({
      ja: "前足を浮かせる姿勢は、様子見や警戒の可能性があります。",
      en: "A paws-up pose can suggest alert observation.",
      th: "ท่ายกขาหน้าอาจหมายถึงการเฝ้าดูหรือระวังตัว"
    });
  }

  if (has("face_cover")) {
    scores.relaxed += 1;
    scores.anxious += 1;
    reasons.push({
      ja: "顔を隠すしぐさは、休みたい時や刺激を避けたい時にも見られます。",
      en: "Covering the face can appear when the cat wants to rest or avoid stimulation.",
      th: "การเอามือปิดหน้าอาจพบได้เมื่อต้องการพักหรือหลีกเลี่ยงสิ่งรบกวน"
    });
  }

  if (has("paw_cross")) {
    scores.relaxed += 1;
    reasons.push({
      ja: "前足をクロスする姿勢は、落ち着いている印象につながりやすいです。",
      en: "Crossed paws often give a calm impression.",
      th: "การไขว้ขาหน้ามักให้ความรู้สึกสงบ"
    });
  }

  if (has("paw_touch_face")) {
    scores.affectionate += 1;
    scores.focused += 1;
    reasons.push({
      ja: "前足で顔に触れる動きは、関わりや注意のサインかもしれません。",
      en: "Touching the face with a paw can suggest interaction or attention.",
      th: "การเอาขาแตะหน้าอาจหมายถึงการมีปฏิสัมพันธ์หรือการให้ความสนใจ"
    });
  }

  if (has("paw_push")) {
    scores.irritated += 2;
    scores.alert += 1;
    reasons.push({
      ja: "足で押す動きは、距離を取りたいサインのことがあります。",
      en: "Pushing with a paw can mean wanting distance.",
      th: "การใช้ขาผลักอาจหมายถึงต้องการเว้นระยะ"
    });
  }

  if (has("claws_out")) {
    scores.irritated += 3;
    scores.alert += 1;
    reasons.push({
      ja: "爪を立てるのは、興奮や防御の可能性があります。",
      en: "Claws out can suggest excitement or defense.",
      th: "การกางเล็บอาจหมายถึงความตื่นเต้นหรือการตั้งรับ"
    });
  }

  if (has("hands_up")) {
    scores.relaxed += 1;
    scores.focused += 1;
    reasons.push({
      ja: "万歳ポーズは、体勢しだいで脱力や遊びの途中にも見られます。",
      en: "A hands-up pose can appear during relaxation or play depending on posture.",
      th: "ท่ายกขาขึ้นอาจพบได้ระหว่างการผ่อนคลายหรือการเล่น ขึ้นอยู่กับท่าทาง"
    });
  }

  if (has("grab_hold")) {
    scores.focused += 3;
    scores.affectionate += 1;
    reasons.push({
      ja: "つかんで離さないのは、遊びや狩りモードに入りやすいです。",
      en: "Grabbing and holding often suggests play or hunting mode.",
      th: "การจับแล้วไม่ปล่อยมักหมายถึงโหมดเล่นหรือโหมดล่า"
    });
  }

  if (has("tail_up")) {
    scores.affectionate += 2;
    scores.relaxed += 1;
    reasons.push({
      ja: "しっぽを立てるのは、友好的なサインのことがあります。",
      en: "An upright tail can be a friendly sign.",
      th: "การตั้งหางอาจเป็นสัญญาณของความเป็นมิตร"
    });
  }

  if (has("tail_tip_move")) {
    scores.focused += 2;
    scores.alert += 1;
    reasons.push({
      ja: "しっぽの先だけ動くのは、興味や集中のサインになりやすいです。",
      en: "A moving tail tip often suggests interest or focus.",
      th: "ปลายหางขยับมักเป็นสัญญาณของความสนใจหรือการจดจ่อ"
    });
  }

  if (has("tail_fast")) {
    scores.irritated += 3;
    scores.alert += 1;
    reasons.push({
      ja: "しっぽを激しく振るのは、不快やイライラの可能性があります。",
      en: "A fast tail swish can suggest irritation.",
      th: "การสะบัดหางแรงอาจหมายถึงความหงุดหงิด"
    });
  }

  if (has("tail_tucked")) {
    scores.anxious += 3;
    reasons.push({
      ja: "しっぽを巻くのは、不安や怖さのサインになりやすいです。",
      en: "A tucked tail often suggests anxiety or fear.",
      th: "การหางหุบมักเป็นสัญญาณของความกังวลหรือความกลัว"
    });
  }

  if (has("loaf")) {
    scores.relaxed += 2;
    reasons.push({
      ja: "香箱座りは、落ち着いて休んでいる時に見られやすいです。",
      en: "A loaf position often appears when a cat is calmly resting.",
      th: "ท่านั่งเก็บขามักพบเมื่อน้องกำลังพักอย่างสงบ"
    });
  }

  if (has("body_low")) {
    scores.anxious += 2;
    scores.alert += 1;
    reasons.push({
      ja: "体を低くするのは、警戒や不安の可能性があります。",
      en: "A low body posture can suggest caution or anxiety.",
      th: "การลดลำตัวต่ำอาจหมายถึงการระวังตัวหรือความกังวล"
    });
  }

  if (has("belly_up")) {
    scores.relaxed += 2;
    scores.affectionate += 1;
    reasons.push({
      ja: "お腹を見せるのは、安心している時に見られることがあります。",
      en: "Showing the belly can appear when a cat feels safe.",
      th: "การโชว์พุงอาจพบได้เมื่อน้องรู้สึกปลอดภัย"
    });
  }

  if (has("stretch")) {
    scores.relaxed += 2;
    reasons.push({
      ja: "伸びは、脱力やリラックスのサインになりやすいです。",
      en: "Stretching often suggests relaxation.",
      th: "การยืดตัวมักเป็นสัญญาณของความผ่อนคลาย"
    });
  }

  let topKey = "relaxed";
  let topScore = -1;

  for (const [key, score] of Object.entries(scores)) {
    if (score > topScore) {
      topKey = key;
      topScore = score;
    }
  }

  const labels = {
    relaxed: {
      title: { ja: "リラックスの可能性", en: "Possible Relaxation", th: "อาจกำลังผ่อนคลาย" },
      message: { ja: "落ち着いて過ごしている可能性があります。", en: "Your cat may be feeling calm.", th: "น้องอาจกำลังรู้สึกสงบและผ่อนคลาย" }
    },
    affectionate: {
      title: { ja: "甘え・親愛の可能性", en: "Possible Affection", th: "อาจกำลังอ้อนหรือแสดงความรัก" },
      message: { ja: "あなたや周りに対して親しさを見せている可能性があります。", en: "Your cat may be showing affection.", th: "น้องอาจกำลังแสดงความรักหรือความคุ้นเคย" }
    },
    alert: {
      title: { ja: "警戒の可能性", en: "Possible Alertness", th: "อาจกำลังระวังตัว" },
      message: { ja: "周囲を気にして少し様子を見ている可能性があります。", en: "Your cat may be watching the surroundings carefully.", th: "น้องอาจกำลังสังเกตสิ่งรอบตัวอย่างระมัดระวัง" }
    },
    anxious: {
      title: { ja: "不安の可能性", en: "Possible Anxiety", th: "อาจกำลังกังวล" },
      message: { ja: "少し怖さや不安を感じている可能性があります。", en: "Your cat may be feeling anxious or uneasy.", th: "น้องอาจกำลังรู้สึกกังวลหรือไม่สบายใจ" }
    },
    irritated: {
      title: { ja: "不快・イライラの可能性", en: "Possible Irritation", th: "อาจกำลังหงุดหงิด" },
      message: { ja: "今はあまり構われたくない可能性があります。", en: "Your cat may not want interaction right now.", th: "ตอนนี้น้องอาจไม่อยากให้เข้าไปรบกวน" }
    },
    focused: {
      title: { ja: "興味・集中の可能性", en: "Possible Focus", th: "อาจกำลังสนใจและจดจ่อ" },
      message: { ja: "何かに意識が向いて集中している可能性があります。", en: "Your cat may be focused on something.", th: "น้องอาจกำลังจดจ่อกับบางสิ่ง" }
    }
  };

  const topReasons = reasons.slice(0, 2).map(r => r[currentLang]).join(" ");

  return {
    title: labels[topKey].title,
    message: labels[topKey].message,
    why: {
      ja: topReasons || "選ばれた特徴から総合的に判断しました。",
      en: topReasons || "Judged from the selected features.",
      th: topReasons || "วิเคราะห์จากลักษณะที่เลือก"
    }
  };
}

langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  updateStaticText();
  renderManualSelectors();
});

loadFeatures();

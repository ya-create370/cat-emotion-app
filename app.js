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

// 画像を軽量化する関数（追加）
async function resizeImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      let MAX_SIZE = 800;
      let quality = 0.7;

      // 大きすぎる画像はさらに縮小（Vercel / Geminiエラー防止）
      if (file.size > 3000000) {
        MAX_SIZE = 600;
        quality = 0.6;
      }

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", quality);

      resolve(compressed);
    };

    reader.readAsDataURL(file);
  });
}

async function loadFeatures() {
  const res = await fetch("./data/features.json");
  featuresData = await res.json();
  updateStaticText();
  renderManualSelectors();
  renderHistory();
}

function renderManualSelectors() {
  manualArea.innerHTML = "";

const aiButton = document.createElement("button");
aiButton.id = "aiAnalyzeButton";
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

  const aiButton = document.getElementById("aiAnalyzeButton");
  if (aiButton) aiButton.disabled = true;

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

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      throw new Error("APIがJSONを返していません: " + rawText);
    }

    if (!response.ok || !data.ok) {
      throw new Error(
        data.detail ||
        data.error?.[currentLang] ||
        data.error?.ja ||
        data.error ||
        "APIエラーが起きました"
      );
    }

    applyAIResultToSelectors(data);

    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("aiAnalyze")}</h3>
        <p>${text("aiDone")}</p>
      </div>
    `;
  } catch (error) {
    // Geminiが使えなくてもアプリを止めない（フォールバック）
    const fallback = {
      result: {
        features: {
          eyes: "eyes_staring",
          ears: "ears_neutral",
          paws: "paws_hanging",
          body: "sitting_normal"
        }
      }
    };
    applyAIResultToSelectors(fallback);

    const fallbackMessage = {
      ja: "AIが現在利用できません。手動または簡易判定に切り替えました",
      en: "AI is currently unavailable. Switched to fallback mode",
      th: "AI ไม่สามารถใช้งานได้ในขณะนี้ เปลี่ยนเป็นโหมดสำรอง"
    };

    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("aiAnalyze")}</h3>
        <p>${fallbackMessage[currentLang] || fallbackMessage.ja}</p>
      </div>
    `;
  } finally {
    if (aiButton) aiButton.disabled = false;
  }
}
    function applyAIResultToSelectors(data) {
  const selects = manualArea.querySelectorAll("select");

  const normalized = {
    eyes: data?.eyes || "unknown",
    ears: data?.ears || "unknown",
    paws: data?.paws || "unknown",
    tail: data?.tail || "unknown",
    body: data?.body || "unknown"
  };

  selects.forEach(select => {
    const group = select.dataset.group;
    const value = normalized[group];

    if (value && value !== "unknown") {
      select.value = value;
    }
  });
}

function applyAIResultToSelectors(data) {
  const selects = manualArea.querySelectorAll("select");

  // APIの返り値の中から features を取り出す
  const features = data?.result?.features || {};

  // AIが配列で返しても、文字で返しても対応する
  const normalized = {
    eyes: Array.isArray(features.eyes) ? features.eyes[0] : features.eyes,
    ears: Array.isArray(features.ears) ? features.ears[0] : features.ears,
    paws: Array.isArray(features.paws) ? features.paws[0] : features.paws,
    tail: Array.isArray(features.tail) ? features.tail[0] : features.tail,
    body: Array.isArray(features.body) ? features.body[0] : features.body
  };

  selects.forEach(select => {
    const group = select.dataset.group;
    const value = normalized[group];

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
  saveHistory(result.emotionKey);
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

  // 目
  if (has("eyes_closed")) {
    stateScore.sleep_mode += 4;
    stateScore.relaxed += 2;
    reasons.push({
      ja: "目を閉じていて、かなり安心して休んでいそうです。",
      en: "Closed eyes suggest the cat feels very safe and restful.",
      th: "การหลับตาบ่งบอกว่าแมวรู้สึกปลอดภัยและกำลังพักผ่อน"
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

  if (has("eyes_soft")) {
    stateScore.relaxed += 3;
    reasons.push({
      ja: "やわらかい目つきは落ち着きのサインです。",
      en: "Soft eyes suggest calmness.",
      th: "ดวงตานุ่มนวลเป็นสัญญาณของความสงบ"
    });
  }

  if (has("eyes_staring")) {
    stateScore.curious += 2;
    stateScore.alert += 1;
    reasons.push({
      ja: "じっと見るのは、興味や注意のサインです。",
      en: "Staring suggests curiosity or attention.",
      th: "การจ้องมองเป็นสัญญาณของความสนใจหรือการระวัง"
    });
  }

  if (has("eyes_tense")) {
    stateScore.alert += 3;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "目に力が入っているのは、かなり緊張しているサインです。",
      en: "Tense eyes suggest strong tension.",
      th: "ดวงตาที่เกร็งเป็นสัญญาณของความตึงเครียดสูง"
    });
  }

  if (has("eyes_wide_alert")) {
    stateScore.alert += 4;
    stateScore.curious += 1;
    reasons.push({
      ja: "目を大きく見開くのは、強い警戒や興奮のサインです。",
      en: "Wide alert eyes suggest strong vigilance or arousal.",
      th: "ตาเบิกกว้างเป็นสัญญาณของความระวังหรือความตื่นตัวสูง"
    });
  }

  // 耳
  if (has("ears_neutral")) {
    stateScore.relaxed += 1;
    stateScore.curious += 1;
    reasons.push({
      ja: "耳が普通向きで、周囲を落ち着いて見ています。",
      en: "Neutral ears suggest calm awareness of the surroundings.",
      th: "หูอยู่ในตำแหน่งปกติ แสดงว่ากำลังรับรู้สิ่งรอบตัวอย่างสงบ"
    });
  }

  if (has("ears_back_soft")) {
    stateScore.alert += 2;
    reasons.push({
      ja: "耳が少し後ろなのは、軽い警戒や不快のサインです。",
      en: "Slightly back ears suggest mild caution or discomfort.",
      th: "หูเอนไปด้านหลังเล็กน้อยเป็นสัญญาณของความระวังหรือไม่สบายใจเล็กน้อย"
    });
  }

  if (has("ears_back_strong")) {
    stateScore.alert += 3;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "耳が強く後ろなら、かなり警戒や不快が強いです。",
      en: "Pinned-back ears suggest strong caution or discomfort.",
      th: "หูพับไปด้านหลังแรงแสดงถึงความระวังหรือความไม่สบายใจสูง"
    });
  }

  // 前足
  if (has("paws_hanging")) {
    stateScore.relaxed += 2;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "前足がだらんとしていて、力が抜けています。",
      en: "Hanging paws suggest looseness and relaxation.",
      th: "ขาหน้าห้อยบ่งบอกถึงการปล่อยตัวและความผ่อนคลาย"
    });
  }

  if (has("paws_crossed")) {
    stateScore.relaxed += 2;
    stateScore.dominant += 1;
    reasons.push({
      ja: "前足クロスは余裕や落ち着きの印象があります。",
      en: "Crossed paws suggest poise and calmness.",
      th: "การไขว้ขาหน้าสื่อถึงความนิ่งและความมั่นใจ"
    });
  }

  if (has("paws_holding")) {
    stateScore.play_mode += 2;
    stateScore.curious += 1;
    reasons.push({
      ja: "つかむ動きは遊びや関わりたい気持ちが出やすいです。",
      en: "Holding suggests play or engagement.",
      th: "การจับบ่งบอกถึงความอยากเล่นหรือมีปฏิสัมพันธ์"
    });
  }

  if (has("paws_pushing")) {
    stateScore.alert += 2;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "押す動きは距離を取りたいサインです。",
      en: "Pushing suggests the cat wants space.",
      th: "การผลักเป็นสัญญาณว่าต้องการระยะห่าง"
    });
  }

  if (has("paws_pushing_soft")) {
    stateScore.alert += 1;
    stateScore.tolerating += 2;
    reasons.push({
      ja: "軽く押すのは、少し距離を取りたいサインです。",
      en: "Soft pushing suggests the cat wants a little space.",
      th: "การผลักเบา ๆ เป็นสัญญาณว่าแมวอยากมีระยะห่างเล็กน้อย"
    });
  }

  if (has("paws_pushing_claws")) {
    stateScore.alert += 3;
    stateScore.tolerating += 2;
    reasons.push({
      ja: "爪を出して押すのは、不快さがかなり強いサインです。",
      en: "Pushing with claws suggests strong discomfort.",
      th: "การผลักพร้อมกางเล็บเป็นสัญญาณของความไม่สบายใจค่อนข้างแรง"
    });
  }

  if (has("paws_grabbing")) {
    stateScore.relaxed += 1;
    stateScore.play_mode += 1;
    reasons.push({
      ja: "抱える・しがみつく動きは、甘えや遊びたい気持ちが出やすいです。",
      en: "Grabbing suggests affection or playfulness.",
      th: "การกอดหรือจับแน่นมักสื่อถึงความอ้อนหรืออยากเล่น"
    });
  }

  // しっぽ
  if (has("tail_relaxed")) {
    stateScore.relaxed += 2;
    reasons.push({
      ja: "しっぽがゆるいのは落ち着きのサインです。",
      en: "A relaxed tail suggests calmness.",
      th: "หางที่ผ่อนคลายเป็นสัญญาณของความสงบ"
    });
  }

  if (has("tail_tucked")) {
    stateScore.alert += 2;
    reasons.push({
      ja: "しっぽを巻くのは不安や警戒のサインです。",
      en: "A tucked tail suggests anxiety or caution.",
      th: "การม้วนหางเป็นสัญญาณของความกังวลหรือการระวัง"
    });
  }

  if (has("tail_puffed")) {
    stateScore.alert += 3;
    stateScore.dominant += 1;
    reasons.push({
      ja: "しっぽが膨らむのは、強い警戒や威嚇のサインです。",
      en: "A puffed tail suggests strong alarm or intimidation.",
      th: "หางพองเป็นสัญญาณของความตกใจหรือการขู่"
    });
  }

  // 体
  if (has("sitting_normal")) {
    stateScore.curious += 2;
    reasons.push({
      ja: "普通に座っているのは様子見や観察中に多いです。",
      en: "Normal sitting often appears during observation.",
      th: "การนั่งปกติมักพบเมื่อน้องกำลังสังเกตอยู่"
    });
  }

  if (has("lying_relaxed")) {
    stateScore.relaxed += 4;
    stateScore.sleep_mode += 1;
    reasons.push({
      ja: "寝てリラックスしていて、かなり安心していそうです。",
      en: "A relaxed lying posture suggests strong comfort.",
      th: "การนอนผ่อนคลายบ่งบอกถึงความสบายใจมาก"
    });
  }

  if (has("held_in_arms")) {
    stateScore.tolerating += 3;
    reasons.push({
      ja: "抱っこ中は、受け入れているか我慢している可能性があります。",
      en: "Being held can suggest tolerating contact.",
      th: "การถูกอุ้มอาจหมายถึงกำลังยอมรับหรืออดทนต่อการสัมผัส"
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

  if (has("body_tense_ready")) {
    stateScore.alert += 4;
    stateScore.play_mode += 1;
    reasons.push({
      ja: "全身に力が入っているのは、戦うか走り出す直前のサインです。",
      en: "A tense body suggests a fight-or-run moment.",
      th: "ลำตัวที่เกร็งบ่งบอกถึงช่วงก่อนสู้หรือพุ่งตัว"
    });
  }

  if (has("body_arched")) {
    stateScore.dominant += 4;
    stateScore.alert += 2;
    reasons.push({
      ja: "背中を丸めるのは、威嚇や強い緊張のサインです。",
      en: "An arched back suggests intimidation or strong tension.",
      th: "การโก่งหลังเป็นสัญญาณของการขู่หรือความตึงเครียดสูง"
    });
  }

  if (has("body_play_butt_up")) {
    stateScore.play_mode += 4;
    reasons.push({
      ja: "お尻を上げるのは、遊びに誘う代表的なポーズです。",
      en: "A play bow is a classic invitation to play.",
      th: "การยกก้นเป็นท่าชวนเล่นแบบคลาสสิก"
    });
  }

  // 口元
  if (has("mouth_relaxed")) {
    stateScore.relaxed += 2;
    reasons.push({
      ja: "口元がゆるいのは安心しているサインです。",
      en: "A relaxed mouth suggests comfort.",
      th: "ปากที่ผ่อนคลายเป็นสัญญาณของความสบายใจ"
    });
  }

  if (has("mouth_tight")) {
    stateScore.alert += 2;
    stateScore.tolerating += 1;
    reasons.push({
      ja: "口を引き結ぶのは、不快さや緊張のサインです。",
      en: "A tight mouth suggests discomfort or tension.",
      th: "การเม้มปากเป็นสัญญาณของความไม่สบายใจหรือความตึงเครียด"
    });
  }

  // ヒゲ
  if (has("whiskers_relaxed")) {
    stateScore.relaxed += 2;
    reasons.push({
      ja: "ヒゲが自然なのは、落ち着いているサインです。",
      en: "Relaxed whiskers suggest calmness.",
      th: "หนวดที่ดูเป็นธรรมชาติเป็นสัญญาณของความสงบ"
    });
  }

  if (has("whiskers_forward")) {
    stateScore.alert += 1;
    stateScore.play_mode += 1;
    reasons.push({
      ja: "ヒゲが前に張るのは、強い集中や興奮のサインです。",
      en: "Forward whiskers suggest arousal or strong focus.",
      th: "หนวดที่ชี้ไปด้านหน้าเป็นสัญญาณของความตื่นตัวหรือจดจ่อมาก"
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

  // 強い怒り顔
  if (
    has("eyes_tense") &&
    has("mouth_tight") &&
    (has("body_tense_ready") || has("paws_pushing_claws"))
  ) {
    return "annoyed";
  }

  // 威嚇の最終段階
  if (
    has("body_arched") &&
    (has("eyes_wide_alert") || has("whiskers_forward"))
  ) {
    return "annoyed";
  }

  // プレイ誘い
  if (has("body_play_butt_up")) {
    return "playful";
  }

  // 遊びに飛び出す直前
  if (
    has("body_tense_ready") &&
    has("eyes_staring") &&
    !has("mouth_tight")
  ) {
    return "playful";
  }

  // 甘えの強い形
  if (
    has("paws_grabbing") &&
    (has("mouth_relaxed") || has("whiskers_relaxed") || has("eyes_closed"))
  ) {
    return "affectionate";
  }

  if (state === "sleep_mode") return "sleepy";

  if (state === "relaxed") {
    if (has("paws_grabbing") || has("mouth_relaxed") || has("whiskers_relaxed")) {
      return "affectionate";
    }
    return "relaxed";
  }

  if (state === "tolerating") {
    if (has("paws_pushing_claws") || has("mouth_tight")) return "annoyed";
    return "tolerating";
  }

  if (state === "alert") {
    if (
      has("eyes_tense") ||
      has("ears_back_strong") ||
      has("paws_pushing_claws") ||
      has("mouth_tight")
    ) {
      return "annoyed";
    }
    return "cautious";
  }

  if (state === "play_mode") return "playful";
  if (state === "dominant") return "annoyed";
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

  // 目
  if (has("eyes_closed")) {
    ja.push("かなり安心している");
    en.push("looks very safe and relaxed");
    th.push("ดูสบายใจและปลอดภัยมาก");
  }

  if (has("eyes_half_open")) {
    ja.push("少し眠そう");
    en.push("a little sleepy");
    th.push("ดูง่วงนิด ๆ");
  }

  if (has("eyes_soft")) {
    ja.push("表情がやわらかい");
    en.push("has a soft expression");
    th.push("สีหน้าดูนุ่มนวล");
  }

  if (has("eyes_staring")) {
    ja.push("何かに強く注目している");
    en.push("is strongly focused on something");
    th.push("กำลังจดจ่อกับบางอย่างมาก");
  }

  if (has("eyes_tense")) {
    ja.push("目にかなり力が入っている");
    en.push("the eyes look very tense");
    th.push("ดวงตาดูเกร็งมาก");
  }

  if (has("eyes_wide_alert")) {
    ja.push("かなり警戒している");
    en.push("looks highly alert");
    th.push("ดูระวังตัวมาก");
  }

  // 耳
  if (has("ears_neutral")) {
    ja.push("耳は自然で周囲を見ている");
    en.push("the ears look neutral and attentive");
    th.push("หูดูเป็นธรรมชาติและกำลังรับรู้รอบตัว");
  }

  if (has("ears_back_soft")) {
    ja.push("少し警戒気味");
    en.push("slightly cautious");
    th.push("ดูระวังตัวเล็กน้อย");
  }

  if (has("ears_back_strong")) {
    ja.push("かなり不快そう");
    en.push("looks quite uncomfortable");
    th.push("ดูไม่ค่อยสบายใจมาก");
  }

  // 前足
  if (has("paws_hanging")) {
    ja.push("少し脱力している");
    en.push("a little loose and limp");
    th.push("ดูปล่อยตัวเล็กน้อย");
  }

  if (has("paws_crossed")) {
    ja.push("ちょっと余裕がある");
    en.push("looks composed");
    th.push("ดูนิ่งและมีความมั่นใจ");
  }

  if (has("paws_holding")) {
    ja.push("何かに夢中");
    en.push("is really engaged");
    th.push("กำลังสนใจบางอย่างมาก");
  }

  if (has("paws_pushing")) {
    ja.push("少し距離を取りたそう");
    en.push("seems to want a little space");
    th.push("ดูเหมือนอยากมีระยะห่าง");
  }

  if (has("paws_pushing_soft")) {
    ja.push("やんわり距離を取りたそう");
    en.push("gently wants some space");
    th.push("ดูเหมือนอยากมีระยะห่างแบบเบา ๆ");
  }

  if (has("paws_pushing_claws")) {
    ja.push("かなりイヤそう");
    en.push("looks fairly uncomfortable");
    th.push("ดูไม่ค่อยสบายใจค่อนข้างมาก");
  }

  if (has("paws_grabbing")) {
    ja.push("ぎゅっとくっつきたい感じ");
    en.push("seems to want to hold on closely");
    th.push("ดูเหมือนอยากกอดติดไว้แน่น");
  }

  // しっぽ
  if (has("tail_relaxed")) {
    ja.push("しっぽも落ち着いている");
    en.push("the tail looks relaxed");
    th.push("หางดูผ่อนคลาย");
  }

  if (has("tail_tucked")) {
    ja.push("少し不安そう");
    en.push("seems a little uneasy");
    th.push("ดูไม่ค่อยมั่นใจเล็กน้อย");
  }

  if (has("tail_puffed")) {
    ja.push("かなり興奮している");
    en.push("looks highly aroused");
    th.push("ดูตื่นตัวหรือ激มาก");
  }

  // 体
  if (has("sitting_normal")) {
    ja.push("静かに様子を見ている");
    en.push("is quietly observing");
    th.push("กำลังนั่งดูสถานการณ์อย่างเงียบ ๆ");
  }

  if (has("lying_relaxed")) {
    ja.push("全身がかなりリラックスしている");
    en.push("the whole body looks deeply relaxed");
    th.push("ทั้งตัวดูผ่อนคลายมาก");
  }

  if (has("held_in_arms")) {
    ja.push("抱っこを受け入れている感じ");
    en.push("seems to be accepting being held");
    th.push("ดูเหมือนกำลังยอมให้อุ้ม");
  }

  if (has("high_position")) {
    ja.push("少し余裕がある");
    en.push("looks a bit confident");
    th.push("ดูมั่นใจเล็กน้อย");
  }

  if (has("body_tense_ready")) {
    ja.push("全身がかなり緊張している");
    en.push("the whole body looks very tense");
    th.push("ทั้งตัวดูเกร็งมาก");
  }

  if (has("body_arched")) {
    ja.push("かなり威嚇している");
    en.push("looks strongly intimidating");
    th.push("ดูเหมือนกำลังขู่ค่อนข้างแรง");
  }

  if (has("body_play_butt_up")) {
    ja.push("遊びに誘っている");
    en.push("is inviting play");
    th.push("กำลังชวนเล่น");
  }

  // 口元
  if (has("mouth_relaxed")) {
    ja.push("口元がやわらかい");
    en.push("the mouth looks relaxed");
    th.push("ปากดูผ่อนคลาย");
  }

  if (has("mouth_tight")) {
    ja.push("口元がムッとしている");
    en.push("the mouth looks tight");
    th.push("ปากดูตึงและไม่พอใจ");
  }

  // ヒゲ
  if (has("whiskers_relaxed")) {
    ja.push("ヒゲも自然でやわらかい");
    en.push("the whiskers look relaxed");
    th.push("หนวดดูเป็นธรรมชาติและผ่อนคลาย");
  }

  if (has("whiskers_forward")) {
    ja.push("ヒゲが前に張っている");
    en.push("the whiskers are forward");
    th.push("หนวดชี้มาด้านหน้า");
  }

  // 感情ごとの補足
  if (emotion === "affectionate") {
    ja.push("甘えたい気持ちが強そう");
    en.push("seems to want affection");
    th.push("ดูเหมือนอยากอ้อน");
  }

  if (emotion === "annoyed") {
    ja.push("かなり不快そう");
    en.push("seems fairly upset");
    th.push("ดูไม่ค่อยพอใจมาก");
  }

  if (emotion === "playful") {
    ja.push("遊びスイッチが入っている");
    en.push("looks ready to play");
    th.push("ดูเหมือนพร้อมจะเล่น");
  }

  if (emotion === "sleepy") {
    ja.push("今は休みたい感じ");
    en.push("seems to want to rest now");
    th.push("ดูเหมือนอยากพักตอนนี้");
  }

  if (emotion === "observing") {
    ja.push("静かに観察している感じ");
    en.push("is quietly observing");
    th.push("กำลังสังเกตอย่างเงียบ ๆ");
  }

  if (emotion === "tolerating") {
    ja.push("受け入れているけど少し我慢していそう");
    en.push("seems to be accepting it, but with some restraint");
    th.push("ดูเหมือนยอมรับอยู่ แต่ก็อดทนเล็กน้อย");
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

  // 強い甘え
  if (emotion === "affectionate" && has("paws_grabbing")) {
    return {
      ja: "もうちょっとくっついていたいニャ",
      en: "I want to stay close a little longer, meow.",
      th: "อยากอยู่ใกล้อีกหน่อยนะ เมี้ยว"
    };
  }

  // 完全リラックス
  if (
    emotion === "relaxed" &&
    (has("eyes_closed") || has("lying_relaxed")) &&
    has("whiskers_relaxed")
  ) {
    return {
      ja: "いまはとっても安心してるニャ…",
      en: "I feel very safe right now... meow.",
      th: "ตอนนี้ฉันรู้สึกสบายใจมากเลย... เมี้ยว"
    };
  }

  // 眠い
  if (emotion === "sleepy") {
    return {
      ja: "いまはそっとしてほしいニャ…",
      en: "Let me rest a little... meow.",
      th: "ตอนนี้ขอพักก่อนนะ... เมี้ยว"
    };
  }

  // 強い嫌がり
  if (
    emotion === "annoyed" &&
    has("eyes_tense") &&
    has("mouth_tight")
  ) {
    return {
      ja: "今はかなりイヤだニャ。これ以上はやめてほしいニャ",
      en: "I really don’t like this right now. Please stop, meow.",
      th: "ตอนนี้ไม่ชอบมากเลยนะ หยุดได้แล้ว เมี้ยว"
    };
  }

  // 威嚇
  if (has("body_arched")) {
    return {
      ja: "これ以上近づくなら本気になるニャ",
      en: "If you come any closer, I may get serious, meow.",
      th: "ถ้าเข้ามาใกล้อีก ฉันอาจเอาจริงนะ เมี้ยว"
    };
  }

  // 軽い不快
  if (emotion === "annoyed") {
    return {
      ja: "今はちょっと放っておいてほしいニャ",
      en: "Please give me a little space right now, meow.",
      th: "ตอนนี้ขออยู่เงียบ ๆ หน่อยนะ เมี้ยว"
    };
  }

  // プレイ誘い
  if (has("body_play_butt_up")) {
    return {
      ja: "ほら、遊ぶなら今だニャ！",
      en: "Come on, now is the perfect time to play, meow!",
      th: "มาเล่นกันตอนนี้เลย เมี้ยว!"
    };
  }

  // 遊び直前
  if (emotion === "playful" && has("body_tense_ready")) {
    return {
      ja: "もうすぐ飛び出すニャ…！",
      en: "I’m about to pounce... meow!",
      th: "ฉันกำลังจะพุ่งแล้วนะ... เมี้ยว!"
    };
  }

  // 通常プレイ
  if (emotion === "playful") {
    return {
      ja: "それ、ちょっと触ってみたいニャ！",
      en: "I really want to paw at that, meow!",
      th: "อันนั้นน่าเล่นจัง เมี้ยว!"
    };
  }

  // 我慢中
  if (emotion === "tolerating") {
    return {
      ja: "まあ…イヤじゃないけど長くはナシだニャ",
      en: "Well... I can allow this, but not for too long, meow.",
      th: "ก็...พอได้อยู่ แต่ไม่นานนะ เมี้ยว"
    };
  }

  // 観察中
  if (emotion === "observing") {
    return {
      ja: "ふむ…ちょっと見てるだけだニャ",
      en: "Hmm... I’m just watching for now, meow.",
      th: "อืม... ตอนนี้ขอดูเฉย ๆ ก่อนนะ เมี้ยว"
    };
  }

  // 警戒
  if (emotion === "cautious") {
    return {
      ja: "ちょっと様子を見るニャ",
      en: "I’m keeping an eye on this, meow.",
      th: "ขอดูสถานการณ์ก่อนนะ เมี้ยว"
    };
  }

  // 通常リラックス
  if (emotion === "relaxed") {
    return {
      ja: "ここ、けっこう落ち着くニャ",
      en: "This feels pretty nice, meow.",
      th: "ตรงนี้สบายดีนะ... เมี้ยว"
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

// 履歴保存（最新を先頭に追加、最大50件）
function saveHistory(emotionKey) {
  if (!emotionKey) return;
  const history = JSON.parse(localStorage.getItem("catHistory") || "[]");
  history.unshift({
    date: new Date().toISOString(),
    emotion: emotionKey
  });
  localStorage.setItem("catHistory", JSON.stringify(history.slice(0, 50)));
  renderHistory();
}

// 履歴表示（最新10件、新しい順）
function renderHistory() {
  const historyArea = document.getElementById("history");
  if (!historyArea) return;

  const history = JSON.parse(localStorage.getItem("catHistory") || "[]").slice(0, 10);

  if (history.length === 0) {
    historyArea.innerHTML = "";
    return;
  }

  const titleMap = {
    ja: "履歴（最新10件）",
    en: "History (Latest 10)",
    th: "ประวัติ (10 ล่าสุด)"
  };

  const localeMap = { ja: "ja-JP", en: "en-US", th: "th-TH" };

  const items = history.map(item => {
    const d = new Date(item.date);
    const dateStr = d.toLocaleString(localeMap[currentLang] || "ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    const label =
      (emotionLabels[item.emotion] && emotionLabels[item.emotion][currentLang]) ||
      item.emotion;
    return `<li>${dateStr} — ${label}</li>`;
  }).join("");

  historyArea.innerHTML = `
    <h2>${titleMap[currentLang] || titleMap.ja}</h2>
    <ul class="history-list">${items}</ul>
  `;
}

if (langSelect) {
  langSelect.addEventListener("change", e => {
    currentLang = e.target.value;
    updateStaticText();
    renderManualSelectors();
    resultBox.innerHTML = "";
    renderHistory();
  });
}


if (imageInput) {
  imageInput.addEventListener("change", async e => {
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

    currentMimeType = "image/jpeg";

    // 🔥 ここが重要（軽量化）
    const resized = await resizeImage(file);

    currentImageBase64 = resized.split(",")[1];

    if (preview && preview.tagName === "IMG") {
      preview.src = resized;
      preview.style.display = "block";
    } else if (preview) {
      preview.innerHTML = `<img src="${resized}" style="max-width:100%; border-radius:16px;">`;
    }
  });
}

loadFeatures();

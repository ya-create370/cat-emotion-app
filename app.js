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
    selectedFeatures: "選んだ特徴",
    whyTitle: "なぜこの判定？"
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
    selectedFeatures: "Selected Features",
    whyTitle: "Why this result?"
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
    selectedFeatures: "ลักษณะที่เลือก",
    whyTitle: "ทำไมจึงวิเคราะห์แบบนี้?"
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

function judgeEmotion(selected) {
  const values = Object.values(selected);
  const has = (k) => values.includes(k);

  // ⭐ フル判定
  if (has("ears_back") && has("tail_tucked") && has("body_low")) {
    return {
      title: { ja: "不安", en: "Anxiety", th: "ความกังวล" },
      message: { ja: "怖がっている可能性", en: "May be scared", th: "อาจกำลังกลัว" },
      why: { ja: "耳・しっぽ・体の組み合わせ", en: "Combined signals", th: "สัญญาณรวมกัน" }
    };
  }

  // ⭐ 部分判定（ここが重要）
  if (has("slow_blink")) {
    return {
      title: { ja: "リラックス", en: "Relaxed", th: "ผ่อนคลาย" },
      message: { ja: "安心している可能性", en: "Likely relaxed", th: "น่าจะผ่อนคลาย" },
      why: { ja: "瞬きは信頼サイン", en: "Blink = trust", th: "กะพริบตา = ไว้ใจ" }
    };
  }

  if (has("ears_back")) {
    return {
      title: { ja: "警戒", en: "Alert", th: "ระวังตัว" },
      message: { ja: "少し警戒している可能性", en: "May be alert", th: "อาจกำลังระวัง" },
      why: { ja: "耳の向き", en: "Ear position", th: "ทิศทางหู" }
    };
  }

  if (has("tail_fast")) {
    return {
      title: { ja: "イライラ", en: "Irritated", th: "หงุดหงิด" },
      message: { ja: "不快のサイン", en: "Sign of irritation", th: "สัญญาณหงุดหงิด" },
      why: { ja: "しっぽの動き", en: "Tail movement", th: "การเคลื่อนไหวหาง" }
    };
  }

  // ⭐ 何も選ばれてない
  if (values.length === 0) {
    return {
      title: { ja: "未選択", en: "No Selection", th: "ยังไม่ได้เลือก" },
      message: {
        ja: "何か1つ選んでください",
        en: "Please select at least one",
        th: "กรุณาเลือกอย่างน้อยหนึ่งอย่าง"
      },
      why: {
        ja: "情報がありません",
        en: "No data",
        th: "ไม่มีข้อมูล"
      }
    };
  }

  return {
    title: { ja: "判定中", en: "Analyzing", th: "กำลังวิเคราะห์" },
    message: {
      ja: "もう少し情報があると精度が上がります",
      en: "More data improves accuracy",
      th: "ข้อมูลเพิ่มจะช่วยให้แม่นขึ้น"
    },
    why: {
      ja: "情報不足",
      en: "Not enough data",
      th: "ข้อมูลไม่พอ"
    }
  };
}

function renderResult(result, selected) {
  const list = Object.entries(selected).map(([g, k]) => {
    const group = featuresData.find(x => x.group === g);
    const opt = group.options.find(o => o.key === k);
    return `<li>${getGroupLabel(group)}: ${getOptionText(opt)}</li>`;
  }).join("");

  resultBox.innerHTML = `
    <div class="result-card">
      <h3>${result.title[currentLang]}</h3>
      <p>${result.message[currentLang]}</p>
      <p><strong>${text("whyTitle")}</strong></p>
      <p>${result.why[currentLang]}</p>
      <ul>${list}</ul>
    </div>
  `;
}

langSelect.addEventListener("change", e => {
  currentLang = e.target.value;
  updateStaticText();
  renderManualSelectors();
  resultBox.innerHTML = "";
});

imageInput.addEventListener("change", e => {
  const file = e.target.files[0];

  if (!file) {
    fileStatus.textContent = text("fileNone");
    return;
  }

  fileStatus.textContent = file.name;
  fileStatus.dataset.hasFile = true;

  const reader = new FileReader();
  reader.onload = ev => {
    preview.src = ev.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

loadFeatures();

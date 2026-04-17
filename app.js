const langSelect = document.getElementById("langSelect");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const manualArea = document.getElementById("manualArea");
const resultBox = document.getElementById("result");

let currentLang = "ja";
let featuresData = [];

const groupNames = {
  ja: {
    eyes: "目",
    ears: "耳",
    front_paws: "前足",
    tail: "しっぽ",
    body: "体"
  },
  en: {
    eyes: "Eyes",
    ears: "Ears",
    front_paws: "Front paws",
    tail: "Tail",
    body: "Body"
  },
  th: {
    eyes: "ดวงตา",
    ears: "หู",
    front_paws: "ขาหน้า",
    tail: "หาง",
    body: "ลำตัว"
  }
};

function getText(item) {
  if (currentLang === "en") return item.en;
  if (currentLang === "th") return item.th;
  return item.ja;
}

async function loadFeatures() {
  const res = await fetch("./data/features.json");
  featuresData = await res.json();
  renderManualSelectors();
}

function renderManualSelectors() {
  manualArea.innerHTML = "";

  featuresData.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "feature-group";

    const label = document.createElement("label");
    label.textContent = getText({
      ja: group.label_ja,
      en: group.label_en,
      th: group.label_th
    });

    const select = document.createElement("select");
    select.dataset.group = group.group;

    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent =
      currentLang === "ja" ? "選んでください" :
      currentLang === "en" ? "Choose one" :
      "กรุณาเลือก";
    select.appendChild(empty);

    group.options.forEach(option => {
      const op = document.createElement("option");
      op.value = option.key;
      op.textContent = getText(option);
      select.appendChild(op);
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    manualArea.appendChild(wrap);
  });

  const button = document.createElement("button");
  button.textContent =
    currentLang === "ja" ? "判定する" :
    currentLang === "en" ? "Analyze" :
    "วิเคราะห์";
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

  if (values.includes("slow_blink") && values.includes("tail_up")) {
    return {
      ja: "リラックスしていて、あなたを信頼している可能性があります。",
      en: "Your cat may feel relaxed and trust you.",
      th: "น้องอาจกำลังรู้สึกผ่อนคลายและไว้ใจคุณ"
    };
  }

  if (values.includes("ears_back") && values.includes("tail_tucked")) {
    return {
      ja: "不安や恐怖を感じている可能性があります。少し距離を置きましょう。",
      en: "Your cat may feel anxious or scared. Give them some space.",
      th: "น้องอาจกำลังกังวลหรือกลัว ควรเว้นระยะห่าง"
    };
  }

  if (values.includes("pupils_large") && values.includes("tail_tip_move")) {
    return {
      ja: "興味や集中が高まっている可能性があります。",
      en: "Your cat may be highly curious or focused.",
      th: "น้องอาจกำลังสนใจหรือจดจ่อมากเป็นพิเศษ"
    };
  }

  if (values.includes("kneading")) {
    return {
      ja: "安心して甘えたい気分かもしれません。",
      en: "Your cat may feel safe and affectionate.",
      th: "น้องอาจกำลังรู้สึกปลอดภัยและอยากอ้อน"
    };
  }

  return {
    ja: "いくつかのサインから、今の気持ちをまだはっきり決めきれません。別の部位も選んでみてください。",
    en: "The current signs are not enough yet. Try selecting more features.",
    th: "สัญญาณตอนนี้ยังไม่พอ ลองเลือกจุดสังเกตเพิ่มเติม"
  };
}

function renderResult(result, selected) {
  const selectedList = Object.entries(selected).map(([group, key]) => {
    const groupData = featuresData.find(g => g.group === group);
    const optionData = groupData?.options.find(o => o.key === key);
    return `
      <li><strong>${groupNames[currentLang][group]}:</strong> ${optionData ? getText(optionData) : key}</li>
    `;
  }).join("");

  resultBox.innerHTML = `
    <div class="result-card">
      <h3>${currentLang === "ja" ? "判定結果" : currentLang === "en" ? "Result" : "ผลการวิเคราะห์"}</h3>
      <p>${currentLang === "ja" ? result.ja : currentLang === "en" ? result.en : result.th}</p>
      <ul>${selectedList}</ul>
    </div>
  `;
}

langSelect.addEventListener("change", e => {
  currentLang = e.target.value;
  renderManualSelectors();
});

imageInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    preview.src = event.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

loadFeatures();

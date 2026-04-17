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
    manualDescription: "猫の状態を選んでください",
    fileLabel: "ファイルを選択",
    fileNone: "ファイル未選択",
    chooseOne: "選んでください",
    analyze: "判定する",
    result: "判定結果",
    selectedFeatures: "選んだ特徴",
    error: "エラー",
    featureLoadError: "features.json を読み込めませんでした。",
    hardToJudge: "まだ判定がむずかしいです",
    notEnough:
      "今の選択だけでは、まだ気持ちをはっきり決めきれません。目・耳・しっぽ・体をもう少し組み合わせると、より深く読めます。"
  },
  en: {
    appTitle: "🐱 Cat Emotion App",
    languageLabel: "Language",
    photoTitle: "Check by Photo",
    manualTitle: "Choose Manually",
    manualDescription: "Please choose your cat's signs",
    fileLabel: "Choose File",
    fileNone: "No file selected",
    chooseOne: "Choose one",
    analyze: "Analyze",
    result: "Result",
    selectedFeatures: "Selected Features",
    error: "Error",
    featureLoadError: "Could not load features.json.",
    hardToJudge: "Still Hard to Judge",
    notEnough:
      "The current selection is not enough yet. Try combining more signs from the eyes, ears, tail, and body."
  },
  th: {
    appTitle: "🐱 แอปอ่านอารมณ์แมว",
    languageLabel: "ภาษา",
    photoTitle: "ดูจากรูปภาพ",
    manualTitle: "เลือกเอง",
    manualDescription: "กรุณาเลือกลักษณะของแมว",
    fileLabel: "เลือกไฟล์",
    fileNone: "ยังไม่ได้เลือกไฟล์",
    chooseOne: "กรุณาเลือก",
    analyze: "วิเคราะห์",
    result: "ผลการวิเคราะห์",
    selectedFeatures: "ลักษณะที่เลือก",
    error: "ข้อผิดพลาด",
    featureLoadError: "ไม่สามารถโหลด features.json ได้",
    hardToJudge: "ยังวิเคราะห์ได้ไม่ชัดเจน",
    notEnough:
      "ข้อมูลที่เลือกตอนนี้ยังไม่พอ ลองเลือกดวงตา หู หาง และลำตัวเพิ่ม เพื่อวิเคราะห์ได้แม่นขึ้น"
  }
};

function text(key) {
  return uiText[currentLang][key];
}

function getOptionText(option) {
  if (currentLang === "en") return option.en;
  if (currentLang === "th") return option.th;
  return option.ja;
}

function getGroupLabel(group) {
  if (currentLang === "en") return group.label_en;
  if (currentLang === "th") return group.label_th;
  return group.label_ja;
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
  try {
    const res = await fetch("./data/features.json");
    if (!res.ok) {
      throw new Error("features.json could not be loaded");
    }

    featuresData = await res.json();
    updateStaticText();
    renderManualSelectors();
  } catch (error) {
    console.error(error);
    updateStaticText();
    resultBox.innerHTML = `
      <div class="result-card">
        <h3>${text("error")}</h3>
        <p>${text("featureLoadError")}</p>
      </div>
    `;
  }
}

function renderManualSelectors() {
  manualArea.innerHTML = "";

  featuresData.forEach((group) => {
    const wrap = document.createElement("div");
    wrap.className = "feature-group";

    const label = document.createElement("label");
    label.textContent = getGroupLabel(group);

    const select = document.createElement("select");
    select.dataset.group = group.group;

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = text("chooseOne");
    select.appendChild(emptyOption);

    group.options.forEach((option) => {
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
  button.addEventListener("click", analyzeSelection);

  manualArea.appendChild(button);
}

function analyzeSelection() {
  const selects = manualArea.querySelectorAll("select");
  const selected = {};

  selects.forEach((select) => {
    if (select.value) {
      selected[select.dataset.group] = select.value;
    }
  });

  const result = judgeEmotion(selected);
  renderResult(result, selected);
}

function judgeEmotion(selected) {
  const values = Object.values(selected);
  const has = (key) => values.includes(key);

  if (
    (has("ears_back") || has("ears_side")) &&
    has("tail_tucked") &&
    has("body_low")
  ) {
    return {
      title: {
        ja: "不安・恐怖の可能性",
        en: "Possible Anxiety or Fear",
        th: "อาจกำลังกังวลหรือกลัว"
      },
      message: {
        ja: "耳が後ろ向きか横向きで、しっぽを巻き、体も低いので、不安や恐怖を感じている可能性があります。まずはそっとして安心できる距離を取りましょう。",
        en: "With the ears back or sideways, tail tucked, and body low, your cat may be feeling anxious or scared. Give them space and help them feel safe.",
        th: "เมื่อหูพับหรือหันออกข้าง หางหุบ และลำตัวต่ำ น้องอาจกำลังกังวลหรือกลัว ควรเว้นระยะและช่วยให้น้องรู้สึกปลอดภัย"
      }
    };
  }

  if (
    (has("eyes_wide") || has("pupils_large")) &&
    has("ears_forward") &&
    has("tail_tip_move")
  ) {
    return {
      title: {
        ja: "興味・集中の可能性",
        en: "Possible Focus and Curiosity",
        th: "อาจกำลังสนใจและจดจ่อ"
      },
      message: {
        ja: "目が大きく、耳が前を向き、しっぽの先だけ動いているので、何かに強く興味を持って集中している可能性があります。遊びや観察モードかもしれません。",
        en: "With wide eyes, ears forward, and the tail tip moving, your cat may be highly focused and interested in something. This may be play or hunting mode.",
        th: "เมื่อตาเบิกกว้าง หูชี้ไปข้างหน้า และปลายหางขยับ น้องอาจกำลังสนใจบางอย่างมาก และอยู่ในโหมดเล่นหรือจ้องเหยื่อ"
      }
    };
  }

  if (
    has("slow_blink") &&
    (has("tail_up") || has("loaf") || has("stretch"))
  ) {
    return {
      title: {
        ja: "リラックス・信頼の可能性",
        en: "Possible Relaxation and Trust",
        th: "อาจกำลังผ่อนคลายและไว้ใจ"
      },
      message: {
        ja: "ゆっくり瞬きをしながら、しっぽを立てたり、香箱座りや伸びをしているので、かなりリラックスしていて、あなたを信頼している可能性があります。",
        en: "With a slow blink plus an upright tail, loaf position, or stretching, your cat may be quite relaxed and trusting.",
        th: "เมื่อกะพริบตาช้าๆ พร้อมกับหางตั้ง นั่งเก็บขา หรือยืดตัว น้องอาจกำลังผ่อนคลายและไว้ใจคุณมาก"
      }
    };
  }

  if (
    has("kneading") &&
    (has("slow_blink") || has("tail_up") || has("belly_up"))
  ) {
    return {
      title: {
        ja: "甘え・安心の可能性",
        en: "Possible Affection and Safety",
        th: "อาจกำลังอ้อนและรู้สึกปลอดภัย"
      },
      message: {
        ja: "ふみふみをしながら、ゆっくり瞬きやしっぽを立てる動き、お腹を見せる様子があるので、安心して甘えたい気分かもしれません。",
        en: "With kneading plus a slow blink, upright tail, or belly-up posture, your cat may feel safe and affectionate.",
        th: "เมื่อน้องนวด พร้อมกับกะพริบตาช้าๆ หางตั้ง หรือโชว์พุง น้องอาจกำลังรู้สึกปลอดภัยและอยากอ้อน"
      }
    };
  }

  if (
    (has("ears_back") || has("ears_side")) &&
    has("tail_fast")
  ) {
    return {
      title: {
        ja: "不快・イライラの可能性",
        en: "Possible Irritation or Discomfort",
        th: "อาจกำลังหงุดหงิดหรือไม่สบายใจ"
      },
      message: {
        ja: "耳が後ろや横を向き、しっぽを激しく振っているので、不快やイライラのサインかもしれません。今は無理に触らない方がよさそうです。",
        en: "With the ears back or sideways and the tail swishing fast, your cat may be irritated or uncomfortable. It is better not to touch them right now.",
        th: "เมื่อหูพับหรือหันออกข้าง และหางสะบัดแรง น้องอาจกำลังหงุดหงิดหรือไม่สบายใจ ตอนนี้ไม่ควรฝืนจับ"
      }
    };
  }

  if (
    has("ears_back") &&
    has("tail_fast") &&
    has("body_low")
  ) {
    return {
      title: {
        ja: "防御・強い緊張の可能性",
        en: "Possible Defensive Tension",
        th: "อาจกำลังตั้งรับและเครียดมาก"
      },
      message: {
        ja: "耳が後ろ向きで、しっぽを激しく振り、体も低くしているので、防御的でかなり緊張している可能性があります。近づきすぎない方が安全です。",
        en: "With the ears back, tail swishing fast, and body low, your cat may be defensive and highly tense. It is safer not to get too close.",
        th: "เมื่อหูพับ หางสะบัดแรง และลำตัวต่ำ น้องอาจกำลังตั้งรับและเครียดมาก ควรหลีกเลี่ยงการเข้าใกล้เกินไป"
      }
    };
  }

  if (
    (has("eyes_wide") || has("pupils_large")) &&
    (has("ears_side") || has("body_low"))
  ) {
    return {
      title: {
        ja: "軽い警戒の可能性",
        en: "Possible Mild Alertness",
        th: "อาจกำลังระวังตัวเล็กน้อย"
      },
      message: {
        ja: "目が大きく、耳が横向きだったり体が低かったりするので、少し警戒している可能性があります。周りの音や人、環境を気にしているのかもしれません。",
        en: "With wide eyes plus sideways ears or a low body posture, your cat may be slightly alert or cautious. They may be reacting to the environment.",
        th: "เมื่อตาเบิกกว้าง พร้อมหูหันออกข้างหรือลำตัวต่ำ น้องอาจกำลังระวังตัวเล็กน้อย และกำลังสนใจสิ่งรอบตัว"
      }
    };
  }

  if (
    has("loaf") &&
    !has("ears_back") &&
    !has("tail_fast")
  ) {
    return {
      title: {
        ja: "安心して休んでいる可能性",
        en: "Possible Calm Resting",
        th: "อาจกำลังพักอย่างสงบ"
      },
      message: {
        ja: "香箱座りで、強い緊張サインもないので、今は落ち着いて休んでいる可能性があります。",
        en: "With a loaf position and no strong tension signs, your cat may be calmly resting right now.",
        th: "เมื่ออยู่ในท่านั่งเก็บขา และไม่มีสัญญาณตึงเครียดชัดเจน น้องอาจกำลังพักอย่างสงบ"
      }
    };
  }

  if (
    has("belly_up") &&
    has("slow_blink")
  ) {
    return {
      title: {
        ja: "かなり安心している可能性",
        en: "Possible Strong Sense of Safety",
        th: "อาจกำลังรู้สึกปลอดภัยมาก"
      },
      message: {
        ja: "お腹を見せながらゆっくり瞬きをしているので、かなり安心している可能性があります。ただし、お腹を触ってほしいとは限りません。",
        en: "With a belly-up posture and a slow blink, your cat may feel very safe. But this does not always mean they want belly rubs.",
        th: "เมื่อโชว์พุงพร้อมกะพริบตาช้าๆ น้องอาจรู้สึกปลอดภัยมาก แต่ไม่ได้แปลว่าอยากให้จับพุงเสมอไป"
      }
    };
  }

  if (
    has("paw_tense") &&
    (has("eyes_wide") || has("pupils_large"))
  ) {
    return {
      title: {
        ja: "緊張しながら集中している可能性",
        en: "Possible Focus with Tension",
        th: "อาจกำลังจดจ่อพร้อมความตึงเครียด"
      },
      message: {
        ja: "前足に力が入り、目も大きいので、緊張しながら何かに集中している可能性があります。遊びの前か、警戒中かもしれません。",
        en: "With tense front paws and wide eyes, your cat may be focused while slightly tense. This could be before play or while staying alert.",
        th: "เมื่อขาหน้าเกร็งและตาเบิกกว้าง น้องอาจกำลังจดจ่อพร้อมความตึงเครียดเล็กน้อย อาจเป็นก่อนเล่นหรือกำลังระวังตัว"
      }
    };
  }

  return {
    title: {
      ja: uiText.ja.hardToJudge,
      en: uiText.en.hardToJudge,
      th: uiText.th.hardToJudge
    },
    message: {
      ja: uiText.ja.notEnough,
      en: uiText.en.notEnough,
      th: uiText.th.notEnough
    }
  };
}

function renderResult(result, selected) {
  const selectedItems = Object.entries(selected)
    .map(([groupKey, optionKey]) => {
      const group = featuresData.find((g) => g.group === groupKey);
      if (!group) return "";

      const option = group.options.find((o) => o.key === optionKey);
      if (!option) return "";

      return `
        <li>
          <strong>${getGroupLabel(group)}:</strong> ${getOptionText(option)}
        </li>
      `;
    })
    .join("");

  resultBox.innerHTML = `
    <div class="result-card">
      <h3>${result.title[currentLang]}</h3>
      <p>${result.message[currentLang]}</p>
      ${
        selectedItems
          ? `
          <p><strong>${text("selectedFeatures")}</strong></p>
          <ul>${selectedItems}</ul>
          `
          : ""
      }
    </div>
  `;
}

if (langSelect) {
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    updateStaticText();
    renderManualSelectors();
    resultBox.innerHTML = "";
  });
}

if (imageInput) {
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (!file) {
      if (fileStatus) {
        fileStatus.textContent = text("fileNone");
        delete fileStatus.dataset.hasFile;
      }
      return;
    }

    if (fileStatus) {
      fileStatus.textContent = file.name;
      fileStatus.dataset.hasFile = "true";
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}

loadFeatures();

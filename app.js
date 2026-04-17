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
    selectedFeatures: "選んだ特徴",
    whyTitle: "なぜこの判定？",
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
    selectedFeatures: "Selected Features",
    whyTitle: "Why this result?",
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
    selectedFeatures: "ลักษณะที่เลือก",
    whyTitle: "ทำไมจึงวิเคราะห์แบบนี้?",
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
        ja: "不安や恐怖を感じている可能性があります。まずはそっとして安心できる距離を取りましょう。",
        en: "Your cat may be feeling anxious or scared. Give them space and help them feel safe.",
        th: "น้องอาจกำลังกังวลหรือกลัว ควรเว้นระยะและช่วยให้น้องรู้สึกปลอดภัย"
      },
      why: {
        ja: "耳が後ろや横を向き、しっぽを巻き、体も低くしているためです。",
        en: "Because the ears are back or sideways, the tail is tucked, and the body is low.",
        th: "เพราะหูพับหรือหันออกข้าง หางหุบ และลำตัวต่ำ"
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
        ja: "何かに強く興味を持って集中している可能性があります。遊びや観察モードかもしれません。",
        en: "Your cat may be highly focused and interested in something. This may be play or hunting mode.",
        th: "น้องอาจกำลังสนใจบางอย่างมาก และอยู่ในโหมดเล่นหรือจ้องเหยื่อ"
      },
      why: {
        ja: "目が大きく、耳が前向きで、しっぽの先だけ動いているためです。",
        en: "Because the eyes are wide, the ears are forward, and the tail tip is moving.",
        th: "เพราะตาเบิกกว้าง หูชี้ไปข้างหน้า และปลายหางขยับ"
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
        ja: "かなりリラックスしていて、あなたを信頼している可能性があります。",
        en: "Your cat may be quite relaxed and trusting.",
        th: "น้องอาจกำลังผ่อนคลายและไว้ใจคุณมาก"
      },
      why: {
        ja: "ゆっくり瞬きに加えて、しっぽを立てる、香箱座り、伸びのような安心寄りのサインがあるためです。",
        en: "Because there is a slow blink along with calm signs such as an upright tail, loaf position, or stretching.",
        th: "เพราะมีการกะพริบตาช้าๆ ร่วมกับสัญญาณผ่อนคลาย เช่น หางตั้ง นั่งเก็บขา หรือยืดตัว"
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
        ja: "安心して甘えたい気分かもしれません。",
        en: "Your cat may feel safe and affectionate.",
        th: "น้องอาจกำลังรู้สึกปลอดภัยและอยากอ้อน"
      },
      why: {
        ja: "ふみふみに加えて、ゆっくり瞬き、しっぽを立てる、お腹を見せるなどの安心サインがあるためです。",
        en: "Because kneading appears together with safe signs like a slow blink, upright tail, or belly-up posture.",
        th: "เพราะมีการนวดร่วมกับสัญญาณปลอดภัย เช่น กะพริบตาช้าๆ หางตั้ง หรือโชว์พุง"
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
        ja: "不快やイライラのサインかもしれません。今は無理に触らない方がよさそうです。",
        en: "Your cat may be irritated or uncomfortable. It is better not to touch them right now.",
        th: "น้องอาจกำลังหงุดหงิดหรือไม่สบายใจ ตอนนี้ไม่ควรฝืนจับ"
      },
      why: {
        ja: "耳が後ろや横を向き、しっぽを激しく振っているためです。",
        en: "Because the ears are back or sideways and the tail is swishing fast.",
        th: "เพราะหูพับหรือหันออกข้าง และหางสะบัดแรง"
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
        ja: "防御的でかなり緊張している可能性があります。近づきすぎない方が安全です。",
        en: "Your cat may be defensive and highly tense. It is safer not to get too close.",
        th: "น้องอาจกำลังตั้งรับและเครียดมาก ควรหลีกเลี่ยงการเข้าใกล้เกินไป"
      },
      why: {
        ja: "耳が後ろ向きで、しっぽを激しく振り、体も低くしているためです。",
        en: "Because the ears are back, the tail is swishing fast, and the body is low.",
        th: "เพราะหูพับ หางสะบัดแรง และลำตัวต่ำ"
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
        ja: "少し警戒している可能性があります。周りの音や人、環境を気にしているのかもしれません。",
        en: "Your cat may be slightly alert or cautious. They may be reacting to the environment.",
        th: "น้องอาจกำลังระวังตัวเล็กน้อย และกำลังสนใจสิ่งรอบตัว"
      },
      why: {
        ja: "目が大きく、耳が横向きだったり体が低かったりするためです。",
        en: "Because the eyes are wide and there are cautious signs such as sideways ears or a low body posture.",
        th: "เพราะตาเบิกกว้าง และมีสัญญาณระวังตัว เช่น หูหันออกข้างหรือลำตัวต่ำ"
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
        ja: "今は落ち着いて休んでいる可能性があります。",
        en: "Your cat may be calmly resting right now.",
        th: "น้องอาจกำลังพักอย่างสงบ"
      },
      why: {
        ja: "香箱座りで、強い緊張サインが見られないためです。",
        en: "Because the cat is in a loaf position and there are no strong tension signs.",
        th: "เพราะน้องอยู่ในท่านั่งเก็บขา และไม่มีสัญญาณตึงเครียดชัดเจน"
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
        ja: "かなり安心している可能性があります。ただし、お腹を触ってほしいとは限りません。",
        en: "Your cat may feel very safe. But this does not always mean they want belly rubs.",
        th: "น้องอาจรู้สึกปลอดภัยมาก แต่ไม่ได้แปลว่าอยากให้จับพุงเสมอไป"
      },
      why: {
        ja: "お腹を見せながら、ゆっくり瞬きをしているためです。",
        en: "Because the cat is showing the belly while also slow blinking.",
        th: "เพราะน้องโชว์พุงพร้อมกับกะพริบตาช้าๆ"
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
        ja: "緊張しながら何かに集中している可能性があります。遊びの前か、警戒中かもしれません。",
        en: "Your cat may be focused while slightly tense. This could be before play or while staying alert.",
        th: "น้องอาจกำลังจดจ่อพร้อมความตึงเครียดเล็กน้อย อาจเป็นก่อนเล่นหรือกำลังระวังตัว"
      },
      why: {
        ja: "前足に力が入り、目も大きく開いているためです。",
        en: "Because the front paws look tense and the eyes are wide.",
        th: "เพราะขาหน้าเกร็งและตาเบิกกว้าง"
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
    },
    why: {
      ja: "まだ選ばれた特徴が少なく、組み合わせの情報が足りません。",
      en: "There are not enough selected features yet to make a clearer guess.",
      th: "ยังมีลักษณะที่เลือกไม่พอสำหรับการวิเคราะห์ที่ชัดเจนขึ้น"
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
      <p><strong>${text("whyTitle")}</strong></p>
      <p>${result.why[currentLang]}</p>
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

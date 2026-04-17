const API_URL = "https://あなたのVercelURL/api/analyze-cat"; // ←ここだけ変更

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const resultBox = document.getElementById("result");
const manualArea = document.getElementById("manualArea");

let currentImageBase64 = "";
let currentMimeType = "";

// ----------------
// 画像選択
// ----------------
imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const dataUrl = reader.result;
    currentImageBase64 = dataUrl.split(",")[1];
    currentMimeType = file.type;

    preview.innerHTML = `<img src="${dataUrl}" style="max-width:100%;">`;
  };

  reader.readAsDataURL(file);
});

// ----------------
// AIボタン作成
// ----------------
const aiButton = document.createElement("button");
aiButton.textContent = "AIで解析";
aiButton.onclick = analyzePhotoWithAI;
manualArea.appendChild(aiButton);

// ----------------
// AI解析
// ----------------
async function analyzePhotoWithAI() {
  if (!currentImageBase64) {
    alert("先に画像を選んでください");
    return;
  }

  resultBox.innerHTML = "AI解析中...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageBase64: currentImageBase64,
        mimeType: currentMimeType
      })
    });

    const data = await res.json();

    console.log(data);

    applyAI(data.features);

    analyzeSelection();

  } catch (err) {
    console.error(err);
    resultBox.innerHTML = "エラー";
  }
}

// ----------------
// AI → セレクト反映
// ----------------
const aiMap = {
  ears: {
    forward: "ears_forward",
    sideways: "ears_side",
    back: "ears_back"
  },
  eyes: {
    soft: "eyes_narrow",
    wide: "eyes_wide"
  },
  pupils: {
    large: "pupils_large"
  },
  tail: {
    up: "tail_up",
    tucked: "tail_tucked"
  },
  body: {
    low: "body_low",
    relaxed: "loaf"
  }
};

function applyAI(features) {
  const selects = document.querySelectorAll("select");

  selects.forEach(select => {
    const group = select.dataset.group;
    const val = features[group];

    if (!val) return;

    const mapped = aiMap[group]?.[val];

    if (mapped) {
      select.value = mapped;
    }
  });
}

// ----------------
// 判定
// ----------------
function analyzeSelection() {
  const selects = document.querySelectorAll("select");
  const selected = [];

  selects.forEach(s => {
    if (s.value) selected.push(s.value);
  });

  if (selected.length === 0) {
    resultBox.innerHTML = "選択してください";
    return;
  }

  if (selected.includes("ears_back") && selected.includes("tail_tucked")) {
    resultBox.innerHTML = "😿 不安の可能性";
  } else if (selected.includes("tail_up")) {
    resultBox.innerHTML = "😺 リラックスの可能性";
  } else {
    resultBox.innerHTML = "😐 判定中...";
  }
}

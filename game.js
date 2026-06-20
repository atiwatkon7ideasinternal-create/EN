// ───────── เกมฝึกจำสระภาษาอังกฤษ (Spaced Repetition) ─────────

// ── ชุดไอคอน SVG (line style, ใช้สี currentColor) ──
const ICONS = {
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/>',
  check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14.1 9 11.1"/>',
  x: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.5.4.9 1 .9 1.6V17h6.2v-.7c0-.6.4-1.2.9-1.6A7 7 0 0 0 12 2z"/>',
  trophy: '<path d="M6 4h12v4a6 6 0 0 1-12 0V4z"/><path d="M6 6H3v1a3 3 0 0 0 3 3"/><path d="M18 6h3v1a3 3 0 0 1-3 3"/><line x1="12" y1="14" x2="12" y2="18"/><path d="M8 21h8"/><path d="M10 18h4l1 3H9z"/>',
  repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};
function icon(name) {
  return `<span class="icon"><svg viewBox="0 0 24 24" fill="none">${ICONS[name] || ""}</svg></span>`;
}
function injectIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
}

const MASTERY_KEY = "vowel_mastery_v1"; // เก็บความแม่นของแต่ละสระข้ามรอบ/ข้ามวัน
const HI_KEY = "vowel_hi";
const MASTERED_BOX = 4;   // box >= 4 ถือว่า "แม่นแล้ว"
const MAX_BOX = 5;
const MAX_REASK = 2;      // ถามซ้ำในรอบเดียวได้ไม่เกินกี่ครั้งต่อตัว

// สถานะเกม
const state = {
  mode: "quiz",
  group: "all",
  focusWeak: false,
  typeMode: false,     // โหมดพิมพ์เอง (ใช้กับโหมดสะกดคำ)
  queue: [],
  index: 0,
  correctFirst: 0,     // ตอบถูก "ครั้งแรก" (ใช้คิดคะแนน/เปอร์เซ็นต์ = recall จริง)
  wrongFirst: [],      // ตัวที่ตอบผิดครั้งแรก (ไว้ทบทวน)
  attempted: new Set(),// id ที่เคยเจอแล้วในรอบนี้
  reask: {},           // นับจำนวนครั้งที่ re-queue ต่อ id
  totalUnique: 0,
  answered: false,
};

// ── Helpers ──
const $ = (id) => document.getElementById(id);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const showScreen = (id) => {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
};

// ── ความแม่น (Leitner box) ──
function loadMastery() {
  try { return JSON.parse(localStorage.getItem(MASTERY_KEY)) || {}; }
  catch { return {}; }
}
function saveMastery(m) { localStorage.setItem(MASTERY_KEY, JSON.stringify(m)); }
function getBox(id) { return loadMastery()[id]?.box ?? 0; }

// อัปเดตเฉพาะตอนตอบ "ครั้งแรก" ของรอบ — สะท้อนการจำจริง
function updateMastery(id, correct) {
  const m = loadMastery();
  const cur = m[id] || { box: 0, seen: 0, correct: 0 };
  cur.seen++;
  if (correct) { cur.correct++; cur.box = Math.min(MAX_BOX, cur.box + 1); }
  else { cur.box = Math.max(0, cur.box - 2); } // ผิดแล้วถอยเยอะ → กลับมาถามถี่
  m[id] = cur;
  saveMastery(m);
}

// ── เสียง (Web Speech API) — ใช้เสียงเดียวคงที่ ฟังสม่ำเสมอ ──
let EN_VOICE = null;
function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  const all = speechSynthesis.getVoices().filter((v) => /en[-_]/i.test(v.lang));
  // เลือกเสียงเดียวที่คงที่ตลอดเกม — เน้น en-US ถ้ามี
  EN_VOICE = all.find((v) => /en[-_]US/i.test(v.lang)) || all[0] || null;
}
if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.addEventListener("voiceschanged", loadVoices);
}
const RATE_NORMAL = 0.85;
const RATE_SOUNDOUT = 0.5; // ช้าลงตอน "อ่านออกเสียงสระก่อนถาม"
function speak(text, rate = RATE_NORMAL) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  if (EN_VOICE) u.voice = EN_VOICE;
  speechSynthesis.speak(u);
}
// สุ่มคำตัวอย่าง = ได้ยินสระในหลายคำ (ช่วยจำ)
function randomExample(v) {
  return v.examples[Math.floor(Math.random() * v.examples.length)];
}

// ── หน้าเริ่มต้น: การ์ดเลือกหมวดสระ ──
function buildGroupOptions() {
  const wrap = $("group-options");
  const counts = {};
  VOWELS.forEach((v) => { counts[v.group] = (counts[v.group] || 0) + 1; });

  const items = [
    ["all", { title: "ทุกกลุ่ม", ex: "เล่นรวมทุกหมวด" }, VOWELS.length],
    ...Object.entries(GROUP_LABELS).map(([k, info]) => [k, info, counts[k] || 0]),
  ];

  wrap.innerHTML = items
    .map(([key, info, n], i) => `
      <button class="group-card${i === 0 ? " active" : ""}" data-group="${key}">
        <span class="gc-main">
          <span class="gc-title">${info.title}</span>
          <span class="gc-ex">${info.ex}</span>
        </span>
        <span class="gc-count">${n}</span>
      </button>`)
    .join("");

  wrap.querySelectorAll(".group-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".group-card").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.group = btn.dataset.group;
    });
  });
}

// เลือกโหมด
$("mode-options").querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("mode-options").querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;
  });
});

// toggle "เน้นคำที่ยังไม่แม่น"
$("focus-weak").addEventListener("click", () => {
  state.focusWeak = !state.focusWeak;
  $("focus-weak").classList.toggle("active", state.focusWeak);
});

// toggle "พิมพ์เอง"
$("type-mode").addEventListener("click", () => {
  state.typeMode = !state.typeMode;
  $("type-mode").classList.toggle("active", state.typeMode);
});

// ── สรุปความแม่นรวม + คะแนนสูงสุด ──
function renderHiScore() {
  const m = loadMastery();
  const mastered = VOWELS.filter((v) => (m[v.id]?.box ?? 0) >= MASTERED_BOX).length;
  const total = VOWELS.length;
  const pct = Math.round((mastered / total) * 100);
  $("mastery-summary").innerHTML = `
    <div class="mastery-label"><span>ความคืบหน้าการจำ</span><span><b>${mastered}</b> / ${total} ตัว แม่นแล้ว</span></div>
    <div class="mastery-bar"><div class="mastery-fill" style="width:${pct}%"></div></div>`;
  const hi = localStorage.getItem(HI_KEY);
  $("hi-score").innerHTML = hi ? `${icon("trophy")} คะแนนสูงสุด: ${hi}%` : "";
}

// ── เลือกชุดคำถาม (เรียงคำอ่อนมาก่อน) ──
function weakFirstOrder(list) {
  // box ต่ำ (ยังไม่แม่น/ยังไม่เคยเจอ) จะมาก่อน + ใส่ความสุ่มเล็กน้อย
  return [...list]
    .map((v) => ({ v, k: getBox(v.id) + Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.v);
}

function buildPool() {
  let base = state.group === "all" ? VOWELS : VOWELS.filter((v) => v.group === state.group);
  if (state.focusWeak) {
    const weak = base.filter((v) => getBox(v.id) < MASTERED_BOX);
    return weak.length ? weak : base; // ถ้าแม่นหมดแล้ว เล่นทั้งหมด
  }
  return base;
}

// ── เริ่มเกม ──
function startGame(pool) {
  const list = pool || buildPool();
  state.queue = weakFirstOrder(list);
  state.index = 0;
  state.correctFirst = 0;
  state.wrongFirst = [];
  state.attempted = new Set();
  state.reask = {};
  state.totalUnique = list.length;
  showScreen("screen-quiz");
  renderQuestion();
}

// เสียงสระไทยที่ "สับสนง่าย" — ใช้เป็นตัวลวงเพื่อฝึกแยกแยะละเอียด (desirable difficulty)
const THAI_CONFUSE = {
  "อี": ["เอ", "อู", "ยู", "เอีย"],
  "อู": ["อุ", "โอ", "ยู"],
  "อุ": ["อู", "โอ"],
  "เอ": ["อี", "ไอ", "แอร์"],
  "โอ": ["ออ", "อู", "เอา"],
  "ออ": ["โอ", "เอา", "อา"],
  "เอา": ["ออ", "อา", "ออย"],
  "ออย": ["ออ", "ไอ", "เอา"],
  "ไอ": ["ออย", "เอา", "เอ"],
  "อา": ["เอา", "ออ", "เออ"],
  "เออ": ["ออ", "อา", "แอร์"],
  "ยู": ["อู", "อุ", "อี"],
  "แอร์": ["เออ", "เอ", "เอีย"],
  "เอีย": ["แอร์", "อี", "เออ"],
};

// ตัวลวงที่ดีของแต่ละข้อ: เสียง/การสะกดที่ผู้เรียนมักสับสน
function preferredDistractors(v, mode) {
  if (mode === "spell") {
    // สำคัญ: สระที่ออกเสียงเดียวกันแต่สะกดต่างกัน (ai/ay/a-e) คือจุดที่สับสนจริง
    const sameSound = VOWELS.filter((x) => x.thai === v.thai && x.spellAnswer !== v.spellAnswer)
      .map((x) => x.spellAnswer);
    const nearThai = THAI_CONFUSE[v.thai] || [];
    const nearSound = VOWELS.filter((x) => nearThai.includes(x.thai))
      .map((x) => x.spellAnswer);
    return [...sameSound, ...nearSound];
  }
  return THAI_CONFUSE[v.thai] || [];
}

// ── สร้างตัวเลือก (ถูก 1 + ลวงที่สับสนง่ายก่อน แล้วเติมที่เหลือแบบสุ่ม) ──
function makeChoices(correctVal, allValues, preferred = []) {
  const present = new Set(allValues);
  const pick = [];
  const used = new Set([correctVal]);
  // 1) เลือกตัวลวงที่สับสนง่ายก่อน (สูงสุด 2 ตัว)
  for (const p of shuffle(preferred)) {
    if (pick.length >= 2) break;
    if (p !== correctVal && present.has(p) && !used.has(p)) { pick.push(p); used.add(p); }
  }
  // 2) เติมที่เหลือจากตัวเลือกทั้งหมดแบบสุ่ม
  for (const p of shuffle([...new Set(allValues)])) {
    if (pick.length >= 3) break;
    if (!used.has(p)) { pick.push(p); used.add(p); }
  }
  return shuffle([correctVal, ...pick]);
}

// ── แสดงคำถาม ──
function renderQuestion() {
  state.answered = false;
  const v = state.queue[state.index];
  const isReview = state.attempted.has(v.id);

  $("ipa-text").textContent = v.ipa; // แสดงสัญลักษณ์เสียง IPA ใต้สระ
  $("progress-text").textContent = `คืบหน้า ${state.attempted.size} / ${state.totalUnique}`;
  $("score-text").textContent = `คะแนน: ${state.correctFirst}`;
  $("progress-fill").style.width = `${(state.attempted.size / state.totalUnique) * 100}%`;
  $("review-badge").classList.toggle("hidden", !isReview);
  $("feedback").innerHTML = "";
  $("btn-next").classList.add("hidden");

  if (state.mode === "quiz") renderQuizQuestion(v);
  else renderSpellQuestion(v);
}

function renderQuizQuestion(v) {
  $("question").innerHTML = v.display;
  $("ask-text").innerHTML = "สระนี้ตรงกับสระไทยตัวไหน?";
  const word = randomExample(v); // คำต่างกันแต่ละครั้ง = บริบทหลากหลาย
  $("btn-audio").onclick = () => speak(randomExample(v));
  speak(word, RATE_SOUNDOUT); // อ่านออกเสียงช้า ๆ ก่อนถาม → ได้ยินสระชัด
  const choices = makeChoices(v.thai, VOWELS.map((x) => x.thai), preferredDistractors(v, "quiz"));
  renderChoiceButtons(choices, v.thai, v);
}

function renderSpellQuestion(v) {
  const masked = v.spellWord.replace(v.spellAnswer, `<span class="spell-blank">__</span>`);
  $("question").innerHTML = `<span class="spell-word">${masked}</span>`;
  $("ask-text").innerHTML = `เสียงสระ: <span class="thai-hint">${v.thai}</span> — เติมสระที่หาย`;
  $("btn-audio").onclick = () => speak(v.spellWord);
  speak(v.spellWord, RATE_SOUNDOUT); // อ่านช้า ๆ ก่อน ให้ได้ยินสระที่ต้องเติม

  if (state.typeMode) renderTypeInput(v);
  else {
    const choices = makeChoices(v.spellAnswer, VOWELS.map((x) => x.spellAnswer), preferredDistractors(v, "spell"));
    renderChoiceButtons(choices, v.spellAnswer, v);
  }
}

// โหมดพิมพ์เอง (generation effect) — ผลิตคำตอบเองจำได้ลึกกว่าการเลือก
function renderTypeInput(v) {
  const wrap = $("choices");
  wrap.innerHTML = `
    <div class="type-row">
      <input id="type-input" class="type-input" type="text" autocomplete="off"
             autocapitalize="off" spellcheck="false" placeholder="พิมพ์สระ เช่น ${v.spellAnswer.length} ตัวอักษร" />
      <button id="type-submit" class="btn-secondary type-submit">ตอบ</button>
    </div>`;
  const input = $("type-input");
  input.focus();
  const submit = () => {
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    handleAnswer(null, val, v.spellAnswer, v, wrap);
  };
  $("type-submit").addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
}

function renderChoiceButtons(choices, correctVal, v) {
  const wrap = $("choices");
  wrap.innerHTML = "";
  choices.forEach((val) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = val;
    btn.addEventListener("click", () => handleAnswer(btn, val, correctVal, v, wrap));
    wrap.appendChild(btn);
  });
}

// ── ตรวจคำตอบ + spaced repetition ──
function handleAnswer(btn, picked, correctVal, v, wrap) {
  if (state.answered) return;
  state.answered = true;

  const isCorrect = picked === correctVal;
  const isFirst = !state.attempted.has(v.id);

  if (btn) {
    // โหมดเลือกตัวเลือก
    wrap.querySelectorAll(".choice").forEach((b) => {
      b.disabled = true;
      if (b.textContent === correctVal) b.classList.add("correct");
    });
    if (!isCorrect) btn.classList.add("wrong");
  } else {
    // โหมดพิมพ์เอง
    const input = $("type-input");
    if (input) { input.disabled = true; input.classList.add(isCorrect ? "input-ok" : "input-no"); }
    const sub = $("type-submit");
    if (sub) sub.disabled = true;
  }

  if (isFirst) {
    state.attempted.add(v.id);
    updateMastery(v.id, isCorrect); // นับเฉพาะครั้งแรก = recall จริง
    if (isCorrect) {
      state.correctFirst++;
      $("score-text").textContent = `คะแนน: ${state.correctFirst}`;
    } else {
      state.wrongFirst.push(v);
      scheduleReask(v); // ผิด → วนกลับมาถามอีกในรอบนี้
    }
  } else if (!isCorrect) {
    scheduleReask(v); // ทบทวนแล้วยังผิด → ถามซ้ำอีก (จำกัดจำนวน)
  }

  renderFeedback(isCorrect, v);
  $("btn-next").classList.remove("hidden");
}

// แทรกคำถามเดิมกลับเข้าคิวแบบ "ขยายช่วงห่าง" (expanding retrieval, Landauer & Bjork 1978)
// ครั้งแรกถามใกล้ ๆ ขณะยังจำได้ แล้วค่อยถามห่างขึ้นเพื่อให้ดึงความจำยากขึ้นทีละนิด
const REASK_OFFSETS = [2, 5, 9]; // ช่วงห่างตามจำนวนครั้งที่เคยถามซ้ำ
function scheduleReask(v) {
  const n = state.reask[v.id] || 0;
  if (n >= MAX_REASK) return;
  state.reask[v.id] = n + 1;
  const base = REASK_OFFSETS[n] ?? REASK_OFFSETS[REASK_OFFSETS.length - 1];
  const offset = base + Math.floor(Math.random() * 2);
  const pos = Math.min(state.index + offset, state.queue.length);
  state.queue.splice(pos, 0, v);
}

// ── เฉลย + ตัวอย่าง ──
function renderFeedback(isCorrect, v) {
  const wordHtml = v.examples.map((w) => highlightVowel(w, v)).join(", ");
  const sentenceHtml = v.sentence.replace(/\{(.+?)\}/, "<mark>$1</mark>");
  $("feedback").innerHTML = `
    <div class="fb-box">
      <div class="fb-result ${isCorrect ? "ok" : "no"}">
        ${isCorrect ? icon("check") + " ถูกต้อง!" : icon("x") + " ยังไม่ถูก"} — เสียง ${v.thai} ${v.ipa}
      </div>
      <div class="fb-word">คำ: ${wordHtml}</div>
      <div class="fb-sentence">
        <span>${sentenceHtml}</span>
        <button class="mini-audio" title="ฟังประโยค">${icon("volume")}</button>
      </div>
      <div class="fb-hint">${icon("bulb")} ${v.hint}</div>
    </div>`;
  const plain = v.sentence.replace(/[{}]/g, "");
  $("feedback").querySelector(".mini-audio").onclick = () => speak(plain);
}

function highlightVowel(word, v) {
  if (v.group === "magic-e") {
    const re = new RegExp(`(${v.spellAnswer})(.*?)(e)$`);
    if (re.test(word)) return word.replace(re, "<mark>$1</mark>$2<mark>$3</mark>");
  }
  return word.replace(v.spellAnswer, `<mark>${v.spellAnswer}</mark>`);
}

// ── ถัดไป ──
$("btn-next").addEventListener("click", () => {
  state.index++;
  if (state.index >= state.queue.length) showResult();
  else renderQuestion();
});

// ── หน้าสรุปผล ──
function showResult() {
  const total = state.totalUnique;
  const pct = Math.round((state.correctFirst / total) * 100);

  $("result-score").textContent = `ตอบถูกครั้งแรก ${state.correctFirst} / ${total}`;
  $("result-percent").textContent = `${pct}%`;
  $("result-detail").innerHTML =
    pct === 100 ? `เก่งมาก! จำได้ครบทุกตัว ${icon("star")}`
    : pct >= 70 ? `ดีมาก! อีกนิดเดียว ${icon("check")}`
    : `ฝึกอีกหน่อยนะ ลองกด 'เน้นคำที่ยังไม่แม่น' แล้วเล่นซ้ำ ${icon("repeat")}`;

  const hi = parseInt(localStorage.getItem(HI_KEY) || "0", 10);
  if (pct > hi) localStorage.setItem(HI_KEY, String(pct));

  const wrongCard = $("wrong-card");
  if (state.wrongFirst.length === 0) {
    wrongCard.classList.add("hidden");
  } else {
    wrongCard.classList.remove("hidden");
    $("wrong-list").innerHTML = state.wrongFirst
      .map((v) => `<li><b>${v.display}</b> → ${v.thai} <span>(${v.examples.slice(0, 2).join(", ")})</span></li>`)
      .join("");
  }
  $("btn-replay-wrong").classList.toggle("hidden", state.wrongFirst.length === 0);
  showScreen("screen-result");
}

// ── ปุ่มต่าง ๆ ──
$("btn-start").addEventListener("click", () => startGame());
$("btn-replay").addEventListener("click", () => startGame());
$("btn-replay-wrong").addEventListener("click", () => startGame(state.wrongFirst.slice()));
$("btn-home").addEventListener("click", () => { renderHiScore(); showScreen("screen-start"); });
$("btn-reset-stats").addEventListener("click", () => {
  if (confirm("ล้างสถิติการเรียนทั้งหมด? (ความแม่นของทุกสระจะรีเซ็ต)")) {
    localStorage.removeItem(MASTERY_KEY);
    localStorage.removeItem(HI_KEY);
    renderHiScore();
  }
});

// ── เริ่มต้น ──
buildGroupOptions();
injectIcons();
renderHiScore();

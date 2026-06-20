// ───────── โหมดคำศัพท์ Oxford 3000 ─────────
// ใช้ helper ร่วมจาก game.js: $, shuffle, showScreen, speak, playCorrect, playWrong, icon, RATE_SOUNDOUT
// currentSubject ถูกประกาศใน game.js (ค่าเริ่ม "vowel")

const VMASTERY_KEY = "vocab_mastery_v1";
const ROUND_SIZE = 10;
const NEW_PER_ROUND = 7;     // คำใหม่ต่อรอบ
const REVIEW_PER_ROUND = 3;  // คำทบทวนต่อรอบ
const V_MASTERED_BOX = 4;
const V_MAX_BOX = 5;

const vstate = { level: "A1", round: [], index: 0, correct: 0, wrong: [], answered: false };

// ── ความแม่นรายคำ (localStorage) ──
function vLoad() { try { return JSON.parse(localStorage.getItem(VMASTERY_KEY)) || {}; } catch { return {}; } }
function vSave(m) { try { localStorage.setItem(VMASTERY_KEY, JSON.stringify(m)); } catch { /* private/quota */ } }
function vGet(word) { return vLoad()[word]; }
function vUpdate(word, correct) {
  const m = vLoad();
  const cur = m[word] || { box: 0, seen: false, wrong: false, ts: 0 };
  cur.seen = true;
  cur.ts = Date.now(); // ใช้ดูความเก่า/ใหม่ของการเจอ
  if (correct) { cur.box = Math.min(V_MAX_BOX, cur.box + 1); if (cur.box >= 2) cur.wrong = false; }
  else { cur.box = 0; cur.wrong = true; }
  m[word] = cur;
  vSave(m);
}

const levelWords = (level) => VOCAB.filter((v) => v.level === level);

// ── สร้างรอบ: คำใหม่ 7 + ทบทวน 3 (เติมเต็มถ้าฝั่งใดหมด) ──
function buildRound(level) {
  const m = vLoad();
  const all = levelWords(level);
  const unseen = all.filter((v) => !(m[v.word]?.seen));            // คำใหม่ (ตามลำดับ list)
  const seen = all.filter((v) => m[v.word]?.seen);
  // ทบทวน: ผิดก่อน → box ต่ำ → เจอนานสุด
  const review = [...seen].sort((a, b) => {
    const A = m[a.word], B = m[b.word];
    const aw = A.wrong ? 1 : 0, bw = B.wrong ? 1 : 0;
    if (aw !== bw) return bw - aw;
    if (A.box !== B.box) return A.box - B.box;
    return (A.ts || 0) - (B.ts || 0);
  });

  let nNew = Math.min(NEW_PER_ROUND, unseen.length);
  let nRev = Math.min(REVIEW_PER_ROUND, review.length);
  let remain = ROUND_SIZE - nNew - nRev;
  if (remain > 0) { const more = Math.min(remain, unseen.length - nNew); nNew += more; remain -= more; }
  if (remain > 0) { const more = Math.min(remain, review.length - nRev); nRev += more; remain -= more; }

  return shuffle([...unseen.slice(0, nNew), ...review.slice(0, nRev)]);
}

// ── ตัวเลือก 4 ข้อ (ตัวลวงจากระดับเดียวกันก่อน) ──
function vChoices(v) {
  const same = VOCAB.filter((x) => x.level === v.level && x.thai !== v.thai).map((x) => x.thai);
  const others = VOCAB.filter((x) => x.thai !== v.thai).map((x) => x.thai);
  const pool = [...new Set(same.length >= 3 ? same : others)];
  return shuffle([v.thai, ...shuffle(pool).slice(0, 3)]);
}

// ── เริ่มรอบใหม่ (เล่นต่อไปเรื่อย ๆ จนครบทุกคำ) ──
function startVocabRound() {
  vstate.round = buildRound(vstate.level);
  if (!vstate.round.length) { alert("ระดับนี้ยังไม่มีคำให้เล่น"); return; }
  vstate.index = 0; vstate.correct = 0; vstate.wrong = [];
  showScreen("screen-quiz");
  renderVocabQuestion();
}
function startVocabWrong() {
  if (!vstate.wrong.length) return startVocabRound();
  vstate.round = shuffle(vstate.wrong.slice());
  vstate.index = 0; vstate.correct = 0; vstate.wrong = [];
  showScreen("screen-quiz");
  renderVocabQuestion();
}

function renderVocabQuestion() {
  vstate.answered = false;
  const v = vstate.round[vstate.index];
  const seenBefore = vGet(v.word)?.seen;

  $("ipa-text").textContent = "";
  $("progress-text").textContent = `คำที่ ${vstate.index + 1} / ${vstate.round.length}`;
  $("score-text").textContent = `คะแนน: ${vstate.correct}`;
  $("progress-fill").style.width = `${(vstate.index / vstate.round.length) * 100}%`;
  $("review-badge").classList.toggle("hidden", !seenBefore); // ป้าย "ทบทวน" ถ้าเคยเจอ
  $("feedback").innerHTML = "";
  $("btn-next").classList.add("hidden");

  $("question").innerHTML = `<span class="vocab-word">${v.word}</span> <span class="vocab-pos">${v.pos}</span>`;
  $("ask-text").innerHTML = `ระดับ <b>${v.level}</b> — คำนี้แปลว่าอะไร?`;
  $("btn-audio").onclick = () => speak(v.word);
  speak(v.word, RATE_SOUNDOUT);

  const wrap = $("choices");
  wrap.className = "choices choices-col"; // คำไทยยาว → คอลัมน์เดียว
  wrap.innerHTML = "";
  vChoices(v).forEach((t) => {
    const b = document.createElement("button");
    b.className = "choice choice-vocab";
    b.textContent = t;
    b.addEventListener("click", () => vocabAnswer(b, t, v, wrap));
    wrap.appendChild(b);
  });
}

function vocabAnswer(btn, picked, v, wrap) {
  if (vstate.answered) return;
  vstate.answered = true;
  const correct = picked === v.thai;
  if (correct) playCorrect(); else playWrong();

  wrap.querySelectorAll(".choice").forEach((b) => {
    b.disabled = true;
    if (b.textContent === v.thai) b.classList.add("correct");
  });
  if (!correct) btn.classList.add("wrong");

  vUpdate(v.word, correct);
  if (correct) { vstate.correct++; $("score-text").textContent = `คะแนน: ${vstate.correct}`; }
  else vstate.wrong.push(v);

  const ex = v.example.replace(/\{(.+?)\}/, "<mark>$1</mark>");
  $("feedback").innerHTML = `
    <div class="fb-box">
      <div class="fb-result ${correct ? "ok" : "no"}">
        ${correct ? icon("check") + " ถูกต้อง!" : icon("x") + " ยังไม่ถูก"} — <b>${v.word}</b> ${v.pos} = ${v.thai}
      </div>
      <div class="fb-sentence"><span>${ex}</span><button class="mini-audio" title="ฟังประโยค">${icon("volume")}</button></div>
      <div class="fb-hint">${icon("bulb")} ${v.explain}</div>
    </div>`;
  $("feedback").querySelector(".mini-audio").onclick = () => speak(v.example.replace(/[{}]/g, ""));
  $("btn-next").classList.remove("hidden");
  scrollToFeedback();
}

function vocabNext() {
  vstate.index++;
  if (vstate.index >= vstate.round.length) showVocabResult();
  else renderVocabQuestion();
}

function showVocabResult() {
  const total = vstate.round.length;
  const pct = Math.round((vstate.correct / total) * 100);
  $("result-score").textContent = `ตอบถูก ${vstate.correct} / ${total}`;
  $("result-percent").textContent = `${pct}%`;

  const all = levelWords(vstate.level), m = vLoad();
  const seen = all.filter((v) => m[v.word]?.seen).length;
  const mastered = all.filter((v) => (m[v.word]?.box ?? 0) >= V_MASTERED_BOX).length;
  const done = seen >= all.length;
  $("result-detail").innerHTML =
    `ระดับ ${vstate.level}: เห็นแล้ว <b>${seen}/${all.length}</b> · แม่น <b>${mastered}/${all.length}</b>` +
    (done ? " — เห็นครบทุกคำแล้ว! ทบทวนต่อจนแม่น 🎯" : " — เล่นรอบต่อไปเพื่อเจอคำใหม่");

  const wrongCard = $("wrong-card");
  if (vstate.wrong.length === 0) wrongCard.classList.add("hidden");
  else {
    wrongCard.classList.remove("hidden");
    $("wrong-list").innerHTML = vstate.wrong
      .map((v) => `<li><b>${v.word}</b> → ${v.thai} <span>(${v.pos})</span></li>`)
      .join("");
  }
  $("btn-replay-wrong").classList.toggle("hidden", vstate.wrong.length === 0);
  showScreen("screen-result");
}

// ── หน้าเริ่ม: การ์ดเลือกระดับ + ความคืบหน้า ──
function buildLevelOptions() {
  const wrap = $("level-options");
  if (!wrap) return;
  const m = vLoad();
  wrap.innerHTML = Object.entries(LEVEL_LABELS).map(([lv, info], i) => {
    const all = levelWords(lv);
    const seen = all.filter((v) => m[v.word]?.seen).length;
    return `
      <button class="group-card${i === 0 ? " active" : ""}" data-level="${lv}">
        <span class="gc-main"><span class="gc-title">${info.title}</span>
        <span class="gc-ex">${info.ex} · เห็นแล้ว ${seen}/${all.length}</span></span>
        <span class="gc-count">${all.length}</span>
      </button>`;
  }).join("");
  wrap.querySelectorAll(".group-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".group-card").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      vstate.level = btn.dataset.level;
    });
  });
}

function renderVocabProgress() {
  buildLevelOptions(); // อัปเดตตัวเลข "เห็นแล้ว" ทุกครั้ง
  const el = $("vocab-progress");
  if (!el) return;
  const m = vLoad();
  const total = VOCAB.length;
  const mastered = VOCAB.filter((v) => (m[v.word]?.box ?? 0) >= V_MASTERED_BOX).length;
  const pct = Math.round((mastered / total) * 100);
  el.innerHTML = `
    <div class="mastery-label"><span>คำศัพท์ที่แม่นแล้ว</span><span><b>${mastered}</b> / ${total} คำ</span></div>
    <div class="mastery-bar"><div class="mastery-fill" style="width:${pct}%"></div></div>`;
}

// ── สลับวิชา: สระ ↔ คำศัพท์ ──
function switchSubject(subject) {
  currentSubject = subject;
  const vocab = subject === "vocab";
  $("vowel-panel").classList.toggle("hidden", vocab);
  $("vocab-panel").classList.toggle("hidden", !vocab);
  $("btn-reset-stats").classList.toggle("hidden", vocab); // ปุ่มล้างสถิติเป็นของโหมดสระ
  if (vocab) renderVocabProgress();
}

(function initVocab() {
  const sub = $("subject-options");
  if (sub) {
    sub.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        sub.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        switchSubject(btn.dataset.subject);
      });
    });
  }
  buildLevelOptions();
})();

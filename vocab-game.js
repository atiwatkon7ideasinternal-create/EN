// ───────── โหมดคำศัพท์ Oxford 3000 (แยกระดับ → ชุด/ทบทวน) ─────────
// ใช้ helper ร่วมจาก game.js: $, shuffle, showScreen, speak, playCorrect, playWrong, icon, RATE_SOUNDOUT, scrollToFeedback
// currentSubject ถูกประกาศใน game.js (ค่าเริ่ม "vowel")

const VMASTERY_KEY = "vocab_mastery_v1";
const ROUND_SIZE = 10;
const NEW_PER_ROUND = 7;
const REVIEW_PER_ROUND = 3;
const DECK_SIZE = 20;        // คำต่อชุด
const V_MASTERED_BOX = 4;
const V_MAX_BOX = 5;

// scope = ขอบเขตที่กำลังเล่น: ชุด (deck) หรือ ทบทวน (review)
const vstate = { level: "A1", words: [], scopeLabel: "", scopeKey: "", round: [], index: 0, correct: 0, wrong: [], answered: false };

// ── ความแม่นรายคำ ──
function vLoad() { try { return JSON.parse(localStorage.getItem(VMASTERY_KEY)) || {}; } catch { return {}; } }
function vSave(m) { try { localStorage.setItem(VMASTERY_KEY, JSON.stringify(m)); } catch { /* private/quota */ } }
function vGet(word) { return vLoad()[word]; }
function vUpdate(word, correct) {
  const m = vLoad();
  const cur = m[word] || { box: 0, seen: false, wrong: false, ts: 0, n: 0 };
  cur.seen = true;
  cur.n = (cur.n || 0) + 1;     // จำนวนครั้งที่เล่นคำนี้
  cur.ts = Date.now();
  if (correct) { cur.box = Math.min(V_MAX_BOX, cur.box + 1); if (cur.box >= 2) cur.wrong = false; }
  else { cur.box = 0; cur.wrong = true; }
  m[word] = cur;
  vSave(m);
}

// ── ระดับ → คำ (เรียง A-Z) → ชุด ──
const byWord = (a, b) => a.word.localeCompare(b.word);
const levelWordsSorted = (level) => VOCAB.filter((v) => v.level === level).slice().sort(byWord);
function decksOf(level) {
  const ws = levelWordsSorted(level);
  const out = [];
  for (let i = 0; i < ws.length; i += DECK_SIZE) out.push(ws.slice(i, i + DECK_SIZE));
  return out;
}
// คำที่ "ต้องซ่อม" ในระดับ: เคยเจอแล้วแต่ยังไม่แม่น หรือเคยผิด
function reviewWordsOf(level) {
  const m = vLoad();
  return levelWordsSorted(level).filter((v) => {
    const s = m[v.word];
    return s && s.seen && ((s.box ?? 0) < V_MASTERED_BOX || s.wrong);
  });
}
const masteredCount = (words, m) => words.filter((v) => (m[v.word]?.box ?? 0) >= V_MASTERED_BOX).length;

// ── สร้างรอบจากชุดคำที่เลือก: ใหม่ 7 + ทบทวน 3 (เติมเต็มถ้าฝั่งใดหมด) ──
function buildRound(words) {
  const m = vLoad();
  const unseen = words.filter((v) => !(m[v.word]?.seen));
  const seen = words.filter((v) => m[v.word]?.seen);
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

function vChoices(v) {
  const same = VOCAB.filter((x) => x.level === v.level && x.thai !== v.thai).map((x) => x.thai);
  const others = VOCAB.filter((x) => x.thai !== v.thai).map((x) => x.thai);
  const pool = [...new Set(same.length >= 3 ? same : others)];
  return shuffle([v.thai, ...shuffle(pool).slice(0, 3)]);
}

// ── เริ่มรอบ (จาก scope ที่เลือก) ──
function startVocabRound() {
  if (!vstate.words.length) { alert("เลือกชุดที่จะเล่นก่อนนะ"); return; }
  vstate.round = buildRound(vstate.words);
  if (!vstate.round.length) { alert("ชุดนี้ไม่มีคำให้เล่นแล้ว"); return; }
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
  $("review-badge").classList.toggle("hidden", !seenBefore);
  $("feedback").innerHTML = "";
  $("btn-next").classList.add("hidden");

  $("question").innerHTML = `<span class="vocab-word">${v.word}</span> <span class="vocab-pos">${v.pos}</span>`;
  $("ask-text").innerHTML = `${vstate.scopeLabel} — คำนี้แปลว่าอะไร?`;
  $("btn-audio").onclick = () => speak(v.word);
  speak(v.word, RATE_SOUNDOUT);

  const wrap = $("choices");
  wrap.className = "choices"; // แถวละ 2 คำ
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
      <div class="fb-result ${correct ? "ok" : "no"}">${correct ? icon("check") + " ถูกต้อง!" : icon("x") + " ยังไม่ถูก"}</div>
      <div class="fb-answer"><b>${v.word}</b> <span class="fb-pos">${v.pos}</span> = ${v.thai}</div>
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

  const m = vLoad();
  const seen = vstate.words.filter((v) => m[v.word]?.seen).length;
  const mastered = masteredCount(vstate.words, m);
  const done = seen >= vstate.words.length;
  $("result-detail").innerHTML =
    `${vstate.scopeLabel}: เห็นแล้ว <b>${seen}/${vstate.words.length}</b> · แม่น <b>${mastered}/${vstate.words.length}</b>` +
    (done ? " — เห็นครบแล้ว ทบทวนต่อจนแม่น 🎯" : " — เล่นต่อเพื่อเจอคำใหม่");

  const wrongCard = $("wrong-card");
  if (vstate.wrong.length === 0) wrongCard.classList.add("hidden");
  else {
    wrongCard.classList.remove("hidden");
    $("wrong-list").innerHTML = vstate.wrong
      .map((v) => `<li><b>${v.word}</b> → ${v.thai} <span>(${v.pos})</span></li>`)
      .join("");
  }
  $("btn-replay-wrong").classList.toggle("hidden", vstate.wrong.length === 0);
  $("btn-home").textContent = "← กลับไปหน้าชุด";
  showScreen("screen-result");
}

// ── หน้าเริ่ม: เลือกระดับ (แท็บ) → เลือกชุด/ทบทวน (การ์ด) ──
function buildLevelTabs() {
  const wrap = $("level-tabs");
  if (!wrap) return;
  wrap.innerHTML = Object.keys(LEVEL_LABELS)
    .map((lv) => `<button class="chip${lv === vstate.level ? " active" : ""}" data-level="${lv}">${lv}</button>`)
    .join("");
  wrap.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      vstate.level = btn.dataset.level;
      wrap.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      buildDeckOptions(); // เปลี่ยนระดับ → โหลดชุดใหม่
    });
  });
}

// เปิดหน้ารายละเอียดชุด (ดูคำในชุด + สถิติ)
function openDeckDetail(words, label) {
  vstate.words = words;
  vstate.scopeLabel = label;
  renderDeckDetail();
  showScreen("screen-deck");
}
function renderDeckDetail() {
  const m = vLoad();
  $("deck-title").textContent = vstate.scopeLabel;
  const mastered = masteredCount(vstate.words, m);
  $("deck-mastered").textContent = `แม่น ${mastered}/${vstate.words.length}`;
  $("deck-fill").style.width = `${(mastered / vstate.words.length) * 100}%`;
  $("deck-word-list").innerHTML = vstate.words.map((v) => {
    const s = m[v.word];
    const box = s?.box ?? 0;
    const n = s?.n ?? 0;
    const done = box >= V_MASTERED_BOX;
    return `
      <li class="word-row${done ? " word-done" : ""}">
        <div class="wr-main"><span class="wr-en">${v.word} <span class="wr-pos">${v.pos}</span></span>
        <span class="wr-th">${v.thai}</span></div>
        <div class="wr-meta">
          <span class="wr-times">เล่น ${n} ครั้ง</span>
          <span class="wr-box">${done ? icon("check") + " แม่น" : "ระดับ " + box + "/" + V_MASTERED_BOX}</span>
        </div>
      </li>`;
  }).join("");
}

function buildDeckOptions() {
  const wrap = $("deck-options");
  if (!wrap) return;
  const m = vLoad();
  const level = vstate.level;
  const decks = decksOf(level);
  const review = reviewWordsOf(level);

  let html = "";
  if (review.length) {
    html += `
      <button class="group-card review-card" data-scope="review">
        <span class="gc-main"><span class="gc-title">${icon("repeat")} ทบทวนคำที่ต้องซ่อม</span>
        <span class="gc-ex">คำที่ผิด/ยังไม่แม่นในระดับ ${level}</span></span>
        <span class="gc-count">${review.length}</span>
      </button>`;
  }
  html += decks.map((deck, i) => {
    const first = deck[0].word, last = deck[deck.length - 1].word;
    const mc = masteredCount(deck, m);
    const passed = mc === deck.length;
    return `
      <button class="group-card${passed ? " deck-done" : ""}" data-scope="deck" data-index="${i}">
        <span class="gc-main"><span class="gc-title">ชุด ${i + 1}${passed ? " " + icon("check") : ""}</span>
        <span class="gc-ex">${first}–${last} · แม่น ${mc}/${deck.length}</span></span>
        <span class="gc-count">${deck.length}</span>
      </button>`;
  }).join("");
  wrap.innerHTML = html;

  // กดการ์ด → เปิดหน้ารายละเอียดชุด
  wrap.querySelectorAll(".group-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.scope === "review") openDeckDetail(reviewWordsOf(level), `ทบทวน ${level}`);
      else { const i = +btn.dataset.index; openDeckDetail(decks[i], `${level} ชุด ${i + 1}`); }
    });
  });
}

function renderVocabProgress() {
  buildLevelTabs();
  buildDeckOptions();
  const el = $("vocab-progress");
  if (!el) return;
  const m = vLoad();
  const total = VOCAB.length;
  const mastered = VOCAB.filter((v) => (m[v.word]?.box ?? 0) >= V_MASTERED_BOX).length;
  const pct = Math.round((mastered / total) * 100);
  el.innerHTML = `
    <div class="mastery-label"><span>คำศัพท์ที่แม่นแล้ว (รวม)</span><span><b>${mastered}</b> / ${total} คำ</span></div>
    <div class="mastery-bar"><div class="mastery-fill" style="width:${pct}%"></div></div>`;
}

// ── สลับวิชา ──
function switchSubject(subject) {
  currentSubject = subject;
  const vocab = subject === "vocab";
  document.body.classList.toggle("vocab-mode", vocab);
  $("vowel-panel").classList.toggle("hidden", vocab);
  $("vocab-panel").classList.toggle("hidden", !vocab);
  $("btn-reset-stats").classList.toggle("hidden", vocab);
  if (vocab) renderVocabProgress();
}

// กลับไปหน้ารายละเอียดชุดที่เล่นอยู่ (อัปเดตสถิติ/สีเขียวล่าสุด)
function backToDeck() {
  if (vstate.words && vstate.words.length) { renderDeckDetail(); showScreen("screen-deck"); }
  else { renderVocabProgress(); showScreen("screen-start"); }
}

// ปุ่มในหน้ารายละเอียดชุด
$("btn-play-deck") && $("btn-play-deck").addEventListener("click", () => startVocabRound());
$("btn-deck-back") && $("btn-deck-back").addEventListener("click", () => history.back());

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
  buildLevelTabs();
  buildDeckOptions();
})();

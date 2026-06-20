// ข้อมูลคำศัพท์ Oxford 3000 (แยกระดับ CEFR A1–B2)
// ที่มาคำ+ระดับ: Oxford 3000 (ลิสต์สาธารณะ) · คำแปลไทย+คำอธิบาย: เพิ่มเอง
// schema: word, level (A1-B2), pos (ชนิดคำ), thai (คำแปล), example (ประโยค {คำ}), explain (อธิบาย/วิธีใช้)
// *** นี่คือชุดตัวอย่าง ~48 คำ ไว้ตรวจรูปแบบ/คุณภาพ ก่อนขยายเต็ม 3288 คำ ***
const VOCAB = [
  // ───────── A1 (เริ่มต้น) ─────────
  { word: "water", level: "A1", pos: "n.", thai: "น้ำ", example: "I drink {water}.", explain: "น้ำดื่ม/ของเหลว — คำนามนับไม่ได้ ไม่เติม s" },
  { word: "big", level: "A1", pos: "adj.", thai: "ใหญ่", example: "A {big} house.", explain: "ขนาดใหญ่ ตรงข้ามกับ small" },
  { word: "eat", level: "A1", pos: "v.", thai: "กิน", example: "I {eat} rice.", explain: "กริยา กิน — อดีตคือ ate, ช่อง 3 eaten" },
  { word: "house", level: "A1", pos: "n.", thai: "บ้าน", example: "This is my {house}.", explain: "ตัวอาคารบ้าน (home = บ้านในความรู้สึก)" },
  { word: "happy", level: "A1", pos: "adj.", thai: "มีความสุข, ดีใจ", example: "I am {happy}.", explain: "รู้สึกดี ตรงข้ามกับ sad" },
  { word: "friend", level: "A1", pos: "n.", thai: "เพื่อน", example: "She is my {friend}.", explain: "เพื่อน — make friends = ผูกมิตร" },
  { word: "run", level: "A1", pos: "v.", thai: "วิ่ง", example: "I {run} fast.", explain: "วิ่ง — อดีตคือ ran" },
  { word: "school", level: "A1", pos: "n.", thai: "โรงเรียน", example: "I go to {school}.", explain: "go to school = ไปเรียน (ไม่ใส่ the)" },
  { word: "open", level: "A1", pos: "v./adj.", thai: "เปิด", example: "Please {open} the door.", explain: "เปิด ตรงข้ามกับ close/shut" },
  { word: "cold", level: "A1", pos: "adj.", thai: "หนาว, เย็น", example: "The water is {cold}.", explain: "เย็น/หนาว ตรงข้ามกับ hot" },
  { word: "buy", level: "A1", pos: "v.", thai: "ซื้อ", example: "I {buy} food.", explain: "ซื้อ — อดีตคือ bought" },
  { word: "name", level: "A1", pos: "n.", thai: "ชื่อ", example: "What is your {name}?", explain: "ชื่อ — first name = ชื่อต้น" },

  // ───────── A2 (พื้นฐาน) ─────────
  { word: "airport", level: "A2", pos: "n.", thai: "สนามบิน", example: "We meet at the {airport}.", explain: "ที่ขึ้น-ลงเครื่องบิน" },
  { word: "borrow", level: "A2", pos: "v.", thai: "ยืม", example: "Can I {borrow} your pen?", explain: "ยืม (เข้าหาตัว) ≠ lend = ให้ยืม" },
  { word: "careful", level: "A2", pos: "adj.", thai: "ระมัดระวัง", example: "Be {careful}!", explain: "ระวัง — careful → carefully (adv.)" },
  { word: "decide", level: "A2", pos: "v.", thai: "ตัดสินใจ", example: "I {decide} to go.", explain: "ตัดสินใจ — นาม decision" },
  { word: "enough", level: "A2", pos: "adj./adv.", thai: "เพียงพอ", example: "I have {enough} money.", explain: "พอ — วางหลัง adj: good enough" },
  { word: "foreign", level: "A2", pos: "adj.", thai: "ต่างประเทศ", example: "A {foreign} language.", explain: "ต่างชาติ — foreigner = ชาวต่างชาติ" },
  { word: "husband", level: "A2", pos: "n.", thai: "สามี", example: "Her {husband} is a doctor.", explain: "สามี ≠ wife = ภรรยา" },
  { word: "invite", level: "A2", pos: "v.", thai: "เชิญ, ชวน", example: "I {invite} you to dinner.", explain: "เชิญ — นาม invitation" },
  { word: "middle", level: "A2", pos: "n.", thai: "ตรงกลาง", example: "In the {middle} of the room.", explain: "ส่วนกลาง — in the middle of = ระหว่าง" },
  { word: "prepare", level: "A2", pos: "v.", thai: "เตรียม", example: "I {prepare} dinner.", explain: "เตรียม — prepare for = เตรียมพร้อมสำหรับ" },
  { word: "repeat", level: "A2", pos: "v.", thai: "พูดซ้ำ, ทำซ้ำ", example: "Please {repeat} that.", explain: "ทำ/พูดซ้ำ" },
  { word: "weather", level: "A2", pos: "n.", thai: "สภาพอากาศ", example: "The {weather} is nice.", explain: "อากาศ (นับไม่ได้) ≠ whether = หรือไม่" },

  // ───────── B1 (กลาง) ─────────
  { word: "advantage", level: "B1", pos: "n.", thai: "ข้อได้เปรียบ, ประโยชน์", example: "It has many {advantages}.", explain: "ข้อดี ตรงข้าม disadvantage" },
  { word: "behave", level: "B1", pos: "v.", thai: "ประพฤติตัว", example: "The children {behave} well.", explain: "ทำตัว — นาม behaviour" },
  { word: "complain", level: "B1", pos: "v.", thai: "บ่น, ร้องเรียน", example: "They {complain} about the noise.", explain: "complain about = บ่นเรื่อง" },
  { word: "describe", level: "B1", pos: "v.", thai: "อธิบาย, บรรยาย", example: "Can you {describe} it?", explain: "บรรยายลักษณะ — นาม description" },
  { word: "environment", level: "B1", pos: "n.", thai: "สิ่งแวดล้อม", example: "We protect the {environment}.", explain: "สิ่งแวดล้อม — the environment" },
  { word: "improve", level: "B1", pos: "v.", thai: "ปรับปรุง, พัฒนา", example: "I want to {improve} my English.", explain: "ทำให้ดีขึ้น — นาม improvement" },
  { word: "knowledge", level: "B1", pos: "n.", thai: "ความรู้", example: "She has good {knowledge}.", explain: "ความรู้ (นับไม่ได้)" },
  { word: "manage", level: "B1", pos: "v.", thai: "จัดการ, บริหาร", example: "I {manage} the team.", explain: "manage to = ทำสำเร็จ — นาม management" },
  { word: "opportunity", level: "B1", pos: "n.", thai: "โอกาส", example: "A good {opportunity}.", explain: "โอกาสดี ๆ คล้าย chance" },
  { word: "recognize", level: "B1", pos: "v.", thai: "จำได้, ยอมรับ", example: "I {recognize} her face.", explain: "จำได้ว่าเคยเห็น (อังกฤษเขียน recognise)" },
  { word: "responsible", level: "B1", pos: "adj.", thai: "มีความรับผิดชอบ", example: "He is {responsible}.", explain: "responsible for = รับผิดชอบเรื่อง" },
  { word: "suggest", level: "B1", pos: "v.", thai: "แนะนำ, เสนอ", example: "I {suggest} a plan.", explain: "เสนอความคิด — นาม suggestion" },

  // ───────── B2 (ค่อนข้างสูง) ─────────
  { word: "accurate", level: "B2", pos: "adj.", thai: "ถูกต้องแม่นยำ", example: "An {accurate} answer.", explain: "แม่นยำ ตรงข้าม inaccurate" },
  { word: "approach", level: "B2", pos: "n./v.", thai: "วิธีการ; เข้าใกล้", example: "A new {approach} to the problem.", explain: "เป็นได้ทั้งนาม (วิธี) และกริยา (เข้าใกล้)" },
  { word: "benefit", level: "B2", pos: "n./v.", thai: "ผลประโยชน์", example: "The {benefits} of exercise.", explain: "ประโยชน์ — benefit from = ได้ประโยชน์จาก" },
  { word: "consequence", level: "B2", pos: "n.", thai: "ผลที่ตามมา", example: "Face the {consequences}.", explain: "ผลลัพธ์ (มักเป็นด้านลบ)" },
  { word: "demonstrate", level: "B2", pos: "v.", thai: "สาธิต, แสดงให้เห็น", example: "Let me {demonstrate}.", explain: "แสดงให้ดู — นาม demonstration" },
  { word: "efficient", level: "B2", pos: "adj.", thai: "มีประสิทธิภาพ", example: "An {efficient} system.", explain: "ทำงานได้ผลดีไม่สิ้นเปลือง — นาม efficiency" },
  { word: "estimate", level: "B2", pos: "v./n.", thai: "ประมาณการ", example: "I {estimate} the cost.", explain: "คาดคะเนตัวเลข" },
  { word: "maintain", level: "B2", pos: "v.", thai: "รักษาไว้, ดูแล", example: "We must {maintain} the road.", explain: "คงไว้/ดูแล — นาม maintenance" },
  { word: "obvious", level: "B2", pos: "adj.", thai: "ชัดเจน, เห็นได้ชัด", example: "It's {obvious}.", explain: "ชัดแจ้ง — obviously = อย่างเห็นได้ชัด" },
  { word: "previous", level: "B2", pos: "adj.", thai: "ก่อนหน้า", example: "The {previous} day.", explain: "ก่อนหน้านี้ — previously = ก่อนหน้านี้" },
  { word: "reluctant", level: "B2", pos: "adj.", thai: "ลังเล, ไม่เต็มใจ", example: "He is {reluctant} to go.", explain: "ไม่อยากทำ — reluctant to + กริยา" },
  { word: "significant", level: "B2", pos: "adj.", thai: "สำคัญ, มีนัยสำคัญ", example: "A {significant} change.", explain: "สำคัญมาก — significantly = อย่างมีนัยสำคัญ" },

  // ───────── A1 (เพิ่ม) ─────────
  { word: "day", level: "A1", pos: "n.", thai: "วัน", example: "Have a nice {day}.", explain: "วัน — every day = ทุกวัน" },
  { word: "night", level: "A1", pos: "n.", thai: "กลางคืน", example: "Good {night}.", explain: "กลางคืน — at night = ตอนกลางคืน" },
  { word: "year", level: "A1", pos: "n.", thai: "ปี", example: "Last {year}.", explain: "ปี — this year = ปีนี้" },
  { word: "work", level: "A1", pos: "v./n.", thai: "ทำงาน; งาน", example: "I {work} every day.", explain: "เป็นได้ทั้งกริยา (ทำงาน) และนาม (งาน)" },
  { word: "play", level: "A1", pos: "v.", thai: "เล่น", example: "Children {play} games.", explain: "เล่น (เกม/กีฬา/ดนตรี)" },
  { word: "read", level: "A1", pos: "v.", thai: "อ่าน", example: "I {read} a book.", explain: "อ่าน — อดีตเขียนเหมือนกัน read (ออกเสียง เร็ด)" },
  { word: "write", level: "A1", pos: "v.", thai: "เขียน", example: "{write} your name.", explain: "เขียน — อดีต wrote, ช่อง 3 written" },
  { word: "walk", level: "A1", pos: "v.", thai: "เดิน", example: "I {walk} to school.", explain: "เดิน — go for a walk = ไปเดินเล่น" },
  { word: "food", level: "A1", pos: "n.", thai: "อาหาร", example: "I like Thai {food}.", explain: "อาหาร (นับไม่ได้)" },
  { word: "money", level: "A1", pos: "n.", thai: "เงิน", example: "I have no {money}.", explain: "เงิน (นับไม่ได้)" },
  { word: "time", level: "A1", pos: "n.", thai: "เวลา", example: "What {time} is it?", explain: "เวลา — on time = ตรงเวลา" },
  { word: "love", level: "A1", pos: "v./n.", thai: "รัก; ความรัก", example: "I {love} you.", explain: "เป็นได้ทั้งกริยาและนาม" },
  { word: "help", level: "A1", pos: "v./n.", thai: "ช่วย; ความช่วยเหลือ", example: "Can you {help} me?", explain: "ช่วยเหลือ — help + กริยา" },

  // ───────── A2 (เพิ่ม) ─────────
  { word: "arrive", level: "A2", pos: "v.", thai: "มาถึง", example: "We {arrive} at noon.", explain: "arrive at/in — นาม arrival" },
  { word: "believe", level: "A2", pos: "v.", thai: "เชื่อ", example: "I {believe} you.", explain: "เชื่อ — believe in = เชื่อมั่นใน" },
  { word: "collect", level: "A2", pos: "v.", thai: "เก็บสะสม, รวบรวม", example: "I {collect} stamps.", explain: "สะสม — นาม collection" },
  { word: "dangerous", level: "A2", pos: "adj.", thai: "อันตราย", example: "A {dangerous} road.", explain: "อันตราย — นาม danger" },
  { word: "exciting", level: "A2", pos: "adj.", thai: "น่าตื่นเต้น", example: "An {exciting} game.", explain: "ของที่ทำให้ตื่นเต้น ≠ excited = รู้สึกตื่นเต้น" },
  { word: "fix", level: "A2", pos: "v.", thai: "ซ่อม, แก้ไข", example: "Can you {fix} it?", explain: "ซ่อมให้ใช้ได้" },
  { word: "health", level: "A2", pos: "n.", thai: "สุขภาพ", example: "Good {health}.", explain: "สุขภาพ — healthy (adj.) = แข็งแรง" },
  { word: "journey", level: "A2", pos: "n.", thai: "การเดินทาง", example: "A long {journey}.", explain: "การเดินทาง (เน้นเส้นทาง)" },
  { word: "lucky", level: "A2", pos: "adj.", thai: "โชคดี", example: "You are {lucky}.", explain: "โชคดี — นาม luck" },
  { word: "popular", level: "A2", pos: "adj.", thai: "เป็นที่นิยม", example: "A {popular} song.", explain: "ที่คนชอบมาก" },
  { word: "quiet", level: "A2", pos: "adj.", thai: "เงียบ", example: "Be {quiet}!", explain: "เงียบ ≠ quite = ค่อนข้าง (สะกดต่างกัน)" },
  { word: "receive", level: "A2", pos: "v.", thai: "ได้รับ", example: "I {receive} a gift.", explain: "ได้รับ — i ก่อน e (ยกเว้นหลัง c)" },
  { word: "traffic", level: "A2", pos: "n.", thai: "การจราจร", example: "Heavy {traffic}.", explain: "การจราจร (นับไม่ได้)" },

  // ───────── B1 (เพิ่ม) ─────────
  { word: "achieve", level: "B1", pos: "v.", thai: "บรรลุ, ทำสำเร็จ", example: "{achieve} your goal.", explain: "ทำสำเร็จ — นาม achievement" },
  { word: "available", level: "B1", pos: "adj.", thai: "มีให้ใช้, ว่าง", example: "Is it {available}?", explain: "พร้อมใช้/ติดต่อได้" },
  { word: "confident", level: "B1", pos: "adj.", thai: "มั่นใจ", example: "She is {confident}.", explain: "มั่นใจ — นาม confidence" },
  { word: "develop", level: "B1", pos: "v.", thai: "พัฒนา", example: "{develop} a skill.", explain: "พัฒนา — นาม development" },
  { word: "encourage", level: "B1", pos: "v.", thai: "ให้กำลังใจ, สนับสนุน", example: "I {encourage} you.", explain: "กระตุ้นให้ทำ ≠ discourage" },
  { word: "experience", level: "B1", pos: "n.", thai: "ประสบการณ์", example: "Work {experience}.", explain: "ประสบการณ์ (เป็นกริยา = ประสบ)" },
  { word: "familiar", level: "B1", pos: "adj.", thai: "คุ้นเคย", example: "A {familiar} face.", explain: "familiar with = คุ้นเคยกับ" },
  { word: "increase", level: "B1", pos: "v./n.", thai: "เพิ่มขึ้น", example: "Prices {increase}.", explain: "เพิ่ม ตรงข้าม decrease" },
  { word: "prefer", level: "B1", pos: "v.", thai: "ชอบมากกว่า", example: "I {prefer} tea.", explain: "prefer A to B = ชอบ A มากกว่า B" },
  { word: "realize", level: "B1", pos: "v.", thai: "ตระหนัก, รู้ตัว", example: "I {realize} my mistake.", explain: "เพิ่งรู้/เข้าใจ (อังกฤษเขียน realise)" },
  { word: "reduce", level: "B1", pos: "v.", thai: "ลด", example: "{reduce} the cost.", explain: "ทำให้น้อยลง — นาม reduction" },
  { word: "situation", level: "B1", pos: "n.", thai: "สถานการณ์", example: "A difficult {situation}.", explain: "สภาพ/เหตุการณ์ที่เป็นอยู่" },
  { word: "support", level: "B1", pos: "v./n.", thai: "สนับสนุน; การสนับสนุน", example: "I {support} you.", explain: "ช่วยเหลือ/หนุน" },

  // ───────── B2 (เพิ่ม) ─────────
  { word: "appropriate", level: "B2", pos: "adj.", thai: "เหมาะสม", example: "{appropriate} clothes.", explain: "เหมาะกับกาลเทศะ ≠ inappropriate" },
  { word: "assume", level: "B2", pos: "v.", thai: "สันนิษฐาน, คิดเอาเอง", example: "I {assume} you agree.", explain: "เดา/ถือว่าเป็นจริง — นาม assumption" },
  { word: "complex", level: "B2", pos: "adj.", thai: "ซับซ้อน", example: "A {complex} problem.", explain: "ซับซ้อน คล้าย complicated" },
  { word: "contribute", level: "B2", pos: "v.", thai: "มีส่วนช่วย, สนับสนุน", example: "{contribute} ideas.", explain: "contribute to = มีส่วนทำให้ — นาม contribution" },
  { word: "current", level: "B2", pos: "adj.", thai: "ปัจจุบัน", example: "The {current} situation.", explain: "ปัจจุบัน — currently = ในปัจจุบัน" },
  { word: "emphasize", level: "B2", pos: "v.", thai: "เน้นย้ำ", example: "I {emphasize} this point.", explain: "ทำให้สำคัญ — นาม emphasis" },
  { word: "ensure", level: "B2", pos: "v.", thai: "ทำให้แน่ใจ", example: "{ensure} the door is locked.", explain: "ทำให้มั่นใจว่าเกิดขึ้น" },
  { word: "evidence", level: "B2", pos: "n.", thai: "หลักฐาน", example: "There is no {evidence}.", explain: "หลักฐาน (นับไม่ได้)" },
  { word: "flexible", level: "B2", pos: "adj.", thai: "ยืดหยุ่น", example: "A {flexible} plan.", explain: "ปรับเปลี่ยนได้ — นาม flexibility" },
  { word: "individual", level: "B2", pos: "n./adj.", thai: "บุคคล; เฉพาะบุคคล", example: "Each {individual} is different.", explain: "คนแต่ละคน" },
  { word: "occur", level: "B2", pos: "v.", thai: "เกิดขึ้น", example: "Problems {occur}.", explain: "เกิดขึ้น (ทางการกว่า happen)" },
  { word: "recommend", level: "B2", pos: "v.", thai: "แนะนำ", example: "I {recommend} this book.", explain: "แนะนำให้ทำ/เลือก — นาม recommendation" },
  { word: "tend", level: "B2", pos: "v.", thai: "มักจะ, มีแนวโน้ม", example: "I {tend} to be late.", explain: "tend to + กริยา = มักจะ" },
];

// ป้ายชื่อระดับ CEFR
const LEVEL_LABELS = {
  "A1": { title: "A1 — เริ่มต้น", ex: "water · big · eat" },
  "A2": { title: "A2 — พื้นฐาน", ex: "airport · borrow · decide" },
  "B1": { title: "B1 — กลาง", ex: "improve · manage · suggest" },
  "B2": { title: "B2 — ค่อนข้างสูง", ex: "accurate · efficient · obvious" },
};

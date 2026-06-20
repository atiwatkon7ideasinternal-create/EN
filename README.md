# 🎯 เกมฝึกจำสระภาษาอังกฤษ (English Vowel Game)

เว็บเกมฝึกจำเสียงสระภาษาอังกฤษ เทียบกับสระไทย — มีโหมดทายสระ + สะกดคำ + ฟังเสียง

📄 ดูเอกสารออกแบบเต็มได้ที่ [`vowel-game-spec.md`](./vowel-game-spec.md)

**42 สระผสม** แบ่ง 9 หมวดตามตระกูลเสียง · ออกแบบตามงานวิจัยด้านการเรียนรู้ (ดูใน spec)

## ✨ ฟีเจอร์
- 🅰️ **โหมดทายสระ** — โชว์สระอังกฤษ (`a_e`, `ee`, `oa`...) แล้วเลือกสระไทยที่ตรง
- ✍️ **โหมดสะกดคำ** — ฟังเสียงคำ แล้วเติมสระที่หาย (เลือก หรือ **พิมพ์เอง**)
- 🔊 **ฟังเสียง** — อ่านออกเสียงช้า ๆ ก่อนถาม (Web Speech API) + เสียงตอบถูก/ผิด
- 🧠 **Spaced repetition** — Leitner box จำความแม่นข้ามวัน, ถามคำที่อ่อนถี่กว่า, ทบทวนข้อผิดทันที
- 📊 **สรุปผล** — คะแนน + เปอร์เซ็นต์ + รายการข้อที่ผิด + แถบ "แม่นแล้ว X/42"
- 🎯 เลือกเล่นทีละหมวด / เน้นคำที่ยังไม่แม่น
- 📱 **PWA** — ติดตั้งบนมือถือ + เล่นออฟไลน์ได้

## 🗂 โครงสร้างไฟล์
```
index.html           # หน้าเว็บหลัก
style.css            # สไตล์ (mobile-first)
game.js              # ตรรกะเกม
vowels.js            # ข้อมูลสระ 42 ตัว + หมวด (แก้ตรงนี้เพื่อเพิ่ม/ลด)
manifest.webmanifest # PWA manifest
sw.js                # service worker (ออฟไลน์)
icons/               # ไอคอนแอป (192/512/180)
vercel.json          # ตั้งค่า deploy
```

## ▶️ รันในเครื่อง
เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้เลย หรือรันเซิร์ฟเวอร์ static:
```bash
npx serve .
# หรือ
python3 -m http.server 8000
```

## 🚀 Deploy ขึ้น Vercel

**วิธีที่ 1 — ผ่าน CLI:**
```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

**วิธีที่ 2 — ผ่าน GitHub (แนะนำ):**
1. push โค้ดขึ้น GitHub repo
2. ไปที่ [vercel.com/new](https://vercel.com/new) → Import repo
3. Framework Preset เลือก **Other** (เป็น static site ไม่ต้อง build)
4. กด **Deploy** — เสร็จแล้วได้ URL ใช้งานได้ทันที

> เป็น static site ล้วน ไม่ต้องตั้งค่า build command หรือ output directory

# Deploy qo'llanmasi (onlayn joylashtirish)

Dastur tayyor. Onlayn qilish uchun 3 ta bepul hisob kerak. Har birини qanday
ochish va menga **nima yuborish** kerakligi quyida. Bularni ochib, ma'lumotlarni
bersangiz, men qolganini (baza sozlash, deploy, production seed) qilaman.

---

## 1. Neon — ma'lumotlar bazasi (bepul)

1. https://neon.tech saytiga kiring → "Sign up" (Google yoki email bilan, karta kerak emas).
2. "Create project" bosing → nom bering (masalan `hisobot`), region: Frankfurt (eng yaqin).
3. Loyiha ochilgach, "Connection string" ni nusxa oling. U shunday ko'rinadi:
   `postgresql://user:parol@ep-xxxx.eu-central-1.aws.neon.tech/dbname?sslmode=require`

**Menga yuboring:** shu `postgresql://...` connection string.

---

## 2. GitHub — kodni saqlash uchun (bepul)

1. https://github.com → "Sign up".
2. Menga ayting — men kodни sizning yangi (maxfiy/private) repongizga joylashtiraman,
   yoki siz "New repository" ochib nomini bersangiz, men push qilaman.

**Menga yuboring:** GitHub username (va agar repo ochsangiz — repo nomi).

---

## 3. Vercel — hosting (bepul)

1. https://vercel.com → "Sign up" → **GitHub bilan** kiring (eng oson).
2. Keyingi qadamlarni (repo ulash, env o'zgaruvchilar) men ko'rsataman yoki siz bilan
   birga qilamiz. Vercel GitHub'dagi kodni avtomatik oladi.

**Menga yuboring:** Vercel'ga GitHub bilan kirganingizni tasdiqlang.

---

## 4. Telegram bot (ixtiyoriy — xabarnoma uchun)

Agar xodim hisobot topshirganda Telegram'ga xabar kelishini xohlasangiz:

1. Telegram'da **@BotFather** ni oching → `/newbot` → bot nomini bering → **token** oladi
   (masalan `123456:ABC-DEF...`).
2. Yangi bot bilan xabarlashish uchun uni kerakli **guruhga qo'shing** (yoki o'zingizga
   yozdiring), so'ng guruh/chat `chat_id` sini aniqlash kerak.
   - Eng oson yo'l: botni guruhga qo'shib, guruhga biror xabar yozing, keyin menга
     token'ni bersangiz, men `chat_id`ni aniqlab beraman.

**Menga yuboring:** bot **token** (va agar bilsangiz — guruh nomi).

---

## Men bajaradigan qismlar (siz ma'lumot bergach)

- `.env` production qiymatlari (Neon URL, kuchli `AUTH_SECRET`, Telegram) — Vercel'da sozlanadi
- Baza migratsiyasi Neon'ga qo'llanadi (`prisma migrate deploy` — build vaqtida avtomatik)
- Production admin va namunaviy obyektlar seed qilinadi
- To'liq oqim tekshiriladi (login → hisobot → vaucher → admin ko'rinishi)

## Xarajat

Neon (bepul) + Vercel (bepul Hobby) + Telegram (bepul) = **oyiga $0** shu hajmda.

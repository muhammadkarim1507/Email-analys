import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY muhit o‘zgaruvchisi topilmadi. Iltimos, sozlamalarda Gemini API kalitini kiriting.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Analyze single email
  app.post('/api/analyze-email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.id) {
        return res.status(400).json({ error: 'Email ma\'lumotlari to‘liq emas.' });
      }

      const ai = getAIClient();

      const prompt = `
Siz professional elektron pochta (email) tahlilchisi va AI yordamchisiz.
Quyidagi email xabarni sinchiklab tahlil qiling va natijani faqat o'zbek tilida, quyidagi JSON formatida qaytaring:

Email ma'lumotlari:
- Kimdan: ${email.from || ''}
- Mavzu: ${email.subject || ''}
- Sana: ${email.date || ''}
- Mazmuni:
"""
${(email.bodyText || email.snippet || '').slice(0, 4000)}
"""

Tahlil talablari:
1. summary: Xatning 2-3 jumlada qisqa, aniq mazmuni (xulosa).
2. urgency: Muhimlik darajasi - faqat bittasini tanlang: "yuqori", "o‘rta", yoki "past".
3. urgencyReason: Nima uchun ushbu muhimlik darajasi tanlangani sababi (masalan: muddat borligi, to'lov yoki shoshilinch talab, yoki oddiy xabarnoma).
4. sentiment: Xatning ohangi - faqat bittasini tanlang: "rasmiy", "shoshilinch", "do‘stona", "shikoyat", "taklif", yoki "neytral".
5. category: Toifasi - faqat bittasini tanlang: "ish", "moliya", "shaxsiy", "reklama", "bildirishnoma", yoki "boshqa".
6. actionItems: Foydalanuvchi bajarishi kerak bo'lgan aniq vazifalar ro'yxati (har biri: { "task": string, "deadline": string (agar mavjud bo'lsa), "priority": "yuqori" | "o‘rta" | "past" }). Agar hech qanday vazifa bo'lmasa, bo'sh massiv [].
7. keyPoints: Xatdagi asosiy 2-4 ta muhim nuqtalar (string massivi).
8. suggestedReply: Ushbu xatga yuborish uchun eng mos, odobli va professional javob loyihasi ({ "tone": "professional" | "do'stona" | "qisqa", "text": string }).
9. isSuspicious: Xatda firibgarlik (phishing), soxta havola yoki shubhali narsa bormi? (true/false)
10. suspiciousReason: Agar isSuspicious true bo'lsa, sababi; aks holda bo'sh string.

Faqat toza JSON obyekti qaytaring, hech qanday markdown blokisiz (\`\`\`json bo'lmasin).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        emailId: email.id,
        summary: parsedData.summary || 'Xulosa tayyorlandi.',
        urgency: parsedData.urgency || 'o‘rta',
        urgencyReason: parsedData.urgencyReason || 'Standart xabar',
        sentiment: parsedData.sentiment || 'rasmiy',
        category: parsedData.category || 'ish',
        actionItems: Array.isArray(parsedData.actionItems) ? parsedData.actionItems : [],
        keyPoints: Array.isArray(parsedData.keyPoints) ? parsedData.keyPoints : [],
        suggestedReply: parsedData.suggestedReply || {
          tone: 'professional',
          text: 'Assalomu alaykum. Xatingiz uchun tashakkur, ko‘rib chiqmoqdaman.',
        },
        isSuspicious: !!parsedData.isSuspicious,
        suspiciousReason: parsedData.suspiciousReason || '',
      });
    } catch (error: any) {
      console.error('Email tahlilida xatolik:', error);
      return res.status(500).json({
        error: error.message || 'Xatni tahlil qilishda xatolik yuz berdi.',
      });
    }
  });

  // 2. Batch analyze inbox emails
  app.post('/api/analyze-batch', async (req, res) => {
    try {
      const { emails } = req.body;
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: 'Tahlil qilish uchun xatlar ro‘yxati kerak.' });
      }

      const ai = getAIClient();

      const emailsContext = emails.slice(0, 15).map((m, idx) => `
[${idx + 1}] ID: ${m.id}
Kimdan: ${m.from}
Mavzu: ${m.subject}
Sana: ${m.date}
Qisqacha: ${(m.snippet || m.bodyText || '').slice(0, 200)}
`).join('\n---\n');

      const prompt = `
Siz foydalanuvchining shaxsiy AI pochtachisi va tahlilchisisiz.
Quyidagi ${emails.length} ta xatning umumiy holatini tahlil qiling va qat'iy o'zbek tilida quyidagi JSON formatida to'liq hisobot bering:

Xatlar ro'yxati:
${emailsContext}

Tahlil strukturasi:
{
  "totalAnalyzed": ${emails.length},
  "overview": "Pochta qutisidagi umumiy vaziyat haqida 2-3 jumlali chuqur va foydali xulosa",
  "urgentEmails": [
    {
      "emailId": "yuqoridagi ID",
      "subject": "xat mavzusi",
      "from": "yuboruvchi",
      "reason": "nima sababdan zudlik bilan e'tibor talab qilinishi"
    }
  ],
  "pendingActions": [
    {
      "task": "foydalanuvchi bajarishi kerak bo'lgan aniq amaliy harakat",
      "emailSubject": "qaysi xatga oidligi",
      "from": "kimdan kelganligi",
      "deadline": "agar belgilangan bo'lsa muddat, aks holda 'Tez orada'"
    }
  ],
  "priorityDistribution": {
    "high": number,
    "medium": number,
    "low": number
  },
  "categoriesCount": {
    "Ish": number,
    "Moliya/To‘lovlar": number,
    "Bildirishnomalar": number,
    "Reklama/Yangiliklar": number,
    "Boshqa": number
  },
  "keyInsights": [
    "Foydalanuvchi uchun 3-4 ta eng muhim tavsiya yoki e'tibor qaratilishi zarur bo'lgan maslahatlar"
  ]
}

Faqat toza JSON qaytaring.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json(parsedData);
    } catch (error: any) {
      console.error('Guruhli tahlilda xatolik:', error);
      return res.status(500).json({
        error: error.message || 'Pochta qutisini umumiy tahlil qilishda xatolik yuz berdi.',
      });
    }
  });

  // 3. Ask questions about current emails
  app.post('/api/ask-emails', async (req, res) => {
    try {
      const { question, emails } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Savol kiritilishi shart.' });
      }

      const ai = getAIClient();

      const emailsData = (emails || []).slice(0, 15).map((e: any, i: number) => `
[Xat #${i + 1}]
Mavzu: ${e.subject}
Kimdan: ${e.from}
Sana: ${e.date}
Mazmun: ${(e.bodyText || e.snippet || '').slice(0, 500)}
`).join('\n---\n');

      const prompt = `
Foydalanuvchi o'zining pochta xabarlari bo'yicha savol bermoqda.
Quyidagi xatlar ma'lumotiga asoslanib, aniq, to'g'ri va xushmuomala javob bering.
Agar so'ralgan ma'lumot mavjud xatlarda bo'lmasa, to'g'ridan-to'g'ri yo'qligini ayting, uydirma ma'lumot qo'shmang.

Xatlar:
${emailsData}

Foydalanuvchi savoli:
"${question}"

Javobni o'zbek tilida, chiroyli formatlangan matn (zarur bo'lsa ro'yxat shaklida) ko'rinishida bering.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ answer: response.text || 'Javob shakllantirilmadi.' });
    } catch (error: any) {
      console.error('Savolga javob berishda xatolik:', error);
      return res.status(500).json({
        error: error.message || 'Savolga javob berishda xatolik yuz berdi.',
      });
    }
  });

  // 4. Custom reply generator
  app.post('/api/generate-reply', async (req, res) => {
    try {
      const { email, customTone, userInstructions } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email ma\'lumotlari kiritilmadi.' });
      }

      const ai = getAIClient();

      const prompt = `
Quyidagi emailga javob xati yozing:

Asl xat mavzusi: ${email.subject || ''}
Yuboruvchi: ${email.from || ''}
Mazmun: ${(email.bodyText || email.snippet || '').slice(0, 2000)}

Talablar:
- Ohang: ${customTone || 'rasmiy va professional'}
- Qo'shimcha ko'rsatma: ${userInstructions || 'Xat mazmuniga mos, aniq va hurmatli javob yozing.'}
- Til: O'zbek tili

Faqat tayyor javob matnini (salomlashishdan to xayrlashuvgacha) qaytaring.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ replyText: response.text || '' });
    } catch (error: any) {
      console.error('Javob yaratishda xatolik:', error);
      return res.status(500).json({
        error: error.message || 'Javob matnini yaratishda xatolik yuz berdi.',
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server http://0.0.0.0:${PORT} da ishga tushdi`);
  });
}

startServer();

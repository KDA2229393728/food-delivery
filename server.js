
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));


function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      chat_id: chatId,
      text
    });

    const req = https.request(
      {
        hostname: "api.telegram.org",
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (response) => {
        let data = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(data || "{}");

            if (
              response.statusCode >= 200 &&
              response.statusCode < 300 &&
              result.ok
            ) {
              resolve(result);
              return;
            }

            reject(
              new Error(
                `Telegram API: ${result.description || `HTTP ${response.statusCode}`}`
              )
            );
          } catch (error) {
            reject(new Error(`Некорректный ответ Telegram: ${error.message}`));
          }
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(new Error("Telegram timeout"));
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const REVIEWS_FILE = process.env.REVIEWS_FILE || path.join(__dirname, "data", "reviews.json");

const DEFAULT_REVIEWS = [
  {
    id: "default-anna",
    name: "Анна",
    rating: 5,
    text: "Очень вкусно! Всё действительно по-домашнему. Борщ отличный, а котлета с пюре вообще как дома ❤️",
    date: "Сегодня",
    createdAt: "2026-08-26T10:00:00.000Z"
  },
  {
    id: "default-maxim",
    name: "Максим",
    rating: 5,
    text: "Заказ приехал аккуратно упакованным. Порции хорошие, еда горячая. Буду заказывать ещё.",
    date: "Вчера",
    createdAt: "2026-08-25T10:00:00.000Z"
  },
  {
    id: "default-ekaterina",
    name: "Екатерина",
    rating: 5,
    text: "Очень понравились сырники и блины. Вкусная домашняя еда без ощущения обычного фастфуда.",
    date: "2 дня назад",
    createdAt: "2026-08-24T10:00:00.000Z"
  }
];

let memoryReviews = [...DEFAULT_REVIEWS];

function ensureReviewsFile() {
  try {
    const dir = path.dirname(REVIEWS_FILE);
    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(REVIEWS_FILE)) {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(DEFAULT_REVIEWS, null, 2), "utf8");
    }
    return true;
  } catch (error) {
    console.warn("Reviews file is unavailable, using memory storage:", error.message);
    return false;
  }
}

function readReviews() {
  try {
    if (ensureReviewsFile()) {
      const data = JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf8"));
      if (Array.isArray(data)) {
        memoryReviews = data;
        return data;
      }
    }
  } catch (error) {
    console.error("Cannot read reviews:", error);
  }

  return memoryReviews;
}

function writeReviews(reviews) {
  memoryReviews = reviews;

  try {
    if (ensureReviewsFile()) {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Cannot save reviews to file:", error);
  }
}

function getAdminPassword() {
  return String(process.env.REVIEWS_ADMIN_PASSWORD || "");
}

function isAdmin(req) {
  const expected = getAdminPassword();
  const actual = String(req.get("X-Admin-Password") || "");

  if (!expected || !actual) return false;

  const a = Buffer.from(actual);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

app.get("/api/reviews", (req, res) => {
  const reviews = readReviews()
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  res.json({ reviews });
});

app.post("/api/reviews", (req, res) => {
  try {
    const name = String(req.body?.name || "").trim().slice(0, 40);
    const text = String(req.body?.text || "").trim().slice(0, 500);
    const rating = Number(req.body?.rating);

    if (!name || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Проверьте имя, текст и оценку." });
    }

    const now = new Date();

    const review = {
      id: crypto.randomUUID(),
      name,
      rating,
      text,
      date: now.toLocaleDateString("ru-RU"),
      createdAt: now.toISOString()
    };

    const reviews = readReviews();
    reviews.push(review);
    writeReviews(reviews);

    res.status(201).json({ ok: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не удалось сохранить отзыв." });
  }
});

app.post("/api/reviews/admin/check", (req, res) => {
  if (!getAdminPassword()) {
    return res.status(503).json({ error: "Пароль администратора не настроен." });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Неверный пароль." });
  }

  res.json({ ok: true });
});

app.delete("/api/reviews/:id", (req, res) => {
  if (!getAdminPassword()) {
    return res.status(503).json({ error: "Пароль администратора не настроен." });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Нет доступа." });
  }

  const id = String(req.params.id || "");
  const reviews = readReviews();
  const next = reviews.filter((review) => String(review.id) !== id);

  if (next.length === reviews.length) {
    return res.status(404).json({ error: "Отзыв не найден." });
  }

  writeReviews(next);
  res.json({ ok: true });
});


const SUBSCRIPTION_PLANS = {
  "student": {
    name: "Студенческий",
    days: 5,
    price: 1990,
    details: "1 горячее блюдо + гарнир"
  },
  "home-lunch": {
    name: "Домашний обед",
    days: 5,
    price: 2990,
    details: "Суп + горячее + гарнир"
  },
  "kak-doma": {
    name: "Как дома",
    days: 5,
    price: 3790,
    details: "Суп + горячее + гарнир + салат + напиток"
  },
  "big-week": {
    name: "Сытная неделя",
    days: 7,
    price: 4990,
    details: "Увеличенное горячее + гарнир + салат + напиток"
  },
  "all-inclusive": {
    name: "Всё включено",
    days: 7,
    price: 6490,
    details: "Суп + горячее + гарнир + салат + выпечка/десерт + напиток"
  }
};

app.post("/api/subscription", async (req, res) => {
  try {
    const planId = String(req.body?.planId || "");
    const customer = req.body?.customer || {};
    const plan = SUBSCRIPTION_PLANS[planId];

    const name = String(customer.name || "").trim().slice(0, 60);
    const phone = String(customer.phone || "").trim().slice(0, 30);
    const address = String(customer.address || "").trim().slice(0, 160);
    const startDate = String(customer.startDate || "").trim().slice(0, 20);
    const comment = String(customer.comment || "").trim().slice(0, 500);

    if (!plan || !name || !phone || !address || !startDate) {
      return res.status(400).json({ error: "Заполните все обязательные поля." });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ error: "Telegram не настроен" });
    }

    const text =
`📅 НОВЫЙ АБОНЕМЕНТ

🎫 Тариф: ${plan.name}
🗓 Дней: ${plan.days}
🍽 Состав: ${plan.details}
💰 Стоимость: ${plan.price.toLocaleString("ru-RU")} ₽

👤 Имя: ${name}
📞 Телефон: ${phone}
📍 Адрес: ${address}
🚀 Начало: ${startDate}
💬 Пожелания: ${comment || "—"}`;

    await sendTelegramMessage(token, chatId, text);

    res.json({ ok: true });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Не удалось отправить заявку. Проверьте Telegram." });
  }
});

app.post("/api/order", async (req, res) => {
  try {
    const { customer, items, total } = req.body || {};
    if (!customer || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Некорректный заказ" });
    }

    const lines = items
      .map((x, i) => `${i + 1}. ${x.name} × ${x.qty} — ${x.lineTotal} ₽`)
      .join("\n");

    const text =
`🛎 НОВЫЙ ЗАКАЗ

👤 Имя: ${customer.name}
📞 Телефон: ${customer.phone}
📍 Адрес: ${customer.address}
💳 Оплата: ${customer.payment}
💬 Комментарий: ${customer.comment || "—"}

🍽 Заказ:
${lines}

💰 Итого: ${total} ₽`;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ error: "Telegram не настроен" });
    }

    await sendTelegramMessage(token, chatId, text);

    res.json({ ok: true });
  } catch (e) {
    console.error("Order error:", e);
    res.status(500).json({ error: "Не удалось отправить заказ. Проверьте Telegram." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});

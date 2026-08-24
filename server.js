
require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

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

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error(tgData);
      return res.status(500).json({ error: "Telegram API error" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});

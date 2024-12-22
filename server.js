import express from "express";
import { Bot } from "grammy";
import cors from "cors";  // Импортируем библиотеку cors

const app = express();
const port = 3000;

// Включаем CORS для всех источников
app.use(cors());

app.use(express.json());

const bot = new Bot('6392442670:AAFxIkX7YW76odBJuX1_xXNhKPcnzWrOL3U'); // Ваш токен бота

app.get("/generate-invoice", async (req, res) => {
  const title = "2xTap";
  const description = "2xTap";
  const payload = "{}";
  const currency = "XTR";
  const prices = [{ amount: 1, label: "Test Product" }];

  try {
    const invoiceLink = await bot.api.createInvoiceLink(
      title,
      description,
      payload,
      "", // Provider token must be empty for Telegram Stars
      currency,
      prices,
    );

    res.json({ invoiceLink });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice link' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

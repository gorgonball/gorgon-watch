const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = 'https://api.telegram.org/bot${BOT_TOKEN}';
const GROUP_ID = "-1002791246922";

const trackedWallets = new Set();

app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await sendMessage(chatId, `👁️ Gorgon Watch is active.`);
  }

  if (text.startsWith("!addwallet ")) {
    const wallet = text.split(" ")[1];
    trackedWallets.add(wallet);
    await sendMessage(chatId, `✅ Added wallet: ${wallet}`, true);
  }

  if (text === "!listwallets") {
    const list = [...trackedWallets].join("\n") || "No wallets tracked.";
    await sendMessage(chatId, `📄 Tracked Wallets:\n${list}`, true);
  }

  if (text === "!test") {
    await sendMessage(GROUP_ID, `🚨 Dev Wallet Alert Fired (Test Mode)`);
  }

  res.sendStatus(200);
});

async function sendMessage(chatId, text, markdown = false) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: markdown ? "Markdown" : undefined,
  });
}

app.get("/", (_, res) => res.send("Gorgon Watch Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot live on ${PORT}`));
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Use express.json() middleware outside of any async call
app.use(express.json());

// Your bot token and Telegram API base URL — use backticks for template literals
const BOT_TOKEN = process.env.BOT_TOKEN || '7394578125:AAEUPzDbotoyKatxzieYu7VJak9C9ZoK7ko';
const TELEGRAM_API = 'https://api.telegram.org/bot${BOT_TOKEN}';

// Webhook endpoint to receive updates from Telegram
app.post('/webhook', async (req, res) => {
  const update = req.body;
  console.log('➡️ Incoming update:', update);

  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (text === '/start') {
      await sendMessage(chatId, '👋 Gorgon Watch is now live.');
    } else if (text === '/test') {
      await sendMessage(chatId, '✅ Test command received.');
    } else {
      await sendMessage(chatId, '❓ Unknown command: ${text}');
    }
  }

  res.sendStatus(200);
});

// Function to send message back to Telegram chat
async function sendMessage(chatId, text) {
  try {
    await axios.post('${TELEGRAM_API}/sendMessage', {
      chat_id: 1002791246922,
      text: text,
    });
  } catch (err) {
    console.error('❌ Error sending message:', err.response?.data || err.message);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Gorgon Watch is live on port ${PORT}');
});
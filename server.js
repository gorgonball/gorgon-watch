const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

async function main() {
  // Replace with your actual bot token
const BOT_TOKEN = '7394578125:AAEUPzDbotoyKatxzieYu7VJak9C9ZoK7ko';
const TELEGRAM_API = 'https://api.telegram.org/bot${BOT_TOKEN}';
await axios.post(${TELEGRAM_API}/sendMessage, {
  chat_id: 108683127,
  text: 'Hello!',
// Parse incoming JSON from Telegram
app.use(express.json());

// Webhook endpoint to receive updates
app.post('/webhook', async (req, res) => {
  const update = req.body;
  console.log('➡️ Incoming update:', update);

  if (update.message && update.message.text) {
    const chatId = update.message?.chat?.id;
  if (!chatId) {
  console.log("No chat ID found in update:", update);
  return res.sendStatus(200);
}
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

// Function to send messages
async function sendMessage(chatId, text) {
  try {
    await axios.post('${TELEGRAM_API}/sendMessage', {
      chat_id: chatId,
      text: text,
    });
  } catch (err) {
    console.error('❌ Error sending message:', err.response?.data || err.message);
  }
}

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Gorgon Watch is live on port ${PORT}');
});
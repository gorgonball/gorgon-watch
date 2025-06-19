const { Connection, PublicKey } = require('@solana/web3.js');

// Initialize Solana connection (add this right after your Telegram setup)
const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'; 
const solanaConnection = new Connection(solanaRpcUrl, 'confirmed');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN || '7394578125:AAEUPzDbotoyKatxzieYu7VJak9C9ZoK7ko';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const update = req.body;
  console.log(`➡️ Incoming update:`, update);
  
  try {
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      
      if (text === '/start') {
        await sendMessage(chatId, `👋 Gorgon Watch is now live.`);
      } else if (text === '/test') {
        await sendMessage(chatId, `✅ Test command received.`);
      } else if (text) {
        await sendMessage(chatId, `❓ Unknown command: ${text}. Try /start or /test`);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error processing update:', err);
    res.sendStatus(200); // Always respond to Telegram to avoid retries
  }
});

// Send message function
async function sendMessage(chatId, text) {
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
    console.log('Message sent:', response.data);
  } catch (err) {
    console.error('Full error details:', {
      error: err.message,
      response: err.response?.data,
      chatIdUsed: chatId,
      botToken: BOT_TOKEN ? '***'+BOT_TOKEN.slice(-4) : 'MISSING'
    });
  }
  async function monitorSolanaWallets() {
  setInterval(async () => {
    for (const wallet of trackedWallets) {
      try {
        // Check for new token accounts
        const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
          new PublicKey(wallet),
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );

        // Detect if this wallet created any new tokens
        const creatorTokens = tokenAccounts.value.filter(account => 
          account.account.data.parsed.info.mintAuthority === wallet
        );

        if (creatorTokens.length > 0) {
          await sendMessage(
            process.env.YOUR_CHAT_ID,
            `🚨 New SPL Token Created!\n` +
            `Creator: ${wallet}\n` +
            `Token: ${creatorTokens[0].account.data.parsed.info.mint}\n` +
            `View: https://solscan.io/token/${creatorTokens[0].account.data.parsed.info.mint}`
          );
        }
      } catch (err) {
        console.error(`Error checking ${wallet}:`, err);
      }
    }
  }, 300000); // Check every 5 minutes
}
}

// Start server
const PORT = process.env.PORT || 3000; // Render will auto-assign a port 
app.listen(PORT, () => {
  console.log(`✅ Gorgon Watch is live on port ${PORT}`);
  console.log('Please set your webhook URL to: https://gorgon-watch.onrender.com/webhook');
app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
  monitorSolanaWallets(); // Start Solana monitoring
});
});
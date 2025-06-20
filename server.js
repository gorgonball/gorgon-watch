const { Connection, PublicKey } = require('@solana/web3.js');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Initialize Solana connection
const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'; 
const solanaConnection = new Connection(solanaRpcUrl, 'confirmed');

// Tracked wallets
const trackedWallets = new Set();

// Debugging logs
console.log("\n⚡ ENVIRONMENT VARIABLES DUMP:");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Express setup
const app = express();
app.use(express.json());

// Telegram config
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  // IGNORE all non-DM messages (channels/groups)
  if (!update.message) return res.sendStatus(200);

  const chatId = update.message.chat.id;
  const text = update.message.text;

  // === COMMAND HANDLING ===
  if (text?.startsWith('/addwallet')) {
    const address = text.split(' ')[1]?.trim();
    if (address && isValidSolanaAddress(address)) {
      trackedWallets.add(address);
      await sendMessage(chatId, `✅ Added wallet: ${address}`);
    } else {
      await sendMessage(chatId, `❌ Invalid Solana address`);
    }
  }
  else if (text === '/listwallets') {
    await sendMessage(chatId, 
      trackedWallets.size > 0 
        ? `📋 Tracked Wallets:\n${[...trackedWallets].join('\n')}`
        : 'No wallets being tracked'
    );
  }
  else if (text === '/start') {
    await sendMessage(chatId, `👋 Bot is running in DM mode. Use /addwallet [address]`);
  }

  res.sendStatus(200);
});

// Helper functions
function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

async function sendMessage(chatId, text) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  } catch (err) {
    console.error('Error sending message:', err.response?.data || err.message);
  }
}

// Solana monitoring
async function monitorSolanaWallets() {
  if (trackedWallets.size === 0) {
    setTimeout(monitorSolanaWallets, 300000);
    return;
  }

  console.log('🔍 Checking wallets...');
  for (const wallet of trackedWallets) {
    try {
      const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
        new PublicKey(wallet),
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const newTokens = tokenAccounts.value.filter(account => 
        account.account.data.parsed.info.mintAuthority === wallet
      );

      if (newTokens.length > 0) {
        await sendMessage(
          process.env.YOUR_CHAT_ID, // HARDCODED to your DM
          `🚨 New Token Created!\n` +
          `• Creator: ${wallet}\n` +
          `• Token: ${newTokens[0].account.data.parsed.info.mint}\n` +
          `• Explorer: https://solscan.io/token/${newTokens[0].account.data.parsed.info.mint}`
        );
      }
    } catch (err) {
      console.error(`Error checking ${wallet}:`, err.message);
    }
  }
  setTimeout(monitorSolanaWallets, 300000); // 5-minute interval
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err);
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Set webhook URL to: https://your-render-url.onrender.com/webhook');
  monitorSolanaWallets();
});
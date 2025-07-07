const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS only for your GitHub Pages domain
app.use(cors({
  origin: 'https://albash40.github.io',
}));

app.use(express.json());

// ✅ Set your Telegram bot token here
const TELEGRAM_BOT_TOKEN = '8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c';

app.get("/", (req, res) => {
  res.send("✅ Skye backend is running");
});

app.post("/auth/telegram", (req, res) => {
  const data = req.body;
  console.log("📥 Received Telegram data:", data);

  // ✅ Use only primitive top-level fields
  const fields = [];
  for (const key in data) {
    if (key !== "hash" && typeof data[key] !== "object") {
      fields.push(`${key}=${data[key]}`);
    }
  }

  fields.sort(); // Required: Sort alphabetically
  const checkString = fields.join('\n');

  const secret = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');

  if (hmac === data.hash) {
    console.log("✅ Telegram user authenticated:", data);
    res.json({ success: true, user: data });
  } else {
    console.log("❌ Invalid login attempt", { data, hmac, expected: data.hash });
    res.status(403).json({ success: false, message: "Invalid Telegram login" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Skye backend running on port ${PORT}`);
})

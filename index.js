const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c';

app.get("/", (req, res) => {
  res.send("Hello from Skye backend ✅");
});

app.post("/auth/telegram", (req, res) => {
  const data = req.body;

  const secret = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const checkString = Object.keys(data)
    .filter(key => key !== "hash")
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("\n");

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  if (hmac === data.hash) {
    console.log("✅ Telegram user authenticated:", data);
    res.json({ success: true, user: data });
  } else {
    res.status(403).json({ success: false, message: "Invalid Telegram login" });
  }
});

app.listen(PORT, () => {
  console.log(`Skye backend running on port ${PORT}`);
});



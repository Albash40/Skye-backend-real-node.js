const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = "8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c";

function validateTelegramInitData(initData) {
  const parsed = new URLSearchParams(initData);
  const hash = parsed.get("hash");

  const dataCheckArray = [];
  parsed.forEach((value, key) => {
    if (key !== "hash") {
      dataCheckArray.push(`${key}=${value}`);
    }
  });

  const checkString = dataCheckArray.sort().join('\n');
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  const isValid = hmac === hash;
  return {
    isValid,
    user: parsed.get("user"),
    expected: hmac,
    received: hash
  };
}

app.post("/auth/telegram", (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    return res.status(400).json({ success: false, message: "Missing initData" });
  }

  const result = validateTelegramInitData(initData);

  if (!result.isValid) {
    console.log("❌ Invalid login attempt:");
    console.log("expected:", result.expected);
    console.log("received:", result.received);
    return res.status(403).json({ success: false, message: "Invalid hash" });
  }

  let user;
  try {
    user = JSON.parse(result.user);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error parsing user" });
  }

  console.log("✅ Verified user:", user);
  res.json({ success: true, user });
});

app.listen(3000, () => {
  console.log("🚀 Telegram backend running on port 3000");
})

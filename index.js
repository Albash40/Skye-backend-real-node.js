const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Your real bot token (safe on server)
const TELEGRAM_BOT_TOKEN = "8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c";

app.use(cors());
app.use(express.json());

app.post("/auth/telegram", (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ success: false, message: "Missing initData" });
  }

  const parsed = new URLSearchParams(initData);
  const hash = parsed.get("hash");

  const dataCheckArr = [];
  parsed.forEach((value, key) => {
    if (key !== "hash") {
      dataCheckArr.push(`${key}=${value}`);
    }
  });

  const checkString = dataCheckArr.sort().join('\n');

  const secretKey = crypto
    .createHash("sha256")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) {
    console.log("❌ Invalid login attempt:", {
      expected: hash,
      computed: hmac,
      checkString
    });
    return res.status(403).json({ success: false, message: "Invalid login" });
  }

  const userRaw = parsed.get("user");
  let user = {};
  try {
    user = JSON.parse(userRaw);
  } catch (err) {
    console.error("❌ Error parsing user data:", err);
    return res.status(500).json({ success: false, message: "Invalid user data" });
  }

  console.log("✅ Authenticated user:", user);
  res.json({ success: true, user });
});

app.get("/", (req, res) => {
  res.send("Skye backend running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Skye backend running on port ${PORT}`);
});

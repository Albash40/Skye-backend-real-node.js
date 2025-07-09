const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = "8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c";

app.use(cors());
app.use(express.json());

app.post("/auth/telegram", (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ success: false, message: "Missing initData" });
  }

  // 🔐 Step 1: Extract hash from initData
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  if (!hash) {
    return res.status(400).json({ success: false, message: "Missing hash" });
  }

  // 🔐 Step 2: Remove hash and sort rest
  const dataCheckArray = [];
  urlParams.forEach((value, key) => {
    if (key !== "hash") {
      dataCheckArray.push(`${key}=${value}`);
    }
  });
  dataCheckArray.sort();
  const checkString = dataCheckArray.join("\n");

  // 🔐 Step 3: Generate HMAC SHA256
  const secretKey = crypto
    .createHash("sha256")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  console.log("✅ checkString:\n", checkString);
  console.log("✅ Calculated HMAC:", hmac);
  console.log("🟡 Telegram Hash:", hash);

  // 🔐 Step 4: Compare and respond
  if (hmac === hash) {
    // Parse user info from initData
    const userRaw = urlParams.get("user");
    let user = {};
    try {
      user = JSON.parse(userRaw);
    } catch (err) {
      return res.status(500).json({ success: false, message: "User parse error" });
    }

    console.log("🎉 Login success:", user);
    return res.json({ success: true, user });
  } else {
    console.log("❌ Invalid login: hash mismatch");
    return res.status(403).json({ success: false, message: "Invalid hash" });
  }
});

app.get("/", (req, res) => {
  res.send("Skye backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

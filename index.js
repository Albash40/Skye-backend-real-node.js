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

  // Parse initData string into key-value pairs
  const parsed = new URLSearchParams(initData);
  const hash = parsed.get("hash");

  // Build check string
  const dataCheckArr = [];
  for (const [key, value] of parsed.entries()) {
    if (key !== "hash") {
      dataCheckArr.push(`${key}=${value}`);
    }
  }

  const checkString = dataCheckArr.sort().join("\n");

  // Create the HMAC hash to verify
  const secretKey = crypto
    .createHash("sha256")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) {
    console.log("❌ Invalid Telegram login:");
    console.log("Expected:", hash);
    console.log("Generated:", hmac);
    console.log("Check String:", checkString);
    return res.status(403).json({ success: false, message: "Invalid login" });
  }

  // ✅ User is verified
  const userJSON = parsed.get("user");
  let user = {};
  try {
    user = JSON.parse(decodeURIComponent(userJSON));
  } catch (err) {
    return res.status(500).json({ success: false, message: "Invalid user JSON" });
  }

  console.log("✅ Telegram login successful:", user);
  res.json({ success: true, user });
});

app.get("/", (req, res) => {
  res.send("✅ Skye backend running with secure Telegram login.");
});

app.listen(PORT, () => {
  console.log(`🚀 Skye backend running on port ${PORT}`);
});

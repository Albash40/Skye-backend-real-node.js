// server.js (backend) const express = require("express"); const crypto = require("crypto"); const cors = require("cors"); const app = express();

const PORT = process.env.PORT || 3000; const TELEGRAM_BOT_TOKEN = "8072913283:AAHhPDOWSYofrLKXLbKmNWJQ0wC1tu4XC2c";

app.use(cors()); app.use(express.json());

app.post("/auth/telegram", (req, res) => { const { initData } = req.body; if (!initData) return res.status(400).json({ success: false, message: "Missing initData" });

const parsed = new URLSearchParams(initData); const hash = parsed.get("hash");

// ONLY include keys allowed by Telegram const allowedKeys = ["auth_date", "user", "query_id"]; const dataCheckArr = []; for (const [key, value] of parsed.entries()) { if (key !== "hash" && allowedKeys.includes(key)) { dataCheckArr.push(${key}=${value}); } } const checkString = dataCheckArr.sort().join("\n");

const secret = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest(); const computedHash = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

if (computedHash !== hash) { console.log("❌ Invalid login attempt", { expected: hash, computed: computedHash, checkString }); return res.status(403).json({ success: false, message: "Invalid login" }); }

let user = {}; try { user = JSON.parse(parsed.get("user")); } catch (err) { return res.status(500).json({ success: false, message: "User parse error" }); }

console.log("✅ Verified user", user); return res.json({ success: true, user }); });

app.get("/", (req, res) => { res.send("Skye backend running ✅"); });

app.listen(PORT, () => { console.log(Server running on port ${PORT}); });


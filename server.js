const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

let codes = {};

// carica codici se esistono
if (fs.existsSync("./data/codes.json")) {
  codes = JSON.parse(fs.readFileSync("./data/codes.json"));
}

// 🔹 CREA CODICE (dal bot Discord)
app.post("/create-code", (req, res) => {
  const { code, reward } = req.body;

  codes[code] = {
    reward,
    used: false,
    userId: null
  };

  fs.writeFileSync("./data/codes.json", JSON.stringify(codes, null, 2));

  res.json({ success: true });
});

// 🔹 REDEEM (da Roblox)
app.post("/redeem", (req, res) => {
  const { code, userId } = req.body;

  const entry = codes[code];

  if (!entry) return res.json({ success: false, msg: "Codice non valido" });

  if (entry.used) return res.json({ success: false, msg: "Già usato" });

  if (entry.userId && entry.userId !== userId)
    return res.json({ success: false, msg: "Non tuo codice" });

  entry.used = true;
  entry.userId = userId;

  fs.writeFileSync("./data/codes.json", JSON.stringify(codes, null, 2));

  res.json({ success: true, reward: entry.reward });
});

app.listen(3000, () => {
  console.log("API avviata su porta 3000");
});
const express = require("express");
const bodyParser = require("body-parser");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
app.use(bodyParser.json());

let sock;

async function connectWA() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  sock = makeWASocket({ auth: state });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.qr) {
      console.log("⚡ Scan QR di terminal untuk login WhatsApp");
    }
    if (update.connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });
}
connectWA();

app.post("/send-bug", async (req, res) => {
  const { nomor, bugType } = req.body;
  if (!nomor || !bugType) {
    return res.json({ message: "❌ Nomor atau BugType kosong!" });
  }

  try {
    await sock.sendMessage(nomor + "@s.whatsapp.net", { text: `.${bugType} [ ${nomor} ]` });
    res.json({ message: `✅ Bug ${bugType} terkirim ke ${nomor}` });
  } catch (err) {
    res.json({ message: "❌ Gagal kirim bug: " + err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Backend jalan di port " + PORT));
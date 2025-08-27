const login = require("fca-unofficial");
const fs = require("fs");
const express = require("express");
const axios = require("axios");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

// Apna Group ID aur Name yahan daal
const GROUP_THREAD_ID = "7856010577456992";
const LOCKED_GROUP_NAME = "FUCKER HERE 

const app = express();
const PORT = process.env.PORT || 3000;

let lastResetTime = 0; // Pichli baar name reset ka time

// Web server (anti-sleep route)
app.get("/", (req, res) => {
  res.send("✅ Bot is alive and running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// Render ko jagata rahe (har 4 minute me apne aap ko ping karega)
setInterval(() => {
  axios.get(`https://${process.env.RENDER_EXTERNAL_HOSTNAME || "localhost:" + PORT}`)
    .then(() => console.log("🔄 Self-ping to keep bot alive"))
    .catch(() => console.log("⚠️ Self-ping failed (ignore if local)"));
}, 240000); // 4 minute me ek baar

// Group name checker
const startBot = (api) => {
  const checkLoop = async () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error getting group info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          const now = Date.now();
          const timeSinceLastReset = (now - lastResetTime) / 1000;

          if (timeSinceLastReset >= 30) {
            console.log(`⚠️ Group name changed to "${info.name}". Resetting in 10 seconds...`);

            setTimeout(() => {
              api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
                if (err) {
                  console.error("❌ Failed to reset name:", err);
                } else {
                  console.log("🔒 Group name reset successfully.");
                  lastResetTime = Date.now();
                }
              });
            }, 10000);
          } else {
            console.log(`🕒 Waiting (${Math.floor(30 - timeSinceLastReset)}s) before next reset...`);
          }
        } else {
          console.log("✅ Group name is correct.");
        }
      }
      setTimeout(checkLoop, 5000); // 5 sec me fir check kare
    });
  };
  checkLoop();
};

// Login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }
  console.log("✅ Logged in successfully.");
  startBot(api);

});



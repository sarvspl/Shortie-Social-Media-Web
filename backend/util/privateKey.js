const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function getSettings() {
  if (global.settingJSON && global.settingJSON.privateKey && global.settingJSON.privateKey.project_id) {
    return global.settingJSON;
  }

  // 1. Check local gitignored serviceAccountKey.json file
  const localKeyPath = path.join(__dirname, "../serviceAccountKey.json");
  if (fs.existsSync(localKeyPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(localKeyPath, "utf-8"));
      if (fileData && fileData.project_id && fileData.private_key) {
        return { privateKey: fileData };
      }
    } catch (e) {
      console.warn("⚠️ Failed reading serviceAccountKey.json:", e.message);
    }
  }

  // 2. Check environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const envData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (envData && envData.project_id && envData.private_key) {
        return { privateKey: envData };
      }
    } catch (e) {}
  }

  try {
    return require("../setting");
  } catch (e) {
    return {};
  }
}

function initFirebase() {
  try {
    if (admin.apps.length > 0) {
      return admin;
    }

    const settings = getSettings();
    if (
      settings.privateKey &&
      typeof settings.privateKey === "object" &&
      settings.privateKey.project_id &&
      settings.privateKey.client_email &&
      settings.privateKey.private_key
    ) {
      admin.initializeApp({
        credential: admin.credential.cert(settings.privateKey),
      });
      console.log(`✅ Firebase Admin SDK initialized successfully (${settings.privateKey.project_id})`);
      return admin;
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
  }
  return null;
}

const dummyMessaging = () => ({
  send: async () => ({ status: false, message: "Firebase not configured" }),
  sendEach: async () => ({ responses: [], successCount: 0, failureCount: 0 }),
  sendMulticast: async () => ({ responses: [], successCount: 0, failureCount: 0 }),
  sendEachForMulticast: async () => ({ responses: [], successCount: 0, failureCount: 0 }),
  subscribeToTopic: async () => ({ successCount: 0, failureCount: 0 }),
  unsubscribeFromTopic: async () => ({ successCount: 0, failureCount: 0 }),
});

const dummyAuth = () => ({
  verifyIdToken: async () => {
    throw new Error("Firebase Auth not configured yet.");
  },
});

// Proxy to seamlessly support both synchronous calls: admin.messaging(), admin.auth()
// and asynchronous / await calls: (await admin).messaging(), adminPromise.messaging()
const adminProxy = new Proxy(admin, {
  get(target, prop) {
    const initialized = initFirebase();
    if (initialized) {
      if (prop === "then") {
        return (resolve) => resolve(initialized);
      }
      const val = initialized[prop];
      return typeof val === "function" ? val.bind(initialized) : val;
    }

    if (prop === "then") {
      return (resolve) => resolve({ messaging: dummyMessaging, auth: dummyAuth });
    }
    if (prop === "messaging") {
      return dummyMessaging;
    }
    if (prop === "auth") {
      return dummyAuth;
    }
    const val = target[prop];
    return typeof val === "function" ? val.bind(target) : val;
  },
});

// Trigger initial setup attempt
initFirebase();

module.exports = adminProxy;

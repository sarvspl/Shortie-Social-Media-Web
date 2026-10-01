const admin = require("firebase-admin");

const initFirebase = async () => {
  try {
    const settings = global.settingJSON || {};
    if (
      settings.privateKey &&
      typeof settingJSON.privateKey === "object" &&
      settingJSON.privateKey.project_id &&
      settingJSON.privateKey.client_email &&
      settingJSON.privateKey.private_key
    ) {
      admin.initializeApp({
        credential: admin.credential.cert(settingJSON.privateKey),
      });
      console.log("Firebase Admin SDK initialized successfully");
      return admin;
    } else {
      console.warn("⚠️ Firebase Admin SDK: privateKey not configured in settings yet. Push notifications disabled until uploaded in Admin Panel.");
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
      return {
        messaging: dummyMessaging,
        auth: dummyAuth,
      };
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
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
    return {
      messaging: dummyMessaging,
      auth: dummyAuth,
    };
  }
};

module.exports = initFirebase();


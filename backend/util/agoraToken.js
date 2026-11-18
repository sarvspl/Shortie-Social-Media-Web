const { RtcTokenBuilder, RtmTokenBuilder, RtcRole } = require("agora-token");

const getAgoraCredentials = () => {
  const appId =
    global?.settingJSON?.agoraAppId ||
    process.env.AGORA_APP_ID ||
    "fb62b621f060417bb8220f8a97e4f6e1";
  const appCertificate =
    global?.settingJSON?.agoraAppCertificate ||
    process.env.AGORA_APP_CERTIFICATE ||
    "df067132cce94bcd89c775863fd6dff8";

  return { appId, appCertificate };
};

/**
 * Generate Agora RTC Token for video streaming
 * @param {Object} params
 * @param {string} params.channelName - Name of the channel/room
 * @param {number|string} [params.uid] - Numeric UID or 0
 * @param {string} [params.userAccount] - String userAccount (e.g. MongoDB User ID)
 * @param {number} [params.role] - RtcRole.PUBLISHER (1) or RtcRole.SUBSCRIBER (2)
 * @param {number} [params.expireSeconds] - Expiry in seconds (default 24h = 86400)
 */
const generateRtcToken = ({
  channelName,
  uid = 0,
  userAccount = null,
  role = RtcRole.PUBLISHER,
  expireSeconds = 86400,
}) => {
  const { appId, appCertificate } = getAgoraCredentials();
  if (!appId || !appCertificate) {
    throw new Error("Agora App ID or App Certificate is missing");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireSeconds;

  // For numeric UID (0 = universal wildcard for any user joining the channel)
  const numericUid = typeof uid === "number" ? uid : parseInt(uid, 10) || 0;
  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    role,
    expireSeconds,
    privilegeExpiredTs
  );
};

/**
 * Generate Agora RTM Token for real-time messaging
 * @param {Object} params
 * @param {string} params.userAccount - String userAccount (e.g. MongoDB User ID)
 * @param {number} [params.expireSeconds] - Expiry in seconds (default 24h = 86400)
 */
const generateRtmToken = ({ userAccount, expireSeconds = 86400 }) => {
  const { appId, appCertificate } = getAgoraCredentials();
  if (!appId || !appCertificate) {
    throw new Error("Agora App ID or App Certificate is missing");
  }

  return RtmTokenBuilder.buildToken(
    appId,
    appCertificate,
    String(userAccount),
    expireSeconds
  );
};

module.exports = {
  getAgoraCredentials,
  generateRtcToken,
  generateRtmToken,
  RtcRole,
};


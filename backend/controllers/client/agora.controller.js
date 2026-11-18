const {
  getAgoraCredentials,
  generateRtcToken,
  generateRtmToken,
  RtcRole,
} = require("../../util/agoraToken");

// Get Agora RTC and RTM token
exports.getAgoraToken = async (req, res) => {
  try {
    const channelName = req.query.channelName || req.body.channelName;
    const userId = req.query.userId || req.body.userId || "";
    const roleParam = (req.query.role || req.body.role || "publisher").toLowerCase();

    if (!channelName) {
      return res.status(200).json({
        status: false,
        message: "channelName is required",
      });
    }

    const { appId } = getAgoraCredentials();
    const role = roleParam === "audience" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    // Generate RTC token (expires in 24 hours)
    const rtcToken = generateRtcToken({
      channelName,
      uid: 0,
      userAccount: userId ? String(userId) : null,
      role,
      expireSeconds: 86400,
    });

    // Generate RTM token for the user
    let rtmToken = "";
    if (userId) {
      rtmToken = generateRtmToken({
        userAccount: String(userId),
        expireSeconds: 86400,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Agora tokens generated successfully",
      data: {
        appId,
        channelName,
        rtcToken,
        rtmToken,
        uid: 0,
      },
    });
  } catch (error) {
    console.error("Agora token generation error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to generate Agora token",
    });
  }
};


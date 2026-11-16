const LiveUser = require("../../models/liveUser.model");

//import model
const User = require("../../models/user.model");
const LiveHistory = require("../../models/liveHistory.model");
const Livevideo = require("../../models/livevideo.model");
const FollowerFollowing = require("../../models/followerFollowing.model");
const Notification = require("../../models/notification.model");

//private key
const admin = require("../../util/privateKey");

//momemt
const moment = require("moment-timezone");

//mongoose
const mongoose = require("mongoose");

//agora token
const { getAgoraCredentials, generateRtcToken, RtcRole } = require("../../util/agoraToken");

const liveUserFunction = async (liveUser, data) => {
  liveUser.name = data.name;
  liveUser.userName = data.userName;
  liveUser.image = data.image;
  liveUser.isProfileImageBanned = data.isProfileImageBanned;
  liveUser.countryFlagImage = data.countryFlagImage;
  liveUser.country = data.country;
  liveUser.isVerified = data.isVerified;
  liveUser.isFake = data.isFake;
  liveUser.userId = data._id;

  await liveUser.save();
  return liveUser;
};

//live the user
exports.liveUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [existUser, existLiveUser] = await Promise.all([User.findOne({ _id: userId }), LiveUser.findOne({ userId: userId })]);

    if (!existUser) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (existUser.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (existLiveUser) {
      console.log("delete existLiveUser");
      await LiveUser.deleteOne({ userId: existUser._id });
    }

    const liveHistory = new LiveHistory();
    liveHistory.userId = existUser._id;
    liveHistory.startTime = moment().tz("Asia/Kolkata").format();

    existUser.isLive = true;
    existUser.liveHistoryId = liveHistory._id;

    let liveUserData;
    const liveUser = new LiveUser();
    liveUser.liveHistoryId = liveHistory._id;

    try {
      const { appId } = getAgoraCredentials();
      const agoraChannel = liveHistory._id.toString();
      const rtcToken = generateRtcToken({
        channelName: agoraChannel,
        uid: 0,
        userAccount: existUser._id.toString(),
        role: RtcRole.PUBLISHER,
      });
      liveUser.agoraToken = rtcToken;
      liveUser.agoraAppId = appId;
    } catch (agoraErr) {
      console.warn("Agora token generation failed in liveUser:", agoraErr.message);
    }

    liveUserData = await liveUserFunction(liveUser, existUser);

    await Promise.all([liveHistory?.save(), existUser?.save()]);

    res.status(200).json({
      status: true,
      message: "User is live Successfully.",
      data: liveUser,
    });

    // 1. Find all followers of the host
    const followerIds = await FollowerFollowing.find({ toUserId: existUser._id }).distinct("fromUserId");

    // 2. Create in-app notifications for followers
    if (followerIds.length > 0) {
      const nowStr = moment().tz("Asia/Kolkata").format("DD/MM/YYYY, hh:mm:ss A");
      const inAppNotifications = followerIds.map((fId) => ({
        userId: fId,
        otherUserId: existUser._id,
        title: `${existUser?.name || "Someone"} is live now! 🚀✨`,
        message: "📺 Tap to join the live stream and catch the action! 👉🎥👀",
        image: existUser?.image || "",
        date: nowStr,
      }));
      Notification.insertMany(inAppNotifications).catch((err) => console.warn("Failed creating follower in-app notifications:", err.message));
    }

    // 3. Find target users for push notification: prioritize followers
    let targetUserQuery = {
      _id: { $ne: existUser._id },
      isBlock: false,
    };
    if (followerIds.length > 0) {
      // Send to all followers
      targetUserQuery._id = { $in: followerIds, $ne: existUser._id };
    } else {
      // If 0 followers, notify active non-live users (up to 100)
      targetUserQuery.isLive = false;
    }

    const targetUsers = await User.find(targetUserQuery).select("fcmToken _id").limit(500).lean();

    const rawTokens = targetUsers.map((u) => u.fcmToken).filter(Boolean);
    const hostFcmToken = (existUser.fcmToken || "").trim();

    const tokens = [...new Set(rawTokens.filter(
      (t) => typeof t === "string" && t.trim().length > 20 && !t.startsWith("dummy") && !t.startsWith("connect_default") && !t.startsWith("token_") && t.trim() !== hostFcmToken
    ))];

    if (tokens.length !== 0) {
      try {
        const adminPromise = await admin;
        // Batch in chunks of 500 (Firebase multicast limit)
        for (let i = 0; i < tokens.length; i += 500) {
          const batch = tokens.slice(i, i + 500);
          const payload = {
            tokens: batch,
            notification: {
              title: `${existUser?.name || "Someone"} is live now! 🚀✨`,
              body: "📺 Tap to join the live stream and catch the action! 👉🎥👀",
              image: existUser?.image || undefined,
            },
            data: {
              type: "LIVE",
              userId: existUser._id ? existUser._id.toString() : "",
              liveHistoryId: liveHistory._id ? liveHistory._id.toString() : "",
              liveUserObjId: liveUser._id ? liveUser._id.toString() : "",
              name: existUser?.name || "",
              image: existUser?.image || "",
            },
            android: {
              priority: "high",
              notification: {
                channelId: "general_notifications",
                priority: "high",
                defaultSound: true,
                defaultVibrateTimings: true,
              },
            },
          };

          adminPromise
            .messaging()
            .sendEachForMulticast(payload)
            .then((response) => {
              console.log(`Live notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
            })
            .catch((error) => {
              console.error("Error sending live multicast notification:", error);
            });
        }
      } catch (notifyErr) {
        console.warn("Live notification setup error:", notifyErr.message);
      }
    }
  } catch (error) {
    console.log(error);
    if (!res.headersSent) {
      return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
    }
  }
};

//get live user list
exports.getliveUserList = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const userId = req.query.userId ? new mongoose.Types.ObjectId(req.query.userId) : null;

    if (settingJSON.isFakeData) {
      console.log("fake data on");

      const [livevideo, realLive] = await Promise.all([
        Livevideo.aggregate([
          {
            $match: {
              isLive: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    userName: 1,
                    image: 1,
                    countryFlagImage: 1,
                    isProfileImageBanned: 1,
                    isVerified: 1,
                    isFake: 1,
                  }
                }
              ],
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $addFields: {
              view: {
                $floor: {
                  $add: [
                    1,
                    {
                      $multiply: [50, { $rand: {} }],
                    },
                  ],
                },
              },
              liveHistoryId: null,
              liveUserObjId: null,
              isFollow: true,
              isPkMode: true,
              host2Name: "",
              host2Image: "",
              host2isProfileImageBanned: false,
            },
          },
          {
            $project: {
              _id: 0,
              userId: "$user._id",
              name: "$user.name",
              userName: "$user.userName",
              image: "$user.image",
              countryFlagImage: "$user.countryFlagImage",
              isProfileImageBanned: "$user.isProfileImageBanned",
              isVerified: "$user.isVerified",
              isFake: "$user.isFake",
              videoImage: 1,
              videoUrl: 1,
              pkPreviewImages: 1,
              pkMediaSources: 1,
              liveHistoryId: 1,
              liveUserObjId: 1,
              view: 1,
              isPkMode: 1,
              host2Name: 1,
              host2Image: 1,
              host2isProfileImageBanned: 1,
            },
          },
        ]),
        User.aggregate([
          {
            $match: {
              isBlock: false,
              isLive: true,
              ...(userId ? { _id: { $ne: userId } } : {}),
            },
          },
          {
            $lookup: {
              from: "liveusers",
              localField: "_id",
              foreignField: "userId",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    liveHistoryId: 1,
                    view: 1,
                    isPkMode: 1,
                    "pkConfig.host2Name": 1,
                    "pkConfig.host2Image": 1,
                    "pkConfig.host2Details.isProfileImageBanned": 1,
                  }
                }
              ],
              as: "liveUser"
            }
          },
          {
            $unwind: {
              path: "$liveUser",
              preserveNullAndEmptyArrays: false,
            }
          },
          {
            $lookup: {
              from: "followerfollowings",
              localField: "_id",
              foreignField: "toUserId",
              pipeline: [
                {
                  $match: {
                    fromUserId: userId,
                  },
                },
                { $limit: 1 }
              ],
              as: "isFollow",
            },
          },
          {
            $addFields: {
              videoImage: "",
              videoUrl: "",
              pkPreviewImages: [],
              pkMediaSources: [],
            },
          },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              name: 1,
              userName: 1,
              image: 1,
              countryFlagImage: 1,
              isProfileImageBanned: 1,
              isVerified: 1,
              isFake: 1,
              videoImage: 1,
              videoUrl: 1,
              pkPreviewImages: 1,
              pkMediaSources: 1,
              liveUserObjId: "$liveUser._id",
              liveHistoryId: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.liveHistoryId", null] },
              view: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.view", 0] },
              isPkMode: "$liveUser.isPkMode",
              host2Name: "$liveUser.pkConfig.host2Name",
              host2Image: "$liveUser.pkConfig.host2Image",
              host2isProfileImageBanned: "$liveUser.pkConfig.host2Details.isProfileImageBanned",
              isFollow: { $gt: [{ $size: "$isFollow" }, 0] }
            },
          },
        ]),
      ]);

      const shuffledLiveVideo = livevideo.sort(() => Math.random() - 0.5);

      const combinedData = [...shuffledLiveVideo, ...realLive];

      const paginatedData = combinedData.slice((start - 1) * limit, start * limit);

      return res.status(200).json({
        status: true,
        message: "Retrive live user list.",
        liveUserList: paginatedData.length > 0 ? paginatedData : [],
      });
    } else {
      const data = await User.aggregate([
        {
          $match: {
            isBlock: false,
            isLive: true,
            ...(userId ? { _id: { $ne: userId } } : {}),
          },
        },
        {
          $lookup: {
            from: "liveusers",
            localField: "_id",
            foreignField: "userId",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  liveHistoryId: 1,
                  view: 1,
                  isPkMode: 1,
                  "pkConfig.host2Name": 1,
                  "pkConfig.host2Image": 1,
                  "pkConfig.host2Details.isProfileImageBanned": 1,
                }
              }
            ],
            as: "liveUser"
          }
        },
        {
          $unwind: {
            path: "$liveUser",
            preserveNullAndEmptyArrays: false,
          }
        },
        {
          $lookup: {
            from: "followerfollowings",
            localField: "_id",
            foreignField: "toUserId",
            pipeline: [
              {
                $match: {
                  fromUserId: userId,
                },
              },
              { $limit: 1 }
            ],
            as: "isFollow",
          },
        },
        {
          $addFields: {
            videoImage: "",
            videoUrl: "",
            pkPreviewImages: [],
            pkMediaSources: [],
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: 1,
            userName: 1,
            image: 1,
            countryFlagImage: 1,
            isProfileImageBanned: 1,
            isVerified: 1,
            isFake: 1,
            videoImage: 1,
            videoUrl: 1,
            pkPreviewImages: 1,
            pkMediaSources: 1,
            liveUserObjId: "$liveUser._id",
            liveHistoryId: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.liveHistoryId", null] },
            view: { $cond: [{ $eq: ["$isLive", true] }, "$liveUser.view", 0] },
            isPkMode: "$liveUser.isPkMode",
            host2Name: "$liveUser.pkConfig.host2Name",
            host2Image: "$liveUser.pkConfig.host2Image",
            host2isProfileImageBanned: "$liveUser.pkConfig.host2Details.isProfileImageBanned",
            isFollow: { $gt: [{ $size: "$isFollow" }, 0] }
          },
        },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]);

      return res.status(200).json({
        status: true,
        message: "Retrive live user list.",
        liveUserList: data.length > 0 ? data : [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get pk request
exports.fetchPkInvitations = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be needed." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const data = await LiveUser.aggregate([
      {
        $match: {
          isPkMode: false,
          userId: { $ne: userId },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          userName: 1,
          image: 1,
          userId: 1,
          channel: 1,
          token: 1,
          liveHistoryId: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive live user list.",
      liveUserList: data.length > 0 ? data : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get live summary
exports.fetchLiveAnalytics = async (req, res) => {
  try {
    const { liveHistoryId } = req.query;

    if (!liveHistoryId) {
      return res.status(200).json({ status: false, message: "The 'liveHistoryId' parameter is required." });
    }

    const liveHistoryObjectId = new mongoose.Types.ObjectId(liveHistoryId);

    const liveHistory = await LiveHistory.findById(liveHistoryObjectId).populate("userId", "name userName isProfileImageBanned image isVerified uniqueId gender age countryFlagImage country").lean();

    if (!liveHistory) {
      return res.status(200).json({ status: false, message: "Live history not found." });
    }

    const responseData = {
      user: {
        name: liveHistory.userId?.name || "",
        userName: liveHistory.userId?.userName || "",
        image: liveHistory.userId?.image || "",
        isProfileImageBanned: liveHistory.userId?.isProfileImageBanned || false,
        isVerified: liveHistory.userId?.isVerified || false,
        uniqueId: liveHistory.userId?.uniqueId || "",
        gender: liveHistory.userId?.gender || "",
        age: liveHistory.userId?.age || "",
        uniqueId: liveHistory.userId?.uniqueId || "",
        countryFlagImage: liveHistory.userId?.countryFlagImage || "",
        country: liveHistory.userId?.country || "",
      },
      totalUser: liveHistory.totalUser || 0,
      totalGift: liveHistory.totalGift || 0,
      totalLiveChat: liveHistory.totalLiveChat || 0,
      liveFollowCount: liveHistory.liveFollowCount || 0,
      totalCoinsEarned: liveHistory.totalCoinsEarned || 0,
      duration: liveHistory.duration || "00:00:00",
    };

    return res.status(200).json({
      status: true,
      message: "Live summary fetched successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Live summary error:", error);
    return res.status(500).json({ status: false, message: "Internal server error.", error: error.message });
  }
};

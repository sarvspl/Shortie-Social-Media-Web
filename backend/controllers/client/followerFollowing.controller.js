const FollowerFollowing = require("../../models/followerFollowing.model");

//import model
const User = require("../../models/user.model");
const Notification = require("../../models/notification.model");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

//follow or unfollow the user
exports.followUnfollowUser = async (req, res) => {
  try {
    if (!req.query.fromUserId || !req.query.toUserId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const fromUserId = new mongoose.Types.ObjectId(req.query.fromUserId);
    const toUserId = new mongoose.Types.ObjectId(req.query.toUserId);

    const [fromUser, toUser, alreadyFollower] = await Promise.all([
      User.findOne({ _id: fromUserId }).select("_id name isBlock image").lean(),
      User.findOne({ _id: toUserId }).select("_id isBlock fcmToken").lean(),
      FollowerFollowing.findOne({ fromUserId: fromUserId, toUserId: toUserId }).lean(),
    ]);

    if (!fromUser) {
      return res.status(200).json({ status: false, message: "fromUser does not found." });
    }

    if (fromUser.isBlock) {
      return res.status(200).json({ status: false, message: "fromUser blocked by the admin." });
    }

    if (!toUser) {
      return res.status(200).json({ status: false, message: "toUser does not found." });
    }

    if (toUser.isBlock) {
      return res.status(200).json({ status: false, message: "toUser blocked by the admin." });
    }

    if (fromUser._id.equals(toUser._id)) {
      return res.status(200).json({ status: false, message: "You can't follow your own account." });
    }

    if (alreadyFollower) {
      await FollowerFollowing.deleteOne({
        fromUserId: fromUser._id,
        toUserId: toUser._id,
      });

      return res.status(200).json({
        status: true,
        message: `Someone has just stopped following you!`,
        isFollow: false,
      });
    } else {
      const followerFollowing = new FollowerFollowing();
      followerFollowing.fromUserId = fromUser._id;
      followerFollowing.toUserId = toUser._id;
      await followerFollowing.save();

      res.status(200).json({
        status: true,
        message: `Someone just followed you!`,
        isFollow: true,
      });

      if (!toUser.isBlock && toUser.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: toUser.fcmToken,
          notification: {
            title: "👥 You've Got a New Connection!",
            body: `🚀 ${fromUser?.name || "Someone"} just started following you! Check them out 👀✨`,
          },
          data: {
            type: "FOLLOW",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = toUser._id;
            notification.otherUserId = fromUser._id;
            notification.title = "👥 You've Got a New Connection!";
            notification.message = `🚀 ${fromUser?.name || "Someone"} just started following you! Check them out 👀✨`;
            notification.image = fromUser.image;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get follower or following list of the particular user
exports.followerFollowingList = async (req, res, next) => {
  try {
    if (!req.query.userId || !req.query.type) {
      return res.status(200).json({ status: false, message: "userId and type must be required." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const start = Math.max(parseInt(req.query.start) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);

    if (req.query.type === "followerList") {
      const [user, followerResult] = await Promise.all([
        User.findOne({ _id: userId }).select("isBlock").lean(),
        FollowerFollowing.aggregate([
          { $match: { toUserId: userId } },
          {
            $facet: {
              metadata: [{ $count: "total" }],
              data: [
                { $sort: { createdAt: -1 } },
                { $skip: (start - 1) * limit },
                { $limit: limit },
                {
                  $lookup: {
                    from: "users",
                    localField: "fromUserId",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          userName: 1,
                          image: 1,
                          isVerified: 1,
                          isFake: 1,
                          isProfileImageBanned: 1
                        }
                      }
                    ],
                    as: "fromUserId"
                  }
                },
                { $unwind: "$fromUserId" },
                {
                  $project: {
                    _id: 1,
                    createdAt: 1,
                    fromUserId: {
                      _id: "$fromUserId._id",
                      name: "$fromUserId.name",
                      userName: "$fromUserId.userName",
                      image: "$fromUserId.image",
                      isVerified: "$fromUserId.isVerified",
                      isFake: "$fromUserId.isFake",
                      isProfileImageBanned: "$fromUserId.isProfileImageBanned",
                    },
                  },
                },
              ],
            },
          },
        ])
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      const followerCount = followerResult[0]?.metadata[0]?.total || 0;
      const followerList = followerResult[0]?.data || [];

      return res.status(200).json({
        status: true,
        message: `Retrive ${req.query.type} user for the particular user.`,
        total: followerCount,
        followerFollowing: followerList,
      });
    } else if (req.query.type === "followingList") {
      const [user, followingResult] = await Promise.all([
        User.findOne({ _id: userId }).select("isBlock").lean(),
        FollowerFollowing.aggregate([
          { $match: { fromUserId: userId } },
          {
            $facet: {
              metadata: [{ $count: "total" }],
              data: [
                { $sort: { createdAt: -1 } },
                { $skip: (start - 1) * limit },
                { $limit: limit },
                {
                  $lookup: {
                    from: "users",
                    localField: "toUserId",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          userName: 1,
                          image: 1,
                          isVerified: 1,
                          isFake: 1,
                          isProfileImageBanned: 1
                        }
                      }
                    ],
                    as: "toUserId"
                  }
                },
                { $unwind: "$toUserId" },
                {
                  $project: {
                    _id: 1,
                    createdAt: 1,
                    toUserId: {
                      _id: "$toUserId._id",
                      name: "$toUserId.name",
                      userName: "$toUserId.userName",
                      image: "$toUserId.image",
                      isVerified: "$toUserId.isVerified",
                      isFake: "$toUserId.isFake",
                      isProfileImageBanned: "$toUserId.isProfileImageBanned",
                    },
                  },
                },
              ],
            },
          },
        ])
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      const followingCount = followingResult[0]?.metadata[0]?.total || 0;
      const followingList = followingResult[0]?.data || [];

      return res.status(200).json({
        status: true,
        message: `Retrive ${req.query.type} user for the particular user.`,
        total: followingCount,
        followerFollowing: followingList,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

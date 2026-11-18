const PostOrVideoComment = require("../../models/postOrvideoComment.model");

//import model
const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const Video = require("../../models/video.model");
const LikeHistoryOfpostOrvideoComment = require("../../models/likeHistoryOfpostOrvideoComment.model");
const Notification = require("../../models/notification.model");

//day.js
const dayjs = require("dayjs");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

// Helper function to send notification to replied/mentioned user, thread participants, and post/video owner
async function sendCommentAndReplyNotifications({ user, ownerUser, commentText, type, typeId, image, replyUserId, replyCommentId }) {
  try {
    const adminPromise = await admin;
    const rawComment = (commentText || "").trim();
    // Clean reply markup so users see a clean notification message
    const cleanComment = rawComment.replace(/\[reply:[a-fA-F0-9]{24}\]/g, "").trim() || rawComment;

    // Track notified users to prevent duplicate notifications and never notify oneself
    const notifiedUserIds = new Set();
    notifiedUserIds.add(user._id.toString());

    // Resolve direct parent comment ID from param or embedded [reply:...]
    let effectiveReplyCommentId = replyCommentId;
    if (!effectiveReplyCommentId) {
      const match = rawComment.match(/\[reply:([a-fA-F0-9]{24})\]/);
      if (match && match[1]) {
        effectiveReplyCommentId = match[1];
      }
    }

    const notificationsToSend = [];

    // 1. Direct parent comment author
    let directParentComment = null;
    if (effectiveReplyCommentId && mongoose.Types.ObjectId.isValid(effectiveReplyCommentId)) {
      directParentComment = await PostOrVideoComment.findById(effectiveReplyCommentId).lean();
      if (directParentComment && directParentComment.userId) {
        const directAuthorIdStr = directParentComment.userId.toString();
        if (!notifiedUserIds.has(directAuthorIdStr)) {
          const directUser = await User.findOne({ _id: directParentComment.userId, isBlock: false }).lean();
          if (directUser) {
            notifiedUserIds.add(directAuthorIdStr);
            notificationsToSend.push({
              recipient: directUser,
              title: `💬 ${user?.name || "Someone"} replied to your comment`,
              message: `${user?.name || "A user"} replied: ${cleanComment}`,
            });
          }
        }
      }
    }

    // 2. Explicit replyUserId if provided
    if (replyUserId && mongoose.Types.ObjectId.isValid(replyUserId)) {
      const rIdStr = replyUserId.toString();
      if (!notifiedUserIds.has(rIdStr)) {
        const rUser = await User.findOne({ _id: new mongoose.Types.ObjectId(replyUserId), isBlock: false }).lean();
        if (rUser) {
          notifiedUserIds.add(rIdStr);
          notificationsToSend.push({
            recipient: rUser,
            title: `💬 ${user?.name || "Someone"} replied to your comment`,
            message: `${user?.name || "A user"} replied: ${cleanComment}`,
          });
        }
      }
    }

    // 3. Traverse ancestor comments up the thread so every user in the chain gets notified
    // Example: Allen (owner), Emily commented (C1), Soumodip replied (C2), Puja replied (C3).
    // When Puja replies to C2: Soumodip gets direct reply, Emily gets thread reply, Allen gets owner notification.
    let curr = directParentComment;
    let depth = 0;
    while (curr && curr.replyCommentId && depth < 10) {
      depth++;
      const ancestor = await PostOrVideoComment.findById(curr.replyCommentId).lean();
      if (!ancestor) break;
      if (ancestor.userId) {
        const ancestorIdStr = ancestor.userId.toString();
        if (!notifiedUserIds.has(ancestorIdStr)) {
          const ancestorUser = await User.findOne({ _id: ancestor.userId, isBlock: false }).lean();
          if (ancestorUser) {
            notifiedUserIds.add(ancestorIdStr);
            notificationsToSend.push({
              recipient: ancestorUser,
              title: `💬 ${user?.name || "Someone"} also replied`,
              message: `${user?.name || "A user"} also replied in the comment thread: ${cleanComment}`,
            });
          }
        }
      }
      curr = ancestor;
    }

    // 4. Post / Video Owner notification
    if (ownerUser && !notifiedUserIds.has(ownerUser._id.toString())) {
      notifiedUserIds.add(ownerUser._id.toString());
      notificationsToSend.push({
        recipient: ownerUser,
        title: "💬 New Comment Alert! 💬",
        message: `Hey there! A user has commented on your ${type}. Check it out now!`,
      });
    }

    // 5. Mentioned users (@userName)
    const mentionMatches = cleanComment.matchAll(/@([a-zA-Z0-9_\s]{2,25})/g);
    for (const match of mentionMatches) {
      const candidate = match[1].trim();
      const candidateFirstWord = candidate.split(" ")[0].trim();
      const mentionedUser = await User.findOne({
        $and: [
          { _id: { $nin: Array.from(notifiedUserIds).map((id) => new mongoose.Types.ObjectId(id)) } },
          { isBlock: false },
          {
            $or: [
              { userName: new RegExp("^@?" + candidate + "$", "i") },
              { name: new RegExp("^" + candidate + "$", "i") },
              { userName: new RegExp("^@?" + candidateFirstWord + "$", "i") },
              { name: new RegExp("^" + candidateFirstWord + "$", "i") },
            ],
          },
        ],
      }).lean();

      if (mentionedUser && !notifiedUserIds.has(mentionedUser._id.toString())) {
        notifiedUserIds.add(mentionedUser._id.toString());
        notificationsToSend.push({
          recipient: mentionedUser,
          title: `💬 ${user?.name || "Someone"} mentioned you`,
          message: `${user?.name || "A user"} mentioned you in a comment: ${cleanComment}`,
        });
      }
    }

    // Dispatch notifications to all unique recipients
    for (const item of notificationsToSend) {
      const recipient = item.recipient;

      // In-App Notification (userId = recipient who reads it, otherUserId = sender/commenter)
      try {
        const notif = new Notification();
        notif.userId = recipient._id;
        notif.otherUserId = user._id;
        notif.title = item.title;
        notif.message = item.message;
        notif.image = image || "";
        notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await notif.save();
        console.log(`✅ [NOTIF] Saved in-app notification for ${recipient.name || recipient.userName} (${item.title})`);
      } catch (saveErr) {
        console.error(`❌ [NOTIF] Error saving notification for ${recipient._id}:`, saveErr.message);
      }

      // FCM Push Notification (if token exists)
      if (recipient.fcmToken) {
        try {
          const payload = {
            token: recipient.fcmToken,
            notification: {
              title: item.title,
              body: item.message,
            },
            data: {
              type: type === "post" ? "POSTCOMMENT" : "VIDEOCOMMENT",
              [type === "post" ? "postId" : "videoId"]: typeId ? typeId.toString() : "",
            },
            android: {
              priority: "high",
              notification: {
                channelId: "general_notifications",
                sound: "default",
                clickAction: "FLUTTER_NOTIFICATION_CLICK",
              },
            },
          };

          adminPromise
            .messaging()
            .send(payload)
            .then(() => console.log(`✅ [FCM] Push sent to ${recipient.name || recipient.userName}`))
            .catch((e) => console.log(`⚠️ [FCM] Send error to ${recipient.name || recipient._id}:`, e.message));
        } catch (fcmErr) {
          console.error(`⚠️ [FCM] Dispatch error:`, fcmErr.message);
        }
      }
    }
  } catch (notifErr) {
    console.log("Error sending comment notifications:", notifErr);
  }
}

//create comment of particular post or video
exports.commentOfPostOrVideo = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.commentText || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    // Resolve replyCommentId from query or commentText
    let replyCommentIdToSave =
      req.query.replyCommentId && mongoose.Types.ObjectId.isValid(req.query.replyCommentId)
        ? new mongoose.Types.ObjectId(req.query.replyCommentId)
        : null;

    if (!replyCommentIdToSave) {
      const match = req.query.commentText.match(/\[reply:([a-fA-F0-9]{24})\]/);
      if (match && match[1] && mongoose.Types.ObjectId.isValid(match[1])) {
        replyCommentIdToSave = new mongoose.Types.ObjectId(match[1]);
      }
    }

    if (req.query.type === "post") {
      if (!req.query.postId) {
        return res.status(200).json({ status: false, message: "postId must be requried." });
      }

      const userId = new mongoose.Types.ObjectId(req.query.userId);
      const postId = new mongoose.Types.ObjectId(req.query.postId);

      const [user, post, postOrVideoComment] = await Promise.all([
        User.findOne({ _id: userId }).lean(),
        Post.findOne({ _id: postId }).lean(),
        PostOrVideoComment.create({
          userId: userId,
          postId: postId,
          commentText: req.query.commentText.trim(),
          replyCommentId: replyCommentIdToSave,
        }),
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      if (!post) {
        return res.status(200).json({ status: false, message: "post does not found." });
      }

      res.status(200).json({ status: true, message: "Comment passed on post by that user.", postOrVideoComment: postOrVideoComment });

      const postUser = await User.findOne({ _id: post?.userId }).lean();
      sendCommentAndReplyNotifications({
        user,
        ownerUser: postUser,
        commentText: req.query.commentText,
        type: "post",
        typeId: post._id,
        image: post.mainPostImage,
        replyUserId: req.query.replyUserId,
        replyCommentId: replyCommentIdToSave ? replyCommentIdToSave.toString() : null,
      });
    } else if (req.query.type === "video") {
      if (!req.query.videoId) {
        return res.status(200).json({ status: false, message: "videoId must be requried." });
      }

      const userId = new mongoose.Types.ObjectId(req.query.userId);
      const videoId = new mongoose.Types.ObjectId(req.query.videoId);

      const [user, video, postOrVideoComment] = await Promise.all([
        User.findOne({ _id: userId }).lean(),
        Video.findOne({ _id: videoId }).lean(),
        PostOrVideoComment.create({
          userId: userId,
          videoId: videoId,
          commentText: req.query.commentText.trim(),
          replyCommentId: replyCommentIdToSave,
        }),
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      if (!video) {
        return res.status(200).json({ status: false, message: "video does not found." });
      }

      res.status(200).json({ status: true, message: "Comment passed on video by that user.", postOrVideoComment: postOrVideoComment });

      const videoUser = await User.findOne({ _id: video.userId }).lean();
      sendCommentAndReplyNotifications({
        user,
        ownerUser: videoUser,
        commentText: req.query.commentText,
        type: "video",
        typeId: video._id,
        image: video.videoImage,
        replyUserId: req.query.replyUserId,
        replyCommentId: replyCommentIdToSave ? replyCommentIdToSave.toString() : null,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//create like or dislike of particular comment
exports.likeOrDislikeOfComment = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.postOrVideoCommentId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const postOrVideoCommentId = new mongoose.Types.ObjectId(req.query.postOrVideoCommentId);

    const [user, postOrVideoComment, alreadylikedPostOrVideoComment] = await Promise.all([
      User.findOne({ _id: userId }).lean(),
      PostOrVideoComment.findById(postOrVideoCommentId),
      LikeHistoryOfpostOrvideoComment.findOne({
        userId: userId,
        postOrvideoCommentId: postOrVideoCommentId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin." });
    }

    if (!postOrVideoComment) {
      return res.status(200).json({ status: false, message: "postOrVideoComment does not found." });
    }

    if (alreadylikedPostOrVideoComment) {
      await LikeHistoryOfpostOrvideoComment.deleteOne({
        userId: user._id,
        postOrvideoCommentId: postOrVideoComment._id,
      });

      return res.status(200).json({
        status: true,
        message: "The comment was marked with a dislike by the user.",
        isLike: false,
      });
    } else {
      console.log("else");

      let post, video;
      const likeHistoryOfpostOrvideoComment = new LikeHistoryOfpostOrvideoComment();
      if (postOrVideoComment.postId !== null) {
        post = await Post.findById(postOrVideoComment.postId);
        likeHistoryOfpostOrvideoComment.postId = post?._id;
      } else {
        video = await Video.findById(postOrVideoComment.videoId);
        likeHistoryOfpostOrvideoComment.videoId = video?._id;
      }

      likeHistoryOfpostOrvideoComment.userId = user._id;
      likeHistoryOfpostOrvideoComment.postOrvideoCommentId = postOrVideoComment._id;
      await likeHistoryOfpostOrvideoComment.save();

      return res.status(200).json({
        status: true,
        message: "The comment was marked with a like by the user.",
        isLike: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all comments for particular video or post
exports.getpostOrvideoComments = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (req.query.type === "post") {
      if (!req.query.postId) {
        return res.status(200).json({ status: false, message: "postId must be requried." });
      }

      let now = dayjs();

      const userId = new mongoose.Types.ObjectId(req.query.userId);
      const postId = new mongoose.Types.ObjectId(req.query.postId);

      const [user, post, postOrVideoComment] = await Promise.all([
        User.findOne({ _id: userId }).lean(),
        Post.findOne({ _id: postId }).lean(),
        PostOrVideoComment.aggregate([
          {
            $match: { postId: postId, videoId: null },
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
                    isProfileImageBanned: 1,
                    image: 1,
                    isVerified: 1,
                  },
                },
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
            $lookup: {
              from: "likehistoryofpostorvideocomments",
              localField: "_id",
              foreignField: "postOrvideoCommentId",
              pipeline: [
                { $count: "count" }
              ],
              as: "totalLikes",
            },
          },
          {
            $lookup: {
              from: "likehistoryofpostorvideocomments",
              localField: "_id",
              foreignField: "postOrvideoCommentId",
              pipeline: [
                { $match: { userId: userId } },
                { $count: "count" }
              ],
              as: "likeHistory"
            }
          },
          {
            $project: {
              userId: "$user._id",
              name: "$user.name",
              userName: "$user.userName",
              isProfileImageBanned: "$user.isProfileImageBanned",
              userImage: "$user.image",
              isVerified: "$user.isVerified",
              commentText: 1,
              replyCommentId: 1,
              createdAt: 1,
              totalLikes: { $ifNull: [{ $arrayElemAt: ["$totalLikes.count", 0] }, 0] },
              isLike: {
                $gt: [
                  { $ifNull: [{ $arrayElemAt: ["$likeHistory.count", 0] }, 0] },
                  0
                ]
              },
              time: {
                $let: {
                  vars: {
                    timeDiff: { $subtract: [now.toDate(), "$createdAt"] },
                  },
                  in: {
                    $concat: [
                      {
                        $switch: {
                          branches: [
                            {
                              case: { $gte: ["$$timeDiff", 31536000000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 2592000000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 604800000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 86400000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 3600000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 60000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 1000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
                            },
                            { case: true, then: "Just now" },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
        ]),
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      if (!post) {
        return res.status(200).json({ status: false, message: "post does not found." });
      }

      return res.status(200).json({ status: true, message: "Comments for particular post.", postOrVideoComment: postOrVideoComment });
    } else if (req.query.type === "video") {
      if (!req.query.videoId) {
        return res.status(200).json({ status: false, message: "videoId must be requried." });
      }

      let now = dayjs();

      const userId = new mongoose.Types.ObjectId(req.query.userId);
      const videoId = new mongoose.Types.ObjectId(req.query.videoId);

      const [user, video, postOrVideoComment] = await Promise.all([
        User.findOne({ _id: userId }).lean(),
        Video.findOne({ _id: videoId }).lean(),
        PostOrVideoComment.aggregate([
          {
            $match: { videoId: videoId, postId: null },
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
                    isProfileImageBanned: 1,
                    image: 1,
                    isVerified: 1,
                  },
                },
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
            $lookup: {
              from: "likehistoryofpostorvideocomments",
              localField: "_id",
              foreignField: "postOrvideoCommentId",
              pipeline: [
                { $count: "count" }
              ],
              as: "totalLikes",
            },
          },
          {
            $lookup: {
              from: "likehistoryofpostorvideocomments",
              localField: "_id",
              foreignField: "postOrvideoCommentId",
              pipeline: [
                { $match: { userId: userId } },
                { $count: "count" }
              ],
              as: "likeHistory",
            },
          },
          {
            $project: {
              userId: "$user._id",
              name: "$user.name",
              userName: "$user.userName",
              userImage: "$user.image",
              commentText: 1,
              replyCommentId: 1,
              createdAt: 1,
              totalLikes: { $ifNull: [{ $arrayElemAt: ["$totalLikes.count", 0] }, 0] },
              isLike: {
                $gt: [
                  { $ifNull: [{ $arrayElemAt: ["$likeHistory.count", 0] }, 0] },
                  0
                ]
              },
              time: {
                $let: {
                  vars: {
                    timeDiff: { $subtract: [now.toDate(), "$createdAt"] },
                  },
                  in: {
                    $concat: [
                      {
                        $switch: {
                          branches: [
                            {
                              case: { $gte: ["$$timeDiff", 31536000000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 2592000000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 604800000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 86400000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 3600000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 60000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                            },
                            {
                              case: { $gte: ["$$timeDiff", 1000] },
                              then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
                            },
                            { case: true, then: "Just now" },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
        ]),
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "you are blocked by the admin." });
      }

      if (!video) {
        return res.status(200).json({ status: false, message: "video does not found." });
      }

      return res.status(200).json({ status: true, message: "Comments for particular video.", postOrVideoComment: postOrVideoComment });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

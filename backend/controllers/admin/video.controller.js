const Video = require("../../models/video.model");

//import model
const User = require("../../models/user.model");
const Song = require("../../models/song.model");
const HashTag = require("../../models/hashTag.model");
const HashTagUsageHistory = require("../../models/hashTagUsageHistory.model");
const Report = require("../../models/report.model");
const LikeHistoryOfPostOrVideo = require("../../models/likeHistoryOfpostOrvideo.model");
const PostOrVideoComment = require("../../models/postOrvideoComment.model");
const WatchHistory = require("../../models/watchHistory.model");
const LikeHistoryOfpostOrvideoComment = require("../../models/likeHistoryOfpostOrvideoComment.model");
const Notification = require("../../models/notification.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//generateUniqueVideoOrPostId
const { generateUniqueVideoOrPostId } = require("../../util/generateUniqueVideoOrPostId");

//mongoose
const mongoose = require("mongoose");

//upload fake video
exports.uploadfakevideo = async (req, res, next) => {
  try {
    console.log("body: ", req.body);

    if (!req.query.userId) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    if (!req.body.caption || !req.body.videoTime || !req.body.hashTagId || !req?.body?.videoUrl || !req?.body?.videoImage) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [uniqueVideoId, user, song] = await Promise.all([generateUniqueVideoOrPostId(), User.findOne({ _id: req.query.userId, isFake: true }), Song.findById(req?.body?.songId)]);

    if (!user) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!settingJSON) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "setting does not found!" });
    }

    if (settingJSON.durationOfShorts < parseInt(req.body.videoTime)) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "your duration of Video greater than decided by the admin." });
    }

    if (req?.body?.songId) {
      if (!song) {
        if (req?.body?.videoUrl) {
          await deleteFromStorage(req?.body?.videoUrl);
        }

        if (req?.body?.videoImage) {
          await deleteFromStorage(req?.body?.videoImage);
        }

        return res.status(200).json({ status: false, message: "Song does not found." });
      }
    }

    const video = new Video();

    video.userId = user._id;
    video.caption = req?.body?.caption;
    video.videoTime = req?.body?.videoTime;
    video.songId = req?.body?.songId ? song?._id : video?.songId;

    let hashTagPromises = [];
    if (req?.body?.hashTagId.length > 0) {
      const multipleHashTag = req?.body?.hashTagId.toString().split(",");
      video.hashTagId = multipleHashTag;

      //create history for each hashtag used
      hashTagPromises = multipleHashTag.map(async (hashTagId) => {
        const hashTag = await HashTag.findById(hashTagId);
        if (hashTag) {
          const hashTagUsageHistory = new HashTagUsageHistory({
            userId: user._id,
            hashTagId: hashTagId,
            videoId: video._id,
          });
          await hashTagUsageHistory.save();
        }
      });
    }

    if (req?.body?.videoImage) {
      video.videoImage = req.body.videoImage;
    }

    if (req?.body?.videoUrl) {
      video.videoUrl = req.body.videoUrl;
    }

    video.isFake = true;
    video.uniqueVideoId = uniqueVideoId;

    await Promise.all([...hashTagPromises, video.save()]);

    const data = await Video.findById(video._id).populate("userId", "name userName image");

    return res.status(200).json({ status: true, message: "Video has been uploaded by the admin.", data: data });
  } catch (error) {
    if (req?.body?.videoUrl) {
      await deleteFromStorage(req?.body?.videoUrl);
    }

    if (req?.body?.videoImage) {
      await deleteFromStorage(req?.body?.videoImage);
    }

    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//update fake video
exports.updatefakevideo = async (req, res, next) => {
  try {
    if (!req.query.userId || !req.query.videoId) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "userId and videoId must be requried." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const [user, fakeVideoOfUser, song] = await Promise.all([User.findOne({ _id: userId }), Video.findOne({ _id: videoId, userId: userId }), Song.findById(req?.body?.songId)]);

    if (!user) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!fakeVideoOfUser) {
      if (req?.body?.videoUrl) {
        await deleteFromStorage(req?.body?.videoUrl);
      }

      if (req?.body?.videoImage) {
        await deleteFromStorage(req?.body?.videoImage);
      }

      return res.status(200).json({ status: false, message: "video does not found for this user." });
    }

    if (req?.body?.songId) {
      if (!song) {
        if (req?.body?.videoUrl) {
          await deleteFromStorage(req?.body?.videoUrl);
        }

        if (req?.body?.videoImage) {
          await deleteFromStorage(req?.body?.videoImage);
        }

        return res.status(200).json({ status: false, message: "Song does not found." });
      }
    }

    if (req?.body?.videoImage) {
      await deleteFromStorage(fakeVideoOfUser.videoImage);

      fakeVideoOfUser.videoImage = req?.body?.videoImage ? req?.body?.videoImage : fakeVideoOfUser.videoImage;
    }

    if (req?.body?.videoUrl) {
      await deleteFromStorage(fakeVideoOfUser?.videoUrl);

      fakeVideoOfUser.videoUrl = req?.body?.videoUrl ? req?.body?.videoUrl : fakeVideoOfUser.videoUrl;
    }

    fakeVideoOfUser.songId = req?.body?.songId ? song._id : fakeVideoOfUser.songId;
    fakeVideoOfUser.videoTime = req.body.videoTime ? req.body.videoTime : fakeVideoOfUser.videoTime;
    fakeVideoOfUser.caption = req.body.caption ? req.body.caption : fakeVideoOfUser.caption;
    await fakeVideoOfUser.save();

    const data = await Video.findById(fakeVideoOfUser._id).populate("userId", "name userName image");

    return res.status(200).json({ status: true, message: "Video has been updated by the admin.", fakeVideoOfUser: data });
  } catch (error) {
    if (req?.body?.videoUrl) {
      await deleteFromStorage(req?.body?.videoUrl);
    }

    if (req?.body?.videoImage) {
      await deleteFromStorage(req?.body?.videoImage);
    }

    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//get real or fake videos
exports.getVideos = async (req, res, next) => {
  try {
    const { startDate, endDate, type, start, limit, search } = req.query;

    if (!startDate || !endDate || !type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const page = start ? parseInt(start) : 1;
    const pageSize = limit ? parseInt(limit) : 20;
    const searchStr = typeof search === "string" ? search.trim() : "";

    let dateFilter = {};
    if (startDate !== "All" && endDate !== "All") {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);

      dateFilter.createdAt = { $gte: sDate, $lte: eDate };
    }

    let videoFilter = { ...dateFilter };
    if (type === "realVideo") videoFilter.isFake = false;
    else if (type === "fakeVideo") videoFilter.isFake = true;
    else return res.status(200).json({ status: false, message: "type must be passed valid." });

    const searchMatch = searchStr
      ? {
        $or: [
          { uniqueVideoId: { $regex: searchStr, $options: "i" } },
          { "user.name": { $regex: searchStr, $options: "i" } },
          { "user.userName": { $regex: searchStr, $options: "i" } },
          { "user.uniqueId": { $regex: searchStr, $options: "i" } },
        ],
      }
      : {};

    const result = await Video.aggregate([
      { $match: videoFilter },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, userName: 1, image: 1, uniqueId: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(searchStr ? [{ $match: searchMatch }] : []),

      {
        $lookup: {
          from: "hashtags",
          localField: "hashTagId",
          foreignField: "_id",
          as: "hashTags",
        },
      },

      {
        $lookup: {
          from: "likehistoryofpostorvideos",
          localField: "_id",
          foreignField: "videoId",
          pipeline: [
            { $count: "count" }
          ],
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postorvideocomments",
          localField: "_id",
          foreignField: "videoId",
          pipeline: [
            { $count: "count" }
          ],
          as: "comments",
        },
      },

      {
        $facet: {
          data: [
            {
              $project: {
                caption: 1,
                videoTime: 1,
                videoUrl: 1,
                videoImage: 1,
                isFake: 1,
                createdAt: 1,
                uniqueVideoId: 1,
                totalLikes: { $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0] },
                totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
                userId: "$user._id",
                name: "$user.name",
                userName: "$user.userName",
                userImage: "$user.image",
                uniqueId: "$user.uniqueId",
                hashTags: "$hashTags",
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: `Retrieve ${type} of the users.`,
      totalVideo: result[0]?.total || 0,
      videos: result[0]?.data || [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular user's videos
exports.getVideosOfUser = async (req, res, next) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const result = await Video.aggregate([
      { $match: { userId: userId } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, userName: 1, image: 1, uniqueId: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $lookup: {
          from: "likehistoryofpostorvideos",
          localField: "_id",
          foreignField: "videoId",
          pipeline: [
            { $count: "count" }
          ],
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postorvideocomments",
          localField: "_id",
          foreignField: "videoId",
          pipeline: [
            { $count: "count" }
          ],
          as: "comments",
        },
      },

      {
        $lookup: {
          from: "hashtags",
          localField: "hashTagId",
          foreignField: "_id",
          as: "hashTags",
        },
      },

      {
        $facet: {
          data: [
            {
              $project: {
                caption: 1,
                videoTime: 1,
                videoUrl: 1,
                videoImage: 1,
                isFake: 1,
                createdAt: 1,
                totalLikes: { $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0] },
                totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
                userId: "$user._id",
                name: "$user.name",
                userName: "$user.userName",
                userImage: "$user.image",
                uniqueId: "$user.uniqueId",
                hashTags: "$hashTags",
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (start - 1) * limit },
            { $limit: limit },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
        },
      },
    ]);

    const user = await User.findOne({ _id: userId }).select("_id").lean();
    const totalVideoOfUser = result[0]?.total || 0;
    const realVideoOfUser = result[0]?.data || [];

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    return res.status(200).json({
      status: true,
      message: `Retrive videos of the users.`,
      total: totalVideoOfUser,
      data: realVideoOfUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//get particular video details
exports.getDetailOfVideo = async (req, res, next) => {
  try {
    if (!req.query.videoId) {
      return res.status(200).json({ status: false, message: "videoId must be required." });
    }

    const videoId = new mongoose.Types.ObjectId(req.query.videoId);

    const video = await Video.findOne({ _id: videoId }).lean();
    if (!video) {
      return res.status(200).json({ status: false, message: "Video does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive video's details.",
      data: video,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete video multiple or single
exports.deleteVideo = async (req, res) => {
  try {
    if (!req.query.videoId) {
      return res.status(200).json({ status: false, message: "videoId must be required." });
    }

    const videoIds = req.query.videoId.split(",");

    const videos = await Promise.all(videoIds.map((Id) => Video.findById(Id)));
    if (videos.some((video) => !video)) {
      return res.status(200).json({ status: false, message: "No videos found with the provided IDs." });
    }

    res.status(200).json({ status: true, message: "Videos have been deleted by the admin." });

    await videos.map(async (video) => {
      if (video?.videoImage) {
        await deleteFromStorage(video?.videoImage);
      }

      if (video?.videoUrl) {
        await deleteFromStorage(video?.videoUrl);
      }

      await Promise.all([
        LikeHistoryOfPostOrVideo.deleteMany({ videoId: video._id }),
        PostOrVideoComment.deleteMany({ videoId: video._id }),
        LikeHistoryOfpostOrvideoComment.deleteMany(),
        WatchHistory.deleteMany({ videoId: video._id }),
        HashTagUsageHistory.deleteMany({ videoId: video._id }),
        Report.deleteMany({ videoId: video._id }),
        Notification.deleteMany({ otherUserId: video?.userId }),
        Video.deleteOne({ _id: video._id }),
      ]);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

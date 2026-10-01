const HashTag = require("../../models/hashTag.model");

//import model
const HashTagUsageHistory = require("../../models/hashTagUsageHistory.model");
const User = require("../../models/user.model");
const Video = require("../../models/video.model");

//mongoose
const mongoose = require("mongoose");

//day.js
const dayjs = require("dayjs");

//create hashTag by user
exports.createHashTag = async (req, res) => {
  try {
    if (!req.body.hashTag) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const hashTag = req.body.hashTag.trim();

    const alreadyExist = await HashTag.findOne({ hashTag: hashTag }).lean();

    if (alreadyExist) {
      return res.status(200).json({
        status: true,
        message: "HashTag already exist.",
        data: alreadyExist,
      });
    } else {
      const newHashTag = new HashTag();
      newHashTag.hashTag = hashTag;
      await newHashTag.save();

      return res.status(200).json({
        status: true,
        message: "HashTag created.",
        data: newHashTag,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all hashTag (when add the video by particular user)
exports.hashtagDrop = async (req, res) => {
  try {
    const searchHashTag = req.query.hashTag?.trim() || "";

    const matchCondition = searchHashTag
      ? { hashTag: { $regex: searchHashTag, $options: "i" } }
      : {};

    const hashTags = await HashTag.aggregate([
      { $match: matchCondition },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "hashtagusagehistories",
          localField: "_id",
          foreignField: "hashTagId",
          pipeline: [{ $count: "count" }],
          as: "usage",
        },
      },
      {
        $addFields: { totalHashTagUsedCount: { $ifNull: [{ $arrayElemAt: ["$usage.count", 0] }, 0] } },
      },
      { $project: { hashTag: 1, totalHashTagUsedCount: 1 } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieve hashtags when video uploaded by the user.",
      data: hashTags,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get particular hashTag's video
exports.videosOfHashTag = async (req, res) => {
  try {
    const { hashTagId, userId } = req.query;

    if (!hashTagId) {
      return res.status(200).json({ status: false, message: "hashTagId must be required." });
    }

    const hashTagObjectId = new mongoose.Types.ObjectId(hashTagId);
    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

    const [user, hashTag, videos] = await Promise.all([
      userObjectId ? User.findOne({ _id: userObjectId }).lean() : null,
      HashTag.findOne({ _id: hashTagObjectId }).lean(),
      HashTagUsageHistory.aggregate([
        { $match: { hashTagId: hashTagObjectId, videoId: { $ne: null } } },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  videoImage: 1,
                  videoUrl: 1,
                  caption: 1,
                  songId: 1,
                  hashTagId: 1,
                  userId: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "video",
          },
        },
        { $unwind: "$video" },
        {
          $lookup: {
            from: "users",
            localField: "video.userId",
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
                  isProfileImageBanned: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "songs",
            localField: "video.songId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  songTitle: 1,
                  songImage: 1,
                  singerName: 1,
                  songLink: 1,
                },
              },
            ],
            as: "song",
          },
        },
        {
          $unwind: {
            path: "$song",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "video.hashTagId",
            foreignField: "_id",
            as: "hashTag",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "video._id",
            foreignField: "videoId",
            pipeline: [{ $project: { userId: 1 } }],
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "postorvideocomments",
            localField: "video._id",
            foreignField: "videoId",
            pipeline: [{ $count: "count" }],
            as: "comments",
          },
        },
        {
          $addFields: {
            isLike: userObjectId ? { $in: [userObjectId, "$likes.userId"] } : false,
            totalLikes: { $size: "$likes" },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
          },
        },
        {
          $project: {
            videoId: "$video._id",
            videoImage: "$video.videoImage",
            videoUrl: "$video.videoUrl",
            caption: "$video.caption",
            songId: "$video.songId",
            createdAt: "$video.createdAt",
            userId: "$user._id",
            isProfileImageBanned: "$user.isProfileImageBanned",
            name: "$user.name",
            userName: "$user.userName",
            userIsFake: "$user.isFake",
            userImage: "$user.image",
            isVerified: "$user.isVerified",
            hashTag: "$hashTag.hashTag",

            songTitle: "$song.songTitle",
            songImage: "$song.songImage",
            songLink: "$song.songLink",
            singerName: "$song.singerName",

            isLike: 1,
            totalLikes: 1,
            totalComments: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    if (userId && !user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (!hashTag) {
      return res.status(200).json({ status: false, message: "HashTag does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved videos with hashtag details.",
      data: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular hashTag's post
exports.postsOfHashTag = async (req, res) => {
  try {
    const { hashTagId, userId } = req.query;
    if (!hashTagId) {
      return res.status(200).json({ status: false, message: "hashTagId must be required." });
    }

    let now = dayjs();
    const hashTagObjectId = new mongoose.Types.ObjectId(hashTagId);
    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

    const [user, hashTag, posts] = await Promise.all([
      userObjectId ? User.findOne({ _id: userObjectId }).lean() : null,
      HashTag.findOne({ _id: hashTagObjectId }).lean(),
      HashTagUsageHistory.aggregate([
        { $match: { hashTagId: hashTagObjectId, postId: { $ne: null } } },
        {
          $lookup: {
            from: "posts",
            localField: "postId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  caption: 1,
                  mainPostImage: 1,
                  postImage: 1,
                  userId: 1,
                  hashTagId: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "post",
          },
        },
        { $unwind: "$post" },
        {
          $addFields: {
            postImage: {
              $filter: {
                input: "$post.postImage",
                as: "image",
                cond: { $eq: ["$$image.isBanned", false] },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "post.userId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  userName: 1,
                  image: 1,
                  isVerified: 1,
                  isProfileImageBanned: 1,
                  isFake: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "hashtags",
            localField: "post.hashTagId",
            foreignField: "_id",
            as: "hashTag",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "post._id",
            foreignField: "postId",
            pipeline: [{ $project: { userId: 1 } }],
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "postorvideocomments",
            localField: "post._id",
            foreignField: "postId",
            pipeline: [{ $count: "count" }],
            as: "comments",
          },
        },
        {
          $addFields: {
            isLike: userObjectId ? { $in: [userObjectId, "$likes.userId"] } : false,
            totalLikes: { $size: "$likes" },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
          },
        },
        {
          $project: {
            postId: "$post._id",
            caption: "$post.caption",
            mainPostImage: "$post.mainPostImage",
            postImage: 1,
            createdAt: "$post.createdAt",
            userId: "$user._id",
            name: "$user.name",
            userName: "$user.userName",
            userImage: "$user.image",
            isVerified: "$user.isVerified",
            isProfileImageBanned: "$user.isProfileImageBanned",
            isFake: "$user.isFake",
            hashTag: "$hashTag.hashTag",
            isLike: 1,
            totalLikes: 1,
            totalComments: 1,
            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now.toDate(), "$post.createdAt"] },
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

    if (userId && !user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (!hashTag) {
      return res.status(200).json({ status: false, message: "HashTag does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved posts with hashtag details.",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get most used hashTag ( web )
exports.retrievePopularHashtag = async (req, res, next) => {
  try {
    const hashTags = await HashTag.aggregate([
      {
        $lookup: {
          from: "hashtagusagehistories",
          localField: "_id",
          foreignField: "hashTagId",
          pipeline: [{ $count: "count" }],
          as: "usageHistory",
        },
      },
      {
        $addFields: {
          usageCount: { $ifNull: [{ $arrayElemAt: ["$usageHistory.count", 0] }, 0] },
        },
      },
      {
        $project: {
          usageHistory: 0,
          hashTagIcon: 0,
          hashTagBanner: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
      {
        $sort: { usageCount: -1 },
      },
      {
        $limit: 20,
      },
    ]).allowDiskUse(false);

    return res.status(200).json({
      success: true,
      message: hashTags.length > 0 ? "Popular hashtags retrieved successfully." : "No hashtags found.",
      hashtags: hashTags,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular hashTag's video ( web )
exports.trendingHashTagVideos = async (req, res) => {
  try {
    const { hashTagId, userId } = req.query;

    if (!hashTagId) {
      return res.status(200).json({ status: false, message: "hashTagId must be required." });
    }

    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;
    let videos = [];

    if (hashTagId === "all") {
      videos = await Video.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            pipeline: [
              { $project: { _id: 1, name: 1, userName: 1, image: 1, isVerified: 1, isFake: 1, isProfileImageBanned: 1 } }
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "songs",
            localField: "songId",
            foreignField: "_id",
            pipeline: [
              { $project: { _id: 1, songTitle: 1, songImage: 1, singerName: 1, songLink: 1 } }
            ],
            as: "song",
          },
        },
        {
          $unwind: {
            path: "$song",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "hashTagId",
            foreignField: "_id",
            as: "hashTag",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [{ $project: { userId: 1 } }],
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "postorvideocomments",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [{ $count: "count" }],
            as: "comments",
          },
        },
        {
          $addFields: {
            isLike: userId ? { $in: [userObjectId, "$likes.userId"] } : false,
            totalLikes: { $size: "$likes" },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
          },
        },
        {
          $project: {
            videoId: "$_id",
            videoImage: "$videoImage",
            videoUrl: "$videoUrl",
            caption: "$caption",
            songId: "$songId",
            createdAt: "$createdAt",
            userId: "$user._id",
            name: "$user.name",
            userName: "$user.userName",
            userIsFake: "$user.isFake",
            userImage: "$user.image",
            isProfileImageBanned: "$user.isProfileImageBanned",
            isVerified: "$user.isVerified",
            hashTag: "$hashTag.hashTag",
            songTitle: "$song.songTitle",
            songImage: "$song.songImage",
            songLink: "$song.songLink",
            singerName: "$song.singerName",
            isLike: 1,
            totalLikes: 1,
            totalComments: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    } else {
      const hashTagObjectId = new mongoose.Types.ObjectId(hashTagId);
      const [user, hashTag] = await Promise.all([userId ? User.findOne({ _id: userObjectId }).lean() : null, HashTag.findOne({ _id: hashTagObjectId }).lean()]);

      if (userId && !user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (!hashTag) {
        return res.status(200).json({ status: false, message: "HashTag does not found." });
      }

      videos = await HashTagUsageHistory.aggregate([
        { $match: { hashTagId: hashTagObjectId, videoId: { $ne: null } } },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            pipeline: [
              { $project: { _id: 1, videoImage: 1, videoUrl: 1, caption: 1, songId: 1, userId: 1, hashTagId: 1, createdAt: 1 } }
            ],
            as: "video",
          },
        },
        { $unwind: "$video" },
        {
          $lookup: {
            from: "users",
            localField: "video.userId",
            foreignField: "_id",
            pipeline: [
              { $project: { _id: 1, name: 1, userName: 1, image: 1, isVerified: 1, isFake: 1, isProfileImageBanned: 1 } }
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "songs",
            localField: "video.songId",
            foreignField: "_id",
            pipeline: [{ $project: { _id: 1, songTitle: 1, songImage: 1, singerName: 1, songLink: 1 } }],
            as: "song",
          },
        },
        {
          $unwind: {
            path: "$song",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "hashtags",
            localField: "video.hashTagId",
            foreignField: "_id",
            as: "hashTag",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "video._id",
            foreignField: "videoId",
            pipeline: [{ $project: { userId: 1 } }],
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "postorvideocomments",
            localField: "video._id",
            foreignField: "videoId",
            pipeline: [{ $count: "count" }],
            as: "comments",
          },
        },
        {
          $addFields: {
            isLike: userId ? { $in: [userObjectId, "$likes.userId"] } : false,
            totalLikes: { $size: "$likes" },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0] },
          },
        },
        {
          $project: {
            videoId: "$video._id",
            videoImage: "$video.videoImage",
            videoUrl: "$video.videoUrl",
            caption: "$video.caption",
            songId: "$video.songId",
            createdAt: "$video.createdAt",
            userId: "$user._id",
            name: "$user.name",
            userName: "$user.userName",
            userIsFake: "$user.isFake",
            userImage: "$user.image",
            isProfileImageBanned: "$user.isProfileImageBanned",
            isVerified: "$user.isVerified",
            hashTag: "$hashTag.hashTag",
            songTitle: "$song.songTitle",
            songImage: "$song.songImage",
            songLink: "$song.songLink",
            singerName: "$song.singerName",
            isLike: 1,
            totalLikes: 1,
            totalComments: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    }

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved videos.",
      data: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

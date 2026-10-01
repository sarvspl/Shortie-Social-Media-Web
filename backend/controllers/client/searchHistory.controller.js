const SearchHistory = require("../../models/searchHistory.model");

//import model
const User = require("../../models/user.model");
const HashTag = require("../../models/hashTag.model");
const Post = require("../../models/post.model");
const Video = require("../../models/video.model");
const Song = require("../../models/song.model");
const Story = require("../../models/story.model");

//mongoose
const mongoose = require("mongoose");

//search users
exports.searchUsers = async (req, res) => {
  try {
    const { userId, userSearchString } = req.query;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid userId." });
    }

    const userSearch = userSearchString ? userSearchString.trim() : "";

    const userPromise = userId ? User.findOne({ _id: new mongoose.Types.ObjectId(userId) }).lean() : Promise.resolve(null); // If no userId, resolve with null
    const existSearchHistoryPromise = userSearch
      ? SearchHistory.findOne({
        userId: userId,
        userSearchString: { $regex: `^${userSearch}$`, $options: "i" }, // exact match, case-insensitive
      })
      : Promise.resolve(false);

    const searchPromise = userSearch
      ? User.aggregate([
        { $match: { _id: { $ne: userId }, isBlock: false } },
        {
          $match: {
            $or: [{ name: { $regex: userSearch, $options: "i" } }, { userName: { $regex: userSearch, $options: "i" } }],
          },
        },
        {
          $lookup: {
            from: "stories",
            localField: "_id",
            foreignField: "user",
            pipeline: [
              { $sort: { createdAt: -1 } },
              {
                $lookup: {
                  from: "songs",
                  localField: "backgroundSong",
                  foreignField: "_id",
                  as: "backgroundSong",
                },
              },
              { $unwind: { path: "$backgroundSong", preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  mediaImageUrl: 1,
                  mediaVideoUrl: 1,
                  viewsCount: 1,
                  reactionsCount: 1,
                  storyType: 1,
                  duration: 1,
                  createdAt: 1,
                  backgroundSong: {
                    _id: "$backgroundSong._id",
                    songTitle: "$backgroundSong.songTitle",
                    songImage: "$backgroundSong.songImage",
                    singerName: "$backgroundSong.singerName",
                    songTime: "$backgroundSong.songTime",
                    songLink: "$backgroundSong.songLink",
                  },
                },
              },
            ],
            as: "stories", // stories per searched user
          },
        },
        {
          $project: {
            name: 1,
            userName: 1,
            image: 1,
            isVerified: 1,
            isFake: 1,
            isProfileImageBanned: 1,
            stories: 1, // include stories array
          },
        },
      ])
      : User.aggregate([
        { $match: { _id: { $ne: userId }, isBlock: false } },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "stories",
            localField: "_id",
            foreignField: "user",
            pipeline: [{ $sort: { createdAt: -1 } }],
            as: "stories",
          },
        },
        {
          $project: {
            name: 1,
            userName: 1,
            image: 1,
            isVerified: 1,
            isFake: 1,
            isProfileImageBanned: 1,
            stories: 1,
          },
        },
      ]);

    const [user, existSearchHistory, response] = await Promise.all([userPromise, existSearchHistoryPromise, searchPromise]);

    if (userId && !user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (userId && user && user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    res.status(200).json({ status: true, message: "Success", searchData: response });

    const isFullMatch = response.some((u) => u.name?.toLowerCase() === userSearch.toLowerCase() || u.userName?.toLowerCase() === userSearch.toLowerCase());

    if (userId && userSearch && !existSearchHistory && isFullMatch) {
      const searchHistory = new SearchHistory();
      searchHistory.userId = userId;
      searchHistory.userSearchString = userSearch;
      await searchHistory.save();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get previous search data of users
exports.searchedDataOfUsers = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const userPromise = User.findOne({ _id: req.query.userId }).select("_id isBlock").lean();
    const searchHistoryPromise = SearchHistory.find({ userId: req.query.userId, hashTagSearchString: null })
      .select("userSearchString userId createdAt")
      .sort({ createdAt: -1 }) //Sort by most recently searched
      .lean()
      .limit(20);

    const [user, lastSearchedData] = await Promise.all([userPromise, searchHistoryPromise]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      lastSearchedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//search hashTag
exports.searchHashTag = async (req, res) => {
  try {
    const { userId, hashTagSearchString } = req.query;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid userId." });
    }

    const userSearch = hashTagSearchString ? hashTagSearchString.trim() : "";

    const userPromise = userId ? User.findOne({ _id: new mongoose.Types.ObjectId(userId) }) : Promise.resolve(null);

    const existSearchHistoryPromise = userSearch
      ? SearchHistory.findOne({
        userId: userId,
        hashTagSearchString: { $regex: `^${userSearch}$`, $options: "i" }, // exact match, case-insensitive,
      })
      : Promise.resolve(false);

    const searchPromise = userSearch
      ? HashTag.aggregate([
        {
          $match: {
            hashTag: { $regex: userSearch, $options: "i" },
          },
        },
        {
          $lookup: {
            from: "hashtagusagehistories",
            localField: "_id",
            foreignField: "hashTagId",
            pipeline: [
              { $match: { videoId: { $ne: null } } },
              { $count: "count" }
            ],
            as: "videoCount"
          }
        },
        {
          $lookup: {
            from: "hashtagusagehistories",
            localField: "_id",
            foreignField: "hashTagId",
            pipeline: [
              { $match: { postId: { $ne: null } } },
              { $count: "count" }
            ],
            as: "postCount"
          }
        },
        {
          $project: {
            _id: 1,
            hashTag: 1,
            hashTagBanner: 1,
            hashTagIcon: 1,
            totalVideo: { $ifNull: [{ $arrayElemAt: ["$videoCount.count", 0] }, 0] },
            totalPost: { $ifNull: [{ $arrayElemAt: ["$postCount.count", 0] }, 0] }
          }
        },
        { $sort: { totalVideo: -1, totalPost: -1 } }
      ])
      : HashTag.aggregate([
        {
          $lookup: {
            from: "hashtagusagehistories",
            localField: "_id",
            foreignField: "hashTagId",
            pipeline: [
              { $match: { videoId: { $ne: null } } },
              { $count: "count" }
            ],
            as: "videoCount"
          }
        },
        {
          $lookup: {
            from: "hashtagusagehistories",
            localField: "_id",
            foreignField: "hashTagId",
            pipeline: [
              { $match: { postId: { $ne: null } } },
              { $count: "count" }
            ],
            as: "postCount"
          }
        },
        {
          $project: {
            _id: 1,
            hashTag: 1,
            hashTagBanner: 1,
            hashTagIcon: 1,
            totalVideo: { $ifNull: [{ $arrayElemAt: ["$videoCount.count", 0] }, 0] },
            totalPost: { $ifNull: [{ $arrayElemAt: ["$postCount.count", 0] }, 0] }
          }
        },
        { $sort: { totalVideo: -1, totalPost: -1 } }
      ]);

    const [user, response, existSearchHistory] = await Promise.all([userPromise, searchPromise, existSearchHistoryPromise]);

    if (userId && !user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user && user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    res.status(200).json({ status: true, message: "Success", searchData: response });

    const isFullMatch = response.some((u) => u.hashTag?.toLowerCase() === userSearch.trim().toLowerCase());

    if (userId && !existSearchHistory && userSearch && isFullMatch) {
      const searchHistory = new SearchHistory();
      searchHistory.userId = userId;
      searchHistory.hashTagSearchString = userSearch;
      await searchHistory.save();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get previous search data of hasgTags
exports.searchedDataOfHashTags = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({
        status: false,
        message: "userId must be requried.",
      });
    }

    const userPromise = User.findOne({ _id: req.query.userId }).select("_id isBlock").lean();
    const searchHistoryPromise = SearchHistory.find({ userId: req.query.userId, userSearchString: null })
      .select("hashTagSearchString userId createdAt")
      .sort({ createdAt: -1 }) //Sort by most recently searched
      .limit(20)
      .lean();

    const [user, lastSearchedData] = await Promise.all([userPromise, searchHistoryPromise]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      lastSearchedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//clear all searchHistory for particular user
exports.clearAllSearchHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.type) {
      return res.status(200).json({ status: false, message: "userId and type must be requried." });
    }

    const user = await User.findOne({ _id: req.query.userId }).select("_id isBlock").lean();
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (req.query.type === "userSearch") {
      const clearSearchHistory = await SearchHistory.deleteMany({ userId: user._id, userSearchString: { $ne: null } });

      if (clearSearchHistory.deletedCount > 0) {
        return res.status(200).json({
          status: true,
          message: "The search history associated with the user's search data has been successfully cleared.",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "No search history was found for the user with userSearch type.",
        });
      }
    } else if (req.query.type === "hashTagSearch") {
      const clearSearchHistory = await SearchHistory.deleteMany({ userId: user._id, hashTagSearchString: { $ne: null } });

      if (clearSearchHistory.deletedCount > 0) {
        return res.status(200).json({
          status: true,
          message: "The search history associated with the hashTag search data has been successfully cleared.",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "No search history was found for the user with hashTagSearch type.",
        });
      }
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//Fetch Searched Data by Type (For You, Accounts, Videos, Posts, Songs, Hashtags)
exports.getSearchedContent = async (req, res) => {
  try {
    const { userId, search = "" } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Valid userId must be provided." });
    }

    const now = new Date();
    const currentUserId = req.query.userId;

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [userDoc, accountResults, postResults, videoResults, hashtagResults, songResults] = await Promise.all([
      User.findOne({ _id: userId }).select("_id isBlock").lean(),
      User.aggregate([
        {
          $match: {
            _id: { $ne: currentUserId },
            $or: [{ name: { $regex: search, $options: "i" } }, { userName: { $regex: search, $options: "i" } }],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            userName: 1,
            image: 1,
            isProfileImageBanned: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
      Post.aggregate([
        {
          $addFields: {
            postImage: {
              $filter: {
                input: "$postImage",
                as: "image",
                cond: { $eq: ["$$image.isBanned", false] },
              },
            },
          },
        },
        {
          $match: {
            postImage: { $ne: [] },
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
                  name: 1,
                  userName: 1,
                  image: 1,
                  isProfileImageBanned: 1,
                  isVerified: 1,
                  isFake: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            $or: [{ caption: { $regex: search, $options: "i" } }, { "user.name": { $regex: search, $options: "i" } }, { "user.userName": { $regex: search, $options: "i" } }],
          },
        },
        {
          $lookup: {
            from: "postorvideocomments",
            localField: "_id",
            foreignField: "postId",
            pipeline: [
              {
                $count: "count",
              },
            ],
            as: "totalComments",
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
            foreignField: "postId",
            pipeline: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  isLike: {
                    $max: {
                      $cond: [{ $eq: ["$userId", currentUserId] }, 1, 0],
                    },
                  },
                },
              },
            ],
            as: "likeData",
          },
        },
        {
          $lookup: {
            from: "followerfollowings",
            localField: "userId",
            foreignField: "toUserId",
            pipeline: [
              {
                $match: { fromUserId: currentUserId },
              },
              { $limit: 1 },
            ],
            as: "isFollow",
          },
        },
        {
          $project: {
            caption: 1,
            postImage: 1,
            shareCount: 1,
            isFake: 1,
            createdAt: 1,
            userId: "$user._id",
            isProfileImageBanned: "$user.isProfileImageBanned",
            name: "$user.name",
            userName: "$user.userName",
            userImage: "$user.image",
            isVerified: "$user.isVerified",
            hashTag: "$hashTag.hashTag",
            isLike: { $gt: [{ $ifNull: [{ $arrayElemAt: ["$likeData.isLike", 0] }, 0] }, 0] },
            isFollow: { $gt: [{ $size: "$isFollow" }, 0] },
            totalLikes: { $ifNull: [{ $arrayElemAt: ["$likeData.count", 0] }, 0] },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$totalComments.count", 0] }, 0] },
            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now, "$createdAt"] },
                },
                in: {
                  $switch: {
                    branches: [
                      {
                        case: { $gte: ["$$timeDiff", 31536000000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 2592000000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 604800000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 86400000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 3600000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 60000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 1000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"],
                        },
                      },
                    ],
                    default: "Just now",
                  },
                },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
      Video.aggregate([
        {
          $match: { isBanned: false },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  userName: 1,
                  image: 1,
                  isProfileImageBanned: 1,
                  isVerified: 1,
                  isFake: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            $or: [{ caption: { $regex: search, $options: "i" } }, { "user.name": { $regex: search, $options: "i" } }, { "user.userName": { $regex: search, $options: "i" } }],
          },
        },
        {
          $lookup: {
            from: "songs",
            localField: "songId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  songTitle: 1,
                  songImage: 1,
                  songLink: 1,
                  singerName: 1,
                },
              },
            ],
            as: "song",
          },
        },
        {
          $unwind: { path: "$song", preserveNullAndEmptyArrays: true },
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
            from: "postorvideocomments",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [
              {
                $count: "count",
              },
            ],
            as: "totalComments",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [
              {
                $count: "count",
              },
            ],
            as: "totalLikes",
          },
        },
        {
          $lookup: {
            from: "likehistoryofpostorvideos",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  isLike: {
                    $max: { $cond: [{ $eq: ["$userId", currentUserId] }, 1, 0] },
                  },
                },
              },
            ],
            as: "likeData",
          },
        },
        {
          $lookup: {
            from: "followerfollowings",
            localField: "userId",
            foreignField: "toUserId",
            pipeline: [
              { $match: { fromUserId: currentUserId } },
              { $limit: 1 },
            ],
            as: "isFollow",
          },
        },
        {
          $project: {
            caption: 1,
            videoImage: 1,
            videoUrl: 1,
            shareCount: 1,
            isFake: 1,
            createdAt: 1,
            songTitle: "$song.songTitle",
            songImage: "$song.songImage",
            songLink: "$song.songLink",
            singerName: "$song.singerName",
            hashTag: "$hashTag.hashTag",
            userId: "$user._id",
            name: "$user.name",
            userName: "$user.userName",
            userImage: "$user.image",
            isVerified: "$user.isVerified",
            isProfileImageBanned: "$user.isProfileImageBanned",
            isLike: { $gt: [{ $ifNull: [{ $arrayElemAt: ["$likeData.isLike", 0] }, 0] }, 0] },
            isFollow: { $gt: [{ $size: "$isFollow" }, 0] },
            totalLikes: { $ifNull: [{ $arrayElemAt: ["$likeData.count", 0] }, 0] },
            totalComments: { $ifNull: [{ $arrayElemAt: ["$totalComments.count", 0] }, 0] },
            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now, "$createdAt"] },
                },
                in: {
                  $switch: {
                    branches: [
                      {
                        case: { $gte: ["$$timeDiff", 31536000000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 2592000000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 604800000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 86400000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 3600000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 60000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"],
                        },
                      },
                      {
                        case: { $gte: ["$$timeDiff", 1000] },
                        then: {
                          $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"],
                        },
                      },
                    ],
                    default: "Just now",
                  },
                },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
      HashTag.aggregate([
        {
          $match: {
            hashTag: { $regex: search, $options: "i" },
          },
        },
        {
          $lookup: {
            from: "hashtagusagehistories",
            localField: "_id",
            foreignField: "hashTagId",
            as: "usageHistory",
          },
        },
        {
          $project: {
            _id: 1,
            hashTag: 1,
            hashTagBanner: 1,
            hashTagIcon: 1,
            totalVideo: {
              $size: {
                $filter: {
                  input: "$usageHistory",
                  as: "usage",
                  cond: { $ne: ["$$usage.videoId", null] },
                },
              },
            },
            totalPost: {
              $size: {
                $filter: {
                  input: "$usageHistory",
                  as: "usage",
                  cond: { $ne: ["$$usage.postId", null] },
                },
              },
            },
          },
        },
        {
          $sort: {
            totalVideo: -1,
            totalPost: -1,
          },
        },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
      Song.aggregate([
        {
          $lookup: {
            from: "songcategories",
            localField: "songCategoryId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                },
              },
            ],
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [{ songTitle: { $regex: search, $options: "i" } }, { singerName: { $regex: search, $options: "i" } }, { "category.name": { $regex: search, $options: "i" } }],
          },
        },
        {
          $project: {
            _id: 1,
            singerName: 1,
            songTitle: 1,
            songTime: 1,
            songLink: 1,
            songImage: 1,
            createdAt: 1,
            songCategoryName: "$category.name",
            songCategoryImage: "$category.image",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!userDoc) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (userDoc.isBlock) {
      return res.status(403).json({ status: false, message: "You are blocked by the admin." });
    }

    const accounts = accountResults;
    const posts = postResults;
    const videos = videoResults;
    const hashtags = hashtagResults;
    const songs = songResults;

    return res.status(200).json({
      status: true,
      message: "For You Feed fetched successfully",
      accounts,
      posts,
      videos,
      hashtags,
      songs,
    });
  } catch (error) {
    console.error("❌ For You Feed Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch For You Feed",
      error: error.message,
    });
  }
};

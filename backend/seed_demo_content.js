const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Post = require("./models/post.model");
const Video = require("./models/video.model");
const User = require("./models/user.model");

async function seedContent() {
  try {
    await mongoose.connect(process.env.MongoDb_Connection_String);
    console.log("Connected to MongoDB Atlas!");

    const user = await User.findOne({});
    if (!user) {
      console.error("No user found in database to associate posts with!");
      process.exit(1);
    }

    const userId = user._id;

    // Check if posts already exist
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      const samplePosts = [
        {
          uniquePostId: "P" + Math.floor(100000 + Math.random() * 900000),
          caption: "Chilling vibes and good moments ✨ #lifestyle #chill",
          mainPostImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
          postImage: [
            { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800", isBanned: false },
            { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800", isBanned: false }
          ],
          userId: userId,
          shareCount: 12,
          isFake: false,
        },
        {
          uniquePostId: "P" + Math.floor(100000 + Math.random() * 900000),
          caption: "Urban exploration and city lights 🏙️ #city #nightlife",
          mainPostImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
          postImage: [
            { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", isBanned: false }
          ],
          userId: userId,
          shareCount: 8,
          isFake: false,
        },
        {
          uniquePostId: "P" + Math.floor(100000 + Math.random() * 900000),
          caption: "Coding setup and late night hacking 💻 #developer #tech",
          mainPostImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
          postImage: [
            { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800", isBanned: false }
          ],
          userId: userId,
          shareCount: 25,
          isFake: false,
        }
      ];

      await Post.insertMany(samplePosts);
      console.log(`✅ Seeded ${samplePosts.length} sample posts into 'posts'!`);
    } else {
      console.log(`ℹ️ Posts collection already has ${postCount} items.`);
    }

    // Check if videos (reels) already exist
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      const sampleVideos = [
        {
          uniqueVideoId: "V" + Math.floor(100000 + Math.random() * 900000),
          caption: "Nature in motion 🍃 #nature #reels #explore",
          videoTime: 15,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          videoImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
          userId: userId,
          shareCount: 45,
          isFake: false,
          isBanned: false,
        },
        {
          uniqueVideoId: "V" + Math.floor(100000 + Math.random() * 900000),
          caption: "Night drive aesthetic 🚗💨 #vibes #drive #reels",
          videoTime: 12,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          videoImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800",
          userId: userId,
          shareCount: 30,
          isFake: false,
          isBanned: false,
        },
        {
          uniqueVideoId: "V" + Math.floor(100000 + Math.random() * 900000),
          caption: "Summer vibes never end ☀️ #summer #adventure",
          videoTime: 18,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          videoImage: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800",
          userId: userId,
          shareCount: 19,
          isFake: false,
          isBanned: false,
        }
      ];

      await Video.insertMany(sampleVideos);
      console.log(`✅ Seeded ${sampleVideos.length} sample reels into 'videos'!`);
    } else {
      console.log(`ℹ️ Videos collection already has ${videoCount} items.`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedContent();

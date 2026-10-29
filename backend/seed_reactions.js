const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Reaction = require("./models/reaction.model");

const emojis = [
  "2764_fe0f", // ❤️
  "1f525",     // 🔥
  "1f602",     // 😂
  "1f60d",     // 😍
  "1f389",     // 🎉
  "1f62d",     // 😭
  "1f44d",     // 👍
  "1f4af",     // 💯
  "1f92f",     // 🤯
  "1f44f",     // 👏
  "1f64c",     // 🙌
  "1f923",     // 🤣
  "1f973",     // 🥳
  "1f60e",     // 😎
  "1f929",     // 🤩
  "1f62e",     // 😮
  "1f60a",     // 😊
  "1f618",     // 😘
  "1f97a",     // 🥺
  "1f631",     // 😱
  "1f621",     // 😡
  "1f44b",     // 👋
  "1f4aa",     // 💪
  "1f64f",     // 🙏
  "2728",      // ✨
  "1f680",     // 🚀
  "1f31f",     // 🌟
  "1f496",     // 💖
];

async function seed() {
  try {
    await mongoose.connect(process.env.MongoDb_Connection_String);
    console.log("Connected to MongoDB Atlas!");

    // Clean up test non-emoji camera icons
    const delRes = await Reaction.deleteMany({ image: { $regex: "ic_camera_flip_live" } });
    console.log(`Cleaned up ${delRes.deletedCount} non-emoji test entries.`);

    for (const code of emojis) {
      const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.gif`;
      const exists = await Reaction.findOne({ image: url });
      if (!exists) {
        await Reaction.create({
          image: url,
          isActive: true,
        });
        console.log(`Added reaction: ${code}`);
      }
    }

    const total = await Reaction.countDocuments();
    console.log(`Total reactions in database now: ${total}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding reactions:", error);
    process.exit(1);
  }
}

seed();

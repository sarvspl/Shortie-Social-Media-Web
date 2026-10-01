const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { EJSON } = require("bson");
require("dotenv").config({ path: ".env" });

const dbPath = path.resolve(__dirname, "../../DB");

const filesToSeed = [
  { file: "settings.json", collection: "settings" },
  { file: "currencies.json", collection: "currencies" },
  { file: "languages.json", collection: "languages" },
  { file: "reportreasons.json", collection: "reportreasons" },
  { file: "translations.json", collection: "translations" },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MongoDb_Connection_String);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    for (const item of filesToSeed) {
      const fullPath = path.join(dbPath, item.file);
      if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${fullPath}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      const docs = EJSON.parse(content);

      const count = await db.collection(item.collection).countDocuments();
      if (count === 0) {
        if (Array.isArray(docs) && docs.length > 0) {
          await db.collection(item.collection).insertMany(docs);
          console.log(`✅ Seeded ${docs.length} documents into '${item.collection}'`);
        } else if (!Array.isArray(docs)) {
          await db.collection(item.collection).insertOne(docs);
          console.log(`✅ Seeded 1 document into '${item.collection}'`);
        }
      } else {
        console.log(`ℹ️ Collection '${item.collection}' already has ${count} documents. Skipping.`);
      }
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();

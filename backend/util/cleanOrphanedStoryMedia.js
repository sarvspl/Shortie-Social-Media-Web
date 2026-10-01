const fs = require("fs");
const path = require("path");
const { S3, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const Story = require("../models/story.model");
const { deleteFromStorage } = require("./storageHelper");

async function getReferencedStoryUrls() {
  const stories = await Story.find({ isFake: false }, { mediaImageUrl: 1, mediaVideoUrl: 1 }).lean();
  const urls = new Set(stories.flatMap((s) => [s.mediaImageUrl, s.mediaVideoUrl].filter(Boolean)));
  console.log("referencedUrls:", urls);
  return urls;
}

async function listLocalFiles() {
  const uploadsDir = path.resolve(__dirname, "../uploads/storyContent/");
  if (!fs.existsSync(uploadsDir)) return [];
  return fs.readdirSync(uploadsDir).map((f) => `${process.env.baseURL}/uploads/storyContent/${f}`);
}
async function listDOFiles() {
  try {
    const s3Client = new S3({
      forcePathStyle: false,
      endpoint: settingJSON?.doHostname,
      region: settingJSON?.doRegion,
      credentials: {
        accessKeyId: settingJSON?.doAccessKey,
        secretAccessKey: settingJSON?.doSecretKey,
      },
    });

    const params = {
      Bucket: settingJSON?.doBucketName,
      Prefix: `${process?.env?.projectName}/client/storyContent/`,
    };

    const listed = await s3Client.send(new ListObjectsV2Command(params));
    return (listed.Contents || []).map((obj) => `${settingJSON?.doEndpoint}/${obj.Key}`);
  } catch (err) {
    console.warn("⚠️ DO list failed:", err.message);
    return [];
  }
}

async function listAWSFiles() {
  try {
    const s3AwsClient = new S3({
      region: settingJSON.awsRegion,
      credentials: {
        accessKeyId: settingJSON.awsAccessKey,
        secretAccessKey: settingJSON.awsSecretKey,
      },
    });

    const params = {
      Bucket: settingJSON.awsBucketName,
      Prefix: `${process?.env?.projectName}/client/storyContent/`,
    };

    const listed = await s3AwsClient.send(new ListObjectsV2Command(params));
    return (listed.Contents || []).map((obj) => `${settingJSON.awsEndpoint}/${obj.Key}`);
  } catch (err) {
    console.warn("⚠️ AWS list failed:", err.message);
    return [];
  }
}

// ---------- CLEANUP ----------
async function cleanOrphanedStoryMedia() {
  try {
    console.log("🧹 Starting orphaned story media cleanup...");

    const referencedUrls = await getReferencedStoryUrls();

    // const hasLocal = [...referencedUrls].some((u) => u.includes("/uploads/"));
    // const hasDO = [...referencedUrls].some((u) => u.includes("digitaloceanspaces.com"));
    // const hasAWS = [...referencedUrls].some((u) => u.includes("amazonaws.com"));

    // const [localFiles, doFiles, awsFiles] = await Promise.all([hasLocal ? listLocalFiles() : [], hasDO ? listDOFiles() : [], hasAWS ? listAWSFiles() : []]);

    const [localFiles, doFiles, awsFiles] = await Promise.all([listLocalFiles(), listDOFiles(), listAWSFiles()]);

    const allFiles = [...localFiles, ...doFiles, ...awsFiles];
    console.log("Total files found:", allFiles.length);

    for (const fileUrl of allFiles) {
      if (!referencedUrls.has(fileUrl)) {
        console.log("🗑️ Orphaned file found:", fileUrl);
        await deleteFromStorage(fileUrl);
      }
    }

    console.log("✅ Orphaned story media cleanup completed.");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  }
}

module.exports = { cleanOrphanedStoryMedia };

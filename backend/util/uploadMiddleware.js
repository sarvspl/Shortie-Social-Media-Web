const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const path = require("path");

const createS3Instance = (hostname, accessKeyId, secretAccessKey, region) => {
  return new S3Client({
    credentials: {
      accessKeyId: accessKeyId || "placeholder",
      secretAccessKey: secretAccessKey || "placeholder",
    },
    endpoint: hostname ? (hostname.startsWith("http") ? hostname : `https://${hostname}`) : "https://s3.amazonaws.com",
    region: region || "us-east-1",
    forcePathStyle: true,
  });
};

const digitalOceanS3 = createS3Instance(settingJSON?.doHostname, settingJSON?.doAccessKey, settingJSON?.doSecretKey, settingJSON?.doRegion);

const awsS3 = createS3Instance(settingJSON?.awsHostname, settingJSON?.awsAccessKey, settingJSON?.awsSecretKey, settingJSON?.awsRegion);

const localStoragePath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const storageOptions = {
  // local: multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, localStoragePath);
  //   },
  //   filename: (req, file, cb) => {
  //     cb(null, file.originalname);
  //   },
  // }),

  local: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = req.body.folderStructure;

      if (folder === `${process?.env?.projectName}/client/storyContent`) {
        console.log("If exact match, store in uploads/storyContent");

        const targetPath = path.join(localStoragePath, "storyContent");

        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }

        cb(null, targetPath);
      } else {
        console.log("Else store in default uploads/ folder");

        cb(null, localStoragePath);
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),

  digitalocean: multerS3({
    s3: digitalOceanS3,
    bucket: settingJSON?.doBucketName || "dummy-bucket",
    acl: "public-read",
    key: (req, file, cb) => {
      console.log("request body in uploadMiddleware :  ", req.body);

      const folder = req.body.folderStructure;
      cb(null, `${folder}/${file.originalname}`);
    },
  }),

  aws: multerS3({
    s3: awsS3,
    bucket: settingJSON?.awsBucketName || "dummy-bucket",
    key: (req, file, cb) => {
      const folder = req.body.folderStructure;
      cb(null, `${folder}/${file.originalname}`);
    },
  }),
};

const getActiveStorage = async () => {
  const settings = global.settingJSON || {};
  if (settings?.storage?.awsS3) return "aws";
  if (settings?.storage?.digitalOcean) return "digitalocean";
  return "local"; // Fallback to local storage if no storage is active
};

const uploadMiddleware = async (req, res, next) => {
  try {
    const activeStorage = await getActiveStorage(); // Dynamically fetch active storage

    multer({ storage: storageOptions[activeStorage] }).single("content")(req, res, next);
  } catch (error) {
    next(error); // Pass error to the error handler if any issue occurs
  }
};

module.exports = uploadMiddleware;

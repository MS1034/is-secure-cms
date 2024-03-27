const CustomError = require("../error/CustomError");
const multer = require("multer");
const path = require("path");
const NodeClam = require("clamscan");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rootDir = path.dirname(require.main.filename);

    if (file.fieldname === "photo") {
      cb(null, path.join(rootDir, "/public/userPhotos"));
    } else {
      cb(null, path.join(rootDir, "/public/storyImages"));
    }
  },

  filename: function (req, file, cb) {
    if (file.fieldname === "photo") {
      const extentions = file.mimetype.split("/")[1];
      req.savedUserPhoto = "photo_user_" + req.user.id + "." + extentions;
      cb(null, req.savedUserPhoto);
    } else {
      req.savedStoryImage =
        "image_" +
        new Date().toISOString().replace(/:/g, "-") +
        file.originalname;
      cb(null, req.savedStoryImage);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new CustomError("Please provide a valid image file", 400), false);
  }

  cb(null, true);
};

// Initialize ClamScan
// const clamscan = new NodeClam().init();

const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Middleware function to scan file using ClamScan
const scanFile = async (file) => {
  const result = await clamscan.scanFile(file.path);
  return {
    filename: file.originalname,
    is_infected: result.isInfected,
    viruses: result.viruses,
  };
};

// Extend imageUpload middleware to include ClamScan scanning
imageUpload.singleWithScan = function (field) {
  const upload = imageUpload.single(field);

  return async function (req, res, next) {
    upload(req, res, async function (err) {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        return next(new CustomError("No file uploaded", 400));
      }

      try {
        const scanResult = await scanFile(req.file);

        if (scanResult.is_infected) {
          // Handle infected file
          return next(new CustomError("Malicious file detected", 400));
        }

        // File is clean, proceed with next middleware/controller
        next();
      } catch (error) {
        // Handle scanning error
        console.error("Error scanning file:", error.message);
        return next(new CustomError("Error scanning file", 500));
      }
    });
  };
};

module.exports = imageUpload;

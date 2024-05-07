const express = require("express");
const imageupload = require("../Helpers/Libraries/imageUpload");
const {sessionExpiredMiddleware} = require("../Middlewares/Session/sessionExpiryChecker");

const { getAccessToRoute } = require("../Middlewares/Authorization/auth");
const {
  addStory,
  getAllStories,
  detailStory,
  likeStory,
  editStory,
  deleteStory,
  editStoryPage,
} = require("../Controllers/story");
const {
  checkStoryExist,
  checkUserAndStoryExist,
} = require("../Middlewares/database/databaseErrorhandler");
const sanitizeContent = require("../Middlewares/Sanitization/sanitize-content");

const router = express.Router();

router.post(
  "/addstory",
  [getAccessToRoute, sanitizeContent, imageupload.singleWithScan("image")],
  addStory
);

router.post("/:slug", checkStoryExist, detailStory);

router.post("/:slug/like", [getAccessToRoute, checkStoryExist], likeStory);

router.get(
  "/editStory/:slug",
  [getAccessToRoute, checkStoryExist, checkUserAndStoryExist],
  editStoryPage
);

router.put(
  "/:slug/edit",
  [
    getAccessToRoute,
    checkStoryExist,
    checkUserAndStoryExist,
    sanitizeContent,
    imageupload.singleWithScan("image")
  ],
  editStory
);

router.delete(
  "/:slug/delete",
  [getAccessToRoute, checkStoryExist, checkUserAndStoryExist],
  deleteStory
);

router.get("/getAllStories", sessionExpiredMiddleware, getAllStories);

module.exports = router;

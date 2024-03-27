const asyncErrorWrapper = require("express-async-handler");
const Story = require("../Models/story");
const deleteImageFile = require("../Helpers/Libraries/deleteImageFile");
const {
  searchHelper,
  paginateHelper,
} = require("../Helpers/query/queryHelpers");
const sanitizeHtml = require("sanitize-html");
const validator = require("validator");

const addStory = asyncErrorWrapper(async (req, res, next) => {
  req.body.content = sanitizeContent(req.body.content);

  const { title, content } = req.body;

  var wordCount = content.trim().split(/\s+/).length;

  let readtime = Math.floor(wordCount / 200);
  //   console.log(content);

  try {
    const newStory = await Story.create({
      title,
      content,
      author: req.user._id,
      image: req.savedStoryImage,
      readtime,
    });

    return res.status(200).json({
      success: true,
      message: "add story successfully ",
      data: newStory,
    });
  } catch (error) {
    deleteImageFile(req);

    return next(error);
  }
});

const getAllStories = asyncErrorWrapper(async (req, res, next) => {
  let query = Story.find();

  query = searchHelper("title", query, req);

  const paginationResult = await paginateHelper(Story, query, req);

  query = paginationResult.query;

  query = query.sort("-likeCount -commentCount -createdAt");

  const stories = await query;

  return res.status(200).json({
    success: true,
    count: stories.length,
    data: stories,
    page: paginationResult.page,
    pages: paginationResult.pages,
  });
});

const detailStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const { activeUser } = req.body;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  const storyLikeUserIds = story.likes.map((json) => json.id);
  const likeStatus = storyLikeUserIds.includes(activeUser._id);

  return res.status(200).json({
    success: true,
    data: story,
    likeStatus: likeStatus,
  });
});

const likeStory = asyncErrorWrapper(async (req, res, next) => {
  const { activeUser } = req.body;
  const { slug } = req.params;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  const storyLikeUserIds = story.likes.map((json) => json._id.toString());

  if (!storyLikeUserIds.includes(activeUser._id)) {
    story.likes.push(activeUser);
    story.likeCount = story.likes.length;
    await story.save();
  } else {
    const index = storyLikeUserIds.indexOf(activeUser._id);
    story.likes.splice(index, 1);
    story.likeCount = story.likes.length;

    await story.save();
  }

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const editStoryPage = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const editStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;
  req.body.content = sanitizeContent(req.body.content);
  const { title, content, image, previousImage } = req.body;

  const story = await Story.findOne({ slug: slug });
  //   console.log(slug);
  //   console.log(story);
  story.title = title;
  story.content = content;
  story.image = req.savedStoryImage;

  if (!req.savedStoryImage) {
    // if the image is not sent
    story.image = image;
  } else {
    // if the image sent
    // old image locatıon delete
    deleteImageFile(req, previousImage);
  }

  console.log(story);
  await story.save();

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const deleteStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({ slug: slug });

  deleteImageFile(req, story.image);

  await story.remove();

  return res.status(200).json({
    success: true,
    message: "Story delete succesfully ",
  });
});

// Function to sanitize HTML content
function sanitizeContent(content) {
  console.log("Subhan ");
  if (!content) return "";

  // Escape special characters
  //   content = escapeHtml(content);
  const allowlist = ["http", "https", "ftp"];
  const regex = RegExp("^(" + allowlist.join("|") + "):", "gim");

  // Validate URLs
  const validatedHtml = sanitizeHtml(content, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "a",
      "ul",
      "li",
      "ol",
      "strong",
      "i",
      "figure",
      "oembed",
      "blockquote",
      "table",
      "tbody",
      "tr",
      "td",
    ],
    allowedAttributes: {
      a: ["href"],
      figure: ["class"],
      oembed: ["url"],
      "*": ["class"],
      a: ["href"],
      img: ["src"],
      figure: ["data-embed"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        // Validate href attribute for <a> tags
        if (
          attribs.href &&
          (!validator.isURL(attribs.href) || !regex.test(attribs.href))
        ) {
          delete attribs.href; // Remove invalid href attribute
        }
        return { tagName, attribs };
      },
      oembed: (tagName, attribs) => {
        // Validate url attribute for <oembed> tags
        if (attribs.url && !validator.isURL(attribs.url)) {
          delete attribs.url; // Remove invalid url attribute
        }
        return { tagName, attribs };
      },
    },
  });

  console.log(validatedHtml);

  return validatedHtml;

// Function to escape HTML characters
function escapeHtml(html) {
  return html.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return match;
    }
  });
}

// function unescapeHtml(html) {
//     return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (match) => {
//       switch (match) {
//         case "&amp;":
//           return "&";
//         case "&lt;":
//           return "<";
//         case "&gt;":
//           return ">";
//         case "&quot;":
//           return '"';
//         case "&#039;":
//           return "'";
//         default:
//           return match;
//       }
//     });
//   }

module.exports = {
  addStory,
  getAllStories,
  detailStory,
  likeStory,
  editStoryPage,
  editStory,
  deleteStory,
};

const asyncErrorWrapper = require("express-async-handler");
const sanitizeHtml = require("sanitize-html");

const sanitizeContent = asyncErrorWrapper(async (req, res, next) => {
  if (req.body) {
    const allowedTags = {
      allowedTags: [
        "p",
        "a",
        "b",
        "i",
        "em",
        "strong",
        "code",
        "ul",
        "ol",
        "li",
        "figure", // Allow figure tag for media
        "oembed", // Allow oembed tag for embedded media
      ],
      allowedAttributes: {
        a: ["href"],
        figure: ["class"],
        oembed: ["url"],
      },
    };

    // Sanitize req.body content
    let sanitizedHtml = sanitizeHtml(req.body.content, allowedTags);

    // Remove specific tags not allowed
    sanitizedHtml = sanitizedHtml.replace(
      /<blockquote\b[^>]*>(.*?)<\/blockquote>/g,
      ""
    ); // Remove <blockquote> tags
    sanitizedHtml = sanitizedHtml.replace(/<table\b[^>]*>(.*?)<\/table>/g, ""); // Remove <table> tags

    req.body.content = "sanitizedHtml";
  }

  console.log(req.body);

  next();
});

module.exports = sanitizeContent;

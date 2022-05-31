const express = require("express");
const router = express.Router();
const db = require("../user_modules/db.cjs");

router.get("/:tag", (req, res) => {
  db.getArrayValueData("blog_posts", "posts", "tags", req.params.tag)
  .then(posts => {
    if (posts.length != 0 ) {
      res.render("tags/tag", { tag: req.params.tag, posts: posts })
    } else {
      res.status(404);
      res.render("http/status.ejs", { message: `No posts with tag: ${req.url}` });
    }
  })
  .catch(() => res.sendStatus(500));
});

module.exports = router;
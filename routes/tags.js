const express = require("express");
const router = express.Router();
const db = require("../user_modules/db.cjs");

router.get("/:tag", (req, res) => {
  getTaggedPosts(req.params.tag)
  .then(posts => res.render("tags/tag", { tag: req.params.tag, posts: posts }))
  .catch(err => {
    res.status(404);
    res.render("http/404.ejs", { url: `Tag ${req.url}` });
  });
});

async function getTaggedPosts(tag) {
  const pids = await db.getData("blog_tags", tag);
  let posts = [];

  for (var i=0; i<pids.length; ++i) {
    const post = await db.getValueData("blog_posts", "post", "pid", pids[i].pid);
    posts.push(post[0]);
  }

  return posts;
}

module.exports = router;
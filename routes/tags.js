const express = require("express");
const router = express.Router();
const db = require("../user_modules/db.cjs");

// YOU WILL NEED TO USE posts.js & tags.js & db.cjs & posts.ejs
// create table in database tags for respective tag
router.route("/:tag")
.get((req, res) => {
  getTaggedPosts(req.params.tag)
  .then(posts => res.render("tags/tag", { posts: posts }))
  .catch(console.log)
})

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
const express = require("express");
const router = express.Router();
const db = require("../user_modules/db.cjs");

// YOU WILL NEED TO USE posts.js & tags.js & db.cjs & posts.ejs
// create table in database tags for respective tag
router.route("/:tag")
.get((req, res) => {
  db.getData("tags", `${req.params.tag}`)
  .then(tags => {
    res.render("tags/tag", { tags: tags })
  })
  .catch(console.log);
})

module.exports = router;
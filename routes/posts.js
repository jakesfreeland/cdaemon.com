const express = require("express");
const router = express.Router();
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/posts.html"));
})

router.route('/new')
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/editor.html"));
})
.post((req, res) => {
  console.log(req.body)
  if (req.body.id &&
      req.body.date &&
      req.body.title &&
      req.body.body &&
      req.body.tags &&
      req.body.author) {
          console.log("Request recieved");
          db.sendData("blog_posts", "post",
                      ["id", "date", "title", "body", "tags", "author"],
                      [req.body.id, req.body.date, req.body.title, req.body.body, req.body.tags, req.body.author]);
  } else {
      console.log("Missing parameter");
  }
  res.redirect("/");
})

router.post("/images", (req, res) => {
  let id = req.body.id;
  let file = req.files.image;
  let imageName = file.name;
  let imagePath = path.resolve(__dirname, `../public/images/blog/${id}`);
})

router.get("/id", (req, res) => {
    console.log("Getting id");
    db.getColumnData("blog_posts", "post", "id")
    .then(data => res.send(data));
})

router.route("/:id")
.get((req, res) => {
  res.send(`Get post with ID ${req.params.id}`);
})
.delete((req, res) => {
  res.send(`delete post with ID ${req.params.id}`);
})

module.exports = router;
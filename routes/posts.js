const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(fileupload());

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/posts.html"));
})

router.route('/new')
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/editor.html"));
})
.post((req, res) => {
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
  let img = req.files.img;
  let id = req.body.id;
  let imgPath = path.resolve(__dirname, `../public/images/blog/${id}/`);

  if (!fs.existsSync(imgPath)) {
    fs.mkdirSync(imgPath);
  }

  img.mv((imgPath + '/' + img.name), (err) => {
    if (err) {
      throw err;
    } else {
      res.json(`images/${id}/${img.name}`);
    }
  })
})

router.get("/id", (req, res) => {
    console.log("Getting present ids");
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
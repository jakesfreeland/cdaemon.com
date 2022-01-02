const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");
const { cache } = require("ejs");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(fileupload());

router.get('/', (req, res) => {
  res.render("posts/posts.ejs");
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
      req.body.author) {
          console.log("Post request recieved");
          db.sendData("blog_posts", "post",
                      ["id", "date", "title", "body", "tags", "author"],
                      [req.body.id, req.body.date, req.body.title, req.body.body, req.body.tags, req.body.author],
                      replace = true);
          res.redirect(`/posts/${req.body.id}`);
  } else {
      console.log("Missing parameter");
  }
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
  db.getPostData("blog_posts", "post", "id", `${req.params.id}`)
  .then(data => {
    let date = data[0].date;
    let title = data[0].title;
    let body = data[0].body;
    let author = data[0].author;
    let tags = data[0].tags;

    res.render("posts/post.ejs", {
      date: date,
      title: title,
      body: body,
      author: author,
      tags: tags
    });
  })
  .catch(err => {
    res.status(404);
    res.format({
      html: () => {
        res.render("http/404.ejs", { url: `Post with id ${req.url}` });
      },
      json: () => {
        res.json({ error: 'Page not found' });
      },
      default: () => {
        res.type('txt').send('Page not found');
      }
    });
  })
})
.delete((req, res) => {
  res.send(`delete post with ID ${req.params.id}`);
})

module.exports = router;
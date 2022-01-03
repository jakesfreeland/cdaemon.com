const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

let id; // ID is renewed on every GET request to "/new"

router.use(bodyParser.urlencoded({ extended: false }));
router.use(fileupload());

router.get('/', (req, res) => {
  res.render("posts/posts.ejs");
})

router.route("/new")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/editor.html"));
  getID(); // ID is refreshed
})
.post((req, res) => {
  if (req.body.title &&
      req.body.body &&
      req.body.author) {
          const date = getDate();
          db.sendData("blog_posts", "post",
                      ["id", "date", "title", "body", "tags", "author"],
                      [id, date, req.body.title, req.body.body, req.body.tags, req.body.author],
                      replace = true)
          .then(post => res.redirect(`/posts/${id}`))
          .catch(err => console.log(err));
  } else {
      console.log("Missing parameter");
  }
})

router.post("/images", (req, res) => {
  let img = req.files.img;
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

router.route("/:id")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "id", `${req.params.id}`)
  .then(data => {
    const date = data[0].date;
    const title = data[0].title;
    const body = data[0].body;
    const author = data[0].author;
    const tags = data[0].tags;

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

function getID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  db.getColumnData("blog_posts", "post", "id")
  .then(ids => {
    // check if ID already exists
    if (ids.some(e => e.id === idGen)) {
      getID();
    } else {
      // assign ID
      id = idGen;
    }
  });
}

function getDate() {
  // grab UTC date and convert to ISO format
  const date = new Date().toISOString().slice(0, 10);
  return date;
}

module.exports = router;
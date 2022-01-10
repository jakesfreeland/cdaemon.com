const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const cookieSession = require("cookie-session");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(fileupload());
router.use(cookieSession({
  name: "session",
  keys: ["YyKRyL3RfMNts3", "W8cE4d2eLmM8Xs"],
  maxAge: 604800000,
  // secure: true
}));

router.get('/', (req, res) => {
  res.render("posts/posts");
});

router.route("/editor")
.get((req, res) => {
  if (req.session.uid !== undefined) {
    res.render("posts/editor", { author: req.session.username });
  } else {
    req.session.return = "/posts/editor";
    res.redirect("/users/login");
  }
})
.post((req, res) => {
  if (req.body.title && req.body.body) {
    const author = req.session.username;
    uploadPost(req.body.title, req.body.body, author, req.body.tags, req.body.banner)
    .then(id => {
      if (req.files !== null) {
        uploadMedia(req.files.media, id);
      }
      res.redirect(`/posts/${id}/`);
    })
    .catch(err => console.log(err));
  } else {
    console.log("Missing parameter");
  }
});

router.route("/:id")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "id", `${req.params.id}`)
  .then(data => {
    const date = formatDate(data[0].date);
    const title = data[0].title;
    const body = data[0].body;
    const author = data[0].author;
    const tags = data[0].tags;

    res.render("posts/post", {
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
});

async function uploadPost(title, body, author, tags, banner) {
  const id = await getID();
  const date = getDate();
  await db.sendData("blog_posts", "post",
    ["id", "date", "title", "body", "author", "tags", "banner"],
    [id, date, title, body, author, tags, banner],
    replace = true);
  return id;
}

function uploadMedia(media, id) {
  const mediaPath = path.resolve(__dirname, `../public/media/posts/${id}/`);

  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath);
  }

  if (media.length === undefined) {
    // mv is not async but returns promise
    media.mv(mediaPath + '/' + media.name)
    .catch(err => console.log(err));
  } else {
    for (var i=0; i<media.length; ++i) {
      // mv is not async but returns promise
      media[i].mv(mediaPath + '/' + media[i].name)
      .catch(err => console.log(err));
    }
  }
}

async function getID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  const ids = await db.getColumnData("blog_posts", "post", "id");
  // re-run getID() if idGen is present in database
  if (ids.some(e => e.id === idGen)) {
    return getID();
  } else {
    return idGen;
  }
}

function getDate() {
  // grab UTC date and convert to ISO format
  const date = new Date().toISOString().slice(0, 10);
  return date;
}

function formatDate(dateObj) {
  const options = { year: "numeric", month: "long", day: "numeric"};
  const date = dateObj.toLocaleDateString(undefined, options);

  return date;
}

module.exports = router;
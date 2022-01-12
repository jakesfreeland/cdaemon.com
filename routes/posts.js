const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.get('/', (req, res) => {
  res.render("posts/posts");
});

router.get("/archive", (req, res) => {
  res.render("posts/archive");
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
    const uid = req.session.uid;
    uploadPost(req.body.title, req.body.body, author, uid, req.body.tags, req.body.banner)
    .then(pid => {
      mvMedia(req.session.uid, pid);
      res.redirect(`/posts/${pid}/`);
    })
    .catch(err => console.log(err));
  } else {
    console.log("Missing Parameter");
  }
});

router.route("/:pid")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "pid", `${req.params.pid}`)
  .then(data => {
    const date = formatDate(data[0].date);
    const title = data[0].title;
    const body = data[0].body;
    const author = data[0].author;
    const uid = data[0].uid;
    const tags = data[0].tags;
    const banner = data[0].banner;

    req.session.pid = req.params.pid;
    res.render("posts/post", {
      date: date,
      title: title,
      body: body,
      author: author,
      uid: uid,
      tags: tags,
      banner: banner
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
  res.send(`delete post with ID ${req.params.pid}`);
});

async function uploadPost(title, body, author, uid, tags, banner) {
  const pid = await getID();
  const date = getDate();
  await db.sendData("blog_posts", "post",
    ["pid", "date", "title", "body", "author", "uid", "tags", "banner"],
    [pid, date, title, body, author, uid, tags, banner],
    replace = true);
  return pid;
}

function mvMedia(uid, pid) {
  const uidPath = path.resolve(__dirname, `../media/uid/${uid}/`);
  const pidPath = path.resolve(__dirname, `../media/posts/${pid}/`);

  if (fs.existsSync(uidPath)) {
    fs.mkdirSync(pidPath)

    const dir = fs.readdirSync(uidPath);
    for (var i=0; i<dir.length; ++i) {
      fs.renameSync(`${uidPath}/${dir[i]}`, `${pidPath}/${dir[i]}`);
    }
    fs.rmdirSync(uidPath);
  } else {
    return null;
  }
}

async function getID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  const ids = await db.getColumnData("blog_posts", "post", "pid");
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
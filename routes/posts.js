const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.get('/', (req, res) => {
  db.showTables("blog_tags")
  .then(tables => {
    res.render("posts/posts", { tags: tables, admin: req.session.admin });
  })
  .catch(console.log);
});

router.get("/archive", (req, res) => {
  db.getOrderedData("blog_posts", "post", "date", "desc")
  .then(posts => {
    res.render("posts/archive", { posts: posts, admin: req.session.admin });
  })
  .catch(console.log);
});

router.route("/editor")
.get((req, res) => {
  if (req.session.uid) {
    if (req.session.admin) {
      if (!req.session.pid) {
        getID()
        .then(pid => {
          req.session.pid = pid;
          // session variables expect a following response
          res.render("posts/editor", { author: req.session.username });
        })
        .catch(console.log);
      } else {
        res.render("posts/editor", { author: req.session.username });
      }
    } else {
      res.status(403).send("incorrect username or password");
    }
  } else {
    req.session.returnTo = "/posts/editor";
    res.redirect("/users/login");
  }
})
.post((req, res) => {
  if (req.body.title && req.body.body && req.body.banner) {
    uploadPost(req.body.title, req.body.body, req.body.tags, req.body.banner, req.session.username, req.session.uid, req.session.pid)
    .then(pid => {
      uploadTags(req.body.tags, pid);
      req.session.pid = null;
      res.redirect(`/posts/${pid}`);
    })
    .catch(err => console.log(err));
  } else {
    console.log("Missing Parameter");
  }
});

router.get("/pid", (req, res) => {
  res.send({ pid: req.session.pid });
});

router.route("/:pid")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "pid", req.params.pid)
  .then(post => {
    res.render("posts/post", {
      post: post[0],
      date: formatDate(post[0].date),
      tags: post[0].tags.toLowerCase().split(',')
    });
  })
  .catch(err => {
    res.status(404);
    res.render("http/404.ejs", { url: `Post with id ${req.url}` });
  })
})
.delete((req, res) => {
  db.getValueData("blog_posts", "post", "pid", req.params.pid)
  .then(post => {
    deletePost(post, req.session.uid);
    res.sendStatus(200);
  })
  .catch(err => {
    res.sendStatus(403);
  });
});

async function uploadPost(title, body, tags, banner, author, uid, pid) {
  const date = getDate();
  tags = tags.toLowerCase();
  await db.sendData("blog_posts", "post",
    ["title", "body", "tags", "banner", "author", "uid", "pid", "date"],
    [title, body, tags, banner, author, uid, pid, date],
    replace = true);
  return pid;
}

async function uploadTags(tags, pid) {
  if (tags) {
    tags = tags.toLowerCase().split(',');

    for (var i=0; i<tags.length; ++i) {
      tags[i] = tags[i].trim();
      try {
        await db.createTable("blog_tags", tags[i], "pid", "char(8)");
      } catch (err) {
        console.log(err);
      } finally {
        await db.sendData("blog_tags", tags[i], "pid", pid, replace=true);
      }
    }

    return tags;
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

async function deletePost(post, uid) {
  if (post[0].uid === uid) {
    if (post[0].tags) {
      const tags = post[0].tags.split(',');

      for (var i=0; i<tags.length; ++i)
        await db.dropValueData("blog_tags", tags[i], "pid", post[0].pid);
    }
    
    db.dropValueData("blog_posts", "post", "pid", post[0].pid);
    fs.rmSync(path.resolve(__dirname, `../public/media/pid/${post[0].pid}`), { recursive: true });
    
    return "post deleted";
  } else {
    throw "forbidden";
  }
}

module.exports = router;
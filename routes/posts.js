const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const markdown = require("markdown-wasm");
const db = require("../user_modules/db.cjs");

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

router.get('/', (req, res) => {
  db.getDistinct("blog_posts", "tags", "tid")
  .then(tags => {
    res.render("posts/posts", { tags: tags, user: req.session.user });
  })
  .catch(err => {
    res.status(500);
    res.render("http/status", {
      code: "500",
      message: "Something went wrong."
    });
  });
});

router.get("/archive", (req, res) => {
  db.getOrderedData("blog_posts", "posts", "date", "desc")
  .then(posts => {
    res.render("posts/archive", { posts: posts, user: req.session.user });
  })
  .catch(err => {
    res.status(500);
    res.render("http/status", {
      code: "500",
      message: "Something went wrong."
    });
  });
});

router.route("/new")
.get((req, res) => {
  if (req.session.user) {
    getID()
    .then(pid => {
      res.redirect(`/posts/editor/new/${pid}`);
    })
    .catch(() => res.sendStatus(500));
  } else {
    res.redirect("/users/login");
  }
});

router.route("/editor/new/:pid")
.get((req, res) => { 
  if (req.session.user) {
    res.render("posts/editor", { author: req.session.user.firstname + " " + req.session.user.lastname });
  } else {
    res.redirect("/users/login");
  }
})
.post((req, res) => {
  if (req.body.title && req.body.body && req.body.banner && req.session.user) {
    uploadPost(req.body.title, req.body.body, req.body.tags, req.params.pid, req.body.banner, req.session.user)
    .then(() => res.redirect(`/posts/${req.params.pid}`))
    .catch(() => res.sendStatus(500));
  } else {
    res.sendStatus(400);
  }
});

router.route("/editor/:pid")
.get((req, res) => { 
  if (req.session.user) {
    db.getValueData("blog_posts", "posts", "pid", req.params.pid)
    .then(post => {
      if (post.length == 0) {
        res.status(404).render("http/status", { code: 404, message: "not found" });
      }

      if (post[0].username == req.session.user.username || req.session.user.admin) {
        res.render("posts/editor", { editor: req.session.user.firstname + " " + req.session.user.lastname, post: post });
      } else {
        res.sendStatus(403);
      }
    })
    .catch(() => res.sendStatus(500));
  } else {
    res.redirect("/users/login");
  }
})
.post((req, res) => {
  if (req.body.title && req.body.body && req.body.banner && req.session.user) {
    db.getValueData("blog_posts", "posts", "pid", req.params.pid)
    .then(post => { 
      if (post.length == 0) {
        res.status(404).render("http/status", { code: 404, message: "not found" });
      }

      if (post[0].username == req.session.user.username || req.session.user.admin) {
        editPost(req.body.title, req.body.body, req.body.tags, req.params.pid, req.body.banner)
        .then(() => res.redirect(`/posts/${req.params.pid}`))
        .catch(() => res.sendStatus(500));
      } else {
        res.sendStatus(403);
      }
    })
    .catch(() => res.sendStatus(500));
  } else {
    res.sendStatus(400);
  }
});

router.route("/:pid")
.get((req, res) => {
  const getPost = db.getValueData("blog_posts", "posts", "pid", req.params.pid);
  const getTags = db.getValueData("blog_posts", "tags", "pid", req.params.pid);

  Promise.all([getPost, getTags])
  .then(([post, tags]) => {
    res.render("posts/post", {
      title: post[0].title,
      /* sanitization to mitigate XSS */
      body: DOMPurify.sanitize(markdown.parse(post[0].body)),
      tags: tags,
      banner: post[0].banner,
      author: JSON.parse(post[0].author),
      pid: post[0].pid,
      date: formatDate(post[0].date),
      editDate: formatDate(post[0].editDate)
    });
  })
  .catch(err => {
    res.status(404);
    res.render("http/status", {
      code: "404",
      message: `Post with id: ${req.url} not found.`
    });
  });
})
.delete((req, res) => {
  db.getValueData("blog_posts", "posts", "pid", req.params.pid)
  .then(post => {
    if (req.session.user) {
      deletePost(post, req.session.user.username, req.session.user.admin)
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(403));
    } else {
      res.sendStatus(401);
    }
  })
  .catch(() => res.sendStatus(404));
});

async function uploadPost(title, body, tags, pid, banner, author) {
  const date = getDate();

  tags = await addTags(tags, pid);
  await db.insertData("blog_posts", "posts",
    ["title", "body", "date", "pid", "banner", "author"],
    [title, body, date, pid, banner, author]);
  
  return;
}

async function editPost(title, body, tags, pid, banner) {
  const editDate = getDate();

  await dropTags(pid);
  tags = await addTags(tags, pid);
  await db.updateData("blog_posts", "posts",
    ["title", "body", "edit_date", "banner"],
    [title, body, editDate, banner],
    ["pid", pid]);

  return;
}

async function addTags(tags, pid) {
  tags = tags.toLowerCase().split(',');

  for (var i=0; i<tags.length; ++i) {
    tags[i] = tags[i].trim();
    await db.insertData("blog_posts", "tags", ["tid", "pid"], [tags[i], pid]);
  }

  return tags.join(',');
}

async function dropTags(pid) {
  await db.dropValueData("blog_posts", "tags", "pid", pid);
  return;
}

async function getID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  const ids = await db.getColumnData("blog_posts", "posts", "pid");
  // re-run getID() if idGen is present in database
  if (ids.some(e => e.pid === idGen)) {
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
  if (dateObj == null) {
    return null;
  } else {
    const options = { year: "numeric", month: "long", day: "numeric"};
    const date = dateObj.toLocaleDateString(undefined, options);

    return date;
  }
}

async function deletePost(post, username, admin) {
  if (post[0].username === username || admin) {
    db.dropValueData("blog_posts", "posts", "pid", post[0].pid);
    fs.rmSync(path.resolve(__dirname, `../public/media/pid/${post[0].pid}`), { recursive: true });
    dropTags(post[0].pid);

    return "deleted";
  } else {
    throw "forbidden";
  }
}

module.exports = router;
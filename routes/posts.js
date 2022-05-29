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
  db.showTables("blog_tags")
  .then(tables => {
    res.render("posts/posts", { tags: tables, user: req.session.user });
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
  db.getOrderedData("blog_posts", "post", "date", "desc")
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
    .catch(res.sendStatus(500));
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
  if (req.body.title && req.body.body && req.body.banner && req.session.user.username) {
    uploadPost(req.body.title, req.body.body, req.body.tags, req.params.pid,
      req.body.banner, req.session.user.username, req.session.user.firstname, req.session.user.lastname)
    .then(() => res.redirect(`/posts/${req.params.pid}`))
    .catch(err => res.sendStatus(500));
  } else {
    res.sendStatus(400);
  }
});

router.route("/editor/:pid")
.get((req, res) => { 
  if (req.session.user) {
    db.getValueData("blog_posts", "post", "pid", req.params.pid)
    .then(post => {
      if (post[0]) {
        if (post[0].username == req.session.user.username || req.session.user.admin)
          res.render("posts/editor", { editor: req.session.user.firstname + " " + req.session.user.lastname, post: post });
        else
          res.status(403).redirect("http/status", { code: 403, message: "forbidden" });
      } else {
        res.status(404).render("http/status", { code: 404, message: "not found" });
      }
    })
    .catch(err => res.status(500).render("http/status", { code: 500, message: "internal server error" }));
  } else {
    res.redirect("/users/login");
  }
})
.post((req, res) => {
  if (req.body.title && req.body.body && req.body.banner && req.session.user) {
    db.getValueData("blog_posts", "post", "pid", req.params.pid)
    .then(post => { 
      if (post[0].username == req.session.user.username || req.session.user.admin) {
        editPost(req.body.title, req.body.body, req.body.tags, req.params.pid, req.body.banner)
        .then(() => res.redirect(`/posts/${req.params.pid}`))
        .catch(err => res.status(500).render("http/status", { code: 500, message: "internal server error" }));
      } else {
        res.status(403).redirect("http/status", { code: 403, message: "forbidden" });
      }
    })
    .catch(err => res.status(500).render("http/status", { code: 500, message: "internal server error" }));
  } else {
    res.status(400).render("http/status", { code: 400, message: "bad request" });
  }
});

router.route("/:pid")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "pid", req.params.pid)
  .then(post => {
    res.render("posts/post", {
      title: post[0].title,
      /* sanitization to mitigate XSS */
      body: DOMPurify.sanitize(markdown.parse(post[0].body)),
      tags: post[0].tags.split(','),
      banner: post[0].banner,
      author: post[0].user.firstname + " " + post[0].user.lastname,
      pid: post[0].pid,
      username: post[0].user.username,
      date: formatDate(post[0].date),
      edit_date: formatDate(post[0].edit_date)
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
  db.getValueData("blog_posts", "post", "pid", req.params.pid)
  .then(post => {
    if (req.session.user) {
      deletePost(post, req.session.user.username, req.session.user.admin)
      .then(() => res.sendStatus(200))
      .catch(err => res.sendStatus(403));
    } else {
      res.sendStatus(401);
    }
  })
  .catch(err => res.sendStatus(404));
});

async function uploadPost(title, body, tags, pid, banner, user) {
  const date = getDate();

  tags = tags.toLowerCase();
  await db.insertData("blog_posts", "post",
    ["title", "body", "date", "tags", "pid", "banner", "user"],
    [title, body, date, tags, pid, banner, user]);
  
  await uploadTags(tags, pid);

  return;
}

async function editPost(title, body, tags, pid, banner) {
  const editDate = getDate();

  tags = tags.toLowerCase();
  await db.updatePost("blog_posts", "post",
    ["title", "body", "edit_date", "tags", "banner"],
    [title, body, editDate, tags, banner],
    ["pid", pid]);
  
  await uploadTags(tags, pid);

  return;
}

async function uploadTags(tags, pid) {
  if (tags) {
    tags = tags.split(',');

    for (var i=0; i<tags.length; ++i) {
      /* escape SQL injection by surrounding table name with backticks */
      tags[i] = `\`${tags[i].trim()}\``;

      try {
        await db.createTable("blog_tags", tags[i], "pid", "char(8)");
      } finally {
        /* this is bugged. no replace when posts are modified */
        await db.replaceData("blog_tags", tags[i], "pid", pid);
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
  if (dateObj == null) {
    return null;
  } else {
    const options = { year: "numeric", month: "long", day: "numeric"};
    const date = dateObj.toLocaleDateString(undefined, options);

    return date;
  }
}

async function deletePost(post, username, admin) {
  var count;

  if (post[0].username === username || admin) {
    if (post[0].tags) {
      const tags = post[0].tags.split(',');

      for (var i=0; i<tags.length; ++i) {
        await db.dropValueData("blog_tags", `\`${tags[i]}\``, "pid", post[0].pid);
        
        /* delete tag if no subposts are found */
        count = (await db.getTableCount("blog_tags", `\`${tags[i]}\``))[0]["COUNT(*)"];
        if (count == 0)
          db.dropTable("blog_tags", `\`${tags[i]}\``);
      }
    }
    
    db.dropValueData("blog_posts", "post", "pid", post[0].pid);
    fs.rmSync(path.resolve(__dirname, `../public/media/pid/${post[0].pid}`), { recursive: true });

    return "deleted";
  } else {
    throw "forbidden";
  }
}

module.exports = router;
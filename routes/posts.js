const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const mariadb = require("mariadb");

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
      req.body.tag &&
      req.body.author) {
          console.log("Request recieved");
          sendPost(req.body.id, req.body.date, req.body.title, req.body.body, req.body.tag);
  } else {
      console.log("Missing parameter");
  }
})

router.get("/id", (req, res) => {
    console.log("Getting id");
    getID().then(data => res.send(data))
})

router.route("/:id")
.get((req, res) => {
  res.send(`Get post with ID ${req.params.id}`);
})
.put((req, res) => {
  res.send(`modify post with ID ${req.params.id}`);
})
.delete((req, res) => {
  res.send(`delete post with ID ${req.params.id}`);
})

router.post("/images", (req, res) => {
  let id = req.body.id;
  let file = req.files.image;
  let imageName = file.name;
  let imagePath = path.resolve(__dirname, `../public/images/blog/${id}`);

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }

  file.mv(imagePath, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.json(imagePath);
    }
  })
})

const pool = mariadb.createPool({
  host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "3R7zzN5dRBbfh9BrZeFP",
  connectionLimit: 5
})

async function sendPost(id, date, title, body, tag, author) {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.query(`INSERT INTO blog_posts.post (id, date, title, body, tag, author) VALUES ('${id}', '${date}', '${title}', '${body}', '${tag}', '${author}')`);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.close();
  }
}

async function getID() {
  let conn;
  try {
    conn = await pool.getConnection();
    return await conn.query("SELECT id FROM blog_posts.post")
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.close();
  }
}

module.exports = router;

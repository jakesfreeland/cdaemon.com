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
      req.body.title && 
      req.body.body) {
          console.log("Request recieved");
          sendPost(req.body.id, req.body.title, req.body.body);
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
  let id = req.query.id;
  let file = req.files.image;
  let imageName = file.name;
  let imagePath = path.resolve(__dirname, `../public/images/blog/${id}`);

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath);
  }

  fs.rename(file, `${imagePath}/${imageName}`, (err) => {
    if (err) throw err;
    console.log("complete");
  })
})

const pool = mariadb.createPool({
  host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "3R7zzN5dRBbfh9BrZeFP",
  connectionLimit: 5
})

async function sendPost(id, title, body) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`INSERT INTO blog_posts.post (id, title, body) VALUES ('${id}', '${title}', '${body}')`);
  } catch(err) {
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
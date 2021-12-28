const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const path = require("path");
const mariadb = require("mariadb");
const { append } = require("express/lib/response");

router.use(fileupload());

router.route("/signup")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        console.log("Request recieved");
        // sendUser(req.body.username, req.body.password);
        sendData("users", "user", "username, password", req.body.username, req.body.password);
  } else {
    console.log("Missing parameter");
  }
})

router.route("/:username")
.get((req, res) => {
  res.send(`Get user with ID ${req.params.username}`);
})

const pool = mariadb.createPool({
  host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "3R7zzN5dRBbfh9BrZeFP",
  connectionLimit: 5
})

async function sendUser(username, password) {
  let conn;
  try {
    conn = await pool.getConnection()
    conn.query(`INSERT INTO users.user (username, password) VALUES ('${username}', '${password}')`);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.close();
  }
}

async function sendData(database, table, columns, ...data) {
  let conn = await mariadb.createConnection({
    host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "3R7zzN5dRBbfh9BrZeFP",
    connectionLimit: 5
  });

  let values = "";
  for (var i=0; i<data.length; ++i) {
    values += `'${data[i]}', `;
  }
  values = values.slice(0, -2);

  try {
    conn.query(`INSERT INTO ${database}.${table} (${columns}) VALUES (${values})`);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.close();
  }
}

module.exports = router;
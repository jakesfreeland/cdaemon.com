const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto").webcrypto;
const path = require("path");
const db = require("../user_modules/db.cjs");

// tell the server to use bodyparser to parse incoming requests
// this will search through submitted form data
router.use(bodyParser.urlencoded({ extended: true }))

// when the user accesses /users/signup
router.route("/signup")
// in the case of a get request (normal browser behavior)
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
// in the case of a post request (submission of form)
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        const salt = genSalt();
        hashData(req.body.password, salt)
        .then(digest => 
          db.sendData(
            "users", "user",
            ["username", "password", "salt"],
            [req.body.username, digest, salt])
        )
        .then(() => res.redirect("/"))
        .catch(err => console.log(err));
  } else {
    console.log("Missing parameter");
  }
});

// when the user accesses /users/login
router.route("/login")
// in the case of a get request
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/login.html"));
})
// in the case of a post request
.post((req, res) => {
  if (req.body.username && req.body.password) {
    db.getValueData("users", "user", "username", `${req.body.username}`)
    .then(data => {
      const salt = data[0].salt;
      return hashData(req.body.password, salt);
    })
    .then(hash => {
      const digest = data[0].password;
      if (hash == digest) {
        console.log("success");
        res.redirect(`/users/${req.body.username}`);
      } else {
        console.log("failure");
      }
    })
    .catch(err => console.log(err));
  }
});

// functions used earlier
function genSalt() {
  const salt = Math.floor(Math.random() * 99999)
  return salt;
}

async function hashData(data, salt=undefined) {
  if (salt != undefined) {
    data = data + salt;
  }
  const encData = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-384", encData);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// TODO LATER
// router.route("/:username")
// .get((req, res) => {
//   res.send(`Get user with ID ${req.params.username}`);
// })

// this line is necessary for legacy library purposes
module.exports = router;

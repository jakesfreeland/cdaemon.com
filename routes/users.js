const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto").webcrypto;
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieSession({
  name: "session",
  keys: ["JtNogXp57n4rpn", "wA6oNN59UKhdFc", "XLLAmVMs9PFHkR"],
  maxAge: 24 * 60 * 60 * 1000
}));

router.route("/signup")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        const salt = genSalt();
        hashData(req.body.password, salt)
        .then(digest => {
          db.sendData("users", "user",
                      ["username", "password", "salt"],
                      [req.body.username, digest, salt]);
        });
  } else {
    console.log("Missing parameter");
  }
  res.redirect("/");
})

router.route("/login")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/login.html"));
})
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        console.log("Login recieved");
        
  }
})

router.route("/:username")
.get((req, res) => {
  res.send(`Get user with ID ${req.params.username}`);
})

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

module.exports = router;
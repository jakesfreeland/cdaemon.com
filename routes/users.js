const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto").webcrypto;
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieSession({
  name: "session",
  keys: ["YyKRyL3RfMNts3", "W8cE4d2eLmM8Xs"],
  maxAge: 604800000,
  // secure: true
}));

router.route("/signup")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
.post((req, res) => {
  if (req.body.username && req.body.password && req.body.email) {
    const username = req.body.username.replace("\'", "\\\'");
    // req.body.password gets hashed, no escapements necessary
    const email = req.body.email.replace("\'", "\\\'");
    if (email.match(".*@.*[.].*")) {
      createUser(username, req.body.password, email)
      .then(uid => {
        req.session.username = username;
        req.session.uid = uid;
        res.redirect(`/users/${uid}/`);
      })
      .catch(err => console.log(err));
    } else {
      console.log("Invalid email string");
    }
  } else {
    console.log("Missing parameter");
  }
});

router.route("/login")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/login.html"));
})
.post((req, res) => {
  if (req.body.id && req.body.password) {
    db.getValueData("users", "user", "username", `${req.body.id}`)
    .then(data => {
      const stored_digest = data[0].password;
      const uid = data[0].uid;
      hashData(req.body.password, uid)
      .then(fresh_digest => {
        if (fresh_digest === stored_digest) {
          req.session.id = req.body.username;
          res.redirect(`/users/${req.body.uid}/`);
        } else {
          res.sendStatus(401);
        }
      })
    })
    .catch(err => console.log(err));
  }
});

router.route("/:username")
.get((req, res) => {
  res.send(`User profile for ID: ${req.params.username}`);
});

async function createUser(username, password, email) {
  const uid = await getUID();
  const digest = await hashData(password, uid);

  await db.sendData("users", "user",
    ["username", "password", "email", "uid"],
    [username, digest, email, uid]);
  
  return uid;
}

async function getUID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  const ids = await db.getColumnData("users", "user", "uid");
  // re-run getID() if idGen is present in database
  if (ids.some(e => e.id === idGen)) {
    return getUID();
  } else {
    return idGen;
  }
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

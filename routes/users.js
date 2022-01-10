const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto").webcrypto;
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
  res.render("users/signup");
})
.post((req, res) => {
  if (req.body.username && req.body.password && req.body.email) {
    createUser(req.body.username, req.body.password, req.body.email)
    .then(uid => {
      if (uid !== null) {
        req.session.username = username;
        req.session.uid = uid;
        res.redirect(req.session.return || `/users/${uid}/`);
        req.session.return = null;
      }
    })
    .catch(err => console.log(err));
  } else {
    console.log("Missing Parameter");
  }
});

router.route("/login")
.get((req, res) => {
  res.render("users/login");
})
.post((req, res) => {
  if (req.body.email && req.body.password) {
    userLogin(req.body.email, req.body.password)
    .then(auth => {
      if (auth !== null) {
        req.session.username = auth.username;
        req.session.uid = auth.uid;
        res.redirect(req.session.return || `/users/${auth.uid}/`);
        req.session.return = null;
      } else {
        res.sendStatus(401);
      }
    })
    .catch(err => console.log(err));
  } else {
    console.log("Missing parameter");
  }
});

router.route("/:username")
.get((req, res) => {
  res.send(`User profile for ID: ${req.params.username}`);
});

async function createUser(username, password, email) {
  if (email.match(".*@.*[.].*")) {
    const uid = await getUID();
    const digest = await hashData(password, uid);

    username = username.replace("\'", "\\\'");
    email = email.replace("\'", "\\\'");

    await db.sendData("users", "user",
      ["username", "password", "email", "uid"],
      [username, digest, email, uid]);
    return uid;
  } else {
    console.log("Invalid Email String");
    return null;
  }
}

async function userLogin(email, password) {
  email = req.body.email.replace("\'", "\\\'");
  password = req.body.password.replace("\'", "\\\'");

  const userData = (await db.getValueData("users", "user", "email", `${email}`))[0];
  const stored_digest = userData.password;
  const fresh_digest = await hashData(password, userData.uid);

  if (stored_digest === fresh_digest) {
    return userData;
  } else {
    console.log("Incorrect Password");
    return null;
  }
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

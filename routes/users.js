const express = require("express");
const router = express.Router();
const crypto = require("crypto").webcrypto;
const db = require("../user_modules/db.cjs");

router.route("/signup")
.get((req, res) => {
  res.render("users/signup");
})
.post((req, res) => {
  if (req.body.username && req.body.password && req.body.email) {
    createUser(req.body.username, req.body.password, req.body.email)
    .then(uid => {
      req.session.username = req.body.username;
      req.session.uid = uid;
      res.redirect(req.session.return || '/');
      req.session.return = null;
    })
    .catch(err => res.send(err));
  } else {
    res.send("Missing Parameter");
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
      req.session.username = auth.username;
      req.session.uid = auth.uid;
      if (auth.admin) req.session.admin = 1;
      res.redirect(req.session.return || '/');
      req.session.return = null;
    })
    .catch(err => res.sendStatus(401));
  } else {
    res.send("Missing parameter");
  }
});

router.route("/:uid")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "uid", req.params.uid)
  .then(posts => { if (posts[0].author) res.render("users/user", { posts: posts, uid: req.session.uid }) })
  .catch(err => {
    res.status(404);
    res.render("http/404", { url: `Posts by user id: ${req.url}` });
  });
});

async function createUser(username, password, email) {
  if (email.match(".*@.*[.].*")) {
    username = username.replace("\'", "\\\'");
    email = email.replace("\'", "\\\'");

    const uid = await getUID();
    const digest = await hashData(password, uid);

    await db.sendData("blog_users", "user",
      ["username", "password", "email", "uid"],
      [username, digest, email, uid]);
    return uid;
  } else {
    throw "Invalid Email String";
  }
}

async function userLogin(email, password) {
  email = email.replace("\'", "\\\'");
  password = password.replace("\'", "\\\'");

  const userData = (await db.getValueData("blog_users", "user", "email", `${email}`))[0];
  const stored_digest = userData.password;
  const fresh_digest = await hashData(password, userData.uid);

  if (stored_digest === fresh_digest) {
    return userData;
  } else {
    throw "Incorrect Password";
  }
}

async function getUID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    // concatenate pseudo-random position in charPool
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  const ids = await db.getColumnData("blog_users", "user", "uid");
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

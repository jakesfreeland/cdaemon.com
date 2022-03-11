const express = require("express");
const router = express.Router();
const crypto = require("crypto").webcrypto;
const db = require("../user_modules/db.cjs");

/* 
 * TODO: user signup is functional but incomplete.
 * Any user could sign up and be able to post.
 * This is not intentional behavior.
 * Come back when/if post comments are implemented.
 */

// router.route("/signup")
// .get((req, res) => {
//   res.render("users/signup");
// })
// .post((req, res) => {
//   if (req.body.username && req.body.password && req.body.email) {
//     if (req.body.email.match(".*@.*[.].*")) {
//       createUser(req.body.firstname, req.body.lastname, req.body.username, req.body.email, req.body.password)
//       .then(() => {
//         req.session.username = req.body.username;
//         req.session.firstname = req.body.firstname;
//         req.session.lastname = req.body.lastname;
//         res.redirect('/');
//       })
//       .catch(err => res.send(err));
//     } else {
//       res.send("Invalid email");
//     }
//   } else {
//     res.send("Missing Parameter");
//   }
// });

router.route("/login")
.get((req, res) => {
  res.render("users/login");
})
.post((req, res) => {
  if (req.body.email && req.body.password) {
    userLogin(req.body.email, req.body.password)
    .then(auth => {
      req.session.username = auth.username;
      req.session.firstname = auth.firstname;
      req.session.lastname = auth.lastname;
      if (auth.admin) req.session.admin = 1;
      res.redirect('/');
    })
    .catch(err => res.send(err));
  } else {
    res.send("Missing parameter");
  }
});

router.route("/:username")
.get((req, res) => {
  db.getValueData("blog_posts", "post", "username", req.params.username)
  .then(posts => {
    if (posts[0].username)
      res.render("users/user", { posts: posts, activeUser: req.session.username, admin: req.session.admin });
  })
  .catch(err => {
    res.status(404);
    res.render("http/status", {
      code: "404",
      message: `No posts by ${req.params.username} found.`
    });
  });
});

async function createUser(firstname, lastname, username, email, password) {
  try {
    const digest = await hashData(password, username);
    await db.sendData("blog_users", "user",
      ["firstname", "lastname", "username", "email", "password"],
      [firstname, lastname, username, email, digest]);
  } catch (err) {
    throw "User with provided details already exists";
  }

  return;
}

async function userLogin(email, password) {
  try {
    const userData = (await db.getValueData("blog_users", "user", "email", email))[0];
    const stored_digest = userData.password;
    const fresh_digest = await hashData(password, userData.username);

    if (stored_digest === fresh_digest)
      return userData;
  } catch (err) {
    throw "incorrect username or password";
  }
}

async function hashData(data, salt) {
  data = data + salt;
  const encData = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-384", encData);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

module.exports = router;

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
//   if (!req.body.username || !req.body.password || !req.body.email) {
//     res.status(400);
//     res.render("http/status", {
//       code: "400",
//       message: "Missing Parameter"
//     });
//     return;
//   }

//   if (!req.body.email.match(".*@.*[.].*")) {
//     res.status(400);
//     res.render("http/status", {
//       code: "400",
//       message: "Invalid Email"
//     });
//     return;
//   }

//   if (req.body.username == "signup" || req.body.username == "login") {
//     res.status(400);
//     res.render("http/status", {
//       code: "400",
//       message: "Username Not Allowed"
//     });
//     return;
//   }

//   createUser(req.body.firstname, req.body.lastname, req.body.username, req.body.email, req.body.password)
//   .then(() => {
//   req.session.user = {
//     username: req.body.username,
//     firstname: req.body.firstname,
//     lastname: req.body.lastname,
//   };
//     res.redirect('/');
//   })
//   .catch(err => {
//     res.status(400);
//     res.render("http/status", {
//       code: "400",
//       message: `${err}`
//     });
//   });
// });

router.route("/login")
.get((req, res) => {
  res.render("users/login");
})
.post((req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.render("http/status", {
      code: "400",
      message: "Missing Parameter"
    });
    return;
  }

  userLogin(req.body.email, req.body.password)
  .then(auth => {
    req.session.user = {
      username: auth.username,
      firstname: auth.firstname,
      lastname: auth.lastname,
      admin: auth.admin
    };
    res.redirect('/');
  })
  .catch(err => {
    res.status(400);
    res.render("http/status", {
      code: "400",
      message: `${err}`
    });
  });
});

router.route("/:username")
.get((req, res) => {
  db.getJSONData("blog_posts", "posts", "author", req.params.username, "username")
  .then(posts => {
    if (posts.length != 0) {
      if (req.session.user) {
        res.render("users/user", { posts: posts,
                                   author: JSON.parse(posts[0].author),
                                   userUsername: req.session.user.username,
                                   admin: req.session.user.admin });
      } else {
        res.render("users/user", { posts: posts,
                                   author: JSON.parse(posts[0].author),
                                   user: null,
                                   admin: 0 });
      }
    } else {
      res.status(404);
      res.render("http/status", {
        code: "404",
        message: `No posts by ${req.params.username} found.`
      });
    }
  })
  .catch(() => res.sendStatus(500));
});

async function createUser(firstname, lastname, username, email, password) {
  try {
    const digest = await hashData(password, username);
    await db.insertData("blog_users", "user",
      ["firstname", "lastname", "username", "email", "password"],
      [firstname, lastname, username, email, digest]);
  } catch (err) {
    throw "User with provided credentials already exists";
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

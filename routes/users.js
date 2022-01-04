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
        const digest = hashData(req.body.password, salt);
        db.sendData(
          "users", "user",
          ["username", "password", "salt"],
          [req.body.username, digest, salt])
        .then(res.redirect("/"))
        .catch(err => console.log(err));
  } else {
    console.log("Missing parameter");
  }
})

// when the user accesses /users/login
router.route("/login")
// in the case of a get request
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/login.html"));
})
// in the case of a post request
.post((req, res) => {

  // check if user has a valid login cookie

  if (req.body.username && req.body.password) {
    console.log("Login recieved");

    db.getValueData("users", "user", "username", `${req.body.username}`)
    .then(data => {
      const username = data[0].username;
      const digest = data[0].password;
      const salt = data[0].salt;

      if (hashData(req.body.password, salt) == digest) {
        console.log("Authentication successful");
        res.redirect(`/users/${req.body.username}`);

        // create cookie
      }

      else {
        console.log("Authentication failed");
      }
    })
    .catch(err => {
     res.status(404);
     res.format({
       html: () => {
         res.render("http/404.ejs", { url: `Username ${req.body.username}` });
       },
       json: () => {
         res.json({ error: 'Username not found' });
       },
       default: () => {
        res.type('txt').send('Username not found');
      }
    });
  })
  }
})

// functions used earlier
function genSalt() {
  const salt = Math.floor(Math.random() * 99999)
  return salt;
}

function hashData(data, salt=undefined) {
  if (salt != undefined) {
    data = data + salt;
  }
  const encData = new TextEncoder().encode(data);
  const hashBuf = crypto.subtle.digest("SHA-384", encData);
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

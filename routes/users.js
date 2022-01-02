const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");
const cookieSession = require("cookie-session");
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
        console.log("Signup recieved");
        db.sendData("users", "user", 
                    ["username", "password"],
                    [req.body.username, req.body.password]);
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

module.exports = router;
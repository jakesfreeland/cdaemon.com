const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(fileupload());

router.route("/signup")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        console.log("Request recieved");
        db.sendData("users", "user", 
                    ["username", "password"],
                    [req.body.username, req.body.password]);
  } else {
    console.log("Missing parameter");
  }
})

router.route("/:username")
.get((req, res) => {
  res.send(`Get user with ID ${req.params.username}`);
})

module.exports = router;
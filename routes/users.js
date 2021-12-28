const express = require("express");
const router = express.Router();
const path = require("path");

router.route("/signup")
.get((req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})
.post((req, res) => {
  if (req.body.username &&
      req.body.password) {
        console.log("Request recieved");
        sendUser(req.body.username, req.body.password);
  } else {
    console.log("Missing parameter");
  }
})

router.route("/:username")
.get((req, res) => {
  res.send(`Get user with ID ${req.params.username}`)
})

async function sendUser(username, password) {
  ;
}

module.exports = router;
const express = require("express");
const router = express.Router();
const path = require("path");

router.get('/signup', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/html/signup.html"));
})

router.route("/:id")
.get((req, res) => {
  res.send(`Get user with ID ${req.params.id}`)
})
.put((req, res) => {
  res.send(`modify user with ID ${req.params.id}`)
})
.delete((req, res) => {
  res.send(`delete user with ID ${req.params.id}`)
})

module.exports = router;
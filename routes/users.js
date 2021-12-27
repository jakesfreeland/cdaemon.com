const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  res.send("users page");
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
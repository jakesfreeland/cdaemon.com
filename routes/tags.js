const express = require("express");
const router = express.Router();
const db = require("../user_modules/db.cjs");

// create table in database tags for respective tag
router.route("/:tag")
.get((req, res) => {

})

module.exports = router;
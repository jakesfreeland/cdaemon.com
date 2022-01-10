const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const cookieSession = require("cookie-session");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

router.use(fileupload());
router.use(cookieSession({
  name: "session",
  keys: ["YyKRyL3RfMNts3", "W8cE4d2eLmM8Xs"],
  maxAge: 604800000,
  // secure: true
}));

router.post('/', (req, res) => {
  const media = req.files.media;
  const mediaPath = path.resolve(__dirname, `../public/media/uid/${req.session.uid}/`);

  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath);
  }

  if (media.length === undefined) {
    // mv is not async but returns promise
    media.mv(mediaPath + '/' + media.name)
    .catch(err => console.log(err));
  } else {
    for (var i=0; i<media.length; ++i) {
      // mv is not async but returns promise
      media[i].mv(mediaPath + '/' + media[i].name)
      .catch(err => console.log(err));
    }
  }
})

router.get("/:filename", (req, res) => {
  const mediaPath = path.resolve(__dirname, `../public/media/temp/${req.session.uid}/${req.params.filename}`);
  if (fs.existsSync(mediaPath)) {
    res.sendFile(mediaPath)
  }
})

module.exports = router;
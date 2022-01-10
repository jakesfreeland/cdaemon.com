const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

router.use(fileupload());

router.post('/', (req, res) => {
  uploadMedia(req.files.media, req.session.uid);
})

router.get("/:filename", (req, res) => {
  const mediaPath = path.resolve(__dirname, `../public/media/uid/${req.session.uid}/`);
  if (fs.existsSync(mediaPath + '/' + req.params.filename)) {
    res.sendFile(mediaPath + '/' + req.params.filename);
  } else {
    res.sendStatus(404);
  }
});

async function uploadMedia(media, uid) {
  const mediaPath = path.resolve(__dirname, `../public/media/uid/${uid}/`);

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
}

module.exports = router;
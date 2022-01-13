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
  const uidPath = path.resolve(__dirname, `../public/media/uid/${req.session.uid}/`);
  const pidPath = path.resolve(__dirname, `../public/media/pid/${req.session.pid}/`);
  if (fs.existsSync(uidPath + '/' + req.params.filename)) {
    res.sendFile(uidPath + '/' + req.params.filename);
  } else if (fs.existsSync(pidPath + '/' + req.params.filename)) {
    res.sendFile(pidPath + '/' + req.params.filename);
  } else {
    res.sendStatus(404);
  }
});

async function uploadMedia(media, uid) {
  const uidPath = path.resolve(__dirname, `../public/media/uid/${uid}/`);

  if (!fs.existsSync(uidPath)) {
    fs.mkdirSync(uidPath);
  }

  if (media.length === undefined) {
    // mv is not async but returns promise
    media.mv(uidPath + '/' + media.name)
    .catch(err => console.log(err));
  } else {
    for (var i=0; i<media.length; ++i) {
      // mv is not async but returns promise
      media[i].mv(uidPath + '/' + media[i].name)
      .catch(err => console.log(err));
    }
  }

  return 0;
}

module.exports = router;
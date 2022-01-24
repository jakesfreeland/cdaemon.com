const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

router.use(fileupload());

router.post('/', (req, res) => {
  uploadMedia(req.files.media, req.session.pid)
  .then(() => res.sendStatus(200))
  .catch(err => res.send(err));
});

router.get("/:pid/:filename", (req, res) => {
  const tmpPath = path.resolve(__dirname, `../public/media/tmp/${req.params.pid}/`);
  const pidPath = path.resolve(__dirname, `../public/media/pid/${req.params.pid}/`);
  if (fs.existsSync(tmpPath + '/' + req.params.filename)) {
    res.sendFile(tmpPath + '/' + req.params.filename);
  } else if (fs.existsSync(pidPath + '/' + req.params.filename)) {
    res.sendFile(pidPath + '/' + req.params.filename);
  } else {
    res.sendStatus(404);
  }
});

async function uploadMedia(media, pid) {
  const tmpPath = path.resolve(__dirname, `../public/media/tmp/${pid}/`);

  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
  }

  if (media.length === undefined) {
    // mv is not async but returns promise
    media.mv(tmpPath + '/' + media.name)
    .catch(err => console.log(err));
  } else {
    for (var i=0; i<media.length; ++i) {
      // mv is not async but returns promise
      media[i].mv(tmpPath + '/' + media[i].name)
      .catch(err => console.log(err));
    }
  }

  return 0;
}

module.exports = router;
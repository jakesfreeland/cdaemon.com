const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

router.use(fileupload());

router.post('/upload/:pid', (req, res) => {
  uploadMedia(req.files.media, req.params.pid)
  .then(() => res.sendStatus(200))
  .catch(err => res.send(err));
});

router.get("/:pid/:filename", (req, res) => {
  const pidPath = path.resolve(__dirname, `../public/media/pid/${req.params.pid}/`);
  if (fs.existsSync(pidPath + '/' + req.params.filename))
    res.sendFile(pidPath + '/' + req.params.filename);
  else
    res.sendStatus(404);
});

async function uploadMedia(media, pid) {
  const pidPath = path.resolve(__dirname, `../public/media/pid/${pid}/`);

  if (!fs.existsSync(pidPath)) {
    fs.mkdirSync(pidPath);
  }

  if (media.length === undefined) {
    // mv is not async but returns promise
    media.mv(pidPath + '/' + media.name)
    .catch(err => console.log(err));
  } else {
    for (var i=0; i<media.length; ++i) {
      // mv is not async but returns promise
      media[i].mv(pidPath + '/' + media[i].name)
      .catch(err => console.log(err));
    }
  }

  return 0;
}

module.exports = router;
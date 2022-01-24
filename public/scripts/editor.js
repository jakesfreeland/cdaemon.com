const previewBox = document.querySelector(".preview-expand")
const expandPreview = document.getElementById("expand-caret");
const retractPreview = document.getElementById("retract-caret");
const previewContent = document.querySelector(".preview-content")

const title = document.querySelector(".title");
const body = document.querySelector(".body");
const tags = document.querySelector(".tags");
const banner = document.querySelector(".banner");
const previewIntro = document.querySelector(".intro");
const previewTitle = document.getElementById("title-preview");
const previewBody = document.getElementById("body-preview");
const previewTags = document.getElementById("tags-preview");

const uploadInput = document.getElementById("media-upload");
const uploadBanner = document.getElementById("banner-upload");
const publishBtn = document.getElementById("publish-btn");
const publishForm = document.getElementById("publish-form");

const errMsg = document.querySelector(".error-msg");

previewBox.addEventListener("click", () => {
  if (expandPreview.style.display === "block") {
    expandPreview.style.display = "none";
    retractPreview.style.display = "block";
    previewContent.hidden = false;
  } else {
    expandPreview.style.display = "block";
    retractPreview.style.display = "none";
    previewContent.hidden = true;
  }
});

title.addEventListener("input", () => {
  previewTitle.textContent = title.value;
});

body.addEventListener("input", () => {
  previewBody.textContent = body.value;
});

tags.addEventListener("input", () => {
  previewTags.textContent = tags.value;
});

uploadInput.addEventListener("change", () => {
  uploadMedia(uploadInput.files)
  .then(insertTemplate)
  .then(mdNames => {
    const curText = body.value;
    const curPos = body.selectionStart;
    body.value = curText.slice(0,curPos) + mdNames + curText.slice(curPos);
    return body.dispatchEvent(new Event("input"));
  })
  .then(() => uploadInput.value = "")
  .catch(alert);
});

uploadBanner.addEventListener("change", () => {
  Promise.all([uploadMedia(uploadBanner.files), getUID()])
  .then(([fileNames, uid]) => {
    banner.value = fileNames[0];
    previewIntro.style.backgroundImage = `url(/media/${uid}/${fileNames[0]})`;
  })
  .catch(alert);
});

publishBtn.addEventListener("click", () => {
  if (title.value && body.value && banner.value) {
    publishForm.submit();
  } else {
    errMsg.textContent = "A title, body, and banner are required to publish!";
  }
})

async function uploadMedia(media) {
  let allAreImages = 1;
  for (i=0; i<media.length; ++i) {
    if (!media[i].type.includes("image")) {
      allAreImages = 0;
    }
  }

  if (allAreImages) {
    const formData = new FormData();
    let fileNames = [];

    for (i=0; i<media.length; ++i) {
      formData.append("media", media[i]);
      fileNames.push(media[i].name);
    }

    await fetch("/media", {
      method: "POST",
      body: formData
    });

    return fileNames;
  } else {
    throw "Oops! At least one of the files you uploaded was not an image. Upload only images instead.";
  }
}

async function insertTemplate(fileNames) {
  const uid = await getUID();
  for (var i=0; i<fileNames.length; ++i) {
    fileNames[i] = `![](/media/${uid}/${encodeURIComponent(fileNames[i])})`;
  }
  const mdNames = fileNames.join('\n');

  return mdNames;
}

async function getUID() {
  return (await (await fetch("/users/uid")).json()).uid;
}

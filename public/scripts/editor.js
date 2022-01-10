const previewBox = document.querySelector(".preview-expand")
const expandPreview = document.getElementById("expand-caret");
const retractPreview = document.getElementById("retract-caret");
const previewContent = document.querySelector(".preview-content")

const title = document.querySelector(".title");
const body = document.querySelector(".body");
const tags = document.querySelector(".tags");
const previewTitle = document.getElementById("title-preview");
const previewBody = document.getElementById("body-preview");
const previewTags = document.getElementById("tags-preview");

const uploadInput = document.getElementById("media-upload");
const uploadBanner = document.getElementById("banner-upload");

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
  .then(fileNames => { if (fileNames !== null) return insertTemplate(fileNames); })
  .then(() => body.dispatchEvent(new Event("input")))
  .catch(err => console.log(err));
});

uploadBanner.addEventListener("change", () => {
  uploadMedia(uploadBanner.files, banner=true);
});

async function uploadMedia(media, banner=false) {
  let fileNames = [];
  let allAreImages = 1;

  for (i=0; i<media.length; ++i) {
    if (!media[i].type.includes("image")) {
      allAreImages = 0;
    }
  }

  if (allAreImages) {
    const formData = new FormData();
    for (i=0; i<media.length; ++i) {
      formData.append("media", media[i]);
      fileNames.push(`![](/media/${media[i].name})`);
    }
    
    if (banner === true) {
      formData.append("banner", true);
    }

    fetch("/media", {
      method: "POST",
      body: formData
    }).catch(err => console.log(err));

    return fileNames;
  } else {
    alert("Oops! At least one of the files you uploaded was not an image. Upload only images instead.");
    return null;
  }
}

async function insertTemplate(fileNames) {
  const curPos = body.selectionStart;
  const curText = body.value;
  const template = fileNames.join('\n');
  body.value = curText.slice(0,curPos) + template + curText.slice(curPos);

  return 0;
}

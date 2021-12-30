const idField = document.querySelector(".id");
const dateField = document.querySelector(".date");
const uploadInput = document.querySelector("#image-upload");

let id;
createID();

function createID() {
  let idGen = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    idGen += charPool.charAt(Math.floor(Math.random() * 62));
  }

  fetch("/posts/id")
  .then(data => data.json())
  .then(ids => {
    if (ids.some(e => e.idGen === `${idGen}`)) {
      createID();
    } else {
      id = idField.value = idGen;
    }
  })
  .catch(err => console.error(err));
}

dateField.value = createDate();
function createDate() {
  y = new Date().getFullYear();
  m = new Date().getMonth() + 1; // add 1 because month starts at 0
  d = new Date().getDay();
  let pad;
  if (d < 10) {
    pad = '0';
  }
  const date = y.toString() + '-' + m.toString() + '-' + pad + d.toString();
  return date;
}

uploadInput.addEventListener("change", () => {
  uploadImage(id, uploadInput.files);
});
async function uploadImage(id, file) {
  [file] = file;
  if (file.type.includes("image")) {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("image", file);

    fetch("/posts/images", {
      method: "POST",
      body: formData
    }).catch(console.log);
  } else {
    alert("Oops! That file is not an image. Upload an image instead.");
  }
}
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
    if (ids.some(e => e.id === idGen)) {
      createID();
    } else {
      id = idField.value = idGen;
    }
  })
  .catch(err => console.error(err));
}

dateField.value = getDate();
function getDate() {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const tzDate = new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
  return tzDate;
}

uploadInput.addEventListener("change", () => {
  uploadImage(id, uploadInput.files);
})
async function uploadImage(id, file) {
  if (file[0].type.includes("image")) {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("img", file[0]);

    fetch("/posts/images", {
      method: "POST",
      body: formData
    }).then(res => res.json())
    .catch(console.log);
  } else {
    alert("Oops! The file you uploaded was not an image. Upload an image instead.");
  }
}
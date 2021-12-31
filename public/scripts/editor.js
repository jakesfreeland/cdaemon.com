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
    // THIS NEEDS FIXING!!! THE ids ARRAY CONTAINS A SINGULAR JSON OBJECT
    // THAT JSON OBJECT NEEDS TO BE CHECKED FOR DUPLICATE IDS!!!
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
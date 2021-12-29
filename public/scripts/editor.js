const idField = document.querySelector(".id");
const dateField = document.querySelector(".date");
const uploadInput = document.querySelector("#image-upload");

id = idField.value = createID();
function createID() {
  let id = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    id += charPool.charAt(Math.floor(Math.random() * 62));
  }

  // fix this
  // fetch("/posts/id")
  // .get(data => data.json())
  // .get(ids => {
  //   if (ids.some(e => e.id === `${id}`)) {
  //     return createID();
  //   } else {
  //     return id;
  //   }
  // })
  // .catch(err => console.error(err));
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

// WORK ON NEXT --- UPLOADING IMAGES USING MULTER
// uploadInput.addEventListener("change", uploadImage(id, uploadInput));
// async function uploadImage(id, uploadInput) {
//   const [file] = uploadInput.files;
//   if (file.type.includes("image")) {
//     const formData = new FormData();
//     id = await id;
//     formData.append("id", id);
//     formData.append("image", file);

//     fetch("/posts/images", {
//       method: "POST",
//       body: formData
//     }).then(res => res.json())
//     .catch(console.log);
//   } else {
//     alert("Oops! That file is not an image. Upload an image instead.");
//   }
// }
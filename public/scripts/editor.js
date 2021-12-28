const titleField = document.querySelector(".title");
const bodyField = document.querySelector(".body");
const tagField = document.querySelector(".tag");
const authorField = document.querySelector(".author");
const id = createID();
const date = createDate();

const uploadInput = document.querySelector("#image-upload");
uploadInput.addEventListener("change", () => {
  uploadImage(id, uploadInput);
})

const publishBtn = document.querySelector(".publish-btn");
publishBtn.addEventListener("click", () => {
  relayPost(id, date, titleField.value, bodyField.value, tagField.value, authorField.value);
})

async function createID() {
  let id = "";
  const charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<8; i++) {
    id += charPool.charAt(Math.floor(Math.random() * 62));
  }

  let ids = await ((await fetch("/posts/id")).json());
  if (ids.some(e => e.id === `${id}`)) {
    return createID();
  } else {
    return id;
  }
}

async function createDate() {
  y = new Date().getFullYear();
  m = new Date().getMonth() + 1; // add 1 because month starts at 0
  d = new Date().getDay();
  let padding = '';
  if (d < 10) {
    pad = '0';
  }
  const date = y.toString() + '-' + m.toString() + '-' + pad + d.toString();
  return date;
}

async function uploadImage(id, uploadInput) {
  const [file] = uploadInput.files;
  if (file.type.includes("image")) {
    const formData = new FormData();
    id = await id;
    formData.append("id", id);
    formData.append("image", file);

    fetch("/posts/images", {
      method: "POST",
      body: formData
    }).then(res => res.json())
    .catch(console.log)
  } else {
    alert("Oops! That file is not an image. Upload an image instead.")
  }
}

async function relayPost(id, date, title, body, tag, author) {
  id = await id;
  date = await date;
  const formData = new FormData();
  formData.append("id", id);
  formData.append("date", date);
  formData.append("title", title);
  formData.append("body", body);
  formData.append("tag", tag);
  formData.append("author", author);

  fetch("/posts/new", {
    method: "POST",
    body: formData
  }).catch(console.log)
}

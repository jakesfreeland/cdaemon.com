const titleField = document.querySelector(".title");
const bodyField = document.querySelector(".body");
let id = getID();

const uploadInput = document.querySelector("#image-upload");
uploadInput.addEventListener("change", () => {
  uploadImage(id, uploadInput);
})

const publishBtn = document.querySelector(".publish-btn");
publishBtn.addEventListener("click", () => {
  relayPost(id, titleField.value, bodyField.value);
})

async function getID() {
  let id = ""
  for (var i=0; i<8; i++) {
    id += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    .charAt(Math.floor(Math.random() * 62));
  }
  let ids = await ((await fetch("/posts/id")).json());

  if (ids.some(e => e.id === `${id}`)) {
    return getID();
  } else {
    return id;
  }
}

async function uploadImage(id, uploadInput) {
  const [file] = uploadInput.files;
  if (file.type.includes("image")) {
    const formData = new FormData();
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

async function relayPost(id, title, body) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("title", title);
  formData.append("body", body);

  fetch("/posts/new", {
    method: "POST",
    body: formData
  }).then(res => res.json())
  .catch(console.log)
}
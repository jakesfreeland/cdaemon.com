const uploadInput = document.querySelector("#image-upload");

uploadInput.addEventListener("change", () => {
  uploadImage(uploadInput.files);
})
async function uploadImage(file) {
  if (file[0].type.includes("image")) {
    const formData = new FormData();
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
const username = document.querySelector(".username");
const password = document.querySelector(".password");

const signupBtn = document.querySelector(".signup-btn");
signupBtn.addEventListener("click", () => {
  createUser(username.value, password.value);
})

async function createUser(username, password) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  fetch("/users/signup", {
    method: "POST",
    body: formData
  }).catch(console.log)
}
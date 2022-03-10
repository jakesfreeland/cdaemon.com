document.querySelectorAll(".delete-post").forEach(post =>
  post.addEventListener("click", () => {
    fetch(`/posts/${post.id}`, { method: "DELETE" })
    .then(() => location.reload())
    .catch(console.log);
  })
);

document.querySelectorAll(".edit-post").forEach(post => 
  post.addEventListener("click", () => {
    window.location.href = `/posts/editor/${post.id}`;
  })
);

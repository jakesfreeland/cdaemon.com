const express = require("express")
const app = express();
const path = require("path");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.get('/', (req, res) => {
  res.render("index");
})

const userRouter = require("./routes/users");
app.use("/users", userRouter);
const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

// THIS NEEDS FIXING
app.use((req, res) => {
  res.status(404);
  res.sendFile(path.join(__dirname, "public/html/404.html"));
})

app.listen(3000);

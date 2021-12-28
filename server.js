const express = require("express")
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.get('/', (req, res) => {
  res.render("index");
})

const userRouter = require("./routes/users");
app.use("/users", userRouter);
const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

app.listen(3000);

const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const db = require("./user_modules/db.cjs");

app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
  keys: ["YyKRyL3RfMNts3", "W8cE4d2eLmM8Xs"],
  maxAge: 604800000,
  // secure: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get('/', (req, res) => {
  db.getOrderedLimitData("blog_posts", "post", "date", "desc", "2")
  .then(posts => {
    db.showTables("blog_tags")
    .then(tables => {
      res.render("index", { post0: posts[0], post1: posts[1], tags: tables});
    })
  })
  .catch(console.log)
});

app.get("/projects", (req, res) => {
  res.render("projects");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

const userRouter = require("./routes/users");
app.use("/users", userRouter);
const postRouter = require("./routes/posts");
app.use("/posts", postRouter);
const mediaRouter = require("./routes/media");
app.use("/media", mediaRouter);
const tagsRouter = require("./routes/tags");
app.use("/tags", tagsRouter);

app.use((req, res) => {
  res.status(404);
  res.render("http/404", { url: req.url });
});

app.listen(3000);

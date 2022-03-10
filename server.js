const express = require("express");
const app = express();
const helmet = require("helmet");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const db = require("./user_modules/db.cjs");

app.set("trust proxy", "loopback");
app.set("view engine", "ejs");

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "'wasm-unsafe-eval'", "https://ajax.googleapis.com"],
      "img-src": '*' 
    }
  })
);
app.use(cookieSession({
  name: "session",
  keys: ["YyKRyL3RfMNts3", "W8cE4d2eLmM8Xs"],
  maxAge: 604800000,
  // secure: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get('/', (req, res) => {
  const getPosts = db.getOrderedLimitData("blog_posts", "post", "date", "desc", "2");
  const getTables = db.showTables("blog_tags");

  Promise.all([getPosts, getTables])
  .then(([posts, tables]) => {
    if (posts[1].pid)
      res.render("index", { posts: posts, tags: tables });
    else
      throw "posts not found";
  })
  .catch(err => {
    res.status(503);
    res.render("http/status", {
      code: "503",
      message: "Verdaemon is currently down for maintenance. Try again later."
    });
  });
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
  res.render("http/status", {
    code: "404", 
    message: `Error 404. ${req.url} not found.`
  });
});

app.listen(3000);

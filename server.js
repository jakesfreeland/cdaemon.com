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
  keys: [process.env.COOKIE_KEY_0, process.env.COOKIE_KEY_1],
  maxAge: 604800000,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get('/', (req, res) => {
  const getPosts = db.getOrderedLimitData("blog_posts", "posts", "date", "desc", "2");
  const getTags = db.getDistinct("blog_posts", "tags", "tid");

  Promise.all([getPosts, getTags])
  .then(([posts, tags]) => {
    if (posts.length > 1) {
      res.render("index", { posts: posts, tags: tags });
    } else {
      res.status(503);
      res.render("http/status", {
        code: "503",
        message: "cdaemon is currently down for maintenance. Try again later."
      });
    }
  })
  .catch(() => res.sendStatus(500));
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

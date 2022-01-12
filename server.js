const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

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
  res.render("index");
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

app.use((req, res) => {
  res.status(404);
  res.format({
    html: () => {
      res.render("http/404", { url: req.url });
    },
    json: () => {
      res.json({ error: 'Page not found' });
    },
    default: () => {
      res.type('txt').send('Page not found');
    }
  });
});

app.listen(3000);

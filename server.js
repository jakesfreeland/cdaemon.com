const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.get('/', (req, res) => {
  res.render("index.ejs");
})

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
      res.render("http/404.ejs", { url: req.url });
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

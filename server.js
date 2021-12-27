const express = require("express")
const app = express();

app.use(express.static("public"));

const userRouter = require("./routes/users");
app.use("/users", userRouter);
const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

app.listen(3000);

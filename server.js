const express = require("express");
const app = express();
const mariadb = require("mariadb");

app.post("/post", (req, res) => {
    if (req.query.title && 
        req.query.body && 
        req.query.author && 
        req.query.published && 
        req.query.tag) {
            console.log("Request recieved");
            sendPost();
    } else {
        console.log("Missing parameter")
    }
})

async function sendPost() {
	const conn = await mariadb.createConnection({
		host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
		user: "admin",
		password: "3R7zzN5dRBbfh9BrZeFP"
	});

	try {
		const res = await conn.query(`INSERT INTO blog_posts.posts (title, body, author, published, tag) VALUES ('${req.query.title}', '${req.query.body}' '${req.query.author}' '${req.query.published}' '${req.query.tag}'`);
		console.log(res);
		return res;
    } finally {
		conn.end();
	}
}

app.listen(3000)

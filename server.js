require("dotenv").config();
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const posts = [
  {
    username: "gar",
    stuff: "asdf"
  },
  {
    username: "gadfadsfasdr",
    stuff: "asdf"
  }
];

app.get("/posts", authenticateToken, (req, res) => {
  console.log("************ req.user", req.user);
  res.json(posts);
});

app.listen(3000);

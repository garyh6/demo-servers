require("dotenv").config();
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
};

const generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "60d"
  });
};

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { user: username };
  // require('crypto').randomBytes(64).toString('hex')
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.json({ accessToken, refreshToken });
});

app.listen(4000);

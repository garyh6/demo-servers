require("dotenv").config();
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import redis from "redis";
import pgConfig from "./pgConfig.json";
// Express
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// CORS
const corsOptions = {
  origin: process.env.FRONTEND_HOST
};
app.use(cors(corsOptions));

// Redis
const redisClient = redis.createClient({
  port: 6379,
  host: "localhost"
});
redisClient.on("error", err => {
  console.log("Redis: Error " + err);
});

// Postgres
const pgClient = new Pool(pgConfig);
pgClient.connect();

// JWT
const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
};
const generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "60d"
  });
};

// Bcrypt
const salt = 10;

// Routes
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
});

app.get("/clear", async (req, res) => {
  const pgres = await pgClient.query("DELETE FROM users WHERE email = $1", [
    "gary@gary.com"
  ]);
  res.sendStatus(200);
});

app.get("/register", async (req, res) => {
  const username = "gary@gary.com";
  const password = await bcrypt.hash("temp", salt);

  const pgres = await pgClient.query(
    `INSERT INTO users 
    (email, password) 
    VALUES ($1, $2)`,
    [username, password]
  );
  res.sendStatus(200);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const pgres = await pgClient.query(
    `
    SELECT password 
    FROM users 
    WHERE email = $1;`,
    [username]
  );

  const hash = pgres?.rows[0]?.password || "";

  const isValid = await bcrypt.compare(password, hash);
  if (isValid) {
    const user = { user: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.json({ accessToken, refreshToken });
  }

  return res.sendStatus(401);
});

app.listen(4000);

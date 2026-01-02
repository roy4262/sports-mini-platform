import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  REGISTER (POST)
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// LOGIN (POST)
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.rows[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//  GET ALL GAMES/MATCHES (with optional filters)
app.get("/games", (req, res) => {
  try {
    const file = fs.readFileSync(path.join(__dirname, "matches.json"), "utf-8");
    let games = JSON.parse(file);

    // Filter by sport if provided
    if (req.query.sport && req.query.sport !== "All") {
      games = games.filter((game) => game.sport === req.query.sport);
    }

    // Filter by provider if provided
    if (req.query.provider && req.query.provider !== "All") {
      games = games.filter((game) => game.provider === req.query.provider);
    }

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Error loading games", error });
  }
});

// LEGACY: GET ALL MATCHES (backwards compatibility)
app.get("/matches", (req, res) => {
  try {
    const file = fs.readFileSync(path.join(__dirname, "matches.json"), "utf-8");
    const matches = JSON.parse(file);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Error loading matches", error });
  }
});

//  GET USER FAVORITES
app.get("/favorites", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query("SELECT id FROM users WHERE id = $1", [
      decoded.id,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const favorites = await pool.query(
      "SELECT match_id FROM favorites WHERE user_id = $1",
      [decoded.id]
    );
    res.json(favorites.rows.map((row) => row.match_id));
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

//  ADD TO FAVORITES
app.post("/favorites/:gameId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { gameId } = req.params;

    await pool.query(
      "INSERT INTO favorites (user_id, match_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [decoded.id, gameId]
    );

    res.json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error adding favorite", error });
  }
});

// REMOVE FROM FAVORITES
app.delete("/favorites/:gameId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { gameId } = req.params;

    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND match_id = $2",
      [decoded.id, gameId]
    );

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error removing favorite", error });
  }
});

// 🎧 Start Server
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

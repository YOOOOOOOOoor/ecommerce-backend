import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";
import protect from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// server.js / auth.js
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // secure only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None in prod, Lax locally

  maxAge: 24 * 60 * 60 * 1000 * 30, // 30 days
};

const tokenGenerate = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

//register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please fill all the fields" });
    }
    const checkUser = await pool.query("select * from users where email=$1", [
      email,
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ msg: "User already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await pool.query(
      "insert into users(name,email,password,role) values($1,$2,$3,$4) returning *",
      [name, email, hashedPassword, role || "user"],
    );

    const token = tokenGenerate(user.rows[0].id, user.rows[0].role);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      msg: "User registered successfully",
      users: {
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    const checkUser = await pool.query("select * from users where email=$1", [
      email,
    ]);
    const user = checkUser.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = tokenGenerate(user.id, user.role);
    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      msg: "User logged in successfully",
      users: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//me
router.get("/me", protect, async (req, res) => {
  try {
    const usr = req.user;
    res.status(200).json({
      msg: "User logged in successfully",
      users: {
        id: usr.id,
        name: usr.name,
        email: usr.email,
        role: usr.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//logout
router.post("/logout", async (req, res) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ msg: "User logged out successfully" });
});

export default router;

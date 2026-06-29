
import express from "express";
import protect from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // We'll build this step by step
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  } finally {
    client.release();
  }
});

export default router;

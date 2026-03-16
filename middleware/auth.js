import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "Not authorized, no token" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query("select * from users where id=$1", [
      decode.id,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    req.user = user.rows[0];
    next();
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export default protect;

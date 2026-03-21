import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    // Check if admin exists
    const result = await pool.query("SELECT * FROM users WHERE role='admin'");
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admindDwM7@example.com", 10);
      await pool.query(
        "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
        ["Admin", "admin@example.com", hashedPassword, "admin"],
      );
      console.log(
        "✅ Admin user created: admindDwM7@example.com / admindDwM7@example.com",
      );
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

export default seedAdmin;

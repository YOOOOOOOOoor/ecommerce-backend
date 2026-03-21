import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    // Check if the admin already exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email='admin@example.com'",
    );
    if (result.rows.length === 0) {
      const email = "admin@example.com";
      const password = "admin@example.com"; // temporary password
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
        ["Admin", email, hashedPassword, "admin"],
      );

      console.log(`✅ Admin user created: ${email} / ${password}`);
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

export default seedAdmin;

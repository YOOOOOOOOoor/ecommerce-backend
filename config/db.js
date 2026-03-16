import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway DATABASE_URL
  ssl: {
    rejectUnauthorized: false, // required for Railway Postgres
  },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully!");
    release();
  }
});

export default pool;

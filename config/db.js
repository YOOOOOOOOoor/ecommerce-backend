import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

let pool;

if (process.env.DB_HOST) {
  // Local DB is uncommented
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
} else {
  // Production DB
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

export default pool;

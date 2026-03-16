import express from "express";
import protect from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, price, search, page = 1, limit = 3 } = req.query;

    const numberPage = Number(page);
    const numberLimit = Number(limit);

    const offset = (numberPage - 1) * numberLimit;

    let query =
      "select users.name as seller_name, products.* from users join products on users.id = products.seller_id where 1=1";

    let countQuery =
      "select count(*) as total from users join products on users.id = products.seller_id where 1=1";

    const value = [];

    if (category && category !== "all") {
      value.push(`%${category}%`);
      query += ` and products.category ilike $${value.length}`;
      countQuery += ` and products.category ilike $${value.length}`;
    }

    if (price) {
      value.push(price);
      query += ` and products.price <= $${value.length}`;
      countQuery += ` and products.price <= $${value.length}`;
    }

    if (search) {
      value.push(`%${search}%`);
      query += ` and products.name ilike $${value.length}`;
      countQuery += ` and products.name ilike $${value.length}`;
    }

    value.push(numberLimit, offset);
    query += ` order by products.created_at desc  limit $${value.length - 1} offset $${value.length}`;

    const totalResult = await pool.query(
      countQuery,
      value.slice(0, value.length - 2), // CHANGE 1: only pass filter values to count query
    );

    const total = Number(totalResult.rows[0].total); // This is to return the total number of products that matches the filtering criteria
    const products = await pool.query(query, value);

    res.json({
      products: products.rows,
      total,
      page: numberPage,
      totalPages: Math.ceil(total / numberLimit) || 1,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//only one
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query(
      "select users.name as seller_name, products.* from users join products on users.id = products.seller_id where products.id=$1",
      [id],
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ message: "No product found" });
    }
    res.json(product.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

//adding
router.post("/add", protect, async (req, res) => {
  try {
    const { id } = req.body;

    const result = await pool.query(
      `INSERT INTO carts (users_id, products_id, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (users_id, products_id)
       DO UPDATE SET quantity = carts.quantity + 1
       RETURNING *`,
      [req.user.id, id],
    );

    res.json({
      msg: "Item added to cart",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
  }
});

export default router;

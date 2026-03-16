import express from "express";
import dotenv from "dotenv";
import pool from "../config/db.js";
import protect from "../middleware/auth.js";

const router = express.Router();

//show all products
router.get("/", protect, async (req, res) => {
  try {
    const products = await pool.query(
      `

    select 
    carts.id as cart_id,
    products.*,
    carts.quantity,
    (products.price * carts.quantity) as total_price
from carts
join products on carts.products_id = products.id
where carts.users_id = $1 order by created_at
      
        `,
      [req.user.id],
    );

    res.json({ products: products.rows });
  } catch (error) {
    console.error(error.message);
  }
});

//delete
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const checkProduct = await pool.query(
      "select * from carts where id=$1 and users_id=$2",
      [id, req.user.id],
    );
    if (checkProduct.rows.length === 0) {
      return res.status(200).json({ message: "Product not found" });
    }
    await pool.query("delete from carts where id=$1", [id]);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error.message);
  }
});

export default router;

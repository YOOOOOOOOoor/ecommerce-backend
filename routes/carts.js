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

//decrease
router.put("/decrease/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check current quantity
    const check = await pool.query(
      "SELECT quantity FROM carts WHERE id = $1 AND users_id = $2",
      [id, req.user.id],
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ msg: "Item not found" });
    }

    const quantity = check.rows[0].quantity;

    if (quantity > 1) {
      // Decrease quantity
      const updated = await pool.query(
        `
        UPDATE carts
        SET quantity = quantity - 1
        WHERE id = $1 AND users_id = $2
        RETURNING *
        `,
        [id, req.user.id],
      );

      return res.json({
        msg: "Quantity decreased",
        cartItem: updated.rows[0],
      });
    } else {
      // If quantity = 1 → delete item
      await pool.query("DELETE FROM carts WHERE id = $1 AND users_id = $2", [
        id,
        req.user.id,
      ]);

      return res.json({
        msg: "Item removed from cart",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});
export default router;

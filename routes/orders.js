
import express from "express";
import protect from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Orders route working",
  });
});

router.post("/", protect, async (req, res) => {
  console.log("POST /api/orders hit");
  console.log("User:", req.user);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = req.user.id;

    // Get cart items
    const cartResult = await client.query(
      `
      SELECT
        c.product_id,
        c.quantity,
        p.price
      FROM carts c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    const cartItems = cartResult.rows;
    console.log("Cart Items:", cartItems);

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    let totalPrice = 0;
    for (const item of cartItems) {
      totalPrice += Number(item.price) * item.quantity;
    }

    console.log("Total Price:", totalPrice);

    // Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        user_id,
        total_price,
        payment_method,
        payment_status,
        order_status
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [userId, totalPrice, "telebirr", "pending", "pending"]
    );

    const order = orderResult.rows[0];
    console.log("Order Created:", order);

    // Create order items
    for (const item of cartItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES ($1,$2,$3,$4)
        `,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query("DELETE FROM carts WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created",
      orderId: order.id,
      totalPrice,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    res.status(500).json({ message: "Server Error" });
  } finally {
    client.release();
  }
});

export default router;

import express from "express";
import pool from "../config/db.js";
import protect from "../middleware/auth.js";
const router = express.Router();

//print for this user
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.query;
    let numberPage = Number(page);
    let numberLimit = Number(limit);

    let userValue = req.user.id;

    const offset = (numberPage - 1) * numberLimit;

    let countQuery = `select count(*) as total from products`;
    let query = "select * from products ";
    const values = [];

    values.push(userValue);
    countQuery += ` where seller_id = $${values.length}`;
    query += ` where seller_id=$${values.length}`;

    values.push(numberLimit, offset);
    query += ` order by created_at desc limit $${values.length - 1} offset $${values.length}`;

    const totalResult = await pool.query(
      countQuery,
      values.slice(0, values.length - 2),
    );

    const total = Number(totalResult.rows[0].total);

    const products = await pool.query(query, values);
    res.status(200).json({
      products: products.rows,
      totalPages: Math.ceil(total / numberLimit) || 1,
    });
    console.log(products.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//adding
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !image || !category || !price) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    // const numberPrice = Number(price);
    const seller = await pool.query(
      `insert into products(name,description,price,image,category,seller_id) values($1,$2,$3,$4,$5,$6) returning *`,
      [name, description, Number(price), image, category, req.user.id],
    );

    res.status(201).json({
      message: "Product added successfully",
      product: {
        name: seller.rows[0].name,
        description: seller.rows[0].description,
        // price: seller.rows[0].numberPrice,
        image: seller.rows[0].image,
        category: seller.rows[0].category,
      },
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({ message: error.message });
  }
});

//edit
router.put("/update/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !image || !category || !price) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const checking = await pool.query(
      "select * from products where id=$1 and seller_id=$2",
      [id, req.user.id],
    );
    if (checking.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const products = await pool.query(
      `update products set name=$1,description=$2,price=$3,image=$4,category=$5 where id=$6 returning *`,
      [name, description, price, image, category, id],
    );
    res.status(200).json({
      message: "Product updated successfully",
      product: {
        name: products.rows[0].name,
        description: products.rows[0].description,
        price: products.rows[0].price,
        image: products.rows[0].image,
        category: products.rows[0].category,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const checkProduct = await pool.query(
      "select * from products where id=$1 and seller_id=$2",
      [id, req.user.id],
    );
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    await pool.query("delete from products where id=$1", [id]);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

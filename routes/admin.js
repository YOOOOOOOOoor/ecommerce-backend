import express from "express";
import protect from "../middleware/auth.js";
import pool from "../config/db.js";

const router = express.Router();

//check Admin
const checkAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "admin" &&
    req.user.email === "dDwM7@example.com"
  ) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
////////////////////////////////////////
///////                         ///////
////       Products            ////
/////                         /////////
/////////////////////////////////////

//List all products

router.get("/products", protect, checkAdmin, async (req, res) => {
  try {
    const products = await pool.query(
      "select users.name as seller_name, products.* from users join products on users.id = products.seller_id",
    );
    res.status(200).json(products.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update
router.put("/products/update/:id", protect, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !image || !category || !price) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const checking = await pool.query("select * from products where id=$1", [
      id,
    ]);
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
router.delete("/products/delete/:id", protect, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const checkID = await pool.query("select * from products where id=$1", [
      id,
    ]);
    if (checkID.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    await pool.query("delete from products where id=$1", [id]);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error.message);
  }
});

//adding
router.post("/products/add", protect, checkAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !image || !category || !price) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const result = await pool.query(
      "INSERT INTO products (name, description, price, image, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, price, image, category],
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

////////////////////////////////////////
///////                         ///////
////       users            ////
/////                         /////////
/////////////////////////////////////

//all users

router.get("/users", protect, checkAdmin, async (req, res) => {
  try {
    const users = await pool.query("select * from users");
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/delete/:id", protect, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const checkID = await pool.query("select * from users where id=$1", [id]);
    if (checkID.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await pool.query("delete from users where id=$1", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
  }
});

export default router;

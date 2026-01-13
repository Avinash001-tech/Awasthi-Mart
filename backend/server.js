const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE (Render health check)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Product model
const Product = require("./models/product");

// Admin credentials
const ADMIN = { username: "admin", password: "1234" };

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Multer setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Add product
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: "/uploads/" + req.file.filename
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get products
app.get("/api/products", async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  const products = await Product.find(filter);
  res.json(products);
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => {
    console.log("MongoDB Connection Failed ❌");
    console.error(err.message);
  });


// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT} 🚀`);
});

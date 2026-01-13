const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend folder
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Serve each frontend page explicitly
app.get("/index.html", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(frontendPath, "login.html")));
app.get("/admin.html", (req, res) => res.sendFile(path.join(frontendPath, "admin.html")));

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

// Multer setup for image upload
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
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get products (optionally filter by category)
app.get("/api/products", async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Start server
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT} 🚀`);
});


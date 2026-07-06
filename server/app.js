const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const contractRoutes = require("./routes/contractRoutes");
app.use("/api/contracts", contractRoutes);

const assetTokenRoutes = require("./routes/assetTokenRoutes");
app.use("/api/tokens", assetTokenRoutes);

app.get("/", (req, res) => {
    res.send("API CosechaDirecta funcionando 🚀");
});

module.exports = app;
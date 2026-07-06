const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrdersAgricultor,
  getOrdersComercio,
  updateOrderStatus
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

// comercio
router.post("/", protect, createOrder);
router.get("/comercio", protect, getOrdersComercio);

// agricultor
router.get("/agricultor", protect, getOrdersAgricultor);
router.put("/:id", protect, updateOrderStatus);

module.exports = router;
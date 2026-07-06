const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getMyProducts,
  deleteProduct
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');

// públicas
router.get('/', getAllProducts);

// protegidas
router.get('/me', protect, getMyProducts);
router.post('/', protect, createProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
const Product = require('../models/Product');

// Crear producto agrícola
const createProduct = async (req, res) => {
  try {
    const { nombre, cantidad, precioKg, ubicacion } = req.body;

    if (!nombre || !cantidad || !precioKg || !ubicacion) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const product = await Product.create({
      nombre,
      cantidad,
      precioKg,
      ubicacion,
      agricultor: req.user.id
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('agricultor', 'nombre email');

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener productos del agricultor logueado
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ agricultor: req.user.id });
    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await product.deleteOne();

    res.json({ message: 'Producto eliminado' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getMyProducts,
  deleteProduct
};
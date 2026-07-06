const Order = require("../models/Order");
const Product = require("../models/Product");

// CREAR PEDIDO (COMERCIO)
const createOrder = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    const product = await Product.findById(productoId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const order = await Order.create({
      producto: product._id,
      comercio: req.user.id,
      agricultor: product.agricultor,
      cantidad
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PEDIDOS DEL AGRICULTOR
const getOrdersAgricultor = async (req, res) => {
  try {
    const orders = await Order.find({ agricultor: req.user.id })
      .populate("producto")
      .populate("comercio", "nombre email");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PEDIDOS DEL COMERCIO
const getOrdersComercio = async (req, res) => {
  try {
    const orders = await Order.find({ comercio: req.user.id })
      .populate("producto")
      .populate("agricultor", "nombre email");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACTUALIZAR ESTADO (AGRICULTOR)
const updateOrderStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const order = await Order.findById(req.params.id).populate("producto");

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (order.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Si se acepta, descontar del inventario
    if (estado === "aceptado") {
      const product = await Product.findById(order.producto._id);

      if (product.cantidad < order.cantidad) {
        return res.status(400).json({ message: "Stock insuficiente" });
      }

      product.cantidad -= order.cantidad;
      if (product.cantidad === 0) {
        product.estado = "vendido";
      }
      await product.save();
    }

    order.estado = estado;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrdersAgricultor,
  getOrdersComercio,
  updateOrderStatus
};
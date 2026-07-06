const Order = require("../models/Order");
const Product = require("../models/Product");
const AssetToken = require("../models/AssetToken");

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

    // Si se acepta, descontar del inventario y dividir token
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

      // Buscar token disponible del producto para dividirlo automáticamente
      const token = await AssetToken.findOne({
        producto: order.producto._id,
        estado: "Disponible",
        propietario: order.agricultor
      });

      if (token) {
        if (order.cantidad >= token.cantidad) {
          // Transferir el token completo al comercio
          token.propietario = order.comercio;
          token.estado = "Vendido";
          token.historial.push({
            accion: `Transferido a ${order.comercio} por pedido`,
            usuario: order.agricultor,
            fecha: new Date()
          });
          await token.save();
        } else {
          // Dividir token: una parte para el comercio, el resto para el agricultor
          const indexHijos = await AssetToken.countDocuments({ padre: token._id });

          function generarCodigoHijo(codigoPadre, index) {
            const letra = String.fromCharCode(65 + index);
            if (/[A-Z]$/.test(codigoPadre)) {
              return `${codigoPadre}-${index + 1}`;
            }
            return `${codigoPadre}${letra}`;
          }

          const codigoComercio = generarCodigoHijo(token.codigo, indexHijos);
          const codigoAgricultor = generarCodigoHijo(token.codigo, indexHijos + 1);

          const cantidadOriginal = token.cantidad;
          token.cantidad = order.cantidad;
          token.estado = "Dividido";
          token.historial.push({
            accion: `Dividido automáticamente por pedido`,
            usuario: order.agricultor,
            fecha: new Date()
          });
          await token.save();

          await AssetToken.create({
            codigo: codigoComercio,
            producto: token.producto,
            nombreActivo: token.nombreActivo,
            cantidad: order.cantidad,
            propietario: order.comercio,
            estado: "Vendido",
            padre: token._id,
            historial: [{
              accion: `Creado por compra de ${order.cantidad} kg`,
              usuario: order.comercio,
              fecha: new Date()
            }]
          });

          await AssetToken.create({
            codigo: codigoAgricultor,
            producto: token.producto,
            nombreActivo: token.nombreActivo,
            cantidad: cantidadOriginal - order.cantidad,
            propietario: order.agricultor,
            padre: token._id,
            historial: [{
              accion: `Remanente tras venta de ${order.cantidad} kg`,
              usuario: order.agricultor,
              fecha: new Date()
            }]
          });
        }
      }
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
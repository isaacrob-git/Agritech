const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Contract = require("../models/Contract");
const AssetToken = require("../models/AssetToken");
const Trip = require("../models/Trip");
const Financing = require("../models/Financing");
const bcrypt = require("bcrypt");

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, "codigo nombre email rol createdAt");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductos = async (req, res) => {
  try {
    const productos = await Product.find().populate("agricultor", "nombre email codigo");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPedidos = async (req, res) => {
  try {
    const pedidos = await Order.find()
      .populate("producto")
      .populate("comercio", "nombre email codigo")
      .populate("agricultor", "nombre email codigo")
      .populate({ path: "viaje", populate: { path: "transportista", select: "nombre" } });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContratos = async (req, res) => {
  try {
    const contratos = await Contract.find()
      .populate("comercio", "nombre email codigo")
      .populate("agricultor", "nombre email codigo")
      .populate("historial.usuario", "nombre")
      .populate("token");
    res.json(contratos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTokens = async (req, res) => {
  try {
    const tokens = await AssetToken.find()
      .populate("producto")
      .populate("contrato")
      .populate("propietario", "nombre email codigo")
      .populate("historial.usuario", "nombre");
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getViajes = async (req, res) => {
  try {
    const viajes = await Trip.find()
      .populate("agricultor", "nombre email codigo")
      .populate("transportista", "nombre email codigo")
      .populate({
        path: "pedidos",
        populate: [
          { path: "producto", select: "nombre" },
          { path: "comercio", select: "nombre" }
        ]
      })
      .populate("tracking.actualizadoPor", "nombre");
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFinanciamientos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.estado) filter.estado = req.query.estado;

    const list = await Financing.find(filter)
      .populate("agricultor", "nombre email codigo")
      .populate({
        path: "token",
        populate: [
          { path: "producto", select: "nombre" },
          { path: "contrato", select: "nombreProducto" }
        ]
      })
      .populate("historial.usuario", "nombre");
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ EDITAR ============

const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, rol } = req.body;
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (email !== undefined) update.email = email;
    if (rol !== undefined) {
      if (!["agricultor", "comercio", "transportista", "admin"].includes(rol)) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      update.rol = rol;
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 4 caracteres" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { nombre, precioKg, estado } = req.body;
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (precioKg !== undefined) update.precioKg = precioKg;
    if (estado !== undefined) {
      if (!["disponible", "vendido"].includes(estado)) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      update.estado = estado;
    }
    const p = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto actualizado", product: p });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!["pendiente", "aceptado", "rechazado", "en_transporte", "entregado", "cancelado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    const o = await Order.findByIdAndUpdate(req.params.id, { estado }, { new: true, runValidators: true });
    if (!o) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json({ message: "Pedido actualizado", order: o });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarContrato = async (req, res) => {
  try {
    const { estado, precioAcordado } = req.body;
    const update = { $push: { historial: { accion: "Actualizado por administrador", usuario: req.user.id, fecha: new Date() } } };
    if (estado !== undefined) {
      const validos = ["pendiente", "activo", "en_produccion", "en_transporte", "entregado", "finalizado", "rechazado", "cancelado"];
      if (!validos.includes(estado)) return res.status(400).json({ message: "Estado inválido" });
      if (!update.$set) update.$set = {};
      update.$set.estado = estado;
    }
    if (precioAcordado !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.precioAcordado = precioAcordado;
    }
    const c = await Contract.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ message: "Contrato no encontrado" });
    res.json({ message: "Contrato actualizado", contract: c });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarToken = async (req, res) => {
  try {
    const { estado, nombreActivo, financiado } = req.body;
    const update = { $push: { historial: { accion: "Actualizado por administrador", usuario: req.user.id, fecha: new Date() } } };
    if (estado !== undefined) {
      if (!["Disponible", "Vendido", "Transferido", "Dividido", "Cancelado"].includes(estado)) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      if (!update.$set) update.$set = {};
      update.$set.estado = estado;
    }
    if (nombreActivo !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.nombreActivo = nombreActivo;
    }
    if (financiado !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.financiado = financiado === true || financiado === "true";
    }
    const t = await AssetToken.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: "Token no encontrado" });
    res.json({ message: "Token actualizado", token: t });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarViaje = async (req, res) => {
  try {
    const { estado, pago } = req.body;
    const update = {};
    if (estado !== undefined) {
      const validos = ["pendiente", "asignado", "carga_recogida", "en_camino", "llegó_a_destino", "entregado", "cancelado"];
      if (!validos.includes(estado)) return res.status(400).json({ message: "Estado inválido" });
      update.estado = estado;
    }
    if (pago !== undefined) update.pago = pago;
    const t = await Trip.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: "Viaje no encontrado" });
    res.json({ message: "Viaje actualizado", trip: t });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const actualizarFinanciamiento = async (req, res) => {
  try {
    const { estado, montoSolicitado, plazoDias } = req.body;
    const update = { $push: { historial: { accion: "Actualizado por administrador", usuario: req.user.id, fecha: new Date() } } };
    if (estado !== undefined) {
      if (!["pendiente", "aprobado", "rechazado", "pagado"].includes(estado)) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      if (!update.$set) update.$set = {};
      update.$set.estado = estado;
    }
    if (montoSolicitado !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.montoSolicitado = montoSolicitado;
    }
    if (plazoDias !== undefined) {
      if (!update.$set) update.$set = {};
      update.$set.plazoDias = plazoDias;
    }
    const f = await Financing.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!f) return res.status(404).json({ message: "Financiamiento no encontrado" });
    res.json({ message: "Financiamiento actualizado", financing: f });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ELIMINAR (soft delete) ============

const eliminarUsuario = async (req, res) => {
  try {
    const id = req.params.id;

    const productos = await Product.countDocuments({ agricultor: id, estado: "disponible" });
    const pedidos = await Order.countDocuments({ agricultor: id, estado: { $in: ["pendiente", "aceptado", "en_transporte"] } });
    const contratos = await Contract.countDocuments({ agricultor: id, estado: { $nin: ["finalizado", "cancelado", "rechazado"] } });
    const tokens = await AssetToken.countDocuments({ propietario: id, estado: "Disponible" });

    const user = await User.findByIdAndUpdate(id, { rol: "inactivo" }, { new: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      message: "Usuario desactivado (rol → inactivo)",
      dependencias: { productos, pedidos, contratos, tokens }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const id = req.params.id;

    const pedidosActivos = await Order.countDocuments({ producto: id, estado: { $in: ["pendiente", "aceptado"] } });
    const tokensActivos = await AssetToken.countDocuments({ producto: id, estado: "Disponible" });

    if (pedidosActivos > 0 || tokensActivos > 0) {
      return res.status(400).json({
        message: "No se puede eliminar: tiene pedidos o tokens activos",
        pedidosActivos,
        tokensActivos
      });
    }

    const p = await Product.findByIdAndDelete(id);
    if (!p) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado permanentemente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarPedido = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    if (order.viaje) {
      await Trip.findByIdAndUpdate(order.viaje, { $pull: { pedidos: id } });
    }

    order.estado = "cancelado";
    order.viaje = null;
    await order.save();

    res.json({ message: "Pedido cancelado y desvinculado del viaje" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarContrato = async (req, res) => {
  try {
    const id = req.params.id;
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: "Contrato no encontrado" });

    contract.estado = "cancelado";
    contract.historial.push({ accion: "Cancelado por administrador", usuario: req.user.id, fecha: new Date() });
    await contract.save();

    res.json({ message: "Contrato cancelado", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarToken = async (req, res) => {
  try {
    const id = req.params.id;
    const token = await AssetToken.findById(id);
    if (!token) return res.status(404).json({ message: "Token no encontrado" });

    const hijos = await AssetToken.countDocuments({ padre: id });
    if (hijos > 0) {
      return res.status(400).json({ message: `El token tiene ${hijos} token(s) hijo(s). Elimínelos primero.` });
    }

    const contratosActivos = await Contract.countDocuments({ token: id, estado: { $nin: ["finalizado", "cancelado", "rechazado"] } });
    if (contratosActivos > 0) {
      return res.status(400).json({ message: `El token está referenciado en ${contratosActivos} contrato(s) activo(s).` });
    }

    const financsActivos = await Financing.countDocuments({ token: id });
    if (financsActivos > 0) {
      return res.status(400).json({ message: `El token está referenciado en ${financsActivos} financiamiento(s). Elimínelos primero.` });
    }

    await AssetToken.findByIdAndDelete(id);
    res.json({ message: "Token eliminado permanentemente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarViaje = async (req, res) => {
  try {
    const id = req.params.id;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    await Order.updateMany({ _id: { $in: trip.pedidos } }, { viaje: null, estado: "aceptado" });
    await Trip.findByIdAndDelete(id);

    res.json({ message: "Viaje eliminado. Pedidos desvinculados y devueltos a aceptado." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const eliminarFinanciamiento = async (req, res) => {
  try {
    const f = await Financing.findByIdAndDelete(req.params.id);
    if (!f) return res.status(404).json({ message: "Financiamiento no encontrado" });
    res.json({ message: "Financiamiento eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsuarios, getProductos, getPedidos, getContratos, getTokens, getViajes, getFinanciamientos,
  actualizarUsuario, actualizarPassword, actualizarProducto, actualizarPedido,
  actualizarContrato, actualizarToken, actualizarViaje, actualizarFinanciamiento,
  eliminarUsuario, eliminarProducto, eliminarPedido, eliminarContrato,
  eliminarToken, eliminarViaje, eliminarFinanciamiento
};

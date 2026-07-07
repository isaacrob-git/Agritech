const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Contract = require("../models/Contract");
const AssetToken = require("../models/AssetToken");
const Trip = require("../models/Trip");
const Financing = require("../models/Financing");

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

module.exports = {
  getUsuarios,
  getProductos,
  getPedidos,
  getContratos,
  getTokens,
  getViajes,
  getFinanciamientos
};

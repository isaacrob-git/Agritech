const Financing = require("../models/Financing");
const AssetToken = require("../models/AssetToken");
const Product = require("../models/Product");

const solicitar = async (req, res) => {
  try {
    const { tokenId, montoSolicitado, plazoDias } = req.body;

    const token = await AssetToken.findById(tokenId).populate("producto").populate("contrato");

    if (!token) {
      return res.status(404).json({ message: "Token no encontrado" });
    }

    if (token.propietario.toString() !== req.user.id) {
      return res.status(403).json({ message: "No eres el propietario del token" });
    }

    if (token.estado !== "Disponible") {
      return res.status(400).json({ message: "El token debe estar disponible" });
    }

    const yaFinanciado = await Financing.findOne({
      token: tokenId,
      estado: "aprobado"
    });

    if (yaFinanciado) {
      return res.status(400).json({ message: "Este token ya tiene un financiamiento activo" });
    }

    const valorEstimado = token.cantidad * (token.producto?.precioKg || token.contrato?.precioAcordado || 0);

    const financing = await Financing.create({
      agricultor: req.user.id,
      token: token._id,
      valorEstimado,
      montoSolicitado,
      plazoDias,
      historial: [
        {
          accion: "Solicitado",
          usuario: req.user.id,
          fecha: new Date()
        }
      ]
    });

    res.status(201).json(financing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMisFinanciamientos = async (req, res) => {
  try {
    const list = await Financing.find({ agricultor: req.user.id })
      .populate({
        path: "token",
        populate: [
          { path: "producto", select: "nombre" },
          { path: "contrato", select: "nombreProducto cantidadKg precioAcordado" }
        ]
      });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendientes = async (req, res) => {
  try {
    const list = await Financing.find({ estado: "pendiente" })
      .populate("agricultor", "nombre email codigo")
      .populate({
        path: "token",
        populate: [
          { path: "producto", select: "nombre" },
          { path: "contrato", select: "nombreProducto cantidadKg precioAcordado" }
        ]
      });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const aprobar = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);

    if (!financing) {
      return res.status(404).json({ message: "Financiamiento no encontrado" });
    }

    if (financing.estado !== "pendiente") {
      return res.status(400).json({ message: "Solo se pueden aprobar solicitudes pendientes" });
    }

    financing.estado = "aprobado";
    financing.historial.push({
      accion: "Aprobado",
      usuario: req.user.id,
      fecha: new Date()
    });
    await financing.save();

    const token = await AssetToken.findById(financing.token);
    if (token) {
      token.financiado = true;
      token.historial.push({
        accion: "Comprometido como garantía de financiamiento aprobado",
        usuario: req.user.id,
        fecha: new Date()
      });
      await token.save();
    }

    res.json(financing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);

    if (!financing) {
      return res.status(404).json({ message: "Financiamiento no encontrado" });
    }

    if (financing.estado !== "pendiente") {
      return res.status(400).json({ message: "Solo se pueden rechazar solicitudes pendientes" });
    }

    financing.estado = "rechazado";
    financing.historial.push({
      accion: "Rechazado",
      usuario: req.user.id,
      fecha: new Date()
    });
    await financing.save();

    res.json(financing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  solicitar,
  getMisFinanciamientos,
  getPendientes,
  aprobar,
  rechazar
};

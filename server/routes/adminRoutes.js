const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getUsuarios,
  getProductos,
  getPedidos,
  getContratos,
  getTokens,
  getViajes,
  getFinanciamientos
} = require("../controllers/adminController");

const adminCheck = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
};

router.use(protect, adminCheck);

router.get("/usuarios", getUsuarios);
router.get("/productos", getProductos);
router.get("/pedidos", getPedidos);
router.get("/contratos", getContratos);
router.get("/tokens", getTokens);
router.get("/viajes", getViajes);
router.get("/financiamientos", getFinanciamientos);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getUsuarios, getProductos, getPedidos, getContratos, getTokens, getViajes, getFinanciamientos,
  actualizarUsuario, actualizarPassword, actualizarProducto, actualizarPedido,
  actualizarContrato, actualizarToken, actualizarViaje, actualizarFinanciamiento,
  eliminarUsuario, eliminarProducto, eliminarPedido, eliminarContrato,
  eliminarToken, eliminarViaje, eliminarFinanciamiento
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

router.put("/usuarios/:id", actualizarUsuario);
router.put("/usuarios/:id/password", actualizarPassword);
router.put("/productos/:id", actualizarProducto);
router.put("/pedidos/:id", actualizarPedido);
router.put("/contratos/:id", actualizarContrato);
router.put("/tokens/:id", actualizarToken);
router.put("/viajes/:id", actualizarViaje);
router.put("/financiamientos/:id", actualizarFinanciamiento);

router.delete("/usuarios/:id", eliminarUsuario);
router.delete("/productos/:id", eliminarProducto);
router.delete("/pedidos/:id", eliminarPedido);
router.delete("/contratos/:id", eliminarContrato);
router.delete("/tokens/:id", eliminarToken);
router.delete("/viajes/:id", eliminarViaje);
router.delete("/financiamientos/:id", eliminarFinanciamiento);

module.exports = router;

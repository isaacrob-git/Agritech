const express = require("express");
const router = express.Router();

const {
  crear,
  getDisponibles,
  getMisViajes,
  getMisPedidosViajes,
  asignar,
  actualizarEstado,
  getById
} = require("../controllers/tripController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, crear);
router.get("/disponibles", protect, getDisponibles);
router.get("/mis-viajes", protect, getMisViajes);
router.get("/mis-pedidos", protect, getMisPedidosViajes);
router.get("/:id", protect, getById);
router.put("/:id/asignar", protect, asignar);
router.put("/:id/estado", protect, actualizarEstado);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  crear,
  getContratosComercio,
  getContratosAgricultor,
  getContratoById,
  aceptar,
  rechazar,
  avanzarEstado,
  cancelar
} = require("../controllers/contractController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, crear);
router.get("/comercio", protect, getContratosComercio);
router.get("/agricultor", protect, getContratosAgricultor);
router.get("/:id", protect, getContratoById);
router.put("/:id/aceptar", protect, aceptar);
router.put("/:id/rechazar", protect, rechazar);
router.put("/:id/estado", protect, avanzarEstado);
router.put("/:id/cancelar", protect, cancelar);

module.exports = router;

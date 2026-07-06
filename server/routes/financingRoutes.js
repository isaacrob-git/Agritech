const express = require("express");
const router = express.Router();

const {
  solicitar,
  getMisFinanciamientos,
  getPendientes,
  aprobar,
  rechazar
} = require("../controllers/financingController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, solicitar);
router.get("/", protect, getMisFinanciamientos);
router.get("/pendientes", protect, getPendientes);
router.put("/:id/aprobar", protect, aprobar);
router.put("/:id/rechazar", protect, rechazar);

module.exports = router;

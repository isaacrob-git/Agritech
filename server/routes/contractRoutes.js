const express = require("express");
const router = express.Router();

const {
  createContract,
  getContractsComercio,
  getContractsAgricultor,
  updateContractStatus
} = require("../controllers/contractController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createContract);
router.get("/comercio", protect, getContractsComercio);
router.get("/agricultor", protect, getContractsAgricultor);
router.put("/:id", protect, updateContractStatus);

module.exports = router;

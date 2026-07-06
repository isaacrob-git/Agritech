const express = require("express");
const router = express.Router();

const {
  generateToken,
  getMyTokens,
  getTokenByCode,
  getAllTokens,
  splitToken,
  updateTokenStatus
} = require("../controllers/assetTokenController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllTokens);
router.post("/generate", protect, generateToken);
router.get("/mis-tokens", protect, getMyTokens);
router.get("/:codigo", getTokenByCode);
router.put("/:id/estado", protect, updateTokenStatus);
router.post("/:id/split", protect, splitToken);

module.exports = router;

const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    agricultor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comercio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    cantidadKg: {
      type: Number,
      required: true
    },
    precioAcordado: {
      type: Number,
      required: true
    },
    fechaEntrega: {
      type: Date,
      required: true
    },
    estado: {
      type: String,
      enum: ["activo", "completado", "cancelado"],
      default: "activo"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);

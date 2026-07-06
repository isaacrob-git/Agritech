const mongoose = require("mongoose");

const assetTokenSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true
    },
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    nombreActivo: {
      type: String,
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    unidad: {
      type: String,
      default: "kg"
    },
    propietario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    padre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetToken",
      default: null
    },
    estado: {
      type: String,
      enum: ["Disponible", "Vendido", "Transferido", "Dividido", "Cancelado"],
      default: "Disponible"
    },
    historial: [
      {
        accion: String,
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        fecha: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetToken", assetTokenSchema);

const mongoose = require("mongoose");

const financingSchema = new mongoose.Schema(
  {
    agricultor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetToken",
      required: true
    },
    valorEstimado: {
      type: Number,
      required: true
    },
    montoSolicitado: {
      type: Number,
      required: true
    },
    interes: {
      type: Number,
      default: 5
    },
    plazoDias: {
      type: Number,
      required: true
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado", "pagado"],
      default: "pendiente"
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

module.exports = mongoose.model("Financing", financingSchema);

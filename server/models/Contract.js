const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true
    },
    comercio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    agricultor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    nombreProducto: {
      type: String,
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
      enum: [
        "pendiente", "activo", "en_produccion",
        "en_transporte", "entregado", "finalizado",
        "rechazado", "cancelado"
      ],
      default: "pendiente"
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetToken",
      default: null
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

module.exports = mongoose.model("Contract", contractSchema);

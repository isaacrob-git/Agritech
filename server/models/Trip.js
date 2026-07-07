const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true
    },
    agricultor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    transportista: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    origen: {
      type: String,
      required: true
    },
    destino: {
      type: String,
      required: true
    },
    cargaTotalKg: {
      type: Number,
      required: true
    },
    pago: {
      type: Number,
      required: true
    },
    pedidos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }],
    estado: {
      type: String,
      enum: [
        "pendiente", "asignado", "carga_recogida",
        "en_camino", "llegó_a_destino", "entregado", "cancelado"
      ],
      default: "pendiente"
    },
    tracking: [{
      estado: String,
      fecha: { type: Date, default: Date.now },
      ubicacion: String,
      actualizadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);

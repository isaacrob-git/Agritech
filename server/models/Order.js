const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
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

    cantidad: {
      type: Number,
      required: true
    },

    estado: {
      type: String,
      enum: ["pendiente", "aceptado", "rechazado", "en_transporte", "entregado"],
      default: "pendiente"
    },

    viaje: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
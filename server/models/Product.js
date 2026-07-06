const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    precioKg: {
      type: Number,
      required: true
    },
    ubicacion: {
      type: String,
      required: true
    },
    agricultor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    estado: {
      type: String,
      enum: ['disponible', 'vendido'],
      default: 'disponible'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    rol: {
        type: String,
        enum: ["agricultor", "comercio", "transportista", "admin"],
        default: "comercio"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/cosechadirecta");

        console.log("MongoDB conectado 🍃");
    } catch (error) {
        console.log("Error conexión MongoDB:", error.message);
    }
};

module.exports = connectDB;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// REGISTRO
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const userCount = await User.countDocuments();
    const codigo = `USR-${String(userCount + 1).padStart(4, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      codigo,
      nombre,
      email,
      password: hashedPassword,
      rol
    });

    res.status(201).json({
      message: "Usuario creado",
      user: {
        id: user._id,
        codigo: user.codigo,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        codigo: user.codigo,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login
};
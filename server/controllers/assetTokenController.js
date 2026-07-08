const AssetToken = require("../models/AssetToken");
const Product = require("../models/Product");

const generateToken = async (req, res) => {
  try {
    const { productoId } = req.body;

    const product = await Product.findById(productoId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Solo el agricultor puede tokenizar su producto" });
    }

    const count = await AssetToken.countDocuments();
    const codigo = `AG-${String(count + 1).padStart(4, "0")}`;

    const token = await AssetToken.create({
      codigo,
      producto: product._id,
      nombreActivo: `Cosecha de ${product.nombre}`,
      cantidad: product.cantidad,
      propietario: req.user.id,
      historial: [
        {
          accion: "Creado",
          usuario: req.user.id,
          fecha: new Date()
        }
      ]
    });

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTokens = async (req, res) => {
  try {
    const tokens = await AssetToken.find({ propietario: req.user.id, estado: { $ne: "Cancelado" } })
      .populate("producto")
      .populate("contrato")
      .populate("propietario", "nombre email");

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTokenByCode = async (req, res) => {
  try {
    const token = await AssetToken.findOne({ codigo: req.params.codigo })
      .populate("producto")
      .populate("propietario", "nombre email")
      .populate("historial.usuario", "nombre");

    if (!token) {
      return res.status(404).json({ message: "Token no encontrado" });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTokens = async (req, res) => {
  try {
    const tokens = await AssetToken.find({ estado: "Disponible" })
      .populate("producto")
      .populate("propietario", "nombre email");

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generarCodigoHijo(codigoPadre, index) {
  const letra = String.fromCharCode(65 + index);
  if (/[A-Z]$/.test(codigoPadre)) {
    return `${codigoPadre}-${index + 1}`;
  }
  return `${codigoPadre}${letra}`;
}

const splitToken = async (req, res) => {
  try {
    const { fracciones } = req.body;

    const token = await AssetToken.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: "Token no encontrado" });
    }

    if (token.estado !== "Disponible") {
      return res.status(400).json({ message: "Solo se puede dividir un token disponible" });
    }

    if (token.propietario.toString() !== req.user.id) {
      return res.status(403).json({ message: "Solo el propietario puede dividir el token" });
    }

    const sumaFracciones = fracciones.reduce((sum, f) => sum + f.cantidad, 0);

    if (sumaFracciones > token.cantidad) {
      return res.status(400).json({ message: "La suma de las fracciones excede la cantidad del token" });
    }

    token.estado = "Dividido";
    token.historial.push({
      accion: `Dividido en ${fracciones.length} fracciones`,
      usuario: req.user.id,
      fecha: new Date()
    });
    await token.save();

    const hijos = [];

    for (let i = 0; i < fracciones.length; i++) {
      const { cantidad, propietarioId } = fracciones[i];
      const codigo = generarCodigoHijo(token.codigo, i);

      const hijo = await AssetToken.create({
        codigo,
        producto: token.producto,
        nombreActivo: token.nombreActivo,
        cantidad,
        propietario: propietarioId || token.propietario,
        padre: token._id,
        historial: [
          {
            accion: `Creado por división de ${token.codigo}`,
            usuario: req.user.id,
            fecha: new Date()
          }
        ]
      });

      hijos.push(hijo);
    }

    res.status(201).json({ padre: token, hijos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTokenStatus = async (req, res) => {
  try {
    const { estado } = req.body;

    const token = await AssetToken.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: "Token no encontrado" });
    }

    token.estado = estado;
    token.historial.push({
      accion: `Estado cambiado a ${estado}`,
      usuario: req.user.id,
      fecha: new Date()
    });

    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateToken,
  getMyTokens,
  getTokenByCode,
  getAllTokens,
  splitToken,
  updateTokenStatus
};

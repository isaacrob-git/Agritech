const Contract = require("../models/Contract");
const AssetToken = require("../models/AssetToken");

const crear = async (req, res) => {
  try {
    const { agricultorId, nombreProducto, cantidadKg, precioAcordado, fechaEntrega } = req.body;

    const count = await Contract.countDocuments();
    const codigo = `CT-${String(count + 1).padStart(3, "0")}`;

    const contract = await Contract.create({
      codigo,
      comercio: req.user.id,
      agricultor: agricultorId,
      nombreProducto,
      cantidadKg,
      precioAcordado,
      fechaEntrega,
      historial: [
        {
          accion: "Creado",
          usuario: req.user.id,
          fecha: new Date()
        }
      ]
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContratosComercio = async (req, res) => {
  try {
    const contracts = await Contract.find({ comercio: req.user.id })
      .populate("agricultor", "nombre email codigo")
      .populate("historial.usuario", "nombre")
      .populate("token");

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContratosAgricultor = async (req, res) => {
  try {
    const contracts = await Contract.find({ agricultor: req.user.id })
      .populate("comercio", "nombre email codigo")
      .populate("historial.usuario", "nombre")
      .populate("token");

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContratoById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("comercio", "nombre email codigo")
      .populate("agricultor", "nombre email codigo")
      .populate("historial.usuario", "nombre")
      .populate("token");

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const aceptar = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    if (contract.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: "No eres el agricultor de este contrato" });
    }

    if (contract.estado !== "pendiente") {
      return res.status(400).json({ message: "Solo se pueden aceptar contratos pendientes" });
    }

    contract.estado = "activo";
    contract.historial.push({
      accion: "Aceptado",
      usuario: req.user.id,
      fecha: new Date()
    });

    // Generar token asociado al contrato
    const countTokens = await AssetToken.countDocuments();
    const codigoToken = `AG-CT-${String(countTokens + 1).padStart(3, "0")}`;

    const token = await AssetToken.create({
      codigo: codigoToken,
      nombreActivo: `Contrato: ${contract.nombreProducto} (${contract.codigo})`,
      cantidad: contract.cantidadKg,
      propietario: req.user.id,
      contrato: contract._id,
      historial: [
        {
          accion: `Creado por aceptación del contrato ${contract.codigo}`,
          usuario: req.user.id,
          fecha: new Date()
        }
      ]
    });

    contract.token = token._id;
    await contract.save();

    res.json({ contract, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    if (contract.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: "No eres el agricultor de este contrato" });
    }

    if (contract.estado !== "pendiente") {
      return res.status(400).json({ message: "Solo se pueden rechazar contratos pendientes" });
    }

    contract.estado = "rechazado";
    contract.historial.push({
      accion: "Rechazado",
      usuario: req.user.id,
      fecha: new Date()
    });
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const avanzarEstado = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    if (contract.agricultor.toString() !== req.user.id) {
      return res.status(403).json({ message: "No eres el agricultor de este contrato" });
    }

    const workflow = ["activo", "en_produccion", "en_transporte", "entregado", "finalizado"];
    const idx = workflow.indexOf(contract.estado);

    if (idx === -1 || idx >= workflow.length - 1) {
      return res.status(400).json({ message: "No se puede avanzar desde el estado actual" });
    }

    const targetState = req.body.estado;

    if (targetState) {
      const targetIdx = workflow.indexOf(targetState);
      if (targetIdx === -1 || targetIdx <= idx) {
        return res.status(400).json({ message: `Transición inválida a ${targetState} desde ${contract.estado}` });
      }
      contract.estado = targetState;
    } else {
      contract.estado = workflow[idx + 1];
    }

    contract.historial.push({
      accion: `Avanzado a ${contract.estado}`,
      usuario: req.user.id,
      fecha: new Date()
    });
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelar = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    const esComercio = contract.comercio.toString() === req.user.id;
    const esAgricultor = contract.agricultor.toString() === req.user.id;

    if (!esComercio && !esAgricultor) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (contract.estado === "finalizado" || contract.estado === "cancelado") {
      return res.status(400).json({ message: "El contrato ya está terminado" });
    }

    contract.estado = "cancelado";
    contract.historial.push({
      accion: "Cancelado",
      usuario: req.user.id,
      fecha: new Date()
    });
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crear,
  getContratosComercio,
  getContratosAgricultor,
  getContratoById,
  aceptar,
  rechazar,
  avanzarEstado,
  cancelar
};

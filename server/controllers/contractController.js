const Contract = require("../models/Contract");

const createContract = async (req, res) => {
  try {
    const { producto, agricultorId, cantidadKg, precioAcordado, fechaEntrega } = req.body;

    const contract = await Contract.create({
      producto,
      agricultor: agricultorId,
      comercio: req.user.id,
      cantidadKg,
      precioAcordado,
      fechaEntrega
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContractsComercio = async (req, res) => {
  try {
    const contracts = await Contract.find({ comercio: req.user.id })
      .populate("producto")
      .populate("agricultor", "nombre email");

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContractsAgricultor = async (req, res) => {
  try {
    const contracts = await Contract.find({ agricultor: req.user.id })
      .populate("producto")
      .populate("comercio", "nombre email");

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContractStatus = async (req, res) => {
  try {
    const { estado } = req.body;

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrato no encontrado" });
    }

    contract.estado = estado;
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createContract,
  getContractsComercio,
  getContractsAgricultor,
  updateContractStatus
};

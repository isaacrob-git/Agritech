const Trip = require("../models/Trip");
const Order = require("../models/Order");

const workflow = [
  "pendiente", "asignado", "carga_recogida",
  "en_camino", "llegó_a_destino", "entregado"
];

function validarTransicion(actual, nuevo) {
  if (nuevo === "cancelado") return true;
  const idxActual = workflow.indexOf(actual);
  const idxNuevo = workflow.indexOf(nuevo);
  return idxNuevo > idxActual;
}

async function actualizarPedidos(trip, nuevoEstado) {
  if (nuevoEstado === "carga_recogida") {
    await Order.updateMany(
      { _id: { $in: trip.pedidos } },
      { estado: "en_transporte" }
    );
  } else if (nuevoEstado === "entregado") {
    await Order.updateMany(
      { _id: { $in: trip.pedidos } },
      { estado: "entregado" }
    );
  } else if (nuevoEstado === "cancelado") {
    await Order.updateMany(
      { _id: { $in: trip.pedidos } },
      { estado: "aceptado", viaje: null }
    );
  }
}

// CREAR VIAJE (agricultor)
const crear = async (req, res) => {
  try {
    const { pedidos, origen, destino, pago } = req.body;

    if (!pedidos || !pedidos.length) {
      return res.status(400).json({ message: "Debes incluir al menos un pedido" });
    }

    const orders = await Order.find({ _id: { $in: pedidos }, agricultor: req.user.id });

    if (orders.length !== pedidos.length) {
      return res.status(400).json({ message: "Algunos pedidos no existen o no te pertenecen" });
    }

    for (const o of orders) {
      if (o.estado !== "aceptado") {
        return res.status(400).json({ message: `El pedido ${o._id} no está aceptado` });
      }
      if (o.viaje) {
        return res.status(400).json({ message: `El pedido ${o._id} ya tiene un viaje asignado` });
      }
    }

    const cargaTotalKg = orders.reduce((sum, o) => sum + o.cantidad, 0);

    const count = await Trip.countDocuments();
    const codigo = `V-${String(count + 1).padStart(3, "0")}`;

    const trip = await Trip.create({
      codigo,
      agricultor: req.user.id,
      origen,
      destino,
      cargaTotalKg,
      pago,
      pedidos: orders.map(o => o._id),
      tracking: [{
        estado: "pendiente",
        fecha: new Date(),
        actualizadoPor: req.user.id
      }]
    });

    await Order.updateMany(
      { _id: { $in: orders.map(o => o._id) } },
      { viaje: trip._id }
    );

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VIAJES DISPONIBLES (transportista)
const getDisponibles = async (req, res) => {
  try {
    const trips = await Trip.find({ estado: "pendiente" })
      .populate("agricultor", "nombre email codigo")
      .populate("pedidos");

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MIS VIAJES (transportista)
const getMisViajes = async (req, res) => {
  try {
    const trips = await Trip.find({ transportista: req.user.id })
      .populate("agricultor", "nombre email codigo")
      .populate("pedidos");

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VIAJES DEL AGRICULTOR
const getMisPedidosViajes = async (req, res) => {
  try {
    const trips = await Trip.find({ agricultor: req.user.id })
      .populate("transportista", "nombre email codigo")
      .populate({
        path: "pedidos",
        populate: [
          { path: "producto", select: "nombre" },
          { path: "comercio", select: "nombre" }
        ]
      });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ASIGNAR VIAJE (transportista acepta)
const asignar = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (trip.estado !== "pendiente") {
      return res.status(400).json({ message: "Este viaje ya no está disponible" });
    }

    trip.transportista = req.user.id;
    trip.estado = "asignado";
    trip.tracking.push({
      estado: "asignado",
      fecha: new Date(),
      actualizadoPor: req.user.id
    });
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACTUALIZAR ESTADO / TRACKING (transportista)
const actualizarEstado = async (req, res) => {
  try {
    const { estado, ubicacion } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (!trip.transportista || trip.transportista.toString() !== req.user.id) {
      return res.status(403).json({ message: "No eres el transportista de este viaje" });
    }

    if (!validarTransicion(trip.estado, estado)) {
      return res.status(400).json({
        message: `No se puede cambiar de "${trip.estado}" a "${estado}"`
      });
    }

    trip.estado = estado;
    trip.tracking.push({
      estado,
      fecha: new Date(),
      ubicacion: ubicacion || "",
      actualizadoPor: req.user.id
    });

    await actualizarPedidos(trip, estado);
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DETALLE VIAJE
const getById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("agricultor", "nombre email codigo")
      .populate("transportista", "nombre email codigo")
      .populate({
        path: "pedidos",
        populate: [
          { path: "producto", select: "nombre cantidad precioKg" },
          { path: "comercio", select: "nombre email" },
          { path: "agricultor", select: "nombre" }
        ]
      })
      .populate("tracking.actualizadoPor", "nombre");

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  crear,
  getDisponibles,
  getMisViajes,
  getMisPedidosViajes,
  asignar,
  actualizarEstado,
  getById
};

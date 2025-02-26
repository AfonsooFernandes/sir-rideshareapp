import express from "express";
import Reservation from "../models/reservationModel.js"; 
import { ensureAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
  const { idBoleia, idPassageiro, nomePassageiro, lugaresReservados, custoTotal } = req.body;

  if (!idBoleia || !idPassageiro || !nomePassageiro || !lugaresReservados || !custoTotal) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const novaReserva = new Reservation({
      idBoleia,
      idPassageiro,
      nomePassageiro,
      lugaresReservados,
      custoTotal,
    });

    const reservaCriada = await novaReserva.save();
    res.status(201).json(reservaCriada);
  } catch (error) {
    console.error("Erro ao criar reserva:", error.message);
    res.status(500).json({ message: "Erro ao criar reserva." });
  }
});

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const reservas = await Reservation.find().populate("idBoleia").populate("idPassageiro");
    res.status(200).json(reservas);
  } catch (error) {
    console.error("Erro ao buscar reservas:", error.message);
    res.status(500).json({ message: "Erro ao buscar reservas." });
  }
});

export default router;
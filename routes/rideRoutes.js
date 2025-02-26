import express from "express";
import Ride from "../models/rideModel.js";
import { ensureAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
  const { nomeRota, descricao, contato, horarios, lugaresDisponiveis, custo, dataBoleia } = req.body;

  if (!nomeRota || !descricao || !contato || !horarios || !lugaresDisponiveis || !custo || !dataBoleia) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
      const newRide = new Ride({
          nomeRota,
          descricao,
          contato, 
          horarios: {
              horaPartida: horarios.horaPartida,
              horaRetorno: horarios.horaRetorno,
              pontoEncontro: horarios.pontoEncontro,
          },
          lugaresDisponiveis: parseInt(lugaresDisponiveis, 10),
          custo: parseFloat(parseFloat(custo).toFixed(2)),
          dataBoleia: new Date(dataBoleia),
          idMotorista: req.user._id,
      });

      const savedRide = await newRide.save();
      res.status(201).json(savedRide);
  } catch (error) {
      console.error("Erro ao criar a boleia:", error.message);
      res.status(500).json({ message: "Erro ao criar a boleia.", error: error.message });
  }
});

router.get("/test-auth", ensureAuthenticated, (req, res) => {
  res.json({ message: "Utilizador autenticado", user: req.user });
});

export default router;
import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    nomeRota: { type: String, required: true },
    descricao: { type: String, required: true },
    contato: { type: String, required: true },
    idMotorista: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    horarios: {
      horaPartida: { type: String, required: true },
      horaRetorno: { type: String, required: true },
      pontoEncontro: { type: String, required: true },
    },
    lugaresDisponiveis: { type: Number, required: true },
    custo: { type: String, required: true },
    dataBoleia: { type: Date, required: true }, 
    passageiros: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    idBoleia: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    idPassageiro: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nomePassageiro: { type: String, required: true },
    lugaresReservados: { type: Number, required: true },
    custoTotal: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
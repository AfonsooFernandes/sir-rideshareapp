import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userRoutes from './routes/userRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import User from './models/userModel.js';
import Ride from './models/rideModel.js';
import Reservation from './models/reservationModel.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        });
        await user.save();
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  res.redirect("http://localhost:3000/boleias");
});

app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);

app.post('/api/reservations', async (req, res) => {
  try {
    const { idBoleia, idPassageiro, nomePassageiro, lugaresReservados, custoTotal } = req.body;

    const newReservation = new Reservation({
      idBoleia,
      idPassageiro,
      nomePassageiro,
      lugaresReservados,
      custoTotal
    });

    await newReservation.save();

    const ride = await Ride.findById(idBoleia).lean();
    const reservations = await Reservation.find({ idBoleia });
    ride.reservations = reservations;

    io.emit('updateRide', ride);

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get("/api/rides", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rides = await Ride.find({ dataBoleia: { $gte: today } }).populate("passageiros", "name email").lean();
    const ridesWithReservations = await Promise.all(
      rides.map(async (ride) => {
        const reservations = await Reservation.find({ idBoleia: ride._id });
        return { ...ride, reservations };
      })
    );
    res.json(ridesWithReservations);
  } catch (error) {
    console.error("Failed to retrieve rides:", error);
    res.status(500).send("Internal Server Error");
  }
});

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
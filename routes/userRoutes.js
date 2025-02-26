import express from "express";
import { getAllUsers, registerUser, loginUser } from "../controllers/userController.js";
import { ensureAuthenticated } from "../middlewares/authMiddleware.js"; 
import User from '../models/userModel.js'; 


const router = express.Router();

router.get("/", ensureAuthenticated, getAllUsers);

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/me", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar utilizador:", error);
    res.status(500).json({ message: "Erro ao buscar utilizador" });
  }
});

export default router;
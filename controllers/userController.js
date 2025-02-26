import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar utilizadores", error: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilizador já existe!' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      user: { name: user.name, email: user.email, id: user._id }
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao registar utilizador", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao iniciar sessão" });
      }
      res.json({ message: 'Login bem-sucedido!', user: { name: user.name, email: user.email, id: user._id } });
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao fazer login", error: error.message });
  }
};
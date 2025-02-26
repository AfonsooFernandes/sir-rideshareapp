import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        loginData,
        { withCredentials: true } 
      );
      if (response.status === 200) {
        alert("Login bem-sucedido!");
        navigate("/boleias");  
      }
    } catch (error) {
      alert("Credenciais inválidas. Tente novamente.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleLogin(e);
    }
  };

  const handleRegister = async () => {
    const { name, email, password } = registerData;
    if (!name) {
      alert("O nome é obrigatório!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("O email deve estar em um formato válido!");
      return;
    }

    if (password.length < 3) {
      alert("A senha deve ter pelo menos 3 caracteres!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        registerData
      );
      alert("Registro concluído com sucesso!");
      setRegisterData({ name: "", email: "", password: "" });
      setShowRegister(false);
      setShowLogin(true);
    } catch (error) {
      alert("Erro no registro. Verifique os dados e tente novamente.");
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-left">
          <img src="/assets/logo.png" alt="Logo" className="logo" />
          <h1>RideShare - Compartilhamento de Viagens</h1>
        </div>
        <button className="btn btn-login" onClick={() => setShowLogin(true)}>
          Iniciar Sessão
        </button>
      </header>

      <main className="content">
        <h2>Encontre sua Próxima Boleia!</h2>
        <p>Conecte-se com motoristas e planeje suas viagens com facilidade.</p>
        <button className="btn btn-start" onClick={() => setShowRegister(true)}>
          Comece Já
        </button>
        <div className="image-gallery">
          <img src="/assets/1.jpg" alt="Imagem 1" />
          <img src="/assets/2.jpg" alt="Imagem 2" />
          <img src="/assets/3.jpg" alt="Imagem 3" />
        </div>
      </main>

      <footer className="footer">
        © 2025 | Autores: Afonso Fernandes e Pedro Correia | Sistemas de Informação em Rede @ IPVC
      </footer>

      {showLogin && (
        <div className="modal login-modal">
          <div className="modal-content login-modal-content">
            <span className="close" onClick={() => setShowLogin(false)}>
              &times;
            </span>
            <h3>Iniciar Sessão</h3>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Senha"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button className="btn-modal" type="submit">
                Entrar
              </button>
            </form>
            <button className="btn-google" onClick={handleGoogleAuth}>
              <img src="/assets/google.png" alt="Google logo" className="google-logo" /> Fazer login com Google
            </button>
            <p className="register-link" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
              Ainda não tem conta? <span className="link-highlight">Crie aqui!</span>
            </p>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal register-modal">
          <div className="modal-content register-modal-content">
            <span className="close" onClick={() => setShowRegister(false)}>
              &times;
            </span>
            <h3>Registrar</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Nome"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Senha"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
            </div>
            <button className="btn-modal" onClick={handleRegister}>
              Registar
            </button>
            <button className="btn-google" onClick={handleGoogleAuth}>
              <img src="/assets/google.png" alt="Google logo" className="google-logo" /> Registar com Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
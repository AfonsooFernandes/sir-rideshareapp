import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import styles from "./Boleias.module.css";

const socket = io("http://localhost:5000");

const Boleias = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [boleias, setBoleias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateRideModal, setShowCreateRideModal] = useState(false);
  const [rideCreated, setRideCreated] = useState(false);
  const [activeReservation, setActiveReservation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) throw new Error("Utilizador não autenticado");
        const user = await response.json();
        setCurrentUser(user);
        navigate("/boleias");
      } catch (error) {
        console.error("Erro ao buscar utilizador:", error.message);
        navigate("/login");
      }
    };

    const fetchBoleias = async () => {
      try {
        const response = await fetch("/api/rides", { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const updatedBoleias = updateAvailableSeats(data);
        setBoleias(updatedBoleias.map(boleia => ({ ...boleia, detailsVisible: false })));
      } catch (error) {
        console.error("Erro ao buscar boleias:", error.message);
      }
    };

    fetchUser();
    fetchBoleias();

    socket.on('updateRide', (updatedRide) => {
      setBoleias(currentBoleias =>
        currentBoleias.map(boleia => boleia._id === updatedRide._id ? updatedRide : boleia)
      );
    });

    return () => {
      socket.off('updateRide');
    };
  }, [navigate]);

  const updateAvailableSeats = (boleias) => {
    return boleias.map(boleia => {
      const totalReserved = boleia.reservations.reduce((total, reservation) => total + reservation.lugaresReservados, 0);
      return {
        ...boleia,
        lugaresDisponiveis: boleia.lugaresDisponiveis - totalReserved
      };
    });
  };

  const filteredBoleias = searchTerm
    ? boleias.filter(boleia =>
        boleia.nomeRota.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : boleias;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const toggleDetails = (id) => {
    setBoleias((currentBoleias) =>
      currentBoleias.map((boleia) =>
        boleia._id === id ? { ...boleia, detailsVisible: !boleia.detailsVisible } : boleia
      )
    );
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleCreateRide = async (event) => {
    event.preventDefault();

    const novaBoleia = {
      nomeRota: event.target[0].value,
      descricao: event.target[1].value,
      custo: parseFloat(event.target[2].value).toFixed(2),
      contato: event.target[5].value,
      horarios: {
        pontoEncontro: event.target[3].value,
        horaPartida: event.target[6].value,
        horaRetorno: event.target[7].value,
      },
      lugaresDisponiveis: parseInt(event.target[4].value, 10),
      idMotorista: currentUser._id,
      dataBoleia: event.target[8].value 
    };

    try {
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(novaBoleia),
      });

      if (response.ok) {
        const newRide = await response.json();
        newRide.reservations = [];
        const updatedBoleias = updateAvailableSeats([...boleias, newRide]);
        setBoleias(updatedBoleias);
        setShowCreateRideModal(false);
        setRideCreated(true);
        setTimeout(() => setRideCreated(false), 5000);
      } else {
        console.error("Erro ao criar boleia:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao criar boleia:", error.message);
    }
  };

  const handleAcceptRide = (boleia) => {
    if (currentUser._id !== boleia.idMotorista) {
      setActiveReservation(boleia);
      socket.emit('reservationAccepted', boleia._id);
    }
  };

  const submitReservation = async (event) => {
    event.preventDefault();
    const lugaresReservados = parseInt(event.target.lugares.value, 10);

    if (lugaresReservados > activeReservation.lugaresDisponiveis) {
      alert(`Erro: Não pode reservar mais de ${activeReservation.lugaresDisponiveis} lugares.`);
      return;
    }

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idBoleia: activeReservation._id,
          idPassageiro: currentUser._id,
          nomePassageiro: currentUser.name,
          lugaresReservados,
          custoTotal: (lugaresReservados * parseFloat(activeReservation.custo)).toFixed(2),
        }),
      });

      if (response.ok) {
        alert("Reserva realizada com sucesso!");
        setActiveReservation(null);
      } else {
        throw new Error("Erro ao criar reserva.");
      }
    } catch (error) {
      console.error("Erro ao criar reserva:", error.message);
    }
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogoutModal(false);
      setShowCreateRideModal(false);
      setActiveReservation(null);
    }
  };

  return (
    <div className={styles.boleiasContainer}>
      <header className={styles.header}>
        <img src="/assets/logo.png" alt="Logo" className={styles.logo} />
        <h1>RideShare - Compartilhamento de Viagens</h1>
        {currentUser && <span className={styles.userGreeting}>Bem-vindo, {currentUser.name}</span>}
        <button className={styles.btnLogout} onClick={() => setShowLogoutModal(true)}>
          Terminar Sessão
        </button>
      </header>

      <div className={styles.activeRides}>
        <div className={styles.activeRidesHeader}>
          <h2>Boleias Ativas</h2>
          <input
            type="text"
            placeholder="Pesquisar Boleia..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: '20px', width: '100%', maxWidth: '600px', margin: '0 auto' }}
          />
          <button
            onClick={() => setShowCreateRideModal(true)}
            className={styles.createRideButton}
          >
            Criar Boleia
          </button>
        </div>
        {filteredBoleias.map((boleia) => (
          <div key={boleia._id} className={styles.rideItem}>
            <div className={styles.rideSummary}>
              <h3>{boleia.nomeRota}</h3>
              <p>{boleia.descricao}</p>
              <p>Custo: {`${boleia.custo}€`}</p>
              <h4>Reservas Aceitas:</h4>
              {boleia.reservations?.length > 0 ? (
                <ul>
                  {boleia.reservations.map((reservation) => (
                    <li key={reservation._id}>
                      {reservation.nomePassageiro} reservou {reservation.lugaresReservados} lugar(es)
                    </li>
                  ))}
                </ul>
              ) : (
          <p>Nenhuma reserva aceita ainda.</p>
      )}
      <button
        onClick={() => toggleDetails(boleia._id)}
        className={styles.detailsButton}
      >
        {boleia.detailsVisible ? "Esconder Detalhes" : "Ver Detalhes"}
      </button>
      {boleia.detailsVisible && currentUser._id !== boleia.idMotorista && (
        <button
          onClick={() => handleAcceptRide(boleia)}
          className={styles.acceptRideButton}
        >
          Aceitar Boleia
        </button>
      )}
    </div>
    {boleia.detailsVisible && (
      <div className={styles.rideDetails}>
        <p>Contacto: {boleia.contato}</p>  
        <p>Partida: {boleia.horarios.horaPartida} - Retorno: {boleia.horarios.horaRetorno}</p>
        <p>Ponto de Encontro: {boleia.horarios.pontoEncontro || "Não especificado"}</p>
        <p>Lugares Disponíveis: {boleia.lugaresDisponiveis}</p>
        <p>Data da Boleia: {new Date(boleia.dataBoleia).toLocaleDateString()}</p>
      </div>
    )}
  </div>
))}
      </div>

      {activeReservation && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <h3>Reservar lugares em {activeReservation.nomeRota}</h3>
            <form onSubmit={submitReservation}>
              <input
                type="number"
                name="lugares"
                min="1"
                max={activeReservation.lugaresDisponiveis}
                required
              />
              <button type="submit">Confirmar Reserva</button>
              <button type="button" onClick={() => setActiveReservation(null)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Deseja terminar sessão?</h3>
            <div className={styles.modalButtons}>
              <button onClick={handleLogout} className={styles.btnModalLogout}>
                Terminar Sessão
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className={styles.btnModalBack}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRideModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <form onSubmit={handleCreateRide}>
              <h3 className={styles.modalTitle}>Criar Boleia</h3>
              <input type="text" placeholder="Nome da Rota" required />
              <input type="text" placeholder="Descrição" required />
              <input type="number" placeholder="Custo" required />
              <input type="text" placeholder="Ponto de Encontro" required />
              <input type="number" placeholder="Lugares Disponíveis" required />
              <input type="text" placeholder="Contacto" required />

              <label htmlFor="horaPartida">Hora de Partida (HH:mm)</label>
              <input type="time" id="horaPartida" required />
              
              <label htmlFor="horaRetorno">Hora de Retorno (HH:mm)</label>
              <input type="time" id="horaRetorno" required />

              <label htmlFor="dataBoleia">Data da Boleia (DD/MM/AAAA)</label>
              <input type="date" id="dataBoleia" required min={new Date().toISOString().split('T')[0]} />
              
              <button type="submit">Criar Boleia</button>
              <button type="button" onClick={() => setShowCreateRideModal(false)}>
                Voltar
              </button>
            </form>
          </div>
        </div>
      )}

      {rideCreated && (
        <p className={styles.successMessage}>Boleia criada com sucesso!</p>
      )}

      <footer className={styles.footer}>
        © 2025 | Autores: Afonso Fernandes e Pedro Correia | Sistemas de Informação em Rede @ IPVC
      </footer>
    </div>
  );
};

export default Boleias;
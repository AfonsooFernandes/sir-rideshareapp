import React from "react";
import { Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Boleias from "./Boleias/Boleias";

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boleias" element={<Boleias />} />
    </Routes>
  );
};

export default App;
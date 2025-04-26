import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";

function App() {
   return (
      <Router>
         <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<MainPage />} />
         </Routes>
      </Router>
   );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Axios from "axios";
import LandingPage from "./pages/LandingPage";
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";

function App() {
  // const [cookies, setCookies] = useCookies(["temp_key", "site_id"]);
  // const [temp_key, setTemp_key] = useState("");

  useEffect(() => {}, []);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  );
}

export default App;

import * as React from "react";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Pages/Dashboard";
import Trade from "./components/Pages/Trade";
import Gas from "./components/Pages/Gas";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trade" element={<Trade />} />
        <Route path="gas" element={<Gas />} />
      </Routes>

    </div>
  );
}

export default App;

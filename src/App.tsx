import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { MantineProvider, AppShell } from "@mantine/core";
import { HeaderPopulated as Header } from "./components/Navigation/Header";
import { FooterPopulated as Footer } from "./components/Navigation/Footer";

import Home from "./components/Pages/Home";
import Dashboard from "./components/Pages/Dashboard";
import Trade from "./components/Pages/Trade";
import Gas from "./components/Pages/Gas";

function App() {
  
  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <AppShell
        header={<Header />}
        footer={<Footer />}
      >
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trade" element={<Trade />} />
          <Route path="gas" element={<Gas />} />
        </Routes>
      </AppShell>
    </MantineProvider>
  );
}

export default App;

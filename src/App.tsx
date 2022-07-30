import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { MantineProvider, AppShell } from "@mantine/core";
import { HeaderPopulated as Header } from "./components/Navigation/Header";
import { FooterPopulated as Footer } from "./components/Navigation/Footer";
import { NotificationsProvider } from "@mantine/notifications";

import Home from "./components/Pages/Home";
import Dashboard from "./components/Pages/Dashboard";
import Trade from "./components/Pages/Trade";
import Gas from "./components/Pages/Gas";

import { Interface } from "ethers/lib/utils";
import DCAStack from "./artifacts/contracts/DCAStack.sol/DCAStack.json";

const dcastackABI = DCAStack.abi;
const dcastackAddr = "0x4631BCAbD6dF18D94796344963cB60d44a4136b6";

function App() {
  const DCAStackContract = {
    address: dcastackAddr,
    abi: new Interface(dcastackABI),
  };

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <NotificationsProvider autoClose={10000}>
        <AppShell header={<Header />} footer={<Footer />}>
          <Routes>
            <Route path="" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="trade" element={<Trade />} />
            <Route path="gas" element={<Gas contract={DCAStackContract} />} />
          </Routes>
        </AppShell>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;

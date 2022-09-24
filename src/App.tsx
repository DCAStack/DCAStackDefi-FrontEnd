import { createContext } from "react";
import { Routes, Route } from "react-router-dom";
import { MantineProvider, AppShell } from "@mantine/core";
import { HeaderPopulated as Header } from "./components/Navigation/Header";
import { FooterPopulated as Footer } from "./components/Navigation/Footer";
import { NotificationsProvider } from "@mantine/notifications";

import Home from "./components/Pages/Home";
import Dashboard from "./components/Pages/Dashboard";
import Trade from "./components/Pages/Trade";

import { IContract } from "./models/Interfaces";
import { Interface } from "ethers/lib/utils";
import DCAStack from "./deployments/polygon/DCAStack.json";
import Disclaimer from "./components/Pages/Disclaimer";
import Privacy from "./components/Pages/Privacy";

const dcastackABI = DCAStack.abi;
const dcastackAddr = DCAStack.address;

const DCAStackContract = {
  address: dcastackAddr,
  abi: new Interface(dcastackABI),
};

export const ContractContext = createContext<IContract>(DCAStackContract);

function App() {
  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <NotificationsProvider autoClose={10000}>
        <AppShell header={<Header />} footer={<Footer />}>
          <ContractContext.Provider value={DCAStackContract}>
            <Routes>
              <Route path="*" element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="trade" element={<Trade />} />
              <Route path="disclaimer" element={<Disclaimer />} />
              <Route path="privacy" element={<Privacy />} />
            </Routes>
          </ContractContext.Provider>
        </AppShell>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;

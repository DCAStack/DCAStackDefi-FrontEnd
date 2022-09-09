import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  DisclaimerComponent,
  Chain,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import App from "./App";

const localChain: Chain = {
  id: 31337,
  name: "Local",
  network: "local",
  iconUrl: "https://www.svgrepo.com/show/13701/home.svg",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Local",
    symbol: "ETH",
  },
  rpcUrls: {
    default: "http://192.168.0.169:8545",
  },
  testnet: false,
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.polygon,
    ...(process.env.REACT_APP_ENABLE_DEV === "true" ? [localChain] : []),
  ],
  [
    publicProvider(),
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "DCAStack",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{" "}
    <Link href="/privacy">Privacy Policy</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="/disclaimer">Disclaimer</Link>
  </Text>
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: "#1971c2",
            fontStack: "system",
            overlayBlur: "large",
          })}
          showRecentTransactions={true}
          appInfo={{
            appName: "DCAStack",
            disclaimer: Disclaimer,
          }}
        >
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import * as React from "react";
import { Routes, Route } from "react-router-dom";
import {
  MantineProvider,
  AppShell,
  Select,
  Text,
  TextInput,
  Button,
} from "@mantine/core";
import { HeaderResponsive as Header } from "./components/Navigation/Header";
import { FooterCentered as Footer } from "./components/Navigation/Footer";

import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";

import Home from "./components/Pages/Home";
import Dashboard from "./components/Pages/Dashboard";
import Trade from "./components/Pages/Trade";
import Gas from "./components/Pages/Gas";

function App() {
  const headerLinks = {
    links: [
      {
        link: "/",
        label: "Home",
      },
      {
        link: "/dashboard",
        label: "Dashboard",
      },
      {
        link: "/gas",
        label: "Gas",
      },
      {
        link: "/trade",
        label: "Trade",
      },
      {
        link: "#1",
        label: "Help",
        links: [
          {
            link: "https://docs.dcastack.com/",
            label: "Documentation",
          },
          {
            link: "https://github.com/",
            label: "Report An Issue",
          },
          {
            link: "/community",
            label: "Contact Us",
          },
          {
            link: "/blog",
            label: "Server Status",
          },
        ],
      },
    ],
  };

  const footerLinks = {
    links: [
      {
        link: "/",
        label: "Home",
      },
      {
        link: "/dashboard",
        label: "Dashboard",
      },
      {
        link: "/gas",
        label: "Gas",
      },
      {
        link: "/trade",
        label: "Trade",
      },
      {
        link: "#",
        label: "Privacy",
      },
      {
        link: "#",
        label: "TOS",
      },
    ],
  };

  const form = useForm({
    initialValues: {
      date: new Date(),
      textInput: "",
      select: "react",
    },
  });

  const handleSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <AppShell
        header={<Header links={headerLinks.links} />}
        footer={<Footer links={footerLinks.links} />}
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

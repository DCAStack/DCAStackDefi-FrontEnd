import { createStyles, ScrollArea, Table } from "@mantine/core";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface TableScrollAreaProps {
  data: { name: string; email: string; company: string }[];
}

export function TradesTable({ data }: TableScrollAreaProps) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row) => (
    <tr key={row.name}>
      <td>{row.name}</td>
      <td>{row.email}</td>
      <td>{row.company}</td>
    </tr>
  ));

  return (
    <ScrollArea
      sx={{ height: 300 }}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table sx={{ minWidth: 700 }} striped highlightOnHover>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Date</th>
            <th>Schedule ID</th>
            <th>Trading Pair</th>
            <th>Trade Amount</th>
            <th>TX Details</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

const randomdata = {
  data: [
    {
      name: "Athena Weissnat",
      company: "Little - Rippin",
      email: "Elouise.Prohaska@yahoo.com",
    },
    {
      name: "Jewell Littel",
      company: "O'Connell Group",
      email: "Hester.Hettinger9@hotmail.com",
    },
    {
      name: "Cyrus Howell",
      company: "Windler, Yost and Fadel",
      email: "Rick0@gmail.com",
    },
    {
      name: "Dr. Orie Jast",
      company: "Hilll - Pacocha",
      email: "Anna56@hotmail.com",
    },
    {
      name: "Brook Gaylord",
      company: "Conn, Huel and Nader",
      email: "Immanuel77@gmail.com",
    },
  ],
};

export function UserTradesPopulated() {
  return <TradesTable data={randomdata.data} />;
}

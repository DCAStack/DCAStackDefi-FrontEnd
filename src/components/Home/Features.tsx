import {
  createStyles,
  Badge,
  Group,
  Text,
  Card,
  SimpleGrid,
  Container,
} from "@mantine/core";
import { Coin, Key, ShieldLock, World } from "tabler-icons-react";

const mockdata = [
  {
    icon: Key,
    title: "Your Keys",
    description:
      "Your keys never leave you. Everything takes place on the blockchain through your wallet.",
  },
  {
    icon: Coin,
    title: "Your Coins",
    description:
      "Maintain custody of your funds at all times. Interact with smart contracts to trustlessly trade.",
  },
  {
    icon: ShieldLock,
    title: "Your Security",
    description:
      "No more trusting centralized exchanges. Take security into your own hands and remove the intermediary.",
  },
  {
    icon: World,
    title: "All Defi",
    description:
      "Use the wonders of decentralized finance to automate your dollar cost averaging.",
  },
];

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
  },

  description: {
    maxWidth: 600,
    margin: "auto",

    "&::after": {
      content: '""',
      display: "block",
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 1)
          : theme.colors[theme.primaryColor][0],
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  card: {
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 1)
          : theme.colors[theme.primaryColor][0],
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
    },
  },
}));

export function FeaturesAsymmetrical() {
  const { classes, theme } = useStyles();
  const features = mockdata.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      p="xl"
    >
      <feature.icon
        size={50}
        strokeWidth={2}
        color={theme.fn.rgba(theme.colors[theme.primaryColor][7], 1)}
      />
      <Text size="lg" weight={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text size="sm" color="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));
  return (
    <Container size="lg" py="xl">
      <Group position="center">
        <Badge variant="filled" size="lg">
          Trustless, Transparent, Trading
        </Badge>
      </Group>
      <SimpleGrid
        cols={4}
        spacing="xl"
        mt={50}
        breakpoints={[{ maxWidth: "md", cols: 1 }]}
      >
        {features}
      </SimpleGrid>
    </Container>
  );
}

import { createStyles } from "@mantine/core";
import { useNetwork } from "wagmi";
import { Button } from "@mantine/core";
import TokenBadge from "./../TokenBadge";
import gasTokens from "./../../data/gasTokens";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function GasToken() {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const currentChain: number = chain?.id as keyof typeof gasTokens;

  return (
    <Button variant="light" radius="xs" size="xl">
      <TokenBadge
        token={
          gasTokens[`${currentChain}`]
            ? gasTokens[`${currentChain}`]
            : gasTokens[0]
        }
      />
    </Button>
  );
}

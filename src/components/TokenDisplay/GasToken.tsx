import { createStyles } from "@mantine/core";
import { useNetwork } from "wagmi";
import { Button } from "@mantine/core";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import gasTokens from "../../data/gasTokens";

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
    <TokenBadgeDisplay
      token={
        gasTokens[`${currentChain}`]
          ? gasTokens[`${currentChain}`]
          : gasTokens[0]
      }
    />
  );
}

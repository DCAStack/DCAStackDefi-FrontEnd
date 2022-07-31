import { createStyles } from "@mantine/core";
import { useNetwork } from "wagmi";
import { Button } from "@mantine/core";
import TokenBadge from "./TokenBadge";
import gasTokens from "./../../data/gasTokens";
import { Selector } from "tabler-icons-react";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISwapText {
  text: string;
}

export default function SwapToken({ text }: ISwapText) {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const currentChain: number = chain?.id as keyof typeof gasTokens;

  return (
    <Button
      variant="light"
      radius="xs"
      size="xl"
      rightIcon={<Selector size={60} strokeWidth={2} />}
    >
      {text}&nbsp;&nbsp;
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

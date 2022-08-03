import { createStyles } from "@mantine/core";
import { useNetwork } from "wagmi";
import { Button } from "@mantine/core";
import TokenBadge from "./TokenBadge";
import gasTokens from "./../../data/gasTokens";
import swapTokens from "./../../data/swapTokens";
import { TokenBadgeProps } from "../../models/PropTypes";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function ViewToken({
  token,
  displayTokenName,
  className,
}: TokenBadgeProps) {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const currentChain: number = chain?.id as keyof typeof gasTokens;

  return (
    <Button variant="light" radius="xl" size="xl" compact>
      <TokenBadge token={token} displayTokenName={displayTokenName} />
    </Button>
  );
}

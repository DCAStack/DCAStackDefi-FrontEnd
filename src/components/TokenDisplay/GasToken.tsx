import { useNetwork } from "wagmi";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import gasTokens from "../../data/gasTokens";

export default function GasToken() {
  const { chain } = useNetwork();
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

import { Space } from "@mantine/core";

import { BigNumber } from "ethers";

import { IToken } from "../../models/Interfaces";
import SetupGasDeposit from "./SetupGasDeposit";
import SetupTokenDeposit from "./SetupTokenDeposit";

interface ISetupDeposits {
  sellToken: IToken;
  estimatedGas: BigNumber;
  depositAmount: BigNumber;
  freeTokenBal: BigNumber;
  freeGasBal: BigNumber;
  enableWithdraw?: boolean;
}

export default function SetupDeposits({
  sellToken,
  estimatedGas,
  depositAmount,
  freeTokenBal,
  freeGasBal,
  enableWithdraw = false,
}: ISetupDeposits) {
  return (
    <div>
      <SetupGasDeposit
        estimatedGas={estimatedGas}
        freeGasBal={freeGasBal}
        enableWithdraw={enableWithdraw}
      />
      <Space h="md" />

      <SetupTokenDeposit
        sellToken={sellToken}
        depositAmount={depositAmount}
        freeTokenBal={freeTokenBal}
        enableWithdraw={enableWithdraw}
      />
    </div>
  );
}

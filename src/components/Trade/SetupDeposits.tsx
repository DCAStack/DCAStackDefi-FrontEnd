import { Space } from "@mantine/core";

import { BigNumber } from "ethers";
import { useState } from "react";

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
  const [currToken, setCurrToken] = useState(sellToken);

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
        setToken={setCurrToken}
        depositAmount={depositAmount}
        freeTokenBal={freeTokenBal}
        enableWithdraw={enableWithdraw}
      />
    </div>
  );
}

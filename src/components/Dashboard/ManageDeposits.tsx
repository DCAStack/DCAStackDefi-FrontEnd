import { Space } from "@mantine/core";

import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { nullToken } from "../../data/gasTokens";

import { IToken, IUserFunds } from "../../models/Interfaces";
import SetupGasDeposit from "../Trade/SetupGasDeposit";
import SetupTokenDeposit from "../Trade/SetupTokenDeposit";

interface IManageDeposits {
  enableWithdraw: boolean;
  userFunds?: IUserFunds[];
  userSchedules?: Record<string, any>;
}

export default function ManageDeposits({
  enableWithdraw = false,
  userFunds,
  userSchedules,
}: IManageDeposits) {
  const [currToken, setCurrToken] = useState(nullToken);

  useEffect(() => {
    console.log("changed token", currToken);
  }, [currToken]);

  //based on token selected, populate total + free

  //get all schedule info run through quote and summate estimated gas (just double)

  return (
    <div>
      <SetupGasDeposit
        estimatedGas={BigNumber.from(0)}
        freeGasBal={BigNumber.from(0)}
        enableWithdraw={enableWithdraw}
      />
      <Space h="md" />

      <SetupTokenDeposit
        sellToken={currToken}
        setToken={setCurrToken}
        depositAmount={BigNumber.from(0)}
        freeTokenBal={BigNumber.from(0)}
        enableWithdraw={enableWithdraw}
      />
    </div>
  );
}

import { Space } from "@mantine/core";

import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import { nullToken } from "../../data/gasTokens";

import { IToken, IUserFunds } from "../../models/Interfaces";
import SetupGasDeposit from "../Trade/SetupGasDeposit";
import SetupTokenDeposit from "../Trade/SetupTokenDeposit";

interface IManageDeposits {
  enableWithdraw: boolean;
  mappedUserFunds?: Record<string, IUserFunds>;
  userSchedules?: Record<string, any>;
}

export default function ManageDeposits({
  enableWithdraw = false,
  mappedUserFunds,
  userSchedules,
}: IManageDeposits) {
  const [currToken, setCurrToken] = useState(nullToken);
  const [freeTokenBal, setFreeTokenBal] = useState(BigNumber.from(0));

  useEffect(() => {
    if (
      currToken !== nullToken &&
      mappedUserFunds &&
      mappedUserFunds[utils.getAddress(currToken.address)]
    ) {
      setFreeTokenBal(
        mappedUserFunds[utils.getAddress(currToken.address)].freeBalanceRaw
      );
    }
  }, [currToken, mappedUserFunds]);

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
        freeTokenBal={freeTokenBal}
        enableWithdraw={enableWithdraw}
      />
    </div>
  );
}

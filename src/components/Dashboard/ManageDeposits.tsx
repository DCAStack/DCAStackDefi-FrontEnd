import { Space } from "@mantine/core";

import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import { nullToken } from "../../data/gasTokens";

import { IUserFunds } from "../../models/Interfaces";
import EstimateGas from "../Banking/EstimateGas";
import SetupGasDeposit from "../Trade/SetupGasDeposit";
import SetupTokenDeposit from "../Trade/SetupTokenDeposit";

interface IManageDeposits {
  enableWithdraw: boolean;
  mappedUserFunds: Record<string, IUserFunds>;
  userSchedules: Record<string, any>;
}

export default function ManageDeposits({
  enableWithdraw = false,
  mappedUserFunds,
  userSchedules,
}: IManageDeposits) {
  const [currToken, setCurrToken] = useState(nullToken);
  const [freeTokenBal, setFreeTokenBal] = useState(BigNumber.from(0));

  const { estimatedGas, freeGasBal } = EstimateGas(
    mappedUserFunds,
    userSchedules
  );

  useEffect(() => {
    if (
      currToken !== nullToken &&
      mappedUserFunds &&
      mappedUserFunds[utils.getAddress(currToken.address)]
    ) {
      setFreeTokenBal(
        mappedUserFunds[utils.getAddress(currToken.address)].freeBalanceRaw
      );
    } else {
      setFreeTokenBal(BigNumber.from(0));
    }
  }, [currToken, mappedUserFunds]);

  return (
    <div>
      <SetupGasDeposit
        estimatedGas={estimatedGas}
        freeGasBal={freeGasBal}
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

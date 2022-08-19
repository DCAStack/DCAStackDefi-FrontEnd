import { useEffect, useState, useContext } from "react";

import {
  Group,
  NumberInput,
  Container,
  Button,
  createStyles,
  Space,
  NativeSelect,
  Text,
  Title,
  Stack,
  Stepper,
  ActionIcon,
} from "@mantine/core";

import { useAccount, useNetwork, useContractReads } from "wagmi";
import { BigNumber } from "ethers";

import { ContractContext } from "../../App";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";

export default function GasOverview() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

  const bnZero = BigNumber.from(0);
  const [freeGasBal, setUserGasBal] = useState<BigNumber>(bnZero);
  const [freeTokenBal, setUserBal] = useState<BigNumber>(bnZero);

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getFreeGasBalance",
        args: [10],
      },
    ],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Free Gas Success", data);
      let userGasBalance = data[0];
      userGasBalance
        ? setUserGasBal(BigNumber.from(userGasBalance._hex))
        : setUserGasBal(bnZero);

      console.log("Free gas balance is", userGasBalance?.toString());
    },
    onError(error) {
      console.log("Get User Gas Error", error);
      setUserGasBal(bnZero);
    },
  });

  return <div>GasOverview</div>;
}

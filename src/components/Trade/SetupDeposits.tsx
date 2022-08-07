import React from "react";
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
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";

import { showNotification, updateNotification } from "@mantine/notifications";
import SwapToken from "./SwapToken";
import dayjs from "dayjs";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { ActionIcon } from "@mantine/core";
import { SwitchHorizontal, PlayerPlay } from "tabler-icons-react";

import DepositGas from "../Banking/DepositGas";
import DepositFunds from "../Banking/DepositFunds";

import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";

import { nullToken } from "../../data/gasTokens";
import { IToken } from "../../models/Interfaces";

interface ISetupDeposits {
  sellToken: IToken;
  estimatedGas: number;
  depositAmount: number;
}

export default function SetupDeposits({
  sellToken,
  estimatedGas,
  depositAmount,
}: ISetupDeposits) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;
  const [curUserGasBal, setUserGasBal] = useState("0");
  const [curUserBal, setUserBal] = useState("0");

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "userGasBalances",
        args: address,
      },
      {
        addressOrName: contractAddr,
        contractInterface: contractABI,
        functionName: "getFreeTokenBalance",
        args: [sellToken?.address],
      },
    ],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Funds Success", data);
      let userGasBalance = data[0];
      userGasBalance
        ? setUserGasBal(String(formatEther(userGasBalance.toString())))
        : setUserGasBal("0");

      let userFundBalance = data[1];
      userFundBalance
        ? setUserBal(String(formatEther(userFundBalance.toString())))
        : setUserBal("0");
    },
    onError(error) {
      console.log("Get User Funds Error", error);
      setUserGasBal("0");
      setUserBal("0");
    },
  });

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  return (
    <div>
      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Gas Balance</Title>
          {curUserGasBal !== "0.0" && (
            <Text size="lg" color="green">
              Have: {curUserGasBal} {networkCurrency}
            </Text>
          )}
          {curUserGasBal === "0.0" && (
            <Text size="lg" color="red">
              Have: {curUserGasBal} {networkCurrency}
            </Text>
          )}

          {estimatedGas <= Number(curUserGasBal) && (
            <Text size="lg" color="green">
              Need: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas > Number(curUserGasBal) && (
            <Text size="lg" color="red">
              Need: {estimatedGas - Number(curUserGasBal)} {networkCurrency}
            </Text>
          )}
        </Stack>

        <DepositGas
          defaultValue={
            estimatedGas > Number(curUserGasBal)
              ? estimatedGas - Number(curUserGasBal)
              : 0
          }
        />
      </Group>

      <Space h="md" />

      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Deposit Balance</Title>
          {curUserBal !== "0.0" && (
            <Text size="lg" color="green">
              Have: {curUserBal} {sellToken.symbol}
            </Text>
          )}
          {curUserBal === "0.0" && (
            <Text size="lg" color="red">
              Have: {curUserBal} {sellToken.symbol}
            </Text>
          )}

          {Number(curUserBal) < depositAmount && (
            <Text size="lg" color="red">
              Need: {depositAmount - Number(curUserBal)} {sellToken.symbol}
            </Text>
          )}
          {Number(curUserBal) >= depositAmount && (
            <Text size="lg" color="green">
              Need: 0 {sellToken.symbol}
            </Text>
          )}
        </Stack>
        <DepositFunds
          token={sellToken}
          defaultValue={
            Number(curUserBal) < depositAmount
              ? depositAmount - Number(curUserBal)
              : 0
          }
        />
      </Group>
    </div>
  );
}

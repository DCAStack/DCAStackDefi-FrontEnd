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
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import {
  parseEther,
  formatEther,
  formatUnits,
  parseUnits,
} from "ethers/lib/utils";
import { BigNumber } from "ethers";
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
  estimatedGas: BigNumber;
  depositAmount: BigNumber;
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
  const bnZero = BigNumber.from(0);
  const [curUserGasBal, setUserGasBal] = useState<BigNumber>(bnZero);
  const [curUserBal, setUserBal] = useState<BigNumber>(bnZero);

  const weiDepositAmount = parseUnits(
    depositAmount.toString(),
    sellToken.decimals
  );
  console.log("step", weiDepositAmount);

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
        ? setUserGasBal(BigNumber.from(userGasBalance._hex))
        : setUserGasBal(bnZero);

      let userFundBalance = data[1];
      userFundBalance
        ? setUserBal(BigNumber.from(userFundBalance._hex))
        : setUserBal(bnZero);

      console.log("in", curUserBal.toString());
    },
    onError(error) {
      console.log("Get User Funds Error", error);
      setUserGasBal(bnZero);
      setUserBal(bnZero);
    },
  });

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  console.log(
    "user fund check",
    curUserBal.toString(),
    weiDepositAmount.toString(),
    weiDepositAmount?.gt(curUserBal)
  );

  return (
    <div>
      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Gas Balance</Title>
          {!curUserGasBal?.isZero() && (
            <Text size="lg" color="green">
              Have: {formatEther(curUserGasBal)} {networkCurrency}
            </Text>
          )}
          {curUserGasBal?.isZero() && (
            <Text size="lg" color="red">
              Have: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas?.lte(curUserGasBal) && (
            <Text size="lg" color="green">
              Need: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas?.gt(curUserGasBal) && (
            <Text size="lg" color="red">
              Need: {formatEther(estimatedGas?.sub(curUserGasBal).toString())}{" "}
              {networkCurrency}
            </Text>
          )}
        </Stack>

        <DepositGas
          defaultValue={
            estimatedGas?.gt(curUserGasBal)
              ? Number(formatEther(estimatedGas?.sub(curUserGasBal).toString()))
              : 0
          }
        />
      </Group>

      <Space h="md" />

      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Deposit Balance</Title>
          {!curUserBal?.isZero() && (
            <Text size="lg" color="green">
              Have: {formatUnits(curUserBal, sellToken.decimals)}{" "}
              {sellToken.symbol}
            </Text>
          )}
          {curUserBal?.isZero() && (
            <Text size="lg" color="red">
              Have: 0 {sellToken.symbol}
            </Text>
          )}

          {curUserBal?.lt(weiDepositAmount) && (
            <Text size="lg" color="red">
              Need:{" "}
              {formatUnits(
                weiDepositAmount?.sub(curUserBal),
                sellToken.decimals
              )}{" "}
              {sellToken.symbol}
            </Text>
          )}
          {curUserBal?.gte(weiDepositAmount) && (
            <Text size="lg" color="green">
              Need: 0 {sellToken.symbol}
            </Text>
          )}
        </Stack>
        <DepositFunds
          token={sellToken}
          defaultValue={
            curUserBal.lt(weiDepositAmount)
              ? Number(
                  formatUnits(
                    weiDepositAmount?.sub(curUserBal),
                    sellToken.decimals
                  )
                )
              : 0
          }
        />
      </Group>
    </div>
  );
}

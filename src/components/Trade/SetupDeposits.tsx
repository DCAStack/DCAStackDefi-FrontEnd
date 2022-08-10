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
  freeTokenBal: BigNumber;
  freeGasBal: BigNumber;
}

export default function SetupDeposits({
  sellToken,
  estimatedGas,
  depositAmount,
  freeTokenBal,
  freeGasBal,
}: ISetupDeposits) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

  const weiDepositAmount = parseUnits(
    depositAmount.toString(),
    sellToken.decimals
  );

  const bnZero = BigNumber.from(0);

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

  return (
    <div>
      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Gas Balance</Title>
          {!freeGasBal?.isZero() && (
            <Text size="lg" color="green">
              Have: {formatEther(freeGasBal)} {networkCurrency}
            </Text>
          )}
          {freeGasBal?.isZero() && (
            <Text size="lg" color="red">
              Have: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas?.lte(freeGasBal) && (
            <Text size="lg" color="green">
              Need: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas?.gt(freeGasBal) && (
            <Text size="lg" color="red">
              Need: {formatEther(estimatedGas?.sub(freeGasBal).toString())}{" "}
              {networkCurrency}
            </Text>
          )}
        </Stack>

        <DepositGas
          weiDefaultValue={
            estimatedGas?.gt(freeGasBal)
              ? estimatedGas?.sub(freeGasBal)
              : BigNumber.from(0)
          }
        />
      </Group>

      <Space h="md" />

      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Deposit Balance</Title>
          {!freeTokenBal?.isZero() && (
            <Text size="lg" color="green">
              Have: {formatUnits(freeTokenBal, sellToken.decimals)}{" "}
              {sellToken.symbol}
            </Text>
          )}
          {freeTokenBal?.isZero() && (
            <Text size="lg" color="red">
              Have: 0 {sellToken.symbol}
            </Text>
          )}

          {freeTokenBal?.lt(weiDepositAmount) && (
            <Text size="lg" color="red">
              Need:{" "}
              {formatUnits(
                weiDepositAmount?.sub(freeTokenBal),
                sellToken.decimals
              )}{" "}
              {sellToken.symbol}
            </Text>
          )}
          {freeTokenBal?.gte(weiDepositAmount) && (
            <Text size="lg" color="green">
              Need: 0 {sellToken.symbol}
            </Text>
          )}
        </Stack>
        <DepositFunds
          token={sellToken}
          weiDefaultValue={
            freeTokenBal.lt(weiDepositAmount)
              ? weiDepositAmount
              : BigNumber.from(0)
          }
        />
      </Group>
    </div>
  );
}

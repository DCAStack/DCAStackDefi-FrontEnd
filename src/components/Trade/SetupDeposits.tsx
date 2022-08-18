import { useContext } from "react";

import { Group, Space, Text, Title, Stack } from "@mantine/core";

import { useAccount, useNetwork } from "wagmi";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { ContractContext } from "../../App";

import DepositGas from "../Banking/DepositGas";
import DepositFunds from "../Banking/DepositFunds";
import DepositEthFunds from "../Banking/DepositEthFunds";

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
  depositAmount: weiDepositAmount,
  freeTokenBal,
  freeGasBal,
}: ISetupDeposits) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain, chains } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();
  const currentChain: number = chain ? chain?.id : 0;

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
        {sellToken.address.toLowerCase() !==
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && (
          <DepositFunds
            token={sellToken}
            weiDefaultValue={
              freeTokenBal.lt(weiDepositAmount)
                ? weiDepositAmount.sub(freeTokenBal)
                : BigNumber.from(0)
            }
          />
        )}
        {sellToken.address.toLowerCase() ===
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && (
          <DepositEthFunds
            token={sellToken}
            weiDefaultValue={
              freeTokenBal.lt(weiDepositAmount)
                ? weiDepositAmount.sub(freeTokenBal)
                : BigNumber.from(0)
            }
          />
        )}
      </Group>
    </div>
  );
}

import { Group, Space, Stack, Text, Title } from "@mantine/core";

import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { useNetwork } from "wagmi";

import DepositEthFunds from "../Banking/DepositEthFunds";
import DepositFunds from "../Banking/DepositFunds";
import DepositGas from "../Banking/DepositGas";

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
  const { chain } = useNetwork();

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
              Have: ~{parseFloat(formatEther(freeGasBal)).toFixed(6)}{" "}
              {networkCurrency}
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
              Need: ~
              {parseFloat(formatEther(estimatedGas?.sub(freeGasBal))).toFixed(
                6
              )}{" "}
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
              Have: ~
              {parseFloat(
                formatUnits(freeTokenBal, sellToken.decimals)
              ).toFixed(6)}{" "}
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
              Need: ~
              {parseFloat(
                formatUnits(
                  weiDepositAmount?.sub(freeTokenBal),
                  sellToken.decimals
                )
              ).toFixed(6)}{" "}
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

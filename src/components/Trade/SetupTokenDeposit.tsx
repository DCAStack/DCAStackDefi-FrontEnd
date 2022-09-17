import {
  ActionIcon,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";

import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import { IToken } from "../../models/Interfaces";
import ManageFunds from "../Banking/ManageFunds";
import { useState } from "react";
import { X } from "tabler-icons-react";

interface ISetupDeposits {
  sellToken: IToken;
  depositAmount: BigNumber;
  freeTokenBal: BigNumber;
  enableWithdraw?: boolean;
}

export default function SetupTokenDeposit({
  sellToken,
  depositAmount: weiDepositAmount,
  freeTokenBal,
  enableWithdraw = false,
}: ISetupDeposits) {
  const [opened, setOpened] = useState(true);

  const theme = useMantineTheme();

  const tooltip = (
    <div style={{ display: "flex", marginRight: -5 }}>
      <Text
        size="xs"
        style={{
          color:
            theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
        }}
      >
        If you're seeing a negative token balance, you need to topup your
        deposit to allow running schedules to continue trading.
      </Text>
      <ActionIcon
        ml={5}
        style={{
          color: theme.colorScheme === "dark" ? theme.black : theme.white,
        }}
        size="xs"
        onClick={() => setOpened(false)}
      >
        <X size={12} />
      </ActionIcon>
    </div>
  );

  return (
    <div>
      <Group align="center" position="center" grow>
        <Stack>
          <Title order={4}>Contract Deposit Bal.</Title>
          {freeTokenBal.gt(0) && (
            <Text size="lg" color="green">
              Have: ~
              {parseFloat(
                formatUnits(freeTokenBal, sellToken.decimals)
              ).toFixed(6)}{" "}
              {sellToken.symbol}
            </Text>
          )}
          {freeTokenBal.eq(0) && (
            <Text size="lg" color="red">
              Have: 0 {sellToken.symbol}
            </Text>
          )}
          {freeTokenBal.lt(0) && (
            <Tooltip
              label={tooltip}
              opened={opened}
              allowPointerEvents
              withArrow
              wrapLines
              transition="rotate-left"
              transitionDuration={250}
              width={220}
              gutter={theme.spacing.xs}
            >
              <Text size="lg" color="red">
                Have:{" "}
                {parseFloat(
                  formatUnits(freeTokenBal, sellToken.decimals)
                ).toFixed(6)}{" "}
                {sellToken.symbol}
              </Text>
            </Tooltip>
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
        <ManageFunds
          selectedToken={sellToken}
          weiDefaultValue={
            freeTokenBal.lt(weiDepositAmount)
              ? weiDepositAmount.sub(freeTokenBal)
              : BigNumber.from(0)
          }
          enableWithdraw={enableWithdraw}
        />
      </Group>
    </div>
  );
}

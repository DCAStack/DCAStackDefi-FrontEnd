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
import { formatEther } from "ethers/lib/utils";
import { useNetwork } from "wagmi";

import ManageGas from "../Banking/ManageGas";
import { useState } from "react";
import { X } from "tabler-icons-react";

interface ISetupGasDeposit {
  estimatedGas: BigNumber;
  freeGasBal: BigNumber;
  enableWithdraw?: boolean;
}

export default function SetupGasDeposit({
  estimatedGas,
  freeGasBal,
  enableWithdraw = false,
}: ISetupGasDeposit) {
  const { chain } = useNetwork();

  const networkCurrency: string = chain?.nativeCurrency
    ? chain.nativeCurrency.symbol
    : "?";

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
        If you're seeing a negative gas balance, you are low on gas based on
        current gas estimates. We recommend topping this up just to be safe and
        to allow for your running schedules to continue.
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
          <Title order={4}>Contract Gas Bal.</Title>
          {freeGasBal?.gt(0) && (
            <Text size="lg" color="green">
              Have: ~{parseFloat(formatEther(freeGasBal)).toFixed(6)}{" "}
              {networkCurrency}
            </Text>
          )}
          {freeGasBal?.eq(0) && (
            <Text size="lg" color="red">
              Have: 0 {networkCurrency}
            </Text>
          )}
          {freeGasBal?.lt(0) && (
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
                Have: {parseFloat(formatEther(freeGasBal)).toFixed(6)}{" "}
                {networkCurrency}
              </Text>
            </Tooltip>
          )}
          {estimatedGas?.lte(freeGasBal) && (
            <Text size="lg" color="green">
              Need: 0 {networkCurrency}
            </Text>
          )}
          {estimatedGas?.gt(freeGasBal) && (
            <Text size="lg" color="red">
              Need: {">"}
              {parseFloat(formatEther(estimatedGas?.sub(freeGasBal))).toFixed(
                6
              )}{" "}
              {networkCurrency}
            </Text>
          )}
        </Stack>

        <ManageGas
          weiDefaultValue={
            estimatedGas?.gt(freeGasBal)
              ? estimatedGas?.sub(freeGasBal)
              : BigNumber.from(0)
          }
          enableWithdraw={enableWithdraw}
        />
      </Group>
    </div>
  );
}

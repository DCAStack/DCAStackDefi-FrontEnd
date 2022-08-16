import { useState, useEffect } from "react";

import {
  Group,
  NumberInput,
  Container,
  Button,
  createStyles,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { formatEther, formatUnits } from "ethers/lib/utils";
import { TokenBadgeProps } from "../../models/PropTypes";

import { parseUnits } from "ethers/lib/utils";

import { BigNumber } from "ethers";
import DepositFundsFlow from "./DepositFundsFlow";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFunds({
  token,
  weiDefaultValue = BigNumber.from(0),
}: TokenBadgeProps) {
  const [weiDepositAmount, setDeposit] = useState(BigNumber.from(0));
  const { classes } = useStyles();

  let depositTokenActions = DepositFundsFlow(token, weiDepositAmount);

  useEffect(() => {
    setDeposit(weiDefaultValue);
  }, [weiDefaultValue]);

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          precision={token?.decimals}
          value={Number(formatUnits(weiDepositAmount, token.decimals))}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setDeposit(parseUnits(String(val), token.decimals))
              : setDeposit(BigNumber.from(0))
          }
          icon={<TokenBadgeDisplay token={token} />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() => {
                depositTokenActions?.max
                  ? setDeposit(depositTokenActions?.max.value)
                  : setDeposit(BigNumber.from(0));
              }}
            >
              MAX
            </Button>
          }
          rightSectionWidth={65}
        />
        <Button
          compact
          className={classes.input}
          radius="xs"
          size="xl"
          onClick={() => {
            if (depositTokenActions?.approveMax) {
              //regular token
              if (depositTokenActions?.max?.formatted === "0.0") {
                showNotification({
                  id: "deposit-balance-error",
                  color: "red",
                  title: "Insufficient Balance",
                  message:
                    "If this was unexpected, please raise an issue on github!",
                  autoClose: true,
                  disallowClose: false,
                  icon: <AlertOctagon />,
                });
              } else {
                formatEther(depositTokenActions?.approveMax) === "0.0"
                  ? depositTokenActions?.approve?.()
                  : depositTokenActions?.deposit?.();
              }
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}

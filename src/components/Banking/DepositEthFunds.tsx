import { ChangeEvent, useEffect, useState } from "react";

import {
  Button,
  Container,
  createStyles,
  Group,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { formatEther } from "ethers/lib/utils";
import { TokenBadgeProps } from "../../models/PropTypes";

import { BigNumber } from "ethers";
import DepositEthFundsFlow from "./DepositEthFundsFlow";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositEthFunds({
  token,
  weiDefaultValue = BigNumber.from(0),
}: TokenBadgeProps) {
  const [depositAmount, setDeposit] = useState("0");
  const { classes } = useStyles();
  const [updateState, setUpdate] = useState(true);

  let depositEthActions = DepositEthFundsFlow(token, depositAmount);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setDeposit(event.target.value);
      setUpdate(false);
    }
  };

  useEffect(() => {
    if (updateState) {
      setDeposit(formatEther(weiDefaultValue).toString());
    }
  }, [weiDefaultValue, updateState]);

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={depositAmount?.toString()}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
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
                depositEthActions?.max
                  ? setDeposit(
                      formatEther(depositEthActions?.max?.value.toString())
                    )
                  : setDeposit("0");
                setUpdate(false);
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
            if (depositEthActions?.max?.formatted === "0.0") {
              showNotification({
                id: "deposit-eth-error",
                color: "red",
                title: "Insufficient Balance",
                message:
                  "If this was unexpected, please raise an issue on github!",
                autoClose: true,
                disallowClose: false,
                icon: <AlertOctagon />,
              });
            } else {
              depositEthActions?.deposit?.();
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}

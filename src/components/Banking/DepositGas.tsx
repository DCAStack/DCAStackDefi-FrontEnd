import { useEffect, useState, ChangeEvent } from "react";

import {
  Group,
  TextInput,
  Container,
  Button,
  createStyles,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import DepositGasFlow from "./DepositGasFlow";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISetup {
  weiDefaultValue?: BigNumber;
}

export default function DepositGas({
  weiDefaultValue = BigNumber.from(0),
}: ISetup) {
  const [depositAmount, setDeposit] = useState("0");
  const { classes } = useStyles();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setDeposit(event.target.value);
    }
  };

  useEffect(() => {
    setDeposit(formatEther(weiDefaultValue.toString()));
  }, [weiDefaultValue]);

  let depositGasActions = DepositGasFlow(depositAmount);

  return (
    <Container my="deposit_gas">
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
          }}
          value={depositAmount?.toString()}
          label="Deposit Gas Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
          icon={<GasToken />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() =>
                depositGasActions?.max
                  ? setDeposit(
                      formatEther(depositGasActions?.max?.value.toString())
                    )
                  : setDeposit("0")
              }
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
            if (depositGasActions?.max?.formatted === "0.0") {
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
              depositGasActions?.deposit?.();
            }
          }}
        >
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}

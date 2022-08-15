import { useState, useContext } from "react";

import {
  Group,
  NumberInput,
  Container,
  Button,
  createStyles,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import ViewToken from "../TokenDisplay/ViewToken";

import { parseEther, formatUnits } from "ethers/lib/utils";
import { ContractContext } from "../../App";
import { TokenBadgeProps } from "../../models/PropTypes";

import { BigNumber } from "ethers";
import DepositEthFundsFlow from "./DepositEthFlow";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositEthFunds({
  token,
  weiDefaultValue = BigNumber.from(0),
}: TokenBadgeProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [weiDepositAmount, setDeposit] = useState(BigNumber.from(0));
  const { classes } = useStyles();

  let depositEthActions = DepositEthFundsFlow(token, weiDepositAmount);

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          style={{ textAlign: "center" }}
          precision={token?.decimals}
          value={Number(formatUnits(weiDepositAmount, token.decimals))}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setDeposit(parseEther(String(val)))
              : setDeposit(BigNumber.from(0))
          }
          icon={<ViewToken token={token} />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() =>
                depositEthActions?.max
                  ? setDeposit(depositEthActions?.max?.value)
                  : setDeposit(BigNumber.from(0))
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

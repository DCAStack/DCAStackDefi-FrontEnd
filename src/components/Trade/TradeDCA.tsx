import { useEffect, useState, useContext } from "react";

import {
  Group,
  NumberInput,
  Grid,
  Container,
  Button,
  createStyles,
  Avatar,
  Space,
  NativeSelect,
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";
import SwapToken from "../Forms/SwapToken";
import dayjs from "dayjs";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { ActionIcon } from "@mantine/core";
import { SwitchHorizontal, PlayerPlay } from "tabler-icons-react";

import DepositGas from "../Forms/DepositGas";
import DepositFunds from "../Forms/DepositFunds";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

function TradeDCA() {
  const { classes } = useStyles();
  const [date, setDate] = useState<[Date | null, Date | null]>([
    new Date(),
    dayjs(new Date()).add(1, "days").toDate(),
  ]);

  const freqRange = Array.from(String(Array(30).keys()));

  return (
    <Container my="setup_schedule">
      <Container my="setup_swap">
        <Group align="end" position="center" spacing="xs" grow>
          <SwapToken text={"I want to sell"} />
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            className={classes.input}
          >
            <SwitchHorizontal size={45} strokeWidth={3} />
          </ActionIcon>
          <SwapToken text={"To purchase"} />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_dca">
        <Group align="end" position="center" spacing="xl" grow>
          <NumberInput
            label="Sell Amount"
            radius="xs"
            size="xl"
            hideControls
            description="I want to sell each DCA..."
            required
          />
          <NumberInput
            label="Trade Frequency"
            description="I want to DCA every..."
            radius="xs"
            size="xl"
            required
            min={1}
            max={30}
          />
          <NativeSelect
            data={["Days"]}
            label="Trade On"
            radius="xs"
            size="xl"
            required
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_date">
        <Group align="end" position="center" spacing="xl" grow>
          <DateRangePicker
            dropdownType="modal"
            label="Select DCA Schedule"
            description="Duration of DCA"
            placeholder="Pick dates range"
            value={date}
            onChange={setDate}
            required
            radius="xs"
            size="xl"
          />
          <TimeInput
            value={new Date()}
            label="Start Time"
            description="When to execute your DCA"
            format="12"
            radius="xs"
            size="xl"
            amLabel="am"
            pmLabel="pm"
            required
          />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="setup_deposits">
        <Group align="end" position="center" spacing="xs" grow>
          <DepositGas />
          <DepositFunds />
        </Group>
      </Container>

      <Space h="xl" />

      <Container my="start_dca">
        <Group align="end" position="center" spacing="xs" grow>
          <Button
            radius="xl"
            size="xl"
            variant="gradient"
            gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
          >
            Start DCA
          </Button>
        </Group>
      </Container>
    </Container>
  );
}

export default TradeDCA;

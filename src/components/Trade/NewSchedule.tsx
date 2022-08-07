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
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractReads,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
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

interface IScheduleParams {
  sellToken: IToken;
  buyToken: IToken;
  sellAmount: number;
  tradeFreq: number;
  numExec: number;
  startDate: Date | null;
  endDate: Date | null;
}

export default function NewSchedule({
  sellToken,
  buyToken,
  sellAmount,
  tradeFreq,
  numExec,
  startDate,
  endDate,
}: IScheduleParams) {
  return (
    <Group align="end" position="center" spacing="xs" grow>
      <Button
        fullWidth
        radius="xl"
        size="xl"
        variant="gradient"
        gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
      >
        {(sellAmount === 0 ||
          tradeFreq === 0 ||
          sellToken.symbol === "" ||
          buyToken.symbol === "") &&
          "Start DCA"}
        {sellAmount > 0 &&
          tradeFreq > 0 &&
          sellToken.symbol !== "" &&
          buyToken.symbol !== "" && (
            <Text size="xl">
              Trade {sellAmount} {sellToken.symbol} for {buyToken.symbol} Every{" "}
              {tradeFreq} Days for {numExec} Days
            </Text>
          )}
      </Button>
    </Group>
  );
}

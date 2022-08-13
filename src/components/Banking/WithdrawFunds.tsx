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
  UnstyledButton,
  Menu,
  Image,
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon, ChevronDown } from "tabler-icons-react";
import GasToken from "../TokenDisplay/GasToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "./../../data/swapTokens";
import { forwardRef } from "react";
import { Text, Select } from "@mantine/core";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { BigNumber } from "ethers";

import { UserFundsProps } from "../../models/PropTypes";
import { IUserFunds } from "../../models/Interfaces";

const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
  control: {
    height: 60,
    width: 200,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }`,
    transition: "background-color 150ms ease",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[opened ? 5 : 6]
        : opened
        ? theme.colors.gray[0]
        : theme.white,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  label: {
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
  },

  icon: {
    transition: "transform 150ms ease",
    transform: opened ? "rotate(180deg)" : "rotate(0deg)",
  },
  input: {
    height: 60,
  },
}));

export default function WithdrawFunds({
  userFunds: parsedTokenBalances,
}: UserFundsProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [weiWithdrawAmount, setWithdraw] = useState(BigNumber.from(0));
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const [selectedToken, setSelectedToken] = useState(
    parsedTokenBalances ? parsedTokenBalances[0] : null
  );

  useEffect(() => {
    //any time token changes, reset input back to 0
    setWithdraw(BigNumber.from(0));
  }, [selectedToken]);

  let items;
  if (parsedTokenBalances) {
    items = parsedTokenBalances.map((item) => (
      <Menu.Item
        icon={<Image src={item.logoURI} width={30} height={30} />}
        onClick={() => setSelectedToken(item)}
        key={item.address}
      >
        {item.balance}&nbsp;
        {item.symbol}
      </Menu.Item>
    ));
  }

  const {
    config: withdrawFundsSetup,
    error: prepareWithdrawFundsError,
    isError: prepareWithdrawFundsIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: !weiWithdrawAmount.eq(0) ? true : false,
    functionName: "withdrawFunds",
    args: [selectedToken?.address, weiWithdrawAmount],
    onError(error) {
      console.log("Withdraw Gas Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Withdraw Gas Prepared Success", data);
    },
  });

  const {
    data,
    error,
    isError: withdrawFundsError,
    write: withdrawFunds,
  } = useContractWrite({
    ...withdrawFundsSetup,
    onSuccess(data) {
      console.log("Withdraw Funds Write Success", data);

      showNotification({
        id: "withdraw-token-pending",
        loading: true,
        title: "Pending Token Withdrawal",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Withdraw Funds Write Error", error);

      showNotification({
        id: "withdraw-token-error",
        color: "red",
        title: "Error token Withdrawal",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log("Withdraw Funds Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Withdraw token",
      });

      updateNotification({
        id: "withdraw-token-pending",
        color: "teal",
        title: "Token Withdrawal Complete",
        message: "Safe travels :)",
        icon: <CircleCheck />,
      });
    },
    onError(error) {
      console.log("Withdraw Gas Error", error);

      updateNotification({
        id: "withdraw-token-pending",
        color: "red",
        title: "Error Token Withdrawal",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const {
    data: maxWithdraw,
    isError: maxWithdrawIsError,
    isLoading: maxWithdrawIsLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userTokenBalances",
    args: [address, selectedToken?.address],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log(
        "Get User Token for withdraw Success",
        data,
        selectedToken?.address
      );
    },
    onError(error) {
      console.log("Get User Token for withdraw Error", error);
    },
  });

  return (
    <Container my="withdraw_funds">
      <Group align="end" position="center" spacing="xs">
        <Menu
          transition="pop"
          transitionDuration={150}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
          radius="md"
          control={
            <UnstyledButton className={classes.control}>
              <Group spacing="xs">
                <Image src={selectedToken?.logoURI} width={30} height={30} />
                <span className={classes.label}>
                  {selectedToken?.balance}&nbsp;{selectedToken?.symbol}
                </span>
              </Group>
              <ChevronDown size={16} className={classes.icon} />
            </UnstyledButton>
          }
        >
          {items}
        </Menu>
        <NumberInput
          precision={selectedToken?.decimals}
          value={Number(
            formatUnits(weiWithdrawAmount, selectedToken?.decimals)
          )}
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) =>
            val
              ? setWithdraw(parseUnits(String(val), selectedToken?.decimals))
              : setWithdraw(BigNumber.from(0))
          }
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xs"
              size="md"
              onClick={() => {
                maxWithdraw
                  ? setWithdraw(BigNumber.from(maxWithdraw))
                  : setWithdraw(BigNumber.from(0));
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
          onClick={() => withdrawFunds?.()}
        >
          Withdraw
        </Button>{" "}
      </Group>
    </Container>
  );
}

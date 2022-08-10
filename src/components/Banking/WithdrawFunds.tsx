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
import { parseEther, formatEther, formatUnits } from "ethers/lib/utils";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "./../../data/swapTokens";
import { forwardRef } from "react";
import { Text, Select } from "@mantine/core";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";

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

interface IUserFunds {
  logo: string;
  symbol: string;
  address: string;
  name: string;
  decimals: number;
  balance: string;
}

export default function WithdrawFunds() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [depositAmount, setDeposit] = useState(0);
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  const { chain, chains } = useNetwork();

  const currentChain: number = chain ? chain?.id : 0;

  const {
    tokens: masterTokenList,
    isLoading: tokenFetchLoading,
    isError: tokenFetchIsError,
  } = use1inchRetrieveTokens(currentChain);

  const {
    data: userTokenBalances,
    isError,
    isLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getUserAllTokenBalances",
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get All User Funds Success", data);
    },
    onError(error) {
      console.log("Get All User Funds Error", error);
    },
  });

  let parsedTokenBalances: IUserFunds[] = [];

  if (userTokenBalances) {
    userTokenBalances[0].forEach(function (tokenAddr: string, index: number) {
      console.log(tokenAddr, index);
      let tokenDetails = masterTokenList?.tokens[tokenAddr?.toLowerCase()];
      console.log(tokenDetails);
      let addDetails = {
        logo: tokenDetails.logoURI,
        symbol: tokenDetails.symbol,
        address: tokenAddr,
        name: tokenDetails.name,
        decimals: tokenDetails.decimals,
        balance: formatUnits(
          userTokenBalances[1][index],
          tokenDetails.decimals
        ),
      };
      if (!parsedTokenBalances.includes(addDetails)) {
        parsedTokenBalances.push(addDetails);
      }
    });
  }

  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const [selectedToken, setSelectedToken] = useState(
    parsedTokenBalances ? parsedTokenBalances[0] : null
  );
  const items = parsedTokenBalances.map((item) => (
    <Menu.Item
      icon={<Image src={item.logo} width={30} height={30} />}
      onClick={() => setSelectedToken(item)}
      key={item.address}
    >
      {item.balance}&nbsp;
      {item.symbol}
    </Menu.Item>
  ));

  const {
    data: maxWithdrawRead,
    isError: maxWithdrawReadIsError,
    isLoading: maxWithdrawReadIsLoading,
  } = useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "userTokenBalances",
    args: [selectedToken?.address, address],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Token for withdraw Success", data);
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
                <Image src={selectedToken?.logo} width={30} height={30} />
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
          value={depositAmount}
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) => (val ? setDeposit(val) : setDeposit(0))}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xs"
              size="md"
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
          // onClick={() => depositGas?.()}
        >
          &nbsp;Withdraw&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}

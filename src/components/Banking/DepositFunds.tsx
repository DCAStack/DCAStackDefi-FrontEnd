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
} from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";
import ViewToken from "../TokenDisplay/ViewToken";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useBalance,
  useContractRead,
  useWaitForTransaction,
  erc20ABI,
} from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { MaxUint256 } from "ethers/constants";
import { ContractInfoProps } from "../../models/PropTypes";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import swapTokens from "../../data/swapTokens";
import { TokenBadgeProps } from "../../models/PropTypes";

import { parseUnits } from "ethers/lib/utils";
import { nullToken } from "../../data/gasTokens";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFunds({
  token,
  defaultValue = 0,
}: TokenBadgeProps) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const [depositAmount, setDeposit] = useState(0);
  const { classes } = useStyles();
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const [enableApprovePrep, setApprovePrep] = useState(false);
  const [enableDepositPrep, setDepositPrep] = useState(false);

  const {
    data: depositApproveSetup,
    isError: depositApproveError,
    isLoading: depositApproveLoading,
  } = useContractRead({
    addressOrName: token.address,
    contractInterface: erc20ABI,
    functionName: "allowance",
    enabled:
      token.address.toLowerCase() !==
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    args: [address, contractAddr],
    cacheOnBlock: true,
    watch: true,
    onSuccess(data) {
      console.log("Get User Fund Allowance Success", data);
    },
    onError(error) {
      console.log("Get User Fund Allowance Error", error);
    },
  });

  const {
    config: depositFundsSetup,
    error: depositFundsError,
    isError: prepareDepositFundsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "depositFunds",
    enabled:
      token.address.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : enableDepositPrep,
    args: [token.address, parseUnits(String(depositAmount), token.decimals)],
    onError(error) {
      console.log("Deposit Prepare Funds Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Funds Success", data);
    },
  });

  const {
    data: depositFundsWriteData,
    error: depositFundsWriteError,
    isError: depositFundsWriteIsError,
    write: depositFunds,
  } = useContractWrite({
    ...depositFundsSetup,
    onSuccess(data) {
      console.log("Deposit Funds Write Success", data);
      showNotification({
        id: "deposit-token-pending",
        loading: true,
        title: "Pending Token Deposit",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },
    onError(error) {
      console.log("Deposit Funds Write Error", error);
      showNotification({
        id: "deposit-token-error",
        color: "red",
        title: "Error Token Deposit",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: depositTxPending, isSuccess: depositTxDone } =
    useWaitForTransaction({
      hash: depositFundsWriteData?.hash,
      onSuccess(data) {
        console.log("Deposit Funds Success", data);

        addRecentTransaction({
          hash: data.transactionHash,
          description: "Deposit Token",
        });

        updateNotification({
          id: "deposit-token-pending",
          color: "teal",
          title: "Token Deposit Received",
          message: "You're ready to create a schedule!",
          icon: <CircleCheck />,
        });
      },

      onError(error) {
        console.log("Deposit Funds Error", error);

        updateNotification({
          id: "deposit-token-pending",
          color: "red",
          title: "Error Token Deposit",
          message: "If this was unexpected, please raise an issue on github!",
          autoClose: true,
          disallowClose: false,
          icon: <AlertOctagon />,
        });
      },
    });

  const {
    config: prepareDepositApprove,
    error: prepareDepositApproveError,
    isError: prepareDepositApproveIsError,
  } = usePrepareContractWrite({
    addressOrName: token.address,
    contractInterface: erc20ABI,
    functionName: "approve",
    enabled:
      token.address.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? false
        : enableApprovePrep,
    args: [contractAddr, MaxUint256],
    onError(error) {
      console.log("Deposit Prepare Approve Error", error);
    },
    onSuccess(data) {
      console.log("Deposit Prepare Approve Success", data);
    },
  });

  const {
    data: depositApproveWriteData,
    error: depositApproveWriteError,
    isError: depositApproveWriteIsError,
    write: approveFunds,
  } = useContractWrite({
    ...prepareDepositApprove,
    onSuccess(data) {
      console.log("Deposit Approve Success", data);
      showNotification({
        id: "deposit-approve-pending",
        loading: true,
        title: "Pending Deposit Spend Approval",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },
    onError(error) {
      console.log("Deposit Approve Error", error);
      showNotification({
        id: "deposit-approve-error",
        color: "red",
        title: "Error Deposit Spend Approval",
        message: "If this was unexpected, please raise an issue on github!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: approveTxPending, isSuccess: approveTxDone } =
    useWaitForTransaction({
      hash: depositApproveWriteData?.hash,
      onSuccess(data) {
        console.log("Approval Transaction Success", data);

        addRecentTransaction({
          hash: data.transactionHash,
          description: "Approve Token Spend",
        });

        updateNotification({
          id: "deposit-approve-pending",
          color: "teal",
          title: "Deposit Spend Approved",
          message: "Now you can deposit funds!",
          icon: <CircleCheck />,
        });

        setDepositPrep(true);
      },
      onError(error) {
        console.log("Approval Transaction Error", error);

        updateNotification({
          id: "deposit-approve-pending",
          color: "red",
          title: "Error Deposit Spend Approval",
          message: "If this was unexpected, please raise an issue on github!",
          autoClose: true,
          disallowClose: false,
          icon: <AlertOctagon />,
        });

        setDepositPrep(false);
      },
    });

  const {
    data: maxTokenDeposit,
    isError: maxTokenDepositIsError,
    isLoading: maxTokenDepositIsLoading,
  } = useBalance({
    addressOrName: address,
    token: token.address,
    watch: true,
    enabled:
      token.address.toLowerCase() !==
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    onSuccess(data) {
      console.log("Get User Wallet Token Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet Token Balance Error", error);
    },
  });

  const {
    data: maxDeposit,
    isError: maxDepositIsError,
    isLoading: maxDepositIsLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
    enabled:
      token.address.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ? true
        : false,
    onSuccess(data) {
      console.log("Get User Wallet ETH Balance Success", data);
    },
    onError(error) {
      console.log("Get User Wallet ETH Balance Error", error);
    },
  });

  useEffect(() => {
    setDeposit(defaultValue);

    if (
      token !== nullToken &&
      depositAmount !== 0 &&
      token.address.toLowerCase() !==
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      setApprovePrep(true);
    } else {
      setApprovePrep(false);
    }

    if (
      enableDepositPrep === true &&
      token.address.toLowerCase() !==
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      //to trigger after allowance
      depositFunds?.();
    }
  }, [defaultValue, token, depositAmount, enableDepositPrep, depositFunds]);

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <NumberInput
          precision={token?.decimals}
          value={defaultValue}
          label="Deposit DCA Amount"
          radius="xs"
          size="xl"
          hideControls
          onChange={(val) => (val ? setDeposit(val) : setDeposit(0))}
          icon={<ViewToken token={token} />}
          iconWidth={115}
          rightSection={
            <Button
              variant="subtle"
              className={classes.input}
              compact
              radius="xl"
              size="md"
              onClick={() => {
                if (
                  token.address.toLowerCase() !==
                  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                ) {
                  maxTokenDeposit
                    ? setDeposit(Number(maxTokenDeposit?.formatted))
                    : setDeposit(0);
                } else {
                  maxDeposit
                    ? setDeposit(Number(maxDeposit?.formatted))
                    : setDeposit(0);
                }
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
            if (
              token.address.toLowerCase() !==
              "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            ) {
              if (depositApproveSetup) {
                //regular token
                if (maxTokenDeposit?.formatted === "0.0") {
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
                  formatEther(depositApproveSetup) === "0.0"
                    ? approveFunds?.()
                    : depositFunds?.();
                }
              }
            } else {
              //eth token
              if (maxDeposit?.formatted === "0.0") {
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
                depositFunds?.();
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

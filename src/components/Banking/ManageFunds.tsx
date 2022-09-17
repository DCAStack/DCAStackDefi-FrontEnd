import { ChangeEvent, useEffect, useState } from "react";

import {
  ActionIcon,
  Button,
  Container,
  Group,
  Menu,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  ChevronDown,
  ArrowBigLeftLine,
  ArrowBigRightLine,
  ArrowsMaximize,
  ArrowsMinimize,
} from "tabler-icons-react";
import { formatUnits } from "ethers/lib/utils";

import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import DepositEthFundsFlow from "./DepositEthFundsFlow";
import DepositFundsFlow from "./DepositFundsFlow";
import WithdrawFundsFlow from "./WithdrawFundsFlow";
import { BigNumber } from "ethers";
import { IToken } from "../../models/Interfaces";
import { nullToken } from "../../data/gasTokens";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";
import TokenBrowser from "../TokenDisplay/TokenBrowser";
import { X } from "tabler-icons-react";
import { useNetwork } from "wagmi";

interface ISetup {
  weiDefaultValue?: BigNumber;
  enableWithdraw?: boolean;
  selectedToken?: IToken;
  setToken: React.Dispatch<React.SetStateAction<IToken>>;
}

function ManageFunds({
  weiDefaultValue = BigNumber.from(0),
  enableWithdraw = false,
  selectedToken = nullToken,
  setToken,
}: ISetup) {
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
        You can select tokens to fund by clicking here!
      </Text>
      <ActionIcon
        ml={5}
        style={{
          color: theme.colorScheme === "dark" ? theme.black : theme.white,
        }}
        size="xs"
        onClick={() => setToggle(false)}
      >
        <X size={12} />
      </ActionIcon>
    </div>
  );

  const { chain } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;

  const [tokenAmount, setAmount] = useState("0");
  const [updateState, setUpdate] = useState(true);
  const [openModal, setModal] = useState(false);
  const [openToggle, setToggle] = useState(
    selectedToken === nullToken && enableWithdraw && currentChain !== 0
      ? true
      : false
  );

  let withdrawActions = WithdrawFundsFlow(selectedToken, tokenAmount);

  let depositEthActions = DepositEthFundsFlow(selectedToken, tokenAmount);
  let depositTokenActions = DepositFundsFlow(selectedToken, tokenAmount);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const re = /^\d*\.?\d*$/;
    if (event.target.value === "" || re.test(event.target.value)) {
      setAmount(event.target.value);
      setUpdate(false);
    }
  };

  useEffect(() => {
    if (selectedToken?.decimals && updateState) {
      setAmount(
        formatUnits(weiDefaultValue, selectedToken?.decimals).toString()
      );
    }
  }, [selectedToken?.decimals, weiDefaultValue, updateState]);

  return (
    <Container my="manage_funds">
      <TokenBrowser
        updateToken={setToken}
        opened={openModal}
        setOpened={setModal}
      />
      <Group align="end" position="center" spacing="xs">
        <TextInput
          styles={{
            input: {
              textAlign: "center",
            },
            icon: { pointerEvents: "all" },
          }}
          value={tokenAmount?.toString()}
          label="Fund DCA Amount"
          radius="xs"
          size="xl"
          onChange={handleChange}
          icon={
            <Tooltip
              label={tooltip}
              opened={openToggle}
              allowPointerEvents
              withArrow
              wrapLines
              transition="rotate-left"
              transitionDuration={250}
              width={220}
              gutter={theme.spacing.xs}
            >
              <UnstyledButton
                onClick={() => {
                  if (enableWithdraw && currentChain !== 0) {
                    setModal(true);
                    setToggle(false);
                  }
                }}
              >
                <TokenBadgeDisplay token={selectedToken} />
              </UnstyledButton>
            </Tooltip>
          }
          iconWidth={115}
        />
        <Menu
          control={
            <Button
              radius="xs"
              size="xl"
              rightIcon={<ChevronDown size={18} />}
              sx={{ paddingRight: 12 }}
            >
              Fund
            </Button>
          }
          transition="pop-top-right"
          position="top"
          size="lg"
        >
          <Menu.Item
            icon={<ArrowBigLeftLine size={26} color={theme.colors.blue[6]} />}
            onClick={() => {
              if (
                selectedToken?.address.toLowerCase() ===
                "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
              ) {
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
              } else {
                if (depositTokenActions?.approveMax) {
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
                    formatUnits(
                      depositTokenActions?.approveMax,
                      selectedToken?.decimals
                    ) === "0.0"
                      ? depositTokenActions?.approve?.()
                      : depositTokenActions?.deposit?.();
                  }
                }
              }
            }}
          >
            Deposit
          </Menu.Item>

          <Menu.Item
            icon={<ArrowsMaximize size={26} color={theme.colors.pink[6]} />}
            onClick={() => {
              if (
                selectedToken?.address.toLowerCase() ===
                "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
              ) {
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
                  setAmount(
                    depositEthActions?.max?.formatted
                      ? depositEthActions?.max?.formatted.toString()
                      : "0"
                  );
                }
              } else {
                if (depositTokenActions?.approveMax) {
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
                    formatUnits(
                      depositTokenActions?.approveMax,
                      selectedToken?.decimals
                    ) === "0.0"
                      ? depositTokenActions?.approve?.()
                      : depositTokenActions?.deposit?.();
                  }
                }
              }
            }}
          >
            Get Max Deposit
          </Menu.Item>

          {enableWithdraw && (
            <Menu.Item
              icon={
                <ArrowBigRightLine size={26} color={theme.colors.cyan[6]} />
              }
              onClick={() =>
                withdrawActions?.action ? withdrawActions?.action?.() : null
              }
            >
              Withdraw
            </Menu.Item>
          )}

          {enableWithdraw && (
            <Menu.Item
              icon={<ArrowsMinimize size={26} color={theme.colors.violet[6]} />}
              onClick={() => {
                setAmount(
                  withdrawActions?.max ? withdrawActions?.max.toString() : "0"
                );
              }}
            >
              Get Max Withdrraw
            </Menu.Item>
          )}
        </Menu>
      </Group>
    </Container>
  );
}

export default ManageFunds;

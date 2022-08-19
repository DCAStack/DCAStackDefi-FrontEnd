import { createStyles } from "@mantine/core";
import { ChangeEvent, useEffect, useState } from "react";

import { useNetwork } from "wagmi";
import {
  Button,
  Modal,
  Group,
  TextInput,
  Space,
  Divider,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import gasTokens from "../../data/gasTokens";
import swapTokens from "../../data/swapTokens";
import { Selector } from "tabler-icons-react";

import { IToken } from "../../models/Interfaces";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { showNotification, updateNotification } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISwapInfo {
  text: string;
  updateToken: React.Dispatch<React.SetStateAction<IToken>>;
  currToken: IToken;
}

export default function SwapToken({ text, updateToken, currToken }: ISwapInfo) {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const [opened, setOpened] = useState(false);
  const currentChain: number = chain ? chain?.id : 0;

  const {
    tokens: masterTokenList,
    isLoading: masterTokenListLoading,
    isError: masterTokenListError,
  } = use1inchRetrieveTokens(currentChain);

  const [token, setToken] = useState(currToken);
  const tokensList: IToken[] = swapTokens[currentChain];
  const [filteredTokens, setFilteredTokens] = useState(tokensList);
  useEffect(() => {
    setFilteredTokens(tokensList);
    setToken(currToken);
  }, [tokensList, currToken]);

  const searchTokens = (event: ChangeEvent<HTMLInputElement>): void => {
    if (masterTokenList) {
      const searchValue = event.target.value.toLowerCase();
      if (searchValue.length >= 3) {
        //improve search performance
        const filtered = masterTokenList?.flattenData.filter(
          (token: IToken) =>
            token.symbol.toLowerCase().includes(searchValue) ||
            token.name.toLowerCase().includes(searchValue) ||
            token.address.toLowerCase() === searchValue //exact matches only
        );
        setFilteredTokens(filtered);
      } else {
        setFilteredTokens(swapTokens[currentChain]);
      }
    } 
  };

  return (
    <>
      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        title="Select Token to Trade"
        padding="xl"
        size="65%"
      >
        <TextInput
          placeholder="Search name or paste address"
          label="Token"
          radius="xl"
          size="xl"
          onChange={searchTokens}
        />
        <Space h="xs" />
        <Group align="center" position="center" spacing="xs">
          {swapTokens[currentChain].map((token: IToken, index: number) => (
            <div
              key={token.address}
              onClick={() => {
                setOpened(false);
                setToken(token);
                updateToken(token);
              }}
            >
              <TokenBadgeDisplay key={index} token={token} />
            </div>
          ))}
        </Group>

        <Space h="md" />
        <Divider size="xl" />
        <Space h="md" />

        <ScrollArea style={{ height: 250 }} offsetScrollbars>
          <Group align="left" position="center" spacing="xs" direction="column">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token: IToken) => (
                <div
                  key={token.address}
                  onClick={() => {
                    setOpened(false);
                    setToken(token);
                    updateToken(token);
                  }}
                >
                  <TokenBadgeDisplay token={token} displayTokenName={true} />
                  <Divider my="sm" variant="dashed" />
                </div>
              ))
            ) : (
              <Text align="center">Nothing found!</Text>
            )}
          </Group>
        </ScrollArea>
      </Modal>

      <Group position="center">
        <Button
          variant="light"
          radius="xs"
          size="xl"
          rightIcon={<Selector size={60} strokeWidth={2} />}
          onClick={() => setOpened(true)}
        >
          {text}&nbsp;&nbsp;
          <TokenBadgeDisplay token={token} />
        </Button>
      </Group>
    </>
  );
}

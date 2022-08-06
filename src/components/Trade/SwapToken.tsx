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
} from "@mantine/core";
import TokenBadge from "../TokenDisplay/TokenBadge";
import ViewToken from "../TokenDisplay/ViewToken";
import gasTokens from "../../data/gasTokens";
import swapTokens from "../../data/swapTokens";
import { Selector } from "tabler-icons-react";

import { IToken } from "../../models/Interfaces";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISwapText {
  text: string;
  updateToken: React.Dispatch<React.SetStateAction<IToken>>;
}

export default function SwapToken({ text, updateToken }: ISwapText) {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const [opened, setOpened] = useState(false);
  const currentChain: number = chain?.id as keyof typeof gasTokens;

  const {
    tokens: masterTokenList,
    isLoading,
    isError,
  } = use1inchRetrieveTokens(currentChain);

  const [token, setToken] = useState(swapTokens[0][0]);
  const tokensList: IToken[] = swapTokens[currentChain];
  const [filteredTokens, setFilteredTokens] = useState(tokensList);
  useEffect(() => setFilteredTokens(tokensList), [tokensList]);

  const searchTokens = (event: ChangeEvent<HTMLInputElement>): void => {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue.length >= 3) {
      //improve search performance
      const filtered = masterTokenList.filter(
        (token: IToken) =>
          token.symbol.toLowerCase().includes(searchValue) ||
          token.name.toLowerCase().includes(searchValue) ||
          token.address.toLowerCase() === searchValue //exact matches only
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(swapTokens[currentChain]);
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
              <ViewToken key={index} token={token} />
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
                  <TokenBadge token={token} displayTokenName={true} />
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
          <TokenBadge token={token} />
        </Button>
      </Group>
    </>
  );
}

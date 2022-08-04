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
import TokenBadge from "./TokenBadge";
import ViewToken from "./ViewToken";
import gasTokens from "./../../data/gasTokens";
import swapTokens from "./../../data/swapTokens";
import { Selector } from "tabler-icons-react";

import { IToken } from "../../models/Interfaces";
// import useSWR from "swr";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

interface ISwapText {
  text: string;
}

export default function SwapToken({ text }: ISwapText) {
  const { classes } = useStyles();
  const { chain, chains } = useNetwork();
  const [opened, setOpened] = useState(false);
  const currentChain: number = chain?.id as keyof typeof gasTokens;

  const [token, setToken] = useState(swapTokens[0][0]);

  // const { data: fetchSuccess, error: fetchError } = useSWR(
  //   // `https://api.1inch.io/v4.0/${currentChain}/tokens`,
  //   `https://api.1inch.io/v4.0/1/tokens`,
  //   fetcher
  // );

  // if (fetchSuccess) {
  //   console.log("fetch success", fetchSuccess);
  //   if (fetchSuccess.tokens) {
  //   }
  // }

  // if (fetchError) console.log("fetch error", fetchError);

  const tokensList: IToken[] = swapTokens[currentChain];
  const [filteredTokens, setFilteredTokens] = useState(tokensList);
  useEffect(() => setFilteredTokens(tokensList), [tokensList]);

  const searchTokens = (event: ChangeEvent<HTMLInputElement>): void => {
    const searchValue = event.target.value.toLowerCase();
    const filtered = tokensList.filter(
      (token: IToken) =>
        token.symbol.toLowerCase().includes(searchValue) ||
        token.name.toLowerCase().includes(searchValue) ||
        token.address.toLowerCase().includes(searchValue)
    );
    setFilteredTokens(filtered);
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
                  }}
                >
                  <TokenBadge token={token} displayTokenName={true} />
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

import { createStyles } from "@mantine/core";
import { useState } from "react";

import { useNetwork } from "wagmi";
import {
  Button,
  Modal,
  Group,
  TextInput,
  Space,
  Autocomplete,
  Divider,
  ScrollArea,
} from "@mantine/core";
import TokenBadge from "./TokenBadge";
import ViewToken from "./ViewToken";
import gasTokens from "./../../data/gasTokens";
import swapTokens from "./../../data/swapTokens";
import { Selector } from "tabler-icons-react";

import { IToken } from "../../models/Interfaces";

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
        />
        <Space h="xs" />
        <Group align="center" position="center" spacing="xs">
          {swapTokens[currentChain].map((token: IToken, index: number) => (
            <ViewToken key={index} token={token} />
          ))}
        </Group>

        <Space h="md" />
        <Divider size="xl" />
        <Space h="md" />

        <ScrollArea style={{ height: 250 }} offsetScrollbars>
          <Group align="left" position="center" spacing="xs" direction="column">
            {swapTokens[currentChain].map((token: IToken, index: number) => (
              <TokenBadge token={token} displayTokenName={true} />
            ))}
            {swapTokens[currentChain].map((token: IToken, index: number) => (
              <TokenBadge token={token} displayTokenName={true} />
            ))}
            {swapTokens[currentChain].map((token: IToken, index: number) => (
              <TokenBadge token={token} displayTokenName={true} />
            ))}
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
          <TokenBadge token={swapTokens[0][0]} />
        </Button>
      </Group>
    </>
  );
}

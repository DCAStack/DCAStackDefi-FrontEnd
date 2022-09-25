import { useState } from "react";

import { Button, Group } from "@mantine/core";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import { Selector } from "tabler-icons-react";

import { IToken } from "../../models/Interfaces";
import TokenBrowser from "../TokenDisplay/TokenBrowser";

interface ISwapInfo {
  text: string;
  updateToken: React.Dispatch<React.SetStateAction<IToken>>;
  currToken: IToken;
  isSell: boolean;
}

export default function SwapToken({
  text,
  updateToken,
  currToken,
  isSell,
}: ISwapInfo) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <TokenBrowser
        updateToken={updateToken}
        opened={opened}
        setOpened={setOpened}
        isSell={isSell}
      />
      <Group position="center">
        <Button
          variant="light"
          radius="xs"
          size="xl"
          rightIcon={<Selector size={60} strokeWidth={2} />}
          onClick={() => setOpened(true)}
        >
          {text}&nbsp;&nbsp;
          <TokenBadgeDisplay token={currToken} />
        </Button>
      </Group>
    </>
  );
}

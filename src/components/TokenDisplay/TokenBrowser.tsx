import { ChangeEvent, useEffect, useState } from "react";

import {
  Divider,
  Group,
  Modal,
  ScrollArea,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { useNetwork } from "wagmi";
import { TokenBadgeDisplay } from "../TokenDisplay/TokenBadgeDisplay";

import swapTokens from "../../data/swapTokens";

import { IToken } from "../../models/Interfaces";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";

interface ISwapInfo {
  updateToken: React.Dispatch<React.SetStateAction<IToken>>;
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  isSell: boolean;
}

export default function TokenBrowser({
  updateToken,
  opened,
  setOpened,
  isSell,
}: ISwapInfo) {
  const { chain } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;

  const { tokens: masterTokenList } = use1inchRetrieveTokens(currentChain);

  const tokensList: IToken[] = swapTokens[currentChain];
  const [filteredTokens, setFilteredTokens] = useState(tokensList);
  useEffect(() => {
    setFilteredTokens(tokensList);
  }, [tokensList]);

  const searchTokens = (event: ChangeEvent<HTMLInputElement>): void => {
    if (masterTokenList) {
      const searchValue = event.target.value.toLowerCase();
      //improve search performance
      if (searchValue.length >= 3) {
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
          {currentChain in swapTokens &&
            swapTokens[currentChain].map((token: IToken, index: number) => (
              <div
                key={token.address}
                onClick={() => {
                  setOpened(false);
                  updateToken(token);
                }}
              >
                {isSell &&
                  token.address.toLowerCase() !==
                    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && (
                    <TokenBadgeDisplay key={index} token={token} />
                  )}
                {!isSell && <TokenBadgeDisplay key={index} token={token} />}
              </div>
            ))}
        </Group>

        <Space h="md" />
        <Divider size="xl" />
        <Space h="md" />

        <ScrollArea style={{ height: 250 }} offsetScrollbars>
          <Group align="left" position="center" spacing="xs" direction="column">
            {filteredTokens?.length > 0 ? (
              filteredTokens.map((token: IToken) => (
                <div
                  key={token.address}
                  onClick={() => {
                    setOpened(false);
                    updateToken(token);
                  }}
                >
                  {isSell &&
                    token.address.toLowerCase() !==
                      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && (
                      <TokenBadgeDisplay
                        token={token}
                        displayTokenName={true}
                      />
                    )}
                  {!isSell && (
                    <TokenBadgeDisplay token={token} displayTokenName={true} />
                  )}
                  <Divider my="sm" variant="dashed" />
                </div>
              ))
            ) : (
              <Text align="center">Nothing found!</Text>
            )}
          </Group>
        </ScrollArea>
        {isSell && (
          <Text size="xs" color="red" align="center">
            We do not support selling native token at this time!
          </Text>
        )}
      </Modal>
    </>
  );
}

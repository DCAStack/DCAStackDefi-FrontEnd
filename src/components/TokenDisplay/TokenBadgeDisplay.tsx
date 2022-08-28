import { TokenBadgeProps } from "../../models/PropTypes";
import { Text, Badge, Avatar, Stack } from "@mantine/core";
import { Coin } from "tabler-icons-react";

export const TokenBadgeDisplay = ({
  token,
  displayTokenName,
  className,
}: TokenBadgeProps) => {
  return (
    <Stack align="center" justify="space-between">
      <Badge
        sx={{ paddingLeft: 0 }}
        size="xl"
        radius="xl"
        leftSection={
          <Avatar alt="Token Badge" size={30} src={token.logoURI}>
            {" "}
            <Coin size={30} />{" "}
          </Avatar>
        }
      >
        {token.symbol}
      </Badge>
      {displayTokenName === true && <Text size="md">{token.name}</Text>}
    </Stack>
  );
};

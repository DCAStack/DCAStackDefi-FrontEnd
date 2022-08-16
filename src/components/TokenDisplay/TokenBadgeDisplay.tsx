import { TokenBadgeProps } from "../../models/PropTypes";
import { createStyles, Text, Badge, Avatar, Stack, Group } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  imgDim: {
    height: 30,
    width: 30,
  },
}));

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
        leftSection={<Avatar alt="Token Badge" size={30} src={token.logoURI} />}
      >
        {token.symbol}
      </Badge>
      {displayTokenName === true && <Text size="md">{token.name}</Text>}
    </Stack>
  );
};

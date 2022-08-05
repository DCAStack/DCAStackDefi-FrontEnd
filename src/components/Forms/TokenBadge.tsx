import { TokenBadgeProps } from "../../models/PropTypes";
import { createStyles, Text } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  imgDim: {
    height: 30,
    width: 30,
  },
}));

const TokenBadge = ({
  token,
  displayTokenName,
  className,
}: TokenBadgeProps) => {
  const { classes } = useStyles();

  return (
    <span className={(className ? className + " " : "") + "flex items-center"}>
      {token.logoURI && (
        <img src={token.logoURI} alt={token.name} className={classes.imgDim} />
      )}
      &nbsp;{token.symbol}
      {displayTokenName === true && <Text size="md">{token.name}</Text>}
    </span>
  );
};

export default TokenBadge;

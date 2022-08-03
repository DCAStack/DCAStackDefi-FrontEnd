import { TokenBadgeProps } from "../../models/PropTypes";
import { createStyles } from "@mantine/core";

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
  let displayData;
  if (displayTokenName) {
    displayData = `${token.symbol}: ${token.name}`;
  } else {
    displayData = `${token.symbol}`;
  }

  return (
    <span className={(className ? className + " " : "") + "flex items-center"}>
      {token.logoURI && (
        <img src={token.logoURI} alt={token.name} className={classes.imgDim} />
      )}
      {displayData}
    </span>
  );
};

export default TokenBadge;

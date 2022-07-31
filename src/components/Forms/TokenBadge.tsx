import { TokenBadgeProps } from "../../models/PropTypes";
import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  imgDim: {
    height: 30,
    width: 30,
  },
}));

const TokenBadge = ({ token, className }: TokenBadgeProps) => {
  const { classes } = useStyles();

  return (
    <span className={(className ? className + " " : "") + "flex items-center"}>
      {token.logoURI && (
        <img src={token.logoURI} alt={token.name} className={classes.imgDim} />
      )}
      {token.symbol}
    </span>
  );
};

export default TokenBadge;

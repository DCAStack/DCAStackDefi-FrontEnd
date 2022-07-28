import {
  Group,
  NumberInput,
  Grid,
  Container,
  Button,
  createStyles,
  Avatar,
  Space,
} from "@mantine/core";

import GasToken from "../Forms/GasToken";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));

export default function DepositFunds() {
  const { classes } = useStyles();

  return (
    <Container my="deposit_funds">
      <Group align="end" position="center" spacing="xs">
        <GasToken />
        <NumberInput
          defaultValue={0}
          label="Deposit Amount"
          radius="xs"
          size="xl"
          hideControls
        />{" "}
        <Button className={classes.input} compact radius="xs" size="xl">
          MAX
        </Button>{" "}
        <Button compact className={classes.input} radius="xs" size="xl">
          &nbsp;Deposit&nbsp;
        </Button>{" "}
      </Group>
    </Container>
  );
}

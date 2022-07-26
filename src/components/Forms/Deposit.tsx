import {
  Group,
  NumberInput,
  Grid,
  Container,
  Button,
  createStyles,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  input: {
    height: 60,
  },
}));
export default function DepositFunds() {
  const { classes } = useStyles();

  return (
    <Container my="deposit_funds">
      <Grid align="end" justify="center">
        <Grid.Col xs={6}>
          <NumberInput
            defaultValue={1}
            placeholder="Enter Deposit Amount"
            label="Deposit Gas"
            description="Please enter how much you'd like to deposit."
            radius="xs"
            size="xl"
            hideControls
          />
        </Grid.Col>

        <Grid.Col xs={4}>
          <Group spacing="xs">
            {" "}
            <Button compact className={classes.input} radius="xs" size="xl">
              MAX
            </Button>{" "}
            <Button compact className={classes.input} radius="xs" size="xl">
              Deposit
            </Button>{" "}
          </Group>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

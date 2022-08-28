import {
  Anchor,
  Burger,
  Center,
  Container,
  createStyles,
  Group,
  Header,
  Menu,
  Paper,
  Text,
  Transition,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "tabler-icons-react";

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  logo: {
    height: 160,
    width: 100,
  },

  root: {
    position: "relative",
    zIndex: 1,
  },

  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color:
        theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
    },
  },
  linkLabel: {
    marginRight: 5,
  },
}));

interface HeaderResponsiveProps {
  links: {
    link: string;
    label: string;
    links?: { link: string; label: string }[];
  }[];
}

function HeaderResponsive({ links }: HeaderResponsiveProps) {
  const location = useLocation();
  const [opened, toggleOpened] = useBooleanToggle(false);
  const [active, setActive] = useState(location.pathname);
  const { classes, cx } = useStyles();

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item
        key={item.link}
        component="a"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          delay={0}
          transitionDuration={0}
          placement="end"
          gutter={1}
          control={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <ChevronDown size={12} />
              </Center>
            </a>
          }
        >
          {menuItems}
        </Menu>
      );
    }

    return (
      <Anchor
        inherit
        component={Link}
        onClick={(event: any) => {
          // console.log("this", event, event.preventDefault());
          // event.preventDefault();
          setActive(link.link);
          toggleOpened(false);
        }}
        key={link.label}
        to={`${link.link}`}
        className={cx(classes.link, {
          [classes.linkActive]: active === link.link,
        })}
      >
        {link.label}
      </Anchor>
    );
  });

  return (
    <Header height={HEADER_HEIGHT} mb={120} className={classes.root}>
      <Container className={classes.header} fluid>
        <Anchor component={Link} to={`/`}>
          <Text
            component="span"
            align="center"
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan", deg: 45 }}
            size="xl"
            weight={800}
          >
            DCA Stack
          </Text>
        </Anchor>

        <Group>
          <Group ml={50} spacing={5} className={classes.links}>
            {items}
          </Group>
          <ConnectButton />
        </Group>

        <Burger
          opened={opened}
          onClick={() => toggleOpened()}
          className={classes.burger}
          size="sm"
        />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Container>
    </Header>
  );
}

const headerLinks = {
  links: [
    {
      link: "/",
      label: "Home",
    },
    {
      link: "/dashboard",
      label: "Dashboard",
    },
    {
      link: "/gas",
      label: "Gas",
    },
    {
      link: "/trade",
      label: "Trade",
    },
    {
      link: "#1",
      label: "Help",
      links: [
        {
          link: "https://docs.dcastack.com/",
          label: "Documentation",
        },
        {
          link: "https://github.com/",
          label: "Report An Issue",
        },
        {
          link: "https://github.com/",
          label: "Contact Us",
        },
        {
          link: "https://status.dcastack.com/",
          label: "Server Status",
        },
      ],
    },
  ],
};

export function HeaderPopulated() {
  return <HeaderResponsive links={headerLinks.links} />;
}

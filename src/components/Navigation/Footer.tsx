import React from "react";
import {
  createStyles,
  Anchor,
  Group,
  ActionIcon,
  Image,
  Text,
} from "@mantine/core";
import { BrandTwitter, BrandGithub } from "tabler-icons-react";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  // could improve this
  footer: {
    marginTop: 120,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing.md}px ${theme.spacing.md}px`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
  },
}));

interface FooterCenteredProps {
  links: { link: string; label: string }[];
}

function FooterCentered({ links }: FooterCenteredProps) {
  const { classes } = useStyles();
  const items = links.map((link) => (
    <Anchor inherit component={Link} key={link.label} to={`${link.link}`}>
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Group className={classes.links} position="center" spacing="xs">
          {items}
          <Text color="dimmed" size="sm">
            © {new Date().getFullYear()} DCAStack.com. All rights reserved.
          </Text>
        </Group>
        <Group spacing={0} position="right" noWrap>
          <ActionIcon
            size="lg"
            component="a"
            href={"https://twitter.com/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrandTwitter size={18} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            component="a"
            href={"https://github.com/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrandGithub size={18} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  );
}

const footerLinks = {
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
  ],
};

export function FooterPopulated() {
  return <FooterCentered links={footerLinks.links} />;
}

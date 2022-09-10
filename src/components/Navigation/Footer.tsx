import {
  createStyles,
  Text,
  Container,
  ActionIcon,
  Group,
  Anchor,
} from "@mantine/core";
import { BrandTwitter, BrandGithub } from "tabler-icons-react";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 120,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  logo: {
    maxWidth: 200,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  wrapper: {
    width: 160,
  },

  link: {
    display: "block",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  social: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
    },
  },
}));

interface FooterLinksProps {
  data: {
    externalLinks?: { label: string; link: string }[];
    title: string;
    links?: { label: string; link: string }[];
  }[];
}

export function FooterLinks({ data }: FooterLinksProps) {
  const { classes } = useStyles();
  const groups = data.map((group) => {
    const links = group.links?.map((link, index) => (
      <Anchor
        component={Link}
        to={link.link}
        key={index}
        className={classes.link}
      >
        {link.label}
      </Anchor>
    ));

    const externalLinks = group.externalLinks?.map((link, index) => (
      <Anchor
        target="_blank"
        key={index}
        rel="noopener noreferrer"
        href={link.link}
        className={classes.link}
      >
        {link.label}
      </Anchor>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
        {externalLinks}
      </div>
    );
  });
  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
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
          <Text size="xs" color="dimmed" className={classes.description}>
            Automate your crypto dollar cost averaging on defi.
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text color="dimmed" size="sm">
          © {new Date().getFullYear()} DCAStack.com. All rights reserved.
        </Text>

        <Group spacing={0} className={classes.social} position="right" noWrap>
          <ActionIcon
            size="lg"
            component="a"
            href={"https://twitter.com/DcaStack"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrandTwitter size={18} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            component="a"
            href={"https://github.com/DCAStack"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrandGithub size={18} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}

const footerLinks = {
  data: [
    {
      title: "DCA Stack",
      links: [
        {
          label: "Home",
          link: "/",
        },
        {
          label: "Dashboard",
          link: "/dashboard",
        },
        {
          label: "Gas",
          link: "/gas",
        },
        {
          label: "Trade",
          link: "/trade",
        },
      ],
    },
    {
      externalLinks: [
        {
          label: "Follow on Twitter",
          link: "https://twitter.com/DcaStack",
        },
        {
          label: "Follow on Github",
          link: "https://github.com/DCAStack",
        },
      ],
      title: "Community",
    },
    {
      externalLinks: [
        {
          label: "Documentation",
          link: "https://defidocs.dcastack.com/",
        },
        {
          label: "Report An Issue",
          link: "https://github.com/DCAStack",
        },
        {
          label: "Contact Us",
          link: "https://twitter.com/DcaStack",
        },
        {
          label: "Server Status",
          link: "https://status.dcastack.com/",
        },
      ],
      title: "Help",
    },
    {
      external: false,
      title: "Legal",
      links: [
        {
          label: "Disclaimer",
          link: "/disclaimer",
        },
        {
          label: "Privacy Policy",
          link: "/privacy",
        },
      ],
    },
  ],
};

export function FooterPopulated() {
  return <FooterLinks data={footerLinks.data} />;
}

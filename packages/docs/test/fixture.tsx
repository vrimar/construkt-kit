import { FolderOpen, Users } from "lucide-react";
import { type ReactNode, createContext, useContext, useState } from "react";

import type { DocsHeading, DocsSearchDoc, NavNode } from "../src/core/types";
import type { DocsLinkComponent } from "../src/react/types";

export const nav: NavNode[] = [
  { kind: "link", id: "overview", title: "Overview", href: "/docs/" },
  { kind: "link", id: "get-started", title: "Get started", href: "/docs/get-started/" },
  {
    kind: "branch",
    id: "projects",
    title: "Projects",
    icon: FolderOpen,
    children: [
      { kind: "link", id: "create", title: "Create a project", href: "/docs/projects/create/" },
      { kind: "link", id: "settings", title: "Project settings", href: "/docs/projects/settings/" },
      {
        kind: "link",
        id: "archive",
        title: "Archive, restore, delete",
        href: "/docs/projects/archive/",
      },
    ],
  },
  {
    kind: "branch",
    id: "sharing",
    title: "Sharing",
    icon: Users,
    children: [
      { kind: "link", id: "invite", title: "Invite people", href: "/docs/sharing/invite/" },
      { kind: "link", id: "roles", title: "Roles and permissions", href: "/docs/sharing/roles/" },
      {
        kind: "branch",
        id: "sharing-more",
        title: "More",
        children: [
          {
            kind: "link",
            id: "transfer",
            title: "Transfer ownership",
            href: "/docs/sharing/transfer/",
          },
          {
            kind: "link",
            id: "sso",
            title: "What is single sign-on?",
            href: "/what-is-single-sign-on/",
            external: true,
          },
        ],
      },
    ],
  },
];

export const headings: DocsHeading[] = [
  { id: "add-a-role", text: "Add a role", depth: 2 },
  { id: "from-a-template", text: "From a template", depth: 3 },
  { id: "reorder-roles", text: "Reorder roles", depth: 2 },
  { id: "limits", text: "Limits", depth: 2 },
];

const section = (
  route: string,
  title: string,
  anchor: string,
  heading: string,
  depth: number,
  text: string,
): DocsSearchDoc => ({
  id: `${route}#${anchor}`,
  route,
  anchor,
  title,
  heading,
  depth,
  section: "Sharing",
  text,
});

const searchDocs: DocsSearchDoc[] = [
  {
    id: "/docs/sharing/invite",
    route: "/docs/sharing/invite",
    title: "Invite people",
    heading: "",
    section: "Sharing",
    text: "Invite people by email or share a link. Each invitation carries a role.",
  },
  section(
    "/docs/sharing/invite",
    "Invite people",
    "choose-a-role",
    "Choose a role",
    2,
    "Every invitation carries a role. The person gets it when they accept, and an Owner can change it later from the member list.",
  ),
  {
    id: "/docs/sharing/roles",
    route: "/docs/sharing/roles",
    title: "Roles and permissions",
    heading: "",
    section: "Sharing",
    text: "A role is a set of permissions, and everyone in a project has one.",
  },
  section(
    "/docs/sharing/roles",
    "Roles and permissions",
    "add-a-role",
    "Add a role",
    2,
    "Open the project menu. Choose Add role.",
  ),
  section(
    "/docs/sharing/roles",
    "Roles and permissions",
    "from-a-template",
    "From a template",
    3,
    "Pick a template from the list. Each permission becomes a switch; press Esc to cancel.",
  ),
  section(
    "/docs/sharing/roles",
    "Roles and permissions",
    "reorder-roles",
    "Reorder roles",
    2,
    "Drag a role by its handle. Owner always stays first.",
  ),
  section(
    "/docs/sharing/roles",
    "Roles and permissions",
    "limits",
    "Limits",
    2,
    "Roles per project: 200.",
  ),
];

export const searchIndexUrl = `data:application/json,${encodeURIComponent(JSON.stringify(searchDocs))}`;

const RouteContext = createContext<(href: string) => void>(() => undefined);

/** Follows links by changing the story's route, as a router would. */
export const StoryLink: DocsLinkComponent = ({ href, children, onClick, ...props }) => {
  const navigate = useContext(RouteContext);
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        navigate(href);
      }}
    >
      {children}
    </a>
  );
};

export const WithRoute = ({
  initial,
  children,
}: {
  initial: string;
  children: (route: string, navigate: (href: string) => void) => ReactNode;
}) => {
  const [route, setRoute] = useState(initial);
  return <RouteContext value={setRoute}>{children(route, setRoute)}</RouteContext>;
};

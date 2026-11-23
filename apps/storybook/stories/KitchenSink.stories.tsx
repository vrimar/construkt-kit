import { DataGrid, type ColumnDef } from "@construkt-kit/data-grid";
import preview from "@construkt-kit/story-kit/preview";
import {
  Accordion,
  Alert,
  ApplySelect,
  Avatar,
  Badge,
  Button,
  Box,
  Breadcrumb,
  Calendar,
  Card,
  Chat,
  Checkbox,
  Combobox,
  CommandPalette,
  createDataTableColumnHelper,
  DataTable,
  DatePicker,
  Dialog,
  DraggableTreeNode,
  Drawer,
  EmptyState,
  Field,
  FileUpload,
  Grid,
  Heading,
  HStack,
  Input,
  Kbd,
  Link,
  Menu,
  NumberInput,
  PasswordInput,
  Popover,
  Progress,
  RadioCard,
  SearchInput,
  Select,
  Separator,
  SkeletonCircle,
  SkeletonText,
  Slider,
  Stack,
  Stat,
  Switch,
  Spinner,
  Table,
  Tabs,
  Tag,
  TagSelect,
  TagsInput,
  Text,
  Textarea,
  Toaster,
  toaster,
  TreeView,
  Wrap,
} from "@construkt-kit/ui";
import { type ReactNode, useState } from "react";

const meta = preview.meta({
  title: "Demos/Kitchen Sink",
  parameters: { layout: "fullscreen" },
});

function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card.Root
      minW="0"
      id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
    >
      <Card.Header>
        <Card.Title as="h2">{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">{children}</Stack>
      </Card.Body>
    </Card.Root>
  );
}

const teams = ["Design", "Engineering", "Operations"];
const members = [
  { name: "Alex Morgan", role: "Designer", status: "Active" },
  { name: "Sam Rivera", role: "Engineer", status: "Active" },
  { name: "Jamie Chen", role: "Manager", status: "Invited" },
];

const projects = [
  { id: 1, name: "Website refresh", team: "Design", status: "In progress", tasks: 24 },
  { id: 2, name: "API migration", team: "Engineering", status: "In review", tasks: 18 },
  { id: 3, name: "Onboarding", team: "Operations", status: "Planned", tasks: 12 },
  { id: 4, name: "Mobile app", team: "Engineering", status: "In progress", tasks: 32 },
  { id: 5, name: "Brand guidelines", team: "Design", status: "Complete", tasks: 16 },
  { id: 6, name: "Release checklist", team: "Operations", status: "In review", tasks: 8 },
  { id: 7, name: "Component library", team: "Design", status: "In progress", tasks: 48 },
  { id: 8, name: "Search improvements", team: "Engineering", status: "Planned", tasks: 20 },
];
type Project = (typeof projects)[number];
const columnHelper = createDataTableColumnHelper<Project>();
const tableColumns = [
  columnHelper.accessor("name", { header: "Project", meta: { type: "input", card: "title" } }),
  columnHelper.accessor("team", { header: "Team", meta: { type: "select" } }),
  columnHelper.accessor("status", { header: "Status", meta: { type: "select" } }),
  columnHelper.accessor("tasks", { header: "Tasks", meta: { type: "number" } }),
];
const gridColumns: ColumnDef<Project>[] = [
  { id: "name", field: "name", header: "Project", width: 240 },
  { id: "team", field: "team", header: "Team", width: 180 },
  { id: "status", field: "status", header: "Status", width: 180 },
  { id: "tasks", field: "tasks", header: "Tasks", width: 120 },
];

function ProjectTableDemo() {
  return (
    <DataTable
      clientSide
      mobileLayout="cards"
      data={projects}
      columnDefs={tableColumns}
      defaultParams={{ pageSize: 5 }}
    />
  );
}

function SelectionDemo() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>(["Design"]);
  const [applied, setApplied] = useState<string[]>(["Engineering"]);
  const shown = teams.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <Combobox.Root
        items={shown}
        getItemValue={(item) => item}
        getItemLabel={(item) => item}
        onInputValueChange={(value, { reason }) => setQuery(reason === "input-change" ? value : "")}
      >
        <Combobox.Label>Find a team</Combobox.Label>
        <Combobox.Control>
          <Combobox.Input placeholder="Type to filter…" />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Combobox.Content>
          <Combobox.Empty>No teams found.</Combobox.Empty>
          <Combobox.List>
            {shown.map((item) => (
              <Combobox.Item
                key={item}
                item={item}
              >
                <Combobox.ItemText>{item}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
      <Field label="Contributors">
        <TagSelect
          items={teams}
          getItemValue={(item) => item}
          getItemLabel={(item) => item}
          value={tags}
          onValueChange={setTags}
          placeholder="Add teams"
        />
      </Field>
      <Field label="Apply team filter">
        <ApplySelect
          items={teams}
          getItemValue={(item) => item}
          getItemLabel={(item) => item}
          value={applied}
          onValueChange={setApplied}
          actions={{ toggleAll: true }}
        />
      </Field>
      <Text
        textStyle="sm"
        color="fg.muted"
      >
        Applied: {applied.join(", ") || "No teams"}
      </Text>
      <TagsInput.Root defaultValue={["Design", "Review"]}>
        <TagsInput.Label>Custom labels</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Items />
          <TagsInput.Input placeholder="Type and press Enter…" />
        </TagsInput.Control>
        <TagsInput.HiddenInput />
      </TagsInput.Root>
    </>
  );
}

interface ProjectNode {
  id: string;
  name: string;
  children?: ProjectNode[];
}
const projectNodes: ProjectNode[] = [
  {
    id: "design",
    name: "Design",
    children: [
      { id: "brand", name: "Brand guidelines" },
      { id: "website", name: "Website refresh" },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    children: [
      { id: "api", name: "API migration" },
      { id: "mobile", name: "Mobile app" },
    ],
  },
  { id: "archive", name: "Archive", children: [{ id: "launch", name: "Spring launch" }] },
];

function ProjectTreeDemo() {
  const [selected, setSelected] = useState<string[]>(["website"]);
  return (
    <>
      <TreeView.Root
        nodes={projectNodes}
        getNodeValue={(node) => node.id}
        getNodeLabel={(node) => node.name}
        defaultExpandedValue={["design", "engineering"]}
        selectedValue={selected}
        onSelectionChange={setSelected}
      >
        <TreeView.Tree aria-label="Project folders">
          {projectNodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
      <Text
        textStyle="sm"
        color="fg.muted"
      >
        Selected: {selected.join(", ") || "None"}
      </Text>
    </>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const commands = ["Create project", "Invite a teammate", "Export report"];
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
      >
        Open command palette
      </Button>
      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
      >
        <CommandPalette.Input placeholder="Search actions…" />
        <CommandPalette.List>
          {commands
            .filter((command) => command.toLowerCase().includes(query.trim().toLowerCase()))
            .map((command) => (
              <CommandPalette.Item
                key={command}
                value={command}
                label={command}
                onSelect={() =>
                  toaster.create({ title: `${command} selected`, type: "success", closable: true })
                }
              />
            ))}
          <CommandPalette.Empty>No matching actions.</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </>
  );
}

function ChatDemo() {
  const [messages, setMessages] = useState<string[]>([]);
  return (
    <>
      <Stack
        role="log"
        aria-label="Demo conversation"
        gap="3"
      >
        <Chat.Message
          sender="assistant"
          name="Project assistant"
        >
          24 tasks remaining.
        </Chat.Message>
        {messages.map((message, index) => (
          <Stack
            key={index}
            gap="3"
          >
            <Chat.Message sender="user">{message}</Chat.Message>
            <Chat.Message
              sender="assistant"
              name="Project assistant"
            >
              Message received.
            </Chat.Message>
          </Stack>
        ))}
      </Stack>
      <Chat.Composer
        inputLabel="Message the demo assistant"
        placeholder="Message…"
        onSend={(message) => setMessages((current) => [...current, message])}
      />
    </>
  );
}

function KitchenSinkDemo() {
  const [team, setTeam] = useState<string | null>("Design");
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState([65]);
  const visibleMembers = members.filter((member) =>
    member.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const showToast = (title: string) => toaster.create({ title, type: "success", closable: true });

  return (
    <Stack
      as="main"
      data-story-scroll
      gap="6"
      maxW="1440px"
      mx="auto"
      p={{ base: "4", md: "8" }}
    >
      <Toaster />
      <Stack gap="2">
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#kitchen-sink">Construkt Kit</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link>Component demos</Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <Heading
          as="h1"
          textStyle="2xl"
          id="kitchen-sink"
        >
          Kitchen sink
        </Heading>
        <Wrap
          as="nav"
          aria-label="Jump to component section"
          gap="3"
        >
          <Link href="#data-table">Data table</Link>
          <Link href="#data-grid">Data grid</Link>
          <Link href="#selection">Selection</Link>
          <Link href="#dates-calendar">Dates</Link>
          <Link href="#project-tree">Tree</Link>
          <Link href="#files">Files</Link>
          <Link href="#overlays-actions">Overlays</Link>
          <Link href="#chat">Chat</Link>
        </Wrap>
      </Stack>

      <Grid
        columns={{ base: 1, md: 2, xl: 3 }}
        gap="5"
        alignItems="start"
      >
        <DemoSection title="Buttons & labels">
          <Wrap gap="2">
            <Button onClick={() => showToast("Primary action clicked")}>Primary</Button>
            <Button
              variant="outline"
              onClick={() => showToast("Outline action clicked")}
            >
              Outline
            </Button>
            <Button
              variant="subtle"
              onClick={() => showToast("Subtle action clicked")}
            >
              Subtle
            </Button>
            <Button
              variant="plain"
              onClick={() => showToast("Plain action clicked")}
            >
              Plain
            </Button>
          </Wrap>
          <Wrap
            gap="2"
            alignItems="center"
          >
            <Button
              size="sm"
              onClick={() => showToast("Small action clicked")}
            >
              Small
            </Button>
            <Button
              size="lg"
              onClick={() => showToast("Large action clicked")}
            >
              Large
            </Button>
            <Button disabled>Disabled</Button>
          </Wrap>
          <Separator />
          <Wrap gap="2">
            <Badge colorPalette="success">Active</Badge>
            <Badge colorPalette="warning">Pending</Badge>
            <Badge colorPalette="danger">Error</Badge>
            <Badge variant="outline">Draft</Badge>
          </Wrap>
          <Wrap gap="2">
            <Tag.Root>
              <Tag.Label>Design system</Tag.Label>
            </Tag.Root>
            <Tag.Root variant="outline">
              <Tag.Label>Components</Tag.Label>
            </Tag.Root>
          </Wrap>
          <HStack gap="2">
            <Text textStyle="sm">Keyboard hints</Text>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </HStack>
        </DemoSection>

        <DemoSection title="Form controls">
          <Field label="Project name">
            <Input defaultValue="Website refresh" />
          </Field>
          <Field label="Team">
            <Select
              items={teams}
              getItemValue={(item) => item}
              getItemLabel={(item) => item}
              value={team}
              onValueChange={setTeam}
              placeholder="Select team"
              search
            />
          </Field>
          <Field label="Notes">
            <Textarea
              placeholder="Notes…"
              rows={2}
            />
          </Field>
          <Field
            label="Email"
            invalid
            errorText="Enter a valid email address."
          >
            <Input
              defaultValue="alex@"
              type="email"
            />
          </Field>
          <Checkbox defaultChecked>Include archived projects</Checkbox>
          <Switch defaultChecked>Email notifications</Switch>
        </DemoSection>

        <DemoSection title="Feedback & progress">
          <Alert
            status="success"
            title="All changes saved"
          />
          <Alert
            status="warning"
            title="Review required"
          />
          <Stat.Root>
            <Stat.Label>Completed tasks</Stat.Label>
            <Stat.ValueText>
              24<Stat.ValueUnit>/ 32</Stat.ValueUnit>
            </Stat.ValueText>
          </Stat.Root>
          <Slider
            label="Completion"
            value={progress}
            onValueChange={setProgress}
          />
          <Progress.Root value={progress[0]}>
            <Progress.Label>Project progress</Progress.Label>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
            <Progress.ValueText />
          </Progress.Root>
        </DemoSection>

        <DemoSection title="Navigation & disclosure">
          <Tabs.Root defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content value="overview">
              <Text>3 active projects</Text>
            </Tabs.Content>
            <Tabs.Content value="activity">
              <Text>Alex updated the guidelines.</Text>
            </Tabs.Content>
            <Tabs.Content value="settings">
              <Switch defaultChecked>Weekly summary</Switch>
            </Tabs.Content>
          </Tabs.Root>
          <Accordion.Root
            defaultValue={["components"]}
            collapsible
          >
            <Accordion.Item value="components">
              <Accordion.ItemTrigger>
                Project details
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>Website refresh · In progress</Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
            <Accordion.Item value="more">
              <Accordion.ItemTrigger>
                Team members
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>Alex, Sam, and Jamie</Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </DemoSection>

        <DemoSection title="People & data">
          <HStack gap="3">
            <Avatar.Root>
              <Avatar.Fallback name="Alex Morgan" />
            </Avatar.Root>
            <Stack gap="0">
              <Text fontWeight="medium">Alex Morgan</Text>
              <Text
                textStyle="sm"
                color="fg.muted"
              >
                Workspace owner
              </Text>
            </Stack>
          </HStack>
          <SearchInput
            aria-label="Search members"
            placeholder="Search members…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
          />
          <Table.Root size="sm">
            <Table.Caption>Workspace members</Table.Caption>
            <Table.Head>
              <Table.Row>
                <Table.Header>Name</Table.Header>
                <Table.Header>Role</Table.Header>
                <Table.Header>Status</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {visibleMembers.map((member) => (
                <Table.Row key={member.name}>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell>{member.role}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={member.status === "Active" ? "success" : "warning"}>
                      {member.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
              {visibleMembers.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={3}>No members match your search.</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </DemoSection>

        <DemoSection title="Overlays & actions">
          <Wrap gap="2">
            <CommandDemo />
            <Drawer.Root title="Project details">
              <Drawer.Trigger render={<Button variant="outline" />}>Open drawer</Drawer.Trigger>
              <Drawer.Content>
                <Drawer.Body>
                  <Stack gap="4">
                    <Field label="Project title">
                      <Input defaultValue="Website refresh" />
                    </Field>
                    <Field label="Project brief">
                      <Textarea defaultValue="Refresh the landing page and component library." />
                    </Field>
                  </Stack>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.ActionTrigger
                    render={<Button />}
                    onClick={() => showToast("Project details saved")}
                  >
                    Save details
                  </Drawer.ActionTrigger>
                </Drawer.Footer>
                <Drawer.CloseTrigger />
              </Drawer.Content>
            </Drawer.Root>
            <Dialog.Root title="Example dialog">
              <Dialog.Trigger render={<Button />}>Open dialog</Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Body>Save project changes?</Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger render={<Button variant="outline" />}>
                    Cancel
                  </Dialog.ActionTrigger>
                  <Dialog.ActionTrigger
                    render={<Button />}
                    onClick={() => showToast("Demo confirmed")}
                  >
                    Confirm
                  </Dialog.ActionTrigger>
                </Dialog.Footer>
                <Dialog.CloseTrigger />
              </Dialog.Content>
            </Dialog.Root>
            <Popover.Root>
              <Popover.Trigger render={<Button variant="outline" />}>Open popover</Popover.Trigger>
              <Popover.Content>
                <Popover.Header>
                  <Popover.Title>Project info</Popover.Title>
                </Popover.Header>
                <Popover.Body>Website refresh · Design</Popover.Body>
                <Popover.CloseTrigger />
              </Popover.Content>
            </Popover.Root>
            <Menu.Root onSelect={(value) => showToast(`${value} selected`)}>
              <Menu.Trigger render={<Button variant="outline" />}>Open menu</Menu.Trigger>
              <Menu.Content>
                <Menu.Item value="Edit">Edit</Menu.Item>
                <Menu.Item value="Duplicate">Duplicate</Menu.Item>
                <Menu.Separator />
                <Menu.Item value="Archive">Archive</Menu.Item>
              </Menu.Content>
            </Menu.Root>
            <Button
              variant="subtle"
              onClick={() => showToast("Changes saved")}
            >
              Show toast
            </Button>
          </Wrap>
        </DemoSection>

        <DemoSection title="Selection">
          <SelectionDemo />
        </DemoSection>

        <DemoSection title="Dates & calendar">
          <Field label="Due date">
            <DatePicker clearable />
          </Field>
          <Field label="Project period">
            <DatePicker
              selectionMode="range"
              clearable
            />
          </Field>
          <Calendar />
        </DemoSection>

        <DemoSection title="More inputs">
          <NumberInput.Root
            defaultValue="5"
            min={1}
            max={50}
          >
            <NumberInput.Label>Team seats</NumberInput.Label>
            <NumberInput.Input />
            <NumberInput.Control />
          </NumberInput.Root>
          <Field label="Demo password">
            <PasswordInput defaultValue="sample-password" />
          </Field>
          <RadioCard.Root defaultValue="starter">
            <RadioCard.Label>Workspace plan</RadioCard.Label>
            <RadioCard.Item
              value="starter"
              label="Starter"
            />
            <RadioCard.Item
              value="team"
              label="Team"
            />
          </RadioCard.Root>
        </DemoSection>

        <DemoSection title="Project tree">
          <ProjectTreeDemo />
        </DemoSection>

        <DemoSection title="Files">
          <FileUpload.Root
            maxFiles={3}
            defaultValue={[
              new File(["Project brief"], "project-brief.txt", {
                type: "text/plain",
                lastModified: 0,
              }),
            ]}
          >
            <FileUpload.Label>Project attachments</FileUpload.Label>
            <FileUpload.HiddenInput />
            <FileUpload.Dropzone minH="32">
              <Box
                p="6"
                textAlign="center"
              >
                Drop files here
              </Box>
            </FileUpload.Dropzone>
            <FileUpload.Trigger render={<Button variant="outline" />}>
              Choose files
            </FileUpload.Trigger>
            <FileUpload.ItemGroup>
              <FileUpload.Items clearable />
            </FileUpload.ItemGroup>
          </FileUpload.Root>
        </DemoSection>

        <DemoSection title="Loading & empty states">
          <HStack gap="3">
            <SkeletonCircle
              width="10"
              height="10"
            />
            <Box flex="1">
              <SkeletonText noOfLines={3} />
            </Box>
          </HStack>
          <HStack gap="2">
            <Spinner size="sm" />
            <Text textStyle="sm">Loading…</Text>
          </HStack>
          <Separator />
          <EmptyState.Root size="sm">
            <EmptyState.Content>
              <EmptyState.Title>No saved reports</EmptyState.Title>
            </EmptyState.Content>
          </EmptyState.Root>
        </DemoSection>

        <DemoSection title="Chat">
          <ChatDemo />
        </DemoSection>
      </Grid>

      <DemoSection title="Data table">
        <ProjectTableDemo />
      </DemoSection>
      <DemoSection title="Data grid">
        <DataGrid
          aria-label="Project planning grid"
          rows={projects}
          getRowId={(row) => row.id}
          columnDefs={gridColumns}
          height="340px"
          rowNumbers
          statusBar={<Text textStyle="sm">8 projects</Text>}
        />
      </DemoSection>
    </Stack>
  );
}

export const Default = meta.story({ render: () => <KitchenSinkDemo /> });

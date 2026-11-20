import preview from "@construkt-kit/story-kit/preview";
import { ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { button } from "#styled-system/recipes";

import { IconButton, SplitButton, TooltipIconButton } from ".";
import { Checkbox } from "../Checkbox";
import { VStack } from "../Layout";
import { Menu } from "../Menu";
import { Popover } from "../Popover";

const meta = preview.meta({
  title: "Components/Buttons/SplitButton",
  tags: ["autodocs"],
});

const FOLDERS = [
  { id: "design", name: "Design reviews" },
  { id: "launch", name: "Product launch, phase 2 plans for the leadership offsite" },
  { id: "unsorted", name: "Unsorted files" },
];

const NEW_FOLDER = "new";

function AddToFolderDemo() {
  const [target, setTarget] = useState(FOLDERS[0].id);
  const folder = FOLDERS.find((f) => f.id === target);

  return (
    <SplitButton.Root
      colorPalette="brand"
      size="sm"
      maxW="72"
    >
      <SplitButton.Action leftIcon={<FolderIcon />}>
        {folder ? `Add to ${folder.name}` : "Add to a new folder"}
      </SplitButton.Action>
      <Menu.Root placement="bottom-end">
        <Menu.Trigger render={<IconButton aria-label="Choose the folder" />}>
          <ChevronDownIcon />
        </Menu.Trigger>
        <Menu.Content>
          <Menu.RadioItemGroup
            value={target}
            onValueChange={(value) => setTarget(value)}
          >
            {FOLDERS.map((f) => (
              <Menu.RadioItem
                key={f.id}
                value={f.id}
              >
                {f.name}
              </Menu.RadioItem>
            ))}
            <Menu.RadioItem value={NEW_FOLDER}>New folder</Menu.RadioItem>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Root>
    </SplitButton.Root>
  );
}

export const Default = meta.story({
  render: () => <AddToFolderDemo />,
});

export const Variants = meta.story({
  render: () => (
    <VStack
      alignItems="start"
      gap="3"
    >
      {button.variantMap.variant.map((variant) => (
        <SplitButton.Root
          key={variant}
          variant={variant}
        >
          <SplitButton.Action>Save ({variant})</SplitButton.Action>
          <IconButton aria-label="More save options">
            <ChevronDownIcon />
          </IconButton>
        </SplitButton.Root>
      ))}
    </VStack>
  ),
});

const FIELDS = ["Name", "Email", "Role", "Team", "Location", "Start date"];

function CountDemo() {
  const [hidden, setHidden] = useState<string[]>(["Start date"]);
  const shown = FIELDS.length - hidden.length;
  const partial = hidden.length > 0;

  return (
    <SplitButton.Root
      variant="surface"
      size="sm"
      colorPalette={partial ? "brand" : "neutral"}
    >
      <Popover.Root placement="bottom-start">
        <Popover.Trigger
          render={<SplitButton.Action />}
          tooltip={
            partial
              ? `${shown} of ${FIELDS.length} fields shown, ${hidden.length} hidden`
              : "Show or hide fields"
          }
        >{`${shown} ${shown === 1 ? "field" : "fields"}`}</Popover.Trigger>
        <Popover.Content>
          <Popover.Body>
            <VStack
              alignItems="start"
              gap="2"
            >
              {FIELDS.map((field) => (
                <Checkbox
                  key={field}
                  checked={!hidden.includes(field)}
                  onCheckedChange={(checked) =>
                    setHidden((fields) =>
                      checked === true ? fields.filter((f) => f !== field) : [...fields, field],
                    )
                  }
                >
                  {field}
                </Checkbox>
              ))}
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>
      <TooltipIconButton label="Add field">
        <PlusIcon />
      </TooltipIconButton>
    </SplitButton.Root>
  );
}

export const Count = meta.story({
  render: () => <CountDemo />,
});

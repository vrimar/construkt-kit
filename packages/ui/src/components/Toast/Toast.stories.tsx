import preview from "@construkt-kit/story-kit/preview";
import { type ReactElement, useEffect } from "react";

import { Toaster, toaster } from ".";
import { Button } from "../Buttons";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story: () => ReactElement) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
});

export const Default = meta.story({
  render: () => (
    <Wrap gap="2">
      <Button
        onClick={() =>
          toaster.create({
            title: "Info toast",
            description: "This is an info toast.",
            type: "info",
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Success!",
            description: "Operation completed successfully.",
            type: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Warning",
            description: "Please review your input.",
            type: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Error",
            description: "Something went wrong.",
            type: "error",
          })
        }
      >
        Error
      </Button>
    </Wrap>
  ),
});

function StackedToasts({ expanded }: { expanded: boolean }) {
  useEffect(() => {
    toaster.create({
      id: "import",
      title: "Importing contacts",
      description: "1,204 of 3,000 rows.",
      type: "loading",
    });
    toaster.create({
      id: "saved",
      title: "Changes saved",
      type: "success",
      duration: Infinity,
    });
    toaster.create({
      id: "upload",
      title: "Upload failed",
      description: "report.pdf is larger than 10 MB.",
      type: "error",
      closable: true,
      action: { label: "Retry", onClick: () => {} },
      duration: Infinity,
    });
    if (expanded) toaster.expand();
    return () => toaster.remove();
  }, [expanded]);
  return null;
}

export const Stacked = meta.story({
  tags: ["open-state"],
  render: () => <StackedToasts expanded={false} />,
});

export const Expanded = meta.story({
  tags: ["open-state"],
  render: () => <StackedToasts expanded />,
});

export const ReplacedById = meta.story({
  render: () => (
    <Wrap gap="2">
      <Button onClick={() => toaster.success({ id: "draft", title: "Draft saved" })}>
        Save draft
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toaster.remove("draft");
          toaster.success({ id: "draft", title: "Draft saved again" });
        }}
      >
        Save again
      </Button>
    </Wrap>
  ),
});

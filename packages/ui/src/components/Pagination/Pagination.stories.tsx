import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Pagination } from ".";
import { Button, IconButton } from "../Buttons";

const meta: Meta = {
  title: "Components/Pagination",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Pagination.Root
      count={100}
      pageSize={10}
      defaultPage={1}
    >
      <Pagination.PrevTrigger asChild>
        <IconButton
          variant="outline"
          aria-label="Previous"
        >
          <ChevronLeftIcon />
        </IconButton>
      </Pagination.PrevTrigger>
      <Pagination.Items
        render={(page) => (
          <Pagination.Item
            key={page.value}
            {...page}
            asChild
          >
            <Button
              variant={page.selected ? "solid" : "outline"}
              size="sm"
            >
              {page.value}
            </Button>
          </Pagination.Item>
        )}
      />
      <Pagination.NextTrigger asChild>
        <IconButton
          variant="outline"
          aria-label="Next"
        >
          <ChevronRightIcon />
        </IconButton>
      </Pagination.NextTrigger>
    </Pagination.Root>
  ),
};

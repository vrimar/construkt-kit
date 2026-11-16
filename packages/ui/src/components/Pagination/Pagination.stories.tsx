import preview from "@construkt-kit/story-kit/preview";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Pagination } from ".";
import { Button, IconButton } from "../Buttons";

const meta = preview.meta({
  title: "Components/Pagination",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

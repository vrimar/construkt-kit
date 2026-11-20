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
      defaultValue={1}
    >
      <Pagination.PrevTrigger
        render={
          <IconButton
            variant="outline"
            aria-label="Previous"
          />
        }
      >
        <ChevronLeftIcon />
      </Pagination.PrevTrigger>
      <Pagination.Items
        render={(page) => (
          <Pagination.Item
            {...page}
            render={
              <Button
                variant={page.selected ? "solid" : "outline"}
                size="sm"
              />
            }
          >
            {page.value}
          </Pagination.Item>
        )}
      />
      <Pagination.NextTrigger
        render={
          <IconButton
            variant="outline"
            aria-label="Next"
          />
        }
      >
        <ChevronRightIcon />
      </Pagination.NextTrigger>
    </Pagination.Root>
  ),
});

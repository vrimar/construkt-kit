import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { Box, Flex } from "../Layout";
import { Text } from "../Text";
import { defineDragType, useDraggable, useDropTarget } from "./dragAndDrop";
import { DragPreview } from "./DragPreview";

const meta = preview.meta({
  title: "Components/DragAndDrop",
  tags: ["autodocs"],
});

interface CardDrag {
  id: string;
  from: string;
}

const cardDrag = defineDragType<CardDrag>("story-card");

const initialLists: Record<string, string[]> = {
  "To do": ["Draft brief", "Book venue", "Order badges"],
  Doing: ["Invite speakers"],
  Done: ["Pick a date"],
};

function Card({ id, list }: { id: string; list: string }) {
  const {
    ref,
    isDragging,
    preview: dragPreview,
  } = useDraggable({
    type: cardDrag,
    getData: () => ({ id, from: list }),
    renderPreview: () => <DragPreview label={id} />,
  });
  return (
    <Box
      ref={ref}
      px="3"
      py="2"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      bg="bg"
      cursor="grab"
      opacity={isDragging ? 0.5 : 1}
    >
      {id}
      {dragPreview}
    </Box>
  );
}

function List({
  name,
  cards,
  onMove,
}: {
  name: string;
  cards: string[];
  onMove: (drag: CardDrag, to: string) => void;
}) {
  const { ref, isOver } = useDropTarget({
    type: cardDrag,
    canDrop: (drag) => drag.from !== name,
    onDrop: (drag) => onMove(drag, name),
  });
  return (
    <Flex
      ref={ref}
      direction="column"
      gap="2"
      w="200px"
      minH="160px"
      p="3"
      rounded="lg"
      bg={isOver ? "colorPalette.subtle.bg" : "bg.subtle"}
      colorPalette="brand"
    >
      <Text
        fontWeight="semibold"
        fontSize="sm"
      >
        {name}
      </Text>
      {cards.map((id) => (
        <Card
          key={id}
          id={id}
          list={name}
        />
      ))}
    </Flex>
  );
}

function BoardDemo() {
  const [lists, setLists] = useState(initialLists);
  const move = ({ id, from }: CardDrag, to: string) =>
    setLists((prev) => ({
      ...prev,
      [from]: prev[from].filter((card) => card !== id),
      [to]: [...prev[to], id],
    }));
  return (
    <Flex gap="4">
      {Object.entries(lists).map(([name, cards]) => (
        <List
          key={name}
          name={name}
          cards={cards}
          onMove={move}
        />
      ))}
    </Flex>
  );
}

/** Cards move between lists; a list doesn't take its own cards back. */
export const AcrossLists = meta.story({
  render: () => <BoardDemo />,
});

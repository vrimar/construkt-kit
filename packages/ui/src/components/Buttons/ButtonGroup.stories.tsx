import preview from "@construkt-kit/story-kit/preview";

import { button } from "#styled-system/recipes";

import { Button, ButtonGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Buttons/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={button.variantMap.size}
      renderPreview={(size) => (
        <ButtonGroup size={size}>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      )}
    />
  ),
});

import preview from "@construkt-kit/story-kit/preview";

import { Heading } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingLevel = (typeof headingLevels)[number];

const meta = preview.meta({
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  args: {
    children: "Heading Text",
  },
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable<HeadingLevel>
      sizes={[...headingLevels]}
      renderPreview={(level) => <Heading as={level}>{level.toUpperCase()}</Heading>}
    />
  ),
});

export const AsH1 = meta.story({
  args: {
    as: "h1",
    children: "H1 Heading",
  },
});

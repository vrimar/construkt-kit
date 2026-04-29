import type { Meta, StoryObj } from "@storybook/react-vite";

import { Image } from ".";
import { Box } from "../Layout";

const placeholderImageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="none">
    <rect width="300" height="200" fill="#e5e7eb" />
    <rect x="18" y="18" width="264" height="164" rx="16" fill="#cbd5e1" />
    <circle cx="92" cy="82" r="24" fill="#94a3b8" />
    <path d="M48 154L108 102L154 138L196 88L252 154H48Z" fill="#64748b" />
    <text x="150" y="178" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#334155">Placeholder image</text>
  </svg>
`)}`;

const fittedImageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none">
    <rect width="400" height="300" fill="#dbeafe" />
    <rect y="180" width="400" height="120" fill="#93c5fd" />
    <path d="M0 222L72 150L128 196L202 102L272 176L332 132L400 206V300H0V222Z" fill="#2563eb" />
    <circle cx="308" cy="78" r="30" fill="#fde68a" />
  </svg>
`)}`;

const meta: Meta<typeof Image> = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: placeholderImageSrc,
    alt: "Placeholder image",
    width: 300,
    height: 200,
  },
};

export const WithFit: Story = {
  render: () => (
    <Box
      w="200px"
      h="200px"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Image
        src={fittedImageSrc}
        alt="Fitted image"
        objectFit="contain"
        width="100%"
        height="100%"
      />
    </Box>
  ),
};

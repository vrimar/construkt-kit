import preview from "@construkt-kit/story-kit/preview";

import { DisplayValue } from ".";

const meta = preview.meta({
  title: "Components/DisplayValue",
  component: DisplayValue<string | number>,
  tags: ["autodocs"],
});

export const WithValue = meta.story({
  args: { value: "Hello World" },
});

export const Empty = meta.story({
  args: { value: null },
});

export const WithFormat = meta.story({
  args: {
    value: 1234.56,
    formatValue: (v) => `$${Number(v).toFixed(2)}`,
  },
});

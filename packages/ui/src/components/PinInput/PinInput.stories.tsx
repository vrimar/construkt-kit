import preview from "@construkt-kit/story-kit/preview";

import { pinInput } from "#styled-system/recipes";

import { PinInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/PinInput",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="320px">
      <PinInput.Root>
        <PinInput.Label>OTP Code</PinInput.Label>
        <PinInput.Control>
          {[0, 1, 2, 3].map((id) => (
            <PinInput.Input
              key={id}
              index={id}
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
    </Box>
  ),
});

export const SixDigits = meta.story({
  render: () => (
    <Box maxW="320px">
      <PinInput.Root>
        <PinInput.Label>Verification Code</PinInput.Label>
        <PinInput.Control>
          {[0, 1, 2, 3, 4, 5].map((id) => (
            <PinInput.Input
              key={id}
              index={id}
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
    </Box>
  ),
});

export const Masked = meta.story({
  render: () => {
    return (
      <Box maxW="320px">
        <PinInput.Root mask>
          <PinInput.Label>Secret PIN</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((id) => (
              <PinInput.Input
                key={id}
                index={id}
              />
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      </Box>
    );
  },
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={pinInput.variantMap.size}
      renderPreview={(size) => (
        <PinInput.Root size={size}>
          <PinInput.Label>Pin</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((id) => (
              <PinInput.Input
                key={id}
                index={id}
              />
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      )}
    />
  ),
});

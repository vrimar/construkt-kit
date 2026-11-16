import preview from "@construkt-kit/story-kit/preview";

import { Fieldset } from ".";
import { Input } from "../Input";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/Fieldset",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <Fieldset.Root>
        <Fieldset.Legend>Contact Information</Fieldset.Legend>
        <Fieldset.Content>
          <Fieldset.Control>
            <Input placeholder="Full name" />
          </Fieldset.Control>
          <Fieldset.HelperText>Enter your legal name.</Fieldset.HelperText>
        </Fieldset.Content>
      </Fieldset.Root>
    </Box>
  ),
});

export const WithError = meta.story({
  render: () => (
    <Box maxW="400px">
      <Fieldset.Root invalid>
        <Fieldset.Legend>Email</Fieldset.Legend>
        <Fieldset.Content>
          <Fieldset.Control>
            <Input placeholder="Email" />
          </Fieldset.Control>
          <Fieldset.ErrorText>Email is required.</Fieldset.ErrorText>
        </Fieldset.Content>
      </Fieldset.Root>
    </Box>
  ),
});

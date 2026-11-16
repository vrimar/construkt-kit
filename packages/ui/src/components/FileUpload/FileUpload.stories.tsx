import preview from "@construkt-kit/story-kit/preview";

import { fileUpload } from "#styled-system/recipes";

import { FileUpload } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Box, Center } from "../Layout";

const meta = preview.meta({
  title: "Components/FileUpload",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <FileUpload.Root maxFiles={5}>
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <Button variant="outline">Choose File</Button>
        </FileUpload.Trigger>
        <FileUpload.ItemGroup>
          <FileUpload.Items />
        </FileUpload.ItemGroup>
      </FileUpload.Root>
    </Box>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={fileUpload.variantMap.size}
      renderPreview={(size) => (
        <FileUpload.Root
          maxFiles={3}
          size={size}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone>
            <Center p="10">Drop files here ({size})</Center>
          </FileUpload.Dropzone>
          <FileUpload.ItemGroup>
            <FileUpload.Items />
          </FileUpload.ItemGroup>
        </FileUpload.Root>
      )}
    />
  ),
});

export const Dropzone = meta.story({
  render: () => (
    <Box maxW="400px">
      <FileUpload.Root maxFiles={3}>
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone>
          <Center p="10">Drag and drop files here, or click to select</Center>
        </FileUpload.Dropzone>
        <FileUpload.ItemGroup>
          <FileUpload.Items />
        </FileUpload.ItemGroup>
      </FileUpload.Root>
    </Box>
  ),
});

const sampleFiles = [new File(["quarterly figures"], "q3-report.pdf", { type: "application/pdf" })];

export const DisabledAndReadOnly = meta.story({
  render: () => (
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 320px))"
      gap="6"
    >
      {(["disabled", "readOnly"] as const).map((state) => (
        <FileUpload.Root
          key={state}
          maxFiles={3}
          defaultAcceptedFiles={sampleFiles}
          disabled={state === "disabled"}
          readOnly={state === "readOnly"}
        >
          <FileUpload.Label>{state === "disabled" ? "Disabled" : "Read-only"}</FileUpload.Label>
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone>
            <Center p="6">Drop files here</Center>
          </FileUpload.Dropzone>
          <FileUpload.ItemGroup>
            <FileUpload.Items clearable />
          </FileUpload.ItemGroup>
        </FileUpload.Root>
      ))}
    </Box>
  ),
});

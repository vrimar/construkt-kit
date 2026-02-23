import type { GroupProps } from "@chakra-ui/react";
import { Group } from "@chakra-ui/react";

export const ButtonGroup = (props: GroupProps) => {
  return (
    <Group
      {...props}
      css={
        props.attached
          ? {
              "& .chakra-button": {
                marginInlineEnd: "-1px !important",
              },
              "&.chakra-button::first-of-type": {
                borderTopRightRadius: "0 !important",
                borderBottomRightRadius: "0 !important",
              },
              "& .chakra-button:not(:first-of-type):not(:last-of-type)": {
                borderRadius: "0 !important",
              },
              "& .chakra-button:last-of-type": {
                borderTopLeftRadius: "0 !important",
                borderBottomLeftRadius: "0 !important",
              },
            }
          : undefined
      }
    />
  );
};

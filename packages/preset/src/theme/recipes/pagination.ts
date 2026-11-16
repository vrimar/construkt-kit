import { paginationAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlIcon } from "./control-size";

export const pagination = defineSlotRecipe({
  className: "pagination",
  slots: paginationAnatomy.keys(),
  base: {
    ellipsis: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      h: controlH("sm"),
      minW: controlH("sm"),
      color: "fg.muted",
      _icon: { boxSize: controlIcon("sm") },
    },
  },
});

import { defineTokens } from "@pandacss/dev";

export const easings = defineTokens.easings({
  default: { value: "cubic-bezier(0.4, 0, 0.2, 1)" },
  linear: { value: "linear" },
  in: { value: "cubic-bezier(0.4, 0, 1, 1)" },
  out: { value: "cubic-bezier(0, 0, 0.2, 1)" },
  "in-out": { value: "cubic-bezier(0.4, 0, 0.2, 1)" },
  // Material 3 emphasized decelerate/accelerate — enter slows into place, exit speeds away.
  "emphasized-in": { value: "cubic-bezier(0.05, 0.7, 0.1, 1.0)" },
  "emphasized-out": { value: "cubic-bezier(0.3, 0.0, 0.8, 0.15)" },
});

import type { StoryId } from "@construkt-kit/story-kit/test";

export interface RoleQuery {
  role: "button" | "combobox";
  name: string | RegExp;
}

export interface SheetOverlayCase {
  component: string;
  story: StoryId;
  trigger: { desktop: RoleQuery; phone: RoleQuery };
  focusAfterClose?: { desktop: RoleQuery; phone: RoleQuery };
}

const button = (name: string | RegExp): RoleQuery => ({ role: "button", name });
const everywhere = (query: RoleQuery) => ({ desktop: query, phone: query });

export const sheetOverlayCases: SheetOverlayCase[] = [
  {
    component: "Menu",
    story: "components-menu--default",
    trigger: everywhere(button("Open Menu")),
  },
  {
    component: "Select",
    story: "components-select--default",
    trigger: everywhere(button("Select fruit")),
  },
  {
    component: "ApplySelect",
    story: "components-applyselect--default",
    trigger: everywhere(button("Select frameworks")),
  },
  {
    component: "TagSelect",
    story: "components-tagselect--default",
    trigger: everywhere(button("Red")),
  },
  {
    component: "Combobox",
    story: "components-combobox--default",
    trigger: { desktop: button("Toggle suggestions"), phone: button(/^Framework/) },
    focusAfterClose: {
      desktop: { role: "combobox", name: "Framework" },
      phone: button(/^Framework/),
    },
  },
  {
    component: "DatePicker",
    story: "components-datepicker--range",
    trigger: everywhere(button("Select date")),
  },
  {
    component: "ColorPicker",
    story: "components-colorpicker--default",
    trigger: everywhere(button(/^select color/)),
  },
  {
    component: "Popover",
    story: "components-popover--default",
    trigger: everywhere(button("Open Popover")),
  },
  {
    component: "ConfirmPopover",
    story: "components-popover-confirmpopover--destructive",
    trigger: everywhere(button("Delete project")),
  },
  {
    component: "PromptPopover",
    story: "components-popover-promptpopover--default",
    trigger: everywhere(button("New folder")),
  },
];

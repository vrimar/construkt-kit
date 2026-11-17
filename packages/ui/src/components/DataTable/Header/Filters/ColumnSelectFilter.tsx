import { ApplySelect } from "../../../Select";
import { selectItemLabel } from "../../columns";
import type { ColumnFilterProps } from "../../types";

const NO_OPTIONS: string[] = [];

export const ColumnSelectFilter = ({
  placeholder,
  meta,
  value,
  onChange,
  layout,
  options = NO_OPTIONS,
}: ColumnFilterProps) => {
  const {
    actions,
    getItemLabel: _getItemLabel,
    triggerProps,
    ...applySelectProps
  } = meta.selectProps ?? {};

  return (
    <ApplySelect
      placement={layout === "field" ? "bottom-start" : "bottom-end"}
      placeholder={placeholder}
      {...applySelectProps}
      items={options}
      value={value}
      getItemLabel={selectItemLabel(meta)}
      getItemValue={(item) => item}
      onValueChange={(values) => onChange(values.length === 0 ? undefined : values)}
      actions={{ reset: true, ...actions }}
      triggerProps={{
        ...triggerProps,
        buttonProps: {
          size: layout === "field" ? "md" : "sm",
          variant: layout === "field" ? "outline" : "plain",
          ...triggerProps?.buttonProps,
        },
      }}
    />
  );
};

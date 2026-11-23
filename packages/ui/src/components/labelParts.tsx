import { type ComponentProps, type ElementType, type ReactElement, useId, useMemo } from "react";

import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../hooks/useRenderedParts";

type LabelPart = "title" | "description";

export interface OverlayLabels {
  ids: { title: string; description: string };
  /** The rendered title's id. */
  labelledBy: string | undefined;
  /** The rendered description's id. */
  describedBy: string | undefined;
  report: ReportRendered<LabelPart>;
}

export function useOverlayLabels(idPrefix: string): OverlayLabels {
  const id = useId();
  const [rendered, report] = useRenderedParts<LabelPart>();
  return useMemo(
    () => ({
      ids: {
        title: `${idPrefix}:${id}:title`,
        description: `${idPrefix}:${id}:description`,
      },
      labelledBy: rendered.title,
      describedBy: rendered.description,
      report,
    }),
    [idPrefix, id, rendered, report],
  );
}

export type LabelPartComponent<C extends ElementType> = (props: ComponentProps<C>) => ReactElement;

export function createLabelParts<T extends ElementType, D extends ElementType>(
  Title: T,
  Description: D,
  useLabels: () => OverlayLabels,
): { Title: LabelPartComponent<T>; Description: LabelPartComponent<D> } {
  const TitleElement: ElementType = Title;
  const DescriptionElement: ElementType = Description;

  function LabelTitle({ id, ...props }: ComponentProps<T>): ReactElement {
    const labels = useLabels();
    const titleId = useReportRendered(labels.report, "title", id ?? labels.ids.title);
    return (
      <TitleElement
        {...props}
        id={titleId}
      />
    );
  }

  function LabelDescription({ id, ...props }: ComponentProps<D>): ReactElement {
    const labels = useLabels();
    const descriptionId = useReportRendered(
      labels.report,
      "description",
      id ?? labels.ids.description,
    );
    return (
      <DescriptionElement
        {...props}
        id={descriptionId}
      />
    );
  }

  return { Title: LabelTitle, Description: LabelDescription };
}

import { type ComponentPropsWithRef, type JSX, type MemoExoticComponent, memo } from "react";

import { type RenderProp, useRender } from "./useRender";

type Tag = keyof JSX.IntrinsicElements;

type RenderableProps<T extends Tag> = ComponentPropsWithRef<T> & {
  render?: RenderProp | undefined;
};

type Renderable = {
  [T in Tag]: MemoExoticComponent<(props: RenderableProps<T>) => JSX.Element>;
};

const cache = new Map<Tag, Renderable[Tag]>();

function create<T extends Tag>(tag: T) {
  function Element({ render, ...props }: RenderableProps<T>) {
    return useRender({ defaultTagName: tag, render, props });
  }
  Element.displayName = tag;
  return memo(Element);
}

export const renderable = new Proxy({} as Renderable, {
  get(_, tag) {
    if (typeof tag !== "string") return undefined;
    let component = cache.get(tag as Tag);
    if (!component) {
      component = create(tag as Tag) as Renderable[Tag];
      cache.set(tag as Tag, component);
    }
    return component;
  },
});

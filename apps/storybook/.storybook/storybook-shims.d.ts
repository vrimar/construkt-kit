declare module "@storybook/react-vite" {
  export type Meta<TCmpOrArgs = import("@storybook/react").Args> =
    import("@storybook/react").Meta<TCmpOrArgs>;
  export type Preview = import("@storybook/react").Preview;
  export type StorybookConfig = {
    stories?: string[];
    addons?: string[];
    framework?: { name: string; options: Record<string, unknown> };
    refs?: Record<string, unknown>;
    features?: Record<string, unknown>;
    viteFinal?: (
      config: import("vite").UserConfig,
    ) => import("vite").UserConfig | Promise<import("vite").UserConfig>;
  };
  export type StoryObj<TMetaOrCmpOrArgs = import("@storybook/react").Args> =
    import("@storybook/react").StoryObj<TMetaOrCmpOrArgs>;
}

declare module "storybook/test" {
  export function fn<T extends (...args: any[]) => any = (...args: any[]) => any>(
    implementation?: T,
  ): T;
}

declare module "*.css" {}

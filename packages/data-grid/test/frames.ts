export const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export async function frames(count: number) {
  for (let frame = 0; frame < count; frame++) await nextFrame();
}

export const settle = () => frames(2);

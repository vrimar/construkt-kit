export const settled = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 600)));

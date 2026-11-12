export const withFade = (motion: string, fade: string) => ({
  animationName: `${motion}, ${fade}`,
  _motionReduce: { animationName: fade },
});

export const overlayMotion = (enter: string, exit: string) => ({
  _open: withFade(enter, "fade-in"),
  _closed: withFade(exit, "fade-out"),
});

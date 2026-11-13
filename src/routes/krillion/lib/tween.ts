export function easeOutBack(t: number): number {
  const c1 = 0.8;
  const c3 = c1 + 1;

  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function easeInOutBack(t: number): number {
  const c1 = 0.8;
  const c2 = c1 * 1.525;

  return t < 0.5 ? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2 : ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t ** 2 : 1 - (-2 * t + 2) ** 2 / 2;
}

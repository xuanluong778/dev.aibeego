export const PRESETS = ['fade', 'slide-down', 'slide-up', 'slide-right', 'slide-left', 'zoom-in', 'zoom-out', 'slide-down-right', 'slide-down-left', 'slide-up-right', 'slide-up-left'] as const;

/** Đầu vào "bẩn" thử hàm làm sạch motion → giá trị mong đợi ghi cạnh nhau. */
export const MOTION_INPUTS = {
  hopLe: { in: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 100 }, out: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 100 } },
  presetLa: { in: { preset: 'spin-3d', trigger: 'scroll', duration: 600, delay: 0 }, out: undefined },
  triggerLa: { in: { preset: 'fade', trigger: 'hover', duration: 600, delay: 0 }, out: undefined },
  triggerLoad: { in: { preset: 'fade', trigger: 'load', duration: 600, delay: 0 }, out: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 0 } },
  durationThap: { in: { preset: 'fade', trigger: 'scroll', duration: 10, delay: 0 }, out: { preset: 'fade', trigger: 'scroll', duration: 150, delay: 0 } },
  durationCao: { in: { preset: 'fade', trigger: 'scroll', duration: 99999, delay: 0 }, out: { preset: 'fade', trigger: 'scroll', duration: 1200, delay: 0 } },
  delayAm: { in: { preset: 'fade', trigger: 'scroll', duration: 600, delay: -50 }, out: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 0 } },
  delayCao: { in: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 5000 }, out: { preset: 'fade', trigger: 'scroll', duration: 600, delay: 400 } },
  thieuSo: { in: { preset: 'fade', trigger: 'scroll' }, out: { preset: 'fade', trigger: 'scroll', duration: 1200, delay: 0 } },
  khongPhaiSo: { in: { preset: 'fade', trigger: 'scroll', duration: 'nhanh', delay: NaN }, out: { preset: 'fade', trigger: 'scroll', duration: 1200, delay: 0 } },
  lamTron: { in: { preset: 'fade', trigger: 'scroll', duration: 600.6, delay: 10.4 }, out: { preset: 'fade', trigger: 'scroll', duration: 601, delay: 10 } },
} as const;

export const MOTION_KEYS = {
  hopLe: ['image', 'form', 'grid:0', 'grid:12', 'countdown:cd1', 'item:abc', 'field:headline'],
  khongHopLe: ['', 'grid:', 'grid:-1', 'grid:x', 'random', 'field:', `field:${'x'.repeat(250)}`, 'item:\u0000bad'],
} as const;

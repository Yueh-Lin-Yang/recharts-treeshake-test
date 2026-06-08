import dayjs from 'dayjs';

export const CHART_COLORS = [
  'oklch(0.65 0.17 259)',
  'oklch(0.68 0.14 145)',
  'oklch(0.68 0.14 55)',
  'oklch(0.68 0.14 330)',
  'oklch(0.68 0.14 200)',
  'oklch(0.68 0.14 100)',
  'oklch(0.68 0.14 25)',
  'oklch(0.68 0.14 295)',
  'oklch(0.68 0.14 175)',
  'oklch(0.68 0.14 0)',
  'oklch(0.68 0.14 235)',
  'oklch(0.68 0.14 70)',
  'oklch(0.68 0.14 310)',
  'oklch(0.68 0.14 130)',
];

const HEADROOM_PERCENT = 110;
const Y_AXIS_STEP = 10;
const Y_AXIS_MIN = 10;

export function yAxisMax(dataMax: number): number {
  const withHeadroom = (dataMax * HEADROOM_PERCENT) / 100;
  return Math.max(Y_AXIS_MIN, Math.ceil(withHeadroom / Y_AXIS_STEP) * Y_AXIS_STEP);
}

const X_AXIS_TARGET_LABELS_DESKTOP = 10;
const X_AXIS_TARGET_LABELS_MOBILE = 5;

export function xAxisInterval(dayCount: number, isMobile: boolean): number {
  const target = isMobile ? X_AXIS_TARGET_LABELS_MOBILE : X_AXIS_TARGET_LABELS_DESKTOP;
  return Math.max(0, Math.ceil(dayCount / target) - 1);
}

export function formatXAxisDate(date: string): string {
  return dayjs(date).format('M/D');
}

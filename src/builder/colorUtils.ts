/**
 * The ten `--cometchat-extended-primary-color-*` shades for a brand colour.
 *
 * The UI Kit ships these as fixed values for its own brand colour and reads them throughout its CSS
 * (avatars, selected rows, hover tints), so a custom brand colour needs its own set. The arithmetic
 * is the UI Kit's: for `#6852d6` this returns exactly the values in its `light.css` and `dark.css`.
 *
 * Pure on purpose: callers pass the brand colour and the theme they are applying. Reading either
 * back from the page is wrong for one render — `CometChatProvider` updates `data-theme` an effect
 * after its `theme` prop changes — so a theme switch would keep the previous theme's shades.
 */

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/** Light: blend toward white, except 900, which darkens slightly. */
const LIGHT_PERCENTAGES = [96, 88, 77, 66, 55, 44, 33, 22, 11, 11];

/** Dark: blend toward black, except 900, which lightens slightly. */
const DARK_PERCENTAGES = [80, 72, 64, 56, 48, 40, 32, 24, 16, 8];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function extendedPrimaryColors(brandColor: string, isDark: boolean): Record<string, string> {
  // Anything but #rrggbb would blend into `#NaNNaNNaN`; keep the UI Kit defaults instead.
  if (!HEX_COLOR.test(brandColor)) return {};

  const percentages = isDark ? DARK_PERCENTAGES : LIGHT_PERCENTAGES;
  const towards = isDark ? '#000000' : '#ffffff';
  const lastTowards = isDark ? '#ffffff' : '#000000';

  const shades: Record<string, string> = {};
  SHADES.forEach((shade, index) => {
    const target = index === SHADES.length - 1 ? lastTowards : towards;
    shades[`--cometchat-extended-primary-color-${shade}`] = blendColorWith(brandColor, percentages[index], target);
  });
  return shades;
}

/** Moves `color` `percentage`% of the way to `blendWith`, per channel. */
function blendColorWith(color: string, percentage: number, blendWith: string): string {
  const channel = (hex: string, at: number) => parseInt(hex.substring(at, at + 2), 16);

  return `#${[1, 3, 5]
    .map((at) => {
      const base = channel(color, at);
      const target = channel(blendWith, at);
      const mixed = Math.round(base + (target - base) * (percentage / 100));
      return Math.min(Math.max(0, mixed), 255).toString(16).padStart(2, '0');
    })
    .join('')}`;
}

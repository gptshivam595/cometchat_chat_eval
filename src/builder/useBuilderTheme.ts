/**
 * Applies the builder's colours and typography to the running app.
 *
 * Lives outside `CometChat/` so that folder stays an unmodified copy of the CometChat sample app
 * and can be replaced wholesale when you update.
 *
 * Two UI Kit constraints drive the implementation:
 *
 *  1. Variables must be set on the `.cometchat[data-theme]` element that `CometChatProvider`
 *     renders, not on `document.documentElement`. The UI Kit declares every variable — colours
 *     *and* fonts — inside `[data-theme='light']`, so anything set on `:root` is overridden lower
 *     in the tree. Setting `--cometchat-font-family` on `documentElement`, for example, silently
 *     has no effect.
 *  2. `.cometchat` is also where the UI Kit portals tooltips and the composer link dialog, so
 *     setting there covers those too. A wrapper *inside* it would not.
 */
import { useEffect } from 'react';
import type { StyleSettings } from '../CometChat/config/settings.types';
import { fontSizes } from './styleConfig';
import { extendedPrimaryColors } from './colorUtils';

/**
 * Writes the builder's style settings as CSS custom properties.
 *
 * @param style  Resolved style settings from the builder payload.
 * @param theme  Already resolved to light/dark — the UI Kit does not accept 'system'.
 */
export function useBuilderTheme(style: StyleSettings, theme: 'light' | 'dark'): void {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.cometchat[data-theme]');
    if (!root) {
      // Not a crash, but every colour and font below is silently dropped, so say so.
      console.warn('[builder] .cometchat[data-theme] not found — builder theming was not applied');
      return;
    }

    const { color, typography } = style;
    const isDark = theme === 'dark';

    const vars: Record<string, string> = {
      '--cometchat-primary-color': color.brandColor,
      '--cometchat-border-color-highlight': color.brandColor,
      '--cometchat-text-color-highlight': color.brandColor,
      '--cometchat-icon-color-highlight': color.brandColor,
      '--cometchat-primary-button-background': color.brandColor,
      '--cometchat-text-color-primary': isDark ? color.primaryTextDark : color.primaryTextLight,
      '--cometchat-text-color-secondary': isDark
        ? color.secondaryTextDark
        : color.secondaryTextLight,
      // Fallbacks only engage when the chosen family is unavailable, so a font the app loads itself
      // still wins. Without them an absent family lands on the browser default, usually serif.
      '--cometchat-font-family': `${typography.font}, 'Roboto', sans-serif`,
      ...(fontSizes[typography.size as keyof typeof fontSizes] ?? {}),
      // The shades derived from the brand colour, for the theme being applied — written with
      // everything else so overlays portalled into this element get them too.
      ...extendedPrimaryColors(color.brandColor, isDark),
    };

    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }

    return () => {
      for (const name of Object.keys(vars)) root.style.removeProperty(name);
    };
  }, [style, theme]);
}

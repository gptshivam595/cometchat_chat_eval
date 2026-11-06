/**
 * Loads the exported builder settings for the downloadable app.
 *
 * Unlike the no-code widget — which fetches settings from the builder API at runtime — this
 * app is shipped to the customer as a zip with its settings already baked in. The dashboard
 * rewrites `cometchat-builder-settings.json` at export time; nothing here is fetched.
 *
 * The JSON is the only file the export patcher touches. Types live in this file so the patcher
 * can replace the data without being able to break the type contract — overwriting a `.ts`
 * settings file wholesale would silently drop the interface annotation along with the data.
 */
import rawConfig from './cometchat-builder-settings.json';
import type {
  CometChatBuilderConfig,
  SettingsInput,
} from '../CometChat/config/settings.types';

/**
 * Cast rather than validated: JSON imports widen string literals (`"user"` becomes `string`).
 * The structural safety comes from `SettingsInput` being recursively optional — anything the
 * payload omits is filled in by `resolveSettings()`, which is what keeps settings saved before
 * a newer key existed loading correctly.
 */
const config = rawConfig as CometChatBuilderConfig;

/** Settings to hand to `<SettingsProvider>`. Undefined when the export left them empty. */
export const builderSettings: SettingsInput | undefined = config.settings;

/** Identifies which builder variant produced this export. Useful in support tickets. */
export const builderId: string | undefined = config.builderId;

/**
 * Back-compat alias.
 *
 * Earlier versions of this app exported a `CometChatSettings` const from
 * `CometChat/CometChatSettings.ts`, and the context imported it directly. That implicit import is
 * what made the folder non-portable, so the app now passes settings in as a prop instead. This
 * alias exists only for any straggling code that still expects the old name — prefer
 * `useSettings()`.
 */
export { builderSettings as CometChatSettings };

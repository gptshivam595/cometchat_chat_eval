/**
 * Registers the sample app's translations with the UI Kit.
 *
 * v7 moved this into the sample app's own `App.tsx`, which the widget doesn't use — so the
 * equivalent lives here, reading the same locale bundle from `CometChat/locales`.
 */
import { CometChatLocalize } from '@cometchat/chat-uikit-react';
import { sampleAppTranslations } from '../CometChat/locales';

export function setupLocalization(language?: string): void {
  // v7 routes translations through the shared instance, which only exists after
  // CometChatUIKit.init() has run.
  const shared = CometChatLocalize.getSharedInstance();
  if (!shared) {
    console.warn('[builder] setupLocalization called before CometChat was initialised');
    return;
  }
  shared.addTranslation(sampleAppTranslations);
  if (language?.trim()) {
    shared.setCurrentLanguage?.(language.trim());
  }
}

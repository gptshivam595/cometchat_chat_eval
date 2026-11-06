import ReactDOM from 'react-dom/client';
import { CometChatUIKit, UIKitSettingsBuilder } from '@cometchat/chat-uikit-react';
import App from './App';
import './builder/shell.css';
import cometChatLogo from './CometChat/assets/cometchat_logo.svg';
import { SettingsProvider } from './CometChat/config/SettingsContext';
import { builderSettings } from './builder/builderSettings';
import { setupLocalization } from './builder/localization';

/**
 * CometChat application constants.
 *
 * The dashboard rewrites this object at export time with a regex that scans for the declaration
 * below and swallows everything up to the first closing brace. Two constraints follow: keep it a
 * flat object literal with no nested braces, and never repeat the declaration's opening text
 * anywhere earlier in this file — including in a comment — or the regex matches that instead and
 * the exported app ships with no credentials.
 */
export const COMETCHAT_CONSTANTS = {
  APP_ID: "1686176487d03edff",
  REGION: "in",
  AUTH_KEY: "f7eae44c61fd1e3be695b224a0b22a7c8e360c7b",
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

if (COMETCHAT_CONSTANTS.APP_ID && COMETCHAT_CONSTANTS.REGION && COMETCHAT_CONSTANTS.AUTH_KEY) {
  const uiKitSettings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    // The sample app enables calling; without this the call buttons initialise but fail.
    .setCallingEnabled(true)
    .build();

  /**
   * Settings are passed in rather than imported by the context.
   *
   * Earlier versions' `CometChatContext` imported `CometChatSettings.ts` directly, which coupled
   * the sample-app folder to builder data and is why it could not simply be copied. Passing them
   * as a prop keeps `CometChat/` a clean copy: the exact same tree runs with the builder's
   * settings here, the API's settings in the no-code widget, and none at all in the plain
   * sample app.
   */
  const renderApp = () => {
    setupLocalization();
    root.render(
      <SettingsProvider settings={builderSettings}>
        <App />
      </SettingsProvider>
    );
  };

  // Normalised rather than optional-chained: `init()?.then()` renders nothing at all, silently,
  // if init ever returns undefined, and swallows a rejection the same way.
  Promise.resolve(CometChatUIKit.init(uiKitSettings))
    .then(renderApp)
    .catch((error) => {
      console.error('[builder] CometChat UI Kit failed to initialise', error);
      // Rendering matters as much as logging: without this the page stays blank and only someone
      // with devtools open learns why. Mirrors the credentials-missing screen below.
      root.render(
        <div className="App" style={{ gap: '20px' }}>
          <div className="cometchat-credentials__logo">
            <img src={cometChatLogo} alt="CometChat Logo" />
          </div>
          <div className="cometchat-credentials__header">
            CometChat failed to start. Check your App ID, Region and Auth Key in{' '}
            <code>index.tsx</code>, then reload. The browser console has the details.
          </div>
        </div>
      );
    });
} else {
  root.render(
    <div className="App" style={{ gap: '20px' }}>
      <div className="cometchat-credentials__logo">
        <img src={cometChatLogo} alt="CometChat Logo" />
      </div>
      <div className="cometchat-credentials__header">
        CometChat App credentials are missing. Please add them in <code>index.tsx</code> to
        continue.
      </div>
    </div>
  );
}

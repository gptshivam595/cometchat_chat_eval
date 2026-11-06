import './CometChat/styles/App.css';
import { useEffect, useState } from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatProvider, CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChatHome } from './CometChat/components/CometChatHome/CometChatHome';
import CometChatLogin from './CometChat/components/CometChatLogin/CometChatLogin';
import { AppContextProvider } from './CometChat/context/AppContext';
import { useSettings } from './CometChat/config/SettingsContext';
import useSystemColorScheme from './builder/customHooks';
import { useBuilderTheme } from './builder/useBuilderTheme';

/**
 * The downloadable app's shell.
 *
 * Differs from earlier versions of this app in three ways, all required by the current UI Kit:
 *  - `CometChatUIKitLoginListener` no longer exists; the SDK's own login listener replaces it.
 *  - Settings come from `useSettings()` (fed by `<SettingsProvider>` in index.tsx) rather than
 *    a context that imported the settings file directly.
 *  - Theming writes onto the `.cometchat[data-theme]` element rendered by `CometChatProvider`.
 */
function App() {
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>(null);
  const { style } = useSettings();
  const systemTheme = useSystemColorScheme();

  // The UI Kit accepts only 'light' | 'dark'; resolving 'system' is deliberately the
  // consumer's job.
  const theme: 'light' | 'dark' =
    style.theme === 'light' || style.theme === 'dark' ? style.theme : systemTheme;

  useBuilderTheme(style, theme);

  useEffect(() => {
    // getLoggedInUser() is synchronous and returns `User | null`.
    setLoggedInUser(CometChatUIKit.getLoggedInUser() ?? null);

    CometChat.addLoginListener(
      'runnable-sample-app',
      new CometChat.LoginListener({
        loginSuccess: (user: CometChat.User) => setLoggedInUser(user),
        logoutSuccess: () => setLoggedInUser(null),
      })
    );

    return () => CometChat.removeLoginListener('runnable-sample-app');
  }, []);

  /** Ends the SDK session, not just the local state — otherwise the user is silently
   *  re-authenticated on reload. Mirrors the sample app's handleLogout. */
  const handleLogout = async () => {
    await CometChatUIKit.logout();
    setLoggedInUser(null);
  };

  return (
    <div className="App">
      <CometChatProvider theme={theme} locale="en-us">
        <AppContextProvider>
          {loggedInUser ? (
            <CometChatHome
              loggedInUser={loggedInUser}
              onLogout={handleLogout}
            />
          ) : (
            <CometChatLogin onLoginSuccess={setLoggedInUser} />
          )}
        </AppContextProvider>
      </CometChatProvider>
    </div>
  );
}

export default App;

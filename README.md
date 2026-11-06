<p align="center">
  <img alt="CometChat" src="https://assets.cometchat.io/website/images/logos/banner.png">
</p>

<p>
  <img alt="version" src="https://img.shields.io/badge/version-v2.0.0-blue" />
  <img alt="status" src="https://img.shields.io/badge/status-stable-brightgreen" />
  <img alt="react" src="https://img.shields.io/badge/react-supported-61DAFB?logo=react" />
  <img alt="vite" src="https://img.shields.io/badge/vite-supported-646CFF?logo=vite" />
  <img alt="typescript" src="https://img.shields.io/badge/typescript-supported-blue" />
</p>

# Integration steps for UI Kit Builder

Follow these steps to integrate the builder-generated app into your existing React project.

For Next.js integration, follow [NEXT_JS.md](NEXT_JS.md).

## 1. Install dependencies in your app

```bash
npm install @cometchat/chat-uikit-react@7.2.4 @cometchat/chat-sdk-javascript@4.2.0 @cometchat/calls-sdk-javascript@5.0.6
```

This app targets **UI Kit v7** and **React 18 or 19**.

## 2. Copy two folders

Copy both of these into your project's `src` directory:

| Folder | What it is |
| --- | --- |
| `src/CometChat` | The CometChat sample app. Treat it as vendored — it is replaced wholesale on every UI Kit release, so edits here are lost. |
| `src/builder` | Your builder settings, theming and localization. This is the part you own and customise. |

Both are required — `src/CometChat` reads its configuration from `src/builder`.

## 3. Initialize the CometChat UI Kit

Initialization also wires up `SettingsProvider`, which is what feeds your builder settings into the
app. Select your setup:

<details>
  <summary>Vite</summary>

Open `src/main.tsx` (this app keeps the entry at `src/index.tsx`) and update it:

```tsx
import { createRoot } from "react-dom/client";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import App from "./App";
import "./builder/shell.css"; // Gives the chat UI its full height — required.
import { SettingsProvider } from "./CometChat/config/SettingsContext";
import { builderSettings } from "./builder/builderSettings";
import { setupLocalization } from "./builder/localization";

export const COMETCHAT_CONSTANTS = {
  APP_ID: "", // Replace with your App ID
  REGION: "", // Replace with your App Region
  AUTH_KEY: "", // Replace with your Auth Key
};

const uiKitSettings = new UIKitSettingsBuilder()
  .setAppId(COMETCHAT_CONSTANTS.APP_ID)
  .setRegion(COMETCHAT_CONSTANTS.REGION)
  .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
  .subscribePresenceForAllUsers()
  // Without this the call buttons do not render at all.
  .setCallingEnabled(true)
  .build();

const root = createRoot(document.getElementById("root")!);

Promise.resolve(CometChatUIKit.init(uiKitSettings))
  .then(() => {
    setupLocalization();
    root.render(
      <SettingsProvider settings={builderSettings}>
        <App />
      </SettingsProvider>
    );
  })
  .catch((error) => console.error("CometChat UI Kit failed to initialise", error));
```

> Replacing `main.tsx` also removes the Vite template's `import "./index.css"`. Keep it removed, or
> delete its `#root` rules (fixed width, centering, `text-align: center`) — they offset the chat UI
> and make it overflow the page.

</details>

<details>
  <summary>Create React App</summary>

Open `src/index.tsx` and update it:

```tsx
import ReactDOM from "react-dom/client";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import App from "./App";
import "./builder/shell.css"; // Gives the chat UI its full height — required.
import { SettingsProvider } from "./CometChat/config/SettingsContext";
import { builderSettings } from "./builder/builderSettings";
import { setupLocalization } from "./builder/localization";

export const COMETCHAT_CONSTANTS = {
  APP_ID: "", // Replace with your App ID
  REGION: "", // Replace with your App Region
  AUTH_KEY: "", // Replace with your Auth Key
};

const uiKitSettings = new UIKitSettingsBuilder()
  .setAppId(COMETCHAT_CONSTANTS.APP_ID)
  .setRegion(COMETCHAT_CONSTANTS.REGION)
  .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
  .subscribePresenceForAllUsers()
  .setCallingEnabled(true)
  .build();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

Promise.resolve(CometChatUIKit.init(uiKitSettings))
  .then(() => {
    setupLocalization();
    root.render(
      <SettingsProvider settings={builderSettings}>
        <App />
      </SettingsProvider>
    );
  })
  .catch((error) => console.error("CometChat UI Kit failed to initialise", error));
```

</details>

> **Upgrading from v6?** `CometChatProvider` no longer comes from a local
> `CometChat/context/CometChatContext`, `setupLocalization` has moved to `builder/localization`,
> and `CometChat/utils/utils` and `CometChat/CometChatApp` no longer exist. The steps above are the
> v7 replacements for all four.

### Note: Setting Session Storage Mode

To use session storage instead of the default local storage, configure it during initialization.
Refer to the [Setting Session Storage Mode Guide](https://www.cometchat.com/docs/ui-kit/react/methods#setting-session-storage-mode).

## 4. User Login

Refer to the [React.js integration guide](https://www.cometchat.com/docs/ui-kit/react/integration-react)
("Initialize, Login, and Render") to implement user authentication in your app.

The shell in step 5 already handles login for you — it renders `CometChatLogin` until a user is
logged in, and listens for SDK login and logout events after that.

## 5. Render the app shell

v7 has no `CometChatApp` component. `src/App.tsx` is the integration point, and it is yours to edit:

```tsx
import "./CometChat/styles/App.css";
import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatProvider, CometChatUIKit } from "@cometchat/chat-uikit-react";
import { CometChatHome } from "./CometChat/components/CometChatHome/CometChatHome";
import CometChatLogin from "./CometChat/components/CometChatLogin/CometChatLogin";
import { AppContextProvider } from "./CometChat/context/AppContext";
import { useSettings } from "./CometChat/config/SettingsContext";
import useSystemColorScheme from "./builder/customHooks";
import { useBuilderTheme } from "./builder/useBuilderTheme";

function App() {
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>(null);
  const { style } = useSettings();
  const systemTheme = useSystemColorScheme();

  // The UI Kit accepts only 'light' | 'dark' — resolving 'system' is the consumer's job.
  const theme: "light" | "dark" =
    style.theme === "light" || style.theme === "dark" ? style.theme : systemTheme;

  useBuilderTheme(style, theme);

  useEffect(() => {
    setLoggedInUser(CometChatUIKit.getLoggedInUser() ?? null);

    CometChat.addLoginListener(
      "app-login-listener",
      new CometChat.LoginListener({
        loginSuccess: (user: CometChat.User) => setLoggedInUser(user),
        logoutSuccess: () => setLoggedInUser(null),
      })
    );

    return () => CometChat.removeLoginListener("app-login-listener");
  }, []);

  const handleLogout = async () => {
    await CometChatUIKit.logout();
    setLoggedInUser(null);
  };

  return (
    /* The chat UI fills its parent, so give it explicit dimensions. */
    <div className="App" style={{ width: "100vw", height: "100dvh" }}>
      <CometChatProvider theme={theme} locale="en-us">
        <AppContextProvider>
          {loggedInUser ? (
            <CometChatHome loggedInUser={loggedInUser} onLogout={handleLogout} />
          ) : (
            <CometChatLogin onLoginSuccess={setLoggedInUser} />
          )}
        </AppContextProvider>
      </CometChatProvider>
    </div>
  );
}

export default App;
```

`.App` sets the size — change its `style` to fit the chat into part of your page. The `.cometchat`
element that `CometChatProvider` renders inside it has no height of its own; `src/builder/shell.css`,
imported in step 3, makes it fill `.App`. If you don't import that file, add this to your own CSS —
without it the chat shrinks to its content and the message composer is pushed off-screen:

```css
.App > .cometchat {
  height: 100%;
}
```

## 6. Customise through settings, not props

In v6 layout and feature choices were props on `CometChatApp`. In v7 they live in
`src/builder/cometchat-builder-settings.json`, which the dashboard writes at export time and which
you can edit by hand afterwards. Anything the file omits falls back to a default, so partial files
are safe.

| Setting | Effect |
| --- | --- |
| `layout.withSideBar` | `false` renders a single chat pane with no conversations list. |
| `layout.chatType` | `user` or `group` — which chat opens when there is no sidebar. |
| `style.theme` | `light`, `dark`, or `system`. |
| `style.color`, `style.typography` | Brand colour, text colours and font, applied by `useBuilderTheme`. |
| `chatFeatures.*`, `callFeatures.*` | Per-feature toggles, mapped to UI Kit props by `buildFeatureProps`. |

Group action messages (joins, leaves, kicks, bans) are part of `chatFeatures` rather than a prop.
To toggle them from the dashboard, go to **Chat > Settings** and switch **Include Group Actions**.

## 7. Run the app

- Vite: `npm run dev`
- Create React App: `npm start` (works with `react-scripts` 5 on React 18 or 19)

If you hit issues integrating into an existing project, check that your TypeScript config includes the
following (in a Vite project that is `tsconfig.app.json`, not the root `tsconfig.json`). New Vite and
Create React App projects already have both:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "resolveJsonModule": true
  }
}
```

`resolveJsonModule` is required — `builderSettings` imports the settings JSON directly. Restart your
dev server after changing it.

## Run this app on its own (optional)

> &nbsp;
>
> This app is built with **Vite**. The entry point stays at `src/index.tsx` (rather than Vite's
> usual `src/main.tsx`) so the credentials block is always in the same place.
>
> 1. Open the `cometchat-app-react` folder.
> 2. Add credentials for your app in `src/index.tsx`:
>
> ```typescript
> export const COMETCHAT_CONSTANTS = {
>   APP_ID: "", // Replace with your App ID
>   REGION: "", // Replace with your App Region
>   AUTH_KEY: "", // Replace with your Auth Key
> };
> ```
>
> 3. Install dependencies:
>
> ```bash
> npm i
> ```
>
> 4. Run the app:
>
> ```bash
> npm start          # or: npm run dev
> ```
>
> 5. Build for production:
>
> ```bash
> npm run build      # type-checks, then emits to build/
> npm run preview    # serve the production build locally
> ```

Every setting is described in [project-info/COMETCHAT_SETTINGS.md](project-info/COMETCHAT_SETTINGS.md), and the
folder layout in [project-info/FOLDER_STRUCTURE.md](project-info/FOLDER_STRUCTURE.md). For UI Kit components,
theming and localization, see the <a href="https://www.cometchat.com/docs/ui-kit/react/overview" target="_blank">React UI Kit documentation</a>.

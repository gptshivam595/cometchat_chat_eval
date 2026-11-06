<p align="center">
  <img alt="CometChat" src="https://assets.cometchat.io/website/images/logos/banner.png">
</p>

<p>
  <img alt="version" src="https://img.shields.io/badge/version-v2.0.0-blue" />
  <img alt="status" src="https://img.shields.io/badge/status-stable-brightgreen" />
  <img alt="react" src="https://img.shields.io/badge/react-supported-61DAFB?logo=react" />
  <img alt="next.js" src="https://img.shields.io/badge/next.js-supported-black?logo=next.js" />
  <img alt="typescript" src="https://img.shields.io/badge/typescript-supported-blue" />
</p>

# Integration steps for UI Kit Builder in Next.js

Follow these steps to integrate the builder-generated app into your existing Next.js project (App Router).

## 1. Install dependencies in your app

```bash
npm install @cometchat/chat-uikit-react@7.2.4 @cometchat/chat-sdk-javascript@4.2.0 @cometchat/calls-sdk-javascript@5.0.6
```

This app targets **UI Kit v7**, **React 19**, and **Next.js 15 or 16** with the App Router.

## 2. Copy two folders

Copy both of these into your project's `src` directory, next to `src/app`:

| Folder | What it is |
| --- | --- |
| `src/CometChat` | The CometChat sample app. Treat it as vendored — it is replaced wholesale on every UI Kit release, so edits here are lost. |
| `src/builder` | Your builder settings, theming and localization. This is the part you own and customise. |

Both are required — `src/CometChat` reads its configuration from `src/builder`, and the two must stay side by side.

```
src/
│── app/
│── builder/
│── CometChat/
```

## 3. Exclude the copied folders from ESLint

No `next.config` changes are needed — the app works with both Turbopack and webpack. But Next.js's
lint rules are stricter than the ones the `CometChat` folder is written against, and `npm run lint`
reports errors in it on Next.js 16. Since you don't edit that folder, exclude both copied folders in
`eslint.config.mjs`:

```js
"src/CometChat/**",
"src/builder/**",
```

## 4. Initialize the CometChat UI Kit

Create `src/app/CometChatNoSSR/CometChatNoSSR.tsx`. Initialization also wires up `SettingsProvider`,
which is what feeds your builder settings into the app.

```
src/app/
│── CometChatNoSSR/
│   ├── CometChatNoSSR.tsx
│   ├── CometChatAppShell.tsx
│── CometChatAppWrapper.tsx
│── page.tsx
```

```tsx
"use client";

import { useEffect, useState } from "react";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import CometChatAppShell from "./CometChatAppShell";
import { SettingsProvider } from "../../CometChat/config/SettingsContext";
import { builderSettings } from "../../builder/builderSettings";
import { setupLocalization } from "../../builder/localization";

export const COMETCHAT_CONSTANTS = {
  APP_ID: "", // Replace with your App ID
  REGION: "", // Replace with your App Region
  AUTH_KEY: "", // Replace with your Auth Key
};

// Cached so init runs once, even though React Strict Mode runs effects twice in development.
let initPromise: Promise<void> | undefined;

function initCometChat(): Promise<void> {
  if (!initPromise) {
    const uiKitSettings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
      .subscribePresenceForAllUsers()
      // Without this the call buttons do not render at all.
      .setCallingEnabled(true)
      .build();

    initPromise = Promise.resolve(CometChatUIKit.init(uiKitSettings)).then(() => {
      setupLocalization();
    });
  }
  return initPromise;
}

export default function CometChatNoSSR() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initCometChat()
      .then(() => setReady(true))
      .catch((error) => console.error("CometChat UI Kit failed to initialise", error));
  }, []);

  if (!ready) return null;

  return (
    <SettingsProvider settings={builderSettings}>
      <CometChatAppShell />
    </SettingsProvider>
  );
}
```

> **Upgrading from v6?** `CometChatProvider` no longer comes from a local
> `CometChat/context/CometChatContext`, `setupLocalization` has moved to `builder/localization`,
> and `CometChat/utils/utils` and `CometChat/CometChatApp` no longer exist. The steps above are the
> v7 replacements for all four.

### Note: Setting Session Storage Mode

To use session storage instead of the default local storage, configure it during initialization.
Refer to the [Setting Session Storage Mode Guide](https://www.cometchat.com/docs/ui-kit/react/methods#setting-session-storage-mode).

## 5. User Login

Refer to the [Next.js integration guide](https://www.cometchat.com/docs/ui-kit/react/integration-nextjs)
to implement user authentication in your app.

The shell in step 6 already handles login for you — it renders `CometChatLogin` until a user is
logged in, and listens for SDK login and logout events after that.

To log a user in programmatically instead, do it inside the cached init promise, so it also runs only once:

```tsx
initPromise = Promise.resolve(CometChatUIKit.init(uiKitSettings)).then(async () => {
  setupLocalization();
  if (!CometChatUIKit.getLoggedInUser()) {
    await CometChatUIKit.login("cometchat-uid-1"); // Replace with your user's UID
  }
});
```

## 6. Render the app shell

v7 has no `CometChatApp` component. Create `src/app/CometChatNoSSR/CometChatAppShell.tsx` — it is the
integration point, and it is yours to edit:

```tsx
import "../../CometChat/styles/App.css";
import "../../builder/shell.css";
import { useEffect, useState } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatProvider, CometChatUIKit } from "@cometchat/chat-uikit-react";
import { CometChatHome } from "../../CometChat/components/CometChatHome/CometChatHome";
import CometChatLogin from "../../CometChat/components/CometChatLogin/CometChatLogin";
import { AppContextProvider } from "../../CometChat/context/AppContext";
import { useSettings } from "../../CometChat/config/SettingsContext";
import useSystemColorScheme from "../../builder/customHooks";
import { useBuilderTheme } from "../../builder/useBuilderTheme";

export default function CometChatAppShell() {
  // UI Kit init has already finished before this renders, so the session can be read up front.
  const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>(
    () => CometChatUIKit.getLoggedInUser() ?? null
  );
  const { style } = useSettings();
  const systemTheme = useSystemColorScheme();

  // The UI Kit accepts only 'light' | 'dark' — resolving 'system' is the consumer's job.
  const theme: "light" | "dark" =
    style.theme === "light" || style.theme === "dark" ? style.theme : systemTheme;

  useBuilderTheme(style, theme);

  useEffect(() => {
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
```

### Note: Chat height

`.App` sets the size — change its `style` to fit the chat into part of your page. The size on `.App` is
not enough on its own: the `.cometchat` element that `CometChatProvider` renders must fill it too, or
the message list grows with its content and pushes the composer off-screen. `builder/shell.css` does
this with:

```css
.App > .cometchat {
  height: 100%;
}
```

`shell.css` also resets the `body` margin and font — copy the rule into your own stylesheet instead if
you'd rather keep your page's `body` styles.

## 7. Disable SSR and render the component

Load `CometChatNoSSR.tsx` with Server-Side Rendering disabled, while keeping SSR for the rest of your
app. `ssr: false` is only allowed in a Client Component, so create `src/app/CometChatAppWrapper.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const CometChatNoSSR = dynamic(() => import("./CometChatNoSSR/CometChatNoSSR"), {
  ssr: false,
});

export default function CometChatAppWrapper() {
  return <CometChatNoSSR />;
}
```

Now import and use the wrapper in your page:

```tsx
import CometChatAppWrapper from "./CometChatAppWrapper";

export default function Home() {
  return (
    <>
      {/* Other components or content */}
      <CometChatAppWrapper />
    </>
  );
}
```

**Why disable SSR?**

- The CometChat UI Kit and the `CometChat` folder use browser APIs (`window`, `document`, WebSockets) as soon as they load.
- Next.js pre-renders pages on the server, where those APIs don't exist — the build fails with `window is not defined`.
- `{ ssr: false }` loads `CometChatNoSSR.tsx` only in the browser.

## 8. Customise through settings, not props

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

## 9. Run the app

```bash
npm run dev
```

If you hit issues, check that your `tsconfig.json` includes `"resolveJsonModule": true` (new Next.js
projects have it). It is required — `builderSettings` imports the settings JSON directly. Restart your
dev server after changing it.

Every setting is described in [project-info/COMETCHAT_SETTINGS.md](project-info/COMETCHAT_SETTINGS.md), and the
folder layout in [project-info/FOLDER_STRUCTURE.md](project-info/FOLDER_STRUCTURE.md). For UI Kit components,
theming and localization, see the <a href="https://www.cometchat.com/docs/ui-kit/react/overview" target="_blank">React UI Kit documentation</a>.

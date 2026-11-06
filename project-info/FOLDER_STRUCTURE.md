# UI Kit Builder App – Folder Structure Documentation

This document provides an overview of the folder structure of the UI Kit Builder app, explaining the purpose of each directory and file.

The app has two halves, and the difference matters when you customise it:

- **`src/CometChat/`** is the CometChat sample app, shipped as-is. It is replaced wholesale with each new version of this app, so changes you make inside it are lost on upgrade.
- **`src/builder/`**, **`src/App.tsx`** and **`src/index.tsx`** are yours. Your builder settings, theming, localization and app shell live here.

---

## Project Structure Overview

```
cometchat-app-react/
│── public/
│── src/
│   ├── CometChat/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── locales/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── decl.d.ts
│   ├── builder/
│   │   ├── cometchat-builder-settings.json
│   │   ├── builderSettings.ts
│   │   ├── useBuilderTheme.ts
│   │   ├── colorUtils.ts
│   │   ├── customHooks.ts
│   │   ├── localization.ts
│   │   ├── styleConfig.ts
│   │   └── shell.css
│   ├── App.tsx
│   └── index.tsx
│── project-info/
│   │── COMETCHAT_SETTINGS.md
│   │── FOLDER_STRUCTURE.md
│   │── LICENSE.md
│   │── SECURITY.md
│   │── SUPPORT.md
│── .gitignore
│── CHANGELOG.md
│── index.html
│── NEXT_JS.md
│── package.json
│── README.md
│── tsconfig.json
│── vite.config.ts
```

---

## 1. `src/CometChat/` – The CometChat Sample App

The chat experience itself, built on the CometChat UI Kit. Treat this folder as vendored: read it, but make your changes through `src/builder/` and your builder settings instead.

### 1.1 `assets/` – Static Assets

Icons and images used by the sample app's components.

### 1.2 `components/` – UI Components

Each subfolder is one screen or feature, with its `.tsx` and `.css` files:

- **CometChatAddMembers/** → Adds members to a group.
- **CometChatAIAssistant/** → The AI assistant chat experience.
- **CometChatCallLog/** → Call history, call details, participants and recordings.
- **CometChatCreateGroup/** → UI for creating new groups.
- **CometChatCredentials/** → Credentials entry screen from the standalone sample app. Not used here: this app reads credentials from `src/index.tsx`.
- **CometChatDetails/** → User and group details panels, including banned members.
- **CometChatHome/** → The main home screen of the chat app, and the layout that places every other panel.
- **CometChatJoinGroup/** → Allows users to join group chats, including password-protected groups.
- **CometChatLogin/** → Login screen with sample users.
- **CometChatMessages/** → Core chat interface for 1-on-1 and group chats.
- **CometChatNewChat/** → Starts a new conversation with a user or group.
- **CometChatSelector/** → The sidebar: switches between chats, calls, users and groups.
- **CometChatThreadPanel/** → Threaded conversations (replies to a message).
- **CometChatTransferOwnership/** → Transfers group ownership.

### 1.3 `config/` – Settings

Connects your builder settings to the components:

- **settings.types.ts** → The `CometChatSettingsInterface` type and its sub-types.
- **defaultSettings.ts** → A default for every setting, and `resolveSettings()`, which merges your settings over them.
- **SettingsContext.tsx** → `SettingsProvider` and the `useSettings()` hook.
- **useFeatureProps.ts** → Turns settings into the UI Kit component props that switch features on and off.

See [COMETCHAT_SETTINGS.md](COMETCHAT_SETTINGS.md) for every setting.

### 1.4 `context/` – App State

- **AppContext.tsx** → Provides app-wide state such as the selected conversation, user or group.
- **appReducer.ts** → The reducer behind `AppContext`.

### 1.5 `hooks/` – Custom React Hooks

- **useIsMobile.ts** → Switches to the single-pane layout when the chat area is narrow. It measures the app's own container, so it also works when the chat is embedded in a smaller part of your page.

### 1.6 `locales/` – Localization

Translation files for the sample app's own text, one JSON file per language, collected by `index.ts`.

### 1.7 `styles/` – Styling

- **App.css** → Layout styles for the whole app. Import it once, from `App.tsx`.

### 1.8 `utils/` – Helpers

- **assetUrl.ts** → Returns the URL of an imported image, whichever bundler built it (Next.js imports images as objects rather than URLs).

### 1.9 `decl.d.ts`

TypeScript declarations that let components import `.svg` and `.png` files.

---

## 2. `src/builder/` – Your Builder Configuration

Owned by you. This is where the choices you made in the UI Kit Builder live.

- **cometchat-builder-settings.json** → Your builder settings. Written by the CometChat dashboard when you export, and safe to edit by hand.
- **builderSettings.ts** → Loads the JSON and exports `builderSettings` for `SettingsProvider`.
- **useBuilderTheme.ts** → Applies your theme, brand colour and typography to the app.
- **colorUtils.ts** → Derives the lighter and darker brand shades used across the UI.
- **customHooks.ts** → `useSystemColorScheme`, which follows the operating system's light or dark mode when your theme is `'system'`.
- **localization.ts** → `setupLocalization()`, which registers the sample app's translations with the UI Kit.
- **styleConfig.ts** → The font-size scales `useBuilderTheme` applies, plus the option lists the UI Kit Builder shows for fonts and sizes.
- **shell.css** → Page-level styles for this standalone app: the page reset, the chat's full-height container, and the "credentials missing" screen.

---

## 3. `src/` Entry Files

- **index.tsx** → Entry point. Holds your app credentials (`COMETCHAT_CONSTANTS`), initializes the UI Kit, and renders `App` inside `SettingsProvider`.
- **App.tsx** → The app shell. Applies the theme, handles login and logout, and renders `CometChatHome` or `CometChatLogin`.

---

## 4. Root Files

These files are located at the root of the project and handle configurations, metadata, and documentation.

- **index.html** → The HTML page Vite serves; loads `src/index.tsx`.
- **vite.config.ts** → Vite configuration for the dev server and production build.
- **package.json** → Manages project dependencies, scripts and metadata.
- **tsconfig.json** → TypeScript configuration file.
- **public/** → Files served as-is, such as the favicon and web manifest.
- **README.md** → Guide for integrating the UI Kit Builder app into your React project, and for running this app on its own.
- **NEXT_JS.md** → Guide for integrating the UI Kit Builder app into your Next.js project.
- **CHANGELOG.md** → Tracks changes across different versions.
- **.gitignore** → Specifies files to be ignored by Git.

### `project-info/`

- **COMETCHAT_SETTINGS.md** → Detailed explanation of the `CometChatSettingsInterface`, outlining chat, call, layout, and style configurations.
- **FOLDER_STRUCTURE.md** → This document.
- **LICENSE.md** → Contains project licensing information.
- **SECURITY.md** → Security policies and guidelines.
- **SUPPORT.md** → Information on getting project support.

---

This structured documentation provides a clear and well-organized overview of the CometChat UI Kit Builder app's folder structure.

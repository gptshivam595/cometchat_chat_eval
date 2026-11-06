# Changelog

## [v2.0.0] - 12-10-2026

## New
- Upgraded to the CometChat React UI Kit v7, along with the latest Chat and Calls SDKs and React 19.
- Added settings for multiple attachments, pin message, save message, pin conversation and thread subscription. Each stays off until you enable it in the Builder and export again.

## Enhancements
- Moved the project from Create React App to Vite, for faster startup and builds.
- Your brand colour now also produces the lighter and darker shades used for avatars, selected items and hover states, which previously stayed on the default purple.
- The chat now sizes itself to the container it is placed in, so dialogs, overlays and the single-pane layout follow the chat area rather than the browser window.
- The font you pick in the Builder now falls back to Roboto and then the system sans-serif, so a family your app does not load no longer lands on the browser's serif default.
- The attachment button is hidden when every attachment type is turned off, instead of opening an empty menu.

## Fixes
- Fixed an issue where a failed initialization left the screen blank with no explanation. The page now says what to check.
- Fixed an issue where a chat named through `defaultChatID` was ignored when "open the first conversation" was turned off, and where a `chatType` that did not match the supplied user or group opened the first conversation instead of none.

## Breaking changes
- The `CometChatApp` component and the v6 settings file have been removed. See the README for the updated integration steps.
- Inter is no longer offered as a font option, as neither the app nor the UI Kit ships it. Existing settings that use it are still applied — load the font in your own app to continue using it.

---

## [v1.0.27] - 24-07-2026

## New
- None

## Enhancements
- None

## Fixes
- Removed corrupted and unused asset files (`emoji.svg`, `file-upload.svg`, `image.svg`, `location.svg`, `video-upload.svg`) from the project.

---

## [v1.0.26] - 11-05-2026

## New
- None

## Enhancements
- None

## Fixes
- Fixed an issue where the message composer was incorrectly hidden when the other user had blocked the logged-in user. The composer is now only hidden when the logged-in user has blocked the other person.

---

## [v1.0.25] - 02-04-2026

## New
- Introduced the CometChatCompactMessageComposer component, a streamlined, single-line message composer for a more efficient message composition experience.

## Enhancements
- None

## Fixes
- None

---


## [v1.0.24] - 19-02-2026

## New
- Added notification sound toggles, allowing users to disable incoming and outgoing message sounds for a more customizable chat experience.

## Enhancements
- None

## Fixes
- None

---

## [v1.0.22] - 04-02-2026

## New
- None

## Enhancements
- Updated UI Kit to version **6.3.11**

## Fixes
- Fixed an issue where the "unbanned" system message did not appear in real time in the message list.

---

## [v1.0.21] - 23-01-2026

## New
- None

## Enhancements
- Added a selected users preview in the `CometChatUsers` component, allowing users to review selected members before adding them to a group.
- Updated UI Kit to version **6.3.9**

## Fixes
- Fixed an issue where the unban success toast was not displayed when a member was unbanned from a group.
- Fixed an issue where users were unblocked even when clicking outside the Unblock User confirmation button.

---

## [v1.0.20] - 23-01-2026

## New
- None

## Enhancements
- Added a selected users preview in the `CometChatUsers` component, allowing users to review selected members before adding them to a group.
- Updated UI Kit to version **6.3.9**

## Fixes
- Fixed an issue where the unban success toast was not displayed when a member was unbanned from a group.
- Fixed an issue where users were unblocked even when clicking outside the Unblock User confirmation button.

---

## [v1.0.19] - 19-01-2026

## New
- Added a "Mark as Unread" option, allowing users to mark previously read messages as unread for better message management.
- Introduced a new unread message indicator UI that visually separates unread messages from read ones, making unread messages easier to identify.
- Added the `showMarkAsUnreadOption` property, which allows the message list to start from unread messages when set to `true`.

## Enhancements
- Updated the React UI Kit to the latest version **6.3.7**, providing improved performance and updated components.

## Fixes
- None

---

## [v1.0.18] - 01-12-2025

## New
- Added support for the Report Message feature, allowing users to report inappropriate or harmful messages directly from the chat. An option is now available to enable or disable this feature based on your app's requirements.
- Added support for `@all` mentions, enabling users to mention all members of a group with a single mention. This feature can also be enabled or disabled as needed.

## Enhancements
- Updated the React UI Kit to the latest version **6.3.5**, providing improved performance and updated components.

## Fixes
- None

---

## [v1.0.17] - 25-11-2025

## New
- None

## Enhancements
- None

## Fixes
- Fixed an issue where the "Delete Chat" option remained enabled for already deleted group conversations, which previously resulted in an API error in UI Kit Builder.

---

## [v1.0.16] - 17-11-2025

## New
- None

## Enhancements
- Updated React UI Kit to version **6.3.4** and Calls SDK to version **4.2.1** for improved performance and stability.
- Added support for the `setStorageMode` method, enabling developers to switch between `sessionStorage` and `localStorage` for more flexible session persistence control.

## Fixes
- None

---

## [v1.0.15] - 27-10-2025

## New
- Added an option to manage showing or hiding group action messages for greater customization.

## Enhancements
- Upgraded the React UI Kit in UI Kit Builder, Widget Builder and Preview to version **6.3.2**, delivering improved performance, refined design components, and a smoother development experience.

## Fixes
- Fixed an issue where passing an empty view in the message list did not work unless `isAgentChat` was set to `true`.
- Resolved an issue preventing PDF and image uploads in chat on iOS devices.
- Fixed a bug where the "Thinking…" indicator was not immediately visible after sending a message in agent chat.
- Resolved an issue where the "Read more / Show less" option still appeared after editing a long message to a shorter one.
- Fixed a bug where the "Message Translation" toast appeared on both the conversation screen and the thread screen.
- Fixed an issue where the "Scroll to latest message" option appeared when clicking reply or edit message options.

---

## [v1.0.14] - 17-10-2025

## New
- None

## Enhancements
- Updated the React UI Kit to the latest version, **v6.3.1**.
- Updated the Call SDK to the latest version, **v4.1.1**.

## Fixes
- None

---

## [v1.0.13] - 03-10-2025

## New
- Introduced the Reply Message feature, enabling users to reply directly to a specific message within a chat.
  - Added a new `hideReplyOption` property in the message list, allowing developers to hide the option to reply to a message. By default, the reply option is visible.
  - Introduced a new message event `ccReplyToMessage`, which displays a preview of the message being replied to in the composer.
  - Added a new `replyView` section in `CometChatMessageTemplate` to show a message preview inside the message bubble for the message being replied to.

## Enhancements
- Updated UI Kit to version **6.3.0**.

## Fixes
- Fixed an issue on iPad where users were unable to select a file to send in the chat.
- Fixed an issue in AI Agent Chat where the image display was broken when multiple images were returned in a response.
- Resolved a formatting issue in AI Agent Chat where line spacing between response content was not displayed correctly.

---

## [v1.0.12] - 25-09-2025

## New
- Added the `onSendButtonClick` property to the `CometChatAIAssistantChatComponent`. This allows developers to override the default send message functionality.

## Enhancements
- UI Kit: Updated to version **6.2.5** in Chat Builder.

## Fixes
- None

---

## [v1.0.11] - 22-09-2025

## New
- None

## Enhancements
- UI Kit: Updated to version **6.2.5** in Chat Builder.

## Fixes
- Fixed an issue where the scope in the "Change Scope" action message was not being localized in `CometChatMessageList` component.
- Fixed an issue where the `ccGroupCreated` trigger did not add the new group conversation to the `CometChatConversations` component.
- Fixed console errors that appeared when sending messages in React 19 Strict Mode.
- Resolved an issue where user search failed if a space was entered before the search text.
- Fixed an issue where collaborator names were not visible in the collaborative whiteboard.
- Fixed an issue where setting the `hideNewChat` prop to `true` correctly hides the "New Chat" button in the header but did not hide it in the chat history component.
- Fixed an issue where ordered lists did not display number points in `CometChatAIAssistantChat` component.
- Fixed an issue where unordered lists did not display bullet points in `CometChatAIAssistantChat` component.
- Fixed an issue where code blocks did not adapt to the UIKit theme mode in `CometChatAIAssistantChat` component.
- Fixed an issue where table data was misaligned in `CometChatAIAssistantChat` component.
- Fixed an issue where links were not highlighted correctly in markdown in `CometChatAIAssistantChat` component.
- Fixed an issue in Agent Chat where unnecessary margin was applied around ordered list (`<ol>`) tags.

---

## [v1.0.10] - 11-09-2025

## New
- Added new chat and delete conversation option in the `CometChatAIAssistantChatHistory` component.

## Enhancements
- UI Kit: Updated to version **6.2.3** across the Chat Builder demo, Code apps, and No Code apps.

## Fixes
- Fixed inconsistent conversation header height across different views for a more uniform interface.
- Fixed an issue where audio files became distorted after sending.
- Fixed the `hideReceipts` prop in the `CometChatThreadHeader` component so it now updates correctly at runtime.
- Fixed an issue where adding a new template for custom messages failed to display the default `statusInfoView`.

---

## [v1.0.9] - 28-08-2025

## New
- Added support for Moderation, with the ability to enable or disable the feature directly in Chat Builder.

## Enhancements
- Updated React UI Kit to the latest version **6.2.1**.

## Fixes
- UI fixes on AI Agents Chat.

---

## [v1.0.8] - 26-08-2025

## New
- AI Agents: Expanded availability of AI Agents to IN and EU regions in addition to the US.
- Conversation Search Toggle in Chat Builder: Added support to enable or disable the conversation search feature in Chat Builder.

## Enhancements
- UI Improvements in AI Agent Chat Builder: Applied multiple UI refinements to improve usability and overall chat experience.
- One-on-One Chat Behavior: Resolved an issue in both code and no-code apps where opening an agent conversation from the Chats tab incorrectly launched the one-on-one user chat instead of the intended AI Assistant chat.

## Fixes
- AI Agents Chat displayed unread message count in the docked layout when accessed from chat history.

---

# Community Lead Assistant Chrome Extension

Community Lead Assistant helps users scan supported community pages for high-intent leads, save qualified opportunities, and prepare manual outreach drafts.

## Install

1. Extract `CommunityLeadAssistant.zip`.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on Developer mode.
4. Click Load unpacked.
5. Select the `Extension` folder.

Chrome must load the extracted `Extension` folder because it contains `manifest.json`.

## Login

The extension uses the same account system as the website.

- Email and password login is available directly in the popup.
- Google login opens the website login page.
- If you are already logged in on the website, use `Use active website session` in the popup.

The extension creates a secure workspace session in the background. Users do not need to paste a token.

## Supported Platforms

- Reddit
- LinkedIn
- Facebook Groups
- Discord
- Slack
- Telegram
- WhatsApp Communities
- IndieHackers
- Product Hunt
- X

Unsupported websites show a friendly unsupported-platform message.

## Safety Rules

- The extension never sends DMs automatically.
- The extension never posts comments or replies automatically.
- The extension never blasts follow-ups.
- Outreach drafts must be reviewed and sent manually by the user.
- Scanning is limited to visible content on supported platforms.

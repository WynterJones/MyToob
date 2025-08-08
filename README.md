### MyToob — Make YouTube behave (nicely)

A tiny MV3 extension that tidies YouTube, blocks sponsor popups, auto-picks theater mode + high quality, and keeps the UI comfy. Think of it as a spa day for your eyeballs.

---

### What it does

- **Blocks sponsor popups**: Finds the ad info overlay and clicks through to stop seeing those.
- **Cleans the feed**: Hides noisy UI bits and trims rich item widths for easier scanning.
- **Auto theater + quality**: On watch pages, switches to theater mode and bumps playback quality.
- **Rounded player**: Soft corners on the video player when on watch pages.
- **Smart styling**: Watch-page-only styles are injected and removed dynamically as you navigate.

---

### How it works

- **Manifest (MV3)**: Declares content scripts for all YouTube pages and watch pages.
- **Dynamic style toggle** (`watch_css_toggle.js`)
  - Detects navigation on YouTube’s SPA via `yt-navigate-finish`, `yt-page-data-updated`, and `popstate` with a small interval fallback.
  - When the URL is a watch page (`/watch?v=...`), it injects inline watch-only styles and enables `rounded_video.css`. Otherwise it removes them.
- **Sponsor blocking** (`content.js`)
  - Observes DOM mutations, detects Sponsored overlays, opens the ad info panel inside the iframe, clicks through the flow, and cleans up.
- **UI tweaks**
  - `hide_selectors.css`, `hide_rich_items_with_overlay.css`, `rich_item_width.css`, `hover_lockup_metadata_popup.css/js`, `watched_filter.js` adjust layout and visibility.
- **Watch page helpers**
  - `force_theater_mode.js`, `force_highest_quality.js` run only on watch pages.

---

### Install (Chrome/Brave/Edge)

1. Download/clone this repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Pin the extension if you like.

Tip: When you change files, hit the refresh icon on the extension in `chrome://extensions`, then refresh your YouTube tab.

---

### Files at a glance

- `manifest.json`: MV3 config.
- `content.js`: Sponsor popup blocker.
- `watch_css_toggle.js`: Injects/removes watch-page styles and toggles `rounded_video.css`.
- `force_theater_mode.js` / `force_highest_quality.js`: Watch-only helpers.
- `hide_selectors.css`, `rich_item_width.css`, `hide_rich_items_with_overlay.css`, `hover_lockup_metadata_popup.css`, `rounded_video.css`: UI/styles.
- `hover_lockup_metadata_popup.js`, `watched_filter.js`: Feed quality-of-life tweaks.

Note: `watch_only.css` was removed. Its rules are now injected inline by `watch_css_toggle.js` only on watch pages.

---

### Development

- Navigate around YouTube; styles should apply only on watch pages and disappear elsewhere.
- Use DevTools on YouTube tabs to verify injected `<style id="ytab-watch-only-style">` and `<link id="ytab-rounded-video-style">` appear/disappear as you navigate.
- If YouTube changes their DOM, tweak selectors in the relevant files.

---

### Troubleshooting

- **Nothing happens?** Refresh the extension in `chrome://extensions`, then refresh the YouTube tab.
- **Styles stick after leaving a video?** Give it a second; navigation events + the interval will clean up. If not, reload the page.
- **Sponsor panel click flow changed?** YouTube might’ve updated the UI. Adjust selectors in `content.js`.

---

### Privacy

No tracking, no analytics, no external calls. It only runs on YouTube and only changes the page you’re viewing.

---

### Credits

ChatGPT & Claude.

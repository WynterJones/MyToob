(function () {
  const WATCH_STYLE_ID = "ytab-watch-only-style";
  const ROUND_STYLE_ID = "ytab-rounded-video-style";

  function isWatchUrl() {
    if (location.pathname !== "/watch") return false;
    const params = new URLSearchParams(location.search);
    return params.has("v");
  }

  function ensureInlineWatchStyle() {
    if (document.getElementById(WATCH_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = WATCH_STYLE_ID;
    style.textContent = `#columns.style-scope.ytd-watch-flexy {\n  display: none !important;\n}\nbody {\n  overflow: hidden !important;\n}\n#center,\n#end {\n  display: none !important;\n}`;
    document.documentElement.appendChild(style);
  }

  function ensureLink(id, file) {
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(file);
    document.documentElement.appendChild(link);
  }

  function removeLink(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function updateStyles() {
    if (isWatchUrl()) {
      ensureInlineWatchStyle();
      ensureLink(ROUND_STYLE_ID, "rounded_video.css");
    } else {
      removeLink(WATCH_STYLE_ID);
      removeLink(ROUND_STYLE_ID);
    }
  }

  function onNavigate() {
    updateStyles();
  }

  document.addEventListener("yt-navigate-finish", onNavigate);
  document.addEventListener("yt-page-data-updated", onNavigate);
  window.addEventListener("popstate", onNavigate);

  const checkTimer = setInterval(updateStyles, 500);
  updateStyles();
})();

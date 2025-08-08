(function () {
  const STORAGE_KEY = "ytab_watched_ids";

  function getVideoIdFromUrl(url) {
    try {
      const u = new URL(url, location.origin);
      if (u.pathname !== "/watch") return null;
      const id = u.searchParams.get("v");
      return id || null;
    } catch {
      return null;
    }
  }

  function loadWatchedSet() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr);
    } catch {
      return new Set();
    }
  }

  function saveWatchedSet(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function addWatched(id) {
    if (!id) return;
    const set = loadWatchedSet();
    if (!set.has(id)) {
      set.add(id);
      saveWatchedSet(set);
    }
  }

  function isWatched(id) {
    if (!id) return false;
    const set = loadWatchedSet();
    return set.has(id);
  }

  function observeWatchPage() {
    if (!location.pathname.startsWith("/watch")) return;
    const id = getVideoIdFromUrl(location.href);
    if (id) addWatched(id);
    window.addEventListener("yt-navigate-finish", () => {
      const nextId = getVideoIdFromUrl(location.href);
      if (nextId) addWatched(nextId);
    });
  }

  function removeIfWatched(renderer) {
    if (!renderer) return;
    const link = renderer.querySelector('a[href^="/watch?"]');
    const id = link ? getVideoIdFromUrl(link.getAttribute("href")) : null;
    if (id && isWatched(id)) renderer.remove();
  }

  function scanHome() {
    if (location.pathname !== "/") return;
    const items = document.querySelectorAll(
      "ytd-rich-item-renderer .yt-lockup-view-model-wiz"
    );
    items.forEach((container) => {
      const renderer = container.closest("ytd-rich-item-renderer");
      removeIfWatched(renderer);
    });
  }

  function startObservers() {
    const observer = new MutationObserver(() => scanHome());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    scanHome();
  }

  observeWatchPage();
  startObservers();
})();

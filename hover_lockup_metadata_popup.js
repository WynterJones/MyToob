(function () {
  function createPopup() {
    const el = document.createElement("div");
    el.className = "ytab-hover-popup";
    const title = document.createElement("div");
    title.className = "title";
    el.appendChild(title);
    document.documentElement.appendChild(el);
    return el;
  }

  function updatePopupContent(popup, lockup) {
    const metadata = lockup.querySelector("yt-lockup-metadata-view-model");
    const titleEl = metadata ? metadata.querySelector("h3") : null;
    const channelEl = metadata
      ? metadata.querySelector("a.yt-simple-endpoint")
      : null;
    const viewsEl = metadata ? metadata.querySelector("span") : null;
    const title = titleEl ? titleEl.textContent?.trim() || "" : "";
    const channel = channelEl ? channelEl.textContent?.trim() || "" : "";
    const views = viewsEl ? viewsEl.textContent?.trim() || "" : "";
    popup.querySelector(".title").textContent = title;
  }

  function positionPopup(popup, x, y) {
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = popup.getBoundingClientRect();
    let left = x + 16;
    let top = y + 16;
    if (left + rect.width + padding > viewportWidth)
      left = viewportWidth - rect.width - padding;
    if (top + rect.height + padding > viewportHeight)
      top = viewportHeight - rect.height - padding;
    popup.style.left = left + "px";
    popup.style.top = top + "px";
  }

  function getHoverLockupFromEvent(e) {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return null;
    const lockup = target.closest("yt-lockup-view-model");
    if (!lockup) return null;
    const content = lockup.closest("#content");
    if (!content) return null;
    return lockup;
  }

  function onPointerMove(e) {
    if (!popup) {
      popup = createPopup();
      bindPopupPointer();
    }
    const overPopup = isPointerOverPopup || (popup && popup.contains(e.target));
    const hoveredLockup = overPopup
      ? currentLockup
      : getHoverLockupFromEvent(e);
    if (hoveredLockup) {
      if (currentLockup !== hoveredLockup) {
        currentLockup = hoveredLockup;
        updatePopupContent(popup, currentLockup);
      }
      popup.style.display = "block";
      cancelHide();
    } else if (!overPopup) {
      currentLockup = null;
      scheduleHide();
    }
    if (popup && (currentLockup || overPopup))
      positionPopup(popup, e.clientX, e.clientY);
  }

  function attachHover(lockup) {
    if (lockup.dataset.ytabHoverBound === "1") return;
    lockup.dataset.ytabHoverBound = "1";
    lockup.addEventListener("mouseenter", () => {
      currentLockup = lockup;
      if (!popup) popup = createPopup();
      updatePopupContent(popup, lockup);
      popup.style.display = "block";
      cancelHide();
    });
    lockup.addEventListener("mouseleave", () => {
      currentLockup = null;
      scheduleHide();
    });
  }

  function scan() {
    const nodes = document.querySelectorAll("#content ytd-rich-item-renderer");
    nodes.forEach(attachHover);
  }

  let popup = null;
  let currentLockup = null;
  let isPointerOverPopup = false;
  let hideTimer = null;

  function cancelHide() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function scheduleHide() {
    if (!popup) return;
    cancelHide();
    hideTimer = setTimeout(() => {
      if (!currentLockup && !isPointerOverPopup) popup.style.display = "none";
    }, 1500);
  }

  function bindPopupPointer() {
    if (!popup || popup.dataset.bound === "1") return;
    popup.dataset.bound = "1";
    popup.addEventListener("mouseenter", () => {
      isPointerOverPopup = true;
      cancelHide();
    });
    popup.addEventListener("mouseleave", () => {
      isPointerOverPopup = false;
      scheduleHide();
    });
  }
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  const ensurePopupInterval = setInterval(() => {
    if (!popup) return;
    bindPopupPointer();
  }, 250);
  scan();
})();

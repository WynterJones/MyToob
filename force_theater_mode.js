(function () {
  function isTheater() {
    const flexy = document.querySelector("ytd-watch-flexy");
    return !!(flexy && flexy.hasAttribute("theater"));
  }

  function tryEnableTheater() {
    if (isTheater()) return true;
    const sizeBtn = document.querySelector(".ytp-size-button");
    if (sizeBtn) {
      sizeBtn.click();
      return isTheater();
    }
    return false;
  }

  function enforce() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (tryEnableTheater() || attempts > 30) clearInterval(timer);
    }, 200);
  }

  const navHandler = () => enforce();
  document.addEventListener("yt-navigate-finish", navHandler);
  document.addEventListener("yt-page-data-updated", navHandler);
  enforce();
})();

(function () {
  function setHighestQuality() {
    const player = document.querySelector("#movie_player");
    if (!player || typeof player.getAvailableQualityLevels !== "function")
      return false;
    const levels = player.getAvailableQualityLevels();
    if (!levels || !levels.length) return false;
    const preferred = levels[0];
    if (typeof player.setPlaybackQualityRange === "function") {
      player.setPlaybackQualityRange(preferred, preferred);
    }
    if (typeof player.setPlaybackQuality === "function") {
      player.setPlaybackQuality(preferred);
    }
    if (
      typeof player.setPlaybackQualityRange !== "function" &&
      typeof player.setPlaybackQuality !== "function"
    )
      return false;
    return true;
  }

  function enforceQuality() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (setHighestQuality() || attempts > 50) clearInterval(timer);
    }, 200);
  }

  const navHandler = () => enforceQuality();
  document.addEventListener("yt-navigate-finish", navHandler);
  document.addEventListener("yt-page-data-updated", navHandler);
  enforceQuality();
})();

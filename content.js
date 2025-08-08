(function () {
  const observer = new MutationObserver(() => {
    checkForAds();
  });

  let isHandlingAd = false;
  let lastAdHandledTime = 0;
  const COOLDOWN_PERIOD = 5000;

  function getRandomTimeout(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function simulateClick(element) {
    if (!element) return false;

    element.click();

    const clickOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    };

    element.dispatchEvent(new MouseEvent("click", clickOptions));
    return true;
  }

  function checkForAds() {
    const currentTime = Date.now();
    if (isHandlingAd || currentTime - lastAdHandledTime < COOLDOWN_PERIOD) {
      return;
    }

    const sponsoredElement = document.querySelector(
      '#ytd-player [aria-label="Sponsored"]'
    );

    if (sponsoredElement) {
      isHandlingAd = true;

      const infoButton = document.querySelector(".ytp-ad-button-icon");
      if (infoButton) {
        simulateClick(infoButton);

        setTimeout(() => {
          const adInfoIframe = document.querySelector(
            "iframe.yt-about-this-ad-renderer"
          );
          if (adInfoIframe) {
            try {
              const iframeDocument =
                adInfoIframe.contentDocument ||
                adInfoIframe.contentWindow.document;

              const blockButton = iframeDocument.querySelector(
                'button[aria-label="Block"]'
              );
              if (blockButton) {
                observer.disconnect();

                try {
                  simulateClick(blockButton);

                  let continueButtonAttempts = 0;
                  const maxContinueButtonAttempts = 4;
                  let continueButtonClicked = false;

                  function checkForContinueButton() {
                    continueButtonAttempts++;

                    try {
                      const continueButton = iframeDocument.querySelectorAll(
                        '[aria-label="Stop seeing this ad?"] div[role="button"]'
                      )[1];

                      if (continueButton) {
                        simulateClick(continueButton);
                        continueButtonClicked = true;

                        setTimeout(() => {
                          const continueBtnStillExists =
                            iframeDocument.querySelector('div[role="button"]');

                          if (
                            !continueBtnStillExists ||
                            (continueBtnStillExists &&
                              !continueBtnStillExists.textContent.includes(
                                "CONTINUE"
                              ))
                          ) {
                            checkForCloseButton();
                          } else {
                            if (
                              continueButtonAttempts < maxContinueButtonAttempts
                            ) {
                              setTimeout(
                                checkForContinueButton,
                                getRandomTimeout()
                              );
                            } else {
                              checkForCloseButton();
                            }
                          }
                        }, getRandomTimeout());
                      } else {
                        if (continueButtonClicked) {
                          checkForCloseButton();
                        } else if (
                          continueButtonAttempts < maxContinueButtonAttempts
                        ) {
                          setTimeout(
                            checkForContinueButton,
                            getRandomTimeout()
                          );
                        } else {
                          checkForCloseButton();
                        }
                      }
                    } catch (e) {
                      console.error("Error with CONTINUE button:", e);
                      if (continueButtonAttempts < maxContinueButtonAttempts) {
                        setTimeout(checkForContinueButton, getRandomTimeout());
                      } else {
                        checkForCloseButton();
                      }
                    }
                  }

                  function checkForCloseButton() {
                    try {
                      const closeButton = iframeDocument.querySelector(
                        'button[aria-label="Close"]'
                      );

                      simulateClick(closeButton);
                    } catch (e) {
                      console.error("Error with Close button:", e);
                    }

                    finalizeAdBlocking();
                  }

                  setTimeout(checkForContinueButton, getRandomTimeout());
                } catch (e) {
                  console.error("Error during block button click:", e);
                  finalizeAdBlocking();
                }
              } else {
                isHandlingAd = false;
              }
            } catch (error) {
              console.error("Error accessing iframe content:", error);
              isHandlingAd = false;
            }
          } else {
            isHandlingAd = false;
          }
        }, getRandomTimeout());
      } else {
        isHandlingAd = false;
      }
    }
  }

  function finalizeAdBlocking() {
    lastAdHandledTime = Date.now();
    isHandlingAd = false;

    const adInfoIframe = document
      .querySelector("iframe.yt-about-this-ad-renderer")
      .closest('[style-target="host"]');

    if (adInfoIframe.style.display !== "none") {
      setTimeout(finalizeAdBlocking, getRandomTimeout());
      return;
    }

    setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, getRandomTimeout());
  }

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  checkForAds();
})();

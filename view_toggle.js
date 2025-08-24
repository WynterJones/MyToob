(function () {
  let isTextLayout = true;
  let toggleButton = null;

  function createToggleButton() {
    if (toggleButton) return;

    toggleButton = document.createElement("button");
    toggleButton.id = "mytube-view-toggle";
    toggleButton.innerHTML = isTextLayout ? "Grid View" : "List View";
    toggleButton.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      background: #212121;
      color: white;
      border: 1px solid #404040;
      border-radius: 4px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      font-family: Roboto, Arial, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;

    toggleButton.addEventListener("mouseenter", () => {
      toggleButton.style.background = "#303030";
      toggleButton.style.borderColor = "#606060";
      toggleButton.style.transform = "translateY(-1px)";
      toggleButton.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5)";
    });

    toggleButton.addEventListener("mouseleave", () => {
      toggleButton.style.background = "#212121";
      toggleButton.style.borderColor = "#404040";
      toggleButton.style.transform = "translateY(0)";
      toggleButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    });

    toggleButton.addEventListener("click", toggleView);
    document.body.appendChild(toggleButton);
  }

  function extractVideoInfo(item) {
    const titleElement = item.querySelector('.yt-lockup-metadata-view-model-wiz__title span');
    const channelElement = item.querySelector('.yt-content-metadata-view-model-wiz__metadata-row a');
    const metadataRows = item.querySelectorAll('.yt-content-metadata-view-model-wiz__metadata-row');
    const linkElement = item.querySelector('a[href^="/watch"]');
    
    // Get views from the second metadata row (not the channel row)
    let views = '';
    if (metadataRows.length > 1) {
      const viewsRow = metadataRows[1];
      const viewsText = viewsRow.querySelector('.yt-content-metadata-view-model-wiz__metadata-text');
      if (viewsText) {
        views = viewsText.textContent || '';
      }
    }
    
    return {
      title: titleElement?.textContent || 'No title',
      channel: channelElement?.textContent || 'Unknown channel',
      views: views,
      link: linkElement?.href || '#'
    };
  }

  function createListItem(videoInfo) {
    const listItem = document.createElement('div');
    listItem.className = 'mytube-list-item';
    listItem.innerHTML = `
      <a href="${videoInfo.link}" class="mytube-list-link">
        <div class="mytube-list-title">${videoInfo.title}</div>
        <div class="mytube-list-metadata">
          <span class="mytube-list-channel">${videoInfo.channel}</span>
          ${videoInfo.views ? `<span class="mytube-list-separator">•</span><span class="mytube-list-views">${videoInfo.views}</span>` : ''}
        </div>
      </a>
    `;
    
    // Add click event handler to ensure navigation works
    const link = listItem.querySelector('.mytube-list-link');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = videoInfo.link;
      });
    }
    
    return listItem;
  }

  function showLoadingIndicator() {
    // Remove existing loading indicator
    const existingLoader = document.querySelector('.mytube-loading');
    if (existingLoader) {
      existingLoader.remove();
    }

    const loader = document.createElement('div');
    loader.className = 'mytube-loading';
    loader.innerHTML = `
      <div class="mytube-loading-bar">
        <div class="mytube-loading-progress"></div>
      </div>
      <div class="mytube-loading-text">Loading list view...</div>
    `;
    
    const container = document.querySelector('#contents');
    if (container) {
      container.classList.add('mytube-loading-active');
      container.appendChild(loader);
    }
  }

  function hideLoadingIndicator() {
    const loader = document.querySelector('.mytube-loading');
    if (loader) {
      loader.remove();
    }
    
    const container = document.querySelector('#contents');
    if (container) {
      container.classList.remove('mytube-loading-active');
    }
  }

  function updateListView() {
    const items = document.querySelectorAll('ytd-rich-item-renderer');
    
    if (items.length === 0) {
      return;
    }

    items.forEach(item => {
      // Skip if already processed
      if (item.hasAttribute('data-mytube-processed')) {
        return;
      }
      
      // Remove any existing list item
      const existingList = item.querySelector('.mytube-list-item');
      if (existingList) {
        existingList.remove();
      }
      
      if (isTextLayout) {
        const videoInfo = extractVideoInfo(item);
        
        // Skip items with "No title" or empty titles
        if (!videoInfo.title || videoInfo.title === 'No title' || videoInfo.title.trim() === '') {
          item.style.display = 'none';
          item.setAttribute('data-mytube-processed', 'true');
          return;
        }
        
        const listItem = createListItem(videoInfo);
        item.appendChild(listItem);
        item.style.display = 'block';
        // Mark as processed to avoid re-processing
        item.setAttribute('data-mytube-processed', 'true');
      }
    });

    // Hide loading indicator after processing
    hideLoadingIndicator();
  }

  function toggleView() {
    isTextLayout = !isTextLayout;
    toggleButton.innerHTML = isTextLayout ? "Grid View" : "List View";

    const container = document.querySelector("#contents");
    if (container) {
      if (isTextLayout) {
        // Show loading indicator first
        showLoadingIndicator();
        
        // Clear processed flags before updating
        document.querySelectorAll('[data-mytube-processed]').forEach(item => {
          item.removeAttribute('data-mytube-processed');
        });
        container.classList.add("mytube-text-layout");
        container.classList.remove("mytube-grid-layout");
        
        // Wait for content to be ready
        setTimeout(() => {
          updateListView();
        }, 500);
      } else {
        hideLoadingIndicator();
        container.classList.add("mytube-grid-layout");
        container.classList.remove("mytube-text-layout");
        // Remove list items and clear flags when switching to grid
        document.querySelectorAll('.mytube-list-item').forEach(item => item.remove());
        document.querySelectorAll('[data-mytube-processed]').forEach(item => {
          item.removeAttribute('data-mytube-processed');
        });
      }
    }

    chrome.storage.local.set({
      "mytube-view-mode": isTextLayout ? "text" : "grid",
    });
  }

  function applyViewMode() {
    chrome.storage.local.get(["mytube-view-mode"], (result) => {
      if (result["mytube-view-mode"] === "grid") {
        isTextLayout = false;
      } else {
        isTextLayout = true;
      }

      // Wait 2 seconds for page to fully load before applying list view
      setTimeout(() => {
        const container = document.querySelector("#contents");
        if (container) {
          if (isTextLayout) {
            showLoadingIndicator();
            container.classList.add("mytube-text-layout");
            container.classList.remove("mytube-grid-layout");
            setTimeout(() => {
              updateListView();
            }, 500);
          } else {
            hideLoadingIndicator();
            container.classList.add("mytube-grid-layout");
            container.classList.remove("mytube-text-layout");
            document.querySelectorAll('.mytube-list-item').forEach(item => item.remove());
          }
        }

        if (toggleButton) {
          toggleButton.innerHTML = isTextLayout ? "Grid View" : "List View";
        }
      }, 2000);
    });
  }

  function initializeViewToggle() {
    // Only show toggle on home page and feed pages, not on video watch pages
    if (
      (window.location.pathname === "/" ||
      window.location.pathname.includes("/feed/")) &&
      !window.location.pathname.includes("/watch")
    ) {
      createToggleButton();
      applyViewMode();
    } else {
      // Hide toggle button if it exists on non-supported pages
      const existingButton = document.querySelector("#mytube-view-toggle");
      if (existingButton) {
        existingButton.style.display = "none";
      }
    }
  }

  let observerTimeout;
  const observer = new MutationObserver((mutations) => {
    // Check if mutations are adding our own elements to avoid loops
    const isOurChange = mutations.some(m => 
      Array.from(m.addedNodes).some(node => 
        node.className?.includes?.('mytube-list-item')
      )
    );
    
    if (isOurChange) return;
    
    // Re-initialize when navigating between pages
    if (
      !toggleButton &&
      (window.location.pathname === "/" ||
        window.location.pathname.includes("/feed/")) &&
      !window.location.pathname.includes("/watch")
    ) {
      initializeViewToggle();
    }
    
    // Hide button on watch pages
    if (window.location.pathname.includes("/watch")) {
      const existingButton = document.querySelector("#mytube-view-toggle");
      if (existingButton) {
        existingButton.style.display = "none";
      }
    }
    
    // Debounce the update to avoid excessive calls
    if (isTextLayout && !window.location.pathname.includes("/watch")) {
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        updateListView();
      }, 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeViewToggle);
  } else {
    initializeViewToggle();
  }
})();

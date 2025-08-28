// Listen for navigation events
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    if (!data.blockList) {
      chrome.storage.local.set({ blockList: ["example.com", "cjd.com", "hcudsi.com", "youtube.com"] }); // Pre-populate with default blocked sites
    }
    if (!data.allowList) {
      chrome.storage.local.set({ allowList: [] });
    }
  });
});

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only check top-level navigation

  const url = new URL(details.url);
  const hostname = url.hostname;

  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    const blockList = data.blockList || [];
    const allowList = data.allowList || [];

    if (allowList.includes(hostname)) {
      console.log("Allowed by explicit allow list:", hostname);
      return;
    }

    if (blockList.includes(hostname)) {
      console.log("Blocked:", hostname);

      // Redirect the tab to our local block page, passing the blocked URL
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`block.html?url=${encodeURIComponent(details.url)}`)
      });
    } else {
      console.log("Allowed:", hostname);
    }
  });
});

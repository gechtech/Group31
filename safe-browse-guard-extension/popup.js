function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

document.getElementById("blockBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hostname = getHostname(tabs[0].url);
    if (!hostname) return;

    chrome.storage.local.get(["blockList"], (data) => {
      let blockList = data.blockList || [];
      if (!blockList.includes(hostname)) blockList.push(hostname);
      chrome.storage.local.set({ blockList });
    });
  });
});

document.getElementById("allowBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hostname = getHostname(tabs[0].url);
    if (!hostname) return;

    chrome.storage.local.get(["allowList"], (data) => {
      let allowList = data.allowList || [];
      if (!allowList.includes(hostname)) allowList.push(hostname);
      chrome.storage.local.set({ allowList });
    });
  });
});

// 🚫 List of domains to block (you can add more here)
const blockList = ["example.com", "badwebsite.com", "phishing-site.org", "google.com", "youtube.com"];
const AllowedList = ["openai.com", "github.com", "stackoverflow.com"];

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only check top-level navigation

  const url = new URL(details.url);
  const hostname = url.hostname;

  if (blockList.includes(hostname)) {
    console.log("Blocked:", hostname);

    // Redirect the tab to our local block page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("block.html")
    });
  } else {
    console.log("Allowed:", hostname);
  }
});

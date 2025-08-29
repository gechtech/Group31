const defaultHardcodedBlockList = [
  "example.com",
  "youtube.com",
  "servio.net",
  "playit.gg",
  "camphish.io",
  "paypal-login.com",
  "secure-update.net",
  "apple-verify.com",
  "ply.gg",
  "bankofamerica-login.net",
  "login-microsoftsecure.com",
  "facebook-securityalert.com",
  "google-verifyaccount.com",
  "amazon-updatebilling.com",
  "outlook-websecure.com",
  "chase-banklogin.com",
  "icloud-securityverify.com",
  "dropbox-loginsecure.com",
  "instagram-security-alert.com",
  "linkedin-updateaccount.com",
  "yahoo-mailverify.com",
  "wellsfargo-securelogin.com",
  "microsoft-supportverify.com",
  "citibank-onlineverify.com",
  "hsbc-securebanking.com",
  "netflix-accountverify.com",
  "steamcommunity-loginsecure.com",
  "tiktok-verificationsecure.com",
  "snapchat-loginverify.com",
  "adobe-accountsecure.com",
  "spotify-loginsecure.com",
  "paypal-updateinfo.com",
  "google-accountsecure.com"
];

// 🔍 Advanced partial match keywords (e.g., "ply.gg" will block "subdomain.ply.gg")
const blockKeywords = [
  "ply.gg",
  "secure",
  "verify",
  "login",
  "accountverify",
  "updatebilling"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    if (data.blockList === undefined) {
      chrome.storage.local.set({ blockList: [] }); // Initialize user-managed blockList as empty
    }
    if (data.allowList === undefined) {
      chrome.storage.local.set({ allowList: [] });
    }
  });
});

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only check top-level navigation

  const url = new URL(details.url);
  const hostname = url.hostname.toLowerCase();

  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    const userBlockList = data.blockList || [];
    const allowList = data.allowList || [];

    // ✅ Check explicit allow list first
    if (allowList.includes(hostname)) {
      console.log("Allowed by explicit allow list:", hostname);
      return;
    }

    // 🚫 Check exact matches (hardcoded + user)
    if (defaultHardcodedBlockList.includes(hostname) || userBlockList.includes(hostname)) {
      console.log("Blocked (exact match):", hostname);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`block.html?url=${encodeURIComponent(details.url)}`)
      });
      return;
    }

    // 🚫 Check partial/keyword matches
    if (blockKeywords.some(keyword => hostname.includes(keyword))) {
      console.log("Blocked (keyword match):", hostname);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`block.html?url=${encodeURIComponent(details.url)}`)
      });
      return;
    }

    console.log("Allowed:", hostname);
  });
});

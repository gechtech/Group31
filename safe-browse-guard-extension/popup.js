function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

const statusMessage = document.getElementById("statusMessage");

function displayStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "red" : "green";
  setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

// 🔴 Block button (original functionality preserved)
document.getElementById("blockBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hostname = getHostname(tabs[0].url);
    if (!hostname) {
      displayStatus("Could not get hostname.", true);
      return;
    }

    chrome.storage.local.get(["blockList"], (data) => {
      let blockList = data.blockList || [];
      if (!blockList.includes(hostname)) {
        blockList.push(hostname);
        chrome.storage.local.set({ blockList }, () => {
          if (chrome.runtime.lastError) {
            displayStatus(`Error blocking site: ${chrome.runtime.lastError.message}`, true);
          } else {
            displayStatus(`'${hostname}' blocked successfully!`);
          }
        });
      } else {
        displayStatus(`'${hostname}' is already blocked.`);
      }
    });
  });
});

// 🟢 Allow button (new functionality)
document.getElementById("allowBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hostname = getHostname(tabs[0].url);
    if (!hostname) {
      displayStatus("Could not get hostname.", true);
      return;
    }

    chrome.storage.local.get(["blockList"], (data) => {
      let blockList = data.blockList || [];
      if (blockList.includes(hostname)) {
        // Already blocked → tell user to use Manage Blocked Sites
        displayStatus(
          `⚠ '${hostname}' is blocked. You can allow it in Manage Blocked Sites.`,
          true
        );
      } else {
        // Not blocked
        displayStatus(`'${hostname}' is not blocked.`);
      }
    });
  });
});

// ⚙ Manage Blocked Sites button
document.getElementById("manageBlockedSitesBtn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

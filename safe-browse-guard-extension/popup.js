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

document.getElementById("allowBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const hostname = getHostname(tabs[0].url);
    if (!hostname) {
      displayStatus("Could not get hostname.", true);
      return;
    }

    chrome.storage.local.get(["allowList"], (data) => {
      let allowList = data.allowList || [];
      if (!allowList.includes(hostname)) {
        allowList.push(hostname);
        chrome.storage.local.set({ allowList }, () => {
          if (chrome.runtime.lastError) {
            displayStatus(`Error allowing site: ${chrome.runtime.lastError.message}`, true);
          } else {
            displayStatus(`'${hostname}' allowed successfully!`);
          }
        });
      } else {
        displayStatus(`'${hostname}' is already allowed.`);
      }
    });
  });
});

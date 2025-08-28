const statusMessage = document.getElementById("statusMessage");

function displayStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "red" : "green";
  setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

function renderLists() {
  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    const blocked = data.blockList || [];
    const allowed = data.allowList || [];

    const blockedUl = document.getElementById("blocked");
    blockedUl.innerHTML = "";
    blocked.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeSite(site, "blockList")); // Changed type to "blockList"
      li.appendChild(removeBtn);
      blockedUl.appendChild(li);
    });

    const allowedUl = document.getElementById("allowed");
    allowedUl.innerHTML = "";
    allowed.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeSite(site, "allowList")); // Changed type to "allowList"
      li.appendChild(removeBtn);
      allowedUl.appendChild(li);
    });
  });
}

function removeSite(siteToRemove, listType) {
  chrome.storage.local.get([listType], (data) => {
    let list = data[listType] || [];
    const initialLength = list.length;
    const updatedList = list.filter(site => site !== siteToRemove);

    if (updatedList.length < initialLength) {
      chrome.storage.local.set({ [listType]: updatedList }, () => {
        if (chrome.runtime.lastError) {
          displayStatus(`Error removing site: ${chrome.runtime.lastError.message}`, true);
        } else {
          displayStatus(`'${siteToRemove}' removed from ${listType.replace("List", "")} list.`);
          renderLists(); // Re-render the lists after removal
        }
      });
    } else {
      displayStatus(`'${siteToRemove}' was not found in the ${listType.replace("List", "")} list.`, true);
    }
  });
}

renderLists();

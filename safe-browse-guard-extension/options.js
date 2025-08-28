function renderLists() {
  chrome.storage.local.get(["blockList", "allowList"], (data) => {
    const blocked = data.blockList || [];
    const allowed = data.allowList || [];

    const blockedUl = document.getElementById("blocked");
    blockedUl.innerHTML = "";
    blocked.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      blockedUl.appendChild(li);
    });

    const allowedUl = document.getElementById("allowed");
    allowedUl.innerHTML = "";
    allowed.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      allowedUl.appendChild(li);
    });
  });
}

renderLists();

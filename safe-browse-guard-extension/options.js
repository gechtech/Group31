document.addEventListener('DOMContentLoaded', () => {
  const blockedListElement = document.getElementById('blocked-list');
  const messageElement = document.getElementById('message');

  function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = type;
    setTimeout(() => {
      messageElement.textContent = '';
      messageElement.className = '';
    }, 3000);
  }

  function renderBlockedList() {
    chrome.storage.local.get(['blockList'], (result) => {
      const blockList = result.blockList || [];
      blockedListElement.innerHTML = ''; // Clear existing list

      if (blockList.length === 0) {
        blockedListElement.innerHTML = '<li>No websites are currently blocked.</li>';
        return;
      }

      blockList.forEach((url) => {
        const listItem = document.createElement('li');
        const urlSpan = document.createElement('span');
        urlSpan.textContent = url;
        listItem.appendChild(urlSpan);

        const unblockButton = document.createElement('button');
        unblockButton.textContent = 'Unblock';
        unblockButton.className = 'unblock-btn';
        unblockButton.addEventListener('click', () => unblockWebsite(url));
        listItem.appendChild(unblockButton);

        blockedListElement.appendChild(listItem);
      });
    });
  }

  function unblockWebsite(urlToUnblock) {
    chrome.storage.local.get(['blockList'], (result) => {
      let blockList = result.blockList || [];
      const initialLength = blockList.length;
      blockList = blockList.filter(url => url !== urlToUnblock);

      if (blockList.length < initialLength) {
        chrome.storage.local.set({ blockList }, () => {
          showMessage(`'${urlToUnblock}' unblocked successfully.`, 'success');
          renderBlockedList(); // Re-render the list after unblocking
        });
      } else {
        showMessage(`Failed to unblock '${urlToUnblock}'. It might not be in the list.`, 'error');
      }
    });
  }

  renderBlockedList();
});

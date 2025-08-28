console.log("Blocked page script loaded");

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('url');

  if (blockedUrl) {
    document.getElementById('blockedUrl').textContent = decodeURIComponent(blockedUrl);
  }

  const goBackBtn = document.getElementById('goBackBtn');
  if (goBackBtn) {
    goBackBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.history.back();
    });
  }

  const modal = document.getElementById("infoModal");
  const moreInfoBtn = document.getElementById("moreInfoBtn");
  const closeBtn = document.querySelector(".close-button");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const reportSafeBtn = document.getElementById("reportSafeBtn");

  // Open modal
  if (moreInfoBtn) {
    moreInfoBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "flex";
    });
  }

  // Close modal by X
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // Close modal by button
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      if (modal) modal.style.display = "none";
    }
  });

  // Report safe
  if (reportSafeBtn) {
    reportSafeBtn.addEventListener("click", () => {
      alert("Thank you for reporting! We will review this site.");
      if (modal) modal.style.display = "none";
    });
  }
});
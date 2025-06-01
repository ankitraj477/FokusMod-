const blockedList = document.getElementById("blocked-sites");
const focusList = document.getElementById("focus-sites");
const newBlocked = document.getElementById("new-blocked");
const newFocus = document.getElementById("new-focus");
const addBlockedBtn = document.getElementById("add-blocked");
const addFocusBtn = document.getElementById("add-focus");
const savedMsg = document.getElementById("saved-msg");
const focusTimeText = document.getElementById("focus-time");

// Load saved sites
chrome.storage.local.get(["blockedSites", "focusSites"], data => {
  renderSiteList(data.blockedSites || [], blockedList, "blockedSites");
  renderSiteList(data.focusSites || [], focusList, "focusSites");
});

// Load focus time today
chrome.storage.local.get(["focusTimeLog"], data => {
  const today = new Date().toISOString().split("T")[0];
  const seconds = data.focusTimeLog?.[today] || 0;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  focusTimeText.textContent = `${minutes} min ${remainingSeconds} sec`;
});

function renderSiteList(sites, container, storageKey) {
  container.innerHTML = "";
  sites.forEach(site => {
    const div = document.createElement("div");
    div.className = "site-entry";
    div.innerHTML = `
      <span>${site}</span>
      <button class="remove-btn">X</button>
    `;
    div.querySelector(".remove-btn").addEventListener("click", () => {
      removeSite(site, storageKey);
    });
    container.appendChild(div);
  });
}

function addSite(inputEl, storageKey, container) {
  const site = inputEl.value.trim();
  if (!site) return;

  chrome.storage.local.get([storageKey], data => {
    const sites = data[storageKey] || [];
    if (!sites.includes(site)) {
      sites.push(site);
      chrome.storage.local.set({ [storageKey]: sites }, () => {
        renderSiteList(sites, container, storageKey);
        inputEl.value = "";
        showSavedMsg();
      });
    }
  });
}

function removeSite(site, storageKey) {
  chrome.storage.local.get([storageKey], data => {
    const sites = (data[storageKey] || []).filter(s => s !== site);
    chrome.storage.local.set({ [storageKey]: sites }, () => {
      const container = storageKey === "blockedSites" ? blockedList : focusList;
      renderSiteList(sites, container, storageKey);
      showSavedMsg();
    });
  });
}

function showSavedMsg() {
  savedMsg.style.display = "block";
  setTimeout(() => savedMsg.style.display = "none", 2000);
}

// Event listeners for Add buttons
addBlockedBtn.addEventListener("click", () => {
  addSite(newBlocked, "blockedSites", blockedList);
});
addFocusBtn.addEventListener("click", () => {
  addSite(newFocus, "focusSites", focusList);
});

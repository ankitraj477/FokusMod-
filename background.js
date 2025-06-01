// background.js

let focusMode = false;
let focusSites = [];
let currentHostname = null;
let timer = null;

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    if (!focusMode || !currentHostname) return;

    chrome.storage.local.get('focusTimeLog', (result) => {
      const log = result.focusTimeLog || {};
      const today = new Date().toISOString().split('T')[0];
      log[today] = (log[today] || 0) + 1; // increment by 1 second

      chrome.storage.local.set({ focusTimeLog: log });
    });
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function updateCurrentSite(url) {
  const hostname = getHostname(url);
  if (focusMode && hostname && focusSites.includes(hostname)) {
    currentHostname = hostname;
    startTimer();
  } else {
    currentHostname = null;
    stopTimer();
  }
}

// Initialize from storage
chrome.storage.local.get(['focusMode', 'focusSites'], (data) => {
  focusMode = data.focusMode || false;
  focusSites = data.focusSites || [];
});

// Listen for changes in focusMode or focusSites
chrome.storage.onChanged.addListener((changes) => {
  if (changes.focusMode) {
    focusMode = changes.focusMode.newValue;
    updateCurrentTab();
  }
  if (changes.focusSites) {
    focusSites = changes.focusSites.newValue || [];
    updateCurrentTab();
  }
});

function updateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) {
      updateCurrentSite(null);
      return;
    }
    updateCurrentSite(tabs[0].url);
  });
}

// Listen for tab changes and updates
chrome.tabs.onActivated.addListener(updateCurrentTab);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete') {
    updateCurrentSite(tab.url);
  }
});

// Start tracking on load
updateCurrentTab();

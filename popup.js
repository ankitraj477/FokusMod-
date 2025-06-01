

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-btn");
  const modeStatus = document.getElementById("mode-status");
  const addBtn = document.getElementById("add-site");
  const input = document.getElementById("new-site");
  const siteContainer = document.getElementById("focus-sites");
  const timeContainer = document.getElementById("focus-time-list");
  const toggleSiteListBtn = document.getElementById("toggle-site-list");
  const toggleTimeLogBtn = document.getElementById("toggle-time-log");

  let showSites = false;
  let showTimes = false;

  // Initial Load
  chrome.storage.local.get(["focusMode", "focusSites", "focusTimeLog"], (data) => {
    updateFocusStatus(data.focusMode || false);
    renderSites(data.focusSites || []);
    renderFocusTime(data.focusTimeLog || {});
  });

  // Toggle Focus Mode
  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get("focusMode", (data) => {
      const newStatus = !data.focusMode;
      chrome.storage.local.set({ focusMode: newStatus }, () => {
        updateFocusStatus(newStatus);
      });
    });
  });

  function updateFocusStatus(isOn) {
    modeStatus.textContent = isOn ? "ON" : "OFF";
  }

  // Add new site
  addBtn.addEventListener("click", () => {
    const site = input.value.trim();
    if (!site) return;

    chrome.storage.local.get("focusSites", (data) => {
      const sites = data.focusSites || [];
      if (!sites.includes(site)) {
        sites.push(site);
        chrome.storage.local.set({ focusSites: sites }, () => {
          input.value = "";
          renderSites(sites);
        });
      }
    });
  });

  // Render Focus Sites
  function renderSites(sites) {
    siteContainer.innerHTML = "";
    if (!showSites) return;

    if (sites.length === 0) {
      siteContainer.textContent = "No sites added.";
      return;
    }

    sites.forEach(site => {
      const div = document.createElement("div");
      div.className = "site-entry";
      div.innerHTML = `
        <span>${site}</span>
        <button class="remove-btn" data-site="${site}">✕</button>
      `;
      siteContainer.appendChild(div);
    });
  }

  // Handle remove site (delegated)
  siteContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const toRemove = e.target.dataset.site;
      chrome.storage.local.get("focusSites", (data) => {
        const updated = (data.focusSites || []).filter(site => site !== toRemove);
        chrome.storage.local.set({ focusSites: updated }, () => {
          renderSites(updated);
        });
      });
    }
  });

  // Render Focus Time
  function renderFocusTime(log) {
    timeContainer.innerHTML = "";
    if (!showTimes) return;

    const dates = Object.keys(log).sort().reverse();
    if (dates.length === 0) {
      timeContainer.textContent = "No time logged yet.";
      return;
    }

    dates.forEach(date => {
      const sec = log[date];
      const min = Math.floor(sec / 60);
      const remain = sec % 60;

      const div = document.createElement("div");
      div.className = "site-entry";
      div.textContent = `${date}: ${min}m ${remain}s`;
      timeContainer.appendChild(div);
    });
  }

  // Toggle site list
  toggleSiteListBtn.addEventListener("click", () => {
    showSites = !showSites;
    siteContainer.style.display = showSites ? "block" : "none";
    toggleSiteListBtn.textContent = showSites ? "Hide Sites ▲" : "Show Sites ▼";

    // Reload list from storage
    chrome.storage.local.get("focusSites", (data) => {
      renderSites(data.focusSites || []);
    });
  });

  // Toggle time log
  toggleTimeLogBtn.addEventListener("click", () => {
    showTimes = !showTimes;
    timeContainer.style.display = showTimes ? "block" : "none";
    toggleTimeLogBtn.textContent = showTimes ? "Hide Time Log ▲" : "Show Time Log ▼";

    chrome.storage.local.get("focusTimeLog", (data) => {
      renderFocusTime(data.focusTimeLog || {});
    });
  });
});

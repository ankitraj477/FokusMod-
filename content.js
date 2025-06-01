
const OVERLAY_ID = 'focusmode-blackout-overlay';

// Create and show blackout overlay
function addOverlay() {
  if (document.getElementById(OVERLAY_ID)) return; // already exists

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    opacity: '0.95',
    zIndex: '9999999',
    color: 'white',
    fontSize: '2em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    pointerEvents: 'all',
  });
  overlay.textContent = 'Blocked by FokusMod+';

  document.body.appendChild(overlay);
}

// Remove blackout overlay if present
function removeOverlay() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

// Check if current site is allowed and toggle overlay accordingly
function checkFocusMode() {
  chrome.storage.local.get(['focusMode', 'focusSites'], ({ focusMode, focusSites }) => {
    if (!focusMode) {
      // Focus mode off: remove overlay
      removeOverlay();
      return;
    }

    const hostname = window.location.hostname.replace(/^www\./, '');

    if (focusSites && focusSites.includes(hostname)) {
      // Site is allowed: remove overlay
      removeOverlay();
    } else {
      // Site not allowed: add overlay
      addOverlay();
    }
  });
}

// Initial check on page load
checkFocusMode();

// Listen for storage changes to update overlay dynamically
chrome.storage.onChanged.addListener((changes) => {
  if (changes.focusMode || changes.focusSites) {
    checkFocusMode();
  }
});

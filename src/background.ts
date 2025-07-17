// Load blocked sites and update DNR rules accordingly
function updateBlockedSites() {
  chrome.storage.sync.get(["blockedSites"], (data) => {
    const blockedSites: string[] = data.blockedSites || [];

    const rules: chrome.declarativeNetRequest.Rule[] = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect" as const,
        redirect: {
          extensionPath: "/block.html"
        }
      },
      condition: {
        urlFilter: `||${site}^`,
        resourceTypes: ["main_frame"]
      }
    }));

    // Remove old rules, then add new ones
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const ruleIds = existingRules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: rules
      }, () => {
        console.log("Updated DNR rules:", rules);
      });
    });
  });
}

// Watch for storage changes and update block rules dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.blockedSites) {
    console.log("Blocked sites changed, updating rules...");
    updateBlockedSites();
  }
});

// On install, initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log("WIBE extension installed!");
  updateBlockedSites();
});


let isRunning = false;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timeLeft = 1 * 60;

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval!);
      isRunning = false;
      timeLeft = 1 * 60;

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "EYE_BREAK_ALERT" });
          }
        });
      });
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  isRunning = false;
}

// Extension installed event
chrome.runtime.onInstalled.addListener(() => {
  console.log("WIBE background service worker loaded!");
});

// Listener for popup requests
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "GET_TIMER_STATUS":
      sendResponse({ isRunning, timeLeft });
      break;
    case "START_TIMER":
      startTimer();
      sendResponse({ success: true });
      break;
    case "STOP_TIMER":
      stopTimer();
      sendResponse({ success: true });
      break;
  }
  return true;
});

// Alarm listener (for scheduled breaks)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "eyeBreakReminder") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "EYE_BREAK_ALERT" });
        }
      });
    });
  }
});

export {};

import { useEffect, useState } from "react";
import { formatTime } from "../utils/timerUtils";

function Popup() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [inputSite, setInputSite] = useState(""); 

  // ⏳ Poll background every second
  useEffect(() => {
    const interval = setInterval(() => {
      chrome.runtime.sendMessage({ type: "GET_TIMER_STATUS" }, (response) => {
        if (response) {
          setTimeLeft(response.timeLeft);
          setIsRunning(response.isRunning);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
  chrome.storage.sync.get(['blockedSites'], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Failed to load blocked sites", chrome.runtime.lastError);
      setBlockedSites([]);
    } else {
      chrome.storage.sync.get("blockedSites", console.log);
      setBlockedSites(result.blockedSites || []);
    }
  });
  }, []);

  const addSite = () => {
    if (!inputSite) return;
    const updated = [...blockedSites, inputSite];
    chrome.storage.sync.set({ blockedSites: updated }, () => {
      setBlockedSites(updated);
      setInputSite("");
    });
  };

  const removeSite = (site: string) => {
    const updated = blockedSites.filter((s) => s !== site);
    chrome.storage.sync.set({ blockedSites: updated }, () => {
      setBlockedSites(updated);
    });
  };

  const handleStart = () => {
    chrome.runtime.sendMessage({ type: "START_TIMER" });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: "STOP_TIMER" });
  };

  return (
    <div>
      <h2>{formatTime(timeLeft)}</h2>
      <button onClick={handleStart} disabled={isRunning}>
        Start
      </button>
      <button onClick={handleStop} disabled={!isRunning}>
        Stop
      </button>
      <div style={{ padding: "1rem", width: "300px" }}>
      <h3>Blocked Sites</h3>
      <ul>
        {blockedSites.map((site, index) => (
          <li key={index}>
            {site}{" "}
            <button onClick={() => removeSite(site)} style={{ marginLeft: "8px" }}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="example.com"
        value={inputSite}
        onChange={(e) => setInputSite(e.target.value)}
        style={{ width: "80%", marginRight: "4px" }}
      />
      <button onClick={addSite}>Add</button>
    </div>
    </div>
  );
}

export default Popup;

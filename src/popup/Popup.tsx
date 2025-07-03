import { useEffect, useState } from "react";
import { formatTime } from "../utils/timerUtils";

function Popup() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    </div>
  );
}

export default Popup;

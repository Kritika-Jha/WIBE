let isRunning = false;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timeLeft = 1*60;

function startTimer(){
    if(isRunning) return;
    isRunning = true;

    timerInterval = setInterval(() =>{
      timeLeft--;
      if(timeLeft <= 0){
        clearInterval(timerInterval!);
        isRunning = false;
        timeLeft = 1*60;

        chrome.tabs.query({}, (tabs) =>{
          tabs.forEach((tab) =>{
            if(tab.id){
              chrome.tabs.sendMessage(tab.id, {type: "EYE_BREAK_ALERT"});
            }
          });
        });
      }
    }, 1000);
}

function stopTimer(){
  if(timerInterval) clearInterval(timerInterval);
  isRunning = false;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("WIBE background service worker loaded!");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if(message.type === "GET_TIMER_STATUS"){
    sendResponse({isRunning, timeLeft});
  }
  else if(message.type === "START_TIMER"){
    startTimer();
    sendResponse({success: true});
  }
  else if(message.type === "STOP_TIMER"){
    stopTimer();
    sendResponse({success: true});
  }
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if(alarm.name === "eyeBreakReminder"){
    chrome.tabs.query({}, (tabs) =>{
      tabs.forEach((tab) =>{
        if(tab.id){
          chrome.tabs.sendMessage(tab.id, {type: "EYE_BREAK_ALERT"});
        }
      });
    });
  }
});
export {};
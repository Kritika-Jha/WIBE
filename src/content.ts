chrome.runtime.onMessage.addListener((msg) => {
    console.log("Received message:", msg);
    if (msg.type === "EYE_BREAK_ALERT") {
        // Remove existing overlay if any
        const old = document.getElementById("wibe-break-overlay");
        if (old) old.remove();

        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "wibe-break-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0,0,0,0.7)";
        overlay.style.color = "#fff";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "999999";
        overlay.style.fontSize = "2rem";

        let seconds = 20;
        overlay.textContent = `👀 Rest your eyes! ${seconds}s`;

        document.body.appendChild(overlay);

        const interval = setInterval(() => {
            seconds--;
            overlay.textContent = `👀 Rest your eyes! ${seconds}s`;
            if (seconds <= 0) {
                clearInterval(interval);
                overlay.remove();
            }
        }, 1000);
    }
});
/* Optional introduction Read Aloud. No automated voice, no data uploads.
 * Reading controls use assets/learner-preferences.js across prototype pages. */
(() => {
  "use strict";
  const id = name => document.getElementById(name);
  const status = id("settings-status");
  const read = id("read-aloud");
  const stop = id("stop-reading");
  const canRead = typeof window.SpeechSynthesisUtterance !== "undefined" &&
    "speechSynthesis" in window && typeof window.speechSynthesis.speak === "function";
  if (!canRead) {
    read.disabled = true;
    read.title = "Reading aloud is not supported by this browser. Use your device's screen reader.";
    status.textContent = "Read Aloud is unavailable here. Your device's built-in screen reader can still be used.";
    return;
  }
  let utterance;
  let active = false;
  const finish = () => {
    active = false;
    read.disabled = false;
    stop.disabled = true;
  };
  read.addEventListener("click", () => {
    if (active) return;
    const heading = id("welcome").textContent.trim();
    const text = id("start-intro").querySelector(".lead").textContent.trim();
    const note = id("start-intro").querySelector(".note").textContent.trim();
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance([heading,text,note,"Below, choose Learn, Practice, or Ask for Help."].join(" "));
    utterance.lang = "en-US";
    utterance.rate = .85;
    utterance.onstart = () => {
      active = true;
      read.disabled = true;
      stop.disabled = false;
      status.textContent = "Reading the introduction aloud. You can stop at any time.";
    };
    utterance.onend = () => {
      finish();
      status.textContent = "Reading finished.";
    };
    utterance.onerror = () => {
      finish();
      status.textContent = "Audio reading was unavailable. The text is still on the page, and your device screen reader may help.";
    };
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish();
      status.textContent = "Audio reading was unavailable in this browser.";
    }
  });
  stop.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    finish();
    status.textContent = "Reading stopped.";
  });
  window.addEventListener("pagehide", () => {
    window.speechSynthesis.cancel();
    finish();
  });
})();

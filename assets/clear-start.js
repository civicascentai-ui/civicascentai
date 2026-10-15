/* Clear Start accessibility controls. Entirely client-side.
 * No API calls, cookies, localStorage, analytics, AI service or payments. */
(() => {
  "use strict";
  const id = name => document.getElementById(name);
  const page = document.body;
  const status = id("settings-status");
  const read = id("read-aloud");
  const stop = id("stop-reading");
  const theme = id("theme-toggle");
  const scenery = id("scenery-toggle");
  let scale = 100;
  const updateScale = () => {
    document.documentElement.style.fontSize = scale + "%";
    document.documentElement.style.setProperty("--font-base", (scale/5) + "px");
    status.textContent = "Text size: " + (scale === 100 ? "standard large" : scale + "%") + ".";
    id("text-minus").disabled = scale <= 100;
    id("text-plus").disabled = scale >= 150;
  };
  id("text-minus").addEventListener("click", () => {scale=Math.max(100,scale-12.5);updateScale()});
  id("text-plus").addEventListener("click", () => {scale=Math.min(150,scale+12.5);updateScale()});
  updateScale();
  theme.addEventListener("click", () => {
    const dark = page.dataset.theme !== "dark";
    page.dataset.theme = dark ? "dark" : "light";
    theme.setAttribute("aria-pressed", dark ? "true" : "false");
    theme.textContent = dark ? "Light background" : "Dark background";
    status.textContent = dark ? "Dark, high-contrast appearance selected." : "Light, high-contrast appearance selected.";
  });
  scenery.addEventListener("click", () => {
    const visible = page.classList.toggle("show-scene");
    scenery.setAttribute("aria-pressed", visible ? "true" : "false");
    scenery.textContent = visible ? "Hide Safari picture" : "Show Safari picture";
    status.textContent = visible ? "Safari background image shown. Text remains readable." : "Safari picture hidden for a simpler view.";
  });
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

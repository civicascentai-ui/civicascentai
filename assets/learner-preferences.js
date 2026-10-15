/* CivicAscent prototype reading preferences. No personal data, no accounts.
 * The only stored fields are UI choices; learner prompts are never stored.
 * Applies only on Clear Start and its isolated student practice sandbox. */
(() => {
  "use strict";
  const KEY = "civicascent-reader-preferences-v1";
  const sizes = [100, 112.5, 125, 137.5, 150];
  const state = { scale: 100, dark: false };
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || "{}");
    if (sizes.includes(saved.scale)) state.scale = saved.scale;
    if (typeof saved.dark === "boolean") state.dark = saved.dark;
  } catch (_) { /* storage may be blocked; controls still work */ }
  const updateStatus = message => {
    const status = document.getElementById("settings-status") || document.getElementById("reader-status");
    if (status && message) status.textContent = message;
  };
  const save = () => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* optional */ }
  };
  const apply = message => {
    document.documentElement.style.fontSize = state.scale + "%";
    document.documentElement.style.setProperty("--font-base", (state.scale / 5) + "px");
    document.body.dataset.theme = state.dark ? "dark" : "light";
    for (const button of document.querySelectorAll('[data-reader-action="increase"]')) {
      button.disabled = state.scale >= 150;
    }
    for (const button of document.querySelectorAll('[data-reader-action="decrease"]')) {
      button.disabled = state.scale <= 100;
    }
    const darkButton = document.getElementById("theme-toggle");
    if (darkButton) {
      darkButton.setAttribute("aria-pressed", String(state.dark));
      darkButton.textContent = state.dark ? "Light background" : "Dark background";
    }
    updateStatus(message);
  };
  document.querySelectorAll("[data-reader-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.readerAction;
      if (action === "increase") {
        state.scale = sizes[Math.min(sizes.indexOf(state.scale) + 1, sizes.length - 1)];
      } else if (action === "decrease") {
        state.scale = sizes[Math.max(sizes.indexOf(state.scale) - 1, 0)];
      } else if (action === "theme") {
        state.dark = !state.dark;
      } else if (action === "reset") {
        state.scale = 100; state.dark = false;
      } else { return; }
      save();
      apply(action === "reset" ? "Reading settings reset to default." :
        "Text " + state.scale + "%. " + (state.dark ? "Dark" : "Light") + " background.");
    });
  });
  apply();
  window.CivicReader = Object.freeze({
    get scale() { return state.scale; },
    get dark() { return state.dark; }
  });
})();

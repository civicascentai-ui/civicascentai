/* CivicAscent student practice, no model/API calls and no storage.
 * All practice examples are fictional and only handled in this browser tab. */
"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const sections = {
    prompt: byId("activity-prompt"),
    verify: byId("activity-verify"),
    privacy: byId("activity-privacy")
  };
  const buttons = [...document.querySelectorAll(".practice-tab")];
  function openStation(name) {
    if (!Object.hasOwn(sections, name)) return;
    for (const [key, section] of Object.entries(sections)) {
      section.hidden = key !== name;
    }
    for (const button of buttons) {
      const isActive = button.dataset.activity === name;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.classList.toggle("selected", isActive);
    }
    const heading = sections[name].querySelector("h3");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    sections[name].scrollIntoView({ block: "start", behavior: "auto" });
  }
  buttons.forEach(button => button.addEventListener("click", () => openStation(button.dataset.activity)));

  const samples = Object.freeze({
    everyday: Object.freeze({
      goal: "Draft a short reminder for a fictional community AI workshop.",
      context: "The example workshop is at Maple Learning Room next Friday at 2 PM; these details are fictional.",
      limits: "Use welcoming plain language, avoid promises and personal information, and mark the date for confirmation.",
      format: "Write an accessible reminder in four short sentences."
    }),
    career: Object.freeze({
      goal: "Create an introductory training plan for an imaginary office team.",
      context: "Five fictional employees have 30 minutes to learn safe uses of AI in workplace writing.",
      limits: "Include a verification step. Do not ask for customer data or confidential documents.",
      format: "Make a three-part plan with an estimated number of minutes for each part."
    }),
    veterans: Object.freeze({
      goal: "Draft a general checklist for researching veteran education benefits.",
      context: "This is for a fictional learner who wants to identify trustworthy official resources.",
      limits: "Do not invent benefit eligibility, promise approval, or request service records. Ask the learner to verify with the official agency.",
      format: "Provide five plain-language research questions and a reminder to confirm answers with official sources."
    }),
    advanced: Object.freeze({
      goal: "Compare two fictional AI summaries of a community workshop notice.",
      context: "The workshop notice is fictional: Friday at 2 PM, free, at East Hall.",
      limits: "Flag conflicting details, quote the source accurately, and mark uncertain claims for human verification.",
      format: "Output a comparison table with claim, source evidence, and verification status."
    })
  });
  const keys = ["goal", "context", "limits", "format"];
  const boxes = Object.fromEntries(keys.map(key => [key, byId("prompt-" + key)]));
  const output = byId("prompt-output");
  const feedback = byId("prompt-feedback");
  const copy = byId("copy-prompt");
  const resetOutput = () => {
    output.textContent = "Your practice prompt will appear here.";
    copy.disabled = true;
    feedback.dataset.pass = "false";
  };
  byId("load-example").addEventListener("click", () => {
    const example = samples[byId("practice-scenario").value];
    if (!example) return;
    for (const key of keys) boxes[key].value = example[key];
    resetOutput();
    feedback.textContent = "Fictional example loaded. Review it, change any part, then build your prompt.";
  });
  byId("build-prompt").addEventListener("click", () => {
    const entries = keys.map(key => boxes[key].value.trim());
    const missing = keys.filter((_, i) => !entries[i]);
    if (missing.length) {
      resetOutput();
      feedback.textContent = "Add " + missing.join(", ") + " before building your practice prompt.";
      boxes[missing[0]].focus();
      return;
    }
    const headings = ["My goal", "Background and context", "Boundaries and safety rules", "Desired output"];
    const assembled = entries.map((entry, i) => headings[i] + ":\n" + entry).join("\n\n");
    output.textContent = assembled;
    copy.disabled = false;
    feedback.dataset.pass = "true";
    feedback.textContent = "Great structure: goal, context, boundaries and output are all present. You still need to verify any facts when using a real AI tool.";
  });
  byId("reset-prompt").addEventListener("click", () => {
    for (const key of keys) boxes[key].value = "";
    resetOutput();
    feedback.textContent = "Draft cleared from this page. Nothing was uploaded or saved.";
    boxes.goal.focus();
  });
  copy.addEventListener("click", async () => {
    if (copy.disabled) return;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error("clipboard_unavailable");
      await navigator.clipboard.writeText(output.textContent);
      feedback.textContent = "Practice prompt copied. Share it only with a tool you trust, and never add private information.";
    } catch {
      feedback.textContent = "Clipboard access is unavailable. Select the assembled prompt and copy it manually.";
      output.focus();
    }
  });
  byId("check-facts").addEventListener("click", () => {
    const timeChecked = byId("verify-time").checked;
    const placeChecked = byId("verify-place").checked;
    const costChecked = byId("verify-cost").checked;
    const correct = timeChecked && !placeChecked && costChecked;
    const status = byId("verify-feedback");
    status.dataset.pass = correct ? "true" : "false";
    status.textContent = correct
      ? "Correct. The example AI changed Friday at 2 PM to Thursday at 3 PM and changed free admission to $15. East Hall was accurate. Always compare claims with the original source."
      : "Try again: check the day/time and fee against the original notice. The location matches. This is only a fictional training scenario.";
  });
  byId("check-privacy").addEventListener("click", () => {
    const fictional = byId("privacy-fictional").checked;
    const password = byId("privacy-password").checked;
    const medical = byId("privacy-medical").checked;
    const goal = byId("privacy-goal").checked;
    const correct = fictional && goal && !password && !medical;
    const status = byId("privacy-feedback");
    status.dataset.pass = correct ? "true" : "false";
    status.textContent = correct
      ? "Correct. Fictional names and general learning goals are suitable for practice. Never share a real password or private medical record."
      : "Try again: choose only fictional details and general learning goals. Avoid actual passwords and private documents.";
  });
  for (const box of Object.values(boxes)) {
    box.addEventListener("input", () => {
      if (!copy.disabled) {
        resetOutput();
        feedback.textContent = "Your draft changed. Build the prompt again to use the updated version.";
      }
    });
  }
})();

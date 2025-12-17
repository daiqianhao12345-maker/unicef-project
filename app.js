const state = {
  hasDonated: false,
  selectedMessage: "",
  toastTimerId: 0
};

const encouragementMessages = [
  "You’ve already been so brave—don’t be afraid. Tomorrow can be better.",
  "You deserve love, safety, and happiness.",
  "Believe in yourself—your future will shine.",
  "Every step counts. You are becoming stronger.",
  "When you feel scared, someone in the world is cheering for you.",
  "You are not alone. We are here for you.",
  "Wishing you health, warmth, and the chance to keep learning.",
  "Your smile is precious—please stay safe.",
  "You worked hard today. Give yourself a hug.",
  "You will meet kindness, and you will have many possibilities."
];

function getEl(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = getEl("toast");
  const toastText = getEl("toastText");

  toastText.textContent = message;

  if (state.toastTimerId) {
    window.clearTimeout(state.toastTimerId);
  }

  toast.classList.add("toast--show");
  state.toastTimerId = window.setTimeout(() => {
    toast.classList.remove("toast--show");
    state.toastTimerId = 0;
  }, 2200);
}

function setStepActive(stepIndex) {
  const step1 = getEl("step1");
  const step2 = getEl("step2");
  const step3 = getEl("step3");

  step1.classList.remove("step--active");
  step2.classList.remove("step--active");
  step3.classList.remove("step--active");

  if (stepIndex === 1) step1.classList.add("step--active");
  if (stepIndex === 2) step2.classList.add("step--active");
  if (stepIndex === 3) step3.classList.add("step--active");
}

function unlockPicker() {
  const gateLocked = getEl("gateLocked");
  const picker = getEl("picker");
  gateLocked.hidden = true;
  picker.hidden = false;
  setStepActive(2);
}

function lockPicker() {
  const gateLocked = getEl("gateLocked");
  const picker = getEl("picker");
  gateLocked.hidden = false;
  picker.hidden = true;
  setStepActive(1);
}

function renderMessages() {
  const grid = getEl("messageGrid");
  grid.innerHTML = "";

  encouragementMessages.forEach((text, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "msgBtn";
    btn.setAttribute("data-index", String(index));
    btn.textContent = text;

    btn.addEventListener("click", (event) => {
      const targetBtn = event.currentTarget;
      selectMessage(targetBtn);
    });

    grid.appendChild(btn);
  });
}

function clearSelectedUi() {
  const grid = getEl("messageGrid");
  const buttons = Array.from(grid.querySelectorAll("button.msgBtn"));
  buttons.forEach((btn) => btn.classList.remove("msgBtn--selected"));

  const selectedBox = getEl("selectedBox");
  const selectedText = getEl("selectedText");
  selectedText.textContent = "";
  selectedBox.hidden = true;

  const confirmBtn = getEl("btnConfirmMessage");
  confirmBtn.disabled = true;

  state.selectedMessage = "";
}

function selectMessage(buttonEl) {
  const grid = getEl("messageGrid");
  const buttons = Array.from(grid.querySelectorAll("button.msgBtn"));
  buttons.forEach((btn) => btn.classList.remove("msgBtn--selected"));

  buttonEl.classList.add("msgBtn--selected");
  const messageText = buttonEl.textContent || "";

  state.selectedMessage = messageText;

  const selectedBox = getEl("selectedBox");
  const selectedText = getEl("selectedText");
  selectedText.textContent = messageText;
  selectedBox.hidden = false;

  const confirmBtn = getEl("btnConfirmMessage");
  confirmBtn.disabled = messageText.length === 0;
}

function randomPick() {
  const idx = Math.floor(Math.random() * encouragementMessages.length);
  const grid = getEl("messageGrid");
  const button = grid.querySelector(`button.msgBtn[data-index="${idx}"]`);
  if (button) selectMessage(button);
}

function goToDonateAndToast() {
  // Jump back to the donation section and show a toast under the donation area
  window.location.hash = "#donate";
  setStepActive(3);

  const msg = state.selectedMessage
    ? `You sent: "${state.selectedMessage}"`
    : "Action completed.";

  showToast(msg);

  // After a moment, return the step indicator to the selectable state
  window.setTimeout(() => {
    if (state.hasDonated) setStepActive(2);
  }, 2600);
}

function init() {
  const btnScrollEncourage = getEl("btnScrollEncourage");
  const btnDonated = getEl("btnDonated");
  const btnCopyInfo = getEl("btnCopyInfo");
  const btnConfirmMessage = getEl("btnConfirmMessage");
  const btnRandomMessage = getEl("btnRandomMessage");
  const btnReset = getEl("btnReset");
  const donationLink = getEl("donationLink");

  renderMessages();
  lockPicker();

  btnScrollEncourage.addEventListener("click", () => {
    window.location.hash = "#message";
  });

  btnDonated.addEventListener("click", () => {
    state.hasDonated = true;
    unlockPicker();
    showToast("Confirmed: you have donated (simulation). Now you can choose a message.");
    window.location.hash = "#message";
  });

  btnCopyInfo.addEventListener("click", async () => {
    const linkText = donationLink.textContent || "";
    try {
      await navigator.clipboard.writeText(linkText.trim());
      showToast("Donation link copied.");
    } catch (err) {
      showToast("Copy failed: your browser may block clipboard access.");
    }
  });

  btnRandomMessage.addEventListener("click", () => {
    if (!state.hasDonated) {
      showToast("Please confirm your donation first, then choose a message.");
      return;
    }
    randomPick();
  });

  btnConfirmMessage.addEventListener("click", () => {
    if (!state.hasDonated) {
      showToast("Please confirm your donation first.");
      return;
    }
    if (!state.selectedMessage) {
      showToast("Please select a message first.");
      return;
    }
    goToDonateAndToast();
  });

  btnReset.addEventListener("click", () => {
    state.hasDonated = false;
    clearSelectedUi();
    lockPicker();
    showToast("Reset complete. Please confirm donation again.");
    window.location.hash = "#donate";
  });
}

document.addEventListener("DOMContentLoaded", init);

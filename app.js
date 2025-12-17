// 避免使用关键字 "this"：全部使用 event.currentTarget 或显式变量

const state = {
  hasDonated: false,
  selectedMessage: "",
  toastTimerId: 0
};

const encouragementMessages = [
  "你已经很努力了，别怕，明天会更好。",
  "你值得被爱，也值得拥有安全和快乐。",
  "请相信自己，你的未来一定会发光。",
  "每一步都算数，你正在变得更强大。",
  "当你感到害怕时，世界上有人在为你加油。",
  "你并不孤单，我们都在支持你。",
  "愿你拥有健康、温暖和继续学习的机会。",
  "你的笑容很珍贵，请一定要保护好自己。",
  "今天辛苦了，给自己一个拥抱。",
  "你会遇到很多善意，也会拥有很多可能。"
];

function getEl(id){
  const el = document.getElementById(id);
  return el;
}

function showToast(message){
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

function setStepActive(stepIndex){
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

function unlockPicker(){
  const gateLocked = getEl("gateLocked");
  const picker = getEl("picker");
  gateLocked.hidden = true;
  picker.hidden = false;
  setStepActive(2);
}

function lockPicker(){
  const gateLocked = getEl("gateLocked");
  const picker = getEl("picker");
  gateLocked.hidden = false;
  picker.hidden = true;
  setStepActive(1);
}

function renderMessages(){
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

function clearSelectedUi(){
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

function selectMessage(buttonEl){
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

function randomPick(){
  const idx = Math.floor(Math.random() * encouragementMessages.length);
  const grid = getEl("messageGrid");
  const button = grid.querySelector(`button.msgBtn[data-index="${idx}"]`);
  if (button) selectMessage(button);
}

function goToDonateAndToast(){
  // 回到“捐赠区”，并在“支付信息下方”弹出提示
  window.location.hash = "#donate";
  setStepActive(3);

  const msg = state.selectedMessage
    ? `你发送了鼓励：${state.selectedMessage}`
    : "已完成操作";

  showToast(msg);

  // 让步骤条过一会儿回到可继续选择状态
  window.setTimeout(() => {
    if (state.hasDonated) setStepActive(2);
  }, 2600);
}

function init(){
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
    showToast("已确认：你已完成捐赠（模拟）。现在可以选择一句鼓励语。");
    window.location.hash = "#message";
  });

  btnCopyInfo.addEventListener("click", async () => {
    const linkText = donationLink.textContent || "";
    try{
      await navigator.clipboard.writeText(linkText.trim());
      showToast("已复制捐赠链接（示例）");
    }catch(err){
      showToast("复制失败：你的浏览器可能不允许剪贴板操作");
    }
  });

  btnRandomMessage.addEventListener("click", () => {
    if (!state.hasDonated) {
      showToast("请先完成捐赠确认，再选择鼓励语。");
      return;
    }
    randomPick();
  });

  btnConfirmMessage.addEventListener("click", () => {
    if (!state.hasDonated) {
      showToast("请先完成捐赠确认。");
      return;
    }
    if (!state.selectedMessage) {
      showToast("请先选择一句鼓励语。");
      return;
    }
    goToDonateAndToast();
  });

  btnReset.addEventListener("click", () => {
    state.hasDonated = false;
    clearSelectedUi();
    lockPicker();
    showToast("已重置流程：请重新确认捐赠。");
    window.location.hash = "#donate";
  });
}

document.addEventListener("DOMContentLoaded", init);

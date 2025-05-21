

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");

  const tips = [
    "Use meaningful variable names.",
    "Break your code into functions.",
    "Use version control like Git.",
    "Debug with console.log or breakpoints.",
    "Write comments for tricky logic.",
    "Test your code with different inputs."
  ];

  const tipElement = document.getElementById("dailyTip");
  if (tipElement) {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.textContent = tip;
  }
});
import { setupThemeToggle } from "./toggleTheme";

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");
});


import { setupThemeToggle } from "./toggleTheme";
import { send } from "../utilities";

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
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const searchButton = document.getElementById("searchButton") as HTMLButtonElement;

searchButton.onclick = async function () {
  const searchQuery = searchInput.value.trim();

  if (!searchQuery) {
    alert("Please enter a username to search.");
    return;
  }

  const results = await send("searchUsers", searchQuery) as { Id: string, Username: string }[];
  console.log(results);

  if (results.length === 0) {
    alert("No user found.");
    return;
  }

  const firstUser = results[0];
  window.location.href = `profile.html?userId=${firstUser.Id}`;
};

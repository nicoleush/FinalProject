
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
const searchUl = document.getElementById("searchUl") as HTMLUListElement;


async function performSearch(query: string) {
  searchUl.innerHTML = ""; 
  if (!query) return; 


  const results = await send("searchUsers", query) as { Id: string; Username: string }[];

 
  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users found.";
    li.style.padding = "8px";
    searchUl.appendChild(li);
    return;
  }

  
  results.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.Username;
    li.style.cursor = "pointer";
    li.style.padding = "8px";
    li.style.borderBottom = "1px solid #ccc";

    
    li.addEventListener("click", () => {
      window.location.href = `profile.html?userId=${user.Id}`;
    });

    searchUl.appendChild(li);
  });
}


searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  await performSearch(query);
});


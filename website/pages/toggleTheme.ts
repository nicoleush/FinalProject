import { send } from "../utilities"; 


export function setupThemeToggle(buttonId: string): void {

  const toggleBtn = document.getElementById(buttonId);


  const currentTheme = localStorage.getItem("theme");


  if (currentTheme === "dark") {
    document.body.classList.add("dark");
  }


  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");


    const isDark = document.body.classList.contains("dark");

  
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

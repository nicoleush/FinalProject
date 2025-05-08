import { send } from "../utilities";



function applyTheme(theme: string): void {
  const themeStyle = document.getElementById('theme-style') as HTMLLinkElement | null;
  if (themeStyle) {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    themeStyle.href = theme === 'dark' ? 'styles/dark-mode.css' : 'styles/light-mode.css';
  }
}

function toggleTheme(): void {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}


interface User {
  username: string;
  bio: string;
  avatarUrl?: string;
  theme?: string;
}

const userId: string | null = localStorage.getItem("userId");

if (!userId) {
  window.location.href = "login.html";
} else {
  let user = await send(`profile`, userId) as User;

  // if (!user) throw new Error("Server returned an error");

  const usernameElem = document.getElementById("username") as HTMLSpanElement;
  const bioElem = document.getElementById("bio") as HTMLSpanElement;
  const avatarElem = document.getElementById("avatar") as HTMLImageElement;

  usernameElem.textContent = user.username;
  bioElem.textContent = user.bio;
  avatarElem.src = user.avatarUrl || "../assets/imgs/default.jpg";

  const userTheme = user.theme || localStorage.getItem('theme') || 'light';
  localStorage.setItem('theme', userTheme);
  applyTheme(userTheme);
}
// Make sure this is at the bottom of profile.ts
(window as any).toggleTheme = toggleTheme;

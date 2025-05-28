import { send } from "../utilities";

const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
const usernameInput = document.getElementById("username") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const messageDiv = document.getElementById("message") as HTMLDivElement;

loginBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    messageDiv.textContent = "Please fill in both fields.";
    return;
  }

  const result = await send("login", [username, password]);

  if (typeof result === "object" && result.userId) {
    localStorage.setItem("userId", result.userId);
    localStorage.setItem("theme", result.theme || "light");
    location.href = "homepage.html";
  } else {
    messageDiv.textContent = "Invalid username or password.";
  }
};

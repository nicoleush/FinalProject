import { send } from "../utilities";

function applyTheme(theme: string): void {
  document.body.classList.toggle("dark", theme === "dark");
}

function toggleTheme(): void {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
}

interface User {
  username: string;
  bio: string;
  avatarUrl?: string;
  theme?: string;
}

const userId = localStorage.getItem("userId");

if (!userId) {
  window.location.href = "login.html";
}

async function loadProfile() {
  const user = await send("profile", userId!) as User;

  document.getElementById("username")!.textContent = user.username;
  document.getElementById("bio")!.textContent = user.bio;
  const bioInput = document.getElementById("bioInput") as HTMLTextAreaElement;
const saveBioBtn = document.getElementById("saveBioBtn") as HTMLButtonElement;

if (bioInput && saveBioBtn) {
  bioInput.value = user.bio;
  saveBioBtn.onclick = async () => {
    const newBio = bioInput.value.trim();
    if (newBio) {
      await send("updatebio", [userId, newBio]);
      document.getElementById("bio")!.textContent = newBio;
      alert("Bio updated!");
    } else {
      alert("Bio cannot be empty.");
    }
  };
}

  (document.getElementById("avatar") as HTMLImageElement).src =
    user.avatarUrl || "../../assets/imgs/default.jpg";
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
    
  loadUserPosts();
}

async function loadUserPosts() {
  const posts = await send("getuserposts", userId!);
  const container = document.getElementById("myPosts")!;
  container.innerHTML = "";

  for (const post of posts) {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.style.border = "1px solid #ddd";
    postDiv.style.borderRadius = "12px";
    postDiv.style.margin = "20px auto";
    postDiv.style.padding = "20px";
    postDiv.style.maxWidth = "600px";
    postDiv.style.backgroundColor = "#f9f9f9";
    postDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
    
    
    const title = document.createElement("h3");
    title.textContent = post.Title; // ← backend sends "Title" not "title"
    title.style.textAlign = "center";
title.style.marginBottom = "10px";
title.style.fontSize = "1.5em";
title.style.color = "#333";



    const content = document.createElement("p");
    content.textContent = post.Content; // ← same here
    content.style.textAlign = "left";
content.style.lineHeight = "1.6";
content.style.fontSize = "1em";
content.style.color = "#444";

const likeCount = document.createElement("p");
likeCount.style.fontSize = "0.9em";
likeCount.style.color = "#666";
likeCount.style.marginTop = "10px";
likeCount.textContent = "❤️ loading likes...";

// Fetch the real number of likes
send("getLikes", post.Id).then((count) => {
  likeCount.textContent = `❤️ ${count} Likes`;
}).catch(() => {
  likeCount.textContent = "❤️ Likes not available";
});

postDiv.appendChild(likeCount);

    postDiv.appendChild(title);
    postDiv.appendChild(content);
    container.appendChild(postDiv);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const toggleBtn = document.getElementById("themeToggle");
  toggleBtn?.addEventListener("click", toggleTheme);

  const signOutBtn = document.getElementById("signOutBtn");
  signOutBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  });
});
import { setupThemeToggle } from "./toggleTheme";

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");
});

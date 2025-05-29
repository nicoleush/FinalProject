import { setupThemeToggle } from "./toggleTheme";
import { send } from "../utilities";

interface User {
  username: string;
  bio: string;
  avatarUrl?: string;
  theme?: string;
}

const urlParams = new URLSearchParams(window.location.search);
const userIdFromUrl = urlParams.get("userId");
const loggedInUserId = localStorage.getItem("userId");
const userId = userIdFromUrl || loggedInUserId;

if (!userId) {
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");
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

async function loadProfile() {
  const user = await send("profile", userId!) as User;

  document.getElementById("username")!.textContent = user.username;
  document.getElementById("bio")!.textContent = user.bio;

  const bioInput = document.getElementById("bioInput") as HTMLTextAreaElement;
  const saveBioBtn = document.getElementById("saveBioBtn") as HTMLButtonElement;

  if (userId === loggedInUserId && bioInput && saveBioBtn) {
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
  } else {
    bioInput.style.display = "none";
    saveBioBtn.style.display = "none";
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
    title.textContent = post.Title;
    title.style.textAlign = "center";
    title.style.marginBottom = "10px";
    title.style.fontSize = "1.5em";
    title.style.color = "#333";

    const content = document.createElement("p");
    content.textContent = post.Content;
    content.style.textAlign = "left";
    content.style.lineHeight = "1.6";
    content.style.fontSize = "1em";
    content.style.color = "#444";

    const likeCount = document.createElement("p");
    likeCount.style.fontSize = "0.9em";
    likeCount.style.color = "#666";
    likeCount.style.marginTop = "10px";
    likeCount.textContent = "❤️ loading likes...";

    send("getLikes", post.Id).then((count) => {
      likeCount.textContent = `❤️ ${count} Likes`;
    }).catch(() => {
      likeCount.textContent = "❤️ Likes not available";
    });

    postDiv.appendChild(title);
    postDiv.appendChild(content);
    postDiv.appendChild(likeCount);
    container.appendChild(postDiv);
  }
}

// Dummy theme toggle function placeholder if missing
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Dummy applyTheme if missing
function applyTheme(theme: string) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

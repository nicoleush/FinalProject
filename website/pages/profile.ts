import { setupThemeToggle } from "./toggleTheme"; // מייבא פונקציה שמטפלת בכפתור של מצב אור/כהה
import { send } from "../utilities"; // מייבא פונקציה לשליחת בקשות לשרת

// ממשק שמתאר מבנה של משתמש מהשרת
interface User {
  username: string;
  bio: string;
  avatarUrl?: string;
  theme?: string;
}

// חילוץ מזהה המשתמש מה-URL או מהאחסון המקומי
const urlParams = new URLSearchParams(window.location.search);
const userIdFromUrl = urlParams.get("userId");
const loggedInUserId = localStorage.getItem("userId");
const userId = userIdFromUrl || loggedInUserId;

// אם אין משתמש מחובר, מעבירים לדף התחברות
if (!userId) {
  window.location.href = "login.html";
}

// כשהדף נטען, מפעילים את כפתור הטוגל, טוענים פרופיל, מאזינים לכפתור התנתקות
window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle"); // מפעיל את כפתור מצב אור/כהה
  loadProfile(); // טוען את פרטי המשתמש

  const toggleBtn = document.getElementById("themeToggle");
  toggleBtn?.addEventListener("click", toggleTheme); // החלפת ערכת נושא בלחיצה

  const signOutBtn = document.getElementById("signOutBtn");
  signOutBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.clear(); // מוחק את נתוני המשתמש מהדפדפן
      window.location.href = "index.html";
    }
  });
});

// פונקציה שמביאה את פרטי המשתמש מהשרת ומציגה אותם בעמוד
async function loadProfile() {
  const user = await send("profile", userId!) as User;

  document.getElementById("username")!.textContent = user.username;
  document.getElementById("bio")!.textContent = user.bio;

  const bioInput = document.getElementById("bioInput") as HTMLTextAreaElement;
  const saveBioBtn = document.getElementById("saveBioBtn") as HTMLButtonElement;

  // אם המשתמש שצופה הוא הבעלים של הפרופיל – מאפשר עריכת ביוגרפיה
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
    // אם זה פרופיל של מישהו אחר – מסתיר את אפשרות העריכה
    bioInput.style.display = "none";
    saveBioBtn.style.display = "none";
  }

  // תמונת פרופיל – אם אין, תופיע ברירת מחדל
  (document.getElementById("avatar") as HTMLImageElement).src =
    user.avatarUrl || "../../assets/imgs/default.jpg";

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme); // מפעיל ערכת נושא בהתאם למה שנשמר

  loadUserPosts(); // טוען את הפוסטים של המשתמש
}

// מביא מהשרת את כל הפוסטים של המשתמש ומציג אותם בעמוד
async function loadUserPosts() {
  const posts = await send("getuserposts", userId!);
  const container = document.getElementById("myPosts")!;
  container.innerHTML = ""; // מנקה את התוכן לפני הצגה חדשה

  for (const post of posts) {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    // עיצוב כללי לפוסט
    postDiv.style.border = "1px solid #ddd";
    postDiv.style.borderRadius = "12px";
    postDiv.style.margin = "20px auto";
    postDiv.style.padding = "20px";
    postDiv.style.maxWidth = "600px";
    postDiv.style.backgroundColor = "#f9f9f9";
    postDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";

    // כותרת הפוסט
    const title = document.createElement("h3");
    title.textContent = post.Title;
    title.style.textAlign = "center";
    title.style.marginBottom = "10px";
    title.style.fontSize = "1.5em";
    title.style.color = "#333";

    // תוכן הפוסט
    const content = document.createElement("p");
    content.textContent = post.Content;
    content.style.textAlign = "left";
    content.style.lineHeight = "1.6";
    content.style.fontSize = "1em";
    content.style.color = "#444";

    // תצוגת מספר לייקים – נטען בנפרד
    const likeCount = document.createElement("p");
    likeCount.style.fontSize = "0.9em";
    likeCount.style.color = "#666";
    likeCount.style.marginTop = "10px";
    likeCount.textContent = "❤️ loading likes...";

    // מבקש את מספר הלייקים מהשרת
    send("getLikes", post.Id).then((count) => {
      likeCount.textContent = `❤️ ${count} Likes`;
    }).catch(() => {
      likeCount.textContent = "❤️ Likes not available";
    });

    // מוסיף את כל האלמנטים לפוסט אחד
    postDiv.appendChild(title);
    postDiv.appendChild(content);
    postDiv.appendChild(likeCount);
    container.appendChild(postDiv);
  }
}

// פונקציה שמחליפה בין אור לכהה (אם אין toggleTheme בקובץ אחר)
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// פונקציה שמחילה ערכת נושא לפי מחרוזת שנשמרה
function applyTheme(theme: string) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

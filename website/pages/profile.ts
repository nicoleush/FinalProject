import { setupThemeToggle } from "./toggleTheme"; // מייבא פונקציה שמטפלת בכפתור של מצב אור/כהה
import { send } from "../utilities"; // מייבא פונקציה כללית לשליחת בקשות לשרת

// ממשק שמתאר את מבנה המשתמש שמתקבל מהשרת
interface User {
  username: string;
  bio: string;
  avatarUrl?: string; // שדה אופציונלי - ייתכן שאין תמונה
  theme?: string; // שדה אופציונלי - ייתכן שאין ערכת נושא מוגדרת
}

// חילוץ מזהה המשתמש מה-URL או מהאחסון המקומי (localStorage)
const urlParams = new URLSearchParams(window.location.search);
const userIdFromUrl = urlParams.get("userId"); // אם המשתמש נכנס דרך קישור עם מזהה
const loggedInUserId = localStorage.getItem("userId"); // אם המשתמש התחבר במכשיר
const userId = userIdFromUrl || loggedInUserId; // לוקחים את מה שקיים

// אם אין בכלל מזהה - מעבירים לדף ההתחברות
if (!userId) {
  window.location.href = "login.html";
}

// כשהדף נטען – מבצעים מספר פעולות ראשוניות
window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle"); // מפעיל את כפתור מצב האור/כהה
  loadProfile(); // טוען את פרטי המשתמש מהשרת

  const toggleBtn = document.getElementById("themeToggle");
  toggleBtn?.addEventListener("click", toggleTheme); // מקשיב ללחיצה להחלפת מצב תצוגה

  const signOutBtn = document.getElementById("signOutBtn");
  signOutBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.clear(); // מוחק את כל הנתונים המקומיים של המשתמש
      window.location.href = "index.html"; // מחזיר לדף הראשי
    }
  });
});

// פונקציה שמביאה את פרטי המשתמש מהשרת ומציגה אותם
async function loadProfile() {
  const user = await send("profile", userId!) as User;

  // מציגים שם משתמש וביוגרפיה
  document.getElementById("username")!.textContent = user.username;
  document.getElementById("bio")!.textContent = user.bio;

  const bioInput = document.getElementById("bioInput") as HTMLTextAreaElement;
  const saveBioBtn = document.getElementById("saveBioBtn") as HTMLButtonElement;

  // אם המשתמש שצופה בפרופיל הוא הבעלים – מאפשרים עריכה
  if (userId === loggedInUserId && bioInput && saveBioBtn) {
    bioInput.value = user.bio;

    saveBioBtn.onclick = async () => {
      const newBio = bioInput.value.trim();
      if (newBio) {
        await send("updatebio", [userId, newBio]); // שולח בקשה לעדכון הביוגרפיה
        document.getElementById("bio")!.textContent = newBio;
        alert("Bio updated!");
      } else {
        alert("Bio cannot be empty.");
      }
    };
  } else {
    // אם המשתמש צופה בפרופיל של מישהו אחר – מסתירים שדות עריכה
    bioInput.style.display = "none";
    saveBioBtn.style.display = "none";
  }

  // מציג תמונת פרופיל, ואם אין - תצוגת ברירת מחדל
  (document.getElementById("avatar") as HTMLImageElement).src =
    user.avatarUrl || "../../assets/imgs/default.jpg";

  // טוען את ערכת הנושא מהזיכרון המקומי
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme); // מפעיל את הערכה (לבן או כהה)

  // מביא את הפוסטים של המשתמש
  loadUserPosts();
}

// פונקציה שמביאה את כל הפוסטים של המשתמש הזה
async function loadUserPosts() {
  const posts = await send("getuserposts", userId!);
  const container = document.getElementById("myPosts")!;
  container.innerHTML = ""; // מנקה את התוכן הקודם

  for (const post of posts) {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    // עיצוב בסיסי לפוסט
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

    // שדה שמראה את מספר הלייקים
    const likeCount = document.createElement("p");
    likeCount.style.fontSize = "0.9em";
    likeCount.style.color = "#666";
    likeCount.style.marginTop = "10px";
    likeCount.textContent = "❤️ loading likes...";

    // שולח בקשה לשרת לקבלת מספר הלייקים לפוסט
    send("getLikes", post.Id).then((count) => {
      likeCount.textContent = `❤️ ${count} Likes`;
    }).catch(() => {
      likeCount.textContent = "❤️ Likes not available";
    });

    // מוסיף את החלקים לפוסט הסופי
    postDiv.appendChild(title);
    postDiv.appendChild(content);
    postDiv.appendChild(likeCount);
    container.appendChild(postDiv);
  }
}

// פונקציה שמחליפה בין מצב אור למצב כהה
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// פונקציה שמחילה ערכת נושא לפי מה שנשמר בזיכרון
function applyTheme(theme: string) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

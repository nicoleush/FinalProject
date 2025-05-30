// מייבא פונקציה שמחליפה מצב תאורה (לילה/יום)
import { setupThemeToggle } from "./toggleTheme";
// מייבא פונקציה ששולחת בקשות לשרת
import { send } from "../utilities";

// ברגע שהעמוד נטען:
window.addEventListener("DOMContentLoaded", () => {
  // מפעיל את כפתור החלפת התאורה
  setupThemeToggle("themeToggle");

  // רשימה של טיפים אקראיים
  const tips = [
    "Use meaningful variable names.", // שמות משתנים מובנים
    "Break your code into functions.", // לחלק לקוד לפונקציות
    "Use version control like Git.", // להשתמש ב-Git
    "Debug with console.log or breakpoints.", // לבדוק עם console.log או נקודות עצירה
    "Write comments for tricky logic.", // לכתוב הערות
    "Test your code with different inputs." // לבדוק קלטים שונים
  ];

  // מראה טיפ אקראי בכל פעם מחדש
  const tipElement = document.getElementById("dailyTip");
  if (tipElement) {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.textContent = tip;
  }
});

// לוקח אלמנטים מה-HTML לפי ה-id שלהם
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const searchButton = document.getElementById("searchButton") as HTMLButtonElement;
const searchUl = document.getElementById("searchUl") as HTMLUListElement;

// פונקציה שמחפשת משתמשים ומציגה תוצאות
async function performSearch(query: string) {
  searchUl.innerHTML = ""; // מוחק תוצאות קודמות
  if (!query) return; // אם השדה ריק לא לעשות כלום

  // שולח את החיפוש לשרת
  const results = await send("searchUsers", query) as { Id: string; Username: string }[];

  // אם אין תוצאות – כותב הודעה
  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users found.";
    li.style.padding = "8px";
    searchUl.appendChild(li);
    return;
  }

  // עובר על כל תוצאה ויוצר שורה ברשימה
  results.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.Username;
    li.style.cursor = "pointer";
    li.style.padding = "8px";
    li.style.borderBottom = "1px solid #ccc";

    // בלחיצה – עוברים לעמוד הפרופיל של המשתמש
    li.addEventListener("click", () => {
      window.location.href = `profile.html?userId=${user.Id}`;
    });

    searchUl.appendChild(li);
  });
}

// מבצע חיפוש בזמן ההקלדה
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  await performSearch(query);
});

// בלחיצה על כפתור החיפוש
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const results = await send("searchUsers", query) as { Id: string; Username: string }[];
  searchUl.innerHTML = ""; // מוחק את התוצאות הקודמות

  // אם אין תוצאות – כותב הודעה
  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users found.";
    li.style.padding = "8px";
    searchUl.appendChild(li);
    return;
  }

  // אם יש רק תוצאה אחת – מיד עובר לפרופיל
  if (results.length === 1) {
    window.location.href = `profile.html?userId=${results[0].Id}`;
    return;
  }

  // אם יש כמה תוצאות – מציג אותן לבחירה
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
});

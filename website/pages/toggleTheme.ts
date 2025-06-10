import { send } from "../utilities"; // (לא חובה כאן כרגע, אלא אם תשתמשי בזה בעתיד)

// פונקציה שמפעילה את כפתור שינוי ערכת הנושא (אור/כהה)
export function setupThemeToggle(buttonId: string): void {
  // מחפש את כפתור הטוגל לפי מזהה (id)
  const toggleBtn = document.getElementById(buttonId);

  // בודק אם שמורה ערכת נושא קודמת בזיכרון (localStorage)
  const currentTheme = localStorage.getItem("theme");

  // אם המשתמש שמר מצב כהה – מוסיף class כדי להפעיל את העיצוב הכהה
  if (currentTheme === "dark") {
    document.body.classList.add("dark");
  }

  // כשמשתמש לוחץ על הכפתור – מחליף בין מצב כהה למצב רגיל
  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark"); // מוסיף/מסיר class בשם dark

    // האם עכשיו הדף במצב כהה?
    const isDark = document.body.classList.contains("dark");

    // שמירת הבחירה בזיכרון כך שזה יישאר גם בטעינה הבאה
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

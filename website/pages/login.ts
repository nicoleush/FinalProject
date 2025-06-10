import { send } from "../utilities"; 
// מייבא את הפונקציה send מקובץ utilities.
// היא אחראית לשלוח מידע לשרת (בדרך כלל POST) ולקבל תגובה חזרה.

// בוחר את האלמנטים מה-HTML לפי ה-id שלהם ומגדיר את הסוג המתאים
const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;        // כפתור התחברות
const usernameInput = document.getElementById("username") as HTMLInputElement;    // שדה שם משתמש
const passwordInput = document.getElementById("password") as HTMLInputElement;    // שדה סיסמה
const messageDiv = document.getElementById("message") as HTMLDivElement;          // אזור להצגת הודעות

// בעת לחיצה על כפתור ההתחברות
loginBtn.onclick = async () => {
  // לוקח את הערכים מהשדות ומסיר רווחים מיותרים בעזרת trim
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // בודק אם אחד השדות ריק – אם כן, מציג הודעה ומפסיק את הפעולה
  if (!username || !password) {
    messageDiv.textContent = "Please fill in both fields.";
    return;
  }

  // שולח את שם המשתמש והסיסמה לשרת בנתיב login ומחכה לתשובה
  const result = await send("login", [username, password]);

  // אם קיבלנו אובייקט עם userId – סימן שההתחברות הצליחה
  if (typeof result === "object" && result.userId) {
    // שומר את מזהה המשתמש בזיכרון המקומי (localStorage) כדי לזהות אותו בדפים אחרים
    localStorage.setItem("userId", result.userId);

    // שומר את העיצוב המועדף של המשתמש, אם הוחזר מהשרת. אם לא – ישתמש ב-light כברירת מחדל
    localStorage.setItem("theme", result.theme || "light");

    // מעביר את המשתמש לעמוד הבית
    location.href = "homepage.html";
  } else {
    // אם התשובה לא תקינה או השם/סיסמה לא נכונים – מציג הודעת שגיאה
    messageDiv.textContent = "Invalid username or password.";
  }
};

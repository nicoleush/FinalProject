import { send } from "../utilities"; 
// מייבא פונקציה בשם send מקובץ utilities. היא שולחת מידע לשרת (POST) ומחזירה תשובה.

// בחירת אלמנטים מה-HTML והגדרת הסוג שלהם (TypeScript עוזר לזהות שגיאות ולתת השלמה אוטומטית)
let username = document.querySelector("#username") as HTMLInputElement;
let password = document.querySelector("#password") as HTMLInputElement;
let signupbutton = document.querySelector("#signUp") as HTMLButtonElement;
let message = document.querySelector("#message") as HTMLDivElement;
let avatars = document.querySelectorAll(".avatar") as NodeListOf<HTMLImageElement>;
// avatars מכיל את כל התמונות שאפשר לבחור כ"אוואטר"

function selectAvatar(event: Event) {
  let target = event.currentTarget as HTMLImageElement;
  // זיהוי איזו תמונה נלחצה – הופכת אותה ל"נבחרת"

  avatars.forEach(a => a.classList.remove("selected"));
  // מסיר את הסימון מכולן

  target.classList.add("selected");
  // מסמן את התמונה הנבחרת עם class בשם selected

  const hiddenInput = document.querySelector("#selectedAvatar") as HTMLInputElement;
  hiddenInput.value = target.src;
  // מכניס לתוך input נסתר את כתובת התמונה – כדי שנוכל לשלוח אותה לשרת
}

avatars.forEach((avatar) => {
  avatar.addEventListener("click", selectAvatar);
});
// מוסיף לכל תמונה אפשרות ללחיצה, וכל לחיצה מפעילה את הפונקציה שמסמנת את התמונה

signupbutton.onclick = async function (event) {
  event.preventDefault();
  // מונע מהדפדפן לבצע שליחה רגילה של טופס – אנחנו שולחים לבד עם JS

  const selectedAvatar = (document.querySelector("#selectedAvatar") as HTMLInputElement).value;
  // לוקח את כתובת התמונה שנבחרה מתוך input נסתר

  let userId = await send("signup", [
    username.value,       // שם המשתמש שהוזן
    password.value,       // הסיסמה
    "light",              // ברירת מחדל לנושא האתר – מצב "לייט"
    "",                   // שדה ריק – אולי תשמש בעתיד לשם מלא או אימייל
    selectedAvatar || ""  // כתובת האוואטר שנבחר, ואם לא נבחר – שדה ריק
  ]) as string | null;
  // שולח את המידע לשרת ומחכה לתשובה – יכול להיות מזהה משתמש, או שגיאה

  if (userId && userId !== "Username already exists") {
    localStorage.setItem("userId", userId);
    // אם הצליח – שומר את מזהה המשתמש בזיכרון הדפדפן, כדי לדעת שהוא מחובר

    location.href = "homepage.html";
    // שולח את המשתמש לעמוד הבית
  } else {
    message.innerText = "Username is already taken";
    // אם השם תפוס – מציג הודעת שגיאה למשתמש
  }
};

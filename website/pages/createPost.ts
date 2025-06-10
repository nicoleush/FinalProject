import { send } from "../utilities"; // מייבא את הפונקציה send ששולחת נתונים לשרת
import { setupThemeToggle } from "./toggleTheme"; // מייבא את פונקציית החלפת מצב כהה/בהיר

window.addEventListener("DOMContentLoaded", () => { // ברגע שהדף נטען
  setupThemeToggle("themeToggle"); // מפעיל את כפתור ההחלפה בין מצב כהה ובהיר

  let submitButton = document.querySelector("#submitPost") as HTMLButtonElement; // לוקח את כפתור השליחה
  const userId: string | null = localStorage.getItem("userId"); // לוקח את מזהה המשתמש מה-localStorage

  submitButton.onclick = async function () { // כשמשתמש לוחץ על "Submit Post"
    const titleInput = document.getElementById("postTitle") as HTMLInputElement; // שדה כותרת
    const contentInput = document.getElementById("postContent") as HTMLTextAreaElement; // שדה תוכן

    const title = titleInput.value.trim(); // מסיר רווחים מיותרים מהכותרת
    const content = contentInput.value.trim(); // מסיר רווחים מיותרים מהתוכן

    if (!title || !content) { // אם אחד מהשדות ריק
      alert("Please fill in both title and content!"); // מציג הודעת שגיאה
      return; // מפסיק את ההפעלה
    }

    await send("createPost", [userId, title, content]); // שולח את הפוסט לשרת
    titleInput.value = ""; // מנקה את שדה הכותרת
    contentInput.value = ""; // מנקה את שדה התוכן
    loadPosts(); // טוען מחדש את הפוסטים
  };

  loadPosts(); // טוען את הפוסטים בהתחלה
});

async function loadPosts(): Promise<void> {
  const posts = await send("getPosts", {}); // שולח בקשה לשרת כדי לקבל את כל הפוסטים
  const feed = document.getElementById("feed") as HTMLElement; // לוקח את האלמנט שמחזיק את הפוסטים
  feed.innerHTML = ""; // מנקה את מה שהיה בפיד קודם

  for (const post of posts) { // עובר על כל פוסט
    const postDiv = document.createElement("div"); // יוצר div חדש לפוסט
    postDiv.className = "post"; // נותן לו עיצוב של פוסט

    const title = document.createElement("h3"); // יוצר תגית כותרת
    title.textContent = post.title; // מציב את כותרת הפוסט

    const content = document.createElement("p"); // יוצר תגית פסקה
    content.textContent = post.content; // מציב את תוכן הפוסט

    const author = document.createElement("small"); // יוצר טקסט קטן לשם המשתמש
    author.textContent = `Posted by: ${post.username}`; // שם המשתמש

    const timestamp = document.createElement("small"); // טקסט קטן לתאריך
    timestamp.textContent = new Date(post.createdAt).toLocaleDateString();
                                                                        // תאריך ושעה בפורמט קריא

    const likeBtn = document.createElement("button"); // כפתור לייק
    likeBtn.textContent = "Like ❤️"; // טקסט הכפתור

    const likeCountElem = document.createElement("span"); // אלמנט שמציג את מספר הלייקים
    likeCountElem.style.marginLeft = "10px"; // רווח בין הכפתור למספר

    likeBtn.onclick = async () => { // כשמשתמש לוחץ לייק
      await send("likePost", [post.id, localStorage.getItem("userId")]); // שולח בקשה לשרת להוסיף לייק
      updateLikeCount(post.id, likeCountElem); // מעדכן את מספר הלייקים
    };

    await updateLikeCount(post.id, likeCountElem); // טוען את מספר הלייקים הנוכחי

    const commentBox = document.createElement("div"); // תיבת תגובות
    commentBox.style.marginTop = "15px"; // רווח מלמעלה

    const commentInput = document.createElement("input"); // שדה להזנת תגובה
    commentInput.placeholder = "Write a comment..."; // טקסט ברירת מחדל
    commentInput.style.width = "70%"; // רוחב מותאם

    const commentBtn = document.createElement("button"); // כפתור תגובה
    commentBtn.textContent = "Comment"; // טקסט הכפתור

    const commentsContainer = document.createElement("div"); // אזור להצגת תגובות
    commentsContainer.style.marginTop = "10px"; // רווח למעלה
    commentsContainer.style.paddingLeft = "10px"; // רווח פנימי משמאל

    commentBtn.onclick = async () => { // כשמשתמש לוחץ לשלוח תגובה
      const commentText = commentInput.value.trim(); // לוקח את הטקסט ומסיר רווחים
      if (commentText) { // אם לא ריק
        await send("addComment", [post.id, localStorage.getItem("userId"), commentText]); // שולח תגובה לשרת
        commentInput.value = ""; // מנקה את השדה
        await loadComments(post.id, commentsContainer); // טוען מחדש את התגובות
      }
    };

    await loadComments(post.id, commentsContainer); // טוען תגובות קיימות

    commentBox.appendChild(commentInput); // מוסיף את שדה התגובה
    commentBox.appendChild(commentBtn); // מוסיף את כפתור התגובה
    commentBox.appendChild(commentsContainer); // מוסיף את התגובות

    postDiv.appendChild(title); // מוסיף כותרת לפוסט
    postDiv.appendChild(author); // מוסיף שם משתמש
    postDiv.appendChild(content); // מוסיף תוכן
    postDiv.appendChild(timestamp); // מוסיף תאריך
    postDiv.appendChild(likeBtn); // מוסיף כפתור לייק
    postDiv.appendChild(likeCountElem); // מוסיף מספר לייקים
    postDiv.appendChild(commentBox); // מוסיף אזור תגובות

    feed.appendChild(postDiv); // מציב את הפוסט בדף
  }
}

async function updateLikeCount(postId: number, elem: HTMLElement): Promise<void> {
  const count = await send("getLikes", postId); // מבקש מהשרת את מספר הלייקים
  elem.textContent = `Likes: ${count}`; // מציג את מספר הלייקים בטקסט
}

async function loadComments(postId: number, container: HTMLElement): Promise<void> {
  const comments = await send("getComments", postId); // מבקש תגובות מהשרת
  container.innerHTML = ""; // מנקה תגובות ישנות

  comments.forEach((comment: any) => { // עובר על כל תגובה
    const p = document.createElement("p"); // יוצר פסקה חדשה
    p.style.fontSize = "0.9em"; // גודל טקסט קטן
    p.style.margin = "2px 0"; // רווח בין תגובות
    p.textContent = comment.Content; // טקסט התגובה עצמה
    container.appendChild(p); // מוסיף את התגובה לדף
  });
}

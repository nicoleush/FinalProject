import { send } from "../utilities";

let submitButton = document.querySelector("#submitPost") as HTMLButtonElement;
const userId: string | null = localStorage.getItem("userId");

submitButton.onclick = async function () {
  const titleInput = document.getElementById("postTitle") as HTMLInputElement;
  const contentInput = document.getElementById("postContent") as HTMLTextAreaElement;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Please fill in both title and content!");
    return;
  }

  await send("createPost", [userId, title, content]);
  titleInput.value = "";
  contentInput.value = "";
  loadPosts();
};

// Load posts and display them
async function loadPosts(): Promise<void> {
  const posts = await send("getPosts", {});
  const feed = document.getElementById("feed") as HTMLElement;
  feed.innerHTML = "";

  for (const post of posts) {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent = post.content;

    const author = document.createElement("small");
    author.textContent = `Posted by: ${post.username}`;

    const timestamp = document.createElement("small");
    timestamp.textContent = new Date(post.createdAt).toLocaleString();

    const likeBtn = document.createElement("button");
    likeBtn.textContent = "Like ❤️";
    likeBtn.onclick = async () => {
      await send("likePost", [post.id, userId]);
      updateLikeCount(post.id, likeCountElem);
    };

    const likeCountElem = document.createElement("span");
    likeCountElem.style.marginLeft = "10px";
    await updateLikeCount(post.id, likeCountElem);

    const commentBox = document.createElement("div");
    commentBox.style.marginTop = "15px";

    const commentInput = document.createElement("input");
    commentInput.placeholder = "Write a comment...";
    commentInput.style.width = "70%";

    const commentBtn = document.createElement("button");
    commentBtn.textContent = "Comment";
    commentBtn.onclick = async () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        await send("addComment", [post.id, userId, commentText]);
        commentInput.value = "";
        await loadComments(post.id, commentsContainer);
      }
    };

    const commentsContainer = document.createElement("div");
    commentsContainer.style.marginTop = "10px";
    commentsContainer.style.paddingLeft = "10px";
    await loadComments(post.id, commentsContainer);

    commentBox.appendChild(commentInput);
    commentBox.appendChild(commentBtn);
    commentBox.appendChild(commentsContainer);

    postDiv.appendChild(title);
    postDiv.appendChild(author);     // 👈 Added
    postDiv.appendChild(content);
    postDiv.appendChild(timestamp);
    postDiv.appendChild(likeBtn);
    postDiv.appendChild(likeCountElem);
    postDiv.appendChild(commentBox);

    feed.appendChild(postDiv);
  }
}

async function updateLikeCount(postId: number, elem: HTMLElement): Promise<void> {
  const count = await send("getLikes", postId);
  elem.textContent = `Likes: ${count}`;
}

async function loadComments(postId: number, container: HTMLElement): Promise<void> {
  const comments = await send("getComments", postId);
  container.innerHTML = "";

  comments.forEach((comment: any) => {
    const p = document.createElement("p");
    p.style.fontSize = "0.9em";
    p.style.margin = "2px 0";
    p.textContent = comment.Content;
    container.appendChild(p);
  });
}

loadPosts();

// Theme toggle
const toggleBtn = document.getElementById("themeToggle") as HTMLElement | null;
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark") {
  document.body.classList.add("dark");
}

toggleBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
import { setupThemeToggle } from "./toggleTheme";

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");
});

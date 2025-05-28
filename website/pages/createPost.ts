import { send } from "../utilities";
import { setupThemeToggle } from "./toggleTheme";

window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle("themeToggle");

  const tips = [
    "Use meaningful variable names.",
    "Break your code into functions.",
    "Use version control like Git.",
    "Debug with console.log or breakpoints.",
    "Write comments for tricky logic.",
    "Test your code with different inputs."
  ];

  const tipElement = document.getElementById("dailyTip");
  if (tipElement) {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.textContent = tip;
  }

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

  loadPosts();
});

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
    const likeCountElem = document.createElement("span");
    likeCountElem.style.marginLeft = "10px";

    likeBtn.onclick = async () => {
      await send("likePost", [post.id, localStorage.getItem("userId")]);
      updateLikeCount(post.id, likeCountElem);
    };

    await updateLikeCount(post.id, likeCountElem);

    const commentBox = document.createElement("div");
    commentBox.style.marginTop = "15px";

    const commentInput = document.createElement("input");
    commentInput.placeholder = "Write a comment...";
    commentInput.style.width = "70%";

    const commentBtn = document.createElement("button");
    commentBtn.textContent = "Comment";
    const commentsContainer = document.createElement("div");
    commentsContainer.style.marginTop = "10px";
    commentsContainer.style.paddingLeft = "10px";

    commentBtn.onclick = async () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        await send("addComment", [post.id, localStorage.getItem("userId"), commentText]);
        commentInput.value = "";
        await loadComments(post.id, commentsContainer);
      }
    };

    await loadComments(post.id, commentsContainer);

    commentBox.appendChild(commentInput);
    commentBox.appendChild(commentBtn);
    commentBox.appendChild(commentsContainer);

    postDiv.appendChild(title);
    postDiv.appendChild(author);
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

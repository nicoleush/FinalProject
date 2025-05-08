import { send } from "../utilities";

const userId: string | null = localStorage.getItem("userId");

// Show post form when clicking Create Post button
document.getElementById("createPostBtn")?.addEventListener("click", () => {
    const form = document.getElementById("postForm") as HTMLElement | null;
    if (form) {
        form.style.display = form.style.display === "none" ? "block" : "none";
    }
});

// Submit a new post
document.getElementById("submitPost")?.addEventListener("click", async () => {
    const titleInput = document.getElementById("postTitle") as HTMLInputElement | null;
    const contentInput = document.getElementById("postContent") as HTMLInputElement | null;

    const title: string = titleInput?.value || "";
    const content: string = contentInput?.value || "";

    if (!title || !content) {
        alert("Please fill in both title and content!");
        return;
    }

    await fetch("/createPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([userId, title, content])
    });

    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    const form = document.getElementById("postForm") as HTMLElement | null;
    if (form) form.style.display = "none";
    loadPosts();
});

// Load posts to the feed
async function loadPosts(): Promise<void> {
    const res = await fetch("/getPosts");
    const posts = await res.json();

    const feed = document.getElementById("feed") as HTMLElement | null;
    if (feed) {
        feed.innerHTML = "";

        posts.forEach((post: any) => {
            const postElem = document.createElement("div");
            postElem.className = "post";
            postElem.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p><small>${new Date(post.createdAt).toLocaleString()}</small>`;
            feed.appendChild(postElem);
        });
    }
}

loadPosts();
// Theme toggle
const toggleBtn = document.getElementById("themeToggle") as HTMLElement | null;
const currentTheme: string | null = localStorage.getItem("theme");

if (currentTheme === "dark") {
    document.body.classList.add("dark");
}

toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark: boolean = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
});



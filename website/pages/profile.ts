
const userId = localStorage.getItem("userId");


if (!userId) {
  window.location.href = "login.html";
} else {
 
  fetch(`http://localhost:5000/profile?id=${userId}`)

    .then(response => {
      if (!response.ok) throw new Error("Server returned an error");
      return response.json();
    })
    .then(user => {
     
      const usernameElem = document.getElementById("username");
      const bioElem = document.getElementById("bio");
      const avatarElem = document.getElementById("avatar") as HTMLImageElement;

      if (usernameElem) usernameElem.textContent = user.username;
      if (bioElem) bioElem.textContent = user.bio;
      if (avatarElem) avatarElem.src = user.avatarUrl || "../assets/imgs/default.jpg";

   
      if (user.theme === "dark") {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    })
    .catch(error => {
      console.error("Failed to load profile:", error);
      document.body.innerHTML = "<p>Failed to load profile. Please try again later.</p>";
    });
}

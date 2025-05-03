import { send } from "../utilities";

let username = document.querySelector("#username") as HTMLInputElement;
let password = document.querySelector("#password") as HTMLInputElement;
let signupbutton = document.querySelector("#signUp") as HTMLButtonElement;
let message = document.querySelector("#message") as HTMLDivElement;
let avatars = document.querySelectorAll(".avatar") as NodeListOf<HTMLImageElement>;


function selectAvatar(event: Event) {
  let target = event.currentTarget as HTMLImageElement;

  
  avatars.forEach(a => a.classList.remove("selected"));

  
  target.classList.add("selected");

  
  const hiddenInput = document.querySelector("#selectedAvatar") as HTMLInputElement;
  hiddenInput.value = target.src;
}


avatars.forEach((avatar) => {
  avatar.addEventListener("click", selectAvatar);
});


signupbutton.onclick = async function (event) {
  event.preventDefault();

  const selectedAvatar = (document.querySelector("#selectedAvatar") as HTMLInputElement).value;

  let userId = await send("signup", [
    username.value,
    password.value,
    "light", 
    "",      
    selectedAvatar || "" 
  ]) as string | null;
  
  if (userId && userId !== "Username already exists") {
    localStorage.setItem("userId", userId);
    location.href = "homepage.html";
  } else {
    message.innerText = "Username is already taken";
  }
  
};

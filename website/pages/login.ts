import { send } from "../utilities";

let username = document.querySelector("#username") as HTMLInputElement;
let password = document.querySelector("#password") as HTMLInputElement;
let loginbutton = document.querySelector(".loginbutton") as HTMLButtonElement;
let message = document.querySelector("#message") as HTMLDivElement;


    loginbutton.onclick = async function () {
      let id = await send("login", [username.value, password.value]) as string | null;
  
      if (id == null) {
        username.value = "";
        password.value = "";
        message.innerText = "Username or Password were incorrect";
      } else {
        localStorage.setItem("userId", id);
        location.href = "index.html";
      }
    };
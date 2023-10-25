// Import modules
import * as Auth from "./auth.js";
import * as Database from "./database.js";
import * as UI from "./ui.js";
import * as Events from "./events.js";


let auth0Client = null;
// Initialize the Auth0 client when the window loads
window.onload = async () => {
  try {
    await Auth.configureClient();
    const auth0 = Auth.getAuth0();
    console.log("auth 1", auth0)
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      // Process the login state
      await auth0.handleRedirectCallback();
      Auth.setAuth0(auth0);
      console.log("Authentificated");
      

      // Use replaceState to redirect the user away and remove the querystring parameters
      window.history.replaceState({}, document.title, "/player-database.html");
    }

    UI.updateUI();
  } catch (e) {
    console.error("Initialization failed:", e);
  }
  //UI.setupTabs();
};

// Handle authentication button click
document.querySelector(".auth-btn").addEventListener("click", async (e) => {
  console.log("auth click");
  
  // Since 'e.target' is the clicked element, we can directly use it here
  const authBtn = e.target;

  // Update aria-label
  authBtn.setAttribute(
    "aria-label",
    authBtn.innerHTML === "Login" ? "Login Button" : "Logout Button"
  );

  // Perform login or logout based on the button label
  if (authBtn.innerHTML === "Sign in") {
    console.log("login");
    Auth.login();
  } else {
    Auth.logout();
  }
});
// UI elements
const add_nw_btn = document.querySelector("#add-new-btn");
add_nw_btn.setAttribute("aria-label", "Add new Button");

const body_ = document.querySelector(".container");
const form = document.querySelector(".form");
form.setAttribute("tabindex", "-1"); // to manage focus

add_nw_btn.addEventListener("click", (e) => {
  console.log(e);
  body_.classList.add("container-fade");
  // Manage focus when form is displayed
  form.style.display = "block";
  form.focus();
});

document.querySelector("#close-btn").addEventListener("click", (e) => {
  console.log(e);
  body_.classList.remove("container-fade");
  form.style.display = "none";
});

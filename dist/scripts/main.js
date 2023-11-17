/**
 * @file Main entry point for the soccer team management application. It initializes the Auth0 client,
 * handles the authentication process, and manages the main user interface elements and events.
 */

// Module imports
import * as Auth from "./auth.js";
import * as UI from "./ui.js";

// Global variable for Auth0 client
let auth0Client = null;

/**
 * Initializes the application by configuring the Auth0 client and updating the UI accordingly.
 * It processes the callback from Auth0 authentication and sets the token in local storage.
 */
window.onload = async () => {
  try {
    await Auth.configureClient();
    const auth0 = Auth.getAuth0();
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      // Process the login state
      await auth0.handleRedirectCallback();
      Auth.setAuth0(auth0);
      const accessToken = await auth0.getTokenSilently();
      Auth.setToken(accessToken);
      console.log("Authentificated");

      // Use replaceState to redirect the user away and remove the querystring parameters
      window.history.replaceState({}, document.title, "/dashboard.html");
    }
    UI.updateUI();

  } catch (e) {
    console.error("Initialization failed:", e);
  }
};


/**
 * Handles the click event on the authentication button.
 * It checks the text content of the button to determine whether to log in or log out the user.
 */
document.querySelector(".auth-btn").addEventListener("click", async (e) => {
  console.log("auth click");
  
  // Since 'e.target' is the clicked element, we can directly use it here
  const authBtn = e.target;

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

/**
 * Handles the click event on the 'Add New' button.
 * It fades the container and displays a form for adding new entries.
 */
add_nw_btn.addEventListener("click", (e) => {
  console.log(e);
  body_.classList.add("container-fade");
  // Manage focus when form is displayed
  form.style.display = "block";
  form.focus();
});

/**
 * Handles the click event on the 'Close' button.
 * It removes the faded effect from the container and hides the form.
 */
document.querySelector("#close-btn").addEventListener("click", (e) => {
  console.log(e);
  body_.classList.remove("container-fade");
  form.style.display = "none";
});
